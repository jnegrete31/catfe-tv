import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import QRCode from 'react-native-qrcode-svg';
import { Screen } from '@/lib/api';
import { colors, typography } from '@/lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isTV = Platform.isTV;

interface ScreenRendererProps {
  screen: Screen;
  locationName?: string;
}

export function ScreenRenderer({ screen, locationName = 'Catfé' }: ScreenRendererProps) {
  const styles = isTV ? tvStyles : mobileStyles;
  const typo = isTV ? typography.tv : typography.mobile;

  const renderContent = () => {
    switch (screen.screenType) {
      case 'SNAP_AND_PURR':
        return (
          <View style={styles.centeredContent}>
            <Text style={[styles.emoji, { fontSize: isTV ? 120 : 60 }]}>📸</Text>
            <Text style={[styles.title, typo.title]}>{screen.title}</Text>
            <Text style={[styles.subtitle, typo.subtitle]}>{screen.subtitle}</Text>
            <Text style={[styles.body, typo.body]}>{screen.body}</Text>
            {screen.qrUrl && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={screen.qrUrl}
                  size={isTV ? 200 : 120}
                  backgroundColor="white"
                  color={colors.text}
                />
              </View>
            )}
          </View>
        );

      case 'EVENT':
        return (
          <View style={styles.eventContent}>
            {screen.imagePath && (
              <Image
                source={{ uri: screen.imagePath }}
                style={styles.eventImage}
                contentFit="cover"
              />
            )}
            <View style={styles.eventOverlay}>
              <Text style={[styles.eventLabel, typo.caption]}>UPCOMING EVENT</Text>
              <Text style={[styles.title, typo.title]}>{screen.title}</Text>
              {screen.subtitle && (
                <Text style={[styles.subtitle, typo.subtitle]}>{screen.subtitle}</Text>
              )}
              {screen.body && (
                <Text style={[styles.body, typo.body]}>{screen.body}</Text>
              )}
              {screen.qrUrl && (
                <View style={styles.qrContainer}>
                  <QRCode
                    value={screen.qrUrl}
                    size={isTV ? 150 : 100}
                    backgroundColor="white"
                    color={colors.text}
                  />
                  <Text style={[styles.qrLabel, typo.caption]}>Scan for details</Text>
                </View>
              )}
            </View>
          </View>
        );

      case 'TODAY_AT_CATFE':
        return (
          <View style={styles.centeredContent}>
            <Text style={[styles.locationLabel, typo.caption]}>TODAY AT {locationName.toUpperCase()}</Text>
            <Text style={[styles.title, typo.title]}>{screen.title}</Text>
            {screen.subtitle && (
              <Text style={[styles.subtitle, typo.subtitle]}>{screen.subtitle}</Text>
            )}
            {screen.body && (
              <Text style={[styles.body, typo.body]}>{screen.body}</Text>
            )}
          </View>
        );

      case 'MEMBERSHIP':
        return (
          <View style={styles.membershipContent}>
            <Text style={[styles.emoji, { fontSize: isTV ? 100 : 50 }]}>🐱</Text>
            <Text style={[styles.title, typo.title]}>{screen.title}</Text>
            {screen.subtitle && (
              <Text style={[styles.subtitle, typo.subtitle]}>{screen.subtitle}</Text>
            )}
            {screen.body && (
              <Text style={[styles.body, typo.body]}>{screen.body}</Text>
            )}
            {screen.qrUrl && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={screen.qrUrl}
                  size={isTV ? 180 : 100}
                  backgroundColor="white"
                  color={colors.text}
                />
                <Text style={[styles.qrLabel, typo.caption]}>Scan to join</Text>
              </View>
            )}
          </View>
        );

      case 'REMINDER':
        return (
          <View style={styles.reminderContent}>
            <Text style={[styles.emoji, { fontSize: isTV ? 80 : 40 }]}>💡</Text>
            <Text style={[styles.reminderLabel, typo.caption]}>FRIENDLY REMINDER</Text>
            <Text style={[styles.title, typo.title]}>{screen.title}</Text>
            {screen.body && (
              <Text style={[styles.body, typo.body]}>{screen.body}</Text>
            )}
          </View>
        );

      case 'ADOPTION':
        return (
          <View style={styles.adoptionContent}>
            {screen.imagePath && (
              <Image
                source={{ uri: screen.imagePath }}
                style={styles.adoptionImage}
                contentFit="cover"
              />
            )}
            <View style={styles.adoptionInfo}>
              <Text style={[styles.adoptionLabel, typo.caption]}>LOOKING FOR A HOME</Text>
              <Text style={[styles.title, typo.title]}>{screen.title}</Text>
              {screen.subtitle && (
                <Text style={[styles.subtitle, typo.subtitle]}>{screen.subtitle}</Text>
              )}
              {screen.body && (
                <Text style={[styles.body, typo.body]}>{screen.body}</Text>
              )}
              {screen.qrUrl && (
                <View style={styles.qrContainer}>
                  <QRCode
                    value={screen.qrUrl}
                    size={isTV ? 150 : 80}
                    backgroundColor="white"
                    color={colors.text}
                  />
                </View>
              )}
            </View>
          </View>
        );

      case 'THANK_YOU':
        return (
          <View style={styles.centeredContent}>
            <Text style={[styles.emoji, { fontSize: isTV ? 100 : 50 }]}>❤️</Text>
            <Text style={[styles.title, typo.title]}>{screen.title}</Text>
            {screen.subtitle && (
              <Text style={[styles.subtitle, typo.subtitle]}>{screen.subtitle}</Text>
            )}
            {screen.body && (
              <Text style={[styles.body, typo.body]}>{screen.body}</Text>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.centeredContent}>
            <Text style={[styles.title, typo.title]}>{screen.title}</Text>
            {screen.body && (
              <Text style={[styles.body, typo.body]}>{screen.body}</Text>
            )}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
}

const baseStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  title: {
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  body: {
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  emoji: {
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center' as const,
    marginTop: 20,
  },
  qrLabel: {
    color: colors.textSecondary,
    marginTop: 12,
  },
};

const tvStyles = StyleSheet.create({
  ...baseStyles,
  eventContent: {
    flex: 1,
    flexDirection: 'row',
  },
  eventImage: {
    width: '50%',
    height: '100%',
  },
  eventOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 60,
  },
  eventLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 2,
  },
  locationLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 24,
    letterSpacing: 3,
  },
  membershipContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    backgroundColor: colors.primary,
  },
  reminderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    backgroundColor: '#FFF8E7',
  },
  reminderLabel: {
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: 24,
    letterSpacing: 2,
  },
  adoptionContent: {
    flex: 1,
    flexDirection: 'row',
  },
  adoptionImage: {
    width: '45%',
    height: '100%',
  },
  adoptionInfo: {
    flex: 1,
    justifyContent: 'center',
    padding: 60,
  },
  adoptionLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 2,
  },
});

const mobileStyles = StyleSheet.create({
  ...baseStyles,
  eventContent: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: '40%',
  },
  eventOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  eventLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  locationLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 2,
  },
  membershipContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.primary,
  },
  reminderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF8E7',
  },
  reminderLabel: {
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 1,
  },
  adoptionContent: {
    flex: 1,
  },
  adoptionImage: {
    width: '100%',
    height: '40%',
  },
  adoptionInfo: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  adoptionLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
});

export default ScreenRenderer;
