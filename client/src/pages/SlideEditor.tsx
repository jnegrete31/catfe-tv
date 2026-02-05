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
import { ArrowLeft, Save, RotateCcw, Move, Maximize2, Type, Image, QrCode, Clock, Sun, Hash, Eye, EyeOff, Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";

// Template element type
interface TemplateElement {
  id: string;
  type: "title" | "subtitle" | "body" | "photo" | "qrCode" | "logo" | "clock" | "weather" | "counter";
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
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch template for selected screen type
  const { data: template, refetch: refetchTemplate } = trpc.templates.getByScreenType.useQuery(
    { screenType: selectedScreenType },
    { enabled: !!selectedScreenType }
  );

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

  // Load template when it changes
  useEffect(() => {
    if (template) {
      try {
        const parsedElements = JSON.parse(template.elements || "[]");
        setElements(parsedElements);
        setBackgroundColor(template.backgroundColor || "#1a1a2e");
      } catch (e) {
        console.error("Failed to parse template elements:", e);
        setElements([]);
      }
    }
  }, [template]);

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

  // Handle mouse up (stop drag)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

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
    const newElement: TemplateElement = {
      id: `${type}-${Date.now()}`,
      type,
      x: 10,
      y: 10,
      width: 30,
      height: 15,
      fontSize: type === "title" ? 64 : type === "subtitle" ? 36 : 24,
      fontWeight: type === "title" ? "bold" : "normal",
      textAlign: "center",
      color: "#ffffff",
      visible: true,
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

  // Save template
  const handleSave = () => {
    saveMutation.mutate({
      screenType: selectedScreenType,
      elements: JSON.stringify(elements),
      backgroundColor,
    });
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
            <Select value={selectedScreenType} onValueChange={setSelectedScreenType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select screen type" />
              </SelectTrigger>
              <SelectContent>
                {SCREEN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save"}
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
                <CardTitle className="text-sm flex items-center gap-2">
                  <Maximize2 className="h-4 w-4" />
                  Preview Canvas (16:9)
                </CardTitle>
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
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="w-full h-full" style={{
                      backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                      backgroundSize: "10% 10%"
                    }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Click and drag elements to reposition. Drag corners to resize.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - Properties */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Color</Label>
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
          </div>
        </div>
      </div>
    </div>
  );
}
