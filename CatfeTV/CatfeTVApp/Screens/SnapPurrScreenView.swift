//
//  SnapPurrScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr screen - shows guest photos in polaroid style when available,
//  falls back to camera CTA when no photo
//

import SwiftUI

struct SnapPurrScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                if screen.imageURL != nil {
                    // Photo gallery layout (like HappyTailsScreenView)
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
                        .rotationEffect(.degrees(-2))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                        
                        // Right: Details
                        VStack(alignment: .leading, spacing: 24) {
                            Spacer()
                            
                            ScreenBadge(text: "Snap & Purr", color: .loungeWarmOrange, emoji: "📸")
                            
                            HStack(spacing: 0) {
                                Text("Snap ")
                                    .foregroundColor(.loungeWarmOrange)
                                Text("& ")
                                    .foregroundColor(.loungeCream.opacity(0.7))
                                Text("Purr!")
                                    .foregroundColor(.loungeMintGreen)
                            }
                            .font(.system(size: 52, weight: .bold, design: .serif))
                            
                            if let subtitle = screen.subtitle {
                                Text(subtitle)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.loungeCream.opacity(0.7))
                                    .lineSpacing(6)
                                    .lineLimit(4)
                            }
                            
                            if let body = screen.bodyText {
                                Text(body)
                                    .font(CatfeTypography.body)
                                    .foregroundColor(.loungeCream.opacity(0.6))
                                    .lineSpacing(6)
                                    .lineLimit(4)
                            }
                            
                            Spacer()
                            
                            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                                QRCodeView(url: qrURL, size: 140)
                            }
                            
                            Spacer()
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6), value: appeared)
                } else {
                    // Fallback: Camera CTA layout (original design)
                    VStack(spacing: 0) {
                        Spacer()
                        
                        // Camera icon
                        ZStack {
                            RoundedRectangle(cornerRadius: 40)
                                .fill(
                                    LinearGradient(
                                        colors: [Color.loungeWarmOrange, Color.loungeAmber],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                                .frame(width: 120, height: 120)
                                .shadow(color: Color.loungeWarmOrange.opacity(0.4), radius: 20)
                            
                            Image(systemName: "camera.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 50, height: 50)
                                .foregroundColor(.white)
                        }
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.7)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7), value: appeared)
                        
                        Spacer().frame(height: 30)
                        
                        // Title
                        HStack(spacing: 0) {
                            Text("Snap ")
                                .foregroundColor(.loungeWarmOrange)
                            Text("& ")
                                .foregroundColor(.loungeCream.opacity(0.7))
                            Text("Purr!")
                                .foregroundColor(.loungeMintGreen)
                        }
                        .font(.system(size: 64, weight: .bold, design: .serif))
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                        
                        Spacer().frame(height: 16)
                        
                        Text(screen.subtitle ?? "Share your best Catfé moments!")
                            .font(CatfeTypography.subtitle)
                            .foregroundColor(.loungeCream.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: geo.size.width * 0.6)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                        
                        if let body = screen.bodyText {
                            Spacer().frame(height: 12)
                            Text(body)
                                .font(CatfeTypography.caption)
                                .foregroundColor(.loungeCream.opacity(0.5))
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: geo.size.width * 0.5)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                        }
                        
                        Spacer()
                        
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            QRCodeView(url: qrURL, size: 180)
                                .opacity(appeared ? 1 : 0)
                                .scaleEffect(appeared ? 1 : 0.85)
                                .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.4), value: appeared)
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
