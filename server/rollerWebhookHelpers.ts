/**
 * Shared helper functions for Roller webhook/polling processing.
 * Extracted for testability.
 */

// Map Roller product names to session durations
export function getSessionDuration(productName: string): "15" | "30" | "60" | "90" {
  const name = productName.toLowerCase();
  if (name.includes("mini") || name.includes("30")) return "30";
  if (name.includes("study") || name.includes("90")) return "90";
  if (name.includes("full") || name.includes("60")) return "60";
  // Default to 60 minutes
  return "60";
}

// Extract guest name from Roller redemption data
export function getGuestName(data: any): string {
  // Try various fields that Roller might send
  if (data.guestName) return data.guestName;
  if (data.guest?.name) return data.guest.name;
  if (data.guest?.firstName && data.guest?.lastName) {
    return `${data.guest.firstName} ${data.guest.lastName}`;
  }
  if (data.guest?.firstName) return data.guest.firstName;
  if (data.booking?.guestName) return data.booking.guestName;
  if (data.booking?.guest?.name) return data.booking.guest.name;
  if (data.customerName) return data.customerName;
  if (data.customer?.name) return data.customer.name;
  if (data.customer?.firstName) return data.customer.firstName;
  // Fallback
  return "Walk-in Guest";
}

// Extract guest count from Roller data
export function getGuestCount(data: any): number {
  if (data.quantity && typeof data.quantity === "number") return data.quantity;
  if (data.ticketQuantity && typeof data.ticketQuantity === "number") return data.ticketQuantity;
  if (data.booking?.quantity) return data.booking.quantity;
  return 1;
}

// Extract product name from Roller data
export function getProductName(data: any): string {
  if (data.productName) return data.productName;
  if (data.product?.name) return data.product.name;
  if (data.ticketName) return data.ticketName;
  if (data.ticket?.name) return data.ticket.name;
  return "Session";
}

// Product name → friendly display name
export function getProductDisplayName(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes("mini")) return "Mini Meow Escape";
  if (name.includes("study")) return "Study Session";
  if (name.includes("full")) return "Full Purr Experience";
  return productName;
}
