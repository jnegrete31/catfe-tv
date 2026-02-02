import { eq, and, gte, lte, or, isNull, asc, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  screens, InsertScreen, Screen,
  settings, InsertSettings, Settings,
  timeSlots, InsertTimeSlot, TimeSlot,
  screenTimeSlots, InsertScreenTimeSlot,
  screenViews, InsertScreenView,
  guestSessions, InsertGuestSession, GuestSession,
  photoSubmissions, InsertPhotoSubmission, PhotoSubmission
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

// ============ GUEST SESSION QUERIES ============

export async function getAllGuestSessions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(guestSessions).orderBy(desc(guestSessions.checkInAt));
}

export async function getActiveGuestSessions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(guestSessions)
    .where(eq(guestSessions.status, "active"))
    .orderBy(asc(guestSessions.expiresAt));
}

export async function getGuestSessionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(guestSessions).where(eq(guestSessions.id, id)).limit(1);
  return result[0] || null;
}

export async function createGuestSession(data: InsertGuestSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(guestSessions).values(data);
  return { id: result[0].insertId };
}

export async function updateGuestSession(id: number, data: Partial<InsertGuestSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(guestSessions).set(data).where(eq(guestSessions.id, id));
  return { success: true };
}

export async function checkOutGuestSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(guestSessions).set({
    status: "completed",
    checkedOutAt: new Date(),
  }).where(eq(guestSessions.id, id));
  return { success: true };
}

export async function extendGuestSession(id: number, additionalMinutes: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const session = await getGuestSessionById(id);
  if (!session) throw new Error("Session not found");
  
  const newExpiry = new Date(session.expiresAt.getTime() + additionalMinutes * 60 * 1000);
  
  await db.update(guestSessions).set({
    expiresAt: newExpiry,
    status: "extended",
    reminderShown: false, // Reset reminder flag when extended
  }).where(eq(guestSessions.id, id));
  
  return { success: true, newExpiresAt: newExpiry };
}

export async function getSessionsNeedingReminder() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  
  // Get ALL active sessions that expire within 5 minutes
  // Show reminder regardless of reminderShown flag so it's always visible on TV
  // Also include "extended" status sessions
  return db.select().from(guestSessions)
    .where(
      and(
        or(
          eq(guestSessions.status, "active"),
          eq(guestSessions.status, "extended")
        ),
        lte(guestSessions.expiresAt, fiveMinutesFromNow),
        gte(guestSessions.expiresAt, now)
      )
    )
    .orderBy(asc(guestSessions.expiresAt));
}

export async function markReminderShown(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(guestSessions).set({ reminderShown: true }).where(eq(guestSessions.id, id));
  return { success: true };
}

export async function getTodayGuestStats() {
  const db = await getDb();
  if (!db) return { totalGuests: 0, activeSessions: 0, completedSessions: 0 };
  
  // Get start of today in local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sessions = await db.select().from(guestSessions)
    .where(gte(guestSessions.checkInAt, today));
  
  const totalGuests = sessions.reduce((sum, s) => sum + s.guestCount, 0);
  const activeSessions = sessions.filter(s => s.status === "active").length;
  const completedSessions = sessions.filter(s => s.status === "completed").length;
  
  return { totalGuests, activeSessions, completedSessions };
}

// ============ PHOTO SUBMISSION QUERIES ============

export async function getAllPhotoSubmissions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(photoSubmissions).orderBy(desc(photoSubmissions.createdAt));
}

export async function getPendingPhotoSubmissions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(photoSubmissions)
    .where(eq(photoSubmissions.status, "pending"))
    .orderBy(asc(photoSubmissions.createdAt));
}

export async function getApprovedPhotosByType(type: "happy_tails" | "snap_purr") {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(photoSubmissions)
    .where(
      and(
        eq(photoSubmissions.type, type),
        eq(photoSubmissions.status, "approved"),
        eq(photoSubmissions.showOnTv, true)
      )
    )
    .orderBy(desc(photoSubmissions.createdAt));
}

export async function getPhotoSubmissionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(photoSubmissions).where(eq(photoSubmissions.id, id)).limit(1);
  return result[0] || null;
}

export async function createPhotoSubmission(data: InsertPhotoSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(photoSubmissions).values(data);
  return { id: result[0].insertId };
}

export async function approvePhotoSubmission(id: number, reviewedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(photoSubmissions).set({
    status: "approved",
    reviewedAt: new Date(),
    reviewedBy,
  }).where(eq(photoSubmissions.id, id));
  return { success: true };
}

export async function rejectPhotoSubmission(id: number, reviewedBy: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(photoSubmissions).set({
    status: "rejected",
    reviewedAt: new Date(),
    reviewedBy,
    rejectionReason: reason || null,
  }).where(eq(photoSubmissions.id, id));
  return { success: true };
}

export async function deletePhotoSubmission(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(photoSubmissions).where(eq(photoSubmissions.id, id));
  return { success: true };
}

export async function togglePhotoVisibility(id: number, showOnTv: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(photoSubmissions).set({ showOnTv }).where(eq(photoSubmissions.id, id));
  return { success: true };
}

export async function getPhotoSubmissionStats() {
  const db = await getDb();
  if (!db) return { pending: 0, approved: 0, rejected: 0, happyTails: 0, snapPurr: 0 };
  
  const all = await db.select().from(photoSubmissions);
  
  return {
    pending: all.filter(p => p.status === "pending").length,
    approved: all.filter(p => p.status === "approved").length,
    rejected: all.filter(p => p.status === "rejected").length,
    happyTails: all.filter(p => p.type === "happy_tails" && p.status === "approved").length,
    snapPurr: all.filter(p => p.type === "snap_purr" && p.status === "approved").length,
  };
}


// ============ SESSION HISTORY & ANALYTICS ============

export type SessionHistoryFilters = {
  startDate?: Date;
  endDate?: Date;
  status?: "active" | "completed" | "extended";
};

export async function getSessionHistory(filters: SessionHistoryFilters = {}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(guestSessions);
  const conditions = [];
  
  if (filters.startDate) {
    conditions.push(gte(guestSessions.checkInAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(guestSessions.checkInAt, filters.endDate));
  }
  if (filters.status) {
    conditions.push(eq(guestSessions.status, filters.status));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return query.orderBy(desc(guestSessions.checkInAt));
}

export type SessionAnalytics = {
  totalSessions: number;
  totalGuests: number;
  averageGroupSize: number;
  sessionsByDuration: { duration: string; count: number }[];
  sessionsByDayOfWeek: { day: number; count: number; guests: number }[];
  sessionsByHour: { hour: number; count: number; guests: number }[];
  peakHours: { hour: number; count: number }[];
  averageSessionLength: number; // in minutes
};

export async function getSessionAnalytics(startDate?: Date, endDate?: Date): Promise<SessionAnalytics> {
  const db = await getDb();
  if (!db) {
    return {
      totalSessions: 0,
      totalGuests: 0,
      averageGroupSize: 0,
      sessionsByDuration: [],
      sessionsByDayOfWeek: [],
      sessionsByHour: [],
      peakHours: [],
      averageSessionLength: 0,
    };
  }
  
  let query = db.select().from(guestSessions);
  const conditions = [];
  
  if (startDate) {
    conditions.push(gte(guestSessions.checkInAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(guestSessions.checkInAt, endDate));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  const sessions = await query;
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalGuests: 0,
      averageGroupSize: 0,
      sessionsByDuration: [],
      sessionsByDayOfWeek: [],
      sessionsByHour: [],
      peakHours: [],
      averageSessionLength: 0,
    };
  }
  
  // Calculate basic stats
  const totalSessions = sessions.length;
  const totalGuests = sessions.reduce((sum, s) => sum + s.guestCount, 0);
  const averageGroupSize = totalGuests / totalSessions;
  
  // Sessions by duration
  const durationCounts: Record<string, number> = {};
  sessions.forEach(s => {
    durationCounts[s.duration] = (durationCounts[s.duration] || 0) + 1;
  });
  const sessionsByDuration = Object.entries(durationCounts).map(([duration, count]) => ({
    duration,
    count,
  }));
  
  // Sessions by day of week (0 = Sunday)
  const dayStats: Record<number, { count: number; guests: number }> = {};
  sessions.forEach(s => {
    const day = new Date(s.checkInAt).getDay();
    if (!dayStats[day]) dayStats[day] = { count: 0, guests: 0 };
    dayStats[day].count++;
    dayStats[day].guests += s.guestCount;
  });
  const sessionsByDayOfWeek = Object.entries(dayStats).map(([day, stats]) => ({
    day: parseInt(day),
    count: stats.count,
    guests: stats.guests,
  }));
  
  // Sessions by hour
  const hourStats: Record<number, { count: number; guests: number }> = {};
  sessions.forEach(s => {
    const hour = new Date(s.checkInAt).getHours();
    if (!hourStats[hour]) hourStats[hour] = { count: 0, guests: 0 };
    hourStats[hour].count++;
    hourStats[hour].guests += s.guestCount;
  });
  const sessionsByHour = Object.entries(hourStats).map(([hour, stats]) => ({
    hour: parseInt(hour),
    count: stats.count,
    guests: stats.guests,
  }));
  
  // Peak hours (top 3)
  const peakHours = [...sessionsByHour]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(h => ({ hour: h.hour, count: h.count }));
  
  // Average session length (based on duration field)
  const durationMinutes: Record<string, number> = { "15": 15, "30": 30, "60": 60 };
  const totalMinutes = sessions.reduce((sum, s) => sum + (durationMinutes[s.duration] || 30), 0);
  const averageSessionLength = totalMinutes / totalSessions;
  
  return {
    totalSessions,
    totalGuests,
    averageGroupSize: Math.round(averageGroupSize * 10) / 10,
    sessionsByDuration,
    sessionsByDayOfWeek,
    sessionsByHour,
    peakHours,
    averageSessionLength: Math.round(averageSessionLength),
  };
}
