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
