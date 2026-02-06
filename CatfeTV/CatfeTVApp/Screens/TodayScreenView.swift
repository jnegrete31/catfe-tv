//
//  TodayScreenView.swift
//  CatfeTVApp
//
//  Today at Catfé screen - matches web design, fills full TV
//

import SwiftUI

struct TodayScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                VStack(spacing: 0) {
                    // Header
                    VStack(spacing: 16) {
                        ScreenBadge(text: "Today at Catfé", color: .loungeWarmOrange, emoji: "☀️")
                        
                        Text(screen.title)
                            .font(.system(size: 60, weight: .bold, design: .serif))
                            .foregroundColor(.loungeCream)
                            .multilineTextAlignment(.center)
                        
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeCream.opacity(0.7))
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: geo.size.width * 0.7)
                        }
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : -20)
                    .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    Spacer()
                    
                    // Main content: image + body side by side
                    HStack(alignment: .center, spacing: geo.size.width * 0.05) {
                        // Left: Image in polaroid
                        if screen.imageURL != nil {
                            VStack(spacing: 0) {
                                ScreenImage(url: screen.imageURL)
                                    .frame(width: geo.size.width * 0.38, height: geo.size.height * 0.5)
                                    .clipShape(RoundedRectangle(cornerRadius: 4))
                                
                                Text("Today's Highlight")
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
                            .rotationEffect(.degrees(1))
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.85)
                            .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.2), value: appeared)
                        }
                        
                        // Right: Body text + QR
                        VStack(alignment: .leading, spacing: 24) {
                            Spacer()
                            
                            if let body = screen.bodyText {
                                Text(body)
                                    .font(CatfeTypography.body)
                                    .foregroundColor(.loungeCream.opacity(0.7))
                                    .lineSpacing(8)
                                    .lineLimit(8)
                            }
                            
                            Spacer()
                            
                            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                                QRCodeView(url: qrURL, size: 130)
                            }
                            
                            Spacer()
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .opacity(appeared ? 1 : 0)
                        .offset(x: appeared ? 0 : 30)
                        .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
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
