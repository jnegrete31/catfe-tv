//
//  SnapPurrScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr main screen - matches web SnapAndPurrScreen design
//

import SwiftUI

struct SnapPurrScreenView: View {
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
            
            // Cat silhouettes
            GeometryReader { geo in
                ForEach(0..<5, id: \.self) { i in
                    Image(systemName: "cat.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: CGFloat(50 + i * 20))
                        .foregroundColor(.white.opacity(0.06))
                        .position(
                            x: geo.size.width * CGFloat([0.1, 0.85, 0.15, 0.9, 0.5][i]),
                            y: geo.size.height * CGFloat([0.2, 0.15, 0.8, 0.75, 0.9][i])
                        )
                }
            }
            
            VStack(spacing: 30) {
                // Camera icon
                ZStack {
                    RoundedRectangle(cornerRadius: 40)
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: "E8913A"), Color(hex: "DAA520")],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(width: 140, height: 140)
                        .shadow(color: Color(hex: "E8913A").opacity(0.4), radius: 20)
                    
                    Image(systemName: "camera.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 60, height: 60)
                        .foregroundColor(.white)
                }
                .opacity(appeared ? 1 : 0)
                .scaleEffect(appeared ? 1 : 0.7)
                .animation(.spring(response: 0.6, dampingFraction: 0.7), value: appeared)
                
                // Title: "Snap & Purr!"
                HStack(spacing: 0) {
                    Text("Snap ")
                        .foregroundColor(Color(hex: "E8913A"))
                    Text("& ")
                        .foregroundColor(.white.opacity(0.7))
                    Text("Purr!")
                        .foregroundColor(Color.loungeMintGreen)
                }
                .font(.system(size: 72, weight: .bold, design: .serif))
                .shadow(color: .black.opacity(0.2), radius: 5, x: 0, y: 5)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                
                // Subtitle
                Text(screen.subtitle ?? "Share your best Catfé moments!")
                    .font(.system(size: 28, weight: .light))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                
                // Body text
                if let body = screen.bodyText {
                    Text(body)
                        .font(.system(size: 22))
                        .foregroundColor(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 800)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                }
                
                Spacer().frame(height: 20)
                
                // QR Code in cream card
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    VStack(spacing: 15) {
                        QRCodeView(url: qrURL, size: 220)
                        Text("Scan to share your photos")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(Color(hex: "5a4a3a"))
                    }
                    .padding(30)
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(
                                LinearGradient(
                                    colors: [Color(hex: "F5E6D3"), Color(hex: "EDE0D4")],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .shadow(color: .black.opacity(0.3), radius: 15)
                    )
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0.85)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.4), value: appeared)
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
