import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import type { Screen, Settings } from "@shared/types";

interface PlaylistState {
  screens: Screen[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
}

// Check if a screen is currently eligible based on scheduling
function isScreenEligible(screen: Screen): boolean {
  const now = new Date();
  
  // Check date range
  if (screen.startAt && new Date(screen.startAt) > now) return false;
  if (screen.endAt && new Date(screen.endAt) < now) return false;
  
  // Check days of week
  if (screen.daysOfWeek && screen.daysOfWeek.length > 0) {
    const currentDay = now.getDay();
    if (!screen.daysOfWeek.includes(currentDay)) return false;
  }
  
  // Check time window
  if (screen.timeStart && screen.timeEnd) {
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    if (currentTime < screen.timeStart || currentTime > screen.timeEnd) return false;
  }
  
  return true;
}

// Check if it's poll time (x:00-x:25 or x:30-x:55)
function isPollTime(): boolean {
  const minutes = new Date().getMinutes();
  // Poll shows from x:00 to x:25 and x:30 to x:55
  return (minutes >= 0 && minutes < 25) || (minutes >= 30 && minutes < 55);
}

// Check if it's results time (x:25-x:30 or x:55-x:00)
function isResultsTime(): boolean {
  const minutes = new Date().getMinutes();
  return (minutes >= 25 && minutes < 30) || (minutes >= 55);
}

// Build weighted playlist with SNAP_AND_PURR frequency and optional poll injection
function buildPlaylist(screens: Screen[], snapFrequency: number, pollFrequency: number = 3): Screen[] {
  const eligible = screens.filter(isScreenEligible);
  if (eligible.length === 0) return [];
  
  const snapScreens = eligible.filter(s => s.type === "SNAP_AND_PURR");
  const otherScreens = eligible.filter(s => s.type !== "SNAP_AND_PURR" && s.type !== "POLL");
  
  // Weight screens by priority (higher priority = more appearances)
  const weightedOthers: Screen[] = [];
  for (const screen of otherScreens) {
    const weight = Math.max(1, screen.priority);
    for (let i = 0; i < weight; i++) {
      weightedOthers.push(screen);
    }
  }
  
  // Shuffle weighted list
  for (let i = weightedOthers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weightedOthers[i], weightedOthers[j]] = [weightedOthers[j], weightedOthers[i]];
  }
  
  // Remove consecutive duplicates
  const deduped: Screen[] = [];
  for (const screen of weightedOthers) {
    if (deduped.length === 0 || deduped[deduped.length - 1].id !== screen.id) {
      deduped.push(screen);
    }
  }
  
  // Insert SNAP_AND_PURR at regular intervals
  let result: Screen[] = [];
  if (snapScreens.length > 0 && snapFrequency > 0) {
    let snapIndex = 0;
    
    for (let i = 0; i < deduped.length; i++) {
      result.push(deduped[i]);
      if ((i + 1) % snapFrequency === 0) {
        result.push(snapScreens[snapIndex % snapScreens.length]);
        snapIndex++;
      }
    }
    
    // Ensure at least one SNAP_AND_PURR if we have screens
    if (result.length > 0 && !result.some(s => s.type === "SNAP_AND_PURR")) {
      result.push(snapScreens[0]);
    }
  } else {
    result = deduped.length > 0 ? deduped : snapScreens;
  }
  
  // Inject POLL slides during poll time (every pollFrequency screens)
  if (isPollTime() && pollFrequency > 0) {
    const pollScreen: Screen = {
      id: -1, // Virtual poll screen
      type: "POLL",
      title: "Cat Poll",
      subtitle: null,
      body: null,
      imagePath: null,
      imageDisplayMode: "cover",
      qrUrl: null,
      timeStart: null,
      timeEnd: null,
      daysOfWeek: null,
      startAt: null,
      endAt: null,
      priority: 1,
      isActive: true,
      durationSeconds: 15, // Show poll for 15 seconds
      sortOrder: 0,
      isProtected: false,
      isAdopted: false,
      livestreamUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const withPolls: Screen[] = [];
    for (let i = 0; i < result.length; i++) {
      withPolls.push(result[i]);
      // Insert poll every pollFrequency screens
      if ((i + 1) % pollFrequency === 0) {
        withPolls.push(pollScreen);
      }
    }
    
    // Ensure at least one poll if we have screens
    if (withPolls.length > 0 && !withPolls.some(s => s.type === "POLL")) {
      withPolls.push(pollScreen);
    }
    
    return withPolls;
  }
  
  return result;
}

// Local storage keys for offline caching
const CACHE_KEYS = {
  screens: "catfe-tv-screens-cache",
  settings: "catfe-tv-settings-cache",
  timestamp: "catfe-tv-cache-timestamp",
};

export function usePlaylist() {
  const [state, setState] = useState<PlaylistState>({
    screens: [],
    currentIndex: 0,
    isLoading: true,
    error: null,
    isOffline: false,
  });
  
  const [settings, setSettings] = useState<Settings | null>(null);
  const [playlist, setPlaylist] = useState<Screen[]>([]);
  const [pollTimeWindow, setPollTimeWindow] = useState(isPollTime());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check poll time window every 30 seconds
  useEffect(() => {
    const checkPollTime = () => {
      const newPollTime = isPollTime();
      if (newPollTime !== pollTimeWindow) {
        setPollTimeWindow(newPollTime);
      }
    };
    
    const interval = setInterval(checkPollTime, 30000);
    return () => clearInterval(interval);
  }, [pollTimeWindow]);
  
  // Fetch screens from API
  const screensQuery = trpc.screens.getActive.useQuery(undefined, {
    refetchInterval: (settings?.refreshIntervalSeconds || 60) * 1000,
    retry: 2,
  });
  
  // Fetch settings
  const settingsQuery = trpc.settings.get.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // Refresh settings every 5 minutes
  });
  
  // Log view mutation
  const logViewMutation = trpc.screens.logView.useMutation();
  
  // Cache screens to localStorage
  const cacheData = useCallback((screens: Screen[], settings: Settings | null) => {
    try {
      localStorage.setItem(CACHE_KEYS.screens, JSON.stringify(screens));
      if (settings) {
        localStorage.setItem(CACHE_KEYS.settings, JSON.stringify(settings));
      }
      localStorage.setItem(CACHE_KEYS.timestamp, Date.now().toString());
    } catch (e) {
      console.warn("Failed to cache data:", e);
    }
  }, []);
  
  // Load cached data
  const loadCachedData = useCallback(() => {
    try {
      const cachedScreens = localStorage.getItem(CACHE_KEYS.screens);
      const cachedSettings = localStorage.getItem(CACHE_KEYS.settings);
      
      if (cachedScreens) {
        const screens = JSON.parse(cachedScreens) as Screen[];
        const settings = cachedSettings ? JSON.parse(cachedSettings) as Settings : null;
        return { screens, settings };
      }
    } catch (e) {
      console.warn("Failed to load cached data:", e);
    }
    return null;
  }, []);
  
  // Update settings when fetched
  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);
  
  // Update screens and build playlist (also rebuild when poll time window changes)
  useEffect(() => {
    if (screensQuery.data) {
      const screens = screensQuery.data;
      cacheData(screens, settings);
      
      // Poll frequency: show poll every 3 screens during poll time
      const newPlaylist = buildPlaylist(screens, settings?.snapAndPurrFrequency || 5, 3);
      setPlaylist(newPlaylist);
      
      setState(prev => ({
        ...prev,
        screens,
        isLoading: false,
        error: null,
        isOffline: false,
        currentIndex: prev.currentIndex >= newPlaylist.length ? 0 : prev.currentIndex,
      }));
    } else if (screensQuery.error) {
      // Try to use cached data
      const cached = loadCachedData();
      if (cached) {
        const newPlaylist = buildPlaylist(cached.screens, cached.settings?.snapAndPurrFrequency || 5, 3);
        setPlaylist(newPlaylist);
        if (cached.settings) setSettings(cached.settings);
        
        setState(prev => ({
          ...prev,
          screens: cached.screens,
          isLoading: false,
          error: null,
          isOffline: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to load screens",
          isOffline: true,
        }));
      }
    }
  }, [screensQuery.data, screensQuery.error, settings, cacheData, loadCachedData, pollTimeWindow]);
  
  // Current screen
  const currentScreen = playlist[state.currentIndex] || null;
  
  // Advance to next screen
  const nextScreen = useCallback(() => {
    setState(prev => {
      const nextIndex = (prev.currentIndex + 1) % Math.max(1, playlist.length);
      return { ...prev, currentIndex: nextIndex };
    });
  }, [playlist.length]);
  
  // Go to previous screen
  const prevScreen = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.currentIndex === 0 ? playlist.length - 1 : prev.currentIndex - 1;
      return { ...prev, currentIndex: prevIndex };
    });
  }, [playlist.length]);
  
  // Auto-advance timer
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (currentScreen && playlist.length > 0) {
      const duration = (currentScreen.durationSeconds || settings?.defaultDurationSeconds || 10) * 1000;
      
      timerRef.current = setTimeout(() => {
        // Log view before advancing (skip for virtual poll screen)
        if (currentScreen.id > 0) {
          logViewMutation.mutate({ 
            screenId: currentScreen.id,
            sessionId: sessionStorage.getItem("tv-session-id") || undefined,
          });
        }
        nextScreen();
      }, duration);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentScreen, playlist.length, settings?.defaultDurationSeconds, nextScreen, logViewMutation]);
  
  // Generate session ID on mount
  useEffect(() => {
    if (!sessionStorage.getItem("tv-session-id")) {
      sessionStorage.setItem("tv-session-id", `tv-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    }
  }, []);
  
  // Manual refresh
  const refresh = useCallback(() => {
    screensQuery.refetch();
    settingsQuery.refetch();
  }, [screensQuery, settingsQuery]);
  
  // Export isResultsTime for the TV display to show results overlay
  const showResultsOverlay = isResultsTime();
  
  return {
    currentScreen,
    playlist,
    currentIndex: state.currentIndex,
    totalScreens: playlist.length,
    isLoading: state.isLoading,
    error: state.error,
    isOffline: state.isOffline,
    settings,
    nextScreen,
    prevScreen,
    refresh,
    showResultsOverlay,
  };
}
