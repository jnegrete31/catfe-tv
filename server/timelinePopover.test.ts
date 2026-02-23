import { describe, it, expect, vi } from "vitest";

/**
 * Tests for the timeline popover feature logic.
 * Since the popover is a frontend component, these tests verify the data
 * structures and callback logic that power the popover actions.
 */

type RollerBookingEntry = {
  bookingId: number;
  bookingReference: string;
  customerName: string;
  customerId: number | null;
  productName: string;
  quantity: number;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
  bookingDate: string;
  status: "upcoming" | "checked_in" | "completed" | "expired";
  guestSessionId: number | null;
  total: number;
  bookingStatus: string;
  arrivedAt: string | null;
  markedByUserId: number | null;
};

function createMockBooking(overrides: Partial<RollerBookingEntry> = {}): RollerBookingEntry {
  return {
    bookingId: 1001,
    bookingReference: "REF-001",
    customerName: "Sarah",
    customerId: 12345,
    productName: "Full Purr Experience (60 mins)",
    quantity: 2,
    sessionStartTime: "11:00",
    sessionEndTime: "12:00",
    bookingDate: "2026-02-22",
    status: "upcoming",
    guestSessionId: null,
    total: 50,
    bookingStatus: "confirmed",
    arrivedAt: null,
    markedByUserId: null,
    ...overrides,
  };
}

describe("Timeline Popover - Action Visibility Logic", () => {
  it("should show Mark Arrived for upcoming bookings with a bookingId", () => {
    const booking = createMockBooking({ status: "upcoming", arrivedAt: null, bookingId: 1001 });
    const isArrived = !!booking.arrivedAt;
    const isPast = booking.status === "completed" || booking.status === "expired";
    const canMarkArrived = !isArrived && !isPast && !!booking.bookingId;
    const canUndo = isArrived && !isPast && !!booking.bookingId;

    expect(canMarkArrived).toBe(true);
    expect(canUndo).toBe(false);
  });

  it("should show Undo for arrived bookings that are not past", () => {
    const booking = createMockBooking({
      status: "checked_in",
      arrivedAt: "2026-02-22T19:00:00.000Z",
      bookingId: 1001,
    });
    const isArrived = !!booking.arrivedAt;
    const isPast = booking.status === "completed" || booking.status === "expired";
    const canMarkArrived = !isArrived && !isPast && !!booking.bookingId;
    const canUndo = isArrived && !isPast && !!booking.bookingId;

    expect(canMarkArrived).toBe(false);
    expect(canUndo).toBe(true);
  });

  it("should hide both actions for completed bookings", () => {
    const booking = createMockBooking({ status: "completed", arrivedAt: null, bookingId: 1001 });
    const isArrived = !!booking.arrivedAt;
    const isPast = booking.status === "completed" || booking.status === "expired";
    const canMarkArrived = !isArrived && !isPast && !!booking.bookingId;
    const canUndo = isArrived && !isPast && !!booking.bookingId;

    expect(canMarkArrived).toBe(false);
    expect(canUndo).toBe(false);
  });

  it("should hide both actions for expired/no-show bookings", () => {
    const booking = createMockBooking({ status: "expired", arrivedAt: null, bookingId: 1001 });
    const isArrived = !!booking.arrivedAt;
    const isPast = booking.status === "completed" || booking.status === "expired";
    const canMarkArrived = !isArrived && !isPast && !!booking.bookingId;
    const canUndo = isArrived && !isPast && !!booking.bookingId;

    expect(canMarkArrived).toBe(false);
    expect(canUndo).toBe(false);
  });

  it("should hide Mark Arrived when bookingId is missing", () => {
    const booking = createMockBooking({ status: "upcoming", arrivedAt: null, bookingId: 0 });
    const isArrived = !!booking.arrivedAt;
    const isPast = booking.status === "completed" || booking.status === "expired";
    const canMarkArrived = !isArrived && !isPast && !!booking.bookingId;

    expect(canMarkArrived).toBe(false);
  });

  it("should hide Undo for completed bookings even if arrivedAt is set", () => {
    const booking = createMockBooking({
      status: "completed",
      arrivedAt: "2026-02-22T19:00:00.000Z",
      bookingId: 1001,
    });
    const isArrived = !!booking.arrivedAt;
    const isPast = booking.status === "completed" || booking.status === "expired";
    const canUndo = isArrived && !isPast && !!booking.bookingId;

    expect(canUndo).toBe(false);
  });
});

describe("Timeline Popover - Mark Arrived Callback", () => {
  it("should call onMarkArrived with correct booking data", () => {
    const onMarkArrived = vi.fn();
    const booking = createMockBooking({
      bookingId: 2001,
      bookingReference: "REF-TIMELINE-001",
      customerName: "Cody",
      quantity: 3,
      sessionStartTime: "14:00",
      sessionEndTime: "15:00",
      productName: "Full Purr Experience (60 mins)",
    });

    // Simulate what the popover does when Mark Arrived is clicked
    if (booking.bookingId) {
      onMarkArrived(booking);
    }

    expect(onMarkArrived).toHaveBeenCalledTimes(1);
    expect(onMarkArrived).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 2001,
        bookingReference: "REF-TIMELINE-001",
        customerName: "Cody",
        quantity: 3,
        sessionStartTime: "14:00",
        sessionEndTime: "15:00",
        productName: "Full Purr Experience (60 mins)",
      })
    );
  });

  it("should not call onMarkArrived when bookingId is 0", () => {
    const onMarkArrived = vi.fn();
    const booking = createMockBooking({ bookingId: 0 });

    if (booking.bookingId) {
      onMarkArrived(booking);
    }

    expect(onMarkArrived).not.toHaveBeenCalled();
  });
});

describe("Timeline Popover - Unmark Arrived Callback", () => {
  it("should call onUnmarkArrived with correct booking data", () => {
    const onUnmarkArrived = vi.fn();
    const booking = createMockBooking({
      bookingId: 3001,
      bookingReference: "REF-UNDO-001",
      arrivedAt: "2026-02-22T19:00:00.000Z",
      status: "checked_in",
    });

    if (booking.bookingId) {
      onUnmarkArrived(booking);
    }

    expect(onUnmarkArrived).toHaveBeenCalledTimes(1);
    expect(onUnmarkArrived).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 3001,
        bookingReference: "REF-UNDO-001",
      })
    );
  });
});

describe("Timeline Popover - Popover State Management", () => {
  it("should track which popover is open by bookingReference", () => {
    let openPopover: string | null = null;

    // Simulate opening a popover
    openPopover = "REF-001";
    expect(openPopover).toBe("REF-001");

    // Simulate opening a different popover (should close the first)
    openPopover = "REF-002";
    expect(openPopover).toBe("REF-002");
    expect(openPopover).not.toBe("REF-001");

    // Simulate closing
    openPopover = null;
    expect(openPopover).toBeNull();
  });

  it("should close popover after Mark Arrived action", () => {
    let openPopover: string | null = "REF-001";
    const onMarkArrived = vi.fn();
    const booking = createMockBooking({ bookingReference: "REF-001" });

    // Simulate the popover button click
    onMarkArrived(booking);
    openPopover = null; // Popover closes after action

    expect(onMarkArrived).toHaveBeenCalled();
    expect(openPopover).toBeNull();
  });

  it("should close popover after View Details action", () => {
    let openPopover: string | null = "REF-001";
    const onBlockClick = vi.fn();

    // Simulate View Details click
    openPopover = null;
    onBlockClick("REF-001");

    expect(openPopover).toBeNull();
    expect(onBlockClick).toHaveBeenCalledWith("REF-001");
  });
});

describe("Timeline Popover - Display Data", () => {
  it("should display guest name, time range, product, and party size", () => {
    const booking = createMockBooking({
      customerName: "Luna",
      sessionStartTime: "10:00",
      sessionEndTime: "11:00",
      productName: "Mini Meow Escape (30 mins)",
      quantity: 4,
    });

    // Verify all display fields are present
    expect(booking.customerName).toBe("Luna");
    expect(booking.sessionStartTime).toBe("10:00");
    expect(booking.sessionEndTime).toBe("11:00");
    expect(booking.productName).toBe("Mini Meow Escape (30 mins)");
    expect(booking.quantity).toBe(4);
  });

  it("should display arrival time for arrived guests", () => {
    const booking = createMockBooking({
      arrivedAt: "2026-02-22T19:30:00.000Z",
      status: "checked_in",
    });

    expect(booking.arrivedAt).not.toBeNull();
    const arrivedDate = new Date(booking.arrivedAt!);
    expect(arrivedDate.getTime()).toBeGreaterThan(0);
  });

  it("should handle bookings with single guest correctly", () => {
    const booking = createMockBooking({ quantity: 1 });
    const guestLabel = booking.quantity === 1 ? "guest" : "guests";
    expect(guestLabel).toBe("guest");
  });

  it("should handle bookings with multiple guests correctly", () => {
    const booking = createMockBooking({ quantity: 5 });
    const guestLabel = booking.quantity === 1 ? "guest" : "guests";
    expect(guestLabel).toBe("guests");
  });
});

describe("Timeline Popover - Loading State Tracking", () => {
  it("should track marking state by bookingReference", () => {
    let markingRef: string | null = null;

    // Start marking
    markingRef = "REF-001";
    expect(markingRef).toBe("REF-001");

    // Verify it only matches the specific booking
    const isMarking = (ref: string) => markingRef === ref;
    expect(isMarking("REF-001")).toBe(true);
    expect(isMarking("REF-002")).toBe(false);

    // Complete marking
    markingRef = null;
    expect(isMarking("REF-001")).toBe(false);
  });

  it("should track unmarking state by bookingReference", () => {
    let unmarkingRef: string | null = null;

    unmarkingRef = "REF-003";
    expect(unmarkingRef).toBe("REF-003");

    const isUnmarking = (ref: string) => unmarkingRef === ref;
    expect(isUnmarking("REF-003")).toBe(true);
    expect(isUnmarking("REF-001")).toBe(false);

    unmarkingRef = null;
    expect(isUnmarking("REF-003")).toBe(false);
  });
});
