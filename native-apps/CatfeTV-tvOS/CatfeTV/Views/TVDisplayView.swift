import SwiftUI

struct TVDisplayView: View {
    @EnvironmentObject var viewModel: TVDisplayViewModel
    @State private var showControls = false
    @FocusState private var focusedButton: ControlButton?
    
    enum ControlButton: Hashable {
        case previous, playPause, next, refresh
    }
    
    var body: some View {
        ZStack {
            // Main content
            if viewModel.isLoading {
                LoadingView()
            } else if let error = viewModel.error, viewModel.screens.isEmpty {
                ErrorView(message: error, onRetry: viewModel.refresh)
            } else if let screen = viewModel.currentScreen {
                ScreenContentView(screen: screen)
                    .transition(.opacity)
                    .id(screen.id)
            } else {
                FallbackView()
            }
            
            // Weather and Clock overlay
            VStack {
                HStack {
                    Spacer()
                    WeatherClockOverlay(
                        temperature: viewModel.temperature,
                        weatherCode: viewModel.weatherCode
                    )
                    .padding(.top, 40)
                    .padding(.trailing, 60)
                }
                Spacer()
            }
            
            // Paused indicator
            if viewModel.isPaused && !showControls {
                VStack {
                    HStack {
                        PausedBadge()
                            .padding(.top, 40)
                            .padding(.leading, 60)
                        Spacer()
                    }
                    Spacer()
                }
            }
            
            // Controls overlay
            if showControls {
                ControlsOverlay(
                    viewModel: viewModel,
                    focusedButton: $focusedButton,
                    onDismiss: { showControls = false }
                )
            }
        }
        .ignoresSafeArea()
        .onPlayPauseCommand {
            viewModel.togglePause()
        }
        .onMoveCommand { direction in
            if showControls {
                handleFocusMove(direction)
            } else {
                switch direction {
                case .left:
                    viewModel.previousScreen()
                case .right:
                    viewModel.nextScreen()
                case .up, .down:
                    showControls = true
                    focusedButton = .playPause
                @unknown default:
                    break
                }
            }
        }
        .onExitCommand {
            if showControls {
                showControls = false
            }
        }
    }
    
    private func handleFocusMove(_ direction: MoveCommandDirection) {
        switch direction {
        case .left:
            switch focusedButton {
            case .playPause: focusedButton = .previous
            case .next: focusedButton = .playPause
            case .refresh: focusedButton = .next
            default: break
            }
        case .right:
            switch focusedButton {
            case .previous: focusedButton = .playPause
            case .playPause: focusedButton = .next
            case .next: focusedButton = .refresh
            default: break
            }
        case .up, .down:
            showControls = false
        @unknown default:
            break
        }
    }
}

// MARK: - Loading View
struct LoadingView: View {
    var body: some View {
        ZStack {
            Color(hex: "#fef3c7")
            
            VStack(spacing: 24) {
                ProgressView()
                    .scaleEffect(2)
                    .tint(Color(hex: "#92400e"))
                
                Text("Loading content...")
                    .font(.title2)
                    .foregroundColor(Color(hex: "#92400e"))
            }
        }
    }
}

// MARK: - Error View
struct ErrorView: View {
    let message: String
    let onRetry: () -> Void
    
    var body: some View {
        ZStack {
            Color(hex: "#fee2e2")
            
            VStack(spacing: 24) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(Color(hex: "#dc2626"))
                
                Text("Unable to load content")
                    .font(.title)
                    .foregroundColor(Color(hex: "#dc2626"))
                
                Text(message)
                    .font(.body)
                    .foregroundColor(Color(hex: "#991b1b"))
                
                Button("Try Again", action: onRetry)
                    .buttonStyle(.borderedProminent)
                    .tint(Color(hex: "#dc2626"))
            }
        }
    }
}

// MARK: - Fallback View
struct FallbackView: View {
    var body: some View {
        ZStack {
            Color(hex: "#fef3c7")
            
            VStack(spacing: 16) {
                Image(systemName: "cat.fill")
                    .font(.system(size: 80))
                    .foregroundColor(Color(hex: "#92400e"))
                
                Text("Catfé TV")
                    .font(.system(size: 48, weight: .bold, design: .serif))
                    .foregroundColor(Color(hex: "#92400e"))
                
                Text("No content available")
                    .font(.title3)
                    .foregroundColor(Color(hex: "#b45309"))
            }
        }
    }
}

// MARK: - Paused Badge
struct PausedBadge: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "pause.fill")
            Text("Paused")
        }
        .font(.callout.weight(.medium))
        .foregroundColor(.white)
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color.black.opacity(0.5))
        .clipShape(Capsule())
    }
}

// MARK: - Weather Clock Overlay
struct WeatherClockOverlay: View {
    let temperature: Int?
    let weatherCode: Int?
    
    var body: some View {
        HStack(spacing: 16) {
            // Weather
            if let temp = temperature, let code = weatherCode {
                HStack(spacing: 8) {
                    Image(systemName: code.weatherIcon)
                        .font(.title2)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(temp)°F")
                            .font(.title3.weight(.semibold))
                        Text(code.weatherDescription)
                            .font(.caption)
                            .opacity(0.8)
                    }
                }
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.black.opacity(0.4))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            
            // Clock
            TimeDisplay()
        }
    }
}

struct TimeDisplay: View {
    @State private var currentTime = Date()
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text(currentTime, style: .time)
                .font(.title2.weight(.semibold))
            Text(currentTime, format: .dateTime.weekday(.abbreviated).month(.abbreviated).day())
                .font(.caption)
                .opacity(0.8)
        }
        .foregroundColor(.white)
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.black.opacity(0.4))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .onReceive(timer) { time in
            currentTime = time
        }
    }
}

// MARK: - Controls Overlay
struct ControlsOverlay: View {
    @ObservedObject var viewModel: TVDisplayViewModel
    @FocusState.Binding var focusedButton: TVDisplayView.ControlButton?
    let onDismiss: () -> Void
    
    var body: some View {
        ZStack {
            // Semi-transparent background
            Color.black.opacity(0.5)
                .ignoresSafeArea()
            
            VStack {
                // Top status bar
                HStack {
                    // Connection status
                    HStack(spacing: 8) {
                        Image(systemName: viewModel.isOffline ? "wifi.slash" : "wifi")
                            .foregroundColor(viewModel.isOffline ? .yellow : .green)
                        Text(viewModel.isOffline ? "Offline Mode" : "Connected")
                        
                        if viewModel.isPaused {
                            Text("PAUSED")
                                .font(.caption.weight(.bold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.yellow.opacity(0.8))
                                .clipShape(Capsule())
                        }
                    }
                    .font(.callout)
                    .foregroundColor(.white)
                    
                    Spacer()
                    
                    // Screen counter
                    Text("\(viewModel.currentIndex + 1) / \(viewModel.totalScreens)")
                        .font(.callout)
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 60)
                .padding(.top, 40)
                
                Spacer()
                
                // Control buttons
                HStack(spacing: 40) {
                    ControlButton(
                        icon: "chevron.left",
                        label: "Previous",
                        isFocused: focusedButton == .previous,
                        action: viewModel.previousScreen
                    )
                    .focused($focusedButton, equals: .previous)
                    
                    ControlButton(
                        icon: viewModel.isPaused ? "play.fill" : "pause.fill",
                        label: viewModel.isPaused ? "Play" : "Pause",
                        isFocused: focusedButton == .playPause,
                        action: viewModel.togglePause
                    )
                    .focused($focusedButton, equals: .playPause)
                    
                    ControlButton(
                        icon: "chevron.right",
                        label: "Next",
                        isFocused: focusedButton == .next,
                        action: viewModel.nextScreen
                    )
                    .focused($focusedButton, equals: .next)
                    
                    ControlButton(
                        icon: "arrow.clockwise",
                        label: "Refresh",
                        isFocused: focusedButton == .refresh,
                        action: viewModel.refresh
                    )
                    .focused($focusedButton, equals: .refresh)
                }
                
                // Progress dots
                HStack(spacing: 8) {
                    ForEach(0..<min(viewModel.totalScreens, 10), id: \.self) { index in
                        Circle()
                            .fill(index == viewModel.currentIndex % 10 ? Color.white : Color.white.opacity(0.4))
                            .frame(width: index == viewModel.currentIndex % 10 ? 12 : 8,
                                   height: index == viewModel.currentIndex % 10 ? 12 : 8)
                    }
                    
                    if viewModel.totalScreens > 10 {
                        Text("+\(viewModel.totalScreens - 10)")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.top, 24)
                
                // Hint
                Text("Swipe to navigate • Click to select • Menu to dismiss")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.top, 16)
                .padding(.bottom, 60)
            }
        }
    }
}

struct ControlButton: View {
    let icon: String
    let label: String
    let isFocused: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title)
                Text(label)
                    .font(.caption)
            }
            .foregroundColor(.white)
            .frame(width: 100, height: 100)
            .background(isFocused ? Color.white.opacity(0.4) : Color.white.opacity(0.2))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isFocused ? Color.white : Color.clear, lineWidth: 4)
            )
            .scaleEffect(isFocused ? 1.1 : 1.0)
        }
        .buttonStyle(.plain)
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
    TVDisplayView()
        .environmentObject(TVDisplayViewModel())
}
