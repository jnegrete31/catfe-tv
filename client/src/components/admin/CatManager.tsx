import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Cat,
  Star,
  Heart,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Stethoscope,
  Calendar,
  Shield,
  FileUp,
  ScanLine,
} from "lucide-react";
import { toast } from "sonner";

// Personality tag options (from kennel card "Specification" field)
const PERSONALITY_TAGS = [
  "Good with Cats",
  "Good with Dogs",
  "Good with Children",
  "Needs Another Cat in Home",
  "Shy",
  "Playful",
  "Affectionate",
  "Independent",
  "Lap Cat",
  "Vocal",
  "Calm",
  "Curious",
  "Energetic",
  "Gentle",
  "Social",
  "Bonded Pair",
];

type CatData = {
  id: number;
  name: string;
  photoUrl: string | null;
  breed: string | null;
  colorPattern: string | null;
  dob: Date | null;
  sex: "female" | "male" | "unknown";
  weight: string | null;
  personalityTags: string[] | null;
  bio: string | null;
  adoptionFee: string | null;
  isAltered: boolean;
  felvFivStatus: "negative" | "positive" | "unknown" | "not_tested";
  status: "available" | "adopted" | "medical_hold" | "foster" | "trial";
  rescueId: string | null;
  shelterluvId: string | null;
  microchipNumber: string | null;
  arrivalDate: Date | null;
  intakeType: string | null;
  medicalNotes: string | null;
  vaccinationsDue: Array<{ name: string; dueDate: string }> | null;
  fleaTreatmentDue: Date | null;
  adoptedDate: Date | null;
  adoptedBy: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

function getAge(dob: Date | null): string {
  if (!dob) return "Unknown";
  const now = new Date();
  const birth = new Date(dob);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0) return `${years}y ${months}m`;
  return `${months}m`;
}

function getStatusColor(status: string) {
  switch (status) {
    case "available": return "bg-green-100 text-green-800 border-green-200";
    case "adopted": return "bg-pink-100 text-pink-800 border-pink-200";
    case "medical_hold": return "bg-red-100 text-red-800 border-red-200";
    case "foster": return "bg-blue-100 text-blue-800 border-blue-200";
    case "trial": return "bg-amber-100 text-amber-800 border-amber-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "available": return "Available";
    case "adopted": return "Adopted";
    case "medical_hold": return "Medical Hold";
    case "foster": return "Foster";
    case "trial": return "Trial";
    default: return status;
  }
}

function getDaysAtCatfe(arrivalDate: Date | null): string {
  if (!arrivalDate) return "";
  const now = new Date();
  const arrival = new Date(arrivalDate);
  const diffMs = now.getTime() - arrival.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function CatManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CatData | null>(null);
  const [statusFilter, setStatusFilter] = useState<"available" | "all" | "adopted" | "medical_hold">("available");
  const [showMedical, setShowMedical] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importDocs, setImportDocs] = useState<File[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    breed: "Domestic Shorthair",
    colorPattern: "",
    dob: "",
    sex: "unknown" as "female" | "male" | "unknown",
    weight: "",
    personalityTags: [] as string[],
    bio: "",
    adoptionFee: "$150.00",
    isAltered: false,
    felvFivStatus: "not_tested" as "negative" | "positive" | "unknown" | "not_tested",
    status: "available" as "available" | "adopted" | "medical_hold" | "foster" | "trial",
    rescueId: "",
    shelterluvId: "",
    microchipNumber: "",
    arrivalDate: "",
    intakeType: "",
    medicalNotes: "",
    vaccinationsDue: [] as Array<{ name: string; dueDate: string }>,
    fleaTreatmentDue: "",
    adoptedDate: "",
    adoptedBy: "",
    isFeatured: false,
  });

  const catsQuery = trpc.cats.getAll.useQuery();
  const createMutation = trpc.cats.create.useMutation({
    onSuccess: () => {
      catsQuery.refetch();
      toast.success(`${formData.name} has been added to the roster.`);
      handleClose();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const updateMutation = trpc.cats.update.useMutation({
    onSuccess: () => {
      catsQuery.refetch();
      toast.success(`${formData.name} has been updated.`);
      handleClose();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const deleteMutation = trpc.cats.delete.useMutation({
    onSuccess: () => {
      catsQuery.refetch();
      toast.success("Cat has been removed from the roster.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const uploadPhotoMutation = trpc.cats.uploadPhoto.useMutation({
    onSuccess: () => {
      catsQuery.refetch();
    },
  });
  const parseDocsMutation = trpc.cats.parseDocuments.useMutation();

  const cats = catsQuery.data || [];
  const filteredCats = statusFilter === "all" ? cats
    : cats.filter(c => c.status === statusFilter);

  const availableCount = cats.filter(c => c.status === "available").length;
  const adoptedCount = cats.filter(c => c.status === "adopted").length;
  const medicalCount = cats.filter(c => c.status === "medical_hold").length;

  function handleClose() {
    setIsFormOpen(false);
    setEditingCat(null);
    setPhotoPreview(null);
    setPhotoFile(null);
    setShowMedical(false);
    setImportDocs([]);
    setIsImporting(false);
    setFormData({
      name: "",
      breed: "Domestic Shorthair",
      colorPattern: "",
      dob: "",
      sex: "unknown",
      weight: "",
      personalityTags: [],
      bio: "",
      adoptionFee: "$150.00",
      isAltered: false,
      felvFivStatus: "not_tested",
      status: "available",
      rescueId: "",
      shelterluvId: "",
      microchipNumber: "",
      arrivalDate: "",
      intakeType: "",
      medicalNotes: "",
      vaccinationsDue: [],
      fleaTreatmentDue: "",
      adoptedDate: "",
      adoptedBy: "",
      isFeatured: false,
    });
  }

  function handleEdit(cat: CatData) {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      breed: cat.breed || "Domestic Shorthair",
      colorPattern: cat.colorPattern || "",
      dob: cat.dob ? new Date(cat.dob).toISOString().split("T")[0] : "",
      sex: cat.sex,
      weight: cat.weight || "",
      personalityTags: cat.personalityTags || [],
      bio: cat.bio || "",
      adoptionFee: cat.adoptionFee || "$150.00",
      isAltered: cat.isAltered,
      felvFivStatus: cat.felvFivStatus,
      status: cat.status,
      rescueId: cat.rescueId || "",
      shelterluvId: cat.shelterluvId || "",
      microchipNumber: cat.microchipNumber || "",
      arrivalDate: cat.arrivalDate ? new Date(cat.arrivalDate).toISOString().split("T")[0] : "",
      intakeType: cat.intakeType || "",
      medicalNotes: cat.medicalNotes || "",
      vaccinationsDue: cat.vaccinationsDue || [],
      fleaTreatmentDue: cat.fleaTreatmentDue ? new Date(cat.fleaTreatmentDue).toISOString().split("T")[0] : "",
      adoptedDate: cat.adoptedDate ? new Date(cat.adoptedDate).toISOString().split("T")[0] : "",
      adoptedBy: cat.adoptedBy || "",
      isFeatured: cat.isFeatured,
    });
    setPhotoPreview(cat.photoUrl || null);
    setIsFormOpen(true);
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadPhoto(catId: number) {
    if (!photoFile) return;
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // Remove data:... prefix
        };
        reader.readAsDataURL(photoFile);
      });
      await uploadPhotoMutation.mutateAsync({
        catId,
        photoData: base64,
        fileName: photoFile.name,
        mimeType: photoFile.type,
      });
    } catch (err) {
      toast.error("Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit() {
    const payload: any = {
      name: formData.name,
      breed: formData.breed || undefined,
      colorPattern: formData.colorPattern || null,
      sex: formData.sex,
      weight: formData.weight || null,
      personalityTags: formData.personalityTags.length > 0 ? formData.personalityTags : null,
      bio: formData.bio || null,
      adoptionFee: formData.adoptionFee || undefined,
      isAltered: formData.isAltered,
      felvFivStatus: formData.felvFivStatus,
      status: formData.status,
      rescueId: formData.rescueId || null,
      shelterluvId: formData.shelterluvId || null,
      microchipNumber: formData.microchipNumber || null,
      intakeType: formData.intakeType || null,
      medicalNotes: formData.medicalNotes || null,
      vaccinationsDue: formData.vaccinationsDue.length > 0 ? formData.vaccinationsDue : null,
      isFeatured: formData.isFeatured,
      adoptedBy: formData.adoptedBy || null,
    };

    if (formData.dob) payload.dob = new Date(formData.dob);
    if (formData.arrivalDate) payload.arrivalDate = new Date(formData.arrivalDate);
    if (formData.fleaTreatmentDue) payload.fleaTreatmentDue = new Date(formData.fleaTreatmentDue);
    if (formData.adoptedDate) payload.adoptedDate = new Date(formData.adoptedDate);

    if (editingCat) {
      const result = await updateMutation.mutateAsync({ id: editingCat.id, ...payload });
      if (photoFile && result) await uploadPhoto(result.id);
    } else {
      const result = await createMutation.mutateAsync(payload);
      if (photoFile && result) await uploadPhoto(result.id);
    }
  }

  async function handleDocImport() {
    if (importDocs.length === 0) return;
    setIsImporting(true);
    try {
      // Convert files to base64
      const documents = await Promise.all(
        importDocs.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(",")[1]);
            };
            reader.readAsDataURL(file);
          });
          return {
            data: base64,
            fileName: file.name,
            mimeType: file.type,
          };
        })
      );

      const result = await parseDocsMutation.mutateAsync({ documents });

      // Pre-fill the form with extracted data
      setFormData((prev) => ({
        ...prev,
        name: result.name || prev.name,
        breed: result.breed || prev.breed,
        colorPattern: result.colorPattern || prev.colorPattern,
        dob: result.dob || prev.dob,
        sex: (result.sex as any) || prev.sex,
        weight: result.weight || prev.weight,
        personalityTags: result.personalityTags || prev.personalityTags,
        bio: result.bio || prev.bio,
        adoptionFee: result.adoptionFee || prev.adoptionFee,
        isAltered: result.isAltered ?? prev.isAltered,
        felvFivStatus: (result.felvFivStatus as any) || prev.felvFivStatus,
        rescueId: result.rescueId || prev.rescueId,
        shelterluvId: result.shelterluvId || prev.shelterluvId,
        microchipNumber: result.microchipNumber || prev.microchipNumber,
        intakeType: result.intakeType || prev.intakeType,
        medicalNotes: result.medicalNotes || prev.medicalNotes,
        vaccinationsDue: result.vaccinationsDue || prev.vaccinationsDue,
        fleaTreatmentDue: result.fleaTreatmentDue || prev.fleaTreatmentDue,
      }));

      // Auto-expand medical section if we got medical data
      if (result.medicalNotes || result.vaccinationsDue?.length || result.rescueId) {
        setShowMedical(true);
      }

      setImportDocs([]);
      toast.success(`Extracted info for ${result.name || "cat"}. Review and save!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to extract data from documents");
    } finally {
      setIsImporting(false);
    }
  }

  function handleDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImportDocs((prev) => [...prev, ...files]);
    // Reset input so same file can be selected again
    e.target.value = "";
  }

  function toggleTag(tag: string) {
    setFormData(prev => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter(t => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  }

  function addVaccination() {
    setFormData(prev => ({
      ...prev,
      vaccinationsDue: [...prev.vaccinationsDue, { name: "", dueDate: "" }],
    }));
  }

  function removeVaccination(index: number) {
    setFormData(prev => ({
      ...prev,
      vaccinationsDue: prev.vaccinationsDue.filter((_, i) => i !== index),
    }));
  }

  function updateVaccination(index: number, field: "name" | "dueDate", value: string) {
    setFormData(prev => ({
      ...prev,
      vaccinationsDue: prev.vaccinationsDue.map((v, i) => i === index ? { ...v, [field]: value } : v),
    }));
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || uploadingPhoto;

  return (
    <div className="space-y-4">
      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("available")}
          className={`rounded-lg p-3 border text-left transition-colors ${
            statusFilter === "available" ? "bg-green-50 border-green-400 ring-1 ring-green-400" : "bg-card hover:bg-accent/50"
          }`}
        >
          <p className="text-xl font-bold flex items-center gap-1">
            {availableCount}
            <Cat className="w-4 h-4 text-green-600" />
          </p>
          <p className="text-xs text-muted-foreground">Available</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("adopted")}
          className={`rounded-lg p-3 border text-left transition-colors ${
            statusFilter === "adopted" ? "bg-pink-50 border-pink-400 ring-1 ring-pink-400" : "bg-card hover:bg-accent/50"
          }`}
        >
          <p className="text-xl font-bold flex items-center gap-1">
            {adoptedCount}
            <Heart className="w-4 h-4 text-pink-500" />
          </p>
          <p className="text-xs text-muted-foreground">Adopted</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("medical_hold")}
          className={`rounded-lg p-3 border text-left transition-colors ${
            statusFilter === "medical_hold" ? "bg-red-50 border-red-400 ring-1 ring-red-400" : "bg-card hover:bg-accent/50"
          }`}
        >
          <p className="text-xl font-bold flex items-center gap-1">
            {medicalCount}
            <Stethoscope className="w-4 h-4 text-red-500" />
          </p>
          <p className="text-xs text-muted-foreground">Medical</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`rounded-lg p-3 border text-left transition-colors ${
            statusFilter === "all" ? "bg-primary/10 border-primary ring-1 ring-primary" : "bg-card hover:bg-accent/50"
          }`}
        >
          <p className="text-xl font-bold">{cats.length}</p>
          <p className="text-xs text-muted-foreground">All Cats</p>
        </button>
      </div>

      {/* Cat List */}
      {catsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCats.length === 0 ? (
        <div className="text-center py-12">
          <Cat className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {statusFilter === "available" ? "No available cats" :
             statusFilter === "adopted" ? "No adopted cats yet" :
             statusFilter === "medical_hold" ? "No cats on medical hold" :
             "No cats in the roster"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap + to add a cat from a kennel card
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCats.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleEdit(cat as CatData)}
            >
              {/* Photo */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {cat.photoUrl ? (
                  <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Cat className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{cat.name}</h3>
                  {cat.isFeatured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {cat.breed}{cat.colorPattern ? ` · ${cat.colorPattern}` : ""} · {cat.sex === "female" ? "♀" : cat.sex === "male" ? "♂" : "?"} · {getAge(cat.dob)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${getStatusColor(cat.status)}`}>
                    {getStatusLabel(cat.status)}
                  </span>
                  {cat.arrivalDate && cat.status === "available" && (
                    <span className="text-[10px] text-muted-foreground">
                      {getDaysAtCatfe(cat.arrivalDate)} at Catfé
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(cat as CatData);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Cat FAB */}
      <div className="fixed bottom-20 sm:bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => {
            handleClose();
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Cat Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <SheetContent side="bottom" className="h-[92vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Cat className="w-5 h-5" />
              {editingCat ? `Edit ${editingCat.name}` : "Add New Cat"}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(92vh-60px)]">
            <div className="p-4 space-y-6">
              {/* Document Import Section */}
              {!editingCat && (
                <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ScanLine className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-semibold">Import from Documents</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload kennel card and/or medical history — AI will auto-fill the form
                  </p>

                  {/* Selected docs list */}
                  {importDocs.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {importDocs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-background rounded px-2 py-1.5 border">
                          <FileUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate flex-1">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => setImportDocs(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => docInputRef.current?.click()}
                      disabled={isImporting}
                    >
                      <FileUp className="w-4 h-4 mr-1" />
                      {importDocs.length > 0 ? "Add More" : "Select Files"}
                    </Button>
                    {importDocs.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleDocImport}
                        disabled={isImporting}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <ScanLine className="w-4 h-4 mr-1" />
                            Extract Info
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <input
                    ref={docInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleDocSelect}
                  />
                </div>
              )}

              {/* Photo Upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Photo</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Upload</span>
                      </div>
                    )}
                  </div>
                  {photoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoFile(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              {/* === Kennel Card Info === */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Cat className="w-4 h-4" />
                  Kennel Card Info
                </h3>

                {/* Name */}
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Judy"
                  />
                </div>

                {/* Breed & Color/Pattern */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                      placeholder="Domestic Shorthair"
                    />
                  </div>
                  <div>
                    <Label htmlFor="colorPattern">Color / Pattern</Label>
                    <Input
                      id="colorPattern"
                      value={formData.colorPattern}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorPattern: e.target.value }))}
                      placeholder="Grey Tabby"
                    />
                  </div>
                </div>

                {/* Sex & DOB */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Sex</Label>
                    <Select value={formData.sex} onValueChange={(v) => setFormData(prev => ({ ...prev, sex: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female ♀</SelectItem>
                        <SelectItem value="male">Male ♂</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Weight & Adoption Fee */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="7.8 lbs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adoptionFee">Adoption Fee</Label>
                    <Input
                      id="adoptionFee"
                      value={formData.adoptionFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, adoptionFee: e.target.value }))}
                      placeholder="$150.00"
                    />
                  </div>
                </div>

                {/* Spayed/Neutered & FeLV/FIV */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="isAltered" className="text-sm">Spayed/Neutered</Label>
                    <Switch
                      id="isAltered"
                      checked={formData.isAltered}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, isAltered: v }))}
                    />
                  </div>
                  <div>
                    <Label>FeLV/FIV</Label>
                    <Select value={formData.felvFivStatus} onValueChange={(v) => setFormData(prev => ({ ...prev, felvFivStatus: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="negative">Negative ✓</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                        <SelectItem value="not_tested">Not Tested</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">🟢 Available</SelectItem>
                      <SelectItem value="adopted">💕 Adopted</SelectItem>
                      <SelectItem value="medical_hold">🔴 Medical Hold</SelectItem>
                      <SelectItem value="foster">🔵 Foster</SelectItem>
                      <SelectItem value="trial">🟡 Trial Adoption</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Adopted fields (show when status is adopted) */}
                {formData.status === "adopted" && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-pink-50 border border-pink-200">
                    <div>
                      <Label htmlFor="adoptedDate">Adoption Date</Label>
                      <Input
                        id="adoptedDate"
                        type="date"
                        value={formData.adoptedDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, adoptedDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="adoptedBy">Adopted By</Label>
                      <Input
                        id="adoptedBy"
                        value={formData.adoptedBy}
                        onChange={(e) => setFormData(prev => ({ ...prev, adoptedBy: e.target.value }))}
                        placeholder="Adopter name"
                      />
                    </div>
                  </div>
                )}

                {/* Featured toggle */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="isFeatured" className="text-sm font-medium">Cat of the Week</Label>
                    <p className="text-xs text-muted-foreground">Feature this cat on the TV display</p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, isFeatured: v }))}
                  />
                </div>

                {/* Personality Tags */}
                <div>
                  <Label className="mb-2 block">Personality Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                          formData.personalityTags.includes(tag)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card hover:bg-accent/50 border-border"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Bio / Description</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Paste the memo from the kennel card..."
                    rows={4}
                  />
                </div>
              </div>

              {/* === Staff-Only Info (Collapsible) === */}
              <div className="border rounded-lg">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 text-left"
                  onClick={() => setShowMedical(!showMedical)}
                >
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Staff-Only Info
                  </span>
                  {showMedical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showMedical && (
                  <div className="p-3 pt-0 space-y-4 border-t">
                    {/* Rescue ID & Shelterluv ID */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="rescueId">Rescue ID</Label>
                        <Input
                          id="rescueId"
                          value={formData.rescueId}
                          onChange={(e) => setFormData(prev => ({ ...prev, rescueId: e.target.value }))}
                          placeholder="KRLA-A-8326"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shelterluvId">Shelterluv ID</Label>
                        <Input
                          id="shelterluvId"
                          value={formData.shelterluvId}
                          onChange={(e) => setFormData(prev => ({ ...prev, shelterluvId: e.target.value }))}
                          placeholder="205889349"
                        />
                      </div>
                    </div>

                    {/* Microchip */}
                    <div>
                      <Label htmlFor="microchipNumber">Microchip #</Label>
                      <Input
                        id="microchipNumber"
                        value={formData.microchipNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, microchipNumber: e.target.value }))}
                        placeholder="941000029293663"
                      />
                    </div>

                    {/* Arrival Date & Intake Type */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="arrivalDate">Arrival at Catfé</Label>
                        <Input
                          id="arrivalDate"
                          type="date"
                          value={formData.arrivalDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="intakeType">Intake Type</Label>
                        <Input
                          id="intakeType"
                          value={formData.intakeType}
                          onChange={(e) => setFormData(prev => ({ ...prev, intakeType: e.target.value }))}
                          placeholder="Transfer In"
                        />
                      </div>
                    </div>

                    {/* Vaccinations Due */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Vaccinations Due
                        </Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addVaccination}>
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Add
                        </Button>
                      </div>
                      {formData.vaccinationsDue.map((vax, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <Input
                            value={vax.name}
                            onChange={(e) => updateVaccination(i, "name", e.target.value)}
                            placeholder="Rabies"
                            className="flex-1"
                          />
                          <Input
                            type="date"
                            value={vax.dueDate}
                            onChange={(e) => updateVaccination(i, "dueDate", e.target.value)}
                            className="w-36"
                          />
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeVaccination(i)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Flea Treatment Due */}
                    <div>
                      <Label htmlFor="fleaTreatmentDue">Flea Treatment Due</Label>
                      <Input
                        id="fleaTreatmentDue"
                        type="date"
                        value={formData.fleaTreatmentDue}
                        onChange={(e) => setFormData(prev => ({ ...prev, fleaTreatmentDue: e.target.value }))}
                      />
                    </div>

                    {/* Medical Notes */}
                    <div>
                      <Label htmlFor="medicalNotes">Medical Notes</Label>
                      <Textarea
                        id="medicalNotes"
                        value={formData.medicalNotes}
                        onChange={(e) => setFormData(prev => ({ ...prev, medicalNotes: e.target.value }))}
                        placeholder="Dental work, treatments, special needs..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pb-8">
                {editingCat && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Remove ${editingCat.name} from the roster?`)) {
                        deleteMutation.mutate({ id: editingCat.id });
                        handleClose();
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
                <div className="flex-1" />
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : null}
                  {editingCat ? "Save" : "Add Cat"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
