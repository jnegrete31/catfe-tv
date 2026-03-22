//
//  AdoptionShowcaseScreenView.swift
//  CatfeTVApp
//
//  Grid of adoptable cats - premium dark theme matching membership slide.
//  Pages through all cats in groups, cycling every 6 seconds.
//  Shows top-voted guest photo per cat with fallback to admin photo.
//

import SwiftUI

struct AdoptionShowcaseScreenView: View {
    let screen: Screen
    var adoptionCats: [Screen] = []
    @EnvironmentObject var apiClient: APIClient
    
    @State private var appeared = false
    @State private var currentPage = 0
    
    /// Timer to cycle through pages of cats
    private let pageTimer = Timer.publish(every: 6, on: .main, in: .common).autoconnect()
    
    /// Filter to only available (non-adopted) cats, sorted by days at Catfé (longest first)
    private var availableCats: [Screen] {
        adoptionCats
            .filter { !$0.isAdopted }
            .sorted { ($0.daysAtCatfe ?? 0) > ($1.daysAtCatfe ?? 0) }
    }
    
    /// How many cats to show per page (max 8, in a 4-column grid)
    private let catsPerPage = 8
    
    /// Split available cats into pages
    private var pages: [[Screen]] {
        guard !availableCats.isEmpty else { return [] }
        return stride(from: 0, to: availableCats.count, by: catsPerPage).map { startIndex in
            let endIndex = min(startIndex + catsPerPage, availableCats.count)
            return Array(availableCats[startIndex..<endIndex])
        }
    }
    
    /// Current page of cats to display
    private var currentCats: [Screen] {
        guard !pages.isEmpty else { return [] }
        let safeIndex = currentPage % pages.count
        return pages[safeIndex]
    }
    
    var body: some View {
        ZStack {
            // Dark premium background matching membership
            Color(hex: "1C1410")
                .ignoresSafeArea()
            
            // Warm radial glows
            GeometryReader { geo in
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "8B5E3C").opacity(0.12), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.4
                    ))
                    .frame(width: geo.size.width * 0.8, height: geo.size.width * 0.8)
                    .position(x: geo.size.width * 0.5, y: 0)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "C4956A").opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.15, y: geo.size.height * 0.8)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "B87333").opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.85, y: geo.size.height * 0.8)
            }
            
            // Top accent line
            VStack {
                LinearGradient(
                    colors: [.clear, Color(hex: "C4956A"), Color(hex: "B87333"), Color(hex: "D4A574"), .clear],
                    startPoint: .leading, endPoint: .trailing
                )
                .frame(height: 2)
                Spacer()
            }
            .ignoresSafeArea()
            
            // Content
            VStack(spacing: 0) {
                // Header section - matching membership style
                VStack(spacing: 8) {
                    Text("LOOKING FOR THEIR FOREVER HOME")
                        .font(.system(size: 18, weight: .medium, design: .serif))
                        .tracking(6)
                        .foregroundColor(Color(hex: "C4956A"))
                    
                    Text("Meet Our Cats")
                        .font(.system(size: 56, weight: .bold, design: .serif))
                        .foregroundColor(Color(hex: "F5E6D3"))
                    
                    // Decorative divider
                    HStack(spacing: 12) {
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [.clear, Color(hex: "C4956A")],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .frame(width: 50, height: 1)
                        Text("✦")
                            .font(.system(size: 12))
                            .foregroundColor(Color(hex: "C4956A"))
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [Color(hex: "C4956A"), .clear],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .frame(width: 50, height: 1)
                    }
                    .padding(.top, 4)
                    
                    // Subtitle
                    Text(screen.subtitle ?? "Each one is looking for their forever home")
                        .font(.system(size: 20, weight: .regular, design: .serif))
                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.5))
                        .padding(.top, 2)
                    
                    // Page indicator
                    if pages.count > 1 {
                        HStack(spacing: 8) {
                            ForEach(0..<pages.count, id: \.self) { index in
                                Circle()
                                    .fill(index == (currentPage % pages.count)
                                          ? Color(hex: "C4956A")
                                          : Color(hex: "F5E6D3").opacity(0.2))
                                    .frame(width: 8, height: 8)
                                    .animation(.easeInOut(duration: 0.3), value: currentPage)
                            }
                        }
                        .padding(.top, 6)
                    }
                }
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : -20)
                .animation(.easeOut(duration: 0.6), value: appeared)
                .padding(.top, 50)
                .padding(.bottom, 24)
                
                // Cat grid
                if availableCats.isEmpty {
                    VStack(spacing: 20) {
                        Text("🎉").font(.system(size: 80))
                        Text("All cats have found homes!")
                            .font(.system(size: 32, weight: .semibold, design: .serif))
                            .foregroundColor(Color(hex: "F5E6D3").opacity(0.8))
                        Text("Check back soon for new arrivals")
                            .font(.system(size: 20, weight: .regular, design: .serif))
                            .foregroundColor(Color(hex: "F5E6D3").opacity(0.5))
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    let columns = min(currentCats.count, 4)
                    let gridColumns = Array(repeating: GridItem(.flexible(), spacing: 28), count: columns)
                    
                    LazyVGrid(columns: gridColumns, spacing: 28) {
                        ForEach(Array(currentCats.enumerated()), id: \.element.id) { index, cat in
                            PremiumCatCard(
                                cat: cat,
                                index: index,
                                appeared: appeared,
                                guestPhotoURL: guestPhotoURL(for: cat)
                            )
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.horizontal, 60)
                    .animation(.easeInOut(duration: 0.5), value: currentPage)
                }
                
                Spacer(minLength: 8)
                
                // Bottom QR
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    HStack {
                        Spacer()
                        QRCodeView(url: qrURL, size: 100, label: screen.qrLabel ?? "Scan to Adopt")
                    }
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                    .padding(.trailing, 60)
                    .padding(.bottom, 30)
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
        }
        .onReceive(pageTimer) { _ in
            guard pages.count > 1 else { return }
            withAnimation(.easeInOut(duration: 0.5)) {
                currentPage += 1
            }
        }
    }
    
    /// Get the top guest photo URL for a given cat screen, if available
    private func guestPhotoURL(for cat: Screen) -> String? {
        let realCatId: Int?
        if let cid = cat.catId {
            realCatId = cid
        } else if let numId = cat.numericId, numId > 100000 {
            realCatId = numId - 100000
        } else {
            realCatId = cat.numericId
        }
        guard let catId = realCatId else { return nil }
        return apiClient.topGuestPhotoURL(forCatId: catId)
    }
}

// MARK: - Premium Cat Card

private struct PremiumCatCard: View {
    let cat: Screen
    let index: Int
    let appeared: Bool
    let guestPhotoURL: String?
    
    /// Use guest photo if available, otherwise fall back to admin photo
    private var displayPhotoURL: String? {
        guestPhotoURL ?? cat.imageURL
    }
    
    /// Accent color for this card
    private var cardAccent: Color {
        let accents = [
            Color(hex: "C4956A"),
            Color(hex: "B87333"),
            Color(hex: "D4A574"),
            Color(hex: "A67B5B")
        ]
        return accents[index % accents.count]
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Photo section
            ZStack(alignment: .bottom) {
                ScreenImage(url: displayPhotoURL)
                    .frame(maxWidth: .infinity)
                    .frame(height: 210)
                    .clipShape(
                        UnevenRoundedRectangle(
                            topLeadingRadius: 20,
                            bottomLeadingRadius: 0,
                            bottomTrailingRadius: 0,
                            topTrailingRadius: 20
                        )
                    )
                
                // Gradient overlay at bottom of photo
                LinearGradient(
                    colors: [.clear, Color(hex: "1E1610").opacity(0.8)],
                    startPoint: .top, endPoint: .bottom
                )
                .frame(height: 60)
                
                // Badge row
                HStack {
                    // Left badges: Birthday or New
                    if cat.isBirthday && !cat.isAdopted {
                        HStack(spacing: 4) {
                            Text("\u{1F382}")
                                .font(.system(size: 12))
                            Text("Birthday!")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "EC4899"), Color(hex: "DB2777")],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .cornerRadius(10)
                        .shadow(color: .black.opacity(0.4), radius: 4, x: 0, y: 2)
                    } else if cat.isNewCat && !cat.isAdopted {
                        HStack(spacing: 4) {
                            Text("\u{2728}")
                                .font(.system(size: 12))
                            Text("New!")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "F59E0B"), Color(hex: "D97706")],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .cornerRadius(10)
                        .shadow(color: .black.opacity(0.4), radius: 4, x: 0, y: 2)
                    }
                    
                    Spacer()
                    
                    // Right badge: Guest photo
                    if guestPhotoURL != nil {
                        HStack(spacing: 3) {
                            Image(systemName: "camera.fill")
                                .font(.system(size: 10))
                            Text("Guest")
                                .font(.system(size: 11, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(cardAccent.opacity(0.85))
                        .cornerRadius(8)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.bottom, 10)
            }
            
            // Info section
            VStack(spacing: 6) {
                // Cat name - serif style
                Text(cat.catName ?? cat.title.replacingOccurrences(of: "Meet ", with: ""))
                    .font(.system(size: 26, weight: .bold, design: .serif))
                    .foregroundColor(Color(hex: "F5E6D3"))
                
                // Decorative mini flourish
                HStack(spacing: 6) {
                    Rectangle()
                        .fill(cardAccent.opacity(0.3))
                        .frame(width: 20, height: 1)
                    Text("✦")
                        .font(.system(size: 8))
                        .foregroundColor(cardAccent)
                    Rectangle()
                        .fill(cardAccent.opacity(0.3))
                        .frame(width: 20, height: 1)
                }
                
                // Gender & Age
                if let gender = cat.catGender, !gender.isEmpty, gender != "unknown" {
                    let genderIcon = gender == "Male" ? "♂" : "♀"
                    let ageText = cat.catAge ?? ""
                    let combined = ageText.isEmpty ? "\(genderIcon) \(gender)" : "\(genderIcon) \(gender) · \(ageText)"
                    Text(combined)
                        .font(.system(size: 16, weight: .regular, design: .serif))
                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.6))
                } else if let age = cat.catAge {
                    Text(age)
                        .font(.system(size: 16, weight: .regular, design: .serif))
                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.5))
                }
                
                // Breed
                if let breed = cat.catBreed {
                    Text(breed)
                        .font(.system(size: 15, weight: .regular, design: .serif))
                        .foregroundColor(cardAccent.opacity(0.8))
                }
                
                // Days at Catfé badge
                if let days = cat.daysAtCatfe, !cat.isAdopted {
                    HStack(spacing: 6) {
                        Text("\u{1F3E0}")
                            .font(.system(size: 12))
                        Text("\(days) \(days == 1 ? "day" : "days") at Catfé")
                            .font(.system(size: 14, weight: .semibold, design: .serif))
                            .foregroundColor(Color(hex: "FDE68A"))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 5)
                    .background(Color(hex: "92400E").opacity(0.4))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(hex: "FDE68A").opacity(0.3), lineWidth: 1)
                    )
                    .cornerRadius(10)
                    .padding(.top, 2)
                }
            }
            .padding(.vertical, 14)
            .padding(.horizontal, 8)
        }
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "261E16"), Color(hex: "1E1610")],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(cardAccent.opacity(0.2), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
        .opacity(appeared ? 1 : 0)
        .scaleEffect(appeared ? 1 : 0.85)
        .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(Double(index) * 0.08 + 0.2), value: appeared)
    }
}
