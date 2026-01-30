import SwiftUI
import UIKit

struct ContentView: View {
    @EnvironmentObject var apiClient: APIClient
    @State private var currentIndex = 0
    @State private var isPlaying = true
    @State private var showControls = false
    @State private var timer: Timer?
    
    var body: some View {
        ZStack {
            // Main content
            if apiClient.screens.isEmpty && apiClient.isLoading {
                LoadingView()
            } else if apiClient.screens.isEmpty {
                FallbackView(settings: apiClient.settings)
            } else {
                TVDisplayView(
                    screens: apiClient.screens,
                    settings: apiClient.settings,
                    adoptionCats: apiClient.adoptionCats,
                    currentIndex: $currentIndex,
                    isPlaying: $isPlaying
                )
            }
            
            // Weather and clock overlay
            VStack {
                HStack {
                    Spacer()
                    WeatherClockOverlay()
                        .padding(.top, 60)
                        .padding(.trailing, 60)
                }
                Spacer()
            }
            
            // Offline indicator
            if apiClient.isOffline {
                VStack {
                    HStack {
                        OfflineIndicator()
                            .padding(.top, 60)
                            .padding(.leading, 60)
                        Spacer()
                    }
                    Spacer()
                }
            }
            
            // Controls overlay
            if showControls {
                ControlsOverlay(
                    isPlaying: $isPlaying,
                    currentIndex: currentIndex,
                    totalScreens: apiClient.screens.count,
                    onPrevious: previousScreen,
                    onNext: nextScreen
                )
            }
        }
        .focusable()
        .onPlayPauseCommand {
            isPlaying.toggle()
        }
        .onMoveCommand { direction in
            showControls = true
            hideControlsAfterDelay()
            
            switch direction {
            case .left:
                previousScreen()
            case .right:
                nextScreen()
            default:
                break
            }
        }
        .onExitCommand {
            showControls = false
        }
        .task {
            // Ensure screen stays on
            UIApplication.shared.isIdleTimerDisabled = true
            await apiClient.refresh()
            await apiClient.fetchRandomAdoptions(count: 4)
            startAutoAdvance()
            startPeriodicRefresh()
            startKeepAlive()
        }
        .onChange(of: isPlaying) { _, newValue in
            if newValue {
                startAutoAdvance()
            } else {
                stopAutoAdvance()
            }
        }
    }
    
    private func startAutoAdvance() {
        stopAutoAdvance()
        guard !apiClient.screens.isEmpty else { return }
        
        let duration = apiClient.screens[safe: currentIndex]?.durationSeconds ?? 10
        timer = Timer.scheduledTimer(withTimeInterval: Double(duration), repeats: false) { _ in
            Task { @MainActor in
                nextScreen()
                if isPlaying {
                    startAutoAdvance()
                }
            }
        }
    }
    
    private func stopAutoAdvance() {
        timer?.invalidate()
        timer = nil
    }
    
    private func nextScreen() {
        guard !apiClient.screens.isEmpty else { return }
        withAnimation(.easeInOut(duration: 0.5)) {
            currentIndex = (currentIndex + 1) % apiClient.screens.count
        }
        if isPlaying {
            startAutoAdvance()
        }
    }
    
    private func previousScreen() {
        guard !apiClient.screens.isEmpty else { return }
        withAnimation(.easeInOut(duration: 0.5)) {
            currentIndex = (currentIndex - 1 + apiClient.screens.count) % apiClient.screens.count
        }
        if isPlaying {
            startAutoAdvance()
        }
    }
    
    private func hideControlsAfterDelay() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            showControls = false
        }
    }
    
    private func startPeriodicRefresh() {
        let interval = Double(apiClient.settings?.refreshIntervalSeconds ?? 60)
        Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
            Task { @MainActor in
                await apiClient.refresh()
                await apiClient.fetchRandomAdoptions(count: 4)
            }
        }
    }
    
    private func startKeepAlive() {
        // Periodically ensure idle timer stays disabled (every 30 seconds)
        Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
            Task { @MainActor in
                UIApplication.shared.isIdleTimerDisabled = true
            }
        }
    }
}

// MARK: - Loading View
struct LoadingView: View {
    var body: some View {
        ZStack {
            Color(hex: "#FDF6E3")
                .ignoresSafeArea()
            
            VStack(spacing: 30) {
                Image(systemName: "cat.fill")
                    .font(.system(size: 100))
                    .foregroundColor(Color(hex: "#C4704F"))
                
                Text("Catfé TV")
                    .font(.system(size: 60, weight: .bold))
                    .foregroundColor(Color(hex: "#3D2914"))
                
                ProgressView()
                    .scaleEffect(2)
                    .tint(Color(hex: "#C4704F"))
            }
        }
    }
}

// MARK: - Fallback View
struct FallbackView: View {
    let settings: Settings?
    
    var body: some View {
        ZStack {
            Color(hex: "#FDF6E3")
                .ignoresSafeArea()
            
            VStack(spacing: 30) {
                Image(systemName: "cat.fill")
                    .font(.system(size: 120))
                    .foregroundColor(Color(hex: "#C4704F"))
                
                Text(settings?.locationName ?? "Catfé")
                    .font(.system(size: 80, weight: .bold))
                    .foregroundColor(Color(hex: "#3D2914"))
                
                Text("Welcome!")
                    .font(.system(size: 50))
                    .foregroundColor(Color(hex: "#8B7355"))
            }
        }
    }
}

// MARK: - Offline Indicator
struct OfflineIndicator: View {
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "wifi.slash")
            Text("Offline Mode")
        }
        .font(.system(size: 24))
        .foregroundColor(.white)
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .background(Color.red.opacity(0.8))
        .cornerRadius(10)
    }
}

// MARK: - Controls Overlay
struct ControlsOverlay: View {
    @Binding var isPlaying: Bool
    let currentIndex: Int
    let totalScreens: Int
    let onPrevious: () -> Void
    let onNext: () -> Void
    
    var body: some View {
        VStack {
            Spacer()
            
            HStack(spacing: 40) {
                Button(action: onPrevious) {
                    Image(systemName: "chevron.left.circle.fill")
                        .font(.system(size: 60))
                }
                
                Button(action: { isPlaying.toggle() }) {
                    Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                        .font(.system(size: 80))
                }
                
                Button(action: onNext) {
                    Image(systemName: "chevron.right.circle.fill")
                        .font(.system(size: 60))
                }
            }
            .foregroundColor(.white)
            .padding(.bottom, 60)
            
            // Progress indicator
            Text("\(currentIndex + 1) / \(totalScreens)")
                .font(.system(size: 30))
                .foregroundColor(.white.opacity(0.8))
                .padding(.bottom, 40)
        }
        .background(
            LinearGradient(
                colors: [.clear, .black.opacity(0.6)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
    }
}

// MARK: - Array Extension
extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    ContentView()
        .environmentObject(APIClient())
}
