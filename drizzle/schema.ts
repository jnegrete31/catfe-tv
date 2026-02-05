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
  "THANK_YOU",
  "LIVESTREAM",
  "HAPPY_TAILS",
  "SNAP_PURR_GALLERY",
  "HAPPY_TAILS_QR",
  "SNAP_PURR_QR",
  "POLL",
  "POLL_QR",
  "CHECK_IN",
  "CUSTOM"
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
  livestreamUrl: varchar("livestreamUrl", { length: 1024 }), // HLS stream URL for livestream screen type
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
  logoUrl: varchar("logoUrl", { length: 1024 }), // Custom logo image URL for TV display
  livestreamUrl: varchar("livestreamUrl", { length: 1024 }), // HLS stream URL for live camera feed
  githubRepo: varchar("githubRepo", { length: 255 }), // e.g., "username/repo"
  githubBranch: varchar("githubBranch", { length: 64 }).default("main"),
  refreshIntervalSeconds: int("refreshIntervalSeconds").notNull().default(60),
  wixAutoSyncEnabled: boolean("wixAutoSyncEnabled").notNull().default(true), // Auto-sync Wix bookings
  wixLastSyncAt: timestamp("wixLastSyncAt"), // Last Wix sync timestamp
  waiverUrl: varchar("waiverUrl", { length: 1024 }), // URL for guest waiver form (displayed as QR on TV)
  wifiName: varchar("wifiName", { length: 255 }), // WiFi network name for guests
  wifiPassword: varchar("wifiPassword", { length: 255 }), // WiFi password for guests
  houseRules: json("houseRules").$type<string[]>(), // Array of house rules for check-in screen
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

/**
 * Session duration options for guest check-in
 */
export const sessionDurationEnum = mysqlEnum("sessionDuration", ["15", "30", "60"]);

/**
 * Session status options
 */
export const sessionStatusEnum = mysqlEnum("sessionStatus", ["active", "completed", "extended"]);

/**
 * Guest sessions table - tracks guest visits with time-based sessions
 */
export const guestSessions = mysqlTable("guestSessions", {
  id: int("id").autoincrement().primaryKey(),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestCount: int("guestCount").notNull().default(1), // Number of guests in the party
  duration: sessionDurationEnum.notNull(), // 15, 30, or 60 minutes
  status: sessionStatusEnum.notNull().default("active"),
  checkInAt: timestamp("checkInAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  checkedOutAt: timestamp("checkedOutAt"),
  notes: text("notes"),
  reminderShown: boolean("reminderShown").notNull().default(false), // Track if 5-min reminder was shown
  wixBookingId: varchar("wixBookingId", { length: 64 }), // Wix booking ID for synced sessions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuestSession = typeof guestSessions.$inferSelect;
export type InsertGuestSession = typeof guestSessions.$inferInsert;

/**
 * Photo submission types
 */
export const photoTypeEnum = mysqlEnum("photoType", ["happy_tails", "snap_purr"]);

/**
 * Photo submission status
 */
export const photoStatusEnum = mysqlEnum("photoStatus", ["pending", "approved", "rejected"]);

/**
 * Photo submissions table - customer-uploaded photos for TV display
 */
export const photoSubmissions = mysqlTable("photoSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  type: photoTypeEnum.notNull(), // happy_tails or snap_purr
  status: photoStatusEnum.notNull().default("pending"),
  // Submitter info
  submitterName: varchar("submitterName", { length: 255 }).notNull(),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  // Photo details
  photoUrl: varchar("photoUrl", { length: 1024 }).notNull(), // S3 URL
  caption: varchar("caption", { length: 500 }),
  // For Happy Tails - adopted cat info
  catName: varchar("catName", { length: 255 }),
  adoptionDate: timestamp("adoptionDate"),
  // Moderation
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy"), // User ID of admin who reviewed
  rejectionReason: varchar("rejectionReason", { length: 500 }),
  // Display settings
  displayOrder: int("displayOrder").notNull().default(0),
  showOnTv: boolean("showOnTv").notNull().default(true), // Can hide approved photos from TV
  isFeatured: boolean("isFeatured").notNull().default(false), // Featured photos show more prominently
  backgroundStyle: mysqlEnum("backgroundStyle", ["blur", "gradient"]).default("blur"), // For portrait photos
  borderStyle: mysqlEnum("borderStyle", ["rounded", "polaroid", "film", "none"]).default("rounded"), // Photo frame style
  // Likes count
  likesCount: int("likesCount").notNull().default(0), // Total number of likes
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PhotoSubmission = typeof photoSubmissions.$inferSelect;
export type InsertPhotoSubmission = typeof photoSubmissions.$inferInsert;

/**
 * Photo likes table - tracks individual likes to prevent duplicates
 */
export const photoLikes = mysqlTable("photoLikes", {
  id: int("id").autoincrement().primaryKey(),
  photoId: int("photoId").notNull(), // References photoSubmissions.id
  // Anonymous voting - track by device fingerprint to prevent duplicate likes
  voterFingerprint: varchar("voterFingerprint", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PhotoLike = typeof photoLikes.$inferSelect;
export type InsertPhotoLike = typeof photoLikes.$inferInsert;

/**
 * Caption type for suggested captions
 */
export const captionTypeEnum = mysqlEnum("captionType", ["happy_tails", "snap_purr"]);

/**
 * Suggested captions table - admin-managed caption suggestions for photo uploads
 */
export const suggestedCaptions = mysqlTable("suggestedCaptions", {
  id: int("id").autoincrement().primaryKey(),
  type: captionTypeEnum.notNull(), // happy_tails or snap_purr
  text: varchar("text", { length: 100 }).notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SuggestedCaption = typeof suggestedCaptions.$inferSelect;
export type InsertSuggestedCaption = typeof suggestedCaptions.$inferInsert;

/**
 * Poll status enum
 */
export const pollStatusEnum = mysqlEnum("pollStatus", ["draft", "active", "ended"]);

/**
 * Poll type - template polls use dynamic cat selection, custom polls have fixed options
 */
export const pollTypeEnum = mysqlEnum("pollType", ["template", "custom"]);

/**
 * Polls table - fun polls about adoptable cats
 */
export const polls = mysqlTable("polls", {
  id: int("id").autoincrement().primaryKey(),
  question: varchar("question", { length: 255 }).notNull(), // e.g., "Who has the fluffiest tail?"
  pollType: pollTypeEnum.notNull().default("custom"), // template = dynamic cats, custom = fixed options
  status: pollStatusEnum.notNull().default("draft"),
  // Options stored as JSON array of { id, text, catId?, imageUrl? }
  // For template polls, this is empty and cats are selected dynamically
  options: text("options").notNull(), // JSON string
  // How many cats to show (for template polls)
  catCount: int("catCount").notNull().default(2), // 2-4 cats per poll
  // Scheduling
  isRecurring: boolean("isRecurring").notNull().default(false), // If true, shows in rotation
  sortOrder: int("sortOrder").notNull().default(0),
  // Stats
  totalVotes: int("totalVotes").notNull().default(0),
  // Track last shown time for shuffling
  lastShownAt: timestamp("lastShownAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Poll = typeof polls.$inferSelect;
export type InsertPoll = typeof polls.$inferInsert;

/**
 * Poll votes table - tracks individual votes
 */
export const pollVotes = mysqlTable("pollVotes", {
  id: int("id").autoincrement().primaryKey(),
  pollId: int("pollId").notNull(),
  optionId: varchar("optionId", { length: 50 }).notNull(), // References option id in poll.options JSON
  // Anonymous voting - track by session/device fingerprint to prevent duplicate votes
  voterFingerprint: varchar("voterFingerprint", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = typeof pollVotes.$inferInsert;

/**
 * Playlists table - named collections of screens for different occasions
 * e.g., "Lounge", "Events", "Volunteer Orientation"
 */
export const playlists = mysqlTable("playlists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  isActive: boolean("isActive").notNull().default(false), // Only one playlist can be active at a time
  isDefault: boolean("isDefault").notNull().default(false), // Default playlist for fallback
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

/**
 * Junction table linking screens to playlists
 * A screen can belong to multiple playlists
 */
export const playlistScreens = mysqlTable("playlistScreens", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlistId").notNull(),
  screenId: int("screenId").notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlaylistScreen = typeof playlistScreens.$inferSelect;
export type InsertPlaylistScreen = typeof playlistScreens.$inferInsert;


/**
 * Slide template element types
 */
export const templateElementTypeEnum = mysqlEnum("templateElementType", [
  "title", "subtitle", "body", "photo", "qrCode", "logo", "clock", "weather", "counter"
]);

/**
 * Slide templates table - stores visual customizations for each screen type
 * Allows drag-and-drop positioning, resizing, and styling of elements
 */
export const slideTemplates = mysqlTable("slideTemplates", {
  id: int("id").autoincrement().primaryKey(),
  screenType: screenTypeEnum.notNull().unique(), // One template per screen type
  name: varchar("name", { length: 255 }).notNull(),
  // Canvas settings
  backgroundColor: varchar("backgroundColor", { length: 32 }).default("#1a1a2e"),
  backgroundGradient: varchar("backgroundGradient", { length: 255 }), // CSS gradient string
  backgroundImageUrl: varchar("backgroundImageUrl", { length: 1024 }),
  // Element positions and styles stored as JSON
  // Each element: { type, x, y, width, height, fontSize, fontWeight, fontFamily, color, opacity, rotation, zIndex }
  elements: text("elements").notNull(), // JSON array of element configurations
  // Global settings
  defaultFontFamily: varchar("defaultFontFamily", { length: 64 }).default("Inter"),
  defaultFontColor: varchar("defaultFontColor", { length: 32 }).default("#ffffff"),
  showAnimations: boolean("showAnimations").notNull().default(true),
  animationStyle: varchar("animationStyle", { length: 32 }).default("fade"), // fade, slide, zoom
  // Widget overrides - per-slide customization of overlay widgets (logo, weather, clock, waiver QR)
  widgetOverrides: text("widgetOverrides"), // JSON object of WidgetOverrides type
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SlideTemplate = typeof slideTemplates.$inferSelect;
export type InsertSlideTemplate = typeof slideTemplates.$inferInsert;

/**
 * Type definition for template elements (stored in elements JSON field)
 */
export type TemplateElement = {
  id: string; // Unique ID for the element
  type: "title" | "subtitle" | "body" | "photo" | "qrCode" | "logo" | "clock" | "weather" | "counter";
  // Position (percentage of canvas, 0-100)
  x: number;
  y: number;
  // Size (percentage of canvas, 0-100)
  width: number;
  height: number;
  // Typography
  fontSize?: number; // in pixels
  fontWeight?: string; // normal, bold, 100-900
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  // Styling
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number; // 0-1
  rotation?: number; // degrees
  // Layout
  zIndex?: number;
  padding?: number;
  // Photo-specific
  objectFit?: "cover" | "contain" | "fill";
  // Visibility
  visible?: boolean;
};

/**
 * Widget override settings for per-slide customization of overlay widgets
 */
export type WidgetOverrides = {
  logo?: {
    visible?: boolean;
    x?: number; // percentage 0-100
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
  };
  weather?: {
    visible?: boolean;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    opacity?: number;
  };
  clock?: {
    visible?: boolean;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    opacity?: number;
    showDate?: boolean;
  };
  waiverQr?: {
    visible?: boolean;
    x?: number;
    y?: number;
    size?: number;
    opacity?: number;
    label?: string;
  };
};
