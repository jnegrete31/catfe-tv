//
//  LivestreamScreenView.swift
//  CatfeTVApp
//
//  Livestream screen - shows embedded livestream video
//

import SwiftUI
import AVKit

struct LivestreamScreenView: View {
    let screen: Screen
    
    @State private var player: AVPlayer?
    @State private var appeared = false
    
    var body: some View {
        ZStack {
            // Dark background
            Color(hex: "1a1a1a")
                .ignoresSafeArea()
            
            if let livestreamUrl = screen.livestreamUrl,
               let url = URL(string: livestreamUrl) {
                // Full-screen video player
                VideoPlayer(player: player)
                    .ignoresSafeArea()
                    .onAppear {
                        player = AVPlayer(url: url)
                        player?.play()
                    }
                    .onDisappear {
                        player?.pause()
                        player = nil
                    }
                
                // LIVE badge overlay
                VStack {
                    HStack {
                        Spacer()
                        HStack(spacing: 8) {
                            Circle()
                                .fill(Color.red)
                                .frame(width: 12, height: 12)
                            Text("LIVE")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.black.opacity(0.6))
                        .cornerRadius(8)
                        .padding(30)
                    }
                    Spacer()
                }
            } else {
                // No livestream URL - show placeholder
                VStack(spacing: 30) {
                    Image(systemName: "video.slash.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 100, height: 100)
                        .foregroundColor(.white.opacity(0.3))
                    
                    Text("Livestream Unavailable")
                        .font(.system(size: 36, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                    
                    Text("The cat cam will be back soon!")
                        .font(.system(size: 22))
                        .foregroundColor(.white.opacity(0.3))
                }
            }
        }
    }
}
