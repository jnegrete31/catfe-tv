//
//  AdoptionScreenView.swift
//  CatfeTVApp
//
//  Individual cat adoption screen - Modern Magazine split-screen design
//  Full-bleed cat photo on left, orange accent divider, clean cream info panel on right
//  Rotates through guest photos + admin photo
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
    
    /// Get guest photos for this cat from the cached Snap & Purr data
    private var guestPhotosForCat: [GuestCatPhoto] {
        guard let catId = screen.numericId else { return [] }
        return apiClient.cachedTopGuestPhotos.filter { $0.catId == catId }
    }
    
    /// All photo URLs to display: guest photos first, then admin photo as fallback
    private var allPhotoURLs: [(url: String, isGuest: Bool, uploaderName: String?)] {
        var photos: [(url: String, isGuest: Bool, uploaderName: String?)] = []
        
        // Add guest photos first
        for guestPhoto in guestPhotosForCat {
            photos.append((url: guestPhoto.photoUrl, isGuest: true, uploaderName: guestPhoto.uploaderName))
        }
        
        // Add admin photo as fallback (always include it)
        if let adminURL = screen.imageURL {
            photos.append((url: adminURL, isGuest: false, uploaderName: nil))
        }
        
        return photos
    }
    
    /// The current photo to display
    private var currentPhoto: (url: String, isGuest: Bool, uploaderName: String?)? {
        guard !allPhotoURLs.isEmpty else { return nil }
        let index = currentPhotoIndex % allPhotoURLs.count
        return allPhotoURLs[index]
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
                                    Text("🎉")
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
                    
                    // Snap & Purr spotlight callout overlay on photo (non-adopted only)
                    if !screen.isAdopted {
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
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.8), value: appeared)
                    }
                    
                    // Guest photo credit
                    if let photo = currentPhoto, photo.isGuest, let name = photo.uploaderName, !name.isEmpty {
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
                    if allPhotoURLs.count > 1 {
                        VStack {
                            Spacer()
                            HStack {
                                HStack(spacing: 6) {
                                    ForEach(0..<allPhotoURLs.count, id: \.self) { i in
                                        Circle()
                                            .fill(i == (currentPhotoIndex % allPhotoURLs.count) ?
                                                  Color.white : Color.white.opacity(0.4))
                                            .frame(width: 8, height: 8)
                                    }
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Capsule().fill(Color.black.opacity(0.3)))
                                .padding(.leading, 24)
                                .padding(.bottom, screen.isAdopted ? 24 : 70) // Above the spotlight callout
                                
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
                    .frame(width: 5)
                
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
                        
                        // Adoption status badge
                        HStack(spacing: 8) {
                            Text(screen.isAdopted ? "🎉" : "🐱")
                                .font(.system(size: 22))
                            Text(screen.isAdopted ? "Found a Forever Home!" : lookingForText)
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(
                            LinearGradient(
                                colors: screen.isAdopted ?
                                    [Color(hex: "86C5A9"), Color(hex: "5A9E80")] :
                                    [Color(hex: "E8913A"), Color(hex: "D4782A")],
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
                        
                        Spacer().frame(height: 20)
                        
                        // Adoption quote
                        if !screen.isAdopted {
                            Text("\"Scan to meet me, upload photos & adopt!\"")
                                .font(.system(size: 18, weight: .regular, design: .serif))
                                .italic()
                                .foregroundColor(Color(hex: "888888"))
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.55), value: appeared)
                        }
                        
                        Spacer().frame(height: 20)
                        
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
            guard allPhotoURLs.count > 1 else { return }
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
        Canvas { context, size in
            let color = Color(hex: "E8913A")
            // Main pad
            context.fill(
                Ellipse().path(in: CGRect(x: size.width * 0.22, y: size.height * 0.45, width: size.width * 0.56, height: size.height * 0.44)),
                with: .color(color)
            )
            // Top toes
            let toePositions: [(CGFloat, CGFloat, CGFloat)] = [
                (0.22, 0.28, 0.10),
                (0.42, 0.18, 0.10),
                (0.62, 0.28, 0.10),
            ]
            for (x, y, r) in toePositions {
                context.fill(
                    Circle().path(in: CGRect(x: size.width * (x - r), y: size.height * (y - r), width: size.width * r * 2, height: size.height * r * 2)),
                    with: .color(color)
                )
            }
            // Side toes
            context.fill(
                Circle().path(in: CGRect(x: size.width * 0.06, y: size.height * 0.42, width: size.width * 0.16, height: size.height * 0.16)),
                with: .color(color)
            )
            context.fill(
                Circle().path(in: CGRect(x: size.width * 0.78, y: size.height * 0.42, width: size.width * 0.16, height: size.height * 0.16)),
                with: .color(color)
            )
        }
    }
}

// MARK: - Simple Flow Layout for Tags
private struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: ProposedViewSize(width: bounds.width, height: bounds.height), subviews: subviews)
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
        var maxX: CGFloat = 0
        
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxX = max(maxX, x)
        }
        
        return (CGSize(width: maxX, height: y + rowHeight), positions)
    }
}

#if DEBUG
struct AdoptionScreenView_Previews: PreviewProvider {
    static var previews: some View {
        AdoptionScreenView(screen: Screen.sampleScreens[1])
            .environmentObject(APIClient.shared)
    }
}
#endif
