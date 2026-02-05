import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Heart, Trophy, Clock, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Generate a fingerprint for the device
function getFingerprint(): string {
  let fp = localStorage.getItem("catfe_fingerprint");
  if (!fp) {
    fp = `fp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("catfe_fingerprint", fp);
  }
  return fp;
}

type SortMode = "newest" | "popular";

export default function PhotoVote() {
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const fingerprint = useMemo(() => getFingerprint(), []);
  
  // Fetch photos based on sort mode
  const { data: photosByLikes, isLoading: loadingByLikes, refetch: refetchByLikes } = trpc.photos.getByLikes.useQuery(
    { type: "snap_purr", limit: 50 },
    { enabled: sortMode === "popular" }
  );
  
  const { data: photosByDate, isLoading: loadingByDate, refetch: refetchByDate } = trpc.photos.getApproved.useQuery(
    { type: "snap_purr" },
    { enabled: sortMode === "newest" }
  );
  
  // Get user's liked photos
  const { data: likedPhotoIds, refetch: refetchLikes } = trpc.photos.getUserLikes.useQuery(
    { fingerprint }
  );
  
  // Like/unlike mutations
  const likeMutation = trpc.photos.like.useMutation({
    onSuccess: () => {
      refetchLikes();
      if (sortMode === "popular") refetchByLikes();
      else refetchByDate();
    },
  });
  
  const unlikeMutation = trpc.photos.unlike.useMutation({
    onSuccess: () => {
      refetchLikes();
      if (sortMode === "popular") refetchByLikes();
      else refetchByDate();
    },
  });
  
  const photos = sortMode === "popular" ? photosByLikes : photosByDate;
  const isLoading = sortMode === "popular" ? loadingByLikes : loadingByDate;
  
  const handleLike = (photoId: number) => {
    const isLiked = likedPhotoIds?.includes(photoId);
    if (isLiked) {
      unlikeMutation.mutate({ photoId, fingerprint });
    } else {
      likeMutation.mutate({ photoId, fingerprint });
    }
  };
  
  const isLiked = (photoId: number) => likedPhotoIds?.includes(photoId) ?? false;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🐱</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-900">Snap & Purr Gallery</h1>
                <p className="text-sm text-amber-600">Vote for your favorite photos!</p>
              </div>
            </div>
            
            {/* Sort Toggle */}
            <div className="flex items-center gap-2 bg-amber-100 rounded-lg p-1">
              <Button
                variant={sortMode === "popular" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortMode("popular")}
                className={sortMode === "popular" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-700 hover:bg-amber-200"}
              >
                <Trophy className="w-4 h-4 mr-1" />
                Popular
              </Button>
              <Button
                variant={sortMode === "newest" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortMode("newest")}
                className={sortMode === "newest" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-700 hover:bg-amber-200"}
              >
                <Clock className="w-4 h-4 mr-1" />
                Newest
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" />
          </div>
        ) : !photos || photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-amber-600 text-lg">No photos yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100 hover:shadow-xl transition-shadow"
                >
                  {/* Photo */}
                  <div className="relative aspect-square">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || "Cat photo"}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Rank Badge (for popular sort) */}
                    {sortMode === "popular" && index < 3 && (
                      <div className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                        index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-600"
                      }`}>
                        #{index + 1}
                      </div>
                    )}
                    
                    {/* Like Button Overlay */}
                    <button
                      onClick={() => handleLike(photo.id)}
                      disabled={likeMutation.isPending || unlikeMutation.isPending}
                      className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                    >
                      <Heart
                        className={`w-6 h-6 transition-colors ${
                          isLiked(photo.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400 hover:text-red-400"
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    {photo.caption && (
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">{photo.caption}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-600 font-medium">{photo.submitterName}</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Heart className={`w-4 h-4 ${photo.likesCount > 0 ? "fill-red-400 text-red-400" : ""}`} />
                        <span>{photo.likesCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-amber-600 text-sm">
        <p>Tap the heart to vote for your favorites!</p>
        <p className="mt-1 text-amber-500">Your votes help us feature the best photos on our TV display.</p>
      </footer>
    </div>
  );
}
