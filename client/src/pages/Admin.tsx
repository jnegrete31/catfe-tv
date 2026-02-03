import { useState, useEffect } from "react";
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
import PhotoModeration from "@/components/admin/PhotoModeration";
import { SessionHistory } from "@/components/admin/SessionHistory";
import { WixSync } from "@/components/admin/WixSync";
import CaptionManager from "@/components/admin/CaptionManager";
import { PollManager } from "@/components/admin/PollManager";
import { PlaylistManager } from "@/components/admin/PlaylistManager";
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
  BarChart3,
  CalendarDays,
  MessageSquare,
  Vote,
  ListMusic,
} from "lucide-react";
import { IOSInstallPrompt } from "@/components/IOSInstallPrompt";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("screens");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  
  // Fetch data
  const screensQuery = trpc.screens.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
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
  
  return (
    <div className="min-h-screen bg-background">
      {/* iOS Install Prompt */}
      <IOSInstallPrompt />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" />
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Catfé TV
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href="/tv" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                TV View
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-9 mb-4">
            <TabsTrigger value="screens" className="flex items-center gap-1 text-xs sm:text-sm">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Screens</span>
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-1 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Guests</span>
            </TabsTrigger>
            <TabsTrigger value="wix" className="flex items-center gap-1 text-xs sm:text-sm">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Wix</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-1 text-xs sm:text-sm">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Photos</span>
            </TabsTrigger>
            <TabsTrigger value="captions" className="flex items-center gap-1 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Captions</span>
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-1 text-xs sm:text-sm">
              <Vote className="w-4 h-4" />
              <span className="hidden sm:inline">Polls</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-1 text-xs sm:text-sm">
              <ListMusic className="w-4 h-4" />
              <span className="hidden sm:inline">Playlists</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-xs sm:text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Screens Tab */}
          <TabsContent value="screens" className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-2xl font-bold">{screens.length}</p>
                <p className="text-sm text-muted-foreground">Total Screens</p>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-2xl font-bold">{activeScreens.length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
            
            {/* Playlist Preview */}
            {activeScreens.length > 0 && (
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
            ) : (
              <ScreenList screens={screens} onEdit={handleEdit} />
            )}
          </TabsContent>
          
          {/* Guests Tab */}
          <TabsContent value="guests">
            <GuestCheckIn />
          </TabsContent>
          
          {/* Wix Bookings Tab */}
          <TabsContent value="wix">
            <WixSync />
          </TabsContent>
          
          {/* Photos Tab */}
          <TabsContent value="photos">
            <PhotoModeration />
          </TabsContent>
          
          {/* Captions Tab */}
          <TabsContent value="captions">
            <CaptionManager />
          </TabsContent>
          
          {/* Reports Tab */}
          <TabsContent value="reports">
            <SessionHistory />
          </TabsContent>
          
          {/* Polls Tab */}
          <TabsContent value="polls">
            <PollManager />
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists">
            <PlaylistManager />
          </TabsContent>

          {/* Settings Tab */}
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
      
      {/* Floating Action Button */}
      {activeTab === "screens" && (
        <div className="fixed bottom-6 right-6 z-50">
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
