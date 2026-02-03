import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Settings } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Github, Upload, X, Image as ImageIcon, Video, FileText } from "lucide-react";

const settingsSchema = z.object({
  locationName: z.string().min(1).max(255),
  defaultDurationSeconds: z.number().min(1).max(300),
  fallbackMode: z.enum(["AMBIENT", "LOOP_DEFAULT"]),
  snapAndPurrFrequency: z.number().min(1).max(20),
  totalAdoptionCount: z.number().min(0),
  refreshIntervalSeconds: z.number().min(10).max(600),
  logoUrl: z.string().max(1024).optional().nullable(),
  livestreamUrl: z.string().max(1024).optional().nullable(),
  waiverUrl: z.string().max(1024).optional().nullable(),
  githubRepo: z.string().max(255).optional().nullable(),
  githubBranch: z.string().max(64).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  settings: Settings | null;
  onSuccess?: () => void;
}

export function SettingsForm({ settings, onSuccess }: SettingsFormProps) {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.logoUrl || null);
  
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      utils.settings.get.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const uploadMutation = trpc.github.uploadImage.useMutation({
    onSuccess: (data) => {
      setLogoPreview(data.rawUrl);
      setValue("logoUrl", data.rawUrl, { shouldDirty: true });
      toast.success("Logo uploaded successfully");
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
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      locationName: settings?.locationName || "Catfé",
      defaultDurationSeconds: settings?.defaultDurationSeconds || 10,
      fallbackMode: settings?.fallbackMode || "LOOP_DEFAULT",
      snapAndPurrFrequency: settings?.snapAndPurrFrequency || 5,
      totalAdoptionCount: settings?.totalAdoptionCount || 0,
      refreshIntervalSeconds: settings?.refreshIntervalSeconds || 60,
      logoUrl: settings?.logoUrl || null,
      livestreamUrl: settings?.livestreamUrl || null,
      waiverUrl: settings?.waiverUrl || null,
      githubRepo: settings?.githubRepo || "",
      githubBranch: settings?.githubBranch || "main",
    },
  });
  
  const watchedFallbackMode = watch("fallbackMode");
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
      toast.error("Please select a valid image file (JPG, PNG, GIF, WebP, HEIC)");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    
    setIsUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const base64Content = base64.split(',')[1]; // Remove data URL prefix
      
      // Generate unique filename
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const filename = `logo-${Date.now()}.${ext}`;
      
      // Upload to GitHub
      uploadMutation.mutate({
        filename,
        content: base64Content,
        message: "Upload Catfé TV logo",
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setValue("logoUrl", null, { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const onSubmit = (data: SettingsFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      ...data,
      githubRepo: data.githubRepo || null,
      logoUrl: data.logoUrl || null,
      livestreamUrl: data.livestreamUrl || null,
      waiverUrl: data.waiverUrl || null,
    };
    updateMutation.mutate(payload);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-600" />
            TV Logo
          </CardTitle>
          <CardDescription>
            Upload your custom logo to display on all TV screens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Preview */}
          {logoPreview ? (
            <div className="relative inline-block">
              <div className="w-48 h-24 bg-gray-900 rounded-lg flex items-center justify-center p-4 border-2 border-dashed border-gray-300">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Preview on dark background (as it appears on TV)
              </p>
            </div>
          ) : (
            <div 
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload logo
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG with transparent background recommended
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,.heic,.heif"
            onChange={handleLogoUpload}
            className="hidden"
          />
          
          {logoPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Change Logo"}
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground">
            Your logo will appear in the bottom-left corner of all TV screens.
            Use a logo with transparent background for best results.
          </p>
        </CardContent>
      </Card>
      
      {/* Livestream Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            Live Stream
          </CardTitle>
          <CardDescription>
            Display a live camera feed from your cat lounge on TV screens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="livestreamUrl">HLS Stream URL</Label>
            <Input
              id="livestreamUrl"
              {...register("livestreamUrl")}
              placeholder="https://example.com/stream.m3u8"
            />
            <p className="text-xs text-muted-foreground">
              Enter the HLS (.m3u8) URL from your streaming service (YouTube Live, Twitch, or IP camera)
            </p>
          </div>
          
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-1">Supported Formats</p>
            <ul className="text-muted-foreground list-disc list-inside space-y-1">
              <li>HLS streams (.m3u8) - recommended</li>
              <li>YouTube Live - use the HLS URL from your stream</li>
              <li>IP cameras with RTSP-to-HLS conversion</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Waiver QR Code Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Guest Waiver
          </CardTitle>
          <CardDescription>
            Display a QR code on the TV for guests to sign the waiver
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="waiverUrl">Waiver Form URL</Label>
            <Input
              id="waiverUrl"
              {...register("waiverUrl")}
              placeholder="https://yoursite.com/waiver"
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL where guests can sign your waiver (e.g., DocuSign, JotForm, Google Form)
            </p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <p className="font-medium mb-1 text-blue-800">How it works</p>
            <p className="text-blue-700">
              When a URL is set, a "Sign Waiver" QR code will appear on the TV display.
              Guests can scan it with their phone to quickly access and sign the waiver.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic display settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name</Label>
            <Input
              id="locationName"
              {...register("locationName")}
              placeholder="Catfé"
            />
            {errors.locationName && (
              <p className="text-xs text-destructive">{errors.locationName.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultDurationSeconds">Default Duration (s)</Label>
              <Input
                id="defaultDurationSeconds"
                type="number"
                min={1}
                max={300}
                {...register("defaultDurationSeconds", { valueAsNumber: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refreshIntervalSeconds">Refresh Interval (s)</Label>
              <Input
                id="refreshIntervalSeconds"
                type="number"
                min={10}
                max={600}
                {...register("refreshIntervalSeconds", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                How often TV checks for new content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Adoption Counter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">🎉 Adoption Counter</CardTitle>
          <CardDescription>Track your total adoptions for the celebration display</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalAdoptionCount">Total Cats Adopted</Label>
            <Input
              id="totalAdoptionCount"
              type="number"
              min={0}
              {...register("totalAdoptionCount", { valueAsNumber: true })}
              className="text-2xl font-bold text-center h-14"
            />
            <p className="text-xs text-muted-foreground">
              Enter the total number of cats adopted (including before this system was set up)
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Playlist Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Playlist</CardTitle>
          <CardDescription>Control how screens are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="snapAndPurrFrequency">Snap & Purr Frequency</Label>
            <Input
              id="snapAndPurrFrequency"
              type="number"
              min={1}
              max={20}
              {...register("snapAndPurrFrequency", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Show Snap & Purr screen every N screens
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Fallback Mode</Label>
            <Select
              value={watchedFallbackMode}
              onValueChange={(value) => setValue("fallbackMode", value as "AMBIENT" | "LOOP_DEFAULT")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOOP_DEFAULT">Loop Default Screens</SelectItem>
                <SelectItem value="AMBIENT">Ambient Mode</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              What to show when no scheduled content is available
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* GitHub Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>
            Configure GitHub repository for image storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="githubRepo">Repository</Label>
            <Input
              id="githubRepo"
              {...register("githubRepo")}
              placeholder="username/repository"
            />
            <p className="text-xs text-muted-foreground">
              Format: owner/repo (e.g., mycompany/catfe-assets)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="githubBranch">Branch</Label>
            <Input
              id="githubBranch"
              {...register("githubBranch")}
              placeholder="main"
            />
          </div>
          
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-1">GitHub Token Required</p>
            <p className="text-muted-foreground">
              A GitHub personal access token with repo write permissions must be 
              configured in the environment variables (GITHUB_TOKEN).
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Save Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={updateMutation.isPending || !isDirty}
      >
        <Save className="w-4 h-4 mr-2" />
        {updateMutation.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
