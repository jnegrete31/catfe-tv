import { describe, it, expect } from "vitest";
import { getUpcomingArrivals } from "./db";

describe("Welcome Screen - Upcoming Arrivals", () => {
  describe("getUpcomingArrivals", () => {
    it("should return an array", async () => {
      const result = await getUpcomingArrivals(15);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should accept custom minutes ahead parameter", async () => {
      const result = await getUpcomingArrivals(30);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should include minutesUntilArrival in results", async () => {
      const result = await getUpcomingArrivals(15);
      // If there are any results, they should have minutesUntilArrival
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("minutesUntilArrival");
        expect(typeof result[0].minutesUntilArrival).toBe("number");
      }
    });

    it("should return sessions with required guest fields", async () => {
      const result = await getUpcomingArrivals(15);
      // If there are any results, they should have guest info
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("guestName");
        expect(result[0]).toHaveProperty("guestCount");
        expect(result[0]).toHaveProperty("checkInAt");
      }
    });
  });
});
