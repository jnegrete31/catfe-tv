import SwiftUI
import AVKit

struct LivestreamView: View {
    let streamUrl: String
    @State private var player: AVPlayer?
    @State private var isLoading = true
    @State private var hasError = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.black, Color(red: 0.1, green: 0.1, blue: 0.2)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            if hasError {
                // Error state
                VStack(spacing: 30) {
                    Image(systemName: "video.slash.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.red.opacity(0.7))
                    
                    Text("Unable to load livestream")
                        .font(.system(size: 40, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text("Please check the stream URL in settings")
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
            if !hasError && player != nil {
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
        }
        .onAppear {
            setupPlayer()
        }
    }
    
    private func setupPlayer() {
        guard let url = URL(string: streamUrl) else {
            hasError = true
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
        
        // Check for errors
        playerItem.addObserver(
            NSObject(),
            forKeyPath: "status",
            options: [.new],
            context: nil
        )
        
        // Start playing
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isLoading = false
        }
    }
}

#Preview {
    LivestreamView(streamUrl: "https://example.com/stream.m3u8")
}
