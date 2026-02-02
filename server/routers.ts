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
  getGuestSessionByWixBookingId,
  createGuestSessionFromWixBooking,
  getWixSyncedSessionsToday,
  getUpcomingArrivals,
  getSuggestedCaptions,
  getAllSuggestedCaptions,
  createSuggestedCaption,
  updateSuggestedCaption,
  deleteSuggestedCaption,
  reorderSuggestedCaptions,
  seedDefaultCaptions,
} from "./db";
import {
  testWixConnection,
  getTodaysWixBookings,
  mapBookingToSessionType,
  type WixBooking,
} from "./wixBookings";
import {
  getAutoSyncStatus,
  toggleAutoSync,
  syncWixBookings,
} from "./wixAutoSync";
import { storagePut } from "./storage";
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
  isProtected: z.boolean().default(false),
  isAdopted: z.boolean().default(false),
  livestreamUrl: z.string().url().max(1024).nullable().optional().or(z.literal("")),
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
});

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

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
    // Public: Get all active screens (for TV display)
    getActive: publicProcedure.query(async () => {
      return getActiveScreens();
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
        return createScreen(data);
      }),

    // Update screen
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: screenInput.partial(),
      }))
      .mutation(async ({ input }) => {
        const screen = await getScreenById(input.id);
        if (!screen) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Screen not found' });
        }
        // Clean up empty qrUrl
        const data = {
          ...input.data,
          qrUrl: input.data.qrUrl === "" ? null : input.data.qrUrl,
        };
        return updateScreen(input.id, data);
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

    // Get upcoming arrivals (for welcome screen)
    getUpcomingArrivals: publicProcedure
      .input(z.object({
        minutesAhead: z.number().min(5).max(60).default(15),
      }))
      .query(async ({ input }) => {
        return getUpcomingArrivals(input.minutesAhead);
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
        photoBase64: z.string(), // Base64 encoded image
        caption: z.string().max(500).optional(),
        catName: z.string().max(255).optional(), // For happy_tails
        adoptionDate: z.date().optional(), // For happy_tails
        backgroundStyle: z.enum(["blur", "gradient"]).optional(), // For portrait photos
      }))
      .mutation(async ({ input }) => {
        // Upload photo to S3
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${input.type}/${timestamp}-${randomSuffix}.jpg`;
        
        // Convert base64 to buffer
        const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Upload to S3
        const { url: photoUrl } = await storagePut(filename, buffer, 'image/jpeg');
        
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

  // Wix Bookings Integration
  wix: router({
    // Test Wix API connection
    testConnection: protectedProcedure.query(async () => {
      return testWixConnection();
    }),

    // Get today's bookings from Wix
    getTodaysBookings: protectedProcedure.query(async () => {
      try {
        const bookings = await getTodaysWixBookings();
        return {
          success: true,
          bookings: bookings.map((b: WixBooking) => ({
            id: b.id,
            guestName: `${b.contactDetails.firstName || ''} ${b.contactDetails.lastName || ''}`.trim() || 'Guest',
            email: b.contactDetails.email,
            phone: b.contactDetails.phone,
            startTime: b.bookedEntity?.slot?.startDate || b.startDate,
            endTime: b.bookedEntity?.slot?.endDate || b.endDate,
            participants: b.totalParticipants || 1,
            status: b.status,
          })),
        };
      } catch (error) {
        return {
          success: false,
          bookings: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

    // Sync today's Wix bookings to guest sessions
    syncTodaysBookings: protectedProcedure.mutation(async () => {
      try {
        const bookings = await getTodaysWixBookings();
        let synced = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const booking of bookings) {
          try {
            // Check if already synced
            const existing = await getGuestSessionByWixBookingId(booking.id);
            if (existing) {
              skipped++;
              continue;
            }

            // Map booking to session
            const startTime = new Date(booking.bookedEntity?.slot?.startDate || booking.startDate);
            const endTime = new Date(booking.bookedEntity?.slot?.endDate || booking.endDate);
            const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
            
            // Map duration to enum value
            let duration: "15" | "30" | "60" = "30";
            if (durationMinutes <= 20) duration = "15";
            else if (durationMinutes <= 40) duration = "30";
            else duration = "60";

            const guestName = `${booking.contactDetails.firstName || ''} ${booking.contactDetails.lastName || ''}`.trim() || 'Wix Guest';

            await createGuestSessionFromWixBooking({
              wixBookingId: booking.id,
              guestName,
              guestCount: booking.totalParticipants || 1,
              duration,
              checkInAt: startTime,
              expiresAt: endTime,
              status: startTime <= new Date() && endTime > new Date() ? 'active' : 
                      endTime <= new Date() ? 'completed' : 'active',
            });
            synced++;
          } catch (err) {
            errors.push(`Failed to sync booking ${booking.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }

        return {
          success: true,
          synced,
          skipped,
          total: bookings.length,
          errors: errors.length > 0 ? errors : undefined,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to sync bookings',
        });
      }
    }),

    // Get synced sessions from today
    getSyncedSessions: protectedProcedure.query(async () => {
      return getWixSyncedSessionsToday();
    }),

    // Get auto-sync status
    getAutoSyncStatus: protectedProcedure.query(async () => {
      return getAutoSyncStatus();
    }),

    // Toggle auto-sync on/off
    toggleAutoSync: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        toggleAutoSync(input.enabled);
        return { success: true, enabled: input.enabled };
      }),

    // Trigger manual sync (uses the same function as auto-sync)
    triggerSync: protectedProcedure.mutation(async () => {
      const result = await syncWixBookings();
      return result;
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
});

export type AppRouter = typeof appRouter;
