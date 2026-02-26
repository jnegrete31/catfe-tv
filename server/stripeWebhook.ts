import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { createDonationTokens } from "./db";
import { getTokensForAmount } from "./stripe-products";

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripe = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripe;
}

export function registerStripeWebhook(app: Express) {
  // IMPORTANT: This must be registered BEFORE express.json() middleware
  // The raw body is needed for webhook signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];
      if (!sig) {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      let event: Stripe.Event;
      try {
        event = getStripe().webhooks.constructEvent(
          req.body,
          sig,
          ENV.stripeWebhookSecret
        );
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }

      // Handle test events for verification
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
          }
          case "payment_intent.succeeded": {
            // Log for audit but main processing happens in checkout.session.completed
            console.log(`[Stripe Webhook] Payment succeeded: ${(event.data.object as any).id}`);
            break;
          }
          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err: any) {
        console.error(`[Stripe Webhook] Error processing ${event.type}:`, err.message);
        // Return 200 to prevent Stripe from retrying
      }

      res.json({ received: true });
    }
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const fingerprint = session.metadata?.voter_fingerprint;
  const tierId = session.metadata?.tier_id;
  const amountCents = session.amount_total || 0;
  const donorName = session.metadata?.donor_name || session.customer_details?.name || null;

  if (!fingerprint) {
    console.error("[Stripe Webhook] Missing voter_fingerprint in session metadata");
    return;
  }

  // Calculate tokens based on the amount paid
  const tokens = getTokensForAmount(amountCents);
  if (tokens <= 0) {
    console.error(`[Stripe Webhook] No token tier found for amount: ${amountCents}`);
    return;
  }

  console.log(`[Stripe Webhook] Creating ${tokens} tokens for fingerprint ${fingerprint.substring(0, 8)}...`);

  await createDonationTokens({
    voterFingerprint: fingerprint,
    tokensTotal: tokens,
    tokensRemaining: tokens,
    amountCents,
    stripePaymentId: session.payment_intent as string || session.id,
    donorName,
  });

  console.log(`[Stripe Webhook] Successfully created ${tokens} vote tokens`);
}

/**
 * Create a Stripe Checkout Session for donation vote tokens
 */
export async function createDonationCheckoutSession(params: {
  tierId: string;
  tierLabel: string;
  amountCents: number;
  tokens: number;
  fingerprint: string;
  donorName?: string;
  catId?: number;
  catName?: string;
  origin: string;
}): Promise<{ url: string }> {
  const s = getStripe();

  const session = await s.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Catfé Vote Tokens — ${params.tierLabel}`,
            description: `${params.tokens} extra votes for cat photos${params.catName ? ` (supporting ${params.catName})` : ""}`,
          },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      voter_fingerprint: params.fingerprint,
      tier_id: params.tierId,
      tokens: params.tokens.toString(),
      cat_id: params.catId?.toString() || "",
      cat_name: params.catName || "",
      donor_name: params.donorName || "",
    },
    success_url: `${params.origin}/vote/${params.catId || ""}?donated=true&tokens=${params.tokens}`,
    cancel_url: `${params.origin}/vote/${params.catId || ""}?cancelled=true`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return { url: session.url };
}
