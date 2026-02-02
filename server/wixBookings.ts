import { ENV } from "./_core/env";

// Wix Bookings API types
export interface WixBooking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  bookedEntity: {
    slot?: {
      startDate: string;
      endDate: string;
      serviceId: string;
    };
  };
  contactDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  totalParticipants?: number;
  createdDate: string;
  updatedDate: string;
}

export interface WixBookingsResponse {
  bookings: WixBooking[];
  pagingMetadata?: {
    count: number;
    cursors?: {
      next?: string;
    };
  };
}

export interface WixService {
  id: string;
  name: string;
  description?: string;
  type: string;
}

export interface WixServicesResponse {
  services: WixService[];
}

// Token cache
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get OAuth2 access token using anonymous grant
 */
async function getWixAccessToken(): Promise<string> {
  // Check if we have a valid cached token (with 5 minute buffer)
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 5 * 60 * 1000) {
    return cachedToken;
  }

  if (!ENV.wixClientId) {
    throw new Error("Wix Client ID not configured");
  }

  console.log("[WixBookings] Requesting new OAuth2 access token...");

  const response = await fetch("https://www.wixapis.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: ENV.wixClientId,
      grantType: "anonymous",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Wix OAuth error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as { access_token: string; expires_in?: number };
  
  cachedToken = data.access_token;
  // Default to 1 hour expiry if not specified
  const expiresIn = data.expires_in || 3600;
  tokenExpiresAt = now + expiresIn * 1000;

  console.log("[WixBookings] Got new access token, expires in", expiresIn, "seconds");

  return cachedToken;
}

/**
 * Fetch bookings from Wix Bookings API
 */
export async function fetchWixBookings(options: {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}): Promise<WixBooking[]> {
  const { startDate, endDate, status = "CONFIRMED" } = options;

  const token = await getWixAccessToken();

  const filter: Record<string, unknown> = {
    status,
  };

  if (startDate) {
    filter.startDate = { $gte: startDate.toISOString() };
  }
  if (endDate) {
    filter.endDate = { $lte: endDate.toISOString() };
  }

  const response = await fetch(
    "https://www.wixapis.com/bookings/v2/bookings/query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        query: {
          filter,
          sort: [{ fieldName: "startDate", order: "ASC" }],
          paging: { limit: 100 },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Wix API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as WixBookingsResponse;
  return data.bookings || [];
}

/**
 * Fetch services from Wix to map service IDs to names
 */
export async function fetchWixServices(): Promise<WixService[]> {
  const token = await getWixAccessToken();

  const response = await fetch(
    "https://www.wixapis.com/bookings/v2/services/query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        query: {
          paging: { limit: 100 },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Wix API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as WixServicesResponse;
  return data.services || [];
}

/**
 * Test Wix API connection
 */
export async function testWixConnection(): Promise<{
  success: boolean;
  message: string;
  servicesCount?: number;
}> {
  try {
    if (!ENV.wixClientId) {
      return {
        success: false,
        message: "Wix Client ID not configured",
      };
    }

    const services = await fetchWixServices();
    return {
      success: true,
      message: `Connected successfully. Found ${services.length} booking services.`,
      servicesCount: services.length,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get today's bookings from Wix
 */
export async function getTodaysWixBookings(): Promise<WixBooking[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return fetchWixBookings({
    startDate: today,
    endDate: tomorrow,
    status: "CONFIRMED",
  });
}

/**
 * Map Wix booking duration to session type
 */
export function mapBookingToSessionType(booking: WixBooking): "mini_meow" | "full_purr" | "cat_nap" {
  const startDate = new Date(booking.bookedEntity?.slot?.startDate || booking.startDate);
  const endDate = new Date(booking.bookedEntity?.slot?.endDate || booking.endDate);
  const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);

  if (durationMinutes <= 20) return "cat_nap";
  if (durationMinutes <= 40) return "mini_meow";
  return "full_purr";
}
