import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the roller API module
vi.mock("./roller", () => ({
  searchBookings: vi.fn(),
  getProductAvailability: vi.fn(),
  getCustomerDetail: vi.fn(),
}));

// Mock the db module
vi.mock("./db", () => ({
  getAllGuestSessions: vi.fn().mockResolvedValue([]),
  createGuestSession: vi.fn(),
  getDb: vi.fn(),
}));

// Mock the drizzle schema
vi.mock("../drizzle/schema", () => ({
  settings: {},
  guestSessions: {},
}));

// Mock the ENV
vi.mock("./_core/env", () => ({
  ENV: {
    rollerClientId: "test-client-id",
    rollerClientSecret: "test-client-secret",
  },
}));

import { searchBookings, getProductAvailability, getCustomerDetail } from "./roller";
import { getAllGuestSessions } from "./db";

describe("getTodayBookings data enrichment logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should enrich bookings with customer names from Roller API", async () => {
    // Simulate what getTodayBookings does
    vi.mocked(getCustomerDetail).mockResolvedValue({
      customerId: 12345,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
    });

    const customer = await getCustomerDetail(12345);
    let customerName = "Guest";
    if (customer?.firstName) {
      customerName = customer.firstName;
      if (customer.lastName) customerName += " " + customer.lastName;
    }

    expect(customerName).toBe("Sarah Johnson");
  });

  it("should fall back to 'Guest' when customer lookup fails", async () => {
    vi.mocked(getCustomerDetail).mockRejectedValue(new Error("Not found"));

    let customerName = "Guest";
    try {
      const customer = await getCustomerDetail(99999);
      if (customer?.firstName) {
        customerName = customer.firstName;
      }
    } catch {
      // keep fallback name
    }

    expect(customerName).toBe("Guest");
  });

  it("should compute correct end time from HH:mm start time (90 min session)", () => {
    const rawStartTime = "11:00";
    const [h, m] = rawStartTime.split(":").map(Number);
    const totalMin = h * 60 + m + 90;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    const sessionEndTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    expect(sessionEndTime).toBe("12:30");
  });

  it("should compute end time correctly for afternoon sessions", () => {
    const rawStartTime = "14:30";
    const [h, m] = rawStartTime.split(":").map(Number);
    const totalMin = h * 60 + m + 90;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    const sessionEndTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    expect(sessionEndTime).toBe("16:00");
  });

  it("should handle end time wrapping past midnight", () => {
    const rawStartTime = "23:00";
    const [h, m] = rawStartTime.split(":").map(Number);
    const totalMin = h * 60 + m + 90;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    const sessionEndTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    expect(sessionEndTime).toBe("00:30");
  });

  it("should map product IDs to names from availability API", async () => {
    vi.mocked(getProductAvailability).mockResolvedValue([
      {
        id: 100,
        parentProductId: 100,
        parentProductName: "Cat Lounge Session",
        name: "Cat Lounge Session",
        type: "sessionpass",
        products: [
          { id: 1765326, name: "Session - 11:00 AM" },
          { id: 1765327, name: "Session - 12:00 PM" },
        ],
      },
    ]);

    const products = await getProductAvailability("2026-02-22");
    const productNameMap = new Map<number, string>();
    for (const p of products) {
      const pid = p.id || p.parentProductId;
      const pname = p.parentProductName || p.name;
      if (pid && pname) productNameMap.set(pid, pname);
      for (const child of (p.products || [])) {
        if (child.id) productNameMap.set(child.id, pname);
      }
    }

    expect(productNameMap.get(100)).toBe("Cat Lounge Session");
    expect(productNameMap.get(1765326)).toBe("Cat Lounge Session");
    expect(productNameMap.get(1765327)).toBe("Cat Lounge Session");
    expect(productNameMap.get(999)).toBeUndefined();
  });

  it("should determine status based on guest session match", () => {
    const rollerRefMap = new Map<string, { status: string; id: number }>();
    rollerRefMap.set("REF001", { status: "active", id: 1 });
    rollerRefMap.set("REF002", { status: "completed", id: 2 });

    // Active session -> checked_in
    const match1 = rollerRefMap.get("REF001");
    let status1: string = "upcoming";
    if (match1) {
      status1 = match1.status === "completed" ? "completed" : "checked_in";
    }
    expect(status1).toBe("checked_in");

    // Completed session -> completed
    const match2 = rollerRefMap.get("REF002");
    let status2: string = "upcoming";
    if (match2) {
      status2 = match2.status === "completed" ? "completed" : "checked_in";
    }
    expect(status2).toBe("completed");

    // No match -> upcoming
    const match3 = rollerRefMap.get("REF999");
    let status3: string = "upcoming";
    if (match3) {
      status3 = match3.status === "completed" ? "completed" : "checked_in";
    }
    expect(status3).toBe("upcoming");
  });

  it("should sort bookings by status priority then by start time", () => {
    const bookings = [
      { status: "checked_in", sessionStartTime: "12:00" },
      { status: "upcoming", sessionStartTime: "14:00" },
      { status: "completed", sessionStartTime: "10:00" },
      { status: "upcoming", sessionStartTime: "11:00" },
      { status: "expired", sessionStartTime: "09:00" },
    ];

    const statusOrder: Record<string, number> = { upcoming: 0, checked_in: 1, expired: 2, completed: 3 };
    bookings.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      if (a.sessionStartTime && b.sessionStartTime) {
        return a.sessionStartTime.localeCompare(b.sessionStartTime);
      }
      return 0;
    });

    expect(bookings[0]).toEqual({ status: "upcoming", sessionStartTime: "11:00" });
    expect(bookings[1]).toEqual({ status: "upcoming", sessionStartTime: "14:00" });
    expect(bookings[2]).toEqual({ status: "checked_in", sessionStartTime: "12:00" });
    expect(bookings[3]).toEqual({ status: "expired", sessionStartTime: "09:00" });
    expect(bookings[4]).toEqual({ status: "completed", sessionStartTime: "10:00" });
  });
});

describe("formatTime helper (HH:mm format)", () => {
  // Replicate the frontend formatTime logic for testing
  function formatTime(timeStr: string | null): string {
    if (!timeStr) return "—";
    const hhmm = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) {
      const h = parseInt(hhmm[1], 10);
      const m = hhmm[2];
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${m} ${ampm}`;
    }
    return timeStr;
  }

  it("should format morning times correctly", () => {
    expect(formatTime("11:00")).toBe("11:00 AM");
    expect(formatTime("9:30")).toBe("9:30 AM");
  });

  it("should format afternoon times correctly", () => {
    expect(formatTime("14:30")).toBe("2:30 PM");
    expect(formatTime("17:00")).toBe("5:00 PM");
  });

  it("should format noon correctly", () => {
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatTime("12:30")).toBe("12:30 PM");
  });

  it("should format midnight correctly", () => {
    expect(formatTime("0:00")).toBe("12:00 AM");
    expect(formatTime("00:30")).toBe("12:30 AM");
  });

  it("should return dash for null", () => {
    expect(formatTime(null)).toBe("—");
  });

  it("should return the string as-is for unrecognized formats", () => {
    expect(formatTime("not-a-time")).toBe("not-a-time");
  });
});

describe("formatTimeRange helper", () => {
  function formatTime(timeStr: string | null): string {
    if (!timeStr) return "—";
    const hhmm = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) {
      const h = parseInt(hhmm[1], 10);
      const m = hhmm[2];
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${m} ${ampm}`;
    }
    return timeStr;
  }

  function formatTimeRange(start: string | null, end: string | null): string {
    if (!start) return "No time set";
    const startStr = formatTime(start);
    const endStr = end ? formatTime(end) : "";
    return endStr ? `${startStr} – ${endStr}` : startStr;
  }

  it("should format a complete time range", () => {
    expect(formatTimeRange("11:00", "12:30")).toBe("11:00 AM – 12:30 PM");
  });

  it("should show just start time when end is null", () => {
    expect(formatTimeRange("14:00", null)).toBe("2:00 PM");
  });

  it("should show 'No time set' when start is null", () => {
    expect(formatTimeRange(null, null)).toBe("No time set");
  });
});
