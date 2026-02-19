//
//  AdoptionCounterScreenView.swift
//  CatfeTVApp
//
//  Hybrid adoption counter: left side shows the counter with milestone celebrations,
//  right side shows a photo mosaic background with a rotating adopted cat carousel.
//

import SwiftUI

// MARK: - Milestone Detection

enum MilestoneTier: String {
    case bronze, silver, gold, diamond, none
    
    var colors: [Color] {
        switch self {
        case .diamond: return [Color(hex: "00CED1"), Color(hex: "7B68EE"), Color(hex: "FFD700")]
        case .gold:    return [Color(hex: "FFD700"), Color(hex: "FFA500"), Color(hex: "DAA520")]
        case .silver:  return [Color(hex: "C0C0C0"), Color(hex: "86C5A9"), Color(hex: "DAA520")]
        case .bronze:  return [Color(hex: "E8913A"), Color(hex: "DAA520"), Color(hex: "86C5A9")]
        case .none:    return [Color(hex: "E8913A"), Color(hex: "DAA520"), Color(hex: "86C5A9")]
        }
    }
    
    var glowColor: Color {
        switch self {
        case .diamond: return Color(hex: "00CED1").opacity(0.4)
        case .gold:    return Color(hex: "FFD700").opacity(0.4)
        case .silver:  return Color(hex: "C0C0C0").opacity(0.3)
        case .bronze:  return Color(hex: "E8913A").opacity(0.3)
        case .none:    return Color(hex: "DAA520").opacity(0.2)
        }
    }
    
    var confettiColors: [Color] {
        switch self {
        case .diamond: return [Color(hex: "FFD700"), Color(hex: "FF69B4"), Color(hex: "00CED1"), Color(hex: "FF6347"), Color(hex: "7B68EE")]
        case .gold:    return [Color(hex: "FFD700"), Color(hex: "DAA520"), Color(hex: "FFA500"), Color(hex: "E8913A"), Color(hex: "F5DEB3")]
        case .silver:  return [Color(hex: "C0C0C0"), Color(hex: "86C5A9"), Color(hex: "DAA520"), Color(hex: "E8913A"), Color(hex: "B8D4C8")]
        case .bronze:  return [Color(hex: "E8913A"), Color(hex: "DAA520"), Color(hex: "86C5A9"), Color(hex: "F5E6D3"), Color(hex: "CD853F")]
        case .none:    return []
        }
    }
}

struct MilestoneInfo {
    let isMilestone: Bool
    let label: String
    let tier: MilestoneTier
    
    static func detect(count: Int) -> MilestoneInfo {
        if count > 0 && count % 100 == 0 { return MilestoneInfo(isMilestone: true, label: "\(count) Forever Homes!", tier: .diamond) }
        if count > 0 && count % 50 == 0  { return MilestoneInfo(isMilestone: true, label: "\(count) Milestone!", tier: .gold) }
        if count > 0 && count % 25 == 0  { return MilestoneInfo(isMilestone: true, label: "\(count) and Counting!", tier: .silver) }
        if count > 0 && count % 10 == 0  { return MilestoneInfo(isMilestone: true, label: "\(count) Cats Loved!", tier: .bronze) }
        return MilestoneInfo(isMilestone: false, label: "", tier: .none)
    }
}

// MARK: - Main Screen

struct AdoptionCounterScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    var adoptionCats: [Screen] = []
    
    @State private var appeared = false
    @State private var displayCount: Int = 0
    @State private var countUpDone = false
    @State private var currentCatIndex: Int = 0
    @State private var glowPulse = false
    
    private var targetCount: Int { settings.totalAdoptionCount }
    private var milestone: MilestoneInfo { MilestoneInfo.detect(count: targetCount) }
    
    /// Adopted cats with photos for the carousel
    private var adoptedCatsWithPhotos: [Screen] {
        adoptionCats.filter { $0.isAdopted && $0.imageURL != nil && !($0.imageURL?.isEmpty ?? true) }
    }
    
    /// All cats with photos for the mosaic
    private var allCatsWithPhotos: [Screen] {
        adoptionCats.filter { $0.imageURL != nil && !($0.imageURL?.isEmpty ?? true) }
    }
    
    var body: some View {
        ZStack {
            // Full-screen confetti layer
            if milestone.isMilestone && countUpDone {
                ConfettiOverlay(tier: milestone.tier)
                    .allowsHitTesting(false)
            }
            
            // Split layout
            GeometryReader { geo in
                HStack(spacing: 0) {
                    // LEFT SIDE — Counter & branding
                    leftPanel(geo: geo)
                        .frame(width: geo.size.width * 0.5)
                    
                    // RIGHT SIDE — Photo mosaic + carousel
                    rightPanel(geo: geo)
                        .frame(width: geo.size.width * 0.5)
                }
            }
        }
        .background(Color(hex: "2d2d2d"))
        .onAppear {
            withAnimation(.easeOut(duration: 0.5)) { appeared = true }
            startCountUp()
            startCarousel()
        }
    }
    
    // MARK: - Left Panel (Counter)
    
    @ViewBuilder
    private func leftPanel(geo: GeometryProxy) -> some View {
        ZStack {
            // Warm cream background
            LinearGradient(
                colors: [Color(hex: "F5E6D3"), Color(hex: "EDE0D4"), Color(hex: "E8DDD0")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Warm glow
            RadialGradient(
                colors: [
                    milestone.isMilestone && countUpDone ? milestone.tier.glowColor : Color(hex: "DAA520").opacity(0.3),
                    .clear
                ],
                center: .topLeading,
                startRadius: 0,
                endRadius: 300
            )
            .opacity(milestone.isMilestone && countUpDone ? 0.7 : 0.4)
            
            // Milestone glow pulse
            if milestone.isMilestone && countUpDone {
                RadialGradient(
                    colors: [milestone.tier.glowColor, .clear],
                    center: .center,
                    startRadius: 0,
                    endRadius: geo.size.width * 0.4
                )
                .opacity(glowPulse ? 0.15 : 0)
                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: glowPulse)
                .onAppear { glowPulse = true }
            }
            
            // Mint accent bar at top (gold at milestones)
            VStack {
                Rectangle()
                    .fill(milestone.isMilestone && countUpDone ? Color(hex: "DAA520") : Color(hex: "86C5A9"))
                    .frame(height: 4)
                Spacer()
            }
            
            // Decorative cat silhouette
            VStack {
                Spacer()
                HStack {
                    Image(systemName: "cat.fill")
                        .font(.system(size: 80))
                        .foregroundColor(Color(hex: "2d2d2d").opacity(0.06))
                        .padding(.leading, 30)
                        .padding(.bottom, 30)
                    Spacer()
                }
            }
            
            // Content
            VStack(spacing: 0) {
                Spacer()
                
                // Milestone badge
                if milestone.isMilestone && countUpDone {
                    milestoneBadge
                        .transition(.scale.combined(with: .opacity))
                        .padding(.bottom, 16)
                }
                
                // "Forever Homes" label
                HStack(spacing: 8) {
                    Rectangle()
                        .fill(Color(hex: "DAA520"))
                        .frame(width: 40, height: 1)
                    Text("FOREVER HOMES")
                        .font(.system(size: 14, weight: .medium, design: .serif))
                        .tracking(6)
                        .foregroundColor(Color(hex: "86C5A9"))
                    Rectangle()
                        .fill(Color(hex: "DAA520"))
                        .frame(width: 40, height: 1)
                }
                .opacity(appeared ? 1 : 0)
                .padding(.bottom, 12)
                
                // Big counter number
                Text("\(displayCount)")
                    .font(.system(size: 160, weight: .black, design: .serif))
                    .foregroundStyle(
                        milestone.isMilestone && countUpDone
                        ? LinearGradient(colors: [Color(hex: "FFD700"), Color(hex: "E8913A"), Color(hex: "FFD700"), Color(hex: "DAA520")], startPoint: .topLeading, endPoint: .bottomTrailing)
                        : LinearGradient(colors: [Color(hex: "E8913A"), Color(hex: "DAA520"), Color(hex: "86C5A9")], startPoint: .top, endPoint: .bottom)
                    )
                    .shadow(color: milestone.isMilestone && countUpDone ? Color(hex: "FFD700").opacity(0.4) : Color(hex: "DAA520").opacity(0.2), radius: 15, y: 4)
                    .scaleEffect(milestone.isMilestone && countUpDone && glowPulse ? 1.03 : 1.0)
                    .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: glowPulse)
                    .opacity(appeared ? 1 : 0)
                
                // "Cats Adopted"
                Text("Cats Adopted")
                    .font(.system(size: 32, weight: .bold, design: .serif))
                    .foregroundColor(Color(hex: "2d2d2d"))
                    .tracking(3)
                    .opacity(appeared ? 1 : 0)
                    .padding(.top, 8)
                
                // Subtitle
                Text(milestone.isMilestone ? "Thank you for making this possible!" : "Every visit helps us find forever homes")
                    .font(.system(size: 16, weight: .regular, design: .serif))
                    .foregroundColor(Color(hex: "2d2d2d").opacity(0.5))
                    .padding(.top, 8)
                    .opacity(appeared ? 1 : 0)
                
                Spacer()
            }
            .padding(40)
        }
        .clipped()
    }
    
    // MARK: - Milestone Badge
    
    private var milestoneBadge: some View {
        HStack(spacing: 8) {
            Text("🎉")
                .font(.system(size: 20))
            Text(milestone.label.uppercased())
                .font(.system(size: 14, weight: .bold, design: .serif))
                .tracking(3)
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.3), radius: 3, y: 1)
            Text("🎉")
                .font(.system(size: 20))
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 10)
        .background(
            Capsule()
                .fill(
                    LinearGradient(
                        colors: milestone.tier.colors,
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .shadow(color: milestone.tier.glowColor, radius: 10, y: 4)
        )
    }
    
    // MARK: - Right Panel (Mosaic + Carousel)
    
    @ViewBuilder
    private func rightPanel(geo: GeometryProxy) -> some View {
        ZStack {
            // Dark background
            LinearGradient(
                colors: [Color(hex: "2d2d2d"), Color(hex: "1a1a1a")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Photo mosaic background
            photoMosaic(geo: geo)
                .opacity(0.2)
            
            // Dark overlay to make carousel pop
            RadialGradient(
                colors: [Color(hex: "1e1e1e").opacity(0.5), Color(hex: "1a1a1a").opacity(0.8)],
                center: .center,
                startRadius: 50,
                endRadius: geo.size.width * 0.5
            )
            
            // Amber glow
            RadialGradient(
                colors: [Color(hex: "DAA520").opacity(0.15), .clear],
                center: .topLeading,
                startRadius: 0,
                endRadius: 250
            )
            
            // Mint floor reflection
            VStack {
                Spacer()
                LinearGradient(
                    colors: [.clear, Color(hex: "86C5A9").opacity(0.1)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: geo.size.height * 0.25)
            }
            
            // "Recently Adopted" label
            VStack {
                Text("RECENTLY ADOPTED")
                    .font(.system(size: 14, weight: .medium))
                    .tracking(6)
                    .foregroundColor(Color(hex: "86C5A9").opacity(0.6))
                    .padding(.top, 40)
                Spacer()
            }
            
            // Cat card carousel
            VStack {
                Spacer()
                catCarousel(geo: geo)
                Spacer()
                
                // Dot indicators
                if adoptedCatsWithPhotos.count > 1 {
                    HStack(spacing: 8) {
                        ForEach(0..<min(adoptedCatsWithPhotos.count, 8), id: \.self) { i in
                            Circle()
                                .fill(i == currentCatIndex % min(adoptedCatsWithPhotos.count, 8)
                                      ? Color(hex: "DAA520")
                                      : Color(hex: "F5E6D3").opacity(0.2))
                                .frame(width: 8, height: 8)
                                .scaleEffect(i == currentCatIndex % min(adoptedCatsWithPhotos.count, 8) ? 1.3 : 1.0)
                                .animation(.easeInOut(duration: 0.3), value: currentCatIndex)
                        }
                    }
                    .padding(.bottom, 30)
                }
            }
        }
        .clipped()
    }
    
    // MARK: - Photo Mosaic
    
    @ViewBuilder
    private func photoMosaic(geo: GeometryProxy) -> some View {
        let cols = 4
        let rows = 3
        let cellW = geo.size.width * 0.5 / CGFloat(cols)
        let cellH = geo.size.height / CGFloat(rows)
        
        VStack(spacing: 1) {
            ForEach(0..<rows, id: \.self) { row in
                HStack(spacing: 1) {
                    ForEach(0..<cols, id: \.self) { col in
                        let idx = row * cols + col
                        let cat = allCatsWithPhotos.isEmpty ? nil : allCatsWithPhotos[idx % allCatsWithPhotos.count]
                        
                        if let imageURL = cat?.imageURL, let url = URL(string: imageURL) {
                            CachedAsyncImage(url: url) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Rectangle()
                                    .fill(LinearGradient(colors: [Color(hex: "3a3a3a"), Color(hex: "2a2a2a")], startPoint: .topLeading, endPoint: .bottomTrailing))
                            }
                            .frame(width: cellW, height: cellH)
                            .clipped()
                        } else {
                            Rectangle()
                                .fill(LinearGradient(colors: [Color(hex: "3a3a3a"), Color(hex: "2a2a2a")], startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: cellW, height: cellH)
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Cat Carousel
    
    @ViewBuilder
    private func catCarousel(geo: GeometryProxy) -> some View {
        if adoptedCatsWithPhotos.isEmpty {
            VStack(spacing: 16) {
                Text("🐱")
                    .font(.system(size: 60))
                Text("More happy tails coming soon")
                    .font(.system(size: 22, weight: .medium, design: .serif))
                    .foregroundColor(Color(hex: "F5E6D3").opacity(0.5))
            }
        } else {
            let cat = adoptedCatsWithPhotos[currentCatIndex % adoptedCatsWithPhotos.count]
            
            // Polaroid-style card
            VStack(spacing: 0) {
                // Photo
                if let imageURL = cat.imageURL, let url = URL(string: imageURL) {
                    ZStack(alignment: .topTrailing) {
                        CachedAsyncImage(url: url) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle()
                                .fill(Color.loungeStone.opacity(0.3))
                                .overlay(
                                    ProgressView()
                                        .tint(.loungeAmber)
                                )
                        }
                        .frame(width: 280, height: 280)
                        .clipped()
                        
                        // "Adopted!" ribbon
                        Text("Adopted!")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                            .tracking(1)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(
                                Capsule()
                                    .fill(LinearGradient(colors: [Color(hex: "86C5A9"), Color(hex: "6BAF92")], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .shadow(color: .black.opacity(0.3), radius: 4, y: 2)
                            )
                            .padding(12)
                    }
                }
                
                // Info
                VStack(spacing: 4) {
                    Text(cat.catName ?? cat.title.replacingOccurrences(of: "Meet ", with: ""))
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundColor(Color(hex: "2d2d2d"))
                    
                    if let breed = cat.catBreed {
                        Text(breed)
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "2d2d2d").opacity(0.5))
                    }
                }
                .padding(.vertical, 16)
                .padding(.horizontal, 20)
            }
            .frame(width: 280)
            .background(Color(hex: "F5E6D3"))
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.4), radius: 20, y: 10)
            .id(currentCatIndex) // Force view recreation for transition
            .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal: .move(edge: .leading).combined(with: .opacity)
            ))
            .animation(.easeInOut(duration: 0.6), value: currentCatIndex)
        }
    }
    
    // MARK: - Animations
    
    private func startCountUp() {
        guard targetCount > 0 else { return }
        let steps = 60
        let interval = 2.0 / Double(steps)
        let increment = Double(targetCount) / Double(steps)
        var current = 0.0
        
        Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { timer in
            current += increment
            if current >= Double(targetCount) {
                displayCount = targetCount
                countUpDone = true
                timer.invalidate()
            } else {
                displayCount = Int(current)
            }
        }
    }
    
    private func startCarousel() {
        guard adoptedCatsWithPhotos.count > 1 else { return }
        Timer.scheduledTimer(withTimeInterval: 4.0, repeats: true) { _ in
            withAnimation {
                currentCatIndex = (currentCatIndex + 1) % adoptedCatsWithPhotos.count
            }
        }
    }
}

// MARK: - Confetti Overlay

struct ConfettiOverlay: View {
    let tier: MilestoneTier
    
    var body: some View {
        ZStack {
            ForEach(0..<50, id: \.self) { i in
                ConfettiParticle(index: i, colors: tier.confettiColors)
            }
        }
        .allowsHitTesting(false)
    }
}

struct ConfettiParticle: View {
    let index: Int
    let colors: [Color]
    
    @State private var animate = false
    
    private var color: Color { colors[index % colors.count] }
    private var size: CGFloat { CGFloat.random(in: 6...14) }
    private var startX: CGFloat { CGFloat.random(in: 0...1920) }
    private var delay: Double { Double.random(in: 0...2) }
    private var duration: Double { Double.random(in: 3...6) }
    private var rotation: Double { Double.random(in: -360...360) }
    private var drift: CGFloat { CGFloat.random(in: -80...80) }
    
    // Shapes: 0 = rectangle, 1 = circle, 2 = rounded rect
    private var shapeType: Int { index % 3 }
    
    var body: some View {
        Group {
            switch shapeType {
            case 0:
                Rectangle()
                    .fill(color)
                    .frame(width: size, height: size * 0.6)
            case 1:
                Circle()
                    .fill(color)
                    .frame(width: size, height: size)
            default:
                RoundedRectangle(cornerRadius: 2)
                    .fill(color)
                    .frame(width: size, height: size)
            }
        }
        .position(x: startX + (animate ? drift : 0), y: animate ? 1200 : -20)
        .rotationEffect(.degrees(animate ? rotation : 0))
        .opacity(animate ? 0 : 1)
        .onAppear {
            withAnimation(
                .easeIn(duration: duration)
                .delay(delay)
                .repeatForever(autoreverses: false)
            ) {
                animate = true
            }
        }
    }
}
