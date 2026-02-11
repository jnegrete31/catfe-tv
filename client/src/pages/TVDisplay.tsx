import { useEffect, useState, useRef, useCallback } from "react";
import { usePlaylist } from "@/hooks/usePlaylist";
import { ScreenRenderer, FallbackScreen } from "@/components/tv/ScreenRenderer";
import { WeatherClockOverlay } from "@/components/tv/WeatherClockOverlay";
import { GuestReminderOverlay } from "@/components/tv/GuestReminderOverlay";
import { PollWidget } from "@/components/tv/PollWidget";
// PollResultsWidget removed - results shown on guests' devices only
import { WaiverWidget } from "@/components/tv/WaiverWidget";
import { LogoWidget } from "@/components/tv/LogoWidget";
import { RecentlyAdoptedBanner } from "@/components/tv/RecentlyAdoptedBanner";
import { Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { Screen } from "@shared/types";
import { SCREEN_TYPE_DURATIONS } from "@shared/types";

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
    showResultsOverlay,
  } = usePlaylist();
  
  const [showControls, setShowControls] = useState(false);
  const [focusedButton, setFocusedButton] = useState<number>(1); // 0=prev, 1=play/pause, 2=next, 3=refresh
  
  const [isPaused, setIsPaused] = useState(false);
  const [adoptionCats, setAdoptionCats] = useState<Screen[]>([]);
  const [allAdoptionCats, setAllAdoptionCats] = useState<Screen[]>([]);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeout = useRef<NodeJS.Timeout | null>(null);
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch ALL adoption cats (always enabled, cached)
  const { data: allAdoptions } = trpc.screens.getRandomAdoptions.useQuery(
    { count: 12 },
    { 
      staleTime: 60000, // Cache for 1 minute
      refetchInterval: 120000, // Refetch every 2 minutes
    }
  );
  
  // Fetch recently adopted cats for celebration banner
  const { data: recentlyAdopted } = trpc.screens.getRecentlyAdopted.useQuery(
    { limit: 5 },
    { 
      staleTime: 60000, // Cache for 1 minute
      refetchInterval: 60000, // Refetch every minute
    }
  );
  
  // Store all adoption cats when fetched
  useEffect(() => {
    if (allAdoptions && allAdoptions.length > 0) {
      setAllAdoptionCats(allAdoptions);
      // Initialize display cats with first 4
      if (adoptionCats.length === 0) {
        setAdoptionCats(allAdoptions.slice(0, 4));
      }
    }
  }, [allAdoptions]);
  
  // Shuffle adoption cats every 6 seconds when showing ADOPTION_SHOWCASE
  useEffect(() => {
    if (currentScreen?.type !== "ADOPTION_SHOWCASE" || allAdoptionCats.length < 4) {
      if (shuffleTimerRef.current) {
        clearInterval(shuffleTimerRef.current);
        shuffleTimerRef.current = null;
      }
      return;
    }
    
    // Shuffle function - pick 4 random cats
    const shuffleCats = () => {
      const shuffled = [...allAdoptionCats].sort(() => Math.random() - 0.5);
      setAdoptionCats(shuffled.slice(0, 4));
    };
    
    // Initial shuffle
    shuffleCats();
    
    // Set up 6-second interval
    shuffleTimerRef.current = setInterval(shuffleCats, 6000);
    
    return () => {
      if (shuffleTimerRef.current) {
        clearInterval(shuffleTimerRef.current);
        shuffleTimerRef.current = null;
      }
    };
  }, [currentScreen?.type, allAdoptionCats]);
  
  // Show controls temporarily
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 5000); // Longer timeout for TV remote users
  }, []);
  
  // Handle mouse/touch movement
  const handleInteraction = () => {
    showControlsTemporarily();
  };
  
  // Keyboard and Apple TV remote navigation
  // Apple TV remote maps: Menu, Play/Pause, Select (click), and swipe gestures to arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show controls on any key press
      showControlsTemporarily();
      
      switch (e.key) {
        // Arrow navigation (Apple TV swipe gestures)
        case "ArrowRight":
          if (showControls) {
            setFocusedButton(prev => Math.min(prev + 1, 3));
          } else {
            nextScreen();
          }
          e.preventDefault();
          break;
        case "ArrowLeft":
          if (showControls) {
            setFocusedButton(prev => Math.max(prev - 1, 0));
          } else {
            prevScreen();
          }
          e.preventDefault();
          break;
        case "ArrowUp":
        case "ArrowDown":
          // Toggle controls visibility
          setShowControls(prev => !prev);
          e.preventDefault();
          break;
          
        // Select/Enter (Apple TV click or select button)
        case "Enter":
        case " ":
          if (showControls) {
            // Execute focused button action
            switch (focusedButton) {
              case 0:
                prevScreen();
                break;
              case 1:
                setIsPaused(prev => !prev);
                break;
              case 2:
                nextScreen();
                break;
              case 3:
                refresh();
                break;
            }
          } else {
            // Toggle play/pause when controls hidden
            setIsPaused(prev => !prev);
          }
          e.preventDefault();
          break;
          
        // Play/Pause button (Apple TV remote)
        case "MediaPlayPause":
        case "p":
        case "P":
          setIsPaused(prev => !prev);
          e.preventDefault();
          break;
          
        // Refresh
        case "r":
        case "R":
          refresh();
          e.preventDefault();
          break;
          
        // Escape/Menu (Apple TV menu button)
        case "Escape":
          if (showControls) {
            setShowControls(false);
          }
          e.preventDefault();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showControls, focusedButton, nextScreen, prevScreen, refresh, showControlsTemporarily]);
  
  // Auto-advance when not paused
  // Use currentIndex as primary dependency to ensure timer restarts when looping back to index 0
  useEffect(() => {
    if (isPaused || !currentScreen) {
      if (autoAdvanceTimeout.current) {
        clearTimeout(autoAdvanceTimeout.current);
      }
      return;
    }
    
    // Use screen-specific duration, then screen type default, then global default
    const typeDefaultDuration = SCREEN_TYPE_DURATIONS[currentScreen.type];
    const duration = (currentScreen.durationSeconds || typeDefaultDuration || settings?.defaultDurationSeconds || 10) * 1000;
    
    // Clear any existing timeout first
    if (autoAdvanceTimeout.current) {
      clearTimeout(autoAdvanceTimeout.current);
    }
    
    // Set new timeout
    autoAdvanceTimeout.current = setTimeout(() => {
      nextScreen();
    }, duration);
    
    return () => {
      if (autoAdvanceTimeout.current) {
        clearTimeout(autoAdvanceTimeout.current);
        autoAdvanceTimeout.current = null;
      }
    };
  }, [isPaused, currentIndex, currentScreen?.id, currentScreen?.durationSeconds, settings?.defaultDurationSeconds, nextScreen]);
  
  // Hide cursor when controls are hidden (for non-TV displays)
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
  
  // Button styles with focus state for Apple TV
  const getButtonClass = (index: number) => {
    const base = "p-4 rounded-full backdrop-blur transition-all duration-200";
    const focused = focusedButton === index && showControls;
    
    if (focused) {
      return `${base} bg-white/40 ring-4 ring-white scale-110`;
    }
    return `${base} bg-white/20 hover:bg-white/30`;
  };
  
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
            className="mt-8 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition focus:ring-4 focus:ring-red-300"
            autoFocus
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
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Main content */}
      <ScreenRenderer 
        screen={currentScreen} 
        settings={settings} 
        adoptionCats={currentScreen.type === "ADOPTION_SHOWCASE" ? adoptionCats : undefined}
      />
      
      {/* Weather and Clock Overlay - always visible */}
      <WeatherClockOverlay />
      
      {/* Guest Session Reminder Overlay */}
      <GuestReminderOverlay />
      
      {/* Poll Widget - DISABLED for now
      <PollWidget />
      */}
      
      {/* Waiver QR Code Widget - top-left corner when configured */}
      <WaiverWidget />
      
      {/* Logo Widget - bottom-left corner */}
      <LogoWidget />
      
      {/* Recently Adopted Banner - DISABLED (wonky behavior on tvOS)
      {recentlyAdopted && recentlyAdopted.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <RecentlyAdoptedBanner adoptedCats={recentlyAdopted} />
        </div>
      )}
      */}
      
      {/* Paused indicator */}
      {isPaused && !showControls && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
          <Pause className="w-4 h-4" />
          <span className="text-sm">Paused</span>
        </div>
      )}
      
      {/* Overlay controls - optimized for Apple TV remote */}
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
              {isPaused && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500/80 rounded text-xs font-medium">
                  PAUSED
                </span>
              )}
            </div>
            <div className="text-sm">
              {currentIndex + 1} / {totalScreens}
            </div>
          </div>
        </div>
        
        {/* Bottom bar - navigation with Apple TV focus states */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-6 pointer-events-auto">
            <button
              onClick={prevScreen}
              className={getButtonClass(0)}
              tabIndex={0}
              aria-label="Previous screen"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className={getButtonClass(1)}
              tabIndex={0}
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? (
                <Play className="w-8 h-8 text-white" />
              ) : (
                <Pause className="w-8 h-8 text-white" />
              )}
            </button>
            
            <button
              onClick={nextScreen}
              className={getButtonClass(2)}
              tabIndex={0}
              aria-label="Next screen"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
            
            <button
              onClick={refresh}
              className={getButtonClass(3)}
              tabIndex={0}
              aria-label="Refresh content"
            >
              <RefreshCw className="w-8 h-8 text-white" />
            </button>
          </div>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {playlist.slice(0, 10).map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition ${
                  idx === currentIndex % 10 ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
            {totalScreens > 10 && (
              <span className="text-white/60 text-sm ml-2">+{totalScreens - 10}</span>
            )}
          </div>
          
          {/* Remote hint */}
          <p className="text-center text-white/50 text-xs mt-4">
            Use arrow keys or swipe to navigate • Press select to activate
          </p>
        </div>
      </div>
      

    </div>
  );
}
