//
//  SnapPurrScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr screen - matches web design, fills full TV
//

import SwiftUI

struct SnapPurrScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
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
                    
                    // Subtitle
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
                    
                    // QR Code
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
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}
