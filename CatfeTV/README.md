# Catfé TV - Digital Signage System

A native iOS/tvOS app system for displaying beautiful digital signage content at Catfé Santa Clarita cat lounge.

![Platform](https://img.shields.io/badge/platform-iOS%2017%20%7C%20tvOS%2017-blue)
![Swift](https://img.shields.io/badge/swift-5.9-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

Catfé TV consists of two apps:

1. **CatfeTVApp (tvOS)** - Full-screen digital signage display for Apple TV
2. **CatfeTVAdmin (iOS)** - iPhone admin app for content management

## Features

### tvOS App (Apple TV Display)

- **Full-screen 16:9 digital signage** optimized for TV viewing
- **7 screen types:**
  - Snap & Purr (social media CTA)
  - Events
  - Today at Catfé
  - Membership
  - Reminders
  - Adoption (cat profiles)
  - Thank You
- **Smooth fade transitions** with configurable duration per screen
- **Weather widget and clock overlay** (Santa Clarita, CA location)
- **Siri Remote navigation:**
  - Swipe left/right to manually change screens
  - Play/pause to toggle auto-advance
- **Offline caching** for uninterrupted playback
- **Auto-refresh** content every 60 seconds

### iOS Admin App (iPhone)

- **Screen list** with drag-and-drop reordering
- **Create/edit/delete screens** with:
  - Title, subtitle, body text
  - Image upload
  - QR code URL
  - Duration and priority
  - Active toggle
- **Scheduling:**
  - Date range
  - Days of week
  - Time windows
- **Live 16:9 preview** of how screens will look on TV
- **Settings:**
  - Location name
  - Default duration
  - Snap & Purr frequency
- **GitHub integration** for image storage

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Terracotta | `#C4704F` | Primary accent |
| Cream | `#FDF6E3` | Background |
| Dark Brown | `#3D2914` | Text |

## Project Structure

```
CatfeTV/
├── CatfeTV.xcodeproj/
├── Shared/                    # Shared code between targets
│   ├── Models.swift           # Data models
│   ├── APIClient.swift        # Supabase API client
│   ├── WeatherService.swift   # Weather data service
│   ├── ImageCache.swift       # Image caching
│   ├── Theme.swift            # Colors and typography
│   └── Extensions.swift       # Utility extensions
├── CatfeTVApp/               # tvOS app
│   ├── CatfeTVApp.swift      # App entry point
│   ├── ContentView.swift     # Main view
│   ├── ScreenRotator.swift   # Screen rotation logic
│   ├── ScreenView.swift      # Screen type router
│   ├── WeatherWidget.swift   # Weather overlay
│   ├── Screens/              # Individual screen views
│   │   ├── AdoptionScreenView.swift
│   │   ├── EventsScreenView.swift
│   │   ├── MembershipScreenView.swift
│   │   ├── RemindersScreenView.swift
│   │   ├── SnapPurrScreenView.swift
│   │   ├── TodayScreenView.swift
│   │   └── ThankYouScreenView.swift
│   ├── Assets.xcassets/
│   └── Info.plist
└── CatfeTVAdmin/             # iOS admin app
    ├── CatfeTVAdminApp.swift
    ├── ContentView.swift
    ├── ScreenListView.swift
    ├── ScreenEditorView.swift
    ├── ScheduleView.swift
    ├── PreviewView.swift
    ├── SettingsView.swift
    ├── Assets.xcassets/
    └── Info.plist
```

## Requirements

- **Xcode 15.0+**
- **iOS 17.0+** (iPhone admin app)
- **tvOS 17.0+** (Apple TV display app)
- **Swift 5.9+**

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jnegrete31/catfe-tv.git
   cd catfe-tv/CatfeTV
   ```

2. Open in Xcode:
   ```bash
   open CatfeTV.xcodeproj
   ```

3. Configure signing:
   - Select the project in the navigator
   - Choose your development team for both targets
   - Update bundle identifiers if needed

4. Build and run:
   - Select `CatfeTVApp` scheme for Apple TV
   - Select `CatfeTVAdmin` scheme for iPhone

## Backend Configuration

### Option 1: Supabase (Recommended)

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Create the `screens` table:
   ```sql
   CREATE TABLE screens (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     type TEXT NOT NULL,
     title TEXT NOT NULL,
     subtitle TEXT,
     body_text TEXT,
     image_url TEXT,
     qr_code_url TEXT,
     duration INTEGER DEFAULT 10,
     priority INTEGER DEFAULT 0,
     is_active BOOLEAN DEFAULT true,
     sort_order INTEGER DEFAULT 0,
     schedule JSONB,
     cat_name TEXT,
     cat_age TEXT,
     cat_gender TEXT,
     cat_breed TEXT,
     cat_description TEXT,
     event_date TIMESTAMP,
     event_time TEXT,
     event_location TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. Create the `settings` table:
   ```sql
   CREATE TABLE settings (
     id INTEGER PRIMARY KEY DEFAULT 1,
     location_name TEXT DEFAULT 'Catfé Santa Clarita',
     default_duration INTEGER DEFAULT 10,
     snap_purr_frequency INTEGER DEFAULT 5,
     latitude DOUBLE PRECISION DEFAULT 34.3917,
     longitude DOUBLE PRECISION DEFAULT -118.5426,
     auto_refresh_interval INTEGER DEFAULT 60,
     transition_duration DOUBLE PRECISION DEFAULT 1.0
   );
   
   INSERT INTO settings DEFAULT VALUES;
   ```

4. Update `APIClient.swift` with your Supabase URL and anon key

### Option 2: Local Cache Only

The app works offline using local JSON cache. Sample data is included for testing.

## TestFlight Deployment

### Prepare for Upload

1. Update version and build numbers in both targets
2. Create app icons (1024x1024 for iOS, layered for tvOS)
3. Configure App Store Connect:
   - Create iOS app record
   - Create tvOS app record
   - Add both to the same app group

### Archive and Upload

1. Select "Any iOS Device" or "Any tvOS Device"
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload

### TestFlight Setup

1. Go to App Store Connect
2. Select your app
3. TestFlight tab
4. Add internal/external testers
5. Submit for review (external only)

## Usage

### tvOS Remote Controls

| Action | Result |
|--------|--------|
| Swipe Left | Previous screen |
| Swipe Right | Next screen |
| Play/Pause | Toggle auto-advance |
| Menu | Show controls |

### iOS Admin

1. **Screens Tab**: View, reorder, and manage all screens
2. **Preview Tab**: See live preview with playback controls
3. **Settings Tab**: Configure app behavior

## Weather API

The app uses [Open-Meteo](https://open-meteo.com/) for weather data:
- Free, no API key required
- Automatic location: Santa Clarita, CA (34.3917, -118.5426)
- Updates every 10 minutes

## Image Storage

Images are stored in the GitHub repository:
- Path: `assets/catfe-tv/YYYY/MM/filename.jpg`
- Raw URL: `https://raw.githubusercontent.com/jnegrete31/catfe-tv/main/assets/...`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open a GitHub issue or contact Catfé Santa Clarita.

---

Made with ❤️ for Catfé Santa Clarita
