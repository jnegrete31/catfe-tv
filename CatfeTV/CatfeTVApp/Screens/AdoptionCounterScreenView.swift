//
//  AdoptionCounterScreenView.swift
//  CatfeTVApp
//
//  Adoption Counter screen - Hybrid Concept C design
//  Split layout: counter + branding on left (cream), photo mosaic + carousel on right (dark)
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

// MARK: - Adoption Counter Screen (Hybrid Concept C)

struct AdoptionCounterScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    var adoptionCats: [Screen] = []
    
    @State private var appeared = false
    @State private var displayCount: Int = 0
    @State private var countUpDone = false
    @State private var currentCatIndex: Int = 0
    @State private var milestoneGlowOpacity: Double = 0
    
    private var targetCount: Int {
        settings.totalAdoptionCount
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
                // Full-screen split layout
                HStack(spacing: 0) {
                    // LEFT SIDE — Counter & branding (cream warm tones)
                    leftSide(width: geo.size.width / 2, height: geo.size.height)
                    
                    // RIGHT SIDE — Photo mosaic background + carousel
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
            // Cream gradient background
            LinearGradient(
                colors: [Color(hex: "F5E6D3"), Color(hex: "EDE0D4"), Color(hex: "E8DDD0")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Warm light glow
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            (milestone.isMilestone && countUpDone
                                ? milestone.tier.glowColor.opacity(0.4)
                                : Color(hex: "DAA520").opacity(0.3)),
                            .clear
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 150
                    )
                )
                .frame(width: 300, height: 300)
                .offset(x: -width * 0.15, y: -height * 0.2)
                .opacity(milestone.isMilestone && countUpDone ? 0.7 : 0.4)
            
            // Milestone glow pulse
            if milestone.isMilestone && countUpDone {
                Color.clear
                    .overlay(
                        RadialGradient(
                            colors: [milestone.tier.glowColor.opacity(0.15), .clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: width * 0.6
                        )
                    )
                    .opacity(milestoneGlowOpacity)
                    .onAppear {
                        withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                            milestoneGlowOpacity = 1
                        }
                    }
            }
            
            // Mint accent bar at top
            VStack {
                Rectangle()
                    .fill(milestone.isMilestone && countUpDone
                        ? Color(hex: "DAA520")
                        : Color(hex: "86C5A9"))
                    .frame(height: 4)
                Spacer()
            }
            
            // Decorative cat silhouette
            VStack {
                Spacer()
                HStack {
                    CatSilhouette()
                        .opacity(0.06)
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
                
                // "Forever Homes" label
                HStack(spacing: 8) {
                    Rectangle()
                        .fill(Color(hex: "DAA520"))
                        .frame(width: 48, height: 1)
                    Text("Forever Homes")
                        .font(.system(size: 16, weight: .regular, design: .serif))
                        .tracking(6)
                        .textCase(.uppercase)
                        .foregroundColor(Color(hex: "86C5A9"))
                    Rectangle()
                        .fill(Color(hex: "DAA520"))
                        .frame(width: 48, height: 1)
                }
                .padding(.bottom, 16)
                .opacity(appeared ? 1 : 0)
                
                // Big counter number
                Text("\(displayCount)")
                    .font(.system(size: 160, weight: .black, design: .serif))
                    .foregroundStyle(counterGradient)
                    .shadow(color: milestone.isMilestone && countUpDone
                        ? Color(hex: "FFD700").opacity(0.4)
                        : Color(hex: "DAA520").opacity(0.2),
                        radius: milestone.isMilestone && countUpDone ? 20 : 15, y: 4)
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
                    .foregroundColor(Color(hex: "2d2d2d"))
                    .padding(.top, 12)
                    .opacity(appeared ? 1 : 0)
                
                // Subtitle
                Text(milestone.isMilestone
                    ? "Thank you for making this possible!"
                    : "Every visit helps us find forever homes")
                    .font(.system(size: 16, weight: .regular))
                    .foregroundColor(Color(hex: "2d2d2d").opacity(0.5))
                    .padding(.top, 8)
                    .opacity(appeared ? 1 : 0)
                
                Spacer()
            }
            .padding(.horizontal, 40)
        }
        .frame(width: width, height: height)
    }
    
    // MARK: - Right Side (Photo Mosaic + Carousel)
    
    private func rightSide(width: CGFloat, height: CGFloat) -> some View {
        ZStack {
            // Dark gradient background
            LinearGradient(
                colors: [Color(hex: "2d2d2d"), Color(hex: "1a1a1a")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Photo mosaic background (dimmed)
            photoMosaic(width: width, height: height)
                .opacity(0.20)
            
            // Dark overlay to make carousel pop
            RadialGradient(
                colors: [
                    Color(hex: "1e1e1e").opacity(0.5),
                    Color(hex: "1a1a1a").opacity(0.8)
                ],
                center: .center,
                startRadius: 0,
                endRadius: width * 0.7
            )
            
            // Amber glow top-left
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color(hex: "DAA520").opacity(0.5), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 150
                    )
                )
                .frame(width: 300, height: 300)
                .offset(x: -width * 0.3, y: -height * 0.3)
                .opacity(0.2)
            
            // Mint floor reflection
            VStack {
                Spacer()
                LinearGradient(
                    colors: [Color(hex: "86C5A9").opacity(0.1), .clear],
                    startPoint: .bottom,
                    endPoint: .top
                )
                .frame(height: height * 0.25)
            }
            
            // "Recently Adopted" label
            VStack {
                Text("Recently Adopted")
                    .font(.system(size: 16, weight: .regular))
                    .tracking(6)
                    .textCase(.uppercase)
                    .foregroundColor(Color(hex: "86C5A9").opacity(0.6))
                    .padding(.top, 40)
                Spacer()
            }
            
            // Cat card carousel
            catCarousel(width: width)
            
            // Dot indicators
            if adoptedCats.count > 1 {
                VStack {
                    Spacer()
                    HStack(spacing: 8) {
                        ForEach(0..<min(adoptedCats.count, 8), id: \.self) { i in
                            Circle()
                                .fill(i == currentCatIndex % min(adoptedCats.count, 8)
                                    ? Color(hex: "DAA520")
                                    : Color(hex: "F5E6D3").opacity(0.2))
                                .frame(width: 8, height: 8)
                                .scaleEffect(i == currentCatIndex % min(adoptedCats.count, 8) ? 1.3 : 1.0)
                                .animation(.easeOut(duration: 0.3), value: currentCatIndex)
                        }
                    }
                    .padding(.bottom, 40)
                }
            }
        }
        .frame(width: width, height: height)
    }
    
    // MARK: - Photo Mosaic
    
    private func photoMosaic(width: CGFloat, height: CGFloat) -> some View {
        let columns = 4
        let rows = 3
        let cellWidth = width / CGFloat(columns)
        let cellHeight = height / CGFloat(rows)
        
        return ZStack {
            ForEach(0..<(columns * rows), id: \.self) { i in
                let row = i / columns
                let col = i % columns
                let cat = allCatsWithPhotos.isEmpty ? nil : allCatsWithPhotos[i % allCatsWithPhotos.count]
                
                Group {
                    if let imageURL = cat?.imageURL, let url = URL(string: imageURL) {
                        CachedAsyncImage(url: url) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle()
                                .fill(LinearGradient(
                                    colors: [Color(hex: "3a3a3a"), Color(hex: "2a2a2a")],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ))
                        }
                    } else {
                        Rectangle()
                            .fill(LinearGradient(
                                colors: [Color(hex: "3a3a3a"), Color(hex: "2a2a2a")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))
                    }
                }
                .frame(width: cellWidth - 1, height: cellHeight - 1)
                .clipped()
                .position(
                    x: CGFloat(col) * cellWidth + cellWidth / 2,
                    y: CGFloat(row) * cellHeight + cellHeight / 2
                )
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.5).delay(Double(i) * 0.08), value: appeared)
            }
        }
        .frame(width: width, height: height)
    }
    
    // MARK: - Cat Carousel
    
    private func catCarousel(width: CGFloat) -> some View {
        Group {
            if !adoptedCats.isEmpty {
                let cat = adoptedCats[currentCatIndex % adoptedCats.count]
                polaroidCard(cat: cat, width: width)
                    .id(currentCatIndex)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
                    .animation(.easeInOut(duration: 0.6), value: currentCatIndex)
            } else {
                // Empty state
                VStack(spacing: 16) {
                    Text("🐱")
                        .font(.system(size: 60))
                    Text("More happy tails coming soon")
                        .font(.system(size: 22, weight: .regular, design: .serif))
                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.5))
                }
            }
        }
    }
    
    // MARK: - Polaroid Card
    
    private func polaroidCard(cat: Screen, width: CGFloat) -> some View {
        let cardWidth: CGFloat = min(width * 0.6, 320)
        let catName = cat.title.replacingOccurrences(of: "Meet ", with: "")
        
        return VStack(spacing: 0) {
            // Photo
            ZStack(alignment: .topTrailing) {
                if let imageURL = cat.imageURL, let url = URL(string: imageURL) {
                    CachedAsyncImage(url: url) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(Color(hex: "3a3a3a"))
                            .overlay(
                                Image(systemName: "cat.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(Color(hex: "78716c"))
                            )
                    }
                    .frame(width: cardWidth, height: cardWidth)
                    .clipped()
                }
                
                // "Adopted!" ribbon
                Text("Adopted!")
                    .font(.system(size: 14, weight: .bold))
                    .tracking(1)
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(
                        Capsule()
                            .fill(LinearGradient(
                                colors: [Color(hex: "86C5A9"), Color(hex: "6BAF92")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))
                    )
                    .shadow(color: .black.opacity(0.3), radius: 6, y: 3)
                    .padding(16)
            }
            
            // Info section
            VStack(spacing: 4) {
                Text(catName)
                    .font(.system(size: 28, weight: .bold, design: .serif))
                    .foregroundColor(Color(hex: "2d2d2d"))
                
                if let breed = cat.catBreed, !breed.isEmpty {
                    Text(breed)
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "2d2d2d").opacity(0.5))
                }
            }
            .padding(.vertical, 20)
            .frame(maxWidth: .infinity)
        }
        .frame(width: cardWidth)
        .background(Color(hex: "F5E6D3"))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.4), radius: 20, y: 10)
    }
    
    // MARK: - Milestone Badge
    
    private var milestoneBadge: some View {
        HStack(spacing: 8) {
            Text("🎉")
                .font(.system(size: 20))
            Text(milestone.label)
                .font(.system(size: 14, weight: .bold, design: .serif))
                .tracking(2)
                .textCase(.uppercase)
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.3), radius: 3, y: 1)
            Text("🎉")
                .font(.system(size: 20))
        }
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
                colors: [Color(hex: "E8913A"), Color(hex: "DAA520"), Color(hex: "86C5A9")],
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
            // Simple cat silhouette
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
            
            context.fill(path, with: .color(Color(hex: "2d2d2d")))
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
