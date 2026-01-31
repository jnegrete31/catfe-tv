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
} from "./db";

// Screen type enum values
const screenTypes = [
  "SNAP_AND_PURR",
  "EVENT",
  "TODAY_AT_CATFE",
  "MEMBERSHIP",
  "REMINDER",
  "ADOPTION",
  "ADOPTION_SHOWCASE",
  "THANK_YOU",
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

    // Get random adoption screens for showcase
    getRandomAdoptions: publicProcedure
      .input(z.object({ count: z.number().min(1).max(8).default(4) }))
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
});

export type AppRouter = typeof appRouter;
