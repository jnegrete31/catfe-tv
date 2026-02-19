//
//  ScreenView.swift
//  CatfeTVApp
//
//  Routes to specific screen type views - Lounge-inspired design
//

import SwiftUI

struct ScreenView: View {
    let screen: Screen
    var adoptionCats: [Screen] = [] // For adoption showcase grid
    var settings: AppSettings = .default
    
    /// Check if this screen has a saved template overlay with elements
    private var hasTemplateOverlay: Bool {
        guard let overlay = screen.templateOverlay else { return false }
        return !overlay.elements.isEmpty
    }
    
    var body: some View {
        Group {
            if hasTemplateOverlay {
                // Template exists: use it as full replacement to prevent doubling
                TemplateFullScreenView(screen: screen, settings: settings)
            } else {
                // No template: use default native screen design
                switch screen.type {
                case .snapPurr:
                    SnapPurrScreenView(screen: screen)
                case .snapPurrGallery:
                    SnapPurrGalleryScreenView(screen: screen)
                case .snapPurrQR:
                    SnapPurrQRScreenView(screen: screen)
                case .events:
                    EventsScreenView(screen: screen)
                case .today:
                    TodayScreenView(screen: screen)
                case .membership:
                    MembershipScreenView(screen: screen)
                case .reminders:
                    RemindersScreenView(screen: screen)
                case .adoption:
                    AdoptionScreenView(screen: screen)
                case .adoptionShowcase:
                    AdoptionShowcaseScreenView(screen: screen, adoptionCats: adoptionCats)
                case .adoptionCounter:
                    AdoptionCounterScreenView(screen: screen, settings: settings, adoptionCats: adoptionCats)
                case .thankYou:
                    ThankYouScreenView(screen: screen)
                case .happyTails:
                    HappyTailsScreenView(screen: screen)
                case .happyTailsQR:
                    HappyTailsQRScreenView(screen: screen)
                case .livestream:
                    LivestreamScreenView(screen: screen)
                case .checkIn:
                    CheckInScreenView(screen: screen, settings: settings)
                case .guestStatusBoard:
                    GuestStatusBoardScreenView(screen: screen, settings: settings)
                case .custom, .poll, .pollQR:
                    GenericScreenView(screen: screen)
                }
            }
        }
        .transition(.opacity)
    }
}

// MARK: - Template Full Screen View (for CUSTOM screen types)

/// For CUSTOM screens, the template IS the full design (no default renderer underneath)
struct TemplateFullScreenView: View {
    let screen: Screen
    let settings: AppSettings
    
    var body: some View {
        ZStack {
            // Background from template
            if let overlay = screen.templateOverlay {
                templateBackground(overlay)
            } else {
                LoungeBackground()
            }
            
            // Template elements
            TemplateOverlayView(screen: screen, settings: settings)
        }
    }
    
    @ViewBuilder
    private func templateBackground(_ overlay: TemplateOverlay) -> some View {
        let bgColor = overlay.backgroundColor ?? "#1a1a2e"
        
        ZStack {
            Color(hex: bgColor.replacingOccurrences(of: "#", with: ""))
                .ignoresSafeArea()
            
            // Check if dark background for lounge decorations
            let isDark = bgColor.hasPrefix("#1") || bgColor.hasPrefix("#2") || bgColor.hasPrefix("#0")
            
            if isDark {
                // Warm amber light glows
                GeometryReader { geometry in
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color.loungeAmber.opacity(0.2), Color.clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geometry.size.width * 0.35
                            )
                        )
                        .frame(width: geometry.size.width * 0.7, height: geometry.size.width * 0.7)
                        .position(x: geometry.size.width * 0.25, y: -geometry.size.height * 0.1)
                    
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color.loungeWarmOrange.opacity(0.15), Color.clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geometry.size.width * 0.3
                            )
                        )
                        .frame(width: geometry.size.width * 0.6, height: geometry.size.width * 0.6)
                        .position(x: geometry.size.width * 0.75, y: -geometry.size.height * 0.05)
                }
                
                // Mint green floor reflection
                VStack {
                    Spacer()
                    LinearGradient(
                        colors: [Color.clear, Color.loungeMintGreen.opacity(0.2)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 150)
                }
                .ignoresSafeArea()
            }
        }
    }
}

// MARK: - Generic Screen View (for types without custom views)

struct GenericScreenView: View {
    let screen: Screen
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            VStack(spacing: 40) {
                // Image if available
                if let imageURL = screen.imageURL, !imageURL.isEmpty {
                    ScreenImage(url: imageURL)
                        .frame(maxWidth: 600, maxHeight: 400)
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
                }
                
                // Title
                Text(screen.title)
                    .font(CatfeTypography.title)
                    .foregroundColor(.loungeCream)
                    .multilineTextAlignment(.center)
                
                // Subtitle
                if let subtitle = screen.subtitle {
                    Text(subtitle)
                        .font(CatfeTypography.subtitle)
                        .foregroundColor(.loungeAmber)
                        .multilineTextAlignment(.center)
                }
                
                // Body text
                if let body = screen.bodyText {
                    Text(body)
                        .font(CatfeTypography.body)
                        .foregroundColor(.loungeCream.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .lineSpacing(8)
                }
                
                // QR Code
                if let qrUrl = screen.qrCodeURL, !qrUrl.isEmpty {
                    QRCodeView(url: qrUrl, size: 200)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

// MARK: - Lounge Background View

struct LoungeBackground: View {
    var body: some View {
        ZStack {
            // Dark industrial background (like the ceiling)
            Color.loungeCharcoal
                .ignoresSafeArea()
            
            // Warm amber light glows (like wicker pendant lights)
            GeometryReader { geometry in
                // Left amber glow
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.loungeAmber.opacity(0.3), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geometry.size.width * 0.4
                        )
                    )
                    .frame(width: geometry.size.width * 0.8, height: geometry.size.width * 0.8)
                    .position(x: geometry.size.width * 0.25, y: -geometry.size.height * 0.1)
                
                // Right orange glow
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.loungeWarmOrange.opacity(0.2), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geometry.size.width * 0.35
                        )
                    )
                    .frame(width: geometry.size.width * 0.7, height: geometry.size.width * 0.7)
                    .position(x: geometry.size.width * 0.75, y: -geometry.size.height * 0.05)
            }
            
            // Mint green floor reflection (like the epoxy floor)
            VStack {
                Spacer()
                LinearGradient(
                    colors: [Color.clear, Color.loungeMintGreen.opacity(0.3)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 200)
            }
            .ignoresSafeArea()
            
            // Playful cat decorations
            GeometryReader { geometry in
                Text("🐱")
                    .font(.system(size: 80))
                    .opacity(0.1)
                    .position(x: geometry.size.width - 100, y: geometry.size.height - 60)
                
                Text("🐾")
                    .font(.system(size: 50))
                    .opacity(0.05)
                    .rotationEffect(.degrees(15))
                    .position(x: 80, y: geometry.size.height * 0.35)
                
                Text("🐾")
                    .font(.system(size: 40))
                    .opacity(0.05)
                    .position(x: geometry.size.width * 0.3, y: geometry.size.height * 0.75)
            }
        }
    }
}

// MARK: - Base Screen Layout (Updated for Lounge Theme)

struct BaseScreenLayout<Content: View>: View {
    let screen: Screen
    let backgroundColor: Color
    let content: Content
    
    init(
        screen: Screen,
        backgroundColor: Color? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.screen = screen
        self.backgroundColor = backgroundColor ?? screen.type.backgroundColor
        self.content = content()
    }
    
    var body: some View {
        ZStack {
            // Lounge-inspired background
            LoungeBackground()
            
            // Content
            content
                .padding(60)
        }
    }
}

// MARK: - QR Code View (Updated with cream background)

struct QRCodeView: View {
    let url: String
    let size: CGFloat
    
    @State private var qrImage: UIImage?
    
    var body: some View {
        Group {
            if let image = qrImage {
                VStack(spacing: 12) {
                    Image(uiImage: image)
                        .interpolation(.none)
                        .resizable()
                        .frame(width: size, height: size)
                    
                    Text("Scan to learn more")
                        .font(CatfeTypography.caption)
                        .foregroundColor(.loungeCharcoal)
                }
                .padding(20)
                .background(Color.loungeCream)
                .cornerRadius(16)
                .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
            } else {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.loungeCream)
                    .frame(width: size + 40, height: size + 80)
                    .overlay(
                        ProgressView()
                            .tint(.loungeWarmOrange)
                    )
            }
        }
        .onAppear {
            generateQRCode()
        }
    }
    
    private func generateQRCode() {
        qrImage = QRCodeGenerator.generate(
            from: url,
            size: CGSize(width: size * 2, height: size * 2)
        )
    }
}

// MARK: - Screen Badge (Updated for lounge theme)

struct ScreenBadge: View {
    let text: String
    let color: Color
    let emoji: String?
    
    init(text: String, color: Color = .loungeWarmOrange, emoji: String? = nil) {
        self.text = text
        self.color = color
        self.emoji = emoji
    }
    
    var body: some View {
        HStack(spacing: 8) {
            if let emoji = emoji {
                Text(emoji)
            }
            Text(text)
        }
        .font(CatfeTypography.badge)
        .foregroundColor(.white)
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .background(color)
        .cornerRadius(30)
    }
}

// MARK: - Polaroid Frame (Lounge-inspired)

struct PolaroidFrame<Content: View>: View {
    let content: Content
    let caption: String?
    let rotation: Double
    
    init(
        caption: String? = nil,
        rotation: Double = -2,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.caption = caption
        self.rotation = rotation
    }
    
    var body: some View {
        VStack(spacing: 16) {
            content
                .clipShape(RoundedRectangle(cornerRadius: 8))
            
            if let caption = caption {
                Text(caption)
                    .font(.system(size: 28, weight: .medium, design: .serif))
                    .foregroundColor(.loungeCharcoal)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(24)
        .background(Color.loungeCream)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
        .rotationEffect(.degrees(rotation))
    }
}

// MARK: - Async Image with Placeholder

struct ScreenImage: View {
    let url: String?
    let contentMode: ContentMode
    
    init(url: String?, contentMode: ContentMode = .fill) {
        self.url = url
        self.contentMode = contentMode
    }
    
    var body: some View {
        if let urlString = url, let imageURL = URL(string: urlString) {
            CachedAsyncImage(url: imageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } placeholder: {
                Rectangle()
                    .fill(Color.loungeStone.opacity(0.3))
                    .overlay(
                        Image(systemName: "photo")
                            .font(.system(size: 60))
                            .foregroundColor(.loungeStone.opacity(0.5))
                    )
            }
        } else {
            Rectangle()
                .fill(Color.loungeStone.opacity(0.3))
                .overlay(
                    Image(systemName: "photo")
                        .font(.system(size: 60))
                        .foregroundColor(.loungeStone.opacity(0.5))
                )
        }
    }
}

// MARK: - Preview

#if DEBUG
struct ScreenView_Previews: PreviewProvider {
    static var previews: some View {
        ScreenView(screen: Screen.sampleScreens[0])
    }
}
#endif
