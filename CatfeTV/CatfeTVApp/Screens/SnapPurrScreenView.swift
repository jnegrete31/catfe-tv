//
//  SnapPurrScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr social media call-to-action screen - Lounge-inspired design
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
                            .foregroundColor(.loungeWarmOrange)
                            .scaleEffect(isAnimating ? 1.1 : 1.0)
                            .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isAnimating)
                        
                        Text("+")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundColor(.loungeCream.opacity(0.5))
                        
                        Text("🐱")
                            .font(.system(size: 60))
                            .scaleEffect(isAnimating ? 1.0 : 1.1)
                            .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isAnimating)
                    }
                    
                    Spacer()
                    
                    // Title
                    Text(screen.title)
                        .font(CatfeTypography.heroTitle)
                        .foregroundColor(.loungeCream)
                    
                    // Subtitle
                    if let subtitle = screen.subtitle {
                        Text(subtitle)
                            .font(CatfeTypography.title)
                            .foregroundColor(.loungeMintGreen)
                    }
                    
                    // Body text
                    if let body = screen.bodyText {
                        Text(body)
                            .font(CatfeTypography.body)
                            .foregroundColor(.loungeCream.opacity(0.8))
                            .lineLimit(4)
                    }
                    
                    // Hashtag
                    Text("#CatfeSantaClarita")
                        .font(CatfeTypography.title)
                        .foregroundColor(.loungeWarmOrange)
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
                    // Image in polaroid frame
                    if let imageURL = screen.imageURL {
                        PolaroidFrame(caption: nil, rotation: 2) {
                            ScreenImage(url: imageURL)
                                .frame(width: 400, height: 400)
                        }
                    } else {
                        // Placeholder with cat photos grid
                        PhotoGridPlaceholder()
                    }
                    
                    Spacer()
                    
                    // QR Code
                    if let qrURL = screen.qrCodeURL {
                        QRCodeView(url: qrURL, size: 200)
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

// MARK: - Social Icon (Updated for lounge theme)

struct SocialIcon: View {
    let name: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(.loungeWarmOrange)
            
            Text(name)
                .font(CatfeTypography.caption)
                .foregroundColor(.loungeCream.opacity(0.7))
        }
    }
}

// MARK: - Photo Grid Placeholder (Updated for lounge theme)

struct PhotoGridPlaceholder: View {
    var body: some View {
        VStack(spacing: 16) {
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 8),
                GridItem(.flexible(), spacing: 8)
            ], spacing: 8) {
                ForEach(0..<4) { _ in
                    Rectangle()
                        .fill(Color.loungeStone.opacity(0.3))
                        .aspectRatio(1, contentMode: .fit)
                        .overlay(
                            Text("🐱")
                                .font(.system(size: 40))
                                .opacity(0.5)
                        )
                }
            }
        }
        .padding(24)
        .background(Color.loungeCream)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
        .rotationEffect(.degrees(-2))
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
