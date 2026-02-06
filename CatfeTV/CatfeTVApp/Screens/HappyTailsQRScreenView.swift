//
//  HappyTailsQRScreenView.swift
//  CatfeTVApp
//
//  Happy Tails QR screen - QR code to submit happy tails stories
//

import SwiftUI

struct HappyTailsQRScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        ZStack {
            // Dark cosmic background
            LinearGradient(
                colors: [Color(hex: "1a1a2e"), Color(hex: "16213e"), Color(hex: "0f3460")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Animated circles
            AnimatedCirclesView(color: Color.loungeMintGreen.opacity(0.1))
            
            VStack(spacing: 40) {
                // Header
                HStack(spacing: 0) {
                    Text("🏡 ")
                        .font(.system(size: 50))
                    Text("Happy Tails")
                        .font(.system(size: 56, weight: .bold, design: .serif))
                        .foregroundColor(.white)
                }
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6), value: appeared)
                
                // Subtitle
                Text(screen.subtitle ?? "Share your adoption success story!")
                    .font(.system(size: 28, weight: .light))
                    .foregroundColor(.white.opacity(0.8))
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: 900)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                
                Spacer().frame(height: 20)
                
                // QR Code
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    VStack(spacing: 24) {
                        QRCodeView(url: qrURL, size: 350)
                        
                        Text("Scan to Share Your Story")
                            .font(.system(size: 24, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0.85)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3), value: appeared)
                }
                
                // Body text
                if let body = screen.bodyText {
                    Text(body)
                        .font(.system(size: 22))
                        .foregroundColor(.white.opacity(0.6))
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 800)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                }
                
                Spacer()
            }
            .padding(60)
        }
        .onAppear {
            withAnimation {
                appeared = true
            }
        }
    }
}
