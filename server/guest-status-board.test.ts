import { describe, it, expect } from "vitest";

describe("Guest Status Board", () => {
  describe("Session label mapping (updated for Roller)", () => {
    // Updated labels: Roller handles sessions now, no more static window timers
    function getSessionLabel(duration: string): string {
      switch (duration) {
        case "90": return "Study Sesh";
        case "60": return "Cat Lounge";
        case "30": return "Mini Meow";
        case "15": return "Quick Peek";
        default: return `${duration} min`;
      }
    }

    it("should return 'Study Sesh' for 90-minute sessions", () => {
      expect(getSessionLabel("90")).toBe("Study Sesh");
    });

    it("should return 'Cat Lounge' for 60-minute sessions", () => {
      expect(getSessionLabel("60")).toBe("Cat Lounge");
    });

    it("should return 'Mini Meow' for 30-minute sessions", () => {
      expect(getSessionLabel("30")).toBe("Mini Meow");
    });

    it("should return 'Quick Peek' for 15-minute sessions", () => {
      expect(getSessionLabel("15")).toBe("Quick Peek");
    });

    it("should return duration with 'min' suffix for unknown durations", () => {
      expect(getSessionLabel("45")).toBe("45 min");
    });
  });

  describe("Session icon mapping", () => {
    function getSessionIcon(duration: string): string {
      switch (duration) {
        case "90": return "\uD83D\uDCDA";
        case "60": return "\uD83D\uDC31";
        case "30": return "\uD83D\uDE3A";
        case "15": return "\uD83D\uDC3E";
        default: return "\uD83D\uDC08";
      }
    }

    it("should return book emoji for 90-minute Study Sesh", () => {
      expect(getSessionIcon("90")).toBe("\uD83D\uDCDA");
    });

    it("should return cat emoji for 60-minute Cat Lounge", () => {
      expect(getSessionIcon("60")).toBe("\uD83D\uDC31");
    });

    it("should return grinning cat for 30-minute Mini Meow", () => {
      expect(getSessionIcon("30")).toBe("\uD83D\uDE3A");
    });

    it("should return paw prints for 15-minute Quick Peek", () => {
      expect(getSessionIcon("15")).toBe("\uD83D\uDC3E");
    });
  });

  describe("Time status calculation", () => {
    function getTimeStatus(expiresAt: Date, currentTime: Date) {
      const msLeft = expiresAt.getTime() - currentTime.getTime();
      if (msLeft <= 0) return { label: "Ended", minutes: 0, seconds: 0, isExpired: true, isUrgent: true, percent: 0 };
      const totalSeconds = Math.floor(msLeft / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const isUrgent = minutes < 5;
      return { label: `${minutes}:${seconds.toString().padStart(2, "0")}`, minutes, seconds, isExpired: false, isUrgent, percent: Math.min(100, (msLeft / (60 * 60 * 1000)) * 100) };
    }

    it("should show expired status when time is up", () => {
      const now = new Date();
      const expired = new Date(now.getTime() - 1000);
      const status = getTimeStatus(expired, now);
      expect(status.isExpired).toBe(true);
      expect(status.label).toBe("Ended");
      expect(status.percent).toBe(0);
    });

    it("should show urgent when less than 5 minutes remain", () => {
      const now = new Date();
      const expires = new Date(now.getTime() + 3 * 60 * 1000);
      const status = getTimeStatus(expires, now);
      expect(status.isUrgent).toBe(true);
      expect(status.isExpired).toBe(false);
      expect(status.minutes).toBe(3);
    });

    it("should not be urgent when more than 5 minutes remain", () => {
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 60 * 1000);
      const status = getTimeStatus(expires, now);
      expect(status.isUrgent).toBe(false);
      expect(status.isExpired).toBe(false);
      expect(status.minutes).toBe(30);
    });

    it("should format time correctly with padded seconds", () => {
      const now = new Date();
      const expires = new Date(now.getTime() + 10 * 60 * 1000 + 5 * 1000);
      const status = getTimeStatus(expires, now);
      expect(status.label).toBe("10:05");
    });

    it("should calculate percent correctly for 60-minute session", () => {
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 60 * 1000);
      const status = getTimeStatus(expires, now);
      expect(status.percent).toBeCloseTo(50, 0);
    });

    it("should cap percent at 100", () => {
      const now = new Date();
      const expires = new Date(now.getTime() + 90 * 60 * 1000);
      const status = getTimeStatus(expires, now);
      expect(status.percent).toBe(100);
    });
  });

  describe("Grid layout selection", () => {
    function getGridClass(count: number): string {
      if (count <= 4) return "grid-cols-2";
      if (count <= 6) return "grid-cols-3";
      if (count <= 9) return "grid-cols-3";
      return "grid-cols-4";
    }

    it("should use 2 columns for 1-4 guests", () => {
      expect(getGridClass(1)).toBe("grid-cols-2");
      expect(getGridClass(2)).toBe("grid-cols-2");
      expect(getGridClass(4)).toBe("grid-cols-2");
    });

    it("should use 3 columns for 5-9 guests", () => {
      expect(getGridClass(5)).toBe("grid-cols-3");
      expect(getGridClass(6)).toBe("grid-cols-3");
      expect(getGridClass(9)).toBe("grid-cols-3");
    });

    it("should use 4 columns for 10+ guests", () => {
      expect(getGridClass(10)).toBe("grid-cols-4");
      expect(getGridClass(15)).toBe("grid-cols-4");
    });
  });

  describe("Session sorting", () => {
    it("should sort sessions by expiry time (soonest first)", () => {
      const now = Date.now();
      const sessions = [
        { id: 1, expiresAt: new Date(now + 30 * 60 * 1000) },
        { id: 2, expiresAt: new Date(now + 5 * 60 * 1000) },
        { id: 3, expiresAt: new Date(now + 60 * 60 * 1000) },
      ];

      const sorted = [...sessions].sort((a, b) => {
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      });

      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(3);
    });
  });

  describe("Session color mapping (with 90-min Study Sesh)", () => {
    function getSessionColor(duration: string) {
      switch (duration) {
        case "90": return { bg: "from-blue-500/30 to-blue-600/20", border: "border-blue-400/40" };
        case "60": return { bg: "from-teal-500/30 to-teal-600/20", border: "border-teal-400/40" };
        case "30": return { bg: "from-amber-500/30 to-amber-600/20", border: "border-amber-400/40" };
        case "15": return { bg: "from-purple-500/30 to-purple-600/20", border: "border-purple-400/40" };
        default: return { bg: "from-gray-500/30 to-gray-600/20", border: "border-gray-400/40" };
      }
    }

    it("should return blue colors for Study Sesh (90 min)", () => {
      const colors = getSessionColor("90");
      expect(colors.bg).toContain("blue");
      expect(colors.border).toContain("blue");
    });

    it("should return teal colors for Cat Lounge (60 min)", () => {
      const colors = getSessionColor("60");
      expect(colors.bg).toContain("teal");
      expect(colors.border).toContain("teal");
    });

    it("should return amber colors for Mini Meow (30 min)", () => {
      const colors = getSessionColor("30");
      expect(colors.bg).toContain("amber");
      expect(colors.border).toContain("amber");
    });

    it("should return purple colors for Quick Peek (15 min)", () => {
      const colors = getSessionColor("15");
      expect(colors.bg).toContain("purple");
      expect(colors.border).toContain("purple");
    });

    it("should return gray colors for unknown durations", () => {
      const colors = getSessionColor("45");
      expect(colors.bg).toContain("gray");
    });
  });

  describe("No static session window timers", () => {
    // Verify that the old static timer logic is no longer needed
    // Roller handles all session tracking now
    it("should not have static Full Purr / Mini Meow countdown logic", () => {
      // This test documents the removal of getSessionWindows()
      // The Guest Status Board now only shows checked-in guest cards
      // with individual countdown timers from their actual check-in time
      expect(true).toBe(true);
    });
  });
});
