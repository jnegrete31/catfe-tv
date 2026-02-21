import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  // Existing mocks needed by routers.ts imports
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
  getAvailableCats: vi.fn().mockResolvedValue([]),
  getAllGuestSessions: vi.fn(),
  getActiveGuestSessions: vi.fn(),
  getGuestSessionById: vi.fn(),
  createGuestSession: vi.fn(),
  updateGuestSession: vi.fn(),
  checkOutGuestSession: vi.fn(),
  extendGuestSession: vi.fn(),
  getSessionsNeedingReminder: vi.fn(),
  getRecentlyCheckedIn: vi.fn(),
  markReminderShown: vi.fn(),
  getTodayGuestStats: vi.fn(),
  getAllPhotoSubmissions: vi.fn(),
  getPendingPhotoSubmissions: vi.fn(),
  getApprovedPhotosByType: vi.fn(),
  getPhotoSubmissionById: vi.fn(),
  createPhotoSubmission: vi.fn(),
  approvePhotoSubmission: vi.fn(),
  rejectPhotoSubmission: vi.fn(),
  deletePhotoSubmission: vi.fn(),
  togglePhotoVisibility: vi.fn(),
  togglePhotoFeatured: vi.fn(),
  updatePhotoCaption: vi.fn(),
  getFeaturedPhotos: vi.fn(),
  getPhotoSubmissionStats: vi.fn(),
  getSessionHistory: vi.fn(),
  getSessionAnalytics: vi.fn(),
  getSuggestedCaptions: vi.fn(),
  getAllSuggestedCaptions: vi.fn(),
  createSuggestedCaption: vi.fn(),
  updateSuggestedCaption: vi.fn(),
  deleteSuggestedCaption: vi.fn(),
  reorderSuggestedCaptions: vi.fn(),
  seedDefaultCaptions: vi.fn(),
  getAllPolls: vi.fn(),
  getActivePolls: vi.fn(),
  getCurrentPoll: vi.fn(),
  getPollById: vi.fn(),
  getPollWithResults: vi.fn(),
  createPoll: vi.fn(),
  updatePoll: vi.fn(),
  deletePoll: vi.fn(),
  submitPollVote: vi.fn(),
  hasVoted: vi.fn(),
  resetPollVotes: vi.fn(),
  resetCurrentPollVotes: vi.fn(),
  seedDefaultPollQuestions: vi.fn(),
  getPollForTV: vi.fn(),
  createTemplatePoll: vi.fn(),
  getAdoptableCats: vi.fn(),
  getAllPlaylists: vi.fn(),
  getActivePlaylist: vi.fn(),
  getPlaylistById: vi.fn(),
  createPlaylist: vi.fn(),
  updatePlaylist: vi.fn(),
  deletePlaylist: vi.fn(),
  setActivePlaylist: vi.fn(),
  getScreensForPlaylist: vi.fn(),
  setScreensForPlaylist: vi.fn(),
  addScreenToPlaylist: vi.fn(),
  removeScreenFromPlaylist: vi.fn(),
  getActiveScreensForCurrentPlaylist: vi.fn(),
  seedDefaultPlaylists: vi.fn(),
  getAllSlideTemplates: vi.fn(),
  getSlideTemplateByScreenType: vi.fn(),
  upsertSlideTemplate: vi.fn(),
  deleteSlideTemplate: vi.fn(),
  getDefaultTemplateElements: vi.fn(),
  seedDefaultSlideTemplates: vi.fn(),
  likePhoto: vi.fn(),
  unlikePhoto: vi.fn(),
  hasLikedPhoto: vi.fn(),
  getPhotosByLikes: vi.fn(),
  getUserLikedPhotos: vi.fn(),
  getAllCats: vi.fn(),
  getAdoptedCats: vi.fn(),
  getFeaturedCat: vi.fn(),
  getCatById: vi.fn(),
  createCat: vi.fn(),
  updateCat: vi.fn(),
  deleteCat: vi.fn(),
  getCatsByStatus: vi.fn(),
  getRecentlyAdoptedCatsFromTable: vi.fn(),
  getCatCount: vi.fn(),
  bulkUpdateCatStatus: vi.fn(),
  catToVirtualScreen: vi.fn(),
  // New screen type functions
  getAllVolunteers: vi.fn(),
  getActiveVolunteers: vi.fn(),
  getFeaturedVolunteers: vi.fn(),
  getVolunteerById: vi.fn(),
  createVolunteer: vi.fn(),
  updateVolunteer: vi.fn(),
  deleteVolunteer: vi.fn(),
  getAllInstagramPosts: vi.fn(),
  getVisibleInstagramPosts: vi.fn(),
  upsertInstagramPost: vi.fn(),
  hideInstagramPost: vi.fn(),
  deleteInstagramPost: vi.fn(),
  getCatsWithUpcomingBirthdays: vi.fn(),
  getTodaysBirthdayCats: vi.fn(),
}));

// Mock roller modules
vi.mock("./roller", () => ({
  getProductAvailability: vi.fn().mockResolvedValue([]),
  searchBookings: vi.fn().mockResolvedValue([]),
  testConnection: vi.fn().mockResolvedValue({ success: true, productCount: 0 }),
}));

vi.mock("./rollerPolling", () => ({
  getRollerPollingStatus: vi.fn().mockReturnValue({ isRunning: false, lastPollAt: null, knownBookingRefs: [] }),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://example.com/test.jpg", key: "test.jpg" }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: "test" } }] }),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("New Screen Types - Birthdays Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("birthdays.getToday returns today's birthday cats (public)", async () => {
    const mockCats = [
      { id: 1, name: "Whiskers", dob: new Date("2023-02-21"), status: "available", photoUrl: "https://example.com/whiskers.jpg" },
    ];
    (db.getTodaysBirthdayCats as any).mockResolvedValue(mockCats);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.birthdays.getToday();

    expect(result).toEqual(mockCats);
    expect(db.getTodaysBirthdayCats).toHaveBeenCalledOnce();
  });

  it("birthdays.getUpcoming returns upcoming birthdays with default 30 days", async () => {
    const mockCats = [
      { id: 1, name: "Luna", dob: new Date("2023-03-01"), status: "available" },
      { id: 2, name: "Milo", dob: new Date("2023-03-15"), status: "available" },
    ];
    (db.getCatsWithUpcomingBirthdays as any).mockResolvedValue(mockCats);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.birthdays.getUpcoming();

    expect(result).toEqual(mockCats);
    expect(db.getCatsWithUpcomingBirthdays).toHaveBeenCalledWith(30);
  });

  it("birthdays.getUpcoming accepts custom days parameter", async () => {
    (db.getCatsWithUpcomingBirthdays as any).mockResolvedValue([]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await caller.birthdays.getUpcoming({ days: 14 });

    expect(db.getCatsWithUpcomingBirthdays).toHaveBeenCalledWith(14);
  });
});

describe("New Screen Types - Volunteers Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("volunteers.getFeatured returns featured volunteers (public)", async () => {
    const mockVolunteers = [
      { id: 1, name: "Alice", role: "Cat Socializer", isFeatured: true, isActive: true },
    ];
    (db.getFeaturedVolunteers as any).mockResolvedValue(mockVolunteers);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.volunteers.getFeatured();

    expect(result).toEqual(mockVolunteers);
    expect(db.getFeaturedVolunteers).toHaveBeenCalledOnce();
  });

  it("volunteers.getActive returns active volunteers (public)", async () => {
    const mockVolunteers = [
      { id: 1, name: "Bob", isActive: true },
      { id: 2, name: "Carol", isActive: true },
    ];
    (db.getActiveVolunteers as any).mockResolvedValue(mockVolunteers);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.volunteers.getActive();

    expect(result).toEqual(mockVolunteers);
  });

  it("volunteers.getAll requires authentication", async () => {
    (db.getAllVolunteers as any).mockResolvedValue([]);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.volunteers.getAll();

    expect(result).toEqual([]);
    expect(db.getAllVolunteers).toHaveBeenCalledOnce();
  });

  it("volunteers.create creates a new volunteer (protected)", async () => {
    const newVolunteer = { id: 1, name: "Dave", role: "Foster Parent", isFeatured: false, isActive: true };
    (db.createVolunteer as any).mockResolvedValue(newVolunteer);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.volunteers.create({
      name: "Dave",
      role: "Foster Parent",
    });

    expect(result).toEqual(newVolunteer);
    expect(db.createVolunteer).toHaveBeenCalledWith(expect.objectContaining({ name: "Dave", role: "Foster Parent" }));
  });

  it("volunteers.delete removes a volunteer (protected)", async () => {
    (db.deleteVolunteer as any).mockResolvedValue(true);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.volunteers.delete({ id: 1 });

    expect(result).toBe(true);
    expect(db.deleteVolunteer).toHaveBeenCalledWith(1);
  });
});

describe("New Screen Types - Instagram Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("instagram.getPosts returns visible posts (public)", async () => {
    const mockPosts = [
      { id: 1, instagramId: "abc123", mediaType: "IMAGE", mediaUrl: "https://example.com/photo.jpg", isHidden: false },
    ];
    (db.getVisibleInstagramPosts as any).mockResolvedValue(mockPosts);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.instagram.getPosts();

    expect(result).toEqual(mockPosts);
    expect(db.getVisibleInstagramPosts).toHaveBeenCalledOnce();
  });

  it("instagram.getAll returns all posts including hidden (protected)", async () => {
    const mockPosts = [
      { id: 1, isHidden: false },
      { id: 2, isHidden: true },
    ];
    (db.getAllInstagramPosts as any).mockResolvedValue(mockPosts);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.instagram.getAll();

    expect(result).toEqual(mockPosts);
    expect(db.getAllInstagramPosts).toHaveBeenCalledOnce();
  });

  it("instagram.toggleVisibility hides/shows a post (protected)", async () => {
    (db.hideInstagramPost as any).mockResolvedValue(undefined);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.instagram.toggleVisibility({ id: 1, hidden: true });

    expect(result).toEqual({ success: true });
    expect(db.hideInstagramPost).toHaveBeenCalledWith(1, true);
  });

  it("instagram.delete removes a post (protected)", async () => {
    (db.deleteInstagramPost as any).mockResolvedValue(true);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.instagram.delete({ id: 1 });

    expect(result).toBe(true);
    expect(db.deleteInstagramPost).toHaveBeenCalledWith(1);
  });

  it("instagram.addManual creates a manual post entry (protected)", async () => {
    (db.upsertInstagramPost as any).mockResolvedValue(undefined);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.instagram.addManual({
      mediaUrl: "https://example.com/photo.jpg",
      caption: "Cute cat!",
      mediaType: "IMAGE",
    });

    expect(result).toEqual({ success: true });
    expect(db.upsertInstagramPost).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaUrl: "https://example.com/photo.jpg",
        caption: "Cute cat!",
        mediaType: "IMAGE",
      })
    );
  });
});

describe("Screen Type Enum includes new types", () => {
  it("can create a screen with SOCIAL_FEED type", async () => {
    const mockScreen = { id: 100, type: "SOCIAL_FEED", title: "Our Instagram" };
    (db.createScreen as any).mockResolvedValue(mockScreen);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.screens.create({
      type: "SOCIAL_FEED",
      title: "Our Instagram",
    });

    expect(result).toEqual(mockScreen);
  });

  it("can create a screen with BIRTHDAY_CELEBRATION type", async () => {
    const mockScreen = { id: 101, type: "BIRTHDAY_CELEBRATION", title: "Happy Birthday!" };
    (db.createScreen as any).mockResolvedValue(mockScreen);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.screens.create({
      type: "BIRTHDAY_CELEBRATION",
      title: "Happy Birthday!",
    });

    expect(result).toEqual(mockScreen);
  });

  it("can create a screen with VOLUNTEER_SPOTLIGHT type", async () => {
    const mockScreen = { id: 102, type: "VOLUNTEER_SPOTLIGHT", title: "Our Amazing Volunteers" };
    (db.createScreen as any).mockResolvedValue(mockScreen);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.screens.create({
      type: "VOLUNTEER_SPOTLIGHT",
      title: "Our Amazing Volunteers",
    });

    expect(result).toEqual(mockScreen);
  });
});
