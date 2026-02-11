import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Play, Trash2, Edit, ListMusic, Check, Clock, Calendar, X } from "lucide-react";
import { DAYS_OF_WEEK } from "@shared/types";
import { ScheduleTimeline } from "./ScheduleTimeline";

const PLAYLIST_COLORS = [
  { value: "#C2884E", label: "Catfé Brown" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
  { value: "#6366f1", label: "Indigo" },
];

interface TimeSlot {
  timeStart: string;
  timeEnd: string;
}

interface PlaylistFormData {
  name: string;
  description: string;
  schedulingEnabled: boolean;
  daysOfWeek: number[];
  timeSlots: TimeSlot[];
  color: string;
}

const defaultFormData: PlaylistFormData = {
  name: "",
  description: "",
  schedulingEnabled: false,
  daysOfWeek: [],
  timeSlots: [{ timeStart: "", timeEnd: "" }],
  color: "#C2884E",
};

function PlaylistFormFields({
  data,
  onChange,
}: {
  data: PlaylistFormData;
  onChange: (data: PlaylistFormData) => void;
}) {
  const toggleDay = (day: number) => {
    const newDays = data.daysOfWeek.includes(day)
      ? data.daysOfWeek.filter((d) => d !== day)
      : [...data.daysOfWeek, day].sort();
    onChange({ ...data, daysOfWeek: newDays });
  };

  const updateTimeSlot = (index: number, field: "timeStart" | "timeEnd", value: string) => {
    const newSlots = [...data.timeSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    onChange({ ...data, timeSlots: newSlots });
  };

  const addTimeSlot = () => {
    onChange({ ...data, timeSlots: [...data.timeSlots, { timeStart: "", timeEnd: "" }] });
  };

  const removeTimeSlot = (index: number) => {
    if (data.timeSlots.length <= 1) return;
    const newSlots = data.timeSlots.filter((_, i) => i !== index);
    onChange({ ...data, timeSlots: newSlots });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pl-name">Name</Label>
        <Input
          id="pl-name"
          placeholder="e.g., Volunteer Orientation"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pl-desc">Description (optional)</Label>
        <Textarea
          id="pl-desc"
          placeholder="What is this playlist for?"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
        />
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label>Timeline Color</Label>
        <div className="flex flex-wrap gap-2">
          {PLAYLIST_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                data.color === c.value
                  ? "border-foreground scale-110 shadow-md"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c.value }}
              onClick={() => onChange({ ...data, color: c.value })}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Scheduling Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Enable Auto-Scheduling
          </Label>
          <p className="text-xs text-muted-foreground">
            Automatically activate this playlist at specific times
          </p>
        </div>
        <Switch
          checked={data.schedulingEnabled}
          onCheckedChange={(checked) =>
            onChange({ ...data, schedulingEnabled: checked })
          }
        />
      </div>

      {/* Schedule Fields */}
      {data.schedulingEnabled && (
        <div className="space-y-4 pl-2 border-l-2 border-primary/30">
          {/* Days of Week */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Days of Week
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  size="sm"
                  variant={
                    data.daysOfWeek.includes(day.value) ? "default" : "outline"
                  }
                  className="h-8 w-12 text-xs"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() =>
                  onChange({ ...data, daysOfWeek: [1, 2, 3, 4, 5] })
                }
              >
                Weekdays
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() =>
                  onChange({ ...data, daysOfWeek: [0, 6] })
                }
              >
                Weekends
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() =>
                  onChange({ ...data, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })
                }
              >
                Every Day
              </Button>
            </div>
          </div>

          {/* Time Windows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Windows
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={addTimeSlot}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Time
              </Button>
            </div>
            {data.timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg">
                <span className="text-xs text-muted-foreground w-4 text-center font-medium">
                  {index + 1}
                </span>
                <Input
                  type="time"
                  value={slot.timeStart}
                  onChange={(e) => updateTimeSlot(index, "timeStart", e.target.value)}
                  className="w-28 h-8 text-sm"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="time"
                  value={slot.timeEnd}
                  onChange={(e) => updateTimeSlot(index, "timeEnd", e.target.value)}
                  className="w-28 h-8 text-sm"
                />
                {data.timeSlots.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeTimeSlot(index)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {data.timeSlots.length > 1 && (
              <p className="text-xs text-muted-foreground">
                This playlist will be active during all {data.timeSlots.length} time windows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PlaylistManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<
    (PlaylistFormData & { id: number }) | null
  >(null);
  const [newPlaylist, setNewPlaylist] = useState<PlaylistFormData>({
    ...defaultFormData,
  });
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(
    null
  );

  const utils = trpc.useUtils();
  const { data: playlists, isLoading } = trpc.playlists.getAll.useQuery(
    undefined,
    { staleTime: 0 }
  );
  const { data: allScreens } = trpc.screens.getAll.useQuery(undefined, {
    staleTime: 0,
  });
  const { data: playlistScreens } = trpc.playlists.getScreens.useQuery(
    { playlistId: selectedPlaylistId! },
    { enabled: !!selectedPlaylistId, staleTime: 0 }
  );

  const createMutation = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success("Playlist created!");
      utils.playlists.getAll.invalidate();
      setIsCreateOpen(false);
      setNewPlaylist({ ...defaultFormData });
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

  // Convert form data timeSlots to API format
  const formToApi = (formData: PlaylistFormData) => {
    const validSlots = formData.timeSlots.filter(s => s.timeStart && s.timeEnd);
    return {
      name: formData.name,
      description: formData.description || undefined,
      schedulingEnabled: formData.schedulingEnabled,
      daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
      // Keep legacy fields for backward compat (first slot)
      timeStart: validSlots[0]?.timeStart || undefined,
      timeEnd: validSlots[0]?.timeEnd || undefined,
      // New multi-slot field
      timeSlots: validSlots.length > 0 ? validSlots : undefined,
      color: formData.color,
    };
  };

  const handleCreate = () => {
    if (!newPlaylist.name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }
    createMutation.mutate(formToApi(newPlaylist));
  };

  const handleUpdate = () => {
    if (!editingPlaylist) return;
    updateMutation.mutate({
      id: editingPlaylist.id,
      ...formToApi(editingPlaylist),
    });
  };

  const handleToggleScreen = (screenId: number) => {
    if (!selectedPlaylistId || !playlistScreens) return;

    const currentIds = playlistScreens.map((s) => s.id);
    const isInPlaylist = currentIds.includes(screenId);

    const newIds = isInPlaylist
      ? currentIds.filter((id) => id !== screenId)
      : [...currentIds, screenId];

    setScreensMutation.mutate({
      playlistId: selectedPlaylistId,
      screenIds: newIds,
    });
  };

  const handleEditPlaylist = (playlist: any) => {
    // Convert API data to form data - prefer timeSlots array, fallback to legacy fields
    const timeSlots: TimeSlot[] = playlist.timeSlots && playlist.timeSlots.length > 0
      ? playlist.timeSlots
      : playlist.timeStart && playlist.timeEnd
        ? [{ timeStart: playlist.timeStart, timeEnd: playlist.timeEnd }]
        : [{ timeStart: "", timeEnd: "" }];

    setEditingPlaylist({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || "",
      schedulingEnabled: playlist.schedulingEnabled || false,
      daysOfWeek: playlist.daysOfWeek || [],
      timeSlots,
      color: playlist.color || "#C2884E",
    });
  };

  // Format time slots for display on playlist cards
  const formatTimeSlots = (playlist: any) => {
    const slots: TimeSlot[] = playlist.timeSlots && playlist.timeSlots.length > 0
      ? playlist.timeSlots
      : playlist.timeStart && playlist.timeEnd
        ? [{ timeStart: playlist.timeStart, timeEnd: playlist.timeEnd }]
        : [];

    if (slots.length === 0) return null;

    return slots.map((s: TimeSlot) => `${s.timeStart} – ${s.timeEnd}`).join(", ");
  };

  if (isLoading) {
    return <div className="p-4">Loading playlists...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Schedule Timeline */}
      <ScheduleTimeline />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Playlists</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage playlists
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
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
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
                <DialogDescription>
                  Create a playlist for a specific occasion. Optionally set a
                  schedule to auto-activate it.
                </DialogDescription>
              </DialogHeader>
              <PlaylistFormFields
                data={newPlaylist}
                onChange={setNewPlaylist}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Playlist List */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playlists?.map((playlist) => {
          const timeSummary = formatTimeSlots(playlist);
          const slotCount = (playlist as any).timeSlots?.length || (playlist.timeStart && playlist.timeEnd ? 1 : 0);

          return (
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
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: playlist.color || "#C2884E",
                        }}
                      />
                      <ListMusic className="w-5 h-5" />
                      {playlist.name}
                    </CardTitle>
                    {playlist.description && (
                      <CardDescription className="mt-1">
                        {playlist.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {playlist.isActive && (
                      <Badge className="bg-green-500">Active</Badge>
                    )}
                    {playlist.schedulingEnabled && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {slotCount > 1 ? `${slotCount} Times` : "Scheduled"}
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Schedule summary */}
                {playlist.schedulingEnabled && timeSummary && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {timeSummary}
                    {playlist.daysOfWeek &&
                      (playlist.daysOfWeek as number[]).length > 0 &&
                      (playlist.daysOfWeek as number[]).length < 7 && (
                        <>
                          {" "}·{" "}
                          {(playlist.daysOfWeek as number[])
                            .map(
                              (d: number) =>
                                DAYS_OF_WEEK.find((dw) => dw.value === d)?.label
                            )
                            .join(", ")}
                        </>
                      )}
                    {playlist.daysOfWeek &&
                      (playlist.daysOfWeek as number[]).length === 7 && <> · Every day</>}
                  </p>
                )}
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
                        handleEditPlaylist(playlist);
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
          );
        })}
      </div>

      {/* Screen Selection for Selected Playlist */}
      {selectedPlaylistId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Screens in "
              {playlists?.find((p) => p.id === selectedPlaylistId)?.name}"
            </CardTitle>
            <CardDescription>
              Click screens to add or remove them from this playlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {allScreens?.map((screen) => {
                const isInPlaylist = playlistScreens?.some(
                  (s) => s.id === screen.id
                );
                return (
                  <div
                    key={screen.id}
                    className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                      isInPlaylist
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleToggleScreen(screen.id)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isInPlaylist
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {isInPlaylist && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{screen.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {screen.type}
                      </p>
                    </div>
                    {!screen.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPlaylist}
        onOpenChange={(open) => !open && setEditingPlaylist(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
          </DialogHeader>
          {editingPlaylist && (
            <PlaylistFormFields
              data={editingPlaylist}
              onChange={(data) =>
                setEditingPlaylist({ ...data, id: editingPlaylist.id })
              }
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPlaylist(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
