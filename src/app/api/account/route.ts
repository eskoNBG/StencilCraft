import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    theme: user.theme,
    subscription: user.subscription
      ? { tier: user.subscription.tier, status: user.subscription.status }
      : { tier: "free", status: "active" },
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, string> = {};

  if (body.theme && ["purple", "blue", "green", "rose", "amber"].includes(body.theme)) {
    updates.theme = body.theme;
  }

  if (Object.keys(updates).length > 0) {
    await db.user.update({
      where: { id: session.user.id },
      data: updates,
    });
  }

  return NextResponse.json({ success: true });
}
