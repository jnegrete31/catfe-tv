/**
 * Browser Desktop Notification utility.
 * Requests permission once, then sends native OS notifications
 * that appear even when the browser tab is not in focus.
 */

let permissionGranted = false;

/**
 * Request notification permission from the user.
 * Call this early (e.g., on admin page load) so notifications work later.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("[Notifications] Browser does not support desktop notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    permissionGranted = true;
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn("[Notifications] User has denied notification permission");
    return false;
  }

  // Ask for permission
  try {
    const result = await Notification.requestPermission();
    permissionGranted = result === "granted";
    return permissionGranted;
  } catch {
    console.warn("[Notifications] Failed to request permission");
    return false;
  }
}

/**
 * Check if notifications are currently permitted.
 */
export function isNotificationPermitted(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

/**
 * Send a desktop notification.
 * Silently does nothing if permission hasn't been granted.
 */
export function sendNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string; // Prevents duplicate notifications with the same tag
    requireInteraction?: boolean; // Keep notification visible until user dismisses
  }
): Notification | null {
  if (!isNotificationPermitted()) return null;

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || "/catfe-logo.svg",
      tag: options?.tag,
      requireInteraction: options?.requireInteraction ?? false,
      silent: false,
    });

    // Auto-close after 10 seconds if not requireInteraction
    if (!options?.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }

    return notification;
  } catch {
    console.warn("[Notifications] Failed to create notification");
    return null;
  }
}

/**
 * Send a session warning notification (5-minute mark).
 */
export function notifySessionWarning(guestName: string, minutesLeft: number): void {
  sendNotification(`⏰ ${guestName}'s Session Ending Soon`, {
    body: `${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""} remaining`,
    tag: `session-warning-${guestName}`,
    requireInteraction: false,
  });
}

/**
 * Send a session expired notification.
 */
export function notifySessionExpired(guestName: string): void {
  sendNotification(`🔔 ${guestName}'s Session Expired`, {
    body: "Time to check them out!",
    tag: `session-expired-${guestName}`,
    requireInteraction: true,
  });
}

/**
 * Send a guest check-in notification.
 */
export function notifyGuestCheckIn(
  guestName: string,
  guestCount: number,
  duration: string
): void {
  const sessionLabels: Record<string, string> = {
    "15": "Guest Pass",
    "30": "Mini Meow",
    "60": "Full Meow",
  };
  const sessionType = sessionLabels[duration] || `${duration} min`;
  const partyInfo = guestCount > 1 ? ` (party of ${guestCount})` : "";

  sendNotification(`🐾 ${guestName} Checked In!`, {
    body: `${sessionType}${partyInfo}`,
    tag: `checkin-${guestName}-${Date.now()}`,
    requireInteraction: false,
  });
}
