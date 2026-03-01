//
//  SnapPurrGalleryScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr Gallery — Magazine Split design with multi-photo grid.
//  Left panel: title, photo count, QR code on cream background.
//  Right panel: 3x2 grid of guest photos on dark background, paginating every 8s.
//
import SwiftUI

struct SnapPurrGalleryScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var page = 0
    @State private var appeared = false
    @State private var cycleTimer: Timer? = nil
    
    private let photosPerPage = 6
    
    private var photos: [PhotoSubmission] {
        apiClient.cachedSnapPurrPhotos
    }
    
    private var totalPages: Int {
        guard !photos.isEmpty else { return 0 }
        return max(1, Int(ceil(Double(photos.count) / Double(photosPerPage))))
    }
    
    private var currentPhotos: [PhotoSubmission] {
        guard !photos.isEmpty else { return [] }
        let start = (page % max(1, totalPages)) * photosPerPage
        var result: [PhotoSubmission] = []
        for i in 0..<photosPerPage {
            let idx = (start + i) % photos.count
            if result.count < photos.count {
                result.append(photos[idx])
            }
        }
        return result
    }
    
    var body: some View {
        GeometryReader { geo in
            HStack(spacing: 0) {
                // LEFT PANEL — Cream info panel
                leftPanel(geo: geo)
                    .frame(width: geo.size.width * 0.30)
                
                // Orange accent divider
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [Color(hex: "E8913A"), Color(hex: "D4782A")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(width: 6)
                
                // RIGHT PANEL — Photo grid
                rightPanel(geo: geo)
                    .frame(maxWidth: .infinity)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
            startCycling()
        }
        .onDisappear {
            cycleTimer?.invalidate()
            cycleTimer = nil
        }
    }
    
    // MARK: - Left Panel
    
    @ViewBuilder
    private func leftPanel(geo: GeometryProxy) -> some View {
        ZStack {
            Color(hex: "FAFAF5")
            
            // Subtle paw watermark
            VStack {
                HStack {
                    Spacer()
                    PawPrintWatermark()
                        .frame(width: 100, height: 100)
                        .opacity(0.04)
                        .padding(.top, 60)
                        .padding(.trailing, 30)
                }
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 0) {
                Spacer().frame(height: 60)
                
                // Badge
                Text("COMMUNITY GALLERY")
                    .font(.system(size: 14, weight: .heavy))
                    .tracking(2)
                    .foregroundColor(Color(hex: "E8913A"))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(Color(hex: "E8913A").opacity(0.12))
                    .clipShape(Capsule())
                
                Spacer().frame(height: 16)
                
                // Title
                HStack(spacing: 0) {
                    Text("Snap")
                        .foregroundColor(Color(hex: "E8913A"))
                    Text(" & ")
                        .foregroundColor(Color(hex: "AAAAAA"))
                    Text("Purr")
                        .foregroundColor(Color(hex: "86C5A9"))
                }
                .font(.system(size: 52, weight: .black, design: .serif))
                
                Spacer().frame(height: 12)
                
                Text("Photos shared by our amazing guests during their visit")
                    .font(.system(size: 20, weight: .regular))
                    .foregroundColor(Color(hex: "8a8a7a"))
                    .lineLimit(3)
                
                Spacer().frame(height: 28)
                
                // Photo count
                HStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(Color(hex: "E8913A").opacity(0.12))
                            .frame(width: 44, height: 44)
                        Text("\u{1F4F8}")
                            .font(.system(size: 20))
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(photos.count)")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(Color(hex: "2d2d2d"))
                        Text("memories shared")
                            .font(.system(size: 13))
                            .foregroundColor(Color(hex: "8a8a7a"))
                    }
                }
                
                Spacer()
                
                // QR Code card
                qrCodeCard()
                
                Spacer().frame(height: 40)
            }
            .padding(.horizontal, 36)
        }
    }
    
    // MARK: - QR Code Card
    
    @ViewBuilder
    private func qrCodeCard() -> some View {
        let qrURL = screen.qrCodeURL ?? "https://www.catfetv.com/vote/cats"
        
        HStack(spacing: 16) {
            // QR Code
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white)
                    .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
                
                if let qrImage = QRCodeGenerator.generate(from: qrURL, size: CGSize(width: 200, height: 200)) {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .frame(width: 80, height: 80)
                } else {
                    ProgressView()
                        .tint(Color(hex: "E8913A"))
                }
            }
            .frame(width: 96, height: 96)
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Share Your Photos")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color(hex: "2d2d2d"))
                Text("Scan to upload & spotlight")
                    .font(.system(size: 13))
                    .foregroundColor(Color(hex: "8a8a7a"))
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.06), radius: 12, x: 0, y: 4)
        )
    }
    
    // MARK: - Right Panel
    
    @ViewBuilder
    private func rightPanel(geo: GeometryProxy) -> some View {
        ZStack {
            Color(hex: "1a1a1a")
            
            // Subtle warm glow
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color(hex: "E8913A").opacity(0.15), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 200
                    )
                )
                .frame(width: 400, height: 400)
                .offset(x: -50, y: -150)
            
            if photos.isEmpty {
                emptyState()
            } else {
                photoGrid(geo: geo)
            }
        }
    }
    
    // MARK: - Empty State
    
    @ViewBuilder
    private func emptyState() -> some View {
        VStack(spacing: 16) {
            Text("\u{1F4F7}")
                .font(.system(size: 70))
                .opacity(0.4)
            Text("No photos yet")
                .font(.system(size: 28, weight: .bold, design: .serif))
                .foregroundColor(.white.opacity(0.4))
            Text("Be the first to share!")
                .font(.system(size: 16))
                .foregroundColor(.white.opacity(0.3))
        }
    }
    
    // MARK: - Photo Grid
    
    @ViewBuilder
    private func photoGrid(geo: GeometryProxy) -> some View {
        let gridWidth = geo.size.width * 0.70 - 6  // Right panel width minus divider
        let spacing: CGFloat = 14
        let cols = 3
        let rows = 2
        let cellWidth = (gridWidth - CGFloat(cols + 1) * spacing - 40) / CGFloat(cols)
        let cellHeight = (geo.size.height - CGFloat(rows + 1) * spacing - 60) / CGFloat(rows)
        
        VStack(spacing: 0) {
            Spacer().frame(height: 20)
            
            // .id(page) forces SwiftUI to rebuild the entire grid when the
            // page changes, ensuring images update along with captions.
            VStack(spacing: spacing) {
                ForEach(0..<rows, id: \.self) { row in
                    HStack(spacing: spacing) {
                        ForEach(0..<cols, id: \.self) { col in
                            let idx = row * cols + col
                            if idx < currentPhotos.count {
                                photoCell(photo: currentPhotos[idx], width: cellWidth, height: cellHeight)
                            } else {
                                emptyCell(width: cellWidth, height: cellHeight)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .id(page)
            .transition(.opacity)
            
            Spacer().frame(height: 8)
            
            // Page indicator dots
            if totalPages > 1 {
                HStack(spacing: 8) {
                    ForEach(0..<min(totalPages, 8), id: \.self) { i in
                        let isActive = i == (page % min(totalPages, 8))
                        RoundedRectangle(cornerRadius: 4)
                            .fill(isActive ? Color(hex: "E8913A") : Color.white.opacity(0.3))
                            .frame(width: isActive ? 24 : 8, height: 8)
                            .animation(.easeInOut(duration: 0.3), value: page)
                    }
                }
                .padding(.bottom, 16)
            }
        }
        .opacity(appeared ? 1 : 0)
    }
    
    // MARK: - Photo Cell
    
    @ViewBuilder
    private func photoCell(photo: PhotoSubmission, width: CGFloat, height: CGFloat) -> some View {
        ZStack(alignment: .bottom) {
            // Photo
            CachedAsyncImage(url: URL(string: photo.photoUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: width, height: height)
                    .clipped()
            } placeholder: {
                Rectangle()
                    .fill(Color.white.opacity(0.05))
                    .frame(width: width, height: height)
                    .overlay(
                        ProgressView()
                            .tint(Color(hex: "E8913A"))
                    )
            }
            
            // Bottom gradient overlay
            LinearGradient(
                colors: [.clear, .black.opacity(0.7)],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: height * 0.35)
            
            // Photo info
            VStack(alignment: .leading, spacing: 2) {
                if let caption = photo.caption, !caption.isEmpty {
                    Text("\"\(caption)\"")
                        .font(.system(size: 15, weight: .medium, design: .serif))
                        .italic()
                        .foregroundColor(.white)
                        .lineLimit(1)
                }
                Text("by \(photo.submitterName)")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.6))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 12)
            .padding(.bottom, 10)
        }
        .frame(width: width, height: height)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    // MARK: - Empty Cell
    
    @ViewBuilder
    private func emptyCell(width: CGFloat, height: CGFloat) -> some View {
        RoundedRectangle(cornerRadius: 16)
            .strokeBorder(Color.white.opacity(0.1), style: StrokeStyle(lineWidth: 2, dash: [8, 6]))
            .frame(width: width, height: height)
            .overlay(
                VStack(spacing: 6) {
                    Text("\u{1F4F7}")
                        .font(.system(size: 28))
                    Text("Your photo here")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.2))
                }
            )
    }
    
    // MARK: - Cycling
    
    private func startCycling() {
        cycleTimer?.invalidate()
        guard photos.count > photosPerPage else { return }
        cycleTimer = Timer.scheduledTimer(withTimeInterval: 8.0, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.5)) {
                page += 1
            }
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
                (0.62, 0.18, 0.10),
                (0.78, 0.28, 0.10),
            ]
            for (x, y, r) in toePositions {
                context.fill(
                    Circle().path(in: CGRect(
                        x: size.width * x - size.width * r,
                        y: size.height * y - size.height * r,
                        width: size.width * r * 2,
                        height: size.height * r * 2
                    )),
                    with: .color(color)
                )
            }
        }
    }
}
