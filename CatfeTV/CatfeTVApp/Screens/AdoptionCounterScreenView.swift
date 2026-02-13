//
//  AdoptionCounterScreenView.swift
//  CatfeTVApp
//
//  Adoption Counter screen - shows the total adoption count in the center
//  flanked by 3 random adopted cat photos on each side.
//

import SwiftUI

struct AdoptionCounterScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    var adoptionCats: [Screen] = [] // All adoption cats (adopted + available)
    
    @State private var appeared = false
    
    private var targetCount: Int {
        settings.totalAdoptionCount
    }
    
    /// Get adopted cats that have images, shuffled randomly, up to 6
    private var adoptedCatsWithPhotos: [Screen] {
        let adopted = adoptionCats.filter { $0.isAdopted && $0.imageURL != nil && !($0.imageURL?.isEmpty ?? true) }
        return Array(adopted.shuffled().prefix(6))
    }
    
    /// Left column cats (first 3)
    private var leftCats: [Screen] {
        let cats = adoptedCatsWithPhotos
        return Array(cats.prefix(min(3, cats.count)))
    }
    
    /// Right column cats (next 3)
    private var rightCats: [Screen] {
        let cats = adoptedCatsWithPhotos
        if cats.count > 3 {
            return Array(cats.dropFirst(3).prefix(3))
        }
        return []
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                HStack(spacing: 0) {
                    // Left column: adopted cat photos
                    if !leftCats.isEmpty {
                        VStack(spacing: 16) {
                            ForEach(Array(leftCats.enumerated()), id: \.element.id) { index, cat in
                                AdoptedCatCard(cat: cat, appeared: appeared, delay: Double(index) * 0.15)
                            }
                        }
                        .frame(width: geo.size.width * 0.22)
                        .padding(.leading, 20)
                    }
                    
                    Spacer()
                    
                    // Center: counter and title
                    VStack(spacing: 0) {
                        Spacer()
                        
                        // Paw prints
                        Text("🐾")
                            .font(.system(size: 70))
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.5)
                            .animation(.spring(response: 0.6, dampingFraction: 0.6), value: appeared)
                        
                        Spacer().frame(height: 20)
                        
                        // Counter number - displayed immediately, no animation
                        Text("\(targetCount)")
                            .font(.system(size: 160, weight: .bold, design: .serif))
                            .foregroundColor(.loungeAmber)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                        
                        Spacer().frame(height: 12)
                        
                        // Title
                        Text(screen.title)
                            .font(.system(size: 42, weight: .bold, design: .serif))
                            .foregroundColor(.loungeCream)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: geo.size.width * 0.4)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                        
                        if let subtitle = screen.subtitle {
                            Spacer().frame(height: 12)
                            Text(subtitle)
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeCream.opacity(0.7))
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: geo.size.width * 0.35)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                        }
                        
                        Spacer()
                        
                        // QR Code
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            QRCodeView(url: qrURL, size: 130)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.6), value: appeared)
                        }
                        
                        Spacer()
                    }
                    
                    Spacer()
                    
                    // Right column: adopted cat photos
                    if !rightCats.isEmpty {
                        VStack(spacing: 16) {
                            ForEach(Array(rightCats.enumerated()), id: \.element.id) { index, cat in
                                AdoptedCatCard(cat: cat, appeared: appeared, delay: Double(index) * 0.15 + 0.1)
                            }
                        }
                        .frame(width: geo.size.width * 0.22)
                        .padding(.trailing, 20)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}

// MARK: - Adopted Cat Card

struct AdoptedCatCard: View {
    let cat: Screen
    let appeared: Bool
    let delay: Double
    
    var body: some View {
        VStack(spacing: 8) {
            // Cat photo in a rounded frame
            if let imageURL = cat.imageURL, let url = URL(string: imageURL) {
                CachedAsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.loungeStone.opacity(0.3))
                        .overlay(
                            Image(systemName: "cat.fill")
                                .font(.system(size: 30))
                                .foregroundColor(.loungeStone.opacity(0.5))
                        )
                }
                .frame(width: 160, height: 160)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.loungeAmber.opacity(0.4), lineWidth: 2)
                )
                .shadow(color: .black.opacity(0.3), radius: 8, y: 4)
            }
            
            // Cat name
            Text(cat.title.replacingOccurrences(of: "Meet ", with: ""))
                .font(.system(size: 20, weight: .semibold, design: .serif))
                .foregroundColor(.loungeCream)
                .lineLimit(1)
            
            // Small "Adopted" badge
            Text("❤️ Adopted")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.loungeAmber.opacity(0.8))
        }
        .opacity(appeared ? 1 : 0)
        .scaleEffect(appeared ? 1 : 0.8)
        .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(delay), value: appeared)
    }
}
