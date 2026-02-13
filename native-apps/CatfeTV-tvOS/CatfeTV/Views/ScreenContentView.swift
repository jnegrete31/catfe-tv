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
    var availableCats: [CatModel] = []
    var catCounts: CatCountsResponse?
    
    var body: some View {
        Group {
            if screen.type == .adoptionShowcase && !availableCats.isEmpty {
                AdoptionShowcaseView(cats: availableCats, catCounts: catCounts)
            } else {
                defaultScreenView
            }
        }
    }
    
    var defaultScreenView: some View {
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
                    // Type badge (or Adopted/Looking for Love badge for adoption screens)
                    if screen.type == .adoption && screen.isAdopted == true {
                        HStack(spacing: 8) {
                            Text("\u{1F389}")
                            Text("Found a Forever Home!")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(LoungeColors.mintGreen)
                        .clipShape(Capsule())
                    } else if screen.type == .adoption {
                        HStack(spacing: 8) {
                            Text("\u{1F431}")
                            Text("Looking for Love")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(LoungeColors.warmOrange)
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
                    
                    // Body (personality tags for adoption screens)
                    if let body = screen.body, !body.isEmpty {
                        if screen.type == .adoption {
                            // Show personality tags as styled pills
                            let tags = body.components(separatedBy: " \u{00B7} ")
                            FlowLayout(spacing: 8) {
                                ForEach(tags, id: \.self) { tag in
                                    Text(tag.trimmingCharacters(in: .whitespaces))
                                        .font(.system(size: 22, weight: .medium))
                                        .foregroundColor(LoungeColors.cream)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(Color.white.opacity(0.15))
                                        .clipShape(Capsule())
                                }
                            }
                            .padding(.top, 8)
                        } else {
                            Text(body)
                                .font(.system(size: 28))
                                .foregroundColor(LoungeColors.cream.opacity(0.7))
                                .lineLimit(4)
                                .padding(.top, 8)
                        }
                    }
                    
                    // "Scan the QR to Adopt Me" quote for adoption screens
                    if screen.type == .adoption && screen.isAdopted != true {
                        Text("\"Scan the QR to Adopt Me :)\"")
                            .font(.system(size: 22, weight: .medium, design: .serif))
                            .italic()
                            .foregroundColor(LoungeColors.cream.opacity(0.7))
                            .padding(16)
                            .background(Color.white.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
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
                    }
                    .padding(.trailing, 80)
                    .padding(.vertical, 60)
                }
            }
        }
    }
}

// MARK: - Adoption Showcase View (uses cats from database)
struct AdoptionShowcaseView: View {
    let cats: [CatModel]
    let catCounts: CatCountsResponse?
    @State private var displayCats: [CatModel] = []
    @State private var rotations: [Double] = [-2, 3, -3, 2]
    
    let timer = Timer.publish(every: 6, on: .main, in: .common).autoconnect()
    
    var body: some View {
        ZStack {
            // Dark industrial background
            LoungeColors.charcoal
                .ignoresSafeArea()
            
            // Warm amber light glows
            GeometryReader { geometry in
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
                    colors: [Color.clear, LoungeColors.mintGreen.opacity(0.2)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 200)
            }
            .ignoresSafeArea()
            
            // Header
            VStack {
                VStack(spacing: 8) {
                    HStack(spacing: 0) {
                        Text("Meet")
                            .foregroundColor(LoungeColors.warmOrange)
                        Text(" Our ")
                            .foregroundColor(.white.opacity(0.9))
                        Text("Cats")
                            .foregroundColor(LoungeColors.mintGreen)
                    }
                    .font(.system(size: 72, weight: .bold, design: .serif))
                    
                    Text("FIND YOUR PURRFECT MATCH")
                        .font(.system(size: 24, weight: .medium))
                        .tracking(6)
                        .foregroundColor(.white.opacity(0.5))
                    
                    // Adoption counter
                    if let counts = catCounts, counts.adopted > 0 {
                        HStack(spacing: 12) {
                            Text("\u{1F389}")
                                .font(.system(size: 28))
                            Text("\(counts.adopted) \(counts.adopted == 1 ? "cat" : "cats") found their forever home!")
                                .font(.system(size: 22, weight: .medium))
                                .foregroundColor(LoungeColors.mintGreen)
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(
                            Capsule()
                                .stroke(LoungeColors.mintGreen, lineWidth: 2)
                                .background(LoungeColors.mintGreen.opacity(0.15))
                                .clipShape(Capsule())
                        )
                        .padding(.top, 16)
                    }
                }
                .padding(.top, 40)
                
                Spacer()
                
                // Polaroid grid
                HStack(spacing: 20) {
                    ForEach(Array(displayCats.prefix(4).enumerated()), id: \.element.id) { index, cat in
                        CatPolaroidCard(cat: cat, rotation: rotations[index])
                    }
                    
                    // Empty placeholders
                    if displayCats.count < 4 {
                        ForEach(displayCats.count..<4, id: \.self) { index in
                            EmptyPolaroidCard(rotation: rotations[index])
                        }
                    }
                }
                .padding(.horizontal, 40)
                
                Spacer()
                
                // Cat count indicator
                HStack(spacing: 8) {
                    Text("\u{1F43E}")
                        .font(.system(size: 18))
                    Text("\(cats.count) cats looking for homes")
                        .font(.system(size: 16))
                        .foregroundColor(.white.opacity(0.8))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.white.opacity(0.1))
                .clipShape(Capsule())
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            shuffleCats()
        }
        .onReceive(timer) { _ in
            if cats.count > 4 {
                withAnimation(.easeInOut(duration: 0.6)) {
                    shuffleCats()
                }
            }
        }
    }
    
    private func shuffleCats() {
        displayCats = Array(cats.shuffled().prefix(4))
    }
}

// MARK: - Cat Polaroid Card
struct CatPolaroidCard: View {
    let cat: CatModel
    let rotation: Double
    
    var body: some View {
        VStack(spacing: 0) {
            // Photo
            if let photoUrl = cat.photoUrl {
                AsyncImageView(url: photoUrl)
                    .frame(width: 300, height: 300)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
            } else {
                ZStack {
                    LinearGradient(
                        colors: [Color.orange.opacity(0.2), Color.pink.opacity(0.2)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    Text("\u{1F431}")
                        .font(.system(size: 80))
                }
                .frame(width: 300, height: 300)
                .clipShape(RoundedRectangle(cornerRadius: 4))
            }
            
            // Name and breed
            VStack(spacing: 4) {
                Text("Meet \(cat.name)")
                    .font(.system(size: 24, weight: .semibold, design: .serif))
                    .foregroundColor(LoungeColors.charcoal)
                    .lineLimit(1)
                
                Text([cat.breed, cat.colorPattern].compactMap { $0 }.joined(separator: " \u{00B7} "))
                    .font(.system(size: 18))
                    .foregroundColor(LoungeColors.stone)
                    .lineLimit(1)
            }
            .padding(.vertical, 12)
        }
        .padding(12)
        .background(Color(hex: "#FFFEF9"))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .shadow(color: .black.opacity(0.4), radius: 20, x: 0, y: 15)
        .rotationEffect(.degrees(rotation))
    }
}

// MARK: - Empty Polaroid Placeholder
struct EmptyPolaroidCard: View {
    let rotation: Double
    
    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                Color.white.opacity(0.1)
                VStack(spacing: 8) {
                    Text("\u{1F431}")
                        .font(.system(size: 60))
                    Text("Coming Soon")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.5))
                }
            }
            .frame(width: 300, height: 300)
        }
        .padding(12)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.white.opacity(0.3), style: StrokeStyle(lineWidth: 2, dash: [8]))
        )
        .rotationEffect(.degrees(rotation))
        .opacity(0.5)
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
        case .adoptionCounter: return "🏠"
        case .thankYou: return "🙏"
        case .livestream: return "📹"
        case .happyTails: return "🐾"
        case .snapPurrGallery: return "🖼️"
        case .happyTailsQr: return "📱"
        case .snapPurrQr: return "📱"
        case .poll: return "🗳️"
        case .pollQr: return "🗳️"
        case .checkIn: return "✅"
        case .guestStatusBoard: return "📋"
        case .custom: return "✨"
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

// MARK: - Flow Layout for Tag Pills
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > maxWidth && currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
        }
        
        return CGSize(width: maxWidth, height: currentY + lineHeight)
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var currentX: CGFloat = bounds.minX
        var currentY: CGFloat = bounds.minY
        var lineHeight: CGFloat = 0
        
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > bounds.maxX && currentX > bounds.minX {
                currentX = bounds.minX
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            subview.place(at: CGPoint(x: currentX, y: currentY), proposal: .unspecified)
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
        }
    }
}

#Preview {
    ScreenContentView(
        screen: Screen(
            id: 1,
            type: .adoption,
            title: "Meet Whiskers",
            subtitle: "2 years old \u{2022} Female",
            body: "Playful \u{00B7} Gentle \u{00B7} Loves Cuddles",
            imagePath: nil,
            imageDisplayMode: nil,
            qrUrl: "https://www.shelterluv.com/matchme/adopt/KRLA/Cat",
            startAt: nil,
            endAt: nil,
            daysOfWeek: nil,
            timeStart: nil,
            timeEnd: nil,
            priority: 1,
            durationSeconds: 10,
            sortOrder: 0,
            isActive: true,
            schedulingEnabled: false,
            isProtected: false,
            isAdopted: false,
            livestreamUrl: nil,
            eventDate: nil,
            eventTime: nil,
            eventLocation: nil,
            createdAt: "2026-02-13T00:00:00.000Z",
            updatedAt: "2026-02-13T00:00:00.000Z"
        ),
        availableCats: [],
        catCounts: nil
    )
}
