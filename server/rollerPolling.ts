/**
 * Roller Polling Service
 * 
 * Polls the Roller API every 30 minutes for today's bookings.
 * Only creates guest sessions when a booking's session time window is active
 * (session has started or starts within 5 minutes).
 * 
 * This replaces the need for manual webhook configuration in Roller's dashboard.
 * The webhook endpoint still exists as a secondary path if Roller sends events.
 */
import { searchBookings, listWebhooks, createWebhook, getCustomerDetail } from "./roller";
import { createGuestSession } from "./db";
import { guestSessions } from "../drizzle/schema";
import { eq, and, or, isNotNull } from "drizzle-orm";
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
 * Parse a time string (e.g., "14:30") into a Date object for today.
 * Returns null if the time string is invalid.
 */
function parseSessionTime(timeStr: string | undefined | null): Date | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Check if a booking's session is currently active or about to start.
 * A session is considered "ready for check-in" when:
 * - The session start time has already passed, OR
 * - The session starts within the next 5 minutes
 * 
 * A session is considered "expired" (don't create) when:
 * - The session end time has already passed
 */
function isSessionActiveOrImminent(
  sessionStartTime: string | undefined | null,
  sessionEndTime: string | undefined | null
): { ready: boolean; reason: string; checkInAt?: Date; sessionEnd?: Date } {
  const now = new Date();
  
  const startTime = parseSessionTime(sessionStartTime);
  const endTime = parseSessionTime(sessionEndTime);
  
  // If no start time is available, we can't determine the session window
  // Don't auto-create — require explicit check-in or webhook
  if (!startTime) {
    return { ready: false, reason: "no_start_time" };
  }
  
  // If the session has already ended, don't create a session
  if (endTime && endTime.getTime() < now.getTime()) {
    return { ready: false, reason: "session_ended" };
  }
  
  const minutesUntilStart = (startTime.getTime() - now.getTime()) / (60 * 1000);
  
  // Session starts more than 5 minutes from now — not ready yet
  if (minutesUntilStart > 5) {
    return { ready: false, reason: "too_early" };
  }
  
  // Session is active or about to start (within 5 minutes)
  // Always use the actual booking session start time as the check-in time
  // so the Guest Status Board shows the correct arrival time
  return {
    ready: true,
    reason: "session_active",
    checkInAt: startTime,
    sessionEnd: endTime || undefined,
  };
}

/**
 * Poll Roller for today's bookings and auto-create guest sessions
 * only for bookings whose session time is active or imminent.
 */
async function pollForNewBookings() {
  if (isPolling) return; // Prevent overlapping polls
  isPolling = true;
  lastPollTime = new Date().toISOString();

  try {
    // Use PST date to avoid UTC offset issues (after 4 PM PST, UTC is already tomorrow)
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    const bookings = await searchBookings({ dateFrom: today });

    if (!Array.isArray(bookings)) {
      console.log("[Roller Poll] Unexpected response format, skipping");
      return;
    }

    for (const booking of bookings) {
      const ref = String(booking.bookingReference || booking.bookingId || "");
      if (!ref || processedBookings.has(ref)) continue;

      // Get booking items to determine session type and time
      const items = booking.items || [];
      if (items.length === 0) continue;

      // Only process paid bookings (skip cancelled/deleted/draft)
      const bookingAny = booking as any;
      const status = (bookingAny.status || "").toLowerCase();
      if (status === "cancelled" || status === "deleted" || status === "draft") continue;

      // Process each booking item — check if its session time is active
      let anyItemProcessed = false;
      let allItemsTooEarly = true;

      for (const item of items) {
        // Use sessionStartTime/sessionEndTime from Roller API (the correct field names)
        const itemAny = item as any;
        const sessionStart = itemAny.sessionStartTime || itemAny.startTime;
        const sessionEnd = itemAny.sessionEndTime || itemAny.endTime;

        const { ready, reason, checkInAt, sessionEnd: parsedEnd } = isSessionActiveOrImminent(
          sessionStart,
          sessionEnd
        );

        if (!ready) {
          if (reason !== "too_early") {
            allItemsTooEarly = false; // session_ended or no_start_time
          }
          continue;
        }

        allItemsTooEarly = false;
        anyItemProcessed = true;

        // Look up customer name from Roller's customer API
        let guestName = "Guest";
        const customerId = bookingAny.customerId;
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
        // Fallback: try booking-level name field
        if (guestName === "Guest") {
          guestName = bookingAny.name || "Guest";
        }

        const productName = item.productName || "Session";
        const quantity = item.quantity || 1;
        const duration = getSessionDuration(productName);
        const durationMinutes = parseInt(duration);

        // Use the session start time for check-in, calculate expiry
        const actualCheckIn = checkInAt || new Date();
        const expiresAt = parsedEnd || new Date(actualCheckIn.getTime() + durationMinutes * 60 * 1000);

        try {
          const session = await createGuestSession({
            guestName,
            guestCount: quantity,
            duration,
            notes: `Auto: ${getProductDisplayName(productName)} (Roller #${ref})`,
            checkInAt: actualCheckIn,
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

      // Mark as processed if any item was handled, or if all items have ended
      // Don't mark if all items are "too_early" — we want to re-check later
      if (anyItemProcessed || !allItemsTooEarly) {
        processedBookings.add(ref);
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
 * Loads ALL sessions with a rollerBookingRef (not just active ones) to prevent
 * re-processing of completed/expired sessions.
 */
async function initializeProcessedBookings() {
  try {
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) return;

    const existingSessions = await db
      .select({ rollerBookingRef: guestSessions.rollerBookingRef })
      .from(guestSessions)
      .where(isNotNull(guestSessions.rollerBookingRef));

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
 * Check if Roller polling is enabled in settings.
 */
async function isRollerPollingEnabled(): Promise<boolean> {
  try {
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) return false;
    const { settings } = await import("../drizzle/schema");
    const rows = await db.select({ rollerPollingEnabled: settings.rollerPollingEnabled }).from(settings).limit(1);
    return rows.length > 0 ? rows[0].rollerPollingEnabled : false;
  } catch {
    return false;
  }
}

/**
 * Start the Roller polling service.
 * Only starts if:
 * 1. Roller credentials are configured
 * 2. rollerPollingEnabled is true in settings (admin toggle)
 * 
 * Polls every 30 minutes for new bookings and auto-creates guest sessions
 * only when their session time window is active.
 */
export async function startRollerPolling(siteUrl?: string) {
  // Don't start if no credentials
  if (!ENV.rollerClientId || !ENV.rollerClientSecret) {
    console.log("[Roller Poll] No credentials configured, polling disabled");
    return;
  }

  // Check if polling is enabled in admin settings
  const enabled = await isRollerPollingEnabled();
  if (!enabled) {
    console.log("[Roller Poll] Polling disabled in admin settings (Settings → Roller Sync toggle)");
    return;
  }

  // Initialize with existing booking refs (all statuses, not just active)
  await initializeProcessedBookings();

  // Try to register webhook (best-effort)
  if (siteUrl) {
    tryRegisterWebhook(siteUrl).catch(() => {}); // Fire and forget
  }

  // Start polling every 30 minutes
  console.log("[Roller Poll] Starting polling service (every 30 minutes)");
  
  // Initial poll after 5 seconds (give server time to fully start)
  setTimeout(() => pollForNewBookings(), 5000);
  
  // Then poll every 30 minutes
  pollingInterval = setInterval(() => pollForNewBookings(), 30 * 60 * 1000);
}

/**
 * Enable Roller polling (called from admin toggle).
 */
export async function enableRollerPolling(siteUrl?: string) {
  if (pollingInterval) {
    console.log("[Roller Poll] Already running");
    return;
  }
  // Force-start without checking settings (admin just enabled it)
  if (!ENV.rollerClientId || !ENV.rollerClientSecret) {
    console.log("[Roller Poll] No credentials configured");
    return;
  }
  await initializeProcessedBookings();
  if (siteUrl) {
    tryRegisterWebhook(siteUrl).catch(() => {});
  }
  console.log("[Roller Poll] Enabled and starting polling service (every 30 minutes)");
  setTimeout(() => pollForNewBookings(), 2000);
  pollingInterval = setInterval(() => pollForNewBookings(), 30 * 60 * 1000);
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
let lastPollTime: string | null = null;

export function getRollerPollingStatus() {
  return {
    isRunning: pollingInterval !== null,
    processedBookingsCount: processedBookings.size,
    hasCredentials: !!(ENV.rollerClientId && ENV.rollerClientSecret),
    lastPollTime,
  };
}

/**
 * Trigger an immediate manual sync from the admin UI.
 * Returns the result of the poll including the last poll time.
 */
export async function triggerManualSync(): Promise<{ success: boolean; lastPollTime: string | null; error?: string }> {
  if (!ENV.rollerClientId || !ENV.rollerClientSecret) {
    return { success: false, lastPollTime, error: "Roller credentials not configured" };
  }
  if (isPolling) {
    return { success: false, lastPollTime, error: "Sync already in progress" };
  }
  try {
    await pollForNewBookings();
    return { success: true, lastPollTime };
  } catch (error: any) {
    return { success: false, lastPollTime, error: error.message };
  }
}
