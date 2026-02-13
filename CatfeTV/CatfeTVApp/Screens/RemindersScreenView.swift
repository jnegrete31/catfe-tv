//
//  RemindersScreenView.swift
//  CatfeTVApp
//
//  Reminders screen - matches web design, fills full TV
//

import SwiftUI

struct RemindersScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    @State private var bellBounce = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                VStack(spacing: 0) {
                    Spacer()
                    
                    // Bell icon
                    Text("🔔")
                        .font(.system(size: 80))
                        .scaleEffect(bellBounce ? 1.1 : 1.0)
                        .rotationEffect(.degrees(bellBounce ? 5 : -5))
                        .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: bellBounce)
                    
                    Spacer().frame(height: 30)
                    
                    // Title
                    Text(screen.title)
                        .font(.system(size: 64, weight: .bold, design: .serif))
                        .foregroundColor(.loungeCream)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: geo.size.width * 0.8)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    Spacer().frame(height: 20)
                    
                    if let subtitle = screen.subtitle {
                        Text(subtitle)
                            .font(CatfeTypography.subtitle)
                            .foregroundColor(.loungeWarmOrange)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: geo.size.width * 0.7)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.1), value: appeared)
                    }
                    
                    Spacer().frame(height: 20)
                    
                    if let body = screen.bodyText {
                        Text(body)
                            .font(CatfeTypography.body)
                            .foregroundColor(.loungeCream.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .lineSpacing(8)
                            .frame(maxWidth: geo.size.width * 0.6)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                    }
                    
                    Spacer()
                    
                    if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                        QRCodeView(url: qrURL, size: 150)
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.8)
                            .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.4), value: appeared)
                    }
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
            bellBounce = true
        }
    }
}
