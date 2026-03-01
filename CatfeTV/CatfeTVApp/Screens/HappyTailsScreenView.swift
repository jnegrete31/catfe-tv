//
//  HappyTailsScreenView.swift
//  CatfeTVApp
//
//  Happy Tails screen - clean multi-photo grid layout.
//  Shows 3 photos per page: one large featured + two smaller stacked.
//  Photos are edge-to-edge with rounded corners, text overlaid with gradients.
//  Uses pre-cached photos from APIClient for instant display.
//
import SwiftUI

struct HappyTailsScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var pageIndex = 0
    @State private var appeared = false
    @State private var cycleTimer: Timer? = nil
    
    private var photos: [PhotoSubmission] {
        apiClient.cachedHappyTailsPhotos
    }
    
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
                    photoGrid(geo: geo)
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
    
    // MARK: - Photo Grid Layout
    
    @ViewBuilder
    private func photoGrid(geo: GeometryProxy) -> some View {
        let currentPage = pageIndex < pages.count ? pages[pageIndex] : []
        let spacing: CGFloat = 12
        let sidePadding: CGFloat = geo.size.width * 0.03
        let topPadding: CGFloat = 80
        let bottomPadding: CGFloat = 60
        let availableHeight = geo.size.height - topPadding - bottomPadding
        let availableWidth = geo.size.width - (sidePadding * 2)
        
        ZStack {
            VStack(spacing: 0) {
                // Header
                headerView
                    .padding(.top, 16)
                    .frame(height: topPadding)
                
                // Photo grid — .id(pageIndex) forces SwiftUI to rebuild the entire
                // grid when the page changes, ensuring images update (not just text).
                HStack(spacing: spacing) {
                    // Left: Large featured photo
                    if let featured = currentPage.first {
                        photoTile(
                            photo: featured,
                            width: availableWidth * 0.55,
                            height: availableHeight,
                            showCaption: true,
                            fontSize: .large
                        )
                    }
                    
                    // Right: Two smaller photos stacked (or single + message)
                    VStack(spacing: spacing) {
                        if currentPage.count > 1 {
                            let sideHeight = (availableHeight - spacing) / 2
                            
                            ForEach(Array(currentPage.dropFirst().enumerated()), id: \.element.id) { _, photo in
                                photoTile(
                                    photo: photo,
                                    width: availableWidth * 0.45 - spacing,
                                    height: sideHeight,
                                    showCaption: true,
                                    fontSize: .small
                                )
                            }
                            
                            // If only 2 photos, fill remaining space
                            if currentPage.count == 2 {
                                qrCard(height: sideHeight)
                            }
                        } else {
                            // Only 1 photo — show QR and message
                            qrCard(height: availableHeight)
                        }
                    }
                }
                .padding(.horizontal, sidePadding)
                .id(pageIndex)
                .transition(.opacity)
                
                // Bottom bar: page dots + QR
                bottomBar(geo: geo)
                    .frame(height: bottomPadding)
            }
        }
        .opacity(appeared ? 1 : 0)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
    
    // MARK: - Header
    
    private var headerView: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(LinearGradient(colors: [.clear, Color.loungeAmber.opacity(0.6)], startPoint: .leading, endPoint: .trailing))
                .frame(width: 40, height: 1)
            
            Text("❤️")
                .font(.system(size: 22))
            
            Text("Happy Tails")
                .font(.system(size: 32, weight: .bold, design: .serif))
                .foregroundColor(.loungeCream)
            
            Text("·")
                .foregroundColor(.loungeCream.opacity(0.4))
            
            Text("Where Are They Now")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.loungeCream.opacity(0.5))
                .tracking(2)
            
            Rectangle()
                .fill(LinearGradient(colors: [Color.loungeAmber.opacity(0.6), .clear], startPoint: .leading, endPoint: .trailing))
                .frame(width: 40, height: 1)
        }
    }
    
    // MARK: - Photo Tile
    
    enum TileFontSize {
        case large, small
    }
    
    @ViewBuilder
    private func photoTile(photo: PhotoSubmission, width: CGFloat, height: CGFloat, showCaption: Bool, fontSize: TileFontSize) -> some View {
        let nameSize: CGFloat = fontSize == .large ? 26 : 18
        let captionSize: CGFloat = fontSize == .large ? 16 : 13
        let submitterSize: CGFloat = fontSize == .large ? 14 : 11
        let badgeSize: CGFloat = fontSize == .large ? 13 : 11
        let padding: CGFloat = fontSize == .large ? 20 : 14
        
        ZStack(alignment: .bottomLeading) {
            // Photo — fills entire tile, no black bars
            CachedAsyncImage(url: URL(string: photo.photoUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: width, height: height)
                    .clipped()
            } placeholder: {
                Rectangle()
                    .fill(Color.loungeStone.opacity(0.3))
                    .frame(width: width, height: height)
                    .overlay(ProgressView().tint(.loungeAmber))
            }
            
            // Bottom gradient overlay for text
            VStack {
                Spacer()
                LinearGradient(
                    colors: [.clear, Color.black.opacity(0.7)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: height * 0.45)
            }
            
            // Milestone badge (top-left)
            if let milestone = photo.milestoneTag, !milestone.isEmpty {
                VStack {
                    HStack {
                        Text("✨ \(milestone)")
                            .font(.system(size: badgeSize, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(
                                Capsule()
                                    .fill(Color.loungeAmber.opacity(0.85))
                            )
                            .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                            .padding(padding * 0.6)
                        Spacer()
                    }
                    Spacer()
                }
            }
            
            // Text overlay at bottom
            VStack(alignment: .leading, spacing: 4) {
                // Cat name
                if let catName = photo.catName {
                    if let familyName = photo.familyName, !familyName.isEmpty, familyName.lowercased() != catName.lowercased() {
                        Text("\(catName), now \(familyName)")
                            .font(.system(size: nameSize, weight: .bold, design: .serif))
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                            .lineLimit(1)
                    } else {
                        Text(catName)
                            .font(.system(size: nameSize, weight: .bold, design: .serif))
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                            .lineLimit(1)
                    }
                }
                
                // Caption
                if showCaption, let caption = photo.caption, !caption.isEmpty {
                    Text("\"\(caption)\"")
                        .font(.system(size: captionSize, weight: .regular, design: .serif))
                        .foregroundColor(.white.opacity(0.85))
                        .italic()
                        .lineLimit(2)
                        .shadow(color: .black.opacity(0.4), radius: 2, x: 0, y: 1)
                }
                
                // Submitter
                Text("— \(photo.submitterName)")
                    .font(.system(size: submitterSize))
                    .foregroundColor(.white.opacity(0.6))
                    .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
            }
            .padding(padding)
        }
        .frame(width: width, height: height)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    // MARK: - QR Card (fills empty space)
    
    private func qrCard(height: CGFloat) -> some View {
        VStack(spacing: 16) {
            Spacer()
            
            Text("Share your story!")
                .font(.system(size: 20, weight: .semibold, design: .serif))
                .foregroundColor(.loungeCream)
            
            Text("Adopted from Catfé? Upload a photo of your cat in their forever home.")
                .font(.system(size: 14))
                .foregroundColor(.loungeCream.opacity(0.6))
                .multilineTextAlignment(.center)
                .lineLimit(3)
                .padding(.horizontal, 20)
            
            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                QRCodeView(url: qrURL, size: 100, label: "Scan to upload")
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.loungeCream.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.loungeCream.opacity(0.1), lineWidth: 1)
                )
        )
    }
    
    // MARK: - Bottom Bar
    
    private func bottomBar(geo: GeometryProxy) -> some View {
        HStack {
            // Page dots
            if pages.count > 1 {
                HStack(spacing: 6) {
                    ForEach(0..<pages.count, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 3)
                            .fill(i == pageIndex ? Color.loungeAmber : Color.loungeCream.opacity(0.2))
                            .frame(width: i == pageIndex ? 20 : 6, height: 6)
                            .animation(.easeInOut(duration: 0.3), value: pageIndex)
                    }
                }
            }
            
            Spacer()
            
            // Photo count
            Text("\(pageIndex + 1) of \(pages.count)")
                .font(.system(size: 13))
                .foregroundColor(.loungeCream.opacity(0.4))
        }
        .padding(.horizontal, geo.size.width * 0.03)
    }
    
    // MARK: - Empty State
    
    @ViewBuilder
    private func emptyState(geo: GeometryProxy) -> some View {
        HStack(alignment: .center, spacing: geo.size.width * 0.05) {
            if screen.imageURL != nil {
                VStack(spacing: 0) {
                    ScreenImage(url: screen.imageURL)
                        .frame(width: geo.size.width * 0.38, height: geo.size.height * 0.6)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    
                    Text(screen.catName ?? "Happy Cat")
                        .font(.system(size: 20, weight: .medium, design: .serif))
                        .foregroundColor(.loungeCream)
                        .padding(.top, 16)
                }
                .opacity(appeared ? 1 : 0)
                .scaleEffect(appeared ? 1 : 0.9)
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
