import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Heart, Camera, Sparkles, RefreshCw } from "lucide-react";

type CaptionType = "happy_tails" | "snap_purr";

interface Caption {
  id: number;
  type: CaptionType;
  text: string;
  sortOrder: number;
  isActive: boolean;
}

export default function CaptionManager() {
  const [newCaptionText, setNewCaptionText] = useState("");
  const [activeTab, setActiveTab] = useState<CaptionType>("snap_purr");

  const utils = trpc.useUtils();
  
  const { data: captions = [], isLoading } = trpc.captions.getAll.useQuery();
  
  const createMutation = trpc.captions.create.useMutation({
    onSuccess: () => {
      utils.captions.getAll.invalidate();
      setNewCaptionText("");
    },
  });

  const updateMutation = trpc.captions.update.useMutation({
    onSuccess: () => {
      utils.captions.getAll.invalidate();
    },
  });

  const deleteMutation = trpc.captions.delete.useMutation({
    onSuccess: () => {
      utils.captions.getAll.invalidate();
    },
  });

  const seedMutation = trpc.captions.seedDefaults.useMutation({
    onSuccess: () => {
      utils.captions.getAll.invalidate();
    },
  });

  const filteredCaptions = captions.filter((c: Caption) => c.type === activeTab);

  const handleAddCaption = () => {
    if (!newCaptionText.trim()) return;
    createMutation.mutate({
      type: activeTab,
      text: newCaptionText.trim(),
    });
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, isActive });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this caption?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSeedDefaults = () => {
    if (confirm("This will add the default captions. Continue?")) {
      seedMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Suggested Captions</h2>
          <p className="text-gray-600">Manage the quick-tap caption suggestions for photo uploads</p>
        </div>
        {captions.length === 0 && (
          <Button onClick={handleSeedDefaults} variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Add Default Captions
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CaptionType)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="snap_purr" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Snap & Purr
          </TabsTrigger>
          <TabsTrigger value="happy_tails" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Happy Tails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="snap_purr" className="mt-4">
          <CaptionList
            captions={filteredCaptions}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            type="snap_purr"
          />
        </TabsContent>

        <TabsContent value="happy_tails" className="mt-4">
          <CaptionList
            captions={filteredCaptions}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            type="happy_tails"
          />
        </TabsContent>
      </Tabs>

      {/* Add New Caption */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Caption</CardTitle>
          <CardDescription>
            Add a new suggested caption for {activeTab === "snap_purr" ? "Snap & Purr" : "Happy Tails"} uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={newCaptionText}
              onChange={(e) => setNewCaptionText(e.target.value)}
              placeholder="Enter caption text (max 100 characters)"
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && handleAddCaption()}
            />
            <Button 
              onClick={handleAddCaption}
              disabled={!newCaptionText.trim() || createMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tip: Use emojis to make captions more fun! 🐱 ❤️ ✨
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CaptionList({
  captions,
  onToggleActive,
  onDelete,
  type,
}: {
  captions: Caption[];
  onToggleActive: (id: number, isActive: boolean) => void;
  onDelete: (id: number) => void;
  type: CaptionType;
}) {
  if (captions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <p>No captions yet for {type === "snap_purr" ? "Snap & Purr" : "Happy Tails"}.</p>
          <p className="text-sm mt-1">Add your first caption below!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {captions.map((caption) => (
            <div
              key={caption.id}
              className={`flex items-center gap-4 p-4 ${
                !caption.isActive ? "opacity-50 bg-gray-50" : ""
              }`}
            >
              <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
              
              <div className="flex-1">
                <span className={`text-sm ${!caption.isActive ? "line-through" : ""}`}>
                  {caption.text}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {caption.isActive ? "Active" : "Hidden"}
                  </span>
                  <Switch
                    checked={caption.isActive}
                    onCheckedChange={(checked) => onToggleActive(caption.id, checked)}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(caption.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
