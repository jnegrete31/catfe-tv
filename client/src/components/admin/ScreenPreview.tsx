import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScreenRenderer } from "@/components/tv/ScreenRenderer";
import type { Screen, Settings } from "@shared/types";
import { Play, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface ScreenPreviewProps {
  screen: Screen;
  settings: Settings | null;
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
