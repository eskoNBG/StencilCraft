import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { PRICING_TIERS, canUseStyle } from "@/lib/pricing";
import type { TierKey } from "@/lib/pricing";

// Rate limit: 10 generations per minute per IP
const RATE_LIMIT = { max: 10, windowMs: 60_000 };

// Stencil processor service URL (OpenCV-based)
const STENCIL_SERVICE_URL = process.env.STENCIL_SERVICE_URL || "http://localhost:3005/generate";

// Timeout for external service call (2 minutes)
const SERVICE_TIMEOUT_MS = 120_000;

// Zod schema for generation options (sent as JSON fields in FormData or JSON body)
const optionsSchema = z.object({
  style: z.enum(["outline", "simple", "detailed", "hatching", "solid"]).default("outline"),
  lineThickness: z.number().int().min(1).max(5).default(3),
  contrast: z.number().int().min(0).max(100).default(50),
  inverted: z.boolean().default(false),
  lineColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").default("#000000"),
  transparentBg: z.boolean().default(false),
});

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // exponential backoff

async function callServiceWithRetry(
  body: Record<string, unknown>,
  retries = MAX_RETRIES
): Promise<{ success: boolean; stencilImage?: string; error?: string }> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SERVICE_TIMEOUT_MS);

    try {
      const response = await fetch(STENCIL_SERVICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Service returned HTTP ${response.status}`);
      }

      try {
        return await response.json();
      } catch {
        throw new Error("Service returned invalid JSON");
      }
    } catch (error) {
      clearTimeout(timeout);

      const isLast = attempt === retries - 1;
      if (isLast) throw error;

      const delay = RETRY_DELAYS[attempt] || 4000;
      console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

async function startGeneration(
  jobId: string,
  imageBase64: string,
  style: string,
  lineThickness: number,
  contrast: number,
  inverted: boolean,
  lineColor: string,
  transparentBg: boolean
) {
  try {
    console.log(`[Job ${jobId}] Processing ${style} style with OpenCV...`);

    const data = await callServiceWithRetry({
      image: imageBase64,
      style,
      lineThickness,
      contrast,
      inverted,
      lineColor,
      transparentBg,
    });

    if (!data.success || !data.stencilImage) {
      throw new Error(data.error || "Stencil generation failed");
    }

    await db.stencil.update({
      where: { id: jobId },
      data: { status: "completed", stencilImage: data.stencilImage },
    });

    console.log(`[Job ${jobId}] Stencil completed`);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Job ${jobId}] Error:`, message);

    try {
      await db.stencil.update({
        where: { id: jobId },
        data: { status: "failed", errorMessage: message },
      });
    } catch (dbError) {
      console.error(`[Job ${jobId}] Failed to update DB:`, dbError);
    }
  }
}

/** Clean up stale jobs (older than 24h) and failed jobs (older than 1h) */
async function cleanupStaleJobs() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const deleted = await db.stencil.deleteMany({
      where: {
        OR: [
          { status: "processing", createdAt: { lt: oneDayAgo } },
          { status: "failed", createdAt: { lt: oneHourAgo } },
        ],
      },
    });

    if (deleted.count > 0) {
      console.log(`[Cleanup] Removed ${deleted.count} stale jobs`);
    }
  } catch (error) {
    console.error("[Cleanup] Error:", error);
  }
}

/** Convert a File/Blob to a base64 data URL */
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

/** Build rate limit headers for responses */
function rateLimitHeaders(remaining: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": RATE_LIMIT.max.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const rateCheck = checkRateLimit(ip, RATE_LIMIT);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Zu viele Anfragen. Bitte warten Sie einen Moment." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.retryAfterMs / 1000).toString(),
            ...rateLimitHeaders(0),
          },
        }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let imageBase64: string;
    let options: z.infer<typeof optionsSchema>;

    if (contentType.includes("multipart/form-data")) {
      // FormData upload (efficient binary transfer)
      const formData = await request.formData();
      const imageFile = formData.get("image") as File | null;

      if (!imageFile || imageFile.size === 0) {
        return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
      }

      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "Image too large (max 10MB)" }, { status: 400 });
      }

      imageBase64 = await fileToBase64(imageFile);

      // Parse options from FormData fields
      const rawOptions = {
        style: formData.get("style") || undefined,
        lineThickness: formData.get("lineThickness") ? Number(formData.get("lineThickness")) : undefined,
        contrast: formData.get("contrast") ? Number(formData.get("contrast")) : undefined,
        inverted: formData.get("inverted") === "true",
        lineColor: formData.get("lineColor") || undefined,
        transparentBg: formData.get("transparentBg") === "true",
      };

      const parseResult = optionsSchema.safeParse(rawOptions);
      if (!parseResult.success) {
        return NextResponse.json(
          { success: false, error: "Invalid options", details: z.prettifyError(parseResult.error) },
          { status: 400 }
        );
      }
      options = parseResult.data;

    } else {
      // JSON body (backwards compatible)
      let body: Record<string, unknown>;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }

      if (!body.image) {
        return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
      }

      imageBase64 = body.image as string;

      const parseResult = optionsSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { success: false, error: "Invalid options", details: z.prettifyError(parseResult.error) },
          { status: 400 }
        );
      }
      options = parseResult.data;
    }

    const { style, lineThickness, contrast, inverted, lineColor, transparentBg } = options;

    // Credit system enforcement
    const session = await auth();
    let userTier: TierKey = "free";

    if (session?.user?.id) {
      const subscription = await db.subscription.findUnique({
        where: { userId: session.user.id },
      });

      if (subscription) {
        userTier = (subscription.tier as TierKey) || "free";

        // Reset credits if period expired
        const now = new Date();
        const resetAt = subscription.creditsResetAt;
        const needsReset = userTier === "free"
          ? now.toDateString() !== resetAt.toDateString() // daily reset for free
          : now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear(); // monthly reset

        if (needsReset) {
          await db.subscription.update({
            where: { userId: session.user.id },
            data: { creditsUsed: 0, creditsResetAt: now },
          });
          subscription.creditsUsed = 0;
        }

        // Check credit limits
        const tierFeatures = PRICING_TIERS[userTier].features as Record<string, unknown>;
        const limit = userTier === "free"
          ? (tierFeatures.stencilsPerDay as number) ?? 3
          : (tierFeatures.stencilsPerMonth as number) ?? Infinity;

        if (subscription.creditsUsed >= limit) {
          return NextResponse.json(
            { success: false, error: "Credit limit reached. Please upgrade your plan.", creditLimit: true },
            { status: 403 }
          );
        }
      }
    }

    // Check style access
    if (!canUseStyle(userTier, style)) {
      return NextResponse.json(
        { success: false, error: "Style not available on your plan. Please upgrade.", styleRestricted: true },
        { status: 403 }
      );
    }

    // Create job in database
    const stencil = await db.stencil.create({
      data: {
        originalImage: imageBase64,
        style,
        lineThickness,
        contrast,
        inverted,
        status: "processing",
      },
    });

    // Increment credit usage
    if (session?.user?.id) {
      await db.subscription.updateMany({
        where: { userId: session.user.id },
        data: { creditsUsed: { increment: 1 } },
      });
    }

    // Start generation in background + opportunistic cleanup
    startGeneration(stencil.id, imageBase64, style, lineThickness, contrast, inverted, lineColor, transparentBg);
    cleanupStaleJobs();

    console.log(`[Stencil API] Job ${stencil.id} started`);

    return NextResponse.json(
      { success: true, jobId: stencil.id, message: "Generation started" },
      { headers: rateLimitHeaders(rateCheck.remaining) }
    );

  } catch (error) {
    console.error("[Stencil API] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const stream = searchParams.get("stream");

  if (!jobId) {
    return NextResponse.json({ success: false, error: "Job ID required" }, { status: 400 });
  }

  // SSE stream mode — push job status updates in real time
  if (stream === "1") {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        let attempts = 0;
        const maxAttempts = 60; // 2 minutes max (60 * 2s)

        while (attempts < maxAttempts) {
          try {
            const stencil = await db.stencil.findUnique({ where: { id: jobId } });

            if (!stencil) {
              sendEvent({ status: "failed", error: "Job not found" });
              controller.close();
              return;
            }

            if (stencil.status === "completed") {
              sendEvent({ status: "completed", result: stencil.stencilImage });
              controller.close();
              return;
            }

            if (stencil.status === "failed") {
              sendEvent({ status: "failed", error: stencil.errorMessage || "Generation failed" });
              controller.close();
              return;
            }

            // Still processing — send heartbeat
            sendEvent({ status: "processing" });
          } catch {
            sendEvent({ status: "failed", error: "Internal error" });
            controller.close();
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
        }

        sendEvent({ status: "failed", error: "Timeout" });
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Standard JSON polling (backwards compatible)
  const stencil = await db.stencil.findUnique({ where: { id: jobId } });

  if (!stencil) {
    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    status: stencil.status,
    result: stencil.stencilImage,
  });
}
