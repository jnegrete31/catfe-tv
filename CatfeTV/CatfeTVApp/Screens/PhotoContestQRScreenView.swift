//
//  PhotoContestQRScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr Spotlight QR screen — Magazine Split design.
//  Left panel rotates through approved Snap & Purr photos,
//  orange accent divider, right cream panel with how-it-works,
//  spotlight tiers, and QR code.
//  Matches the web app's PHOTO_CONTEST_QR screen type.
//
import SwiftUI

struct PhotoContestQRScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var appeared = false
    @State private var photoIndex = 0
    @State private var qrImage: UIImage?
    
    private var photos: [PhotoSubmission] {
        apiClient.cachedSnapPurrPhotos
    }
    
    private var currentPhoto: PhotoSubmission? {
        guard !photos.isEmpty else { return nil }
        return photos[photoIndex % photos.count]
    }
    
    // Build absolute QR URL
    private var qrURL: String {
        let raw = screen.qrCodeURL ?? "/vote/cats"
        if raw.hasPrefix("http") { return raw }
        return "https://tv.catfe.la" + raw
    }
    
    var body: some View {
        GeometryReader { geo in
            HStack(spacing: 0) {
                // MARK: - Left Panel — Rotating Snap & Purr Photos
                ZStack(alignment: .bottom) {
                    Color(hex: "E8913A") // fallback orange
                    
                    if let photo = currentPhoto {
                        ScreenImage(url: photo.photoUrl, contentMode: .fill)
                            .frame(width: geo.size.width * 0.42, height: geo.size.height)
                            .clipped()
                            .id(photo.id)
                            .transition(.opacity)
                    } else {
                        // No photos placeholder
                        VStack(spacing: 16) {
                            Image(systemName: "camera.fill")
                                .font(.system(size: 80))
                                .foregroundColor(.white.opacity(0.8))
                            Text("Snap & Purr")
                                .font(.system(size: 48, weight: .bold, design: .serif))
                                .foregroundColor(.white.opacity(0.9))
                            Text("Your photos could be here!")
                                .font(.system(size: 24))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    
                    // Photo credit gradient overlay
                    if let photo = currentPhoto {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(photo.caption ?? "Photo of \(photo.catName ?? "a Catfé kitty")")
                                .font(.system(size: 24, weight: .medium))
                                .foregroundColor(.white.opacity(0.9))
                                .lineLimit(2)
                            
                            Text("by \(photo.submitterName)")
                                .font(.system(size: 18))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 30)
                        .padding(.bottom, 30)
                        .padding(.top, 60)
                        .background(
                            LinearGradient(
                                colors: [.clear, .black.opacity(0.7)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                    }
                    
                    // Photo indicator dots
                    if photos.count > 1 {
                        HStack(spacing: 6) {
                            ForEach(0..<min(photos.count, 10), id: \.self) { i in
                                Circle()
                                    .fill(i == (photoIndex % photos.count) ? Color.white : Color.white.opacity(0.4))
                                    .frame(width: i == (photoIndex % photos.count) ? 10 : 7,
                                           height: i == (photoIndex % photos.count) ? 10 : 7)
                            }
                        }
                        .padding(.bottom, 90)
                    }
                }
                .frame(width: geo.size.width * 0.42)
                .clipped()
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.7), value: appeared)
                
                // MARK: - Orange Divider
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [Color(hex: "E8913A"), Color(hex: "d99e33")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(width: 6)
                
                // MARK: - Right Panel — Info + QR
                ZStack {
                    Color(hex: "FAFAF5")
                    
                    // Paw watermark
                    Text("🐾")
                        .font(.system(size: 160))
                        .opacity(0.04)
                        .rotationEffect(.degrees(12))
                        .position(x: geo.size.width * 0.45, y: geo.size.height * 0.15)
                    
                    VStack(spacing: geo.size.height * 0.025) {
                        Spacer()
                        
                        // Badge
                        HStack(spacing: 8) {
                            Image(systemName: "camera.fill")
                                .font(.system(size: 16))
                                .foregroundColor(Color(hex: "E8913A"))
                            Text("SNAP & PURR")
                                .font(.system(size: 16, weight: .bold))
                                .tracking(3)
                                .foregroundColor(Color(hex: "E8913A"))
                        }
                        .padding(.horizontal, 18)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(Color(hex: "E8913A").opacity(0.1))
                                .overlay(
                                    Capsule()
                                        .stroke(Color(hex: "E8913A").opacity(0.25), lineWidth: 1)
                                )
                        )
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                        
                        // Title
                        Text(screen.title)
                            .font(.system(size: 48, weight: .bold, design: .serif))
                            .foregroundColor(Color(hex: "2d2d2d"))
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.25), value: appeared)
                        
                        // Subtitle
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(.system(size: 22))
                                .foregroundColor(Color(hex: "888888"))
                                .multilineTextAlignment(.center)
                                .lineLimit(2)
                        }
                        
                        // How it works — horizontal steps
                        HStack(spacing: 20) {
                            stepBubble(number: 1, label: "Scan QR", geo: geo)
                            Image(systemName: "arrow.right")
                                .font(.system(size: 18))
                                .foregroundColor(Color(hex: "cccccc"))
                            stepBubble(number: 2, label: "Upload Photo", geo: geo)
                            Image(systemName: "arrow.right")
                                .font(.system(size: 18))
                                .foregroundColor(Color(hex: "cccccc"))
                            stepBubble(number: 3, label: "Spotlight It!", geo: geo)
                        }
                        .padding(.vertical, 8)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.35), value: appeared)
                        
                        // Spotlight tiers
                        HStack(spacing: 12) {
                            tierCard(emoji: "⚡", price: "$1", duration: "5 min", geo: geo)
                            tierCard(emoji: "✨", price: "$3", duration: "30 min", geo: geo)
                            tierCard(emoji: "🌟", price: "$5", duration: "1 hour", geo: geo)
                            tierCard(emoji: "💫", price: "$10", duration: "All day", geo: geo)
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                        
                        // QR Code
                        VStack(spacing: 10) {
                            if let image = qrImage {
                                Image(uiImage: image)
                                    .interpolation(.none)
                                    .resizable()
                                    .frame(width: 180, height: 180)
                            } else {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.white)
                                    .frame(width: 180, height: 180)
                                    .overlay(ProgressView().tint(Color(hex: "E8913A")))
                            }
                            
                            Text(screen.qrLabel ?? "Scan to upload & spotlight!")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(Color(hex: "666666"))
                        }
                        .padding(20)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.white)
                                .shadow(color: .black.opacity(0.06), radius: 10, x: 0, y: 4)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color(hex: "e5e0d8"), lineWidth: 1)
                        )
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.9)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.5), value: appeared)
                        
                        // Footer
                        Text("Free to upload • 100% of donations support our cats 💖")
                            .font(.system(size: 16))
                            .foregroundColor(Color(hex: "bbbbbb"))
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.6), value: appeared)
                        
                        Spacer()
                    }
                    .padding(.horizontal, 40)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
            generateQR()
            startPhotoRotation()
        }
    }
    
    // MARK: - Step Bubble
    
    private func stepBubble(number: Int, label: String, geo: GeometryProxy) -> some View {
        HStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(Color(hex: "E8913A"))
                    .frame(width: 28, height: 28)
                Text("\(number)")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
            }
            Text(label)
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(Color(hex: "555555"))
        }
    }
    
    // MARK: - Tier Card
    
    private func tierCard(emoji: String, price: String, duration: String, geo: GeometryProxy) -> some View {
        VStack(spacing: 6) {
            Text(emoji)
                .font(.system(size: 28))
            Text(price)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(Color(hex: "E8913A"))
            Text(duration)
                .font(.system(size: 14))
                .foregroundColor(Color(hex: "999999"))
        }
        .frame(width: 90, height: 90)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color(hex: "E8913A").opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color(hex: "E8913A").opacity(0.15), lineWidth: 1)
                )
        )
    }
    
    // MARK: - QR Code Generation
    
    private func generateQR() {
        qrImage = QRCodeGenerator.generate(
            from: qrURL,
            size: CGSize(width: 360, height: 360)
        )
    }
    
    // MARK: - Photo Rotation Timer
    
    private func startPhotoRotation() {
        guard photos.count > 1 else { return }
        Timer.scheduledTimer(withTimeInterval: 6.0, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.8)) {
                photoIndex = (photoIndex + 1) % photos.count
            }
        }
    }
}

#Preview {
    PhotoContestQRScreenView(screen: Screen(
        type: .photoContestQR,
        title: "Spotlight Your Favorites",
        subtitle: "Snap a photo, upload it, and feature it on their adoption screen!",
        qrCodeURL: "https://tv.catfe.la/vote/cats",
        duration: 15
    ))
}
