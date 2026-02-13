//
//  GuestStatusBoardView.swift
//  CatfeTVApp
//
//  Guest Status Board - shows session window timers and checked-in guests
//  with live countdown timers. Fetches active sessions from the API.
//

import SwiftUI
import Combine

struct GuestStatusBoardScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @EnvironmentObject var apiClient: APIClient
    @State private var activeSessions: [GuestSession] = []
    @State private var currentTime = Date()
    @State private var appeared = false
    
    let clockTimer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    let fetchTimer = Timer.publish(every: 10, on: .main, in: .common).autoconnect()
    
    var locationName: String {
        settings.locationName ?? "Catfé"
    }
    
    // Sort sessions by expiry (soonest first)
    var sortedSessions: [GuestSession] {
        activeSessions.sorted { $0.expiresAt < $1.expiresAt }
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                VStack(spacing: 20) {
                    // Header
                    VStack(spacing: 8) {
                        Text(screen.title.isEmpty ? "\(locationName) Session Times" : screen.title)
                            .font(.system(size: 48, weight: .bold, design: .serif))
                            .foregroundColor(.loungeCream)
                        
                        if sortedSessions.isEmpty {
                            Text("Current session countdown")
                                .font(CatfeTypography.caption)
                                .foregroundColor(.loungeCream.opacity(0.5))
                        } else {
                            let guestCount = sortedSessions.reduce(0) { $0 + $1.guestCount }
                            Text("\(sortedSessions.count) checked-in session\(sortedSessions.count != 1 ? "s" : "") • \(guestCount) guests in the lounge")
                                .font(CatfeTypography.caption)
                                .foregroundColor(.loungeCream.opacity(0.5))
                        }
                    }
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    // Session Window Timers
                    HStack(spacing: 20) {
                        SessionWindowCard(
                            icon: "🐱",
                            title: "Full Purr",
                            subtitle: "60 min session",
                            minutesLeft: fullPurrMinutesLeft,
                            secondsLeft: fullPurrSecondsLeft,
                            endsAt: fullPurrEndsAt,
                            accentColor: .loungeMintGreen
                        )
                        
                        SessionWindowCard(
                            icon: "😺",
                            title: "Mini Meow",
                            subtitle: "30 min session",
                            minutesLeft: miniMeowMinutesLeft,
                            secondsLeft: miniMeowSecondsLeft,
                            endsAt: miniMeowEndsAt,
                            accentColor: .loungeAmber
                        )
                    }
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                    
                    // Checked-in Guests Grid
                    if !sortedSessions.isEmpty {
                        Text("Checked-in Guests")
                            .font(CatfeTypography.small)
                            .foregroundColor(.loungeCream.opacity(0.4))
                            .frame(maxWidth: .infinity, alignment: .leading)
                        
                        let columns = gridColumns(for: sortedSessions.count, width: geo.size.width)
                        
                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(sortedSessions) { session in
                                GuestSessionCard(session: session, currentTime: currentTime)
                            }
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                    }
                    
                    Spacer()
                }
                .padding(.horizontal, 40)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
            Task { await fetchSessions() }
        }
        .onReceive(clockTimer) { time in
            currentTime = time
        }
        .onReceive(fetchTimer) { _ in
            Task { await fetchSessions() }
        }
    }
    
    // MARK: - Session Window Calculations
    
    private var fullPurrMinutesLeft: Int {
        59 - Calendar.current.component(.minute, from: currentTime)
    }
    
    private var fullPurrSecondsLeft: Int {
        59 - Calendar.current.component(.second, from: currentTime)
    }
    
    private var fullPurrEndsAt: String {
        var nextHour = Calendar.current.date(byAdding: .hour, value: 1, to: currentTime) ?? currentTime
        nextHour = Calendar.current.date(bySetting: .minute, value: 0, of: nextHour) ?? nextHour
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: nextHour)
    }
    
    private var miniMeowMinutesLeft: Int {
        let currentMinute = Calendar.current.component(.minute, from: currentTime)
        if currentMinute < 30 {
            return 29 - currentMinute
        } else {
            return 59 - currentMinute
        }
    }
    
    private var miniMeowSecondsLeft: Int {
        59 - Calendar.current.component(.second, from: currentTime)
    }
    
    private var miniMeowEndsAt: String {
        let currentMinute = Calendar.current.component(.minute, from: currentTime)
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        
        if currentMinute < 30 {
            var endsAt = currentTime
            endsAt = Calendar.current.date(bySetting: .minute, value: 30, of: endsAt) ?? endsAt
            return formatter.string(from: endsAt)
        } else {
            return fullPurrEndsAt
        }
    }
    
    // MARK: - Grid Layout
    
    private func gridColumns(for count: Int, width: CGFloat) -> [GridItem] {
        let columnCount: Int
        if count <= 4 {
            columnCount = 2
        } else if count <= 9 {
            columnCount = 3
        } else {
            columnCount = 4
        }
        return Array(repeating: GridItem(.flexible(), spacing: 12), count: columnCount)
    }
    
    // MARK: - Fetch Sessions
    
    private func fetchSessions() async {
        do {
            let sessions = try await apiClient.fetchGuestSessions()
            await MainActor.run {
                self.activeSessions = sessions
            }
        } catch {
            print("Failed to fetch guest sessions: \(error)")
        }
    }
}

// MARK: - Session Window Card

private struct SessionWindowCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let minutesLeft: Int
    let secondsLeft: Int
    let endsAt: String
    let accentColor: Color
    
    private var isUrgent: Bool {
        minutesLeft < 5
    }
    
    var body: some View {
        HStack(spacing: 16) {
            Text(icon)
                .font(.system(size: 36))
            
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(title)
                        .font(.system(size: 22, weight: .semibold, design: .serif))
                        .foregroundColor(accentColor)
                    Text(subtitle)
                        .font(CatfeTypography.small)
                        .foregroundColor(.loungeCream.opacity(0.4))
                }
                
                HStack(spacing: 8) {
                    Text("\(minutesLeft):\(String(format: "%02d", secondsLeft))")
                        .font(.system(size: 32, weight: .bold, design: .monospaced))
                        .foregroundColor(isUrgent ? Color(hex: "fca5a5") : .loungeCream)
                    
                    Text("remaining • ends at \(endsAt)")
                        .font(CatfeTypography.small)
                        .foregroundColor(.loungeCream.opacity(0.4))
                }
            }
            
            Spacer()
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(accentColor.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(accentColor.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

// MARK: - Guest Session Card

private struct GuestSessionCard: View {
    let session: GuestSession
    let currentTime: Date
    
    private var timeRemaining: TimeInterval {
        session.expiresAt.timeIntervalSince(currentTime)
    }
    
    private var isExpired: Bool {
        timeRemaining <= 0
    }
    
    private var isUrgent: Bool {
        timeRemaining > 0 && timeRemaining <= 5 * 60
    }
    
    private var formattedTime: String {
        if isExpired { return "Ended" }
        let totalSeconds = max(0, Int(timeRemaining))
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return "\(minutes):\(String(format: "%02d", seconds))"
    }
    
    private var sessionLabel: String {
        switch session.duration {
        case "60": return "Full Purr"
        case "30": return "Mini Meow"
        case "15": return "Quick Peek"
        default: return "\(session.duration) min"
        }
    }
    
    private var sessionIcon: String {
        switch session.duration {
        case "60": return "🐱"
        case "30": return "😺"
        case "15": return "🐾"
        default: return "🐈"
        }
    }
    
    private var accentColor: Color {
        switch session.duration {
        case "60": return .loungeMintGreen
        case "30": return .loungeAmber
        case "15": return Color(hex: "a78bfa") // Purple
        default: return .loungeStone
        }
    }
    
    var body: some View {
        VStack(spacing: 12) {
            // Session type badge
            HStack(spacing: 6) {
                Text(sessionIcon)
                    .font(.system(size: 16))
                Text(sessionLabel)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(accentColor)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(accentColor.opacity(0.15))
            )
            
            // Guest name
            Text(session.guestName)
                .font(.system(size: 24, weight: .semibold, design: .serif))
                .foregroundColor(.loungeCream)
                .lineLimit(1)
            
            // Guest count
            if session.guestCount > 1 {
                Text("\(session.guestCount) guests")
                    .font(CatfeTypography.small)
                    .foregroundColor(.loungeCream.opacity(0.5))
            }
            
            // Countdown
            Text(formattedTime)
                .font(.system(size: 28, weight: .bold, design: .monospaced))
                .foregroundColor(isExpired ? Color(hex: "ef4444") : isUrgent ? Color(hex: "fca5a5") : .loungeCream)
            
            // Status label
            Text(isExpired ? "Session ended" : isUrgent ? "Ending soon" : "Time remaining")
                .font(.system(size: 12))
                .foregroundColor(.loungeCream.opacity(0.4))
        }
        .padding(16)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.06))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(isUrgent ? Color(hex: "fca5a5").opacity(0.3) : accentColor.opacity(0.15), lineWidth: 1)
                )
        )
    }
}
