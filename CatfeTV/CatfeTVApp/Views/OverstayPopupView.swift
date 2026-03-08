//
//  OverstayPopupView.swift
//  CatfeTVApp
//
//  Persistent popup overlay for guests whose session timer expired 3+ minutes ago
//  but staff hasn't checked them out yet. Shows "[First Name], please see the front desk"
//  and stays visible until staff marks the guest as "Out."
//

import SwiftUI

struct OverstayPopupView: View {
    @EnvironmentObject var apiClient: APIClient
    
    @State private var overstayGuests: [GuestSession] = []
    @State private var playedChimeIds: Set<Int> = Set()
    @State private var pulse: Bool = true
    @State private var fetchCount: Int = 0
    
    private let chimeManager = ChimeSoundManager.shared
    
    /// Extract first name only for privacy
    private func firstName(_ fullName: String) -> String {
        return fullName.components(separatedBy: " ").first ?? fullName
    }
    
    /// Minutes since session expired
    private func minutesOverdue(_ session: GuestSession) -> Int {
        let elapsed = Date().timeIntervalSince(session.expiresAt)
        return max(0, Int(elapsed / 60))
    }
    
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1.0)) { timeline in
            if !overstayGuests.isEmpty {
                VStack(spacing: 16) {
                    ForEach(overstayGuests) { session in
                        OverstayCard(
                            guestFirstName: firstName(session.guestName),
                            guestCount: session.guestCount,
                            minutesOver: minutesOverdue(session),
                            pulse: pulse
                        )
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
                .animation(.easeInOut(duration: 0.5), value: overstayGuests.count)
            }
        }
        .task {
            print("[OverstayPopup] Widget appeared, starting polling loop...")
            await fetchOverstayGuests()
            
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 10_000_000_000) // 10 seconds
                guard !Task.isCancelled else { break }
                await fetchOverstayGuests()
                
                // Toggle pulse for animation
                await MainActor.run {
                    pulse.toggle()
                }
            }
            print("[OverstayPopup] Polling loop ended")
        }
    }
    
    private func fetchOverstayGuests() async {
        fetchCount += 1
        do {
            let guests = try await apiClient.fetchOverstayGuests()
            print("[OverstayPopup] Fetch #\(fetchCount): Got \(guests.count) overstay guests")
            
            await MainActor.run {
                // Play urgent chime for new overstay guests
                for guest in guests {
                    if !playedChimeIds.contains(guest.id) {
                        playedChimeIds.insert(guest.id)
                        chimeManager.playChime(for: "overstay-\(guest.id)")
                        print("[OverstayPopup] ⚠️ New overstay: \(guest.guestName) (id=\(guest.id))")
                    }
                }
                
                self.overstayGuests = guests
            }
        } catch {
            print("[OverstayPopup] FETCH ERROR: \(error)")
        }
    }
}

// MARK: - Overstay Card

struct OverstayCard: View {
    let guestFirstName: String
    let guestCount: Int
    let minutesOver: Int
    let pulse: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 20) {
                Image(systemName: "exclamationmark.octagon.fill")
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.white)
                    .scaleEffect(pulse ? 1.1 : 1.0)
                    .animation(.easeInOut(duration: 1.0), value: pulse)
                
                VStack(alignment: .leading, spacing: 6) {
                    Text("\(guestFirstName), please see the front desk")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    HStack(spacing: 8) {
                        Text("Session ended \(minutesOver) min ago")
                            .font(.system(size: 22))
                            .foregroundColor(.white.opacity(0.85))
                        
                        if guestCount > 1 {
                            Text("\u{2022} Party of \(guestCount)")
                                .font(.system(size: 22))
                                .foregroundColor(.white.opacity(0.85))
                        }
                    }
                }
                
                Spacer()
            }
            .padding(.horizontal, 28)
            .padding(.vertical, 20)
            
            // Animated bottom bar
            GeometryReader { geometry in
                Rectangle()
                    .fill(Color.white.opacity(0.5))
                    .frame(width: pulse ? geometry.size.width : 0)
                    .animation(.easeInOut(duration: 2.0), value: pulse)
            }
            .frame(height: 6)
        }
        .background(
            LinearGradient(
                colors: [Color.red.opacity(0.9), Color.red.opacity(0.7)],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(20)
        .shadow(color: pulse ? Color.red.opacity(0.5) : Color.black.opacity(0.3), radius: pulse ? 16 : 8, y: 4)
        .animation(.easeInOut(duration: 1.0), value: pulse)
    }
}
