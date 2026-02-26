import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScreenForm } from "@/components/admin/ScreenForm";
import { ScreenList } from "@/components/admin/ScreenList";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PlaylistPreview } from "@/components/admin/ScreenPreview";
import { GuestCheckIn } from "@/components/admin/GuestCheckIn";
import PhotosTab from "@/components/admin/PhotosTab";

import { PlaylistManager } from "@/components/admin/PlaylistManager";
import { CatManager } from "@/components/admin/CatManager";
import { VolunteerManager } from "@/components/admin/VolunteerManager";
import { SocialFeedManager } from "@/components/admin/SocialFeedManager";
import { trpc } from "@/lib/trpc";
import type { Screen } from "@shared/types";
import { 
  Plus, 
  Settings, 
  Tv, 
  LogOut, 
  Loader2,
  LayoutGrid,
  ExternalLink,
  Users,
  Image,
  Heart,
  HandHeart,
  Instagram,
  ListMusic,
  Palette,
  EyeOff,
  Filter,
  Menu,
  X,
  Cat,
  GripVertical,
  RotateCcw,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IOSInstallPrompt } from "@/components/IOSInstallPrompt";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TAB_ORDER_KEY = "catfe-admin-tab-order";

const DEFAULT_TABS = [
  { value: "cats", icon: Cat, label: "Cats" },
  { value: "screens", icon: LayoutGrid, label: "Screens" },
  { value: "guests", icon: Users, label: "Guests" },
  { value: "photos", icon: Image, label: "Photos" },
  { value: "playlists", icon: ListMusic, label: "Playlists" },
  { value: "volunteers", icon: HandHeart, label: "Volunteers" },
  { value: "social", icon: Instagram, label: "Social" },
  { value: "settings", icon: Settings, label: "Settings" },
];

function getStoredTabOrder(): string[] | null {
  try {
    const stored = localStorage.getItem(TAB_ORDER_KEY);
    if (!stored) return null;
    const order = JSON.parse(stored) as string[];
    // Validate that all default tab values are present
    const defaultValues = DEFAULT_TABS.map(t => t.value);
    if (order.length !== defaultValues.length) return null;
    if (!defaultValues.every(v => order.includes(v))) return null;
    return order;
  } catch {
    return null;
  }
}

function applyTabOrder(order: string[]) {
  return order.map(value => DEFAULT_TABS.find(t => t.value === value)!).filter(Boolean);
}

// Sortable tab trigger component
function SortableTab({ tab, isActive, isReordering }: {
  tab: typeof DEFAULT_TABS[number];
  isActive: boolean;
  isReordering: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.value, disabled: !isReordering });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <TabsTrigger
      ref={setNodeRef}
      style={style}
      value={tab.value}
      className={`flex-1 flex items-center justify-center gap-1 px-1 text-[10px] sm:text-sm whitespace-nowrap min-h-[36px] ${
        isReordering ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "shadow-lg ring-2 ring-primary/30 rounded-md bg-background" : ""}`}
      {...(isReordering ? { ...attributes, ...listeners } : {})}
    >
      {isReordering && <GripVertical className="w-3 h-3 text-muted-foreground shrink-0 hidden sm:block" />}
      <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
      <span className="hidden sm:inline">{tab.label}</span>
    </TabsTrigger>
  );
}

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("cats");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [screenFilter, setScreenFilter] = useState<"active" | "all" | "inactive" | "adopted">("active");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [tabOrder, setTabOrder] = useState<string[]>(() => {
    return getStoredTabOrder() || DEFAULT_TABS.map(t => t.value);
  });

  const tabs = applyTabOrder(tabOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTabOrder(prev => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      const newOrder = arrayMove(prev, oldIndex, newIndex);
      localStorage.setItem(TAB_ORDER_KEY, JSON.stringify(newOrder));
      return newOrder;
    });
  }, []);

  const handleResetOrder = useCallback(() => {
    const defaultOrder = DEFAULT_TABS.map(t => t.value);
    setTabOrder(defaultOrder);
    localStorage.removeItem(TAB_ORDER_KEY);
    setIsReordering(false);
  }, []);
  
  // Fetch data
  const screensQuery = trpc.screens.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnMount: true,
    staleTime: 0,
  });
  
  const settingsQuery = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  // Handle edit
  const handleEdit = (screen: Screen) => {
    setEditingScreen(screen);
    setIsFormOpen(true);
  };
  
  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingScreen(null);
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    handleFormClose();
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tv className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Catfé TV Admin
          </h1>
          <p className="text-muted-foreground mb-6">
            Sign in to manage your digital signage content
          </p>
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }
  
  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need admin privileges to access this page.
          </p>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }
  
  const screens = screensQuery.data || [];
  const activeScreens = screens.filter(s => s.isActive);
  const inactiveScreens = screens.filter(s => !s.isActive);
  const adoptedScreens = screens.filter(s => (s as any).isAdopted === true);
  
  const filteredScreens = screenFilter === "active" ? activeScreens
    : screenFilter === "inactive" ? inactiveScreens
    : screenFilter === "adopted" ? adoptedScreens
    : screens;

  // tabs is now computed from tabOrder state above
  
  return (
    <div className="min-h-screen bg-background">
      {/* iOS Install Prompt */}
      <IOSInstallPrompt />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container flex items-center justify-between h-14 gap-2">
          {/* Logo - always visible */}
          <div className="flex items-center gap-2 shrink-0">
            <Tv className="w-5 h-5 text-primary" />
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Catfé TV
            </span>
          </div>
          
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <a href="/tv" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                TV View
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/admin/slide-editor">
                <Palette className="w-4 h-4 mr-1" />
                Editor
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-background/95 backdrop-blur">
            <div className="container py-2 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <a href="/tv" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  TV View
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <a href="/admin/slide-editor">
                  <Palette className="w-4 h-4 mr-2" />
                  Slide Editor
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-10 text-destructive hover:text-destructive"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="container py-4 pb-24 sm:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab bar - draggable reorder */}
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1 justify-end">
              {isReordering ? (
                <>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-muted-foreground"
                          onClick={handleResetOrder}
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reset to default order</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsReordering(false)}
                  >
                    Done
                  </Button>
                </>
              ) : (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsReordering(true)}
                      >
                        <GripVertical className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reorder tabs</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={tabOrder} strategy={horizontalListSortingStrategy}>
                <TabsList className={`flex w-full h-10 justify-center ${isReordering ? "ring-2 ring-primary/20 ring-offset-2" : ""}`}>
                  {tabs.map((tab) => (
                    <SortableTab
                      key={tab.value}
                      tab={tab}
                      isActive={activeTab === tab.value}
                      isReordering={isReordering}
                    />
                  ))}
                </TabsList>
              </SortableContext>
            </DndContext>
          </div>
          
          {/* Screens Tab */}
          <TabsContent value="screens" className="space-y-4">
            {/* Stats - 2 cols on mobile, 4 cols on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setScreenFilter("active")}
                className={`rounded-lg p-3 border text-left transition-colors ${
                  screenFilter === "active" ? "bg-primary/10 border-primary ring-1 ring-primary" : "bg-card hover:bg-accent/50"
                }`}
              >
                <p className="text-xl font-bold">{activeScreens.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </button>
              <button
                type="button"
                onClick={() => setScreenFilter("all")}
                className={`rounded-lg p-3 border text-left transition-colors ${
                  screenFilter === "all" ? "bg-primary/10 border-primary ring-1 ring-primary" : "bg-card hover:bg-accent/50"
                }`}
              >
                <p className="text-xl font-bold">{screens.length}</p>
                <p className="text-xs text-muted-foreground">All</p>
              </button>
              <button
                type="button"
                onClick={() => setScreenFilter("inactive")}
                className={`rounded-lg p-3 border text-left transition-colors ${
                  screenFilter === "inactive" ? "bg-primary/10 border-primary ring-1 ring-primary" : "bg-card hover:bg-accent/50"
                }`}
              >
                <p className="text-xl font-bold">{inactiveScreens.length}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </button>
              <button
                type="button"
                onClick={() => setScreenFilter("adopted")}
                className={`rounded-lg p-3 border text-left transition-colors ${
                  screenFilter === "adopted" ? "bg-pink-50 border-pink-400 ring-1 ring-pink-400" : "bg-card hover:bg-accent/50"
                }`}
              >
                <p className="text-xl font-bold flex items-center gap-1">
                  {adoptedScreens.length}
                  <Heart className="w-4 h-4 text-pink-500" />
                </p>
                <p className="text-xs text-muted-foreground">Adopted</p>
              </button>
            </div>
            
            {/* Playlist Preview */}
            {activeScreens.length > 0 && screenFilter === "active" && (
              <PlaylistPreview 
                screens={activeScreens} 
                settings={settingsQuery.data || null} 
              />
            )}
            
            {/* Screen List */}
            {screensQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredScreens.length === 0 ? (
              <div className="text-center py-12">
                {screenFilter === "inactive" ? (
                  <>
                    <EyeOff className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No inactive screens</p>
                  </>
                ) : screenFilter === "adopted" ? (
                  <>
                    <Heart className="w-10 h-10 mx-auto text-pink-300 mb-3" />
                    <p className="text-muted-foreground">No adopted cats yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Mark adoption slides as adopted when a cat finds their forever home</p>
                  </>
                ) : (
                  <>
                    <Filter className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No screens found</p>
                  </>
                )}
              </div>
            ) : (
              <ScreenList screens={filteredScreens} onEdit={handleEdit} />
            )}
          </TabsContent>
          
          {/* Guests Tab */}
          <TabsContent value="guests">
            <GuestCheckIn />
          </TabsContent>
          
          {/* Photos Tab */}
          <TabsContent value="photos">
            <PhotosTab />
          </TabsContent>
          

          {/* Playlists Tab */}
          <TabsContent value="playlists">
            <PlaylistManager />
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <VolunteerManager />
          </TabsContent>

          {/* Social Feed Tab */}
          <TabsContent value="social">
            <SocialFeedManager />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="cats">
            <CatManager />
          </TabsContent>

          <TabsContent value="settings">
            {settingsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <SettingsForm settings={settingsQuery.data || null} />
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background/95 backdrop-blur border-t safe-area-bottom">
        <div className="grid grid-cols-3 h-16">
          {[
            { value: "cats", icon: Cat, label: "Cats" },
            { value: "screens", icon: LayoutGrid, label: "Screens" },
            { value: "guests", icon: Users, label: "Guests" },
          ].map((item) => {
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setActiveTab(item.value)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className={`text-[10px] leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button */}
      {activeTab === "screens" && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => {
              setEditingScreen(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}
      
      {/* Screen Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>
              {editingScreen ? "Edit Screen" : "New Screen"}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(90vh-60px)]">
            <div className="p-4">
              <ScreenForm
                screen={editingScreen}
                onSuccess={handleFormSuccess}
                onCancel={handleFormClose}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
