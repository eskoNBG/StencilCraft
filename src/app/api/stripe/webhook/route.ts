import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        if (!userId || !tier) break;

        const stripeSubscription = await getStripe().subscriptions.retrieve(
          session.subscription as string
        );

        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            tier,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
            currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
            creditsUsed: 0,
            creditsResetAt: new Date(),
          },
          update: {
            tier,
            status: "active",
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
            currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
            creditsUsed: 0,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const existingSub = await db.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (existingSub) {
          await db.subscription.update({
            where: { id: existingSub.id },
            data: {
              status: sub.status === "active" ? "active" : sub.status,
              currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const existingSub = await db.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (existingSub) {
          await db.subscription.update({
            where: { id: existingSub.id },
            data: { tier: "free", status: "canceled", stripeSubscriptionId: null },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const existingSub = await db.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
          });
          if (existingSub) {
            await db.subscription.update({
              where: { id: existingSub.id },
              data: { status: "past_due" },
            });
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
