import SwiftUI

struct ScreenContentView: View {
    let screen: Screen
    
    var body: some View {
        ZStack {
            // Background color based on screen type
            Color(hex: screen.type.backgroundColor)
                .ignoresSafeArea()
            
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
                        .background(Color(hex: "#22c55e"))
                        .clipShape(Capsule())
                    } else {
                        Text(screen.type.displayName)
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color(hex: getAccentColor()))
                            .clipShape(Capsule())
                    }
                    
                    // Title
                    Text(screen.title)
                        .font(.system(size: 72, weight: .bold, design: .serif))
                        .foregroundColor(Color(hex: getTextColor()))
                        .lineLimit(3)
                    
                    // Subtitle
                    if let subtitle = screen.subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.system(size: 36, weight: .medium))
                            .foregroundColor(Color(hex: getTextColor()).opacity(0.8))
                            .lineLimit(2)
                    }
                    
                    // Body
                    if let body = screen.body, !body.isEmpty {
                        Text(body)
                            .font(.system(size: 28))
                            .foregroundColor(Color(hex: getTextColor()).opacity(0.7))
                            .lineLimit(4)
                            .padding(.top, 8)
                    }
                    
                    Spacer()
                    
                    // QR Code placeholder (tvOS can't scan, but show URL)
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
                        .foregroundColor(Color(hex: getTextColor()))
                        .padding(20)
                        .background(Color.white.opacity(0.3))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                }
                .padding(.leading, 80)
                .padding(.vertical, 80)
                .frame(maxWidth: screen.imagePath != nil ? .infinity : nil, alignment: .leading)
                
                // Image (if present)
                if let imagePath = screen.imagePath, !imagePath.isEmpty {
                    AsyncImageView(url: imagePath)
                        .frame(width: 800)
                        .clipShape(RoundedRectangle(cornerRadius: 24))
                        .shadow(radius: 20)
                        .padding(.trailing, 80)
                        .padding(.vertical, 80)
                }
            }
        }
    }
    
    private func getAccentColor() -> String {
        switch screen.type {
        case .snapAndPurr: return "#d97706"
        case .event: return "#db2777"
        case .todayAtCatfe: return "#2563eb"
        case .membership: return "#059669"
        case .reminder: return "#dc2626"
        case .adoption: return "#7c3aed"
        case .adoptionShowcase: return "#f97316"
        case .thankYou: return "#4f46e5"
        }
    }
    
    private func getTextColor() -> String {
        switch screen.type {
        case .snapAndPurr: return "#78350f"
        case .event: return "#831843"
        case .todayAtCatfe: return "#1e3a8a"
        case .membership: return "#064e3b"
        case .reminder: return "#7f1d1d"
        case .adoption: return "#4c1d95"
        case .adoptionShowcase: return "#7c2d12"
        case .thankYou: return "#312e81"
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
        type: .membership,
        title: "Become a Member",
        subtitle: "Unlimited cat time + perks",
        body: "Members get 20% off drinks, priority reservations, and exclusive events.",
        imagePath: nil,
        qrUrl: "https://catfe.com/membership",
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
