# Test Notes - Catfé TV

## TV Display Test (2026-01-29)
- TV Display page loads successfully at /tv
- Shows "Membership" screen type with green background
- Title: "Become a Member"
- Subtitle: "Unlimited cat time + perks"
- Body: "Members get 20% off drinks, priority reservations, and exclusive events."
- Navigation controls visible at bottom (prev, refresh, next buttons)
- Progress dots showing current position in playlist

## Issues Found
- The screen type "type" column in schema maps to "screenType" in database - need to fix the schema or queries
