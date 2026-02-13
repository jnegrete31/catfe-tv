import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { Screen, Settings, Cat } from "@shared/types";

interface PlaylistState {
  screens: Screen[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
}

// Check if a screen is currently eligible based on scheduling
function isScreenEligible(screen: Screen): boolean {
  // If scheduling is not enabled, screen is always eligible (when active)
  if (!screen.schedulingEnabled) return true;
  
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

// Check if it's poll time (15-minute intervals: x:00-x:12, x:15-x:27, x:30-x:42, x:45-x:57)
function isPollTime(): boolean {
  const minutes = new Date().getMinutes();
  const minuteInQuarter = minutes % 15;
  return minuteInQuarter < 12;
}

// Check if it's results time (15-minute intervals: x:12-x:14, x:27-x:29, x:42-x:44, x:57-x:59)
function isResultsTime(): boolean {
  const minutes = new Date().getMinutes();
  const minuteInQuarter = minutes % 15;
  return minuteInQuarter >= 12 && minuteInQuarter < 15;
}

// Convert a Cat from the database into a synthetic Screen object for the TV playlist
function catToScreen(cat: Cat, index: number): Screen {
  // Calculate age from DOB
  let ageStr = '';
  if (cat.dob) {
    const dob = new Date(cat.dob);
    const now = new Date();
    const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (months < 12) {
      ageStr = `${months} month${months !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(months / 12);
      ageStr = `${years} year${years !== 1 ? 's' : ''} old`;
    }
  }
  
  // Build subtitle from breed, color, age, sex
  const parts: string[] = [];
  if (cat.breed) parts.push(cat.breed);
  if (cat.colorPattern) parts.push(cat.colorPattern);
  if (ageStr) parts.push(ageStr);
  if (cat.sex && cat.sex !== 'unknown') parts.push(cat.sex === 'female' ? 'Female' : 'Male');
  const subtitle = parts.join(' \u00b7 ');
  
  // Build body from bio + personality tags + extras
  const bodyParts: string[] = [];
  if (cat.bio) bodyParts.push(cat.bio);
  if (cat.personalityTags && cat.personalityTags.length > 0) {
    bodyParts.push(cat.personalityTags.join(' \u00b7 '));
  }
  const extras: string[] = [];
  if (cat.isAltered) extras.push('Spayed/Neutered');
  if (cat.felvFivStatus === 'negative') extras.push('FeLV/FIV Negative');
  if (cat.adoptionFee) extras.push(`Adoption Fee: ${cat.adoptionFee}`);
  if (extras.length > 0) bodyParts.push(extras.join(' \u00b7 '));
  
  return {
    id: -(cat.id + 10000), // Negative ID to distinguish from real screens
    type: 'ADOPTION' as Screen['type'],
    title: cat.name,
    subtitle: subtitle || null,
    body: bodyParts.join('\n\n') || null,
    imagePath: cat.photoUrl || null,
    imageDisplayMode: 'cover',
    qrUrl: null,
    startAt: null,
    endAt: null,
    daysOfWeek: null,
    timeStart: null,
    timeEnd: null,
    priority: 1,
    durationSeconds: 15,
    sortOrder: index,
    isActive: true,
    schedulingEnabled: false,
    isProtected: false,
    isAdopted: false,
    livestreamUrl: null,
    eventTime: null,
    eventLocation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalAdoptionCount: 0,
    adoptionDate: null,
  } as Screen;
}

// Build weighted playlist with SNAP_AND_PURR frequency and cat slides injection
function buildPlaylist(screens: Screen[], snapFrequency: number, catSlides?: Screen[]): Screen[] {
  const eligible = screens.filter(isScreenEligible);
  if (eligible.length === 0 && (!catSlides || catSlides.length === 0)) return [];
  
  const snapScreens = eligible.filter(s => s.type === "SNAP_AND_PURR");
  const otherScreens = eligible.filter(s => s.type !== "SNAP_AND_PURR");
  
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
  
  // Inject cat slides from database into the deduped list (spread them out)
  if (catSlides && catSlides.length > 0) {
    // Shuffle cat slides for variety each cycle
    const shuffledCats = [...catSlides].sort(() => Math.random() - 0.5);
    
    if (deduped.length === 0) {
      // Only cat slides, no other screens
      deduped.push(...shuffledCats);
    } else {
      // Interleave: insert a cat slide every N regular screens
      const interval = Math.max(2, Math.floor(deduped.length / Math.min(shuffledCats.length, 8)));
      const merged: Screen[] = [];
      let catIdx = 0;
      
      for (let i = 0; i < deduped.length; i++) {
        merged.push(deduped[i]);
        // Insert a cat slide at regular intervals
        if ((i + 1) % interval === 0 && catIdx < shuffledCats.length) {
          merged.push(shuffledCats[catIdx]);
          catIdx++;
        }
      }
      // Append any remaining cat slides at the end
      while (catIdx < shuffledCats.length) {
        merged.push(shuffledCats[catIdx]);
        catIdx++;
      }
      deduped.length = 0;
      deduped.push(...merged);
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
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScreenIdsRef = useRef<string>(""); // Track screen IDs to avoid unnecessary rebuilds
  const playlistRef = useRef<Screen[]>([]); // Stable ref for nextScreen callback
  const settingsRef = useRef<Settings | null>(null); // Stable ref for settings
  const catSlidesRef = useRef<Screen[]>([]); // Stable ref for cat slides in reshuffle
  
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
  
  // Fetch screens from active playlist (or all active screens if no playlist selected)
  const screensQuery = trpc.playlists.getActiveScreens.useQuery(undefined, {
    refetchInterval: (settings?.refreshIntervalSeconds || 60) * 1000,
    retry: 2,
  });
  
  // Fetch available cats from the cats table for individual adoption slides
  const catsQuery = trpc.cats.getAvailable.useQuery(undefined, {
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });
  
  // Convert cats to synthetic Screen objects (memoized to avoid rebuilds)
  const catSlides = useMemo(() => {
    if (!catsQuery.data || catsQuery.data.length === 0) return [];
    return catsQuery.data.map((cat, idx) => catToScreen(cat, idx));
  }, [catsQuery.data]);
  
  // Keep catSlides ref in sync for the reshuffle callback
  useEffect(() => { catSlidesRef.current = catSlides; }, [catSlides]);
  
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
  
  // Update screens and build playlist (also rebuild when poll time window or cats change)
  useEffect(() => {
    if (screensQuery.data) {
      const screens = screensQuery.data;
      cacheData(screens, settings);
      
      // Check if screens actually changed (by comparing sorted IDs + active status)
      const currentScreenIds = screens
        .filter(s => s.isActive)
        .map(s => `${s.id}:${s.priority}`)
        .sort()
        .join(',');
      
      const screensChanged = currentScreenIds !== lastScreenIdsRef.current;
      
      // Only rebuild playlist if screens actually changed or playlist is empty
      if (screensChanged || playlist.length === 0) {
        lastScreenIdsRef.current = currentScreenIds;
        const newPlaylist = buildPlaylist(screens, settings?.snapAndPurrFrequency || 5, catSlides);
        setPlaylist(newPlaylist);
        
        setState(prev => ({
          ...prev,
          screens,
          isLoading: false,
          error: null,
          isOffline: false,
          currentIndex: prev.currentIndex >= newPlaylist.length ? 0 : prev.currentIndex,
        }));
      } else {
        // Just update screens without rebuilding playlist
        setState(prev => ({
          ...prev,
          screens,
          isLoading: false,
          error: null,
          isOffline: false,
        }));
      }
    } else if (screensQuery.error) {
      // Try to use cached data
      const cached = loadCachedData();
      if (cached) {
        const newPlaylist = buildPlaylist(cached.screens, cached.settings?.snapAndPurrFrequency || 5, catSlides);
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
  }, [screensQuery.data, screensQuery.error, settings, cacheData, loadCachedData, pollTimeWindow, catSlides]);
  
  // Keep refs in sync for stable callbacks
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Current screen
  const currentScreen = playlist[state.currentIndex] || null;
  
  // Advance to next screen, reshuffle when a full cycle completes
  // Uses refs to avoid re-creating the callback when playlist/settings change,
  // which would reset the auto-advance timer in TVDisplay.tsx
  const nextScreen = useCallback(() => {
    setState(prev => {
      const pl = playlistRef.current;
      const nextIndex = (prev.currentIndex + 1) % Math.max(1, pl.length);
      
      // If we've looped back to the start, reshuffle the playlist for variety
      if (nextIndex === 0 && pl.length > 1) {
        const lastScreen = pl[prev.currentIndex];
        const freq = settingsRef.current?.snapAndPurrFrequency || 5;
        const newPlaylist = buildPlaylist(prev.screens, freq, catSlidesRef.current);
        // Avoid starting with the same screen that just played
        if (newPlaylist.length > 1 && newPlaylist[0]?.id === lastScreen?.id) {
          const swapIdx = 1 + Math.floor(Math.random() * (newPlaylist.length - 1));
          [newPlaylist[0], newPlaylist[swapIdx]] = [newPlaylist[swapIdx], newPlaylist[0]];
        }
        setPlaylist(newPlaylist);
      }
      
      return { ...prev, currentIndex: nextIndex };
    });
  }, []); // Stable - never recreated
  
  // Go to previous screen
  const prevScreen = useCallback(() => {
    setState(prev => {
      const pl = playlistRef.current;
      const prevIndex = prev.currentIndex === 0 ? pl.length - 1 : prev.currentIndex - 1;
      return { ...prev, currentIndex: prevIndex };
    });
  }, []); // Stable - never recreated
  
  // Note: Auto-advance timer is handled in TVDisplay.tsx to support pause functionality
  // Log view when screen changes
  useEffect(() => {
    if (currentScreen && currentScreen.id > 0) {
      logViewMutation.mutate({ 
        screenId: currentScreen.id,
        sessionId: sessionStorage.getItem("tv-session-id") || undefined,
      });
    }
  }, [currentScreen?.id, logViewMutation]);
  
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
    catsQuery.refetch();
  }, [screensQuery, settingsQuery, catsQuery]);
  
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
