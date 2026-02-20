/**
 * Roller API Client
 * Handles OAuth2 authentication and API calls to Roller booking system.
 * Docs: https://docs.roller.app/docs/rest-api
 */
import { ENV } from "./_core/env";

const ROLLER_API_BASE = "https://api.roller.app";
const ROLLER_AUTH_URL = "https://api.roller.app/token";

// Cached token
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/**
 * Get an OAuth2 access token using client credentials grant.
 * Caches the token and refreshes when expired.
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  const clientId = ENV.rollerClientId;
  const clientSecret = ENV.rollerClientSecret;

  if (!clientId || !clientSecret) {
    throw new Error("Roller API credentials not configured");
  }

  const response = await fetch(ROLLER_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Roller auth failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  return cachedToken.accessToken;
}

/**
 * Make an authenticated request to the Roller API.
 */
async function rollerFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();

  const response = await fetch(`${ROLLER_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Roller API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// ---- Product Availability ----

export interface RollerSession {
  sessionId: number;
  startTime: string;
  endTime: string;
  capacityRemaining: number;
  capacityTotal?: number;
  status?: string;
}

export interface RollerProduct {
  productId: number;
  name: string;
  sessions: RollerSession[];
}

export interface RollerAvailability {
  products: RollerProduct[];
}

/**
 * Get product availability for a given date.
 * Returns an array of products with their sessions and capacity.
 */
export async function getProductAvailability(date: string): Promise<any[]> {
  const params = new URLSearchParams({ Date: date });
  return rollerFetch(`/product-availability?${params}`);
}

// ---- Bookings ----

export interface RollerBookingItem {
  productId: number;
  productName: string;
  quantity: number;
  bookingDate: string;
  startTime: string;
  endTime?: string;
}

export interface RollerBooking {
  bookingId: number;
  bookingReference: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  total: number;
  items: RollerBookingItem[];
  createdDate: string;
}

/**
 * Search for bookings by date.
 */
export async function searchBookings(opts: { dateFrom: string; dateTo?: string }): Promise<RollerBooking[]> {
  const params = new URLSearchParams({ date: opts.dateFrom });
  if (opts.dateTo) params.set('dateTo', opts.dateTo);
  const result = await rollerFetch(`/bookings?${params}`);
  return result.bookings || result || [];
}

// ---- Redemption (Check-in) ----

export interface RollerRedemption {
  redemptionId: number;
  bookingId: number;
  bookingReference: string;
  productId: number;
  productName: string;
  quantity: number;
  redeemedDate: string;
  firstName?: string;
  lastName?: string;
}

// ---- Venue Info ----

export interface RollerVenue {
  venueId: number;
  name: string;
  timezone: string;
}

/**
 * Get venue information.
 */
export async function getVenueInfo(): Promise<RollerVenue[]> {
  try {
    return await rollerFetch("/venues");
  } catch {
    return [];
  }
}

// ---- Webhooks ----

export interface RollerWebhookConfig {
  url: string;
  enabled: boolean;
  authentication: { apiKey: string };
  webhooks: {
    booking?: { events: string[]; include?: Record<string, boolean> };
    redemption?: { events: string[]; include?: Record<string, boolean> };
    customer?: { events: string[] };
    signedWaiver?: { events: string[] };
  };
}

/**
 * Create a webhook subscription.
 */
export async function createWebhook(config: RollerWebhookConfig): Promise<any> {
  return rollerFetch("/webhooks", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

/**
 * List existing webhooks.
 */
export async function listWebhooks(): Promise<any[]> {
  return rollerFetch("/webhooks");
}

/**
 * Delete a webhook by ID.
 */
export async function deleteWebhook(webhookId: number): Promise<void> {
  await rollerFetch(`/webhooks/${webhookId}`, { method: "DELETE" });
}

// ---- Guest / Waiver ----

/**
 * Get signed waivers for a guest.
 */
export async function getGuestWaivers(guestId: string): Promise<any> {
  return rollerFetch(`/guests/${guestId}/signed-waiver`);
}

// ---- Test Connection ----

/**
 * Test the Roller API connection by fetching today's product availability.
 */
export async function testConnection(): Promise<{ success: boolean; productCount?: number; error?: string }> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const products = await getProductAvailability(today);
    return { success: true, productCount: products.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
