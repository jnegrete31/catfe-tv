import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScreenRenderer } from "@/components/tv/ScreenRenderer";
import type { Screen, Settings } from "@shared/types";
import { Play, ChevronLeft, ChevronRight, X, Maximize2, Monitor, Tablet, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified screen type for form preview - only needs display fields
interface FormPreviewScreen {
  id: number;
  type: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  imagePath?: string | null;
  imageDisplayMode?: string | null;
  qrUrl?: string | null;
  isAdopted?: boolean;
}

interface ScreenPreviewProps {
  screen: Screen;
  settings: Settings | null;
}

// Form preview props - for use in ScreenForm
interface FormScreenPreviewProps {
  screen: FormPreviewScreen;
  onClose: () => void;
}

type ViewportSize = "tv" | "tablet" | "mobile";

const viewportSizes: Record<ViewportSize, { width: number; height: number; label: string }> = {
  tv: { width: 1920, height: 1080, label: "TV (16:9)" },
  tablet: { width: 1024, height: 768, label: "Tablet" },
  mobile: { width: 390, height: 844, label: "Mobile" },
};

// Form preview component - shows preview dialog when editing a screen
export function FormScreenPreview({ screen, onClose }: FormScreenPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>("tv");
  const currentSize = viewportSizes[viewport];
  
  // Calculate scale to fit in dialog
  const maxWidth = 900;
  const maxHeight = 550;
  const scale = Math.min(maxWidth / currentSize.width, maxHeight / currentSize.height);
  
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[960px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Screen Preview
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={viewport === "tv" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewport("tv")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={viewport === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewport("tablet")}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={viewport === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewport("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <p className="text-sm text-muted-foreground text-center mb-4">
            {currentSize.label} ({currentSize.width}×{currentSize.height})
          </p>
          
          {/* Preview Container */}
          <div className="flex justify-center">
            <div 
              className="bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800"
              style={{
                width: currentSize.width * scale,
                height: currentSize.height * scale,
              }}
            >
              {/* Scaled Preview */}
              <div
                style={{
                  width: currentSize.width,
                  height: currentSize.height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <FormScreenContent screen={screen} />
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              This preview shows how your screen will appear on the TV display. 
              The actual appearance may vary slightly based on TV settings.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Render the screen content based on type (simplified for form preview)
function FormScreenContent({ screen }: { screen: FormPreviewScreen }) {
  const { type, title, subtitle, body, imagePath, imageDisplayMode, qrUrl, isAdopted } = screen;
  
  // Common background gradient for screens without images
  const defaultBg = "linear-gradient(135deg, #FDF6E3 0%, #F5E6D3 100%)";
  
  // Render based on screen type
  switch (type) {
    case "ADOPTION":
      return (
        <div className="w-full h-full relative">
          {imagePath ? (
            <img 
              src={imagePath} 
              alt={title}
              className={cn(
                "w-full h-full",
                imageDisplayMode === "contain" ? "object-contain bg-amber-50" : "object-cover"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-amber-50">
              <span className="text-[200px]">🐱</span>
            </div>
          )}
          
          {/* Adopted badge */}
          {isAdopted && (
            <div className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-lg">
              🎉 Adopted!
            </div>
          )}
          
          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-12">
            <h2 className="text-6xl font-bold text-white mb-2">{title}</h2>
            {subtitle && (
              <p className="text-3xl text-white/90">{subtitle}</p>
            )}
          </div>
        </div>
      );
      
    case "EVENT":
    case "TODAY_AT_CATFE":
      return (
        <div className="w-full h-full relative">
          {imagePath ? (
            <img 
              src={imagePath} 
              alt={title}
              className={cn(
                "w-full h-full",
                imageDisplayMode === "contain" ? "object-contain bg-amber-50" : "object-cover"
              )}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ background: defaultBg }}
            >
              <div className="text-center p-12">
                <h2 className="text-7xl font-bold text-amber-900 mb-4">{title}</h2>
                {subtitle && (
                  <p className="text-4xl text-amber-700">{subtitle}</p>
                )}
                {body && (
                  <p className="text-2xl text-amber-600 mt-6 max-w-3xl">{body}</p>
                )}
              </div>
            </div>
          )}
          
          {imagePath && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-12">
              <h2 className="text-6xl font-bold text-white mb-2">{title}</h2>
              {subtitle && (
                <p className="text-3xl text-white/90">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      );
      
    case "SNAP_AND_PURR":
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)" }}
        >
          <div className="text-center">
            <span className="text-[150px] block mb-4">📸</span>
            <h2 className="text-7xl font-bold text-amber-900 mb-4">{title || "Snap & Purr!"}</h2>
            <p className="text-3xl text-amber-700">{subtitle || "Share your cat lounge moments"}</p>
            {qrUrl && (
              <div className="mt-8 bg-white p-6 rounded-2xl inline-block shadow-lg">
                <p className="text-xl text-gray-600 mb-2">Scan to share</p>
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-400">QR Code</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
      
    case "MEMBERSHIP":
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)" }}
        >
          <div className="text-center">
            <span className="text-[120px] block mb-4">⭐</span>
            <h2 className="text-7xl font-bold text-blue-900 mb-4">{title || "Become a Member"}</h2>
            <p className="text-3xl text-blue-700">{subtitle}</p>
            {body && (
              <p className="text-2xl text-blue-600 mt-6 max-w-3xl">{body}</p>
            )}
          </div>
        </div>
      );
      
    case "REMINDER":
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)" }}
        >
          <div className="text-center">
            <span className="text-[120px] block mb-4">💝</span>
            <h2 className="text-6xl font-bold text-red-900 mb-4">{title || "Gentle Reminder"}</h2>
            <p className="text-3xl text-red-700">{subtitle}</p>
            {body && (
              <p className="text-2xl text-red-600 mt-6 max-w-3xl">{body}</p>
            )}
          </div>
        </div>
      );
      
    case "THANK_YOU":
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)" }}
        >
          <div className="text-center">
            <span className="text-[150px] block mb-4">💚</span>
            <h2 className="text-7xl font-bold text-green-900 mb-4">{title || "Thank You!"}</h2>
            <p className="text-3xl text-green-700">{subtitle || "For visiting Catfé"}</p>
          </div>
        </div>
      );
      
    case "ADOPTION_SHOWCASE":
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center p-12"
          style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)" }}
        >
          <div className="bg-orange-500 text-white px-8 py-3 rounded-full text-2xl font-bold mb-8">
            Meet Our Adoptable Cats
          </div>
          <h2 className="text-6xl font-bold text-orange-900 mb-8">{title || "Find Your Purrfect Match"}</h2>
          
          {/* 2x2 Grid placeholder */}
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-64 h-64 bg-orange-200/50 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🐱</span>
              </div>
            ))}
          </div>
        </div>
      );
      
    case "ADOPTION_COUNTER":
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)" }}
        >
          <div className="text-center">
            <div className="bg-green-500 text-white px-8 py-3 rounded-full text-2xl font-bold mb-8 inline-block">
              🏠 Forever Homes Found!
            </div>
            <div className="text-[200px] font-black text-green-700 leading-none">42</div>
            <h2 className="text-5xl font-bold text-green-800 mt-4">{title || "Cats Adopted"}</h2>
            {subtitle && (
              <p className="text-2xl text-green-600 mt-4">{subtitle}</p>
            )}
          </div>
        </div>
      );
      
    default:
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center"
          style={{ background: defaultBg }}
        >
          {imagePath ? (
            <img 
              src={imagePath} 
              alt={title}
              className={cn(
                "w-full h-full",
                imageDisplayMode === "contain" ? "object-contain" : "object-cover"
              )}
            />
          ) : (
            <div className="text-center p-12">
              <h2 className="text-7xl font-bold text-amber-900 mb-4">{title}</h2>
              {subtitle && (
                <p className="text-4xl text-amber-700">{subtitle}</p>
              )}
              {body && (
                <p className="text-2xl text-amber-600 mt-6 max-w-3xl">{body}</p>
              )}
            </div>
          )}
        </div>
      );
  }
}

export function ScreenPreview({ screen, settings }: ScreenPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            Preview
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Fullscreen
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
            <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%]">
              <ScreenRenderer screen={screen} settings={settings} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Fullscreen Preview Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative aspect-video">
            <ScreenRenderer screen={screen} settings={settings} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface PlaylistPreviewProps {
  screens: Screen[];
  settings: Settings | null;
}

export function PlaylistPreview({ screens, settings }: PlaylistPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentScreen = screens[currentIndex];
  
  const nextScreen = () => {
    setCurrentIndex((prev) => (prev + 1) % screens.length);
  };
  
  const prevScreen = () => {
    setCurrentIndex((prev) => (prev === 0 ? screens.length - 1 : prev - 1));
  };
  
  if (screens.length === 0) {
    return null;
  }
  
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Play className="w-4 h-4 mr-2" />
        Test Playlist Preview
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative aspect-video bg-black">
            {currentScreen && (
              <ScreenRenderer screen={currentScreen} settings={settings} />
            )}
            
            {/* Controls */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={prevScreen}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <span className="text-white text-sm">
                  {currentIndex + 1} / {screens.length}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={nextScreen}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
              
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {screens.slice(0, 10).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
                {screens.length > 10 && (
                  <span className="text-white/60 text-xs ml-2">
                    +{screens.length - 10}
                  </span>
                )}
              </div>
            </div>
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
