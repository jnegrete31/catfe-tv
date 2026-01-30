import SwiftUI

struct TVDisplayView: View {
    let screens: [Screen]
    let settings: Settings?
    let adoptionCats: [Screen]
    @Binding var currentIndex: Int
    @Binding var isPlaying: Bool
    
    var body: some View {
        ZStack {
            if let screen = screens[safe: currentIndex] {
                if screen.type == "ADOPTION_SHOWCASE" {
                    AdoptionShowcaseView(screen: screen, settings: settings, cats: adoptionCats)
                        .id("showcase-\(screen.id)")
                        .transition(.opacity)
                } else {
                    ScreenContentView(screen: screen, settings: settings)
                        .id(screen.id)
                        .transition(.opacity)
                }
            }
        }
        .animation(.easeInOut(duration: 0.5), value: currentIndex)
    }
}

struct ScreenContentView: View {
    let screen: Screen
    let settings: Settings?
    
    // Font names - using system fonts that match web styling
    private let displayFont = "Georgia" // Serif font similar to Playfair Display
    private let bodyFont = "Helvetica Neue" // Sans-serif similar to Inter
    
    var body: some View {
        ZStack {
            // Background color
            backgroundColor
                .ignoresSafeArea()
            
            // Background image (if any)
            if let imagePath = screen.imagePath, !imagePath.isEmpty {
                if screen.imageDisplayMode == "contain" {
                    // Contain mode: show full image centered on themed background
                    AsyncImage(url: URL(string: imagePath)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .shadow(color: .black.opacity(0.3), radius: 30, x: 0, y: 10)
                        case .failure:
                            EmptyView()
                        case .empty:
                            ProgressView()
                                .scaleEffect(2)
                        @unknown default:
                            EmptyView()
                        }
                    }
                    .padding(60)
                } else {
                    // Cover mode: fill screen with dark overlay
                    AsyncImage(url: URL(string: imagePath)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .clipped()
                                .ignoresSafeArea()
                        case .failure:
                            EmptyView()
                        case .empty:
                            ProgressView()
                                .scaleEffect(2)
                        @unknown default:
                            EmptyView()
                        }
                    }
                    
                    // Dark overlay for text readability (40% black like web)
                    Color.black.opacity(0.4)
                        .ignoresSafeArea()
                }
            }
            
            // Content overlay
            contentOverlay
        }
    }
    
    // MARK: - Background Colors (matching web version exactly)
    private var backgroundColor: Color {
        switch screen.type {
        case "SNAP_AND_PURR":
            return Color(hex: "#fce7f3") // pink-100
        case "EVENT":
            return Color(hex: "#ede9fe") // purple-100
        case "TODAY_AT_CATFE":
            return Color(hex: "#fef3c7") // amber-100
        case "MEMBERSHIP":
            return Color(hex: "#d1fae5") // emerald-100
        case "REMINDER":
            return Color(hex: "#dbeafe") // blue-100
        case "ADOPTION":
            return Color(hex: "#fee2e2") // red-100
        case "ADOPTION_SHOWCASE":
            return Color(hex: "#ffedd5") // orange-100
        case "THANK_YOU":
            return Color(hex: "#e0e7ff") // indigo-100
        default:
            return Color(hex: "#FDF6E3") // cream
        }
    }
    
    // MARK: - Text Colors (matching web version)
    private var hasImage: Bool {
        screen.imagePath != nil && !screen.imagePath!.isEmpty && screen.imageDisplayMode != "contain"
    }
    
    private var titleColor: Color {
        if hasImage { return .white }
        switch screen.type {
        case "SNAP_AND_PURR": return Color(hex: "#831843") // pink-900
        case "EVENT": return Color(hex: "#581c87") // purple-900
        case "TODAY_AT_CATFE": return Color(hex: "#78350f") // amber-900
        case "MEMBERSHIP": return Color(hex: "#064e3b") // emerald-900
        case "REMINDER": return Color(hex: "#1e3a8a") // blue-900
        case "ADOPTION": return Color(hex: "#7f1d1d") // red-900
        case "THANK_YOU": return Color(hex: "#312e81") // indigo-900
        default: return Color(hex: "#3D2914")
        }
    }
    
    private var subtitleColor: Color {
        if hasImage { return .white.opacity(0.9) }
        switch screen.type {
        case "SNAP_AND_PURR": return Color(hex: "#9d174d") // pink-800
        case "EVENT": return Color(hex: "#6b21a8") // purple-800
        case "TODAY_AT_CATFE": return Color(hex: "#92400e") // amber-800
        case "MEMBERSHIP": return Color(hex: "#065f46") // emerald-800
        case "REMINDER": return Color(hex: "#1e40af") // blue-800
        case "ADOPTION": return Color(hex: "#991b1b") // red-800
        case "THANK_YOU": return Color(hex: "#3730a3") // indigo-800
        default: return Color(hex: "#5D4930")
        }
    }
    
    private var bodyColor: Color {
        if hasImage { return .white.opacity(0.8) }
        switch screen.type {
        case "SNAP_AND_PURR": return Color(hex: "#be185d") // pink-700
        case "EVENT": return Color(hex: "#7c3aed") // purple-700
        case "TODAY_AT_CATFE": return Color(hex: "#b45309") // amber-700
        case "MEMBERSHIP": return Color(hex: "#047857") // emerald-700
        case "REMINDER": return Color(hex: "#1d4ed8") // blue-700
        case "ADOPTION": return Color(hex: "#b91c1c") // red-700
        case "THANK_YOU": return Color(hex: "#4338ca") // indigo-700
        default: return Color(hex: "#7D6950")
        }
    }
    
    private var badgeColor: Color {
        switch screen.type {
        case "SNAP_AND_PURR": return Color(hex: "#ec4899") // pink-500
        case "EVENT": return Color(hex: "#a855f7") // purple-500
        case "TODAY_AT_CATFE": return Color(hex: "#f59e0b") // amber-500
        case "MEMBERSHIP": return Color(hex: "#10b981") // emerald-500
        case "REMINDER": return Color(hex: "#3b82f6") // blue-500
        case "ADOPTION": return Color(hex: "#ef4444") // red-500
        case "THANK_YOU": return Color(hex: "#6366f1") // indigo-500
        default: return Color(hex: "#C4704F")
        }
    }
    
    private var badgeText: String {
        switch screen.type {
        case "SNAP_AND_PURR": return "Snap & Purr!"
        case "EVENT": return "Event"
        case "TODAY_AT_CATFE": return "Today at \(settings?.locationName ?? "Catfé")"
        case "MEMBERSHIP": return "Membership"
        case "REMINDER": return "Reminder"
        case "ADOPTION": return "Adopt Me!"
        case "ADOPTION_SHOWCASE": return "Meet Our Adoptable Cats"
        case "THANK_YOU": return "Thank You"
        default: return screen.type
        }
    }
    
    // MARK: - Content Layout
    @ViewBuilder
    private var contentOverlay: some View {
        switch screen.type {
        case "SNAP_AND_PURR", "TODAY_AT_CATFE", "REMINDER", "THANK_YOU":
            // Centered layout
            centeredContent
        default:
            // Side-by-side layout (Event, Membership, Adoption)
            sideBySideContent
        }
    }
    
    // Centered content layout (for Snap & Purr, Today, Reminder, Thank You)
    private var centeredContent: some View {
        VStack(spacing: 24) {
            // Badge
            Text(badgeText)
                .font(.custom(bodyFont, size: 28))
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(badgeColor)
                .cornerRadius(50)
            
            // Title
            Text(screen.title)
                .font(.custom(displayFont, size: 80))
                .fontWeight(.bold)
                .foregroundColor(titleColor)
                .multilineTextAlignment(.center)
                .shadow(color: hasImage ? .black.opacity(0.5) : .clear, radius: 10, x: 0, y: 4)
            
            // Subtitle
            if let subtitle = screen.subtitle, !subtitle.isEmpty {
                Text(subtitle)
                    .font(.custom(displayFont, size: 48))
                    .foregroundColor(subtitleColor)
                    .multilineTextAlignment(.center)
                    .shadow(color: hasImage ? .black.opacity(0.4) : .clear, radius: 8, x: 0, y: 3)
            }
            
            // Body
            if let body = screen.body, !body.isEmpty {
                Text(body)
                    .font(.custom(bodyFont, size: 32))
                    .foregroundColor(bodyColor)
                    .multilineTextAlignment(.center)
                    .lineLimit(4)
                    .shadow(color: hasImage ? .black.opacity(0.3) : .clear, radius: 6, x: 0, y: 2)
            }
            
            // QR Code
            if let qrUrl = screen.qrUrl, !qrUrl.isEmpty {
                QRCodeView(url: qrUrl)
                    .frame(width: 200, height: 200)
                    .padding(.top, 20)
            }
        }
        .padding(60)
    }
    
    // Side-by-side content layout (for Event, Membership, Adoption)
    private var sideBySideContent: some View {
        HStack(alignment: .center, spacing: 60) {
            // Left side - text content
            VStack(alignment: .leading, spacing: 16) {
                // Badge
                Text(badgeText)
                    .font(.custom(bodyFont, size: 24))
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(badgeColor)
                    .cornerRadius(50)
                
                // Title
                Text(screen.title)
                    .font(.custom(displayFont, size: 72))
                    .fontWeight(.bold)
                    .foregroundColor(titleColor)
                    .shadow(color: hasImage ? .black.opacity(0.5) : .clear, radius: 10, x: 0, y: 4)
                
                // Subtitle
                if let subtitle = screen.subtitle, !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.custom(displayFont, size: 40))
                        .foregroundColor(subtitleColor)
                        .shadow(color: hasImage ? .black.opacity(0.4) : .clear, radius: 8, x: 0, y: 3)
                }
                
                // Body
                if let body = screen.body, !body.isEmpty {
                    Text(body)
                        .font(.custom(bodyFont, size: 28))
                        .foregroundColor(bodyColor)
                        .lineLimit(4)
                        .shadow(color: hasImage ? .black.opacity(0.3) : .clear, radius: 6, x: 0, y: 2)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            Spacer()
            
            // Right side - QR code
            if let qrUrl = screen.qrUrl, !qrUrl.isEmpty {
                QRCodeView(url: qrUrl)
                    .frame(width: 180, height: 180)
            }
        }
        .padding(.horizontal, 80)
        .padding(.vertical, 60)
    }
}

// MARK: - QR Code View
struct QRCodeView: View {
    let url: String
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(.white)
                .shadow(color: .black.opacity(0.1), radius: 6, x: 0, y: 4)
            
            // Generate QR code
            if let qrImage = generateQRCode(from: url) {
                Image(uiImage: qrImage)
                    .interpolation(.none)
                    .resizable()
                    .aspectRatio(1, contentMode: .fit)
                    .padding(16)
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "qrcode")
                        .font(.system(size: 50))
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
                type: "ADOPTION",
                title: "Meet Alpaca",
                subtitle: "9 months old • Male",
                body: nil,
                imagePath: "https://example.com/cat.jpg",
                imageDisplayMode: "cover",
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


// MARK: - Adoption Showcase View (4-cat grid)
struct AdoptionShowcaseView: View {
    let screen: Screen
    let settings: Settings?
    let cats: [Screen]
    
    private let displayFont = "Georgia"
    private let bodyFont = "Helvetica Neue"
    
    var body: some View {
        ZStack {
            // Background color
            Color(hex: "#ffedd5") // orange-100
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Text("Meet Our Adoptable Cats")
                        .font(.custom(bodyFont, size: 28))
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color(hex: "#f97316")) // orange-500
                        .cornerRadius(50)
                    
                    Text(screen.title.isEmpty ? "Find Your Purrfect Match" : screen.title)
                        .font(.custom(displayFont, size: 48))
                        .fontWeight(.bold)
                        .foregroundColor(Color(hex: "#7c2d12")) // orange-900
                }
                .padding(.top, 40)
                
                // 2x2 Grid of cats
                HStack(spacing: 24) {
                    ForEach(0..<2, id: \.self) { col in
                        VStack(spacing: 24) {
                            ForEach(0..<2, id: \.self) { row in
                                let index = col * 2 + row
                                if index < cats.count {
                                    CatCard(cat: cats[index])
                                } else {
                                    EmptyCatCard()
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 60)
                
                // QR Code (if available)
                if let qrUrl = screen.qrUrl, !qrUrl.isEmpty {
                    HStack(spacing: 16) {
                        Text("Scan to see all adoptable cats")
                            .font(.custom(bodyFont, size: 20))
                            .foregroundColor(Color(hex: "#c2410c")) // orange-700
                        
                        QRCodeView(url: qrUrl)
                            .frame(width: 100, height: 100)
                    }
                    .padding(.bottom, 30)
                }
                
                Spacer()
            }
        }
    }
}

struct CatCard: View {
    let cat: Screen
    
    var body: some View {
        VStack(spacing: 0) {
            // Cat image
            if let imagePath = cat.imagePath, !imagePath.isEmpty {
                AsyncImage(url: URL(string: imagePath)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(height: 200)
                            .clipped()
                    case .failure:
                        catPlaceholder
                    case .empty:
                        ProgressView()
                            .frame(height: 200)
                    @unknown default:
                        catPlaceholder
                    }
                }
            } else {
                catPlaceholder
            }
            
            // Cat info
            VStack(alignment: .leading, spacing: 4) {
                Text(cat.title)
                    .font(.custom("Georgia", size: 28))
                    .fontWeight(.bold)
                    .foregroundColor(Color(hex: "#7c2d12"))
                    .lineLimit(1)
                
                if let subtitle = cat.subtitle, !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.custom("Helvetica Neue", size: 18))
                        .foregroundColor(Color(hex: "#c2410c"))
                        .lineLimit(1)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Color.white)
        }
        .frame(width: 350, height: 280)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
    }
    
    private var catPlaceholder: some View {
        ZStack {
            Color(hex: "#fed7aa") // orange-200
            Text("🐱")
                .font(.system(size: 60))
        }
        .frame(height: 200)
    }
}

struct EmptyCatCard: View {
    var body: some View {
        VStack(spacing: 8) {
            Text("🐱")
                .font(.system(size: 50))
            Text("Coming Soon")
                .font(.custom("Helvetica Neue", size: 18))
                .foregroundColor(Color(hex: "#fb923c")) // orange-400
        }
        .frame(width: 350, height: 280)
        .background(Color(hex: "#fed7aa").opacity(0.5)) // orange-200
        .cornerRadius(20)
    }
}
