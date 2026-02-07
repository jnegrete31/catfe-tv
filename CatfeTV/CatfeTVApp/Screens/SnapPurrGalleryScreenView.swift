//
//  SnapPurrGalleryScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr Gallery screen - cycles through uploaded photos.
//  Uses pre-cached photos from APIClient for instant display.
//
import SwiftUI
struct SnapPurrGalleryScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var currentIndex = 0
    @State private var appeared = false
    
    private let photoTimer = Timer.publish(every: 6, on: .main, in: .common).autoconnect()
    
    /// Use cached photos from APIClient (pre-fetched at startup)
    private var photos: [PhotoSubmission] {
        apiClient.cachedSnapPurrPhotos
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                if photos.isEmpty {
                    // No photos - show placeholder with screen image if available
                    VStack(spacing: 24) {
                        if screen.imageURL != nil {
                            VStack(spacing: 0) {
                                ScreenImage(url: screen.imageURL)
                                    .frame(width: geo.size.width * 0.4, height: geo.size.height * 0.6)
                                    .clipShape(RoundedRectangle(cornerRadius: 4))
                                
                                Text(screen.title)
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
                        } else {
                            Spacer()
                            Image(systemName: "camera.fill")
                                .font(.system(size: 80))
                                .foregroundColor(.loungeWarmOrange.opacity(0.5))
                            Text("No photos yet!")
                                .font(.system(size: 40, weight: .bold, design: .serif))
                                .foregroundColor(.loungeCream)
                            Text("Scan the QR code to share your Catfé moments")
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeCream.opacity(0.6))
                            Spacer()
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    // Photo gallery - cycle through uploaded photos
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
                            
                            // Caption or submitter name
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
                            
                            ScreenBadge(text: "Snap & Purr Gallery", color: .loungeMintGreen, emoji: "📸")
                            
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
                            
                            // Photo counter
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
        }
        .onAppear {
            withAnimation { appeared = true }
            if currentIndex >= photos.count && !photos.isEmpty {
                currentIndex = currentIndex % photos.count
            }
        }
        .onReceive(photoTimer) { _ in
            if !photos.isEmpty {
                withAnimation(.easeInOut(duration: 0.5)) {
                    currentIndex = (currentIndex + 1) % photos.count
                }
            }
        }
    }
}
