import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, RotateCcw, Move, Maximize2, Type, Image, QrCode, Clock, Sun, Hash, Eye, EyeOff, Trash2, Plus, GripVertical, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

// Widget overrides type for per-slide widget customization
interface WidgetOverrides {
  logo?: {
    visible?: boolean;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
  };
  weather?: {
    visible?: boolean;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    opacity?: number;
  };
  clock?: {
    visible?: boolean;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    opacity?: number;
    showDate?: boolean;
  };
  waiverQr?: {
    visible?: boolean;
    x?: number;
    y?: number;
    size?: number;
    opacity?: number;
    label?: string;
  };
}

// Template element type
interface TemplateElement {
  id: string;
  type: "title" | "subtitle" | "body" | "photo" | "qrCode" | "logo" | "clock" | "weather" | "counter" | "galleryGrid" | "adoptionGrid" | "catPhoto";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  padding?: number;
  objectFit?: "cover" | "contain" | "fill";
  visible?: boolean;
  galleryType?: "snap_purr" | "happy_tails"; // For gallery grid elements
  photosToShow?: number; // Number of photos to display in gallery
}

// Screen types available for editing
const SCREEN_TYPES = [
  { value: "ADOPTION", label: "Adoption" },
  { value: "ADOPTION_SHOWCASE", label: "Adoption Showcase" },
  { value: "ADOPTION_COUNTER", label: "Adoption Counter" },
  { value: "EVENT", label: "Event" },
  { value: "CHECK_IN", label: "Check-In" },
  { value: "THANK_YOU", label: "Thank You" },
  { value: "TODAY_AT_CATFE", label: "Today at Catfé" },
  { value: "MEMBERSHIP", label: "Membership" },
  { value: "REMINDER", label: "Reminder" },
  { value: "HAPPY_TAILS", label: "Happy Tails" },
  { value: "SNAP_PURR_GALLERY", label: "Snap & Purr Gallery" },
  { value: "LIVESTREAM", label: "Livestream" },
  { value: "CUSTOM", label: "Custom Slides" },
];

// Element type icons
const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  title: <Type className="h-4 w-4" />,
  subtitle: <Type className="h-4 w-4" />,
  body: <Type className="h-4 w-4" />,
  photo: <Image className="h-4 w-4" />,
  qrCode: <QrCode className="h-4 w-4" />,
  logo: <Image className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  weather: <Sun className="h-4 w-4" />,
  counter: <Hash className="h-4 w-4" />,
  galleryGrid: <Image className="h-4 w-4" />,
  adoptionGrid: <Image className="h-4 w-4" />,
  catPhoto: <Image className="h-4 w-4" />,
};

export default function SlideEditor() {
  const [, navigate] = useLocation();
  const [selectedScreenType, setSelectedScreenType] = useState("ADOPTION");
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#1a1a2e");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasChanges, setHasChanges] = useState(false);
  const [showNewSlideDialog, setShowNewSlideDialog] = useState(false);
  const [newSlideTitle, setNewSlideTitle] = useState("");
  const [isCreatingSlide, setIsCreatingSlide] = useState(false);
  const [templateName, setTemplateName] = useState<string>("");
  const [selectedCustomSlideId, setSelectedCustomSlideId] = useState<number | null>(null);
  const [widgetOverrides, setWidgetOverrides] = useState<WidgetOverrides>({
    logo: { visible: true, x: 2, y: 2, width: 8, height: 8, opacity: 1 },
    weather: { visible: true, x: 85, y: 2, fontSize: 18, color: "#ffffff", opacity: 1 },
    clock: { visible: true, x: 92, y: 2, fontSize: 24, color: "#ffffff", opacity: 1, showDate: true },
    waiverQr: { visible: true, x: 2, y: 2, size: 80, opacity: 1, label: "Sign Waiver" },
  });
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // Grid settings
  const GRID_SIZE = 5; // 5% increments
  const SNAP_THRESHOLD = 2; // Snap within 2% of grid line

  // Snap value to grid
  const snapValue = (value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  // Fetch template for selected screen type (used for non-CUSTOM types)
  const { data: template, refetch: refetchTemplate, isLoading: isLoadingTemplate } = trpc.templates.getByScreenType.useQuery(
    { screenType: selectedScreenType },
    { enabled: !!selectedScreenType && selectedScreenType !== 'CUSTOM', staleTime: 0 }
  );

  // Fetch list of custom slides when CUSTOM is selected
  const { data: customSlides, refetch: refetchCustomSlides } = trpc.screens.getCustomSlides.useQuery(
    undefined,
    { enabled: selectedScreenType === 'CUSTOM', staleTime: 0 }
  );

  // Save per-screen template override mutation (for individual custom slides)
  const saveForScreenMutation = trpc.templates.saveForScreen.useMutation({
    onSuccess: () => {
      toast.success("Custom slide saved!");
      setHasChanges(false);
      refetchCustomSlides();
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  // Handle screen type change - reset state and refetch
  const handleScreenTypeChange = (newScreenType: string) => {
    // Reset to defaults before loading new template
    setElements([]);
    setBackgroundColor("#1a1a2e");
    setSelectedElementId(null);
    setTemplateName("");
    setSelectedCustomSlideId(null);
    setWidgetOverrides({
      logo: { visible: true, x: 2, y: 2, width: 8, height: 8, opacity: 1 },
      weather: { visible: true, x: 85, y: 2, fontSize: 18, color: "#ffffff", opacity: 1 },
      clock: { visible: true, x: 92, y: 2, fontSize: 24, color: "#ffffff", opacity: 1, showDate: true },
      waiverQr: { visible: true, x: 2, y: 2, size: 80, opacity: 1, label: "Sign Waiver" },
    });
    setHasChanges(false);
    setSelectedScreenType(newScreenType);
  };

  // Handle selecting a specific custom slide to edit
  const handleSelectCustomSlide = (slide: any) => {
    setSelectedCustomSlideId(slide.id);
    setTemplateName(slide.title);
    setSelectedElementId(null);
    setHasChanges(false);
    // Load the per-screen templateOverride if it exists
    if (slide.templateOverride) {
      try {
        const override = JSON.parse(slide.templateOverride);
        setElements(JSON.parse(override.elements || '[]'));
        setBackgroundColor(override.backgroundColor || '#1a1a2e');
        if (override.widgetOverrides) {
          const parsedOverrides = typeof override.widgetOverrides === 'string' ? JSON.parse(override.widgetOverrides) : override.widgetOverrides;
          setWidgetOverrides(prev => ({ ...prev, ...parsedOverrides }));
        }
      } catch (e) {
        setElements([]);
        setBackgroundColor('#1a1a2e');
      }
    } else {
      setElements([]);
      setBackgroundColor('#1a1a2e');
    }
  };

  // Save template mutation
  const saveMutation = trpc.templates.save.useMutation({
    onSuccess: () => {
      toast.success("Template saved successfully!");
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  // Reset to defaults mutation
  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template reset to defaults");
      refetchTemplate();
      setHasChanges(false);
    },
  });

  // Load template when it changes (for non-CUSTOM types)
  useEffect(() => {
    if (template && selectedScreenType !== 'CUSTOM') {
      try {
        const parsedElements = JSON.parse(template.elements || "[]");
        setElements(parsedElements);
        setBackgroundColor(template.backgroundColor || "#1a1a2e");
        // Load template name if available
        if ('name' in template && template.name) {
          setTemplateName(template.name as string);
        } else {
          setTemplateName("");
        }
        // Load widget overrides if available
        if ('widgetOverrides' in template && template.widgetOverrides) {
          const parsedOverrides = JSON.parse(template.widgetOverrides as string);
          setWidgetOverrides(prev => ({ ...prev, ...parsedOverrides }));
        }
      } catch (e) {
        console.error("Failed to parse template elements:", e);
        setElements([]);
      }
    }
  }, [template, selectedScreenType]);

  // Get selected element
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Update element property
  const updateElement = useCallback((id: string, updates: Partial<TemplateElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
    setHasChanges(true);
  }, []);

  // Handle mouse down on element (start drag)
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElementId(elementId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move (dragging)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedElementId || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      const element = elements.find((el) => el.id === selectedElementId);
      if (!element) return;

      const newX = Math.max(0, Math.min(100 - element.width, element.x + deltaX));
      const newY = Math.max(0, Math.min(100 - element.height, element.y + deltaY));

      updateElement(selectedElementId, { x: newX, y: newY });
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, selectedElementId, dragStart, elements, updateElement]
  );

  // Handle mouse up (stop drag) - snap to grid
  const handleMouseUp = useCallback(() => {
    // Snap element to grid when drag ends
    if (isDragging && selectedElementId && snapToGrid) {
      const element = elements.find((el) => el.id === selectedElementId);
      if (element) {
        updateElement(selectedElementId, {
          x: snapValue(element.x),
          y: snapValue(element.y),
        });
      }
    }
    // Snap element size to grid when resize ends
    if (isResizing && selectedElementId && snapToGrid) {
      const element = elements.find((el) => el.id === selectedElementId);
      if (element) {
        updateElement(selectedElementId, {
          width: snapValue(element.width),
          height: snapValue(element.height),
        });
      }
    }
    setIsDragging(false);
    setIsResizing(false);
  }, [isDragging, isResizing, selectedElementId, elements, snapToGrid, snapValue, updateElement]);

  // Add global mouse listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle resize
  const handleResizeMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElementId(elementId);
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle resize mouse move
  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || !selectedElementId || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      const element = elements.find((el) => el.id === selectedElementId);
      if (!element) return;

      const newWidth = Math.max(5, Math.min(100 - element.x, element.width + deltaX));
      const newHeight = Math.max(5, Math.min(100 - element.y, element.height + deltaY));

      updateElement(selectedElementId, { width: newWidth, height: newHeight });
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove);
      return () => window.removeEventListener("mousemove", handleResizeMove);
    }
  }, [isResizing, selectedElementId, dragStart, elements, updateElement]);

  // Add new element
  const addElement = (type: TemplateElement["type"]) => {
    // Default sizes based on element type
    let width = 30;
    let height = 15;
    let x = 10;
    let y = 10;
    let galleryType: "snap_purr" | "happy_tails" | undefined = undefined;
    let photosToShow: number | undefined = undefined;
    
    // Special sizing for dynamic content elements
    if (type === "galleryGrid") {
      width = 90;
      height = 60;
      x = 5;
      y = 25;
      // Auto-detect gallery type based on screen type
      galleryType = selectedScreenType === "HAPPY_TAILS" ? "happy_tails" : "snap_purr";
      photosToShow = 3;
    } else if (type === "adoptionGrid") {
      width = 90;
      height = 50;
      x = 5;
      y = 30;
    } else if (type === "catPhoto") {
      width = 35;
      height = 50;
      x = 32;
      y = 25;
    } else if (type === "photo") {
      width = 30;
      height = 40;
    }
    
    const newElement: TemplateElement = {
      id: `${type}-${Date.now()}`,
      type,
      x,
      y,
      width,
      height,
      fontSize: type === "title" ? 64 : type === "subtitle" ? 36 : 24,
      fontWeight: type === "title" ? "bold" : "normal",
      textAlign: "center",
      color: "#ffffff",
      visible: true,
      ...(galleryType && { galleryType }),
      ...(photosToShow && { photosToShow }),
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    setHasChanges(true);
  };

  // Delete element
  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    setHasChanges(true);
  };

  // Save template (or per-screen override for custom slides)
  const handleSave = () => {
    if (selectedScreenType === 'CUSTOM' && selectedCustomSlideId) {
      // Save as per-screen override for this specific custom slide
      saveForScreenMutation.mutate({
        screenId: selectedCustomSlideId,
        elements: JSON.stringify(elements),
        backgroundColor,
        widgetOverrides: JSON.stringify(widgetOverrides),
      });
    } else {
      // Save as shared type-level template
      saveMutation.mutate({
        screenType: selectedScreenType,
        name: templateName || undefined,
        elements: JSON.stringify(elements),
        backgroundColor,
        widgetOverrides: JSON.stringify(widgetOverrides),
      });
    }
  };

  // Update widget override property
  const updateWidgetOverride = (widget: keyof WidgetOverrides, property: string, value: any) => {
    setWidgetOverrides(prev => ({
      ...prev,
      [widget]: {
        ...prev[widget],
        [property]: value,
      },
    }));
    setHasChanges(true);
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm("Reset this template to defaults? All customizations will be lost.")) {
      deleteMutation.mutate({ screenType: selectedScreenType });
    }
  };

  // Render element on canvas
  const renderElement = (element: TemplateElement) => {
    const isSelected = element.id === selectedElementId;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
      opacity: element.visible === false ? 0.3 : element.opacity || 1,
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      zIndex: element.zIndex || 1,
      cursor: isDragging ? "grabbing" : "grab",
      border: isSelected ? "2px solid #3b82f6" : "1px dashed rgba(255,255,255,0.3)",
      borderRadius: element.borderRadius || 4,
      display: "flex",
      alignItems: "center",
      justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
      padding: element.padding || 4,
      backgroundColor: element.backgroundColor || "transparent",
      overflow: "hidden",
    };

    const textStyle: React.CSSProperties = {
      fontSize: `${(element.fontSize || 24) * 0.15}px`, // Scale down for preview
      fontWeight: element.fontWeight || "normal",
      fontFamily: element.fontFamily || "Inter",
      color: element.color || "#ffffff",
      textAlign: element.textAlign || "center",
      width: "100%",
    };

    let content: React.ReactNode = null;
    switch (element.type) {
      case "title":
        content = <span style={textStyle}>Title Text</span>;
        break;
      case "subtitle":
        content = <span style={textStyle}>Subtitle Text</span>;
        break;
      case "body":
        content = <span style={textStyle}>Body text goes here...</span>;
        break;
      case "photo":
        content = (
          <div className="w-full h-full bg-gray-600 flex items-center justify-center rounded">
            <Image className="h-8 w-8 text-gray-400" />
          </div>
        );
        break;
      case "qrCode":
        content = (
          <div className="w-full h-full bg-white flex items-center justify-center rounded">
            <QrCode className="h-8 w-8 text-gray-800" />
          </div>
        );
        break;
      case "logo":
        content = (
          <div className="w-full h-full bg-orange-600/30 flex items-center justify-center rounded">
            <span className="text-orange-400 text-xs">Logo</span>
          </div>
        );
        break;
      case "clock":
        content = (
          <div className="w-full h-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-white" />
          </div>
        );
        break;
      case "weather":
        content = (
          <div className="w-full h-full flex items-center justify-center">
            <Sun className="h-6 w-6 text-yellow-400" />
          </div>
        );
        break;
      case "counter":
        content = <span style={{ ...textStyle, fontSize: `${(element.fontSize || 120) * 0.1}px` }}>47</span>;
        break;
      case "galleryGrid":
        content = (
          <div className="w-full h-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-amber-500/50 rounded bg-amber-500/10">
            <div className="flex flex-col items-center">
              <Image className="h-6 w-6 text-amber-500" />
              <span className="text-xs text-amber-500 mt-1">Gallery Grid</span>
              <span className="text-[10px] text-amber-400/70">{element.galleryType === "happy_tails" ? "Happy Tails" : "Snap & Purr"}</span>
              <span className="text-[10px] text-amber-400/70">{element.photosToShow || 3} photos</span>
            </div>
          </div>
        );
        break;
      case "adoptionGrid":
        content = (
          <div className="w-full h-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-green-500/50 rounded bg-green-500/10">
            <div className="flex flex-col items-center">
              <Image className="h-6 w-6 text-green-500" />
              <span className="text-xs text-green-500 mt-1">Adoption Grid</span>
              <span className="text-[10px] text-green-400/70">Auto-loads cats</span>
            </div>
          </div>
        );
        break;
      case "catPhoto":
        content = (
          <div className="w-full h-full flex items-center justify-center p-2 border-2 border-dashed border-blue-500/50 rounded bg-blue-500/10">
            <div className="flex flex-col items-center">
              <Image className="h-6 w-6 text-blue-500" />
              <span className="text-xs text-blue-500 mt-1">Cat Photo</span>
              <span className="text-[10px] text-blue-400/70">From screen data</span>
            </div>
          </div>
        );
        break;
    }

    return (
      <div
        key={element.id}
        style={baseStyle}
        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        className="group"
      >
        {content}
        {isSelected && (
          <>
            {/* Resize handle */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl"
              onMouseDown={(e) => handleResizeMouseDown(e, element.id)}
            />
            {/* Move indicator */}
            <div className="absolute top-0 left-0 p-1 bg-blue-500 rounded-br">
              <Move className="h-3 w-3 text-white" />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Slide Template Editor</h1>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedScreenType} onValueChange={handleScreenTypeChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select screen type" />
              </SelectTrigger>
              <SelectContent>
                {SCREEN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
                <div className="border-t my-1" />
                <button
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNewSlideDialog(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Custom Slide
                </button>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saveMutation.isPending || saveForScreenMutation.isPending || (selectedScreenType === 'CUSTOM' && !selectedCustomSlideId)}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending || saveForScreenMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Elements list */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add Elements</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {(["title", "subtitle", "body", "photo", "qrCode", "logo", "clock", "weather", "counter"] as const).map(
                  (type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-16 text-xs"
                      onClick={() => addElement(type)}
                    >
                      {ELEMENT_ICONS[type]}
                      <span className="mt-1 capitalize">{type}</span>
                    </Button>
                  )
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Dynamic Content</CardTitle>
                <p className="text-xs text-muted-foreground">Auto-loads from database</p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-16 text-xs border-amber-500/50 hover:bg-amber-500/10"
                  onClick={() => addElement("galleryGrid")}
                >
                  <Image className="h-4 w-4 text-amber-500" />
                  <span className="mt-1">Gallery Grid</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-16 text-xs border-green-500/50 hover:bg-green-500/10"
                  onClick={() => addElement("adoptionGrid")}
                >
                  <Image className="h-4 w-4 text-green-500" />
                  <span className="mt-1">Adoption Grid</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-16 text-xs border-blue-500/50 hover:bg-blue-500/10 col-span-2"
                  onClick={() => addElement("catPhoto")}
                >
                  <Image className="h-4 w-4 text-blue-500" />
                  <span className="mt-1">Cat Photo (from screen)</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Elements ({elements.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {elements.map((el) => (
                  <div
                    key={el.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
                      el.id === selectedElementId ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedElementId(el.id)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {ELEMENT_ICONS[el.type]}
                    <span className="text-sm flex-1 capitalize">{el.type}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, { visible: el.visible === false ? true : false });
                      }}
                    >
                      {el.visible === false ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(el.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {elements.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No elements yet. Add some from above!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Preview Canvas (16:9)
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        id="show-grid"
                        checked={showGrid}
                        onCheckedChange={setShowGrid}
                        className="scale-75"
                      />
                      <Label htmlFor="show-grid" className="text-xs cursor-pointer">Grid</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Switch
                        id="snap-grid"
                        checked={snapToGrid}
                        onCheckedChange={setSnapToGrid}
                        className="scale-75"
                      />
                      <Label htmlFor="snap-grid" className="text-xs cursor-pointer">Snap</Label>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={canvasRef}
                  className="relative w-full aspect-video rounded-lg overflow-hidden"
                  style={{ backgroundColor }}
                  onClick={(e) => {
                    // Only clear selection if we clicked directly on the canvas (not on an element)
                    // and we weren't dragging
                    if (e.target === e.currentTarget && !isDragging && !isResizing) {
                      setSelectedElementId(null);
                    }
                  }}
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  
                  {/* Render elements */}
                  {elements.map(renderElement)}

                  {/* Grid overlay for alignment */}
                  {showGrid && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Grid lines every 5% */}
                      <div className="w-full h-full" style={{
                        backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
                        backgroundSize: "5% 5%"
                      }} />
                      {/* Center vertical line */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-blue-400/50" />
                      {/* Center horizontal line */}
                      <div className="absolute left-0 right-0 top-1/2 h-px bg-blue-400/50" />
                      {/* Thirds vertical lines */}
                      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-green-400/30" />
                      <div className="absolute top-0 bottom-0 left-2/3 w-px bg-green-400/30" />
                      {/* Thirds horizontal lines */}
                      <div className="absolute left-0 right-0 top-1/3 h-px bg-green-400/30" />
                      <div className="absolute left-0 right-0 top-2/3 h-px bg-green-400/30" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Click and drag elements to reposition. Drag corners to resize.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - Properties */}
          <div className="space-y-4">
            {/* Custom Slide Picker - shows list of individual custom slides */}
            {selectedScreenType === "CUSTOM" && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Custom Slides</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowNewSlideDialog(true)}
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {!customSlides || customSlides.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No custom slides yet. Create one to get started.
                    </p>
                  ) : (
                    customSlides.map((slide: any) => (
                      <button
                        key={slide.id}
                        onClick={() => handleSelectCustomSlide(slide)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCustomSlideId === slide.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <div className="font-medium truncate">{slide.title}</div>
                        <div className={`text-xs mt-0.5 ${
                          selectedCustomSlideId === slide.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {slide.templateOverride ? 'Customized' : 'Default layout'}
                          {slide.isActive ? '' : ' · Inactive'}
                        </div>
                      </button>
                    ))
                  )}
                  {selectedScreenType === 'CUSTOM' && !selectedCustomSlideId && customSlides && customSlides.length > 0 && (
                    <p className="text-xs text-amber-500 text-center pt-2">
                      Select a slide above to edit it
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Color Presets</Label>
                  <div className="grid grid-cols-6 gap-1 mt-1">
                    {[
                      { color: "#1f2937", name: "Charcoal" },
                      { color: "#292524", name: "Dark Brown" },
                      { color: "#a8d5ba", name: "Mint Green" },
                      { color: "#f97316", name: "Warm Orange" },
                      { color: "#fef3c7", name: "Cream" },
                      { color: "#d97706", name: "Amber" },
                      { color: "#78716c", name: "Stone" },
                      { color: "#1a1a2e", name: "Deep Navy" },
                      { color: "#065f46", name: "Forest" },
                      { color: "#7c3aed", name: "Purple" },
                      { color: "#dc2626", name: "Red" },
                      { color: "#0ea5e9", name: "Sky Blue" },
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => {
                          setBackgroundColor(preset.color);
                          setHasChanges(true);
                        }}
                        className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                          backgroundColor === preset.color ? "border-white ring-2 ring-offset-1 ring-offset-background ring-primary" : "border-transparent"
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Custom Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-12 h-8 p-0 border-0"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        setHasChanges(true);
                      }}
                      className="flex-1 h-8 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedElement && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm capitalize">{selectedElement.type} Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="position">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="position" className="text-xs">Position</TabsTrigger>
                      <TabsTrigger value="size" className="text-xs">Size</TabsTrigger>
                      <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
                    </TabsList>

                    <TabsContent value="position" className="space-y-3 mt-3">
                      <div>
                        <Label className="text-xs">X Position (%)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[selectedElement.x]}
                            onValueChange={([v]) => updateElement(selectedElement.id, { x: v })}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={Math.round(selectedElement.x)}
                            onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                            className="w-16 h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Y Position (%)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[selectedElement.y]}
                            onValueChange={([v]) => updateElement(selectedElement.id, { y: v })}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={Math.round(selectedElement.y)}
                            onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                            className="w-16 h-8 text-xs"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="size" className="space-y-3 mt-3">
                      <div>
                        <Label className="text-xs">Width (%)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[selectedElement.width]}
                            onValueChange={([v]) => updateElement(selectedElement.id, { width: v })}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={Math.round(selectedElement.width)}
                            onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                            className="w-16 h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Height (%)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[selectedElement.height]}
                            onValueChange={([v]) => updateElement(selectedElement.id, { height: v })}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={Math.round(selectedElement.height)}
                            onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                            className="w-16 h-8 text-xs"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="style" className="space-y-3 mt-3">
                      {["title", "subtitle", "body", "counter"].includes(selectedElement.type) && (
                        <>
                          <div>
                            <Label className="text-xs">Font Size (px)</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Slider
                                value={[selectedElement.fontSize || 24]}
                                onValueChange={([v]) => updateElement(selectedElement.id, { fontSize: v })}
                                min={12}
                                max={200}
                                step={1}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                value={selectedElement.fontSize || 24}
                                onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                                className="w-16 h-8 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Font Weight</Label>
                            <Select
                              value={selectedElement.fontWeight || "normal"}
                              onValueChange={(v) => updateElement(selectedElement.id, { fontWeight: v })}
                            >
                              <SelectTrigger className="h-8 text-xs mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="semibold">Semibold</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                                <SelectItem value="black">Black</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Text Align</Label>
                            <Select
                              value={selectedElement.textAlign || "center"}
                              onValueChange={(v) => updateElement(selectedElement.id, { textAlign: v as any })}
                            >
                              <SelectTrigger className="h-8 text-xs mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      <div>
                        <Label className="text-xs">Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={selectedElement.color || "#ffffff"}
                            onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                            className="w-12 h-8 p-0 border-0"
                          />
                          <Input
                            value={selectedElement.color || "#ffffff"}
                            onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                            className="flex-1 h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Border Radius</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[selectedElement.borderRadius || 0]}
                            onValueChange={([v]) => updateElement(selectedElement.id, { borderRadius: v })}
                            max={50}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={selectedElement.borderRadius || 0}
                            onChange={(e) => updateElement(selectedElement.id, { borderRadius: Number(e.target.value) })}
                            className="w-16 h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Opacity</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[(selectedElement.opacity || 1) * 100]}
                            onValueChange={([v]) => updateElement(selectedElement.id, { opacity: v / 100 })}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={Math.round((selectedElement.opacity || 1) * 100)}
                            onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) / 100 })}
                            className="w-16 h-8 text-xs"
                          />
                        </div>
                      </div>
                      
                      {/* Gallery Grid specific controls */}
                      {selectedElement.type === "galleryGrid" && (
                        <>
                          <div className="pt-2 border-t">
                            <Label className="text-xs font-medium">Gallery Settings</Label>
                          </div>
                          <div>
                            <Label className="text-xs">Gallery Type</Label>
                            <Select
                              value={selectedElement.galleryType || "snap_purr"}
                              onValueChange={(v) => updateElement(selectedElement.id, { galleryType: v as "snap_purr" | "happy_tails" })}
                            >
                              <SelectTrigger className="h-8 text-xs mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="snap_purr">Snap & Purr</SelectItem>
                                <SelectItem value="happy_tails">Happy Tails</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Photos to Show</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Slider
                                value={[selectedElement.photosToShow || 3]}
                                onValueChange={([v]) => updateElement(selectedElement.id, { photosToShow: v })}
                                min={1}
                                max={6}
                                step={1}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                value={selectedElement.photosToShow || 3}
                                onChange={(e) => updateElement(selectedElement.id, { photosToShow: Number(e.target.value) })}
                                className="w-16 h-8 text-xs"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {!selectedElement && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an element to edit its properties</p>
                </CardContent>
              </Card>
            )}

            {/* Widget Overrides */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Overlay Widgets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo Widget */}
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <Image className="h-3 w-3" /> Logo
                    </Label>
                    <Switch
                      checked={widgetOverrides.logo?.visible !== false}
                      onCheckedChange={(v) => updateWidgetOverride('logo', 'visible', v)}
                    />
                  </div>
                  {widgetOverrides.logo?.visible !== false && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.logo?.x || 2}
                          onChange={(e) => updateWidgetOverride('logo', 'x', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.logo?.y || 2}
                          onChange={(e) => updateWidgetOverride('logo', 'y', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Size (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.logo?.width || 8}
                          onChange={(e) => {
                            const size = Number(e.target.value);
                            updateWidgetOverride('logo', 'width', size);
                            updateWidgetOverride('logo', 'height', size);
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Opacity</Label>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.1}
                          value={widgetOverrides.logo?.opacity || 1}
                          onChange={(e) => updateWidgetOverride('logo', 'opacity', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Weather Widget */}
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <Sun className="h-3 w-3" /> Weather
                    </Label>
                    <Switch
                      checked={widgetOverrides.weather?.visible !== false}
                      onCheckedChange={(v) => updateWidgetOverride('weather', 'visible', v)}
                    />
                  </div>
                  {widgetOverrides.weather?.visible !== false && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.weather?.x || 85}
                          onChange={(e) => updateWidgetOverride('weather', 'x', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.weather?.y || 2}
                          onChange={(e) => updateWidgetOverride('weather', 'y', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Font Size</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.weather?.fontSize || 18}
                          onChange={(e) => updateWidgetOverride('weather', 'fontSize', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Color</Label>
                        <Input
                          type="color"
                          value={widgetOverrides.weather?.color || "#ffffff"}
                          onChange={(e) => updateWidgetOverride('weather', 'color', e.target.value)}
                          className="h-7 w-full p-0 border-0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Clock Widget */}
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Clock
                    </Label>
                    <Switch
                      checked={widgetOverrides.clock?.visible !== false}
                      onCheckedChange={(v) => updateWidgetOverride('clock', 'visible', v)}
                    />
                  </div>
                  {widgetOverrides.clock?.visible !== false && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.clock?.x || 92}
                          onChange={(e) => updateWidgetOverride('clock', 'x', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.clock?.y || 2}
                          onChange={(e) => updateWidgetOverride('clock', 'y', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Font Size</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.clock?.fontSize || 24}
                          onChange={(e) => updateWidgetOverride('clock', 'fontSize', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Show Date</Label>
                        <Switch
                          checked={widgetOverrides.clock?.showDate !== false}
                          onCheckedChange={(v) => updateWidgetOverride('clock', 'showDate', v)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Waiver QR Widget */}
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <QrCode className="h-3 w-3" /> Waiver QR
                    </Label>
                    <Switch
                      checked={widgetOverrides.waiverQr?.visible !== false}
                      onCheckedChange={(v) => updateWidgetOverride('waiverQr', 'visible', v)}
                    />
                  </div>
                  {widgetOverrides.waiverQr?.visible !== false && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.waiverQr?.x || 2}
                          onChange={(e) => updateWidgetOverride('waiverQr', 'x', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y (%)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.waiverQr?.y || 2}
                          onChange={(e) => updateWidgetOverride('waiverQr', 'y', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Size (px)</Label>
                        <Input
                          type="number"
                          value={widgetOverrides.waiverQr?.size || 80}
                          onChange={(e) => updateWidgetOverride('waiverQr', 'size', Number(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Label</Label>
                        <Input
                          type="text"
                          value={widgetOverrides.waiverQr?.label || "Sign Waiver"}
                          onChange={(e) => updateWidgetOverride('waiverQr', 'label', e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* New Custom Slide Dialog */}
      <Dialog open={showNewSlideDialog} onOpenChange={setShowNewSlideDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Custom Slide</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="slideTitle">Slide Title</Label>
              <Input
                id="slideTitle"
                placeholder="Enter a title for your custom slide"
                value={newSlideTitle}
                onChange={(e) => setNewSlideTitle(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will create a new custom slide that you can design from scratch.
              After creating, add elements like text, photos, and QR codes to build your slide.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSlideDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!newSlideTitle.trim()) {
                  toast.error("Please enter a title for your slide");
                  return;
                }
                setIsCreatingSlide(true);
                try {
                  // Create a new screen with type CUSTOM
                  const result = await utils.client.screens.create.mutate({
                    type: "CUSTOM",
                    title: newSlideTitle.trim(),
                    priority: 5,
                    durationSeconds: 15,
                    isActive: true,
                  });
                  toast.success(`Custom slide "${newSlideTitle}" created!`);
                  setNewSlideTitle("");
                  setShowNewSlideDialog(false);
                  // Switch to CUSTOM type and select the new slide
                  setSelectedScreenType("CUSTOM");
                  // Refetch custom slides list, then auto-select the new one
                  const refreshed = await refetchCustomSlides();
                  if (refreshed.data && result) {
                    const newSlide = refreshed.data.find((s: any) => s.id === (result as any).id);
                    if (newSlide) {
                      handleSelectCustomSlide(newSlide);
                    } else {
                      // Fallback: select by matching title
                      setSelectedCustomSlideId((result as any).id);
                      setTemplateName(newSlideTitle.trim());
                      setElements([]);
                      setBackgroundColor('#1a1a2e');
                    }
                  }
                } catch (error) {
                  toast.error("Failed to create custom slide");
                } finally {
                  setIsCreatingSlide(false);
                }
              }}
              disabled={isCreatingSlide || !newSlideTitle.trim()}
            >
              {isCreatingSlide ? "Creating..." : "Create Slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
