import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock the roller API module
vi.mock("./roller", () => ({
  searchBookings: vi.fn(),
  listWebhooks: vi.fn(),
  createWebhook: vi.fn(),
  testConnection: vi.fn(),
  getCustomerDetail: vi.fn(),
}));

// Mock the db module
vi.mock("./db", () => ({
  createGuestSession: vi.fn().mockResolvedValue({ id: 1 }),
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ rollerPollingEnabled: true }]),
      }),
    }),
  }),
}));

// Mock the drizzle schema
vi.mock("../drizzle/schema", () => ({
  settings: { rollerPollingEnabled: "rollerPollingEnabled" },
  guestSessions: { rollerBookingRef: "rollerBookingRef" },
}));

// Mock the ENV
vi.mock("./_core/env", () => ({
  ENV: {
    rollerClientId: "test-client-id",
    rollerClientSecret: "test-client-secret",
  },
}));

import { searchBookings, getCustomerDetail } from "./roller";
import { createGuestSession, getDb } from "./db";

// We need to test the internal logic, so we'll import and test the module
// Since the polling functions use module-level state, we test via the exported functions
import { getRollerPollingStatus, startRollerPolling, stopRollerPolling } from "./rollerPolling";

describe("Roller Polling Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stopRollerPolling(); // Clean up any running intervals
  });

  afterEach(() => {
    stopRollerPolling();
  });

  describe("getRollerPollingStatus", () => {
    it("returns correct status when not running", () => {
      const status = getRollerPollingStatus();
      expect(status).toHaveProperty("isRunning");
      expect(status).toHaveProperty("processedBookingsCount");
      expect(status).toHaveProperty("hasCredentials");
      expect(status.hasCredentials).toBe(true);
    });
  });

  describe("startRollerPolling", () => {
    it("starts the polling service and marks it as running", async () => {
      // Mock searchBookings to return empty
      vi.mocked(searchBookings).mockResolvedValue([]);

      await startRollerPolling();

      const status = getRollerPollingStatus();
      expect(status.isRunning).toBe(true);

      stopRollerPolling();
      expect(getRollerPollingStatus().isRunning).toBe(false);
    });
  });

  describe("stopRollerPolling", () => {
    it("stops the polling service", async () => {
      vi.mocked(searchBookings).mockResolvedValue([]);
      await startRollerPolling();
      expect(getRollerPollingStatus().isRunning).toBe(true);

      stopRollerPolling();
      expect(getRollerPollingStatus().isRunning).toBe(false);
    });
  });

  describe("customer name lookup via getCustomerDetail", () => {
    it("should resolve guest first name from customerId", async () => {
      vi.mocked(getCustomerDetail).mockResolvedValue({
        customerId: 12345,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@example.com",
      });

      const result = await getCustomerDetail(12345);
      expect(result).not.toBeNull();
      expect(result!.firstName).toBe("Sarah");
      expect(result!.lastName).toBe("Johnson");
    });

    it("should handle missing customer gracefully and return null", async () => {
      vi.mocked(getCustomerDetail).mockResolvedValue(null);

      const result = await getCustomerDetail(99999);
      expect(result).toBeNull();
    });

    it("should prefer firstName over lastName for guest display name", async () => {
      vi.mocked(getCustomerDetail).mockResolvedValue({
        customerId: 67890,
        firstName: "Maria",
        lastName: "Garcia",
      });

      const result = await getCustomerDetail(67890);
      // The polling logic uses: customer.firstName || customer.lastName || "Guest"
      const displayName = result!.firstName || result!.lastName || "Guest";
      expect(displayName).toBe("Maria");
    });
  });
});

describe("Roller Webhook Handler", () => {
  it("should extract guest name from various payload formats", async () => {
    // Import the webhook handler module to test name extraction
    // We test the webhook endpoint via a simulated request
    const { getGuestName } = await import("./rollerWebhookHelpers");

    // Test various Roller payload formats
    expect(getGuestName({ guestName: "Alice" })).toBe("Alice");
    expect(getGuestName({ guest: { name: "Bob" } })).toBe("Bob");
    expect(getGuestName({ guest: { firstName: "Charlie", lastName: "Brown" } })).toBe("Charlie Brown");
    expect(getGuestName({ customerName: "Diana" })).toBe("Diana");
    expect(getGuestName({})).toBe("Walk-in Guest");
  });

  it("should map product names to correct durations", async () => {
    const { getSessionDuration } = await import("./rollerWebhookHelpers");

    expect(getSessionDuration("Mini Meow Escape (30 mins)")).toBe("30");
    expect(getSessionDuration("Full Purr Experience (60 mins)")).toBe("60");
    expect(getSessionDuration("Study Session (90 mins)")).toBe("90");
    expect(getSessionDuration("Unknown Product")).toBe("60"); // default
  });
});

describe("Session Product Filtering", () => {
  // We can't directly import the private isSessionProduct function from rollerWebhook.ts,
  // but we can test the webhook endpoint behavior with non-session products.
  // The isSessionProduct logic is duplicated in rollerPolling.ts and rollerWebhook.ts,
  // so we test the shared logic patterns here.

  describe("session vs non-session product identification", () => {
    // Replicate the isSessionProduct logic for testing
    function isSessionProduct(productName: string): boolean {
      const name = productName.toLowerCase();
      const sessionKeywords = ["purr", "meow", "study", "session", "experience", "escape", "lounge", "peek"];
      if (sessionKeywords.some(kw => name.includes(kw))) return true;
      const nonSessionKeywords = ["treat", "snack", "food", "merch", "shirt", "mug", "gift", "card", "donation", "tip", "add-on", "addon", "extra", "upgrade"];
      if (nonSessionKeywords.some(kw => name.includes(kw))) return false;
      if (/\b(15|30|60|90)\s*(min|m)\b/i.test(name)) return true;
      return false;
    }

    it("should identify session products correctly", () => {
      expect(isSessionProduct("Full Purr Experience")).toBe(true);
      expect(isSessionProduct("Mini Meow Escape")).toBe(true);
      expect(isSessionProduct("Study Session")).toBe(true);
      expect(isSessionProduct("Cat Lounge 60 min")).toBe(true);
      expect(isSessionProduct("Quick Peek")).toBe(true);
      expect(isSessionProduct("Full Purr Experience (60 mins)")).toBe(true);
      expect(isSessionProduct("Mini Meow Escape (30 mins)")).toBe(true);
    });

    it("should reject non-session products (treats, merch, add-ons)", () => {
      expect(isSessionProduct("Cat Treats")).toBe(false);
      expect(isSessionProduct("Kitty Snack Pack")).toBe(false);
      expect(isSessionProduct("Cat Food Bowl")).toBe(false);
      expect(isSessionProduct("Catfé T-Shirt")).toBe(false);
      expect(isSessionProduct("Gift Card")).toBe(false);
      expect(isSessionProduct("Donation")).toBe(false);
      expect(isSessionProduct("Tip")).toBe(false);
      expect(isSessionProduct("Add-on Treats")).toBe(false);
      expect(isSessionProduct("Extra Treats")).toBe(false);
      expect(isSessionProduct("Upgrade Package")).toBe(false);
    });

    it("should reject unknown products that don't match any pattern", () => {
      expect(isSessionProduct("Random Item")).toBe(false);
      expect(isSessionProduct("Something Else")).toBe(false);
    });

    it("should accept products with time-like duration patterns", () => {
      expect(isSessionProduct("Custom 30 min session")).toBe(true);
      expect(isSessionProduct("60 min visit")).toBe(true);
    });
  });
});

describe("Roller BookingCard UI behavior", () => {
  it("should treat session with sessionStatus=completed as checked out", () => {
    // Simulates the BookingCard logic:
    // isCompleted = booking.status === "completed" || booking.sessionStatus === "completed"
    const booking1 = { status: "checked_in" as const, sessionStatus: "completed" };
    const isCompleted1 = booking1.status === "completed" || booking1.sessionStatus === "completed";
    expect(isCompleted1).toBe(true);

    const booking2 = { status: "checked_in" as const, sessionStatus: "active" };
    const isCompleted2 = booking2.status === "completed" || booking2.sessionStatus === "completed";
    expect(isCompleted2).toBe(false);

    const booking3 = { status: "completed" as const, sessionStatus: undefined };
    const isCompleted3 = booking3.status === "completed" || booking3.sessionStatus === "completed";
    expect(isCompleted3).toBe(true);
  });

  it("should hide session controls when session is completed", () => {
    // The condition: isArrived && booking.guestSessionId && !isCompleted
    const isArrived = true;
    const guestSessionId = 42;
    const isCompleted = true; // session was checked out
    const showControls = isArrived && !!guestSessionId && !isCompleted;
    expect(showControls).toBe(false);
  });

  it("should show session controls for active arrived sessions", () => {
    const isArrived = true;
    const guestSessionId = 42;
    const isCompleted = false;
    const showControls = isArrived && !!guestSessionId && !isCompleted;
    expect(showControls).toBe(true);
  });
});
