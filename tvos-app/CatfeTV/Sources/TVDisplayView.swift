import SwiftUI

struct TVDisplayView: View {
    let screens: [Screen]
    let settings: Settings?
    @Binding var currentIndex: Int
    @Binding var isPlaying: Bool
    
    var body: some View {
        ZStack {
            if let screen = screens[safe: currentIndex] {
                ScreenContentView(screen: screen, settings: settings)
                    .id(screen.id)
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.5), value: currentIndex)
    }
}

struct ScreenContentView: View {
    let screen: Screen
    let settings: Settings?
    
    var body: some View {
        ZStack {
            // Background
            backgroundColor
                .ignoresSafeArea()
            
            // Background image
            if let imagePath = screen.imagePath, !imagePath.isEmpty {
                if screen.imageDisplayMode == "contain" {
                    // Show full image centered on background
                    AsyncImage(url: URL(string: imagePath)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .shadow(radius: 30)
                        case .failure:
                            EmptyView()
                        case .empty:
                            ProgressView()
                        @unknown default:
                            EmptyView()
                        }
                    }
                    .padding(60)
                } else {
                    // Cover mode with overlay
                    AsyncImage(url: URL(string: imagePath)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .ignoresSafeArea()
                        case .failure:
                            EmptyView()
                        case .empty:
                            ProgressView()
                        @unknown default:
                            EmptyView()
                        }
                    }
                    
                    // Dark overlay for text readability
                    Color.black.opacity(0.4)
                        .ignoresSafeArea()
                    
                    // Content
                    screenContent
                }
            } else {
                // No image - show content on colored background
                screenContent
            }
        }
    }
    
    private var backgroundColor: Color {
        switch screen.type {
        case "SNAP_AND_PURR":
            return Color(hex: "#fce7f3")
        case "EVENT":
            return Color(hex: "#ede9fe")
        case "TODAY_AT_CATFE":
            return Color(hex: "#fef3c7")
        case "MEMBERSHIP":
            return Color(hex: "#d1fae5")
        case "REMINDER":
            return Color(hex: "#dbeafe")
        case "ADOPTION":
            return Color(hex: "#fee2e2")
        case "THANK_YOU":
            return Color(hex: "#e0e7ff")
        default:
            return Color(hex: "#FDF6E3")
        }
    }
    
    private var textColor: Color {
        let hasImage = screen.imagePath != nil && !screen.imagePath!.isEmpty && screen.imageDisplayMode != "contain"
        if hasImage {
            return .white
        }
        
        switch screen.type {
        case "SNAP_AND_PURR":
            return Color(hex: "#831843")
        case "EVENT":
            return Color(hex: "#581c87")
        case "TODAY_AT_CATFE":
            return Color(hex: "#78350f")
        case "MEMBERSHIP":
            return Color(hex: "#064e3b")
        case "REMINDER":
            return Color(hex: "#1e3a8a")
        case "ADOPTION":
            return Color(hex: "#7f1d1d")
        case "THANK_YOU":
            return Color(hex: "#312e81")
        default:
            return Color(hex: "#3D2914")
        }
    }
    
    private var subtitleColor: Color {
        textColor.opacity(0.85)
    }
    
    private var bodyColor: Color {
        textColor.opacity(0.75)
    }
    
    private var badgeColor: Color {
        switch screen.type {
        case "SNAP_AND_PURR":
            return Color(hex: "#ec4899")
        case "EVENT":
            return Color(hex: "#8b5cf6")
        case "TODAY_AT_CATFE":
            return Color(hex: "#f59e0b")
        case "MEMBERSHIP":
            return Color(hex: "#10b981")
        case "REMINDER":
            return Color(hex: "#3b82f6")
        case "ADOPTION":
            return Color(hex: "#ef4444")
        case "THANK_YOU":
            return Color(hex: "#6366f1")
        default:
            return Color(hex: "#C4704F")
        }
    }
    
    @ViewBuilder
    private var screenContent: some View {
        HStack(spacing: 80) {
            // Text content
            VStack(alignment: .leading, spacing: 20) {
                // Badge
                Text(badgeText)
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(badgeColor)
                    .cornerRadius(20)
                
                // Title
                Text(screen.title)
                    .font(.system(size: 72, weight: .bold))
                    .foregroundColor(textColor)
                    .shadow(radius: hasImageOverlay ? 10 : 0)
                
                // Subtitle
                if let subtitle = screen.subtitle, !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.system(size: 48, weight: .medium))
                        .foregroundColor(subtitleColor)
                        .shadow(radius: hasImageOverlay ? 8 : 0)
                }
                
                // Body
                if let body = screen.body, !body.isEmpty {
                    Text(body)
                        .font(.system(size: 36))
                        .foregroundColor(bodyColor)
                        .lineLimit(4)
                        .shadow(radius: hasImageOverlay ? 6 : 0)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 100)
            
            Spacer()
            
            // QR Code
            if let qrUrl = screen.qrUrl, !qrUrl.isEmpty {
                QRCodeView(url: qrUrl)
                    .frame(width: 300, height: 300)
                    .padding(.trailing, 100)
            }
        }
        .padding(.vertical, 80)
    }
    
    private var badgeText: String {
        switch screen.type {
        case "SNAP_AND_PURR":
            return "📸 Snap & Purr"
        case "EVENT":
            return "🎉 Event"
        case "TODAY_AT_CATFE":
            return "☕️ Today at \(settings?.locationName ?? "Catfé")"
        case "MEMBERSHIP":
            return "⭐️ Membership"
        case "REMINDER":
            return "📢 Reminder"
        case "ADOPTION":
            return "🐱 Adopt Me!"
        case "THANK_YOU":
            return "💕 Thank You"
        default:
            return "📺 \(screen.type)"
        }
    }
    
    private var hasImageOverlay: Bool {
        screen.imagePath != nil && !screen.imagePath!.isEmpty && screen.imageDisplayMode != "contain"
    }
}

// MARK: - QR Code View
struct QRCodeView: View {
    let url: String
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 20)
                .fill(.white)
                .shadow(radius: 10)
            
            // Generate QR code
            if let qrImage = generateQRCode(from: url) {
                Image(uiImage: qrImage)
                    .interpolation(.none)
                    .resizable()
                    .aspectRatio(1, contentMode: .fit)
                    .padding(20)
            } else {
                VStack {
                    Image(systemName: "qrcode")
                        .font(.system(size: 60))
                    Text("Scan Me")
                        .font(.caption)
                }
                .foregroundColor(.gray)
            }
        }
    }
    
    private func generateQRCode(from string: String) -> UIImage? {
        let data = string.data(using: .ascii)
        
        if let filter = CIFilter(name: "CIQRCodeGenerator") {
            filter.setValue(data, forKey: "inputMessage")
            filter.setValue("M", forKey: "inputCorrectionLevel")
            
            if let output = filter.outputImage {
                let transform = CGAffineTransform(scaleX: 10, y: 10)
                let scaledOutput = output.transformed(by: transform)
                
                let context = CIContext()
                if let cgImage = context.createCGImage(scaledOutput, from: scaledOutput.extent) {
                    return UIImage(cgImage: cgImage)
                }
            }
        }
        
        return nil
    }
}

#Preview {
    TVDisplayView(
        screens: [
            Screen(
                id: 1,
                type: "EVENT",
                title: "Movie Night",
                subtitle: "Join us for a cozy evening",
                body: "Bring your favorite snacks!",
                imagePath: nil,
                imageDisplayMode: nil,
                qrUrl: "https://example.com",
                startAt: nil,
                endAt: nil,
                daysOfWeek: nil,
                timeStart: nil,
                timeEnd: nil,
                priority: 1,
                durationSeconds: 10,
                sortOrder: 0,
                isActive: true,
                isProtected: false,
                createdAt: "",
                updatedAt: ""
            )
        ],
        settings: nil,
        currentIndex: .constant(0),
        isPlaying: .constant(true)
    )
}
