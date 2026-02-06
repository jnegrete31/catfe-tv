//
//  GuestReminderWidget.swift
//  CatfeTVApp
//
//  Overlay widget that shows countdown timers for guest sessions
//  nearing expiry (within 5 minutes). Matches the web GuestReminderOverlay.
//  Plays a gentle chime when new reminders appear.
//

import SwiftUI
import Combine
import AVFoundation

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

// MARK: - Chime Sound Manager

/// Generates and plays a gentle two-tone chime using AVFoundation.
/// No external audio file needed — the chime is synthesized at runtime.
class ChimeSoundManager {
    static let shared = ChimeSoundManager()
    
    private var audioEngine: AVAudioEngine?
    private var playerNode: AVAudioPlayerNode?
    private var isPlaying = false
    
    /// IDs of reminders that have already triggered a chime (to avoid repeats)
    private var playedChimeIds = Set<String>()
    
    private init() {
        configureAudioSession()
    }
    
    /// Configure audio session to mix with other audio (Apple Music, etc.)
    /// This prevents the chime from pausing any currently playing media.
    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            try audioSession.setActive(true, options: [.notifyOthersOnDeactivation])
        } catch {
            print("Failed to configure audio session: \(error)")
        }
    }
    
    /// Play a gentle two-tone chime if this reminder ID hasn't played yet.
    /// The chime consists of two soft sine wave tones (C5 → E5) for a pleasant notification.
    func playChime(for reminderId: String) {
        guard !playedChimeIds.contains(reminderId) else { return }
        guard !isPlaying else { return }
        
        playedChimeIds.insert(reminderId)
        isPlaying = true
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.generateAndPlayChime()
        }
    }
    
    /// Reset played chimes (call when reminder windows reset, e.g., new hour)
    func resetPlayedChimes() {
        playedChimeIds.removeAll()
    }
    
    /// Check if a chime has already been played for a given ID
    func hasPlayed(_ reminderId: String) -> Bool {
        return playedChimeIds.contains(reminderId)
    }
    
    private func generateAndPlayChime() {
        let sampleRate: Double = 44100
        let duration: Double = 1.2 // Total chime duration in seconds
        let frameCount = AVAudioFrameCount(sampleRate * duration)
        
        guard let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1),
              let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else {
            isPlaying = false
            return
        }
        
        buffer.frameLength = frameCount
        
        guard let channelData = buffer.floatChannelData?[0] else {
            isPlaying = false
            return
        }
        
        // Generate a gentle two-tone chime:
        // Tone 1: C5 (523 Hz) for 0.0-0.6s
        // Tone 2: E5 (659 Hz) for 0.3-0.9s (overlapping for richness)
        // Both tones fade in and out smoothly
        
        let tone1Freq: Float = 523.25  // C5
        let tone2Freq: Float = 659.25  // E5
        let tone1Start: Float = 0.0
        let tone1End: Float = 0.6
        let tone2Start: Float = 0.3
        let tone2End: Float = 0.9
        let volume: Float = 0.15 // Gentle volume
        
        for i in 0..<Int(frameCount) {
            let time = Float(i) / Float(sampleRate)
            var sample: Float = 0
            
            // Tone 1: C5 with envelope
            if time >= tone1Start && time <= tone1End {
                let t1Progress = (time - tone1Start) / (tone1End - tone1Start)
                // Smooth envelope: quick attack, gentle decay
                let envelope1 = sin(t1Progress * .pi) // Bell-shaped envelope
                let sine1 = sin(2.0 * .pi * tone1Freq * time)
                sample += sine1 * envelope1 * volume
            }
            
            // Tone 2: E5 with envelope
            if time >= tone2Start && time <= tone2End {
                let t2Progress = (time - tone2Start) / (tone2End - tone2Start)
                let envelope2 = sin(t2Progress * .pi)
                let sine2 = sin(2.0 * .pi * tone2Freq * time)
                sample += sine2 * envelope2 * volume
            }
            
            // Add a subtle high harmonic for shimmer
            if time >= 0.0 && time <= 0.8 {
                let shimmerProgress = time / 0.8
                let shimmerEnvelope = sin(shimmerProgress * .pi) * 0.3
                let shimmer = sin(2.0 * .pi * 1046.5 * time) // C6 (octave above)
                sample += shimmer * shimmerEnvelope * volume * 0.2
            }
            
            channelData[i] = sample
        }
        
        // Ensure audio session is configured for mixing before each play
        configureAudioSession()
        
        // Play using AVAudioEngine
        let engine = AVAudioEngine()
        let player = AVAudioPlayerNode()
        
        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)
        
        do {
            try engine.start()
            player.play()
            player.scheduleBuffer(buffer, completionHandler: { [weak self] in
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    engine.stop()
                    // Deactivate our audio session gently so other audio continues
                    try? AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation])
                    self?.isPlaying = false
                }
            })
            
            // Keep references alive during playback
            self.audioEngine = engine
            self.playerNode = player
        } catch {
            print("Failed to play chime: \(error)")
            isPlaying = false
        }
    }
}

// MARK: - Guest Reminder Widget

struct GuestReminderWidget: View {
    @EnvironmentObject var apiClient: APIClient
    
    @State private var sessionsNeedingReminder: [GuestSession] = []
    @State private var previousSessionIds: Set<Int> = []
    @State private var previousScheduledIds: Set<String> = []
    @State private var currentTime = Date()
    @State private var isVisible = false
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    let fetchTimer = Timer.publish(every: 5, on: .main, in: .common).autoconnect()
    
    private let chimeManager = ChimeSoundManager.shared
    
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
            checkForNewScheduledReminders()
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
    
    /// Check if any new scheduled reminders appeared and play chime
    private func checkForNewScheduledReminders() {
        let currentScheduledIds = Set(activeScheduledReminders.map { "\($0.id)-\(Calendar.current.component(.hour, from: currentTime))" })
        
        // Play chime for any newly appeared scheduled reminders
        for id in currentScheduledIds {
            if !previousScheduledIds.contains(id) {
                chimeManager.playChime(for: "scheduled-\(id)")
            }
        }
        
        // Reset chime tracking when no scheduled reminders are active
        if currentScheduledIds.isEmpty && !previousScheduledIds.isEmpty {
            // Window ended, reset for next cycle
        }
        
        previousScheduledIds = currentScheduledIds
    }
    
    private func fetchReminders() async {
        do {
            let sessions = try await apiClient.fetchSessionsNeedingReminder()
            await MainActor.run {
                // Check for new sessions that weren't in the previous list
                let newSessionIds = Set(sessions.map { $0.id })
                let brandNewIds = newSessionIds.subtracting(previousSessionIds)
                
                // Play chime for each brand-new session reminder
                for id in brandNewIds {
                    chimeManager.playChime(for: "guest-\(id)")
                }
                
                previousSessionIds = newSessionIds
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
