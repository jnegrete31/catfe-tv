//
//  AdoptionScreenView.swift
//  CatfeTVApp
//
//  Adoption screen showing cat profiles
//

import SwiftUI

struct AdoptionScreenView: View {
    let screen: Screen
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            HStack(spacing: 0) {
                // Cat Image (Left side - 60%)
                ZStack(alignment: .topLeading) {
                    ScreenImage(url: screen.imageURL)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .clipped()
                    
                    // Gradient overlay for text readability
                    LinearGradient(
                        colors: [.clear, .black.opacity(0.3)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                }
                .frame(width: UIScreen.main.bounds.width * 0.55)
                .cornerRadius(32, corners: [.topLeft, .bottomLeft])
                
                // Cat Info (Right side - 40%)
                VStack(alignment: .leading, spacing: 24) {
                    // Badge
                    ScreenBadge(text: "Adopt Me!", color: .catfeTerracotta)
                    
                    Spacer()
                    
                    // Cat Name
                    Text("Meet \(screen.catName ?? screen.title)")
                        .font(CatfeTypography.heroTitle)
                        .foregroundColor(.catfeTerracotta)
                        .lineLimit(2)
                    
                    // Age and Gender
                    if let age = screen.catAge, let gender = screen.catGender {
                        Text("\(age) • \(gender)")
                            .font(CatfeTypography.subtitle)
                            .foregroundColor(.catfeBrown.opacity(0.8))
                    }
                    
                    // Breed
                    if let breed = screen.catBreed {
                        Text(breed)
                            .font(CatfeTypography.body)
                            .foregroundColor(.catfeBrown.opacity(0.6))
                    }
                    
                    // Description
                    if let description = screen.catDescription ?? screen.bodyText {
                        Text(description)
                            .font(CatfeTypography.body)
                            .foregroundColor(.catfeBrown)
                            .lineLimit(4)
                            .padding(.top, 8)
                    }
                    
                    Spacer()
                    
                    // QR Code
                    if let qrURL = screen.qrCodeURL {
                        HStack {
                            Spacer()
                            QRCodeView(url: qrURL, size: 180)
                        }
                    }
                }
                .padding(48)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(screen.type.backgroundColor)
                .cornerRadius(32, corners: [.topRight, .bottomRight])
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
