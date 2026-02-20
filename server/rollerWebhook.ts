import type { Express, Request, Response } from "express";
import { createGuestSession } from "./db";

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

// Map Roller product names to session durations
function getSessionDuration(productName: string): "15" | "30" | "60" | "90" {
  const name = productName.toLowerCase();
  if (name.includes("mini") || name.includes("30")) return "30";
  if (name.includes("study") || name.includes("90")) return "90";
  if (name.includes("full") || name.includes("60")) return "60";
  // Default to 60 minutes
  return "60";
}

// Extract guest name from Roller redemption data
function getGuestName(data: any): string {
  // Try various fields that Roller might send
  if (data.guestName) return data.guestName;
  if (data.guest?.name) return data.guest.name;
  if (data.guest?.firstName && data.guest?.lastName) {
    return `${data.guest.firstName} ${data.guest.lastName}`;
  }
  if (data.guest?.firstName) return data.guest.firstName;
  if (data.booking?.guestName) return data.booking.guestName;
  if (data.booking?.guest?.name) return data.booking.guest.name;
  if (data.customerName) return data.customerName;
  if (data.customer?.name) return data.customer.name;
  if (data.customer?.firstName) return data.customer.firstName;
  // Fallback
  return "Walk-in Guest";
}

// Extract guest count from Roller data
function getGuestCount(data: any): number {
  if (data.quantity && typeof data.quantity === "number") return data.quantity;
  if (data.ticketQuantity && typeof data.ticketQuantity === "number") return data.ticketQuantity;
  if (data.booking?.quantity) return data.booking.quantity;
  return 1;
}

// Extract product name from Roller data
function getProductName(data: any): string {
  if (data.productName) return data.productName;
  if (data.product?.name) return data.product.name;
  if (data.ticketName) return data.ticketName;
  if (data.ticket?.name) return data.ticket.name;
  return "Session";
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
      const duration = getSessionDuration(productName);
      
      const now = new Date();
      const durationMinutes = parseInt(duration);
      const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
      
      // Create the guest session
      const session = await createGuestSession({
        guestName,
        guestCount,
        duration,
        notes: `Auto check-in via Roller: ${productName}`,
        checkInAt: now,
        expiresAt,
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
