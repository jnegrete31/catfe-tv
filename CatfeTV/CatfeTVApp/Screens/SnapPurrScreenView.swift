//
//  SnapPurrScreenView.swift
//  CatfeTVApp
//
//  "Follow Us" social media channels screen — premium dark design
//  Shows Instagram, Facebook, Threads, TikTok with platform-colored cards
//  Each card has its own QR code linking to the profile
//

import SwiftUI

// MARK: - Social Channel Data

private struct SocialChannel {
    let name: String
    let handle: String
    let url: String
    let accent: Color
    let systemIcon: String  // SF Symbol name
}

private let socialChannels: [SocialChannel] = [
    SocialChannel(
        name: "Instagram",
        handle: "@catfescv",
        url: "http://instagram.com/catfescv",
        accent: Color(hex: "E1306C"),
        systemIcon: "camera"
    ),
    SocialChannel(
        name: "Facebook",
        handle: "@catfescv",
        url: "https://www.facebook.com/catfescv",
        accent: Color(hex: "1877F2"),
        systemIcon: "hand.thumbsup.fill"
    ),
    SocialChannel(
        name: "Threads",
        handle: "@catfescv",
        url: "https://www.threads.net/@catfescv",
        accent: .white,
        systemIcon: "at"
    ),
    SocialChannel(
        name: "TikTok",
        handle: "@catfe.la",
        url: "https://www.tiktok.com/@catfe.la",
        accent: Color(hex: "00F2EA"),
        systemIcon: "music.note"
    )
]

// MARK: - Main View

struct SnapPurrScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        ZStack {
            // Dark premium background
            Color(hex: "1C1410")
                .ignoresSafeArea()
            
            // Warm radial glows
            GeometryReader { geo in
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "8B5E3C").opacity(0.1), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.4
                    ))
                    .frame(width: geo.size.width * 0.8, height: geo.size.width * 0.8)
                    .position(x: geo.size.width * 0.5, y: 0)
                
                // Instagram pink glow bottom-left
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "E1306C").opacity(0.05), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.2, y: geo.size.height)
                
                // TikTok cyan glow bottom-right
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "00F2EA").opacity(0.04), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.8, y: geo.size.height)
            }
            
            // Top accent line — rainbow of social colors
            VStack {
                LinearGradient(
                    colors: [.clear, Color(hex: "E1306C"), Color(hex: "1877F2"), Color(hex: "00F2EA"), .clear],
                    startPoint: .leading, endPoint: .trailing
                )
                .frame(height: 2)
                Spacer()
            }
            .ignoresSafeArea()
            
            // Content
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 8) {
                    Text("STAY CONNECTED")
                        .font(.system(size: 22, weight: .medium, design: .serif))
                        .tracking(8)
                        .foregroundColor(Color(hex: "C4956A"))
                    
                    Text(screen.title.isEmpty ? "Follow Us" : screen.title)
                        .font(.system(size: 64, weight: .bold, design: .serif))
                        .foregroundColor(Color(hex: "F5E6D3"))
                    
                    // Divider line
                    LinearGradient(
                        colors: [.clear, Color(hex: "C4956A"), .clear],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(width: 120, height: 1)
                    .padding(.top, 4)
                    
                    if let subtitle = screen.subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.system(size: 28, weight: .regular, design: .serif))
                            .foregroundColor(Color(hex: "F5E6D3").opacity(0.6))
                            .padding(.top, 4)
                    }
                }
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : -20)
                .animation(.easeOut(duration: 0.6), value: appeared)
                .padding(.top, 50)
                .padding(.bottom, 30)
                
                // Four social channel cards with QR codes
                HStack(alignment: .top, spacing: 40) {
                    ForEach(Array(socialChannels.enumerated()), id: \.offset) { index, channel in
                        SocialChannelCard(channel: channel)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 40)
                            .animation(
                                .easeOut(duration: 0.5).delay(0.15 + Double(index) * 0.12),
                                value: appeared
                            )
                    }
                }
                .padding(.horizontal, 80)
                
                Spacer(minLength: 16)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}

// MARK: - Social Channel Card

private struct SocialChannelCard: View {
    let channel: SocialChannel
    
    var body: some View {
        VStack(spacing: 0) {
            // Glow effect + Icon
            ZStack {
                Circle()
                    .fill(RadialGradient(
                        colors: [channel.accent.opacity(0.15), .clear],
                        center: .center, startRadius: 0,
                        endRadius: 80
                    ))
                    .frame(width: 140, height: 140)
                
                // Icon
                Image(systemName: channel.systemIcon)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 40, height: 40)
                    .foregroundColor(channel.accent)
                    .padding(18)
                    .background(channel.accent.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 18))
            }
            .padding(.top, 20)
            .padding(.bottom, 4)
            
            // Platform name
            Text(channel.name)
                .font(.system(size: 32, weight: .bold, design: .serif))
                .foregroundColor(Color(hex: "F5E6D3"))
                .padding(.bottom, 2)
            
            // Handle
            Text(channel.handle)
                .font(.system(size: 22, weight: .medium))
                .foregroundColor(channel.accent)
                .padding(.bottom, 12)
            
            // QR Code for this channel
            QRCodeView(url: channel.url, size: 100, label: nil)
                .padding(.bottom, 6)
            
            Text("Scan to follow")
                .font(.system(size: 14))
                .foregroundColor(Color(hex: "F5E6D3").opacity(0.35))
                .padding(.bottom, 8)
            
            Spacer(minLength: 0)
            
            // CTA button
            Text("FOLLOW US")
                .font(.system(size: 16, weight: .bold))
                .tracking(3)
                .foregroundColor(channel.accent)
                .padding(.horizontal, 22)
                .padding(.vertical, 10)
                .background(channel.accent.opacity(0.12))
                .overlay(
                    RoundedRectangle(cornerRadius: 22)
                        .stroke(channel.accent.opacity(0.25), lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 22))
                .padding(.bottom, 24)
        }
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "261E16"), Color(hex: "1E1610")],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(channel.accent.opacity(0.15), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 10)
    }
}
