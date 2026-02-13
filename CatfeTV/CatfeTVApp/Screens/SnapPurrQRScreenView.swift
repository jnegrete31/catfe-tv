//
//  SnapPurrQRScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr QR screen - matches web design, fills full TV
//

import SwiftUI

struct SnapPurrQRScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                VStack(spacing: 0) {
                    Spacer()
                    
                    // Camera icon
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
                        QRCodeView(url: qrURL, size: 220)
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
