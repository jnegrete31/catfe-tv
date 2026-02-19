import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  updatePhotoCaption: vi.fn(),
  // Also mock other db functions that routers.ts imports
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
  getAdoptableCats: vi.fn(),
  getRandomAdoptionScreens: vi.fn(),
  getRecentlyAdoptedScreens: vi.fn(),
  getAdoptionCount: vi.fn(),
  getAllTemplates: vi.fn(),
  getTemplateById: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  getTemplateByScreenType: vi.fn(),
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
  getSlideTemplateByScreenId: vi.fn(),
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
  getAvailableCats: vi.fn(),
  getAdoptedCats: vi.fn(),
  getFeaturedCat: vi.fn(),
  getCatById: vi.fn(),
  createCat: vi.fn(),
  updateCat: vi.fn(),
  deleteCat: vi.fn(),
  bulkUpdateCatStatus: vi.fn(),
  getCatsByStatus: vi.fn(),
  getRecentlyAdoptedCatsFromTable: vi.fn(),
  getCatCount: vi.fn(),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/photo.jpg", key: "photo.jpg" }),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
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

const mockPhoto = {
  id: 1,
  type: "snap_purr" as const,
  status: "approved" as const,
  submitterName: "Jane",
  submitterEmail: "jane@example.com",
  photoUrl: "https://s3.example.com/photo.jpg",
  caption: "My kitty!",
  catName: null,
  adoptionDate: null,
  showOnTv: true,
  isFeatured: false,
  backgroundStyle: "blur",
  createdAt: new Date(),
  reviewedAt: new Date(),
  reviewedBy: 1,
  rejectionReason: null,
};

describe("photos.updateCaption (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a photo caption for admin users", async () => {
    const updatedPhoto = { ...mockPhoto, caption: "Updated caption!" };
    vi.mocked(db.updatePhotoCaption).mockResolvedValue(updatedPhoto);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.photos.updateCaption({
      id: 1,
      caption: "Updated caption!",
    });

    expect(result).toEqual(updatedPhoto);
    expect(result!.caption).toBe("Updated caption!");
    expect(db.updatePhotoCaption).toHaveBeenCalledWith(1, "Updated caption!");
  });

  it("sets caption to null when clearing", async () => {
    const updatedPhoto = { ...mockPhoto, caption: null };
    vi.mocked(db.updatePhotoCaption).mockResolvedValue(updatedPhoto);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.photos.updateCaption({
      id: 1,
      caption: null,
    });

    expect(result).toEqual(updatedPhoto);
    expect(result!.caption).toBeNull();
    expect(db.updatePhotoCaption).toHaveBeenCalledWith(1, null);
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.photos.updateCaption({ id: 1, caption: "Hacked" })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.photos.updateCaption({ id: 1, caption: "Hacked" })
    ).rejects.toThrow();
  });

  it("rejects captions longer than 500 characters", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const longCaption = "a".repeat(501);

    await expect(
      caller.photos.updateCaption({ id: 1, caption: longCaption })
    ).rejects.toThrow();
  });
});
