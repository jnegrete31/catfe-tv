import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the scheduling eligibility logic
// This mirrors the isScreenEligible function from usePlaylist.ts

interface MockScreen {
  id: number;
  type: string;
  title: string;
  isActive: boolean;
  schedulingEnabled: boolean;
  startAt: Date | null;
  endAt: Date | null;
  daysOfWeek: number[] | null;
  timeStart: string | null;
  timeEnd: string | null;
  priority: number;
  durationSeconds: number;
}

function isScreenEligible(screen: MockScreen): boolean {
  // If scheduling is not enabled, screen is always eligible (when active)
  if (!screen.schedulingEnabled) return true;
  
  const now = new Date();
  
  // Check date range
  if (screen.startAt && new Date(screen.startAt) > now) return false;
  if (screen.endAt && new Date(screen.endAt) < now) return false;
  
  // Check days of week
  if (screen.daysOfWeek && screen.daysOfWeek.length > 0) {
    const currentDay = now.getDay();
    if (!screen.daysOfWeek.includes(currentDay)) return false;
  }
  
  // Check time window
  if (screen.timeStart && screen.timeEnd) {
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    if (currentTime < screen.timeStart || currentTime > screen.timeEnd) return false;
  }
  
  return true;
}

function createMockScreen(overrides: Partial<MockScreen> = {}): MockScreen {
  return {
    id: 1,
    type: "EVENT",
    title: "Test Screen",
    isActive: true,
    schedulingEnabled: false,
    startAt: null,
    endAt: null,
    daysOfWeek: null,
    timeStart: null,
    timeEnd: null,
    priority: 1,
    durationSeconds: 10,
    ...overrides,
  };
}

describe("Screen Scheduling Toggle", () => {
  describe("schedulingEnabled = false (default)", () => {
    it("should always be eligible regardless of date range", () => {
      const screen = createMockScreen({
        schedulingEnabled: false,
        startAt: new Date("2099-01-01"), // Future date
        endAt: new Date("2099-12-31"),
      });
      expect(isScreenEligible(screen)).toBe(true);
    });

    it("should always be eligible regardless of days of week", () => {
      const screen = createMockScreen({
        schedulingEnabled: false,
        daysOfWeek: [], // Empty - no days selected
      });
      expect(isScreenEligible(screen)).toBe(true);
    });

    it("should always be eligible regardless of time window", () => {
      const screen = createMockScreen({
        schedulingEnabled: false,
        timeStart: "00:00",
        timeEnd: "00:01", // Very narrow window
      });
      expect(isScreenEligible(screen)).toBe(true);
    });

    it("should always be eligible with no scheduling rules set", () => {
      const screen = createMockScreen({
        schedulingEnabled: false,
      });
      expect(isScreenEligible(screen)).toBe(true);
    });
  });

  describe("schedulingEnabled = true", () => {
    it("should be eligible when no scheduling rules are set", () => {
      const screen = createMockScreen({
        schedulingEnabled: true,
      });
      expect(isScreenEligible(screen)).toBe(true);
    });

    it("should be ineligible when start date is in the future", () => {
      const screen = createMockScreen({
        schedulingEnabled: true,
        startAt: new Date("2099-01-01"),
      });
      expect(isScreenEligible(screen)).toBe(false);
    });

    it("should be ineligible when end date is in the past", () => {
      const screen = createMockScreen({
        schedulingEnabled: true,
        endAt: new Date("2020-01-01"),
      });
      expect(isScreenEligible(screen)).toBe(false);
    });

    it("should be eligible when current date is within range", () => {
      const screen = createMockScreen({
        schedulingEnabled: true,
        startAt: new Date("2020-01-01"),
        endAt: new Date("2099-12-31"),
      });
      expect(isScreenEligible(screen)).toBe(true);
    });

    it("should be eligible when current day matches daysOfWeek", () => {
      const currentDay = new Date().getDay();
      const screen = createMockScreen({
        schedulingEnabled: true,
        daysOfWeek: [currentDay],
      });
      expect(isScreenEligible(screen)).toBe(true);
    });

    it("should be ineligible when current day does not match daysOfWeek", () => {
      const currentDay = new Date().getDay();
      // Pick a day that is NOT today
      const otherDay = (currentDay + 3) % 7;
      const screen = createMockScreen({
        schedulingEnabled: true,
        daysOfWeek: [otherDay],
      });
      expect(isScreenEligible(screen)).toBe(false);
    });

    it("should be eligible when current time is within time window", () => {
      const screen = createMockScreen({
        schedulingEnabled: true,
        timeStart: "00:00",
        timeEnd: "23:59",
      });
      expect(isScreenEligible(screen)).toBe(true);
    });

    it("should be ineligible when current time is outside time window", () => {
      // Use a time window that is definitely not now
      const now = new Date();
      const currentHour = now.getHours();
      // Create a window 12 hours from now
      const startHour = (currentHour + 12) % 24;
      const endHour = (currentHour + 13) % 24;
      
      // Only test if we can create a valid non-wrapping window
      if (startHour < endHour) {
        const screen = createMockScreen({
          schedulingEnabled: true,
          timeStart: `${String(startHour).padStart(2, "0")}:00`,
          timeEnd: `${String(endHour).padStart(2, "0")}:00`,
        });
        expect(isScreenEligible(screen)).toBe(false);
      }
    });
  });

  describe("scheduling toggle with combined rules", () => {
    it("should check all rules when scheduling is enabled", () => {
      const currentDay = new Date().getDay();
      const screen = createMockScreen({
        schedulingEnabled: true,
        startAt: new Date("2020-01-01"),
        endAt: new Date("2099-12-31"),
        daysOfWeek: [currentDay],
        timeStart: "00:00",
        timeEnd: "23:59",
      });
      expect(isScreenEligible(screen)).toBe(true);
    });

    it("should fail if any rule fails when scheduling is enabled", () => {
      const currentDay = new Date().getDay();
      const otherDay = (currentDay + 3) % 7;
      const screen = createMockScreen({
        schedulingEnabled: true,
        startAt: new Date("2020-01-01"),
        endAt: new Date("2099-12-31"),
        daysOfWeek: [otherDay], // Wrong day
        timeStart: "00:00",
        timeEnd: "23:59",
      });
      expect(isScreenEligible(screen)).toBe(false);
    });

    it("should ignore all rules when scheduling is disabled", () => {
      const currentDay = new Date().getDay();
      const otherDay = (currentDay + 3) % 7;
      const screen = createMockScreen({
        schedulingEnabled: false,
        startAt: new Date("2099-01-01"), // Future
        endAt: new Date("2099-12-31"),
        daysOfWeek: [otherDay], // Wrong day
        timeStart: "00:00",
        timeEnd: "00:01", // Narrow window
      });
      expect(isScreenEligible(screen)).toBe(true);
    });
  });
});
