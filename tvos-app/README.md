# Catfé TV - Apple TV App

A native tvOS app for displaying digital signage content on Apple TV. This app connects to your published Catfé TV backend and displays screens managed through the web admin dashboard.

## Features

- **Full-screen TV display** with smooth fade transitions between screens
- **Siri Remote navigation** - swipe left/right to change screens, play/pause to toggle auto-advance
- **Weather and clock overlay** showing current conditions for Santa Clarita, CA
- **Offline caching** - continues playing cached content if network drops
- **Auto-refresh** - automatically picks up new content from the admin dashboard
- **All 7 screen types** - Events, Adoption, Membership, Reminders, Snap & Purr, Today at Catfé, Thank You

## Requirements

- macOS with Xcode 15.0 or later
- Apple Developer Program membership ($99/year)
- Apple TV running tvOS 17.0 or later

## Setup Instructions

### 1. Open the Project

1. Open `CatfeTV.xcodeproj` in Xcode
2. Wait for Swift Package dependencies to resolve (if any)

### 2. Configure Signing

1. Select the **CatfeTV** target in the project navigator
2. Go to **Signing & Capabilities** tab
3. Select your **Team** from the dropdown
4. Xcode will automatically create provisioning profiles

### 3. Update Bundle Identifier (if needed)

The default bundle ID is `com.catfe.tv`. If this conflicts with an existing app:
1. Go to **Signing & Capabilities** tab
2. Change **Bundle Identifier** to something unique (e.g., `com.yourname.catfetv`)

### 4. Add App Icons (Optional but Recommended)

For a polished App Store presence, add icons to:
- `Assets.xcassets/App Icon & Top Shelf Image.brandassets/`

Required sizes:
- **App Icon**: 400×240 (small), 1280×768 (large/App Store)
- **Top Shelf**: 1920×720 (standard), 2320×720 (wide)

### 5. Test on Apple TV

1. Connect your Apple TV to the same network as your Mac
2. On Apple TV: Settings → Remotes and Devices → Remote App and Devices
3. In Xcode: Window → Devices and Simulators → find your Apple TV
4. Select your Apple TV as the run destination and click Run

### 6. Archive and Upload to TestFlight

1. Select **Any tvOS Device** as the build destination
2. Product → Archive
3. When archive completes, click **Distribute App**
4. Select **App Store Connect** → **Upload**
5. Follow the prompts to upload to TestFlight

### 7. TestFlight Distribution

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app → TestFlight
3. Add internal or external testers
4. Testers will receive an email to install via TestFlight app on Apple TV

## API Configuration

The app connects to your published backend at:
```
https://catfetv-amdmxcoq.manus.space
```

To change this URL, edit `APIClient.swift`:
```swift
enum APIConfig {
    static let baseURL = "https://your-new-url.manus.space"
    // ...
}
```

## Siri Remote Controls

| Action | Control |
|--------|---------|
| Next screen | Swipe right |
| Previous screen | Swipe left |
| Play/Pause | Press Play/Pause button |
| Show controls | Any swipe gesture |
| Hide controls | Wait 3 seconds or press Menu |

## Troubleshooting

### "No screens to display"
- Check that your web backend is published and accessible
- Verify you have active screens in the admin dashboard
- Check network connectivity on Apple TV

### Screens not updating
- The app refreshes every 60 seconds by default
- Force refresh by navigating away and back
- Check the admin dashboard to ensure changes are saved

### Weather not showing
- Requires internet connection
- Uses Open-Meteo API (free, no key required)
- Check if api.open-meteo.com is accessible

## Content Management

All content is managed through the web admin dashboard:
- **URL**: https://catfetv-amdmxcoq.manus.space/admin
- Create, edit, and delete screens
- Set scheduling (dates, days of week, time windows)
- Upload images via GitHub integration
- Drag-and-drop to reorder screens

Changes made in the admin dashboard will automatically appear on the Apple TV within 60 seconds.

## File Structure

```
tvos-app/
├── CatfeTV.xcodeproj/     # Xcode project file
├── CatfeTV/
│   ├── Sources/
│   │   ├── CatfeTVApp.swift         # App entry point
│   │   ├── ContentView.swift        # Main view with navigation
│   │   ├── APIClient.swift          # Backend API client
│   │   ├── TVDisplayView.swift      # Screen rendering
│   │   └── WeatherClockOverlay.swift # Weather/clock widget
│   └── Resources/
│       └── Assets.xcassets/         # App icons and colors
└── README.md
```

## Support

For issues with:
- **Content/screens**: Check the web admin dashboard
- **App crashes**: Check Xcode console for error logs
- **TestFlight**: Contact Apple Developer Support
