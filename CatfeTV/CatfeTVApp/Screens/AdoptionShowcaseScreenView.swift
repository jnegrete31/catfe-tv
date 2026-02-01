//
//  AdoptionShowcaseScreenView.swift
//  CatfeTVApp
//
//  Adoption showcase screen showing a 2x2 grid of adoptable cats
//

import SwiftUI

struct AdoptionShowcaseScreenView: View {
    let screen: Screen
    let adoptionCats: [Screen]
    
    // Show only 4 cats for the 2x2 grid
    private var displayCats: [Screen] {
        Array(adoptionCats.prefix(4))
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 12) {
                    // Badge
                    Text("Meet Our Adoptable Cats")
                        .font(CatfeTypography.badge)
                        .foregroundColor(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 16)
                        .background(Color(hex: "EA580C"))
                        .cornerRadius(40)
                    
                    // Title
                    Text(screen.title.isEmpty ? "Find Your Purrfect Match" : screen.title)
                        .font(CatfeTypography.largeTitle)
                        .foregroundColor(Color(hex: "9A3412"))
                }
                .padding(.top, 20)
                
                // 2x2 Grid of cats
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 32),
                    GridItem(.flexible(), spacing: 32)
                ], spacing: 32) {
                    ForEach(0..<4, id: \.self) { index in
                        if index < displayCats.count {
                            CatGridCard(cat: displayCats[index])
                        } else {
                            PlaceholderCard()
                        }
                    }
                }
                .padding(.horizontal, 40)
                
                // QR Code (if provided)
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    HStack {
                        Spacer()
                        VStack(spacing: 8) {
                            Text("Scan to see all cats")
                                .font(CatfeTypography.caption)
                                .foregroundColor(Color(hex: "9A3412").opacity(0.7))
                            QRCodeView(url: qrURL, size: 120)
                        }
                    }
                    .padding(.horizontal, 60)
                    .padding(.bottom, 20)
                }
            }
        }
    }
}

// MARK: - Cat Grid Card

struct CatGridCard: View {
    let cat: Screen
    
    var body: some View {
        VStack(spacing: 0) {
            // Cat Image
            ZStack(alignment: .topTrailing) {
                ScreenImage(url: cat.imageURL)
                    .frame(height: 320)
                    .clipped()
                
                // Adopted badge if applicable
                if cat.bodyText?.lowercased().contains("adopted") == true {
                    Text("🎉 Adopted!")
                        .font(CatfeTypography.badge)
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.green)
                        .cornerRadius(20)
                        .padding(16)
                }
            }
            
            // Cat Info
            VStack(alignment: .leading, spacing: 8) {
                Text("Meet \(cat.catName ?? cat.title)")
                    .font(CatfeTypography.title)
                    .foregroundColor(Color(hex: "9A3412"))
                    .lineLimit(1)
                
                if let age = cat.catAge, let gender = cat.catGender {
                    Text("\(age) • \(gender)")
                        .font(CatfeTypography.body)
                        .foregroundColor(Color(hex: "9A3412").opacity(0.7))
                        .lineLimit(1)
                } else if let subtitle = cat.subtitle {
                    Text(subtitle)
                        .font(CatfeTypography.body)
                        .foregroundColor(Color(hex: "9A3412").opacity(0.7))
                        .lineLimit(1)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(24)
            .background(Color.white)
        }
        .cornerRadius(24)
        .shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 6)
    }
}

// MARK: - Placeholder Card

struct PlaceholderCard: View {
    var body: some View {
        VStack(spacing: 0) {
            // Placeholder image area
            ZStack {
                Color(hex: "FED7AA")
                
                VStack(spacing: 12) {
                    Text("🐱")
                        .font(.system(size: 80))
                    Text("Coming Soon")
                        .font(CatfeTypography.body)
                        .foregroundColor(Color(hex: "9A3412").opacity(0.5))
                }
            }
            .frame(height: 320)
            
            // Placeholder info
            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(hex: "FED7AA"))
                    .frame(height: 32)
                    .frame(maxWidth: 200)
                
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color(hex: "FED7AA"))
                    .frame(height: 24)
                    .frame(maxWidth: 150)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(24)
            .background(Color.white)
        }
        .cornerRadius(24)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Preview

#if DEBUG
struct AdoptionShowcaseScreenView_Previews: PreviewProvider {
    static var previews: some View {
        AdoptionShowcaseScreenView(
            screen: Screen(
                type: .adoptionShowcase,
                title: "Find Your Purrfect Match",
                qrCodeURL: "https://catfesantaclarita.com/adopt"
            ),
            adoptionCats: Screen.sampleScreens.filter { $0.type == .adoption }
        )
    }
}
#endif
