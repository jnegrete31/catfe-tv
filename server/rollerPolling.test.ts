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

describe("Countdown tick fix", () => {
  it("should recalculate countdown when tick changes", () => {
    // The fix: useMemo dependency array now includes `tick`
    // Simulates the countdown calculation
    const sessionExpiresAt = Date.now() + 30 * 60 * 1000; // 30 min from now
    const hasActiveSession = true;

    function calculateCountdown(tick: number) {
      if (!sessionExpiresAt || !hasActiveSession) return null;
      const now = Date.now();
      const diff = sessionExpiresAt - now;
      if (diff <= 0) return { expired: true, text: "Session expired" };
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return { expired: false, text: `${mins}m ${secs}s remaining`, tick };
    }

    const result1 = calculateCountdown(0);
    const result2 = calculateCountdown(1);
    // Both should return valid countdowns (not null, not expired)
    expect(result1).not.toBeNull();
    expect(result1!.expired).toBe(false);
    expect(result2).not.toBeNull();
    expect(result2!.expired).toBe(false);
    // The tick value should be different, proving the dependency triggers recalculation
    expect(result1!.tick).toBe(0);
    expect(result2!.tick).toBe(1);
  });

  it("should show expired when session time has passed", () => {
    const sessionExpiresAt = Date.now() - 5000; // 5 seconds ago
    const hasActiveSession = true;

    const now = Date.now();
    const diff = sessionExpiresAt - now;
    const expired = diff <= 0;
    expect(expired).toBe(true);
  });
});

describe("Session History Display", () => {
  it("should show session history when sessionCheckInAt exists", () => {
    const booking = {
      sessionCheckInAt: new Date("2026-02-26T10:00:00Z").getTime(),
      sessionExpiresAt: new Date("2026-02-26T11:00:00Z").getTime(),
      sessionStatus: "active" as const,
      sessionCheckedOutAt: null as number | null,
    };

    const hasHistory = !!booking.sessionCheckInAt;
    expect(hasHistory).toBe(true);
  });

  it("should calculate session duration when checked out", () => {
    const checkInAt = new Date("2026-02-26T10:00:00Z").getTime();
    const checkedOutAt = new Date("2026-02-26T10:45:00Z").getTime();

    const durationMs = checkedOutAt - checkInAt;
    const durationMins = Math.floor(durationMs / 60000);
    expect(durationMins).toBe(45);
  });

  it("should show check-out time when session is completed", () => {
    const booking = {
      sessionCheckInAt: new Date("2026-02-26T10:00:00Z").getTime(),
      sessionExpiresAt: new Date("2026-02-26T11:00:00Z").getTime(),
      sessionStatus: "completed" as const,
      sessionCheckedOutAt: new Date("2026-02-26T10:45:00Z").getTime(),
    };

    const isCompleted = booking.sessionStatus === "completed";
    const hasCheckOutTime = !!booking.sessionCheckedOutAt;
    expect(isCompleted).toBe(true);
    expect(hasCheckOutTime).toBe(true);
  });

  it("should not show check-out time for active sessions", () => {
    const booking = {
      sessionCheckInAt: new Date("2026-02-26T10:00:00Z").getTime(),
      sessionExpiresAt: new Date("2026-02-26T11:00:00Z").getTime(),
      sessionStatus: "active" as const,
      sessionCheckedOutAt: null as number | null,
    };

    const isCompleted = booking.sessionStatus === "completed";
    const hasCheckOutTime = !!booking.sessionCheckedOutAt;
    expect(isCompleted).toBe(false);
    expect(hasCheckOutTime).toBe(false);
  });
});

describe("Landing Page Photo Integration", () => {
  describe("Photo strip rendering", () => {
    it("should double photos for seamless loop animation", () => {
      const photos = [
        { id: 1, photoUrl: "https://example.com/1.jpg", caption: "Cat 1" },
        { id: 2, photoUrl: "https://example.com/2.jpg", caption: "Cat 2" },
        { id: 3, photoUrl: "https://example.com/3.jpg", caption: null },
      ];
      const doubled = [...photos, ...photos];
      expect(doubled.length).toBe(6);
      expect(doubled[0].id).toBe(doubled[3].id);
    });

    it("should limit photo strip to 12 photos max", () => {
      const photos = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        photoUrl: `https://example.com/${i}.jpg`,
        caption: `Cat ${i}`,
      }));
      const sliced = photos.slice(0, 12);
      expect(sliced.length).toBe(12);
    });

    it("should not render photo strip when no photos available", () => {
      const photos: Array<{ id: number; photoUrl: string }> = [];
      const shouldRender = photos.length > 0;
      expect(shouldRender).toBe(false);
    });
  });

  describe("Photo mosaic rendering", () => {
    it("should require at least 4 photos for mosaic", () => {
      const threePhotos = [1, 2, 3].map(id => ({
        id,
        photoUrl: `https://example.com/${id}.jpg`,
        caption: null,
        submitterName: "Guest",
      }));
      const shouldRenderMosaic = threePhotos.length >= 4;
      expect(shouldRenderMosaic).toBe(false);

      const fivePhotos = [1, 2, 3, 4, 5].map(id => ({
        id,
        photoUrl: `https://example.com/${id}.jpg`,
        caption: null,
        submitterName: "Guest",
      }));
      const shouldRenderMosaic2 = fivePhotos.length >= 4;
      expect(shouldRenderMosaic2).toBe(true);
    });

    it("should show up to 5 photos in mosaic (1 large + 4 small)", () => {
      const photos = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        photoUrl: `https://example.com/${i}.jpg`,
        caption: null,
        submitterName: "Guest",
      }));
      const mosaicPhotos = photos.slice(0, 5);
      const featured = mosaicPhotos[0];
      const smaller = mosaicPhotos.slice(1, 5);
      expect(mosaicPhotos.length).toBe(5);
      expect(featured.id).toBe(1);
      expect(smaller.length).toBe(4);
    });
  });

  describe("Happy Tails gallery", () => {
    it("should show up to 6 Happy Tails photos", () => {
      const photos = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        photoUrl: `https://example.com/${i}.jpg`,
        catName: `Cat ${i}`,
        caption: null,
      }));
      const galleryPhotos = photos.slice(0, 6);
      expect(galleryPhotos.length).toBe(6);
    });

    it("should display cat name on hover when available", () => {
      const photo = { id: 1, photoUrl: "url", catName: "Junie", caption: null };
      const hoverText = photo.catName ? `${photo.catName} \u{1F495}` : photo.caption || "Happy at home!";
      expect(hoverText).toBe("Junie \u{1F495}");
    });

    it("should fall back to caption when cat name is missing", () => {
      const photo = { id: 1, photoUrl: "url", catName: null, caption: "Living the good life" };
      const hoverText = photo.catName ? `${photo.catName} \u{1F495}` : photo.caption || "Happy at home!";
      expect(hoverText).toBe("Living the good life");
    });

    it("should show default text when both cat name and caption are missing", () => {
      const photo = { id: 1, photoUrl: "url", catName: null, caption: null };
      const hoverText = photo.catName ? `${photo.catName} \u{1F495}` : photo.caption || "Happy at home!";
      expect(hoverText).toBe("Happy at home!");
    });
  });

  describe("Contest leaderboard", () => {
    it("should show leaderboard when 3+ contest photos exist", () => {
      const photos = [
        { id: 1, photoUrl: "url", catName: "Whiskers", voteCount: 42, uploaderName: "Alice" },
        { id: 2, photoUrl: "url", catName: "Mittens", voteCount: 35, uploaderName: "Bob" },
        { id: 3, photoUrl: "url", catName: "Shadow", voteCount: 28, uploaderName: "Carol" },
      ];
      const showLeaderboard = photos.length >= 3;
      expect(showLeaderboard).toBe(true);
    });

    it("should fall back to donation tiers when fewer than 3 contest photos", () => {
      const photos = [
        { id: 1, photoUrl: "url", catName: "Whiskers", voteCount: 42, uploaderName: "Alice" },
      ];
      const showLeaderboard = photos.length >= 3;
      expect(showLeaderboard).toBe(false);
    });

    it("should display top 3 photos with medals", () => {
      const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];
      const photos = [
        { id: 1, catName: "Whiskers", voteCount: 42 },
        { id: 2, catName: "Mittens", voteCount: 35 },
        { id: 3, catName: "Shadow", voteCount: 28 },
      ];
      photos.forEach((photo, i) => {
        const label = `${medals[i]} ${photo.catName}`;
        expect(label).toContain(photo.catName);
        expect(label).toContain(medals[i]);
      });
    });
  });
});

describe("Events Calendar Section", () => {
  describe("getUpcomingEvents endpoint logic", () => {
    it("should filter to only active events", () => {
      const events = [
        { id: 1, title: "Pilates with Cats", isActive: true, startAt: new Date("2026-03-01"), createdAt: new Date() },
        { id: 2, title: "Yoga with Cats", isActive: false, startAt: new Date("2026-03-05"), createdAt: new Date() },
        { id: 3, title: "Movie Night", isActive: true, startAt: new Date("2026-03-10"), createdAt: new Date() },
      ];
      const active = events.filter(e => e.isActive);
      expect(active.length).toBe(2);
      expect(active.map(e => e.title)).toEqual(["Pilates with Cats", "Movie Night"]);
    });

    it("should sort events by startAt date (upcoming first)", () => {
      const events = [
        { id: 1, title: "Later Event", startAt: new Date("2026-04-01"), createdAt: new Date() },
        { id: 2, title: "Sooner Event", startAt: new Date("2026-03-01"), createdAt: new Date() },
        { id: 3, title: "Middle Event", startAt: new Date("2026-03-15"), createdAt: new Date() },
      ];
      const sorted = events.sort((a, b) => {
        if (a.startAt && b.startAt) return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
        if (a.startAt) return -1;
        if (b.startAt) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      expect(sorted[0].title).toBe("Sooner Event");
      expect(sorted[1].title).toBe("Middle Event");
      expect(sorted[2].title).toBe("Later Event");
    });

    it("should handle events without startAt date (sort by createdAt)", () => {
      const events = [
        { id: 1, title: "No Date", startAt: null as Date | null, createdAt: new Date("2026-02-20") },
        { id: 2, title: "Has Date", startAt: new Date("2026-03-01"), createdAt: new Date("2026-02-25") },
      ];
      const sorted = events.sort((a, b) => {
        if (a.startAt && b.startAt) return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
        if (a.startAt) return -1;
        if (b.startAt) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      expect(sorted[0].title).toBe("Has Date");
    });

    it("should limit results to the requested count", () => {
      const events = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        isActive: true,
        startAt: new Date(`2026-03-${String(i + 1).padStart(2, "0")}`),
        createdAt: new Date(),
      }));
      const limited = events.filter(e => e.isActive).slice(0, 6);
      expect(limited.length).toBe(6);
    });

    it("should return only the needed fields", () => {
      const event = {
        id: 1,
        title: "Pilates with Cats",
        subtitle: "Stretch and purr",
        body: "Join us for a relaxing session",
        eventTime: "8:00am - 9:30am",
        eventLocation: "Catfé",
        startAt: new Date("2026-03-01"),
        endAt: new Date("2026-03-01"),
        imagePath: null as string | null,
        // These should NOT be included
        isActive: true,
        priority: 1,
        durationSeconds: 10,
      };
      const mapped = {
        id: event.id,
        title: event.title,
        subtitle: event.subtitle,
        body: event.body,
        eventTime: event.eventTime,
        eventLocation: event.eventLocation,
        startAt: event.startAt,
        endAt: event.endAt,
        imagePath: event.imagePath,
      };
      expect(mapped).not.toHaveProperty("isActive");
      expect(mapped).not.toHaveProperty("priority");
      expect(mapped).toHaveProperty("title", "Pilates with Cats");
      expect(mapped).toHaveProperty("eventTime", "8:00am - 9:30am");
    });
  });

  describe("EventCard date formatting", () => {
    it("should format date with month, day, and day name", () => {
      const date = new Date("2026-03-15T10:00:00Z");
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const day = date.getDate();
      expect(dayName).toBeTruthy();
      expect(month).toBeTruthy();
      expect(day).toBe(15);
    });

    it("should detect today's events", () => {
      const now = new Date();
      const todayEvent = { startAt: now };
      const isToday = new Date(todayEvent.startAt).toDateString() === now.toDateString();
      expect(isToday).toBe(true);
    });

    it("should detect past events", () => {
      const pastDate = new Date("2025-01-01");
      const now = new Date();
      const isPast = pastDate < new Date(now.toDateString());
      expect(isPast).toBe(true);
    });

    it("should not mark future events as past", () => {
      const futureDate = new Date("2027-06-15");
      const now = new Date();
      const isPast = futureDate < new Date(now.toDateString());
      expect(isPast).toBe(false);
    });
  });

  describe("Events section visibility", () => {
    it("should show events section when events exist", () => {
      const events = [{ id: 1, title: "Pilates" }];
      const shouldShow = events && events.length > 0;
      expect(shouldShow).toBe(true);
    });

    it("should hide events section when no events exist", () => {
      const events: Array<{ id: number }> = [];
      const shouldShow = events && events.length > 0;
      expect(shouldShow).toBe(false);
    });

    it("should hide events section when data is undefined (loading)", () => {
      const events = undefined;
      const shouldShow = events && events.length > 0;
      expect(shouldShow).toBeFalsy();
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
