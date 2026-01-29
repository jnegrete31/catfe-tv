# TestFlight Deployment Guide for Catfé TV

This guide walks you through deploying both the iOS and tvOS apps to TestFlight.

## Prerequisites

1. **Apple Developer Account** ($99/year)
2. **Xcode 15.0+** installed
3. **App Store Connect** access
4. **Valid signing certificates** and provisioning profiles

## Step 1: Configure App Store Connect

### Create App Records

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"

**For iOS App (CatfeTVAdmin):**
- Platform: iOS
- Name: Catfé TV Admin
- Primary Language: English (U.S.)
- Bundle ID: `com.catfe.admin`
- SKU: `catfe-tv-admin-001`

**For tvOS App (CatfeTVApp):**
- Platform: tvOS
- Name: Catfé TV
- Primary Language: English (U.S.)
- Bundle ID: `com.catfe.tv`
- SKU: `catfe-tv-display-001`

## Step 2: Configure Xcode Project

### Update Signing

1. Open `CatfeTV.xcodeproj` in Xcode
2. Select the project in the navigator
3. For each target (CatfeTVApp and CatfeTVAdmin):
   - Go to "Signing & Capabilities"
   - Select your Team
   - Enable "Automatically manage signing"
   - Verify bundle identifier matches App Store Connect

### Update Version Numbers

1. Select each target
2. Go to "General" tab
3. Set:
   - Version: `1.0.0`
   - Build: `1` (increment for each upload)

### Add App Icons

**iOS App Icon (1024x1024):**
1. Create a square image with the Catfé logo
2. Export at 1024x1024 pixels
3. Add to `CatfeTVAdmin/Assets.xcassets/AppIcon.appiconset/`

**tvOS App Icon (Layered):**
1. Create layered images for parallax effect:
   - Back layer: Background
   - Middle layer: Logo shadow
   - Front layer: Logo
2. Each layer: 400x240 (small) and 1280x768 (large)
3. Add to `CatfeTVApp/Assets.xcassets/App Icon & Top Shelf Image.brandassets/`

**tvOS Top Shelf Image:**
- Standard: 1920x720
- Wide: 2320x720

## Step 3: Archive and Upload

### Archive iOS App

1. Select "CatfeTVAdmin" scheme
2. Select "Any iOS Device (arm64)"
3. Product → Archive
4. Wait for archive to complete
5. In Organizer, click "Distribute App"
6. Select "App Store Connect"
7. Click "Upload"
8. Wait for processing

### Archive tvOS App

1. Select "CatfeTVApp" scheme
2. Select "Any tvOS Device (arm64)"
3. Product → Archive
4. Wait for archive to complete
5. In Organizer, click "Distribute App"
6. Select "App Store Connect"
7. Click "Upload"
8. Wait for processing

## Step 4: Configure TestFlight

### Add Build to TestFlight

1. Go to App Store Connect
2. Select your app
3. Click "TestFlight" tab
4. Wait for build processing (5-30 minutes)
5. Click on the build number

### Export Compliance

When prompted:
- "Does your app use encryption?" → **No**
  (Unless you've added custom encryption)

### Add Test Information

1. Click "Test Information"
2. Fill in:
   - Beta App Description
   - Feedback Email
   - Marketing URL (optional)
   - Privacy Policy URL (required for external testing)

### Internal Testing

1. Go to "Internal Testing"
2. Click "+" to create a group
3. Name: "Catfé Team"
4. Add testers by Apple ID email
5. Select the build to test
6. Testers receive email invitation

### External Testing

1. Go to "External Testing"
2. Click "+" to create a group
3. Name: "Beta Testers"
4. Add testers (up to 10,000)
5. Submit for Beta App Review
6. Wait for approval (usually 24-48 hours)

## Step 5: Install on Devices

### For Testers

1. Download TestFlight app from App Store
2. Open invitation email on device
3. Tap "Start Testing"
4. Install the app

### For Apple TV

1. On Apple TV, open TestFlight app
2. Sign in with Apple ID (same as tester account)
3. Find "Catfé TV" in available apps
4. Install and test

## Troubleshooting

### Build Processing Stuck

- Wait up to 30 minutes
- Check App Store Connect status page
- Re-upload if needed

### Signing Issues

```
Error: No signing certificate found
```
- Go to Xcode → Preferences → Accounts
- Download certificates
- Clean build folder (Cmd+Shift+K)

### Missing Compliance

```
Error: Export compliance information required
```
- Go to TestFlight → Build → Export Compliance
- Answer the encryption questions

### Icon Missing

```
Error: Missing required icon
```
- Ensure all icon sizes are provided
- Check asset catalog structure
- Rebuild and re-archive

## Checklist

### Before Upload

- [ ] Version number updated
- [ ] Build number incremented
- [ ] App icons added (all sizes)
- [ ] Bundle IDs match App Store Connect
- [ ] Signing configured correctly
- [ ] No compiler warnings
- [ ] Tested on simulator/device

### After Upload

- [ ] Build appears in TestFlight
- [ ] Export compliance answered
- [ ] Test information filled
- [ ] Testers added
- [ ] Invitation emails sent
- [ ] App installs correctly
- [ ] All features work

## Support

For issues with:
- **Apple Developer Account**: [developer.apple.com/support](https://developer.apple.com/support)
- **App Store Connect**: [appstoreconnect.apple.com/help](https://appstoreconnect.apple.com/help)
- **This Project**: Open a GitHub issue

---

Good luck with your TestFlight deployment! 🚀
