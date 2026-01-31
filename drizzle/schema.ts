import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Screen types for the digital signage system
 */
export const screenTypeEnum = mysqlEnum("screenType", [
  "SNAP_AND_PURR",
  "EVENT", 
  "TODAY_AT_CATFE",
  "MEMBERSHIP",
  "REMINDER",
  "ADOPTION",
  "ADOPTION_SHOWCASE",
  "ADOPTION_COUNTER",
  "THANK_YOU"
]);

/**
 * Screens table - stores all content items for the digital signage
 */
export const screens = mysqlTable("screens", {
  id: int("id").autoincrement().primaryKey(),
  type: screenTypeEnum.notNull().default("EVENT"),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  body: text("body"),
  imagePath: varchar("imagePath", { length: 1024 }), // GitHub path or full raw URL
  imageDisplayMode: varchar("imageDisplayMode", { length: 16 }).default("cover"), // "cover" or "contain"
  qrUrl: varchar("qrUrl", { length: 1024 }),
  // Scheduling fields
  startAt: timestamp("startAt"),
  endAt: timestamp("endAt"),
  daysOfWeek: json("daysOfWeek").$type<number[]>(), // 0-6 (Sunday-Saturday)
  timeStart: varchar("timeStart", { length: 5 }), // HH:MM format
  timeEnd: varchar("timeEnd", { length: 5 }), // HH:MM format
  // Display settings
  priority: int("priority").notNull().default(1), // Higher = shows more often
  durationSeconds: int("durationSeconds").notNull().default(10),
  sortOrder: int("sortOrder").notNull().default(0), // For drag-and-drop ordering
  isActive: boolean("isActive").notNull().default(true),
  isProtected: boolean("isProtected").notNull().default(false), // Prevent deletion of core screens
  isAdopted: boolean("isAdopted").notNull().default(false), // Mark adoption cats as adopted
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Screen = typeof screens.$inferSelect;
export type InsertScreen = typeof screens.$inferInsert;

/**
 * Fallback mode options
 */
export const fallbackModeEnum = mysqlEnum("fallbackMode", ["AMBIENT", "LOOP_DEFAULT"]);

/**
 * Settings table - global configuration for the signage system
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  locationName: varchar("locationName", { length: 255 }).notNull().default("Catfé"),
  defaultDurationSeconds: int("defaultDurationSeconds").notNull().default(10),
  fallbackMode: fallbackModeEnum.notNull().default("LOOP_DEFAULT"),
  brandColors: json("brandColors").$type<{
    primary: string;
    secondary: string;
    background: string;
    text: string;
  }>(),
  snapAndPurrFrequency: int("snapAndPurrFrequency").notNull().default(5), // Show SNAP_AND_PURR every N screens
  totalAdoptionCount: int("totalAdoptionCount").notNull().default(0), // Manual total adoption count for display
  githubRepo: varchar("githubRepo", { length: 255 }), // e.g., "username/repo"
  githubBranch: varchar("githubBranch", { length: 64 }).default("main"),
  refreshIntervalSeconds: int("refreshIntervalSeconds").notNull().default(60),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;

/**
 * Time slots for playlist scheduling
 */
export const timeSlots = mysqlTable("timeSlots", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  timeStart: varchar("timeStart", { length: 5 }).notNull(), // HH:MM format
  timeEnd: varchar("timeEnd", { length: 5 }).notNull(), // HH:MM format
  daysOfWeek: json("daysOfWeek").$type<number[]>().notNull(), // 0-6
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = typeof timeSlots.$inferInsert;

/**
 * Junction table for screens assigned to time slots
 */
export const screenTimeSlots = mysqlTable("screenTimeSlots", {
  id: int("id").autoincrement().primaryKey(),
  screenId: int("screenId").notNull(),
  timeSlotId: int("timeSlotId").notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScreenTimeSlot = typeof screenTimeSlots.$inferSelect;
export type InsertScreenTimeSlot = typeof screenTimeSlots.$inferInsert;

/**
 * Analytics table for tracking screen views (optional)
 */
export const screenViews = mysqlTable("screenViews", {
  id: int("id").autoincrement().primaryKey(),
  screenId: int("screenId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  sessionId: varchar("sessionId", { length: 64 }),
});

export type ScreenView = typeof screenViews.$inferSelect;
export type InsertScreenView = typeof screenViews.$inferInsert;
