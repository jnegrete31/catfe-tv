//
//  AdoptionCounterScreenView.swift
//  CatfeTVApp
//
//  Adoption counter screen - matches web AdoptionCounterScreen design
//

import SwiftUI

struct AdoptionCounterScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    let emojis = ["🎉", "🎊", "❤️", "🐱", "⭐", "🌟"]
    
    var counterGradient: LinearGradient {
        LinearGradient(
            colors: [Color(hex: "4ade80"), Color(hex: "22c55e"), Color(hex: "16a34a")],
            startPoint: .top,
            endPoint: .bottom
        )
    }
    
    var body: some View {
        ZStack {
            // Dark cosmic background
            CosmicBackground()
            
            // Subtle green radial glow
            RadialGradient(
                colors: [Color.green.opacity(0.2), Color.clear],
                center: .center,
                startRadius: 5,
                endRadius: 600
            )
            .offset(y: 200)
            
            // Floating emojis
            ForEach(0..<15, id: \.self) { _ in
                FloatingEmojiView(emoji: emojis.randomElement() ?? "✨")
            }
            
            VStack(spacing: 30) {
                // Badge
                ScreenBadge(text: "Forever Homes Found", color: .green, emoji: "🏡")
                
                // Big counter number
                Text("\(settings.totalAdoptionCount)")
                    .font(.system(size: 180, weight: .bold))
                    .foregroundStyle(counterGradient)
                
                VStack(spacing: 15) {
                    Text("Cats Adopted")
                        .font(.custom("Georgia", size: 72))
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("Every adoption makes a world of difference.")
                        .font(CatfeTypography.body)
                        .foregroundColor(.white.opacity(0.8))
                }
                
                // Thank you capsule
                Text("Thank you for your support!")
                    .font(CatfeTypography.caption)
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Capsule())
            }
            .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: 5)
        }
    }
}
