import { eq, and, gte, lte, or, isNull, asc, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  screens, InsertScreen, Screen,
  settings, InsertSettings, Settings,
  timeSlots, InsertTimeSlot, TimeSlot,
  screenTimeSlots, InsertScreenTimeSlot,
  screenViews, InsertScreenView
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SCREEN QUERIES ============

export async function getAllScreens() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(screens).orderBy(asc(screens.sortOrder), desc(screens.priority));
}

export async function getActiveScreens() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(screens)
    .where(eq(screens.isActive, true))
    .orderBy(asc(screens.sortOrder), desc(screens.priority));
}

export async function getScreenById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(screens).where(eq(screens.id, id)).limit(1);
  return result[0] || null;
}

export async function createScreen(data: InsertScreen) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(screens).values(data);
  return { id: result[0].insertId };
}

export async function updateScreen(id: number, data: Partial<InsertScreen>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(screens).set(data).where(eq(screens.id, id));
  return { success: true };
}

export async function deleteScreen(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if screen is protected
  const screen = await getScreenById(id);
  if (screen?.isProtected) {
    throw new Error("Cannot delete protected screen");
  }
  
  await db.delete(screens).where(eq(screens.id, id));
  return { success: true };
}

export async function updateScreenOrder(screenOrders: { id: number; sortOrder: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  for (const { id, sortOrder } of screenOrders) {
    await db.update(screens).set({ sortOrder }).where(eq(screens.id, id));
  }
  return { success: true };
}

// ============ SETTINGS QUERIES ============

export async function getSettings() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(settings).limit(1);
  return result[0] || null;
}

export async function upsertSettings(data: Partial<InsertSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSettings();
  
  if (existing) {
    await db.update(settings).set(data).where(eq(settings.id, existing.id));
    return { id: existing.id };
  } else {
    const result = await db.insert(settings).values(data as InsertSettings);
    return { id: result[0].insertId };
  }
}

// ============ TIME SLOT QUERIES ============

export async function getAllTimeSlots() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(timeSlots).orderBy(asc(timeSlots.timeStart));
}

export async function getActiveTimeSlots() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(timeSlots)
    .where(eq(timeSlots.isActive, true))
    .orderBy(asc(timeSlots.timeStart));
}

export async function getTimeSlotById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(timeSlots).where(eq(timeSlots.id, id)).limit(1);
  return result[0] || null;
}

export async function createTimeSlot(data: InsertTimeSlot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(timeSlots).values(data);
  return { id: result[0].insertId };
}

export async function updateTimeSlot(id: number, data: Partial<InsertTimeSlot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(timeSlots).set(data).where(eq(timeSlots.id, id));
  return { success: true };
}

export async function deleteTimeSlot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Also delete associated screen-timeslot mappings
  await db.delete(screenTimeSlots).where(eq(screenTimeSlots.timeSlotId, id));
  await db.delete(timeSlots).where(eq(timeSlots.id, id));
  return { success: true };
}

// ============ SCREEN-TIMESLOT QUERIES ============

export async function getScreensForTimeSlot(timeSlotId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const mappings = await db.select().from(screenTimeSlots)
    .where(eq(screenTimeSlots.timeSlotId, timeSlotId))
    .orderBy(asc(screenTimeSlots.sortOrder));
  
  const screenIds = mappings.map(m => m.screenId);
  if (screenIds.length === 0) return [];
  
  const allScreens = await db.select().from(screens)
    .where(eq(screens.isActive, true));
  
  // Filter and sort by mapping order
  return screenIds
    .map(id => allScreens.find(s => s.id === id))
    .filter((s): s is Screen => s !== undefined);
}

export async function setScreensForTimeSlot(timeSlotId: number, screenIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete existing mappings
  await db.delete(screenTimeSlots).where(eq(screenTimeSlots.timeSlotId, timeSlotId));
  
  // Insert new mappings
  if (screenIds.length > 0) {
    const mappings = screenIds.map((screenId, index) => ({
      screenId,
      timeSlotId,
      sortOrder: index,
    }));
    await db.insert(screenTimeSlots).values(mappings);
  }
  
  return { success: true };
}

// ============ ANALYTICS QUERIES ============

export async function logScreenView(screenId: number, sessionId?: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(screenViews).values({ screenId, sessionId });
}

export async function getScreenViewCounts() {
  const db = await getDb();
  if (!db) return [];
  
  // Simple count query - could be optimized with proper aggregation
  const views = await db.select().from(screenViews);
  const counts: Record<number, number> = {};
  
  for (const view of views) {
    counts[view.screenId] = (counts[view.screenId] || 0) + 1;
  }
  
  return Object.entries(counts).map(([screenId, count]) => ({
    screenId: parseInt(screenId),
    count,
  }));
}
