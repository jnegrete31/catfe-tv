import { describe, it, expect } from "vitest";
import { computeWaiverStatus, extractWaiverIdsFromBooking, type RollerSignedWaiver, type RollerBookingDetail } from "./roller";

describe("computeWaiverStatus", () => {
  const baseWaiver: RollerSignedWaiver = {
    signedWaiverId: 1001,
    parentSignedWaiverId: null,
    waiverId: 100,
    firstName: "Cody",
    lastName: "Pitts",
    guestId: 5001,
    dateOfBirth: "1990-01-15",
    email: "cody@example.com",
    contactNumber: "555-1234",
    isForMinor: false,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    isValid: true,
    createdDate: "2025-01-01T00:00:00Z",
  };

  it("returns valid status for a waiver expiring in 1 year", () => {
    const result = computeWaiverStatus(baseWaiver);
    expect(result.status).toBe("valid");
    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(false);
    expect(result.isExpiringSoon).toBe(false);
    expect(result.firstName).toBe("Cody");
  });

  it("returns expired status for a waiver that expired yesterday", () => {
    const expired: RollerSignedWaiver = {
      ...baseWaiver,
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };
    const result = computeWaiverStatus(expired);
    expect(result.status).toBe("expired");
    expect(result.isExpired).toBe(true);
    expect(result.isValid).toBe(false);
  });

  it("returns expiring_soon for a waiver expiring in 15 days", () => {
    const expiringSoon: RollerSignedWaiver = {
      ...baseWaiver,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const result = computeWaiverStatus(expiringSoon);
    expect(result.status).toBe("expiring_soon");
    expect(result.isExpiringSoon).toBe(true);
    expect(result.isValid).toBe(true); // still valid, just expiring soon
  });

  it("returns invalid status when isValid is explicitly false", () => {
    const invalid: RollerSignedWaiver = {
      ...baseWaiver,
      isValid: false,
    };
    const result = computeWaiverStatus(invalid);
    expect(result.status).toBe("invalid");
    expect(result.isValid).toBe(false);
  });

  it("detects minor waivers", () => {
    const minor: RollerSignedWaiver = {
      ...baseWaiver,
      isForMinor: true,
      parentSignedWaiverId: 999,
      firstName: "Timmy",
    };
    const result = computeWaiverStatus(minor);
    expect(result.isForMinor).toBe(true);
    expect(result.parentSignedWaiverId).toBe(999);
    expect(result.firstName).toBe("Timmy");
  });

  it("handles null isValid as valid", () => {
    const nullValid: RollerSignedWaiver = {
      ...baseWaiver,
      isValid: null,
    };
    const result = computeWaiverStatus(nullValid);
    expect(result.isValid).toBe(true);
    expect(result.status).toBe("valid");
  });

  it("expired takes priority over isValid=null", () => {
    const expiredNull: RollerSignedWaiver = {
      ...baseWaiver,
      isValid: null,
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };
    const result = computeWaiverStatus(expiredNull);
    expect(result.status).toBe("expired");
    expect(result.isValid).toBe(false);
  });
});

describe("extractWaiverIdsFromBooking", () => {
  it("extracts signedWaiverIds from tickets array", () => {
    const detail: RollerBookingDetail = {
      bookingReference: "REF123",
      uniqueId: "uid-123",
      createdDate: "2025-01-01",
      channel: "online",
      status: "confirmed",
      name: "Test Booking",
      customerId: 100,
      total: 50,
      items: [
        {
          bookingItemId: 1,
          productId: 10,
          quantity: 3,
          bookingDate: "2025-02-22",
          bookingEndDate: "2025-02-22",
          sessionStartTime: "10:00",
          sessionEndTime: "11:00",
          tickets: [
            { ticketId: "t1", signedWaiverId: 1001 },
            { ticketId: "t2", signedWaiverId: 1002 },
            { ticketId: "t3" }, // no waiver
          ],
          cost: 50,
        },
      ],
    };
    const ids = extractWaiverIdsFromBooking(detail);
    expect(ids).toEqual([1001, 1002]);
  });

  it("handles single ticket (not array)", () => {
    const detail: RollerBookingDetail = {
      bookingReference: "REF456",
      uniqueId: "uid-456",
      createdDate: "2025-01-01",
      channel: "online",
      status: "confirmed",
      name: "Solo Booking",
      customerId: 200,
      total: 25,
      items: {
        bookingItemId: 2,
        productId: 20,
        quantity: 1,
        bookingDate: "2025-02-22",
        bookingEndDate: "2025-02-22",
        sessionStartTime: "14:00",
        sessionEndTime: "15:00",
        tickets: { ticketId: "t4", signedWaiverId: 2001 },
        cost: 25,
      },
    };
    const ids = extractWaiverIdsFromBooking(detail);
    expect(ids).toEqual([2001]);
  });

  it("deduplicates waiver IDs", () => {
    const detail: RollerBookingDetail = {
      bookingReference: "REF789",
      uniqueId: "uid-789",
      createdDate: "2025-01-01",
      channel: "online",
      status: "confirmed",
      name: "Dupe Booking",
      customerId: 300,
      total: 75,
      items: [
        {
          bookingItemId: 3,
          productId: 30,
          quantity: 2,
          bookingDate: "2025-02-22",
          bookingEndDate: "2025-02-22",
          sessionStartTime: "10:00",
          sessionEndTime: "11:00",
          tickets: [
            { ticketId: "t5", signedWaiverId: 3001 },
            { ticketId: "t6", signedWaiverId: 3001 }, // same waiver
          ],
          cost: 75,
        },
      ],
    };
    const ids = extractWaiverIdsFromBooking(detail);
    expect(ids).toEqual([3001]);
  });

  it("returns empty array when no tickets have waivers", () => {
    const detail: RollerBookingDetail = {
      bookingReference: "REF000",
      uniqueId: "uid-000",
      createdDate: "2025-01-01",
      channel: "online",
      status: "confirmed",
      name: "No Waiver Booking",
      customerId: 400,
      total: 30,
      items: [
        {
          bookingItemId: 4,
          productId: 40,
          quantity: 2,
          bookingDate: "2025-02-22",
          bookingEndDate: "2025-02-22",
          sessionStartTime: "12:00",
          sessionEndTime: "13:00",
          tickets: [
            { ticketId: "t7" },
            { ticketId: "t8" },
          ],
          cost: 30,
        },
      ],
    };
    const ids = extractWaiverIdsFromBooking(detail);
    expect(ids).toEqual([]);
  });

  it("handles items with no tickets field", () => {
    const detail: RollerBookingDetail = {
      bookingReference: "REF111",
      uniqueId: "uid-111",
      createdDate: "2025-01-01",
      channel: "online",
      status: "confirmed",
      name: "No Tickets Booking",
      customerId: 500,
      total: 20,
      items: [
        {
          bookingItemId: 5,
          productId: 50,
          quantity: 1,
          bookingDate: "2025-02-22",
          bookingEndDate: "2025-02-22",
          sessionStartTime: "16:00",
          sessionEndTime: "17:00",
          tickets: [],
          cost: 20,
        },
      ],
    };
    const ids = extractWaiverIdsFromBooking(detail);
    expect(ids).toEqual([]);
  });
});

describe("WaiverStatus edge cases", () => {
  it("expiring_soon boundary: exactly 30 days from now is expiring_soon", () => {
    const waiver: RollerSignedWaiver = {
      signedWaiverId: 5001,
      parentSignedWaiverId: null,
      waiverId: 100,
      firstName: "Edge",
      lastName: "Case",
      guestId: null,
      dateOfBirth: "2000-01-01",
      isForMinor: false,
      // 29 days from now (just under 30)
      expiryDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
      isValid: true,
      createdDate: "2025-01-01T00:00:00Z",
    };
    const result = computeWaiverStatus(waiver);
    expect(result.isExpiringSoon).toBe(true);
    expect(result.status).toBe("expiring_soon");
  });

  it("31 days from now is NOT expiring_soon", () => {
    const waiver: RollerSignedWaiver = {
      signedWaiverId: 5002,
      parentSignedWaiverId: null,
      waiverId: 100,
      firstName: "Safe",
      lastName: "Waiver",
      guestId: null,
      dateOfBirth: "2000-01-01",
      isForMinor: false,
      expiryDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
      isValid: true,
      createdDate: "2025-01-01T00:00:00Z",
    };
    const result = computeWaiverStatus(waiver);
    expect(result.isExpiringSoon).toBe(false);
    expect(result.status).toBe("valid");
  });

  it("minor with parent waiver ID preserved", () => {
    const waiver: RollerSignedWaiver = {
      signedWaiverId: 5003,
      parentSignedWaiverId: 5000,
      waiverId: 100,
      firstName: "Little",
      lastName: "One",
      guestId: null,
      dateOfBirth: "2018-06-15",
      isForMinor: true,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isValid: true,
      createdDate: "2025-01-01T00:00:00Z",
    };
    const result = computeWaiverStatus(waiver);
    expect(result.isForMinor).toBe(true);
    expect(result.parentSignedWaiverId).toBe(5000);
    expect(result.status).toBe("valid");
  });
});
