import { NextRequest, NextResponse } from "next/server";

// In-memory job storage
const jobs = new Map<string, { status: string; result?: string; error?: string; startTime: number }>();

// Cleanup old jobs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.startTime > 10 * 60 * 1000) jobs.delete(id);
  }
}, 5 * 60 * 1000);

// Stencil processor service URL (OpenCV-based)
const STENCIL_SERVICE_URL = "http://localhost:3005/generate";

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
    
    // Call the Python stencil processor - this PRESERVES the input image
    const response = await fetch(STENCIL_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageBase64,
        style: style,
        lineThickness: lineThickness,
        contrast: contrast,
        inverted: inverted,
        lineColor: lineColor,
        transparentBg: transparentBg,
      }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Stencil generation failed");
    }

    jobs.set(jobId, { 
      status: "completed", 
      result: data.stencilImage,
      startTime: Date.now()
    });
    
    console.log(`[Job ${jobId}] ✅ Stencil completed!`);
    
  } catch (error) {
    console.error(`[Job ${jobId}] ❌ Error:`, error instanceof Error ? error.message : "Unknown");
    jobs.set(jobId, { 
      status: "failed", 
      error: error instanceof Error ? error.message : "Generation failed",
      startTime: Date.now()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      image, 
      style = "outline", 
      lineThickness = 3, 
      contrast = 50, 
      inverted = false, 
      lineColor = "#000000", 
      transparentBg = false, 
      jobId, 
      check 
    } = body;

    // Check job status
    if (check && jobId) {
      const job = jobs.get(jobId);
      if (!job) {
        return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ 
        success: true, 
        status: job.status,
        result: job.result,
        error: job.error 
      });
    }

    if (!image) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    // Start new job
    const newJobId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    jobs.set(newJobId, { status: "processing", startTime: Date.now() });
    
    // Start generation in background - using OpenCV to PRESERVE the input image
    startGeneration(
      newJobId, 
      image, 
      style, 
      lineThickness, 
      contrast, 
      inverted, 
      lineColor, 
      transparentBg
    );
    
    console.log(`[Stencil API] Job ${newJobId} started`);
    
    return NextResponse.json({ 
      success: true, 
      jobId: newJobId,
      message: "Generation started"
    });

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
  
  if (!jobId) {
    return NextResponse.json({ success: false, error: "Job ID required" }, { status: 400 });
  }
  
  const job = jobs.get(jobId);
  if (!job) {
    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  }
  
  return NextResponse.json({ 
    success: true, 
    status: job.status,
    result: job.result,
    error: job.error 
  });
}
