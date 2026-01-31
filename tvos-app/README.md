# Catfé TV - tvOS App (WebView Edition)

A lightweight tvOS app that displays your Catfé TV slideshow on Apple TV using a WebView.

## Overview

This app is a simple wrapper that loads your web-based TV display in a full-screen WebView. This approach ensures:

- **Automatic updates**: Any changes you make to the web TV display are instantly reflected on the Apple TV - no app update needed!
- **Single codebase**: All features are in the web version, so you only maintain one codebase
- **Simple maintenance**: Just two Swift files to manage

## Quick Start

### 1. Update the TV Display URL

Before building, update the URL in `CatfeTV/Sources/WebViewScreen.swift` (line 11):

```swift
private let tvDisplayURL = "https://catfe-tv.manus.space/tv"
```

Replace `catfe-tv.manus.space` with your actual published domain.

### 2. Open in Xcode

1. Double-click `CatfeTV.xcodeproj` to open in Xcode
2. Select your Apple TV device or simulator as the target
3. Click the Play button to build and run

### 3. Configure Signing (for real devices)

1. Select the project in the navigator
2. Go to "Signing & Capabilities" tab
3. Select your Team from the dropdown
4. Xcode will automatically manage signing

## Features

- **Full-screen WebView**: Loads your TV display URL in a borderless, full-screen view
- **Auto-retry**: Automatically retries loading if the connection fails (with exponential backoff)
- **Loading indicator**: Shows a loading spinner while content loads
- **Error handling**: Displays friendly error messages with auto-retry
- **Idle timer disabled**: Prevents Apple TV from going to screensaver
- **JavaScript enabled**: Full support for animations and interactivity

## File Structure

```
CatfeTV/
├── Sources/
│   ├── CatfeTVApp.swift      # App entry point (20 lines)
│   └── WebViewScreen.swift   # WebView wrapper with loading/error states (170 lines)
└── Resources/
    └── Assets.xcassets/      # App icons and images
```

## Requirements

- Xcode 15.0+
- tvOS 17.0+
- Apple TV (4th generation or later)

## TestFlight Distribution

1. Select **Any tvOS Device** as the build destination
2. Product → Archive
3. When archive completes, click **Distribute App**
4. Select **App Store Connect** → **Upload**
5. Follow the prompts to upload to TestFlight

## Siri Remote Controls

The web TV display handles all remote controls:

| Action | Control |
|--------|---------|
| Next screen | Swipe right / Arrow right |
| Previous screen | Swipe left / Arrow left |
| Play/Pause | Press Play/Pause button |
| Show controls | Any interaction |

## Troubleshooting

### App shows "Unable to Load"
- Check that your TV display URL is correct and accessible
- Ensure your Apple TV has internet connectivity
- The app will automatically retry when connection is restored

### Content not updating
- The WebView loads fresh content each time
- Force refresh by restarting the app
- Check your web admin dashboard to ensure changes are published

### WebView doesn't fill the screen
- Make sure `.ignoresSafeArea()` is applied to the WebViewScreen

## Why WebView?

We chose a WebView approach because:

1. **Faster iteration**: Update features on the web, see them instantly on TV
2. **Consistency**: Same look and feel across web preview and Apple TV
3. **Simpler codebase**: ~200 lines of Swift vs ~1000+ for native
4. **No App Store delays**: Feature updates don't require app review

The trade-off is requiring an internet connection, but since the content comes from your server anyway, this isn't a limitation in practice.

## Content Management

All content is managed through the web admin dashboard at your published URL + `/admin`. Changes appear on the Apple TV immediately after refresh.
