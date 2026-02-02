import { describe, it, expect } from "vitest";
import { testWixConnection, mapBookingToSessionType } from "./wixBookings";

describe("Wix Bookings Integration", () => {
  describe("testWixConnection", () => {
    it("should test Wix API connection", async () => {
      const result = await testWixConnection();
      
      // The result should have the expected structure
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
      
      // If credentials are configured, it should connect successfully
      // If not configured, it should return a clear error message
      if (result.success) {
        expect(result.message).toContain("Connected successfully");
        expect(result.servicesCount).toBeGreaterThanOrEqual(0);
      } else {
        // Either credentials not configured or API error
        expect(result.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe("mapBookingToSessionType", () => {
    it("should map 15-minute booking to cat_nap", () => {
      const booking = {
        id: "test-1",
        status: "CONFIRMED",
        startDate: "2024-01-15T10:00:00.000Z",
        endDate: "2024-01-15T10:15:00.000Z",
        bookedEntity: {
          slot: {
            startDate: "2024-01-15T10:00:00.000Z",
            endDate: "2024-01-15T10:15:00.000Z",
            serviceId: "service-1",
          },
        },
        contactDetails: { firstName: "Test" },
        createdDate: "2024-01-15T09:00:00.000Z",
        updatedDate: "2024-01-15T09:00:00.000Z",
      };

      expect(mapBookingToSessionType(booking)).toBe("cat_nap");
    });

    it("should map 30-minute booking to mini_meow", () => {
      const booking = {
        id: "test-2",
        status: "CONFIRMED",
        startDate: "2024-01-15T10:00:00.000Z",
        endDate: "2024-01-15T10:30:00.000Z",
        bookedEntity: {
          slot: {
            startDate: "2024-01-15T10:00:00.000Z",
            endDate: "2024-01-15T10:30:00.000Z",
            serviceId: "service-1",
          },
        },
        contactDetails: { firstName: "Test" },
        createdDate: "2024-01-15T09:00:00.000Z",
        updatedDate: "2024-01-15T09:00:00.000Z",
      };

      expect(mapBookingToSessionType(booking)).toBe("mini_meow");
    });

    it("should map 60-minute booking to full_purr", () => {
      const booking = {
        id: "test-3",
        status: "CONFIRMED",
        startDate: "2024-01-15T10:00:00.000Z",
        endDate: "2024-01-15T11:00:00.000Z",
        bookedEntity: {
          slot: {
            startDate: "2024-01-15T10:00:00.000Z",
            endDate: "2024-01-15T11:00:00.000Z",
            serviceId: "service-1",
          },
        },
        contactDetails: { firstName: "Test" },
        createdDate: "2024-01-15T09:00:00.000Z",
        updatedDate: "2024-01-15T09:00:00.000Z",
      };

      expect(mapBookingToSessionType(booking)).toBe("full_purr");
    });
  });
});
