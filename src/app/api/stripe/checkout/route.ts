import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier, billingPeriod = "monthly" } = await request.json();

    const priceEnvMap: Record<string, string | undefined> = {
      "pro-monthly": process.env.STRIPE_PRO_PRICE_ID,
      "pro-yearly": process.env.STRIPE_PRO_YEARLY_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID,
      "studio-monthly": process.env.STRIPE_STUDIO_PRICE_ID,
      "studio-yearly": process.env.STRIPE_STUDIO_YEARLY_PRICE_ID || process.env.STRIPE_STUDIO_PRICE_ID,
    };

    const priceId = priceEnvMap[`${tier}-${billingPeriod}`];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Get or create Stripe customer
    let subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: session.user.email!,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      if (subscription) {
        await db.subscription.update({
          where: { userId: session.user.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/account?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: { userId: session.user.id, tier, billingPeriod },
      subscription_data: {
        trial_period_days: 3,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
