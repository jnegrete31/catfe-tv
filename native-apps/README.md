# Catfé TV Native Apps

Native iOS and tvOS apps for the Catfé TV digital signage system. These apps connect to your deployed Catfé TV web backend and can be distributed via TestFlight.

## Project Structure

```
native-apps/
├── Shared/                    # Shared code between iOS and tvOS
│   ├── Models.swift           # Data models (Screen, Settings, etc.)
│   └── APIClient.swift        # API client for backend communication
├── CatfeTV-tvOS/              # Apple TV app
│   ├── CatfeTV.xcodeproj      # Xcode project
│   └── CatfeTV/
│       ├── CatfeTVApp.swift   # App entry point
│       ├── Views/             # SwiftUI views
│       └── ViewModels/        # View models
└── CatfeTV-iOS/               # iPhone/iPad admin app
    ├── CatfeTVAdmin.xcodeproj # Xcode project
    └── CatfeTVAdmin/
        ├── CatfeTVAdminApp.swift
        ├── Views/
        └── ViewModels/
```

## Requirements

- **Mac** with macOS 14.0 (Sonoma) or later
- **Xcode 15.0** or later
- **Apple Developer Program membership** ($99/year) for TestFlight distribution
- Your Catfé TV web app must be **published** and accessible via a public URL

## Setup Instructions

### 1. Configure the Backend URL

Before building, you need to update the API client with your published backend URL.

1. Open `Shared/APIClient.swift`
2. Find this line:
   ```swift
   var baseURL: String = "https://your-catfe-tv-app.manus.space"
   ```
3. Replace with your actual published URL (e.g., `https://catfe-tv.manus.space`)

### 2. Open Projects in Xcode

**For Apple TV app:**
1. Open `CatfeTV-tvOS/CatfeTV.xcodeproj` in Xcode
2. Select your development team in Signing & Capabilities
3. Update the Bundle Identifier if needed (default: `com.catfe.tv`)

**For iPhone/iPad admin app:**
1. Open `CatfeTV-iOS/CatfeTVAdmin.xcodeproj` in Xcode
2. Select your development team in Signing & Capabilities
3. Update the Bundle Identifier if needed (default: `com.catfe.tv.admin`)

### 3. Add App Icons

The projects include placeholder asset catalogs. You should add your own app icons:

**tvOS App Icons Required:**
- App Icon: 400×240 (1x), 800×480 (2x)
- Top Shelf Image: 1920×720 (1x), 3840×1440 (2x)
- Top Shelf Wide: 2320×720 (1x), 4640×1440 (2x)

**iOS App Icons Required:**
- 1024×1024 (App Store)
- 180×180 (iPhone @3x)
- 120×120 (iPhone @2x)
- 167×167 (iPad Pro @2x)
- 152×152 (iPad @2x)

### 4. Build and Test Locally

1. Select the appropriate simulator or connected device
2. Press ⌘+R to build and run
3. Test that the app connects to your backend and displays content

## TestFlight Distribution

### Prerequisites

1. **Apple Developer Program** membership active
2. **App Store Connect** access
3. Apps registered in App Store Connect with matching Bundle IDs

### Step-by-Step Deployment

#### 1. Create App Records in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Create two app records:
   - **Catfé TV** (tvOS) - Bundle ID: `com.catfe.tv`
   - **Catfé TV Admin** (iOS) - Bundle ID: `com.catfe.tv.admin`

#### 2. Archive and Upload (tvOS)

1. Open `CatfeTV.xcodeproj` in Xcode
2. Select "Any tvOS Device (arm64)" as the build target
3. Go to **Product → Archive**
4. When archiving completes, click **Distribute App**
5. Select **App Store Connect** → **Upload**
6. Follow the prompts to upload

#### 3. Archive and Upload (iOS)

1. Open `CatfeTVAdmin.xcodeproj` in Xcode
2. Select "Any iOS Device (arm64)" as the build target
3. Go to **Product → Archive**
4. When archiving completes, click **Distribute App**
5. Select **App Store Connect** → **Upload**
6. Follow the prompts to upload

#### 4. Configure TestFlight

1. In App Store Connect, go to each app → **TestFlight** tab
2. Wait for builds to finish processing (5-30 minutes)
3. Add **Test Information** (what to test, contact info)
4. Create a **Testing Group** and add testers by email
5. Testers will receive an email invitation to install via TestFlight

### Testing on Devices

**Apple TV:**
1. Install TestFlight from the tvOS App Store
2. Sign in with the Apple ID invited to test
3. Find and install "Catfé TV"

**iPhone/iPad:**
1. Install TestFlight from the iOS App Store
2. Open the invitation email and tap "View in TestFlight"
3. Install "Catfé TV Admin"

## Features

### tvOS App (Apple TV Display)

- **Full-screen 16:9 display** optimized for TV
- **Siri Remote navigation** with swipe gestures and focus states
- **Play/Pause control** for auto-advance
- **Weather and clock overlay** showing Santa Clarita conditions
- **Offline caching** for uninterrupted playback
- **Auto-refresh** to pick up content changes

**Remote Controls:**
- Swipe left/right: Navigate between screens
- Swipe up/down: Show/hide controls
- Click (select): Activate focused button
- Play/Pause button: Toggle auto-advance
- Menu button: Hide controls

### iOS App (Admin Dashboard)

- **Screen list** with drag-to-reorder
- **Screen editor** for creating/editing content
- **Settings view** showing configuration
- **Preview mode** to see how screens look
- **Pull-to-refresh** for latest data

## Troubleshooting

### "Unable to load content" error

1. Verify your backend URL is correct in `APIClient.swift`
2. Ensure your web app is published and accessible
3. Check that the device has internet connectivity

### Build errors in Xcode

1. Ensure you're using Xcode 15.0 or later
2. Clean the build folder: **Product → Clean Build Folder**
3. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

### TestFlight build processing stuck

1. Builds can take up to 30 minutes to process
2. Check App Store Connect for any compliance issues
3. Ensure your app doesn't use private APIs

## Customization

### Changing Colors

Edit the `Color(hex:)` calls throughout the views to match your brand colors.

### Adding New Screen Types

1. Update `ScreenType` enum in `Shared/Models.swift`
2. Add corresponding UI in `ScreenContentView.swift` (tvOS) and `ContentView.swift` (iOS)

### Modifying API Endpoints

The API client uses tRPC-style endpoints. If your backend changes, update the procedure names in `APIClient.swift`.

## Support

For issues with the native apps, check:
1. Xcode console for error messages
2. Network requests in the Debug navigator
3. Backend logs for API errors

For issues with the web backend, use the web admin dashboard at `/admin`.
