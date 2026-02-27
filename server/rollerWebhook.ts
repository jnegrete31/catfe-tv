import type { Express, Request, Response } from "express";
import { createGuestSession } from "./db";
import { getSessionDuration, getGuestName, getGuestCount, getProductName } from "./rollerWebhookHelpers";

/**
 * Roller webhook handler for auto guest check-in.
 * 
 * When a ticket is scanned in Roller, it sends a `redemption.Created` webhook.
 * This handler creates a guest session on the Guest Status Board automatically.
 * 
 * Roller product duration mapping:
 * - "Mini Meow Escape" → 30 min
 * - "Full Purr Experience" → 60 min
 * - "Study Session" → 90 min
 * - Default → 60 min
 */

/**
 * Check if a product name represents a session booking (not an add-on like treats, merch, etc.)
 * Only session products should create guest sessions with countdowns.
 */
function isSessionProduct(productName: string): boolean {
  const name = productName.toLowerCase();
  // Session products contain these keywords
  const sessionKeywords = ["purr", "meow", "study", "session", "experience", "escape", "lounge", "peek"];
  if (sessionKeywords.some(kw => name.includes(kw))) return true;
  // Non-session products (add-ons, treats, merch, etc.)
  const nonSessionKeywords = ["treat", "snack", "food", "merch", "shirt", "mug", "gift", "card", "donation", "tip", "add-on", "addon", "extra", "upgrade"];
  if (nonSessionKeywords.some(kw => name.includes(kw))) return false;
  // Default: if it has a time-like duration pattern, treat as session
  if (/\b(15|30|60|90)\s*(min|m)\b/i.test(name)) return true;
  // Unknown product — don't create a session to be safe
  return false;
}

export function registerRollerWebhook(app: Express) {
  app.post("/api/webhooks/roller", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      
      console.log("[Roller Webhook] Received:", JSON.stringify(body).slice(0, 500));
      
      // Handle different event types
      const eventType = body.event || body.type || body.eventType;
      
      // Only process redemption events (ticket scans)
      if (eventType && !eventType.toLowerCase().includes("redemption")) {
        console.log(`[Roller Webhook] Ignoring event type: ${eventType}`);
        res.status(200).json({ ok: true, message: "Event type ignored" });
        return;
      }
      
      // Extract data from the webhook payload
      const data = body.data || body.payload || body;
      
      const guestName = getGuestName(data);
      const guestCount = getGuestCount(data);
      const productName = getProductName(data);
      
      // Skip non-session products (treats, merch, add-ons, etc.)
      if (!isSessionProduct(productName)) {
        console.log(`[Roller Webhook] Ignoring non-session product: "${productName}"`);
        res.status(200).json({ ok: true, message: "Non-session product ignored", product: productName });
        return;
      }
      
      const duration = getSessionDuration(productName);
      
      const now = new Date();
      const durationMinutes = parseInt(duration);
      const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
      
      // Extract booking reference for dedup
      const bookingRef = data.bookingReference || data.booking?.bookingReference || data.bookingId || "";
      
      // Create the guest session
      const session = await createGuestSession({
        guestName,
        guestCount,
        duration,
        notes: `Auto check-in via Roller: ${productName}`,
        checkInAt: now,
        expiresAt,
        rollerBookingRef: bookingRef ? String(bookingRef) : undefined,
      });
      
      console.log(`[Roller Webhook] Auto check-in: ${guestName} (${guestCount} guests) - ${productName} (${duration} min) - Session #${session.id}`);
      
      res.status(200).json({ 
        ok: true, 
        sessionId: session.id,
        guestName,
        duration: `${duration} min`,
        product: productName,
      });
    } catch (error) {
      console.error("[Roller Webhook] Error:", error);
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  });
  
  // Health check endpoint for webhook verification
  app.get("/api/webhooks/roller", (_req: Request, res: Response) => {
    res.status(200).json({ 
      ok: true, 
      message: "Roller webhook endpoint is active",
      accepts: ["redemption.Created"],
    });
  });
}
