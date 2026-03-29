import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Sparkles, Camera, Heart, Image as ImageIcon,
  Clock, TrendingUp, DollarSign, Trash2, Cat,
  User, MessageSquare, Calendar, Eye, EyeOff, Crop
} from "lucide-react";
import PhotoCropper from "@/components/PhotoCropper";
import { toast } from "sonner";
import PhotoModeration from "./PhotoModeration";

// ============ SPOTLIGHTS MANAGEMENT ============
function SpotlightsManagement() {
  const { data: popularity, isLoading: popularityLoading } = trpc.cats.getPopularityRankings.useQuery();
  const { data: activeSpotlights, isLoading: spotlightsLoading } = trpc.catPhotos.getAllActiveSpotlights.useQuery();

  const formatTimeLeft = (expiresAt: Date | string) => {
    const now = new Date();
    const exp = new Date(expiresAt);
    const diffMs = exp.getTime() - now.getTime();
    if (diffMs <= 0) return "Expired";
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m left`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m left`;
  };

  return (
    <div className="space-y-6">
      {/* Active Spotlights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Active Spotlights
          </CardTitle>
          <CardDescription>
            Currently featured cats on the TV display
          </CardDescription>
        </CardHeader>
        <CardContent>
          {spotlightsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !activeSpotlights || activeSpotlights.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No active spotlights right now</p>
              <p className="text-xs text-muted-foreground mt-1">When guests donate spotlights, they'll appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSpotlights.map((spotlight) => (
                <div
                  key={spotlight.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200"
                >
                  {spotlight.photoUrl ? (
                    <img
                      src={spotlight.photoUrl}
                      alt={spotlight.catName || "Cat"}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Cat className="w-7 h-7 text-amber-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{spotlight.catName || "Unknown Cat"}</div>
                    <div className="text-xs text-muted-foreground">
                      by {spotlight.donorName || "Anonymous"} · ${((spotlight.amountCents || 0) / 100).toFixed(0)}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 shrink-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeLeft(spotlight.expiresAt)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popularity Rankings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Cat Popularity Rankings
          </CardTitle>
          <CardDescription>
            Based on album photos and spotlight donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {popularityLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !popularity || popularity.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No popularity data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Rankings appear when guests upload photos or donate spotlights</p>
            </div>
          ) : (
            <div className="space-y-2">
              {popularity.map((cat, index) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    index === 0 ? "bg-amber-100 text-amber-700" :
                    index === 1 ? "bg-gray-100 text-gray-600" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>
                  {cat.photoUrl ? (
                    <img
                      src={cat.photoUrl}
                      alt={cat.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Cat className="w-5 h-5 text-amber-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{cat.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Camera className="w-3 h-3" /> {cat.photoCount}
                      </span>
                      {Number(cat.totalDonatedCents) > 0 && (
                        <span className="flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" /> ${(Number(cat.totalDonatedCents) / 100).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ SNAP & PURR ALBUM MANAGEMENT ============
function SnapPurrAlbumManagement() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<{ id: number; catName: string; uploaderName: string } | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [editPhotoOpen, setEditPhotoOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<{ id: number; photoUrl: string } | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const utils = trpc.useUtils();
  const { data: allPhotos, isLoading } = trpc.catPhotos.getAllPhotosAdmin.useQuery();

  const deleteMutation = trpc.catPhotos.deletePhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted permanently");
      utils.catPhotos.invalidate();
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    },
    onError: () => toast.error("Failed to delete photo"),
  });

  const toggleMutation = trpc.catPhotos.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Photo visibility updated");
      utils.catPhotos.invalidate();
    },
    onError: () => toast.error("Failed to update photo"),
  });

  const replacePhotoMutation = trpc.catPhotos.replacePhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo updated!");
      utils.catPhotos.invalidate();
      setEditPhotoOpen(false);
      setEditingPhoto(null);
      setIsSavingEdit(false);
    },
    onError: () => {
      toast.error("Failed to save edited photo");
      setIsSavingEdit(false);
    },
  });

  // Get unique cat names for filter
  const catNames = allPhotos
    ? Array.from(new Set(allPhotos.map((p) => p.catName).filter(Boolean))).sort()
    : [];

  const filteredPhotos = allPhotos
    ? filterCat === "all"
      ? allPhotos
      : allPhotos.filter((p) => p.catName === filterCat)
    : [];

  const activeCount = filteredPhotos.filter((p) => p.isActive).length;
  const hiddenCount = filteredPhotos.filter((p) => !p.isActive).length;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{filteredPhotos.length}</div>
            <div className="text-[10px] sm:text-sm text-gray-500">Total Photos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{activeCount}</div>
            <div className="text-[10px] sm:text-sm text-gray-500">Visible</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-400">{hiddenCount}</div>
            <div className="text-[10px] sm:text-sm text-gray-500">Hidden</div>
          </CardContent>
        </Card>
      </div>

      {/* Cat Filter */}
      {catNames.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filterCat === "all" ? "default" : "outline"}
            onClick={() => setFilterCat("all")}
            className="text-xs"
          >
            All Cats
          </Button>
          {catNames.map((name) => (
            <Button
              key={name}
              size="sm"
              variant={filterCat === name ? "default" : "outline"}
              onClick={() => setFilterCat(name!)}
              className="text-xs"
            >
              {name}
            </Button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading photos...</div>
      ) : filteredPhotos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No album photos yet</h3>
            <p className="text-gray-500">Guest-uploaded Snap & Purr photos will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className={`overflow-hidden ${!photo.isActive ? "opacity-60" : ""}`}>
              <div className="aspect-video relative bg-gray-100">
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || "Cat photo"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    <Cat className="w-3 h-3 mr-1" />
                    {photo.catName}
                  </Badge>
                </div>
                {!photo.isActive && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 text-xs">
                      <EyeOff className="w-3 h-3 mr-1" /> Hidden
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <User className="w-3.5 h-3.5" />
                  <span>{photo.uploaderName}</span>
                </div>
                {photo.caption && (
                  <div className="flex items-start gap-1.5 text-xs text-gray-500">
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{photo.caption}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(photo.createdAt)}</span>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => {
                      setEditingPhoto({ id: photo.id, photoUrl: photo.photoUrl });
                      setEditPhotoOpen(true);
                    }}
                  >
                    <Crop className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => toggleMutation.mutate({ id: photo.id, isActive: !photo.isActive })}
                  >
                    {photo.isActive ? (
                      <><EyeOff className="w-3.5 h-3.5 mr-1" /> Hide</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5 mr-1" /> Show</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                    onClick={() => {
                      setPhotoToDelete({ id: photo.id, catName: photo.catName || "Unknown", uploaderName: photo.uploaderName });
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Photo Dialog */}
      <Dialog open={editPhotoOpen} onOpenChange={(open) => {
        setEditPhotoOpen(open);
        if (!open) { setEditingPhoto(null); setIsSavingEdit(false); }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="w-5 h-5" />
              Edit Photo
            </DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="relative">
              {isSavingEdit && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-600">Saving edited photo...</p>
                  </div>
                </div>
              )}
              <PhotoCropper
                imageUrl={editingPhoto.photoUrl}
                onCropComplete={(croppedBase64) => {
                  setIsSavingEdit(true);
                  replacePhotoMutation.mutate({
                    id: editingPhoto.id,
                    photoBase64: croppedBase64,
                  });
                }}
                onCancel={() => {
                  setEditPhotoOpen(false);
                  setEditingPhoto(null);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this photo
              {photoToDelete ? ` of ${photoToDelete.catName} by ${photoToDelete.uploaderName}` : ""}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => photoToDelete && deleteMutation.mutate({ id: photoToDelete.id })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrapper to filter PhotoModeration by type
function SnapPurrModeration() {
  return <PhotoModeration filterType="snap_purr" />;
}

function HappyTailsModeration() {
  return <PhotoModeration filterType="happy_tails" />;
}

export default function PhotosTab() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="spotlights">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="spotlights" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Spotlights
            </TabsTrigger>
            <TabsTrigger value="album" className="gap-2">
              <Camera className="w-4 h-4" />
              Album Photos
            </TabsTrigger>
            <TabsTrigger value="snap_purr" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="happy_tails" className="gap-2">
              <Heart className="w-4 h-4" />
              Happy Tails
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="spotlights" className="mt-4">
          <SpotlightsManagement />
        </TabsContent>

        <TabsContent value="album" className="mt-4">
          <SnapPurrAlbumManagement />
        </TabsContent>

        <TabsContent value="snap_purr" className="mt-4">
          <SnapPurrModeration />
        </TabsContent>

        <TabsContent value="happy_tails" className="mt-4">
          <HappyTailsModeration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
