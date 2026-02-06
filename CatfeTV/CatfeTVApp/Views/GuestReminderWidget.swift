//
//  GuestReminderWidget.swift
//  CatfeTVApp
//
//  Overlay widget that shows countdown timers for guest sessions
//  nearing expiry (within 5 minutes). Matches the web GuestReminderOverlay.
//

import SwiftUI
import Combine

// MARK: - Scheduled Reminder (time-based, not per-guest)

struct ScheduledReminder: Identifiable {
    let id: String
    let minute: Int // Minute of the hour (25 or 55)
    let sessionType: String
    let sessionDuration: String
    let message: String
}

let scheduledReminders: [ScheduledReminder] = [
    ScheduledReminder(
        id: "mini-meow-25",
        minute: 25,
        sessionType: "Mini Meow",
        sessionDuration: "30 min",
        message: "Mini Meow sessions ending soon!"
    ),
    ScheduledReminder(
        id: "sessions-55",
        minute: 55,
        sessionType: "Full Purr & Mini Meow",
        sessionDuration: "ending",
        message: "Sessions ending soon!"
    ),
]

// MARK: - Guest Reminder Widget

struct GuestReminderWidget: View {
    @EnvironmentObject var apiClient: APIClient
    
    @State private var sessionsNeedingReminder: [GuestSession] = []
    @State private var currentTime = Date()
    @State private var isVisible = false
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    let fetchTimer = Timer.publish(every: 5, on: .main, in: .common).autoconnect()
    
    // Active scheduled reminders based on current time
    private var activeScheduledReminders: [ScheduledReminder] {
        let currentMinute = Calendar.current.component(.minute, from: currentTime)
        return scheduledReminders.filter { reminder in
            let diff = currentMinute - reminder.minute
            return diff >= 0 && diff < 5
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Scheduled time-based reminders
            ForEach(activeScheduledReminders) { reminder in
                ScheduledReminderCard(reminder: reminder, currentTime: currentTime)
                    .transition(.move(edge: .leading).combined(with: .opacity))
            }
            
            // Individual guest session reminders
            ForEach(sessionsNeedingReminder) { session in
                SessionReminderCard(session: session, currentTime: currentTime)
                    .transition(.move(edge: .leading).combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.5), value: sessionsNeedingReminder.count)
        .animation(.easeInOut(duration: 0.5), value: activeScheduledReminders.count)
        .onReceive(timer) { time in
            currentTime = time
        }
        .onReceive(fetchTimer) { _ in
            Task {
                await fetchReminders()
            }
        }
        .task {
            await fetchReminders()
        }
    }
    
    private func fetchReminders() async {
        do {
            let sessions = try await apiClient.fetchSessionsNeedingReminder()
            await MainActor.run {
                self.sessionsNeedingReminder = sessions
            }
        } catch {
            // Silently fail - will retry on next fetch cycle
            print("Failed to fetch session reminders: \(error)")
        }
    }
}

// MARK: - Scheduled Reminder Card

struct ScheduledReminderCard: View {
    let reminder: ScheduledReminder
    let currentTime: Date
    
    private var timeRemaining: (minutes: Int, seconds: Int) {
        let currentMinute = Calendar.current.component(.minute, from: currentTime)
        let currentSecond = Calendar.current.component(.second, from: currentTime)
        let minutesIntoWindow = currentMinute - reminder.minute
        let minutesLeft = 4 - minutesIntoWindow
        let secondsLeft = 59 - currentSecond
        return (minutesLeft, secondsLeft)
    }
    
    private var progress: Double {
        let (minutes, seconds) = timeRemaining
        let totalSeconds = Double(minutes * 60 + seconds)
        return max(0, min(1, totalSeconds / (5 * 60)))
    }
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 16) {
                Image(systemName: "timer")
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundColor(.white)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(reminder.sessionType)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Ending soon • \(timeRemaining.minutes):\(String(format: "%02d", timeRemaining.seconds))")
                        .font(.system(size: 20))
                        .foregroundColor(.white.opacity(0.9))
                }
                
                Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.white.opacity(0.3))
                    
                    Rectangle()
                        .fill(Color.white.opacity(0.8))
                        .frame(width: geometry.size.width * progress)
                        .animation(.linear(duration: 1), value: progress)
                }
            }
            .frame(height: 6)
        }
        .background(
            LinearGradient(
                colors: [Color.purple, Color.indigo],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.3), radius: 12, y: 4)
    }
}

// MARK: - Session Reminder Card

struct SessionReminderCard: View {
    let session: GuestSession
    let currentTime: Date
    
    private var timeRemaining: TimeInterval {
        return session.expiresAt.timeIntervalSince(currentTime)
    }
    
    private var isUrgent: Bool {
        return timeRemaining > 0 && timeRemaining <= 2 * 60
    }
    
    private var isExpired: Bool {
        return timeRemaining <= 0
    }
    
    private var formattedTime: String {
        let remaining = max(0, timeRemaining)
        let minutes = Int(remaining) / 60
        let seconds = Int(remaining) % 60
        return "\(minutes):\(String(format: "%02d", seconds))"
    }
    
    private var progress: Double {
        let remaining = max(0, timeRemaining)
        return min(1, remaining / (5 * 60))
    }
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 16) {
                Image(systemName: isUrgent ? "exclamationmark.triangle.fill" : "bell.fill")
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundColor(.white)
                    .symbolEffect(.pulse, isActive: isUrgent)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(session.guestName)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    if isExpired {
                        Text("Session ended!")
                            .font(.system(size: 20))
                            .foregroundColor(.white.opacity(0.9))
                    } else {
                        Text("\(formattedTime) left • \(session.guestCount) guest\(session.guestCount != 1 ? "s" : "") • \(session.sessionTypeLabel)")
                            .font(.system(size: 20))
                            .foregroundColor(.white.opacity(0.9))
                    }
                }
                
                Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.white.opacity(0.3))
                    
                    Rectangle()
                        .fill(isUrgent ? Color.white : Color.white.opacity(0.8))
                        .frame(width: geometry.size.width * progress)
                        .animation(.linear(duration: 1), value: progress)
                }
            }
            .frame(height: 6)
        }
        .background(
            LinearGradient(
                colors: isUrgent
                    ? [Color.red, Color.red.opacity(0.8)]
                    : [Color.orange, Color.orange.opacity(0.8)],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.3), radius: 12, y: 4)
    }
}
