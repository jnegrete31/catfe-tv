import SwiftUI

// MARK: - Lounge Color Palette
struct LoungeColors {
    static let mintGreen = Color(hex: "#a8d5ba")
    static let warmOrange = Color(hex: "#f97316")
    static let cream = Color(hex: "#fef3c7")
    static let amber = Color(hex: "#d97706")
    static let charcoal = Color(hex: "#1f2937")
    static let darkBrown = Color(hex: "#292524")
    static let stone = Color(hex: "#78716c")
}

struct ScreenContentView: View {
    let screen: Screen
    
    var body: some View {
        ZStack {
            // Dark industrial background
            LoungeColors.charcoal
                .ignoresSafeArea()
            
            // Warm amber light glows (like wicker pendant lights)
            GeometryReader { geometry in
                // Left amber glow
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [LoungeColors.amber.opacity(0.3), Color.clear],
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
                            colors: [LoungeColors.warmOrange.opacity(0.2), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geometry.size.width * 0.35
                        )
                    )
                    .frame(width: geometry.size.width * 0.7, height: geometry.size.width * 0.7)
                    .position(x: geometry.size.width * 0.75, y: -geometry.size.height * 0.05)
            }
            
            // Mint green floor reflection
            VStack {
                Spacer()
                LinearGradient(
                    colors: [Color.clear, LoungeColors.mintGreen.opacity(0.3)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 200)
            }
            .ignoresSafeArea()
            
            // Playful cat decorations
            GeometryReader { geometry in
                // Bottom right cat emoji
                Text("🐱")
                    .font(.system(size: 80))
                    .opacity(0.1)
                    .position(x: geometry.size.width - 100, y: geometry.size.height - 60)
                
                // Paw prints
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
            
            // Content layout
            HStack(spacing: 0) {
                // Text content
                VStack(alignment: .leading, spacing: 24) {
                    // Type badge (or Adopted badge for adoption screens)
                    if screen.type == .adoption && screen.isAdopted == true {
                        HStack(spacing: 8) {
                            Text("🎉")
                            Text("Adopted!")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(LoungeColors.mintGreen)
                        .clipShape(Capsule())
                    } else {
                        HStack(spacing: 8) {
                            Text(screen.type.emoji)
                            Text(screen.type.displayName)
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(LoungeColors.warmOrange)
                        .clipShape(Capsule())
                    }
                    
                    // Title
                    Text(screen.title)
                        .font(.system(size: 72, weight: .bold, design: .serif))
                        .foregroundColor(LoungeColors.cream)
                        .lineLimit(3)
                    
                    // Subtitle
                    if let subtitle = screen.subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.system(size: 36, weight: .medium))
                            .foregroundColor(LoungeColors.cream.opacity(0.8))
                            .lineLimit(2)
                    }
                    
                    // Body
                    if let body = screen.body, !body.isEmpty {
                        Text(body)
                            .font(.system(size: 28))
                            .foregroundColor(LoungeColors.cream.opacity(0.7))
                            .lineLimit(4)
                            .padding(.top, 8)
                    }
                    
                    Spacer()
                    
                    // QR Code section with cream background
                    if let qrUrl = screen.qrUrl, !qrUrl.isEmpty {
                        HStack(spacing: 16) {
                            Image(systemName: "qrcode")
                                .font(.system(size: 40))
                            
                            VStack(alignment: .leading) {
                                Text("Scan to learn more")
                                    .font(.headline)
                                Text(qrUrl)
                                    .font(.caption)
                                    .opacity(0.7)
                            }
                        }
                        .foregroundColor(LoungeColors.charcoal)
                        .padding(20)
                        .background(LoungeColors.cream)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                }
                .padding(.leading, 80)
                .padding(.vertical, 80)
                .frame(maxWidth: screen.imagePath != nil ? .infinity : nil, alignment: .leading)
                
                // Image in cream polaroid frame (if present)
                if let imagePath = screen.imagePath, !imagePath.isEmpty {
                    VStack(spacing: 0) {
                        // Polaroid frame
                        VStack(spacing: 16) {
                            AsyncImageView(url: imagePath)
                                .frame(width: 700, height: 500)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            
                            // Cat name under photo (for adoption screens)
                            if screen.type == .adoption {
                                Text(screen.title)
                                    .font(.system(size: 28, weight: .medium, design: .serif))
                                    .foregroundColor(LoungeColors.charcoal)
                            }
                        }
                        .padding(24)
                        .background(LoungeColors.cream)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .shadow(color: Color.black.opacity(0.3), radius: 20, x: 0, y: 10)
                        .rotationEffect(.degrees(-2))
                    }
                    .padding(.trailing, 80)
                    .padding(.vertical, 60)
                }
            }
        }
    }
}

// MARK: - Screen Type Extensions
extension ScreenType {
    var emoji: String {
        switch self {
        case .snapAndPurr: return "📸"
        case .event: return "🎉"
        case .todayAtCatfe: return "☀️"
        case .membership: return "⭐"
        case .reminder: return "📢"
        case .adoption: return "❤️"
        case .adoptionShowcase: return "🐱"
        case .thankYou: return "🙏"
        }
    }
}

// MARK: - Async Image View with Caching
struct AsyncImageView: View {
    let url: String
    @State private var imageData: Data?
    @State private var isLoading = true
    
    var body: some View {
        Group {
            if let data = imageData, let uiImage = UIImage(data: data) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else if isLoading {
                ProgressView()
                    .scaleEffect(1.5)
            } else {
                Image(systemName: "photo")
                    .font(.system(size: 60))
                    .foregroundColor(.gray)
            }
        }
        .task {
            await loadImage()
        }
    }
    
    private func loadImage() async {
        isLoading = true
        do {
            imageData = try await ImageCache.shared.getImage(from: url)
        } catch {
            print("Failed to load image: \(error)")
        }
        isLoading = false
    }
}

#Preview {
    ScreenContentView(screen: Screen(
        id: 1,
        type: .adoption,
        title: "Meet Whiskers",
        subtitle: "2 years old • Female",
        body: "A sweet and playful cat looking for her forever home.",
        imagePath: nil,
        qrUrl: "https://catfe.com/adopt/whiskers",
        startDate: nil,
        endDate: nil,
        daysOfWeek: nil,
        startTime: nil,
        endTime: nil,
        priority: 1,
        durationSeconds: 10,
        isActive: true,
        isAdopted: false,
        sortOrder: 0,
        createdAt: Date(),
        updatedAt: Date()
    ))
}
