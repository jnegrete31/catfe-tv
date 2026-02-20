//
//  HappyTailsQRScreenView.swift
//  CatfeTVApp
//
//  Happy Tails QR screen - matches web design, fills full TV
//

import SwiftUI

struct HappyTailsQRScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                VStack(spacing: 0) {
                    Spacer()
                    
                    ScreenBadge(text: "Happy Tails", color: .loungeAmber, emoji: "🏡")
                    
                    Spacer().frame(height: 24)
                    
                    Text(screen.title)
                        .font(.system(size: 56, weight: .bold, design: .serif))
                        .foregroundColor(.loungeCream)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: geo.size.width * 0.7)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    if let subtitle = screen.subtitle {
                        Spacer().frame(height: 16)
                        Text(subtitle)
                            .font(CatfeTypography.subtitle)
                            .foregroundColor(.loungeCream.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: geo.size.width * 0.6)
                    }
                    
                    Spacer()
                    
                    if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                        QRCodeView(url: qrURL, size: 220, label: screen.qrLabel)
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.8)
                            .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3), value: appeared)
                    }
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}
