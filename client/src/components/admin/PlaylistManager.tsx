import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Play, Trash2, Edit, ListMusic, GripVertical, Check } from "lucide-react";

export function PlaylistManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<{ id: number; name: string; description?: string } | null>(null);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", description: "" });
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: playlists, isLoading } = trpc.playlists.getAll.useQuery();
  const { data: allScreens } = trpc.screens.getAll.useQuery();
  const { data: playlistScreens } = trpc.playlists.getScreens.useQuery(
    { playlistId: selectedPlaylistId! },
    { enabled: !!selectedPlaylistId }
  );

  const createMutation = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success("Playlist created!");
      utils.playlists.getAll.invalidate();
      setIsCreateOpen(false);
      setNewPlaylist({ name: "", description: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.playlists.update.useMutation({
    onSuccess: () => {
      toast.success("Playlist updated!");
      utils.playlists.getAll.invalidate();
      setEditingPlaylist(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.playlists.delete.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted!");
      utils.playlists.getAll.invalidate();
      if (selectedPlaylistId) setSelectedPlaylistId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const setActiveMutation = trpc.playlists.setActive.useMutation({
    onSuccess: () => {
      toast.success("Playlist activated!");
      utils.playlists.getAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const setScreensMutation = trpc.playlists.setScreens.useMutation({
    onSuccess: () => {
      toast.success("Screens updated!");
      utils.playlists.getScreens.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const seedDefaultsMutation = trpc.playlists.seedDefaults.useMutation({
    onSuccess: () => {
      toast.success("Default playlists created!");
      utils.playlists.getAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!newPlaylist.name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }
    createMutation.mutate(newPlaylist);
  };

  const handleUpdate = () => {
    if (!editingPlaylist) return;
    updateMutation.mutate({
      id: editingPlaylist.id,
      name: editingPlaylist.name,
      description: editingPlaylist.description,
    });
  };

  const handleToggleScreen = (screenId: number) => {
    if (!selectedPlaylistId || !playlistScreens) return;
    
    const currentIds = playlistScreens.map(s => s.id);
    const isInPlaylist = currentIds.includes(screenId);
    
    const newIds = isInPlaylist
      ? currentIds.filter(id => id !== screenId)
      : [...currentIds, screenId];
    
    setScreensMutation.mutate({
      playlistId: selectedPlaylistId,
      screenIds: newIds,
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading playlists...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Playlists</h2>
          <p className="text-muted-foreground">
            Create and manage playlists for different occasions
          </p>
        </div>
        <div className="flex gap-2">
          {(!playlists || playlists.length === 0) && (
            <Button
              variant="outline"
              onClick={() => seedDefaultsMutation.mutate()}
              disabled={seedDefaultsMutation.isPending}
            >
              <ListMusic className="w-4 h-4 mr-2" />
              Create Defaults
            </Button>
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
                <DialogDescription>
                  Create a playlist for a specific occasion like events or volunteer orientation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Volunteer Orientation"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this playlist for?"
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Playlist List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {playlists?.map((playlist) => (
          <Card
            key={playlist.id}
            className={`cursor-pointer transition-all ${
              selectedPlaylistId === playlist.id
                ? "ring-2 ring-primary"
                : "hover:shadow-md"
            } ${playlist.isActive ? "border-green-500 border-2" : ""}`}
            onClick={() => setSelectedPlaylistId(playlist.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <ListMusic className="w-5 h-5" />
                    {playlist.name}
                  </CardTitle>
                  {playlist.description && (
                    <CardDescription className="mt-1">
                      {playlist.description}
                    </CardDescription>
                  )}
                </div>
                {playlist.isActive && (
                  <Badge className="bg-green-500">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {!playlist.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMutation.mutate({ id: playlist.id });
                      }}
                      disabled={setActiveMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPlaylist({
                        id: playlist.id,
                        name: playlist.name,
                        description: playlist.description || "",
                      });
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!playlist.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this playlist?")) {
                          deleteMutation.mutate({ id: playlist.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Screen Selection for Selected Playlist */}
      {selectedPlaylistId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Screens in "{playlists?.find(p => p.id === selectedPlaylistId)?.name}"
            </CardTitle>
            <CardDescription>
              Click screens to add or remove them from this playlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {allScreens?.map((screen) => {
                const isInPlaylist = playlistScreens?.some(s => s.id === screen.id);
                return (
                  <div
                    key={screen.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isInPlaylist
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleToggleScreen(screen.id)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isInPlaylist ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {isInPlaylist && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{screen.title}</p>
                      <p className="text-xs text-muted-foreground">{screen.type}</p>
                    </div>
                    {!screen.isActive && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPlaylist} onOpenChange={(open) => !open && setEditingPlaylist(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editingPlaylist?.name || ""}
                onChange={(e) =>
                  setEditingPlaylist(prev =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingPlaylist?.description || ""}
                onChange={(e) =>
                  setEditingPlaylist(prev =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlaylist(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
