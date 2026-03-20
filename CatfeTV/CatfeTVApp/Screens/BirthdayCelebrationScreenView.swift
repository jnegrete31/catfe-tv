//
//  BirthdayCelebrationScreenView.swift
//  CatfeTVApp
//
//  Birthday Celebration - festive display for cat birthdays
//

import SwiftUI

// MARK: - Confetti Particle Model

private struct ConfettiParticle: Identifiable {
    let id: Int
    var x: CGFloat
    var y: CGFloat
    let size: CGFloat
    let color: Color
    let speed: CGFloat       // points per tick
    let drift: CGFloat       // horizontal sway amplitude
    let rotation: Double
    let rotationSpeed: Double
    let shape: Int           // 0 = circle, 1 = rectangle, 2 = triangle
}

// MARK: - Confetti Overlay View

private struct ConfettiOverlay: View {
    let particleCount: Int
    
    @State private var particles: [ConfettiParticle] = []
    @State private var tick: Int = 0
    
    private let timer = Timer.publish(every: 0.05, on: .main, in: .common).autoconnect()
    
    private let confettiColors: [Color] = [
        .catfeGold, .loungeWarmOrange, .catfeBlush,
        .loungeMintGreen, .purple, Color(hex: "FFD700"),
        Color(hex: "FF69B4"), Color(hex: "87CEEB")
    ]
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(particles) { p in
                    confettiShape(p)
                        .position(x: p.x, y: p.y)
                        .rotationEffect(.degrees(p.rotation + Double(tick) * p.rotationSpeed))
                }
            }
            .onAppear {
                initParticles(in: geo.size)
            }
            .onReceive(timer) { _ in
                tick += 1
                updateParticles(in: geo.size)
            }
        }
        .allowsHitTesting(false)
    }
    
    @ViewBuilder
    private func confettiShape(_ p: ConfettiParticle) -> some View {
        switch p.shape {
        case 1:
            Rectangle()
                .fill(p.color)
                .frame(width: p.size * 0.6, height: p.size)
                .opacity(0.85)
        case 2:
            Triangle()
                .fill(p.color)
                .frame(width: p.size, height: p.size)
                .opacity(0.85)
        default:
            Circle()
                .fill(p.color)
                .frame(width: p.size, height: p.size)
                .opacity(0.85)
        }
    }
    
    private func initParticles(in size: CGSize) {
        particles = (0..<particleCount).map { i in
            makeParticle(id: i, screenSize: size, startAbove: false)
        }
    }
    
    private func makeParticle(id: Int, screenSize: CGSize, startAbove: Bool) -> ConfettiParticle {
        ConfettiParticle(
            id: id,
            x: CGFloat.random(in: 0...screenSize.width),
            y: startAbove
                ? CGFloat.random(in: -100 ... -10)
                : CGFloat.random(in: -100...screenSize.height),
            size: CGFloat.random(in: 6...14),
            color: confettiColors[id % confettiColors.count],
            speed: CGFloat.random(in: 1.5...4.0),
            drift: CGFloat.random(in: -1.5...1.5),
            rotation: Double.random(in: 0...360),
            rotationSpeed: Double.random(in: -3...3),
            shape: Int.random(in: 0...2)
        )
    }
    
    private func updateParticles(in size: CGSize) {
        for i in particles.indices {
            particles[i].y += particles[i].speed
            particles[i].x += particles[i].drift + CGFloat(sin(Double(tick) * 0.05 + Double(i))) * 0.8
            
            // Recycle particles that fall off screen
            if particles[i].y > size.height + 20 {
                particles[i] = makeParticle(id: particles[i].id, screenSize: size, startAbove: true)
            }
            // Wrap horizontally
            if particles[i].x < -20 { particles[i].x = size.width + 10 }
            if particles[i].x > size.width + 20 { particles[i].x = -10 }
        }
    }
}

// MARK: - Triangle Shape

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

// MARK: - Birthday Celebration Screen

struct BirthdayCelebrationScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var appeared = false
    
    private var todayBirthdays: [BirthdayCat] {
        apiClient.cachedBirthdayCats
    }
    
    private var upcomingBirthdays: [BirthdayCat] {
        apiClient.cachedUpcomingBirthdays
    }
    
    private var hasTodayBirthdays: Bool {
        !todayBirthdays.isEmpty
    }
    
    var body: some View {
        ZStack {
            // Festive background
            birthdayBackground
            
            // Confetti overlay — real falling particles
            if hasTodayBirthdays {
                ConfettiOverlay(particleCount: 40)
            }
            
            VStack(spacing: 24) {
                // Header
                headerView
                
                if hasTodayBirthdays {
                    // Today's birthday cats - big celebration
                    todayBirthdaySection
                } else if !upcomingBirthdays.isEmpty {
                    // No birthdays today, show upcoming
                    upcomingBirthdaySection
                } else {
                    emptyStateView
                }
                
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 60)
            .padding(.top, 40)
            .padding(.bottom, 20)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                appeared = true
            }
        }
    }
    
    // MARK: - Background
    
    private var birthdayBackground: some View {
        ZStack {
            // Warm golden gradient
            LinearGradient(
                colors: [
                    Color(hex: "1a1a2e"),
                    Color(hex: "2e1a1a"),
                    Color(hex: "1a1a2e")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Golden glow
            GeometryReader { geo in
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.catfeGold.opacity(0.3), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.4
                        )
                    )
                    .frame(width: geo.size.width * 0.8, height: geo.size.width * 0.8)
                    .position(x: geo.size.width * 0.5, y: geo.size.height * 0.3)
            }
        }
    }
    
    // MARK: - Header
    
    private var headerView: some View {
        HStack(spacing: 16) {
            Text("🎂")
                .font(.system(size: 48))
            
            VStack(alignment: .leading, spacing: 4) {
                let titleText = hasTodayBirthdays
                    ? (screen.title.isEmpty ? "Happy Birthday!" : screen.title)
                    : "Upcoming Birthdays"
                
                Text(titleText)
                    .font(.system(size: 46, weight: .bold, design: .serif))
                    .foregroundColor(.loungeCream)
                
                if hasTodayBirthdays {
                    let subtitle = screen.subtitle ?? "Celebrating our furry friends today!"
                    Text(subtitle)
                        .font(.system(size: 22, weight: .medium))
                        .foregroundColor(.catfeGold.opacity(0.8))
                }
            }
            
            Spacer()
            
            Text("🎉")
                .font(.system(size: 48))
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -20)
    }
    
    // MARK: - Today's Birthdays
    
    private var todayBirthdaySection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 32) {
                ForEach(Array(todayBirthdays.enumerated()), id: \.element.id) { index, cat in
                    birthdayCatCard(cat: cat, index: index, isCelebrating: true)
                }
            }
            .padding(.horizontal, 20)
        }
    }
    
    // MARK: - Upcoming Birthdays
    
    private var upcomingBirthdaySection: some View {
        VStack(spacing: 16) {
            Text("Coming up in the next 30 days")
                .font(.system(size: 22, weight: .medium))
                .foregroundColor(.loungeStone)
            
            let gridColumns = [
                GridItem(.flexible(), spacing: 20),
                GridItem(.flexible(), spacing: 20),
                GridItem(.flexible(), spacing: 20),
                GridItem(.flexible(), spacing: 20)
            ]
            
            LazyVGrid(columns: gridColumns, spacing: 20) {
                ForEach(Array(upcomingBirthdays.prefix(8).enumerated()), id: \.element.id) { index, cat in
                    birthdayCatCard(cat: cat, index: index, isCelebrating: false)
                }
            }
        }
    }
    
    // MARK: - Birthday Cat Card
    
    private func birthdayCatCard(cat: BirthdayCat, index: Int, isCelebrating: Bool) -> some View {
        let cardWidth: CGFloat = isCelebrating ? 350 : 0 // 0 = flexible in grid
        let cardHeight: CGFloat = isCelebrating ? 420 : 300
        let borderColor: Color = isCelebrating ? .catfeGold : .loungeStone.opacity(0.3)
        
        return VStack(spacing: 12) {
            // Cat photo
            if let photoUrl = cat.photoUrl, !photoUrl.isEmpty {
                ScreenImage(url: photoUrl)
                    .frame(height: isCelebrating ? 250 : 160)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            } else {
                // Placeholder
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.loungeStone.opacity(0.2))
                    .frame(height: isCelebrating ? 250 : 160)
                    .overlay(
                        Text("🐱")
                            .font(.system(size: isCelebrating ? 60 : 40))
                    )
            }
            
            // Cat name
            Text(cat.name)
                .font(.system(size: isCelebrating ? 32 : 22, weight: .bold, design: .serif))
                .foregroundColor(.loungeCream)
            
            // Age
            if let age = cat.ageYears {
                let ageText = isCelebrating ? "Turning \(age)!" : "Turns \(age)"
                Text(ageText)
                    .font(.system(size: isCelebrating ? 22 : 16, weight: .medium))
                    .foregroundColor(.catfeGold)
            }
            
            // Birthday date (for upcoming)
            if !isCelebrating, let dob = cat.dob {
                // Format the DOB in UTC to get the correct month/day
                let formatter = DateFormatter()
                let _ = formatter.dateFormat = "MMM d"
                let _ = formatter.timeZone = TimeZone(identifier: "UTC")
                Text(formatter.string(from: dob))
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.loungeStone)
            }
        }
        .padding(16)
        .frame(width: cardWidth > 0 ? cardWidth : nil, height: cardHeight)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(borderColor, lineWidth: isCelebrating ? 2 : 1)
                )
        )
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 30)
        .animation(.easeOut(duration: 0.6).delay(Double(index) * 0.15), value: appeared)
    }
    
    // MARK: - Empty State
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Spacer()
            Text("🎂")
                .font(.system(size: 80))
            Text("No upcoming birthdays")
                .font(.system(size: 28, weight: .medium))
                .foregroundColor(.loungeStone.opacity(0.6))
            Text("Add cat birthdays in the admin panel")
                .font(.system(size: 20))
                .foregroundColor(.loungeStone.opacity(0.4))
            Spacer()
        }
    }
}
