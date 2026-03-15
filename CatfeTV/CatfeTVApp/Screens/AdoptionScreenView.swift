//
//  AdoptionScreenView.swift
//  CatfeTVApp
//
//  Individual cat adoption screen - Modern Magazine split-screen design
//  Full-bleed cat photo on left, orange accent divider, clean cream info panel on right
//  Rotates through spotlight photos, guest photos + admin photo
//  Shows spotlight indicator when cat has active spotlight donations
//

import SwiftUI

struct AdoptionScreenView: View {
    let screen: Screen
    @EnvironmentObject var apiClient: APIClient
    
    @State private var appeared = false
    @State private var currentPhotoIndex = 0
    
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
    
    /// The real cat database ID (from catId field, or derived from synthetic screen id)
    private var realCatId: Int? {
        if let catId = screen.catId { return catId }
        // Fallback: synthetic screen IDs are 100000 + cat.id
        if let numId = screen.numericId, numId > 100000 { return numId - 100000 }
        return screen.numericId
    }
    
    /// Active spotlight donations for this cat
    private var activeSpotlightsForCat: [SpotlightDonation] {
        guard let catId = realCatId else { return [] }
        let now = Date()
        return apiClient.cachedActiveSpotlights.filter { $0.catId == catId && $0.expiresAt > now }
    }
    
    /// Get guest photos for this cat from the cached Snap & Purr data
    private var guestPhotosForCat: [GuestCatPhoto] {
        guard let catId = realCatId else { return [] }
        return apiClient.cachedTopGuestPhotos.filter { $0.catId == catId }
    }
    
    /// Photo source enum to track where each photo came from
    private enum PhotoSource {
        case spotlight(donorName: String, caption: String?, tierId: String)
        case guest(uploaderName: String?)
        case admin
    }
    
    /// All photo URLs to display: spotlight photos first, then guest photos, then admin photo
    private var allPhotos: [(url: String, source: PhotoSource)] {
        var photos: [(url: String, source: PhotoSource)] = []
        
        // Add spotlight photos first (highest priority)
        for spotlight in activeSpotlightsForCat {
            if let url = spotlight.photoUrl, !url.isEmpty {
                photos.append((
                    url: url,
                    source: .spotlight(
                        donorName: spotlight.donorName,
                        caption: spotlight.caption,
                        tierId: spotlight.tierId
                    )
                ))
            }
        }
        
        // Add guest photos
        for guestPhoto in guestPhotosForCat {
            photos.append((url: guestPhoto.photoUrl, source: .guest(uploaderName: guestPhoto.uploaderName)))
        }
        
        // Add admin photo as fallback (always include it)
        if let adminURL = screen.imageURL {
            photos.append((url: adminURL, source: .admin))
        }
        
        return photos
    }
    
    /// The current photo to display
    private var currentPhoto: (url: String, source: PhotoSource)? {
        guard !allPhotos.isEmpty else { return nil }
        let index = currentPhotoIndex % allPhotos.count
        return allPhotos[index]
    }
    
    /// Timer to rotate through photos
    private let photoTimer = Timer.publish(every: 6, on: .main, in: .common).autoconnect()
    
    var body: some View {
        GeometryReader { geo in
            HStack(spacing: 0) {
                // ── LEFT HALF: Full-bleed cat photo ──
                ZStack(alignment: .bottom) {
                    if let photo = currentPhoto {
                        ScreenImage(url: photo.url)
                            .frame(width: geo.size.width * 0.52, height: geo.size.height)
                            .clipped()
                            .id(currentPhotoIndex)
                            .transition(.opacity)
                            .animation(.easeInOut(duration: 0.8), value: currentPhotoIndex)
                    } else {
                        // Fallback placeholder
                        Rectangle()
                            .fill(Color(hex: "e8e4dc"))
                            .overlay(
                                Text("🐱")
                                    .font(.system(size: 160))
                            )
                    }
                    
                    // Subtle gradient for depth at right edge
                    HStack {
                        Spacer()
                        LinearGradient(
                            colors: [.clear, Color(hex: "FAFAF5").opacity(0.15)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        .frame(width: 80)
                    }
                    
                    // Adopted badge on photo
                    if screen.isAdopted {
                        VStack {
                            HStack {
                                HStack(spacing: 8) {
                                    Text("\u{1F389}")
                                        .font(.system(size: 26))
                                    Text("Adopted!")
                                        .font(.system(size: 26, weight: .bold))
                                        .foregroundColor(.white)
                                }
                                .padding(.horizontal, 24)
                                .padding(.vertical, 12)
                                .background(
                                    LinearGradient(
                                        colors: [Color(hex: "86C5A9"), Color(hex: "5A9E80")],
                                        startPoint: .topLeading, endPoint: .bottomTrailing
                                    )
                                )
                                .cornerRadius(24)
                                .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 4)
                                
                                Spacer()
                            }
                            .padding(.leading, 32)
                            .padding(.top, 32)
                            
                            Spacer()
                        }
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.8)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.5), value: appeared)
                    }
                    
                    // Birthday banner (bottom-left, takes priority over New Cat)
                    if screen.isBirthday && !screen.isAdopted {
                        VStack {
                            Spacer()
                            HStack {
                                HStack(spacing: 8) {
                                    Text("\u{1F382}")
                                        .font(.system(size: 26))
                                    Text(screen.birthdayDate != nil ? "Birthday \(screen.birthdayDate!)!" : "Happy Birthday!")
                                        .font(.system(size: 26, weight: .bold))
                                        .foregroundColor(.white)
                                }
                                .padding(.horizontal, 24)
                                .padding(.vertical, 12)
                                .background(
                                    LinearGradient(
                                        colors: [Color(hex: "EC4899"), Color(hex: "DB2777")],
                                        startPoint: .topLeading, endPoint: .bottomTrailing
                                    )
                                )
                                .cornerRadius(24)
                                .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 4)
                                
                                Spacer()
                            }
                            .padding(.leading, 32)
                            .padding(.bottom, 80)
                        }
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.8)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.5), value: appeared)
                    }
                    
                    // New Cat! banner (bottom-left of photo, above credit overlay)
                    if screen.isNewCat && !screen.isAdopted && !screen.isBirthday {
                        VStack {
                            Spacer()
                            HStack {
                                HStack(spacing: 8) {
                                    Text("\u{2728}")
                                        .font(.system(size: 26))
                                    Text("New Cat!")
                                        .font(.system(size: 26, weight: .bold))
                                        .foregroundColor(.white)
                                }
                                .padding(.horizontal, 24)
                                .padding(.vertical, 12)
                                .background(
                                    LinearGradient(
                                        colors: [Color(hex: "F59E0B"), Color(hex: "D97706")],
                                        startPoint: .topLeading, endPoint: .bottomTrailing
                                    )
                                )
                                .cornerRadius(24)
                                .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 4)
                                
                                Spacer()
                            }
                            .padding(.leading, 32)
                            .padding(.bottom, 80)
                        }
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.8)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.5), value: appeared)
                    }
                    
                    // Photo credit overlay at bottom of photo
                    if let photo = currentPhoto {
                        VStack {
                            Spacer()
                            
                            // Spotlight photo credit
                            if case .spotlight(let donorName, let caption, _) = photo.source {
                                HStack(spacing: 10) {
                                    Text("⭐")
                                        .font(.system(size: 22))
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Spotlight by \(donorName)")
                                            .font(.system(size: 20, weight: .bold))
                                            .foregroundColor(.white)
                                        if let caption = caption, !caption.isEmpty {
                                            Text("\"\(caption)\"")
                                                .font(.system(size: 16, weight: .regular, design: .serif))
                                                .italic()
                                                .foregroundColor(.white.opacity(0.8))
                                                .lineLimit(1)
                                        }
                                    }
                                    Spacer()
                                }
                                .padding(.horizontal, 20)
                                .padding(.vertical, 12)
                                .background(
                                    RoundedRectangle(cornerRadius: 14)
                                        .fill(
                                            LinearGradient(
                                                colors: [Color(hex: "E8913A").opacity(0.85), Color(hex: "D4782A").opacity(0.85)],
                                                startPoint: .leading, endPoint: .trailing
                                            )
                                        )
                                        .background(
                                            RoundedRectangle(cornerRadius: 14)
                                                .fill(.ultraThinMaterial)
                                        )
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                                .padding(.horizontal, 24)
                                .padding(.bottom, 24)
                            }
                            // Guest photo credit
                            else if case .guest(let uploaderName) = photo.source, let name = uploaderName, !name.isEmpty {
                                HStack(spacing: 10) {
                                    Text("📸")
                                        .font(.system(size: 22))
                                    Text("Snap a photo of me! Spotlight it on my profile")
                                        .font(.system(size: 20, weight: .semibold))
                                        .foregroundColor(.white)
                                    Text("⭐")
                                        .font(.system(size: 20))
                                }
                                .padding(.horizontal, 20)
                                .padding(.vertical, 12)
                                .background(
                                    RoundedRectangle(cornerRadius: 14)
                                        .fill(Color.black.opacity(0.55))
                                        .background(
                                            RoundedRectangle(cornerRadius: 14)
                                                .fill(.ultraThinMaterial)
                                        )
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                                .padding(.horizontal, 24)
                                .padding(.bottom, 24)
                            }
                            // Admin photo — show snap & purr callout for non-adopted cats
                            else if case .admin = photo.source, !screen.isAdopted {
                                HStack(spacing: 10) {
                                    Text("📸")
                                        .font(.system(size: 22))
                                    Text("Snap a photo of me! Spotlight it on my profile")
                                        .font(.system(size: 20, weight: .semibold))
                                        .foregroundColor(.white)
                                    Text("⭐")
                                        .font(.system(size: 20))
                                }
                                .padding(.horizontal, 20)
                                .padding(.vertical, 12)
                                .background(
                                    RoundedRectangle(cornerRadius: 14)
                                        .fill(Color.black.opacity(0.55))
                                        .background(
                                            RoundedRectangle(cornerRadius: 14)
                                                .fill(.ultraThinMaterial)
                                        )
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                                .padding(.horizontal, 24)
                                .padding(.bottom, 24)
                            }
                        }
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.8), value: appeared)
                    }
                    
                    // Guest photo credit badge (top-right of photo)
                    if let photo = currentPhoto, case .guest(let uploaderName) = photo.source, let name = uploaderName, !name.isEmpty {
                        VStack {
                            HStack {
                                Spacer()
                                HStack(spacing: 6) {
                                    Image(systemName: "camera.fill")
                                        .font(.system(size: 14))
                                    Text("Photo by \(name)")
                                        .font(.system(size: 16, weight: .medium))
                                }
                                .foregroundColor(.white.opacity(0.9))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 6)
                                .background(
                                    Capsule()
                                        .fill(Color.black.opacity(0.4))
                                )
                                .padding(.trailing, 16)
                                .padding(.top, 16)
                            }
                            Spacer()
                        }
                    }
                    
                    // Photo indicator dots
                    if allPhotos.count > 1 {
                        VStack {
                            Spacer()
                            HStack {
                                HStack(spacing: 6) {
                                    ForEach(0..<allPhotos.count, id: \.self) { i in
                                        let isSpotlight: Bool = {
                                            if case .spotlight = allPhotos[i].source { return true }
                                            return false
                                        }()
                                        Circle()
                                            .fill(i == (currentPhotoIndex % allPhotos.count) ?
                                                  (isSpotlight ? Color(hex: "E8913A") : Color.white) :
                                                  (isSpotlight ? Color(hex: "E8913A").opacity(0.4) : Color.white.opacity(0.4)))
                                            .frame(width: 8, height: 8)
                                    }
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Capsule().fill(Color.black.opacity(0.3)))
                                .padding(.leading, 24)
                                .padding(.bottom, screen.isAdopted ? 24 : 70) // Above the credit overlay
                                
                                Spacer()
                            }
                        }
                    }
                }
                .frame(width: geo.size.width * 0.52, height: geo.size.height)
                .opacity(appeared ? 1 : 0)
                .offset(x: appeared ? 0 : -40)
                .animation(.easeOut(duration: 0.7), value: appeared)
                
                // ── ORANGE ACCENT DIVIDER ──
                Rectangle()
                    .fill(Color(hex: "E8913A"))
                    .frame(width: 6)
                
                // ── RIGHT HALF: Clean cream info panel ──
                ZStack {
                    // Cream background
                    Color(hex: "FAFAF5")
                    
                    // Subtle paw print watermark
                    VStack {
                        HStack {
                            Spacer()
                            PawPrintWatermark()
                                .frame(width: 120, height: 120)
                                .opacity(0.04)
                                .padding(.top, 30)
                                .padding(.trailing, 30)
                        }
                        Spacer()
                    }
                    
                    // Info content
                    VStack(alignment: .leading, spacing: 0) {
                        Spacer()
                        
                        // Title: "Meet [Name]"
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Meet \(catName)")
                                .font(.system(size: 64, weight: .heavy, design: .default))
                                .foregroundColor(Color(hex: "1a1a1a"))
                                .lineLimit(2)
                                .minimumScaleFactor(0.7)
                            
                            // Orange accent underline
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color(hex: "E8913A"))
                                .frame(width: 180, height: 4)
                        }
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : -20)
                        .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                        
                        Spacer().frame(height: 28)
                        
                        // ── SPOTLIGHT INDICATOR ──
                        if !activeSpotlightsForCat.isEmpty {
                            let spotlightCount = activeSpotlightsForCat.count
                            let firstSpotlight = activeSpotlightsForCat[0]
                            
                            HStack(spacing: 10) {
                                Text("⭐")
                                    .font(.system(size: 22))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("In the Spotlight!")
                                        .font(.system(size: 20, weight: .bold))
                                        .foregroundColor(.white)
                                    Text(spotlightCount == 1
                                         ? "by \(firstSpotlight.donorName)"
                                         : "\(spotlightCount) spotlights active")
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(.white.opacity(0.85))
                                }
                                Spacer()
                                Text(firstSpotlight.tierLabel)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(Color(hex: "E8913A"))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 4)
                                    .background(Color.white.opacity(0.9))
                                    .cornerRadius(12)
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 14)
                            .background(
                                LinearGradient(
                                    colors: [Color(hex: "E8913A"), Color(hex: "D4782A")],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .cornerRadius(16)
                            .shadow(color: Color(hex: "E8913A").opacity(0.3), radius: 10, x: 0, y: 4)
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.9)
                            .animation(.easeOut(duration: 0.5).delay(0.25), value: appeared)
                            
                            Spacer().frame(height: 16)
                        }
                        
                        // Adoption status badge (birthday takes priority for non-adopted cats)
                        HStack(spacing: 8) {
                            let badgeEmoji = screen.isAdopted ? "\u{1F389}" : (screen.isBirthday ? "\u{1F382}" : "\u{1F431}")
                            let badgeText = screen.isAdopted ? "Found a Forever Home!" : (screen.isBirthday ? (screen.birthdayDate != nil ? "Birthday \(screen.birthdayDate!)! Wish me well!" : "Happy Birthday! Wish me well!") : lookingForText)
                            Text(badgeEmoji)
                                .font(.system(size: 22))
                            Text(badgeText)
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(
                            LinearGradient(
                                colors: screen.isAdopted ?
                                    [Color(hex: "86C5A9"), Color(hex: "5A9E80")] :
                                    (screen.isBirthday ? [Color(hex: "EC4899"), Color(hex: "DB2777")] : [Color(hex: "E8913A"), Color(hex: "D4782A")]),
                                startPoint: .topLeading, endPoint: .bottomTrailing
                            )
                        )
                        .cornerRadius(24)
                        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 3)
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.9)
                        .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                        
                        // Guest photo count
                        if !guestPhotosForCat.isEmpty {
                            HStack(spacing: 6) {
                                Image(systemName: "heart.fill")
                                    .foregroundColor(Color(hex: "E8913A"))
                                Text("\(guestPhotosForCat.count) guest photo\(guestPhotosForCat.count == 1 ? "" : "s")")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(Color(hex: "888"))
                            }
                            .padding(.top, 12)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.35), value: appeared)
                        }
                        
                        Spacer().frame(height: 20)
                        
                        // Age / Gender
                        let genderDisplay: String? = {
                            guard let g = screen.catGender, !g.isEmpty, g != "unknown" else { return nil }
                            let icon = g == "Male" ? "♂" : "♀"
                            return "\(icon) \(g)"
                        }()
                        let ageGenderText: String? = {
                            if let age = screen.catAge, let gd = genderDisplay {
                                return "\(age) · \(gd)"
                            } else if let age = screen.catAge {
                                return age
                            } else if let gd = genderDisplay {
                                return gd
                            }
                            return nil
                        }()
                        if let text = ageGenderText {
                            Text(text)
                                .font(.system(size: 28, weight: .light))
                                .foregroundColor(Color(hex: "444444"))
                                .opacity(appeared ? 1 : 0)
                                .offset(x: appeared ? 0 : 20)
                                .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                        }
                        
                        // Breed
                        if let breed = screen.catBreed {
                            Text(breed)
                                .font(.system(size: 20, weight: .regular))
                                .foregroundColor(Color(hex: "86C5A9"))
                                .padding(.top, 4)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.42), value: appeared)
                        }
                        
                        Spacer().frame(height: 16)
                        
                        // Personality tags / Body text as pills
                        if let body = screen.catDescription ?? screen.bodyText {
                            let tags = body.components(separatedBy: " · ")
                            if tags.count > 1 {
                                // Show as tag pills
                                FlowLayout(spacing: 10) {
                                    ForEach(tags, id: \.self) { tag in
                                        Text(tag.trimmingCharacters(in: .whitespaces))
                                            .font(.system(size: 18, weight: .medium))
                                            .foregroundColor(Color(hex: "3d3d3d"))
                                            .padding(.horizontal, 16)
                                            .padding(.vertical, 8)
                                            .background(Color.white)
                                            .cornerRadius(10)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 10)
                                                    .stroke(Color(hex: "e5e0d8"), lineWidth: 1)
                                            )
                                    }
                                }
                                .opacity(appeared ? 1 : 0)
                                .offset(x: appeared ? 0 : 20)
                                .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                            } else {
                                // Show as paragraph
                                Text(body)
                                    .font(.system(size: 18, weight: .regular))
                                    .foregroundColor(Color(hex: "666666"))
                                    .lineSpacing(6)
                                    .lineLimit(4)
                                    .opacity(appeared ? 1 : 0)
                                    .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                            }
                        }
                        
                        Spacer().frame(height: 16)
                        
                        // ── GUEST WORD CLOUD ──
                        if let catId = screen.catId,
                           let traits = apiClient.cachedCatTraits[catId],
                           !traits.isEmpty {
                            GuestTraitCloud(traits: traits, appeared: appeared)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.6).delay(0.55), value: appeared)
                            
                            Spacer().frame(height: 16)
                        }
                        
                        // Adoption quote
                        if !screen.isAdopted {
                            Text("\"Scan to meet me, upload photos & adopt!\"")
                                .font(.system(size: 18, weight: .regular, design: .serif))
                                .italic()
                                .foregroundColor(Color(hex: "888888"))
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.6), value: appeared)
                        }
                        
                        Spacer().frame(height: 16)
                        
                        // QR Code — prepend base URL if path is relative
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            let fullURL = qrURL.hasPrefix("http") ? qrURL : "https://catfetv.com" + qrURL
                            MagazineQRCode(url: fullURL, label: screen.qrLabel ?? "Upload photos & adopt")
                                .opacity(appeared ? 1 : 0)
                                .scaleEffect(appeared ? 1 : 0.9)
                                .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.6), value: appeared)
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 50)
                    .padding(.vertical, 40)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation {
                appeared = true
            }
        }
        .onReceive(photoTimer) { _ in
            guard allPhotos.count > 1 else { return }
            withAnimation(.easeInOut(duration: 0.8)) {
                currentPhotoIndex += 1
            }
        }
    }
}

// MARK: - Magazine-style QR Code (white card with border)
private struct MagazineQRCode: View {
    let url: String
    var label: String?
    
    @State private var qrImage: UIImage?
    
    var body: some View {
        Group {
            if let image = qrImage {
                VStack(spacing: 8) {
                    Image(uiImage: image)
                        .interpolation(.none)
                        .resizable()
                        .frame(width: 130, height: 130)
                    
                    Text(label ?? "Scan to learn more")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color(hex: "666666"))
                }
                .padding(18)
                .background(Color.white)
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color(hex: "e5e0d8"), lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.08), radius: 10, x: 0, y: 4)
            } else {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .frame(width: 166, height: 196)
                    .overlay(
                        ProgressView()
                            .tint(Color(hex: "E8913A"))
                    )
            }
        }
        .onAppear {
            qrImage = QRCodeGenerator.generate(from: url, size: CGSize(width: 260, height: 260))
        }
    }
}

// MARK: - Paw Print Watermark
private struct PawPrintWatermark: View {
    var body: some View {
        ZStack {
            // Main pad
            Circle()
                .fill(Color(hex: "2d2d2d"))
                .frame(width: 50, height: 50)
                .offset(y: 10)
            // Toe beans
            ForEach(0..<4) { i in
                let angle = Double(i) * 30 - 45
                let x = cos(angle * .pi / 180) * 35
                let y = sin(angle * .pi / 180) * 35 - 15
                Circle()
                    .fill(Color(hex: "2d2d2d"))
                    .frame(width: 22, height: 22)
                    .offset(x: CGFloat(x), y: CGFloat(y))
            }
        }
    }
}

// MARK: - Flow Layout for personality tags
private struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }
    
    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }
        
        return (CGSize(width: maxWidth, height: y + rowHeight), positions)
    }
}

// MARK: - Guest Trait Word Cloud (compact, for adoption profile)
private struct GuestTraitCloud: View {
    let traits: [(word: String, count: Int)]
    let appeared: Bool
    
    // Warm Catfe palette for trait words
    private let traitColors: [Color] = [
        Color(hex: "E8913A"),  // Amber
        Color(hex: "d97706"),  // Dark amber
        Color(hex: "ea580c"),  // Orange
        Color(hex: "b45309"),  // Brown amber
        Color(hex: "f59e0b"),  // Yellow amber
        Color(hex: "c2410c"),  // Burnt orange
        Color(hex: "92400e"),  // Dark brown
        Color(hex: "a16207"),  // Gold brown
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack(spacing: 8) {
                Text("\u{1F4AC}")
                    .font(.system(size: 18))
                Text("GUESTS SAY")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .tracking(2)
                    .foregroundColor(Color(hex: "E8913A"))
            }
            
            // Trait pills in a flow layout
            let sorted = traits.sorted { $0.count > $1.count }
            let maxCount = sorted.first?.count ?? 1
            let displayed = Array(sorted.prefix(12)) // Show top 12 traits
            
            FlowLayout(spacing: 8) {
                ForEach(Array(displayed.enumerated()), id: \.offset) { index, trait in
                    let ratio = maxCount > 1 ? Double(trait.count) / Double(maxCount) : 0.5
                    let fontSize = 14.0 + ratio * 10.0 // 14pt to 24pt
                    let color = traitColors[index % traitColors.count]
                    
                    HStack(spacing: 4) {
                        Text(trait.word)
                            .font(.system(size: CGFloat(fontSize), weight: ratio > 0.6 ? .bold : .semibold, design: .rounded))
                            .foregroundColor(color)
                        
                        if trait.count > 1 {
                            Text("\(trait.count)")
                                .font(.system(size: 11, weight: .medium, design: .rounded))
                                .foregroundColor(color.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(color.opacity(0.08))
                    .cornerRadius(20)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(color.opacity(0.15), lineWidth: 1)
                    )
                    .scaleEffect(appeared ? 1 : 0.7)
                    .animation(
                        .spring(response: 0.4, dampingFraction: 0.65)
                            .delay(0.6 + Double(index) * 0.05),
                        value: appeared
                    )
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color(hex: "E8913A").opacity(0.04))
        )
    }
}
