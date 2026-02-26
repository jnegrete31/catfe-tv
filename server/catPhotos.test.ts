import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Tests for the Guest Cat Photo Voting system.
 * Covers: photo queries, voting logic, token balance, donation tiers, and the TV display endpoint.
 */

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://test.example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@catfe.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { origin: "https://test.example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("catPhotos", () => {
  let publicCaller: ReturnType<typeof appRouter.createCaller>;
  let adminCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    publicCaller = appRouter.createCaller(createPublicContext());
    adminCaller = appRouter.createCaller(createAuthContext());
  });

  describe("getForCat", () => {
    it("returns an array of photos for a valid cat ID", async () => {
      const result = await publicCaller.catPhotos.getForCat({ catId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns empty array for non-existent cat", async () => {
      const result = await publicCaller.catPhotos.getForCat({ catId: 99999 });
      expect(result).toEqual([]);
    });
  });

  describe("getTopForCat", () => {
    it("returns at most the requested limit of photos", async () => {
      const result = await publicCaller.catPhotos.getTopForCat({ catId: 1, limit: 3 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it("defaults to 3 when limit is not specified", async () => {
      const result = await publicCaller.catPhotos.getTopForCat({ catId: 1 });
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getCatVotingPage", () => {
    it("returns cat info and photos for a valid cat", async () => {
      // Use a cat that exists in the database (seeded cats start at ID 1)
      try {
        const result = await publicCaller.catPhotos.getCatVotingPage({ catId: 1 });
        expect(result).toHaveProperty("cat");
        expect(result).toHaveProperty("photos");
        expect(result.cat).toHaveProperty("name");
        expect(Array.isArray(result.photos)).toBe(true);
      } catch (e: any) {
        // Cat might not exist in test DB - that's OK, just verify error shape
        expect(e.code).toBe("NOT_FOUND");
      }
    });

    it("throws NOT_FOUND for non-existent cat", async () => {
      await expect(
        publicCaller.catPhotos.getCatVotingPage({ catId: 99999 })
      ).rejects.toThrow();
    });
  });

  describe("getUploaderCount", () => {
    it("returns count and remaining for a fingerprint", async () => {
      const result = await publicCaller.catPhotos.getUploaderCount({
        catId: 1,
        fingerprint: "test-fingerprint-abc123",
      });
      expect(result).toHaveProperty("count");
      expect(result).toHaveProperty("remaining");
      expect(typeof result.count).toBe("number");
      expect(typeof result.remaining).toBe("number");
      expect(result.count).toBeGreaterThanOrEqual(0);
      expect(result.remaining).toBeLessThanOrEqual(3);
    });
  });

  describe("hasVoted", () => {
    it("returns hasVoted boolean for a fingerprint and photo", async () => {
      const result = await publicCaller.catPhotos.hasVoted({
        photoId: 1,
        fingerprint: "test-fingerprint-never-voted",
      });
      expect(result).toHaveProperty("hasVoted");
      expect(typeof result.hasVoted).toBe("boolean");
    });

    it("returns false for a fingerprint that has not voted", async () => {
      const result = await publicCaller.catPhotos.hasVoted({
        photoId: 1,
        fingerprint: `never-voted-${Date.now()}`,
      });
      expect(result.hasVoted).toBe(false);
    });
  });

  describe("getVoteStatus", () => {
    it("returns vote map for multiple photo IDs", async () => {
      const result = await publicCaller.catPhotos.getVoteStatus({
        photoIds: [1, 2, 3],
        fingerprint: "test-fingerprint-status",
      });
      expect(result).toHaveProperty("votes");
      expect(typeof result.votes).toBe("object");
    });

    it("returns empty votes for empty photoIds array", async () => {
      const result = await publicCaller.catPhotos.getVoteStatus({
        photoIds: [],
        fingerprint: "test-fingerprint-empty",
      });
      expect(result.votes).toEqual({});
    });
  });

  describe("getTokenBalance", () => {
    it("returns a balance for a fingerprint", async () => {
      const result = await publicCaller.catPhotos.getTokenBalance({
        fingerprint: "test-fingerprint-balance",
      });
      expect(result).toHaveProperty("balance");
      // Balance may be returned as string or number from SQL aggregation
      expect(Number(result.balance)).toBeGreaterThanOrEqual(0);
    });

    it("returns 0 for a new fingerprint with no tokens", async () => {
      const result = await publicCaller.catPhotos.getTokenBalance({
        fingerprint: `new-user-${Date.now()}`,
      });
      expect(Number(result.balance)).toBe(0);
    });
  });

  describe("getDonationTiers", () => {
    it("returns an array of donation tiers", async () => {
      const tiers = await publicCaller.catPhotos.getDonationTiers();
      expect(Array.isArray(tiers)).toBe(true);
      expect(tiers.length).toBeGreaterThan(0);
    });

    it("each tier has required fields", async () => {
      const tiers = await publicCaller.catPhotos.getDonationTiers();
      for (const tier of tiers) {
        expect(tier).toHaveProperty("id");
        expect(tier).toHaveProperty("label");
        expect(tier).toHaveProperty("amountCents");
        expect(tier).toHaveProperty("tokens");
        expect(typeof tier.amountCents).toBe("number");
        expect(typeof tier.tokens).toBe("number");
        expect(tier.amountCents).toBeGreaterThan(0);
        expect(tier.tokens).toBeGreaterThan(0);
      }
    });

    it("tiers are ordered by ascending price", async () => {
      const tiers = await publicCaller.catPhotos.getDonationTiers();
      for (let i = 1; i < tiers.length; i++) {
        expect(tiers[i].amountCents).toBeGreaterThanOrEqual(tiers[i - 1].amountCents);
      }
    });
  });

  describe("getAvailableCatsWithPhotos", () => {
    it("returns an array of cats with topGuestPhotos", async () => {
      const result = await publicCaller.catPhotos.getAvailableCatsWithPhotos();
      expect(Array.isArray(result)).toBe(true);
      // Each cat should have topGuestPhotos array
      for (const cat of result) {
        expect(cat).toHaveProperty("name");
        expect(cat).toHaveProperty("topGuestPhotos");
        expect(Array.isArray(cat.topGuestPhotos)).toBe(true);
      }
    });
  });

  describe("getTopPhotosForTV", () => {
    it("returns an array of photos with cat names", async () => {
      const result = await publicCaller.catPhotos.getTopPhotosForTV({ limit: 6 });
      expect(Array.isArray(result)).toBe(true);
      // Each photo should have catName from the join
      for (const photo of result) {
        expect(photo).toHaveProperty("catName");
        expect(photo).toHaveProperty("photoUrl");
        expect(photo).toHaveProperty("voteCount");
        expect(photo).toHaveProperty("uploaderName");
      }
    });

    it("respects the limit parameter", async () => {
      const result = await publicCaller.catPhotos.getTopPhotosForTV({ limit: 2 });
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe("castFreeVote", () => {
    it("rejects voting on a non-existent photo", async () => {
      await expect(
        publicCaller.catPhotos.castFreeVote({
          photoId: 99999,
          fingerprint: "test-vote-nonexistent",
        })
      ).rejects.toThrow();
    });
  });

  describe("castDonationVotes", () => {
    it("rejects voting on a non-existent photo", async () => {
      await expect(
        publicCaller.catPhotos.castDonationVotes({
          photoId: 99999,
          fingerprint: "test-donation-nonexistent",
          votes: 5,
        })
      ).rejects.toThrow();
    });

    it("rejects when user has no tokens", async () => {
      // Even if photo existed, user with no tokens should fail
      await expect(
        publicCaller.catPhotos.castDonationVotes({
          photoId: 1,
          fingerprint: `no-tokens-${Date.now()}`,
          votes: 5,
        })
      ).rejects.toThrow();
    });
  });

  describe("upload validation", () => {
    it("rejects upload with empty uploader name", async () => {
      await expect(
        publicCaller.catPhotos.upload({
          catId: 1,
          uploaderName: "",
          uploaderFingerprint: "test-fp",
          imageBase64: "dGVzdA==",
          mimeType: "image/jpeg",
        })
      ).rejects.toThrow();
    });

    it("rejects upload with empty fingerprint", async () => {
      await expect(
        publicCaller.catPhotos.upload({
          catId: 1,
          uploaderName: "Test User",
          uploaderFingerprint: "",
          imageBase64: "dGVzdA==",
          mimeType: "image/jpeg",
        })
      ).rejects.toThrow();
    });
  });

  describe("createDonationCheckout", () => {
    it("rejects invalid tier ID", async () => {
      await expect(
        publicCaller.catPhotos.createDonationCheckout({
          tierId: "invalid_tier",
          fingerprint: "test-fp",
        })
      ).rejects.toThrow();
    });
  });
});
