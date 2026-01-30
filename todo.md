# Catfé TV - Project TODO

## Database & Schema
- [x] Create screens table with all metadata fields (type, title, subtitle, body, image_path, qr_url, scheduling fields, priority, duration, is_active)
- [x] Create settings table for global configuration
- [x] Create time_slots table for playlist scheduling
- [x] Push database migrations

## TV Display App
- [x] Full-screen 16:9 display layout (1080p/4K friendly)
- [x] Fetch active screens from database
- [x] Scheduling logic (start/end dates, days of week, time windows)
- [x] Playlist builder with priority weighting
- [x] SNAP_AND_PURR screen type appears every N screens
- [x] Image preloading for smooth transitions
- [x] Fade transitions between screens
- [x] Auto-refresh content every 60 seconds
- [x] Offline caching (cache last playlist + images)
- [x] Real-time content updates via polling/websocket
- [x] Screen type renderers (SNAP_AND_PURR, EVENT, TODAY_AT_CATFE, MEMBERSHIP, REMINDER, ADOPTION, THANK_YOU)
- [x] QR code display on light background
- [x] Big readable typography

## Phone Admin App (iOS-optimized)
- [x] Authentication with Manus OAuth
- [x] Mobile-responsive design optimized for iOS
- [x] Screen list view with active/inactive status
- [x] Create new screen form
- [x] Edit existing screen
- [x] Delete screen (with protection for core SNAP_AND_PURR)
- [x] Screen type selector
- [x] Title/subtitle/body input with character limits
- [x] QR URL input with validation
- [x] Duration and priority controls
- [x] Active toggle
- [x] Scheduling UI (date range picker)
- [x] Days of week selector
- [x] Time window picker
- [x] Image selection from camera roll
- [x] GitHub image upload workflow
- [x] 16:9 preview of how screen will look on TV
- [x] Test playlist preview mode
- [x] Drag-and-drop playlist reordering

## GitHub Integration
- [x] GitHub API integration for image upload
- [x] Store images at /assets/catfe-tv/YYYY/MM/filename.jpg
- [x] GitHub token configuration via secrets
- [x] Construct raw URLs from repo + path

## Settings & Configuration
- [x] Location name setting
- [x] Default duration setting
- [x] Fallback mode setting
- [x] Brand colors configuration
- [x] SNAP_AND_PURR frequency setting

## Seed Data
- [x] Default SNAP_AND_PURR screen
- [x] Example event screens
- [x] Example time slot configurations

## TV Display Enhancements
- [x] Add live clock display in corner of TV screen
- [x] Add weather widget showing current conditions
- [x] Weather data for Santa Clarita, CA location
- [x] Auto-refresh weather data periodically
- [x] Overlay visible on all screen types

## Apple Device Support
- [x] Add PWA manifest.json for home screen installation
- [x] Add service worker for offline support
- [x] Add Apple-specific meta tags (apple-mobile-web-app-capable, status-bar-style)
- [x] Create app icons for iOS (180x180, 152x152, 120x120)
- [x] Create Apple TV icon (400x240 for top shelf, 1280x768 for app icon)
- [x] Add iOS splash screens for various device sizes
- [x] Optimize TV display for Apple TV remote (focus states, keyboard navigation)
- [x] Add touch-friendly controls for iPhone admin app
- [x] Test standalone mode on iOS Safari

## Native Apple Apps (TestFlight)
- [x] Create tvOS app project structure for Apple TV
- [x] Build TV display UI with SwiftUI for tvOS
- [x] Implement Siri Remote navigation with focus states
- [x] Create iOS app project structure for iPhone
- [x] Build admin dashboard UI with SwiftUI for iOS
- [x] Create shared API client for backend communication
- [x] Add image caching and offline support
- [x] Create Xcode projects for both targets
- [x] Write TestFlight deployment documentation

## Bug Fixes
- [x] Fix: Editing a screen removes existing image - should preserve image when not uploading new one

## App Store Publishing
- [ ] Configure native apps for Manus App Store publishing
- [ ] Set up proper Xcode project structure
- [ ] Add required app metadata and configurations
- [ ] Test publishing workflow

## React Native/Expo Mobile App
- [x] Set up Expo project structure
- [x] Create app.json with iOS and tvOS configurations
- [x] Build TV display screen for tvOS
- [x] Build admin screens for iOS
- [x] Configure API client to connect to existing backend
- [ ] Test mobile app builds
- [ ] Verify App Store publishing option appears

- [x] Fix: Event slides text is white and hard to read - change to dark text color
- [x] Fix: End time shows "invalid value" error when setting end time
- [x] Add: Option to upload PNG images without dark overlay (transparent background support)

## Native tvOS App (Apple TV Viewer)
- [x] Create tvOS Swift project structure
- [x] Build API client to connect to https://catfetv-amdmxcoq.manus.space
- [x] Create TV display UI with SwiftUI
- [x] Implement Siri Remote navigation (swipe, click, play/pause)
- [x] Add weather and clock overlay
- [x] Add offline caching for reliable playback
- [x] Create Xcode project files
- [x] Write TestFlight deployment documentation

- [x] Fix: tvOS app shows "Offline" and doesn't display content - fixed tRPC response parsing (nested json property)

- [x] Fix: tvOS app event screen text not appearing when there's an image - added gradient overlay and text shadows

- [x] Create tvOS App Icon (multiple layers: back, middle, front for parallax effect)
- [x] Create Top Shelf image (wide banner for tvOS home screen)
- [x] Create Top Shelf image wide (2320x720)
- [x] Set up complete asset catalog structure with all required sizes

- [x] Fix: tvOS app UI and fonts don't match web version - updated colors, fonts, and layout to match web exactly

- [x] Fix: tvOS app icon asset catalog errors - restructured brandassets with proper 2-layer image stacks

- [x] Fix: tvOS App Icon missing @2x scale images for background layer
