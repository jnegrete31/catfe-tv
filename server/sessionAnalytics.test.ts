import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    getDb: vi.fn(),
  };
});

import { getSessionHistory, getSessionAnalytics } from "./db";

describe("Session Analytics", () => {
  describe("getSessionHistory", () => {
    it("should be a function", () => {
      expect(typeof getSessionHistory).toBe("function");
    });

    it("should accept filter parameters", async () => {
      // Test that the function accepts various filter combinations
      const filters = {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        status: "completed" as const,
      };
      
      // Should not throw when called with filters
      const result = await getSessionHistory(filters);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array when database is not available", async () => {
      const result = await getSessionHistory({});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getSessionAnalytics", () => {
    it("should be a function", () => {
      expect(typeof getSessionAnalytics).toBe("function");
    });

    it("should return analytics object with expected structure", async () => {
      const result = await getSessionAnalytics();
      
      expect(result).toHaveProperty("totalSessions");
      expect(result).toHaveProperty("totalGuests");
      expect(result).toHaveProperty("averageGroupSize");
      expect(result).toHaveProperty("sessionsByDuration");
      expect(result).toHaveProperty("sessionsByDayOfWeek");
      expect(result).toHaveProperty("sessionsByHour");
      expect(result).toHaveProperty("peakHours");
      expect(result).toHaveProperty("averageSessionLength");
    });

    it("should return valid numeric values", async () => {
      const result = await getSessionAnalytics();
      
      // Should return non-negative numbers
      expect(result.totalSessions).toBeGreaterThanOrEqual(0);
      expect(result.totalGuests).toBeGreaterThanOrEqual(0);
      expect(result.averageGroupSize).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.sessionsByDuration)).toBe(true);
      expect(Array.isArray(result.sessionsByDayOfWeek)).toBe(true);
      expect(Array.isArray(result.sessionsByHour)).toBe(true);
      expect(Array.isArray(result.peakHours)).toBe(true);
      expect(result.averageSessionLength).toBeGreaterThanOrEqual(0);
    });

    it("should accept date range parameters", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");
      
      // Should not throw when called with date range
      const result = await getSessionAnalytics(startDate, endDate);
      expect(result).toHaveProperty("totalSessions");
    });
  });
});

describe("Photo Notification Integration", () => {
  it("notifyOwner should be importable from notification module", async () => {
    const { notifyOwner } = await import("./_core/notification");
    expect(typeof notifyOwner).toBe("function");
  });
});
