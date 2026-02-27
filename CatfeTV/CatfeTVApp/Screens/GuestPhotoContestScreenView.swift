//
//  GuestPhotoContestScreenView.swift
//  CatfeTVApp
//
//  Guest Photo Contest screen - shows top voted guest photos in a
//  polaroid-style rotating display with leaderboard sidebar.
//  Uses pre-cached photos from APIClient for instant display.
//
import SwiftUI

struct GuestPhotoContestScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var currentIndex = 0
    @State private var appeared = false
    @State private var cycleTimer: Timer? = nil
    
    /// Use cached top guest photos from APIClient
    private var photos: [GuestCatPhoto] {
        apiClient.cachedTopGuestPhotos
    }
    
    /// Cycle every 5 seconds through photos
    private var secondsPerPhoto: Double {
        guard photos.count > 1 else { return 8.0 }
        let duration = Double(screen.duration)
        let idealInterval = duration / Double(photos.count)
        return min(max(idealInterval, 4.0), 8.0)
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                ZStack {
                    // Background gradient
                    LinearGradient(
                        colors: [
                            Color(hex: "2d2d2d"),
                            Color(hex: "1a1a1a")
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    
                    // Warm amber glow accents
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "DAA520").opacity(0.25), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.3
                            )
                        )
                        .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                        .position(x: geo.size.width * 0.25, y: geo.size.height * 0.15)
                    
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "E8913A").opacity(0.2), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.3
                            )
                        )
                        .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                        .position(x: geo.size.width * 0.75, y: geo.size.height * 0.85)
                    
                    if photos.isEmpty {
                        // Empty state
                        emptyState(geo: geo)
                    } else {
                        // Main content
                        VStack(spacing: 0) {
                            // Header
                            headerView(geo: geo)
                                .padding(.top, geo.size.height * 0.03)
                            
                            Spacer()
                            
                            // Photo + Leaderboard
                            HStack(alignment: .center, spacing: geo.size.width * 0.04) {
                                // Featured photo - polaroid style
                                featuredPhoto(geo: geo)
                                
                                // Side info
                                leaderboardSidebar(geo: geo)
                            }
                            .padding(.horizontal, geo.size.width * 0.06)
                            
                            Spacer()
                            
                            // Bottom bar with dots and photo count
                            bottomBar(geo: geo)
                                .padding(.bottom, geo.size.height * 0.04)
                        }
                    }
                }
            }
        }
        .onAppear {
            withAnimation(.easeIn(duration: 0.5)) {
                appeared = true
            }
            startCycling()
        }
        .onDisappear {
            cycleTimer?.invalidate()
            cycleTimer = nil
        }
    }
    
    // MARK: - Header
    
    private func headerView(geo: GeometryProxy) -> some View {
        VStack(spacing: geo.size.height * 0.008) {
            HStack(spacing: 8) {
                Text("Guest")
                    .foregroundColor(Color(hex: "E8913A"))
                Text("Photo")
                    .foregroundColor(.white.opacity(0.9))
                Text("Contest")
                    .foregroundColor(Color(hex: "86C5A9"))
            }
            .font(.system(size: geo.size.height * 0.06, weight: .bold, design: .serif))
            
            Text("VOTE FOR YOUR FAVORITES!")
                .font(.system(size: geo.size.height * 0.022, weight: .medium))
                .tracking(4)
                .foregroundColor(.white.opacity(0.45))
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -20)
    }
    
    // MARK: - Featured Photo (Polaroid)
    
    private func featuredPhoto(geo: GeometryProxy) -> some View {
        let photoSize = min(geo.size.width * 0.32, geo.size.height * 0.55)
        let currentPhoto = photos.indices.contains(currentIndex) ? photos[currentIndex] : nil
        
        return VStack {
            if let photo = currentPhoto {
                ZStack(alignment: .topLeading) {
                    // Polaroid frame
                    VStack(spacing: 0) {
                        // Photo
                        AsyncImage(url: URL(string: photo.photoUrl)) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(width: photoSize, height: photoSize)
                                    .clipped()
                            case .failure:
                                Rectangle()
                                    .fill(Color.gray.opacity(0.3))
                                    .frame(width: photoSize, height: photoSize)
                                    .overlay(
                                        Image(systemName: "photo")
                                            .font(.system(size: 40))
                                            .foregroundColor(.gray)
                                    )
                            default:
                                Rectangle()
                                    .fill(Color.gray.opacity(0.2))
                                    .frame(width: photoSize, height: photoSize)
                                    .overlay(
                                        ProgressView()
                                            .tint(.white)
                                    )
                            }
                        }
                        .cornerRadius(6)
                        
                        // Caption area
                        VStack(spacing: 4) {
                            Text(photo.catName ?? "Guest Photo")
                                .font(.system(size: geo.size.height * 0.028, weight: .medium, design: .serif))
                                .foregroundColor(Color(hex: "3d3d3d"))
                                .lineLimit(1)
                            
                            if let uploader = photo.uploaderName {
                                Text("by \(uploader)")
                                    .font(.system(size: geo.size.height * 0.016))
                                    .foregroundColor(Color(hex: "999999"))
                                    .lineLimit(1)
                            }
                        }
                        .padding(.vertical, geo.size.height * 0.02)
                    }
                    .padding(geo.size.height * 0.02)
                    .padding(.bottom, geo.size.height * 0.01)
                    .background(Color(hex: "FFFEF9"))
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.5), radius: 30, x: 0, y: 15)
                    .rotationEffect(.degrees(-2))
                    
                    // Rank badge
                    rankBadge(index: currentIndex, size: geo.size.height * 0.06)
                        .offset(x: geo.size.height * 0.015, y: geo.size.height * 0.015)
                }
                .transition(.asymmetric(
                    insertion: .opacity.combined(with: .scale(scale: 0.85)),
                    removal: .opacity
                ))
                .id(currentIndex)
                .animation(.spring(response: 0.6, dampingFraction: 0.8), value: currentIndex)
            }
        }
    }
    
    // MARK: - Leaderboard Sidebar
    
    private func leaderboardSidebar(geo: GeometryProxy) -> some View {
        let currentPhoto = photos.indices.contains(currentIndex) ? photos[currentIndex] : nil
        
        return VStack(alignment: .leading, spacing: geo.size.height * 0.02) {
            // Vote count for current photo
            if let photo = currentPhoto {
                HStack(spacing: 10) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: geo.size.height * 0.03))
                        .foregroundColor(Color(hex: "E8913A"))
                    Text("\(photo.voteCount) vote\(photo.voteCount != 1 ? "s" : "")")
                        .font(.system(size: geo.size.height * 0.028, weight: .medium))
                        .tracking(1)
                        .foregroundColor(Color(hex: "E8913A"))
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(Color(hex: "E8913A").opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 30)
                        .stroke(Color(hex: "E8913A"), lineWidth: 2)
                )
                .cornerRadius(30)
            }
            
            // Caption
            if let caption = currentPhoto?.caption, !caption.isEmpty {
                Text("\"\(caption)\"")
                    .font(.system(size: geo.size.height * 0.026, weight: .light, design: .serif))
                    .italic()
                    .foregroundColor(.white.opacity(0.75))
                    .lineLimit(3)
                    .padding(.vertical, 4)
            }
            
            // Leaderboard
            VStack(alignment: .leading, spacing: geo.size.height * 0.008) {
                Text("TOP PHOTOS")
                    .font(.system(size: geo.size.height * 0.016, weight: .medium))
                    .tracking(3)
                    .foregroundColor(.white.opacity(0.4))
                    .padding(.bottom, 4)
                
                ForEach(Array(photos.prefix(5).enumerated()), id: \.element.id) { idx, photo in
                    HStack(spacing: 10) {
                        // Rank
                        rankBadge(index: idx, size: geo.size.height * 0.035)
                        
                        // Thumbnail
                        AsyncImage(url: URL(string: photo.photoUrl)) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(width: geo.size.height * 0.045, height: geo.size.height * 0.045)
                                    .clipped()
                                    .cornerRadius(6)
                            default:
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color.white.opacity(0.1))
                                    .frame(width: geo.size.height * 0.045, height: geo.size.height * 0.045)
                            }
                        }
                        
                        // Info
                        VStack(alignment: .leading, spacing: 2) {
                            Text(photo.catName ?? "Photo")
                                .font(.system(size: geo.size.height * 0.018))
                                .foregroundColor(.white.opacity(0.8))
                                .lineLimit(1)
                            
                            if let uploader = photo.uploaderName {
                                Text("by \(uploader)")
                                    .font(.system(size: geo.size.height * 0.013))
                                    .foregroundColor(.white.opacity(0.4))
                                    .lineLimit(1)
                            }
                        }
                        
                        Spacer()
                        
                        // Vote count
                        HStack(spacing: 4) {
                            Text("\(photo.voteCount)")
                                .font(.system(size: geo.size.height * 0.016))
                                .foregroundColor(.white.opacity(0.6))
                            Image(systemName: "heart.fill")
                                .font(.system(size: geo.size.height * 0.012))
                                .foregroundColor(.white.opacity(0.4))
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(idx == currentIndex ? Color.white.opacity(0.12) : Color.white.opacity(0.04))
                    )
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Bottom Bar
    
    private func bottomBar(geo: GeometryProxy) -> some View {
        HStack {
            // Photo count
            HStack(spacing: 8) {
                Image(systemName: "camera.fill")
                    .font(.system(size: geo.size.height * 0.022))
                    .foregroundColor(.white.opacity(0.7))
                Text("\(photos.count) photo\(photos.count != 1 ? "s" : "") submitted")
                    .font(.system(size: geo.size.height * 0.018))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.white.opacity(0.08))
            .cornerRadius(20)
            
            Spacer()
            
            // Dots indicator
            if photos.count > 1 {
                HStack(spacing: 6) {
                    ForEach(0..<min(photos.count, 12), id: \.self) { idx in
                        Circle()
                            .fill(idx == currentIndex ? Color(hex: "E8913A") : Color.white.opacity(0.3))
                            .frame(
                                width: idx == currentIndex ? 10 : 8,
                                height: idx == currentIndex ? 10 : 8
                            )
                            .animation(.easeInOut(duration: 0.3), value: currentIndex)
                    }
                }
            }
        }
        .padding(.horizontal, geo.size.width * 0.06)
    }
    
    // MARK: - Empty State
    
    private func emptyState(geo: GeometryProxy) -> some View {
        VStack(spacing: geo.size.height * 0.03) {
            Image(systemName: "camera.fill")
                .font(.system(size: geo.size.height * 0.1))
                .foregroundColor(Color(hex: "E8913A").opacity(0.5))
            
            Text("No photos yet — be the first!")
                .font(.system(size: geo.size.height * 0.04, weight: .light, design: .serif))
                .foregroundColor(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Rank Badge
    
    private func rankBadge(index: Int, size: CGFloat) -> some View {
        let bgColor: Color = index == 0 ? Color(hex: "EAB308") :
                             index == 1 ? Color(hex: "9CA3AF") :
                             index == 2 ? Color(hex: "D97706") :
                             Color.white.opacity(0.2)
        
        return Text("\(index + 1)")
            .font(.system(size: size * 0.5, weight: .bold))
            .foregroundColor(.white)
            .frame(width: size, height: size)
            .background(bgColor)
            .clipShape(Circle())
            .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
    }
    
    // MARK: - Timer
    
    private func startCycling() {
        cycleTimer?.invalidate()
        guard photos.count > 1 else { return }
        cycleTimer = Timer.scheduledTimer(withTimeInterval: secondsPerPhoto, repeats: true) { _ in
            withAnimation {
                currentIndex = (currentIndex + 1) % photos.count
            }
        }
    }
}

#Preview {
    GuestPhotoContestScreenView(screen: Screen(
        type: .guestPhotoContest,
        title: "Guest Photo Contest",
        subtitle: "Vote for your favorites!",
        duration: 20
    ))
    .environmentObject(APIClient.shared)
}
