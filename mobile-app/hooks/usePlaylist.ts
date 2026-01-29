import { useState, useEffect, useCallback, useRef } from 'react';
import { screensApi, settingsApi, Screen, Settings } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'catfe_tv_playlist_cache';
const SETTINGS_CACHE_KEY = 'catfe_tv_settings_cache';

export function usePlaylist() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Build playlist with scheduling logic
  const buildPlaylist = useCallback((allScreens: Screen[], settings: Settings | null): Screen[] => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Filter screens based on scheduling
    const activeScreens = allScreens.filter(screen => {
      if (!screen.isActive) return false;

      // Check date range
      if (screen.startAt && new Date(screen.startAt) > now) return false;
      if (screen.endAt && new Date(screen.endAt) < now) return false;

      // Check days of week
      if (screen.daysOfWeek && screen.daysOfWeek.length > 0) {
        if (!screen.daysOfWeek.includes(currentDay)) return false;
      }

      // Check time window
      if (screen.timeStart && screen.timeEnd) {
        if (currentTime < screen.timeStart || currentTime > screen.timeEnd) return false;
      }

      return true;
    });

    // Sort by priority (higher first) then by sortOrder
    const sortedScreens = [...activeScreens].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.sortOrder - b.sortOrder;
    });

    // Insert SNAP_AND_PURR screens at regular intervals
    const snapAndPurrScreens = sortedScreens.filter(s => s.screenType === 'SNAP_AND_PURR');
    const otherScreens = sortedScreens.filter(s => s.screenType !== 'SNAP_AND_PURR');
    
    if (snapAndPurrScreens.length === 0 || otherScreens.length === 0) {
      return sortedScreens;
    }

    const frequency = settings?.snapAndPurrFrequency || 5;
    const playlist: Screen[] = [];
    let snapIndex = 0;

    otherScreens.forEach((screen, index) => {
      playlist.push(screen);
      if ((index + 1) % frequency === 0 && snapAndPurrScreens.length > 0) {
        playlist.push(snapAndPurrScreens[snapIndex % snapAndPurrScreens.length]);
        snapIndex++;
      }
    });

    return playlist;
  }, []);

  // Load cached data
  const loadCache = useCallback(async () => {
    try {
      const [cachedScreens, cachedSettings] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY),
        AsyncStorage.getItem(SETTINGS_CACHE_KEY),
      ]);
      
      if (cachedScreens) {
        const parsed = JSON.parse(cachedScreens);
        setScreens(parsed);
      }
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        setSettings(parsed);
      }
    } catch (e) {
      console.warn('Failed to load cache:', e);
    }
  }, []);

  // Save to cache
  const saveCache = useCallback(async (screens: Screen[], settings: Settings) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(screens)),
        AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings)),
      ]);
    } catch (e) {
      console.warn('Failed to save cache:', e);
    }
  }, []);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const [screensData, settingsData] = await Promise.all([
        screensApi.getActive(),
        settingsApi.get(),
      ]);
      
      setScreens(screensData);
      setSettings(settingsData);
      setIsOffline(false);
      setError(null);
      
      // Cache the data
      await saveCache(screensData, settingsData);
    } catch (e) {
      console.error('Failed to fetch data:', e);
      setIsOffline(true);
      setError('Unable to connect to server. Using cached content.');
      
      // Try to load from cache
      await loadCache();
    } finally {
      setIsLoading(false);
    }
  }, [saveCache, loadCache]);

  // Initial load
  useEffect(() => {
    loadCache().then(() => fetchData());
  }, [fetchData, loadCache]);

  // Set up refresh interval
  useEffect(() => {
    const interval = (settings?.refreshIntervalSeconds || 60) * 1000;
    
    refreshTimerRef.current = setInterval(fetchData, interval);
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [settings?.refreshIntervalSeconds, fetchData]);

  // Build the playlist
  const playlist = buildPlaylist(screens, settings);
  const currentScreen = playlist[currentIndex] || null;

  // Auto-advance to next screen
  const advanceToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % Math.max(playlist.length, 1));
  }, [playlist.length]);

  // Set up auto-advance timer
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (currentScreen && playlist.length > 0) {
      const duration = (currentScreen.durationSeconds || settings?.defaultDurationSeconds || 10) * 1000;
      timerRef.current = setTimeout(advanceToNext, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentScreen, currentIndex, advanceToNext, settings?.defaultDurationSeconds, playlist.length]);

  // Manual navigation
  const goToNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    advanceToNext();
  }, [advanceToNext]);

  const goToPrevious = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex(prev => (prev - 1 + playlist.length) % Math.max(playlist.length, 1));
  }, [playlist.length]);

  return {
    playlist,
    currentScreen,
    currentIndex,
    settings,
    isLoading,
    error,
    isOffline,
    goToNext,
    goToPrevious,
    refresh: fetchData,
  };
}
