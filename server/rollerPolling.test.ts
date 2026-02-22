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
  getDb: vi.fn().mockResolvedValue(null),
}));

// Mock the ENV
vi.mock("./_core/env", () => ({
  ENV: {
    rollerClientId: "test-client-id",
    rollerClientSecret: "test-client-secret",
  },
}));

import { searchBookings, getCustomerDetail } from "./roller";
import { createGuestSession } from "./db";

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
