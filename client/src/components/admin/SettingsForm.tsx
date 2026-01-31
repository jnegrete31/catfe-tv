import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Settings } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Github } from "lucide-react";

const settingsSchema = z.object({
  locationName: z.string().min(1).max(255),
  defaultDurationSeconds: z.number().min(1).max(300),
  fallbackMode: z.enum(["AMBIENT", "LOOP_DEFAULT"]),
  snapAndPurrFrequency: z.number().min(1).max(20),
  totalAdoptionCount: z.number().min(0),
  refreshIntervalSeconds: z.number().min(10).max(600),
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
      githubRepo: settings?.githubRepo || "",
      githubBranch: settings?.githubBranch || "main",
    },
  });
  
  const watchedFallbackMode = watch("fallbackMode");
  
  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate({
      ...data,
      githubRepo: data.githubRepo || null,
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
