import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getAllScreens: vi.fn(),
  getActiveScreens: vi.fn(),
  getScreenById: vi.fn(),
  createScreen: vi.fn(),
  updateScreen: vi.fn(),
  deleteScreen: vi.fn(),
  updateScreenOrder: vi.fn(),
  logScreenView: vi.fn(),
  getScreenViewCounts: vi.fn(),
  getSettings: vi.fn(),
  upsertSettings: vi.fn(),
  getAllTimeSlots: vi.fn(),
  getActiveTimeSlots: vi.fn(),
  getTimeSlotById: vi.fn(),
  createTimeSlot: vi.fn(),
  updateTimeSlot: vi.fn(),
  deleteTimeSlot: vi.fn(),
  getScreensForTimeSlot: vi.fn(),
  setScreensForTimeSlot: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const mockScreen = {
  id: 1,
  type: "EVENT" as const,
  title: "Test Event",
  subtitle: "Test Subtitle",
  body: "Test body text",
  imagePath: null,
  qrUrl: null,
  startAt: null,
  endAt: null,
  daysOfWeek: null,
  timeStart: null,
  timeEnd: null,
  priority: 1,
  durationSeconds: 10,
  sortOrder: 0,
  isActive: true,
  isProtected: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("screens.getActive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active screens for public users", async () => {
    const mockScreens = [mockScreen];
    vi.mocked(db.getActiveScreens).mockResolvedValue(mockScreens);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.getActive();

    expect(result).toEqual(mockScreens);
    expect(db.getActiveScreens).toHaveBeenCalled();
  });

  it("returns empty array when no active screens", async () => {
    vi.mocked(db.getActiveScreens).mockResolvedValue([]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.getActive();

    expect(result).toEqual([]);
  });
});

describe("screens.getAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all screens for authenticated users", async () => {
    const mockScreens = [mockScreen];
    vi.mocked(db.getAllScreens).mockResolvedValue(mockScreens);

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.getAll();

    expect(result).toEqual(mockScreens);
    expect(db.getAllScreens).toHaveBeenCalled();
  });

  it("throws UNAUTHORIZED for public users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.screens.getAll()).rejects.toThrow();
  });
});

describe("screens.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a screen for admin users", async () => {
    vi.mocked(db.createScreen).mockResolvedValue({ id: 1 });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.create({
      type: "EVENT",
      title: "New Event",
      priority: 1,
      durationSeconds: 10,
      isActive: true,
    });

    expect(result).toEqual({ id: 1 });
    expect(db.createScreen).toHaveBeenCalled();
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.screens.create({
        type: "EVENT",
        title: "New Event",
        priority: 1,
        durationSeconds: 10,
        isActive: true,
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("screens.delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a non-protected screen for admin users", async () => {
    vi.mocked(db.getScreenById).mockResolvedValue(mockScreen);
    vi.mocked(db.deleteScreen).mockResolvedValue({ success: true });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.delete({ id: 1 });

    expect(result).toEqual({ success: true });
    expect(db.deleteScreen).toHaveBeenCalledWith(1);
  });

  it("throws FORBIDDEN when trying to delete protected screen", async () => {
    const protectedScreen = { ...mockScreen, isProtected: true };
    vi.mocked(db.getScreenById).mockResolvedValue(protectedScreen);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.screens.delete({ id: 1 })).rejects.toThrow(
      "Cannot delete protected screen"
    );
  });

  it("throws NOT_FOUND when screen does not exist", async () => {
    vi.mocked(db.getScreenById).mockResolvedValue(null);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.screens.delete({ id: 999 })).rejects.toThrow(
      "Screen not found"
    );
  });
});

describe("screens.logView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs a screen view for public users", async () => {
    vi.mocked(db.logScreenView).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.logView({
      screenId: 1,
      sessionId: "test-session",
    });

    expect(result).toEqual({ success: true });
    expect(db.logScreenView).toHaveBeenCalledWith(1, "test-session");
  });
});
