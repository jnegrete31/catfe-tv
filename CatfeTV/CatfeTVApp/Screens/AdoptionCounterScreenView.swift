//
//  AdoptionCounterScreenView.swift
//  CatfeTVApp
//
//  Adoption Counter screen — Premium dark theme
//  Split layout: counter on left, photo mosaic + carousel on right
//

import SwiftUI

// MARK: - Milestone Detection

struct MilestoneInfo {
    let isMilestone: Bool
    let label: String
    let tier: MilestoneTier
}

enum MilestoneTier: String {
    case bronze, silver, gold, diamond
    
    var glowColor: Color {
        switch self {
        case .diamond: return Color(hex: "00CED1")
        case .gold: return Color(hex: "FFD700")
        case .silver: return Color(hex: "C0C0C0")
        case .bronze: return Color(hex: "E8913A")
        }
    }
    
    var gradientColors: [Color] {
        switch self {
        case .diamond: return [Color(hex: "00CED1"), Color(hex: "7B68EE"), Color(hex: "FFD700")]
        case .gold: return [Color(hex: "FFD700"), Color(hex: "FFA500"), Color(hex: "DAA520")]
        case .silver: return [Color(hex: "C0C0C0"), Color(hex: "86C5A9"), Color(hex: "DAA520")]
        case .bronze: return [Color(hex: "E8913A"), Color(hex: "DAA520"), Color(hex: "86C5A9")]
        }
    }
}

private func getMilestoneInfo(count: Int) -> MilestoneInfo {
    if count > 0 && count % 100 == 0 {
        return MilestoneInfo(isMilestone: true, label: "\(count) Forever Homes!", tier: .diamond)
    }
    if count > 0 && count % 50 == 0 {
        return MilestoneInfo(isMilestone: true, label: "\(count) Milestone!", tier: .gold)
    }
    if count > 0 && count % 25 == 0 {
        return MilestoneInfo(isMilestone: true, label: "\(count) and Counting!", tier: .silver)
    }
    if count > 0 && count % 10 == 0 {
        return MilestoneInfo(isMilestone: true, label: "\(count) Happy Cats!", tier: .bronze)
    }
    return MilestoneInfo(isMilestone: false, label: "", tier: .bronze)
}

// MARK: - Premium Dark Theme Colors

private let premiumBg = Color(hex: "1C1410")
private let premiumCream = Color(hex: "F5E6D3")
private let premiumCopper = Color(hex: "C4956A")
private let premiumBronze = Color(hex: "B87333")
private let premiumGold = Color(hex: "D4A574")
private let premiumDarkCard = Color(hex: "2A1F18")

// MARK: - Adoption Counter Screen (Premium Dark Theme)

struct AdoptionCounterScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    var adoptionCats: [Screen] = []
    
    @State private var appeared = false
    @State private var displayCount: Int = 0
    @State private var countUpDone = false
    @State private var currentCatIndex: Int = 0
    @State private var milestoneGlowOpacity: Double = 0
    
    var adoptionCount: Int = 0
    
    private var targetCount: Int {
        adoptionCount > 0 ? adoptionCount : settings.totalAdoptionCount
    }
    
    private var milestone: MilestoneInfo {
        getMilestoneInfo(count: targetCount)
    }
    
    /// All cats with photos for the mosaic background
    private var allCatsWithPhotos: [Screen] {
        adoptionCats.filter { $0.imageURL != nil && !($0.imageURL?.isEmpty ?? true) }
    }
    
    /// Recently adopted cats for the carousel
    private var adoptedCats: [Screen] {
        adoptionCats.filter { $0.isAdopted && $0.imageURL != nil && !($0.imageURL?.isEmpty ?? true) }
    }
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Full dark background
                premiumBg.ignoresSafeArea()
                
                // Warm radial glows
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "8B5E3C").opacity(0.12), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.35
                    ))
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.25, y: geo.size.height * 0.1)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [premiumCopper.opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.25
                    ))
                    .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                    .position(x: geo.size.width * 0.8, y: geo.size.height * 0.85)
                
                // Top accent line
                VStack {
                    LinearGradient(
                        colors: [.clear, premiumCopper, premiumBronze, premiumGold, .clear],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(height: 2)
                    Spacer()
                }
                .ignoresSafeArea()
                
                // Split layout
                HStack(spacing: 0) {
                    // LEFT — Counter
                    leftSide(width: geo.size.width / 2, height: geo.size.height)
                    
                    // Vertical divider
                    LinearGradient(
                        colors: [.clear, premiumCopper.opacity(0.3), premiumGold.opacity(0.4), premiumCopper.opacity(0.3), .clear],
                        startPoint: .top, endPoint: .bottom
                    )
                    .frame(width: 1)
                    
                    // RIGHT — Photo mosaic + carousel
                    rightSide(width: geo.size.width / 2, height: geo.size.height)
                }
                
                // Confetti layer at milestones
                if milestone.isMilestone && countUpDone {
                    ConfettiView(tier: milestone.tier)
                        .allowsHitTesting(false)
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) { appeared = true }
            animateCounter()
            startCarouselTimer()
        }
    }
    
    // MARK: - Left Side (Counter)
    
    private func leftSide(width: CGFloat, height: CGFloat) -> some View {
        ZStack {
            // Milestone glow pulse
            if milestone.isMilestone && countUpDone {
                RadialGradient(
                    colors: [milestone.tier.glowColor.opacity(0.12), .clear],
                    center: .center,
                    startRadius: 0,
                    endRadius: width * 0.5
                )
                .opacity(milestoneGlowOpacity)
                .onAppear {
                    withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                        milestoneGlowOpacity = 1
                    }
                }
            }
            
            // Decorative cat silhouette
            VStack {
                Spacer()
                HStack {
                    CatSilhouette()
                        .opacity(0.04)
                        .frame(width: 120, height: 120)
                        .padding(.leading, 30)
                        .padding(.bottom, 30)
                    Spacer()
                }
            }
            
            // Main counter content
            VStack(spacing: 0) {
                Spacer()
                
                // Milestone badge
                if milestone.isMilestone && countUpDone {
                    milestoneBadge
                        .padding(.bottom, 16)
                }
                
                // "Forever Homes" label with decorative lines
                HStack(spacing: 12) {
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [.clear, premiumCopper],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .frame(width: 48, height: 1)
                    Text("Forever Homes")
                        .font(.system(size: 16, weight: .regular, design: .serif))
                        .tracking(6)
                        .textCase(.uppercase)
                        .foregroundColor(premiumCopper)
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [premiumCopper, .clear],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .frame(width: 48, height: 1)
                }
                .padding(.bottom, 16)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                
                // Big counter number
                Text("\(displayCount)")
                    .font(.system(size: 160, weight: .black, design: .serif))
                    .foregroundStyle(counterGradient)
                    .shadow(color: milestone.isMilestone && countUpDone
                        ? milestone.tier.glowColor.opacity(0.4)
                        : premiumGold.opacity(0.3),
                        radius: milestone.isMilestone && countUpDone ? 25 : 15, y: 4)
                    .scaleEffect(milestone.isMilestone && countUpDone && appeared ? 1.02 : 1.0)
                    .animation(
                        milestone.isMilestone && countUpDone
                            ? .easeInOut(duration: 1.5).repeatForever(autoreverses: true)
                            : .default,
                        value: appeared
                    )
                
                // "Cats Adopted" label
                Text("Cats Adopted")
                    .font(.system(size: 28, weight: .regular, design: .serif))
                    .tracking(3)
                    .foregroundColor(premiumCream)
                    .padding(.top, 12)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                
                // Decorative flourish
                HStack(spacing: 8) {
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [.clear, premiumCopper.opacity(0.5)],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .frame(width: 40, height: 1)
                    Text("✦")
                        .font(.system(size: 8))
                        .foregroundColor(premiumCopper.opacity(0.6))
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [premiumCopper.opacity(0.5), .clear],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .frame(width: 40, height: 1)
                }
                .padding(.top, 12)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6).delay(0.25), value: appeared)
                
                // Subtitle
                Text(milestone.isMilestone
                    ? "Thank you for making this possible!"
                    : "Every visit helps us find forever homes")
                    .font(.system(size: 16, weight: .regular, design: .serif))
                    .foregroundColor(premiumCream.opacity(0.5))
                    .padding(.top, 12)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                
                Spacer()
            }
            .padding(.horizontal, 40)
        }
        .frame(width: width, height: height)
    }
    
    // MARK: - Right Side (Photo Mosaic + Carousel)
    
    private func rightSide(width: CGFloat, height: CGFloat) -> some View {
        ZStack {
            // Photo mosaic background (dimmed)
            photoMosaic(width: width, height: height)
                .opacity(0.15)
            
            // Dark overlay to make carousel pop
            RadialGradient(
                colors: [
                    premiumBg.opacity(0.4),
                    premiumBg.opacity(0.7)
                ],
                center: .center,
                startRadius: 0,
                endRadius: width * 0.7
            )
            
            // Carousel content
            VStack(spacing: 24) {
                Spacer()
                
                if !adoptedCats.isEmpty {
                    // Recently adopted header
                    HStack(spacing: 8) {
                        Text("✦")
                            .font(.system(size: 8))
                            .foregroundColor(premiumCopper)
                        Text("Recently Adopted")
                            .font(.system(size: 18, weight: .medium, design: .serif))
                            .tracking(4)
                            .textCase(.uppercase)
                            .foregroundColor(premiumCopper)
                        Text("✦")
                            .font(.system(size: 8))
                            .foregroundColor(premiumCopper)
                    }
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                    
                    // Cat carousel card
                    if currentCatIndex < adoptedCats.count {
                        let cat = adoptedCats[currentCatIndex]
                        
                        VStack(spacing: 16) {
                            // Photo
                            if let imageURL = cat.imageURL {
                                ScreenImage(url: imageURL)
                                    .frame(width: width * 0.55, height: width * 0.55)
                                    .clipShape(RoundedRectangle(cornerRadius: 16))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16)
                                            .stroke(
                                                LinearGradient(
                                                    colors: [premiumCopper.opacity(0.4), premiumGold.opacity(0.2), premiumCopper.opacity(0.4)],
                                                    startPoint: .topLeading, endPoint: .bottomTrailing
                                                ),
                                                lineWidth: 1.5
                                            )
                                    )
                                    .shadow(color: premiumCopper.opacity(0.2), radius: 20, y: 8)
                            }
                            
                            // Cat name
                            Text(cat.title)
                                .font(.system(size: 28, weight: .bold, design: .serif))
                                .foregroundColor(premiumCream)
                            
                            // "Found their forever home" label
                            Text("Found their forever home 🏡")
                                .font(.system(size: 16, weight: .regular, design: .serif))
                                .foregroundColor(premiumCream.opacity(0.6))
                        }
                        .transition(.asymmetric(
                            insertion: .opacity.combined(with: .scale(scale: 0.95)),
                            removal: .opacity.combined(with: .scale(scale: 1.05))
                        ))
                        .id("cat-\(currentCatIndex)")
                    }
                    
                    // Page dots
                    if adoptedCats.count > 1 {
                        HStack(spacing: 6) {
                            ForEach(0..<min(adoptedCats.count, 8), id: \.self) { i in
                                Circle()
                                    .fill(i == currentCatIndex % min(adoptedCats.count, 8)
                                        ? premiumCopper
                                        : premiumCream.opacity(0.2))
                                    .frame(width: 6, height: 6)
                            }
                        }
                    }
                } else {
                    // Empty state
                    VStack(spacing: 16) {
                        Text("🐱")
                            .font(.system(size: 60))
                        Text("Every cat deserves a\nforever home")
                            .font(.system(size: 22, weight: .medium, design: .serif))
                            .foregroundColor(premiumCream.opacity(0.6))
                            .multilineTextAlignment(.center)
                    }
                }
                
                Spacer()
            }
            .padding(30)
        }
        .frame(width: width, height: height)
        .clipped()
    }
    
    // MARK: - Photo Mosaic
    
    private func photoMosaic(width: CGFloat, height: CGFloat) -> some View {
        let columns = 4
        let rows = 4
        let tileW = width / CGFloat(columns)
        let tileH = height / CGFloat(rows)
        
        return ZStack {
            ForEach(0..<(columns * rows), id: \.self) { index in
                let col = index % columns
                let row = index / columns
                
                if index < allCatsWithPhotos.count,
                   let url = allCatsWithPhotos[index].imageURL {
                    ScreenImage(url: url)
                        .frame(width: tileW, height: tileH)
                        .clipped()
                        .position(
                            x: CGFloat(col) * tileW + tileW / 2,
                            y: CGFloat(row) * tileH + tileH / 2
                        )
                } else {
                    Rectangle()
                        .fill(premiumDarkCard.opacity(0.5))
                        .frame(width: tileW, height: tileH)
                        .position(
                            x: CGFloat(col) * tileW + tileW / 2,
                            y: CGFloat(row) * tileH + tileH / 2
                        )
                }
            }
        }
        .frame(width: width, height: height)
    }
    
    // MARK: - Milestone Badge
    
    private var milestoneBadge: some View {
        Text(milestone.label)
            .font(.system(size: 18, weight: .bold, design: .serif))
            .foregroundColor(premiumBg)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(LinearGradient(
                        colors: milestone.tier.gradientColors,
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
            )
            .shadow(color: milestone.tier.glowColor.opacity(0.5), radius: 10, y: 3)
            .scaleEffect(appeared ? 1 : 0)
            .animation(.spring(response: 0.6, dampingFraction: 0.6).delay(0.5), value: appeared)
    }
    
    // MARK: - Counter Gradient
    
    private var counterGradient: LinearGradient {
        if milestone.isMilestone && countUpDone {
            return LinearGradient(
                colors: [Color(hex: "FFD700"), Color(hex: "E8913A"), Color(hex: "FFD700"), Color(hex: "DAA520"), Color(hex: "FFD700")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        } else {
            return LinearGradient(
                colors: [premiumGold, premiumCopper, premiumBronze],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }
    
    // MARK: - Animations
    
    private func animateCounter() {
        let steps = 60
        let duration = 2.0
        let delay = duration / Double(steps)
        
        for i in 0...steps {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * delay) {
                withAnimation(.easeOut(duration: 0.03)) {
                    displayCount = Int(Double(targetCount) * Double(i) / Double(steps))
                }
                if i == steps {
                    countUpDone = true
                }
            }
        }
    }
    
    private func startCarouselTimer() {
        guard adoptedCats.count > 1 else { return }
        Timer.scheduledTimer(withTimeInterval: 4.0, repeats: true) { _ in
            DispatchQueue.main.async {
                withAnimation(.easeInOut(duration: 0.6)) {
                    currentCatIndex = (currentCatIndex + 1) % adoptedCats.count
                }
            }
        }
    }
}

// MARK: - Cat Silhouette

private struct CatSilhouette: View {
    var body: some View {
        Canvas { context, size in
            var path = Path()
            let w = size.width
            let h = size.height
            
            // Body (ellipse)
            path.addEllipse(in: CGRect(x: w * 0.15, y: h * 0.3, width: w * 0.7, height: h * 0.6))
            // Head (circle)
            path.addEllipse(in: CGRect(x: w * 0.28, y: h * 0.08, width: w * 0.44, height: h * 0.44))
            // Left ear
            path.move(to: CGPoint(x: w * 0.3, y: h * 0.15))
            path.addLine(to: CGPoint(x: w * 0.35, y: h * 0.35))
            path.addLine(to: CGPoint(x: w * 0.25, y: h * 0.3))
            path.closeSubpath()
            // Right ear
            path.move(to: CGPoint(x: w * 0.7, y: h * 0.15))
            path.addLine(to: CGPoint(x: w * 0.65, y: h * 0.35))
            path.addLine(to: CGPoint(x: w * 0.75, y: h * 0.3))
            path.closeSubpath()
            
            context.fill(path, with: .color(premiumCream.opacity(0.3)))
        }
    }
}

// MARK: - Confetti View

private struct ConfettiView: View {
    let tier: MilestoneTier
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(0..<40, id: \.self) { i in
                    ConfettiParticle(
                        index: i,
                        tier: tier,
                        screenWidth: geo.size.width,
                        screenHeight: geo.size.height
                    )
                }
            }
        }
        .allowsHitTesting(false)
    }
}

private struct ConfettiParticle: View {
    let index: Int
    let tier: MilestoneTier
    let screenWidth: CGFloat
    let screenHeight: CGFloat
    
    @State private var yOffset: CGFloat = 0
    @State private var rotation: Double = 0
    @State private var opacity: Double = 1
    
    private var xPosition: CGFloat {
        CGFloat.random(in: 0...screenWidth)
    }
    
    private var particleColor: Color {
        let colors: [Color] = {
            switch tier {
            case .diamond: return [Color(hex: "00CED1"), Color(hex: "7B68EE"), Color(hex: "FFD700"), .white]
            case .gold: return [Color(hex: "FFD700"), Color(hex: "FFA500"), Color(hex: "DAA520"), .white]
            case .silver: return [Color(hex: "C0C0C0"), Color(hex: "86C5A9"), Color(hex: "DAA520"), .white]
            case .bronze: return [Color(hex: "E8913A"), Color(hex: "DAA520"), Color(hex: "86C5A9"), .white]
            }
        }()
        return colors[index % colors.count]
    }
    
    var body: some View {
        RoundedRectangle(cornerRadius: 2)
            .fill(particleColor)
            .frame(width: CGFloat.random(in: 6...12), height: CGFloat.random(in: 6...12))
            .position(x: xPosition, y: -20 + yOffset)
            .rotationEffect(.degrees(rotation))
            .opacity(opacity)
            .onAppear {
                let delay = Double(index) * 0.05
                withAnimation(.easeIn(duration: Double.random(in: 3...6)).delay(delay).repeatForever(autoreverses: false)) {
                    yOffset = screenHeight + 40
                }
                withAnimation(.linear(duration: Double.random(in: 1...3)).delay(delay).repeatForever(autoreverses: false)) {
                    rotation = Double.random(in: 360...720)
                }
            }
    }
}
