import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, EyeOff, Loader2, Instagram } from "lucide-react";
import { toast } from "sonner";

export function SocialFeedManager() {
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.instagram.getAll.useQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [permalink, setPermalink] = useState("");

  const addManualMutation = trpc.instagram.addManual.useMutation({
    onSuccess: () => {
      utils.instagram.getAll.invalidate();
      utils.instagram.getPosts.invalidate();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Post added!");
    },
    onError: (err) => toast.error(err.message),
  });

  const uploadImageMutation = trpc.instagram.uploadImage.useMutation({
    onSuccess: () => {
      utils.instagram.getAll.invalidate();
      utils.instagram.getPosts.invalidate();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Photo uploaded & added!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.instagram.delete.useMutation({
    onSuccess: () => {
      utils.instagram.getAll.invalidate();
      utils.instagram.getPosts.invalidate();
      toast.success("Post removed");
    },
  });

  const toggleVisibilityMutation = trpc.instagram.toggleVisibility.useMutation({
    onSuccess: () => {
      utils.instagram.getAll.invalidate();
      utils.instagram.getPosts.invalidate();
    },
  });

  const resetForm = () => {
    setMediaUrl("");
    setCaption("");
    setPermalink("");
  };

  const handleSubmit = () => {
    if (!mediaUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }

    addManualMutation.mutate({
      mediaUrl: mediaUrl.trim(),
      caption: caption.trim() || null,
      permalink: permalink.trim() || null,
      mediaType: "IMAGE",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadImageMutation.mutate({
        fileName: file.name,
        fileData: base64,
        contentType: file.type,
        caption: caption.trim() || null,
      });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allPosts = posts || [];
  const visiblePosts = allPosts.filter((p) => !p.isHidden);
  const hiddenPosts = allPosts.filter((p) => p.isHidden);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Instagram className="w-5 h-5" /> Social Feed
          </h3>
          <p className="text-sm text-muted-foreground">
            {visiblePosts.length} visible · {hiddenPosts.length} hidden — Photos show on the Social Feed TV slide
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Social Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Image URL</Label>
                <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." />
                {mediaUrl && (
                  <img src={mediaUrl} alt="Preview" className="mt-2 w-full max-h-48 rounded-lg object-cover" />
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground">— or —</div>
              <div>
                <Label>Upload from device</Label>
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button variant="outline" className="w-full" type="button" disabled={uploadImageMutation.isPending}>
                    {uploadImageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Choose Image
                  </Button>
                </label>
              </div>
              <div>
                <Label>Caption</Label>
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption to display on the TV..." rows={2} />
              </div>
              <div>
                <Label>Instagram Post URL (optional)</Label>
                <Input value={permalink} onChange={(e) => setPermalink(e.target.value)} placeholder="https://instagram.com/p/..." />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={addManualMutation.isPending}>
                {addManualMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Add Post by URL
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allPosts.map((post) => (
          <Card key={post.id} className={`relative group overflow-hidden ${post.isHidden ? "opacity-50" : ""}`}>
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img src={post.mediaUrl} alt={post.caption || "Social post"} className="w-full h-full object-cover" />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => toggleVisibilityMutation.mutate({ id: post.id, hidden: !post.isHidden })}>
                      {post.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => {
                      if (confirm("Delete this post?")) deleteMutation.mutate({ id: post.id });
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {post.caption && (
                    <p className="text-white text-xs px-3 text-center line-clamp-2">{post.caption}</p>
                  )}
                </div>
                {/* Hidden badge */}
                {post.isHidden && (
                  <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                    <EyeOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allPosts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Instagram className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-2">No social posts yet</p>
          <p className="text-sm">Upload photos from your Instagram to display on the Social Feed TV slide!</p>
        </div>
      )}
    </div>
  );
}
