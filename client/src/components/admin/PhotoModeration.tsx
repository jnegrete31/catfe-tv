import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Check, X, Trash2, Eye, EyeOff, Image, Heart, Camera, 
  Clock, User, Mail, MessageSquare, Cat, Calendar, Star
} from "lucide-react";
import { toast } from "sonner";

type PhotoSubmission = {
  id: number;
  type: "happy_tails" | "snap_purr";
  status: "pending" | "approved" | "rejected";
  submitterName: string;
  submitterEmail: string | null;
  photoUrl: string;
  caption: string | null;
  catName: string | null;
  adoptionDate: Date | null;
  showOnTv: boolean;
  isFeatured: boolean;
  createdAt: Date;
  reviewedAt: Date | null;
  rejectionReason: string | null;
};

export default function PhotoModeration() {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoSubmission | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: stats } = trpc.photos.getStats.useQuery();
  const { data: pendingPhotos, isLoading: pendingLoading } = trpc.photos.getPending.useQuery();
  const { data: allPhotos, isLoading: allLoading } = trpc.photos.getAll.useQuery();

  const approveMutation = trpc.photos.approve.useMutation({
    onSuccess: () => {
      toast.success("Photo approved!");
      utils.photos.invalidate();
      setSelectedPhoto(null);
    },
  });

  const rejectMutation = trpc.photos.reject.useMutation({
    onSuccess: () => {
      toast.success("Photo rejected");
      utils.photos.invalidate();
      setSelectedPhoto(null);
      setRejectDialogOpen(false);
      setRejectReason("");
    },
  });

  const deleteMutation = trpc.photos.delete.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted");
      utils.photos.invalidate();
      setSelectedPhoto(null);
      setDeleteDialogOpen(false);
    },
  });

  const toggleVisibilityMutation = trpc.photos.toggleVisibility.useMutation({
    onSuccess: () => {
      toast.success("Visibility updated");
      utils.photos.invalidate();
    },
  });

  const toggleFeaturedMutation = trpc.photos.toggleFeatured.useMutation({
    onSuccess: () => {
      toast.success("Featured status updated");
      utils.photos.invalidate();
    },
  });

  const handleApprove = (photo: PhotoSubmission) => {
    approveMutation.mutate({ id: photo.id });
  };

  const handleReject = () => {
    if (!selectedPhoto) return;
    rejectMutation.mutate({ id: selectedPhoto.id, reason: rejectReason || undefined });
  };

  const handleDelete = () => {
    if (!selectedPhoto) return;
    deleteMutation.mutate({ id: selectedPhoto.id });
  };

  const handleToggleVisibility = (photo: PhotoSubmission) => {
    toggleVisibilityMutation.mutate({ id: photo.id, showOnTv: !photo.showOnTv });
  };

  const handleToggleFeatured = (photo: PhotoSubmission) => {
    toggleFeaturedMutation.mutate({ id: photo.id, isFeatured: !photo.isFeatured });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const PhotoCard = ({ photo, showActions = true }: { photo: PhotoSubmission; showActions?: boolean }) => (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-gray-100">
        <img
          src={photo.photoUrl}
          alt={photo.caption || "Submitted photo"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant={photo.type === "happy_tails" ? "default" : "secondary"}>
            {photo.type === "happy_tails" ? (
              <><Heart className="w-3 h-3 mr-1" /> Happy Tails</>
            ) : (
              <><Camera className="w-3 h-3 mr-1" /> Snap & Purr</>
            )}
          </Badge>
          {photo.status === "pending" && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <Clock className="w-3 h-3 mr-1" /> Pending
            </Badge>
          )}
          {photo.status === "approved" && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <Check className="w-3 h-3 mr-1" /> Approved
            </Badge>
          )}
          {photo.status === "rejected" && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              <X className="w-3 h-3 mr-1" /> Rejected
            </Badge>
          )}
        </div>
        {photo.status === "approved" && (
          <div className="absolute top-2 right-2 flex gap-1">
            {photo.isFeatured && (
              <Badge className="bg-yellow-500 text-yellow-900">
                <Star className="w-3 h-3 mr-1 fill-current" /> Featured
              </Badge>
            )}
            <Badge variant={photo.showOnTv ? "default" : "outline"} className={photo.showOnTv ? "bg-blue-500" : ""}>
              {photo.showOnTv ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
              {photo.showOnTv ? "On TV" : "Hidden"}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Submitter Info */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 flex-wrap">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="truncate">{photo.submitterName}</span>
          {photo.submitterEmail && (
            <span className="hidden sm:flex items-center gap-1 truncate">
              <Mail className="w-4 h-4" />
              <span className="truncate">{photo.submitterEmail}</span>
            </span>
          )}
        </div>

        {/* Cat Name (for Happy Tails) */}
        {photo.catName && (
          <div className="flex items-center gap-2 text-sm">
            <Cat className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{photo.catName}</span>
          </div>
        )}

        {/* Caption */}
        {photo.caption && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{photo.caption}</span>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Submitted {formatDate(photo.createdAt)}</span>
        </div>

        {/* Rejection Reason */}
        {photo.status === "rejected" && photo.rejectionReason && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Reason: {photo.rejectionReason}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t">
            {photo.status === "pending" && (
              <>
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => handleApprove(photo)}
                  disabled={approveMutation.isPending}
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setRejectDialogOpen(true);
                  }}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Reject
                </Button>
              </>
            )}
            {photo.status === "approved" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => handleToggleVisibility(photo)}
                >
                  {photo.showOnTv ? (
                    <><EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> <span className="hidden sm:inline">Hide from </span>TV</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> <span className="hidden sm:inline">Show on </span>TV</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant={photo.isFeatured ? "default" : "outline"}
                  className={`text-xs sm:text-sm h-8 sm:h-9 ${photo.isFeatured ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900" : ""}`}
                  onClick={() => handleToggleFeatured(photo)}
                >
                  <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 ${photo.isFeatured ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">{photo.isFeatured ? "Featured" : "Feature"}</span>
                  <Star className={`w-3.5 h-3.5 sm:hidden ${photo.isFeatured ? "fill-current" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            {photo.status === "rejected" && (
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setSelectedPhoto(photo);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            <div className="text-[10px] sm:text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats?.approved || 0}</div>
            <div className="text-[10px] sm:text-sm text-gray-500">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats?.rejected || 0}</div>
            <div className="text-[10px] sm:text-sm text-gray-500">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{stats?.happyTails || 0}</div>
            <div className="text-[10px] sm:text-sm text-gray-500">Happy Tails</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats?.snapPurr || 0}</div>
            <div className="text-[10px] sm:text-sm text-gray-500">Snap & Purr</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({stats?.pending || 0})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Image className="w-4 h-4" />
            All Photos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : pendingPhotos?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">All caught up!</h3>
                <p className="text-gray-500">No photos waiting for review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPhotos?.map((photo) => (
                <PhotoCard key={photo.id} photo={photo as PhotoSubmission} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          {allLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : allPhotos?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No photos yet</h3>
                <p className="text-gray-500">Customer photos will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPhotos?.map((photo) => (
                <PhotoCard key={photo.id} photo={photo as PhotoSubmission} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Photo</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this photo (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Image quality too low, inappropriate content..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              Reject Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
