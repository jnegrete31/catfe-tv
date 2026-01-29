import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, Pressable } from 'react-native';
import { useTVEventHandler } from 'react-native';
import { usePlaylist } from '@/hooks/usePlaylist';
import { ScreenRenderer } from '@/components/ScreenRenderer';
import { WeatherClock } from '@/components/WeatherClock';
import { colors, typography } from '@/lib/theme';

const isTV = Platform.isTV;

export default function TVDisplay() {
  const {
    playlist,
    currentScreen,
    currentIndex,
    settings,
    isLoading,
    error,
    isOffline,
    goToNext,
    goToPrevious,
    refresh,
  } = usePlaylist();

  // Handle TV remote events (for tvOS)
  const tvEventHandler = useCallback((evt: any) => {
    if (!evt) return;
    
    switch (evt.eventType) {
      case 'right':
      case 'swipeRight':
        goToNext();
        break;
      case 'left':
      case 'swipeLeft':
        goToPrevious();
        break;
      case 'select':
      case 'playPause':
        // Could toggle pause/play here
        break;
      case 'menu':
        // Could show menu overlay
        break;
    }
  }, [goToNext, goToPrevious]);

  // Register TV event handler for tvOS
  if (isTV && typeof useTVEventHandler === 'function') {
    useTVEventHandler(tvEventHandler);
  }

  // Loading state
  if (isLoading && !currentScreen) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Catfé TV...</Text>
      </View>
    );
  }

  // No content state
  if (!currentScreen && playlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🐱</Text>
        <Text style={styles.emptyTitle}>No Content Available</Text>
        <Text style={styles.emptySubtitle}>
          Add screens in the admin app to get started
        </Text>
        <Pressable style={styles.refreshButton} onPress={refresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main screen content */}
      {currentScreen && (
        <ScreenRenderer
          screen={currentScreen}
          locationName={settings?.locationName}
        />
      )}

      {/* Weather and clock overlay */}
      <WeatherClock
        lat={settings?.weatherLat || 34.3917}
        lon={settings?.weatherLon || -118.5426}
      />

      {/* Progress indicator */}
      {playlist.length > 1 && (
        <View style={styles.progressContainer}>
          {playlist.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Offline indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>📡 Offline Mode</Text>
        </View>
      )}

      {/* Touch controls for mobile preview */}
      {!isTV && (
        <View style={styles.touchControls}>
          <Pressable style={styles.touchArea} onPress={goToPrevious}>
            <Text style={styles.touchHint}>◀</Text>
          </Pressable>
          <Pressable style={styles.touchArea} onPress={goToNext}>
            <Text style={styles.touchHint}>▶</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: isTV ? 32 : 18,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 40,
  },
  emptyEmoji: {
    fontSize: isTV ? 120 : 60,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: isTV ? 48 : 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: isTV ? 28 : 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: isTV ? 48 : 24,
    paddingVertical: isTV ? 16 : 12,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: isTV ? 24 : 16,
    fontWeight: '600',
  },
  progressContainer: {
    position: 'absolute',
    bottom: isTV ? 40 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: isTV ? 12 : 8,
  },
  progressDot: {
    width: isTV ? 12 : 8,
    height: isTV ? 12 : 8,
    borderRadius: isTV ? 6 : 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: isTV ? 36 : 24,
  },
  offlineIndicator: {
    position: 'absolute',
    top: isTV ? 40 : 20,
    left: isTV ? 40 : 20,
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingHorizontal: isTV ? 20 : 12,
    paddingVertical: isTV ? 10 : 6,
    borderRadius: 8,
  },
  offlineText: {
    color: 'white',
    fontSize: isTV ? 20 : 12,
    fontWeight: '600',
  },
  touchControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchHint: {
    fontSize: 40,
    color: 'transparent',
  },
});
