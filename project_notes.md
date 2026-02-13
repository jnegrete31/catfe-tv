# Catfé TV Native App Development Notes

## Existing Backend Analysis
- Backend URL: https://catfetv-amdmxcoq.manus.space
- The backend requires authentication (OAuth via Manus)
- TV display endpoint: /tv shows screens with weather widget
- API endpoints appear to be protected

## Decision: Create Supabase Backend
Since the existing API requires authentication and we need a native app backend, we'll create a new Supabase database with:
- screens table
- settings table

## App Architecture

### Shared Components (Swift Package)
- Data models (Screen, Settings, ScreenType)
- API client for Supabase
- Weather service
- Image caching

### tvOS App Features
1. Full-screen 16:9 digital signage
2. 7 screen types: Snap & Purr, Events, Today at Catfé, Membership, Reminders, Adoption, Thank You
3. Smooth fade transitions with configurable duration
4. Weather widget + clock overlay (Santa Clarita: 34.3917, -118.5426)
5. Siri Remote: swipe left/right, play/pause toggle
6. Offline caching
7. Auto-refresh every 60 seconds

### iOS Admin App Features
1. Screen list with drag-and-drop reordering
2. CRUD operations for screens
3. Scheduling: date range, days of week, time windows
4. Live 16:9 preview
5. Settings management
6. GitHub integration for images

## Color Palette
- Terracotta: #C4704F
- Cream background: #FDF6E3
- Dark brown text: #3D2914

## GitHub Repo for Images
- jnegrete31/catfe-tv
- Existing images in repo root and assets folder
