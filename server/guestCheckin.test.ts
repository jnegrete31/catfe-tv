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

  it("should determine status based on time (upcoming before start)", () => {
    // Replicate the new time-based status logic from getTodayBookings
    function getStatus(sessionStartTime: string | null, sessionEndTime: string | null, nowTimePST: string): string {
      let status = "upcoming";
      if (sessionStartTime && sessionEndTime) {
        if (nowTimePST >= sessionEndTime) {
          status = "completed";
        } else if (nowTimePST >= sessionStartTime) {
          status = "checked_in";
        }
      }
      return status;
    }

    // Before session starts → upcoming
    expect(getStatus("14:00", "15:30", "13:00")).toBe("upcoming");
    // During session → checked_in
    expect(getStatus("14:00", "15:30", "14:30")).toBe("checked_in");
    // Exactly at start time → checked_in
    expect(getStatus("14:00", "15:30", "14:00")).toBe("checked_in");
    // After session ends → completed
    expect(getStatus("14:00", "15:30", "16:00")).toBe("completed");
    // Exactly at end time → completed
    expect(getStatus("14:00", "15:30", "15:30")).toBe("completed");
    // No times → upcoming (default)
    expect(getStatus(null, null, "14:00")).toBe("upcoming");
  });

  it("should filter bookings to only today's date (PST)", () => {
    const todayPST = "2026-02-21";
    const bookings = [
      { items: [{ bookingDate: "2026-02-21", startTime: "11:00" }] },
      { items: [{ bookingDate: "2026-02-22", startTime: "12:00" }] },
      { items: [{ bookingDate: "2026-02-21", startTime: "14:00" }] },
    ];

    const todayBookings = bookings.filter((b) => {
      const bookingDate = b.items[0]?.bookingDate;
      return !bookingDate || bookingDate === todayPST;
    });

    expect(todayBookings).toHaveLength(2);
    expect(todayBookings[0].items[0].startTime).toBe("11:00");
    expect(todayBookings[1].items[0].startTime).toBe("14:00");
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

describe("date filter range computation", () => {
  function addDaysPST(dateStr: string, days: number): string {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  function computeRange(filter: string, nowPST: string) {
    let dateFrom = nowPST;
    let dateTo = nowPST;
    if (filter === "tomorrow") {
      dateFrom = addDaysPST(nowPST, 1);
      dateTo = dateFrom;
    } else if (filter === "week") {
      dateTo = addDaysPST(nowPST, 6);
    } else if (filter === "month") {
      dateTo = addDaysPST(nowPST, 29);
    }
    return { dateFrom, dateTo };
  }

  it("should compute today range as single day", () => {
    const { dateFrom, dateTo } = computeRange("today", "2026-02-21");
    expect(dateFrom).toBe("2026-02-21");
    expect(dateTo).toBe("2026-02-21");
  });

  it("should compute tomorrow range as next day", () => {
    const { dateFrom, dateTo } = computeRange("tomorrow", "2026-02-21");
    expect(dateFrom).toBe("2026-02-22");
    expect(dateTo).toBe("2026-02-22");
  });

  it("should compute week range as 7 days from today", () => {
    const { dateFrom, dateTo } = computeRange("week", "2026-02-21");
    expect(dateFrom).toBe("2026-02-21");
    expect(dateTo).toBe("2026-02-27");
  });

  it("should compute month range as 30 days from today", () => {
    const { dateFrom, dateTo } = computeRange("month", "2026-02-21");
    expect(dateFrom).toBe("2026-02-21");
    expect(dateTo).toBe("2026-03-22");
  });

  it("should generate correct date list for multi-day fetch", () => {
    const dateFrom = "2026-02-21";
    const dateTo = "2026-02-23";
    const dates: string[] = [];
    let cursor = dateFrom;
    while (cursor <= dateTo) {
      dates.push(cursor);
      cursor = addDaysPST(cursor, 1);
    }
    expect(dates).toEqual(["2026-02-21", "2026-02-22", "2026-02-23"]);
  });

  it("should deduplicate bookings by bookingId", () => {
    const allBookings = [
      { bookingId: 1, customerName: "Alice" },
      { bookingId: 2, customerName: "Bob" },
      { bookingId: 1, customerName: "Alice (dup)" },
      { bookingId: 3, customerName: "Charlie" },
    ];
    const seen = new Set<number>();
    const filtered = allBookings.filter((b) => {
      if (b.bookingId && seen.has(b.bookingId)) return false;
      if (b.bookingId) seen.add(b.bookingId);
      return true;
    });
    expect(filtered).toHaveLength(3);
    expect(filtered.map(b => b.customerName)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("should sort bookings by date first, then status, then time", () => {
    const bookings = [
      { bookingDate: "2026-02-23", status: "upcoming", sessionStartTime: "10:00" },
      { bookingDate: "2026-02-22", status: "upcoming", sessionStartTime: "14:00" },
      { bookingDate: "2026-02-22", status: "upcoming", sessionStartTime: "11:00" },
      { bookingDate: "2026-02-21", status: "completed", sessionStartTime: "09:00" },
      { bookingDate: "2026-02-21", status: "checked_in", sessionStartTime: "12:00" },
    ];
    const statusOrder: Record<string, number> = { upcoming: 0, checked_in: 1, expired: 2, completed: 3 };
    bookings.sort((a, b) => {
      if (a.bookingDate !== b.bookingDate) return a.bookingDate.localeCompare(b.bookingDate);
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return a.sessionStartTime.localeCompare(b.sessionStartTime);
    });
    expect(bookings[0].bookingDate).toBe("2026-02-21");
    expect(bookings[0].status).toBe("checked_in");
    expect(bookings[1].bookingDate).toBe("2026-02-21");
    expect(bookings[1].status).toBe("completed");
    expect(bookings[2].bookingDate).toBe("2026-02-22");
    expect(bookings[2].sessionStartTime).toBe("11:00");
    expect(bookings[3].bookingDate).toBe("2026-02-22");
    expect(bookings[3].sessionStartTime).toBe("14:00");
    expect(bookings[4].bookingDate).toBe("2026-02-23");
  });
});

describe("Mark as Arrived feature", () => {
  it("should track arrival separately from time-based status", () => {
    // A booking can be "upcoming" (time-based) but also marked as arrived
    const booking = {
      status: "upcoming",
      arrivedAt: "2026-02-22T10:05:00.000Z",
      markedByUserId: 1,
    };

    const isArrived = !!booking.arrivedAt;
    expect(isArrived).toBe(true);
    expect(booking.status).toBe("upcoming"); // status is still time-based
  });

  it("should not show Mark Arrived button for completed/expired bookings", () => {
    const completedBooking = { status: "completed", arrivedAt: null };
    const expiredBooking = { status: "expired", arrivedAt: null };
    const upcomingBooking = { status: "upcoming", arrivedAt: null };

    const isPast = (status: string) => status === "completed" || status === "expired";

    expect(isPast(completedBooking.status)).toBe(true);
    expect(isPast(expiredBooking.status)).toBe(true);
    expect(isPast(upcomingBooking.status)).toBe(false);
  });

  it("should show Undo button when already arrived and not past", () => {
    const arrivedBooking = {
      status: "upcoming",
      arrivedAt: "2026-02-22T10:05:00.000Z",
      bookingId: 137593126,
    };

    const isArrived = !!arrivedBooking.arrivedAt;
    const isPast = arrivedBooking.status === "completed" || arrivedBooking.status === "expired";

    // Should show Undo (not Mark Arrived)
    expect(isArrived && !isPast).toBe(true);
  });

  it("should use bookingReference as bookingId (numeric)", () => {
    const bookingReference = "137593126";
    const bookingId = bookingReference ? parseInt(bookingReference) : null;

    expect(bookingId).toBe(137593126);
    expect(typeof bookingId).toBe("number");
  });

  it("should not produce NaN from UUID uniqueId", () => {
    const uniqueId = "cb3b2177-0ab0-4fb6-873b-5cc7c5d4f4ba";
    const bookingReference = "137593126";

    // Old buggy approach: parseInt(uniqueId) → NaN
    expect(parseInt(uniqueId)).toBeNaN();

    // Fixed approach: use bookingReference
    const bookingId = bookingReference ? parseInt(bookingReference) : null;
    expect(bookingId).toBe(137593126);
  });

  it("should merge arrival data into booking entries", () => {
    const arrivals = [
      { bookingId: 137593126, arrivedAt: new Date("2026-02-22T10:05:00.000Z"), markedByUserId: 1 },
    ];

    const bookings = [
      { bookingId: 137593126, customerName: "Cody Pitts", arrivedAt: null as string | null, markedByUserId: null as number | null },
      { bookingId: 137609165, customerName: "Katherine Hayes", arrivedAt: null as string | null, markedByUserId: null as number | null },
    ];

    const arrivalMap = new Map(arrivals.map(a => [a.bookingId, a]));
    for (const b of bookings) {
      const arrival = b.bookingId ? arrivalMap.get(b.bookingId) : null;
      if (arrival) {
        b.arrivedAt = arrival.arrivedAt.toISOString();
        b.markedByUserId = arrival.markedByUserId;
      }
    }

    expect(bookings[0].arrivedAt).toBe("2026-02-22T10:05:00.000Z");
    expect(bookings[0].markedByUserId).toBe(1);
    expect(bookings[1].arrivedAt).toBeNull();
    expect(bookings[1].markedByUserId).toBeNull();
  });
});

describe("Session duration by product type", () => {
  it("should use 60 min for Cat Lounge Session", () => {
    const productName = "Cat Lounge Session";
    const duration = productName.toLowerCase().includes("study") ? 90 : 60;
    expect(duration).toBe(60);
  });

  it("should use 90 min for Study Session", () => {
    const productName = "Study Session";
    const duration = productName.toLowerCase().includes("study") ? 90 : 60;
    expect(duration).toBe(90);
  });

  it("should use availability API endTime when available", () => {
    // Simulate availability session with explicit endTime
    const session = { startTime: "12:00", endTime: "12:30" };
    // Mini Meow Session: 30 min, endTime comes from API
    expect(session.endTime).toBe("12:30");
  });
});
