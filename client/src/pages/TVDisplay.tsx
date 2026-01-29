import { useEffect, useState } from "react";
import { usePlaylist } from "@/hooks/usePlaylist";
import { ScreenRenderer, FallbackScreen } from "@/components/tv/ScreenRenderer";
import { Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function TVDisplay() {
  const {
    currentScreen,
    playlist,
    currentIndex,
    totalScreens,
    isLoading,
    error,
    isOffline,
    settings,
    nextScreen,
    prevScreen,
    refresh,
  } = usePlaylist();
  
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Show controls on mouse movement
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          nextScreen();
          break;
        case "ArrowLeft":
          prevScreen();
          break;
        case "r":
        case "R":
          refresh();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextScreen, prevScreen, refresh]);
  
  // Hide cursor when controls are hidden
  useEffect(() => {
    document.body.style.cursor = showControls ? "default" : "none";
    return () => {
      document.body.style.cursor = "default";
    };
  }, [showControls]);
  
  // Preload next image
  useEffect(() => {
    if (playlist.length > 1) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextScreenItem = playlist[nextIndex];
      if (nextScreenItem?.imagePath) {
        const img = new Image();
        img.src = nextScreenItem.imagePath;
      }
    }
  }, [currentIndex, playlist]);
  
  if (isLoading) {
    return (
      <div className="tv-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="tv-text-medium text-amber-700">Loading content...</p>
        </div>
      </div>
    );
  }
  
  if (error && !currentScreen) {
    return (
      <div className="tv-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="tv-text-large text-red-700 mb-4">Unable to load content</p>
          <p className="tv-text-body text-red-600">{error}</p>
          <button
            onClick={refresh}
            className="mt-8 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentScreen) {
    return <FallbackScreen settings={settings} />;
  }
  
  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      {/* Main content */}
      <ScreenRenderer screen={currentScreen} settings={settings} />
      
      {/* Overlay controls */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top bar - status */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              {isOffline ? (
                <WifiOff className="w-5 h-5 text-yellow-400" />
              ) : (
                <Wifi className="w-5 h-5 text-green-400" />
              )}
              <span className="text-sm">
                {isOffline ? "Offline Mode" : "Connected"}
              </span>
            </div>
            <div className="text-sm">
              {currentIndex + 1} / {totalScreens}
            </div>
          </div>
        </div>
        
        {/* Bottom bar - navigation */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-4 pointer-events-auto">
            <button
              onClick={prevScreen}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur transition"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={refresh}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur transition"
            >
              <RefreshCw className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={nextScreen}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur transition"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {playlist.slice(0, 10).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentIndex % 10 ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
            {totalScreens > 10 && (
              <span className="text-white/60 text-xs ml-2">+{totalScreens - 10}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
