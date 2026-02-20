import { eq, and, gte, lte, gt, or, isNull, asc, desc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  screens, InsertScreen, Screen,
  settings, InsertSettings, Settings,
  timeSlots, InsertTimeSlot, TimeSlot,
  screenTimeSlots, InsertScreenTimeSlot,
  screenViews, InsertScreenView,
  guestSessions, InsertGuestSession, GuestSession,
  photoSubmissions, InsertPhotoSubmission, PhotoSubmission,
  photoLikes, InsertPhotoLike, PhotoLike,
  suggestedCaptions, InsertSuggestedCaption, SuggestedCaption,
  polls, InsertPoll, Poll,
  pollVotes, InsertPollVote, PollVote,
  playlists, InsertPlaylist, Playlist,
  playlistScreens, InsertPlaylistScreen, PlaylistScreen,
  slideTemplates, InsertSlideTemplate, SlideTemplate, TemplateElement,
  cats, InsertCat, Cat
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

export async function getScreensByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(screens).where(eq(screens.type, type as any)).orderBy(asc(screens.sortOrder), desc(screens.createdAt));
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
  
  // Include both "active" and "extended" sessions
  return db.select().from(guestSessions)
    .where(
      or(
        eq(guestSessions.status, "active"),
        eq(guestSessions.status, "extended")
      )
    )
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

export async function getRecentlyCheckedIn() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);
  
  // Get sessions checked in within the last 60 seconds (wider window for tvOS polling)
  return db.select().from(guestSessions)
    .where(
      and(
        or(
          eq(guestSessions.status, "active"),
          eq(guestSessions.status, "extended")
        ),
        gte(guestSessions.checkInAt, sixtySecondsAgo)
      )
    )
    .orderBy(desc(guestSessions.checkInAt));
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

export async function togglePhotoFeatured(id: number, isFeatured: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(photoSubmissions).set({ isFeatured }).where(eq(photoSubmissions.id, id));
  return { success: true };
}

export async function updatePhotoCaption(id: number, caption: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(photoSubmissions).set({ caption }).where(eq(photoSubmissions.id, id));
  return { success: true };
}

export async function getFeaturedPhotos() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(photoSubmissions)
    .where(
      and(
        eq(photoSubmissions.status, "approved"),
        eq(photoSubmissions.showOnTv, true),
        eq(photoSubmissions.isFeatured, true)
      )
    )
    .orderBy(desc(photoSubmissions.createdAt));
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


// ============ SUGGESTED CAPTIONS ============

export async function getSuggestedCaptions(type?: "happy_tails" | "snap_purr") {
  const db = await getDb();
  if (!db) return [];
  
  if (type) {
    return db.select().from(suggestedCaptions)
      .where(and(eq(suggestedCaptions.type, type), eq(suggestedCaptions.isActive, true)))
      .orderBy(asc(suggestedCaptions.sortOrder));
  }
  
  return db.select().from(suggestedCaptions)
    .orderBy(asc(suggestedCaptions.type), asc(suggestedCaptions.sortOrder));
}

export async function getAllSuggestedCaptions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(suggestedCaptions)
    .orderBy(asc(suggestedCaptions.type), asc(suggestedCaptions.sortOrder));
}

export async function createSuggestedCaption(data: InsertSuggestedCaption) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the max sortOrder for this type
  const existing = await db.select().from(suggestedCaptions)
    .where(eq(suggestedCaptions.type, data.type))
    .orderBy(desc(suggestedCaptions.sortOrder))
    .limit(1);
  
  const maxOrder = existing[0]?.sortOrder ?? -1;
  
  const result = await db.insert(suggestedCaptions).values({
    ...data,
    sortOrder: maxOrder + 1,
  });
  
  return { id: result[0].insertId };
}

export async function updateSuggestedCaption(id: number, data: Partial<InsertSuggestedCaption>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(suggestedCaptions).set(data).where(eq(suggestedCaptions.id, id));
  return { success: true };
}

export async function deleteSuggestedCaption(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(suggestedCaptions).where(eq(suggestedCaptions.id, id));
  return { success: true };
}

export async function reorderSuggestedCaptions(type: "happy_tails" | "snap_purr", orderedIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Update sortOrder for each caption
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(suggestedCaptions)
      .set({ sortOrder: i })
      .where(eq(suggestedCaptions.id, orderedIds[i]));
  }
  
  return { success: true };
}

export async function seedDefaultCaptions() {
  const db = await getDb();
  if (!db) return;
  
  // Check if any captions exist
  const existing = await db.select().from(suggestedCaptions).limit(1);
  if (existing.length > 0) return; // Already seeded
  
  // Default captions for Snap & Purr
  const snapPurrCaptions = [
    "Best day ever! 🐱",
    "Made a new friend!",
    "Purrfect moment ✨",
    "Cat cuddles 💕",
    "Living my best life",
  ];
  
  // Default captions for Happy Tails
  const happyTailsCaptions = [
    "Living the dream! 🏠",
    "Forever home found ❤️",
    "Best decision ever!",
    "Happy & loved 🐱",
    "From Catfé with love",
  ];
  
  // Insert Snap & Purr captions
  for (let i = 0; i < snapPurrCaptions.length; i++) {
    await db.insert(suggestedCaptions).values({
      type: "snap_purr",
      text: snapPurrCaptions[i],
      sortOrder: i,
      isActive: true,
    });
  }
  
  // Insert Happy Tails captions
  for (let i = 0; i < happyTailsCaptions.length; i++) {
    await db.insert(suggestedCaptions).values({
      type: "happy_tails",
      text: happyTailsCaptions[i],
      sortOrder: i,
      isActive: true,
    });
  }
  
  console.log("[Database] Seeded default suggested captions");
}


// ============ POLLS ============

export type PollOption = {
  id: string;
  text: string;
  catId?: number;
  imageUrl?: string;
};

export type PollWithVotes = Poll & {
  parsedOptions: (PollOption & { voteCount: number; percentage: number })[];
};

export async function getAllPolls() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(polls).orderBy(desc(polls.createdAt));
}

export async function getActivePolls() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(polls)
    .where(eq(polls.status, "active"))
    .orderBy(asc(polls.sortOrder));
}

export async function getCurrentPoll() {
  const db = await getDb();
  if (!db) return null;
  
  // Get the first active poll in rotation
  const activePolls = await db.select().from(polls)
    .where(eq(polls.status, "active"))
    .orderBy(asc(polls.sortOrder))
    .limit(1);
  
  return activePolls[0] || null;
}

export async function getPollById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(polls).where(eq(polls.id, id)).limit(1);
  return result[0] || null;
}

export async function getPollWithResults(id: number): Promise<PollWithVotes | null> {
  const db = await getDb();
  if (!db) return null;
  
  const poll = await getPollById(id);
  if (!poll) return null;
  
  // Get vote counts for each option
  const votes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, id));
  
  // For template polls, get the cached session cats
  let options: PollOption[] = [];
  
  if (poll.pollType === 'template') {
    // Use the cached session cats if available
    const currentSession = getCurrentSessionId();
    if (cachedPollSession && cachedPollSession.sessionId === currentSession && cachedPollSession.pollId === id) {
      options = cachedPollSession.cats.map(cat => ({
        id: `cat-${cat.id}`,
        text: cat.name,
        imageUrl: cat.imageUrl || undefined,
      }));
    } else {
      // If no cache, fetch fresh cats (this will also cache them)
      const tvPoll = await getPollForTV();
      if (tvPoll && tvPoll.id === id) {
        options = tvPoll.options;
      }
    }
  } else {
    // Handle potentially double-encoded options for custom polls
    try {
      let parsed = poll.options;
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
        while (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
      }
      options = parsed as PollOption[];
    } catch (e) {
      console.error('Failed to parse poll options:', e);
      options = [];
    }
  }
  
  const voteCounts: Record<string, number> = {};
  
  votes.forEach(vote => {
    voteCounts[vote.optionId] = (voteCounts[vote.optionId] || 0) + 1;
  });
  
  const totalVotes = votes.length;
  
  const parsedOptions = options.map(opt => ({
    ...opt,
    voteCount: voteCounts[opt.id] || 0,
    percentage: totalVotes > 0 ? Math.round(((voteCounts[opt.id] || 0) / totalVotes) * 100) : 0,
  }));
  
  return {
    ...poll,
    totalVotes,
    parsedOptions,
  };
}

export async function createPoll(data: { question: string; options: PollOption[]; isRecurring?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get max sortOrder
  const existing = await db.select().from(polls).orderBy(desc(polls.sortOrder)).limit(1);
  const maxOrder = existing[0]?.sortOrder ?? -1;
  
  const result = await db.insert(polls).values({
    question: data.question,
    options: JSON.stringify(data.options),
    isRecurring: data.isRecurring ?? false,
    sortOrder: maxOrder + 1,
    status: "draft",
  });
  
  return { id: result[0].insertId };
}

export async function updatePoll(id: number, data: { question?: string; options?: PollOption[]; status?: "draft" | "active" | "ended"; isRecurring?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Partial<InsertPoll> = {};
  if (data.question) updateData.question = data.question;
  if (data.options) updateData.options = JSON.stringify(data.options);
  if (data.status) updateData.status = data.status;
  if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
  
  await db.update(polls).set(updateData).where(eq(polls.id, id));
  return { success: true };
}

export async function deletePoll(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete votes first
  await db.delete(pollVotes).where(eq(pollVotes.pollId, id));
  // Delete poll
  await db.delete(polls).where(eq(polls.id, id));
  return { success: true };
}

export async function submitPollVote(pollId: number, optionId: string, voterFingerprint: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already voted
  const existingVote = await db.select().from(pollVotes)
    .where(and(
      eq(pollVotes.pollId, pollId),
      eq(pollVotes.voterFingerprint, voterFingerprint)
    ))
    .limit(1);
  
  if (existingVote.length > 0) {
    return { success: false, error: "Already voted", alreadyVoted: true };
  }
  
  // Submit vote
  await db.insert(pollVotes).values({
    pollId,
    optionId,
    voterFingerprint,
  });
  
  // Update total votes count
  await db.update(polls)
    .set({ totalVotes: sql`${polls.totalVotes} + 1` })
    .where(eq(polls.id, pollId));
  
  return { success: true };
}

export async function hasVoted(pollId: number, voterFingerprint: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const existingVote = await db.select().from(pollVotes)
    .where(and(
      eq(pollVotes.pollId, pollId),
      eq(pollVotes.voterFingerprint, voterFingerprint)
    ))
    .limit(1);
  
  return existingVote.length > 0;
}

export async function resetPollVotes(pollId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(pollVotes).where(eq(pollVotes.pollId, pollId));
  await db.update(polls).set({ totalVotes: 0 }).where(eq(polls.id, pollId));
  
  return { success: true };
}


// ============ Template Poll Functions ============

/**
 * Get adoptable cats from active ADOPTION screens
 */
export async function getAdoptableCats() {
  const db = await getDb();
  if (!db) return [];
  
  const adoptionScreens = await db.select()
    .from(screens)
    .where(and(
      eq(screens.type, "ADOPTION"),
      eq(screens.isActive, true),
      eq(screens.isAdopted, false)
    ));
  
  return adoptionScreens.map(screen => ({
    id: screen.id,
    name: screen.title,
    imageUrl: screen.imagePath,
    subtitle: screen.subtitle,
  }));
}

/**
 * Create a template poll (question only, cats selected dynamically)
 */
export async function createTemplatePoll(data: { question: string; catCount?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get max sortOrder
  const existing = await db.select().from(polls).orderBy(desc(polls.sortOrder)).limit(1);
  const maxOrder = existing[0]?.sortOrder ?? -1;
  
  const result = await db.insert(polls).values({
    question: data.question,
    pollType: "template",
    options: "[]", // Empty for template polls
    catCount: data.catCount ?? 2,
    isRecurring: true,
    sortOrder: maxOrder + 1,
    status: "active",
  });
  
  return { id: result[0].insertId };
}

/**
 * Get the next poll to show (shuffled, least recently shown)
 */
// Get the current 15-minute session identifier (changes at x:00, x:15, x:30, x:45)
function getCurrentSessionId(): string {
  const now = new Date();
  const hour = now.getHours();
  const quarter = Math.floor(now.getMinutes() / 15) * 15; // 0, 15, 30, or 45
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${hour}-${quarter}`;
}

// Cache for the current session's poll and cats
let cachedPollSession: {
  sessionId: string;
  pollId: number;
  cats: Array<{ id: number; name: string; imageUrl: string | null }>;
} | null = null;

export async function getNextPollForDisplay(): Promise<{
  poll: Poll;
  cats: Array<{ id: number; name: string; imageUrl: string | null }>;
} | null> {
  const db = await getDb();
  if (!db) return null;
  
  const currentSession = getCurrentSessionId();
  
  // If we have a cached poll for this session, return it
  if (cachedPollSession && cachedPollSession.sessionId === currentSession) {
    const poll = await getPollById(cachedPollSession.pollId);
    if (poll) {
      return {
        poll,
        cats: cachedPollSession.cats,
      };
    }
  }
  
  // Get all active template polls, ordered by last shown (null = never shown = priority)
  const templatePolls = await db.select()
    .from(polls)
    .where(and(
      eq(polls.status, "active"),
      eq(polls.pollType, "template")
    ))
    .orderBy(asc(polls.lastShownAt));
  
  if (templatePolls.length === 0) {
    // Fall back to custom polls if no template polls
    const customPolls = await db.select()
      .from(polls)
      .where(and(
        eq(polls.status, "active"),
        eq(polls.pollType, "custom")
      ))
      .orderBy(asc(polls.lastShownAt))
      .limit(1);
    
    if (customPolls.length === 0) return null;
    
    const poll = customPolls[0];
    // Parse options for custom poll
    let options: PollOption[] = [];
    try {
      let parsed = poll.options;
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
        while (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
      }
      options = parsed as PollOption[];
    } catch (e) {
      options = [];
    }
    
    const cats = options.map(opt => ({
      id: parseInt(opt.id) || 0,
      name: opt.text,
      imageUrl: opt.imageUrl || null,
    }));
    
    // Cache for this session
    cachedPollSession = {
      sessionId: currentSession,
      pollId: poll.id,
      cats,
    };
    
    // Update last shown
    await db.update(polls).set({ lastShownAt: new Date() }).where(eq(polls.id, poll.id));
    
    return { poll, cats };
  }
  
  // Get the least recently shown template poll
  const poll = templatePolls[0];
  
  // Get available adoptable cats
  const allCats = await getAdoptableCats();
  
  if (allCats.length < 4) {
    // Not enough cats for 4 options, use what we have
    console.warn(`[Poll] Only ${allCats.length} adoptable cats available, need 4 for best experience`);
  }
  
  // Always select 4 cats (or all available if less than 4)
  const catCount = 4;
  const shuffledCats = [...allCats].sort(() => Math.random() - 0.5);
  const selectedCats = shuffledCats.slice(0, Math.min(catCount, allCats.length));
  
  // Cache for this session
  cachedPollSession = {
    sessionId: currentSession,
    pollId: poll.id,
    cats: selectedCats.map(cat => ({
      id: cat.id,
      name: cat.name,
      imageUrl: cat.imageUrl,
    })),
  };
  
  // Update last shown time
  await db.update(polls).set({ lastShownAt: new Date() }).where(eq(polls.id, poll.id));
  
  return {
    poll,
    cats: cachedPollSession.cats,
  };
}

/**
 * Seed the default poll questions
 */
export async function seedDefaultPollQuestions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const defaultQuestions = [
    { question: "Who has the fluffiest tail?", catCount: 2 },
    { question: "Who would win in a nap contest?", catCount: 2 },
    { question: "Who gives the best head boops?", catCount: 2 },
    { question: "Who has the cutest toe beans?", catCount: 2 },
    { question: "Who would be the best cuddle buddy?", catCount: 2 },
    { question: "Who has the most adorable meow?", catCount: 2 },
    { question: "Who looks most ready for adoption?", catCount: 3 },
    { question: "Who has the prettiest eyes?", catCount: 2 },
    { question: "Who would make the best lap cat?", catCount: 2 },
    { question: "Who has the most boopable nose?", catCount: 2 },
    { question: "Who looks like they're plotting world domination?", catCount: 2 },
    { question: "Who would be the best office cat?", catCount: 2 },
    { question: "Who has the most majestic whiskers?", catCount: 2 },
    { question: "Who looks the most mischievous?", catCount: 3 },
    { question: "Who would you want to wake up to every morning?", catCount: 2 },
  ];
  
  // Check if we already have template polls
  const existingTemplates = await db.select()
    .from(polls)
    .where(eq(polls.pollType, "template"));
  
  if (existingTemplates.length > 0) {
    return { seeded: 0, message: "Template polls already exist" };
  }
  
  // Insert all default questions
  for (let i = 0; i < defaultQuestions.length; i++) {
    const q = defaultQuestions[i];
    await db.insert(polls).values({
      question: q.question,
      pollType: "template",
      options: "[]",
      catCount: q.catCount,
      isRecurring: true,
      sortOrder: i,
      status: "active",
    });
  }
  
  return { seeded: defaultQuestions.length, message: `Seeded ${defaultQuestions.length} poll questions` };
}

/**
 * Get poll with dynamically selected cats for display
 */
export async function getPollForTV(): Promise<{
  id: number;
  question: string;
  options: Array<{ id: string; text: string; imageUrl?: string }>;
  totalVotes: number;
} | null> {
  const nextPoll = await getNextPollForDisplay();
  if (!nextPoll) return null;
  
  const { poll, cats } = nextPoll;
  
  return {
    id: poll.id,
    question: poll.question,
    options: cats.map(cat => ({
      id: `cat-${cat.id}`,
      text: cat.name,
      imageUrl: cat.imageUrl || undefined,
    })),
    totalVotes: poll.totalVotes,
  };
}


/**
 * Reset votes for the current active poll (called at start of each 30-min session)
 */
export async function resetCurrentPollVotes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the current poll that would be shown on TV
  const currentPoll = await getPollForTV();
  if (!currentPoll) return { success: false, message: "No active poll" };
  
  // Reset votes for this poll
  await db.delete(pollVotes).where(eq(pollVotes.pollId, currentPoll.id));
  await db.update(polls).set({ totalVotes: 0 }).where(eq(polls.id, currentPoll.id));
  
  // Also rotate to the next poll by updating lastShownAt
  await db.update(polls).set({ lastShownAt: new Date() }).where(eq(polls.id, currentPoll.id));
  
  return { success: true, pollId: currentPoll.id };
}


// ============ PLAYLIST QUERIES ============

/**
 * Get all playlists
 */
export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playlists).orderBy(asc(playlists.sortOrder));
}

/**
 * Get the currently active playlist
 */
export async function getActivePlaylist(): Promise<Playlist | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(playlists).where(eq(playlists.isActive, true)).limit(1);
  return result[0] || null;
}

/**
 * Get playlist by ID
 */
export async function getPlaylistById(id: number): Promise<Playlist | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(playlists).where(eq(playlists.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Create a new playlist
 */
export async function createPlaylist(data: {
  name: string;
  description?: string;
  schedulingEnabled?: boolean;
  daysOfWeek?: number[];
  timeStart?: string;
  timeEnd?: string;
  timeSlots?: Array<{ timeStart: string; timeEnd: string }>;
  color?: string;
}): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get max sortOrder
  const existing = await db.select().from(playlists).orderBy(desc(playlists.sortOrder)).limit(1);
  const maxOrder = existing[0]?.sortOrder ?? -1;
  
  const result = await db.insert(playlists).values({
    name: data.name,
    description: data.description || null,
    schedulingEnabled: data.schedulingEnabled || false,
    daysOfWeek: data.daysOfWeek || null,
    timeStart: data.timeStart || null,
    timeEnd: data.timeEnd || null,
    timeSlots: data.timeSlots || null,
    color: data.color || "#C2884E",
    sortOrder: maxOrder + 1,
    isActive: false,
    isDefault: false,
  });
  
  return { id: result[0].insertId };
}

/**
 * Update a playlist
 */
export async function updatePlaylist(id: number, data: {
  name?: string;
  description?: string;
  schedulingEnabled?: boolean;
  daysOfWeek?: number[];
  timeStart?: string;
  timeEnd?: string;
  timeSlots?: Array<{ timeStart: string; timeEnd: string }>;
  color?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const updateData: Partial<InsertPlaylist> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.schedulingEnabled !== undefined) updateData.schedulingEnabled = data.schedulingEnabled;
  if (data.daysOfWeek !== undefined) updateData.daysOfWeek = data.daysOfWeek;
  if (data.timeStart !== undefined) updateData.timeStart = data.timeStart;
  if (data.timeEnd !== undefined) updateData.timeEnd = data.timeEnd;
  if (data.timeSlots !== undefined) updateData.timeSlots = data.timeSlots;
  if (data.color !== undefined) updateData.color = data.color;
  
  if (Object.keys(updateData).length > 0) {
    await db.update(playlists).set(updateData).where(eq(playlists.id, id));
  }
}

/**
 * Delete a playlist
 */
export async function deletePlaylist(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Delete associated screen links first
  await db.delete(playlistScreens).where(eq(playlistScreens.playlistId, id));
  // Delete the playlist
  await db.delete(playlists).where(eq(playlists.id, id));
}

/**
 * Set a playlist as active (deactivates all others)
 */
export async function setActivePlaylist(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Deactivate all playlists
  await db.update(playlists).set({ isActive: false });
  // Activate the selected one
  await db.update(playlists).set({ isActive: true }).where(eq(playlists.id, id));
}

/**
 * Get screens for a playlist
 */
export async function getScreensForPlaylist(playlistId: number): Promise<Screen[]> {
  const db = await getDb();
  if (!db) return [];
  
  const links = await db.select()
    .from(playlistScreens)
    .where(eq(playlistScreens.playlistId, playlistId))
    .orderBy(asc(playlistScreens.sortOrder));
  
  if (links.length === 0) return [];
  
  const screenIds = links.map(l => l.screenId);
  const allScreens = await db.select().from(screens).where(
    or(...screenIds.map(id => eq(screens.id, id)))
  );
  
  // Sort by the playlist order
  const screenMap = new Map(allScreens.map(s => [s.id, s]));
  return links.map(l => screenMap.get(l.screenId)).filter((s): s is Screen => !!s);
}

/**
 * Set screens for a playlist (replaces existing)
 */
export async function setScreensForPlaylist(playlistId: number, screenIds: number[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Delete existing links
  await db.delete(playlistScreens).where(eq(playlistScreens.playlistId, playlistId));
  
  // Insert new links
  if (screenIds.length > 0) {
    const values = screenIds.map((screenId, index) => ({
      playlistId,
      screenId,
      sortOrder: index,
    }));
    await db.insert(playlistScreens).values(values);
  }
}

/**
 * Add a screen to a playlist
 */
export async function addScreenToPlaylist(playlistId: number, screenId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Get max sortOrder for this playlist
  const existing = await db.select()
    .from(playlistScreens)
    .where(eq(playlistScreens.playlistId, playlistId))
    .orderBy(desc(playlistScreens.sortOrder))
    .limit(1);
  const maxOrder = existing[0]?.sortOrder ?? -1;
  
  await db.insert(playlistScreens).values({
    playlistId,
    screenId,
    sortOrder: maxOrder + 1,
  });
}

/**
 * Remove a screen from a playlist
 */
export async function removeScreenFromPlaylist(playlistId: number, screenId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(playlistScreens).where(
    and(
      eq(playlistScreens.playlistId, playlistId),
      eq(playlistScreens.screenId, screenId)
    )
  );
}

/**
 * Check if a playlist matches the current time based on its schedule.
 * Supports both the legacy timeStart/timeEnd fields and the newer timeSlots array.
 */
function isPlaylistScheduledNow(p: Playlist): boolean {
  if (!p.schedulingEnabled) return false;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Check days of week (if specified)
  if (p.daysOfWeek && p.daysOfWeek.length > 0) {
    if (!p.daysOfWeek.includes(currentDay)) return false;
  }

  // Build the list of time windows to check
  const windows: Array<{ timeStart: string; timeEnd: string }> = [];

  // Prefer the timeSlots JSON array (set by the admin UI)
  if (p.timeSlots && Array.isArray(p.timeSlots) && p.timeSlots.length > 0) {
    for (const slot of p.timeSlots) {
      if (slot.timeStart && slot.timeEnd) {
        windows.push(slot);
      }
    }
  }

  // Fallback to legacy single-window fields
  if (windows.length === 0 && p.timeStart && p.timeEnd) {
    windows.push({ timeStart: p.timeStart, timeEnd: p.timeEnd });
  }

  // If no time windows are defined at all, the playlist is "always on" for its scheduled days
  if (windows.length === 0) return true;

  // Match if the current time falls inside ANY window
  return windows.some(w => {
    // Handle overnight windows (e.g., 22:00 – 02:00)
    if (w.timeEnd < w.timeStart) {
      return currentTime >= w.timeStart || currentTime <= w.timeEnd;
    }
    return currentTime >= w.timeStart && currentTime <= w.timeEnd;
  });
}

/**
 * Get active screens for the current playlist.
 *
 * Resolution order:
 *   1. Any playlist with schedulingEnabled that matches the current day + time.
 *      If multiple match, the first one (by sortOrder) wins.
 *   2. The manually-activated playlist (isActive = true).
 *   3. The default playlist (isDefault = true).
 *   4. All active screens (no playlist filtering).
 */
export async function getActiveScreensForCurrentPlaylist(): Promise<Screen[]> {
  const db = await getDb();
  if (!db) return [];

  const allPlaylists = await getAllPlaylists(); // already sorted by sortOrder

  // 1. Find the first scheduled playlist that matches right now
  const scheduledPlaylist = allPlaylists.find(isPlaylistScheduledNow);

  if (scheduledPlaylist) {
    const playlistScreensList = await getScreensForPlaylist(scheduledPlaylist.id);
    const active = playlistScreensList.filter(s => s.isActive);
    if (active.length > 0) return active;
    // If the scheduled playlist has no active screens, fall through
  }

  // 2. Fall back to manually activated playlist
  const activePlaylist = allPlaylists.find(p => p.isActive);

  if (activePlaylist) {
    const playlistScreensList = await getScreensForPlaylist(activePlaylist.id);
    const active = playlistScreensList.filter(s => s.isActive);
    if (active.length > 0) return active;
  }

  // 3. Fall back to default playlist
  const defaultPlaylist = allPlaylists.find(p => p.isDefault);

  if (defaultPlaylist) {
    const playlistScreensList = await getScreensForPlaylist(defaultPlaylist.id);
    const active = playlistScreensList.filter(s => s.isActive);
    if (active.length > 0) return active;
  }

  // 4. Ultimate fallback: return all active screens
  return getActiveScreens();
}

/**
 * Seed default playlists
 */
export async function seedDefaultPlaylists(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(playlists);
  if (existing.length > 0) return; // Already seeded
  
  const defaultPlaylists = [
    { name: "Lounge", description: "Default playlist for the cat lounge", isDefault: true, isActive: true },
    { name: "Events", description: "Special events and promotions" },
    { name: "Volunteer Orientation", description: "Information for new volunteers" },
  ];
  
  for (let i = 0; i < defaultPlaylists.length; i++) {
    await db.insert(playlists).values({
      ...defaultPlaylists[i],
      sortOrder: i,
      isActive: defaultPlaylists[i].isActive || false,
      isDefault: defaultPlaylists[i].isDefault || false,
    });
  }
}


// ============ SLIDE TEMPLATE QUERIES ============

export async function getAllSlideTemplates(): Promise<SlideTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(slideTemplates);
  } catch (error) {
    console.error("[Database] Failed to get slide templates:", error);
    return [];
  }
}

export async function getSlideTemplateByScreenType(screenType: string): Promise<SlideTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    const results = await db.select().from(slideTemplates).where(eq(slideTemplates.screenType, screenType as any));
    return results[0];
  } catch (error) {
    console.error("[Database] Failed to get slide template:", error);
    return undefined;
  }
}

export async function upsertSlideTemplate(template: Partial<InsertSlideTemplate> & { screenType: string }): Promise<SlideTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    // Check if template exists
    const existing = await getSlideTemplateByScreenType(template.screenType);
    
    if (existing) {
      // Update existing template
      await db.update(slideTemplates)
        .set({
          name: template.name,
          backgroundColor: template.backgroundColor,
          backgroundGradient: template.backgroundGradient,
          backgroundImageUrl: template.backgroundImageUrl,
          elements: template.elements,
          defaultFontFamily: template.defaultFontFamily,
          defaultFontColor: template.defaultFontColor,
          showAnimations: template.showAnimations,
          animationStyle: template.animationStyle,
        })
        .where(eq(slideTemplates.screenType, template.screenType as any));
      
      return await getSlideTemplateByScreenType(template.screenType);
    } else {
      // Insert new template
      await db.insert(slideTemplates).values({
        screenType: template.screenType as any,
        name: template.name || `${template.screenType} Template`,
        backgroundColor: template.backgroundColor || "#1a1a2e",
        elements: template.elements || "[]",
        defaultFontFamily: template.defaultFontFamily || "Inter",
        defaultFontColor: template.defaultFontColor || "#ffffff",
        showAnimations: template.showAnimations ?? true,
        animationStyle: template.animationStyle || "fade",
      });
      
      return await getSlideTemplateByScreenType(template.screenType);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert slide template:", error);
    return undefined;
  }
}

export async function deleteSlideTemplate(screenType: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    await db.delete(slideTemplates).where(eq(slideTemplates.screenType, screenType as any));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete slide template:", error);
    return false;
  }
}

// Default template elements for each screen type
export function getDefaultTemplateElements(screenType: string): TemplateElement[] {
  const baseElements: Record<string, TemplateElement[]> = {
    ADOPTION: [
      { id: "photo", type: "photo", x: 5, y: 10, width: 40, height: 70, objectFit: "cover", borderRadius: 8 },
      { id: "title", type: "title", x: 50, y: 15, width: 45, height: 10, fontSize: 72, fontWeight: "bold", textAlign: "left" },
      { id: "subtitle", type: "subtitle", x: 50, y: 28, width: 45, height: 8, fontSize: 36, fontWeight: "normal", textAlign: "left", color: "#a0a0a0" },
      { id: "body", type: "body", x: 50, y: 40, width: 45, height: 30, fontSize: 28, textAlign: "left" },
      { id: "qrCode", type: "qrCode", x: 50, y: 72, width: 20, height: 20 },
    ],
    ADOPTION_SHOWCASE: [
      { id: "title", type: "title", x: 10, y: 5, width: 80, height: 10, fontSize: 64, fontWeight: "bold", textAlign: "center" },
      { id: "subtitle", type: "subtitle", x: 10, y: 15, width: 80, height: 5, fontSize: 28, textAlign: "center", color: "#a0a0a0" },
    ],
    ADOPTION_COUNTER: [
      { id: "counter", type: "counter", x: 25, y: 25, width: 50, height: 40, fontSize: 280, fontWeight: "black", textAlign: "center" },
      { id: "title", type: "title", x: 10, y: 70, width: 80, height: 10, fontSize: 56, textAlign: "center" },
    ],
    EVENT: [
      { id: "photo", type: "photo", x: 0, y: 0, width: 50, height: 100, objectFit: "cover" },
      { id: "title", type: "title", x: 55, y: 20, width: 40, height: 15, fontSize: 64, fontWeight: "bold", textAlign: "left" },
      { id: "subtitle", type: "subtitle", x: 55, y: 38, width: 40, height: 8, fontSize: 36, textAlign: "left", color: "#fbbf24" },
      { id: "body", type: "body", x: 55, y: 50, width: 40, height: 30, fontSize: 28, textAlign: "left" },
      { id: "qrCode", type: "qrCode", x: 75, y: 75, width: 15, height: 15 },
    ],
    CHECK_IN: [
      { id: "title", type: "title", x: 10, y: 10, width: 80, height: 12, fontSize: 72, fontWeight: "bold", textAlign: "center" },
      { id: "subtitle", type: "subtitle", x: 10, y: 25, width: 80, height: 8, fontSize: 32, textAlign: "center" },
      { id: "qrCode", type: "qrCode", x: 5, y: 40, width: 25, height: 35 },
    ],
    THANK_YOU: [
      { id: "title", type: "title", x: 10, y: 30, width: 80, height: 20, fontSize: 96, fontWeight: "light", textAlign: "center" },
      { id: "subtitle", type: "subtitle", x: 10, y: 55, width: 80, height: 10, fontSize: 48, textAlign: "center" },
    ],
  };
  
  return baseElements[screenType] || [
    { id: "title", type: "title", x: 10, y: 10, width: 80, height: 15, fontSize: 64, fontWeight: "bold", textAlign: "center" },
    { id: "subtitle", type: "subtitle", x: 10, y: 30, width: 80, height: 10, fontSize: 36, textAlign: "center" },
    { id: "body", type: "body", x: 10, y: 45, width: 80, height: 40, fontSize: 28, textAlign: "center" },
  ];
}

export async function seedDefaultSlideTemplates(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const screenTypes = [
    "ADOPTION", "ADOPTION_SHOWCASE", "ADOPTION_COUNTER", "EVENT", 
    "CHECK_IN", "THANK_YOU", "TODAY_AT_CATFE", "MEMBERSHIP", "REMINDER",
    "HAPPY_TAILS", "SNAP_PURR_GALLERY", "LIVESTREAM"
  ];
  
  for (const screenType of screenTypes) {
    const existing = await getSlideTemplateByScreenType(screenType);
    if (!existing) {
      await upsertSlideTemplate({
        screenType: screenType as any,
        name: `${screenType.replace(/_/g, " ")} Template`,
        elements: JSON.stringify(getDefaultTemplateElements(screenType)),
      });
    }
  }
}


// ============ PHOTO LIKES ============

/**
 * Like a photo - prevents duplicate likes from same fingerprint
 */
export async function likePhoto(photoId: number, voterFingerprint: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already liked
  const existingLike = await db.select().from(photoLikes)
    .where(and(
      eq(photoLikes.photoId, photoId),
      eq(photoLikes.voterFingerprint, voterFingerprint)
    ))
    .limit(1);
  
  if (existingLike.length > 0) {
    return { success: false, error: "Already liked", alreadyLiked: true };
  }
  
  // Add like
  await db.insert(photoLikes).values({
    photoId,
    voterFingerprint,
  });
  
  // Update likes count on photo
  await db.update(photoSubmissions)
    .set({ likesCount: sql`${photoSubmissions.likesCount} + 1` })
    .where(eq(photoSubmissions.id, photoId));
  
  return { success: true };
}

/**
 * Unlike a photo
 */
export async function unlikePhoto(photoId: number, voterFingerprint: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if liked
  const existingLike = await db.select().from(photoLikes)
    .where(and(
      eq(photoLikes.photoId, photoId),
      eq(photoLikes.voterFingerprint, voterFingerprint)
    ))
    .limit(1);
  
  if (existingLike.length === 0) {
    return { success: false, error: "Not liked" };
  }
  
  // Remove like
  await db.delete(photoLikes).where(and(
    eq(photoLikes.photoId, photoId),
    eq(photoLikes.voterFingerprint, voterFingerprint)
  ));
  
  // Update likes count on photo
  await db.update(photoSubmissions)
    .set({ likesCount: sql`GREATEST(${photoSubmissions.likesCount} - 1, 0)` })
    .where(eq(photoSubmissions.id, photoId));
  
  return { success: true };
}

/**
 * Check if a user has liked a photo
 */
export async function hasLikedPhoto(photoId: number, voterFingerprint: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const existingLike = await db.select().from(photoLikes)
    .where(and(
      eq(photoLikes.photoId, photoId),
      eq(photoLikes.voterFingerprint, voterFingerprint)
    ))
    .limit(1);
  
  return existingLike.length > 0;
}

/**
 * Get photos sorted by likes (most liked first)
 */
export async function getPhotosByLikes(type: "happy_tails" | "snap_purr", limit: number = 20) {
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
    .orderBy(desc(photoSubmissions.likesCount), desc(photoSubmissions.createdAt))
    .limit(limit);
}

/**
 * Get user's liked photo IDs
 */
export async function getUserLikedPhotos(voterFingerprint: string): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  
  const likes = await db.select({ photoId: photoLikes.photoId })
    .from(photoLikes)
    .where(eq(photoLikes.voterFingerprint, voterFingerprint));
  
  return likes.map(l => l.photoId);
}


// ============ CAT QUERIES ============

export async function getAllCats(): Promise<Cat[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cats).orderBy(cats.sortOrder, cats.name);
}

export async function getAvailableCats(): Promise<Cat[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cats)
    .where(inArray(cats.status, ["available", "adopted_in_lounge"]))
    .orderBy(cats.sortOrder, cats.name);
}

export async function getAdoptedCats(): Promise<Cat[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cats)
    .where(inArray(cats.status, ["adopted", "adopted_in_lounge"]))
    .orderBy(desc(cats.adoptedDate));
}

export async function getFeaturedCat(): Promise<Cat | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cats)
    .where(and(eq(cats.isFeatured, true), eq(cats.status, "available")))
    .limit(1);
  return result[0] || null;
}

export async function getCatById(id: number): Promise<Cat | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cats).where(eq(cats.id, id));
  return result[0] || null;
}

export async function createCat(data: InsertCat): Promise<Cat | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(cats).values(data);
  const insertId = result[0].insertId;
  return getCatById(insertId);
}

export async function updateCat(id: number, data: Partial<InsertCat>): Promise<Cat | null> {
  const db = await getDb();
  if (!db) return null;
  await db.update(cats).set(data).where(eq(cats.id, id));
  return getCatById(id);
}

export async function deleteCat(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(cats).where(eq(cats.id, id));
  return true;
}

export async function bulkUpdateCatStatus(ids: number[], status: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.update(cats)
    .set({ status: status as any, updatedAt: new Date() })
    .where(inArray(cats.id, ids));
  return (result as any)[0]?.affectedRows || ids.length;
}

export async function getCatsByStatus(status: string): Promise<Cat[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cats)
    .where(eq(cats.status, status as any))
    .orderBy(cats.sortOrder, cats.name);
}

export async function getRecentlyAdoptedCatsFromTable(days: number = 30): Promise<Cat[]> {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return db.select().from(cats)
    .where(and(
      inArray(cats.status, ["adopted", "adopted_in_lounge"]),
      gte(cats.adoptedDate, cutoff)
    ))
    .orderBy(desc(cats.adoptedDate));
}

export async function getCatCount(): Promise<{ available: number; adopted: number; total: number }> {
  const db = await getDb();
  if (!db) return { available: 0, adopted: 0, total: 0 };
  
  const allCats = await db.select({ status: cats.status }).from(cats);
  const available = allCats.filter(c => c.status === "available").length;
  const adopted = allCats.filter(c => c.status === "adopted" || c.status === "adopted_in_lounge").length;
  return { available, adopted, total: allCats.length };
}

/**
 * Convert a Cat record to a virtual Screen object for TV display.
 * This allows cats from the Cats tab to automatically appear as ADOPTION slides
 * on both the web TV and Apple TV without needing manual screen entries.
 */
export function catToVirtualScreen(cat: Cat): Screen {
  // Build personality tags as body text (tag1 · tag2 · tag3)
  const tags = (cat.personalityTags || []) as string[];
  const bodyText = tags.length > 0 ? tags.join(' · ') : undefined;
  
  // Build subtitle from breed, age, and sex
  const parts: string[] = [];
  if (cat.breed) parts.push(cat.breed);
  if (cat.dob) {
    const ageMs = Date.now() - new Date(cat.dob).getTime();
    const ageYears = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
    const ageMonths = Math.floor(ageMs / (30.44 * 24 * 60 * 60 * 1000));
    if (ageYears >= 1) {
      parts.push(`${ageYears} year${ageYears > 1 ? 's' : ''} old`);
    } else {
      parts.push(`${ageMonths} month${ageMonths !== 1 ? 's' : ''} old`);
    }
  }
  if (cat.sex && cat.sex !== 'unknown') {
    parts.push(cat.sex === 'male' ? 'Male' : 'Female');
  }
  const subtitle = parts.length > 0 ? parts.join(' · ') : undefined;
  
  // Use a large negative ID to avoid collision with real screen IDs
  const virtualId = -(cat.id + 100000);
  
  return {
    id: virtualId,
    type: 'ADOPTION' as any,
    title: cat.name,
    subtitle: subtitle || null,
    body: bodyText || cat.bio || null,
    imagePath: cat.photoUrl || null,
    imageDisplayMode: 'cover',
    qrUrl: null,
    qrLabel: null,
    startAt: null,
    endAt: null,
    daysOfWeek: null,
    timeStart: null,
    timeEnd: null,
    priority: 1,
    durationSeconds: 10,
    sortOrder: cat.sortOrder,
    isActive: true,
    schedulingEnabled: false,
    isProtected: false,
    isAdopted: cat.status === 'adopted' || cat.status === 'adopted_in_lounge',
    livestreamUrl: null,
    eventTime: null,
    eventLocation: null,
    templateOverride: null,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  } as Screen;
}
