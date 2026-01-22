import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/thanks`;
const SUPPORTED_CURRENCIES = new Set(["eur", "usd", "gbp"]);

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-12-18.acacia" })
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    console.error("Stripe secret key missing");
    return NextResponse.json(
      { error: "Server not configured for payments" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const amount = Number(body?.dynamicAmount);
  const currency =
    typeof body?.currency === "string" && SUPPORTED_CURRENCIES.has(body.currency)
      ? (body.currency as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Currency)
      : "eur";
  const cancelUrl = typeof body?.cancelUrl === "string" && body.cancelUrl.trim()
    ? body.cancelUrl
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "link"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: "Support iknowainhoa.com",
              description: "Pay-what-you-want donation",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 }
    );
  }
}
