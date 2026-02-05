//
//  AdoptionScreenView.swift
//  CatfeTVApp
//
//  Adoption screen showing cat profiles - Lounge-inspired design
//

import SwiftUI

struct AdoptionScreenView: View {
    let screen: Screen
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            HStack(spacing: 60) {
                // Left side - Text content
                VStack(alignment: .leading, spacing: 24) {
                    // Badge with emoji
                    ScreenBadge(
                        text: screen.isAdopted == true ? "Adopted!" : "Looking for Love",
                        color: screen.isAdopted == true ? .loungeMintGreen : .loungeWarmOrange,
                        emoji: screen.isAdopted == true ? "🎉" : "❤️"
                    )
                    
                    Spacer()
                    
                    // Cat Name
                    Text("Meet \(screen.catName ?? screen.title)")
                        .font(CatfeTypography.heroTitle)
                        .foregroundColor(.loungeCream)
                        .lineLimit(2)
                    
                    // Age and Gender
                    if let age = screen.catAge, let gender = screen.catGender {
                        Text("\(age) • \(gender)")
                            .font(CatfeTypography.subtitle)
                            .foregroundColor(.loungeCream.opacity(0.8))
                    }
                    
                    // Breed
                    if let breed = screen.catBreed {
                        Text(breed)
                            .font(CatfeTypography.body)
                            .foregroundColor(.loungeMintGreen)
                    }
                    
                    // Description
                    if let description = screen.catDescription ?? screen.bodyText {
                        Text(description)
                            .font(CatfeTypography.body)
                            .foregroundColor(.loungeCream.opacity(0.7))
                            .lineLimit(4)
                            .padding(.top, 8)
                    }
                    
                    Spacer()
                    
                    // QR Code
                    if let qrURL = screen.qrCodeURL {
                        QRCodeView(url: qrURL, size: 180)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Right side - Cat photo in polaroid frame
                if screen.imageURL != nil {
                    PolaroidFrame(caption: screen.catName ?? screen.title, rotation: -2) {
                        ScreenImage(url: screen.imageURL)
                            .frame(width: 600, height: 450)
                    }
                }
            }
            .padding(0)
        }
    }
}

// MARK: - Corner Radius Extension

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

// MARK: - Preview

#if DEBUG
struct AdoptionScreenView_Previews: PreviewProvider {
    static var previews: some View {
        AdoptionScreenView(screen: Screen.sampleScreens[1])
    }
}
#endif
