/**
 * Roller Polling Service
 * 
 * Polls the Roller API every 30 seconds for today's bookings.
 * When a new booking is detected (by bookingReference), it automatically
 * creates a guest session on the Guest Status Board.
 * 
 * This replaces the need for manual webhook configuration in Roller's dashboard.
 * The webhook endpoint still exists as a secondary path if Roller sends events.
 */
import { searchBookings, listWebhooks, createWebhook, getCustomerDetail } from "./roller";
import { createGuestSession } from "./db";
import { guestSessions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

// Track processed booking references to avoid duplicates
const processedBookings = new Set<string>();
let pollingInterval: NodeJS.Timeout | null = null;
let isPolling = false;

// Product name → session duration mapping
function getSessionDuration(productName: string): "15" | "30" | "60" | "90" {
  const name = productName.toLowerCase();
  if (name.includes("mini") || name.includes("30")) return "30";
  if (name.includes("study") || name.includes("90")) return "90";
  if (name.includes("full") || name.includes("60")) return "60";
  return "60"; // default
}

// Product name → friendly display name
function getProductDisplayName(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes("mini")) return "Mini Meow Escape";
  if (name.includes("study")) return "Study Session";
  if (name.includes("full")) return "Full Purr Experience";
  return productName;
}

/**
 * Poll Roller for today's bookings and auto-create guest sessions for new ones.
 */
async function pollForNewBookings() {
  if (isPolling) return; // Prevent overlapping polls
  isPolling = true;

  try {
    const today = new Date().toISOString().split("T")[0];
    const bookings = await searchBookings({ dateFrom: today });

    if (!Array.isArray(bookings)) {
      console.log("[Roller Poll] Unexpected response format, skipping");
      return;
    }

    for (const booking of bookings) {
      const ref = String(booking.bookingReference || booking.bookingId || "");
      if (!ref || processedBookings.has(ref)) continue;

      // Mark as processed immediately to avoid race conditions
      processedBookings.add(ref);

      // Get booking items to determine session type and time
      const items = booking.items || [];
      if (items.length === 0) continue;

      // Only process paid bookings (skip cancelled/deleted/draft)
      const bookingAny = booking as any;
      const status = (bookingAny.status || "").toLowerCase();
      if (status === "cancelled" || status === "deleted" || status === "draft") continue;

      // Look up customer name from Roller's customer API
      let guestName = "Guest";
      const bookingAnyForCustomer = booking as any;
      const customerId = bookingAnyForCustomer.customerId;
      if (customerId) {
        try {
          const customer = await getCustomerDetail(customerId);
          if (customer) {
            guestName = customer.firstName || customer.lastName || "Guest";
          }
        } catch (err: any) {
          console.warn(`[Roller Poll] Could not fetch customer ${customerId}:`, err.message);
        }
      }
      // Fallback: try booking-level name fields (some endpoints may include them)
      if (guestName === "Guest") {
        guestName = bookingAnyForCustomer.firstName || bookingAnyForCustomer.lastName || bookingAnyForCustomer.name || "Guest";
      }

      // Process each booking item
      for (const item of items) {
        const productName = item.productName || "Session";
        const quantity = item.quantity || 1;
        const duration = getSessionDuration(productName);
        const durationMinutes = parseInt(duration);

        // Calculate check-in time based on session start time
        let checkInAt = new Date();
        let expiresAt = new Date(checkInAt.getTime() + durationMinutes * 60 * 1000);

        // If the booking has a specific session start time, use it
        if (item.startTime) {
          const timeStr = item.startTime;
          const [hours, minutes] = timeStr.split(":").map(Number);
          const sessionStart = new Date();
          sessionStart.setHours(hours, minutes, 0, 0);
          
          // Only auto-check-in if the session is within 15 minutes of starting or already started
          const now = new Date();
          const minutesUntilStart = (sessionStart.getTime() - now.getTime()) / (60 * 1000);
          
          if (minutesUntilStart > 15) {
            // Session hasn't started yet - skip for now, will be picked up in a future poll
            processedBookings.delete(ref); // Allow re-processing later
            continue;
          }

          // Use session start time for check-in
          if (sessionStart > now) {
            checkInAt = sessionStart;
          }
          expiresAt = new Date(checkInAt.getTime() + durationMinutes * 60 * 1000);
        }

        try {
          const session = await createGuestSession({
            guestName,
            guestCount: quantity,
            duration,
            notes: `Auto: ${getProductDisplayName(productName)} (Roller #${ref})`,
            checkInAt,
            expiresAt,
            rollerBookingRef: ref,
          });

          console.log(
            `[Roller Poll] Auto check-in: ${guestName} (${quantity} guests) - ${getProductDisplayName(productName)} (${duration} min) - Session #${session.id} - Booking #${ref}`
          );
        } catch (err: any) {
          console.error(`[Roller Poll] Failed to create session for booking #${ref}:`, err.message);
        }
      }
    }
  } catch (error: any) {
    // Don't spam logs if Roller API is temporarily unavailable
    if (!error.message?.includes("credentials not configured")) {
      console.error("[Roller Poll] Error:", error.message);
    }
  } finally {
    isPolling = false;
  }
}

/**
 * Initialize the processed bookings set with existing sessions that have rollerBookingRef.
 * This prevents re-creating sessions for bookings that were already processed.
 */
async function initializeProcessedBookings() {
  try {
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) return;

    const existingSessions = await db
      .select({ rollerBookingRef: guestSessions.rollerBookingRef })
      .from(guestSessions)
      .where(eq(guestSessions.status, "active"));

    for (const session of existingSessions) {
      if (session.rollerBookingRef) {
        processedBookings.add(session.rollerBookingRef);
      }
    }

    console.log(`[Roller Poll] Initialized with ${processedBookings.size} existing booking refs`);
  } catch (error: any) {
    console.warn("[Roller Poll] Could not load existing refs:", error.message);
  }
}

/**
 * Try to auto-register a webhook via the Roller API.
 * This is a best-effort attempt — if it fails, polling handles everything.
 */
async function tryRegisterWebhook(siteUrl: string) {
  try {
    if (!ENV.rollerClientId || !ENV.rollerClientSecret) {
      console.log("[Roller Webhook] No credentials configured, skipping webhook registration");
      return;
    }

    // Check existing webhooks
    const existing = await listWebhooks();
    const webhookUrl = `${siteUrl}/api/webhooks/roller`;

    // Check if our webhook already exists
    const alreadyRegistered = Array.isArray(existing) && existing.some((w: any) => {
      const config = w.configuration || w;
      return config.url === webhookUrl;
    });

    if (alreadyRegistered) {
      console.log("[Roller Webhook] Webhook already registered at", webhookUrl);
      return;
    }

    // Register new webhook
    const result = await createWebhook({
      url: webhookUrl,
      enabled: true,
      authentication: { apiKey: "catfe-tv-roller-webhook" },
      webhooks: {
        redemption: {
          events: ["Created"],
        },
        booking: {
          events: ["Created"],
          include: {
            tickets: true,
          },
        },
        signedWaiver: {
          events: ["Created"],
        },
      },
    });

    console.log("[Roller Webhook] Successfully registered webhook:", result?.webhookId || "OK");
  } catch (error: any) {
    console.warn("[Roller Webhook] Could not register webhook (polling will handle check-ins):", error.message);
  }
}

/**
 * Start the Roller polling service.
 * Polls every 30 seconds for new bookings and auto-creates guest sessions.
 */
export async function startRollerPolling(siteUrl?: string) {
  // Don't start if no credentials
  if (!ENV.rollerClientId || !ENV.rollerClientSecret) {
    console.log("[Roller Poll] No credentials configured, polling disabled");
    return;
  }

  // Initialize with existing booking refs
  await initializeProcessedBookings();

  // Try to register webhook (best-effort)
  if (siteUrl) {
    tryRegisterWebhook(siteUrl).catch(() => {}); // Fire and forget
  }

  // Start polling every 30 seconds
  console.log("[Roller Poll] Starting polling service (every 30 seconds)");
  
  // Initial poll after 5 seconds (give server time to fully start)
  setTimeout(() => pollForNewBookings(), 5000);
  
  // Then poll every 30 seconds
  pollingInterval = setInterval(() => pollForNewBookings(), 30 * 1000);
}

/**
 * Stop the polling service.
 */
export function stopRollerPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log("[Roller Poll] Polling stopped");
  }
}

/**
 * Get the current polling status.
 */
export function getRollerPollingStatus() {
  return {
    isRunning: pollingInterval !== null,
    processedBookingsCount: processedBookings.size,
    hasCredentials: !!(ENV.rollerClientId && ENV.rollerClientSecret),
  };
}
