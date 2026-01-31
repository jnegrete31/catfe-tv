import SwiftUI

/// A celebratory banner that displays recently adopted cats
/// Creates a positive atmosphere by celebrating successful adoptions
/// Now with improved visibility and larger sizing for TV displays
struct RecentlyAdoptedBanner: View {
    let adoptedCats: [Screen]
    
    @State private var scrollOffset: CGFloat = 0
    @State private var contentWidth: CGFloat = 0
    
    var body: some View {
        HStack(spacing: 0) {
            // Static label - larger and more prominent
            HStack(spacing: 16) {
                Text("🎉")
                    .font(.system(size: 40))
                    .modifier(BounceEffect())
                Text("Recently Adopted!")
                    .font(.custom("Helvetica Neue", size: 32))
                    .fontWeight(.bold)
                    .tracking(0.5)
            }
            .padding(.horizontal, 32)
            .padding(.vertical, 20)
            .background(Color(hex: "#16a34a")) // green-600
            
            // Divider - thicker
            Rectangle()
                .fill(Color.white.opacity(0.4))
                .frame(width: 2)
            
            // Scrolling cats container
            GeometryReader { geometry in
                HStack(spacing: 32) {
                    ForEach(adoptedCats, id: \.id) { cat in
                        AdoptedCatItem(cat: cat)
                    }
                    
                    // Duplicate for seamless loop
                    ForEach(adoptedCats, id: \.id) { cat in
                        AdoptedCatItem(cat: cat)
                            .id("dup-\(cat.id)")
                    }
                }
                .offset(x: scrollOffset)
                .onAppear {
                    startScrollAnimation()
                }
            }
            .frame(maxWidth: .infinity)
            .clipped()
        }
        .frame(height: 100) // Larger height for better TV visibility
        .background(
            LinearGradient(
                colors: [
                    Color(hex: "#16a34a"), // green-600
                    Color(hex: "#22c55e"), // green-500
                    Color(hex: "#10b981")  // emerald-500
                ],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .overlay(
            // Top border for visual separation
            Rectangle()
                .fill(Color(hex: "#86efac")) // green-300
                .frame(height: 4),
            alignment: .top
        )
        .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: -5)
    }
    
    private func startScrollAnimation() {
        // Calculate total width of content
        let itemWidth: CGFloat = 250 // Larger width per cat item
        let totalWidth = CGFloat(adoptedCats.count) * itemWidth
        
        // Start animation - slower for better readability
        withAnimation(
            .linear(duration: Double(adoptedCats.count) * 5)
            .repeatForever(autoreverses: false)
        ) {
            scrollOffset = -totalWidth
        }
    }
}

// Bounce animation effect
struct BounceEffect: ViewModifier {
    @State private var isAnimating = false
    
    func body(content: Content) -> some View {
        content
            .offset(y: isAnimating ? -5 : 5)
            .animation(
                .easeInOut(duration: 0.8)
                .repeatForever(autoreverses: true),
                value: isAnimating
            )
            .onAppear {
                isAnimating = true
            }
    }
}

struct AdoptedCatItem: View {
    let cat: Screen
    
    var body: some View {
        HStack(spacing: 16) {
            // Cat thumbnail - larger for TV visibility
            if let imagePath = cat.imagePath, !imagePath.isEmpty {
                AsyncImage(url: URL(string: imagePath)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 60, height: 60)
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(Color.white, lineWidth: 3)
                            )
                            .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 2)
                    case .failure, .empty:
                        catPlaceholder
                    @unknown default:
                        catPlaceholder
                    }
                }
            } else {
                catPlaceholder
            }
            
            // Cat name - larger text
            Text(cat.title.replacingOccurrences(of: "Meet ", with: ""))
                .font(.custom("Helvetica Neue", size: 28))
                .fontWeight(.bold)
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
            
            // Heart - larger and animated
            Text("❤️")
                .font(.system(size: 28))
                .modifier(PulseEffect())
        }
    }
    
    private var catPlaceholder: some View {
        ZStack {
            Circle()
                .fill(Color(hex: "#4ade80")) // green-400
                .frame(width: 60, height: 60)
                .overlay(
                    Circle()
                        .stroke(Color.white, lineWidth: 3)
                )
            Text("🐱")
                .font(.system(size: 32))
        }
    }
}

// Pulse animation effect for hearts
struct PulseEffect: ViewModifier {
    @State private var isAnimating = false
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(isAnimating ? 1.1 : 0.9)
            .animation(
                .easeInOut(duration: 0.6)
                .repeatForever(autoreverses: true),
                value: isAnimating
            )
            .onAppear {
                isAnimating = true
            }
    }
}

#Preview {
    VStack {
        Spacer()
        RecentlyAdoptedBanner(adoptedCats: [
            Screen(
                id: 1,
                type: "ADOPTION",
                title: "Meet Whiskers",
                subtitle: "2 years old",
                body: nil,
                imagePath: nil,
                imageDisplayMode: nil,
                qrUrl: nil,
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
                isAdopted: true,
                createdAt: "",
                updatedAt: ""
            ),
            Screen(
                id: 2,
                type: "ADOPTION",
                title: "Meet Luna",
                subtitle: "1 year old",
                body: nil,
                imagePath: nil,
                imageDisplayMode: nil,
                qrUrl: nil,
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
                isAdopted: true,
                createdAt: "",
                updatedAt: ""
            )
        ])
    }
    .background(Color.gray)
}
