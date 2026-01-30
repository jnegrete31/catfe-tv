import SwiftUI

/// A celebratory banner that displays recently adopted cats
/// Creates a positive atmosphere by celebrating successful adoptions
struct RecentlyAdoptedBanner: View {
    let adoptedCats: [Screen]
    
    @State private var scrollOffset: CGFloat = 0
    @State private var contentWidth: CGFloat = 0
    
    var body: some View {
        HStack(spacing: 0) {
            // Static label
            HStack(spacing: 12) {
                Text("🎉")
                    .font(.system(size: 28))
                Text("Recently Adopted!")
                    .font(.custom("Helvetica Neue", size: 24))
                    .fontWeight(.bold)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(Color(hex: "#16a34a")) // green-600
            
            // Divider
            Rectangle()
                .fill(Color.white.opacity(0.3))
                .frame(width: 1)
            
            // Scrolling cats container
            GeometryReader { geometry in
                HStack(spacing: 24) {
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
        .frame(height: 70)
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
    }
    
    private func startScrollAnimation() {
        // Calculate total width of content
        let itemWidth: CGFloat = 200 // Approximate width per cat item
        let totalWidth = CGFloat(adoptedCats.count) * itemWidth
        
        // Start animation
        withAnimation(
            .linear(duration: Double(adoptedCats.count) * 4)
            .repeatForever(autoreverses: false)
        ) {
            scrollOffset = -totalWidth
        }
    }
}

struct AdoptedCatItem: View {
    let cat: Screen
    
    var body: some View {
        HStack(spacing: 12) {
            // Cat thumbnail
            if let imagePath = cat.imagePath, !imagePath.isEmpty {
                AsyncImage(url: URL(string: imagePath)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 44, height: 44)
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(Color.white.opacity(0.5), lineWidth: 2)
                            )
                    case .failure, .empty:
                        catPlaceholder
                    @unknown default:
                        catPlaceholder
                    }
                }
            } else {
                catPlaceholder
            }
            
            // Cat name
            Text(cat.title.replacingOccurrences(of: "Meet ", with: ""))
                .font(.custom("Helvetica Neue", size: 20))
                .fontWeight(.semibold)
                .foregroundColor(.white)
            
            // Heart
            Text("❤️")
                .font(.system(size: 18))
        }
    }
    
    private var catPlaceholder: some View {
        ZStack {
            Circle()
                .fill(Color(hex: "#4ade80")) // green-400
                .frame(width: 44, height: 44)
            Text("🐱")
                .font(.system(size: 24))
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
