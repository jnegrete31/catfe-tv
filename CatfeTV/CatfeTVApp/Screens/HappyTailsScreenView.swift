//
//  HappyTailsScreenView.swift
//  CatfeTVApp
//
//  Happy Tails screen - multi-photo scrapbook collage layout.
//  Shows 3 photos per page: one large featured + two smaller stacked.
//  Uses pre-cached photos from APIClient for instant display.
//
import SwiftUI

struct HappyTailsScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var pageIndex = 0
    @State private var appeared = false
    @State private var cycleTimer: Timer? = nil
    
    /// Use cached photos from APIClient (pre-fetched at startup)
    private var photos: [PhotoSubmission] {
        apiClient.cachedHappyTailsPhotos
    }
    
    /// Group photos into pages of 3
    private var pages: [[PhotoSubmission]] {
        guard !photos.isEmpty else { return [] }
        var result: [[PhotoSubmission]] = []
        var i = 0
        while i < photos.count {
            let end = min(i + 3, photos.count)
            result.append(Array(photos[i..<end]))
            i += 3
        }
        return result
    }
    
    /// Calculate seconds per page based on screen duration
    private var secondsPerPage: Double {
        guard pages.count > 1 else { return 12.0 }
        let duration = Double(screen.duration)
        let idealInterval = duration / Double(pages.count)
        return min(max(idealInterval, 6.0), 12.0)
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                if photos.isEmpty {
                    emptyState(geo: geo)
                } else {
                    scrapbookCollage(geo: geo)
                }
            }
        }
        .onAppear {
            withAnimation { appeared = true }
            pageIndex = pages.isEmpty ? 0 : Int.random(in: 0..<pages.count)
            startCycling()
        }
        .onDisappear {
            cycleTimer?.invalidate()
            cycleTimer = nil
        }
    }
    
    // MARK: - Scrapbook Collage Layout
    
    @ViewBuilder
    private func scrapbookCollage(geo: GeometryProxy) -> some View {
        let currentPage = pageIndex < pages.count ? pages[pageIndex] : []
        
        ZStack {
            // Warm scrapbook background accents
            scrapbookDecorations(geo: geo)
            
            VStack(spacing: 0) {
                // Header
                scrapbookHeader
                    .padding(.top, 20)
                
                // Photo collage area
                HStack(alignment: .center, spacing: geo.size.width * 0.03) {
                    // Featured photo (large, left)
                    if let featured = currentPage.first {
                        featuredPhotoCard(photo: featured, geo: geo)
                    }
                    
                    // Side photos (2 smaller, stacked right)
                    if currentPage.count > 1 {
                        VStack(spacing: geo.size.height * 0.03) {
                            ForEach(Array(currentPage.dropFirst().enumerated()), id: \.element.id) { idx, photo in
                                sidePhotoCard(photo: photo, index: idx, geo: geo)
                            }
                            
                            // Fill space if only 2 photos total
                            if currentPage.count == 2 {
                                warmMessage(geo: geo)
                            }
                        }
                    } else {
                        // Only 1 photo on this page
                        VStack(spacing: 20) {
                            warmMessage(geo: geo)
                            
                            // QR code
                            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                                QRCodeView(url: qrURL, size: 120, label: "Share yours!")
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .padding(.horizontal, geo.size.width * 0.04)
                .frame(maxHeight: .infinity)
                
                // Page dots + QR
                HStack {
                    // Page dots
                    if pages.count > 1 {
                        pageDots
                    }
                    
                    Spacer()
                    
                    // QR code (bottom right) - only show if we have side photos
                    if currentPage.count > 1, let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                        HStack(spacing: 12) {
                            QRCodeView(url: qrURL, size: 80, label: nil)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Share yours!")
                                    .font(.system(size: 16, weight: .semibold, design: .serif))
                                    .foregroundColor(Color(hex: "5D4037"))
                                Text("Scan to upload")
                                    .font(.system(size: 13))
                                    .foregroundColor(Color(hex: "A1887F"))
                            }
                        }
                        .padding(12)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.white.opacity(0.9))
                                .shadow(color: Color(hex: "5D4037").opacity(0.15), radius: 8, x: 0, y: 4)
                        )
                    }
                }
                .padding(.horizontal, geo.size.width * 0.04)
                .padding(.bottom, 16)
            }
        }
        .opacity(appeared ? 1 : 0)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
    
    // MARK: - Scrapbook Header
    
    private var scrapbookHeader: some View {
        VStack(spacing: 4) {
            HStack(spacing: 16) {
                Rectangle()
                    .fill(LinearGradient(colors: [.clear, Color(hex: "CD853F"), .clear], startPoint: .leading, endPoint: .trailing))
                    .frame(width: 60, height: 1)
                Text("❤️")
                    .font(.system(size: 28))
                Rectangle()
                    .fill(LinearGradient(colors: [.clear, Color(hex: "CD853F"), .clear], startPoint: .leading, endPoint: .trailing))
                    .frame(width: 60, height: 1)
            }
            
            Text("Happy Tails")
                .font(.system(size: 44, weight: .bold, design: .serif))
                .foregroundColor(Color(hex: "5D4037"))
            
            Text("WHERE ARE THEY NOW")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(Color(hex: "A1887F"))
                .tracking(4)
        }
    }
    
    // MARK: - Featured Photo Card (Large)
    
    @ViewBuilder
    private func featuredPhotoCard(photo: PhotoSubmission, geo: GeometryProxy) -> some View {
        let cardWidth = geo.size.width * 0.42
        let photoHeight = geo.size.height * 0.55
        
        VStack(spacing: 0) {
            // Polaroid frame
            VStack(spacing: 0) {
                ZStack(alignment: .topLeading) {
                    CachedAsyncImage(url: URL(string: photo.photoUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: cardWidth - 24, height: photoHeight)
                            .clipped()
                    } placeholder: {
                        Rectangle()
                            .fill(Color(hex: "FFF8E1").opacity(0.5))
                            .frame(width: cardWidth - 24, height: photoHeight)
                            .overlay(ProgressView().tint(.loungeAmber))
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 3))
                    
                    // Milestone badge
                    if let milestone = photo.milestoneTag, !milestone.isEmpty {
                        Text("✨ \(milestone)")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(
                                Capsule()
                                    .fill(LinearGradient(colors: [Color(hex: "D4A574"), Color(hex: "C4956A")], startPoint: .topLeading, endPoint: .bottomTrailing))
                            )
                            .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
                            .padding(10)
                    }
                }
                
                // Cat name
                VStack(spacing: 2) {
                    catNameView(photo: photo, fontSize: 22)
                }
                .padding(.top, 14)
                .padding(.bottom, 8)
            }
            .padding(12)
            .padding(.bottom, 24)
            .background(Color(hex: "FFFEF9"))
            .cornerRadius(8)
            .shadow(color: Color(hex: "5D4037").opacity(0.25), radius: 20, x: 0, y: 10)
            .rotationEffect(.degrees(-2.5))
            
            // Caption below card
            if let caption = photo.caption, !caption.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\"\(caption)\"")
                        .font(.system(size: 17, weight: .regular, design: .serif))
                        .foregroundColor(Color(hex: "8D6E63"))
                        .italic()
                        .lineLimit(3)
                    
                    Text("— \(photo.submitterName)")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "A1887F"))
                }
                .padding(.top, 12)
                .padding(.horizontal, 8)
            }
        }
        .frame(width: cardWidth)
    }
    
    // MARK: - Side Photo Card (Smaller)
    
    @ViewBuilder
    private func sidePhotoCard(photo: PhotoSubmission, index: Int, geo: GeometryProxy) -> some View {
        let rotation = index == 0 ? 2.0 : -1.5
        let photoWidth = geo.size.width * 0.2
        let photoHeight = geo.size.height * 0.22
        
        HStack(spacing: 0) {
            // Photo in polaroid frame
            VStack(spacing: 0) {
                ZStack(alignment: .topLeading) {
                    CachedAsyncImage(url: URL(string: photo.photoUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: photoWidth, height: photoHeight)
                            .clipped()
                    } placeholder: {
                        Rectangle()
                            .fill(Color(hex: "FFF8E1").opacity(0.5))
                            .frame(width: photoWidth, height: photoHeight)
                            .overlay(ProgressView().tint(.loungeAmber))
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 3))
                    
                    // Milestone badge (smaller)
                    if let milestone = photo.milestoneTag, !milestone.isEmpty {
                        Text("✨ \(milestone)")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(
                                Capsule()
                                    .fill(LinearGradient(colors: [Color(hex: "D4A574"), Color(hex: "C4956A")], startPoint: .topLeading, endPoint: .bottomTrailing))
                            )
                            .padding(6)
                    }
                }
                
                // Cat name
                catNameView(photo: photo, fontSize: 16)
                    .padding(.top, 10)
                    .padding(.bottom, 4)
            }
            .padding(10)
            .padding(.bottom, 16)
            .background(Color(hex: "FFFEF9"))
            .cornerRadius(8)
            .shadow(color: Color(hex: "5D4037").opacity(0.2), radius: 15, x: 0, y: 8)
            .rotationEffect(.degrees(rotation))
            
            // Caption beside photo
            VStack(alignment: .leading, spacing: 6) {
                if let caption = photo.caption, !caption.isEmpty {
                    Text("\"\(caption)\"")
                        .font(.system(size: 14, weight: .regular, design: .serif))
                        .foregroundColor(Color(hex: "8D6E63"))
                        .italic()
                        .lineLimit(3)
                }
                
                Text("— \(photo.submitterName)")
                    .font(.system(size: 12))
                    .foregroundColor(Color(hex: "A1887F"))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 16)
        }
    }
    
    // MARK: - Shared Cat Name View
    
    @ViewBuilder
    private func catNameView(photo: PhotoSubmission, fontSize: CGFloat) -> some View {
        if let catName = photo.catName {
            Text(catName)
                .font(.system(size: fontSize, weight: .semibold, design: .serif))
                .foregroundColor(Color(hex: "5D4037"))
                .lineLimit(1)
            
            if let familyName = photo.familyName, !familyName.isEmpty, familyName.lowercased() != catName.lowercased() {
                Text("now \"\(familyName)\"")
                    .font(.system(size: fontSize * 0.6, weight: .medium))
                    .foregroundColor(Color(hex: "CD853F"))
                    .lineLimit(1)
            }
        } else {
            Text(photo.submitterName)
                .font(.system(size: fontSize, weight: .medium, design: .serif))
                .foregroundColor(Color(hex: "5D4037"))
                .lineLimit(1)
        }
    }
    
    // MARK: - Warm Message (filler when < 3 photos on page)
    
    private func warmMessage(geo: GeometryProxy) -> some View {
        VStack(spacing: 8) {
            Text("More happy tails coming soon...")
                .font(.system(size: 18, weight: .regular, design: .serif))
                .foregroundColor(Color(hex: "A1887F"))
                .italic()
            
            Text("Scan the QR code to share your story!")
                .font(.system(size: 14))
                .foregroundColor(Color(hex: "BCAAA4"))
        }
        .padding(.vertical, 20)
    }
    
    // MARK: - Page Dots
    
    private var pageDots: some View {
        HStack(spacing: 8) {
            Text("❤️").font(.system(size: 14))
            
            ForEach(0..<pages.count, id: \.self) { i in
                RoundedRectangle(cornerRadius: 4)
                    .fill(i == pageIndex ? Color(hex: "CD853F") : Color(hex: "5D4037").opacity(0.2))
                    .frame(width: i == pageIndex ? 24 : 8, height: 8)
                    .animation(.easeInOut(duration: 0.3), value: pageIndex)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(
            Capsule()
                .fill(Color(hex: "5D4037").opacity(0.08))
        )
    }
    
    // MARK: - Scrapbook Decorations
    
    private func scrapbookDecorations(geo: GeometryProxy) -> some View {
        ZStack {
            // Tape strip top-left
            RoundedRectangle(cornerRadius: 2)
                .fill(LinearGradient(colors: [.clear, Color(hex: "FFDAB9").opacity(0.6), .clear], startPoint: .leading, endPoint: .trailing))
                .frame(width: 80, height: 20)
                .rotationEffect(.degrees(-15))
                .position(x: geo.size.width * 0.08, y: 40)
                .opacity(0.3)
            
            // Tape strip top-right
            RoundedRectangle(cornerRadius: 2)
                .fill(LinearGradient(colors: [.clear, Color(hex: "FFB6C1").opacity(0.5), .clear], startPoint: .leading, endPoint: .trailing))
                .frame(width: 60, height: 16)
                .rotationEffect(.degrees(10))
                .position(x: geo.size.width * 0.88, y: 60)
                .opacity(0.25)
            
            // Tape strip bottom-left
            RoundedRectangle(cornerRadius: 2)
                .fill(LinearGradient(colors: [.clear, Color(hex: "CDB499").opacity(0.5), .clear], startPoint: .leading, endPoint: .trailing))
                .frame(width: 56, height: 16)
                .rotationEffect(.degrees(-8))
                .position(x: geo.size.width * 0.12, y: geo.size.height - 80)
                .opacity(0.2)
        }
    }
    
    // MARK: - Empty State
    
    @ViewBuilder
    private func emptyState(geo: GeometryProxy) -> some View {
        HStack(alignment: .center, spacing: geo.size.width * 0.05) {
            if screen.imageURL != nil {
                VStack(spacing: 0) {
                    ScreenImage(url: screen.imageURL)
                        .frame(width: geo.size.width * 0.38, height: geo.size.height * 0.6)
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                    
                    Text(screen.catName ?? "Happy Cat")
                        .font(.system(size: 20, weight: .medium, design: .serif))
                        .foregroundColor(Color(hex: "3d3d3d"))
                        .padding(.top, 16)
                        .padding(.bottom, 8)
                }
                .padding(20)
                .padding(.bottom, 30)
                .background(Color(hex: "FFFEF9"))
                .cornerRadius(12)
                .shadow(color: .black.opacity(0.4), radius: 20, x: 0, y: 10)
                .rotationEffect(.degrees(2))
                .opacity(appeared ? 1 : 0)
                .scaleEffect(appeared ? 1 : 0.85)
                .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
            }
            
            defaultInfoColumn
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .opacity(appeared ? 1 : 0)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
    
    // MARK: - Default Info Column (empty state)
    
    private var defaultInfoColumn: some View {
        VStack(alignment: .leading, spacing: 24) {
            Spacer()
            
            ScreenBadge(text: "Happy Tails", color: .loungeAmber, emoji: "🏡")
            
            Text(screen.title)
                .font(.system(size: 52, weight: .bold, design: .serif))
                .foregroundColor(.loungeCream)
                .lineLimit(3)
            
            if let subtitle = screen.subtitle {
                Text(subtitle)
                    .font(CatfeTypography.subtitle)
                    .foregroundColor(.loungeAmber)
            }
            
            if let body = screen.bodyText {
                Text(body)
                    .font(CatfeTypography.body)
                    .foregroundColor(.loungeCream.opacity(0.7))
                    .lineSpacing(6)
                    .lineLimit(6)
            }
            
            HStack(spacing: 8) {
                Text("❤️").font(.system(size: 20))
                Text("Found their forever home!")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(.loungeMintGreen)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(Color.loungeMintGreen.opacity(0.15))
                    .overlay(Capsule().stroke(Color.loungeMintGreen.opacity(0.3), lineWidth: 1))
            )
            
            Spacer()
            
            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                QRCodeView(url: qrURL, size: 140, label: screen.qrLabel)
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Timer
    
    private func startCycling() {
        cycleTimer?.invalidate()
        guard pages.count > 1 else { return }
        cycleTimer = Timer.scheduledTimer(withTimeInterval: secondsPerPage, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.6)) {
                pageIndex = (pageIndex + 1) % pages.count
            }
        }
    }
}
