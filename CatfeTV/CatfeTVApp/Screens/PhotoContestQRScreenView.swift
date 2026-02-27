//
//  PhotoContestQRScreenView.swift
//  CatfeTVApp
//
//  Photo Contest QR screen - shows QR code for guests to enter the photo
//  contest with "How It Works" instructions.
//  Matches the web app's PHOTO_CONTEST_QR screen type.
//
import SwiftUI

struct PhotoContestQRScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                ZStack {
                    // Warm amber gradient background
                    LinearGradient(
                        colors: [
                            Color(hex: "2d1f0e"),
                            Color(hex: "1a1408")
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    
                    // Floating amber glow
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "DAA520").opacity(0.3), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.35
                            )
                        )
                        .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                        .position(x: geo.size.width * 0.5, y: geo.size.height * 0.2)
                    
                    // 3-column layout: Title | How It Works | QR Code
                    HStack(alignment: .center, spacing: geo.size.width * 0.04) {
                        // Left: Title and subtitle
                        VStack(alignment: .leading, spacing: geo.size.height * 0.02) {
                            Spacer()
                            
                            Image(systemName: "trophy.fill")
                                .font(.system(size: geo.size.height * 0.08))
                                .foregroundColor(Color(hex: "DAA520"))
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.6), value: appeared)
                            
                            Text(screen.title)
                                .font(.system(size: geo.size.height * 0.06, weight: .bold, design: .serif))
                                .foregroundColor(.loungeCream)
                                .lineLimit(3)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                            
                            if let subtitle = screen.subtitle {
                                Text(subtitle)
                                    .font(.system(size: geo.size.height * 0.025, weight: .regular))
                                    .foregroundColor(.loungeCream.opacity(0.7))
                                    .lineLimit(3)
                                    .lineSpacing(4)
                            }
                            
                            Spacer()
                        }
                        .frame(maxWidth: geo.size.width * 0.25)
                        
                        // Center: How It Works steps
                        VStack(alignment: .leading, spacing: geo.size.height * 0.025) {
                            Text("HOW IT WORKS")
                                .font(.system(size: geo.size.height * 0.02, weight: .semibold))
                                .tracking(3)
                                .foregroundColor(Color(hex: "DAA520").opacity(0.8))
                            
                            howItWorksStep(
                                number: 1,
                                icon: "qrcode.viewfinder",
                                title: "Scan QR",
                                description: "Point your phone camera at the QR code",
                                geo: geo
                            )
                            
                            howItWorksStep(
                                number: 2,
                                icon: "camera.fill",
                                title: "Snap & Upload",
                                description: "Take a photo of your favorite cat",
                                geo: geo
                            )
                            
                            howItWorksStep(
                                number: 3,
                                icon: "hand.thumbsup.fill",
                                title: "Vote for Favorites",
                                description: "Browse and vote for the cutest photos",
                                geo: geo
                            )
                            
                            howItWorksStep(
                                number: 4,
                                icon: "star.fill",
                                title: "Win Prizes",
                                description: "Top photos win Catfé prizes!",
                                geo: geo
                            )
                            
                            Text("Free to enter, no app download needed")
                                .font(.system(size: geo.size.height * 0.016))
                                .foregroundColor(.loungeCream.opacity(0.4))
                                .italic()
                                .padding(.top, 4)
                        }
                        .frame(maxWidth: geo.size.width * 0.32)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                        
                        // Right: QR Code
                        VStack(spacing: geo.size.height * 0.02) {
                            Spacer()
                            
                            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                                QRCodeView(url: qrURL, size: Int(geo.size.height * 0.35), label: screen.qrLabel)
                            } else {
                                // Default QR to /vote/cats
                                QRCodeView(url: "/vote/cats", size: Int(geo.size.height * 0.35), label: "Scan to Enter")
                            }
                            
                            Text("SCAN TO ENTER")
                                .font(.system(size: geo.size.height * 0.022, weight: .bold))
                                .tracking(4)
                                .foregroundColor(Color(hex: "DAA520"))
                            
                            Spacer()
                        }
                        .frame(maxWidth: geo.size.width * 0.25)
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3), value: appeared)
                    }
                    .padding(.horizontal, geo.size.width * 0.06)
                }
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
    
    // MARK: - How It Works Step
    
    private func howItWorksStep(number: Int, icon: String, title: String, description: String, geo: GeometryProxy) -> some View {
        HStack(spacing: 14) {
            // Number circle
            ZStack {
                Circle()
                    .fill(Color(hex: "DAA520").opacity(0.2))
                    .frame(width: geo.size.height * 0.05, height: geo.size.height * 0.05)
                
                Text("\(number)")
                    .font(.system(size: geo.size.height * 0.022, weight: .bold))
                    .foregroundColor(Color(hex: "DAA520"))
            }
            
            // Icon
            Image(systemName: icon)
                .font(.system(size: geo.size.height * 0.025))
                .foregroundColor(Color(hex: "DAA520").opacity(0.8))
                .frame(width: geo.size.height * 0.04)
            
            // Text
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: geo.size.height * 0.022, weight: .semibold))
                    .foregroundColor(.loungeCream)
                
                Text(description)
                    .font(.system(size: geo.size.height * 0.016))
                    .foregroundColor(.loungeCream.opacity(0.5))
                    .lineLimit(2)
            }
        }
    }
}

#Preview {
    PhotoContestQRScreenView(screen: Screen(
        type: .photoContestQR,
        title: "Guest Photo Contest",
        subtitle: "Snap a photo of your favorite cat and enter to win!",
        qrCodeURL: "https://catfetv.com/vote/cats",
        duration: 15
    ))
}
