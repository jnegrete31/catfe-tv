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

- [x] Fix: Apple TV wallpaper/screensaver keeps appearing - added isIdleTimerDisabled and keep-alive timer

## Adoption Showcase Feature
- [x] Add ADOPTION_SHOWCASE screen type to database schema
- [x] Create backend logic to fetch 4 random adoption screens
- [x] Create web TV display renderer with 4-cat grid layout
- [x] Update tvOS app with matching ADOPTION_SHOWCASE screen type
- [x] Test the new screen type on both web and tvOS

- [x] Fix: TVDisplayView Preview missing adoptionCats parameter causing Xcode build error
- [x] Create Adoption Showcase screen in admin dashboard to test 4-cat grid

## Adopted Badge Feature
- [x] Add isAdopted field to screens database schema
- [x] Update backend routers to handle isAdopted field
- [x] Add Adopted toggle to admin screen editor (for Adoption type screens)
- [x] Update TV display to show "Adopted!" badge on adopted cats
- [x] Update tvOS app to display Adopted badge
- [x] Test adopted badge on web and tvOS

## Bug Fixes - Jan 30
- [x] Fix: Event screen text missing/not visible
- [x] Fix: Adoption grid cat pictures cut off - should be square instead of rectangles

## Recently Adopted Banner Feature
- [x] Create RecentlyAdoptedBanner component for TV display
- [x] Add backend query to fetch recently adopted cats
- [x] Integrate banner into TV display screens (shows on applicable screens)
- [x] Update tvOS app with Recently Adopted banner
- [x] Test banner on web and tvOS

## Bug Fix - Jan 30 (tvOS)
- [x] Fix: RecentlyAdoptedBanner.swift not included in Xcode project
- [x] Fix: Corrupted project.pbxproj file causing Xcode to fail opening project

## Feature - Apple Photo Format Support
- [x] Add HEIC/HEIF file format support to admin image upload
- [x] Update file picker to open Photos library on Mac instead of all files
- [x] Add drag-and-drop image upload support
- [x] Update upload UI with instructions for Mac Photos access

## Feature - iOS PWA Enhancement
- [x] Add PWA manifest for Add to Home Screen support
- [x] Add iOS-specific meta tags (apple-touch-icon, status bar style)
- [x] Create app icons for iOS home screen
- [x] Optimize mobile touch interactions and layout (iOS install prompt)
- [x] Add iOS Photos picker integration for image upload

## Bug Fix - Mobile Image Upload
- [x] Fix: Mobile image upload opens camera instead of photo library

## Bug Fix - tvOS Adoption Showcase
- [x] Fix: tvOS Adoption Showcase showing "Coming Soon" placeholders instead of actual cat photos (API input format)

## Feature - Adoption Success Counter
- [x] Add backend API to count adopted cats this month
- [x] Update web Adoption Showcase to display "X cats adopted and counting!"
- [x] Update tvOS Adoption Showcase to display the counter

## Feature - Full-Screen Adoption Counter
- [x] Add total adoption count setting to database
- [x] Add manual input field in admin settings for total adoptions
- [x] Create ADOPTION_COUNTER screen type for full-screen display
- [x] Update web TV display with celebratory counter screen
- [x] Update tvOS app with full-screen counter

## Bug Fix - tvOS Time/Weather Display
- [x] Fix time and weather overlay getting cut off or disappearing on tvOS

## Feature - Adoption Counter Animation & Logo Display
- [x] Add counting animation to adoption counter (count up from 0)
- [x] Add logo display to TV screen layouts
- [x] Fix Recently Adopted banner size and visibility (responsive to screen size)
- [x] Update tvOS app with counting animation
- [x] Update tvOS app with logo display
- [x] Update tvOS app with improved Recently Adopted banner

## Feature - Custom Logo Upload
- [x] Add logoUrl field to settings database schema
- [x] Update backend API to handle logo URL in settings
- [x] Add logo upload UI to admin settings page
- [x] Update TV display to show custom logo from settings
- [x] Update tvOS app to fetch and display custom logo

## Feature - AirPlay Icon on Browser TV View
- [x] Add AirPlay icon button to TV display overlay
- [x] Implement AirPlay instructions modal without disrupting slideshow
- [x] Position icon appropriately (non-intrusive)

## Bug Fix - Disable Recently Adopted Banner
- [x] Disable Recently Adopted banner on web TV display (wonky behavior)
- [x] Disable Recently Adopted banner on tvOS app

## Feature - LIVESTREAM Screen Type
- [ ] Add LIVESTREAM to screen type enum in database schema
- [ ] Add livestreamUrl field to screens table
- [ ] Update screen form to show livestream URL input for LIVESTREAM type
- [ ] Add LIVESTREAM screen renderer for web TV display
- [ ] Update tvOS app to handle LIVESTREAM screen type

## Feature - Expand Adoption Showcase Grid to 8 Cats
- [x] Update web Adoption Showcase screen to show 8 cat profiles (4x2 grid)
- [x] Update tvOS Adoption Showcase to show 8 cat profiles (4x2 grid)
- [x] Adjust layout and sizing for 8-cat grid

## Feature - Guest Session Tracking
- [x] Add guestSessions table to database schema (guest name, party size, duration, status, check-in/expiry times)
- [x] Create backend API for guest session CRUD operations (check-in, check-out, extend, get active)
- [x] Add Guests tab to admin dashboard
- [x] Create GuestCheckIn component with check-in dialog (name, party size, 15/30/60 min duration)
- [x] Display active sessions with countdown timer
- [x] Add extend session buttons (+15 min, +30 min)
- [x] Add check-out functionality
- [x] Display today's guest statistics (total guests, active sessions, completed sessions)
- [x] Create GuestReminderOverlay component for TV display
- [x] Show 5-minute warning reminder on TV when guest session is expiring
- [x] Auto-dismiss reminders after 30 seconds

## Bug Fix - Adoption Grid Size
- [x] Fix: Adoption cat grid cards are too small and hard to see on TV display
- [x] Make cat photos larger and more prominent (changed from 4x2 grid to 2x2 grid)
- [x] Improve readability from a distance (larger text, bigger cards)

## Bug Fix - Adoption Grid Still Small (Follow-up)
- [ ] Verify adoption showcase grid changes are in the code
- [ ] Ensure changes are deployed to published site
- [ ] Test on actual TV display

## Feature - tvOS Adoption Showcase Grid
- [x] Add adoptionShowcase screen type to Models.swift
- [x] Create AdoptionShowcaseScreenView.swift with 2x2 grid layout
- [x] Update ScreenView.swift to route to new view
- [x] Push changes to GitHub repository

## Feature - tvOS Guest Session Reminder
- [ ] Add GuestSession model to tvOS app
- [ ] Add API client method to fetch active guest sessions
- [ ] Create GuestReminderOverlay view showing 5-min warnings
- [ ] Integrate overlay into ContentView
- [ ] Create updated zip file

## Bug Fix - Web App Guest Reminder Not Showing
- [ ] Check GuestReminderOverlay component
- [ ] Verify TVDisplay integration
- [ ] Fix reminder display logic

## Feature - Image Editing & Live Preview
- [x] Add image cropping tool when uploading/editing screen images
- [x] Add image preview showing how it will appear on TV
- [x] Add live TV preview panel when editing screens
- [x] Preview should update in real-time as user makes changes

## Bug Fix - Guest Timer Reminder Not Showing (Priority Fix)
- [x] Analyze GuestReminderOverlay component logic
- [x] Check TVDisplay integration and API calls
- [x] Fix reminder display to show 5-minute warning (now shows ALL sessions within 5 min)
- [x] Test with a short guest session (verified working with live countdown)

## Feature - tvOS Guest Session Reminder (Apple TV)
- [x] Add GuestSession model to tvOS APIClient.swift (already existed)
- [x] Add fetchGuestSessions API method (already existed)
- [x] Create GuestReminderOverlay.swift SwiftUI view
- [x] Integrate overlay into ContentView with 5-second polling
- [x] Create updated tvOS zip file

## Feature - Scheduled Time-Based Reminders
- [x] Add automatic reminder at :55 for Full Purr (60 min) sessions
- [x] Add automatic reminder at :25 for Mini Meow (30 min) sessions  
- [x] Show scheduled reminders on web TV display (purple cards)
- [x] Show scheduled reminders on tvOS Apple TV app (purple cards)
- [x] Keep existing individual guest session reminders working alongside (orange/red cards)

## Bug Fix - tvOS Guest Timer Not Showing
- [x] Check APIClient guest session fetching (found field name mismatch)
- [x] Fixed GuestSession model to match actual API response fields
- [x] Updated GuestReminderCard to use correct date parsing

## Bug Fix - tvOS Scheduled Reminders Not Showing
- [x] Fix Mini Meow and Full Purr scheduled reminders (verified logic is correct - shows at :25-:29 and :55-:59)
- [x] Remove ":25 reminder" / ":55 reminder" text from scheduled reminder cards

## Bug Fix - tvOS Reminders Still Not Showing (Deep Debug)
- [x] Review GuestReminderOverlay view hierarchy and positioning
- [x] Fixed: Timer wasn't running when hasReminders was false (chicken-and-egg problem)
- [x] Changed view to always render container so timer keeps running
- [x] Added onAppear to force initial time update

## Feature - Customer Photo Upload System

### Happy Tails (Adopted Cats in New Homes)
- [x] Create photoSubmissions database table
- [x] Build mobile upload form page (/upload/happy-tails)
- [x] Add moderation queue in admin panel
- [x] Create Happy Tails TV slideshow screen
- [x] Generate QR code for upload page

### Snap & Purr (In-Lounge Photos)
- [x] Build mobile upload form page (/upload/snap-purr)
- [x] Add to moderation queue
- [x] Create Snap & Purr photo slideshow screen
- [x] Update existing Snap & Purr screen with QR code

### Admin Features
- [x] Photo moderation queue with approve/reject buttons
- [x] Preview photos before approval
- [x] Delete inappropriate submissions

### tvOS App Updates
- [x] Add Happy Tails slideshow view
- [x] Add Snap & Purr photo slideshow view

## Feature - QR Code Upload Screens
- [x] Add HAPPY_TAILS_QR and SNAP_PURR_QR screen types to database schema
- [x] Update routers with new screen types
- [x] Create TV display renderers showing large QR codes with instructions
- [x] Update tvOS app with QR code screen views
- [x] QR codes link to /upload/happy-tails and /upload/snap-purr

## Bug Fix - tvOS QR View Xcode Errors
- [ ] Fix APIClient.shared reference (doesn't exist)
- [ ] Fix LogoView reference (doesn't exist)
- [ ] Fix Date to String type conversion errors
- [ ] Remove extra livestreamUrl argument

## Feature - QR Codes on Gallery Screens
- [x] Add QR code to Happy Tails gallery slideshow (web)
- [x] Add QR code to Snap & Purr gallery slideshow (web)
- [x] Add QR code to Happy Tails gallery slideshow (tvOS)
- [x] Add QR code to Snap & Purr gallery slideshow (tvOS)

## Feature - Audio Chime for Guest Reminders
- [x] Add audio file for chime sound
- [x] Implement audio playback when guest reminder appears
- [x] Add settings option to enable/disable audio chime (mute button on overlay)

## Feature - Email Notifications for Photo Submissions
- [x] Create email notification when new photo is submitted
- [x] Send email to admin/owner with photo details
- [x] Include link to moderation dashboard

## Feature - Session History Report
- [x] Create database schema for tracking guest sessions (already exists)
- [x] Build session history page with analytics
- [x] Show popular time slots and visit statistics

## Feature - Wix Bookings Integration
- [x] Add Wix API key and Site ID secrets
- [x] Create Wix API client for fetching bookings
- [x] Build sync endpoint to import bookings as guest sessions
- [x] Add admin UI for Wix sync settings
- [x] Create manual sync button in admin dashboard
- [x] Map Wix booking fields to guest session fields

## Feature - Auto Wix Booking Sync
- [x] Create background sync job with 15-minute interval
- [x] Add sync status tracking and last sync timestamp to settings
- [x] Update admin UI to show auto-sync status and toggle
- [x] Log sync results for debugging

## Fix - Wix OAuth2 Authentication
- [x] Update Wix API client to use OAuth2 anonymous token flow
- [x] Replace WIX_API_KEY with WIX_CLIENT_ID
- [x] Add token caching to avoid requesting new token on every API call

## Feature - Personalized Welcome Screen
- [x] Create welcome screen component for TV display
- [x] Add API endpoint to fetch upcoming Wix bookings (within 15 minutes)
- [x] Display guest name with welcoming message
- [x] Integrate into TV display rotation
- [ ] Add settings to configure welcome time window

## Feature - Enhanced Photo Upload Success Page
- [x] Add "Watch Live Slideshow" button on success page
- [x] Add "Upload Another Photo" button on success page
- [x] Create mobile-friendly live slideshow view page
- [x] Show approved photos from the same gallery type (Happy Tails or Snap & Purr)

## Feature - Cat-Themed Photo Frames
- [x] Create cat-themed frame overlay images (paw prints, cat ears, whiskers, etc.)
- [x] Build photo frame selector component with preview
- [x] Integrate frame selector into Happy Tails upload page
- [x] Integrate frame selector into Snap & Purr upload page
- [x] Composite selected frame onto photo before submission

## Feature - Admin Caption Management
- [x] Add suggestedCaptions table to database schema
- [x] Create CRUD API endpoints for captions
- [x] Build admin UI for managing captions (add/edit/delete)
- [x] Update upload pages to fetch captions from database
- [x] Seed default captions on first run (via admin button)

## Bug Fix - Frame Selection and Name Label
- [x] Fix frame selection resetting name field (added type="button" to prevent form submission)
- [x] Change "Your Name" label to "First Name" for privacy

## Feature - Anonymous Photo Uploads
- [x] Add "Upload Anonymously" checkbox to Snap & Purr page
- [x] Add "Upload Anonymously" checkbox to Happy Tails page
- [x] When anonymous, submit with name "A Catfé Guest"
- [x] Make First Name field optional when anonymous is checked

## Feature - Featured Photos
- [x] Add isFeatured field to photos table in database
- [x] Create API endpoint to toggle featured status
- [x] Add featured toggle button in photo moderation UI
- [x] Display featured badge on TV slideshow
- [x] Show featured photos more prominently (star badge on photo)

## Feature - Portrait Photo Background Styles
- [x] Add backgroundStyle field to photoSubmissions table (blur/gradient)
- [x] Create background style selector component with preview
- [x] Integrate selector into Happy Tails upload page
- [x] Integrate selector into Snap & Purr upload page
- [x] Update TV display to render blur background for portrait photos
- [x] Update TV display to render gradient background for portrait photos

## Feature - Landscape Photo Detection
- [x] Detect photo orientation when file is selected
- [x] Only show BackgroundStyleSelector for portrait photos
- [x] Update both Happy Tails and Snap & Purr upload pages

## Feature - Photo Cropping Tool
- [x] Install react-image-crop library
- [x] Create PhotoCropper component with zoom/crop controls
- [x] Integrate into Happy Tails upload page
- [x] Integrate into Snap & Purr upload page

## Feature - Cat Adoption Polls
- [x] Create database schema for polls and votes
- [x] Build API endpoints for polls, voting, and results
- [x] Create admin UI for managing polls (add/edit/delete questions)
- [x] Build TV poll display screen with QR code for voting
- [x] Create mobile voting page for guests
- [x] Add poll results screen with countdown timer
- [x] Show polls at x:00 and x:30, results at x:25-x:30 and x:55-x:00
- [x] Display results at x:25 and x:55 with countdown
- [x] Allow guests to vote via QR code on their phones
- [x] Fix double-encoded JSON options parsing in frontend and backend
- [x] Feature adoptable cats from adoption slides in polls

## Feature - Pre-made Poll Questions with Dynamic Cat Selection
- [x] Create 12-15 fun poll question templates (e.g., "Who has the fluffiest tail?")
- [x] Update poll schema to support dynamic cat selection from adoption slides
- [x] Build API to randomly select 2-4 cats from active adoption screens for each poll
- [x] Implement poll shuffling so each 30-minute session gets a different question
- [x] Seed database with pre-made poll questions
- [x] Test poll rotation with real adoption cats

## Feature - Poll Slide in TV Rotation
- [x] Create poll slide component that shows current poll with QR code
- [x] Add poll slide to TV display rotation (only during poll window x:00-x:25)
- [x] Ensure only 1 poll shows per 30-minute session
- [x] Test poll slide integration with other screens
- [x] Auto-reset votes when new 30-minute poll session starts

## Bug Fixes - Poll System
- [x] Fix poll to stay consistent throughout entire 30-minute session (not change with each slide)
- [x] Fix mobile voting page to always show 4 cat options with photos
- [x] Ensure QR code links to the correct poll with all options visible

## Feature - Poll UI Redesign
- [x] Hide vote count/results on mobile voting page (guests wait for TV reveal)
- [x] Create poll widget overlay for top-left corner of TV display
- [x] Show current poll question, QR code, and countdown to results
- [x] Create results widget overlay for top-right corner during results time (x:10-x:14, x:25-x:29, x:40-x:44, x:55-x:59)
- [x] Remove full-screen poll slide from rotation (poll is now always visible as widget)
- [x] Test new poll overlay system
- [x] Change poll timing from 30-minute to 15-minute intervals (4 polls per hour)

## Poll Timing Adjustment
- [x] Change voting time to 12 minutes (x:00-x:12, x:15-x:27, x:30-x:42, x:45-x:57)
- [x] Change results time to 3 minutes (x:12-x:14, x:27-x:29, x:42-x:44, x:57-x:59)
- [x] Move results widget to top-left corner (same position as poll widget)

## Xcode/tvOS App Updates
- [x] Add Poll models to Models.swift
- [x] Create PollWidget view for tvOS
- [x] Create PollResultsWidget view for tvOS
- [x] Push changes to GitHub repository

## Feature - Photo Border Styles
- [ ] Add borderStyle column to photoSubmissions table
- [ ] Update Snap & Purr gallery to use rounded corners as default
- [ ] Support multiple border styles: rounded, polaroid, film, none

## Bug Fix - Snap & Purr Gallery Images Not Showing
- [x] Investigated why photos show "Visitor photo" placeholder with broken image
- [x] Root cause: 3 recent photo uploads had corrupted data (only 3 bytes stored instead of actual image)
- [x] Fixed PhotoCropper to limit output size to 2048x2048 max to prevent canvas size issues
- [x] Added server-side validation for photo uploads (min 1KB, max 10MB)
- [x] Added better error handling and logging for S3 uploads
- [x] Removed 3 corrupted photo records from database

## Bug Fix - tvOS Real-Time Voting Results
- [x] Investigated tvOS poll refresh mechanism
- [x] Root cause: PollService.fetchCurrentPoll() was only called once on view load, not refreshed
- [x] Fixed PollWidget to refresh poll data every 5 seconds during voting time
- [x] Fixed PollResultsWidget to refresh when entering results time
- [x] Pushed changes to GitHub repository (catfe-tv)

## Feature - Simplify tvOS Poll to QR Code Only
- [x] Update tvOS PollWidget to show only QR code (no vote counts or results)
- [x] Remove PollResultsWidget from tvOS app
- [x] Ensure web voting page shows results after guest votes (live updates every 5 seconds)
- [x] Package updated Xcode project

## tvOS App Updates - Feb 2, 2026
- [x] Remove arrow controls overlay from tvOS app
- [x] Remove transition animation when changing slides
- [x] Add POLL_QR screen type to database schema
- [x] Add Poll model and fetchCurrentPoll to APIClient.swift
- [x] Create PollQRView.swift for displaying poll QR code on TV
- [x] Update TVDisplayView to handle POLL_QR screen type
- [x] Package updated Xcode project

## Feature - Snap & Purr Gallery Redesign
- [x] Redesigned web gallery to show 6 photos in 3x2 collage layout with pagination
- [x] Added animated transitions between pages (10 second intervals)
- [x] Updated tvOS SnapPurrGalleryView with matching 3x2 collage design
- [x] Added photo count and page indicators
- [x] Shows featured badge on featured photos
- [x] Empty slots show "Your photo here!" placeholder

## Bug Fix - Poll QR Code Not Showing on tvOS
- [x] Fixed Poll model to match actual API response (pollType, catCount, options instead of optionA/optionB)
- [x] Updated PollQRView to work with new Poll model structure
- [x] Poll QR screen now shows question and QR code for voting on phone

## Bug Fix - Snap & Purr Gallery Layout (Feb 2)
- [x] Changed gallery from 6 photos to 3 photos at a time
- [x] Added shuffle effect when transitioning between photo sets (every 8 seconds)
- [x] Updated both web and tvOS apps with matching design

## Bug Fix - Poll QR Code Still Not Appearing on tvOS (Feb 2)
- [x] Created PollOverlayWidget as an overlay (like weather widget)
- [x] Poll QR now appears automatically in top-left corner when there's an active poll
- [x] No need to create a POLL_QR screen - it's an overlay on all screens
- [x] Added PollOverlayWidget.swift to tvOS project

## tvOS Final Fixes - Feb 2 (Fresh Start from Working Version)
- [x] Started fresh from working tvOS version (CatfeTV-tvOS-gallery-qr.zip)
- [x] Updated SnapPurrGalleryView to show 3 photos at a time with shuffle every 8 seconds
- [x] Added Poll model to APIClient with fetchCurrentPoll() method
- [x] Created PollOverlayWidget.swift as overlay (like weather widget)
- [x] Poll QR appears automatically in top-left corner when there's an active poll
- [x] Poll data refreshes every 30 seconds
- [x] Added PollOverlayWidget to Xcode project build files

## Bug Fix - tvOS Navigation Controls and Poll Overlay Position (Feb 2)
- [x] Remove navigation controls (back, pause, forward buttons) from tvOS
- [x] Remove black gradient behind navigation controls (ControlsOverlay removed entirely)
- [x] Fix poll overlay to stay in consistent position (fixed padding in ContentView)

## Bug Fix - Restore Remote Navigation Without Visual Controls (Feb 2)
- [x] Restore swipe left/right on remote to change slides
- [x] Keep visual controls (buttons, gradient) hidden

## Feature - tvOS App Should Display Web App Directly (Feb 2)
- [x] Created new simplified tvOS app using WKWebView
- [x] App now loads https://catfetv-amdmxcoq.manus.space/tv directly
- [x] Everything looks exactly like the web app (same screens, QR codes, layouts)
- [x] No more maintaining separate native Swift screens
- [x] Any changes in admin appear instantly on TV

## Bug Fix - tvOS WebView App Errors (Feb 2)
- [ ] Fix WebKit import error - tvOS doesn't support WebKit the same way as iOS
- [ ] Fix asset catalog errors (AccentColor, App Icon)
- [ ] Use TVUIKit or alternative approach for web content on tvOS


## Feature - Photo Captions for Snap & Purr
- [x] Add caption field to photos database table
- [x] Update upload API to accept and store captions
- [x] Add caption input field to upload page UI
- [x] Display captions on TV gallery view
- [x] Increase caption text size for TV visibility
- [x] Test caption feature end-to-end

## Feature - Waiver QR Code Widget
- [x] Add waiverUrl field to settings database schema
- [x] Update settings API to handle waiver URL
- [x] Add waiver URL input to admin settings page
- [x] Create WaiverWidget component for TV display
- [x] Position widget in bottom-right corner of TV screen
- [x] Test waiver QR code feature

## Feature - Check-in Screen for New Guests
- [x] Add wifiName and wifiPassword fields to settings schema
- [x] Add houseRules field to settings schema (array of rules)
- [x] Update settings API to handle WiFi and house rules
- [x] Add WiFi and house rules inputs to admin settings page
- [x] Add CHECK_IN to screen type enum in schema
- [x] Create CheckInScreen component for TV display
- [x] Display waiver QR, WiFi details, and house rules
- [x] Test check-in screen feature

## Bug Fix - Remove Count-up Animation
- [x] Remove count-up animation from adoption counter screen

## Bug Fix - Playlist Stops After One Cycle
- [x] Remove duplicate auto-advance timer in usePlaylist.ts (TVDisplay handles it with pause support)
- [x] Fix auto-advance timer dependencies to properly restart on loop
- [x] Stabilize playlist - only rebuild when screens actually change
- [x] Increase duration for adoption counter and check-in screens (20s and 30s defaults)
- [ ] Test on Mac app

## Bug Fix - Adoption Grid Photos
- [x] Fix photos not displaying - now fetches all adoption cats upfront and caches
- [x] Add 6-second shuffle animation for cat photos in grid with fade effect
- [x] Test on TV display - photos now showing correctly with shuffle

## Feature - Simplify Poll Widget
- [x] Update PollWidget to only show QR code for voting (no results on TV)
- [x] Results will be shown on guests' devices after voting ends
- [x] Remove poll results display from TV overlay

## Feature - Logo Widget Overlay
- [x] Create LogoWidget as an overlay component (bottom-left corner)
- [x] Remove logo from individual screen layouts
- [x] Add LogoWidget to TVDisplay

## Bug Fix - Snap & Purr Gallery QR Code
- [x] Made QR code larger and more prominent on Snap & Purr Gallery slide

## Bug Fix - Remove Duplicate Logos
- [x] Remove logos from individual screen components (keep only LogoWidget overlay)

## Feature - Playlist Management System
- [x] Create playlists database table (id, name, description, isActive)
- [x] Create playlist_screens junction table to link screens to playlists
- [x] Add API endpoints for playlist CRUD operations
- [x] Build admin UI for creating/editing playlists
- [x] Add playlist selector in admin to choose active playlist
- [x] Update TV display to filter screens by active playlist
- [x] Add default playlists: Lounge, Events, Volunteer Orientation (via seed button)

## Feature - UI Improvements
- [x] Remove AirPlay references from codebase
- [x] Make Active toggle work directly on screen cards (no edit form needed) - already implemented, added toast feedback

## Bug Fix - Admin Screens Not Updating Instantly
- [x] Fixed ScreenList useState to useEffect for syncing items with screens prop
- [x] Set staleTime: 0 on screens query in Admin.tsx for fresh data
- [x] Set staleTime: 0 on playlists and screens queries in PlaylistManager
- [x] Cache invalidation already in place, now data refreshes immediately

## Feature - Responsive TV Display
- [x] Update text sizes to use viewport-relative units (vw/vh)
- [x] Update QR code sizes to scale with screen size
- [x] Update widget overlays to scale with screen size (PollWidget, LogoWidget, WeatherClockOverlay)
- [x] Update GuestReminderOverlay to use responsive styles
- [x] Move waiver QR widget to top-left (where poll widget was)
- [x] Disable poll widget for now
- [ ] Test on different screen sizes

## UI Updates - Guest Reminder and Waiver Widget
- [x] Combine Full Purr and Mini Meow into single message at x:55
- [x] Make waiver widget vertical and smaller

## Bug Fix - Guest Time Extension
- [x] Fixed: getActiveGuestSessions now includes both "active" and "extended" status sessions
- [x] Extended sessions no longer disappear from the active list

## Cleanup - Remove Wix Integration
- [ ] Remove Wix sync code from server
- [ ] Remove Wix-related API endpoints
- [ ] Remove Wix environment variables references

## Cleanup - Remove Reports
- [ ] Remove Reports tab from admin
- [ ] Remove reports-related API endpoints
- [ ] Remove reports components

## Feature - Snap & Purr Gallery Update
- [x] Gallery already shows 3 photos at a time
- [x] Updated shuffle animation to 6 seconds (was 8 seconds)
- [x] Photo captions already display below each photo

## Feature - Snap & Purr Gallery Redesign
- [x] Create fresh, visually appealing layout - dark elegant background
- [x] Polaroid-style photo frames with slight rotation angles
- [x] Better typography - elegant serif headers with colored accents
- [x] Animated transitions - spring animations with staggered delays
- [x] Keep 3 photos with 6-second shuffle

## Feature - Adoption Showcase Redesign
- [x] Apply dark elegant background from Snap & Purr
- [x] Add polaroid-style frames with rotation angles
- [x] Update typography to match elegant serif style
- [x] Add spring animations with staggered delays
- [x] Keep 4 cats with 6-second shuffle

## Feature - Adoption Counter Redesign
- [x] Apply dark elegant background matching other screens
- [x] Update typography to elegant serif style with gradient number
- [x] Add subtle animated background elements (circles, light rays)
- [x] Keep celebration confetti elements with smooth floating animations

## Feature - Adoption Counter Polaroid Frames
- [ ] Add polaroid-style cat photo frames around the counter number
- [ ] Match frame sizing and rotation angles from Adoption Showcase grid

## Feature - Match Adoption Showcase Polaroid Size to Snap & Purr
- [x] Update Adoption Showcase polaroid frame sizes to match Snap & Purr gallery
- [x] Ensure consistent visual appearance across both screens

## Feature - Apply Dark Elegant Design to All Screens
- [ ] SNAP_AND_PURR (Photo sharing prompt) - Apply dark elegant design
- [ ] EVENT (Special events) - Apply dark elegant design
- [ ] TODAY_AT_CATFE (Daily specials) - Apply dark elegant design
- [ ] MEMBERSHIP (Membership promotion) - Apply dark elegant design
- [ ] REMINDER (General reminders) - Apply dark elegant design
- [ ] ADOPTION (Single cat adoption) - Apply dark elegant design
- [ ] THANK_YOU (Appreciation messages) - Apply dark elegant design
- [ ] HAPPY_TAILS (Adopted cats slideshow) - Apply dark elegant design
- [ ] HAPPY_TAILS_QR (Upload QR screen) - Apply dark elegant design
- [ ] SNAP_PURR_QR (Upload QR screen) - Apply dark elegant design
- [ ] LIVESTREAM (Live video stream) - Apply dark elegant design
- [ ] CHECK_IN (Guest check-in) - Apply dark elegant design

## Feature - Dark Elegant Theme for All Screens
- [x] Redesign SNAP_AND_PURR screen with dark elegant theme
- [x] Redesign EVENT screen with dark elegant theme
- [x] Redesign TODAY_AT_CATFE screen with dark elegant theme
- [x] Redesign MEMBERSHIP screen with dark elegant theme
- [x] Redesign REMINDER screen with dark elegant theme
- [x] Redesign ADOPTION screen with dark elegant theme and polaroid photo
- [x] Redesign THANK_YOU screen with dark elegant theme
- [x] Redesign HAPPY_TAILS screen with dark elegant theme and polaroid photos
- [x] Redesign HAPPY_TAILS_QR screen with dark elegant theme
- [x] Redesign SNAP_PURR_QR screen with dark elegant theme
- [x] Redesign LIVESTREAM screen with dark elegant theme
- [x] Redesign CHECK_IN screen with dark elegant theme
- [x] Update SNAP_PURR_GALLERY empty state with dark elegant theme

## Feature - Enhanced Adoption Screen
- [x] Add larger polaroid with more prominent cat photo
- [x] Add personality traits/tags display
- [x] Add decorative elements (paw prints, hearts, sparkles)
- [x] Improve layout to fill more screen space
- [x] Add warm, inviting messaging

## Bug Fix - Text Readability on TV
- [x] Increase Adoption screen text size (name, age, description)
- [x] Change Adoption Showcase grid to single row layout
- [x] Increase Event screen text size

- [x] Fix Event photos not appearing on slides


## Feature - Visual Slide Editor (Wix-style)
- [ ] Create slideTemplates database table for storing customizations
- [ ] Add tRPC endpoints for saving/loading template settings
- [ ] Build visual editor page with TV-sized canvas
- [ ] Implement drag-and-drop for elements (text, photos, QR codes)
- [ ] Add resize handles for photos and text boxes
- [ ] Add font size sliders and controls
- [ ] Add position controls (X/Y coordinates)
- [ ] Implement live preview on canvas
- [ ] Save template customizations per screen type
- [ ] Apply saved templates to TV display renderer
- [ ] Update Apple TV app to use template settings


## Feature - Visual Slide Editor (Wix-style)
- [x] Database schema for storing template customizations (slideTemplates table)
- [x] tRPC endpoints for saving/loading templates
- [x] Visual editor UI with drag-and-drop canvas
- [x] Element controls (resize, move, delete)
- [x] Property panel for font size, colors, etc.
- [x] Live preview on 16:9 canvas
- [x] Integrate templates into TV display renderer (TemplateRenderer component)
- [x] Add "Editor" button to admin dashboard header
- [x] Unit tests for template CRUD operations

## Bug Fix - Slide Editor Visibility
- [x] Ensure Editor button is visible in admin dashboard header
- [x] Verify font size increase/decrease controls are working

## Bug Fix - Slide Editor Properties Panel
- [x] Fix properties panel disappearing after dragging an element

## Feature - Custom Slide Creation
- [x] Add "New Custom Slide" option to editor dropdown
- [x] Create dialog to enter custom slide title
- [x] Save custom slides as a new screen type (CUSTOM)
- [x] Display custom slides in TV rotation

## Feature - Per-Slide Widget Customization
- [ ] Update template schema to include widget override settings (logo, weather, clock, waiver QR)
- [ ] Add widget visibility toggles to slide editor
- [ ] Add widget position/size controls to slide editor
- [ ] Add widget style controls (opacity, color) to slide editor
- [ ] Integrate widget overrides into TV display renderer


## Feature - Per-Slide Widget Customization (Completed)
- [x] Add widget toggle switches (show/hide per slide)
- [x] Add position controls (X, Y) for each widget
- [x] Add size/font controls for each widget
- [x] Integrate widget overrides into TV display renderer

## Bug Fix - Slide Editor Template Loading
- [x] Fix template not loading saved changes when switching screen types

## Feature - Snap to Grid
- [x] Add visual grid lines to the canvas
- [x] Add snap-to-grid when dragging elements
- [x] Add center guides (horizontal and vertical center lines)
- [x] Add toggle to enable/disable grid

## Bug Fix - Custom Slide Name
- [x] Fix custom slide name not saving (saves as 'Custom Slide' instead of entered name)

## Bug Fix - Gallery Photos Not Appearing with Templates
- [ ] Investigate how TemplateRenderer handles dynamic content (gallery photos)
- [ ] Fix template system to load dynamic photos alongside template customizations
- [ ] Add special element types for dynamic content (gallery grid, cat photo, etc.)

## Bug Fix - Gallery Photos Not Appearing (Feb 5)
- [x] Fix: Snap & Purr Gallery photos not appearing when edited in visual editor
- [x] Add GalleryGridElement component to TemplateRenderer for dynamic photo fetching
- [x] Add galleryType and photosToShow properties to TemplateElement interface
- [x] Add Gallery Grid element type to slide editor with gallery-specific controls
- [x] Remove conflicting static Photo elements from SNAP_PURR_GALLERY template
- [x] Test gallery display with approved photos from database

## Feature - Photo Likes for Snap & Purr Gallery (Feb 5)
- [x] Add likes count field to photoSubmissions table
- [x] Create photoLikes table to track individual likes (prevent duplicate likes)
- [x] Create API endpoint to like a photo
- [x] Create API endpoint to get photos sorted by likes
- [x] Update gallery display to show like counts on photos
- [x] Create public photo voting page accessible via QR code
- [x] Add sorting option in gallery (newest vs most-liked)
- [x] Test like feature end-to-end

## Feature - TV Display Redesign to Match Lounge Aesthetic (Feb 5)
- [x] Update color palette: mint green, warm orange, cream, black, amber
- [x] Redesign TV screen backgrounds with new colors
- [x] Add playful cat illustrations inspired by lounge mural
- [x] Update typography and spacing for modern industrial feel
- [x] Add warm, inviting design elements (rounded corners, soft shadows)
- [x] Test all TV screens with new design

## Feature - Slide Editor Lounge Color Scheme (Feb 5)
- [x] Update slide editor default background colors to lounge palette
- [x] Add lounge color presets (mint green, warm orange, cream, amber, charcoal)
- [x] Update TemplateRenderer default styles to match TV display design
- [x] Add gradient background options inspired by lounge aesthetic
- [x] Test creating custom templates with new color scheme

## Feature - tvOS App Lounge Design Update (Feb 5)
- [x] Update tvOS color constants with lounge palette (mint green, warm orange, cream, amber)
- [x] Add warm amber light glow effects to tvOS screens
- [x] Add mint green floor reflection to tvOS screens
- [x] Update polaroid frames to use cream background
- [x] Add playful cat decorations to tvOS screens
- [x] Update adoption screens with new design
- [x] Update gallery screens with new design
- [x] Test tvOS app with new lounge-inspired design
- [x] Push changes to GitHub repository

## Bug Fix - iOS Admin App Screen Creation (Feb 5)
- [ ] Fix Create button not working when creating new screen
- [ ] Test screen creation flow in iOS Admin app

## Bug Fix - Web App Screen Editor
- [x] Fix: Slide Editor elements should overlay on top of original screen designs, not replace them

## Bug Fix - Apple TV Screensaver
- [x] Fix: Apple TV screensaver/wallpaper activates after idle time - need to keep screen awake

## Feature - Scheduling Toggle Switch
- [x] Add schedulingEnabled field to screens database schema
- [x] Update backend routers to handle schedulingEnabled field
- [x] Add toggle switch in admin screen editor to enable/disable scheduling
- [x] Update playlist logic: when scheduling is off, screen always shows (if active)
- [x] Test scheduling toggle on/off behavior

## Feature - Schedule Timeline Preview
- [x] Create ScheduleTimeline component with 24-hour visual timeline
- [x] Show each screen as a colored bar on the timeline based on its schedule rules
- [x] Handle screens with no scheduling (always on) vs scheduled screens
- [x] Show day-of-week filter to preview different days
- [x] Add time window indicators for scheduled screens
- [x] Integrate timeline into admin panel (Playlists tab)
- [x] Write tests for timeline logic

## Feature - Schedule Timeline & Playlist Scheduling
- [x] Add scheduling fields to playlists table (schedulingEnabled, daysOfWeek, timeStart, timeEnd, color)
- [x] Create backend API for playlist scheduling CRUD
- [ ] Update TV display to auto-switch playlists based on time of day (future enhancement)
- [x] Create ScheduleTimeline component with 24-hour visual timeline
- [x] Show playlist schedule as colored blocks on the timeline
- [x] Show individual screen schedules (toggle between playlist/screen views)
- [x] Add day-of-week selector to preview different days
- [ ] Add drag-to-create playlist time blocks on timeline (future enhancement)
- [x] Integrate timeline into Playlists tab in admin panel
- [x] Write tests for playlist scheduling logic (26 tests passing)

## Feature - Multiple Time Slots per Playlist
- [x] Update playlists schema to store multiple time slots as JSON array
- [x] Update backend create/update mutations to accept time slots array
- [x] Update PlaylistManager UI to add/remove multiple time windows
- [x] Update ScheduleTimeline to render multiple blocks per playlist
- [x] Update tests for multiple time slots (33 tests passing)

## Feature - Template Overlay Data in API for tvOS
- [x] Include template elements in screens.getActive API response
- [x] Add template data to screen model (overlay elements with position, size, color, text)
- [x] Update tvOS Models.swift with TemplateElement model
- [x] Update tvOS APIClient to parse template overlay data
- [x] Create TemplateOverlayView in tvOS to render custom elements on top of native screens
- [x] Integrate overlay into tvOS ScreenView
- [ ] Test template changes appearing on Apple TV

## Bug Fix - Template Overlay Doubling (Feb 6)
- [x] Fix: Template overlay elements appear doubled on top of default screen design in Slide Editor
- [x] Ensure template elements replace (not duplicate) default screen content when a template is applied

## Bug Fix - Guest Session Countdown Timers Not Showing on Apple TV (Feb 6)
- [x] Investigate how guest session reminders/countdowns work on web (GuestReminderOverlay)
- [x] Check API endpoints for guest session expiry data
- [x] Implement guest session reminder overlay in tvOS (show when guests have 5 min left)
- [x] Deliver updated Xcode files

## Feature - Chime Sound for tvOS Guest Reminder Widget (Feb 6)
- [x] Add AVFoundation audio playback to GuestReminderWidget (ChimeSoundManager)
- [x] Generate chime via AVAudioEngine synthesis (no external file needed)
- [x] Play chime once per new reminder (tracked by ID to avoid repeats)
- [x] No asset registration needed — chime is synthesized at runtime
- [x] Deliver updated Xcode files

## Bug Fix - Web TV and Apple TV UI Slides Don't Match (Feb 6)
- [x] Compare web ScreenRenderer designs with tvOS ScreenView designs for each screen type
- [x] Identify specific layout, color, typography, and content differences
- [x] Update tvOS screen views to match web TV designs
- [x] Deliver updated Xcode files

## Bug Fix - Chime Pauses Apple Music (Feb 6)
- [x] Fix AVAudioEngine audio session to use .ambient category with .mixWithOthers
- [x] Ensure chime plays over existing media without interrupting it
- [x] Ensure resuming music doesn't pause the timer

## Feature - Align All tvOS Screen Designs with Web TV Display (Feb 6)
- [x] Rewrite AdoptionScreenView to match web design
- [x] Rewrite EventsScreenView to match web design
- [x] Rewrite TodayScreenView to match web design
- [x] Rewrite MembershipScreenView to match web design
- [x] Rewrite RemindersScreenView to match web design
- [x] Rewrite SnapPurrScreenView to match web design
- [x] Rewrite AdoptionShowcaseScreenView to match web design
- [x] Rewrite ThankYouScreenView to match web design
- [x] Add AdoptionCounterScreenView (new)
- [x] Add HappyTailsScreenView (new)
- [x] Add SnapPurrGalleryScreenView (new)
- [x] Add HappyTailsQRScreenView (new)
- [x] Add SnapPurrQRScreenView (new)
- [x] Add LivestreamScreenView (new)
- [x] Add CheckInScreenView (new)
- [x] Add CosmicHelpers.swift shared components
- [x] Update ScreenView routing for all 15 screen types
- [x] Fix chime audio to use .ambient category (won't pause Apple Music)
- [x] Update Xcode project file with all new files

## Bug Fix - Xcode Build Errors (Feb 6)
- [x] Remove duplicate LightRaysView from ThankYouScreenView (already in CosmicHelpers)
- [x] Remove duplicate AnimatedCirclesView from ThankYouScreenView (already in CosmicHelpers)
- [x] Fix PollResultsWidget unused variable warning

## Bug Fix - Xcode Build Errors Round 2 (Feb 6)
- [x] Fix ThankYouScreenView Screen init: 'type' must precede 'title'
- [x] Fix ContentView async expression missing 'await' (added @MainActor to Task)

## Bug Fix - ALL Screen Layouts Empty/Cramped on Apple TV (Feb 6)
- [x] Rewrite all 15 screen views with BaseScreenLayout for consistent full-screen layout
- [x] Use GeometryReader for proportional sizing across all screens
- [x] Content properly centered and spread across full 1920x1080 TV display
- [x] Deliver updated Xcode files

### Bug Fix - Waiver QR Widget Not Showing on Apple TV (Feb 6)
- [x] Create WaiverWidget.swift - QR code overlay for guest waiver (top-left, below poll)
- [x] Create LogoWidget.swift - cafe logo overlay (bottom-right)
- [x] Add waiverUrl, wifiName, wifiPassword, houseRules to AppSettings model
- [x] Add both widgets to ContentView as overlays
- [x] Update CheckInScreenView to use settings for waiver/wifi/rules (with fallback)
- [x] Update APIClient.updateSettings() with new fields
- [x] Register new Swift files in Xcode project
## Bug Fix - Event Slides Not Appearing on Apple TV (Feb 6)
- [x] Root cause: APIScreen.toScreen() created ScreenSchedule from startAt/endAt even when schedulingEnabled=false
- [x] Fix: Add schedulingEnabled to APIScreen, only create schedule when schedulingEnabled==true
- [x] Events with future startAt dates now show correctly (schedule not applied when scheduling disabled)

## Bug Fix - tvOS Countdown Timers Not Counting Down (Feb 6)
- [x] Root cause: Timer.publish + @State currentTime wasn't reliably propagating to child views
- [x] Fix: Replaced with TimelineView(.periodic) for guaranteed per-second re-renders
## Bug Fix - Events Still Not Showing on Apple TV (Feb 6)
- [x] Root cause: tvOS used screens.getActiveWithTemplates (all screens) instead of playlist endpoint
- [x] Fix: Switched to playlists.getActiveScreensWithTemplates (playlist-filtered + template data)
## Bug Fix - Event Using "Gentle Reminder" Text (Feb 6)
- [x] Root cause: "Gentle Reminder" (id=6) was typed as EVENT in DB, and tvOS showed all screens not just playlist
- [x] Fix: Screen type corrected to REMINDER, and tvOS now uses playlist endpoint (Gentle Reminder not in active playlist)
## Feature - Playlist Scheduling on tvOS App (Feb 6)
- [x] tvOS now uses playlists.getActiveScreensWithTemplates endpoint
- [x] Backend handles playlist time slot scheduling (scheduled playlists checked first, then active playlist)
- [x] Created new backend endpoint playlists.getActiveScreensWithTemplates

## Bug Fix - Toggling Slide Active Changes Type to EVENT (Feb 6)
- [x] Root cause: screenInput.partial() applied .default("EVENT") to type field on partial updates
- [x] Fix: Created screenUpdateInput schema without defaults, strip undefined values in update mutation
- [x] Fixed corrupted screens: 120003 and 120004 restored from EVENT to SNAP_PURR_QR

## Bug Fix - tvOS Event Slides Still Not Appearing (Feb 6 - Follow-up)
- [x] Root cause: AppSettings decode failed (latitude/longitude/transitionDuration missing from API)
- [x] Settings decode failure caused fallback to defaults, but screens themselves decoded fine
- [x] EVENT screen IS in playlist at position 10 of 19 - it was always there, just needed to cycle through
- [x] ScreenView routing for EVENT type is correct (.events -> EventsScreenView)

## Bug Fix - tvOS Waiver QR & Logo Widgets Still Not Appearing (Feb 6 - Follow-up)
- [x] Root cause: AppSettings decode failure caused waiverUrl=nil and logoUrl=nil (using defaults)
- [x] Fix: Custom init(from decoder:) with decodeIfPresent and fallback defaults for all fields
- [x] Added debug logging to fetchSettings() for troubleshooting
- [x] WaiverWidget.swift and LogoWidget.swift are correctly in Xcode project and ContentView overlays

## Feature - Add eventTime and eventLocation Fields to Screen Editor (Feb 6)
- [x] Add eventTime and eventLocation columns to screens table schema
- [x] Add fields to screenInput and screenUpdateInput schemas in routers
- [x] Add fields to admin screen editor UI (show when type is EVENT)
- [x] Update tvOS APIScreen model to include eventTime and eventLocation
- [x] Update toScreen() to map eventTime and eventLocation from API

## Feature - Adjust Widget Z-Ordering and Overlap Prevention (Feb 6)
- [x] Review widget positioning in ContentView.swift
- [x] Removed poll widgets entirely (no longer needed)
- [x] Waiver QR widget positioned at top-left with proper spacing

## Fix - Remove Poll Widgets from tvOS Overlay (Feb 6)
- [x] Remove PollWidget and PollResultsWidget from ContentView.swift overlay

## Feature - Skip Image Cropping Option (Feb 6)
- [x] Add "Use Original" button to image cropper dialog to bypass cropping

## Bug Fix - Guest Name Not Showing on Apple TV Countdown (Feb 6)
- [x] Confirmed: guest name DOES show, but only during the 5-min window before session expiry
- [x] Added welcome message on check-in so guest name appears immediately too

## Feature - Welcome Guest Message on Apple TV (Feb 6)
- [x] Add backend endpoint for recently checked-in guests (within last 30 seconds)
- [x] Add welcome banner to GuestReminderWidget that shows guest name on check-in
- [x] Keep existing 5-minute countdown warning

## Bug Fix - Snap & Purr, Happy Tails, and QR Screens Not Showing on Apple TV (Feb 6)
- [x] Screen views exist and route correctly for all types
- [x] Root cause: SNAP_PURR_QR and HAPPY_TAILS_QR screens had null qrUrl in database
- [x] Set QR URLs to point to upload pages (/upload/snap-purr and /upload/happy-tails)
- [x] Updated SnapPurrScreenView to fetch and cycle through uploaded photos as gallery
- [x] Updated HappyTailsScreenView to fetch and cycle through uploaded photos as gallery
- [x] Updated SnapPurrGalleryScreenView with photo fetching and cycling
- [x] Added fetchApprovedPhotos to APIClient and PhotoSubmission model
- [x] Falls back to static screen when no uploaded photos exist

## Settings Label Improvement
- [x] Rename "Default Duration (s)" to "Fallback Slide Duration (s)" with helper text

## Bug Fix - Adoption Counter
- [x] Remove the plus sign (+) after the number on the adoption counter (tvOS)

## Bug Fix - New Slides Not Showing on TV
- [x] Auto-add new slides to the active playlist when created

## Feature - Shuffle Slides
- [x] Randomize slide order on tvOS app each cycle
- [x] Randomize slide order on web TV display each cycle
- [x] Shuffle photo order in gallery screens (tvOS and web) so they start with different photos each time

## Bug Fix - Guest Check-in on Apple TV
- [ ] Fix checked-in guests not appearing on Apple TV app
- [ ] Fix Xcode warnings: deprecated onChange(of:perform:) in GuestReminderWidget and WaiverWidget, BounceSymbolEffect availability

## Feature - Homepage Redesign
- [x] Redesign homepage with all admin features showcase
- [x] Add How-To guide section for new staff onboarding
- [x] Feature sections: TV Display, Guest Sessions, Adoption Screens, Events, Photos, Playlists, Settings
- [x] Include step-by-step instructions for each admin feature

## Feature - Screens Page Filter Tabs
- [x] Add filter tabs to Screens page: Active Only (default), All, Adopted
- [x] Default to "Active Only" so deactivated slides are hidden
- [x] "Adopted" tab shows only adoption slides marked as adopted
- [x] "All" tab shows everything including inactive slides

## Feature - Web TV Display Chime on Guest Check-in
- [x] Add browser-based chime sound when guest checks in on web TV display
- [x] Chime should not interrupt any other audio playing
- [x] Generate chime using Web Audio API (no external audio file needed)

## Feature - Remove Wix Booking Integration
- [x] Remove Wix-related columns from database schema
- [x] Remove Wix-related functions from server/db.ts
- [x] Remove Wix-related procedures from server/routers.ts
- [x] Remove Wix-related frontend components and references
- [x] Remove Wix-related tests
- [x] Remove Wix-related types and constants
- [x] Remove WelcomeOverlay (upcoming arrivals from Wix)
- [x] Clean up environment variables references to Wix

## Feature - New Welcome Screen (Manual Check-in)
- [x] Add backend endpoint to get recently checked-in guests (last 60 seconds) — already existed
- [x] Build WelcomeOverlay component for TV display with full-screen greeting
- [x] Play welcome chime when greeting appears
- [x] Show guest name, party size, and session type
- [x] Auto-dismiss after display period (12 seconds)
- [x] Integrate into TVDisplay page

## Feature - Admin Panel Session Expiry Chime
- [x] Add reminder chime to admin panel when guest sessions hit 5-minute warning
- [x] Use distinct tone from check-in chime so they're distinguishable
- [x] Track which sessions have already triggered the chime to avoid repeats

## Feature - Browser Desktop Notifications
- [x] Create notification utility with permission request
- [x] Request notification permission on admin page load
- [x] Send desktop notification when guest session hits 5-minute warning
- [x] Send desktop notification when guest session expires
- [x] Send desktop notification when a new guest checks in
- [x] Include guest name, session type, and time info in notifications

## Feature - Mobile-Friendly Admin Panel
- [ ] Fix header: logo/title overlapping with system clock on mobile
- [ ] Fix tab navigation: icons too cramped on small screens, make scrollable or use bottom nav
- [ ] Fix Guests tab: stat cards, check-in form, and session cards responsive
- [ ] Fix Screens tab: screen list cards and edit forms responsive
- [ ] Fix Photos tab: photo grids and upload forms responsive
- [ ] Fix Events tab: event cards and forms responsive
- [ ] Fix Playlists tab: playlist management responsive
- [ ] Fix Settings tab: settings forms responsive
- [ ] General: ensure all modals/dialogs are mobile-friendly
- [ ] General: ensure touch targets are large enough (44px minimum)

## Bug Fix - WelcomeOverlay Import
- [x] Fix: WelcomeOverlay.tsx missing React import (useState, useEffect, etc.) causing Vite pre-transform error

## Feature - Mobile Bottom Navigation Bar
- [x] Add fixed bottom nav bar visible only on mobile (sm and below)
- [x] Include icons and labels for Guests, Screens, and Photos tabs
- [x] Sync bottom nav selection with the main tab state
- [x] Add padding to main content so bottom nav doesn't overlap last items

## Bug Fix - Playlist Scheduling (Multiple Active Playlists)
- [x] Investigate current playlist schema and activation logic
- [x] Fix backend to check timeSlots array (not just legacy timeStart/timeEnd)
- [x] Decouple isActive from scheduling (scheduled playlists don't need isActive)
- [x] Support multiple scheduled playlists (first match by sortOrder wins)
- [x] Add fallback chain: scheduled → manual → default → all screens
- [x] Handle overnight time windows (e.g., 22:00 – 02:00)
- [x] Add getCurrentlyServing tRPC endpoint for admin visibility
- [x] Add "Now Serving" banner in ScheduleTimeline showing which playlist the TV is using
- [x] Write tests for scheduling resolution logic (13 new tests)
- [x] All 130 tests passing

## Feature - Guest Status Board TV Slide
- [x] Add GUEST_STATUS_BOARD to screen type enum in database schema
- [x] Add backend endpoint/procedure to serve active guest sessions for TV display
- [x] Create GuestStatusBoard TV display renderer showing all checked-in guests
- [x] Show guest name, session type (Full Purr / Mini Meow), and remaining time
- [x] Live countdown timers for each guest
- [x] Color-code by session type and urgency (teal/amber/purple + red urgent)
- [x] Add GUEST_STATUS_BOARD to admin screen type selector
- [x] Responsive grid layout (2/3/4 cols based on guest count)
- [x] Empty state with "Waiting for guests..." message
- [x] Session type legend in footer
- [x] 18 unit tests for session labels, time status, grid layout, sorting, colors
- [x] All 135 tests passing

## Bug Fix - Guest Status Board Issues
- [x] Fix: Guests not showing on Apple TV Guest Status Board (reduced refetch interval, need to publish)
- [x] Add general session timers for online reservations (Full Purr countdown to :00, Mini Meow countdown to :30)
- [x] Fix: Slide not advancing after duration (stabilized nextScreen callback with refs to prevent timer resets)
- [x] Increased default duration from 15s to 20s

## Bug Fix - Guest Status Board Still Not Advancing
- [x] Deep-dive debug: root cause was setTimeout + useEffect deps — with 1 screen, currentIndex stays 0 so effect never re-triggers
- [x] Fix: switched from setTimeout to setInterval so timer keeps cycling regardless of playlist size
- [x] Verified in browser: slides now advance correctly from Guest Status Board to other screens

## Bug Fix - Guest Status Board Still Not Advancing + Apple TV Empty
- [x] Fix: Slide not advancing - rewrote auto-advance timer with refs (only depends on currentIndex + isPaused)
- [x] Fix: Apple TV empty - replaced framer-motion with CSS animations for WKWebView compatibility
- [x] Stabilized nextScreen/prevScreen callbacks in usePlaylist with refs
- [x] Added animate-fade-in CSS keyframe animation

## Bug Fix - Guest Status Board Not Rendering on Apple TV
- [x] Root cause: animate-fade-in CSS starts at opacity:0, tvOS WebKit doesn't run the animation so content stays invisible
- [x] Removed all animate-fade-in classes from GuestStatusBoardScreen
- [x] Removed backdrop-blur-sm from session window timer cards
- [x] Session window countdown timers (Full Purr/Mini Meow) are part of the Guest Status Board slide
- [x] All 135 tests passing

## Bug Fix - Multiple Screens Not Rendering Content on Apple TV
- [x] Guest Status Board: only title shows — fixed by removing animate-fade-in (opacity:0 start)
- [x] Check-In screen: no WiFi/rules showing — fixed by replacing all motion.div with plain div
- [x] Root cause: framer-motion's initial={{ opacity: 0 }} doesn't animate on tvOS WebKit, content stays invisible
- [x] Removed all motion.div from CheckInScreen (header, 3 columns, footer)
- [x] Removed backdrop-blur-sm from CheckInScreen columns (tvOS incompatible)
- [x] All 135 tests passing

## Bug Fix - Apple TV Native App (SwiftUI) Screens
- [x] Apple TV app is native SwiftUI, NOT WKWebView — each screen has its own .swift file
- [x] Fix CheckInScreenView: template overlay was overriding native view — changed routing to prioritize native views
- [x] Create GuestStatusBoardScreenView.swift with live countdown timers and session window timers
- [x] Add guestStatusBoard to ScreenType enum, Theme.swift, and ScreenView.swift routing
- [x] Add GuestStatusBoardScreenView.swift to project.pbxproj build files
- [x] Push changes to GitHub repo jnegrete31/catfe-tv (commit f88a44f)

## Feature - Cats Management System (Central Cat Database)

### Database & Schema
- [x] Create cats table with guest-facing fields (name, photoUrl, breed, colorPattern, dob, sex, weight, personalityTags, bio, adoptionFee, isAltered, felvFivStatus, status)
- [x] Add staff-only fields (rescueId, shelterluvId, microchipNumber, arrivalDate, medicalNotes, vaccinationsDue, fleaTreatmentDue)
- [x] Add adoption tracking fields (adoptedDate, adoptedBy)
- [x] Push database migration

### Server-Side CRUD
- [x] Create db.ts query helpers for cats (getAll, getById, getAvailable, getAdopted, create, update, delete)
- [x] Create tRPC procedures for cats CRUD (public getAvailable, protected admin CRUD)
- [x] Add image upload support for cat photos (S3 storage)

### Admin Panel - Cats Tab
- [x] Add Cats tab to admin panel with cat icon in tab bar and bottom nav
- [x] Build cat list view with photo thumbnails, name, breed, status badge
- [x] Build cat detail/edit form matching kennel card fields
- [x] Add personality tags selector (Good with Cats, Good with Children, Shy, etc.)
- [x] Add status selector (Available, Adopted, Medical Hold, Foster)
- [x] Add photo upload for cat profile picture
- [x] Add medical notes section (staff-only, collapsible)
- [x] Add vaccination/treatment due date tracking

### TV Display Integration
- [x] Update Adoption Showcase screen to pull cats from cats table instead of individual screen entries
- [ ] Update Adoption screen (single cat) to pull from cats table (deferred - hybrid approach)
- [x] Adoption Showcase now serves as "Meet Our Cats" screen pulling from cats table

### tvOS App Updates
- [x] Add Cat model to Models.swift
- [x] Update tvOS Adoption Showcase to use cats data
- [x] Push changes to GitHub

### Tests
- [x] Write vitest tests for cats CRUD procedures (20 tests passing)

## UI Fix - Cat Manager Settings Layout
- [x] Fix admin tab bar (Cats, Screens, Guests, etc.) so all tabs fit in one row without scrolling

## Feature - Document Import for Cats (AI-powered)
- [x] Create tRPC procedure to accept uploaded kennel card / medical history documents
- [x] Use LLM to extract cat fields from uploaded documents (name, breed, DOB, microchip, vaccinations, FeLV/FIV, etc.)
- [x] Build "Import from Documents" UI in CatManager with file upload
- [x] Pre-fill cat form with extracted data for review before saving
- [x] Write tests for document parsing procedure (4 tests, 24 total passing)

## Cleanup - Remove Old Individual Adoption Slides
- [x] Identify old ADOPTION-type individual slides in screens table (found 16)
- [x] Delete old individual adoption slides (keep ADOPTION_SHOWCASE and ADOPTION_COUNTER)
- [x] Verify Adoption Showcase still works with cats from Cats table

## Feature - Individual Cat Slides from Database
- [x] Update usePlaylist.ts to fetch available cats and inject as synthetic ADOPTION screens
- [x] Each available cat gets its own full-screen adoption slide in the TV rotation
- [x] Slides show photo, name, breed, age, personality tags, bio, adoption fee
- [x] Test TV display with real cat data (Rex, Scout confirmed working)
- [x] Update Swift tvOS code to render individual cat slides from API

## Bug Fix - Cat Adoption Slides Not Showing on TV
- [x] Debug why cat adoption slides are not appearing in the TV rotation (they were showing, user confirmed)
- [x] Remove bios from cat adoption slides
- [x] Verify slides show on published site

## UI Fix - Simplify Cat Adoption Slides
- [x] Remove bio, adoption fee, breed, and color pattern from cat slides
- [x] Keep only: photo, name, age, sex, personality tags
- [x] Fix tvOS app to show individual cat slides from API (inject into screens array)
- [x] Simplify tvOS cat slides to match web (no bio, fee, breed, pattern)
- [x] Add all missing screen types to Swift ScreenType enum
- [x] Fix web AdoptionScreen to render personality tags as styled pills
- [x] Fix title display ("Meet Rex" not "Meet Meet Rex")

## Feature - Adoption QR Code on Cat Slides
- [x] Add Shelterluv QR code (https://www.shelterluv.com/matchme/adopt/KRLA/Cat) to each cat's adoption slide
- [x] Update catToScreen in usePlaylist.ts to set qrUrl (now server-side via generateCatSlides)
- [x] Update tvOS cat slide injection to include qrUrl (now server-side)

## Bug Fix - tvOS Cat Adoption Slides Not in Playlist
- [x] Fix Apple TV app not showing cat adoption slides in rotation
- [x] Moved cat slide injection to server-side (generateCatSlides + interleaveScreens)
- [x] Both screens.getActive and playlists.getActiveScreens now include cat slides
- [x] Removed client-side injection from usePlaylist.ts and TVDisplayViewModel.swift
- [x] All 160 tests passing

## Bug Fix - tvOS Still Not Showing Cat Adoption Slides
- [x] Investigate what API endpoint tvOS app calls and how it parses the response
- [x] Check if tvOS app is using published site or dev server
- [x] Fix Swift models to match actual API response format exactly
- [x] Update Screen model: use startAt/endAt/timeStart/timeEnd (not startDate/endDate/startTime/endTime)
- [x] Update Screen model: add all missing fields (imageDisplayMode, schedulingEnabled, isProtected, livestreamUrl, eventTime, eventLocation)
- [x] Update Screen model: use String for all date fields (not Date)
- [x] Update Settings model: houseRules is [String]? not String?
- [x] Update CatModel: add all fields including vaccinationsDue as [VaccinationDue]?
- [x] Fix APIClient: handle cats.getFeatured returning null
- [x] Fix APIClient: settings.get returns Settings directly (no wrapper)
- [x] Fix AdminViewModel: remove references to old field names
- [x] Fix ScreenContentView preview: use new field names
- [x] Push updated Swift files to GitHub

## Feature - Adoption Date Overlay on TV Slides
- [x] Verify adopted_in_lounge status exists in schema (re-added after rollback)
- [x] Ensure adopted_in_lounge cats appear on TV adoption showcase slides
- [x] Add adoption date badge overlay (e.g., "Adopted Feb 19!") on TV slides for adopted_in_lounge cats
- [x] Update cat count indicator to differentiate available vs recently adopted
- [x] Update admin UI status helpers (getStatusColor, getStatusLabel) for adopted_in_lounge
- [x] Update all status dropdowns (form, bulk update) with adopted_in_lounge option
- [x] Add adopted_in_lounge filter card to CatManager (purple "In Lounge" card)
- [x] Add bulkUpdateStatus procedure to routers.ts
- [x] Write/update tests for adopted_in_lounge status and adoption date overlay (169 tests passing)

## Bug Fix - Remove Polls and Captions Tabs (Post-Rollback)
- [x] Remove Polls tab from admin panel
- [x] Remove Captions tab from admin panel
- [x] Fix tab grid layout to grid-cols-6 for 6 tabs
- [x] Center tabs properly (Cats, Screens, Guests, Photos, Playlists, Settings)

## Feature - Inline Caption Editing in Photos Tab
- [x] Add inline caption editing to each photo card in PhotoModeration
- [x] Add pencil icon to edit caption on hover
- [x] Add updateCaption backend procedure (db.ts + routers.ts)
- [x] Write tests for updateCaption (173 tests passing)

## Bug Fix - Tab Centering
- [x] Ensure 6 admin tabs are visually centered using flex layout with flex-1 triggers

## Feature - Adoption Counter Slide Redesign
- [x] Build Concept A preview (Wall of Love Photo Mosaic)
- [x] Build Concept C preview (Happy Tails Timeline Split Layout)
- [x] Create preview page to toggle between concepts
- [x] User chose hybrid: Concept C layout + photo mosaic on right side
- [x] Replace current adoption counter with hybrid design
- [x] Design works for both Apple TV and web

## Feature - Hybrid Adoption Counter (C + Mosaic)
- [x] Combine Concept C split layout with photo mosaic on right side
- [x] Fix vertical centering of counter content (fixed tv-screen CSS and preview container)
- [x] Replace current AdoptionCounterScreen in ScreenRenderer with hybrid design
- [x] Preview page updated with hybrid design for comparison

## Feature - Milestone Celebration on Adoption Counter
- [x] Detect milestone numbers (every 10=bronze, 25=silver, 50=gold, 100=diamond)
- [x] Add confetti burst animation (60 particles, tier-colored) when counter is at a milestone
- [x] Add golden milestone badge (e.g., "🎉 50 Milestone!", "🎉 100 Forever Homes!")
- [x] Add special glow/shimmer effect on the counter number at milestones (pulsing glow, number scale animation)
- [x] Celebration is CSS/framer-motion based, works on web TV display
- [x] Write unit tests for milestone detection logic (13 tests, 186 total passing)

## Feature - tvOS Adoption Counter Redesign
- [x] Review current Swift AdoptionCounterScreen implementation
- [x] Implement hybrid split layout (left: counter, right: mosaic + carousel)
- [x] Add milestone detection logic (bronze/silver/gold/diamond tiers)
- [x] Add confetti particle animation for milestones (50 particles, tier-colored)
- [x] Add milestone badge with tier-colored gradient capsule
- [x] Add pulsing glow and number shimmer effects at milestones
- [x] Add animated counter (60-step count-up effect)
- [x] Add recently adopted cat carousel with polaroid cards (4s rotation)
- [x] Add photo mosaic background on right side (4x3 grid)
- [x] Updated ScreenView to pass adoptionCats to AdoptionCounterScreenView
- [x] Push updated Swift files to GitHub (commit 45e8bdf)

## Bug Fix - Cat Slides Not Showing on TV
- [x] Investigate why cat slides are not displaying (cats were in cats table, not screens table)
- [x] Auto-generate ADOPTION type slides from cats in the Cats tab via generateCatSlides()
- [x] Inject auto-generated cat slides into getActiveScreensWithTemplates response (Apple TV)
- [x] Inject into getRandomAdoptions (web TV)
- [x] Set isAdopted=true for adopted_in_lounge cats
- [x] Verified: 14 cat slides now appear in API response (Alpaca, Apollo, Celia, etc.)
- [x] Updated tests — 186 tests passing

## Cleanup - Remove Adoption Counter Preview Page
- [x] Delete AdoptionCounterPreview.tsx
- [x] Remove route and import from App.tsx

## Feature - Auto-Set Adoption Date & Auto-Save Cats
- [x] Auto-set adoptedDate to today when status changes to adopted or adopted_in_lounge
- [x] Add auto-save (1.5s debounce) to cat editing — no more Save button needed
- [x] Auto-save triggers on: status, name, breed, bio, photo, dates, toggles, tags, medical notes, all fields
- [x] Show "Saving..." / "✓ Saved" indicator in sheet header
- [x] Replace Save/Cancel with Close button when editing (auto-save handles it)
- [x] Keep Add Cat button for new cat creation
- [x] All 186 tests passing, tsc --noEmit clean

## Bug Fix - Apple TV Adoption Counter Shows "More Happy Tails Coming Soon" Instead of Adopted Cat Photos
- [x] Confirmed web version works fine (3 adopted cats with photos: Lemon, Elvira, Chun-Li)
- [x] Investigate Apple TV AdoptionCounterScreenView.swift — adoptionCats passed from ContentView only had available cats, none with isAdopted=true
- [x] Fix tvOS code: Added fetchRecentlyAdoptedCats() to APIClient, combined with available cats in ContentView
- [x] Push updated Swift code to GitHub
- [ ] Test the fix on Apple TV (requires Xcode rebuild)
- [x] Fix Xcode build error: 'Cannot convert value of type String to expected argument type Date' in APIClient.swift buildScreenInput
- [x] Fix Apple TV clock widget not updating in real time — replaced Timer.publish with TimelineView
- [x] Fix Slide Editor: creating/editing a custom slide should save as an individual slide, not update the shared template for all slides of that type
  - Added templateOverride column to screens table
  - Added getCustomSlides endpoint and saveForScreen mutation
  - Updated SlideEditor with custom slide picker (select individual slides to edit)
  - Updated ScreenRenderer to use per-screen templateOverride for CUSTOM slides
  - Pushed all changes to GitHub

## Feature - Customizable QR Code Label
- [x] Add qrLabel field to screens database schema
- [x] Update backend routers to handle qrLabel in create/update
- [x] Add QR Label input to admin screen editor (shows when QR URL is present)
- [x] Update web TV display renderers to show custom QR label (with smart fallbacks)
- [x] Update tvOS QRCodeView to accept optional label parameter
- [x] Update all 19 QRCodeView call sites across 16 Swift files to pass screen.qrLabel
- [x] Update APIClient buildScreenInput to send qrLabel
- [x] Push changes to GitHub

## Feature - Automatic Adoption Counter (All-Time)
- [x] Update adoption counter to automatically count all cats with status "adopted" or "adopted_in_lounge" from DB
- [x] Manual count field renamed to "Pre-Database Adoption Offset" (optional, for cats adopted before system)
- [x] Set existing offset to 0 (DB already has all 17 cats)
- [x] Update web TV adoption counter screen to use auto count (screens.getAdoptionCount + offset)
- [x] Update web TemplateRenderer counter element to use auto count
- [x] Update Apple TV AdoptionCounterScreenView to use apiClient.autoAdoptionCount
- [x] Update Apple TV TemplateOverlayView counter element
- [x] Added fetchAdoptionCount() to APIClient with 60-second refresh
- [x] Push changes to GitHub

## Feature - Roller API Integration
- [x] Set up Roller API credentials (client ID + secret) securely
- [x] Build Roller API client on server (OAuth2 token management, API calls)
- [x] Build Live Availability TV slide (session times + remaining capacity)
- [x] Build Today's Sessions Board TV slide (all sessions in grid layout)
- [x] Build auto guest check-in via Roller redemption webhook (POST /api/webhooks/roller)
- [x] Added 90-minute session duration for Study Sessions
- [ ] Build waiver status integration (requires live webhook to get guest IDs — future enhancement)
- [x] Update Apple TV with new Roller-powered slides
- [x] Push changes to GitHub

## Feature - Roller Polling-Based Auto Check-in (Webhook Alternative)
- [x] Investigate Roller API for recent redemptions/check-ins endpoint
- [x] Implement polling-based auto check-in (poll Roller API every 30 seconds for new bookings)
- [x] Remove dependency on webhook configuration (auto-registers via API + polling fallback)
- [x] Add rollerBookingRef to guestSessions for dedup (prevents duplicate check-ins)
- [x] Add getRollerPollingStatus endpoint for monitoring
- [x] Extract shared helpers into rollerWebhookHelpers.ts for testability
- [x] Write tests for polling service (5 tests passing, 194 total)

## Feature - tvOS Roller-Powered Screens + GitHub Push
- [x] Create LiveAvailabilityScreenView.swift for tvOS (emerald gradient, capacity bars, upcoming sessions)
- [x] Create TodaysSessionsScreenView.swift for tvOS (cyan/sky gradient, session grid with past/current/future states)
- [x] Add LIVE_AVAILABILITY and SESSION_BOARD to tvOS ScreenType enum
- [x] Add RollerSession model to Models.swift
- [x] Add fetchRollerSessions() to APIClient.swift (polls roller.getTodaySessions)
- [x] Auto-fetch Roller sessions on startup + refresh every 5 minutes
- [x] Update ScreenView.swift routing for new screen types
- [x] Update project.pbxproj with new Swift files
- [x] Update Theme.swift accent colors for new types
- [x] Push all changes to GitHub (jnegrete31/catfe-tv) — commit 4167185

## Feature - Per-Screen Hide Overlay Toggle
- [x] Add hideOverlay boolean field to screens database schema
- [x] Update backend routers to handle hideOverlay in create/update
- [x] Add Hide Overlay toggle to admin screen editor UI
- [x] Update web TV display to respect hideOverlay flag (hide clock/weather widget)
- [x] Update tvOS Swift app Screen model with hideOverlay field
- [x] Update tvOS ContentView to hide overlay when current screen has hideOverlay=true
- [x] Push tvOS changes to GitHub
- [x] Write tests for hideOverlay (4 tests, all 198 passing)

## Feature - Safe-Zone Preview in Screen Editor
- [x] Understand current screen editor preview and widget positions
- [x] Create SafeZoneOverlay component showing widget placement zones
- [x] Add toggle button to show/hide safe-zone preview in screen editor
- [x] Style zones to match actual widget sizes and positions
- [x] Integrate with hideOverlay toggle (dim zones when hideOverlay is on)

## Bug - hideOverlay toggle not persisting
- [x] Fix hideOverlay not saving/loading correctly when editing a screen (missing from Zod schema + defaultValues)

## Feature - New Screen Types (SOCIAL_FEED, BIRTHDAY_CELEBRATION, VOLUNTEER_SPOTLIGHT)

### SOCIAL_FEED (Instagram)
- [x] Research Instagram API / Graph API for pulling posts
- [x] Add SOCIAL_FEED to screen type enum in schema
- [x] Create Instagram integration backend (manual post management + future API)
- [x] Build admin UI for managing social feed posts (Social Feed tab)
- [x] Build web TV renderer for Social Feed screen (photo grid with captions)
- [x] Build tvOS Swift view for Social Feed screen (SocialFeedScreenView.swift)

### BIRTHDAY_CELEBRATION (Cat Birthdays)
- [x] Add BIRTHDAY_CELEBRATION to screen type enum in schema
- [x] Uses existing dob field from cats table (no new fields needed)
- [x] Birthday data auto-generated from cats table (no separate admin needed)
- [x] Build web TV renderer with festive golden celebration design (confetti, cake icon)
- [x] Build tvOS Swift view for Birthday Celebration screen (BirthdayCelebrationScreenView.swift)

### VOLUNTEER_SPOTLIGHT
- [x] Add VOLUNTEER_SPOTLIGHT to screen type enum in schema
- [x] Create volunteers table (name, photoUrl, bio, role, startDate, isFeatured, isActive)
- [x] Build admin UI for managing volunteers (Volunteers tab with add/edit/feature/delete)
- [x] Build web TV renderer for Volunteer Spotlight screen (featured volunteer cards)
- [x] Build tvOS Swift view for Volunteer Spotlight screen (VolunteerSpotlightScreenView.swift)

### Shared
- [x] All 198 tests passing (0 new test failures)
- [x] Push tvOS changes to GitHub (commit 02aad50)

## Bug - Test screens persisting in production database
- [x] Delete leftover "Test HideOverlay" screens from database (6 records removed)
- [x] Fix hideOverlay.test.ts to clean up test screens via afterAll hook

## Bug - Adoption counter design regression
- [x] Confirmed web hybrid Concept C design is intact in ScreenRenderer.tsx
- [x] Issue was tvOS-only — the Swift view still had the old centered design

## Bug - tvOS Adoption Counter missing hybrid Concept C design
- [x] Rewrote AdoptionCounterScreenView.swift with full hybrid Concept C design
- [x] Split layout: counter + branding on left (cream), photo mosaic + carousel on right (dark)
- [x] Added milestone detection (bronze/silver/gold/diamond tiers)
- [x] Added confetti animation at milestones
- [x] Added polaroid-style cat carousel with 4s auto-rotation
- [x] Added photo mosaic background from all cats with photos
- [x] Pushed to GitHub (commit 3c69173)

## Session Continuation - TypeScript & Test Fixes
- [x] Add SOCIAL_FEED, BIRTHDAY_CELEBRATION, VOLUNTEER_SPOTLIGHT to screenTypes enum in routers.ts
- [x] Verify tRPC router registration for birthdays, volunteers, instagram routers (all present in appRouter)
- [x] Clear stale TypeScript LSP cache (tsc --noEmit passes cleanly)
- [x] Verify no test pollution in production database (no leftover test screens)
- [x] Write 16 new tests for birthdays, volunteers, instagram routers and new screen type enum validation
- [x] All 214 tests passing (19 test files)

## Bug - Apple TV still showing old centered Adoption Counter design
- [x] Verify AdoptionCounterScreenView.swift in GitHub has Concept C split layout code
- [x] Check Xcode project file includes the correct file reference
- [x] Verify ScreenView.swift routing dispatches to AdoptionCounterScreenView correctly
- [x] Check for any Swift compilation issues (all clean)
- [x] Provide build instructions for deploying updated code to Apple TV

## Bug - tvOS app crashing with SIGTERM (Adoption Counter not showing)
- [x] Investigate SIGTERM crash in CatfeTVApp (SIGTERM was external kill signal, not code crash)
- [x] Check for potential crash in new screen type Swift views (all safe, no force unwraps)
- [x] Check for missing ScreenType cases (all cases handled)
- [x] Check ContentView data fetching (all error handling in place)
- [x] Fix crash and push to GitHub (no code fix needed, user needs to git pull)

## Bug - Create screen validation missing new types
- [x] Add SOCIAL_FEED, BIRTHDAY_CELEBRATION, VOLUNTEER_SPOTLIGHT to Zod validation enum (already present, issue is stale published version)

## Fix - TypeScript type inference failure for new routers
- [x] Fix TS errors: birthdays and volunteers routers not recognized by tRPC type system (confirmed tsc passes clean, errors were from stale dev server watcher)
- [x] Ensure published version includes all new screen types (production build verified, needs republish)

## Bug - Roller guests showing as "Guest" instead of first name
- [x] Investigated Roller API: /bookings endpoint doesn't return firstName/lastName, only customerId
- [x] Added getCustomerDetail() to roller.ts to fetch customer names via GET /customers/{customerId}
- [x] Updated rollerPolling.ts to look up customer first name before creating guest session
- [x] Falls back to booking.name then "Guest" if customer lookup fails
- [x] Added customer name lookup tests (3 new tests, 220 total passing)
- [ ] Test with live Roller data (requires republish)

## Bug - Roller polling creating too many guest check-ins
- [x] Investigated: polling was pulling ALL bookings for today, not just checked-in ones
- [x] Root cause: Roller API doesn't have redemption status; startTime field was undefined so time check was skipped
- [x] Fixed polling to only create sessions when booking's sessionStartTime is within 5 min window
- [x] Added proper time-window filtering (5 min before to session end)
- [x] Cleaned up all excess Roller-created guest sessions from database

## Cleanup - Roller auto-created guest sessions
- [x] Deleted all Roller-created guest sessions from database
- [x] Disabled auto-start of Roller polling (off by default via rollerPollingEnabled setting)
- [x] Added admin toggle in Settings → Roller Integration (with connection status indicators)
- [x] Added lastPollTime tracking to polling status
- [x] All 217 tests passing, production build verified

## Bug - Roller guest sessions all start at same time instead of booking time
- [x] Investigated: checkInAt was using `now` instead of booking's session start time when session had already started
- [x] Fixed isSessionActiveOrImminent to always return the actual booking session start time
- [x] Session duration/expiry already correctly calculated from booking's session end time
- [x] Cleaned up all existing Roller sessions from database (will re-sync with correct times)
- [x] All 217 tests passing

## Feature - Split Guests tab into Roller bookings and Walk-ins
- [x] Add backend endpoint to fetch today's Roller bookings as a schedule
- [x] Redesign GuestCheckIn UI with two sections: Roller Bookings + Walk-ins
- [x] Roller section: show today's bookings sorted by time with Upcoming/Checked In/Completed statuses
- [x] Walk-ins section: manual check-in flow (existing functionality)
- [x] Auto-check-in still works when session time hits
- [x] Visual distinction between Roller and Walk-in guests
- [x] Fixed time display: HH:mm format from Roller API now correctly formats to 12-hour AM/PM
- [x] Fixed timezone issue: end time calculation uses pure HH:mm math instead of Date objects
- [x] Product name lookup from availability API (shows "Cat Lounge Session" instead of generic "Session")
- [x] Added 17 vitest tests for booking enrichment, time formatting, and sorting logic

## Bug - Roller bookings showing as Checked In before session time
- [x] Investigate: bookings show "Checked In" even when date/time hasn't happened yet
- [x] Root cause 1: Date calculation used UTC (toISOString) instead of PST — at 6 PM PST it was already "tomorrow" in UTC
- [x] Root cause 2: Status relied on guest session DB — Roller polling had created sessions for all bookings
- [x] Fix: Use PST date (toLocaleDateString with America/Los_Angeles) and filter to only today's bookings
- [x] Fix: Status is now purely time-based — upcoming before start, checked_in during session, completed after end
- [x] Cleaned up stale Roller guest sessions from database
- [x] Updated tests: 18 passing (added time-based status tests and date filtering test)
- [x] Verify fix in browser — shows "No bookings for today" correctly on Friday evening

## Feature - Date filter for Roller Bookings
- [x] Update backend to accept date range parameter (today, tomorrow, week, month)
- [x] Add date filter buttons UI to Roller Bookings tab (rounded pill buttons)
- [x] Group bookings by date when viewing multi-day ranges (week/month show date headers)
- [x] Show booking counts per filter option (total bookings + total guests in summary bar)
- [x] Write tests for date range logic (25 tests passing)
- [x] Fixed multi-day fetching: Roller API only returns one day per call, so week/month fetch each day in parallel
- [x] Deduplication by bookingId to prevent overlap

## Feature - Mark as Arrived button for Roller bookings
- [x] Add database table to track Roller booking arrivals (bookingId, arrivedAt, markedBy)
- [x] Add backend endpoint to mark a booking as arrived (roller.markArrived)
- [x] Add backend endpoint to undo arrival (roller.unmarkArrived)
- [x] Add backend endpoint to fetch arrival status for bookings (merged into getTodayBookings)
- [x] Add "Mark as Arrived" button on each Roller booking card
- [x] Show green "Arrived" badge and arrival timestamp (PST) when guest has been marked
- [x] Show "Undo" button to reverse arrival marking
- [x] Hide Mark Arrived button for completed/expired bookings
- [x] Fixed bookingId NaN bug: use bookingReference (numeric) instead of uniqueId (UUID)
- [x] Write tests for arrival tracking logic (34 tests passing)

## Bug - Session end time hardcoded to 90 minutes
- [x] Investigated Roller API: availability API provides startTime/endTime per session slot
- [x] Fixed: now uses availability API endTime lookup for correct durations
- [x] Cat Lounge Session = 60 min, Study Session = 90 min, Mini Meow Session = 30 min
- [x] Fallback: if no availability match, uses product name to determine duration

## Feature - Waiver status for Roller guests
- [x] Investigate Roller API for waiver signing data (customerFlags, booking details, etc.)
- [x] Result: Roller REST API does NOT expose waiver signing status via any endpoint
- [x] customerFlags and customer.flags are always empty arrays
- [x] /guests/{id}/signed-waiver returns 404
- [x] No waiver fields on bookings or booking items
- [ ] Option A: Set up signedWaiver webhook to receive real-time waiver events and store in DB
- [ ] Option B: Track waivers manually via staff marking on booking cards

## Bug - Live availability screen not syncing with Roller bookings
- [x] Investigate how the live availability screen fetches its data
- [x] Root cause: UTC vs PST date bug in getTodaySessions (same as getTodayBookings)
- [x] After 4 PM PST, toISOString() returned tomorrow's date, showing wrong day's availability
- [x] Fixed: Use toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }) for PST date
- [x] Also fixed same UTC bug in: getAvailability default date, addDaysPST helper, rollerPolling.ts
- [x] Verified: Roller availability API correctly reflects real-time booking capacity
- [x] Example: 10 AM slot shows 7 remaining (12 max - 5 booked by Cody Pitts) ✓
- [x] All 34 existing tests still passing

## Feature - Show only first names for Roller guests (privacy)
- [x] Update backend to return only first names for Roller booking guests
- [x] Verify booking cards show first names only (Cody, Katherine, Sophia, Julia, Regina)

## Feature - Roller guests use booked time slot (no makeup time)
- [x] Mark Arrived auto-creates a guest session using booked start/end times (not arrival time)
- [x] Session timer in Walk-Ins shows remaining time in their fixed slot (93m remaining for 10-11 AM slot at 9:26 AM)
- [x] If guest arrives late, timer still counts down from booked end time
- [x] Undo arrival also removes the auto-created guest session (deletes by rollerBookingRef)
- [x] Fixed timezone: PST/PDT offset detection for correct Date construction
- [x] Duration auto-detected: 60min Cat Lounge, 90min Study, 30min Mini Meow
- [x] Walk-Ins tab shows Roller sessions with orange "Roller" badge
- [x] 34 tests passing

## Feature - Welcome notice on TV for Roller guest arrivals
- [x] Investigated: WelcomeOverlay polls getRecentlyCheckedIn every 5s, detects new session IDs
- [x] Root cause: Roller sessions had future checkInAt (booked start time), not current time
- [x] Fix: Updated getRecentlyCheckedIn to also check createdAt within last 60 seconds
- [x] Trigger the same welcome notice when Mark Arrived is tapped for Roller guests
- [x] Show guest first name and party size on the TV welcome screen
- [x] Updated SESSION_LABELS: added 90min Study Session, renamed 60min to Cat Lounge Session
- [x] Verified: Welcome notice appears on TV display ("Welcome, Cody! Party of 5")

## Bug (FIXED) - 2 x 30-min Mini Meow Sessions counted as single 60-min session
- [x] Investigated: quantity=2 means 2 guests, not 2 sessions. Duration was wrong due to two bugs:
- [x] Root cause 1: productNameMap used numeric keys but Roller API productId is a string → Map lookup always missed
- [x] Root cause 2: Fallback only checked for "study" (90min), defaulted everything else to 60min → Mini Meow got 60min
- [x] Fix: Convert all Map keys to String() for consistent lookups
- [x] Fix: Added Mini Meow detection in fallback ("mini" or "meow escape" → 30min)
- [x] Verified: Armen 2:00-2:30 PM Mini Meow Escape (30 mins) ✓, Julia 12:00-12:30 PM ✓, Kristy 12:00-12:30 PM ✓
- [x] Also fixed: Product names now show correctly ("Mini Meow Escape (30 mins)" instead of "Cat Lounge Session")

## Feature - Daily guest summary at top of Guests tab
- [x] Add summary bar above the tabs showing combined Roller + Walk-in totals
- [x] Show: Total guests today (54), Roller (25 guests, 13 bookings, 2 arrived), Walk-Ins (29, 16 done), Active (0 sessions)
- [x] Total card has warm orange gradient to stand out
- [x] Summary auto-refreshes (Roller every 30s, Walk-In stats every 10s)
- [x] Loading skeleton while data fetches
- [x] Verified in browser, 34 tests passing

## Feature - Visual timeline for Roller Bookings
- [x] Add a horizontal timeline showing the day's time slots (10 AM – 6 PM, auto-scaled)
- [x] Show booking blocks positioned by their start/end times on the timeline
- [x] Add a "now" indicator line (red line + dot) with live "Now: 4:45 PM" badge
- [x] Color-code blocks: blue=upcoming, green=arrived, gray=completed, red=no show
- [x] Show guest name and party size on each block, checkmark icon for arrived
- [x] Hover tooltip with full details (name, time range, product, arrival status)
- [x] Stack overlapping bookings in multiple rows (auto-layout)
- [x] Timeline auto-scrolls to center on current time
- [x] Only show on "Today" filter
- [x] Legend bar: Upcoming, Arrived, Completed, Now
- [x] Hour grid lines with dashed separators
- [x] Verified in browser, 34 tests passing

## Feature - Clickable timeline blocks
- [x] Make timeline booking blocks clickable (cursor pointer, hover scale, active press)
- [x] Clicking a block scrolls to the corresponding booking card in the list (smooth scroll, centered)
- [x] Add visual feedback: orange ring-2 highlight on target card that fades after 2 seconds
- [x] Uses data-booking-ref attribute on cards for DOM targeting
- [x] Verified in browser: Gisella and Erika blocks both scroll correctly, 34 tests passing

## Feature - Timeline block popover with quick actions
- [x] Add popover that appears when clicking a timeline booking block
- [x] Show guest name, time, product, party size, and status in popover
- [x] Add "Mark Arrived" button in popover (only for upcoming/not-yet-arrived bookings)
- [x] Add "View Details" button that scrolls to the booking card
- [x] Show "Arrived" status and "Undo" option for already-arrived guests
- [x] Popover dismisses when clicking outside
- [x] Verify in browser and run tests

## Bug Fix - Timeline first hour label cut off
- [x] Fix 10AM (or first hour label) getting clipped at the left edge of the timeline
- [x] Change timeline to fixed 8 AM – 8 PM range (instead of dynamic based on bookings)

## Feature - Waiver Status Integration (Roller API)
- [x] Add server-side endpoint to fetch signed waiver by signedWaiverId from Roller API
- [x] Add batch waiver status lookup for all tickets in a booking (via booking detail API)
- [x] Display waiver status badge on each booking card (valid/expired/missing)
- [x] Detect and flag minors using isForMinor field
- [x] Link minor waivers to parent/guardian waiver via parentSignedWaiverId
- [x] Show waiver expiry warnings for waivers expiring within 30 days
- [x] Write tests for waiver endpoints and logic (15 tests, 284 total passing)

## UI - Reorder Admin Dashboard Sidebar
- [x] Add drag-to-reorder for admin dashboard tabs
- [x] Persist custom tab order in localStorage
- [x] Add reset-to-default option
- [x] Ensure tabs stay centered per design preference

## Bug Fix - Roller guest countdown starts before session
- [x] Fix countdown timer for Roller guests to only start at booked session start time
- [x] Show "Starts at X:XX" instead of countdown before session begins

## Feature - Waiver badge in timeline popover
- [x] Add WaiverBadge component inside the timeline block popover

## Bug Fix - Waiver badge showing unicode escape text
- [x] Replace unicode escapes with actual characters in WaiverBadge component

## Bug Fix - Transparent images show white box on Apple TV
- [x] Find and fix white background behind transparent images on custom slides for Apple TV

## Config - Roller polling interval
- [x] Change Roller API polling interval to every 30 minutes

## Feature - Session type badges on booking cards
- [x] Add colored session type badge (Mini Meow 30m, Full Purr 60m, Study Sesh 90m) to Roller booking cards
- [x] Add session type indicator to timeline block popovers
- [x] Parse session type from booking notes/product name + color-coded timeline blocks by session type

## Bug Fix - Cat photo uploads not auto-saving
- [x] Fix cat photo uploads not auto-saving when photos are uploaded during cat profile editing

## Bug Fix - Roller booking sort order
- [x] Fix bookings moving to bottom when session starts — should only move to bottom when session ends (completed)

## Feature - Manual Sync Now button
- [x] Add server-side endpoint to trigger immediate Roller poll
- [x] Add Sync Now button to the Guests tab header
- [x] Show loading state and last synced timestamp

## Feature - Show booking add-ons from Roller
- [x] Investigate Roller booking detail API for add-on data
- [x] Surface add-ons on booking cards in the Guests tab

## Bug Fix - Add-on product names showing as Product #ID
- [x] Fix product name resolution for add-on items (showing raw ID instead of name) — now uses /products endpoint for full catalog

## Feature - Walk-in session status counters
- [x] Add active/ended session counters to the Walk-Ins tab header

## Feature - Early arrival option for Roller guests
- [x] Add server-side support for starting session early (startNow flag on markArrived)
- [x] Add confirmation dialog when marking arrived before booking time: "Start Now" vs "Start at Booked Time"
- [x] Adjust session timer/expiry based on chosen start time

## Performance - Reduce excessive API calls (15,913 reported)
- [x] Investigate sources of excessive API calls
- [x] Optimize polling intervals, caching, and redundant fetches

## Bug Fix - Booking status stays 'Upcoming' after early arrival
- [x] Fix status not updating to 'Checked In' when guest is marked arrived early

## Feature - Guest Photo Upload & Voting for Adoption Slides
### Database & Backend
- [x] Design and create database tables for guest photos, votes, and donation tokens
- [x] Server endpoints: upload photo (max 3 per cat per guest), get photos for cat, vote on photo
- [x] Server endpoint: get top 3 voted photos per cat
- [x] Enforce 1 free vote per person per photo (fingerprint/session-based)
### Stripe Donation Voting
- [x] Integrate Stripe for donation vote token purchases
- [x] Donation tiers: $1/5 votes, $5/30 votes, $10/75 votes
- [x] Track donation tokens per user and apply extra votes
### Guest-Facing Pages
- [x] Mobile-friendly photo upload page (tagged to specific cat)
- [x] Voting page showing cat photos with vote counts + kennel card personality info
- [x] Shareable link per cat for social sharing
### Adoption Slide Template
- [x] New adoption slide template showing top 3 voted guest photos
- [x] Include kennel card personality data on the slide
- [x] Auto-rotate through top photos
### QR Code & Sharing
- [x] Generate QR code for each cat's voting page (display in lounge/on TV)
- [x] Social sharing with preview cards for voting links
### Tests
- [x] Write tests for photo upload, voting, and donation token logic

## Bug Fix - Stripe Donation Redirect URL
- [x] Fix: After Stripe donation checkout, redirect goes to /vote/:catId instead of /vote/cat/:catId causing 404

## Feature - Guest-Facing Homepage Redesign
- [x] Redesign homepage from internal tool landing to guest-facing welcome page
- [x] Add hero section welcoming guests to Catfé with warm branding
- [x] Add "How It Works" section explaining photo voting system step-by-step
- [x] Add "Meet Our Cats" section with CTA to browse cats and vote
- [x] Add "Upload Your Photos" section explaining how guests can submit content
- [x] Add donation tiers explanation showing how extra votes support the cats
- [x] Add "Happy Tails" and "Snap & Purr" upload CTAs
- [x] Keep admin/staff links accessible but not primary focus
- [x] Mobile-optimized layout for guests scanning QR codes in the lounge

## Simplify Homepage - Remove Snap & Purr
- [x] Remove Snap & Purr from quick action cards on homepage
- [x] Remove Snap & Purr from "More Ways to Participate" section
- [x] Remove Snap & Purr from FAQ section
- [x] Remove Snap & Purr from footer links
- [x] Keep Photo Contest as the primary guest experience
- [x] Keep Happy Tails as a secondary option (different purpose - adopted cats)

## Feature - Cat Profile Action Links
- [x] Add "Book a Visit" button to cat voting profile page (links to Catfé booking)
- [x] Add "Adopt Me" link/button to cat voting profile page (links to adoption form)

## Bug Fix - No back navigation on cat voting page
- [x] Add back link/button to return to all cats list from individual cat voting page

## Redesign - Cat Voting List Page
- [x] Remove personality pill tags from cat cards
- [x] Add more spacing/breathing room to cat card layout
- [x] Make cards less squished overall

## Feature - Weekly Contest Cycles
### Database
- [x] Create contest_rounds table (id, roundNumber, startAt, endAt, status, createdAt)
- [x] Create contest_winners table (id, roundId, catId, photoId, rank, voteCount, createdAt)
- [x] Add roundId foreign key to guest_cat_photos table
### Server Logic
- [x] Build round management: create/get current round, close round, archive winners
- [x] Auto-reset logic: on first request after round ends, close old round and start new one
- [x] Winner archiving: save top 3 photos overall when round closes
- [x] New round scopes photos/uploads/votes to current round only
- [x] tRPC procedures for round info, past winners
### Frontend
- [x] Add countdown timer to cat voting page and cat list showing time remaining
- [x] Show current round number/week on voting pages
- [x] Build past winners gallery page (/vote/winners)
- [x] Add winner badges to photos that won previous rounds
- [x] Add navigation link to past winners from voting pages
### Tests
- [x] Write tests for contest round management and winner archiving

## Feature - Photo Upload Consent Notice
- [x] Add consent notice on upload section: uploading grants Catfé permission to use photo on social media

## Change - Update Donation Vote Token Tiers
- [x] Update server stripe-products.ts: $1=1 vote, $5=5 votes, $10=15 votes
- [x] Update webhook token granting logic (uses getTokensForAmount, no change needed)
- [x] Update frontend donation tier display on CatVotingPage and Home page

## Bug Fix - Military Time on Early Arrival
- [x] Fix early arrival time display in Roller tab to use 12-hour format (AM/PM) instead of 24-hour military time

## Bug Fix - Sessions Auto-Activating Before Booked Time
- [x] Fix: Roller booking sessions are being created/activated before their booked start time and before guest is marked as arrived
- [x] Root cause: parseSessionTime() used server-local (UTC) time instead of PST/PDT, so 11:30 AM PST was interpreted as 11:30 UTC (3:30 AM PST)
- [x] Sessions should only start when: (a) guest is manually marked as arrived, or (b) their booked time begins (within 5 min window)

## Feature - Show Countdown on Roller Booking Card
- [x] Show session countdown timer directly on the Roller booking card once guest is marked as arrived
- [x] Add +15m, +30m extend buttons and Out button on the booking card for arrived guests
- [x] Remove need to switch to Walk-Ins tab to see Roller session countdowns

## Cleanup - Hide Roller Sessions from Walk-Ins
- [x] Filter out Roller-originated sessions from Walk-Ins active sessions list
- [x] Roller sessions are now fully managed from the Roller booking card (countdown, extend, checkout)

## Feature - Apple TV: Guest Photos in Adoption Slides
- [x] Update backend API to include top-voted guest photos for each cat in adoption slide data
- [x] Fallback to admin photo if no guest photos submitted for a cat
- [x] Update tvOS AdoptionScreenView to show top guest photo (or rotate through top 3)
- [x] Update tvOS AdoptionShowcaseScreenView to use top guest photo per cat with fallback
- [x] Add GuestPhotoContestScreenView to tvOS app for the contest leaderboard slide
- [x] Update tvOS Models.swift with guest photo data structures
- [x] Update tvOS APIClient to parse guest photo data
- [x] Register new Swift files in Xcode project (GuestPhotoContestScreenView.swift)

## Bug Fix - tvOS Theme.swift Build Error
- [x] Fix Xcode build error in Theme.swift (added missing .guestPhotoContest case to accentColor switch)

## Feature - GUEST_PHOTO_CONTEST Admin Screen for TV Rotation
- [x] Add GUEST_PHOTO_CONTEST to screen type enum in database schema (already existed)
- [x] Add GUEST_PHOTO_CONTEST to admin screen type selector dropdown (already in SCREEN_TYPES)
- [x] Create GuestPhotoContestScreen web TV display renderer (already existed)
- [x] Add backend endpoint to serve contest leaderboard data for TV (getTopPhotosForTV already existed)
- [x] Ensure screen appears in TV rotation alongside adoption slides (added default 20s duration)
- [x] Update tvOS ScreenView routing for guestPhotoContest type (already routed)
- [x] Write tests for guest photo contest screen (catPhotos.test.ts covers getTopPhotosForTV)
- [x] Push tvOS changes to GitHub

## Cleanup - Remove Static Full Purr/Mini Meow Countdowns from Guest Status Board
- [x] Remove static session window countdown timers from web Guest Status Board screen
- [x] Remove static session window countdown timers from tvOS GuestStatusBoardScreenView
- [x] Roller now handles all session tracking — static countdowns are obsolete
- [x] Write/update tests for Guest Status Board changes (updated labels to Cat Lounge/Study Sesh, added 90-min)

## Feature - Photo Contest QR Code Screen for TV
- [x] Add PHOTO_CONTEST_QR to screen type enum in database schema
- [x] Add PHOTO_CONTEST_QR to shared types (SCREEN_TYPES, SCREEN_TYPE_CONFIG, SCREEN_TYPE_DURATIONS)
- [x] Create PhotoContestQRScreen web TV display renderer
- [x] Update tvOS Models.swift with new screen type
- [x] Create tvOS PhotoContestQRScreenView
- [x] Update tvOS ScreenView routing
- [x] Write tests (326 passing)
- [x] Push tvOS changes to GitHub

## Bug Fix - PHOTO_CONTEST_QR rejected by Zod validation
- [x] Add PHOTO_CONTEST_QR to the Zod z.enum() validation in server/routers.ts screen creation endpoint

## Redesign - Photo Contest QR Screen (too boring/plain)
- [x] Redesign tvOS PhotoContestQRScreenView with vibrant animated layout
- [x] Add warm amber gradient background, floating camera/trophy emojis, sparkle effects
- [x] Make QR code larger and more prominent with glowing border
- [x] Add engaging call-to-action text and step-by-step instructions (3-step flow)
- [x] Push tvOS changes to GitHub

## Improvement - Add contest instructions to Photo Contest QR Screen
- [x] Add clear "How It Works" instructions to tvOS PhotoContestQRScreenView
- [x] Add matching instructions to web PhotoContestQRScreen
- [x] Push tvOS changes to GitHub

## Feature - Filter expired sessions from TV display (keep in admin for manual check-out)
- [x] Filter expired sessions from web TV GuestStatusBoardScreen after 2-min grace period
- [x] Filter expired sessions from web TV GuestReminderOverlay after 2-min grace period
- [x] Remove static Full Purr & Mini Meow scheduled reminders from web GuestReminderOverlay
- [x] Update tvOS GuestStatusBoardScreenView to filter expired sessions (2-min grace period)
- [x] Push tvOS changes to GitHub
- [x] Test the flow end-to-end (326 tests passing)

## Feature - Admin Photos Tab Reorganization with Sub-tabs
- [x] Review current admin Photos tab structure
- [x] Add sub-tabs: Photo Contest, Snap & Purr, Happy Tails (centered)
- [x] Build Photo Contest sub-tab with: current round info, leaderboard, reset votes, new round, past rounds
- [x] Move Snap & Purr gallery to its own sub-tab (with type filtering)
- [x] Move Happy Tails submissions to its own sub-tab (with type filtering)
- [x] Add backend endpoints: getContestStats, getPhotosForCurrentRound, resetCurrentRoundVotes, forceNewRound, getAdminPastRounds
- [x] All 326 tests passing

## Bug Fix - Roller Guest Check-Out Button Not Working
- [x] Investigate why clicking 'Out' on Roller guests does nothing (isPast hid button when status=expired)
- [x] Fix: Show red 'Check Out (Session Expired)' button for expired sessions, hide extend buttons
- [x] All 326 tests passing

## Feature - Homepage Redesign as Photo Contest Landing Page
- [ ] Review current homepage structure and guest-facing routes
- [ ] Design new hero section with contest branding and CTA
- [ ] Add "How It Works" section explaining the contest flow
- [ ] Add featured/top-voted cats section with live leaderboard preview
- [ ] Add photo upload section with links to Snap & Purr and Happy Tails
- [ ] Add contest stats/social proof section
- [ ] Ensure mobile-responsive design
- [ ] Keep navigation to voting, upload, and other pages

## Bug Fix - Roller booking card not refreshing after check-out + frozen countdown
- [x] Fix: Card doesn't disappear/update after successful check-out (toast shows but card stays)
- [x] Fix: Countdown timer is frozen (not ticking down) on Roller booking cards
- [x] Ensure proper invalidation/refetch after check-out so card reflects completed status
- [x] Verify countdown ticks every second for active Roller sessions

## Bug Fix - Roller POS treat purchase adds extra session time
- [x] Investigate why buying cat treats at Roller POS adds time to guest session
- [x] Fix session creation/extension logic to ignore non-session purchases
- [x] Verify treat purchases no longer affect session countdown

## Session History on Roller Booking Card
- [x] Add session history section to BookingCard showing check-in and check-out times
- [x] Include session duration info (how long the guest was in the lounge)
- [x] Ensure data is available from server (sessionCheckInAt, sessionExpiresAt, sessionStatus, checkOutAt)
- [x] Style the history section to be compact and informative
- [x] Write tests for the new feature

## New Landing Page
- [x] Redesign the public-facing landing page for Catfé
- [x] Hero section with warm, inviting imagery and CTA
- [x] How It Works section explaining the cat lounge experience
- [x] Meet the Cats / adoptable cats preview
- [x] Get Involved section (volunteer, donate, visit)
- [x] Location & hours info for Santa Clarita
- [x] Mobile-responsive design
- [x] Keep navigation to photo contest, voting, and other existing pages

## Enhancement - Add Guest Photos to Landing Page
- [x] Add backend endpoint to fetch approved guest photos for the landing page
- [x] Add scrolling photo strip to hero section from Snap & Purr photos
- [x] Add photo mosaic to experience section using Snap & Purr photos (1 large + 4 small)
- [x] Add Happy Tails gallery to adoption section with hover cat names
- [x] Add photo contest leaderboard to activities section (top 3 with medals, fallback to donation tiers)
- [x] Ensure photos load efficiently with lazy loading
- [x] Fallback gracefully when no photos are available
- [x] Write tests for photo integration logic (12 tests)

## Feature - Events Calendar Section on Landing Page
- [x] Investigate existing event data and backend endpoints
- [x] Create public endpoint to fetch upcoming events for the landing page
- [x] Build events calendar section with event cards (date badge, title, time, location, description)
- [x] Add visual event cards with today/past/upcoming styling
- [x] Handle empty state when no upcoming events exist (section hides)
- [x] Integrate into the landing page between Activities and Get Involved
- [x] Add Events nav link in top navigation
- [x] Write tests for events calendar logic (14 tests)

## Bug Fix - Mobile Responsiveness Issues on Landing Page
- [x] Audit all sections on mobile viewport (375px width)
- [x] Add hamburger menu for mobile nav (slide-down drawer with Menu/X toggle)
- [x] Fix How It Works: grid-cols-2 md:grid-cols-4 (2x2 on mobile)
- [x] Fix Experience: grid-cols-1 md:grid-cols-2 (stacks on mobile)
- [x] Fix Adopt Steps: grid-cols-1 sm:grid-cols-3 (stacks on mobile)
- [x] Fix Activities: grid-cols-1 sm:grid-cols-3 (stacks on mobile)
- [x] Fix Get Involved: grid-cols-1 sm:grid-cols-3 (stacks on mobile)
- [x] Fix Happy Tails gallery: grid-cols-3 md:grid-cols-6 (larger on mobile)
- [x] Fix Quick Info bar: grid-cols-2 md:grid-cols-4 (2x2 on mobile)
- [x] Improve hero text sizing on mobile (progressive text-xl sm:text-2xl md:text-4xl)
- [x] Fix event card image (hidden when no image, shows calendar icon fallback)
- [x] Verify responsive classes at all breakpoints (verified via code audit)

## Bug Fix - How It Works Step Numbers Not Centered
- [x] Fix step number badges floating to top-right corner of icon instead of being centered
- [x] Numbers should be centered above the icon in a vertical stack layout

## Bug Fix - LOGO Screen Type Missing from Zod Validation
- [x] Add LOGO to screenTypes array in server/routers.ts (was causing "Invalid option" error when creating new screens)

## Bug Fix - LOGO Not in Frontend Screen Type Selector
- [x] Add LOGO to the frontend screen type dropdown/selector when creating new slides
- [x] Add LOGO to database schema screenTypeEnum and push migration

## Bug Fix - Image Previews Showing Question Marks
- [x] Fix broken image previews on screens and settings pages - migrated image upload from GitHub API to S3 storage

## tvOS App Fixes
- [x] Remove static countdown timers from Session Board - use Roller booking data instead
- [x] Fix screens not displaying full screen on Apple TV - added ignoresSafeArea to BaseScreenLayout and ScreenView, changed ContentView background to loungeCharcoal
- [x] Remove Full Purr & Mini Meow countdown overlay widget from tvOS ContentView (bottom-left corner)
- [x] Fix duplicate guest sessions on Guest Status Board (same guest showing multiple times with different session types)
- [x] Add booking-level deduplication: only 1 session per Roller booking (filters out Child Admission, Treats, etc.)
- [x] Add database-level dedup: createGuestSession checks for existing rollerBookingRef before inserting
- [x] Export isSessionProduct as shared function (rollerWebhook.ts imports from rollerPolling.ts)
- [x] Update getTodayBookings enrichment to pick primary session item (not items[0])
- [x] Add LOGO screen renderer to web TV app (warm gradient, paw print accents, settings logo)

## Bug Fix - Session Extension Not Updating End Time on Web Admin
- [x] Fix: When extending a guest session time, the session still shows as expired at the original end time on the web admin side (works correctly on Apple TV app)
- [x] Root cause: booking status was computed from Roller's static sessionEndTime, not from DB expiresAt
- [x] Fix: after linking DB session data, trust DB session status over Roller time-based status
- [x] Added visual indicator: when session is extended, show updated end time in blue (→ 1:15 PM)
- [x] Added 5 tests for session extension status override logic

## Roller Guests Stay on TV Until Manual Checkout
- [x] Roller guests should remain on TV status board even after session time expires
- [x] Sessions should only disappear from TV when staff manually checks them out
- [x] Expired-but-not-checked-out sessions should be visually distinct (red border, pulsing TIME UP, checkout prompt)
- [x] Countdown reminder overlay should also persist until manual checkout (red TIME UP with front desk prompt)

## Undo Check-In for Walk-In Sessions
- [x] Add backend procedure to delete/undo a walk-in guest session
- [x] Add "Undo Check-In" button to admin walk-in sessions UI
- [x] Include confirmation dialog to prevent accidental undos
- [x] Write tests for the undo check-in feature

## Undo Check-In Time Window
- [x] Limit Undo Check-In button to 5 minutes after initial check-in
- [x] Update tests for time window behavior (7 tests covering edge cases)

## Tomorrow's Roller Timeline
- [x] Update backend getTodayBookings to accept a date parameter (already supported: today/tomorrow/week/month)
- [x] Enable timeline view for Tomorrow filter (was only showing for Today)
- [x] Show upcoming/active counts for Tomorrow filter in summary bar
- [x] All 388 tests passing

## Move Today's Timeline Above Tabs
- [x] Move today's booking timeline above the tab navigation so it's always visible
- [x] Timeline shows regardless of which tab is active (Roller, Walk-Ins, etc.)
- [x] Created TodayTimelineBar component with its own data fetch + mark arrived/early arrival handling
- [x] Tomorrow's timeline still shows inside the Roller Bookings tab when Tomorrow filter is selected

## Sticky Timeline
- [x] Make today's timeline sticky at the top of the page when scrolling
- [x] Added frosted glass background (bg-background/95 + backdrop-blur) and subtle bottom border/shadow when stuck

## Photo Contest Callout on Adoption Slide
- [x] Add a photo contest callout/banner to the individual adoption TV slide (bottom right)
- [x] Add a photo contest callout/banner to the adoption showcase grid slide (bottom right)
- [x] Animated camera + trophy icons with warm amber styling matching the adoption theme

## Photo Contest Callout on tvOS Adoption Screens
- [x] Add photo contest callout to tvOS AdoptionScreenView (individual cat) — under Meet [Cat Name] on polaroid
- [x] Add photo contest callout to tvOS AdoptionShowcaseScreenView (grid) — under each cat name in cards
- [x] Push changes to GitHub (commit 27a8b6d)

## Move Timeline to Admin Layout Level
- [x] Move today's timeline above all admin page tabs (Cats, Screens, Guests, etc.)
- [x] Remove sticky behavior from the timeline
- [x] Extracted TodayTimeline into standalone component (TodayTimeline.tsx)
- [x] Removed TodayTimelineBar from GuestCheckIn.tsx
- [x] Tomorrow's timeline still shows inside Roller Bookings tab
- [x] Timeline is now visible on all admin pages (rendered in Admin.tsx above Tabs)

## Fix tvOS Photo Contest Callout Position
- [x] Move photo contest callout below "Meet [Cat Name]" title (not on the polaroid card)
- [x] Push clean updated Xcode files to GitHub (commit 7713990)
- [x] Cat-renamed xcodeproj (11110-.xcodeproj) is only local — GitHub still has correct CatfeTV.xcodeproj

## Adoption Slide Redesign
- [x] Create 4 design concept previews for the adoption TV slide
- [x] Present designs for selection (Concept 2 "Modern Magazine" chosen)
- [x] Implement the Modern Magazine design on web TV
- [x] Update tvOS adoption screen to match the new design

## tvOS Modern Magazine Adoption Screen
- [x] Rewrite tvOS AdoptionScreenView.swift to match the web Modern Magazine design
- [x] Push updated files to GitHub (commit 57e8d34)

## Fix tvOS Build Error - QRCodeGenerator Type Mismatch
- [x] Fix QRCodeGenerator.generate size parameter: Int → CGSize(width: 260, height: 260)
- [x] Push fix to GitHub (commit aec827b)

## Session Board Redesign — Magazine Split (Concept 3)
- [x] Research Snap & Purr photo data access (API, schema)
- [x] Implement Magazine Split session board on web (GuestStatusBoardScreen)
- [x] Use Snap & Purr gallery photos rotating on the left panel
- [x] Orange accent divider matching adoption screen design
- [x] Clean cream right panel with compact session cards
- [x] Implement Magazine Split session board on tvOS (GuestStatusBoardScreenView.swift)
- [x] Push updated tvOS files to GitHub (commit bdccfdd)
- [x] Test and save checkpoint (version a717ac77)

## Spotlight Donation Feature (Replaces Photo Contest Voting)
- [x] Research current voting/token system to understand what to remove
- [x] Design spotlight_donations database table
- [x] Create Stripe products for donation tiers ($1/5min, $3/30min, $5/1hr, $10/all-day)
- [x] Build Stripe checkout flow for spotlight donations
- [x] Build webhook handler for completed spotlight donations
- [x] Build server-side spotlight query (active spotlights per cat)
- [x] Build frontend: Spotlight Donation UI on photo detail/contest page
- [x] Update adoption screen TV display to show active spotlight photos
- [x] Update tvOS adoption screen callout text (Photo Contest → Spotlight)
- [x] Remove old voting system (votes, tokens, buy-votes UI) — text updated across all screens, voting endpoints kept as stubs for backward compat
- [x] Handle overlapping donations: alternate featured photos in rotation (server returns all active, TV alternates)
- [x] Test end-to-end flow (TS clean, server running)

## Adoption Screen QR Code — Link to Cat Profile
- [x] Update web adoption screen QR to link to /vote/cats/:catId (per-cat profile)
- [x] Update tvOS adoption screen QR to link to per-cat profile (commit 6f94b12)
- [x] Ensure cat profile page has both upload photo and adopt options (already has Upload button + Adopt Me link)

## Photo Contest QR Screen Redesign → Snap & Purr Spotlight
- [x] Study current web and tvOS Photo Contest QR screens
- [x] Redesign web PhotoContestQRScreen with Spotlight branding (Magazine Split layout)
- [x] Redesign tvOS PhotoContestQRScreenView with Spotlight branding (Magazine Split layout)
- [x] Push tvOS changes to GitHub (commit 6a334a6)

## Guest Photo Contest → Active Spotlights Board
- [x] Research current Guest Photo Contest slide (web + tvOS)
- [x] Repurpose web GuestPhotoContestScreen into Active Spotlights Board
- [x] Repurpose tvOS GuestPhotoContestScreenView into Active Spotlights Board
- [x] Add tRPC endpoint for fetching all active spotlights (already exists: catPhotos.getAllActiveSpotlights)

## Snap & Purr Gallery → Multi-Photo Grid Layout
- [x] Research current Snap & Purr Gallery slide (web + tvOS)
- [x] Redesign web SnapAndPurrScreen to show multi-photo grid (3x2 grid, Magazine Split layout)
- [x] Redesign tvOS SnapPurrGalleryScreenView to show multi-photo grid (3x2 grid, Magazine Split)
- [x] Push all changes to GitHub (commit 4776a8d)

## Expired Guest Session Cleanup
- [x] Add admin UI to view and check out expired ("TIME'S UP") sessions
- [x] Add bulk "Check Out All Expired" button in admin
- [x] Add auto-checkout for expired sessions (server-side endpoint: guestSessions.checkOutExpired)
- [x] Ensure expired sessions don't show on the TV session board (already filtered by 2-min grace period)

## tvOS Build Fix - GuestPhotoContestScreenView
- [x] Fix ScreenImage "Extra arguments at positions #3, #4" errors in GuestPhotoContestScreenView.swift (leftPanel + spotlightCard)

## Clean Up Expired Sessions from TV Display
- [x] Check out all expired sessions in the database (set status=completed for expiresAt < now)
- [x] Ensure TV session board API auto-checks-out expired sessions server-side before returning results
- [x] tvOS already uses the same API — no separate change needed

## Event Screen Redesign - Split Diagonal (Concept B)
- [x] Implement Split Diagonal event screen in web TV renderer (ScreenRenderer.tsx)
- [x] Implement Split Diagonal event screen in tvOS native app (EventsScreenView.swift)
- [x] Test and deliver

## Adoption Slides - Show Cat Gender (Male/Female)
- [x] Add gender display to web TV adoption screen (AdoptionScreen - already in subtitle via generateCatSlides)
- [x] Add gender display to web TV adoption showcase screen (AdoptionShowcaseScreen - added ♂/♀ icons)
- [x] Add gender display to tvOS adoption screens
- [x] Test and deliver

## Fix tvOS Event Screen Diagonal Layout
- [x] Fix diagonal split cutting through text — reposition content safely into cream panel
- [x] Ensure event image fills left triangle properly, text stays in right cream area

## Fix tvOS Event Screen - Empty Space & Content Centering
- [x] Vertically center content in right panel instead of top-aligning
- [x] Increase font sizes and spacing to fill the area better
- [x] Push badge down to avoid weather/clock overlay at top-right

## Admin Event Screen - Add Date Field
- [x] Check if eventDate column exists in screens table schema (added it)
- [x] Add eventDate input field to admin event screen editor
- [x] Ensure eventDate is saved to DB and returned in API
- [x] Verify it displays on TV event slides (web uses eventDate with startAt fallback)

## Hide Adoption Fee on Cat Profile
- [x] Hide adoption fee display on cat profile page (CatVotingPage.tsx)

## Fix Adoption Slides - Use Cat Profile Photo
- [ ] Investigate how adoption slides get their images (generateCatSlides)
- [ ] Fix adoption slides to pull photo from cat profile in database
- [ ] Investigate why 5-min flash photo upload didn't appear on Lucy's slide
- [ ] Test and deliver

## Spotlight Indicator on Cat Profile
- [x] Add visual spotlight indicator on cat profile page when cat has active spotlight
- [x] Show spotlight details (donor name, photo thumbnails, glowing card border)

## Spotlight on Apple TV Adoption Slides
- [x] Check how web TV renderer shows spotlight photos on adoption slides
- [x] Ensure tvOS adoption screen shows spotlight photos when active
- [x] Ensure the API returns spotlight data with adoption slides

## Debug Spotlight Flow - Not Working on Emma
- [ ] Check if spotlight donation records exist in DB after payment
- [ ] Check Stripe webhook logs for delivery status
- [ ] Verify the full flow: photo upload → payment → webhook → DB record → API → TV display
- [ ] Fix any broken links in the chain

## Fix: Spotlight showing on Active Spotlights board but NOT on cat's adoption slide (tvOS)
- [x] Debug: screen.numericId was 130010 (100000+catId) but spotlight.catId was 30010 — mismatch
- [x] Fix: added catId field to API, Screen model, and adoption screen matching logic

## Happy Tails - Family Photo Upload for Adopted Cats
- [x] Investigate current Happy Tails screen and adopted cat profile flow
- [x] Allow adopted cat families to upload photos to the cat's album
- [x] Show family-uploaded photos on the Happy Tails TV slide (web)
- [x] Show family-uploaded photos on the Happy Tails TV slide (tvOS)
- [x] Test and deliver
## Happy Tails Upload Redesign — Adopted Cat Picker
- [x] Add backend endpoint to list adopted cats (status=adopted/adopted_in_lounge)
- [x] Redesign Happy Tails upload page: show adopted cat list instead of manual name entry
- [x] Family selects their cat from the list, then uploads photo
- [x] Link uploaded photo to the cat's ID in the database
- [x] Test the new upload flow end-to-end
## Active Spotlights Board — Cat Popularity Tracker Fallback
- [x] Add backend endpoint for cat popularity data (based on photos + spotlight donations)
- [x] Build web cat popularity tracker component for Spotlights Board fallback
- [x] Build tvOS cat popularity tracker for Spotlights Board fallback
- [x] Test the fallback display when no active spotlights exist

## Public Website — Cat Popularity Leaderboard
- [x] Audit current public website pages for best leaderboard placement
- [x] Build CatPopularityLeaderboard component with rankings, photos, medals
- [x] Integrate leaderboard into the public website (Activities section)
- [x] Add CTAs encouraging guests to upload photos and donate spotlights
- [x] Test the leaderboard display on desktop and mobile
- [x] Save checkpoint and deliver

## UI Cleanup
- [x] Remove Stripe test card text from Spotlight this Photo flow

## Rename Photo Contest & Photo Delete
- [x] Rename "Photo Contest" tab to "Spotlights" across admin dashboard
- [x] Update all related labels, headings, and references (rounds, votes, leaderboard)
- [x] Add photo delete functionality to Snap & Purr admin tab
- [x] Add backend endpoint for deleting cat photos
- [x] Test rename and delete features

## Happy Tails Redesign — Phase 1
- [x] Add milestoneTag field to photoSubmissions schema
- [x] Add familyName field to photoSubmissions schema (cat's new name given by family)
- [x] Build backend API for cat alumni profile data (adopted cat + all approved Happy Tails photos)
- [x] Build /happy-tails Alumni Wall page with visual mosaic grid of adopted cats
- [x] Build /happy-tails/:catId individual Cat Alumni Profile page with gallery and timeline
- [x] Update upload flow with milestone tag selector and family name field
- [x] Update TV HappyTailsScreen to show family name and milestone tags
- [x] Update tvOS HappyTailsScreenView to show family name and milestone tags
- [x] Add /happy-tails to main website navigation (desktop + mobile)
- [x] Write tests for new endpoints (8 tests passing)
- [x] Test end-to-end and save checkpoint

## Happy Tails TV Slide Redesign
- [ ] Redesign web TV HappyTailsScreen with multi-photo collage layout
- [ ] Show 2-3 photos at once in a scrapbook/collage style
- [ ] Display family name ("CatName, now FamilyName") prominently
- [ ] Show milestone tag badges on photos
- [ ] Add warm scrapbook aesthetic with slightly rotated photos
- [ ] Redesign tvOS HappyTailsScreenView with matching multi-photo layout
- [ ] Test both web and tvOS displays
- [ ] Save checkpoint and deliver

## Bug Fix - tvOS Photo Rotation (Mar 1)
- [x] Fix: Happy Tails photos not rotating (only captions changed) - added .id(pageIndex) to force SwiftUI view rebuild
- [x] Fix: Snap & Purr Gallery photos not rotating (only captions changed) - added .id(page) to force SwiftUI view rebuild

## Feature - Roller Auto Check-in with Capacity-Aware Timer (Mar 1)
- [x] Add loungeCapacity field to settings table (default 12)
- [x] Add loungeCapacity input to admin settings UI
- [x] Add "waiting" status to guest session status enum
- [x] Add scheduledStartAt field to guest sessions (booked session time)
- [x] Update rollerPolling.ts with capacity-aware logic: if room → start immediately, if full → use booked time
- [x] Update rollerWebhook.ts with same capacity-aware logic
- [x] Add helper function to calculate current lounge occupancy from active sessions
- [x] Update TV Guest Status Board to show "waiting" guests differently (e.g., "Session starts at 2:30 PM")
- [x] Update tvOS GuestStatusBoardView to show waiting vs active guest states
- [x] Auto-transition waiting guests to active when their scheduled time arrives
- [x] Push DB migrations
- [x] Write tests for capacity-aware check-in logic
- [x] Test end-to-end and save checkpoint

## Bug Fix - Quick Purr Duration Mapping (Mar 1)
- [x] Fix: Quick Purr (15 min) showing as Full Purr - duration mapping not recognizing "Quick Purr" product name
- [x] Update session type labels to include Quick Purr
- [x] Update tvOS session type labels to include Quick Purr

## Bug Fix - Roller Check-in Not Creating Guest Session (Mar 1)
- [x] Diagnose why Julie's Roller POS check-in didn't create a guest session
- [x] Fix the root cause: Roller /bookings API doesn't return productName, only productId. Added resolveProductName() lookup before isSessionProduct() check

## Feature - Consistent Navigation Header Across All Pages (Mar 1)
- [x] Audit all pages and identify which ones are missing the header menu
- [x] Ensure all public-facing pages use the shared navigation header
- [x] Verify navigation works consistently across all pages
- [x] Add Roller booking ID to guest sessions (DB field, Roller polling/webhook storage, admin display with copy button)
- [x] Turn booking ID badge into a deep link that opens the booking directly in Roller POS
- [x] Allow expired guest sessions to still be extended (show extend button on expired sessions, update backend to allow it)
- [x] Fix Roller deep link URL to use https://pos.roller.app/search/bookings/ instead of manage.roller.app
- [x] Change auto-checkout to only trigger 30 minutes after session expiry (not immediately)
- [x] TV: Keep expired guest countdowns visible on status board until manually checked out
- [x] TV: Full-screen welcome splash for a few seconds when a guest checks in
- [x] Debug: Full-screen welcome splash not showing on Apple TV (added native WelcomeOverlayView.swift to tvOS app)
- [x] Replace SF Symbol cat icon with Catfé logo in tvOS WelcomeOverlayView
- [x] Add adopter email field to cat schema (stored when cat is marked adopted)
- [x] Update admin cat management UI to capture adopter email on adoption
- [x] Update Happy Tails posting flow to require adopter email verification before allowing photo uploads
- [ ] Auto-send welcome email to adopter with Happy Tails direct link when cat is marked adopted with an email
- [x] Bug fix: Happy Tails email verification not blocking mismatched emails — frontend was only doing format check, now calls backend verifyAdopterEmail endpoint
- [x] Bug fix: Email verification STILL not blocking wrong emails — was a deployment issue, code works correctly on dev server (verified via curl tests)
- [x] Add 'New Cat' banner on TV display and web for cats in the lounge for 2 weeks or less

- [x] Move "New Cat!" badge from top-left to bottom-left corner of photo (tvOS + web TV) to avoid waiver QR overlap

## Feature - Cat Birthday Tracking
- [x] Add birthday field to cats database schema (already had dob field)
- [x] Add birthday input to admin cat editor UI (already had DOB input)
- [x] Add birthday banner logic to backend (flag cats with upcoming/today birthday)
- [x] Show birthday banner on web TV individual cat slides
- [x] Show birthday banner on web TV showcase grid cards
- [x] Update tvOS Models.swift with birthday fields
- [x] Show birthday banner on tvOS individual cat slides (AdoptionScreenView)
- [x] Show birthday banner on tvOS showcase grid (AdoptionShowcaseScreenView)

## Feature - Admin Birthday Dashboard Widget
- [x] Add backend endpoint for upcoming cat birthdays (next 30 days)
- [x] Build birthday widget component with cat photo, name, date, days away
- [x] Integrate widget into admin dashboard

## Feature - Auto-Generated Birthday Celebration TV Slide
- [x] Add BIRTHDAY_CELEBRATION screen type to shared types (already existed)
- [x] Generate birthday celebration slides in backend for cats whose birthday is today
- [x] Build birthday celebration slide renderer for web TV (already existed, now auto-injected)
- [x] Add birthday celebration screen view to tvOS native app (already existed, now auto-injected)
- [x] Write tests for birthday celebration slide generation

## URGENT - Reduce Roller API Usage (30,917 calls = $210/month)
- [x] Audit all Roller API polling in web app (roller.ts, routers.ts, ScreenRenderer, GuestCheckIn, TodayTimeline)
- [x] Audit all Roller API polling in tvOS app (APIClient.swift, ContentView.swift)
- [x] Add server-side caching: getProductAvailability (5 min TTL), searchBookings (2 min TTL)
- [x] Reduce frontend polling: TV screens 5min→15min, Admin 60s→3min
- [x] Reduce tvOS polling: 5min→15min
- [x] Estimated reduction: ~47% fewer calls, ~$98/month savings

## Feature - Three Arrival Options for Check-In
- [x] Update markArrived backend to accept arrival mode (early, original, now) — already supported via startNow boolean
- [x] Update admin UI to show three-option dialog when marking arrived
- [x] Start Timer Early: starts countdown from current time (early arrivals)
- [x] Start at Original Time: uses booked session start time (late arrivals)
- [x] Start Timer Now: starts fresh from now (walk-ins)
- [x] Test all three modes

## Feature - Events Management & Multi-Event TV Slide
- [x] Create events database table (name, date, time, description, image, active)
- [x] Create backend CRUD endpoints for events
- [x] Build Events admin tab for managing events
- [x] Create UPCOMING_EVENTS multi-event TV slide type for web TV
- [x] Add UPCOMING_EVENTS screen type to tvOS native app
- [x] Auto-inject upcoming events slide into TV playlist when events exist (manual screen creation via admin)

## Bug Fix - UPCOMING_EVENTS Not Showing on TV
- [x] Fix UPCOMING_EVENTS screen not appearing in TV playlist
- [x] Investigate screen generation / playlist logic for events

## Feature - Event Image Upload
- [x] Add drag-and-drop image upload for events (replace URL-only field)
- [x] Upload event images to S3 storage
- [x] Update EventManager admin UI with image uploader component

## Bug Fix - tvOS Upcoming Events Empty
- [x] Fix tvOS showing "No Upcoming Events" despite events existing in database (was using old model fields)

## Bug Fix - Event Images Cropped
- [x] Fix event images on Upcoming Events TV screen to show full image (contain) instead of cropped (cover)
- [x] Fix event images on tvOS Upcoming Events screen to show full image (fit) instead of cropped (fill)

## Feature - Auto-Generate Individual Event Slides
- [x] Auto-generate individual full-screen EVENT slides from events table entries
- [x] Inject individual event slides into all playlist endpoints (getActive, getActiveScreens, getActiveScreensWithTemplates)
- [x] Map events table fields to EVENT screen format for the renderer

## Redesign - EVENT Slide to Match Adoption Style
- [x] Redesign web TV EventScreen to match adoption screen layout
- [x] Redesign tvOS EventsScreenView to match adoption screen layout

## Feature - QR Code URL for Events
- [x] Add qrUrl column to events database table
- [x] Add QR URL input field to EventManager admin form
- [x] Pass qrUrl from events to auto-generated EVENT slides

## Feature - Image Editor (Rotate & Crop)
- [x] Install react-image-crop library for image editing
- [x] Build reusable ImageEditor component with rotate and crop (already existed as PhotoCropper)
- [x] Integrate ImageEditor into photo submissions review (Snap & Purr / Happy Tails)
- [x] Integrate ImageEditor into EventManager for event images
- [ ] Integrate ImageEditor into ScreenForm for screen images (future)
- [x] Re-upload edited image to S3 after crop/rotate

## Bug Fix - Photo Editor
- [x] Fix Apply button not working in PhotoCropper (CORS/tainted canvas - now loads via blob URL)
- [x] Add photo editing (crop/rotate) to Album Photos section

## Bug Fix - PhotoCropper Image Not Loading
- [x] Fix image not loading in PhotoCropper dialog (added server-side /api/image-proxy)

## Feature - Cat Traits Word Cloud
- [x] Create catTraits database table (catId, word, guestName, createdAt)
- [x] Create backend API: submit trait, get traits for cat, get top traits
- [x] Build curated word list (20 personality traits to pick from)
- [x] Build Traits section on cat adoption profile (curated list + custom input)
- [x] Display word cloud visualization on Traits section
- [x] Create CAT_WORD_CLOUD TV screen type for web TV
- [x] Update tvOS app with word cloud screen type
- [x] Auto-inject word cloud slides into TV playlist (for cats with 3+ trait submissions)
## Feature - Expired Session TV Popup
- [x] Detect guests whose session timer has expired but haven't been checked out
- [x] Create backend API endpoint to return expired/overstay guests
- [x] Build persistent popup/banner on web TV display showing "[Guest Name], please see the front desk"
- [x] Popup stays visible until staff marks guest as "Out"
- [x] Add 3-minute grace period after timer expires before showing popup
- [x] Update tvOS native app with matching expired session popup
- [x] Write tests for expired session detection logic
## Bug - Events Page Missing
- [x] Investigate and fix missing Events page on the website (was querying screens table instead of events table)
## Feature - Embeddable Events Widget
- [x] Create /events-widget route with standalone events display
- [x] Style widget to blend with Wix site (no header/footer, clean background)
- [x] Auto-updates from events table
- [x] Provide Wix iframe embed instructions
## Bug Fix - Events Widget Embed
- [x] Fix 404 on published site (was already live)
- [x] Ensure widget has no header/nav/footer - only event cards
- [x] Show full event images (no cropping, object-contain instead of object-cover)
- [x] Disable scrolling on events widget page
- [x] Make widget background fully transparent (no beige tint)
- [x] Fix events widget responsive layout for mobile devices (stacked cards on mobile, 2-col on tablet, 3-col on desktop)
- [x] Convert mobile events widget to horizontal swipe carousel (no vertical stacking)
## Feature - Embeddable Adopt Widget
- [x] Create /adopt-widget route with standalone adoptable cats display
- [x] Add filter tabs: In Lounge, Adopted (centered)
- [x] Horizontal swipe carousel on mobile, grid on desktop
- [x] Style to match events widget (transparent bg, no header/footer)
- [x] Provide Wix iframe embed instructions
- [x] Add "Meet Me" button on each cat card linking to their full profile page
- [x] Fix adopt widget: enable vertical scrolling so all cats visible in iframe (not cut off)
- [x] Remove swipe carousel from adopt widget mobile, use scrollable grid instead (2-col on mobile, 3-col tablet, 4-col desktop)
## Feature - Staff Management Page
- [x] Create backend API: list all users, update user role (admin/user), remove user
- [x] Build staff management page in admin panel with user list
- [x] Allow promoting users to admin and demoting back to user
- [x] Show user details: name, email, role, last active, join date
- [x] Add confirmation dialog before role changes
- [x] Safety: prevent self-demotion and self-removal
## Bug Fix - No-Show Logic
- [x] Change no-show marking to only happen at end of day (8 PM PST), not when scheduled time passes
- [x] Allow late arrivals to still check in even after their scheduled start time
- [x] Extend Carolina's current session timer (+30 min from now)
- [ ] Fix adopt widget still being cut off in Wix iframe embed
- [x] Hide adoption fees from adopt widget cards
## Feature - Happy Tails Widget
- [x] Create /happy-tails-widget route with standalone adopted cats showcase
- [x] Display adopted cats with photos, names, adoption dates, and stories
- [x] Style to match events/adopt widgets (transparent bg, no header/footer)
- [x] Scrollable grid layout, responsive for mobile (2-col mobile, 3-col tablet, 4-col desktop)
- [x] Include auto-resize postMessage for Wix iframe
- [x] Provide Wix iframe embed instructions
- [x] Convert Happy Tails widget to horizontal swipe carousel on all screen sizes
- [x] Fix Happy Tails widget still scrollable in Wix iframe - made more compact (~470px), removed hover translateY, enforced overflow hidden
- [x] Fix Happy Tails widget scrolling: enforced overflow:hidden on html/body/#root, page cannot scroll internally
- [x] Remove title, subtitle, and counter from Happy Tails widget header
- [x] Add back "X cats adopted" counter to Happy Tails widget (keep title/subtitle removed)
## Feature - Share Your Happy Tail
- [x] Create happyTailSubmissions database table (already exists as photoSubmissions with happy_tails type)
- [x] Build backend API: submit story (public), list submissions (admin), approve/reject (admin) — already exists
- [x] Build submission form page with photo upload, cat selector, story text, and adopter info — already at /upload/happy-tails
- [x] Add "Share Your Happy Tail" CTA button to the Happy Tails widget
- [x] Build admin review panel for moderating submitted stories — already exists in admin
- [x] Send notification to owner when new submission arrives — already implemented
- [x] Write vitest tests for submission API — existing tests cover photo submission flow
## Feature - Snap & Purr Embeddable Widget
- [x] Create SnapPurrWidget page with horizontal carousel matching Happy Tails widget style
- [x] Show approved snap_purr photos with cat name, caption, and submitter
- [x] Add "Share Your Photo" CTA button linking to /upload/snap-purr
- [x] Register /snap-purr-widget route in App.tsx
- [x] Test widget rendering and carousel functionality
- [x] Redesign Snap & Purr widget as auto-scrolling photo strip (no captions, no cards, no arrows) like homepage
- [x] Remove "21 guest photos" counter and "Share Your Photo" CTA from Snap & Purr widget
- [x] Fix photos being cut off in Snap & Purr widget - use CSS animation with 150px square photos
- [x] Ensure auto-scroll animation is working properly - CSS animation running at 112s loop
- [x] Fix Happy Tails widget cards getting cut off on mobile - reduced image to 130px, tighter spacing
## Feature - Match Wix Navigation Style
- [x] Redesign nav to match Wix: black rounded pill bar with centered logo popping above
- [x] Use logo from settings (VITE_APP_LOGO) so it always stays current
- [x] Match menu items: Home, Book Online, Events, Adopt, FAQ, Contact
- [x] Keep "Home" highlighted in green when active
- [x] Ensure mobile responsive hamburger menu
- [x] Fix logo not showing in nav - now fetches from DB settings (TV Logo) instead of VITE_APP_LOGO
- [x] Update admin dashboard logo to use DB settings logo instead of VITE_APP_LOGO
- [x] Update Adopt link in nav to point to https://www.shelterluv.com/matchme/adopt/KRLA/Cat
- [x] Update Adopt Me button on cat profile pages to link to https://www.shelterluv.com/matchme/adopt/KRLA/Cat
- [x] Update View Adoptable Cats button on homepage to link to Shelterluv too

## Feature - iPad PWA App for Staff
- [x] Add PWA manifest.json with app name, icons, theme color, display: standalone
- [x] Create/upload app icons for PWA (192x192, 512x512)
- [x] Add service worker for offline caching and app-like behavior
- [x] Add apple-mobile-web-app meta tags for iOS/iPadOS support
- [x] Optimize admin layout for iPad touch (larger tap targets, touch-friendly spacing)
- [x] Test PWA install flow and standalone mode
- [x] Fix upcoming birthdays slide showing no upcoming birthdays on tvOS app (JSONDecoder() → decoder with date strategy in APIClient.swift)
- [x] Add QR code to word cloud screens linking to each cat's profile page (web + tvOS)
- [x] Fix incorrect 'Turns X' age on Upcoming Birthdays screen (ages showing wrong values like Turns 5, Turns 0)
- [x] Fix duplicate logo in website header navigation (two logos showing)
- [x] Add dark/light mode toggle to admin dashboard
- [x] Auto-update adoption counter on homepage based on cats marked as adopted
- [x] Fix adoption counter showing 40 instead of 21 — reset pre-database offset to 0 since all adoptions are tracked in Cats tab
- [x] Add live total preview to Settings adoption counter card so admin can see the computed total
- [x] Remove pre-database adoption offset from Settings — all cats are tracked in DB now
- [x] Fix tvOS app showing 0 on adoption counter — now fetches count from screens.getAdoptionCount API
- [x] Fix tvOS guest check-in screen not pulling info from settings + redesign
- [x] Add quick status change for cats directly from the Cats list view (without opening profile)
- [x] Fix quick status change dropdown not saving cat status
- [x] Replace auto-save in cat profile editor with explicit Save button
- [x] Improve Adopt section mobile layout to better show all cats
- [x] Improve embeddable adoption widget for Wix — better mobile display of all cats
- [ ] Fix tvOS guest check-in screen still showing blank after redesign

## Feature - Informational Landing Pages for TV Features
- [x] Create Adoption Slides info page — explains cat voting for TV adoption slides, links to /vote/cats
- [x] Create Snap & Purr info page — explains lounge photo uploads for TV, links to /upload/snap-purr
- [x] Register new routes in App.tsx
- [x] Consolidate two separate info pages into one unified TV Features landing page
- [x] Remove old /about/adoption-slides and /about/snap-purr pages
- [x] Update App.tsx routes for the single page
- [x] Fix broken images on TV Features page (Snap & Purr preview grid)
- [x] Update CTA links to go directly to upload pages, not sub-pages

## Feature - Import Cat Info from Link
- [x] Build backend tRPC procedure to scrape/extract cat info from a URL (name, breed, age, photos, description)
- [x] Add "Import from Link" option to the cat creation UI
- [x] Auto-fill cat form fields from scraped data
- [x] Download and re-upload extracted photo to S3 for reliable hosting
- [x] Support ShelterLuv, Petfinder, Adopt-a-Pet, and generic rescue site links

## Bug Fix - Early Check-in Timeline Time
- [x] Fix timeline to show actual check-in time when guest is checked in early (not original booking time)
- [x] Fix TodayTimeline.tsx timeline block positions to use sessionCheckInAt/sessionExpiresAt
- [x] Fix GuestCheckIn.tsx timeline block positions to use actual session times
- [x] Update popover time display to show actual session time (green) with original booking time struck through
- [x] Update booking card list view to show actual session time with original time struck through

## Feature - Walk-in Booking via Roller API
- [x] Research Roller capacity reservation API and product listing API
- [x] Build backend tRPC procedure to check availability via Roller capacity reservation
- [x] Build backend tRPC procedure to create a Roller booking for walk-ins
- [x] Build walk-in booking UI in admin check-in panel (guest name, email, phone, session type, time)
- [x] Integrate with existing check-in flow (auto mark arrived after booking creation)
- [x] Test end-to-end walk-in booking flow
- [x] Disable/hide Book Walk-In button on admin panel

## Bug Fix - tvOS Upcoming Events: Today's events disappear too early
- [x] Fix event filtering so today's events stay visible until they start
- [x] Add "Happening Now" / "LIVE NOW" badge when event is currently live

## Feature - Guest Sessions screen: show cat lounge photos instead of Snap & Purr
- [x] Update Guest Sessions screen to display cat photo grid from adoption screens instead of Snap & Purr
- [x] Fix Xcode nil coalescing warning on screen.title in GuestStatusBoardScreenView
- [x] Redesign cat photo grid to use square thumbnails to fit almost all cat photos

## Feature - Guest Word Cloud on Adoption Profile Screen (tvOS)
- [x] Investigate available guest feedback/comment data for cats (catTraits table has guest-submitted personality words)
- [x] Add word cloud to tvOS adoption profile screen showing what guests say about each cat
- [x] Added fetchCatTraits() to APIClient to batch-fetch all trait counts
- [x] Added GuestTraitCloud component with colored pills above QR code
- [x] Shows top 12 guest-submitted traits with count badges
- [x] Disable standalone CAT_WORD_CLOUD slides from TV rotation (now embedded in adoption profile)
- [x] Fix events embed: today's events should still show the booking button
- [x] Add zoom capability to TodayTimeline on admin check-in page for iPad readability
- [x] Add 'scroll to now' button on TodayTimeline that appears when zoomed in
- [x] Rework timeline zoom to use native dimension scaling instead of CSS transform (more natural feel)
- [x] Fix upcoming birthdays: "Tomorrow" label showing for dates 2+ days away (date calc bug)
- [x] Integrate volunteer orientation presentation into the Catfé TV app (admin-accessible, displayable on TVs)
- [x] Replace AI-generated slide images with original Keynote slides in volunteer orientation
- [x] Redesign Membership TV screen with styled text tier names, perks, and pricing (Catfé+, Curious Cat, Neighborhood Cat)
- [x] Update tvOS app Membership screen to match new text-based design (Playfair Display SC font, styled tier names)
- [x] Redesign Snap & Purr screen into 'Follow Us' social media screen (web app)
- [x] Update tvOS Snap & Purr screen to match new social media follow design
- [x] Redesign Today at Catfé screen to show manually-added daily events (web app)
- [x] Update tvOS Today at Catfé screen to match new events design
- [x] Fix Today at Catfé screen image not displaying on tvOS app (show screen.imageURL in fallback hero layout)
- [x] Add "All Day" option to event creation/editing form (no time required)
- [x] Add Multi-Day label option for events spanning multiple dates
- [x] Rework Multi-Day to use individual date picker instead of start-to-end range
- [x] Fix multi-day events showing 3 dates when only 2 selected
- [x] Fix tvOS event screen showing 3 dates for multi-day events (hide separate eventDate)
- [ ] Multi-day events should show "All Day" as time, not the date list
- [x] Update Upcoming Events TV slide for multi-day events display
- [x] Apple TV remote up/down to cycle album photos on adoption slides
- [x] Apple TV remote up/down to cycle album photos on Happy Tails slides
- [x] Fix existing multi-day events in DB to set eventTime to All Day and populate multiDayDates
- [x] Fix tvOS UpcomingEventsScreenView to properly display multi-day events
- [x] Update events.getUpcoming API to include multiDayDates or format dates for multi-day events
- [x] Add "Days at Catfé" counter to cat adoption slides (web TV + tvOS)
- [x] Redesign tvOS adoption grid to match membership slide visual style
- [x] Sort adoption slides by days at Catfé (longest stay first)
- [x] Redesign tvOS Happy Tails screen with premium dark theme matching adoption grid
- [ ] Apply premium dark theme to tvOS custom slides
- [ ] Apply premium dark theme to tvOS guest check-in slide
- [ ] Apply premium dark theme to tvOS Snap & Purr QR slide
- [x] Apply premium dark theme to tvOS Adoption Counter screen
- [x] Add events to the timeline alongside other activity items
- [x] Move event blocks to render above booking rows on the timeline (not below)
- [x] Add Private Party event type to event schema
- [x] Filter Private Party events from TV screen display
- [x] Show Private Party events on admin timeline with distinct styling
- [x] Update admin Events tab UI to support creating/editing Private Party events
- [x] Add NutriSource/PetStop free cat food callout to Adoption Counter TV screen
- [x] Create standalone NutriSource/PetStop promo slide for TV rotation
- [x] Update tvOS app with NutriSource/PetStop promo on Adoption Counter
- [x] Fix: SPONSOR_PROMO not in backend Zod validation schema causing "invalid_value" error when creating screen
- [x] Add NutriSource/PetStop promo to tvOS Adoption Counter screen
- [x] Redesign Sponsor Promo screen with premium dark theme (web + tvOS)
- [x] Fix: Step arrows on tvOS Sponsor Promo screen look too small and misaligned
- [x] Make step icons on tvOS Sponsor Promo much larger and spread across full screen width
- [x] Add "through Astro Adoption Program" under the free bag line on Sponsor Promo (web + tvOS) and Adoption Counter promo
- [x] Update upcoming birthdays to show cats with birthdays within next 2 weeks (instead of current window)
- [x] Redesign birthday screen with 2x2 grid layout
- [x] Apply premium dark theme to birthday screen (web + tvOS)
- [x] Birthday screen adaptive layout: 1 cat = full-screen hero, 2 cats = side-by-side, 3+ cats = 2x2 grid (web + tvOS)
- [x] Extend Roller cache TTLs: bookings 2min→5min, customer 10min→30min, availability 5min→15min
- [x] Batch customer lookups in getTodayBookings instead of per-booking sequential calls
- [x] Reduce tvOS Roller session polling from 15min to 30min
- [x] Reduce tvOS polling: photos 60s→5min, guest photos 60s→10min, social/birthdays 5min→10min
- [x] Fix pre-existing Map/Set iteration TS errors in roller.ts
- [x] Add roller_api_usage table to track daily API call counts by endpoint
- [x] Add tracking middleware to roller.ts to log every API call
- [x] Create tRPC endpoints for fetching usage stats (daily, weekly, by endpoint)
- [x] Build Roller API Usage dashboard in admin panel with charts
- [x] Write tests for usage tracking (15 tests passing)
- [x] Fix staleTime to match refetchInterval (3min) across all roller.getTodayBookings queries to enable tRPC cache deduplication
- [x] Make TodayTimeline lazy-load/collapsible - queries only run when expanded (with enabled flag)
- [x] Align GuestCheckIn DashboardStats roller query staleTime too
- [x] Web birthday screen must match tvOS birthday screen exactly (adaptive layout: 1=hero, 2=side-by-side, 3+=grid)
- [x] Fix: Meet Our Cats web screen rewritten to match tvOS premium dark theme (PremiumCatCard, 4-col grid, 8 cats/page, page cycling)
- [x] Fix: Socials screen rewritten to match tvOS (dark purple gradient, 3-col grid, 6 posts/page, captions below images)
- [x] Fix: Duplicate Events slides - aggregate slide now only shows when 2+ events exist
- [x] Fix: Guest Sessions emoji encoding - replaced broken UTF-16 surrogates with actual emoji chars
- [x] Fix: "No Upcoming Events" empty state → now shows "Loading Events..." while query fetches
- [x] Fix: Memory leak — capped playlist at 40 slides, priority weight max 3, image preload cleanup, staleTime on all queries, React Query GC every 10min
- [x] Feature: Guest Birthday Celebration slide for TV display
- [x] Add guest birthday data source (admin manual entry)
- [x] Create GUEST_BIRTHDAY screen type for web TV
- [x] Create GUEST_BIRTHDAY screen type for tvOS
- [x] Auto-inject guest birthday slide into playlist when active
- [x] Admin UI: GuestBirthdayManager in Guests tab (add/deactivate/delete)
- [x] tvOS: GuestBirthdayScreenView.swift with premium dark theme
- [x] tvOS: Models.swift, Theme.swift, ScreenView.swift routing updated
- [x] tvOS: project.pbxproj updated with GBD00001/GBD00002 references
- [x] Vitest: 15 tests covering slide generation, name parsing, date handling, privacy, validation
- [x] Bug Fix: GUEST_BIRTHDAY not in screenTypeEnum - added to Zod screenTypes array in routers.ts
- [x] Feature: Add optional photo to Guest Birthday slides
- [x] Add photoUrl column to guest_birthdays table
- [x] Update backend router to handle photo upload for guest birthdays (add + uploadPhoto endpoints)
- [x] Update admin GuestBirthdayManager with photo upload UI (add new + update existing)
- [x] Update web TV Guest Birthday renderer to display photo (side-by-side layout with circular photo)
- [x] Update tvOS GuestBirthdayScreenView to display photo (AsyncImage with circular frame)
- [x] Vitest: 22 tests covering photo upload, propagation, mime types, and privacy
- [x] Remove signed waivers checking feature from admin panel (GuestCheckIn + TodayTimeline)
- [x] Remove backend waiver router endpoints (getWaiverSummary, getBatchWaiverSummaries) from routers.ts
- [x] Remove unused waiver functions from roller.ts (getGuestWaivers, getSignedWaiver, computeWaiverStatus, getWaiverStatus, getBookingWaiverSummary, extractWaiverIdsFromBooking, waiverCache)
- [x] Remove waiverStatus.test.ts test file
- [x] Clean up unused waiver type imports from routers.ts
- [x] Remove signedWaiver webhook subscription from rollerPolling.ts
- [x] Keep getBookingDetail + types (still needed by getBookingAddOns)
- [x] Redesign cat management in admin: replace small row layout with spacious card grid (3-col desktop, 1-col mobile)
- [x] Cat cards show large square photo, status badge overlay, featured star, personality tags, breed/age/sex, days at Catfé
- [x] Fix pre-existing TS error: adopterEmail missing from handleClose reset in CatManager.tsx
- [x] Bug Fix: tvOS upcoming events shows tomorrow's event as "Today" — fixed by using Pacific timezone calendar for all date comparisons in UpcomingEventsScreenView.swift
- [x] Redesign Screens tab in admin: replace row layout with spacious card grid (3-col desktop, 2-col tablet, 1-col mobile)
- [x] Screen cards show aspect-video preview image, type badge overlay, active/inactive status, drag handle + edit/delete on hover, toggle switch
- [x] Bug Fix: Upcoming events dates off by one day — root cause: eventDate stored as UTC midnight, displayed without Pacific TZ conversion
- [x] Fix: events.getUpcoming API now returns eventDate as YYYY-MM-DD in Pacific timezone
- [x] Fix: Web TV ScreenRenderer getDaysUntil now uses Pacific timezone for day comparison
- [x] Fix: EventManager getDaysUntil now uses Pacific timezone for day comparison
- [x] tvOS UpcomingEventsScreenView already fixed in previous commit (Pacific calendar)
- [x] Bug Fix: tvOS upcoming events dates STILL off by one — fixed: for multi-day events use first date from multiDayDates (clean YYYY-MM-DD); for single-day events extract date from ISO string directly
- [x] Fix event date storage: store eventDate/endDate with noon UTC offset (T12:00:00Z) instead of midnight
- [x] Update events.create to normalize dates to noon UTC before storing
- [x] Update events.update to normalize dates to noon UTC before storing
- [x] Migrate existing event dates in database from midnight UTC to noon UTC (3 events updated)
- [x] Simplify events.getUpcoming API — now just extracts YYYY-MM-DD from ISO string (noon UTC = same date in all US timezones)
- [x] Only show birthday celebration slide when there are upcoming cat birthdays (filter out static BIRTHDAY_CELEBRATION screens from playlist when no cat birthdays today)
- [x] Add always-visible edit + delete buttons to screen cards in admin Screens tab (pencil + trash icons in card info row)
- [x] Feature: Show live screen previews in admin screen cards instead of placeholder letters
- [x] Create ScreenThumbnail component with dynamic ResizeObserver scaling of ScreenRenderer
- [x] Integrate ScreenThumbnail into ScreenList card thumbnails with settings query
