import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

type VolunteerRow = {
  id: number;
  name: string;
  role: string | null;
  bio: string | null;
  photoUrl: string | null;
  startDate: Date | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export function VolunteerManager() {
  const utils = trpc.useUtils();
  const { data: volunteers, isLoading } = trpc.volunteers.getAll.useQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerRow | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const uploadPhotoMutation = trpc.volunteers.uploadPhoto.useMutation();

  const createMutation = trpc.volunteers.create.useMutation({
    onSuccess: () => {
      utils.volunteers.getAll.invalidate();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Volunteer added!");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.volunteers.update.useMutation({
    onSuccess: () => {
      utils.volunteers.getAll.invalidate();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Volunteer updated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.volunteers.delete.useMutation({
    onSuccess: () => {
      utils.volunteers.getAll.invalidate();
      toast.success("Volunteer removed");
    },
  });

  const resetForm = () => {
    setName("");
    setRole("");
    setBio("");
    setPhotoUrl("");
    setStartDate("");
    setIsFeatured(false);
    setIsActive(true);
    setEditingVolunteer(null);
  };

  const openEdit = (v: VolunteerRow) => {
    setEditingVolunteer(v);
    setName(v.name);
    setRole(v.role || "");
    setBio(v.bio || "");
    setPhotoUrl(v.photoUrl || "");
    setStartDate(v.startDate ? new Date(v.startDate).toISOString().split("T")[0] : "");
    setIsFeatured(v.isFeatured);
    setIsActive(v.isActive);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (editingVolunteer) {
      updateMutation.mutate({
        id: editingVolunteer.id,
        data: {
          name: name.trim(),
          role: role.trim() || null,
          bio: bio.trim() || null,
          photoUrl: photoUrl.trim() || null,
          startDate: startDate ? new Date(startDate) : null,
          isFeatured,
          isActive,
        },
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        role: role.trim() || null,
        bio: bio.trim() || null,
        photoUrl: photoUrl.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        isFeatured,
        isActive,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const result = await uploadPhotoMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          contentType: file.type,
        });
        setPhotoUrl(result.url);
        toast.success("Photo uploaded!");
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
    }
  };

  const toggleFeatured = (v: VolunteerRow) => {
    updateMutation.mutate({
      id: v.id,
      data: { isFeatured: !v.isFeatured },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allVolunteers = volunteers || [];
  const activeVolunteers = allVolunteers.filter((v) => v.isActive);
  const inactiveVolunteers = allVolunteers.filter((v) => !v.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Volunteers</h3>
          <p className="text-sm text-muted-foreground">
            {activeVolunteers.length} active · {activeVolunteers.filter((v) => v.isFeatured).length} featured on TV
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" /> Add Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingVolunteer ? "Edit Volunteer" : "Add Volunteer"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Cat Socializer, Feeding Team, etc." />
              </div>
              <div>
                <Label>Bio / Quote</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio or quote about why they volunteer..." rows={3} />
              </div>
              <div>
                <Label>Photo</Label>
                <div className="flex items-center gap-2">
                  <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL" className="flex-1" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Button variant="outline" size="sm" type="button" disabled={uploadPhotoMutation.isPending}>
                      {uploadPhotoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                    </Button>
                  </label>
                </div>
                {photoUrl && (
                  <img src={photoUrl} alt="Preview" className="mt-2 w-20 h-20 rounded-lg object-cover" />
                )}
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured on TV</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {editingVolunteer ? "Update" : "Add"} Volunteer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Volunteers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeVolunteers.map((v) => (
          <Card key={v.id} className={`relative ${v.isFeatured ? "ring-2 ring-yellow-400/50" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {v.photoUrl ? (
                    <img src={v.photoUrl} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">👤</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold truncate">{v.name}</h4>
                    {v.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                  </div>
                  {v.role && <p className="text-sm text-muted-foreground">{v.role}</p>}
                  {v.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.bio}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFeatured(v)}>
                    <Star className={`w-4 h-4 ${v.isFeatured ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                    if (confirm("Remove this volunteer?")) deleteMutation.mutate({ id: v.id });
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inactive Volunteers */}
      {inactiveVolunteers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Inactive ({inactiveVolunteers.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
            {inactiveVolunteers.map((v) => (
              <Card key={v.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {v.photoUrl ? (
                        <img src={v.photoUrl} alt={v.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg text-muted-foreground">👤</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate text-sm">{v.name}</h4>
                      {v.role && <p className="text-xs text-muted-foreground">{v.role}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                        if (confirm("Remove this volunteer?")) deleteMutation.mutate({ id: v.id });
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeVolunteers.length === 0 && inactiveVolunteers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No volunteers yet</p>
          <p className="text-sm">Add your first volunteer to feature them on the TV display!</p>
        </div>
      )}
    </div>
  );
}
