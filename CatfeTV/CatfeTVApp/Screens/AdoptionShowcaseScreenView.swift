//
//  AdoptionShowcaseScreenView.swift
//  CatfeTVApp
//
//  Adoption showcase screen showing a 2x2 grid of adoptable cats - Lounge-inspired design
//

import SwiftUI

struct AdoptionShowcaseScreenView: View {
    let screen: Screen
    let adoptionCats: [Screen]
    
    // Show only 4 cats for the 2x2 grid
    private var displayCats: [Screen] {
        Array(adoptionCats.prefix(4))
    }
    
    // Count adopted cats
    private var adoptedCount: Int {
        adoptionCats.filter { $0.isAdopted == true }.count
    }
    
    private var availableCount: Int {
        adoptionCats.filter { $0.isAdopted != true }.count
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            VStack(spacing: 32) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 12) {
                        // Badge with emoji
                        ScreenBadge(
                            text: "Meet Our Cats",
                            color: .loungeWarmOrange,
                            emoji: "🐱"
                        )
                        
                        // Title
                        Text(screen.title.isEmpty ? "Find Your Purrfect Match" : screen.title)
                            .font(CatfeTypography.largeTitle)
                            .foregroundColor(.loungeCream)
                    }
                    
                    Spacer()
                    
                    // Stats
                    VStack(alignment: .trailing, spacing: 8) {
                        if adoptedCount > 0 {
                            HStack(spacing: 8) {
                                Text("🎉")
                                Text("\(adoptedCount) cat\(adoptedCount == 1 ? "" : "s") found their forever home!")
                            }
                            .font(CatfeTypography.body)
                            .foregroundColor(.loungeMintGreen)
                        }
                        
                        Text("\(availableCount) looking for homes")
                            .font(CatfeTypography.caption)
                            .foregroundColor(.loungeCream.opacity(0.7))
                    }
                }
                .padding(.top, 20)
                
                // 2x2 Grid of cats in polaroid frames
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 40),
                    GridItem(.flexible(), spacing: 40)
                ], spacing: 40) {
                    ForEach(0..<4, id: \.self) { index in
                        if index < displayCats.count {
                            CatGridCard(cat: displayCats[index], rotation: index % 2 == 0 ? -2 : 2)
                        } else {
                            PlaceholderCard()
                        }
                    }
                }
                .padding(.horizontal, 20)
                
                // QR Code (if provided)
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    HStack {
                        Spacer()
                        QRCodeView(url: qrURL, size: 120)
                    }
                    .padding(.horizontal, 40)
                    .padding(.bottom, 20)
                }
            }
        }
    }
}

// MARK: - Cat Grid Card (Lounge-inspired polaroid style)

struct CatGridCard: View {
    let cat: Screen
    let rotation: Double
    
    var body: some View {
        VStack(spacing: 0) {
            // Cat Image
            ZStack(alignment: .topTrailing) {
                ScreenImage(url: cat.imageURL)
                    .frame(height: 280)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                
                // Adopted badge if applicable
                if cat.isAdopted == true {
                    Text("🎉 Adopted!")
                        .font(CatfeTypography.badge)
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.loungeMintGreen)
                        .cornerRadius(20)
                        .padding(12)
                }
            }
            
            // Cat Info
            VStack(alignment: .center, spacing: 4) {
                Text(cat.catName ?? cat.title)
                    .font(.system(size: 28, weight: .medium, design: .serif))
                    .foregroundColor(.loungeCharcoal)
                    .lineLimit(1)
                
                if let age = cat.catAge, let gender = cat.catGender {
                    Text("\(age) • \(gender)")
                        .font(CatfeTypography.caption)
                        .foregroundColor(.loungeCharcoal.opacity(0.7))
                        .lineLimit(1)
                }
            }
            .padding(.top, 16)
            .padding(.bottom, 8)
        }
        .padding(16)
        .background(Color.loungeCream)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
        .rotationEffect(.degrees(rotation))
    }
}

// MARK: - Placeholder Card (Lounge-inspired)

struct PlaceholderCard: View {
    var body: some View {
        VStack(spacing: 0) {
            // Placeholder image area
            ZStack {
                Color.loungeStone.opacity(0.2)
                
                VStack(spacing: 12) {
                    Text("🐱")
                        .font(.system(size: 60))
                        .opacity(0.5)
                    Text("Coming Soon")
                        .font(CatfeTypography.caption)
                        .foregroundColor(.loungeCharcoal.opacity(0.5))
                }
            }
            .frame(height: 280)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            
            // Placeholder info
            VStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.loungeStone.opacity(0.2))
                    .frame(height: 24)
                    .frame(maxWidth: 150)
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.loungeStone.opacity(0.15))
                    .frame(height: 18)
                    .frame(maxWidth: 100)
            }
            .padding(.top, 16)
            .padding(.bottom, 8)
        }
        .padding(16)
        .background(Color.loungeCream)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
        .rotationEffect(.degrees(-1))
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
