//
//  AdoptionShowcaseScreenView.swift
//  CatfeTVApp
//
//  Adoption showcase grid - matches web AdoptionShowcaseScreen design
//

import SwiftUI

struct AdoptionShowcaseScreenView: View {
    let screen: Screen
    var adoptionCats: [Screen] = []
    
    @State private var appeared = false
    
    private var availableCats: [Screen] {
        adoptionCats.filter { !$0.isAdopted }
    }
    
    var body: some View {
        ZStack {
            // Dark background
            LinearGradient(
                colors: [Color(hex: "2d2d2d"), Color(hex: "1a1a1a")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Warm amber glow
            GeometryReader { geo in
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "DAA520").opacity(0.3), Color.clear],
                        center: .center, startRadius: 0, endRadius: geo.size.width * 0.35
                    ))
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.5, y: -geo.size.height * 0.1)
            }
            
            // Mint green floor
            VStack {
                Spacer()
                LinearGradient(
                    colors: [Color.clear, Color.loungeMintGreen.opacity(0.2)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 300)
            }
            .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Header
                HStack(spacing: 0) {
                    Text("Meet Our ")
                        .foregroundColor(.white.opacity(0.9))
                    Text("Adoptable Cats")
                        .foregroundColor(Color(hex: "E8913A"))
                }
                .font(.system(size: 56, weight: .bold, design: .serif))
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6), value: appeared)
                
                // Subtitle
                Text(screen.subtitle ?? "Each one is looking for their forever home")
                    .font(.system(size: 24, weight: .light))
                    .foregroundColor(.white.opacity(0.6))
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.1), value: appeared)
                
                Spacer().frame(height: 10)
                
                // Cat grid
                if availableCats.isEmpty {
                    VStack(spacing: 20) {
                        Text("🎉")
                            .font(.system(size: 80))
                        Text("All cats have found homes!")
                            .font(.system(size: 36, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                        Text("Check back soon for new arrivals")
                            .font(.system(size: 22))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    .padding(.top, 60)
                } else {
                    let columns = min(availableCats.count, 4)
                    let gridColumns = Array(repeating: GridItem(.flexible(), spacing: 24), count: columns)
                    
                    LazyVGrid(columns: gridColumns, spacing: 24) {
                        ForEach(Array(availableCats.prefix(8).enumerated()), id: \.element.id) { index, cat in
                            CatShowcaseCard(cat: cat, index: index, appeared: appeared)
                        }
                    }
                    .padding(.horizontal, 60)
                }
                
                Spacer()
                
                // QR Code
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    HStack(spacing: 16) {
                        QRCodeView(url: qrURL, size: 100)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("View All Cats")
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundColor(Color(hex: "E8913A"))
                            Text("Scan for more info")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.5))
                        }
                    }
                    .padding(.bottom, 20)
                }
            }
            .padding(.top, 30)
        }
        .onAppear {
            withAnimation {
                appeared = true
            }
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
            // Photo
            ScreenImage(url: cat.imageURL)
                .frame(height: 180)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            
            // Info
            VStack(spacing: 4) {
                Text(cat.catName ?? cat.title.replacingOccurrences(of: "Meet ", with: ""))
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundColor(.white)
                
                if let age = cat.catAge {
                    Text(age)
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.5))
                }
                
                if let breed = cat.catBreed {
                    Text(breed)
                        .font(.system(size: 14))
                        .foregroundColor(Color.loungeMintGreen.opacity(0.8))
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
