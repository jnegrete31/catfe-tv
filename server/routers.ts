import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getAllScreens,
  getActiveScreens,
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
} from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

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
  livestreamUrl: z.string().url().max(1024).nullable().optional().or(z.literal("")),
  eventTime: z.string().max(100).nullable().optional(),
  eventLocation: z.string().max(255).nullable().optional(),
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
  livestreamUrl: z.string().url().max(1024).nullable().optional().or(z.literal("")),
  eventTime: z.string().max(100).nullable().optional(),
  eventLocation: z.string().max(255).nullable().optional(),
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
      startAt: null, endAt: null, daysOfWeek: null, timeStart: null, timeEnd: null,
      priority: 1, durationSeconds: 10, sortOrder: 0,
      isActive: true, schedulingEnabled: false, isProtected: false, isAdopted: false,
      livestreamUrl: null, eventTime: null, eventLocation: null,
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
      return screens.map(screen => {
        const template = templateMap.get(screen.type);
        return {
          ...screen,
          templateOverlay: template ? {
            elements: template.elements, // JSON string of TemplateElement[]
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

    // Get random adoption screens for showcase (8 cats for 4x2 grid)
    getRandomAdoptions: publicProcedure
      .input(z.object({ count: z.number().min(1).max(12).default(8) }))
      .query(async ({ input }) => {
        const allScreens = await getActiveScreens();
        const adoptionScreens = allScreens.filter(s => s.type === 'ADOPTION' && s.imagePath);
        
        // Shuffle and take requested count
        const shuffled = adoptionScreens.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, input.count);
      }),

    // Get recently adopted cats for celebration banner
    getRecentlyAdopted: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
      .query(async ({ input }) => {
        const allScreens = await getActiveScreens();
        // Filter for adopted cats (isAdopted = true) with images
        const adoptedCats = allScreens.filter(s => 
          s.type === 'ADOPTION' && 
          (s as any).isAdopted === true && 
          s.imagePath
        );
        // Return the most recent ones (by id descending as proxy for recency)
        return adoptedCats
          .sort((a, b) => b.id - a.id)
          .slice(0, input.limit);
      }),

    // Get count of adopted cats (for success counter)
    getAdoptionCount: publicProcedure
      .query(async () => {
        const allScreens = await getAllScreens();
        // Count all adopted cats (both active and inactive)
        const adoptedCount = allScreens.filter(s => 
          s.type === 'ADOPTION' && 
          (s as any).isAdopted === true
        ).length;
        return { count: adoptedCount };
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
        duration: z.enum(["15", "30", "60"]),
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
      
      // Build a map of screenType -> template
      const templateMap = new Map<string, any>();
      for (const t of templates) {
        templateMap.set(t.screenType, t);
      }
      
      // Attach template overlay data to each screen
      return screens.map(screen => {
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
        status: z.enum(["available", "adopted", "medical_hold", "foster", "trial"]).default("available"),
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
        status: z.enum(["available", "adopted", "medical_hold", "foster", "trial"]).optional(),
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
});

export type AppRouter = typeof appRouter;
