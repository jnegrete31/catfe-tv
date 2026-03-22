//
//  HappyTailsScreenView.swift
//  CatfeTVApp
//
//  Happy Tails screen - premium dark theme matching adoption grid & membership.
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
    
    // MARK: - Theme Colors
    private let bgColor = Color(hex: "1C1410")
    private let creamColor = Color(hex: "F5E6D3")
    private let copperColor = Color(hex: "C4956A")
    private let bronzeColor = Color(hex: "B87333")
    private let goldColor = Color(hex: "D4A574")
    private let cardBgColor = Color(hex: "261E16")
    private let cardBgDark = Color(hex: "1E1610")
    
    var body: some View {
        ZStack {
            // Dark premium background
            bgColor.ignoresSafeArea()
            
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
                        colors: [copperColor.opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.15, y: geo.size.height * 0.8)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [bronzeColor.opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.85, y: geo.size.height * 0.8)
            }
            
            // Top accent line
            VStack {
                LinearGradient(
                    colors: [.clear, copperColor, bronzeColor, goldColor, .clear],
                    startPoint: .leading, endPoint: .trailing
                )
                .frame(height: 2)
                Spacer()
            }
            .ignoresSafeArea()
            
            // Content
            GeometryReader { geo in
                if photos.isEmpty {
                    emptyState(geo: geo)
                } else {
                    VStack(spacing: 0) {
                        // Header
                        headerView
                            .padding(.top, 40)
                            .frame(height: 100)
                        
                        // Photo grid
                        photoGrid(geo: geo)
                        
                        // Bottom bar
                        bottomBar(geo: geo)
                            .frame(height: 50)
                            .padding(.bottom, 16)
                    }
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
            pageIndex = pages.isEmpty ? 0 : Int.random(in: 0..<pages.count)
            startCycling()
        }
        .onDisappear {
            cycleTimer?.invalidate()
            cycleTimer = nil
        }
        .onReceive(NotificationCenter.default.publisher(for: .remoteSwipeUp)) { _ in
            guard pages.count > 1 else { return }
            withAnimation(.easeInOut(duration: 0.5)) {
                pageIndex = pageIndex > 0 ? pageIndex - 1 : pages.count - 1
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .remoteSwipeDown)) { _ in
            guard pages.count > 1 else { return }
            withAnimation(.easeInOut(duration: 0.5)) {
                pageIndex = (pageIndex + 1) % pages.count
            }
        }
    }
    
    // MARK: - Header (Premium Style)
    
    private var headerView: some View {
        VStack(spacing: 6) {
            Text("WHERE ARE THEY NOW")
                .font(.system(size: 14, weight: .medium, design: .serif))
                .tracking(6)
                .foregroundColor(copperColor)
            
            Text("❤️  Happy Tails")
                .font(.system(size: 40, weight: .bold, design: .serif))
                .foregroundColor(creamColor)
            
            // Decorative divider
            HStack(spacing: 12) {
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [.clear, copperColor],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
                    .frame(width: 50, height: 1)
                Text("✦")
                    .font(.system(size: 10))
                    .foregroundColor(copperColor)
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [copperColor, .clear],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
                    .frame(width: 50, height: 1)
            }
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -20)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
    
    // MARK: - Photo Grid Layout
    
    @ViewBuilder
    private func photoGrid(geo: GeometryProxy) -> some View {
        let currentPage = pageIndex < pages.count ? pages[pageIndex] : []
        let spacing: CGFloat = 16
        let sidePadding: CGFloat = 60.0
        let availableHeight = geo.size.height - 166 // header + bottom bar
        let availableWidth = geo.size.width - (sidePadding * 2)
        
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
            
            // Right: Two smaller photos stacked (or single + QR)
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
        .opacity(appeared ? 1 : 0)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
    
    // MARK: - Photo Tile
    
    enum TileFontSize {
        case large, small
    }
    
    @ViewBuilder
    private func photoTile(photo: PhotoSubmission, width: CGFloat, height: CGFloat, showCaption: Bool, fontSize: TileFontSize) -> some View {
        let nameSize: CGFloat = fontSize == .large ? 28 : 20
        let captionSize: CGFloat = fontSize == .large ? 17 : 14
        let submitterSize: CGFloat = fontSize == .large ? 14 : 11
        let badgeSize: CGFloat = fontSize == .large ? 13 : 11
        let padding: CGFloat = fontSize == .large ? 22 : 16
        
        ZStack(alignment: .bottomLeading) {
            // Photo — fills entire tile
            CachedAsyncImage(url: URL(string: photo.photoUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: width, height: height)
                    .clipped()
            } placeholder: {
                Rectangle()
                    .fill(cardBgColor)
                    .frame(width: width, height: height)
                    .overlay(ProgressView().tint(copperColor))
            }
            
            // Bottom gradient overlay for text
            VStack {
                Spacer()
                LinearGradient(
                    colors: [.clear, Color.black.opacity(0.75)],
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
                            .font(.system(size: badgeSize, weight: .semibold, design: .serif))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(
                                Capsule()
                                    .fill(
                                        LinearGradient(
                                            colors: [copperColor, bronzeColor],
                                            startPoint: .leading, endPoint: .trailing
                                        )
                                    )
                            )
                            .shadow(color: .black.opacity(0.4), radius: 4, x: 0, y: 2)
                            .padding(padding * 0.6)
                        Spacer()
                    }
                    Spacer()
                }
            }
            
            // Text overlay at bottom
            VStack(alignment: .leading, spacing: 5) {
                // Cat name
                if let catName = photo.catName {
                    if let familyName = photo.familyName, !familyName.isEmpty, familyName.lowercased() != catName.lowercased() {
                        Text("\(catName), now \(familyName)")
                            .font(.system(size: nameSize, weight: .bold, design: .serif))
                            .foregroundColor(creamColor)
                            .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                            .lineLimit(1)
                    } else {
                        Text(catName)
                            .font(.system(size: nameSize, weight: .bold, design: .serif))
                            .foregroundColor(creamColor)
                            .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                            .lineLimit(1)
                    }
                }
                
                // Mini flourish under name
                HStack(spacing: 6) {
                    Rectangle()
                        .fill(copperColor.opacity(0.5))
                        .frame(width: 16, height: 1)
                    Text("✦")
                        .font(.system(size: 6))
                        .foregroundColor(copperColor.opacity(0.7))
                    Rectangle()
                        .fill(copperColor.opacity(0.5))
                        .frame(width: 16, height: 1)
                }
                
                // Caption
                if showCaption, let caption = photo.caption, !caption.isEmpty {
                    Text("\"\(caption)\"")
                        .font(.system(size: captionSize, weight: .regular, design: .serif))
                        .foregroundColor(creamColor.opacity(0.85))
                        .italic()
                        .lineLimit(2)
                        .shadow(color: .black.opacity(0.4), radius: 2, x: 0, y: 1)
                }
                
                // Submitter
                Text("— \(photo.submitterName)")
                    .font(.system(size: submitterSize, design: .serif))
                    .foregroundColor(copperColor.opacity(0.7))
                    .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
            }
            .padding(padding)
        }
        .frame(width: width, height: height)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(copperColor.opacity(0.2), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 6)
    }
    
    // MARK: - QR Card (fills empty space)
    
    private func qrCard(height: CGFloat) -> some View {
        VStack(spacing: 16) {
            Spacer()
            
            Text("Share Your Story")
                .font(.system(size: 22, weight: .bold, design: .serif))
                .foregroundColor(creamColor)
            
            // Mini flourish
            HStack(spacing: 8) {
                Rectangle()
                    .fill(copperColor.opacity(0.4))
                    .frame(width: 24, height: 1)
                Text("✦")
                    .font(.system(size: 8))
                    .foregroundColor(copperColor)
                Rectangle()
                    .fill(copperColor.opacity(0.4))
                    .frame(width: 24, height: 1)
            }
            
            Text("Adopted from Catfé?\nUpload a photo of your cat\nin their forever home.")
                .font(.system(size: 15, weight: .regular, design: .serif))
                .foregroundColor(creamColor.opacity(0.5))
                .multilineTextAlignment(.center)
                .lineLimit(4)
                .padding(.horizontal, 20)
            
            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                QRCodeView(url: qrURL, size: 100, label: "Scan to upload")
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [cardBgColor, cardBgDark],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(copperColor.opacity(0.15), lineWidth: 1)
        )
    }
    
    // MARK: - Bottom Bar
    
    private func bottomBar(geo: GeometryProxy) -> some View {
        HStack {
            // Page dots
            if pages.count > 1 {
                HStack(spacing: 8) {
                    ForEach(0..<pages.count, id: \.self) { i in
                        Circle()
                            .fill(i == pageIndex ? copperColor : creamColor.opacity(0.2))
                            .frame(width: i == pageIndex ? 10 : 8, height: i == pageIndex ? 10 : 8)
                            .animation(.easeInOut(duration: 0.3), value: pageIndex)
                    }
                }
            }
            
            Spacer()
            
            // Photo count
            Text("\(pageIndex + 1) of \(pages.count)")
                .font(.system(size: 14, weight: .medium, design: .serif))
                .foregroundColor(creamColor.opacity(0.4))
        }
        .padding(.horizontal, 60)
    }
    
    // MARK: - Empty State
    
    @ViewBuilder
    private func emptyState(geo: GeometryProxy) -> some View {
        VStack(spacing: 0) {
            // Header for empty state
            VStack(spacing: 8) {
                Text("WHERE ARE THEY NOW")
                    .font(.system(size: 14, weight: .medium, design: .serif))
                    .tracking(6)
                    .foregroundColor(copperColor)
                
                Text("❤️  Happy Tails")
                    .font(.system(size: 40, weight: .bold, design: .serif))
                    .foregroundColor(creamColor)
                
                HStack(spacing: 12) {
                    Rectangle()
                        .fill(LinearGradient(colors: [.clear, copperColor], startPoint: .leading, endPoint: .trailing))
                        .frame(width: 50, height: 1)
                    Text("✦")
                        .font(.system(size: 10))
                        .foregroundColor(copperColor)
                    Rectangle()
                        .fill(LinearGradient(colors: [copperColor, .clear], startPoint: .leading, endPoint: .trailing))
                        .frame(width: 50, height: 1)
                }
            }
            .padding(.top, 50)
            
            Spacer()
            
            HStack(alignment: .center, spacing: geo.size.width * 0.05) {
                if screen.imageURL != nil {
                    VStack(spacing: 0) {
                        ScreenImage(url: screen.imageURL)
                            .frame(width: geo.size.width * 0.38, height: geo.size.height * 0.5)
                            .clipShape(RoundedRectangle(cornerRadius: 20))
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(copperColor.opacity(0.2), lineWidth: 1)
                            )
                            .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 6)
                        
                        Text(screen.catName ?? "Happy Cat")
                            .font(.system(size: 22, weight: .bold, design: .serif))
                            .foregroundColor(creamColor)
                            .padding(.top, 16)
                    }
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0.9)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                }
                
                defaultInfoColumn
            }
            .frame(maxWidth: .infinity)
            
            Spacer()
        }
        .opacity(appeared ? 1 : 0)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
    
    // MARK: - Default Info Column (empty state)
    
    private var defaultInfoColumn: some View {
        VStack(alignment: .leading, spacing: 24) {
            Spacer()
            
            // Badge
            HStack(spacing: 8) {
                Text("🏡")
                    .font(.system(size: 16))
                Text("Happy Tails")
                    .font(.system(size: 16, weight: .semibold, design: .serif))
                    .foregroundColor(creamColor)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(copperColor.opacity(0.2))
                    .overlay(Capsule().stroke(copperColor.opacity(0.3), lineWidth: 1))
            )
            
            Text(screen.title)
                .font(.system(size: 48, weight: .bold, design: .serif))
                .foregroundColor(creamColor)
                .lineLimit(3)
            
            if let subtitle = screen.subtitle {
                Text(subtitle)
                    .font(.system(size: 22, weight: .medium, design: .serif))
                    .foregroundColor(copperColor)
            }
            
            if let body = screen.bodyText {
                Text(body)
                    .font(.system(size: 18, weight: .regular, design: .serif))
                    .foregroundColor(creamColor.opacity(0.6))
                    .lineSpacing(6)
                    .lineLimit(6)
            }
            
            HStack(spacing: 8) {
                Text("❤️").font(.system(size: 20))
                Text("Found their forever home!")
                    .font(.system(size: 20, weight: .medium, design: .serif))
                    .foregroundColor(Color(hex: "86EFAC"))
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(Color(hex: "86EFAC").opacity(0.1))
                    .overlay(Capsule().stroke(Color(hex: "86EFAC").opacity(0.2), lineWidth: 1))
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
