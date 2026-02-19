import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getAllCats: vi.fn(),
  getAvailableCats: vi.fn(),
  getAdoptedCats: vi.fn(),
  getFeaturedCat: vi.fn(),
  getCatById: vi.fn(),
  createCat: vi.fn(),
  updateCat: vi.fn(),
  deleteCat: vi.fn(),
  getCatsByStatus: vi.fn(),
  getRecentlyAdoptedCatsFromTable: vi.fn(),
  getCatCount: vi.fn(),
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
  getActiveGuests: vi.fn(),
  checkInGuest: vi.fn(),
  checkOutGuest: vi.fn(),
  getGuestHistory: vi.fn(),
  getGuestStats: vi.fn(),
  getGuestById: vi.fn(),
  updateGuest: vi.fn(),
  deleteGuest: vi.fn(),
  getGuestSessionHistory: vi.fn(),
  getGuestSessionStats: vi.fn(),
  getGuestSessionById: vi.fn(),
  getPhotos: vi.fn(),
  getPhotoById: vi.fn(),
  createPhoto: vi.fn(),
  updatePhoto: vi.fn(),
  deletePhoto: vi.fn(),
  getPhotosByStatus: vi.fn(),
  getApprovedPhotos: vi.fn(),
  togglePhotoLike: vi.fn(),
  getPhotoLikes: vi.fn(),
  getCaptions: vi.fn(),
  getCaptionById: vi.fn(),
  createCaption: vi.fn(),
  updateCaption: vi.fn(),
  deleteCaption: vi.fn(),
  getActiveCaptions: vi.fn(),
  createTemplatePoll: vi.fn(),
  getActivePolls: vi.fn(),
  getPollById: vi.fn(),
  votePoll: vi.fn(),
  createPoll: vi.fn(),
  updatePoll: vi.fn(),
  deletePoll: vi.fn(),
  getAllPolls: vi.fn(),
  getPlaylists: vi.fn(),
  getPlaylistById: vi.fn(),
  createPlaylist: vi.fn(),
  updatePlaylist: vi.fn(),
  deletePlaylist: vi.fn(),
  getPlaylistScreens: vi.fn(),
  setPlaylistScreens: vi.fn(),
  getActivePlaylist: vi.fn(),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/cat-photo.jpg", key: "cat-photo.jpg" }),
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
import { invokeLLM } from "./_core/llm";

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

const mockCat = {
  id: 1,
  name: "Judy",
  photoUrl: "https://s3.example.com/judy.jpg",
  breed: "Domestic Shorthair",
  colorPattern: "Grey Tabby",
  dob: new Date("2024-07-01"),
  sex: "female" as const,
  weight: "7.8 lbs",
  personalityTags: ["Good with Cats", "Good with Children"],
  bio: "Judy is a sweet, affectionate tabby who loves to cuddle.",
  adoptionFee: "$150.00",
  isAltered: true,
  felvFivStatus: "negative" as const,
  status: "available" as const,
  rescueId: "KRLA-A-8326",
  shelterluvId: "205889349",
  microchipNumber: "941000029293663",
  arrivalDate: new Date("2024-09-08"),
  intakeType: "Transfer In",
  medicalNotes: "Dental cleaning done 01/2026",
  vaccinationsDue: [{ name: "Rabies", dueDate: "2029-01-26" }],
  fleaTreatmentDue: new Date("2026-02-25"),
  adoptedDate: null,
  adoptedBy: null,
  isFeatured: false,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAdoptedCat = {
  ...mockCat,
  id: 2,
  name: "Whiskers",
  status: "adopted" as const,
  adoptedDate: new Date("2026-01-15"),
  adoptedBy: "Jane Doe",
};

// ============ PUBLIC PROCEDURES ============

describe("cats.getAvailable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns available cats for public users", async () => {
    vi.mocked(db.getAvailableCats).mockResolvedValue([mockCat]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getAvailable();

    expect(result).toEqual([mockCat]);
    expect(db.getAvailableCats).toHaveBeenCalled();
  });

  it("returns empty array when no available cats", async () => {
    vi.mocked(db.getAvailableCats).mockResolvedValue([]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getAvailable();

    expect(result).toEqual([]);
  });
});

describe("cats.getAdopted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns adopted cats for public users", async () => {
    vi.mocked(db.getAdoptedCats).mockResolvedValue([mockAdoptedCat]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getAdopted();

    expect(result).toEqual([mockAdoptedCat]);
    expect(db.getAdoptedCats).toHaveBeenCalled();
  });
});

describe("cats.getFeatured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns featured cat when one exists", async () => {
    const featuredCat = { ...mockCat, isFeatured: true };
    vi.mocked(db.getFeaturedCat).mockResolvedValue(featuredCat);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getFeatured();

    expect(result).toEqual(featuredCat);
    expect(result!.isFeatured).toBe(true);
  });

  it("returns null when no featured cat", async () => {
    vi.mocked(db.getFeaturedCat).mockResolvedValue(null);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getFeatured();

    expect(result).toBeNull();
  });
});

describe("cats.getCounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cat counts for public users", async () => {
    const counts = { available: 5, adopted: 3, total: 8 };
    vi.mocked(db.getCatCount).mockResolvedValue(counts);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getCounts();

    expect(result).toEqual(counts);
    expect(result.available).toBe(5);
    expect(result.adopted).toBe(3);
    expect(result.total).toBe(8);
  });
});

describe("cats.getById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a cat by ID", async () => {
    vi.mocked(db.getCatById).mockResolvedValue(mockCat);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getById({ id: 1 });

    expect(result).toEqual(mockCat);
    expect(db.getCatById).toHaveBeenCalledWith(1);
  });

  it("returns null for non-existent cat", async () => {
    vi.mocked(db.getCatById).mockResolvedValue(null);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getById({ id: 999 });

    expect(result).toBeNull();
  });
});

// ============ ADMIN PROCEDURES ============

describe("cats.getAll (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all cats for admin users", async () => {
    vi.mocked(db.getAllCats).mockResolvedValue([mockCat, mockAdoptedCat]);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getAll();

    expect(result).toHaveLength(2);
    expect(db.getAllCats).toHaveBeenCalled();
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.cats.getAll()).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.cats.getAll()).rejects.toThrow();
  });
});

describe("cats.create (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new cat for admin users", async () => {
    vi.mocked(db.createCat).mockResolvedValue(mockCat);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.create({
      name: "Judy",
      breed: "Domestic Shorthair",
      sex: "female",
      status: "available",
    });

    expect(result).toEqual(mockCat);
    expect(db.createCat).toHaveBeenCalled();
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.cats.create({
        name: "Judy",
        sex: "female",
        status: "available",
      })
    ).rejects.toThrow();
  });

  it("validates required name field", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.cats.create({
        name: "",
        sex: "female",
        status: "available",
      })
    ).rejects.toThrow();
  });
});

describe("cats.update (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a cat for admin users", async () => {
    const updatedCat = { ...mockCat, name: "Judy Updated" };
    vi.mocked(db.updateCat).mockResolvedValue(updatedCat);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.update({
      id: 1,
      name: "Judy Updated",
    });

    expect(result).toEqual(updatedCat);
    expect(db.updateCat).toHaveBeenCalledWith(1, expect.objectContaining({ name: "Judy Updated" }));
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.cats.update({ id: 1, name: "Hacked" })
    ).rejects.toThrow();
  });
});

describe("cats.delete (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a cat for admin users", async () => {
    vi.mocked(db.deleteCat).mockResolvedValue(true);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.delete({ id: 1 });

    expect(result).toBe(true);
    expect(db.deleteCat).toHaveBeenCalledWith(1);
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.cats.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("cats.getRecentlyAdopted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns recently adopted cats with default 30 days", async () => {
    vi.mocked(db.getRecentlyAdoptedCatsFromTable).mockResolvedValue([mockAdoptedCat]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getRecentlyAdopted();

    expect(result).toEqual([mockAdoptedCat]);
    expect(db.getRecentlyAdoptedCatsFromTable).toHaveBeenCalledWith(30);
  });

  it("accepts custom days parameter", async () => {
    vi.mocked(db.getRecentlyAdoptedCatsFromTable).mockResolvedValue([]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.getRecentlyAdopted({ days: 7 });

    expect(result).toEqual([]);
    expect(db.getRecentlyAdoptedCatsFromTable).toHaveBeenCalledWith(7);
  });
});


describe("cats.parseDocuments (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts cat data from uploaded documents via LLM", async () => {
    const mockExtractedData = {
      name: "Judy",
      breed: "Domestic Shorthair",
      colorPattern: "Grey Tabby",
      dob: "2024-07-01",
      sex: "female",
      weight: "7.8 lbs",
      personalityTags: ["Good with Cats", "Shy"],
      bio: "Judy is a sweet, affectionate tabby.",
      adoptionFee: "$150.00",
      isAltered: true,
      felvFivStatus: "negative",
      rescueId: "KRLA-A-8326",
      shelterluvId: "205889349",
      microchipNumber: "941000029293663",
      intakeType: "Transfer In",
      medicalNotes: "Dental cleaning performed.",
      vaccinationsDue: [{ name: "Rabies", dueDate: "2029-01-15" }],
      fleaTreatmentDue: "2026-02-25",
    };

    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify(mockExtractedData),
          role: "assistant",
        },
        index: 0,
        finish_reason: "stop",
      }],
    } as any);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.parseDocuments({
      documents: [{
        data: "dGVzdA==",
        fileName: "kennel-card.jpg",
        mimeType: "image/jpeg",
      }],
    });

    expect(result.name).toBe("Judy");
    expect(result.breed).toBe("Domestic Shorthair");
    expect(result.sex).toBe("female");
    expect(result.isAltered).toBe(true);
    expect(result.vaccinationsDue).toHaveLength(1);
    expect(invokeLLM).toHaveBeenCalledOnce();
  });

  it("rejects non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.cats.parseDocuments({
        documents: [{
          data: "dGVzdA==",
          fileName: "kennel-card.jpg",
          mimeType: "image/jpeg",
        }],
      })
    ).rejects.toThrow();
  });

  it("handles LLM returning empty content", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{
        message: {
          content: null,
          role: "assistant",
        },
        index: 0,
        finish_reason: "stop",
      }],
    } as any);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.cats.parseDocuments({
        documents: [{
          data: "dGVzdA==",
          fileName: "kennel-card.jpg",
          mimeType: "image/jpeg",
        }],
      })
    ).rejects.toThrow("Failed to extract data from documents");
  });

  it("handles multiple documents (kennel card + medical history)", async () => {
    const mockExtractedData = {
      name: "Apollo",
      breed: "Domestic Shorthair",
      colorPattern: "Orange Tabby",
      dob: "2023-03-15",
      sex: "male",
      weight: "10.2 lbs",
      personalityTags: ["Playful", "Social"],
      bio: "Apollo is a big friendly orange boy.",
      adoptionFee: "$150.00",
      isAltered: true,
      felvFivStatus: "negative",
      rescueId: "KRLA-A-9001",
      shelterluvId: "205889999",
      microchipNumber: "941000029299999",
      intakeType: "Transfer In",
      medicalNotes: "Up to date on all vaccines.",
      vaccinationsDue: [
        { name: "Rabies", dueDate: "2029-03-15" },
        { name: "FVRCP", dueDate: "2027-03-15" },
      ],
      fleaTreatmentDue: "2026-03-01",
    };

    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify(mockExtractedData),
          role: "assistant",
        },
        index: 0,
        finish_reason: "stop",
      }],
    } as any);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cats.parseDocuments({
      documents: [
        {
          data: "dGVzdA==",
          fileName: "kennel-card.jpg",
          mimeType: "image/jpeg",
        },
        {
          data: "dGVzdDI=",
          fileName: "medical-history.pdf",
          mimeType: "application/pdf",
        },
      ],
    });

    expect(result.name).toBe("Apollo");
    expect(result.vaccinationsDue).toHaveLength(2);
  });
});
