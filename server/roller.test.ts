import { describe, it, expect } from "vitest";
import { testConnection, getProductAvailability } from "./roller";

describe("Roller API Integration", () => {
  it("should authenticate and fetch product availability", async () => {
    const today = new Date().toISOString().split("T")[0];
    const availability = await getProductAvailability(today);
    console.log("Products found:", availability.length);
    expect(availability).toBeDefined();
    expect(Array.isArray(availability)).toBe(true);
    expect(availability.length).toBeGreaterThan(0);
    // Verify we get Catfé session products (type: sessionpass)
    const sessionProducts = availability.filter((p: any) => p.type === "sessionpass");
    console.log("Session products:", sessionProducts.map((p: any) => p.name));
    expect(sessionProducts.length).toBeGreaterThan(0);
  }, 15000);

  it("should return products with expected fields", async () => {
    const today = new Date().toISOString().split("T")[0];
    const availability = await getProductAvailability(today);
    const sessionProducts = availability.filter((p: any) => p.type === "sessionpass");
    // Each session product should have basic fields
    for (const product of sessionProducts) {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.type).toBe("sessionpass");
    }
  }, 15000);

  it("should test connection successfully", async () => {
    const result = await testConnection();
    console.log("Connection result:", result);
    expect(result.success).toBe(true);
    expect(result.productCount).toBeGreaterThan(0);
  }, 15000);
});
