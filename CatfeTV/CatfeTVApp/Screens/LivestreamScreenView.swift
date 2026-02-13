//
//  LivestreamScreenView.swift
//  CatfeTVApp
//
//  Livestream screen - full-screen video when available, lounge fallback otherwise
//

import SwiftUI
import AVKit

struct LivestreamScreenView: View {
    let screen: Screen
    
    @State private var player: AVPlayer?
    @State private var appeared = false
    @State private var dotOpacity = 1.0
    
    var body: some View {
        Group {
            if let livestreamUrl = screen.livestreamUrl,
               let url = URL(string: livestreamUrl) {
                // Full-screen video player
                ZStack {
                    Color.black.ignoresSafeArea()
                    
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
                                    .opacity(dotOpacity)
                                    .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: dotOpacity)
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
                }
                .onAppear { dotOpacity = 0.3 }
            } else {
                // No livestream URL - show lounge-style placeholder
                BaseScreenLayout(screen: screen) {
                    GeometryReader { geo in
                        VStack(spacing: 0) {
                            Spacer()
                            
                            Image(systemName: "video.slash.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 80, height: 80)
                                .foregroundColor(.loungeCream.opacity(0.3))
                            
                            Spacer().frame(height: 30)
                            
                            Text(screen.title)
                                .font(.system(size: 52, weight: .bold, design: .serif))
                                .foregroundColor(.loungeCream)
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: geo.size.width * 0.7)
                            
                            Spacer().frame(height: 16)
                            
                            Text(screen.subtitle ?? "The cat cam will be back soon!")
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeCream.opacity(0.6))
                                .multilineTextAlignment(.center)
                            
                            Spacer()
                            
                            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                                QRCodeView(url: qrURL, size: 180)
                            }
                            
                            Spacer()
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
            }
        }
    }
}
