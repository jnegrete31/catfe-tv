//
//  SnapPurrQRScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr QR screen - shows guest photos in polaroid style when available,
//  falls back to camera CTA when no photo
//

import SwiftUI

struct SnapPurrQRScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                if screen.imageURL != nil {
                    // Photo gallery layout with QR emphasis
                    HStack(alignment: .center, spacing: geo.size.width * 0.05) {
                        // Left: Image in polaroid
                        VStack(spacing: 0) {
                            ScreenImage(url: screen.imageURL)
                                .frame(width: geo.size.width * 0.38, height: geo.size.height * 0.6)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                            
                            Text("Guest Photo")
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
                        .rotationEffect(.degrees(2))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                        
                        // Right: Details + QR
                        VStack(alignment: .leading, spacing: 24) {
                            Spacer()
                            
                            ScreenBadge(text: "Snap & Purr", color: .loungeWarmOrange, emoji: "📸")
                            
                            Text(screen.title)
                                .font(.system(size: 48, weight: .bold, design: .serif))
                                .foregroundColor(.loungeCream)
                                .lineLimit(3)
                            
                            if let subtitle = screen.subtitle {
                                Text(subtitle)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.loungeCream.opacity(0.7))
                                    .lineSpacing(6)
                                    .lineLimit(3)
                            }
                            
                            Spacer()
                            
                            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                                QRCodeView(url: qrURL, size: 180, label: screen.qrLabel)
                                    .opacity(appeared ? 1 : 0)
                                    .scaleEffect(appeared ? 1 : 0.8)
                                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3), value: appeared)
                            }
                            
                            Spacer()
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6), value: appeared)
                } else {
                    // Fallback: Camera CTA layout
                    VStack(spacing: 0) {
                        Spacer()
                        
                        ZStack {
                            RoundedRectangle(cornerRadius: 30)
                                .fill(
                                    LinearGradient(
                                        colors: [Color.loungeWarmOrange, Color.loungeAmber],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                                .frame(width: 100, height: 100)
                                .shadow(color: Color.loungeWarmOrange.opacity(0.4), radius: 15)
                            
                            Image(systemName: "camera.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 40, height: 40)
                                .foregroundColor(.white)
                        }
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.7)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7), value: appeared)
                        
                        Spacer().frame(height: 24)
                        
                        Text(screen.title)
                            .font(.system(size: 52, weight: .bold, design: .serif))
                            .foregroundColor(.loungeCream)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: geo.size.width * 0.7)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                        
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
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}
