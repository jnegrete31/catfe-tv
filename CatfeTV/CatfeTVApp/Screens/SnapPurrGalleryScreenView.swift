//
//  SnapPurrGalleryScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr gallery screen - shows guest-submitted photo in polaroid frame
//

import SwiftUI

struct SnapPurrGalleryScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        ZStack {
            // Lounge background
            LoungeBackground()
            
            // Mint green floor reflection
            VStack {
                Spacer()
                LinearGradient(
                    colors: [Color.clear, Color.loungeMintGreen.opacity(0.15)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 300)
            }
            .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Header
                HStack(spacing: 0) {
                    Text("Snap")
                        .foregroundColor(Color(hex: "E8913A"))
                    Text(" & ")
                        .foregroundColor(.white.opacity(0.7))
                    Text("Purr")
                        .foregroundColor(Color.loungeMintGreen)
                }
                .font(.system(size: 56, weight: .bold, design: .serif))
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6), value: appeared)
                
                // Subtitle
                if let subtitle = screen.subtitle {
                    Text(subtitle)
                        .font(.system(size: 28, weight: .light))
                        .foregroundColor(.white.opacity(0.7))
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                }
                
                Spacer().frame(height: 20)
                
                // Main content: Polaroid + QR
                HStack(alignment: .center, spacing: 60) {
                    // Polaroid photo frame
                    if screen.imageURL != nil {
                        VStack(spacing: 0) {
                            ScreenImage(url: screen.imageURL)
                                .frame(width: 600, height: 500)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                            
                            Text(screen.title)
                                .font(.system(size: 24, weight: .medium, design: .serif))
                                .foregroundColor(Color(hex: "3d3d3d"))
                                .padding(.top, 20)
                                .padding(.bottom, 10)
                        }
                        .padding(20)
                        .padding(.bottom, 30)
                        .background(Color(hex: "FFFEF9"))
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.5), radius: 30, x: 0, y: 15)
                        .rotationEffect(.degrees(-1))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3), value: appeared)
                    }
                    
                    // QR code to submit photos
                    if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                        VStack(spacing: 20) {
                            Text("Share Your Photos!")
                                .font(.system(size: 28, weight: .semibold))
                                .foregroundColor(.white)
                            QRCodeView(url: qrURL, size: 250)
                            Text("Scan to upload your cat moments")
                                .font(.system(size: 18))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                    }
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
