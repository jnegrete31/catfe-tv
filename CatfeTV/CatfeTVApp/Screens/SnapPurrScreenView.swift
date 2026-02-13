//
//  SnapPurrScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr screen - shows uploaded photo gallery if photos exist,
//  otherwise shows the static "Tag Us" screen.
//  Uses pre-cached photos from APIClient for instant display.
//  Dynamically adjusts cycling speed to show all photos within the screen duration.
//
import SwiftUI

struct SnapPurrScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var currentIndex = 0
    @State private var appeared = false
    @State private var cycleTimer: Timer? = nil
    
    /// Use cached photos from APIClient (pre-fetched at startup)
    private var photos: [PhotoSubmission] {
        apiClient.cachedSnapPurrPhotos
    }
    
    /// Calculate how many seconds per photo to fit all within the screen duration.
    /// Minimum 3 seconds per photo so they're readable, maximum 8 seconds.
    private var secondsPerPhoto: Double {
        guard photos.count > 1 else { return 6.0 }
        let duration = Double(screen.duration)
        let idealInterval = duration / Double(photos.count)
        return min(max(idealInterval, 3.0), 8.0)
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                if photos.isEmpty {
                    // No uploaded photos - show original static screen
                    staticContent(geo: geo)
                } else {
                    // Photo gallery - cycle through uploaded photos
                    galleryContent(geo: geo)
                }
            }
        }
        .onAppear {
            withAnimation { appeared = true }
            // Start at a random photo so it's different each time the screen appears
            currentIndex = photos.isEmpty ? 0 : Int.random(in: 0..<photos.count)
            startCycling()
        }
        .onDisappear {
            cycleTimer?.invalidate()
            cycleTimer = nil
        }
    }
    
    /// Start a timer that cycles through photos at the calculated speed
    private func startCycling() {
        cycleTimer?.invalidate()
        guard photos.count > 1 else { return }
        cycleTimer = Timer.scheduledTimer(withTimeInterval: secondsPerPhoto, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.5)) {
                currentIndex = (currentIndex + 1) % photos.count
            }
        }
    }
    
    // MARK: - Static Content (original design)
    
    @ViewBuilder
    private func staticContent(geo: GeometryProxy) -> some View {
        VStack(spacing: 0) {
            Spacer()
            
            ZStack {
                RoundedRectangle(cornerRadius: 40)
                    .fill(
                        LinearGradient(
                            colors: [Color.loungeWarmOrange, Color.loungeAmber],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(width: 120, height: 120)
                    .shadow(color: Color.loungeWarmOrange.opacity(0.4), radius: 20)
                
                Image(systemName: "camera.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 50, height: 50)
                    .foregroundColor(.white)
            }
            .opacity(appeared ? 1 : 0)
            .scaleEffect(appeared ? 1 : 0.7)
            .animation(.spring(response: 0.6, dampingFraction: 0.7), value: appeared)
            
            Spacer().frame(height: 30)
            
            HStack(spacing: 0) {
                Text("Snap ")
                    .foregroundColor(.loungeWarmOrange)
                Text("& ")
                    .foregroundColor(.loungeCream.opacity(0.7))
                Text("Purr!")
                    .foregroundColor(.loungeMintGreen)
            }
            .font(.system(size: 64, weight: .bold, design: .serif))
            .opacity(appeared ? 1 : 0)
            .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
            
            Spacer().frame(height: 16)
            
            Text(screen.subtitle ?? "Share your best Catfé moments!")
                .font(CatfeTypography.subtitle)
                .foregroundColor(.loungeCream.opacity(0.7))
                .multilineTextAlignment(.center)
                .frame(maxWidth: geo.size.width * 0.6)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
            
            if let body = screen.bodyText {
                Spacer().frame(height: 12)
                Text(body)
                    .font(CatfeTypography.caption)
                    .foregroundColor(.loungeCream.opacity(0.5))
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: geo.size.width * 0.5)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
            }
            
            Spacer()
            
            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                QRCodeView(url: qrURL, size: 180)
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0.85)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.4), value: appeared)
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Gallery Content (uploaded photos)
    
    @ViewBuilder
    private func galleryContent(geo: GeometryProxy) -> some View {
        let safeIndex = min(currentIndex, photos.count - 1)
        let photo = photos[max(0, safeIndex)]
        
        HStack(alignment: .center, spacing: geo.size.width * 0.05) {
            // Left: Polaroid-style photo
            VStack(spacing: 0) {
                CachedAsyncImage(url: URL(string: photo.photoUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geo.size.width * 0.42, height: geo.size.height * 0.65)
                        .clipped()
                } placeholder: {
                    Rectangle()
                        .fill(Color.loungeStone.opacity(0.3))
                        .frame(width: geo.size.width * 0.42, height: geo.size.height * 0.65)
                        .overlay(
                            ProgressView()
                                .tint(.loungeWarmOrange)
                        )
                }
                .clipShape(RoundedRectangle(cornerRadius: 4))
                
                Text(photo.caption ?? "📸 by \(photo.submitterName)")
                    .font(.system(size: 22, weight: .medium, design: .serif))
                    .foregroundColor(Color(hex: "3d3d3d"))
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .padding(.top, 16)
                    .padding(.bottom, 8)
            }
            .padding(20)
            .padding(.bottom, 30)
            .background(Color(hex: "FFFEF9"))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.4), radius: 20, x: 0, y: 10)
            .rotationEffect(.degrees(-1.5))
            .id(currentIndex)
            .transition(.opacity.combined(with: .scale(scale: 0.95)))
            
            // Right: Info
            VStack(alignment: .leading, spacing: 24) {
                Spacer()
                
                ScreenBadge(text: "Snap & Purr", color: .loungeMintGreen, emoji: "📸")
                
                HStack(spacing: 0) {
                    Text("Snap ")
                        .foregroundColor(.loungeWarmOrange)
                    Text("& ")
                        .foregroundColor(.loungeCream.opacity(0.7))
                    Text("Purr")
                        .foregroundColor(.loungeMintGreen)
                }
                .font(.system(size: 48, weight: .bold, design: .serif))
                
                Text(screen.subtitle ?? "Your Catfé Moments")
                    .font(CatfeTypography.subtitle)
                    .foregroundColor(.loungeCream.opacity(0.7))
                
                Text("\(safeIndex + 1) of \(photos.count)")
                    .font(CatfeTypography.caption)
                    .foregroundColor(.loungeCream.opacity(0.5))
                
                Spacer()
                
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    QRCodeView(url: qrURL, size: 150)
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .opacity(appeared ? 1 : 0)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
}
