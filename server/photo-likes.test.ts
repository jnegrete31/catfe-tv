import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { likePhoto, unlikePhoto, hasLikedPhoto, getPhotosByLikes, getUserLikedPhotos } from './db';

describe('Photo Likes API', () => {
  // Use a test fingerprint
  const testFingerprint = 'test_fingerprint_' + Date.now();
  let testPhotoId: number | null = null;

  beforeAll(async () => {
    // Get an existing approved photo to test with
    const photos = await getPhotosByLikes('snap_purr', 1);
    if (photos.length > 0) {
      testPhotoId = photos[0].id;
    }
  });

  describe('likePhoto', () => {
    it('should successfully like a photo', async () => {
      if (!testPhotoId) {
        console.log('Skipping test - no photos available');
        return;
      }
      
      const result = await likePhoto(testPhotoId, testFingerprint);
      expect(result.success).toBe(true);
    });

    it('should prevent duplicate likes from same fingerprint', async () => {
      if (!testPhotoId) {
        console.log('Skipping test - no photos available');
        return;
      }
      
      const result = await likePhoto(testPhotoId, testFingerprint);
      expect(result.success).toBe(false);
      expect(result.alreadyLiked).toBe(true);
    });
  });

  describe('hasLikedPhoto', () => {
    it('should return true for liked photo', async () => {
      if (!testPhotoId) {
        console.log('Skipping test - no photos available');
        return;
      }
      
      const hasLiked = await hasLikedPhoto(testPhotoId, testFingerprint);
      expect(hasLiked).toBe(true);
    });

    it('should return false for unliked photo', async () => {
      if (!testPhotoId) {
        console.log('Skipping test - no photos available');
        return;
      }
      
      const hasLiked = await hasLikedPhoto(testPhotoId, 'different_fingerprint');
      expect(hasLiked).toBe(false);
    });
  });

  describe('getUserLikedPhotos', () => {
    it('should return array of liked photo IDs', async () => {
      if (!testPhotoId) {
        console.log('Skipping test - no photos available');
        return;
      }
      
      const likedIds = await getUserLikedPhotos(testFingerprint);
      expect(Array.isArray(likedIds)).toBe(true);
      expect(likedIds).toContain(testPhotoId);
    });

    it('should return empty array for user with no likes', async () => {
      const likedIds = await getUserLikedPhotos('nonexistent_fingerprint');
      expect(Array.isArray(likedIds)).toBe(true);
      expect(likedIds.length).toBe(0);
    });
  });

  describe('getPhotosByLikes', () => {
    it('should return photos sorted by likes', async () => {
      const photos = await getPhotosByLikes('snap_purr', 10);
      expect(Array.isArray(photos)).toBe(true);
      
      // Verify photos are sorted by likesCount descending
      for (let i = 1; i < photos.length; i++) {
        expect(photos[i - 1].likesCount).toBeGreaterThanOrEqual(photos[i].likesCount);
      }
    });

    it('should respect limit parameter', async () => {
      const photos = await getPhotosByLikes('snap_purr', 3);
      expect(photos.length).toBeLessThanOrEqual(3);
    });
  });

  describe('unlikePhoto', () => {
    it('should successfully unlike a photo', async () => {
      if (!testPhotoId) {
        console.log('Skipping test - no photos available');
        return;
      }
      
      const result = await unlikePhoto(testPhotoId, testFingerprint);
      expect(result.success).toBe(true);
    });

    it('should fail when unliking a photo not liked', async () => {
      if (!testPhotoId) {
        console.log('Skipping test - no photos available');
        return;
      }
      
      const result = await unlikePhoto(testPhotoId, testFingerprint);
      expect(result.success).toBe(false);
    });
  });

  afterAll(async () => {
    // Clean up - ensure test like is removed
    if (testPhotoId) {
      await unlikePhoto(testPhotoId, testFingerprint).catch(() => {});
    }
  });
});
