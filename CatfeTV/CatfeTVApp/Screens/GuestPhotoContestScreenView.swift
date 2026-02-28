//
//  GuestPhotoContestScreenView.swift
//  CatfeTVApp
//
//  Active Spotlights Board — Magazine Split design.
//  Shows all currently active spotlight donations as a "wall of fame" for donors.
//  Left panel rotates Snap & Purr gallery photos, right panel lists active spotlights.
//
import SwiftUI

struct GuestPhotoContestScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var currentPhotoIndex = 0
    @State private var currentSpotlightIndex = 0
    @State private var currentTime = Date()
    @State private var photoCycleTimer: Timer? = nil
    @State private var spotlightCycleTimer: Timer? = nil
    @State private var clockTimer: Timer? = nil
    
    private var spotlights: [SpotlightDonation] {
        apiClient.cachedActiveSpotlights
    }
    
    private var galleryPhotos: [PhotoSubmission] {
        apiClient.cachedSnapPurrPhotos
    }
    
    var body: some View {
        GeometryReader { geo in
            HStack(spacing: 0) {
                // LEFT PANEL — Rotating Snap & Purr gallery photos
                leftPanel(geo: geo)
                    .frame(width: geo.size.width * 0.40)
                
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
                
                // RIGHT PANEL — Active Spotlights Board
                rightPanel(geo: geo)
                    .frame(maxWidth: .infinity)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            startTimers()
        }
        .onDisappear {
            stopTimers()
        }
    }
    
    // MARK: - Left Panel
    
    private func leftPanel(geo: GeometryProxy) -> some View {
        ZStack {
            Color(hex: "1a1a1a")
            
            if galleryPhotos.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 60))
                        .foregroundColor(Color(hex: "E8913A").opacity(0.5))
                    Text("Spotlight Wall")
                        .font(.system(size: 28, weight: .light, design: .serif))
                        .foregroundColor(.white.opacity(0.5))
                }
            } else {
                let photo = galleryPhotos[currentPhotoIndex % max(galleryPhotos.count, 1)]
                
                ScreenImage(
                    url: photo.photoUrl,
                    contentMode: .fill,
                    width: geo.size.width * 0.40,
                    height: geo.size.height
                )
                
                // Bottom gradient
                VStack {
                    Spacer()
                    LinearGradient(
                        colors: [.clear, .black.opacity(0.7)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: geo.size.height * 0.25)
                }
                
                // Photo credit
                VStack {
                    Spacer()
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            if let caption = photo.caption, !caption.isEmpty {
                                Text(caption)
                                    .font(.system(size: 22, weight: .medium, design: .serif))
                                    .foregroundColor(.white.opacity(0.9))
                                    .lineLimit(2)
                            }
                            Text("by \(photo.submitterName)")
                                .font(.system(size: 16))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        Spacer()
                        
                        if galleryPhotos.count > 1 {
                            HStack(spacing: 5) {
                                ForEach(0..<min(galleryPhotos.count, 8), id: \.self) { idx in
                                    Circle()
                                        .fill(idx == currentPhotoIndex % min(galleryPhotos.count, 8) ? Color.white : Color.white.opacity(0.4))
                                        .frame(width: idx == currentPhotoIndex % min(galleryPhotos.count, 8) ? 8 : 6,
                                               height: idx == currentPhotoIndex % min(galleryPhotos.count, 8) ? 8 : 6)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 24)
                }
            }
        }
    }
    
    // MARK: - Right Panel
    
    private func rightPanel(geo: GeometryProxy) -> some View {
        ZStack {
            Color(hex: "FAFAF5")
            
            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack(alignment: .center, spacing: 12) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 28))
                        .foregroundColor(Color(hex: "E8913A"))
                    
                    Text("Active Spotlights")
                        .font(.system(size: 48, weight: .black, design: .serif))
                        .foregroundColor(Color(hex: "2d2d2d"))
                }
                .padding(.top, geo.size.height * 0.06)
                .padding(.horizontal, 40)
                
                Text("Guests shining a light on their favorite cats")
                    .font(.system(size: 20))
                    .foregroundColor(Color(hex: "8a8a7a"))
                    .padding(.leading, 80)
                    .padding(.top, 4)
                
                if spotlights.isEmpty {
                    emptyState(geo: geo)
                } else {
                    spotlightList(geo: geo)
                }
                
                Spacer()
                
                bottomBar(geo: geo)
            }
        }
    }
    
    // MARK: - Spotlight List
    
    private func spotlightList(geo: GeometryProxy) -> some View {
        VStack(spacing: 12) {
            ForEach(Array(spotlights.prefix(6).enumerated()), id: \.element.id) { idx, spotlight in
                spotlightCard(spotlight: spotlight, isHighlighted: idx == currentSpotlightIndex % max(spotlights.count, 1), geo: geo)
            }
        }
        .padding(.horizontal, 40)
        .padding(.top, 20)
    }
    
    private func spotlightCard(spotlight: SpotlightDonation, isHighlighted: Bool, geo: GeometryProxy) -> some View {
        HStack(spacing: 16) {
            // Photo thumbnail
            if let photoUrl = spotlight.photoUrl {
                ScreenImage(
                    url: photoUrl,
                    contentMode: .fill,
                    width: 72,
                    height: 72
                )
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
            } else {
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color(hex: "f0ede8"))
                    .frame(width: 72, height: 72)
                    .overlay(
                        Image(systemName: "camera.fill")
                            .font(.system(size: 24))
                            .foregroundColor(Color(hex: "8a8a7a"))
                    )
            }
            
            // Info
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(spotlight.catName ?? "Cat")
                        .font(.system(size: 22, weight: .bold, design: .serif))
                        .foregroundColor(Color(hex: "2d2d2d"))
                        .lineLimit(1)
                    
                    Text(spotlight.tierLabel)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 3)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "E8913A"), Color(hex: "D4782A")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(Capsule())
                }
                
                Text("Spotlighted by \(spotlight.donorName)")
                    .font(.system(size: 15))
                    .foregroundColor(Color(hex: "8a8a7a"))
                    .lineLimit(1)
                
                if let caption = spotlight.caption, !caption.isEmpty {
                    Text("\"\(caption)\"")
                        .font(.system(size: 14, weight: .regular, design: .serif))
                        .foregroundColor(Color(hex: "aaa89e"))
                        .italic()
                        .lineLimit(1)
                }
            }
            
            Spacer()
            
            // Time remaining
            VStack(alignment: .trailing, spacing: 2) {
                Text(spotlight.timeRemaining)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(Color(hex: "E8913A"))
                
                Text(spotlight.donationAmount + " donated")
                    .font(.system(size: 13))
                    .foregroundColor(Color(hex: "aaa89e"))
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(isHighlighted ? Color(hex: "E8913A").opacity(0.08) : Color.white)
                .shadow(color: isHighlighted ? Color(hex: "E8913A").opacity(0.1) : .black.opacity(0.03), radius: isHighlighted ? 12 : 4, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(isHighlighted ? Color(hex: "E8913A").opacity(0.4) : Color.clear, lineWidth: 2)
        )
    }
    
    // MARK: - Empty State
    
    private func emptyState(geo: GeometryProxy) -> some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: "sparkles")
                .font(.system(size: 60))
                .foregroundColor(Color(hex: "E8913A").opacity(0.4))
            
            Text("No Active Spotlights")
                .font(.system(size: 32, weight: .bold, design: .serif))
                .foregroundColor(Color(hex: "2d2d2d"))
            
            Text("Donate to feature your photo on a cat's adoption profile!")
                .font(.system(size: 20))
                .foregroundColor(Color(hex: "8a8a7a"))
                .multilineTextAlignment(.center)
            
            // Tier pills
            HStack(spacing: 12) {
                ForEach(["$1 \u{00B7} 5 min", "$3 \u{00B7} 30 min", "$5 \u{00B7} 1 hour", "$10 \u{00B7} All day"], id: \.self) { tier in
                    Text(tier)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(Color(hex: "E8913A"))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color(hex: "E8913A").opacity(0.1))
                        .clipShape(Capsule())
                }
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 40)
    }
    
    // MARK: - Bottom Bar
    
    private func bottomBar(geo: GeometryProxy) -> some View {
        HStack {
            Text("\(spotlights.count) active spotlight\(spotlights.count != 1 ? "s" : "")")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(Color(hex: "aaa89e"))
            
            Spacer()
            
            if let qrUrl = screen.qrCodeURL, !qrUrl.isEmpty {
                HStack(spacing: 12) {
                    let fullUrl = qrUrl.hasPrefix("http") ? qrUrl : "https://www.catfetv.com\(qrUrl)"
                    if let qrImage = QRCodeGenerator.generate(from: fullUrl, size: CGSize(width: 200, height: 200)) {
                        Image(uiImage: qrImage)
                            .interpolation(.none)
                            .resizable()
                            .frame(width: 48, height: 48)
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Spotlight a Cat")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(Color(hex: "2d2d2d"))
                        Text("Scan to donate")
                            .font(.system(size: 11))
                            .foregroundColor(Color(hex: "8a8a7a"))
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Color.white)
                .cornerRadius(14)
                .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
            }
        }
        .padding(.horizontal, 40)
        .padding(.bottom, 24)
    }
    
    // MARK: - Timers
    
    private func startTimers() {
        photoCycleTimer?.invalidate()
        if galleryPhotos.count > 1 {
            photoCycleTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
                withAnimation(.easeInOut(duration: 0.8)) {
                    currentPhotoIndex = (currentPhotoIndex + 1) % galleryPhotos.count
                }
            }
        }
        
        spotlightCycleTimer?.invalidate()
        if spotlights.count > 1 {
            spotlightCycleTimer = Timer.scheduledTimer(withTimeInterval: 6.0, repeats: true) { _ in
                withAnimation(.easeInOut(duration: 0.3)) {
                    currentSpotlightIndex = (currentSpotlightIndex + 1) % spotlights.count
                }
            }
        }
        
        clockTimer?.invalidate()
        clockTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
            currentTime = Date()
        }
    }
    
    private func stopTimers() {
        photoCycleTimer?.invalidate()
        spotlightCycleTimer?.invalidate()
        clockTimer?.invalidate()
    }
}

#Preview {
    GuestPhotoContestScreenView(screen: Screen(
        type: .guestPhotoContest,
        title: "Active Spotlights",
        subtitle: "Spotlight your favorites!",
        duration: 20
    ))
    .environmentObject(APIClient.shared)
}
