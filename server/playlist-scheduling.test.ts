import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the playlist scheduling data model and logic
describe("Playlist Scheduling", () => {
  describe("Time block calculations", () => {
    function timeToPercent(time: string): number {
      const [h, m] = time.split(":").map(Number);
      return ((h * 60 + m) / (24 * 60)) * 100;
    }

    it("should convert midnight to 0%", () => {
      expect(timeToPercent("00:00")).toBe(0);
    });

    it("should convert noon to 50%", () => {
      expect(timeToPercent("12:00")).toBe(50);
    });

    it("should convert 6:00 AM to 25%", () => {
      expect(timeToPercent("06:00")).toBe(25);
    });

    it("should convert 6:00 PM to 75%", () => {
      expect(timeToPercent("18:00")).toBe(75);
    });

    it("should convert 23:59 to ~99.93%", () => {
      const result = timeToPercent("23:59");
      expect(result).toBeCloseTo(99.93, 1);
    });

    it("should handle half hours correctly", () => {
      expect(timeToPercent("12:30")).toBeCloseTo(52.08, 1);
    });
  });

  describe("Day filtering", () => {
    function isBlockVisibleOnDay(
      daysOfWeek: number[] | undefined,
      selectedDay: number
    ): boolean {
      if (!daysOfWeek || daysOfWeek.length === 0) return true;
      return daysOfWeek.includes(selectedDay);
    }

    it("should show block with no days restriction on any day", () => {
      expect(isBlockVisibleOnDay(undefined, 0)).toBe(true);
      expect(isBlockVisibleOnDay([], 3)).toBe(true);
    });

    it("should show block on matching day", () => {
      expect(isBlockVisibleOnDay([1, 3, 5], 1)).toBe(true); // Monday
      expect(isBlockVisibleOnDay([1, 3, 5], 3)).toBe(true); // Wednesday
      expect(isBlockVisibleOnDay([1, 3, 5], 5)).toBe(true); // Friday
    });

    it("should hide block on non-matching day", () => {
      expect(isBlockVisibleOnDay([1, 3, 5], 0)).toBe(false); // Sunday
      expect(isBlockVisibleOnDay([1, 3, 5], 2)).toBe(false); // Tuesday
      expect(isBlockVisibleOnDay([1, 3, 5], 6)).toBe(false); // Saturday
    });

    it("should show block with all days on any day", () => {
      const allDays = [0, 1, 2, 3, 4, 5, 6];
      for (let day = 0; day <= 6; day++) {
        expect(isBlockVisibleOnDay(allDays, day)).toBe(true);
      }
    });

    it("should handle weekdays only", () => {
      const weekdays = [1, 2, 3, 4, 5];
      expect(isBlockVisibleOnDay(weekdays, 0)).toBe(false); // Sunday
      expect(isBlockVisibleOnDay(weekdays, 1)).toBe(true); // Monday
      expect(isBlockVisibleOnDay(weekdays, 6)).toBe(false); // Saturday
    });

    it("should handle weekends only", () => {
      const weekends = [0, 6];
      expect(isBlockVisibleOnDay(weekends, 0)).toBe(true); // Sunday
      expect(isBlockVisibleOnDay(weekends, 1)).toBe(false); // Monday
      expect(isBlockVisibleOnDay(weekends, 6)).toBe(true); // Saturday
    });
  });

  describe("Currently active detection", () => {
    function isCurrentlyActive(
      currentTime: string,
      timeStart: string,
      timeEnd: string
    ): boolean {
      return currentTime >= timeStart && currentTime <= timeEnd;
    }

    it("should detect active block at current time", () => {
      expect(isCurrentlyActive("10:30", "09:00", "17:00")).toBe(true);
    });

    it("should detect inactive block before start", () => {
      expect(isCurrentlyActive("08:00", "09:00", "17:00")).toBe(false);
    });

    it("should detect inactive block after end", () => {
      expect(isCurrentlyActive("18:00", "09:00", "17:00")).toBe(false);
    });

    it("should detect active at exact start time", () => {
      expect(isCurrentlyActive("09:00", "09:00", "17:00")).toBe(true);
    });

    it("should detect active at exact end time", () => {
      expect(isCurrentlyActive("17:00", "09:00", "17:00")).toBe(true);
    });
  });

  describe("Playlist scheduling input validation", () => {
    it("should validate time format HH:MM", () => {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      expect(timeRegex.test("09:00")).toBe(true);
      expect(timeRegex.test("17:30")).toBe(true);
      expect(timeRegex.test("23:59")).toBe(true);
      expect(timeRegex.test("00:00")).toBe(true);
      expect(timeRegex.test("25:00")).toBe(false);
      expect(timeRegex.test("12:60")).toBe(false);
      expect(timeRegex.test("9:00")).toBe(false);
    });

    it("should validate days of week range 0-6", () => {
      const validDays = [0, 1, 2, 3, 4, 5, 6];
      validDays.forEach((d) => {
        expect(d >= 0 && d <= 6).toBe(true);
      });
      expect(-1 >= 0 && -1 <= 6).toBe(false);
      expect(7 >= 0 && 7 <= 6).toBe(false);
    });

    it("should allow empty scheduling fields when scheduling is disabled", () => {
      const playlist = {
        name: "Test Playlist",
        schedulingEnabled: false,
        daysOfWeek: undefined,
        timeStart: undefined,
        timeEnd: undefined,
      };
      // When scheduling is disabled, time fields can be empty
      expect(playlist.schedulingEnabled).toBe(false);
      expect(playlist.timeStart).toBeUndefined();
      expect(playlist.timeEnd).toBeUndefined();
    });
  });

  describe("Multiple time slots", () => {
    function buildPlaylistTimeBlocks(
      playlist: {
        id: number;
        name: string;
        schedulingEnabled: boolean;
        timeSlots?: Array<{ timeStart: string; timeEnd: string }>;
        timeStart?: string;
        timeEnd?: string;
        color?: string;
        daysOfWeek?: number[];
      }
    ) {
      if (!playlist.schedulingEnabled) return [];

      const slots =
        playlist.timeSlots && playlist.timeSlots.length > 0
          ? playlist.timeSlots
          : playlist.timeStart && playlist.timeEnd
            ? [{ timeStart: playlist.timeStart, timeEnd: playlist.timeEnd }]
            : [];

      return slots.map((slot, i) => ({
        id: playlist.id * 1000 + i,
        name: playlist.name + (slots.length > 1 ? ` (${i + 1})` : ""),
        timeStart: slot.timeStart,
        timeEnd: slot.timeEnd,
      }));
    }

    it("should create multiple time blocks from timeSlots array", () => {
      const blocks = buildPlaylistTimeBlocks({
        id: 1,
        name: "Morning & Afternoon",
        schedulingEnabled: true,
        timeSlots: [
          { timeStart: "09:00", timeEnd: "12:00" },
          { timeStart: "14:00", timeEnd: "17:00" },
        ],
      });
      expect(blocks).toHaveLength(2);
      expect(blocks[0].name).toBe("Morning & Afternoon (1)");
      expect(blocks[0].timeStart).toBe("09:00");
      expect(blocks[0].timeEnd).toBe("12:00");
      expect(blocks[1].name).toBe("Morning & Afternoon (2)");
      expect(blocks[1].timeStart).toBe("14:00");
      expect(blocks[1].timeEnd).toBe("17:00");
    });

    it("should create unique IDs for each time slot block", () => {
      const blocks = buildPlaylistTimeBlocks({
        id: 5,
        name: "Test",
        schedulingEnabled: true,
        timeSlots: [
          { timeStart: "08:00", timeEnd: "10:00" },
          { timeStart: "12:00", timeEnd: "14:00" },
          { timeStart: "16:00", timeEnd: "18:00" },
        ],
      });
      expect(blocks).toHaveLength(3);
      const ids = blocks.map((b) => b.id);
      expect(new Set(ids).size).toBe(3); // All unique
    });

    it("should fall back to legacy timeStart/timeEnd when timeSlots is empty", () => {
      const blocks = buildPlaylistTimeBlocks({
        id: 2,
        name: "Legacy Playlist",
        schedulingEnabled: true,
        timeSlots: [],
        timeStart: "10:00",
        timeEnd: "15:00",
      });
      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe("Legacy Playlist");
      expect(blocks[0].timeStart).toBe("10:00");
      expect(blocks[0].timeEnd).toBe("15:00");
    });

    it("should fall back to legacy timeStart/timeEnd when timeSlots is undefined", () => {
      const blocks = buildPlaylistTimeBlocks({
        id: 3,
        name: "Old Playlist",
        schedulingEnabled: true,
        timeStart: "08:00",
        timeEnd: "12:00",
      });
      expect(blocks).toHaveLength(1);
      expect(blocks[0].timeStart).toBe("08:00");
    });

    it("should return empty array when scheduling is disabled", () => {
      const blocks = buildPlaylistTimeBlocks({
        id: 4,
        name: "Disabled",
        schedulingEnabled: false,
        timeSlots: [
          { timeStart: "09:00", timeEnd: "12:00" },
        ],
      });
      expect(blocks).toHaveLength(0);
    });

    it("should return empty array when no time data exists", () => {
      const blocks = buildPlaylistTimeBlocks({
        id: 5,
        name: "No Times",
        schedulingEnabled: true,
      });
      expect(blocks).toHaveLength(0);
    });

    it("should not add slot number suffix for single time slot", () => {
      const blocks = buildPlaylistTimeBlocks({
        id: 6,
        name: "Single Slot",
        schedulingEnabled: true,
        timeSlots: [
          { timeStart: "09:00", timeEnd: "17:00" },
        ],
      });
      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe("Single Slot");
    });
  });

  describe("Screen scheduling eligibility", () => {
    function isScreenEligible(
      screen: {
        isActive: boolean;
        schedulingEnabled: boolean;
        timeStart?: string;
        timeEnd?: string;
        daysOfWeek?: number[];
      },
      currentTime: string,
      currentDay: number
    ): boolean {
      if (!screen.isActive) return false;

      // If scheduling is disabled, screen is always eligible
      if (!screen.schedulingEnabled) return true;

      // Check day of week
      if (screen.daysOfWeek && screen.daysOfWeek.length > 0) {
        if (!screen.daysOfWeek.includes(currentDay)) return false;
      }

      // Check time window
      if (screen.timeStart && screen.timeEnd) {
        if (currentTime < screen.timeStart || currentTime > screen.timeEnd) {
          return false;
        }
      }

      return true;
    }

    it("should show active screen with scheduling disabled", () => {
      expect(
        isScreenEligible(
          { isActive: true, schedulingEnabled: false },
          "10:00",
          1
        )
      ).toBe(true);
    });

    it("should hide inactive screen regardless of scheduling", () => {
      expect(
        isScreenEligible(
          { isActive: false, schedulingEnabled: false },
          "10:00",
          1
        )
      ).toBe(false);
    });

    it("should show scheduled screen within time window", () => {
      expect(
        isScreenEligible(
          {
            isActive: true,
            schedulingEnabled: true,
            timeStart: "09:00",
            timeEnd: "17:00",
            daysOfWeek: [1, 2, 3, 4, 5],
          },
          "10:00",
          1
        )
      ).toBe(true);
    });

    it("should hide scheduled screen outside time window", () => {
      expect(
        isScreenEligible(
          {
            isActive: true,
            schedulingEnabled: true,
            timeStart: "09:00",
            timeEnd: "17:00",
            daysOfWeek: [1, 2, 3, 4, 5],
          },
          "18:00",
          1
        )
      ).toBe(false);
    });

    it("should hide scheduled screen on wrong day", () => {
      expect(
        isScreenEligible(
          {
            isActive: true,
            schedulingEnabled: true,
            timeStart: "09:00",
            timeEnd: "17:00",
            daysOfWeek: [1, 2, 3, 4, 5],
          },
          "10:00",
          0 // Sunday
        )
      ).toBe(false);
    });

    it("should show scheduled screen with no day restrictions", () => {
      expect(
        isScreenEligible(
          {
            isActive: true,
            schedulingEnabled: true,
            timeStart: "09:00",
            timeEnd: "17:00",
          },
          "10:00",
          0
        )
      ).toBe(true);
    });
  });
});

describe("Backend Scheduling Resolution Logic", () => {
  // Test the isPlaylistScheduledNow logic as pure functions
  // (mirrors the logic in db.ts without needing DB mocks)

  interface PlaylistLike {
    schedulingEnabled: boolean;
    daysOfWeek: number[] | null;
    timeSlots: Array<{ timeStart: string; timeEnd: string }> | null;
    timeStart: string | null;
    timeEnd: string | null;
  }

  function isPlaylistScheduledAt(
    p: PlaylistLike,
    currentDay: number,
    currentTime: string
  ): boolean {
    if (!p.schedulingEnabled) return false;

    // Check days of week
    if (p.daysOfWeek && p.daysOfWeek.length > 0) {
      if (!p.daysOfWeek.includes(currentDay)) return false;
    }

    // Build time windows
    const windows: Array<{ timeStart: string; timeEnd: string }> = [];
    if (p.timeSlots && Array.isArray(p.timeSlots) && p.timeSlots.length > 0) {
      for (const slot of p.timeSlots) {
        if (slot.timeStart && slot.timeEnd) windows.push(slot);
      }
    }
    if (windows.length === 0 && p.timeStart && p.timeEnd) {
      windows.push({ timeStart: p.timeStart, timeEnd: p.timeEnd });
    }

    // No time windows = always on for those days
    if (windows.length === 0) return true;

    return windows.some((w) => {
      // Handle overnight windows (e.g., 22:00 – 02:00)
      if (w.timeEnd < w.timeStart) {
        return currentTime >= w.timeStart || currentTime <= w.timeEnd;
      }
      return currentTime >= w.timeStart && currentTime <= w.timeEnd;
    });
  }

  it("should not match when schedulingEnabled is false", () => {
    expect(
      isPlaylistScheduledAt(
        { schedulingEnabled: false, daysOfWeek: null, timeSlots: null, timeStart: null, timeEnd: null },
        1,
        "10:00"
      )
    ).toBe(false);
  });

  it("should match when scheduling enabled, all days, within timeSlots window", () => {
    expect(
      isPlaylistScheduledAt(
        {
          schedulingEnabled: true,
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          timeSlots: [{ timeStart: "09:00", timeEnd: "17:00" }],
          timeStart: null,
          timeEnd: null,
        },
        3, // Wednesday
        "12:00"
      )
    ).toBe(true);
  });

  it("should not match when current time is outside all timeSlots", () => {
    expect(
      isPlaylistScheduledAt(
        {
          schedulingEnabled: true,
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          timeSlots: [
            { timeStart: "09:00", timeEnd: "12:00" },
            { timeStart: "14:00", timeEnd: "17:00" },
          ],
          timeStart: null,
          timeEnd: null,
        },
        3,
        "13:00" // between the two windows
      )
    ).toBe(false);
  });

  it("should match when current time is in second timeSlot", () => {
    expect(
      isPlaylistScheduledAt(
        {
          schedulingEnabled: true,
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          timeSlots: [
            { timeStart: "09:00", timeEnd: "12:00" },
            { timeStart: "14:00", timeEnd: "17:00" },
          ],
          timeStart: null,
          timeEnd: null,
        },
        3,
        "15:30"
      )
    ).toBe(true);
  });

  it("should use legacy timeStart/timeEnd when timeSlots is null", () => {
    expect(
      isPlaylistScheduledAt(
        {
          schedulingEnabled: true,
          daysOfWeek: null,
          timeSlots: null,
          timeStart: "08:00",
          timeEnd: "20:00",
        },
        1,
        "10:00"
      )
    ).toBe(true);
  });

  it("should use legacy timeStart/timeEnd when timeSlots is empty array", () => {
    expect(
      isPlaylistScheduledAt(
        {
          schedulingEnabled: true,
          daysOfWeek: null,
          timeSlots: [],
          timeStart: "08:00",
          timeEnd: "20:00",
        },
        1,
        "10:00"
      )
    ).toBe(true);
  });

  it("should be always-on when scheduling enabled but no time windows defined", () => {
    expect(
      isPlaylistScheduledAt(
        {
          schedulingEnabled: true,
          daysOfWeek: [1, 2, 3, 4, 5],
          timeSlots: null,
          timeStart: null,
          timeEnd: null,
        },
        3, // Wednesday
        "23:59"
      )
    ).toBe(true);
  });

  it("should not match on wrong day even with no time windows", () => {
    expect(
      isPlaylistScheduledAt(
        {
          schedulingEnabled: true,
          daysOfWeek: [1, 2, 3, 4, 5], // weekdays only
          timeSlots: null,
          timeStart: null,
          timeEnd: null,
        },
        0, // Sunday
        "12:00"
      )
    ).toBe(false);
  });

  it("should handle overnight time windows (e.g., 22:00 – 02:00)", () => {
    const playlist: PlaylistLike = {
      schedulingEnabled: true,
      daysOfWeek: null,
      timeSlots: [{ timeStart: "22:00", timeEnd: "02:00" }],
      timeStart: null,
      timeEnd: null,
    };

    // 23:00 should match (after start)
    expect(isPlaylistScheduledAt(playlist, 1, "23:00")).toBe(true);
    // 01:00 should match (before end, next day)
    expect(isPlaylistScheduledAt(playlist, 1, "01:00")).toBe(true);
    // 12:00 should NOT match
    expect(isPlaylistScheduledAt(playlist, 1, "12:00")).toBe(false);
    // 03:00 should NOT match (after end)
    expect(isPlaylistScheduledAt(playlist, 1, "03:00")).toBe(false);
  });

  it("should match at exact boundary times", () => {
    const playlist: PlaylistLike = {
      schedulingEnabled: true,
      daysOfWeek: null,
      timeSlots: [{ timeStart: "09:00", timeEnd: "17:00" }],
      timeStart: null,
      timeEnd: null,
    };

    expect(isPlaylistScheduledAt(playlist, 1, "09:00")).toBe(true); // exact start
    expect(isPlaylistScheduledAt(playlist, 1, "17:00")).toBe(true); // exact end
    expect(isPlaylistScheduledAt(playlist, 1, "08:59")).toBe(false); // 1 min before
    expect(isPlaylistScheduledAt(playlist, 1, "17:01")).toBe(false); // 1 min after
  });
});
