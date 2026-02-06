//
//  CosmicHelpers.swift
//  CatfeTVApp
//
//  Shared helper views for cosmic-themed screens (AdoptionCounter, ThankYou, HappyTails, CheckIn, etc.)
//

import SwiftUI

// MARK: - Cosmic Background (dark gradient + animated circles + light rays)

struct CosmicBackground: View {
    var color: Color = .green
    
    var body: some View {
        ZStack {
            // Dark cosmic gradient
            LinearGradient(
                colors: [Color(hex: "1a1a2e"), Color(hex: "16213e"), Color(hex: "0f3460")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Animated circles
            AnimatedCirclesView(color: color.opacity(0.1))
            
            // Light rays
            LightRaysView(color: color)
        }
    }
}

// MARK: - Animated Circles

struct AnimatedCirclesView: View {
    var color: Color = .white.opacity(0.1)
    
    @State private var animate = false
    
    var body: some View {
        GeometryReader { geo in
            Circle()
                .stroke(color, lineWidth: 1)
                .frame(width: 300, height: 300)
                .position(x: geo.size.width * 0.2, y: geo.size.height * 0.3)
                .scaleEffect(animate ? 1.1 : 0.9)
            
            Circle()
                .stroke(color, lineWidth: 1)
                .frame(width: 200, height: 200)
                .position(x: geo.size.width * 0.8, y: geo.size.height * 0.6)
                .scaleEffect(animate ? 0.9 : 1.1)
            
            Circle()
                .stroke(color, lineWidth: 1)
                .frame(width: 150, height: 150)
                .position(x: geo.size.width * 0.5, y: geo.size.height * 0.15)
                .scaleEffect(animate ? 1.05 : 0.95)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 4).repeatForever(autoreverses: true)) {
                animate = true
            }
        }
    }
}

// MARK: - Light Rays

struct LightRaysView: View {
    var color: Color = .green
    
    var body: some View {
        GeometryReader { geo in
            ForEach(0..<3, id: \.self) { i in
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [color.opacity(0.1), Color.clear],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(width: 2, height: geo.size.height * 0.4)
                    .rotationEffect(.degrees(Double(i) * 15 - 15))
                    .position(x: geo.size.width * (0.3 + Double(i) * 0.2), y: geo.size.height * 0.2)
            }
        }
    }
}

// MARK: - Floating Emoji View

struct FloatingEmojiView: View {
    let emoji: String
    
    @State private var yOffset: CGFloat = 0
    @State private var opacity: Double = 0
    
    var body: some View {
        Text(emoji)
            .font(.system(size: 40))
            .opacity(opacity)
            .offset(y: yOffset)
            .onAppear {
                let duration = Double.random(in: 3...6)
                withAnimation(.easeInOut(duration: duration).repeatForever(autoreverses: true)) {
                    yOffset = CGFloat.random(in: -30...30)
                    opacity = Double.random(in: 0.3...0.7)
                }
            }
    }
}

// MARK: - Glass Card View (for CheckIn screen)

struct GlassCardView<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(24)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.white.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.white.opacity(0.1), lineWidth: 1)
                    )
            )
    }
}

// MARK: - Info Row (for CheckIn screen)

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(label.uppercased())
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.cyan.opacity(0.8))
                .tracking(1.5)
            Text(value)
                .font(.system(size: 28, weight: .medium))
                .foregroundColor(.white)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
        )
    }
}
