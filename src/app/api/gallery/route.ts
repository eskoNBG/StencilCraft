import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.galleryItem.findMany({
    where: { userId: session.user.id },
    include: { stencil: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const gallery = items.map((item) => ({
    id: item.id,
    originalImage: item.stencil.originalImage,
    stencilImage: item.stencil.stencilImage || "",
    style: item.stencil.style,
    lineThickness: item.stencil.lineThickness,
    contrast: item.stencil.contrast,
    inverted: item.stencil.inverted,
    createdAt: item.createdAt.toISOString(),
    isFavorite: item.isFavorite,
  }));

  return NextResponse.json(gallery);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check subscription tier for gallery limit
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const tier = subscription?.tier || "free";
  if (tier === "free") {
    return NextResponse.json({ error: "Gallery requires Pro or Studio plan" }, { status: 403 });
  }

  const galleryLimit = tier === "studio" ? Infinity : 50;
  const currentCount = await db.galleryItem.count({
    where: { userId: session.user.id },
  });

  if (currentCount >= galleryLimit) {
    return NextResponse.json({ error: "Gallery limit reached" }, { status: 403 });
  }

  const body = await request.json();

  // Create stencil record first
  const stencil = await db.stencil.create({
    data: {
      originalImage: body.originalImage,
      stencilImage: body.stencilImage,
      style: body.style,
      lineThickness: body.lineThickness || 2,
      contrast: body.contrast || 50,
      inverted: body.inverted || false,
      status: "completed",
    },
  });

  const item = await db.galleryItem.create({
    data: {
      stencilId: stencil.id,
      userId: session.user.id,
      name: body.name || null,
    },
  });

  return NextResponse.json({ id: item.id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Verify ownership
  const item = await db.galleryItem.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.galleryItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, isFavorite } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Verify ownership
  const item = await db.galleryItem.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.galleryItem.update({
    where: { id },
    data: { isFavorite: isFavorite ?? !item.isFavorite },
  });

  return NextResponse.json({ success: true });
}
