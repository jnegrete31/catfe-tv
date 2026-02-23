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
  uniqueId?: string;
  name?: string; // Booking title, NOT customer name
  customerId?: number; // Use this to look up customer details
  firstName?: string; // Not returned by /bookings search, only by /customers/{id}
  lastName?: string;
  email?: string;
  phone?: string;
  total: number;
  status?: string;
  items: RollerBookingItem[];
  createdDate: string;
}

export interface RollerCustomerDetail {
  customerId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  acceptMarketing?: boolean;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    city?: string;
    country?: string;
  };
  flags?: Array<{ type: string; comment?: string; expiryDate?: string }>;
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

// ---- Guest / Customer Detail ----

// In-memory cache for customer details to avoid repeated API calls
const customerCache = new Map<number, { data: RollerCustomerDetail; cachedAt: number }>();
const CUSTOMER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Get customer/guest detail by customerId.
 * Returns firstName, lastName, email, phone, etc.
 * Results are cached for 10 minutes to avoid excessive API calls.
 */
export async function getCustomerDetail(customerId: number): Promise<RollerCustomerDetail | null> {
  // Check cache first
  const cached = customerCache.get(customerId);
  if (cached && Date.now() - cached.cachedAt < CUSTOMER_CACHE_TTL) {
    return cached.data;
  }

  try {
    const data = await rollerFetch(`/customers/${customerId}`);
    const detail: RollerCustomerDetail = {
      customerId: data.customerId || customerId,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      acceptMarketing: data.acceptMarketing,
      address: data.address,
      flags: data.flags,
    };
    customerCache.set(customerId, { data: detail, cachedAt: Date.now() });
    return detail;
  } catch (error: any) {
    console.warn(`[Roller] Failed to fetch customer ${customerId}:`, error.message);
    return null;
  }
}

/**
 * Get signed waivers for a guest.
 */
export async function getGuestWaivers(guestId: string): Promise<any> {
  return rollerFetch(`/guests/${guestId}/signed-waiver`);
}

// ---- Signed Waiver ----

export interface RollerSignedWaiver {
  signedWaiverId: number;
  parentSignedWaiverId: number | null;
  waiverId: number;
  firstName: string;
  lastName: string;
  guestId: number | null;
  dateOfBirth: string;
  email?: string;
  contactNumber?: string;
  isForMinor: boolean;
  expiryDate: string;
  isValid: boolean | null;
  createdDate: string;
}

export interface WaiverStatus {
  signedWaiverId: number;
  firstName: string;
  lastName: string;
  isValid: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean; // within 30 days
  expiryDate: string;
  isForMinor: boolean;
  parentSignedWaiverId: number | null;
  status: "valid" | "expired" | "expiring_soon" | "invalid" | "missing";
}

/**
 * Get a signed waiver by its ID.
 */
export async function getSignedWaiver(signedWaiverId: number): Promise<RollerSignedWaiver | null> {
  try {
    const data = await rollerFetch(`/signed-waivers/${signedWaiverId}`);
    return data as RollerSignedWaiver;
  } catch (error: any) {
    console.warn(`[Roller] Failed to fetch signed waiver ${signedWaiverId}:`, error.message);
    return null;
  }
}

// In-memory cache for waiver statuses to avoid repeated API calls
const waiverCache = new Map<number, { data: WaiverStatus; cachedAt: number }>();
const WAIVER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Compute waiver status from a signed waiver record.
 */
export function computeWaiverStatus(waiver: RollerSignedWaiver): WaiverStatus {
  const now = new Date();
  const expiry = new Date(waiver.expiryDate);
  const isExpired = expiry < now;
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isExpiringSoon = !isExpired && expiry < thirtyDaysFromNow;
  const isValid = waiver.isValid !== false && !isExpired;

  let status: WaiverStatus["status"] = "valid";
  if (isExpired) status = "expired";
  else if (waiver.isValid === false) status = "invalid";
  else if (isExpiringSoon) status = "expiring_soon";

  return {
    signedWaiverId: waiver.signedWaiverId,
    firstName: waiver.firstName,
    lastName: waiver.lastName,
    isValid,
    isExpired,
    isExpiringSoon,
    expiryDate: waiver.expiryDate,
    isForMinor: waiver.isForMinor,
    parentSignedWaiverId: waiver.parentSignedWaiverId,
    status,
  };
}

/**
 * Get waiver status for a single signedWaiverId (with caching).
 */
export async function getWaiverStatus(signedWaiverId: number): Promise<WaiverStatus | null> {
  const cached = waiverCache.get(signedWaiverId);
  if (cached && Date.now() - cached.cachedAt < WAIVER_CACHE_TTL) {
    return cached.data;
  }

  const waiver = await getSignedWaiver(signedWaiverId);
  if (!waiver) return null;

  const status = computeWaiverStatus(waiver);
  waiverCache.set(signedWaiverId, { data: status, cachedAt: Date.now() });
  return status;
}

// ---- Booking Detail (with tickets/waivers) ----

export interface RollerBookingTicket {
  ticketId: string;
  customTicketId?: string;
  ticketHolderName?: string;
  membershipStatus?: string;
  photoUrl?: string;
  locations?: number[];
  customerId?: number;
  signedWaiverId?: number;
  externalTicketId?: string;
  name?: string;
}

export interface RollerBookingDetail {
  bookingReference: string;
  uniqueId: string;
  createdDate: string;
  channel: string;
  status: string;
  name: string;
  customerId: number;
  total: number;
  items: {
    bookingItemId: number;
    productId: number;
    quantity: number;
    bookingDate: string;
    bookingEndDate: string;
    sessionStartTime: string;
    sessionEndTime: string;
    tickets: RollerBookingTicket | RollerBookingTicket[];
    cost: number;
  } | Array<{
    bookingItemId: number;
    productId: number;
    quantity: number;
    bookingDate: string;
    bookingEndDate: string;
    sessionStartTime: string;
    sessionEndTime: string;
    tickets: RollerBookingTicket | RollerBookingTicket[];
    cost: number;
  }>;
}

/**
 * Get full booking detail by bookingReference or uniqueId.
 * This returns ticket-level data including signedWaiverId for each guest.
 */
export async function getBookingDetail(bookingRef: string): Promise<RollerBookingDetail | null> {
  try {
    const data = await rollerFetch(`/bookings/${bookingRef}`);
    return data as RollerBookingDetail;
  } catch (error: any) {
    console.warn(`[Roller] Failed to fetch booking detail ${bookingRef}:`, error.message);
    return null;
  }
}

/**
 * Extract all signedWaiverIds from a booking detail response.
 */
export function extractWaiverIdsFromBooking(detail: RollerBookingDetail): number[] {
  const ids: number[] = [];
  const items = Array.isArray(detail.items) ? detail.items : [detail.items];
  for (const item of items) {
    if (!item.tickets) continue;
    const tickets = Array.isArray(item.tickets) ? item.tickets : [item.tickets];
    for (const ticket of tickets) {
      if (ticket.signedWaiverId) {
        ids.push(ticket.signedWaiverId);
      }
    }
  }
  return Array.from(new Set(ids));
}

export interface BookingWaiverSummary {
  bookingReference: string;
  totalTickets: number;
  waiverStatuses: WaiverStatus[];
  missingWaiverCount: number;
  hasMinors: boolean;
  hasExpiringSoon: boolean;
  hasExpired: boolean;
  allValid: boolean;
  overallStatus: "all_valid" | "has_issues" | "no_waivers";
}

/**
 * Get waiver status for all guests in a booking.
 * Fetches booking detail, extracts signedWaiverIds, then looks up each waiver.
 */
export async function getBookingWaiverSummary(bookingRef: string): Promise<BookingWaiverSummary> {
  const detail = await getBookingDetail(bookingRef);
  if (!detail) {
    return {
      bookingReference: bookingRef,
      totalTickets: 0,
      waiverStatuses: [],
      missingWaiverCount: 0,
      hasMinors: false,
      hasExpiringSoon: false,
      hasExpired: false,
      allValid: false,
      overallStatus: "no_waivers",
    };
  }

  const items = Array.isArray(detail.items) ? detail.items : [detail.items];
  let totalTickets = 0;
  const waiverIds: number[] = [];

  for (const item of items) {
    if (!item.tickets) {
      totalTickets += item.quantity || 1;
      continue;
    }
    const tickets = Array.isArray(item.tickets) ? item.tickets : [item.tickets];
    totalTickets += tickets.length;
    for (const ticket of tickets) {
      if (ticket.signedWaiverId) {
        waiverIds.push(ticket.signedWaiverId);
      }
    }
  }

  const uniqueIds = Array.from(new Set(waiverIds));
  const waiverStatuses: WaiverStatus[] = [];

  // Fetch all waiver statuses in parallel
  const results = await Promise.allSettled(
    uniqueIds.map((id) => getWaiverStatus(id))
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      waiverStatuses.push(result.value);
    }
  }

  const missingWaiverCount = totalTickets - waiverStatuses.length;
  const hasMinors = waiverStatuses.some((w) => w.isForMinor);
  const hasExpiringSoon = waiverStatuses.some((w) => w.isExpiringSoon);
  const hasExpired = waiverStatuses.some((w) => w.isExpired);
  const allValid = waiverStatuses.length > 0 && waiverStatuses.every((w) => w.isValid) && missingWaiverCount === 0;

  let overallStatus: BookingWaiverSummary["overallStatus"] = "all_valid";
  if (waiverStatuses.length === 0 && totalTickets > 0) {
    overallStatus = "no_waivers";
  } else if (hasExpired || missingWaiverCount > 0 || waiverStatuses.some((w) => !w.isValid)) {
    overallStatus = "has_issues";
  }

  return {
    bookingReference: bookingRef,
    totalTickets,
    waiverStatuses,
    missingWaiverCount,
    hasMinors,
    hasExpiringSoon,
    hasExpired,
    allValid,
    overallStatus,
  };
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
