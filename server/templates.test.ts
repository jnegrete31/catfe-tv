import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { slideTemplates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Slide Templates", () => {
  const testScreenType = "EVENT"; // Use a valid screen type from the enum
  let db: Awaited<ReturnType<typeof getDb>>;
  
  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
    // Clean up any existing test data
    await db.delete(slideTemplates).where(eq(slideTemplates.screenType, testScreenType));
  });

  afterAll(async () => {
    // Clean up test data
    if (db) {
      await db.delete(slideTemplates).where(eq(slideTemplates.screenType, testScreenType));
    }
  });

  it("should create a new template", async () => {
    const elements = JSON.stringify([
      { id: "1", type: "title", x: 10, y: 10, width: 80, height: 10, fontSize: 48 },
      { id: "2", type: "photo", x: 20, y: 25, width: 60, height: 50 },
    ]);

    const result = await db.insert(slideTemplates).values({
      screenType: testScreenType,
      name: "Test Template",
      elements,
      backgroundColor: "#1a1a2e",
      defaultFontFamily: "Inter",
      defaultFontColor: "#ffffff",
      showAnimations: true,
      animationStyle: "fade",
    });

    expect(result).toBeDefined();
  });

  it("should retrieve template by screen type", async () => {
    const [template] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenType, testScreenType))
      .limit(1);

    expect(template).toBeDefined();
    expect(template?.screenType).toBe(testScreenType);
    expect(template?.backgroundColor).toBe("#1a1a2e");
    
    const elements = JSON.parse(template?.elements || "[]");
    expect(elements).toHaveLength(2);
    expect(elements[0].type).toBe("title");
    expect(elements[1].type).toBe("photo");
  });

  it("should update an existing template", async () => {
    const newElements = JSON.stringify([
      { id: "1", type: "title", x: 5, y: 5, width: 90, height: 15, fontSize: 64 },
    ]);

    await db
      .update(slideTemplates)
      .set({ elements: newElements, backgroundColor: "#2a2a3e" })
      .where(eq(slideTemplates.screenType, testScreenType));

    const [updated] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenType, testScreenType))
      .limit(1);

    expect(updated?.backgroundColor).toBe("#2a2a3e");
    
    const elements = JSON.parse(updated?.elements || "[]");
    expect(elements).toHaveLength(1);
    expect(elements[0].fontSize).toBe(64);
  });

  it("should return undefined for non-existent template", async () => {
    const [template] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenType, "NON_EXISTENT_TYPE"))
      .limit(1);

    expect(template).toBeUndefined();
  });

  it("should delete a template", async () => {
    await db.delete(slideTemplates).where(eq(slideTemplates.screenType, testScreenType));

    const [deleted] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenType, testScreenType))
      .limit(1);

    expect(deleted).toBeUndefined();
  });
});

describe("Custom Slide Independence (screenId)", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
  });

  afterAll(async () => {
    // Clean up test data for CUSTOM type with test screenIds
    if (db) {
      await db.delete(slideTemplates).where(eq(slideTemplates.screenType, "CUSTOM"));
    }
  });

  it("should allow multiple CUSTOM templates with different screenIds", async () => {
    // Insert first custom slide template
    await db.insert(slideTemplates).values({
      screenType: "CUSTOM",
      screenId: 9001,
      name: "Custom Slide Alpha",
      elements: JSON.stringify([{ id: "a1", type: "title", x: 10, y: 10, width: 80, height: 20 }]),
      backgroundColor: "#ff0000",
    });

    // Insert second custom slide template with different screenId
    await db.insert(slideTemplates).values({
      screenType: "CUSTOM",
      screenId: 9002,
      name: "Custom Slide Beta",
      elements: JSON.stringify([{ id: "b1", type: "subtitle", x: 20, y: 20, width: 60, height: 10 }]),
      backgroundColor: "#0000ff",
    });

    // Both should exist
    const [templateA] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenId, 9001))
      .limit(1);

    const [templateB] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenId, 9002))
      .limit(1);

    expect(templateA).toBeDefined();
    expect(templateB).toBeDefined();
    expect(templateA?.name).toBe("Custom Slide Alpha");
    expect(templateB?.name).toBe("Custom Slide Beta");
    expect(templateA?.backgroundColor).toBe("#ff0000");
    expect(templateB?.backgroundColor).toBe("#0000ff");
  });

  it("should retrieve the correct template by screenId", async () => {
    // Query for screenId 9001 should return Alpha, not Beta
    const [result] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenId, 9001))
      .limit(1);

    expect(result).toBeDefined();
    expect(result?.name).toBe("Custom Slide Alpha");
    expect(result?.screenId).toBe(9001);
  });

  it("should update only the targeted custom slide template", async () => {
    // Update only screenId 9002
    await db
      .update(slideTemplates)
      .set({ name: "Custom Slide Beta Updated", backgroundColor: "#00ff00" })
      .where(eq(slideTemplates.screenId, 9002));

    // Verify 9001 is unchanged
    const [alpha] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenId, 9001))
      .limit(1);

    const [beta] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenId, 9002))
      .limit(1);

    expect(alpha?.name).toBe("Custom Slide Alpha");
    expect(alpha?.backgroundColor).toBe("#ff0000");
    expect(beta?.name).toBe("Custom Slide Beta Updated");
    expect(beta?.backgroundColor).toBe("#00ff00");
  });

  it("should delete only the targeted custom slide template", async () => {
    // Delete only screenId 9001
    await db.delete(slideTemplates).where(eq(slideTemplates.screenId, 9001));

    // 9001 should be gone
    const [deleted] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenId, 9001))
      .limit(1);

    // 9002 should still exist
    const [remaining] = await db
      .select()
      .from(slideTemplates)
      .where(eq(slideTemplates.screenId, 9002))
      .limit(1);

    expect(deleted).toBeUndefined();
    expect(remaining).toBeDefined();
    expect(remaining?.name).toBe("Custom Slide Beta Updated");
  });
});
