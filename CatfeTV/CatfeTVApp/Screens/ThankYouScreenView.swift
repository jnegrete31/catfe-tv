//
//  ThankYouScreenView.swift
//  CatfeTVApp
//
//  Thank You screen - matches web design, fills full TV
//

import SwiftUI

struct ThankYouScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    @State private var heartScale = 1.0
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                HStack(alignment: .center, spacing: geo.size.width * 0.05) {
                    // Left: Image in polaroid (if available)
                    if screen.imageURL != nil {
                        VStack(spacing: 0) {
                            ScreenImage(url: screen.imageURL)
                                .frame(width: geo.size.width * 0.35, height: geo.size.height * 0.55)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                            
                            Text("Thank You! 💕")
                                .font(.system(size: 20, weight: .medium, design: .serif))
                                .foregroundColor(Color(hex: "3d3d3d"))
                                .padding(.top, 16)
                                .padding(.bottom, 8)
                        }
                        .padding(20)
                        .padding(.bottom, 30)
                        .background(Color(hex: "FFFEF9"))
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.4), radius: 20, x: 0, y: 10)
                        .rotationEffect(.degrees(-2))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                    }
                    
                    // Right: Thank you message
                    VStack(alignment: screen.imageURL != nil ? .leading : .center, spacing: 24) {
                        Spacer()
                        
                        // Heart icon
                        Text("❤️")
                            .font(.system(size: 60))
                            .scaleEffect(heartScale)
                            .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: heartScale)
                        
                        Text(screen.title)
                            .font(.system(size: 52, weight: .bold, design: .serif))
                            .foregroundColor(.loungeCream)
                            .lineLimit(3)
                        
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeAmber)
                        }
                        
                        if let body = screen.bodyText {
                            Text(body)
                                .font(CatfeTypography.body)
                                .foregroundColor(.loungeCream.opacity(0.7))
                                .lineSpacing(6)
                                .lineLimit(6)
                        }
                        
                        Spacer()
                        
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            QRCodeView(url: qrURL, size: 140, label: screen.qrLabel)
                        }
                        
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, alignment: screen.imageURL != nil ? .leading : .center)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6), value: appeared)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
            heartScale = 1.15
        }
    }
}
