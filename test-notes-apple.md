# Apple Device Support Test - 2026-01-29

The TV display now has full Apple TV remote navigation support. The screenshot confirms:

1. Weather and clock overlay visible in top-right corner (67°F, 7:56 PM)
2. Navigation controls visible at bottom with 4 buttons (Previous, Pause, Next, Refresh)
3. Progress dots showing current position in playlist
4. Remote hint text at bottom: "Use arrow keys or swipe to navigate • Press select to activate"

PWA features added:
- manifest.json with app icons and shortcuts
- Service worker for offline caching
- Apple-specific meta tags for standalone mode
- iOS splash screens for all device sizes
- Apple touch icons in multiple sizes

Apple TV remote navigation:
- Arrow keys/swipes navigate between buttons when controls visible
- Arrow keys advance screens when controls hidden
- Enter/Select activates focused button
- Play/Pause button toggles auto-advance
- Escape/Menu hides controls
- Focus states with ring highlight and scale effect
