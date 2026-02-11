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
