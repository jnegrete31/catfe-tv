//
//  HappyTailsScreenView.swift
//  CatfeTVApp
//
//  Happy Tails screen - cycles through uploaded adoption photos.
//  Uses pre-cached photos from APIClient for instant display.
//  Dynamically adjusts cycling speed to show all photos within the screen duration.
//
import SwiftUI

struct HappyTailsScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var currentIndex = 0
    @State private var appeared = false
    @State private var cycleTimer: Timer? = nil
    
    /// Use cached photos from APIClient (pre-fetched at startup)
    private var photos: [PhotoSubmission] {
        apiClient.cachedHappyTailsPhotos
    }
    
    /// Calculate how many seconds per photo to fit all within the screen duration.
    /// Minimum 3 seconds per photo so they're readable, maximum 8 seconds.
    private var secondsPerPhoto: Double {
        guard photos.count > 1 else { return 8.0 }
        let duration = Double(screen.duration)
        let idealInterval = duration / Double(photos.count)
        return min(max(idealInterval, 3.0), 8.0)
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                if photos.isEmpty {
                    // No uploaded photos - show screen's default image
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
                } else {
                    // Photo gallery - cycle through uploaded happy tails photos
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
                                            .tint(.loungeAmber)
                                    )
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                            
                            // Cat name or submitter
                            Text(photo.catName ?? "by \(photo.submitterName)")
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
                        .rotationEffect(.degrees(2))
                        .id(currentIndex)
                        .transition(.opacity.combined(with: .scale(scale: 0.95)))
                        
                        // Right: Info
                        VStack(alignment: .leading, spacing: 24) {
                            Spacer()
                            
                            ScreenBadge(text: "Happy Tails", color: .loungeAmber, emoji: "🏡")
                            
                            Text("Happy Tails")
                                .font(.system(size: 52, weight: .bold, design: .serif))
                                .foregroundColor(.loungeCream)
                            
                            if let caption = photo.caption, !caption.isEmpty {
                                Text(caption)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.loungeCream.opacity(0.7))
                                    .lineLimit(3)
                            }
                            
                            // Adopted badge
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
                            
                            // Photo counter
                            Text("\(safeIndex + 1) of \(photos.count)")
                                .font(CatfeTypography.caption)
                                .foregroundColor(.loungeCream.opacity(0.5))
                            
                            Spacer()
                            
                            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                                QRCodeView(url: qrURL, size: 140)
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
                QRCodeView(url: qrURL, size: 140)
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
