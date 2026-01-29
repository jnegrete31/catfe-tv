//
//  SnapPurrScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr social media call-to-action screen
//

import SwiftUI

struct SnapPurrScreenView: View {
    let screen: Screen
    @State private var isAnimating = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            HStack(spacing: 60) {
                // Left side - Content
                VStack(alignment: .leading, spacing: 32) {
                    // Animated camera icon
                    HStack(spacing: 20) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.catfeTerracotta)
                            .scaleEffect(isAnimating ? 1.1 : 1.0)
                            .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isAnimating)
                        
                        Text("+")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundColor(.catfeBrown.opacity(0.5))
                        
                        Image(systemName: "cat.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.catfeTerracotta)
                            .scaleEffect(isAnimating ? 1.0 : 1.1)
                            .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isAnimating)
                    }
                    
                    Spacer()
                    
                    // Title
                    Text(screen.title)
                        .font(CatfeTypography.heroTitle)
                        .foregroundColor(.catfeTerracotta)
                    
                    // Subtitle
                    if let subtitle = screen.subtitle {
                        Text(subtitle)
                            .font(CatfeTypography.title)
                            .foregroundColor(.catfeBrown)
                    }
                    
                    // Body text
                    if let body = screen.bodyText {
                        Text(body)
                            .font(CatfeTypography.body)
                            .foregroundColor(.catfeBrown.opacity(0.8))
                            .lineLimit(4)
                    }
                    
                    // Hashtag
                    Text("#CatfeSantaClarita")
                        .font(CatfeTypography.title)
                        .foregroundColor(.catfeTerracotta)
                        .padding(.top, 16)
                    
                    Spacer()
                    
                    // Social icons
                    HStack(spacing: 32) {
                        SocialIcon(name: "Instagram", icon: "camera.circle.fill")
                        SocialIcon(name: "TikTok", icon: "play.circle.fill")
                        SocialIcon(name: "Facebook", icon: "person.2.circle.fill")
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Right side - QR Code and Image
                VStack(spacing: 40) {
                    // Image
                    if let imageURL = screen.imageURL {
                        ScreenImage(url: imageURL)
                            .aspectRatio(1, contentMode: .fit)
                            .cornerRadius(24)
                            .shadow(color: .black.opacity(0.15), radius: 20)
                    } else {
                        // Placeholder with cat photos grid
                        PhotoGridPlaceholder()
                    }
                    
                    Spacer()
                    
                    // QR Code
                    if let qrURL = screen.qrCodeURL {
                        VStack(spacing: 16) {
                            QRCodeView(url: qrURL, size: 200)
                            
                            Text("Scan to Follow Us")
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.catfeBrown.opacity(0.7))
                        }
                    }
                }
                .frame(width: UIScreen.main.bounds.width * 0.35)
            }
        }
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - Social Icon

struct SocialIcon: View {
    let name: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(.catfeTerracotta)
            
            Text(name)
                .font(CatfeTypography.caption)
                .foregroundColor(.catfeBrown.opacity(0.7))
        }
    }
}

// MARK: - Photo Grid Placeholder

struct PhotoGridPlaceholder: View {
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 8),
            GridItem(.flexible(), spacing: 8)
        ], spacing: 8) {
            ForEach(0..<4) { _ in
                Rectangle()
                    .fill(Color.catfeTerracotta.opacity(0.2))
                    .aspectRatio(1, contentMode: .fit)
                    .overlay(
                        Image(systemName: "cat.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.catfeTerracotta.opacity(0.4))
                    )
            }
        }
        .cornerRadius(24)
    }
}

// MARK: - Preview

#if DEBUG
struct SnapPurrScreenView_Previews: PreviewProvider {
    static var previews: some View {
        SnapPurrScreenView(screen: Screen.sampleScreens[0])
    }
}
#endif
