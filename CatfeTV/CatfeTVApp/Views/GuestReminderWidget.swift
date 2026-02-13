//
//  GuestReminderWidget.swift
//  CatfeTVApp
//
//  Overlay widget that shows:
//  1. Welcome messages when guests check in
//  2. Countdown timers for guest sessions nearing expiry (within 5 minutes)
//  Plays a gentle chime when new reminders/welcomes appear.
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

// MARK: - Welcome Guest Model

struct WelcomeGuest: Identifiable {
    let id: Int
    let guestName: String
    let guestCount: Int
    let duration: String
    let appearedAt: Date
}

// MARK: - Chime Sound Manager

/// Generates and plays a gentle two-tone chime using AVAudioPlayer.
/// No external audio file needed — the chime is synthesized as a WAV buffer at runtime.
/// Uses .ambient category with .mixWithOthers so it never pauses Apple Music or other media.
class ChimeSoundManager {
    static let shared = ChimeSoundManager()
    
    /// Keep a strong reference to the player so it doesn't get deallocated mid-playback
    private var audioPlayer: AVAudioPlayer?
    
    /// Pre-generated WAV data for the chime (created once, reused)
    private var chimeWavData: Data?
    
    /// IDs of reminders that have already triggered a chime (to avoid repeats)
    private var playedChimeIds = Set<String>()
    
    private init() {
        configureAudioSession()
        // Pre-generate the chime WAV data once at init
        chimeWavData = generateChimeWavData()
        print("[Chime] Initialized, WAV data size: \(chimeWavData?.count ?? 0) bytes")
    }
    
    /// Configure audio session to mix with other audio (Apple Music, etc.)
    /// .ambient category automatically mixes and doesn't interrupt other audio.
    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            try audioSession.setActive(true)
            print("[Chime] Audio session configured: ambient + mixWithOthers")
        } catch {
            print("[Chime] Failed to configure audio session: \(error)")
        }
    }
    
    /// Play a gentle two-tone chime if this reminder ID hasn't played yet.
    func playChime(for reminderId: String) {
        guard !playedChimeIds.contains(reminderId) else {
            print("[Chime] Already played for \(reminderId), skipping")
            return
        }
        
        playedChimeIds.insert(reminderId)
        print("[Chime] Playing chime for: \(reminderId)")
        
        // Ensure audio session is active before playing
        configureAudioSession()
        
        guard let wavData = chimeWavData else {
            print("[Chime] No WAV data available")
            return
        }
        
        do {
            let player = try AVAudioPlayer(data: wavData)
            player.volume = 0.4 // Gentle but audible volume
            player.prepareToPlay()
            player.play()
            // Keep strong reference until playback completes
            self.audioPlayer = player
            print("[Chime] Playback started successfully (duration: \(player.duration)s)")
        } catch {
            print("[Chime] Failed to play: \(error)")
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
    
    // MARK: - WAV Generation
    
    /// Generate a complete WAV file in memory with a gentle two-tone chime.
    /// Returns Data containing a valid WAV file that AVAudioPlayer can play directly.
    private func generateChimeWavData() -> Data? {
        let sampleRate: Int = 44100
        let duration: Double = 1.2
        let numSamples = Int(Double(sampleRate) * duration)
        
        // Generate PCM samples as 16-bit integers
        var samples = [Int16](repeating: 0, count: numSamples)
        
        let tone1Freq: Double = 523.25  // C5
        let tone2Freq: Double = 659.25  // E5
        let shimmerFreq: Double = 1046.5 // C6
        let amplitude: Double = 4000.0   // ~12% of Int16.max for gentle volume
        
        for i in 0..<numSamples {
            let time = Double(i) / Double(sampleRate)
            var sample: Double = 0
            
            // Tone 1: C5, 0.0s - 0.6s with bell envelope
            if time <= 0.6 {
                let progress = time / 0.6
                let envelope = sin(progress * .pi)
                sample += sin(2.0 * .pi * tone1Freq * time) * envelope * amplitude
            }
            
            // Tone 2: E5, 0.3s - 0.9s with bell envelope
            if time >= 0.3 && time <= 0.9 {
                let progress = (time - 0.3) / 0.6
                let envelope = sin(progress * .pi)
                sample += sin(2.0 * .pi * tone2Freq * time) * envelope * amplitude
            }
            
            // Shimmer: C6, 0.0s - 0.8s, subtle
            if time <= 0.8 {
                let progress = time / 0.8
                let envelope = sin(progress * .pi) * 0.25
                sample += sin(2.0 * .pi * shimmerFreq * time) * envelope * amplitude * 0.3
            }
            
            // Clamp to Int16 range
            samples[i] = Int16(max(-32767, min(32767, sample)))
        }
        
        // Build WAV file in memory
        let numChannels: Int = 1
        let bitsPerSample: Int = 16
        let byteRate = sampleRate * numChannels * (bitsPerSample / 8)
        let blockAlign = numChannels * (bitsPerSample / 8)
        let dataSize = numSamples * blockAlign
        let fileSize = 36 + dataSize
        
        var wavData = Data()
        
        // RIFF header
        wavData.append(contentsOf: "RIFF".utf8)
        wavData.append(contentsOf: withUnsafeBytes(of: UInt32(fileSize).littleEndian) { Array($0) })
        wavData.append(contentsOf: "WAVE".utf8)
        
        // fmt sub-chunk
        wavData.append(contentsOf: "fmt ".utf8)
        wavData.append(contentsOf: withUnsafeBytes(of: UInt32(16).littleEndian) { Array($0) })  // Sub-chunk size
        wavData.append(contentsOf: withUnsafeBytes(of: UInt16(1).littleEndian) { Array($0) })   // PCM format
        wavData.append(contentsOf: withUnsafeBytes(of: UInt16(numChannels).littleEndian) { Array($0) })
        wavData.append(contentsOf: withUnsafeBytes(of: UInt32(sampleRate).littleEndian) { Array($0) })
        wavData.append(contentsOf: withUnsafeBytes(of: UInt32(byteRate).littleEndian) { Array($0) })
        wavData.append(contentsOf: withUnsafeBytes(of: UInt16(blockAlign).littleEndian) { Array($0) })
        wavData.append(contentsOf: withUnsafeBytes(of: UInt16(bitsPerSample).littleEndian) { Array($0) })
        
        // data sub-chunk
        wavData.append(contentsOf: "data".utf8)
        wavData.append(contentsOf: withUnsafeBytes(of: UInt32(dataSize).littleEndian) { Array($0) })
        
        // Append PCM samples
        for sample in samples {
            wavData.append(contentsOf: withUnsafeBytes(of: sample.littleEndian) { Array($0) })
        }
        
        return wavData
    }
}

// MARK: - Guest Reminder Widget

struct GuestReminderWidget: View {
    @EnvironmentObject var apiClient: APIClient
    
    @State private var sessionsNeedingReminder: [GuestSession] = []
    @State private var welcomeGuests: [WelcomeGuest] = []
    @State private var previousSessionIds: Set<Int> = []
    @State private var previousScheduledIds: Set<String> = []
    @State private var welcomedGuestIds: Set<Int> = []
    @State private var fetchCount: Int = 0
    
    // Track when each expired session was first detected as expired
    @State private var expiredDetectedAt: [Int: Date] = [:]
    
    private let chimeManager = ChimeSoundManager.shared
    
    // How long to show "Session ended!" before hiding (30 seconds)
    private let expiredDisplayDuration: TimeInterval = 30
    
    // Active scheduled reminders based on current time
    private func activeScheduledReminders(at time: Date) -> [ScheduledReminder] {
        let currentMinute = Calendar.current.component(.minute, from: time)
        return scheduledReminders.filter { reminder in
            let diff = currentMinute - reminder.minute
            return diff >= 0 && diff < 5
        }
    }
    
    // Filter sessions: show active ones + recently expired (within expiredDisplayDuration)
    private func visibleSessions(at now: Date) -> [GuestSession] {
        return sessionsNeedingReminder.filter { session in
            let remaining = session.expiresAt.timeIntervalSince(now)
            if remaining > 0 {
                // Still active — always show
                return true
            } else {
                // Expired — show only for expiredDisplayDuration after we detected it
                if let detectedAt = expiredDetectedAt[session.id] {
                    return now.timeIntervalSince(detectedAt) < expiredDisplayDuration
                } else {
                    // Just detected as expired — record it
                    return true
                }
            }
        }
    }
    
    var body: some View {
        // Use TimelineView for guaranteed per-second updates
        TimelineView(.periodic(from: .now, by: 1.0)) { timeline in
            let now = timeline.date
            let activeReminders = activeScheduledReminders(at: now)
            
            // Filter out welcome guests that have been showing for more than 20 seconds
            let activeWelcomes = welcomeGuests.filter { now.timeIntervalSince($0.appearedAt) < 20 }
            
            // Filter sessions to hide expired ones after 30 seconds
            let visibleSessionList = visibleSessions(at: now)
            
            let hasContent = !activeReminders.isEmpty || !visibleSessionList.isEmpty || !activeWelcomes.isEmpty
            
            VStack(alignment: .leading, spacing: 16) {
                if hasContent {
                    // Welcome messages for newly checked-in guests
                    ForEach(activeWelcomes) { welcome in
                        WelcomeCard(welcome: welcome, now: now)
                            .transition(.move(edge: .leading).combined(with: .opacity))
                    }
                    
                    // Scheduled time-based reminders
                    ForEach(activeReminders) { reminder in
                        ScheduledReminderCard(reminder: reminder, now: now)
                            .transition(.move(edge: .leading).combined(with: .opacity))
                    }
                    
                    // Individual guest session reminders
                    ForEach(visibleSessionList) { session in
                        SessionReminderCard(session: session, now: now)
                            .transition(.move(edge: .leading).combined(with: .opacity))
                    }
                }
            }
            .animation(.easeInOut(duration: 0.5), value: sessionsNeedingReminder.count)
            .animation(.easeInOut(duration: 0.5), value: activeReminders.map(\.id))
            .animation(.easeInOut(duration: 0.5), value: activeWelcomes.count)
            .onChange(of: activeReminders.map(\.id)) { _, newIds in
                checkForNewScheduledReminders(activeIds: Set(newIds), at: now)
            }
        }
        .task {
            print("[GuestReminder] Widget appeared, starting polling loop...")
            // Initial fetch immediately
            await fetchReminders()
            await fetchRecentCheckIns()
            
            // Reliable polling loop — runs every 5 seconds forever
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 5_000_000_000) // 5 seconds
                guard !Task.isCancelled else { break }
                await fetchReminders()
                await fetchRecentCheckIns()
                cleanUpExpiredWelcomes()
                trackExpiredSessions()
            }
            print("[GuestReminder] Polling loop ended")
        }
    }
    
    /// Check if any new scheduled reminders appeared and play chime
    private func checkForNewScheduledReminders(activeIds: Set<String>, at time: Date) {
        let hourKey = Calendar.current.component(.hour, from: time)
        let currentScheduledIds = Set(activeIds.map { "\($0)-\(hourKey)" })
        
        // Play chime for any newly appeared scheduled reminders
        for id in currentScheduledIds {
            if !previousScheduledIds.contains(id) {
                chimeManager.playChime(for: "scheduled-\(id)")
            }
        }
        
        previousScheduledIds = currentScheduledIds
    }
    
    /// Track when sessions first expire so we can auto-hide them after 30 seconds
    private func trackExpiredSessions() {
        let now = Date()
        for session in sessionsNeedingReminder {
            let remaining = session.expiresAt.timeIntervalSince(now)
            if remaining <= 0 && expiredDetectedAt[session.id] == nil {
                expiredDetectedAt[session.id] = now
            }
        }
        
        // Clean up old entries that are way past the display duration
        let staleThreshold = expiredDisplayDuration * 2
        expiredDetectedAt = expiredDetectedAt.filter { _, detectedAt in
            now.timeIntervalSince(detectedAt) < staleThreshold
        }
    }
    
    private func fetchReminders() async {
        fetchCount += 1
        do {
            let sessions = try await apiClient.fetchSessionsNeedingReminder()
            print("[GuestReminder] Fetch #\(fetchCount): Got \(sessions.count) sessions needing reminder")
            for s in sessions {
                print("[GuestReminder]   - \(s.guestName) (id=\(s.id)) expires=\(s.expiresAt) remaining=\(s.expiresAt.timeIntervalSinceNow)s")
            }
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
            print("[GuestReminder] FETCH ERROR: \(error)")
        }
    }
    
    private func fetchRecentCheckIns() async {
        do {
            let recentSessions = try await apiClient.fetchRecentlyCheckedIn()
            print("[GuestReminder] Fetched \(recentSessions.count) recently checked-in guests, welcomedIds count: \(welcomedGuestIds.count)")
            
            for session in recentSessions {
                let alreadyWelcomed = welcomedGuestIds.contains(session.id)
                print("[GuestReminder]   - \(session.guestName) (id=\(session.id)) alreadyWelcomed=\(alreadyWelcomed) checkInAt=\(session.checkInAt)")
            }
            
            await MainActor.run {
                for session in recentSessions {
                    // Only show welcome if we haven't already welcomed this guest
                    if !welcomedGuestIds.contains(session.id) {
                        welcomedGuestIds.insert(session.id)
                        
                        let welcome = WelcomeGuest(
                            id: session.id,
                            guestName: session.guestName,
                            guestCount: session.guestCount,
                            duration: session.duration,
                            appearedAt: Date()
                        )
                        welcomeGuests.append(welcome)
                        
                        // Play a welcome chime
                        chimeManager.playChime(for: "welcome-\(session.id)")
                        
                        print("[GuestReminder] ✅ Welcome! \(session.guestName) just checked in (id=\(session.id))")
                    } else {
                        print("[GuestReminder] ⏭️ Skipping \(session.guestName) (id=\(session.id)) — already welcomed")
                    }
                }
            }
        } catch {
            print("[GuestReminder] ❌ Recent check-in FETCH ERROR: \(error)")
        }
    }
    
    private func cleanUpExpiredWelcomes() {
        let now = Date()
        let before = welcomeGuests.count
        welcomeGuests.removeAll { now.timeIntervalSince($0.appearedAt) >= 25 }
        if before != welcomeGuests.count {
            print("[GuestReminder] Cleaned up \(before - welcomeGuests.count) expired welcomes")
        }
        
        // Periodically clean up welcomedGuestIds to prevent unbounded growth
        // Keep only IDs from the last 10 minutes (600 seconds)
        // This allows the same guest to be re-welcomed if they check out and back in
        if welcomedGuestIds.count > 100 {
            print("[GuestReminder] Pruning welcomedGuestIds (was \(welcomedGuestIds.count))")
            // Keep only the IDs that are still in the active welcome list
            let activeWelcomeIds = Set(welcomeGuests.map { $0.id })
            welcomedGuestIds = activeWelcomeIds
            print("[GuestReminder] Pruned to \(welcomedGuestIds.count) IDs")
        }
    }
}

// MARK: - Welcome Card

struct WelcomeCard: View {
    let welcome: WelcomeGuest
    let now: Date
    
    private var opacity: Double {
        let elapsed = now.timeIntervalSince(welcome.appearedAt)
        if elapsed < 1 { return elapsed } // Fade in over 1s
        if elapsed > 17 { return max(0, 1 - (elapsed - 17) / 3) } // Fade out over 3s starting at 17s
        return 1
    }
    
    var body: some View {
        HStack(spacing: 20) {
            Image(systemName: "pawprint.fill")
                .font(.system(size: 36, weight: .semibold))
                .foregroundColor(.white)
            
            VStack(alignment: .leading, spacing: 6) {
                Text("Welcome, \(welcome.guestName)!")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.white)
                
                Text("\(welcome.guestCount) guest\(welcome.guestCount != 1 ? "s" : "") \u{2022} \(welcome.duration) min session")
                    .font(.system(size: 20))
                    .foregroundColor(.white.opacity(0.9))
            }
            
            Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 20)
        .background(
            LinearGradient(
                colors: [Color.green, Color.green.opacity(0.8)],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.3), radius: 12, y: 4)
        .opacity(opacity)
    }
}

// MARK: - Scheduled Reminder Card

struct ScheduledReminderCard: View {
    let reminder: ScheduledReminder
    let now: Date
    
    private var timeRemaining: (minutes: Int, seconds: Int) {
        let currentMinute = Calendar.current.component(.minute, from: now)
        let currentSecond = Calendar.current.component(.second, from: now)
        let endMinute = reminder.minute + 5
        let totalSecondsLeft = max(0, (endMinute - currentMinute) * 60 - currentSecond)
        return (totalSecondsLeft / 60, totalSecondsLeft % 60)
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
                    
                    Text("Ending soon \u{2022} \(timeRemaining.minutes):\(String(format: "%02d", timeRemaining.seconds))")
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
    let now: Date
    
    private var timeRemaining: TimeInterval {
        return session.expiresAt.timeIntervalSince(now)
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
                Image(systemName: isExpired ? "checkmark.circle.fill" : (isUrgent ? "exclamationmark.triangle.fill" : "bell.fill"))
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundColor(.white)
                    .symbolEffect(.pulse, isActive: isUrgent && !isExpired)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(session.guestName)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    if isExpired {
                        Text("Session ended! Thank you for visiting!")
                            .font(.system(size: 20))
                            .foregroundColor(.white.opacity(0.9))
                    } else {
                        Text("\(formattedTime) left \u{2022} \(session.guestCount) guest\(session.guestCount != 1 ? "s" : "") \u{2022} \(session.sessionTypeLabel)")
                            .font(.system(size: 20))
                            .foregroundColor(.white.opacity(0.9))
                    }
                }
                
                Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            
            // Progress bar (hidden when expired)
            if !isExpired {
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.white.opacity(0.3))
                        
                        Rectangle()
                            .fill(isUrgent ? Color.white : Color.white.opacity(0.8))
                            .frame(width: geometry.size.width * progress)
                    }
                }
                .frame(height: 6)
            }
        }
        .background(
            LinearGradient(
                colors: isExpired
                    ? [Color.gray, Color.gray.opacity(0.7)]
                    : (isUrgent
                        ? [Color.red, Color.red.opacity(0.8)]
                        : [Color.orange, Color.orange.opacity(0.8)]),
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.3), radius: 12, y: 4)
    }
}
