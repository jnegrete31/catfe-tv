//
//  BirthdayCelebrationScreenView.swift
//  CatfeTVApp
//
//  Birthday Celebration - adaptive layout: 1=hero, 2=side-by-side, 3+=grid
//

import SwiftUI

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
    
    /// Combine today + upcoming (excluding today's), limit to 4
    private var allBirthdayCats: [BirthdayCat] {
        let upcomingOnly = upcomingBirthdays.filter { upcoming in
            !todayBirthdays.contains(where: { $0.id == upcoming.id })
        }
        return Array((todayBirthdays + upcomingOnly).prefix(4))
    }
    
    // Premium dark theme colors
    private let darkBg = Color(hex: "1C1410")
    private let promoCopper = Color(hex: "CD7F32")
    private let promoGold = Color(hex: "DAA520")
    private let promoCream = Color(hex: "F5DEB3")
    
    var body: some View {
        ZStack {
            // Dark background
            darkBg.ignoresSafeArea()
            
            // Warm radial glows
            GeometryReader { geo in
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [promoGold.opacity(0.12), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.35
                        )
                    )
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.3, y: geo.size.height * 0.2)
                
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [promoCopper.opacity(0.08), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.3
                        )
                    )
                    .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                    .position(x: geo.size.width * 0.8, y: geo.size.height * 0.7)
            }
            
            // Top decorative line
            VStack {
                LinearGradient(
                    colors: [.clear, promoGold, promoCopper, promoGold, .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(height: 2)
                Spacer()
                // Bottom decorative line
                LinearGradient(
                    colors: [.clear, promoCopper, promoGold, promoCopper, .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(height: 2)
            }
            .ignoresSafeArea()
            
            // Decorative cat silhouette
            VStack {
                Spacer()
                HStack {
                    catSilhouetteView
                        .opacity(0.04)
                        .frame(width: 100, height: 100)
                        .padding(.leading, 30)
                        .padding(.bottom, 30)
                    Spacer()
                }
            }
            
            // Subtle sparkles
            ForEach(0..<8, id: \.self) { i in
                Circle()
                    .fill([promoGold, promoCopper, promoGold, promoCopper][i % 4])
                    .frame(width: CGFloat.random(in: 3...6), height: CGFloat.random(in: 3...6))
                    .opacity(appeared ? 0.25 : 0)
                    .position(
                        x: CGFloat(50 + (i * 200) % 1600),
                        y: CGFloat(80 + (i * 150) % 800)
                    )
            }
            
            // Main content
            VStack(spacing: 20) {
                // Header
                headerView
                
                if allBirthdayCats.isEmpty {
                    emptyStateView
                } else {
                    // Adaptive layout based on count
                    adaptiveContent
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
    
    // MARK: - Header
    
    private var headerView: some View {
        VStack(spacing: 8) {
            HStack(spacing: 12) {
                LinearGradient(
                    colors: [.clear, promoGold],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: 60, height: 1)
                
                Text("✦ UPCOMING BIRTHDAYS ✦")
                    .font(.system(size: 14, weight: .medium))
                    .tracking(6)
                    .foregroundColor(promoGold)
                
                LinearGradient(
                    colors: [promoGold, .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: 60, height: 1)
            }
            
            Text(hasTodayBirthdays ? "🎂 Happy Birthday!" : "Celebrate With Us")
                .font(.system(size: 48, weight: .bold, design: .serif))
                .foregroundStyle(
                    LinearGradient(
                        colors: [promoGold, promoCream, promoGold, promoCopper],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
            
            Text(hasTodayBirthdays ? "Celebrating our furry friends today!" : "Mark your calendars for these special days")
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(promoCream.opacity(0.5))
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -20)
    }
    
    // MARK: - Adaptive Content
    
    @ViewBuilder
    private var adaptiveContent: some View {
        let catCount = allBirthdayCats.count
        if catCount == 1 {
            soloHeroLayout
        } else if catCount == 2 {
            sideBySideLayout
        } else {
            gridLayout
        }
    }
    
    // MARK: - Solo Hero Layout (1 cat fills the space)
    
    private var soloHeroLayout: some View {
        let cat = allBirthdayCats[0]
        let isBirthdayToday = isCatBirthdayToday(cat)
        
        return HStack(spacing: 40) {
            // Large cat photo
            ZStack {
                if let photoUrl = cat.photoUrl, !photoUrl.isEmpty {
                    ScreenImage(url: photoUrl)
                        .frame(width: 340, height: 340)
                        .clipShape(RoundedRectangle(cornerRadius: 24))
                } else {
                    RoundedRectangle(cornerRadius: 24)
                        .fill(promoGold.opacity(0.1))
                        .frame(width: 340, height: 340)
                        .overlay(
                            Text("🐱")
                                .font(.system(size: 80))
                        )
                }
                
                // Age badge
                if let age = cat.ageYears {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            Text("\(age)yr")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(darkBg)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(
                                    Capsule()
                                        .fill(
                                            LinearGradient(
                                                colors: [promoGold, promoCopper],
                                                startPoint: .leading,
                                                endPoint: .trailing
                                            )
                                        )
                                )
                        }
                    }
                    .padding(10)
                }
            }
            .frame(width: 340, height: 340)
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(
                        isBirthdayToday ? promoGold : promoCream.opacity(0.15),
                        lineWidth: isBirthdayToday ? 3 : 1
                    )
            )
            
            // Cat info - large text
            VStack(alignment: .leading, spacing: 12) {
                Text(cat.name)
                    .font(.system(size: 56, weight: .bold, design: .serif))
                    .foregroundColor(promoCream)
                    .lineLimit(1)
                
                if let breed = cat.breed, !breed.isEmpty {
                    Text(breed)
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(promoCream.opacity(0.4))
                }
                
                // Birthday date
                HStack(spacing: 10) {
                    Text("🎂")
                        .font(.system(size: 28))
                    
                    if let dob = cat.dob {
                        let formatter = DateFormatter()
                        let _ = formatter.dateFormat = "MMM d"
                        let _ = formatter.timeZone = TimeZone(identifier: "UTC")
                        Text(formatter.string(from: dob))
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundColor(isBirthdayToday ? promoGold : promoCopper)
                    }
                    
                    Text("·")
                        .font(.system(size: 24))
                        .foregroundColor(promoCream.opacity(0.3))
                    
                    Text(birthdayLabel(for: cat))
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(isBirthdayToday ? promoGold : promoCream.opacity(0.5))
                }
                
                if isBirthdayToday {
                    Text("🎉 Birthday Today!")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(darkBg)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(
                                    LinearGradient(
                                        colors: [promoGold, promoCopper],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                        )
                }
                
                if let desc = cat.description, !desc.isEmpty {
                    Text(desc)
                        .font(.system(size: 18, weight: .regular))
                        .foregroundColor(promoCream.opacity(0.4))
                        .lineLimit(3)
                        .padding(.top, 4)
                }
            }
            
            Spacer(minLength: 0)
        }
        .padding(28)
        .background(
            RoundedRectangle(cornerRadius: 28)
                .fill(
                    isBirthdayToday
                        ? LinearGradient(colors: [promoGold.opacity(0.14), promoCopper.opacity(0.08)], startPoint: .topLeading, endPoint: .bottomTrailing)
                        : LinearGradient(colors: [promoCream.opacity(0.06), promoCream.opacity(0.02)], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 28)
                        .stroke(
                            isBirthdayToday ? promoGold.opacity(0.4) : promoCream.opacity(0.08),
                            lineWidth: 1
                        )
                )
        )
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 30)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
    
    // MARK: - Side-by-Side Layout (2 cats)
    
    private var sideBySideLayout: some View {
        HStack(spacing: 24) {
            ForEach(Array(allBirthdayCats.enumerated()), id: \.element.id) { index, cat in
                sideBySideCard(cat: cat, index: index)
            }
        }
        .padding(.top, 8)
    }
    
    private func sideBySideCard(cat: BirthdayCat, index: Int) -> some View {
        let isBirthdayToday = isCatBirthdayToday(cat)
        
        return VStack(spacing: 16) {
            // Cat photo - large and centered
            ZStack {
                if let photoUrl = cat.photoUrl, !photoUrl.isEmpty {
                    ScreenImage(url: photoUrl)
                        .frame(width: 250, height: 250)
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                } else {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(promoGold.opacity(0.1))
                        .frame(width: 250, height: 250)
                        .overlay(
                            Text("🐱")
                                .font(.system(size: 70))
                        )
                }
                
                // Age badge
                if let age = cat.ageYears {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            Text("\(age)yr")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(darkBg)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(
                                    Capsule()
                                        .fill(
                                            LinearGradient(
                                                colors: [promoGold, promoCopper],
                                                startPoint: .leading,
                                                endPoint: .trailing
                                            )
                                        )
                                )
                        }
                    }
                    .padding(8)
                }
            }
            .frame(width: 250, height: 250)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(
                        isBirthdayToday ? promoGold : promoCream.opacity(0.12),
                        lineWidth: isBirthdayToday ? 2 : 1
                    )
            )
            
            // Cat name
            Text(cat.name)
                .font(.system(size: 38, weight: .bold, design: .serif))
                .foregroundColor(promoCream)
                .lineLimit(1)
            
            if let breed = cat.breed, !breed.isEmpty {
                Text(breed)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(promoCream.opacity(0.4))
            }
            
            // Birthday date
            HStack(spacing: 8) {
                Text("🎂")
                    .font(.system(size: 20))
                
                if let dob = cat.dob {
                    let formatter = DateFormatter()
                    let _ = formatter.dateFormat = "MMM d"
                    let _ = formatter.timeZone = TimeZone(identifier: "UTC")
                    Text(formatter.string(from: dob))
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(isBirthdayToday ? promoGold : promoCopper)
                }
                
                Text("·")
                    .foregroundColor(promoCream.opacity(0.3))
                
                Text(birthdayLabel(for: cat))
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(isBirthdayToday ? promoGold : promoCream.opacity(0.5))
            }
            
            if isBirthdayToday {
                Text("🎉 Birthday Today!")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(darkBg)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(
                        Capsule()
                            .fill(
                                LinearGradient(
                                    colors: [promoGold, promoCopper],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                    )
            }
        }
        .frame(maxWidth: .infinity)
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    isBirthdayToday
                        ? LinearGradient(colors: [promoGold.opacity(0.12), promoCopper.opacity(0.06)], startPoint: .topLeading, endPoint: .bottomTrailing)
                        : LinearGradient(colors: [promoCream.opacity(0.04), promoCream.opacity(0.02)], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(
                            isBirthdayToday ? promoGold.opacity(0.35) : promoCream.opacity(0.06),
                            lineWidth: 1
                        )
                )
        )
        .opacity(appeared ? 1 : 0)
        .offset(x: appeared ? 0 : (index == 0 ? -40 : 40))
        .animation(.easeOut(duration: 0.6).delay(Double(index) * 0.2), value: appeared)
    }
    
    // MARK: - Grid Layout (3-4 cats)
    
    private var gridLayout: some View {
        let columns = [
            GridItem(.flexible(), spacing: 24),
            GridItem(.flexible(), spacing: 24)
        ]
        
        return LazyVGrid(columns: columns, spacing: 24) {
            ForEach(Array(allBirthdayCats.enumerated()), id: \.element.id) { index, cat in
                gridCard(cat: cat, index: index)
            }
        }
        .padding(.top, 8)
    }
    
    private func gridCard(cat: BirthdayCat, index: Int) -> some View {
        let isBirthdayToday = isCatBirthdayToday(cat)
        
        return HStack(spacing: 20) {
            // Cat photo
            ZStack {
                if let photoUrl = cat.photoUrl, !photoUrl.isEmpty {
                    ScreenImage(url: photoUrl)
                        .frame(width: 160, height: 160)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                } else {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(promoGold.opacity(0.1))
                        .frame(width: 160, height: 160)
                        .overlay(
                            Text("🐱")
                                .font(.system(size: 50))
                        )
                }
                
                // Age badge
                if let age = cat.ageYears {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            Text("\(age)yr")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(darkBg)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(
                                    Capsule()
                                        .fill(
                                            LinearGradient(
                                                colors: [promoGold, promoCopper],
                                                startPoint: .leading,
                                                endPoint: .trailing
                                            )
                                        )
                                )
                        }
                    }
                    .padding(6)
                }
            }
            .frame(width: 160, height: 160)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        isBirthdayToday ? promoGold : promoCream.opacity(0.12),
                        lineWidth: isBirthdayToday ? 2 : 1
                    )
            )
            
            // Cat info
            VStack(alignment: .leading, spacing: 8) {
                Text(cat.name)
                    .font(.system(size: 30, weight: .bold, design: .serif))
                    .foregroundColor(promoCream)
                    .lineLimit(1)
                
                if let breed = cat.breed, !breed.isEmpty {
                    Text(breed)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(promoCream.opacity(0.4))
                }
                
                // Birthday date
                HStack(spacing: 8) {
                    Text("🎂")
                        .font(.system(size: 18))
                    
                    if let dob = cat.dob {
                        let formatter = DateFormatter()
                        let _ = formatter.dateFormat = "MMM d"
                        let _ = formatter.timeZone = TimeZone(identifier: "UTC")
                        Text(formatter.string(from: dob))
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(isBirthdayToday ? promoGold : promoCopper)
                    }
                    
                    Text("·")
                        .foregroundColor(promoCream.opacity(0.3))
                    
                    Text(birthdayLabel(for: cat))
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(isBirthdayToday ? promoGold : promoCream.opacity(0.5))
                }
                
                if isBirthdayToday {
                    Text("🎉 Birthday Today!")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(darkBg)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            Capsule()
                                .fill(
                                    LinearGradient(
                                        colors: [promoGold, promoCopper],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                        )
                }
            }
            
            Spacer(minLength: 0)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    isBirthdayToday
                        ? LinearGradient(colors: [promoGold.opacity(0.12), promoCopper.opacity(0.06)], startPoint: .topLeading, endPoint: .bottomTrailing)
                        : LinearGradient(colors: [promoCream.opacity(0.04), promoCream.opacity(0.02)], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(
                            isBirthdayToday ? promoGold.opacity(0.35) : promoCream.opacity(0.06),
                            lineWidth: 1
                        )
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
            Text("No Upcoming Birthdays")
                .font(.system(size: 30, weight: .bold, design: .serif))
                .foregroundColor(promoCream)
            Text("Add dates of birth to your cats in the admin panel")
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(promoCream.opacity(0.4))
            Spacer()
        }
    }
    
    // MARK: - Helpers
    
    private func isCatBirthdayToday(_ cat: BirthdayCat) -> Bool {
        todayBirthdays.contains(where: { $0.id == cat.id })
    }
    
    private func birthdayLabel(for cat: BirthdayCat) -> String {
        guard let dob = cat.dob else { return "" }
        let calendar = Calendar.current
        let now = Date()
        
        // Get UTC month/day from DOB
        var utcCal = Calendar(identifier: .gregorian)
        utcCal.timeZone = TimeZone(identifier: "UTC")!
        let dobMonth = utcCal.component(.month, from: dob)
        let dobDay = utcCal.component(.day, from: dob)
        
        let currentYear = calendar.component(.year, from: now)
        
        // Build this year's birthday in local time
        var components = DateComponents()
        components.year = currentYear
        components.month = dobMonth
        components.day = dobDay
        
        guard var thisYearBday = calendar.date(from: components) else { return "" }
        
        let todayStart = calendar.startOfDay(for: now)
        if thisYearBday < todayStart {
            components.year = currentYear + 1
            thisYearBday = calendar.date(from: components) ?? thisYearBday
        }
        
        let diffDays = calendar.dateComponents([.day], from: todayStart, to: thisYearBday).day ?? 0
        
        if diffDays == 0 { return "Today!" }
        if diffDays == 1 { return "Tomorrow!" }
        return "In \(diffDays) days"
    }
    
    // MARK: - Cat Silhouette
    
    private var catSilhouetteView: some View {
        Canvas { context, size in
            let bodyRect = CGRect(x: size.width * 0.15, y: size.height * 0.45, width: size.width * 0.7, height: size.height * 0.45)
            context.fill(Path(ellipseIn: bodyRect), with: .color(promoGold))
            let headRect = CGRect(x: size.width * 0.25, y: size.height * 0.15, width: size.width * 0.5, height: size.height * 0.4)
            context.fill(Path(ellipseIn: headRect), with: .color(promoGold))
            var leftEar = Path()
            leftEar.move(to: CGPoint(x: size.width * 0.28, y: size.height * 0.08))
            leftEar.addLine(to: CGPoint(x: size.width * 0.38, y: size.height * 0.28))
            leftEar.addLine(to: CGPoint(x: size.width * 0.22, y: size.height * 0.25))
            leftEar.closeSubpath()
            context.fill(leftEar, with: .color(promoGold))
            var rightEar = Path()
            rightEar.move(to: CGPoint(x: size.width * 0.72, y: size.height * 0.08))
            rightEar.addLine(to: CGPoint(x: size.width * 0.62, y: size.height * 0.28))
            rightEar.addLine(to: CGPoint(x: size.width * 0.78, y: size.height * 0.25))
            rightEar.closeSubpath()
            context.fill(rightEar, with: .color(promoGold))
        }
    }
}
