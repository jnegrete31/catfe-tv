//
//  ContentView.swift
//  CatfeTVApp
//
//  Main content view for tvOS digital signage
//

import SwiftUI
import Combine

struct ContentView: View {
    @EnvironmentObject var apiClient: APIClient
    @EnvironmentObject var weatherService: WeatherService
    @EnvironmentObject var screenRotator: ScreenRotator
    
    @State private var showControls = false
    @State private var controlsTimer: Timer?
    @FocusState private var isFocused: Bool
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background - matches screen backgrounds to avoid visible border
                Color.loungeCharcoal
                    .ignoresSafeArea()
                
                // Current Screen
                if let currentScreen = screenRotator.currentScreen {
                    // Get adoption cats for showcase screen (available cats from playlist)
                    let adoptionCats = screenRotator.screens.filter { $0.type == .adoption }
                    // Combine with recently adopted cats for the adoption counter
                    let allAdoptionCats = adoptionCats + apiClient.cachedRecentlyAdoptedCats
                    
                    ScreenView(screen: currentScreen, adoptionCats: allAdoptionCats, settings: apiClient.settings, adoptionCount: apiClient.cachedAdoptionCount)
                        .id(currentScreen.id)
                        .transition(.opacity.animation(.easeInOut(duration: apiClient.settings.transitionDuration)))
                } else {
                    // Loading or empty state
                    LoadingView()
                }
                
                // Overlay widgets - hidden when screen has hideOverlay enabled
                if !(screenRotator.currentScreen?.hideOverlay ?? false) {
                    // Weather and Clock Overlay
                    VStack {
                        HStack {
                            Spacer()
                            WeatherWidget()
                                .padding(.top, 40)
                                .padding(.trailing, 60)
                        }
                        Spacer()
                    }
                    
                    // Top-left overlay: Waiver QR widget
                    VStack {
                        HStack {
                            WaiverWidget()
                                .padding(.top, 40)
                                .padding(.leading, 60)
                            Spacer()
                        }
                        Spacer()
                    }
                    
                    // Logo Widget (bottom-right corner)
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            LogoWidget()
                                .padding(.bottom, 40)
                                .padding(.trailing, 60)
                        }
                    }
                }
                
                // Guest Session Reminder Widget - always shown regardless of hideOverlay
                VStack {
                    Spacer()
                    HStack {
                        GuestReminderWidget()
                            .frame(maxWidth: 500)
                            .padding(.bottom, 100)
                            .padding(.leading, 60)
                        Spacer()
                    }
                }
                
                // Overstay Popup - persistent alert for guests expired 3+ min ago
                VStack {
                    Spacer()
                    OverstayPopupView()
                        .frame(maxWidth: 700)
                        .padding(.bottom, 120)
                }
                
                // Full-screen Welcome Overlay for newly checked-in guests
                WelcomeOverlayView()
                
                // Progress Indicator
                VStack {
                    Spacer()
                    ProgressBar(progress: screenRotator.progress)
                        .frame(height: 4)
                        .padding(.horizontal, 60)
                        .padding(.bottom, 40)
                        .opacity(showControls ? 1 : 0)
                }
                
                // Screen Indicator Dots
                VStack {
                    Spacer()
                    HStack(spacing: 12) {
                        ForEach(Array(screenRotator.screens.enumerated()), id: \.element.id) { index, screen in
                            Circle()
                                .fill(index == screenRotator.currentIndex ? Color.catfeTerracotta : Color.catfeBrown.opacity(0.3))
                                .frame(width: 12, height: 12)
                        }
                    }
                    .padding(.bottom, 60)
                    .opacity(showControls ? 1 : 0)
                }
            }
            .focusable()
            .focused($isFocused)
            .onMoveCommand { direction in
                handleRemoteNavigation(direction)
            }
            .onPlayPauseCommand {
                togglePlayPause()
            }
            .onExitCommand {
                // Handle menu button
                showControlsTemporarily()
            }
        }
        .ignoresSafeArea()
        .onAppear {
            isFocused = true
            startAutoRefresh()
            // Pre-fetch photos and Roller sessions at startup so screens display instantly
            Task { @MainActor in
                await apiClient.refreshPhotos()
                await apiClient.fetchRecentlyAdoptedCats()
                await apiClient.fetchAdoptionCount()
                await apiClient.fetchRollerSessions()
                await apiClient.fetchSocialPosts()
                await apiClient.fetchBirthdayCats()
                await apiClient.fetchUpcomingEvents()
                await apiClient.fetchTodayEvents()
                await apiClient.fetchFeaturedVolunteers()
                await apiClient.refreshGuestPhotos()
            }
        }
    }
    
    // MARK: - Remote Navigation
    
    private func handleRemoteNavigation(_ direction: MoveCommandDirection) {
        showControlsTemporarily()
        
        switch direction {
        case .left:
            screenRotator.previousScreen()
        case .right:
            screenRotator.nextScreen()
        case .up:
            NotificationCenter.default.post(name: .remoteSwipeUp, object: nil)
        case .down:
            NotificationCenter.default.post(name: .remoteSwipeDown, object: nil)
        @unknown default:
            break
        }
    }
    
    private func togglePlayPause() {
        showControlsTemporarily()
        screenRotator.toggleAutoAdvance()
    }
    
    private func showControlsTemporarily() {
        withAnimation(.easeInOut(duration: 0.3)) {
            showControls = true
        }
        
        controlsTimer?.invalidate()
        controlsTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { _ in
            withAnimation(.easeInOut(duration: 0.3)) {
                showControls = false
            }
        }
    }
    
    // MARK: - Auto Refresh
    
    private func startAutoRefresh() {
        Timer.scheduledTimer(withTimeInterval: TimeInterval(apiClient.settings.refreshIntervalSeconds), repeats: true) { _ in
            Task { @MainActor in
                await apiClient.fetchScreens()
                await apiClient.fetchSettings()
                await weatherService.fetchWeather()
                
                // Update rotator with new screens and latest settings
                screenRotator.updateSettings(apiClient.settings)
                screenRotator.updateScreens(apiClient.getActiveScreens())
            }
        }
        
        // Refresh photos and adopted cats every 5 minutes (was 60s — photos don't change that fast)
        Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
            Task { @MainActor in
                await apiClient.refreshPhotos()
                await apiClient.fetchRecentlyAdoptedCats()
                await apiClient.fetchAdoptionCount()
            }
        }
        
        // Refresh guest photos, spotlights, popularity, and traits every 10 minutes
        // (was bundled with photos at 60s — these change even less frequently)
        Timer.scheduledTimer(withTimeInterval: 600, repeats: true) { _ in
            Task { @MainActor in
                await apiClient.refreshGuestPhotos()
            }
        }
        
        // Refresh Roller sessions every 30 minutes for Live Availability & Today's Sessions
        // Server-side caches Roller API responses for 15 min now, so less frequent polling is fine
        Timer.scheduledTimer(withTimeInterval: 1800, repeats: true) { _ in
            Task { @MainActor in
                await apiClient.fetchRollerSessions()
            }
        }
        
        // Refresh social posts, birthdays, events, and volunteers every 10 minutes (was 5 min)
        Timer.scheduledTimer(withTimeInterval: 600, repeats: true) { _ in
            Task { @MainActor in
                await apiClient.fetchSocialPosts()
                await apiClient.fetchBirthdayCats()
                await apiClient.fetchUpcomingEvents()
                await apiClient.fetchTodayEvents()
                await apiClient.fetchFeaturedVolunteers()
            }
        }
    }
}

// MARK: - Loading View

struct LoadingView: View {
    @State private var isAnimating = false
    
    var body: some View {
        VStack(spacing: 40) {
            // Cat icon animation
            Image(systemName: "cat.fill")
                .font(.system(size: 120))
                .foregroundColor(.catfeTerracotta)
                .scaleEffect(isAnimating ? 1.1 : 1.0)
                .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isAnimating)
            
            Text("Loading Catfé TV...")
                .font(CatfeTypography.title)
                .foregroundColor(.catfeBrown)
        }
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - Progress Bar

struct ProgressBar: View {
    let progress: Double
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Rectangle()
                    .fill(Color.catfeBrown.opacity(0.2))
                    .cornerRadius(2)
                
                Rectangle()
                    .fill(Color.catfeTerracotta)
                    .frame(width: geometry.size.width * progress)
                    .cornerRadius(2)
                    .animation(.linear(duration: 0.1), value: progress)
            }
        }
    }
}

// MARK: - Remote Notification Names

extension Notification.Name {
    static let remoteSwipeUp = Notification.Name("remoteSwipeUp")
    static let remoteSwipeDown = Notification.Name("remoteSwipeDown")
}

// MARK: - Preview

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(APIClient.shared)
            .environmentObject(WeatherService.shared)
            .environmentObject(ScreenRotator())
    }
}
#endif
