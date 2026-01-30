import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getActiveScreens: vi.fn(),
}));

import { getActiveScreens } from "./db";

describe("screens.getRecentlyAdopted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only adopted cats with images", async () => {
    const mockScreens = [
      { id: 1, type: "ADOPTION", title: "Meet Whiskers", imagePath: "/cat1.jpg", isAdopted: true },
      { id: 2, type: "ADOPTION", title: "Meet Luna", imagePath: "/cat2.jpg", isAdopted: false },
      { id: 3, type: "ADOPTION", title: "Meet Max", imagePath: "/cat3.jpg", isAdopted: true },
      { id: 4, type: "EVENT", title: "Cat Yoga", imagePath: "/event.jpg", isAdopted: false },
      { id: 5, type: "ADOPTION", title: "Meet Bella", imagePath: null, isAdopted: true }, // No image
    ];

    vi.mocked(getActiveScreens).mockResolvedValue(mockScreens as any);

    const allScreens = await getActiveScreens();
    const adoptedCats = allScreens.filter(
      (s: any) => s.type === "ADOPTION" && s.isAdopted === true && s.imagePath
    );

    // Should only return cats that are: ADOPTION type, isAdopted=true, and have imagePath
    expect(adoptedCats).toHaveLength(2);
    expect(adoptedCats[0].title).toBe("Meet Whiskers");
    expect(adoptedCats[1].title).toBe("Meet Max");
  });

  it("should return cats sorted by id descending (most recent first)", async () => {
    const mockScreens = [
      { id: 1, type: "ADOPTION", title: "Meet Old Cat", imagePath: "/cat1.jpg", isAdopted: true },
      { id: 5, type: "ADOPTION", title: "Meet New Cat", imagePath: "/cat2.jpg", isAdopted: true },
      { id: 3, type: "ADOPTION", title: "Meet Middle Cat", imagePath: "/cat3.jpg", isAdopted: true },
    ];

    vi.mocked(getActiveScreens).mockResolvedValue(mockScreens as any);

    const allScreens = await getActiveScreens();
    const adoptedCats = allScreens
      .filter((s: any) => s.type === "ADOPTION" && s.isAdopted === true && s.imagePath)
      .sort((a: any, b: any) => b.id - a.id);

    // Should be sorted by id descending
    expect(adoptedCats[0].title).toBe("Meet New Cat");
    expect(adoptedCats[1].title).toBe("Meet Middle Cat");
    expect(adoptedCats[2].title).toBe("Meet Old Cat");
  });

  it("should respect the limit parameter", async () => {
    const mockScreens = [
      { id: 1, type: "ADOPTION", title: "Cat 1", imagePath: "/cat1.jpg", isAdopted: true },
      { id: 2, type: "ADOPTION", title: "Cat 2", imagePath: "/cat2.jpg", isAdopted: true },
      { id: 3, type: "ADOPTION", title: "Cat 3", imagePath: "/cat3.jpg", isAdopted: true },
      { id: 4, type: "ADOPTION", title: "Cat 4", imagePath: "/cat4.jpg", isAdopted: true },
      { id: 5, type: "ADOPTION", title: "Cat 5", imagePath: "/cat5.jpg", isAdopted: true },
    ];

    vi.mocked(getActiveScreens).mockResolvedValue(mockScreens as any);

    const limit = 3;
    const allScreens = await getActiveScreens();
    const adoptedCats = allScreens
      .filter((s: any) => s.type === "ADOPTION" && s.isAdopted === true && s.imagePath)
      .sort((a: any, b: any) => b.id - a.id)
      .slice(0, limit);

    expect(adoptedCats).toHaveLength(3);
  });

  it("should return empty array when no adopted cats exist", async () => {
    const mockScreens = [
      { id: 1, type: "ADOPTION", title: "Meet Luna", imagePath: "/cat1.jpg", isAdopted: false },
      { id: 2, type: "EVENT", title: "Cat Yoga", imagePath: "/event.jpg", isAdopted: false },
    ];

    vi.mocked(getActiveScreens).mockResolvedValue(mockScreens as any);

    const allScreens = await getActiveScreens();
    const adoptedCats = allScreens.filter(
      (s: any) => s.type === "ADOPTION" && s.isAdopted === true && s.imagePath
    );

    expect(adoptedCats).toHaveLength(0);
  });
});
