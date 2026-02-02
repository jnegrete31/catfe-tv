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
