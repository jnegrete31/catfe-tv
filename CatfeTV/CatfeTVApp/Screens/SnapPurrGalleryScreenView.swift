//
//  SnapPurrGalleryScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr Gallery screen - matches web design, fills full TV
//

import SwiftUI

struct SnapPurrGalleryScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                HStack(alignment: .center, spacing: geo.size.width * 0.05) {
                    // Left: Polaroid photo
                    if screen.imageURL != nil {
                        VStack(spacing: 0) {
                            ScreenImage(url: screen.imageURL)
                                .frame(width: geo.size.width * 0.4, height: geo.size.height * 0.6)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                            
                            Text(screen.title)
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
                        .rotationEffect(.degrees(-1))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                    }
                    
                    // Right: Details + QR
                    VStack(alignment: .leading, spacing: 24) {
                        Spacer()
                        
                        ScreenBadge(text: "Snap & Purr Gallery", color: .loungeMintGreen, emoji: "📸")
                        
                        HStack(spacing: 0) {
                            Text("Snap ")
                                .foregroundColor(.loungeWarmOrange)
                            Text("& ")
                                .foregroundColor(.loungeCream.opacity(0.7))
                            Text("Purr")
                                .foregroundColor(.loungeMintGreen)
                        }
                        .font(.system(size: 48, weight: .bold, design: .serif))
                        
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeCream.opacity(0.7))
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
                            QRCodeView(url: qrURL, size: 150)
                        }
                        
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6), value: appeared)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}
