//
//  HappyTailsScreenView.swift
//  CatfeTVApp
//
//  Happy Tails screen - shows adopted cat success stories
//

import SwiftUI

struct HappyTailsScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        ZStack {
            // Warm dark background
            LinearGradient(
                colors: [Color(hex: "2d2d2d"), Color(hex: "1a1a1a")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Warm amber glow
            GeometryReader { geo in
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "DAA520").opacity(0.3), Color.clear],
                        center: .center, startRadius: 0, endRadius: geo.size.width * 0.35
                    ))
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.5, y: -geo.size.height * 0.1)
            }
            
            // Mint green floor
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
            
            VStack(spacing: 30) {
                // Badge
                ScreenBadge(text: "Happy Tails", color: Color(hex: "E8913A"), emoji: "🏡")
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5), value: appeared)
                
                // Title
                Text(screen.title)
                    .font(.system(size: 56, weight: .bold, design: .serif))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : -20)
                    .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                
                Spacer().frame(height: 10)
                
                // Main content: Photo + Story
                HStack(alignment: .center, spacing: 60) {
                    // Photo in polaroid frame
                    if screen.imageURL != nil {
                        VStack(spacing: 0) {
                            ScreenImage(url: screen.imageURL)
                                .frame(width: 500, height: 400)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                            
                            Text(screen.catName ?? "Happy Cat")
                                .font(.system(size: 22, weight: .medium, design: .serif))
                                .foregroundColor(Color(hex: "3d3d3d"))
                                .padding(.top, 16)
                                .padding(.bottom, 8)
                        }
                        .padding(20)
                        .padding(.bottom, 30)
                        .background(Color(hex: "FFFEF9"))
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.4), radius: 25, x: 0, y: 12)
                        .rotationEffect(.degrees(-2))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.2), value: appeared)
                    }
                    
                    // Story text
                    VStack(alignment: .leading, spacing: 20) {
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(.system(size: 30, weight: .light))
                                .foregroundColor(.white.opacity(0.8))
                        }
                        
                        if let body = screen.bodyText {
                            Text(body)
                                .font(.system(size: 24))
                                .foregroundColor(.white.opacity(0.6))
                                .lineSpacing(6)
                                .lineLimit(6)
                        }
                        
                        Spacer()
                        
                        // Adopted badge
                        HStack(spacing: 8) {
                            Text("❤️")
                                .font(.system(size: 20))
                            Text("Found their forever home!")
                                .font(.system(size: 22, weight: .medium))
                                .foregroundColor(Color.loungeMintGreen)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(
                            Capsule()
                                .fill(Color.loungeMintGreen.opacity(0.15))
                                .overlay(Capsule().stroke(Color.loungeMintGreen.opacity(0.3), lineWidth: 1))
                        )
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .opacity(appeared ? 1 : 0)
                    .offset(x: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                }
                .padding(.horizontal, 80)
                
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
