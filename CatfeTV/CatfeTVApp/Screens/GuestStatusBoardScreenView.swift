//
//  GuestStatusBoardScreenView.swift
//  CatfeTVApp
//
//  Guest Status Board - shows all checked-in guests with countdown timers
//  and general session window timers (Full Purr / Mini Meow)
//

import SwiftUI

struct GuestStatusBoardScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @EnvironmentObject var apiClient: APIClient
    @State private var guestSessions: [GuestSession] = []
    @State private var appeared = false
    @State private var fetchError: String?
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            TimelineView(.periodic(from: .now, by: 1.0)) { timeline in
                let now = timeline.date
                
                VStack(spacing: 24) {
                    // Header
                    Text(screen.title.isEmpty ? "Guest Sessions" : screen.title)
                        .font(.system(size: 48, weight: .bold, design: .serif))
                        .foregroundColor(.loungeCream)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    // Session Window Timers
                    sessionWindowTimers(now: now)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.15), value: appeared)
                    
                    Spacer()
                    
                    // Guest Cards or Empty State
                    let activeSessions = guestSessions.filter { $0.timeRemaining > 0 }
                    
                    if activeSessions.isEmpty {
                        emptyState
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                    } else {
                        guestGrid(sessions: activeSessions, now: now)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 20)
                            .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                    }
                    
                    Spacer()
                    
                    // Footer Legend
                    sessionLegend
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(40)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
            fetchSessions()
        }
        .onReceive(Timer.publish(every: 10, on: .main, in: .common).autoconnect()) { _ in
            fetchSessions()
        }
    }
    
    // MARK: - Session Window Timers
    
    @ViewBuilder
    private func sessionWindowTimers(now: Date) -> some View {
        let calendar = Calendar.current
        let currentMinute = calendar.component(.minute, from: now)
        let currentSecond = calendar.component(.second, from: now)
        
        // Full Purr ends at :00 (top of the hour)
        let fullPurrMinutesLeft = (60 - currentMinute - 1)
        let fullPurrSecondsLeft = 60 - currentSecond
        let fullPurrTotalSeconds = fullPurrMinutesLeft * 60 + fullPurrSecondsLeft
        
        // Mini Meow ends at :30
        let miniMeowMinutesLeft = currentMinute < 30 ? (30 - currentMinute - 1) : (90 - currentMinute - 1)
        let miniMeowSecondsLeft = 60 - currentSecond
        let miniMeowTotalSeconds = miniMeowMinutesLeft * 60 + miniMeowSecondsLeft
        
        HStack(spacing: 30) {
            // Full Purr Timer
            sessionTimerCard(
                icon: "🐱",
                label: "Full Purr",
                duration: "60 min",
                minutesLeft: fullPurrTotalSeconds / 60,
                secondsLeft: fullPurrTotalSeconds % 60,
                totalSeconds: fullPurrTotalSeconds,
                color: Color(red: 0.2, green: 0.7, blue: 0.7) // Teal
            )
            
            // Mini Meow Timer
            sessionTimerCard(
                icon: "🐾",
                label: "Mini Meow",
                duration: "30 min",
                minutesLeft: miniMeowTotalSeconds / 60,
                secondsLeft: miniMeowTotalSeconds % 60,
                totalSeconds: miniMeowTotalSeconds,
                color: Color(red: 0.85, green: 0.65, blue: 0.2) // Amber
            )
        }
    }
    
    @ViewBuilder
    private func sessionTimerCard(
        icon: String,
        label: String,
        duration: String,
        minutesLeft: Int,
        secondsLeft: Int,
        totalSeconds: Int,
        color: Color
    ) -> some View {
        HStack(spacing: 16) {
            Text(icon)
                .font(.system(size: 36))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.system(size: 20, weight: .semibold, design: .serif))
                    .foregroundColor(.loungeCream)
                Text(duration)
                    .font(.system(size: 14))
                    .foregroundColor(.loungeCream.opacity(0.6))
            }
            
            Spacer()
            
            // Countdown
            Text(String(format: "%d:%02d", minutesLeft, secondsLeft))
                .font(.system(size: 36, weight: .bold, design: .monospaced))
                .foregroundColor(totalSeconds < 300 ? .red : color)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(color.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(color.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    // MARK: - Guest Grid
    
    @ViewBuilder
    private func guestGrid(sessions: [GuestSession], now: Date) -> some View {
        let sorted = sessions.sorted { $0.expiresAt < $1.expiresAt }
        let columns = gridColumns(for: sorted.count)
        
        LazyVGrid(columns: columns, spacing: 20) {
            ForEach(sorted) { session in
                guestCard(session: session, now: now)
            }
        }
    }
    
    private func gridColumns(for count: Int) -> [GridItem] {
        let colCount: Int
        switch count {
        case 1...2: colCount = 2
        case 3...4: colCount = 2
        case 5...6: colCount = 3
        default: colCount = 4
        }
        return Array(repeating: GridItem(.flexible(), spacing: 20), count: colCount)
    }
    
    @ViewBuilder
    private func guestCard(session: GuestSession, now: Date) -> some View {
        let remaining = session.expiresAt.timeIntervalSince(now)
        let minutes = max(0, Int(remaining)) / 60
        let seconds = max(0, Int(remaining)) % 60
        let isUrgent = remaining > 0 && remaining <= 300 // 5 minutes
        
        let sessionColor = colorForSession(session.duration)
        let bgColor = isUrgent ? Color.red : sessionColor
        
        VStack(spacing: 12) {
            // Guest name
            Text(session.guestName)
                .font(.system(size: 24, weight: .bold, design: .serif))
                .foregroundColor(.loungeCream)
                .lineLimit(1)
            
            // Session type
            Text(session.sessionTypeLabel)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(bgColor)
            
            // Countdown
            if remaining > 0 {
                Text(String(format: "%d:%02d", minutes, seconds))
                    .font(.system(size: 32, weight: .bold, design: .monospaced))
                    .foregroundColor(isUrgent ? .red : .loungeCream)
            } else {
                Text("Time's up!")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.red)
            }
            
            // Guest count
            if session.guestCount > 1 {
                Text("\(session.guestCount) guests")
                    .font(.system(size: 13))
                    .foregroundColor(.loungeCream.opacity(0.6))
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(bgColor.opacity(0.12))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(bgColor.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    private func colorForSession(_ duration: String) -> Color {
        switch duration {
        case "60": return Color(red: 0.2, green: 0.7, blue: 0.7) // Teal
        case "30": return Color(red: 0.85, green: 0.65, blue: 0.2) // Amber
        case "15": return Color(red: 0.6, green: 0.4, blue: 0.8) // Purple
        default: return .loungeAmber
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Text("🐱")
                .font(.system(size: 64))
            Text("Waiting for guests...")
                .font(.system(size: 28, weight: .medium, design: .serif))
                .foregroundColor(.loungeCream.opacity(0.5))
            Text("Check in at the front desk to see your timer here")
                .font(.system(size: 18))
                .foregroundColor(.loungeCream.opacity(0.3))
        }
    }
    
    // MARK: - Session Legend
    
    private var sessionLegend: some View {
        HStack(spacing: 30) {
            legendItem(color: Color(red: 0.2, green: 0.7, blue: 0.7), label: "Full Purr (60 min)")
            legendItem(color: Color(red: 0.85, green: 0.65, blue: 0.2), label: "Mini Meow (30 min)")
            legendItem(color: Color(red: 0.6, green: 0.4, blue: 0.8), label: "Guest Pass (15 min)")
        }
    }
    
    @ViewBuilder
    private func legendItem(color: Color, label: String) -> some View {
        HStack(spacing: 8) {
            Circle()
                .fill(color)
                .frame(width: 10, height: 10)
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(.loungeCream.opacity(0.5))
        }
    }
    
    // MARK: - Data Fetching
    
    private func fetchSessions() {
        Task {
            do {
                let sessions = try await apiClient.fetchGuestSessions()
                await MainActor.run {
                    self.guestSessions = sessions.filter { $0.status == "active" || $0.status == "extended" }
                    self.fetchError = nil
                }
            } catch {
                print("[GuestStatusBoard] Failed to fetch sessions: \(error)")
                await MainActor.run {
                    self.fetchError = error.localizedDescription
                }
            }
        }
    }
}
