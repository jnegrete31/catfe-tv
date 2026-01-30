import { describe, it, expect, vi, beforeEach } from "vitest";
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
  getRandomAdoptionScreens: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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

describe("Screen isAdopted field", () => {
  const caller = appRouter.createCaller;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a screen with isAdopted = false by default", async () => {
    const mockScreen = {
      id: 1,
      type: "ADOPTION",
      title: "Test Cat",
      subtitle: "2 years old",
      body: null,
      imagePath: null,
      imageDisplayMode: "cover",
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
      isAdopted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.createScreen).mockResolvedValue(mockScreen);

    const ctx = createAdminContext();
    const result = await caller(ctx).screens.create({
      type: "ADOPTION",
      title: "Test Cat",
      subtitle: "2 years old",
      priority: 1,
      durationSeconds: 10,
      isActive: true,
      isAdopted: false,
    });

    expect(result.isAdopted).toBe(false);
    expect(db.createScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ADOPTION",
        title: "Test Cat",
        isAdopted: false,
      })
    );
  });

  it("should create a screen with isAdopted = true when specified", async () => {
    const mockScreen = {
      id: 2,
      type: "ADOPTION",
      title: "Adopted Cat",
      subtitle: "Found a home!",
      body: null,
      imagePath: null,
      imageDisplayMode: "cover",
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
      isAdopted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.createScreen).mockResolvedValue(mockScreen);

    const ctx = createAdminContext();
    const result = await caller(ctx).screens.create({
      type: "ADOPTION",
      title: "Adopted Cat",
      subtitle: "Found a home!",
      priority: 1,
      durationSeconds: 10,
      isActive: true,
      isAdopted: true,
    });

    expect(result.isAdopted).toBe(true);
    expect(db.createScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        isAdopted: true,
      })
    );
  });

  it("should update isAdopted field", async () => {
    const existingScreen = {
      id: 1,
      type: "ADOPTION",
      title: "Test Cat",
      subtitle: null,
      body: null,
      imagePath: null,
      imageDisplayMode: "cover",
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
      isAdopted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedScreen = {
      ...existingScreen,
      isAdopted: true,
    };

    vi.mocked(db.getScreenById).mockResolvedValue(existingScreen);
    vi.mocked(db.updateScreen).mockResolvedValue(updatedScreen);

    const ctx = createAdminContext();
    const result = await caller(ctx).screens.update({
      id: 1,
      data: {
        type: "ADOPTION",
        title: "Test Cat",
        priority: 1,
        durationSeconds: 10,
        isActive: true,
        isAdopted: true,
      },
    });

    expect(result.isAdopted).toBe(true);
    expect(db.updateScreen).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        isAdopted: true,
      })
    );
  });

  it("should include isAdopted in getRandomAdoptions results", async () => {
    const mockAdoptionCats = [
      {
        id: 1,
        type: "ADOPTION",
        title: "Cat 1",
        subtitle: "1 year old",
        body: null,
        imagePath: "https://example.com/cat1.jpg",
        imageDisplayMode: "cover",
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
        isAdopted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        type: "ADOPTION",
        title: "Cat 2",
        subtitle: "2 years old",
        body: null,
        imagePath: "https://example.com/cat2.jpg",
        imageDisplayMode: "cover",
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
        isAdopted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // getRandomAdoptions uses getActiveScreens internally
    vi.mocked(db.getActiveScreens).mockResolvedValue(mockAdoptionCats);

    const ctx = createPublicContext();
    const result = await caller(ctx).screens.getRandomAdoptions({ count: 4 });

    expect(result).toHaveLength(2);
    // Results are shuffled, so check that both cats are present with correct isAdopted values
    const cat1 = result.find(c => c.id === 1);
    const cat2 = result.find(c => c.id === 2);
    expect(cat1?.isAdopted).toBe(false);
    expect(cat2?.isAdopted).toBe(true);
  });
});
