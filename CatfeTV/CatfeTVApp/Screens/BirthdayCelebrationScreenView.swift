//
//  BirthdayCelebrationScreenView.swift
//  CatfeTVApp
//
//  Birthday Celebration - festive display for cat birthdays
//

import SwiftUI

struct BirthdayCelebrationScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var appeared = false
    @State private var confettiVisible = false
    
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
            
            // Confetti overlay
            if confettiVisible && hasTodayBirthdays {
                confettiView
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
            if hasTodayBirthdays {
                withAnimation(.easeOut(duration: 1.0).delay(0.5)) {
                    confettiVisible = true
                }
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
    
    // MARK: - Confetti
    
    private var confettiView: some View {
        GeometryReader { geo in
            ForEach(0..<20, id: \.self) { i in
                confettiPiece(index: i, geo: geo)
            }
        }
    }
    
    private func confettiPiece(index: Int, geo: GeometryProxy) -> some View {
        let colors: [Color] = [.catfeGold, .loungeWarmOrange, .catfeBlush, .loungeMintGreen, .purple]
        let color = colors[index % colors.count]
        let xPos = CGFloat.random(in: 0...geo.size.width)
        let size = CGFloat.random(in: 8...16)
        
        return Circle()
            .fill(color)
            .frame(width: size, height: size)
            .position(x: xPos, y: CGFloat.random(in: -50...geo.size.height * 0.6))
            .opacity(confettiVisible ? 0.8 : 0)
            .animation(
                .easeOut(duration: Double.random(in: 2...4))
                .repeatForever(autoreverses: true)
                .delay(Double.random(in: 0...2)),
                value: confettiVisible
            )
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
                let formatter = DateFormatter()
                let _ = formatter.dateFormat = "MMM d"
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
