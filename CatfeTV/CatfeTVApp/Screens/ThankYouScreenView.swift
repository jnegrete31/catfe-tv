//
//  ThankYouScreenView.swift
//  CatfeTVApp
//
//  Thank you screen for visitors
//

import SwiftUI

struct ThankYouScreenView: View {
    let screen: Screen
    @State private var heartScale: CGFloat = 1.0
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            VStack(spacing: 48) {
                Spacer()
                
                // Animated heart
                ZStack {
                    // Background circles
                    ForEach(0..<3) { index in
                        Circle()
                            .stroke(Color(hex: "7B1FA2").opacity(0.1 - Double(index) * 0.03), lineWidth: 2)
                            .frame(width: CGFloat(200 + index * 60), height: CGFloat(200 + index * 60))
                            .scaleEffect(heartScale)
                            .animation(
                                .easeInOut(duration: 1.5)
                                .repeatForever(autoreverses: true)
                                .delay(Double(index) * 0.2),
                                value: heartScale
                            )
                    }
                    
                    // Heart icon
                    Image(systemName: "heart.fill")
                        .font(.system(size: 120))
                        .foregroundColor(Color(hex: "7B1FA2"))
                        .scaleEffect(heartScale)
                        .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: heartScale)
                }
                
                // Title
                Text(screen.title)
                    .font(CatfeTypography.heroTitle)
                    .foregroundColor(.catfeBrown)
                
                // Subtitle
                if let subtitle = screen.subtitle {
                    Text(subtitle)
                        .font(CatfeTypography.title)
                        .foregroundColor(Color(hex: "7B1FA2"))
                }
                
                // Body text
                if let body = screen.bodyText {
                    Text(body)
                        .font(CatfeTypography.body)
                        .foregroundColor(.catfeBrown.opacity(0.8))
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
                            .foregroundColor(.catfeBrown)
                        
                        HStack(spacing: 24) {
                            Label("@catfesantaclarita", systemImage: "camera.fill")
                            Label("catfesantaclarita.com", systemImage: "globe")
                        }
                        .font(CatfeTypography.body)
                        .foregroundColor(.catfeBrown.opacity(0.7))
                    }
                    
                    Spacer()
                    
                    // QR Code
                    if let qrURL = screen.qrCodeURL {
                        VStack(spacing: 12) {
                            QRCodeView(url: qrURL, size: 150)
                            Text("Leave a Review")
                                .font(CatfeTypography.caption)
                                .foregroundColor(.catfeBrown.opacity(0.6))
                        }
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
