//
//  ThankYouScreenView.swift
//  CatfeTVApp
//
//  Thank you screen for visitors - Lounge-inspired design
//

import SwiftUI

struct ThankYouScreenView: View {
    let screen: Screen
    @State private var heartScale: CGFloat = 1.0
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            VStack(spacing: 48) {
                Spacer()
                
                // Animated heart with cat emoji
                ZStack {
                    // Background circles with lounge colors
                    ForEach(0..<3) { index in
                        Circle()
                            .stroke(Color.loungeWarmOrange.opacity(0.2 - Double(index) * 0.05), lineWidth: 3)
                            .frame(width: CGFloat(200 + index * 60), height: CGFloat(200 + index * 60))
                            .scaleEffect(heartScale)
                            .animation(
                                .easeInOut(duration: 1.5)
                                .repeatForever(autoreverses: true)
                                .delay(Double(index) * 0.2),
                                value: heartScale
                            )
                    }
                    
                    // Heart and cat emoji
                    VStack(spacing: 8) {
                        Text("❤️")
                            .font(.system(size: 100))
                            .scaleEffect(heartScale)
                            .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: heartScale)
                        
                        Text("🐱")
                            .font(.system(size: 60))
                    }
                }
                
                // Title
                Text(screen.title)
                    .font(CatfeTypography.heroTitle)
                    .foregroundColor(.loungeCream)
                
                // Subtitle
                if let subtitle = screen.subtitle {
                    Text(subtitle)
                        .font(CatfeTypography.title)
                        .foregroundColor(.loungeWarmOrange)
                }
                
                // Body text
                if let body = screen.bodyText {
                    Text(body)
                        .font(CatfeTypography.body)
                        .foregroundColor(.loungeCream.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .lineLimit(4)
                        .padding(.horizontal, 100)
                }
                
                Spacer()
                
                // Footer with social and QR
                HStack(spacing: 60) {
                    // Social handles
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Follow us for more cat content!")
                            .font(CatfeTypography.subtitle)
                            .foregroundColor(.loungeCream)
                        
                        HStack(spacing: 24) {
                            Label("@catfesantaclarita", systemImage: "camera.fill")
                            Label("catfesantaclarita.com", systemImage: "globe")
                        }
                        .font(CatfeTypography.body)
                        .foregroundColor(.loungeMintGreen)
                    }
                    
                    Spacer()
                    
                    // QR Code
                    if let qrURL = screen.qrCodeURL {
                        QRCodeView(url: qrURL, size: 150)
                    }
                }
                .padding(.horizontal, 40)
            }
        }
        .onAppear {
            heartScale = 1.1
        }
    }
}

// MARK: - Preview

#if DEBUG
struct ThankYouScreenView_Previews: PreviewProvider {
    static var previews: some View {
        ThankYouScreenView(screen: Screen.sampleScreens[6])
    }
}
#endif
