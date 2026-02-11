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
  getAllGuestSessions: vi.fn(),
  getActiveGuestSessions: vi.fn(),
  getGuestSessionById: vi.fn(),
  createGuestSession: vi.fn(),
  updateGuestSession: vi.fn(),
  checkOutGuestSession: vi.fn(),
  extendGuestSession: vi.fn(),
  getSessionsNeedingReminder: vi.fn(),
  markReminderShown: vi.fn(),
  getTodayGuestStats: vi.fn(),
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
}));

import * as db from "./db";

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

const mockScreen = {
  id: 1,
  type: "EVENT" as const,
  title: "Test Event",
  subtitle: "Test Subtitle",
  body: "Test body text",
  imagePath: null,
  imageDisplayMode: null,
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
  schedulingEnabled: false,
  livestreamUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAdoptionScreen = {
  ...mockScreen,
  id: 2,
  type: "ADOPTION" as const,
  title: "Meet Luna",
  subtitle: "2 years old",
  imagePath: "https://example.com/luna.jpg",
};

const mockCustomScreen = {
  ...mockScreen,
  id: 3,
  type: "CUSTOM" as const,
  title: "Custom Slide",
};

const mockTemplate = {
  id: 1,
  screenType: "EVENT" as const,
  name: "Event Template",
  backgroundColor: "#1a1a2e",
  backgroundGradient: "linear-gradient(135deg, #1a1a2e, #16213e)",
  backgroundImageUrl: null,
  elements: JSON.stringify([
    {
      id: "el-1",
      type: "title",
      x: 10,
      y: 5,
      width: 80,
      height: 15,
      fontSize: 48,
      fontWeight: "bold",
      color: "#ffffff",
      textAlign: "center",
      visible: true,
    },
    {
      id: "el-2",
      type: "subtitle",
      x: 10,
      y: 22,
      width: 80,
      height: 10,
      fontSize: 32,
      color: "#d97706",
      textAlign: "center",
      visible: true,
    },
  ]),
  defaultFontFamily: "Inter",
  defaultFontColor: "#ffffff",
  showAnimations: true,
  animationStyle: "fade",
  widgetOverrides: JSON.stringify({
    logo: { visible: true, x: 2, y: 2, width: 8, height: 8 },
    clock: { visible: true, x: 85, y: 2 },
  }),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAdoptionTemplate = {
  ...mockTemplate,
  id: 2,
  screenType: "ADOPTION" as const,
  name: "Adoption Template",
  elements: JSON.stringify([
    {
      id: "el-3",
      type: "catPhoto",
      x: 5,
      y: 10,
      width: 40,
      height: 60,
      objectFit: "cover",
      visible: true,
    },
  ]),
  widgetOverrides: null,
};

describe("screens.getActiveWithTemplates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active screens with template overlay data attached", async () => {
    vi.mocked(db.getActiveScreens).mockResolvedValue([mockScreen]);
    vi.mocked(db.getAllSlideTemplates).mockResolvedValue([mockTemplate as any]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.getActiveWithTemplates();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Test Event");
    expect(result[0].templateOverlay).not.toBeNull();
    expect(result[0].templateOverlay?.elements).toBe(mockTemplate.elements);
    expect(result[0].templateOverlay?.backgroundColor).toBe("#1a1a2e");
    expect(result[0].templateOverlay?.backgroundGradient).toBe("linear-gradient(135deg, #1a1a2e, #16213e)");
    expect(result[0].templateOverlay?.defaultFontFamily).toBe("Inter");
    expect(result[0].templateOverlay?.defaultFontColor).toBe("#ffffff");
    expect(result[0].templateOverlay?.widgetOverrides).toBe(mockTemplate.widgetOverrides);
  });

  it("returns null templateOverlay when no template exists for a screen type", async () => {
    vi.mocked(db.getActiveScreens).mockResolvedValue([mockCustomScreen]);
    vi.mocked(db.getAllSlideTemplates).mockResolvedValue([mockTemplate as any]); // Only EVENT template

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.getActiveWithTemplates();

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("CUSTOM");
    expect(result[0].templateOverlay).toBeNull();
  });

  it("matches templates to correct screen types with multiple screens", async () => {
    vi.mocked(db.getActiveScreens).mockResolvedValue([
      mockScreen,
      mockAdoptionScreen,
      mockCustomScreen,
    ]);
    vi.mocked(db.getAllSlideTemplates).mockResolvedValue([
      mockTemplate as any,
      mockAdoptionTemplate as any,
    ]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.getActiveWithTemplates();

    expect(result).toHaveLength(3);

    // EVENT screen should have EVENT template
    const eventScreen = result.find((s) => s.type === "EVENT");
    expect(eventScreen?.templateOverlay).not.toBeNull();
    expect(eventScreen?.templateOverlay?.elements).toBe(mockTemplate.elements);

    // ADOPTION screen should have ADOPTION template
    const adoptionScreen = result.find((s) => s.type === "ADOPTION");
    expect(adoptionScreen?.templateOverlay).not.toBeNull();
    expect(adoptionScreen?.templateOverlay?.elements).toBe(mockAdoptionTemplate.elements);

    // CUSTOM screen should have no template
    const customScreen = result.find((s) => s.type === "CUSTOM");
    expect(customScreen?.templateOverlay).toBeNull();
  });

  it("returns empty array when no active screens exist", async () => {
    vi.mocked(db.getActiveScreens).mockResolvedValue([]);
    vi.mocked(db.getAllSlideTemplates).mockResolvedValue([]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.getActiveWithTemplates();

    expect(result).toEqual([]);
  });

  it("preserves all original screen fields alongside templateOverlay", async () => {
    vi.mocked(db.getActiveScreens).mockResolvedValue([mockScreen]);
    vi.mocked(db.getAllSlideTemplates).mockResolvedValue([mockTemplate as any]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screens.getActiveWithTemplates();

    const screen = result[0];
    // Verify original screen fields are preserved
    expect(screen.id).toBe(mockScreen.id);
    expect(screen.type).toBe(mockScreen.type);
    expect(screen.title).toBe(mockScreen.title);
    expect(screen.subtitle).toBe(mockScreen.subtitle);
    expect(screen.body).toBe(mockScreen.body);
    expect(screen.priority).toBe(mockScreen.priority);
    expect(screen.durationSeconds).toBe(mockScreen.durationSeconds);
    expect(screen.isActive).toBe(mockScreen.isActive);
    // Plus the template overlay
    expect(screen.templateOverlay).not.toBeNull();
  });

  it("is accessible without authentication (public endpoint)", async () => {
    vi.mocked(db.getActiveScreens).mockResolvedValue([]);
    vi.mocked(db.getAllSlideTemplates).mockResolvedValue([]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - it's a public procedure
    const result = await caller.screens.getActiveWithTemplates();
    expect(result).toEqual([]);
  });
});
