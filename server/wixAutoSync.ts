import { ENV } from "./_core/env";
import {
  getTodaysWixBookings,
  testWixConnection,
} from "./wixBookings";
import {
  getGuestSessionByWixBookingId,
  createGuestSessionFromWixBooking,
  getSettings,
  updateWixSyncTime,
  updateWixAutoSyncEnabled,
} from "./db";

// Sync interval in milliseconds (15 minutes)
const SYNC_INTERVAL_MS = 15 * 60 * 1000;

// Track sync state
let syncIntervalId: NodeJS.Timeout | null = null;
let isAutoSyncEnabled = false;
let lastSyncTime: Date | null = null;
let lastSyncResult: {
  success: boolean;
  synced: number;
  skipped: number;
  errors: string[];
} | null = null;

/**
 * Perform a single sync of Wix bookings to guest sessions
 */
export async function syncWixBookings(): Promise<{
  success: boolean;
  synced: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let synced = 0;
  let skipped = 0;

  try {
    // Check if Wix is configured
    if (!ENV.wixClientId) {
      return {
        success: false,
        synced: 0,
        skipped: 0,
        errors: ["Wix Client ID not configured"],
      };
    }

    // Test connection first
    const connectionTest = await testWixConnection();
    if (!connectionTest.success) {
      return {
        success: false,
        synced: 0,
        skipped: 0,
        errors: [connectionTest.message],
      };
    }

    // Fetch today's bookings
    const bookings = await getTodaysWixBookings();
    console.log(`[WixAutoSync] Found ${bookings.length} bookings for today`);

    for (const booking of bookings) {
      try {
        // Check if already synced
        const existing = await getGuestSessionByWixBookingId(booking.id);
        if (existing) {
          skipped++;
          continue;
        }

        // Map booking to session
        const startTime = new Date(booking.bookedEntity?.slot?.startDate || booking.startDate);
        const endTime = new Date(booking.bookedEntity?.slot?.endDate || booking.endDate);
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        // Map duration to enum value
        let duration: "15" | "30" | "60" = "30";
        if (durationMinutes <= 20) duration = "15";
        else if (durationMinutes <= 40) duration = "30";
        else duration = "60";

        const guestName = `${booking.contactDetails.firstName || ''} ${booking.contactDetails.lastName || ''}`.trim() || 'Wix Guest';

        // Determine status based on current time
        const now = new Date();
        let status: "active" | "completed" | "extended" = "active";
        if (endTime <= now) {
          status = "completed";
        }

        await createGuestSessionFromWixBooking({
          wixBookingId: booking.id,
          guestName,
          guestCount: booking.totalParticipants || 1,
          duration,
          checkInAt: startTime,
          expiresAt: endTime,
          status,
        });

        synced++;
        console.log(`[WixAutoSync] Synced booking for ${guestName}`);
      } catch (err) {
        const errorMsg = `Failed to sync booking ${booking.id}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`[WixAutoSync] ${errorMsg}`);
      }
    }

    lastSyncTime = new Date();
    lastSyncResult = { success: true, synced, skipped, errors };

    // Update settings with last sync time
    try {
      await updateWixSyncTime(lastSyncTime);
    } catch (err) {
      console.error("[WixAutoSync] Failed to update last sync time in settings:", err);
    }

    console.log(`[WixAutoSync] Sync complete: ${synced} synced, ${skipped} skipped, ${errors.length} errors`);

    return { success: true, synced, skipped, errors };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[WixAutoSync] Sync failed: ${errorMsg}`);
    lastSyncResult = { success: false, synced, skipped, errors: [errorMsg] };
    return { success: false, synced, skipped, errors: [errorMsg] };
  }
}

/**
 * Start the auto-sync background job
 */
export function startAutoSync(): void {
  if (syncIntervalId) {
    console.log("[WixAutoSync] Auto-sync already running");
    return;
  }

  // Check if Wix is configured
  if (!ENV.wixClientId) {
    console.log("[WixAutoSync] Wix Client ID not configured, skipping auto-sync");
    return;
  }

  isAutoSyncEnabled = true;
  console.log("[WixAutoSync] Starting auto-sync (every 15 minutes)");

  // Run initial sync
  syncWixBookings().catch(err => {
    console.error("[WixAutoSync] Initial sync failed:", err);
  });

  // Set up interval
  syncIntervalId = setInterval(() => {
    syncWixBookings().catch(err => {
      console.error("[WixAutoSync] Scheduled sync failed:", err);
    });
  }, SYNC_INTERVAL_MS);
}

/**
 * Stop the auto-sync background job
 */
export function stopAutoSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    isAutoSyncEnabled = false;
    console.log("[WixAutoSync] Auto-sync stopped");
  }
}

/**
 * Get the current auto-sync status
 */
export function getAutoSyncStatus(): {
  enabled: boolean;
  lastSyncTime: Date | null;
  lastSyncResult: typeof lastSyncResult;
  nextSyncIn: number | null;
} {
  let nextSyncIn: number | null = null;
  if (isAutoSyncEnabled && lastSyncTime) {
    const nextSync = new Date(lastSyncTime.getTime() + SYNC_INTERVAL_MS);
    nextSyncIn = Math.max(0, nextSync.getTime() - Date.now());
  }

  return {
    enabled: isAutoSyncEnabled,
    lastSyncTime,
    lastSyncResult,
    nextSyncIn,
  };
}

/**
 * Toggle auto-sync on/off
 */
export function toggleAutoSync(enable: boolean): void {
  if (enable) {
    startAutoSync();
  } else {
    stopAutoSync();
  }
}
