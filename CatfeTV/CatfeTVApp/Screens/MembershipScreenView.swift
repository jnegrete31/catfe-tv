//
//  MembershipScreenView.swift
//  CatfeTVApp
//
//  Membership promotion screen
//

import SwiftUI

struct MembershipScreenView: View {
    let screen: Screen
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            HStack(spacing: 60) {
                // Left side - Content
                VStack(alignment: .leading, spacing: 32) {
                    // Badge
                    ScreenBadge(text: "Members Only", color: .catfeSage)
                    
                    Spacer()
                    
                    // Title
                    Text(screen.title)
                        .font(CatfeTypography.heroTitle)
                        .foregroundColor(.catfeBrown)
                        .lineLimit(2)
                    
                    // Subtitle
                    if let subtitle = screen.subtitle {
                        Text(subtitle)
                            .font(CatfeTypography.title)
                            .foregroundColor(.catfeSage)
                    }
                    
                    // Benefits
                    if let body = screen.bodyText {
                        VStack(alignment: .leading, spacing: 20) {
                            ForEach(body.components(separatedBy: "\n"), id: \.self) { line in
                                if !line.trimmingCharacters(in: .whitespaces).isEmpty {
                                    HStack(alignment: .top, spacing: 16) {
                                        Image(systemName: "checkmark.circle.fill")
                                            .font(.system(size: 28))
                                            .foregroundColor(.catfeSage)
                                        
                                        Text(line.replacingOccurrences(of: "• ", with: ""))
                                            .font(CatfeTypography.body)
                                            .foregroundColor(.catfeBrown)
                                    }
                                }
                            }
                        }
                        .padding(.top, 16)
                    }
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Right side - Image and QR
                VStack(spacing: 40) {
                    // Membership card illustration or image
                    if let imageURL = screen.imageURL {
                        ScreenImage(url: imageURL)
                            .aspectRatio(16/10, contentMode: .fit)
                            .cornerRadius(24)
                            .shadow(color: .black.opacity(0.15), radius: 20)
                    } else {
                        // Default membership card design
                        MembershipCardView()
                    }
                    
                    Spacer()
                    
                    // QR Code
                    if let qrURL = screen.qrCodeURL {
                        VStack(spacing: 16) {
                            QRCodeView(url: qrURL, size: 200)
                            
                            Text("Scan to Join")
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.catfeBrown.opacity(0.7))
                        }
                    }
                }
                .frame(width: UIScreen.main.bounds.width * 0.35)
            }
        }
    }
}

// MARK: - Membership Card View

struct MembershipCardView: View {
    var body: some View {
        ZStack {
            // Card background
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: [.catfeTerracotta, .catfeDarkTerracotta],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            // Card content
            VStack(alignment: .leading, spacing: 20) {
                HStack {
                    Image(systemName: "cat.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.white.opacity(0.9))
                    
                    Spacer()
                    
                    Text("MEMBER")
                        .font(CatfeTypography.badge)
                        .foregroundColor(.white.opacity(0.9))
                }
                
                Spacer()
                
                Text("Catfé")
                    .font(CatfeTypography.largeTitle)
                    .foregroundColor(.white)
                
                Text("Santa Clarita")
                    .font(CatfeTypography.subtitle)
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(32)
        }
        .aspectRatio(16/10, contentMode: .fit)
        .shadow(color: .black.opacity(0.2), radius: 20)
    }
}

// MARK: - Preview

#if DEBUG
struct MembershipScreenView_Previews: PreviewProvider {
    static var previews: some View {
        MembershipScreenView(screen: Screen.sampleScreens[4])
    }
}
#endif
