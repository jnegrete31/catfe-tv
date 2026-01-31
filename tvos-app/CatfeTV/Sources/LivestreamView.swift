import SwiftUI
import AVKit

struct LivestreamView: View {
    let screen: Screen
    let settings: Settings?
    @State private var player: AVPlayer?
    @State private var isLoading = true
    @State private var hasError = false
    
    private var streamUrl: String? {
        screen.livestreamUrl
    }
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.black, Color(red: 0.1, green: 0.1, blue: 0.2)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            if streamUrl == nil || streamUrl?.isEmpty == true {
                // No stream URL configured
                VStack(spacing: 30) {
                    Image(systemName: "video.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.white.opacity(0.5))
                    
                    Text("Livestream")
                        .font(.system(size: 60, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("No stream URL configured")
                        .font(.system(size: 30))
                        .foregroundColor(.white.opacity(0.6))
                }
            } else if hasError {
                // Error state
                VStack(spacing: 30) {
                    Image(systemName: "video.slash.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.red.opacity(0.7))
                    
                    Text("Unable to load livestream")
                        .font(.system(size: 40, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text("Please check the stream URL")
                        .font(.system(size: 24))
                        .foregroundColor(.white.opacity(0.7))
                }
            } else if let player = player {
                // Video player
                VideoPlayer(player: player)
                    .ignoresSafeArea()
                    .onAppear {
                        player.play()
                    }
                    .onDisappear {
                        player.pause()
                    }
                
                // Loading overlay
                if isLoading {
                    ZStack {
                        Color.black.opacity(0.5)
                        VStack(spacing: 20) {
                            ProgressView()
                                .scaleEffect(2)
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            Text("Loading livestream...")
                                .font(.system(size: 24))
                                .foregroundColor(.white)
                        }
                    }
                }
            } else {
                // Initial loading
                VStack(spacing: 20) {
                    ProgressView()
                        .scaleEffect(2)
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    Text("Connecting to livestream...")
                        .font(.system(size: 24))
                        .foregroundColor(.white)
                }
            }
            
            // Live indicator
            if !hasError && player != nil && !isLoading {
                VStack {
                    HStack {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(Color.red)
                                .frame(width: 12, height: 12)
                            Text("LIVE")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.black.opacity(0.6))
                        .cornerRadius(8)
                        .padding(.leading, 60)
                        .padding(.top, 60)
                        
                        Spacer()
                    }
                    Spacer()
                }
            }
            
            // Logo overlay
            VStack {
                Spacer()
                HStack {
                    CatfeLogo(logoUrl: settings?.logoUrl)
                        .padding(.leading, 60)
                        .padding(.bottom, 120)
                    Spacer()
                }
            }
            
            // Title overlay if provided
            if !screen.title.isEmpty {
                VStack {
                    Spacer()
                    HStack {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(screen.title)
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.white)
                            if let subtitle = screen.subtitle, !subtitle.isEmpty {
                                Text(subtitle)
                                    .font(.system(size: 24))
                                    .foregroundColor(.white.opacity(0.8))
                            }
                        }
                        .padding(.horizontal, 30)
                        .padding(.vertical, 20)
                        .background(Color.black.opacity(0.6))
                        .cornerRadius(16)
                        .padding(.leading, 60)
                        .padding(.bottom, 60)
                        
                        Spacer()
                    }
                }
            }
        }
        .onAppear {
            setupPlayer()
        }
    }
    
    private func setupPlayer() {
        guard let urlString = streamUrl, !urlString.isEmpty, let url = URL(string: urlString) else {
            return
        }
        
        let playerItem = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: playerItem)
        
        // Observe player status
        NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: playerItem,
            queue: .main
        ) { _ in
            // Loop the stream if it ends
            player?.seek(to: .zero)
            player?.play()
        }
        
        // Start playing
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isLoading = false
        }
    }
}

#Preview {
    LivestreamView(
        screen: Screen(
            id: 1,
            type: "LIVESTREAM",
            title: "Cat Lounge Camera",
            subtitle: "Watch our cats play!",
            body: nil,
            imagePath: nil,
            imageDisplayMode: nil,
            qrUrl: nil,
            startAt: nil,
            endAt: nil,
            daysOfWeek: nil,
            timeStart: nil,
            timeEnd: nil,
            priority: 1,
            durationSeconds: 60,
            sortOrder: 0,
            isActive: true,
            isProtected: false,
            isAdopted: nil,
            livestreamUrl: "https://example.com/stream.m3u8",
            createdAt: "",
            updatedAt: ""
        ),
        settings: nil
    )
}
