//
//  AdoptionShowcaseScreenView.swift
//  CatfeTVApp
//
//  Grid of adoptable cats - matches web design, fills full TV screen
//

import SwiftUI

struct AdoptionShowcaseScreenView: View {
    let screen: Screen
    var adoptionCats: [Screen] = []
    
    @State private var appeared = false
    
    private var availableCats: [Screen] {
        adoptionCats.filter { !$0.isAdopted }
    }
    
    private let rotations: [Double] = [-2, 3, -3, 2]
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                VStack(spacing: 0) {
                    // Header section
                    VStack(spacing: 12) {
                        HStack(spacing: 0) {
                            Text("Meet Our ")
                                .foregroundColor(.loungeCream.opacity(0.9))
                            Text("Adoptable Cats")
                                .foregroundColor(.loungeWarmOrange)
                        }
                        .font(.system(size: 56, weight: .bold, design: .serif))
                        
                        Text(screen.subtitle ?? "Each one is looking for their forever home")
                            .font(CatfeTypography.caption)
                            .foregroundColor(.loungeCream.opacity(0.6))
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : -20)
                    .animation(.easeOut(duration: 0.6), value: appeared)
                    .padding(.bottom, 20)
                    
                    // Cat grid - fills remaining space
                    if availableCats.isEmpty {
                        VStack(spacing: 20) {
                            Text("🎉").font(.system(size: 80))
                            Text("All cats have found homes!")
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeCream.opacity(0.8))
                            Text("Check back soon for new arrivals")
                                .font(CatfeTypography.caption)
                                .foregroundColor(.loungeCream.opacity(0.5))
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                        let columns = min(availableCats.count, 4)
                        let gridColumns = Array(repeating: GridItem(.flexible(), spacing: 24), count: columns)
                        
                        LazyVGrid(columns: gridColumns, spacing: 24) {
                            ForEach(Array(availableCats.prefix(8).enumerated()), id: \.element.id) { index, cat in
                                CatShowcaseCard(cat: cat, index: index, appeared: appeared)
                            }
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                    
                    // Bottom QR
                    if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                        HStack {
                            Spacer()
                            QRCodeView(url: qrURL, size: 110)
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                    }
                }
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}

// MARK: - Cat Showcase Card
private struct CatShowcaseCard: View {
    let cat: Screen
    let index: Int
    let appeared: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            ScreenImage(url: cat.imageURL)
                .frame(maxWidth: .infinity)
                .frame(height: 200)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            
            VStack(spacing: 4) {
                Text(cat.catName ?? cat.title.replacingOccurrences(of: "Meet ", with: ""))
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundColor(.loungeCream)
                
                if let age = cat.catAge {
                    Text(age)
                        .font(CatfeTypography.small)
                        .foregroundColor(.loungeCream.opacity(0.5))
                }
                
                if let breed = cat.catBreed {
                    Text(breed)
                        .font(CatfeTypography.small)
                        .foregroundColor(.loungeMintGreen.opacity(0.8))
                }
            }
            .padding(.vertical, 12)
        }
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .opacity(appeared ? 1 : 0)
        .scaleEffect(appeared ? 1 : 0.85)
        .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(Double(index) * 0.08 + 0.2), value: appeared)
    }
}
