/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Screen types enum
export const SCREEN_TYPES = [
  "SNAP_AND_PURR",
  "EVENT",
  "TODAY_AT_CATFE",
  "MEMBERSHIP",
  "REMINDER",
  "ADOPTION",
  "ADOPTION_SHOWCASE",
  "ADOPTION_COUNTER",
  "THANK_YOU",
] as const;

export type ScreenType = typeof SCREEN_TYPES[number];

// Screen type display names and colors
export const SCREEN_TYPE_CONFIG: Record<ScreenType, { label: string; color: string; bgColor: string }> = {
  SNAP_AND_PURR: { label: "Snap & Purr", color: "#ec4899", bgColor: "#fce7f3" },
  EVENT: { label: "Event", color: "#8b5cf6", bgColor: "#ede9fe" },
  TODAY_AT_CATFE: { label: "Today at Catfé", color: "#f59e0b", bgColor: "#fef3c7" },
  MEMBERSHIP: { label: "Membership", color: "#10b981", bgColor: "#d1fae5" },
  REMINDER: { label: "Reminder", color: "#3b82f6", bgColor: "#dbeafe" },
  ADOPTION: { label: "Adoption", color: "#ef4444", bgColor: "#fee2e2" },
  ADOPTION_SHOWCASE: { label: "Adoption Showcase", color: "#f97316", bgColor: "#ffedd5" },
  ADOPTION_COUNTER: { label: "Adoption Counter", color: "#16a34a", bgColor: "#dcfce7" },
  THANK_YOU: { label: "Thank You", color: "#6366f1", bgColor: "#e0e7ff" },
};

// Days of week
export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun", fullLabel: "Sunday" },
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
  { value: 6, label: "Sat", fullLabel: "Saturday" },
] as const;

// Character limits for TV readability
export const TEXT_LIMITS = {
  title: 50,
  subtitle: 80,
  body: 200,
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  locationName: "Catfé",
  defaultDurationSeconds: 10,
  fallbackMode: "LOOP_DEFAULT" as const,
  snapAndPurrFrequency: 5,
  refreshIntervalSeconds: 60,
  githubBranch: "main",
};
