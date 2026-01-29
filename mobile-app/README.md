# Catfé TV Mobile App

A React Native/Expo app for Apple TV (tvOS) and iPhone (iOS) that displays digital signage content for your cat café.

## Features

- **TV Display (tvOS)**: Full-screen digital signage with Siri Remote navigation
- **Admin App (iOS)**: Manage screens, settings, and content from your iPhone
- **Offline Support**: Cached content continues playing if network drops
- **Weather & Clock**: Live overlay showing current time and weather

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Apple Developer account (for TestFlight distribution)

### Installation

```bash
cd mobile-app
npm install
```

### Configuration

1. Update the API URL in `lib/api.ts` to point to your deployed backend:

```typescript
const API_BASE_URL = 'https://your-catfe-tv-app.manus.space';
```

2. Or set the environment variable:

```bash
EXPO_PUBLIC_API_URL=https://your-catfe-tv-app.manus.space
```

### Development

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Building for TestFlight

1. Login to EAS:
```bash
eas login
```

2. Configure your project:
```bash
eas build:configure
```

3. Update `eas.json` with your Apple credentials:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

4. Build for iOS:
```bash
eas build --platform ios --profile production
```

5. Build for tvOS:
```bash
eas build --platform ios --profile tvos
```

6. Submit to TestFlight:
```bash
eas submit --platform ios
```

## Project Structure

```
mobile-app/
├── app/                 # Expo Router screens
│   ├── _layout.tsx     # Root layout
│   ├── index.tsx       # TV Display screen
│   └── admin.tsx       # Admin screen (iOS)
├── components/          # Reusable components
│   ├── ScreenRenderer.tsx
│   └── WeatherClock.tsx
├── hooks/              # Custom hooks
│   └── usePlaylist.ts  # Playlist management
├── lib/                # Utilities
│   ├── api.ts          # API client
│   └── theme.ts        # Colors and typography
├── assets/             # App icons and images
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
└── package.json
```

## Screen Types

The app supports 7 screen types:
- **SNAP_AND_PURR**: Social media call-to-action
- **EVENT**: Upcoming events with images
- **TODAY_AT_CATFE**: Daily specials/announcements
- **MEMBERSHIP**: Membership promotion
- **REMINDER**: Friendly reminders
- **ADOPTION**: Cat adoption profiles
- **THANK_YOU**: Sponsor/donor recognition

## TV Remote Controls (tvOS)

- **Swipe Left/Right**: Navigate between screens
- **Click/Select**: Pause/resume auto-advance
- **Play/Pause**: Toggle playback
- **Menu**: Return to previous screen

## Troubleshooting

### Build fails with signing errors
Make sure you have a valid Apple Developer account and have created the necessary certificates and provisioning profiles in the Apple Developer Portal.

### App can't connect to backend
1. Verify the API URL is correct in `lib/api.ts`
2. Ensure the backend is deployed and accessible
3. Check that CORS is configured to allow requests from the mobile app

### tvOS build not working
tvOS requires additional configuration. Make sure:
1. Your Apple Developer account has tvOS enabled
2. You've created tvOS-specific provisioning profiles
3. The `tvos` profile in `eas.json` is correctly configured
