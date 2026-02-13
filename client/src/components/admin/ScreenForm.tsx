import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SCREEN_TYPES, SCREEN_TYPE_CONFIG, DAYS_OF_WEEK, TEXT_LIMITS } from "@shared/types";
import type { Screen } from "@shared/types";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle, Image as ImageIcon, X, Crop, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ImageCropper } from "./ImageCropper";
import { FormScreenPreview } from "./ScreenPreview";

// Time validation that allows empty string or valid HH:MM format
const timeSchema = z.string().refine(
  (val) => val === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val),
  { message: "Use HH:MM format" }
).optional().nullable();

const screenSchema = z.object({
  type: z.enum(SCREEN_TYPES),
  title: z.string().min(1, "Title is required").max(TEXT_LIMITS.title),
  subtitle: z.string().max(TEXT_LIMITS.subtitle).optional().nullable(),
  body: z.string().max(TEXT_LIMITS.body).optional().nullable(),
  imagePath: z.string().optional().nullable(),
  imageDisplayMode: z.enum(["cover", "contain"]).optional().nullable(),
  qrUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  startAt: z.date().optional().nullable(),
  endAt: z.date().optional().nullable(),
  daysOfWeek: z.array(z.number()).optional().nullable(),
  timeStart: timeSchema,
  timeEnd: timeSchema,
  priority: z.number().min(1).max(10),
  durationSeconds: z.number().min(1).max(300),
  isActive: z.boolean(),
  schedulingEnabled: z.boolean(),
  isAdopted: z.boolean(),
  eventDate: z.string().max(100).optional().nullable(),
  eventTime: z.string().max(100).optional().nullable(),
  eventLocation: z.string().max(255).optional().nullable(),
});

type ScreenFormData = z.infer<typeof screenSchema>;

interface ScreenFormProps {
  screen?: Screen | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ScreenForm({ screen, onSuccess, onCancel }: ScreenFormProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>(screen?.daysOfWeek || []);
  const [imagePreview, setImagePreview] = useState<string | null>(screen?.imagePath || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const utils = trpc.useUtils();
  
  const createMutation = trpc.screens.create.useMutation({
    onSuccess: () => {
      toast.success("Screen created successfully");
      utils.screens.getAll.invalidate();
      utils.screens.getActive.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.screens.update.useMutation({
    onSuccess: () => {
      toast.success("Screen updated successfully");
      utils.screens.getAll.invalidate();
      utils.screens.getActive.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const uploadMutation = trpc.github.uploadImage.useMutation({
    onSuccess: (data) => {
      setImagePreview(data.rawUrl);
      setValue("imagePath", data.rawUrl);
      toast.success("Image uploaded to GitHub");
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    },
  });
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ScreenFormData>({
    resolver: zodResolver(screenSchema),
    defaultValues: {
      type: screen?.type || "EVENT",
      title: screen?.title || "",
      subtitle: screen?.subtitle || "",
      body: screen?.body || "",
      imagePath: screen?.imagePath || "",
      imageDisplayMode: (screen as any)?.imageDisplayMode || "cover",
      qrUrl: screen?.qrUrl || "",
      startAt: screen?.startAt ? new Date(screen.startAt) : null,
      endAt: screen?.endAt ? new Date(screen.endAt) : null,
      daysOfWeek: screen?.daysOfWeek || [],
      timeStart: screen?.timeStart || "",
      timeEnd: screen?.timeEnd || "",
      priority: screen?.priority || 1,
      durationSeconds: screen?.durationSeconds || 10,
      isActive: screen?.isActive ?? true,
      schedulingEnabled: screen?.schedulingEnabled ?? false,
      isAdopted: (screen as any)?.isAdopted ?? false,
      eventDate: (screen as any)?.eventDate || "",
      eventTime: (screen as any)?.eventTime || "",
      eventLocation: (screen as any)?.eventLocation || "",
    },
  });
  
  const watchedType = watch("type");
  const watchedTitle = watch("title");
  const watchedSubtitle = watch("subtitle");
  const watchedBody = watch("body");
  const watchedStartAt = watch("startAt");
  const watchedEndAt = watch("endAt");
  
  // Update days of week when selection changes
  useEffect(() => {
    setValue("daysOfWeek", selectedDays);
  }, [selectedDays, setValue]);
  
  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  // Shared file processing logic - now shows cropper first
  const processFile = (file: File) => {
    // Validate file type - accept standard images and Apple HEIC/HEIF
    const isImage = file.type.startsWith("image/");
    const isAppleFormat = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
    if (!isImage && !isAppleFormat) {
      toast.error("Please select an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    
    // Convert to data URL and show cropper
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle cropped image - upload to GitHub
  const handleCroppedImage = (croppedBase64: string) => {
    setShowCropper(false);
    setImageToCrop(null);
    setIsUploading(true);
    
    // Extract base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = croppedBase64.split(",")[1];
    const filename = `${Date.now()}-cropped.jpg`;
    
    uploadMutation.mutate({
      filename,
      content: base64Data,
      message: `Upload cropped image for screen: ${watchedTitle || "untitled"}`,
    });
  };
  
  // Skip cropping and upload original
  const handleSkipCrop = () => {
    if (!imageToCrop) return;
    setShowCropper(false);
    setIsUploading(true);
    
    const base64Data = imageToCrop.split(",")[1];
    const filename = `${Date.now()}-original.jpg`;
    
    uploadMutation.mutate({
      filename,
      content: base64Data,
      message: `Upload image for screen: ${watchedTitle || "untitled"}`,
    });
    setImageToCrop(null);
  };
  
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    setValue("imagePath", "");
  };
  
  const onSubmit = (data: ScreenFormData) => {
    // Clean up empty strings
    const cleanData = {
      ...data,
      subtitle: data.subtitle || null,
      body: data.body || null,
      // Preserve existing image if no new image was uploaded and imagePreview still has the original
      imagePath: data.imagePath || imagePreview || null,
      imageDisplayMode: data.imageDisplayMode || "cover",
      qrUrl: data.qrUrl || null,
      timeStart: data.timeStart || null,
      timeEnd: data.timeEnd || null,
      daysOfWeek: data.daysOfWeek?.length ? data.daysOfWeek : null,
      eventDate: data.eventDate || null,
      eventTime: data.eventTime || null,
      eventLocation: data.eventLocation || null,
    };
    
    if (screen) {
      // For updates, only include imagePath if it changed or was explicitly cleared
      const updateData = { ...cleanData };
      // If imagePreview matches the original and form imagePath is empty, keep original
      if (!data.imagePath && imagePreview === screen.imagePath) {
        updateData.imagePath = screen.imagePath;
      }
      updateMutation.mutate({ id: screen.id, data: updateData });
    } else {
      createMutation.mutate(cleanData);
    }
  };
  
  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Screen Type */}
      <div className="space-y-2">
        <Label>Screen Type</Label>
        <Select
          value={watchedType}
          onValueChange={(value) => setValue("type", value as typeof watchedType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCREEN_TYPES.filter(type => type !== "POLL").map((type) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: SCREEN_TYPE_CONFIG[type].color }}
                  />
                  {SCREEN_TYPE_CONFIG[type].label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Enter screen title"
          maxLength={TEXT_LIMITS.title}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.title && (
            <span className="text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.title.message}
            </span>
          )}
          <span className={cn(
            "ml-auto",
            (watchedTitle?.length || 0) > TEXT_LIMITS.title * 0.9 && "text-amber-500"
          )}>
            {watchedTitle?.length || 0}/{TEXT_LIMITS.title}
          </span>
        </div>
      </div>
      
      {/* Subtitle */}
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          {...register("subtitle")}
          placeholder="Optional subtitle"
          maxLength={TEXT_LIMITS.subtitle}
        />
        <div className="flex justify-end text-xs text-muted-foreground">
          <span className={cn(
            (watchedSubtitle?.length || 0) > TEXT_LIMITS.subtitle * 0.9 && "text-amber-500"
          )}>
            {watchedSubtitle?.length || 0}/{TEXT_LIMITS.subtitle}
          </span>
        </div>
      </div>
      
      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="body">Body Text</Label>
        <Textarea
          id="body"
          {...register("body")}
          placeholder="Optional body text (keep it short for TV readability)"
          maxLength={TEXT_LIMITS.body}
          rows={3}
        />
        <div className="flex justify-end text-xs text-muted-foreground">
          <span className={cn(
            (watchedBody?.length || 0) > TEXT_LIMITS.body * 0.9 && "text-amber-500"
          )}>
            {watchedBody?.length || 0}/{TEXT_LIMITS.body}
          </span>
        </div>
      </div>
      
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Image</Label>
        {imagePreview ? (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full aspect-video object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label 
            className={cn(
              "flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer transition",
              isDragging 
                ? "border-primary bg-primary/10" 
                : "border-border hover:bg-muted/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center py-6 pointer-events-none">
              {isUploading ? (
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              ) : isDragging ? (
                <>
                  <ImageIcon className="w-10 h-10 text-primary mb-2" />
                  <p className="text-sm text-primary font-medium">
                    Drop image here
                  </p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Drag photo here or tap to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag from Photos app, or browse files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max 5MB · JPG, PNG, HEIC supported
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
        )}
        
        {/* Image Display Mode - only show when image is present */}
        {imagePreview && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <Label className="text-sm">Image Display Mode</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Choose how the image appears on the TV screen
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={watch("imageDisplayMode") === "cover" ? "default" : "outline"}
                size="sm"
                onClick={() => setValue("imageDisplayMode", "cover")}
                className="flex-1"
              >
                Fill Screen
              </Button>
              <Button
                type="button"
                variant={watch("imageDisplayMode") === "contain" ? "default" : "outline"}
                size="sm"
                onClick={() => setValue("imageDisplayMode", "contain")}
                className="flex-1"
              >
                Show Full Image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {watch("imageDisplayMode") === "cover" 
                ? "Image fills the screen (may crop edges). Best for photos."
                : "Shows entire image on themed background. Best for PNGs with transparency."}
            </p>
          </div>
        )}
      </div>
      
      {/* Event-specific fields - only show for EVENT type */}
      {watchedType === "EVENT" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Event Details</CardTitle>
            <p className="text-sm text-muted-foreground">These fields are displayed on the event slide with icons</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                {...register("eventDate")}
                placeholder="e.g., Saturday, Feb 15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime">Event Time</Label>
              <Input
                id="eventTime"
                {...register("eventTime")}
                placeholder="e.g., 5:30pm - 7:30pm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventLocation">Event Location</Label>
              <Input
                id="eventLocation"
                {...register("eventLocation")}
                placeholder="e.g., Catfé Santa Clarita"
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* QR URL */}
      <div className="space-y-2">
        <Label htmlFor="qrUrl">QR Code URL</Label>
        <Input
          id="qrUrl"
          {...register("qrUrl")}
          placeholder="https://example.com"
          type="url"
        />
        {errors.qrUrl && (
          <span className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.qrUrl.message}
          </span>
        )}
      </div>
      
      {/* Duration & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="durationSeconds">Duration (seconds)</Label>
          <Input
            id="durationSeconds"
            type="number"
            min={1}
            max={300}
            {...register("durationSeconds", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority (1-10)</Label>
          <Input
            id="priority"
            type="number"
            min={1}
            max={10}
            {...register("priority", { valueAsNumber: true })}
          />
        </div>
      </div>
      
      {/* Scheduling */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Scheduling</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="schedulingEnabled" className="text-sm font-normal text-muted-foreground">
                {watch("schedulingEnabled") ? "Enabled" : "Disabled"}
              </Label>
              <Switch
                id="schedulingEnabled"
                checked={watch("schedulingEnabled")}
                onCheckedChange={(checked) => setValue("schedulingEnabled", checked)}
              />
            </div>
          </div>
          {!watch("schedulingEnabled") && (
            <p className="text-sm text-muted-foreground mt-1">
              Screen will always show in the playlist (when active). Enable scheduling to restrict by date, day, or time.
            </p>
          )}
        </CardHeader>
        <CardContent className={cn("space-y-4", !watch("schedulingEnabled") && "opacity-50 pointer-events-none")}>
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedStartAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedStartAt ? format(watchedStartAt, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedStartAt || undefined}
                    onSelect={(date) => setValue("startAt", date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedEndAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedEndAt ? format(watchedEndAt, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedEndAt || undefined}
                    onSelect={(date) => setValue("endAt", date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Days of Week */}
          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Time Window */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeStart">Start Time</Label>
              <Input
                id="timeStart"
                type="time"
                {...register("timeStart")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeEnd">End Time</Label>
              <Input
                id="timeEnd"
                type="time"
                {...register("timeEnd")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Adopted Toggle - Only show for Adoption type screens */}
      {watchedType === "ADOPTION" && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
          <div>
            <Label htmlFor="isAdopted" className="text-green-800">Adopted!</Label>
            <p className="text-sm text-green-600">
              Mark this cat as adopted (shows "Adopted!" badge)
            </p>
          </div>
          <Switch
            id="isAdopted"
            checked={watch("isAdopted")}
            onCheckedChange={(checked) => setValue("isAdopted", checked)}
          />
        </div>
      )}
      
      {/* Active Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="isActive">Active</Label>
          <p className="text-sm text-muted-foreground">
            Show this screen in the playlist
          </p>
        </div>
        <Switch
          id="isActive"
          checked={watch("isActive")}
          onCheckedChange={(checked) => setValue("isActive", checked)}
        />
      </div>
      
      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPreview(true);
          }}
          disabled={isLoading}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : screen ? "Update Screen" : "Create Screen"}
        </Button>
      </div>
      
      {/* Image Cropper Dialog */}
      {showCropper && imageToCrop && (
        <ImageCropper
          imageUrl={imageToCrop}
          onCropComplete={handleCroppedImage}
          onCancel={() => {
            setShowCropper(false);
            setImageToCrop(null);
          }}
          aspectRatio={16 / 9}
        />
      )}
      
      {/* Live Preview Panel */}
      {showPreview && (
        <FormScreenPreview
          screen={{
            id: screen?.id || 0,
            type: watchedType,
            title: watchedTitle || "Preview Title",
            subtitle: watchedSubtitle || null,
            body: watchedBody || null,
            imagePath: imagePreview,
            imageDisplayMode: watch("imageDisplayMode") || "cover",
            qrUrl: watch("qrUrl") || null,
            isAdopted: watch("isAdopted") || false,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
}
