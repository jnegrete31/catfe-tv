//
//  MembershipScreenView.swift
//  CatfeTVApp
//
//  Membership screen - matches web MembershipScreen design
//

import SwiftUI

struct MembershipScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        ZStack {
            // Dark background with warm amber tones
            LinearGradient(
                colors: [Color(hex: "2d2d2d"), Color(hex: "1a1a1a")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Warm amber glow from top
            GeometryReader { geo in
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "DAA520").opacity(0.3), Color.clear],
                        center: .center, startRadius: 0, endRadius: geo.size.width * 0.35
                    ))
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.5, y: -geo.size.height * 0.1)
            }
            
            // Mint green floor reflection
            VStack {
                Spacer()
                LinearGradient(
                    colors: [Color.clear, Color.loungeMintGreen.opacity(0.15)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 300)
            }
            .ignoresSafeArea()
            
            VStack(spacing: 40) {
                // Badge
                ScreenBadge(text: "Membership", color: Color(hex: "DAA520"), emoji: "👑")
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5), value: appeared)
                
                // Title
                Text(screen.title)
                    .font(.system(size: 64, weight: .bold, design: .serif))
                    .foregroundColor(Color(hex: "DAA520"))
                    .multilineTextAlignment(.center)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : -20)
                    .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                
                // Subtitle
                if let subtitle = screen.subtitle {
                    Text(subtitle)
                        .font(.system(size: 32, weight: .light))
                        .foregroundColor(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 1000)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                }
                
                Spacer().frame(height: 20)
                
                // Main content: Image + Info
                HStack(alignment: .center, spacing: 60) {
                    // Left: Image in a card
                    if screen.imageURL != nil {
                        ScreenImage(url: screen.imageURL)
                            .frame(width: 450, height: 350)
                            .clipShape(RoundedRectangle(cornerRadius: 20))
                            .shadow(color: Color(hex: "DAA520").opacity(0.3), radius: 20, x: 0, y: 10)
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.9)
                            .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3), value: appeared)
                    }
                    
                    // Right: Body text + QR
                    VStack(alignment: .leading, spacing: 24) {
                        if let body = screen.bodyText {
                            Text(body)
                                .font(.system(size: 24, weight: .regular))
                                .foregroundColor(.white.opacity(0.7))
                                .lineSpacing(6)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                        }
                        
                        // Membership perks
                        VStack(alignment: .leading, spacing: 12) {
                            MembershipPerk(icon: "🐱", text: "Unlimited cat lounge visits")
                            MembershipPerk(icon: "☕", text: "Free drinks every visit")
                            MembershipPerk(icon: "🎉", text: "Exclusive member events")
                            MembershipPerk(icon: "💝", text: "Priority adoption access")
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                        
                        Spacer()
                        
                        // QR Code
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            HStack(spacing: 20) {
                                QRCodeView(url: qrURL, size: 160)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Become a Member")
                                        .font(.system(size: 22, weight: .semibold))
                                        .foregroundColor(Color(hex: "DAA520"))
                                    Text("Scan to learn more")
                                        .font(.system(size: 16))
                                        .foregroundColor(.white.opacity(0.5))
                                }
                            }
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.6), value: appeared)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(.horizontal, 60)
                
                Spacer()
            }
            .padding(.top, 40)
        }
        .onAppear {
            withAnimation {
                appeared = true
            }
        }
    }
}

// MARK: - Membership Perk Row

private struct MembershipPerk: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Text(icon)
                .font(.system(size: 24))
            Text(text)
                .font(.system(size: 22, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
        }
    }
}
