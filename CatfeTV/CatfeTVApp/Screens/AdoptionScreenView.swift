//
//  AdoptionScreenView.swift
//  CatfeTVApp
//
//  Individual cat adoption screen - matches web AdoptionScreen design
//  Full-screen layout: header centered at top, polaroid left + info right centered vertically
//

import SwiftUI

struct AdoptionScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    private var catName: String {
        screen.catName ?? screen.title.replacingOccurrences(of: "Meet ", with: "")
    }
    
    /// Randomized "Looking for ___" sayings for non-adopted cats
    private static let lookingForSayings = [
        "Looking for Love",
        "Looking for a Forever Home",
        "Looking for Cuddles",
        "Looking for My Human",
        "Looking for a Lap to Sit On",
        "Looking for Chin Scratches",
        "Looking for a Cozy Couch",
        "Looking for My Purrson",
        "Looking for a Warm Bed",
        "Looking for Belly Rubs",
        "Looking for a Best Friend",
        "Looking for Treats & Snuggles",
        "Looking for a Window to Watch",
        "Looking for My Fur-ever Family",
        "Looking for Someone to Purr With",
        "Looking for a New Adventure",
        "Looking for Head Boops",
        "Looking for a Sunny Spot"
    ]
    
    /// Pick a saying based on the screen's numeric ID so it stays consistent per cat
    private var lookingForText: String {
        let index = (screen.numericId ?? 0) % Self.lookingForSayings.count
        return Self.lookingForSayings[abs(index)]
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                ZStack {
                    // Header: "Meet [name]" - centered at top
                    VStack {
                        HStack(spacing: 0) {
                            Text("Meet ")
                                .foregroundColor(.loungeCream.opacity(0.9))
                            Text(catName)
                                .foregroundColor(.loungeWarmOrange)
                        }
                        .font(.system(size: 72, weight: .bold, design: .serif))
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : -20)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                        
                        Spacer()
                    }
                    
                    // Main content: polaroid + info centered vertically
                    HStack(alignment: .center, spacing: geo.size.width * 0.06) {
                        // Left: Polaroid photo
                        if screen.imageURL != nil {
                            VStack(spacing: 0) {
                                ScreenImage(url: screen.imageURL)
                                    .frame(width: min(geo.size.width * 0.35, 420),
                                           height: min(geo.size.width * 0.35, 420))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                
                                // Adopted badge overlay
                                if screen.isAdopted {
                                    HStack(spacing: 6) {
                                        Text("🎉")
                                        Text("Adopted!")
                                            .font(.system(size: 22, weight: .bold))
                                    }
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 8)
                                    .background(
                                        LinearGradient(
                                            colors: [Color(hex: "86C5A9"), Color(hex: "6BA58D")],
                                            startPoint: .topLeading, endPoint: .bottomTrailing
                                        )
                                    )
                                    .cornerRadius(20)
                                    .shadow(radius: 8)
                                    .offset(y: -30)
                                }
                                
                                Spacer().frame(height: 16)
                                
                                Text("Meet \(catName)")
                                    .font(.system(size: 28, weight: .medium, design: .serif))
                                    .foregroundColor(Color(hex: "3d3d3d"))
                            }
                            .padding(20)
                            .padding(.bottom, 40)
                            .background(Color(hex: "FFFEF9"))
                            .cornerRadius(16)
                            .shadow(color: .black.opacity(0.5), radius: 30, x: 0, y: 15)
                            .rotationEffect(.degrees(-2))
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.8)
                            .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                        }
                        
                        // Right: Info section
                        VStack(alignment: .leading, spacing: 24) {
                            // Status badge
                            ScreenBadge(
                                text: screen.isAdopted ? "Found a Forever Home!" : lookingForText,
                                color: screen.isAdopted ? Color(hex: "86C5A9") : .loungeWarmOrange,
                                emoji: screen.isAdopted ? "🎉" : "🐱"
                            )
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.9)
                            .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                            
                            // Age, gender, breed
                            if let age = screen.catAge, let gender = screen.catGender {
                                Text("\(age) • \(gender)")
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.loungeCream.opacity(0.9))
                            }
                            
                            if let breed = screen.catBreed {
                                Text(breed)
                                    .font(CatfeTypography.body)
                                    .foregroundColor(.loungeMintGreen)
                            }
                            
                            // Subtitle
                            if let subtitle = screen.subtitle {
                                Text(subtitle)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.loungeCream.opacity(0.9))
                                    .opacity(appeared ? 1 : 0)
                                    .offset(x: appeared ? 0 : -20)
                                    .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                            }
                            
                            // Body / Description
                            if let body = screen.catDescription ?? screen.bodyText {
                                Text(body)
                                    .font(CatfeTypography.caption)
                                    .foregroundColor(.loungeCream.opacity(0.6))
                                    .lineSpacing(6)
                                    .lineLimit(5)
                                    .opacity(appeared ? 1 : 0)
                                    .offset(x: appeared ? 0 : -20)
                                    .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                            }
                            
                            // Adoption quote
                            if !screen.isAdopted {
                                Text("\"Scan the QR to Adopt Me :)\"")
                                    .font(.system(size: 22, weight: .regular, design: .serif))
                                    .italic()
                                    .foregroundColor(.loungeCream.opacity(0.7))
                                    .padding(20)
                                    .background(
                                        RoundedRectangle(cornerRadius: 16)
                                            .fill(Color(hex: "F5E6D3").opacity(0.1))
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 16)
                                                    .stroke(Color(hex: "F5E6D3").opacity(0.2), lineWidth: 1)
                                            )
                                    )
                                    .opacity(appeared ? 1 : 0)
                                    .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                            }
                            
                            Spacer().frame(height: 8)
                            
                            // QR Code
                            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                                QRCodeView(url: qrURL, size: 160, label: screen.qrLabel)
                                    .opacity(appeared ? 1 : 0)
                                    .scaleEffect(appeared ? 1 : 0.8)
                                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.6), value: appeared)
                            }
                        }
                        .frame(maxWidth: geo.size.width * 0.45, alignment: .leading)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, 100) // Below the header
                }
            }
        }
        .onAppear {
            withAnimation {
                appeared = true
            }
        }
    }
}

#if DEBUG
struct AdoptionScreenView_Previews: PreviewProvider {
    static var previews: some View {
        AdoptionScreenView(screen: Screen.sampleScreens[1])
    }
}
#endif
