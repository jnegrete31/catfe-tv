import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getDb,
  getAllScreens,
  getActiveScreens,
  getScreensByType,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
  updateScreenOrder,
  getSettings,
  upsertSettings,
  getAllTimeSlots,
  getActiveTimeSlots,
  getTimeSlotById,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getScreensForTimeSlot,
  setScreensForTimeSlot,
  logScreenView,
  getScreenViewCounts,
  getAllGuestSessions,
  getActiveGuestSessions,
  getGuestSessionById,
  createGuestSession,
  updateGuestSession,
  checkOutGuestSession,
  extendGuestSession,
  getSessionsNeedingReminder,
  getRecentlyCheckedIn,
  markReminderShown,
  getTodayGuestStats,
  getAllPhotoSubmissions,
  getPendingPhotoSubmissions,
  getApprovedPhotosByType,
  getPhotoSubmissionById,
  createPhotoSubmission,
  approvePhotoSubmission,
  rejectPhotoSubmission,
  deletePhotoSubmission,
  togglePhotoVisibility,
  togglePhotoFeatured,
  updatePhotoCaption,
  getFeaturedPhotos,
  getPhotoSubmissionStats,
  getSessionHistory,
  getSessionAnalytics,
  getSuggestedCaptions,
  getAllSuggestedCaptions,
  createSuggestedCaption,
  updateSuggestedCaption,
  deleteSuggestedCaption,
  reorderSuggestedCaptions,
  seedDefaultCaptions,
  getAllPolls,
  getActivePolls,
  getCurrentPoll,
  getPollById,
  getPollWithResults,
  createPoll,
  updatePoll,
  deletePoll,
  submitPollVote,
  hasVoted,
  resetPollVotes,
  resetCurrentPollVotes,
  seedDefaultPollQuestions,
  getPollForTV,
  createTemplatePoll,
  getAdoptableCats,
  type PollOption,
  getAllPlaylists,
  getActivePlaylist,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  setActivePlaylist,
  getScreensForPlaylist,
  setScreensForPlaylist,
  addScreenToPlaylist,
  removeScreenFromPlaylist,
  getActiveScreensForCurrentPlaylist,
  seedDefaultPlaylists,
  getAllSlideTemplates,
  getSlideTemplateByScreenType,
  upsertSlideTemplate,
  deleteSlideTemplate,
  getDefaultTemplateElements,
  seedDefaultSlideTemplates,
  likePhoto,
  unlikePhoto,
  hasLikedPhoto,
  getPhotosByLikes,
  getUserLikedPhotos,
  getAllCats,
  getAvailableCats,
  getAdoptedCats,
  getFeaturedCat,
  getCatById,
  createCat,
  updateCat,
  deleteCat,
  getCatsByStatus,
  getRecentlyAdoptedCatsFromTable,
  getCatCount,
  bulkUpdateCatStatus,
  catToVirtualScreen,
  getAllVolunteers,
  getActiveVolunteers,
  getFeaturedVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getAllInstagramPosts,
  getVisibleInstagramPosts,
  upsertInstagramPost,
  hideInstagramPost,
  deleteInstagramPost,
  getCatsWithUpcomingBirthdays,
  getTodaysBirthdayCats,
  markBookingArrived,
  unmarkBookingArrived,
  getBookingArrivals,
  getPhotosForCat,
  getTopPhotosForCat,
  getGuestCatPhotoById,
  countPhotosForCatByUploader,
  createGuestCatPhoto,
  toggleGuestCatPhotoActive,
  hasVotedOnPhoto,
  castFreeVote,
  castDonationVotes,
  getVotesByFingerprint,
  getTokenBalanceByFingerprint,
  createDonationTokens,
  consumeTokens,
  getAvailableCatsWithTopPhotos,
  getTopPhotosForTV,
} from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { createDonationCheckoutSession } from "./stripeWebhook";
import { DONATION_TIERS, getDonationTier } from "./stripe-products";
import { notifyOwner } from "./_core/notification";
import { getProductAvailability, searchBookings, testConnection, getCustomerDetail, getBookingWaiverSummary, type BookingWaiverSummary, getBookingAddOnsWithNames, cacheProductNames, type BookingAddOn } from "./roller";
import { getRollerPollingStatus, triggerManualSync } from "./rollerPolling";
import { settings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Screen type enum values
const screenTypes = [
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
  "GUEST_STATUS_BOARD",
  "LIVE_AVAILABILITY",
  "SESSION_BOARD",
  "SOCIAL_FEED",
  "BIRTHDAY_CELEBRATION",
  "VOLUNTEER_SPOTLIGHT",
  "GUEST_PHOTO_CONTEST",
  "CUSTOM",
] as const;

// Input schemas
const screenInput = z.object({
  type: z.enum(screenTypes).default("EVENT"),
  title: z.string().min(1).max(255),
  subtitle: z.string().max(255).nullable().optional(),
  body: z.string().nullable().optional(),
  imagePath: z.string().max(1024).nullable().optional(),
  imageDisplayMode: z.enum(["cover", "contain"]).nullable().optional(),
  qrUrl: z.string().url().max(1024).nullable().optional().or(z.literal("")),
  qrLabel: z.string().max(255).nullable().optional(),
  startAt: z.date().nullable().optional(),
  endAt: z.date().nullable().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).nullable().optional(),
  timeStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable().optional().or(z.literal("")),
  timeEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable().optional().or(z.literal("")),
  priority: z.number().min(1).max(10).default(1),
  durationSeconds: z.number().min(1).max(300).default(10),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  schedulingEnabled: z.boolean().default(false),
  isProtected: z.boolean().default(false),
  isAdopted: z.boolean().default(false),
  hideOverlay: z.boolean().default(false),
  livestreamUrl: z.string().url().max(1024).nullable().optional().or(z.literal("")),
  eventTime: z.string().max(100).nullable().optional(),
  eventLocation: z.string().max(255).nullable().optional(),
  templateOverride: z.string().nullable().optional(), // JSON string for per-screen layout override
});

// Update schema: same fields but NO defaults, so partial updates don't overwrite existing values
const screenUpdateInput = z.object({
  type: z.enum(screenTypes).optional(),
  title: z.string().min(1).max(255).optional(),
  subtitle: z.string().max(255).nullable().optional(),
  body: z.string().nullable().optional(),
  imagePath: z.string().max(1024).nullable().optional(),
  imageDisplayMode: z.enum(["cover", "contain"]).nullable().optional(),
  qrUrl: z.string().url().max(1024).nullable().optional().or(z.literal("")),
  qrLabel: z.string().max(255).nullable().optional(),
  startAt: z.date().nullable().optional(),
  endAt: z.date().nullable().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).nullable().optional(),
  timeStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable().optional().or(z.literal("")),
  timeEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable().optional().or(z.literal("")),
  priority: z.number().min(1).max(10).optional(),
  durationSeconds: z.number().min(1).max(300).optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  schedulingEnabled: z.boolean().optional(),
  isProtected: z.boolean().optional(),
  isAdopted: z.boolean().optional(),
  hideOverlay: z.boolean().optional(),
  livestreamUrl: z.string().url().max(1024).nullable().optional().or(z.literal("")),
  eventTime: z.string().max(100).nullable().optional(),
  eventLocation: z.string().max(255).nullable().optional(),
  templateOverride: z.string().nullable().optional(), // JSON string for per-screen layout override
});

const timeSlotInput = z.object({
  name: z.string().min(1).max(255),
  timeStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  timeEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  daysOfWeek: z.array(z.number().min(0).max(6)),
  isActive: z.boolean().default(true),
});

const settingsInput = z.object({
  locationName: z.string().max(255).optional(),
  defaultDurationSeconds: z.number().min(1).max(300).optional(),
  fallbackMode: z.enum(["AMBIENT", "LOOP_DEFAULT"]).optional(),
  brandColors: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    text: z.string(),
  }).nullable().optional(),
  snapAndPurrFrequency: z.number().min(1).max(20).optional(),
  totalAdoptionCount: z.number().min(0).optional(),
  logoUrl: z.string().max(1024).nullable().optional(),
  livestreamUrl: z.string().max(1024).nullable().optional(),
  githubRepo: z.string().max(255).nullable().optional(),
  githubBranch: z.string().max(64).optional(),
  refreshIntervalSeconds: z.number().min(10).max(600).optional(),
  waiverUrl: z.string().max(1024).nullable().optional(),
  wifiName: z.string().max(255).nullable().optional(),
  wifiPassword: z.string().max(255).nullable().optional(),
  houseRules: z.array(z.string()).nullable().optional(),
});

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Helper: Generate synthetic ADOPTION screens from available cats in the database
async function generateCatSlides() {
  const availableCats = await getAvailableCats();
  return availableCats.map((cat) => {
    const ageParts: string[] = [];
    if (cat.dob) {
      const dob = new Date(cat.dob);
      const now = new Date();
      const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
      if (months < 1) ageParts.push('< 1 month');
      else if (months < 12) ageParts.push(`${months} month${months === 1 ? '' : 's'}`);
      else {
        const yrs = Math.floor(months / 12);
        const rem = months % 12;
        ageParts.push(rem > 0 ? `${yrs} yr${yrs === 1 ? '' : 's'} ${rem} mo` : `${yrs} year${yrs === 1 ? '' : 's'}`);
      }
    }
    const sexStr = cat.sex === 'male' ? 'Male' : 'Female';
    const subtitle = [...ageParts, sexStr].filter(Boolean).join(' \u00B7 ');
    const tags = (cat.personalityTags as string[] | null)?.join(' \u00B7 ') || '';
    return {
      id: 100000 + cat.id,
      type: 'ADOPTION' as const,
      title: cat.name,
      subtitle: subtitle || null,
      body: tags || null,
      imagePath: cat.photoUrl || null,
      imageDisplayMode: 'cover',
      qrUrl: 'https://www.shelterluv.com/matchme/adopt/KRLA/Cat',
      qrLabel: null,
      startAt: null, endAt: null, daysOfWeek: null, timeStart: null, timeEnd: null,
      priority: 1, durationSeconds: 10, sortOrder: 0,
      isActive: true, schedulingEnabled: false, isProtected: false, isAdopted: cat.status === 'adopted' || cat.status === 'adopted_in_lounge',
      livestreamUrl: null, eventTime: null, eventLocation: null,
      templateOverride: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
  });
}

// Helper: Interleave cat slides among regular screens
function interleaveScreens(screens: any[], catSlides: any[]) {
  if (catSlides.length === 0) return screens;
  if (screens.length === 0) return catSlides;
  const result: any[] = [];
  let catIdx = 0;
  const interval = Math.max(1, Math.floor(screens.length / Math.max(1, catSlides.length)));
  for (let i = 0; i < screens.length; i++) {
    result.push(screens[i]);
    if ((i + 1) % interval === 0 && catIdx < catSlides.length) {
      result.push(catSlides[catIdx]);
      catIdx++;
    }
  }
  while (catIdx < catSlides.length) {
    result.push(catSlides[catIdx]);
    catIdx++;
  }
  return result;
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ SCREENS ============
  screens: router({
    // Public: Get all active screens (for TV display) - includes synthetic cat adoption slides
    getActive: publicProcedure.query(async () => {
      const activeScreens = await getActiveScreens();
      const catSlides = await generateCatSlides();
      return interleaveScreens(activeScreens, catSlides);
    }),

    // Public: Get active screens with template overlay data (for tvOS app)
    getActiveWithTemplates: publicProcedure.query(async () => {
      const screens = await getActiveScreens();
      const templates = await getAllSlideTemplates();
      
      // Build a map of screenType -> template
      const templateMap = new Map<string, any>();
      for (const t of templates) {
        templateMap.set(t.screenType, t);
      }
      
      // Attach template overlay data to each screen
      // For CUSTOM screens with per-screen templateOverride, use that instead of shared template
      return screens.map(screen => {
        // Check for per-screen override first (used by individual custom slides)
        if (screen.templateOverride) {
          try {
            const override = JSON.parse(screen.templateOverride);
            return {
              ...screen,
              templateOverlay: {
                elements: override.elements || '[]',
                backgroundColor: override.backgroundColor || '#1a1a2e',
                backgroundGradient: override.backgroundGradient || null,
                backgroundImageUrl: override.backgroundImageUrl || null,
                defaultFontFamily: override.defaultFontFamily || 'Inter',
                defaultFontColor: override.defaultFontColor || '#ffffff',
                widgetOverrides: override.widgetOverrides || null,
              },
            };
          } catch (e) {
            // Fall through to type-level template
          }
        }
        const template = templateMap.get(screen.type);
        return {
          ...screen,
          templateOverlay: template ? {
            elements: template.elements,
            backgroundColor: template.backgroundColor,
            backgroundGradient: template.backgroundGradient,
            backgroundImageUrl: template.backgroundImageUrl,
            defaultFontFamily: template.defaultFontFamily,
            defaultFontColor: template.defaultFontColor,
            widgetOverrides: template.widgetOverrides,
          } : null,
        };
      });
    }),

    // Public: Get all screens (for admin)
    getAll: protectedProcedure.query(async () => {
      return getAllScreens();
    }),

    // Get single screen
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const screen = await getScreenById(input.id);
        if (!screen) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Screen not found' });
        }
        return screen;
      }),

    // Create screen
    create: adminProcedure
      .input(screenInput)
      .mutation(async ({ input }) => {
        // Clean up empty qrUrl
        const data = {
          ...input,
          qrUrl: input.qrUrl === "" ? null : input.qrUrl,
        };
        const result = await createScreen(data);
        
        // Auto-add new screen to the active playlist so it shows on TV immediately
        try {
          const activePlaylist = await getActivePlaylist();
          if (activePlaylist && result.id) {
            await addScreenToPlaylist(activePlaylist.id, result.id);
          }
        } catch (e) {
          // Non-critical: screen is created even if playlist add fails
          console.warn('[Screens] Failed to auto-add screen to playlist:', e);
        }
        
        return result;
      }),

    // Update screen
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: screenUpdateInput,
      }))
      .mutation(async ({ input }) => {
        const screen = await getScreenById(input.id);
        if (!screen) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Screen not found' });
        }
        // Strip undefined values so only explicitly provided fields are updated
        // This prevents defaults from overwriting existing values (e.g., type becoming EVENT)
        const cleanData: Record<string, any> = {};
        for (const [key, value] of Object.entries(input.data)) {
          if (value !== undefined) {
            cleanData[key] = value;
          }
        }
        // Clean up empty qrUrl and livestreamUrl
        if (cleanData.qrUrl === "") cleanData.qrUrl = null;
        if (cleanData.livestreamUrl === "") cleanData.livestreamUrl = null;
        if (cleanData.timeStart === "") cleanData.timeStart = null;
        if (cleanData.timeEnd === "") cleanData.timeEnd = null;
        return updateScreen(input.id, cleanData);
      }),

    // Delete screen
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const screen = await getScreenById(input.id);
        if (!screen) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Screen not found' });
        }
        if (screen.isProtected) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete protected screen' });
        }
        return deleteScreen(input.id);
      }),

    // Update screen order (drag-and-drop)
    updateOrder: adminProcedure
      .input(z.object({
        orders: z.array(z.object({
          id: z.number(),
          sortOrder: z.number(),
        })),
      }))
      .mutation(async ({ input }) => {
        return updateScreenOrder(input.orders);
      }),

    // Log view (for analytics)
    logView: publicProcedure
      .input(z.object({
        screenId: z.number(),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await logScreenView(input.screenId, input.sessionId);
        return { success: true };
      }),

    // Get view counts
    getViewCounts: protectedProcedure.query(async () => {
      return getScreenViewCounts();
    }),

    // Get all CUSTOM type screens (for the slide editor to list individual custom slides)
    getCustomSlides: protectedProcedure.query(async () => {
      return getScreensByType('CUSTOM');
    }),

    // Get random adoption screens for showcase (8 cats for 4x2 grid)
    getRandomAdoptions: publicProcedure
      .input(z.object({ count: z.number().min(1).max(12).default(8) }))
      .query(async ({ input }) => {
        // Auto-generate virtual ADOPTION screens from cats table
        const catSlides = await generateCatSlides();
        
        // Also include any legacy ADOPTION screens from the screens table
        const allScreens = await getActiveScreens();
        const legacyAdoption = allScreens.filter(s => s.type === 'ADOPTION' && s.imagePath);
        
        // Combine, deduplicate by title, and shuffle
        const catNames = new Set(catSlides.map(s => s.title));
        const uniqueLegacy = legacyAdoption.filter(s => !catNames.has(s.title));
        const combined = [...catSlides, ...uniqueLegacy];
        
        const shuffled = combined.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, input.count);
      }),

    // Get recently adopted cats for celebration banner
    getRecentlyAdopted: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
      .query(async ({ input }) => {
        // Pull from cats table for recently adopted cats
        const recentCats = await getRecentlyAdoptedCatsFromTable(30);
        // Convert to virtual screens
        const catSlides = recentCats.filter(c => c.photoUrl).map(cat => {
          const ageParts: string[] = [];
          if (cat.dob) {
            const dob = new Date(cat.dob);
            const now = new Date();
            const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
            if (months < 12) ageParts.push(`${months} month${months === 1 ? '' : 's'}`);
            else { const yrs = Math.floor(months / 12); ageParts.push(`${yrs} year${yrs === 1 ? '' : 's'}`); }
          }
          const sexStr = cat.sex === 'male' ? 'Male' : 'Female';
          return {
            id: 100000 + cat.id,
            type: 'ADOPTION' as const,
            title: cat.name,
            subtitle: [...ageParts, sexStr].filter(Boolean).join(' \u00B7 ') || null,
            body: null,
            imagePath: cat.photoUrl || null,
            imageDisplayMode: 'cover',
            qrUrl: null,
            qrLabel: null,
            startAt: null, endAt: null, daysOfWeek: null, timeStart: null, timeEnd: null,
            priority: 1, durationSeconds: 10, sortOrder: 0,
            isActive: true, schedulingEnabled: false, isProtected: false,
            isAdopted: true,
            livestreamUrl: null, eventTime: null, eventLocation: null,
            templateOverride: null,
            createdAt: new Date(), updatedAt: new Date(),
          };
        });
        
        // Also check legacy screens table
        const allScreens = await getActiveScreens();
        const legacyAdopted = allScreens.filter(s => 
          s.type === 'ADOPTION' && 
          (s as any).isAdopted === true && 
          s.imagePath
        );
        
        const catNames = new Set(catSlides.map(s => s.title));
        const uniqueLegacy = legacyAdopted.filter(s => !catNames.has(s.title));
        const combined = [...catSlides, ...uniqueLegacy];
        
        return combined.slice(0, input.limit);
      }),

    // Get count of adopted cats (for success counter)
    getAdoptionCount: publicProcedure
      .query(async () => {
        // Pull from cats table for accurate count
        const catCount = await getCatCount();
        
        // Also count legacy screen-based adopted cats
        const allScreens = await getAllScreens();
        const legacyAdoptedCount = allScreens.filter(s => 
          s.type === 'ADOPTION' && 
          (s as any).isAdopted === true
        ).length;
        
        return { count: catCount.adopted + legacyAdoptedCount };
      }),
  }),

  // ============ SETTINGS ============
  settings: router({
    get: publicProcedure.query(async () => {
      return getSettings();
    }),

    update: adminProcedure
      .input(settingsInput)
      .mutation(async ({ input }) => {
        return upsertSettings(input);
      }),
  }),

  // ============ TIME SLOTS ============
  timeSlots: router({
    getAll: protectedProcedure.query(async () => {
      return getAllTimeSlots();
    }),

    getActive: publicProcedure.query(async () => {
      return getActiveTimeSlots();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const slot = await getTimeSlotById(input.id);
        if (!slot) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Time slot not found' });
        }
        return slot;
      }),

    create: adminProcedure
      .input(timeSlotInput)
      .mutation(async ({ input }) => {
        return createTimeSlot(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: timeSlotInput.partial(),
      }))
      .mutation(async ({ input }) => {
        return updateTimeSlot(input.id, input.data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteTimeSlot(input.id);
      }),

    // Get screens for a time slot
    getScreens: protectedProcedure
      .input(z.object({ timeSlotId: z.number() }))
      .query(async ({ input }) => {
        return getScreensForTimeSlot(input.timeSlotId);
      }),

    // Set screens for a time slot (with order)
    setScreens: adminProcedure
      .input(z.object({
        timeSlotId: z.number(),
        screenIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        return setScreensForTimeSlot(input.timeSlotId, input.screenIds);
      }),
  }),

  // ============ GUEST SESSIONS ============
  guestSessions: router({
    // Get all sessions (for admin history)
    getAll: protectedProcedure.query(async () => {
      return getAllGuestSessions();
    }),

    // Get active sessions (for admin dashboard and TV display)
    getActive: publicProcedure.query(async () => {
      return getActiveGuestSessions();
    }),

    // Get single session
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const session = await getGuestSessionById(input.id);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        return session;
      }),

    // Check in a new guest
    checkIn: adminProcedure
      .input(z.object({
        guestName: z.string().min(1).max(255),
        guestCount: z.number().min(1).max(20).default(1),
        duration: z.enum(["15", "30", "60", "90"]),
        notes: z.string().max(500).nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const now = new Date();
        const durationMinutes = parseInt(input.duration);
        const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
        
        return createGuestSession({
          guestName: input.guestName,
          guestCount: input.guestCount,
          duration: input.duration,
          notes: input.notes,
          checkInAt: now,
          expiresAt,
        });
      }),

    // Check out a guest
    checkOut: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const session = await getGuestSessionById(input.id);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        return checkOutGuestSession(input.id);
      }),

    // Extend a session
    extend: adminProcedure
      .input(z.object({
        id: z.number(),
        additionalMinutes: z.number().min(5).max(60),
      }))
      .mutation(async ({ input }) => {
        const session = await getGuestSessionById(input.id);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        return extendGuestSession(input.id, input.additionalMinutes);
      }),

    // Get sessions needing reminder (for TV display)
    getNeedingReminder: publicProcedure.query(async () => {
      return getSessionsNeedingReminder();
    }),

    getRecentlyCheckedIn: publicProcedure.query(async () => {
      return getRecentlyCheckedIn();
    }),

    // Mark reminder as shown
    markReminderShown: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return markReminderShown(input.id);
      }),

    // Get today's stats
    getTodayStats: protectedProcedure.query(async () => {
      return getTodayGuestStats();
    }),

    // Update session notes
    updateNotes: adminProcedure
      .input(z.object({
        id: z.number(),
        notes: z.string().max(500).nullable(),
      }))
      .mutation(async ({ input }) => {
        return updateGuestSession(input.id, { notes: input.notes });
      }),

    // Get session history with filters
    getHistory: adminProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["active", "completed", "extended"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        return getSessionHistory(input || {});
      }),

    // Get session analytics
    getAnalytics: adminProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getSessionAnalytics(input?.startDate, input?.endDate);
      }),

  }),

  // ============ PHOTO SUBMISSIONS ============
  photos: router({
    // Public: Submit a photo (for customer upload via QR code)
    submit: publicProcedure
      .input(z.object({
        type: z.enum(["happy_tails", "snap_purr"]),
        submitterName: z.string().min(1).max(255),
        submitterEmail: z.string().email().max(320).optional().or(z.literal("")),
        photoBase64: z.string().min(1000), // Base64 encoded image - must be at least 1KB
        caption: z.string().max(500).optional(),
        catName: z.string().max(255).optional(), // For happy_tails
        adoptionDate: z.date().optional(), // For happy_tails
        backgroundStyle: z.enum(["blur", "gradient"]).optional(), // For portrait photos
      }))
      .mutation(async ({ input }) => {
        // Validate base64 data
        const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, '');
        
        // Check if the base64 data is valid and not too small
        if (base64Data.length < 1000) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Photo data is too small or corrupted. Please try uploading again.',
          });
        }
        
        // Check if base64 is too large (limit to ~10MB encoded, which is ~7.5MB actual)
        const MAX_BASE64_SIZE = 10 * 1024 * 1024; // 10MB
        if (base64Data.length > MAX_BASE64_SIZE) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Photo is too large. Please use a smaller image.',
          });
        }
        
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Validate buffer size (should be at least 1KB for a valid image)
        if (buffer.length < 1024) {
          console.error('[Photo Submit] Buffer too small:', buffer.length, 'bytes');
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Photo data is corrupted. Please try uploading again.',
          });
        }
        
        console.log('[Photo Submit] Uploading photo:', {
          type: input.type,
          submitter: input.submitterName,
          bufferSize: buffer.length,
          base64Length: base64Data.length,
        });
        
        // Upload photo to S3
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${input.type}/${timestamp}-${randomSuffix}.jpg`;
        
        // Upload to S3 with error handling
        let photoUrl: string;
        try {
          const result = await storagePut(filename, buffer, 'image/jpeg');
          photoUrl = result.url;
          console.log('[Photo Submit] Upload successful:', photoUrl);
        } catch (uploadError) {
          console.error('[Photo Submit] S3 upload failed:', uploadError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to upload photo. Please try again.',
          });
        }
        
        // Create submission record
        const result = await createPhotoSubmission({
          type: input.type,
          submitterName: input.submitterName,
          submitterEmail: input.submitterEmail || null,
          photoUrl,
          caption: input.caption || null,
          catName: input.catName || null,
          adoptionDate: input.adoptionDate || null,
          backgroundStyle: input.backgroundStyle || "blur",
        });
        
        // Send notification to owner about new photo submission
        const photoType = input.type === 'happy_tails' ? 'Happy Tails' : 'Snap & Purr';
        const catInfo = input.catName ? ` featuring ${input.catName}` : '';
        const captionInfo = input.caption ? `\n\nCaption: "${input.caption}"` : '';
        
        notifyOwner({
          title: `📸 New ${photoType} Photo Submission`,
          content: `A new photo has been submitted by ${input.submitterName}${catInfo}.${captionInfo}\n\nPlease review and approve/reject in the Photo Moderation dashboard.\n\nPhoto URL: ${photoUrl}`,
        }).catch(err => {
          // Log but don't fail the submission if notification fails
          console.warn('[Photo Submit] Failed to send notification:', err);
        });
        
        return { id: result.id, message: "Photo submitted for review!" };
      }),

    // Public: Get approved photos for TV display
    getApproved: publicProcedure
      .input(z.object({ type: z.enum(["happy_tails", "snap_purr"]) }))
      .query(async ({ input }) => {
        return getApprovedPhotosByType(input.type);
      }),

    // Admin: Get all submissions
    getAll: adminProcedure.query(async () => {
      return getAllPhotoSubmissions();
    }),

    // Admin: Get pending submissions
    getPending: adminProcedure.query(async () => {
      return getPendingPhotoSubmissions();
    }),

    // Admin: Get submission stats
    getStats: adminProcedure.query(async () => {
      return getPhotoSubmissionStats();
    }),

    // Admin: Approve submission
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return approvePhotoSubmission(input.id, ctx.user.id);
      }),

    // Admin: Reject submission
    reject: adminProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string().max(500).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return rejectPhotoSubmission(input.id, ctx.user.id, input.reason);
      }),

    // Admin: Delete submission
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deletePhotoSubmission(input.id);
      }),

    // Admin: Toggle TV visibility
    toggleVisibility: adminProcedure
      .input(z.object({
        id: z.number(),
        showOnTv: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        return togglePhotoVisibility(input.id, input.showOnTv);
      }),

    // Admin: Toggle featured status
    toggleFeatured: adminProcedure
      .input(z.object({
        id: z.number(),
        isFeatured: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        return togglePhotoFeatured(input.id, input.isFeatured);
      }),

    // Admin: Update photo caption
    updateCaption: adminProcedure
      .input(z.object({
        id: z.number(),
        caption: z.string().max(500),
      }))
      .mutation(async ({ input }) => {
        return updatePhotoCaption(input.id, input.caption);
      }),

    // Public: Get featured photos for TV display
    getFeatured: publicProcedure.query(async () => {
      return getFeaturedPhotos();
    }),

    // Public: Like a photo
    like: publicProcedure
      .input(z.object({
        photoId: z.number(),
        fingerprint: z.string().min(1).max(64),
      }))
      .mutation(async ({ input }) => {
        return likePhoto(input.photoId, input.fingerprint);
      }),

    // Public: Unlike a photo
    unlike: publicProcedure
      .input(z.object({
        photoId: z.number(),
        fingerprint: z.string().min(1).max(64),
      }))
      .mutation(async ({ input }) => {
        return unlikePhoto(input.photoId, input.fingerprint);
      }),

    // Public: Check if user has liked a photo
    hasLiked: publicProcedure
      .input(z.object({
        photoId: z.number(),
        fingerprint: z.string().min(1).max(64),
      }))
      .query(async ({ input }) => {
        return hasLikedPhoto(input.photoId, input.fingerprint);
      }),

    // Public: Get photos sorted by likes
    getByLikes: publicProcedure
      .input(z.object({
        type: z.enum(["happy_tails", "snap_purr"]),
        limit: z.number().min(1).max(100).default(20),
      }))
      .query(async ({ input }) => {
        return getPhotosByLikes(input.type, input.limit);
      }),

    // Public: Get user's liked photo IDs
    getUserLikes: publicProcedure
      .input(z.object({
        fingerprint: z.string().min(1).max(64),
      }))
      .query(async ({ input }) => {
        return getUserLikedPhotos(input.fingerprint);
      }),
  }),

  // ============ GITHUB INTEGRATION ============
  github: router({
    // Upload image to GitHub
    uploadImage: adminProcedure
      .input(z.object({
        filename: z.string(),
        content: z.string(), // Base64 encoded
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const settings = await getSettings();
        if (!settings?.githubRepo) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'GitHub repository not configured in settings' 
          });
        }

        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'GitHub token not configured' 
          });
        }

        // Generate path: /assets/catfe-tv/YYYY/MM/filename
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const path = `assets/catfe-tv/${year}/${month}/${input.filename}`;

        const branch = settings.githubBranch || 'main';
        const repo = settings.githubRepo;

        // Check if file exists (to get SHA for update)
        let sha: string | undefined;
        try {
          const checkResponse = await fetch(
            `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
            {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          );
          if (checkResponse.ok) {
            const existing = await checkResponse.json();
            sha = existing.sha;
          }
        } catch {
          // File doesn't exist, that's fine
        }

        // Upload/update file
        const response = await fetch(
          `https://api.github.com/repos/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: input.message || `Upload ${input.filename}`,
              content: input.content,
              branch,
              ...(sha && { sha }),
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: `GitHub API error: ${error.message}` 
          });
        }

        const result = await response.json();
        
        // Return the raw URL for the image
        const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
        
        return {
          path,
          rawUrl,
          sha: result.content.sha,
        };
      }),
  }),


  // ============ SUGGESTED CAPTIONS ============
  captions: router({
    // Public: Get active captions by type (for upload pages)
    getByType: publicProcedure
      .input(z.object({ type: z.enum(["happy_tails", "snap_purr"]) }))
      .query(async ({ input }) => {
        return getSuggestedCaptions(input.type);
      }),

    // Admin: Get all captions
    getAll: adminProcedure.query(async () => {
      return getAllSuggestedCaptions();
    }),

    // Admin: Create caption
    create: adminProcedure
      .input(z.object({
        type: z.enum(["happy_tails", "snap_purr"]),
        text: z.string().min(1).max(100),
      }))
      .mutation(async ({ input }) => {
        return createSuggestedCaption({
          type: input.type,
          text: input.text,
          isActive: true,
        });
      }),

    // Admin: Update caption
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        text: z.string().min(1).max(100).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateSuggestedCaption(id, data);
      }),

    // Admin: Delete caption
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteSuggestedCaption(input.id);
      }),

    // Admin: Reorder captions
    reorder: adminProcedure
      .input(z.object({
        type: z.enum(["happy_tails", "snap_purr"]),
        orderedIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        return reorderSuggestedCaptions(input.type, input.orderedIds);
      }),

    // Admin: Seed default captions
    seedDefaults: adminProcedure.mutation(async () => {
      await seedDefaultCaptions();
      return { success: true };
    }),
  }),

  // ============ POLLS ============
  polls: router({
    // Public: Get current active poll for TV display
    getCurrent: publicProcedure.query(async () => {
      return getCurrentPoll();
    }),

    // Public: Get poll with results
    getWithResults: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPollWithResults(input.id);
      }),

    // Public: Get active polls
    getActive: publicProcedure.query(async () => {
      return getActivePolls();
    }),

    // Public: Submit vote
    vote: publicProcedure
      .input(z.object({
        pollId: z.number(),
        optionId: z.string(),
        fingerprint: z.string(),
      }))
      .mutation(async ({ input }) => {
        return submitPollVote(input.pollId, input.optionId, input.fingerprint);
      }),

    // Public: Check if already voted
    hasVoted: publicProcedure
      .input(z.object({
        pollId: z.number(),
        fingerprint: z.string(),
      }))
      .query(async ({ input }) => {
        return hasVoted(input.pollId, input.fingerprint);
      }),

    // Admin: Get all polls
    getAll: adminProcedure.query(async () => {
      return getAllPolls();
    }),

    // Admin: Get poll by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPollWithResults(input.id);
      }),

    // Admin: Create poll
    create: adminProcedure
      .input(z.object({
        question: z.string().min(1).max(255),
        options: z.array(z.object({
          id: z.string(),
          text: z.string().min(1).max(100),
          catId: z.number().optional(),
          imageUrl: z.string().optional(),
        })).min(2).max(6),
        isRecurring: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return createPoll(input);
      }),

    // Admin: Update poll
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        question: z.string().min(1).max(255).optional(),
        options: z.array(z.object({
          id: z.string(),
          text: z.string().min(1).max(100),
          catId: z.number().optional(),
          imageUrl: z.string().optional(),
        })).min(2).max(6).optional(),
        status: z.enum(["draft", "active", "ended"]).optional(),
        isRecurring: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updatePoll(id, data);
      }),

    // Admin: Delete poll
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deletePoll(input.id);
      }),

    // Admin: Reset poll votes
    resetVotes: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return resetPollVotes(input.id);
      }),

    // Admin: Seed default poll questions
    seedDefaults: adminProcedure.mutation(async () => {
      return seedDefaultPollQuestions();
    }),

    // Admin: Create template poll
    createTemplate: adminProcedure
      .input(z.object({
        question: z.string().min(1).max(255),
        catCount: z.number().min(2).max(4).optional(),
      }))
      .mutation(async ({ input }) => {
        return createTemplatePoll(input);
      }),

    // Admin: Get adoptable cats for poll options
    getAdoptableCats: adminProcedure.query(async () => {
      return getAdoptableCats();
    }),

    // Public: Get poll for TV display (with dynamic cats)
    getForTV: publicProcedure.query(async () => {
      return getPollForTV();
    }),

    // Public: Reset votes for current poll (called at start of each 30-min session)
    resetCurrentVotes: publicProcedure.mutation(async () => {
      return resetCurrentPollVotes();
    }),
  }),

  // ============ PLAYLISTS ============
  playlists: router({
    // Public: Get all playlists
    getAll: publicProcedure.query(async () => {
      return getAllPlaylists();
    }),

    // Public: Get active playlist
    getActive: publicProcedure.query(async () => {
      return getActivePlaylist();
    }),

    // Public: Get playlist by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPlaylistById(input.id);
      }),

    // Public: Get screens for a playlist
    getScreens: publicProcedure
      .input(z.object({ playlistId: z.number() }))
      .query(async ({ input }) => {
        return getScreensForPlaylist(input.playlistId);
      }),

    // Public: Get which playlist is currently being served to the TV
    getCurrentlyServing: publicProcedure.query(async () => {
      const allPlaylistsList = await getAllPlaylists();
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // Check scheduled playlists (same logic as getActiveScreensForCurrentPlaylist)
      for (const p of allPlaylistsList) {
        if (!p.schedulingEnabled) continue;
        // Check days
        if (p.daysOfWeek && p.daysOfWeek.length > 0 && !p.daysOfWeek.includes(currentDay)) continue;
        // Build time windows
        const windows: Array<{ timeStart: string; timeEnd: string }> = [];
        if (p.timeSlots && Array.isArray(p.timeSlots) && p.timeSlots.length > 0) {
          for (const slot of p.timeSlots) {
            if (slot.timeStart && slot.timeEnd) windows.push(slot);
          }
        }
        if (windows.length === 0 && p.timeStart && p.timeEnd) {
          windows.push({ timeStart: p.timeStart, timeEnd: p.timeEnd });
        }
        const inWindow = windows.length === 0 || windows.some(w => {
          if (w.timeEnd < w.timeStart) return currentTime >= w.timeStart || currentTime <= w.timeEnd;
          return currentTime >= w.timeStart && currentTime <= w.timeEnd;
        });
        if (inWindow) {
          return { id: p.id, name: p.name, reason: "scheduled" as const };
        }
      }
      // Manually active
      const active = allPlaylistsList.find(p => p.isActive);
      if (active) return { id: active.id, name: active.name, reason: "manual" as const };
      // Default
      const def = allPlaylistsList.find(p => p.isDefault);
      if (def) return { id: def.id, name: def.name, reason: "default" as const };
      return { id: null, name: "All Active Screens", reason: "fallback" as const };
    }),

    // Public: Get active screens for current playlist (for TV display) - includes cat slides
    getActiveScreens: publicProcedure.query(async () => {
      const screens = await getActiveScreensForCurrentPlaylist();
      const catSlides = await generateCatSlides();
      return interleaveScreens(screens, catSlides);
    }),

    // Public: Get active screens for current playlist WITH template overlay data (for tvOS app)
    getActiveScreensWithTemplates: publicProcedure.query(async () => {
      const screens = await getActiveScreensForCurrentPlaylist();
      const templates = await getAllSlideTemplates();
      
      // Auto-generate cat slides from the cats table and interleave them
      const catSlides = await generateCatSlides();
      const allScreens = interleaveScreens(screens, catSlides);
      
      // Build a map of screenType -> template
      const templateMap = new Map<string, any>();
      for (const t of templates) {
        templateMap.set(t.screenType, t);
      }
      
      // Attach template overlay data to each screen
      // For CUSTOM screens with per-screen templateOverride, use that instead of shared template
      return allScreens.map(screen => {
        // Check for per-screen override first (used by individual custom slides)
        if ('templateOverride' in screen && (screen as any).templateOverride) {
          try {
            const override = JSON.parse((screen as any).templateOverride);
            return {
              ...screen,
              templateOverlay: {
                elements: override.elements || '[]',
                backgroundColor: override.backgroundColor || '#1a1a2e',
                backgroundGradient: override.backgroundGradient || null,
                backgroundImageUrl: override.backgroundImageUrl || null,
                defaultFontFamily: override.defaultFontFamily || 'Inter',
                defaultFontColor: override.defaultFontColor || '#ffffff',
                widgetOverrides: override.widgetOverrides || null,
              },
            };
          } catch (e) {
            // Fall through to type-level template
          }
        }
        const template = templateMap.get(screen.type);
        return {
          ...screen,
          templateOverlay: template ? {
            elements: template.elements,
            backgroundColor: template.backgroundColor,
            backgroundGradient: template.backgroundGradient,
            backgroundImageUrl: template.backgroundImageUrl,
            defaultFontFamily: template.defaultFontFamily,
            defaultFontColor: template.defaultFontColor,
            widgetOverrides: template.widgetOverrides,
          } : null,
        };
      });
    }),

    // Admin: Create playlist
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(500).optional(),
        schedulingEnabled: z.boolean().optional(),
        daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
        timeStart: z.string().max(5).optional(),
        timeEnd: z.string().max(5).optional(),
        timeSlots: z.array(z.object({ timeStart: z.string().max(5), timeEnd: z.string().max(5) })).optional(),
        color: z.string().max(32).optional(),
      }))
      .mutation(async ({ input }) => {
        return createPlaylist(input);
      }),

    // Admin: Update playlist
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(500).optional(),
        schedulingEnabled: z.boolean().optional(),
        daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
        timeStart: z.string().max(5).optional(),
        timeEnd: z.string().max(5).optional(),
        timeSlots: z.array(z.object({ timeStart: z.string().max(5), timeEnd: z.string().max(5) })).optional(),
        color: z.string().max(32).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updatePlaylist(id, data);
        return { success: true };
      }),

    // Admin: Delete playlist
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePlaylist(input.id);
        return { success: true };
      }),

    // Admin: Set active playlist
    setActive: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await setActivePlaylist(input.id);
        return { success: true };
      }),

    // Admin: Set screens for playlist
    setScreens: adminProcedure
      .input(z.object({
        playlistId: z.number(),
        screenIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        await setScreensForPlaylist(input.playlistId, input.screenIds);
        return { success: true };
      }),

    // Admin: Add screen to playlist
    addScreen: adminProcedure
      .input(z.object({
        playlistId: z.number(),
        screenId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await addScreenToPlaylist(input.playlistId, input.screenId);
        return { success: true };
      }),

    // Admin: Remove screen from playlist
    removeScreen: adminProcedure
      .input(z.object({
        playlistId: z.number(),
        screenId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await removeScreenFromPlaylist(input.playlistId, input.screenId);
        return { success: true };
      }),

    // Admin: Seed default playlists
    seedDefaults: adminProcedure.mutation(async () => {
      await seedDefaultPlaylists();
      return { success: true };
    }),
  }),

  // Slide Templates router - visual editor customizations
  templates: router({
    // Get all templates
    getAll: publicProcedure.query(async () => {
      return await getAllSlideTemplates();
    }),

    // Get template by screen type
    getByScreenType: publicProcedure
      .input(z.object({ screenType: z.string() }))
      .query(async ({ input }) => {
        const template = await getSlideTemplateByScreenType(input.screenType);
        if (!template) {
          // Return default template if none exists
          return {
            screenType: input.screenType,
            elements: JSON.stringify(getDefaultTemplateElements(input.screenType)),
            backgroundColor: "#1a1a2e",
            defaultFontFamily: "Inter",
            defaultFontColor: "#ffffff",
            showAnimations: true,
            animationStyle: "fade",
          };
        }
        return template;
      }),

    // Get default elements for a screen type
    getDefaultElements: publicProcedure
      .input(z.object({ screenType: z.string() }))
      .query(async ({ input }) => {
        return getDefaultTemplateElements(input.screenType);
      }),

    // Admin: Save/update template
    save: adminProcedure
      .input(z.object({
        screenType: z.string(),
        name: z.string().optional(),
        backgroundColor: z.string().optional(),
        backgroundGradient: z.string().nullable().optional(),
        backgroundImageUrl: z.string().nullable().optional(),
        elements: z.string(), // JSON string of TemplateElement[]
        defaultFontFamily: z.string().optional(),
        defaultFontColor: z.string().optional(),
        showAnimations: z.boolean().optional(),
        animationStyle: z.string().optional(),
        widgetOverrides: z.string().optional(), // JSON string of WidgetOverrides
      }))
      .mutation(async ({ input }) => {
        const template = await upsertSlideTemplate(input as any);
        return template;
      }),

    // Admin: Save per-screen template override (for individual custom slides)
    saveForScreen: adminProcedure
      .input(z.object({
        screenId: z.number(),
        elements: z.string(), // JSON string of TemplateElement[]
        backgroundColor: z.string().optional(),
        widgetOverrides: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const override = JSON.stringify({
          elements: input.elements,
          backgroundColor: input.backgroundColor || '#1a1a2e',
          widgetOverrides: input.widgetOverrides || null,
        });
        await updateScreen(input.screenId, { templateOverride: override });
        return { success: true };
      }),

    // Admin: Delete template (resets to default)
    delete: adminProcedure
      .input(z.object({ screenType: z.string() }))
      .mutation(async ({ input }) => {
        await deleteSlideTemplate(input.screenType);
        return { success: true };
      }),

    // Admin: Seed default templates
    seedDefaults: adminProcedure.mutation(async () => {
      await seedDefaultSlideTemplates();
      return { success: true };
    }),
  }),

  // ============ CATS ============
  cats: router({
    // Public: Get available cats (for TV display)
    getAvailable: publicProcedure.query(async () => {
      return getAvailableCats();
    }),

    // Public: Get adopted cats
    getAdopted: publicProcedure.query(async () => {
      return getAdoptedCats();
    }),

    // Public: Get featured cat (Cat of the Week)
    getFeatured: publicProcedure.query(async () => {
      return getFeaturedCat();
    }),

    // Public: Get recently adopted cats
    getRecentlyAdopted: publicProcedure
      .input(z.object({ days: z.number().default(30) }).optional())
      .query(async ({ input }) => {
        return getRecentlyAdoptedCatsFromTable(input?.days ?? 30);
      }),

    // Public: Get cat counts
    getCounts: publicProcedure.query(async () => {
      return getCatCount();
    }),

    // Public: Get single cat by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getCatById(input.id);
      }),

    // Admin: Get all cats (including staff-only fields)
    getAll: adminProcedure.query(async () => {
      return getAllCats();
    }),

    // Admin: Get cats by status
    getByStatus: adminProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        return getCatsByStatus(input.status);
      }),

    // Admin: Create a new cat
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        photoUrl: z.string().max(1024).nullable().optional(),
        breed: z.string().max(255).optional(),
        colorPattern: z.string().max(255).nullable().optional(),
        dob: z.date().nullable().optional(),
        sex: z.enum(["female", "male", "unknown"]).default("unknown"),
        weight: z.string().max(50).nullable().optional(),
        personalityTags: z.array(z.string()).nullable().optional(),
        bio: z.string().nullable().optional(),
        adoptionFee: z.string().max(50).optional(),
        isAltered: z.boolean().default(false),
        felvFivStatus: z.enum(["negative", "positive", "unknown", "not_tested"]).default("not_tested"),
        status: z.enum(["available", "adopted", "adopted_in_lounge", "medical_hold", "foster", "trial"]).default("available"),
        rescueId: z.string().max(100).nullable().optional(),
        shelterluvId: z.string().max(100).nullable().optional(),
        microchipNumber: z.string().max(100).nullable().optional(),
        arrivalDate: z.date().nullable().optional(),
        intakeType: z.string().max(100).nullable().optional(),
        medicalNotes: z.string().nullable().optional(),
        vaccinationsDue: z.array(z.object({ name: z.string(), dueDate: z.string() })).nullable().optional(),
        fleaTreatmentDue: z.date().nullable().optional(),
        adoptedDate: z.date().nullable().optional(),
        adoptedBy: z.string().max(255).nullable().optional(),
        isFeatured: z.boolean().default(false),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return createCat(input as any);
      }),

    // Admin: Update a cat
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        photoUrl: z.string().max(1024).nullable().optional(),
        breed: z.string().max(255).optional(),
        colorPattern: z.string().max(255).nullable().optional(),
        dob: z.date().nullable().optional(),
        sex: z.enum(["female", "male", "unknown"]).optional(),
        weight: z.string().max(50).nullable().optional(),
        personalityTags: z.array(z.string()).nullable().optional(),
        bio: z.string().nullable().optional(),
        adoptionFee: z.string().max(50).optional(),
        isAltered: z.boolean().optional(),
        felvFivStatus: z.enum(["negative", "positive", "unknown", "not_tested"]).optional(),
        status: z.enum(["available", "adopted", "adopted_in_lounge", "medical_hold", "foster", "trial"]).optional(),
        rescueId: z.string().max(100).nullable().optional(),
        shelterluvId: z.string().max(100).nullable().optional(),
        microchipNumber: z.string().max(100).nullable().optional(),
        arrivalDate: z.date().nullable().optional(),
        intakeType: z.string().max(100).nullable().optional(),
        medicalNotes: z.string().nullable().optional(),
        vaccinationsDue: z.array(z.object({ name: z.string(), dueDate: z.string() })).nullable().optional(),
        fleaTreatmentDue: z.date().nullable().optional(),
        adoptedDate: z.date().nullable().optional(),
        adoptedBy: z.string().max(255).nullable().optional(),
        isFeatured: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        // Strip undefined values to avoid overwriting existing data
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== undefined)
        );
        return updateCat(id, cleanData as any);
      }),

    // Admin: Delete a cat
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteCat(input.id);
      }),

    // Admin: Bulk update cat status
    bulkUpdateStatus: adminProcedure
      .input(z.object({
        ids: z.array(z.number()).min(1),
        status: z.enum(["available", "adopted", "adopted_in_lounge", "medical_hold", "foster", "trial"]),
      }))
      .mutation(async ({ input }) => {
        const count = await bulkUpdateCatStatus(input.ids, input.status);
        return { updated: count };
      }),

    // Admin: Parse kennel card / medical history documents using AI
    parseDocuments: adminProcedure
      .input(z.object({
        documents: z.array(z.object({
          data: z.string(), // Base64 encoded file data
          fileName: z.string(),
          mimeType: z.string(), // image/jpeg, image/png, application/pdf
        })),
      }))
      .mutation(async ({ input }) => {
        // Upload documents to S3 first so we have URLs for the LLM
        const docUrls: string[] = [];
        for (const doc of input.documents) {
          const buffer = Buffer.from(doc.data, "base64");
          const timestamp = Date.now();
          const fileKey = `cat-docs/${timestamp}-${doc.fileName}`;
          const { url } = await storagePut(fileKey, buffer, doc.mimeType);
          docUrls.push(url);
        }

        // Build LLM messages with document images/files
        const contentParts: any[] = [
          {
            type: "text" as const,
            text: `You are a veterinary data extraction assistant for a cat lounge. Extract all cat information from the uploaded kennel card and/or medical history documents.

Return a JSON object with these fields (use null for any field you cannot find):
{
  "name": string,
  "breed": string (e.g. "Domestic Shorthair", "Siamese"),
  "colorPattern": string (e.g. "Grey Tabby", "Orange", "Tuxedo"),
  "dob": string (ISO date format YYYY-MM-DD, calculate from age if only age is given),
  "sex": "male" | "female" | "unknown",
  "weight": string (e.g. "7.8 lbs"),
  "personalityTags": string[] (e.g. ["Good with Cats", "Good with Children", "Shy", "Playful"]),
  "bio": string (personality description, memo notes about the cat),
  "adoptionFee": string (e.g. "$150.00"),
  "isAltered": boolean (spayed/neutered),
  "felvFivStatus": "negative" | "positive" | "not_tested" (FeLV/FIV test results),
  "rescueId": string (e.g. "KRLA-A-8326"),
  "shelterluvId": string (Shelterluv animal ID number),
  "microchipNumber": string,
  "intakeType": string (e.g. "Transfer In", "Stray", "Owner Surrender"),
  "medicalNotes": string (dental work, surgeries, conditions, treatments - combine all medical info),
  "vaccinationsDue": [{"name": string, "dueDate": string}] (upcoming vaccination due dates in YYYY-MM-DD format),
  "fleaTreatmentDue": string (next flea treatment date in YYYY-MM-DD format)
}

Extract as much information as possible from the documents. For the bio, write a warm, friendly description based on any personality notes, memo text, or specification fields you find.`,
          },
        ];

        // Add each document as an image or file
        for (let i = 0; i < docUrls.length; i++) {
          const doc = input.documents[i];
          if (doc.mimeType === "application/pdf") {
            contentParts.push({
              type: "file_url" as const,
              file_url: {
                url: docUrls[i],
                mime_type: "application/pdf" as const,
              },
            });
          } else {
            contentParts.push({
              type: "image_url" as const,
              image_url: {
                url: docUrls[i],
                detail: "high" as const,
              },
            });
          }
        }

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: contentParts,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "cat_info",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  name: { type: ["string", "null"] },
                  breed: { type: ["string", "null"] },
                  colorPattern: { type: ["string", "null"] },
                  dob: { type: ["string", "null"], description: "ISO date YYYY-MM-DD" },
                  sex: { type: ["string", "null"], enum: ["male", "female", "unknown", null] },
                  weight: { type: ["string", "null"] },
                  personalityTags: { type: ["array", "null"], items: { type: "string" } },
                  bio: { type: ["string", "null"] },
                  adoptionFee: { type: ["string", "null"] },
                  isAltered: { type: ["boolean", "null"] },
                  felvFivStatus: { type: ["string", "null"], enum: ["negative", "positive", "not_tested", null] },
                  rescueId: { type: ["string", "null"] },
                  shelterluvId: { type: ["string", "null"] },
                  microchipNumber: { type: ["string", "null"] },
                  intakeType: { type: ["string", "null"] },
                  medicalNotes: { type: ["string", "null"] },
                  vaccinationsDue: {
                    type: ["array", "null"],
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        dueDate: { type: "string" },
                      },
                      required: ["name", "dueDate"],
                      additionalProperties: false,
                    },
                  },
                  fleaTreatmentDue: { type: ["string", "null"] },
                },
                required: [
                  "name", "breed", "colorPattern", "dob", "sex", "weight",
                  "personalityTags", "bio", "adoptionFee", "isAltered", "felvFivStatus",
                  "rescueId", "shelterluvId", "microchipNumber", "intakeType",
                  "medicalNotes", "vaccinationsDue", "fleaTreatmentDue"
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Failed to extract data from documents");
        }

        try {
          const textContent = typeof content === 'string' ? content : JSON.stringify(content);
          return JSON.parse(textContent);
        } catch {
          throw new Error("Failed to parse extracted data");
        }
      }),

    // Admin: Upload cat photo
    uploadPhoto: adminProcedure
      .input(z.object({
        catId: z.number(),
        photoData: z.string(), // Base64 encoded image data
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.photoData, "base64");
        const timestamp = Date.now();
        const fileKey = `cats/${input.catId}-${timestamp}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await updateCat(input.catId, { photoUrl: url });
        return { url };
      }),
  }),

  // ---- Roller Integration ----
  roller: router({
    getAvailability: publicProcedure
      .input(z.object({ date: z.string().optional() }))
      .query(async ({ input }) => {
        const date = input.date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
        const products = await getProductAvailability(date);
        
        // Filter to session products and format for TV display
        const sessionProducts = products.filter((p: any) => p.type === "sessionpass");
        
        return sessionProducts.map((product: any) => {
          const sessions = (product.sessions || []).map((s: any) => ({
            name: s.name,
            startTime: s.startTime,
            endTime: s.endTime,
            capacityRemaining: s.capacityRemaining,
            ticketCapacityRemaining: s.ticketCapacityRemaining,
            onlineSalesOpen: s.onlineSalesOpen,
          }));
          
          const cost = product.products?.[0]?.cost || 0;
          
          return {
            id: product.id || product.parentProductId,
            name: product.parentProductName || product.name,
            description: product.description || "",
            imageUrl: product.imageUrl || "",
            cost,
            sessions,
          };
        });
      }),

    getTodaySessions: publicProcedure.query(async () => {
      // Use PST date to avoid UTC offset issues (after 4 PM PST, UTC is already tomorrow)
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
      const products = await getProductAvailability(today);
      const sessionProducts = products.filter((p: any) => p.type === "sessionpass");
      
      // Flatten all sessions across products with product info
      const allSessions: any[] = [];
      for (const product of sessionProducts) {
        for (const session of (product.sessions || [])) {
          allSessions.push({
            productName: product.parentProductName || product.name,
            productId: product.id || product.parentProductId,
            description: product.description || "",
            cost: product.products?.[0]?.cost || 0,
            sessionName: session.name,
            startTime: session.startTime,
            endTime: session.endTime,
            capacityRemaining: session.capacityRemaining,
            ticketCapacityRemaining: session.ticketCapacityRemaining,
            onlineSalesOpen: session.onlineSalesOpen,
          });
        }
      }
      
      // Sort by start time
      allSessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      return allSessions;
    }),

    getBookings: protectedProcedure
      .input(z.object({
        dateFrom: z.string(),
        dateTo: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const bookings = await searchBookings({
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
        });
        return bookings;
      }),

    // Get today's bookings enriched with customer names and check-in status
    getTodayBookings: protectedProcedure
      .input(z.object({
        filter: z.enum(["today", "tomorrow", "week", "month"]).default("today"),
      }).optional())
      .query(async ({ input }) => {
      const filter = input?.filter || "today";
      // Use PST date since Catfé is in Santa Clarita, CA
      const nowDate = new Date();
      const nowPST = nowDate.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }); // "YYYY-MM-DD"
      const nowTimePST = nowDate.toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour12: false, hour: "2-digit", minute: "2-digit" }); // "HH:mm"

      // Helper to add days to a PST date string
       function addDaysPST(dateStr: string, days: number): string {
        const d = new Date(dateStr + "T12:00:00"); // noon to avoid DST issues
        d.setDate(d.getDate() + days);
        return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
      }

      // Compute date range based on filter
      let dateFrom = nowPST;
      let dateTo = nowPST;
      if (filter === "tomorrow") {
        dateFrom = addDaysPST(nowPST, 1);
        dateTo = dateFrom;
      } else if (filter === "week") {
        dateTo = addDaysPST(nowPST, 6); // next 7 days including today
      } else if (filter === "month") {
        dateTo = addDaysPST(nowPST, 29); // next 30 days including today
      }
      
      // Roller API only returns bookings for the specific `date` param.
      // For multi-day ranges, we need to fetch each day individually.
      let allBookings: any[] = [];
      if (dateFrom === dateTo) {
        // Single day: one API call
        allBookings = await searchBookings({ dateFrom });
      } else {
        // Multi-day: fetch each day in parallel (cap at 7 for week, 30 for month)
        const dates: string[] = [];
        let cursor = dateFrom;
        while (cursor <= dateTo) {
          dates.push(cursor);
          cursor = addDaysPST(cursor, 1);
          if (dates.length > 30) break; // safety cap
        }
        const results = await Promise.all(
          dates.map((d) => searchBookings({ dateFrom: d }).catch(() => []))
        );
        allBookings = results.flat();
      }
      
      // Deduplicate by bookingId in case of overlap
      const seen = new Set<number>();
      const filteredBookings = allBookings.filter((b: any) => {
        const id = b.bookingId;
        if (id && seen.has(id)) return false;
        if (id) seen.add(id);
        return true;
      });

      // Build product name + session endTime lookups from availability API
      // Use string keys to avoid number/string type mismatch with Roller API
      let productNameMap = new Map<string, string>();
      // Key: "productId:startTime" -> endTime from availability sessions
      let sessionEndTimeMap = new Map<string, string>();
      try {
        // Fetch availability for each unique date in the range
        const uniqueDates = new Set<string>();
        for (const b of filteredBookings) {
          const bd = b.items?.[0]?.bookingDate;
          if (bd) uniqueDates.add(bd);
        }
        if (uniqueDates.size === 0) uniqueDates.add(dateFrom);
        const availResults = await Promise.all(
          Array.from(uniqueDates).map((d) => getProductAvailability(d).catch(() => []))
        );
        for (const products of availResults) {
          for (const p of products) {
            const pid = p.id || p.parentProductId;
            const pname = p.parentProductName || p.name;
            if (pid && pname) productNameMap.set(String(pid), pname);
            for (const child of (p.products || [])) {
              if (child.id) productNameMap.set(String(child.id), pname);
            }
            // Extract session start/end times for accurate duration
            for (const session of (p.sessions || [])) {
              if (session.startTime && session.endTime) {
                // Map each child product's startTime to its endTime
                for (const child of (p.products || [])) {
                  if (child.id) {
                    sessionEndTimeMap.set(`${String(child.id)}:${session.startTime}`, session.endTime);
                  }
                }
                // Also map parent product ID
                if (pid) {
                  sessionEndTimeMap.set(`${String(pid)}:${session.startTime}`, session.endTime);
                }
              }
            }
          }
        }
      } catch { /* availability lookup is optional */ }
      
      // Enrich each booking with customer name and time-based status
      const enriched = await Promise.all(
        filteredBookings.map(async (booking: any) => {
          // Only show first name for guest privacy/safety
          let customerName = booking.name?.split(" ")[0] || "Guest";
          if (booking.customerId) {
            try {
              const customer = await getCustomerDetail(booking.customerId);
              if (customer?.firstName) {
                customerName = customer.firstName;
              }
            } catch { /* keep fallback name */ }
          }
          
          const ref = booking.bookingReference || booking.uniqueId || String(booking.bookingId);
          const items = booking.items || [];
          const sessionItem = items[0];
          const rawStartTime = sessionItem?.startTime || null;
          const bookingDate = sessionItem?.bookingDate || dateFrom;
          const quantity = sessionItem?.quantity || 1;

          const productId = sessionItem?.productId;
          const productName = (productId && productNameMap.get(String(productId))) || sessionItem?.productName || "Cat Lounge Session";
          
          const sessionStartTime = rawStartTime || null;
          let sessionEndTime: string | null = null;
          if (rawStartTime && productId) {
            // First try: exact endTime from availability sessions
            const lookupKey = `${String(productId)}:${rawStartTime}`;
            const exactEnd = sessionEndTimeMap.get(lookupKey);
            if (exactEnd) {
              sessionEndTime = exactEnd;
            } else {
              // Fallback: determine duration from product name
              // Mini Meow = 30 min, Study sessions = 90 min, Cat Lounge = 60 min
              const nameLower = productName.toLowerCase();
              const isMiniMeow = nameLower.includes("mini") || nameLower.includes("meow escape");
              const isStudy = nameLower.includes("study");
              const durationMin = isMiniMeow ? 30 : isStudy ? 90 : 60;
              const [h, m] = rawStartTime.split(":").map(Number);
              const totalMin = h * 60 + m + durationMin;
              const endH = Math.floor(totalMin / 60) % 24;
              const endM = totalMin % 60;
              sessionEndTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
            }
          } else if (rawStartTime) {
            // No productId: use product name to determine duration
            const nameLower2 = productName.toLowerCase();
            const fallbackMin = nameLower2.includes("mini") || nameLower2.includes("meow escape") ? 30 : nameLower2.includes("study") ? 90 : 60;
            const [h, m] = rawStartTime.split(":").map(Number);
            const totalMin = h * 60 + m + fallbackMin;
            const endH = Math.floor(totalMin / 60) % 24;
            const endM = totalMin % 60;
            sessionEndTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
          }
          
          // Time-based status only applies to today's bookings
          // Future bookings are always "upcoming"
          let status: "upcoming" | "checked_in" | "completed" | "expired" = "upcoming";
          if (bookingDate === nowPST && sessionStartTime && sessionEndTime) {
            if (nowTimePST >= sessionEndTime) {
              status = "completed";
            } else if (nowTimePST >= sessionStartTime) {
              status = "checked_in";
            }
          }
          
          return {
            bookingId: booking.bookingReference ? parseInt(booking.bookingReference) : null,
            bookingReference: ref,
            customerName,
            customerId: booking.customerId,
            productName,
            quantity,
            sessionStartTime,
            sessionEndTime,
            bookingDate,
            status,
            guestSessionId: null,
            total: booking.total || 0,
            bookingStatus: booking.status || "unknown",
            arrivedAt: null as string | null,
            markedByUserId: null as number | null,
          };
        })
      );

      // Look up arrival records for all bookings
      const bookingIds = enriched
        .map((b) => b.bookingId)
        .filter((id): id is number => id != null);
      let arrivalMap = new Map<number, { arrivedAt: Date; markedByUserId: number | null }>();
      if (bookingIds.length > 0) {
        try {
          const arrivals = await getBookingArrivals(bookingIds);
          for (const a of arrivals) {
            arrivalMap.set(a.bookingId, { arrivedAt: a.arrivedAt, markedByUserId: a.markedByUserId });
          }
        } catch { /* arrival lookup is optional */ }
      }

      // Merge arrival data into enriched bookings
      // If a guest has been marked as arrived, override status to checked_in
      // (handles early arrivals where time-based status would still show "upcoming")
      for (const b of enriched) {
        if (b.bookingId && arrivalMap.has(b.bookingId)) {
          const arrival = arrivalMap.get(b.bookingId)!;
          b.arrivedAt = arrival.arrivedAt.toISOString();
          b.markedByUserId = arrival.markedByUserId;
          // Override status: arrived guests are checked_in unless their session is already completed
          if (b.status !== "completed") {
            b.status = "checked_in";
          }
        }
      }
      
      // Sort: by date first, then by status priority, then by start time
      // upcoming & checked_in stay at top (active sessions), completed/expired sink to bottom
      enriched.sort((a, b) => {
        // Primary: date
        if (a.bookingDate && b.bookingDate && a.bookingDate !== b.bookingDate) {
          return a.bookingDate.localeCompare(b.bookingDate);
        }
        // Secondary: status priority — upcoming & checked_in are both "active" (0)
        // Only completed and expired move to the bottom
        const statusOrder = { upcoming: 0, checked_in: 0, expired: 1, completed: 2 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        // Tertiary: by session start time
        if (a.sessionStartTime && b.sessionStartTime) {
          return a.sessionStartTime.localeCompare(b.sessionStartTime);
        }
        return 0;
      });
      
      return enriched;
    }),

    // Mark a Roller booking guest as physically arrived
    // Also auto-creates a guest session using the booked start/end times
    // (Roller guests get their booked slot only — no makeup time for late arrivals)
    markArrived: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        bookingRef: z.string().optional(),
        guestName: z.string().optional(),
        partySize: z.number().optional(),
        startTime: z.string().optional(), // "HH:mm" booked start
        endTime: z.string().optional(),   // "HH:mm" booked end
        productName: z.string().optional(),
        startNow: z.boolean().optional(), // If true, start session immediately (early arrival)
      }))
      .mutation(async ({ input, ctx }) => {
        const arrival = await markBookingArrived({
          bookingId: input.bookingId,
          bookingRef: input.bookingRef,
          markedByUserId: ctx.user.id,
          guestName: input.guestName,
          partySize: input.partySize,
        });

        // Auto-create a guest session using the booked time slot
        let sessionId: number | null = null;
        if (input.startTime && input.endTime && input.guestName) {
          // Build Date objects from the booked HH:mm times in PST/PDT
          const todayPST = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
          const [startH, startM] = input.startTime.split(':').map(Number);
          const [endH, endM] = input.endTime.split(':').map(Number);
          
          // Determine if we're in PST (-08:00) or PDT (-07:00)
          // Check by comparing UTC offset for today's date in LA
          const testDate = new Date(`${todayPST}T12:00:00Z`);
          const laTime = new Date(testDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
          const utcTime = new Date(testDate.toLocaleString('en-US', { timeZone: 'UTC' }));
          const offsetHours = (utcTime.getTime() - laTime.getTime()) / (1000 * 60 * 60);
          const tzOffset = offsetHours >= 8 ? '-08:00' : '-07:00'; // PST or PDT
          
          const bookedCheckIn = new Date(`${todayPST}T${input.startTime}:00${tzOffset}`);
          const bookedExpires = new Date(`${todayPST}T${input.endTime}:00${tzOffset}`);
          
          // Calculate duration in minutes for the enum
          const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
          
          // If startNow is true, start the session immediately with the same duration
          const nowDate = new Date();
          const checkInAt = input.startNow ? nowDate : bookedCheckIn;
          const expiresAt = input.startNow ? new Date(nowDate.getTime() + durationMinutes * 60 * 1000) : bookedExpires;
          let duration: "15" | "30" | "60" | "90" = "60";
          if (durationMinutes <= 15) duration = "15";
          else if (durationMinutes <= 30) duration = "30";
          else if (durationMinutes <= 60) duration = "60";
          else duration = "90";

          try {
            const session = await createGuestSession({
              guestName: input.guestName,
              guestCount: input.partySize || 1,
              duration,
              checkInAt,
              expiresAt,
              notes: `Roller: ${input.productName || 'Session'} (Ref #${input.bookingRef || input.bookingId})`,
              rollerBookingRef: input.bookingRef || String(input.bookingId),
            });
            sessionId = session.id;
          } catch (err: any) {
            console.error('[Mark Arrived] Failed to create guest session:', err.message);
          }
        }

        return { success: !!arrival, arrival, sessionId };
      }),

    // Undo marking a booking as arrived
    // Also removes the auto-created guest session
    unmarkArrived: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        bookingRef: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const success = await unmarkBookingArrived(input.bookingId);
        
        // Remove the auto-created guest session for this booking
        if (input.bookingRef) {
          try {
            const { getDb } = await import('./db');
            const db = await getDb();
            if (db) {
              const { guestSessions } = await import('../drizzle/schema');
              const { eq, and } = await import('drizzle-orm');
              await db.delete(guestSessions)
                .where(eq(guestSessions.rollerBookingRef, input.bookingRef));
            }
          } catch (err: any) {
            console.error('[Unmark Arrived] Failed to remove guest session:', err.message);
          }
        }
        
        return { success };
      }),

    // Get waiver status for a booking's guests
    getWaiverSummary: protectedProcedure
      .input(z.object({ bookingRef: z.string() }))
      .query(async ({ input }) => {
        return getBookingWaiverSummary(input.bookingRef);
      }),

    // Get waiver summaries for multiple bookings in batch
    getBatchWaiverSummaries: protectedProcedure
      .input(z.object({ bookingRefs: z.array(z.string()).max(50) }))
      .query(async ({ input }) => {
        const results = await Promise.allSettled(
          input.bookingRefs.map((ref) => getBookingWaiverSummary(ref))
        );
        const summaries: Record<string, BookingWaiverSummary> = {};
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === "fulfilled") {
            summaries[input.bookingRefs[i]] = result.value;
          }
        }
        return summaries;
      }),

    // Get add-ons for a booking
    getBookingAddOns: protectedProcedure
      .input(z.object({
        bookingRef: z.string(),
        mainProductId: z.number().optional(),
        date: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const date = input.date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
        return getBookingAddOnsWithNames(input.bookingRef, input.mainProductId, date);
      }),

    // Get add-ons for multiple bookings in batch
    getBatchBookingAddOns: protectedProcedure
      .input(z.object({
        bookings: z.array(z.object({
          bookingRef: z.string(),
          mainProductId: z.number().optional(),
        })).max(50),
        date: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const date = input.date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
        // Pre-cache product names for the date
        try {
          const products = await getProductAvailability(date);
          cacheProductNames(products);
        } catch { /* ignore */ }

        const results = await Promise.allSettled(
          input.bookings.map((b) => getBookingAddOnsWithNames(b.bookingRef, b.mainProductId, undefined))
        );
        const addOnsMap: Record<string, BookingAddOn[]> = {};
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === "fulfilled") {
            addOnsMap[input.bookings[i].bookingRef] = result.value;
          }
        }
        return addOnsMap;
      }),

    // Get integration status (polling + webhook + connection)
    getStatus: protectedProcedure.query(async () => {
      const pollingStatus = getRollerPollingStatus();
      const connectionTest = await testConnection();
      // Also get the settings toggle value
      const settingsRow = await getSettings();
      return {
        ...pollingStatus,
        pollingEnabled: settingsRow?.rollerPollingEnabled ?? false,
        connectionOk: connectionTest.success,
        productCount: connectionTest.productCount,
        connectionError: connectionTest.error,
      };
    }),

    // Toggle Roller polling on/off
    togglePolling: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.update(settings).set({ rollerPollingEnabled: input.enabled }).where(eq(settings.id, 1));
        
        if (input.enabled) {
          // Start polling immediately
          const { enableRollerPolling } = await import("./rollerPolling");
          await enableRollerPolling();
        } else {
          // Stop polling
          const { stopRollerPolling } = await import("./rollerPolling");
          stopRollerPolling();
        }
        
        return { enabled: input.enabled };
      }),

    // Manual sync: trigger an immediate Roller data pull
    manualSync: adminProcedure.mutation(async () => {
      const result = await triggerManualSync();
      if (!result.success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error || "Sync failed" });
      }
      return { success: true, lastPollTime: result.lastPollTime };
    }),
  }),

  // ============ VOLUNTEERS ============
  volunteers: router({
    getAll: protectedProcedure.query(async () => {
      return getAllVolunteers();
    }),

    getActive: publicProcedure.query(async () => {
      return getActiveVolunteers();
    }),

    getFeatured: publicProcedure.query(async () => {
      return getFeaturedVolunteers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getVolunteerById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        photoUrl: z.string().max(1024).optional().nullable(),
        bio: z.string().optional().nullable(),
        role: z.string().max(255).optional().nullable(),
        startDate: z.date().optional().nullable(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return createVolunteer(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().min(1).max(255).optional(),
          photoUrl: z.string().max(1024).optional().nullable(),
          bio: z.string().optional().nullable(),
          role: z.string().max(255).optional().nullable(),
          startDate: z.date().optional().nullable(),
          isFeatured: z.boolean().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return updateVolunteer(input.id, input.data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteVolunteer(input.id);
      }),

    // Upload volunteer photo
    uploadPhoto: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const key = `volunteers/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url };
      }),
  }),

  // ============ INSTAGRAM / SOCIAL FEED ============
  instagram: router({
    // Public: Get visible posts for TV display
    getPosts: publicProcedure.query(async () => {
      return getVisibleInstagramPosts();
    }),

    // Admin: Get all posts including hidden
    getAll: protectedProcedure.query(async () => {
      return getAllInstagramPosts();
    }),

    // Admin: Toggle post visibility
    toggleVisibility: protectedProcedure
      .input(z.object({ id: z.number(), hidden: z.boolean() }))
      .mutation(async ({ input }) => {
        await hideInstagramPost(input.id, input.hidden);
        return { success: true };
      }),

    // Admin: Delete a cached post
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteInstagramPost(input.id);
      }),

    // Admin: Manually add an Instagram post by URL (for when API isn't connected)
    addManual: protectedProcedure
      .input(z.object({
        mediaUrl: z.string().url(),
        caption: z.string().optional().nullable(),
        permalink: z.string().url().optional().nullable(),
        mediaType: z.string().default("IMAGE"),
      }))
      .mutation(async ({ input }) => {
        const instagramId = `manual-${Date.now()}`;
        await upsertInstagramPost({
          instagramId,
          mediaType: input.mediaType,
          mediaUrl: input.mediaUrl,
          caption: input.caption || null,
          permalink: input.permalink || null,
          postedAt: new Date(),
        });
        return { success: true };
      }),

    // Admin: Upload a social media image directly (no Instagram API needed)
    uploadImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        contentType: z.string(),
        caption: z.string().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const key = `social-feed/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.contentType);
        const instagramId = `upload-${Date.now()}`;
        await upsertInstagramPost({
          instagramId,
          mediaType: "IMAGE",
          mediaUrl: url,
          caption: input.caption || null,
          postedAt: new Date(),
        });
        return { url };
      }),
  }),

  // ============ BIRTHDAYS ============
  birthdays: router({
    // Public: Get today's birthday cats for TV display
    getToday: publicProcedure.query(async () => {
      return getTodaysBirthdayCats();
    }),

    // Public: Get upcoming birthdays (next 30 days)
    getUpcoming: publicProcedure
      .input(z.object({ days: z.number().min(1).max(365).optional() }).optional())
      .query(async ({ input }) => {
        const days = input?.days ?? 30;
        return getCatsWithUpcomingBirthdays(days);
      }),
  }),

  // ============ GUEST CAT PHOTOS & VOTING ============
  catPhotos: router({
    // Public: Get all active photos for a cat
    getForCat: publicProcedure
      .input(z.object({ catId: z.number() }))
      .query(async ({ input }) => {
        return getPhotosForCat(input.catId);
      }),

    // Public: Get top 3 photos for a cat (for adoption slides)
    getTopForCat: publicProcedure
      .input(z.object({ catId: z.number(), limit: z.number().min(1).max(10).optional() }))
      .query(async ({ input }) => {
        return getTopPhotosForCat(input.catId, input.limit ?? 3);
      }),

    // Public: Get a single photo by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getGuestCatPhotoById(input.id);
      }),

    // Public: Get cat info + photos for voting page
    getCatVotingPage: publicProcedure
      .input(z.object({ catId: z.number() }))
      .query(async ({ input }) => {
        const cat = await getCatById(input.catId);
        if (!cat) throw new TRPCError({ code: "NOT_FOUND", message: "Cat not found" });
        const photos = await getPhotosForCat(input.catId);
        return { cat, photos };
      }),

    // Public: Check how many photos this uploader has for a cat
    getUploaderCount: publicProcedure
      .input(z.object({ catId: z.number(), fingerprint: z.string().min(1) }))
      .query(async ({ input }) => {
        const count = await countPhotosForCatByUploader(input.catId, input.fingerprint);
        return { count, remaining: Math.max(0, 3 - count) };
      }),

    // Public: Upload a photo for a cat (max 3 per guest per cat)
    upload: publicProcedure
      .input(z.object({
        catId: z.number(),
        uploaderName: z.string().min(1).max(100),
        uploaderFingerprint: z.string().min(1).max(64),
        caption: z.string().max(300).optional(),
        imageBase64: z.string(), // base64 encoded image
        mimeType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ input }) => {
        // Enforce 3-photo limit per uploader per cat
        const existingCount = await countPhotosForCatByUploader(input.catId, input.uploaderFingerprint);
        if (existingCount >= 3) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can only upload up to 3 photos per cat.",
          });
        }

        // Upload to S3
        const buffer = Buffer.from(input.imageBase64, "base64");
        const ext = input.mimeType.includes("png") ? "png" : "jpg";
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const fileKey = `cat-photos/${input.catId}/${input.uploaderFingerprint}-${Date.now()}-${randomSuffix}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Create database record
        const result = await createGuestCatPhoto({
          catId: input.catId,
          photoUrl: url,
          uploaderName: input.uploaderName,
          uploaderFingerprint: input.uploaderFingerprint,
          caption: input.caption || null,
        });

        return { id: result.id, photoUrl: url };
      }),

    // Admin: Toggle photo visibility
    toggleActive: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        return toggleGuestCatPhotoActive(input.id, input.isActive);
      }),

    // Public: Check if user has already free-voted on a photo
    hasVoted: publicProcedure
      .input(z.object({ photoId: z.number(), fingerprint: z.string().min(1) }))
      .query(async ({ input }) => {
        return { hasVoted: await hasVotedOnPhoto(input.photoId, input.fingerprint) };
      }),

    // Public: Check vote status for multiple photos at once
    getVoteStatus: publicProcedure
      .input(z.object({ photoIds: z.array(z.number()), fingerprint: z.string().min(1) }))
      .query(async ({ input }) => {
        if (input.photoIds.length === 0) return { votes: {} };
        const votes = await getVotesByFingerprint(input.fingerprint, input.photoIds);
        const voteMap: Record<number, { freeVoted: boolean; donationVotes: number }> = {};
        for (const photoId of input.photoIds) {
          voteMap[photoId] = { freeVoted: false, donationVotes: 0 };
        }
        for (const vote of votes) {
          if (!voteMap[vote.photoId]) voteMap[vote.photoId] = { freeVoted: false, donationVotes: 0 };
          if (!vote.isDonationVote) {
            voteMap[vote.photoId].freeVoted = true;
          } else {
            voteMap[vote.photoId].donationVotes += vote.voteCount;
          }
        }
        return { votes: voteMap };
      }),

    // Public: Cast a free vote (1 per person per photo)
    castFreeVote: publicProcedure
      .input(z.object({ photoId: z.number(), fingerprint: z.string().min(1) }))
      .mutation(async ({ input }) => {
        // Check if already voted
        const alreadyVoted = await hasVotedOnPhoto(input.photoId, input.fingerprint);
        if (alreadyVoted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already voted on this photo.",
          });
        }
        // Verify photo exists
        const photo = await getGuestCatPhotoById(input.photoId);
        if (!photo || !photo.isActive) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found" });
        }
        return castFreeVote(input.photoId, input.fingerprint);
      }),

    // Public: Cast donation votes (uses tokens)
    castDonationVotes: publicProcedure
      .input(z.object({
        photoId: z.number(),
        fingerprint: z.string().min(1),
        votes: z.number().min(1).max(100),
      }))
      .mutation(async ({ input }) => {
        // Verify photo exists
        const photo = await getGuestCatPhotoById(input.photoId);
        if (!photo || !photo.isActive) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found" });
        }
        // Consume tokens
        const consumed = await consumeTokens(input.fingerprint, input.votes);
        if (!consumed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not enough vote tokens. Purchase more via donation.",
          });
        }
        return castDonationVotes(input.photoId, input.fingerprint, input.votes);
      }),

    // Public: Get token balance for a fingerprint
    getTokenBalance: publicProcedure
      .input(z.object({ fingerprint: z.string().min(1) }))
      .query(async ({ input }) => {
        const balance = await getTokenBalanceByFingerprint(input.fingerprint);
        return { balance };
      }),

    // Public: Get all available cats with their top photos (for TV adoption slides)
    getAvailableCatsWithPhotos: publicProcedure.query(async () => {
      return getAvailableCatsWithTopPhotos();
    }),

    // Public: Get top voted photos across all cats (for TV display)
    getTopPhotosForTV: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(20).optional() }))
      .query(async ({ input }) => {
        return getTopPhotosForTV(input.limit ?? 6);
      }),

    // Public: Get donation tiers
    getDonationTiers: publicProcedure.query(() => {
      return DONATION_TIERS;
    }),

    // Public: Create Stripe checkout session for donation vote tokens
    createDonationCheckout: publicProcedure
      .input(z.object({
        tierId: z.string(),
        fingerprint: z.string().min(1),
        donorName: z.string().max(100).optional(),
        catId: z.number().optional(),
        catName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const tier = getDonationTier(input.tierId);
        if (!tier) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid donation tier" });
        }
        const origin = ctx.req.headers.origin || "https://catfetv-amdmxcoq.manus.space";
        const { url } = await createDonationCheckoutSession({
          tierId: tier.id,
          tierLabel: tier.label,
          amountCents: tier.amountCents,
          tokens: tier.tokens,
          fingerprint: input.fingerprint,
          donorName: input.donorName,
          catId: input.catId,
          catName: input.catName,
          origin,
        });
        return { checkoutUrl: url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
