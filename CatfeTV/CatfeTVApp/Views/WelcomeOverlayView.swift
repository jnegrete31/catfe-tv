//
//  WelcomeOverlayView.swift
//  CatfeTVApp
//
//  Full-screen welcome overlay that takes over the entire TV display
//  for a few seconds when a guest checks in. Polls for recently checked-in
//  guests and shows a warm, animated welcome splash.
//

import SwiftUI

// MARK: - Welcome Overlay View

struct WelcomeOverlayView: View {
    @EnvironmentObject var apiClient: APIClient
    
    @State private var currentWelcome: WelcomeGuest? = nil
    @State private var welcomeQueue: [WelcomeGuest] = []
    @State private var welcomedIds: Set<Int> = []
    @State private var animationPhase: WelcomeAnimationPhase = .hidden
    @State private var sparklePositions: [(x: CGFloat, y: CGFloat, size: CGFloat, delay: Double)] = []
    @State private var pawPositions: [(x: CGFloat, y: CGFloat, size: CGFloat, delay: Double)] = []
    
    private let chimeManager = ChimeSoundManager.shared
    
    private let displayDuration: TimeInterval = 5.0 // Show for 5 seconds
    private let fadeInDuration: Double = 0.6
    private let fadeOutDuration: Double = 0.6
    
    enum WelcomeAnimationPhase {
        case hidden
        case entering
        case displaying
        case exiting
    }
    
    private let sessionLabels: [String: String] = [
        "15": "Quick Purr",
        "30": "Mini Meow Session",
        "60": "Cat Lounge Session",
        "90": "Study Session",
    ]
    
    var body: some View {
        ZStack {
            if let welcome = currentWelcome, animationPhase != .hidden {
                // Full-screen background
                LinearGradient(
                    colors: [
                        Color(hex: "7C2D12").opacity(0.97),
                        Color(hex: "C2410C").opacity(0.97),
                        Color(hex: "7C2D12").opacity(0.97)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                // Sparkle particles
                ForEach(0..<sparklePositions.count, id: \.self) { i in
                    let pos = sparklePositions[i]
                    Image(systemName: "sparkle")
                        .font(.system(size: pos.size))
                        .foregroundColor(Color(hex: "FCD34D").opacity(0.25))
                        .position(x: pos.x, y: pos.y)
                        .opacity(animationPhase == .displaying ? 1 : 0)
                        .animation(
                            .easeInOut(duration: 2.0)
                            .repeatForever(autoreverses: true)
                            .delay(pos.delay),
                            value: animationPhase
                        )
                }
                
                // Floating paw prints
                ForEach(0..<pawPositions.count, id: \.self) { i in
                    let pos = pawPositions[i]
                    Image(systemName: "pawprint.fill")
                        .font(.system(size: pos.size))
                        .foregroundColor(Color(hex: "FBBF24").opacity(0.1))
                        .position(x: pos.x, y: pos.y)
                        .opacity(animationPhase == .displaying ? 1 : 0)
                        .animation(
                            .easeInOut(duration: 3.0)
                            .repeatForever(autoreverses: true)
                            .delay(pos.delay),
                            value: animationPhase
                        )
                }
                
                // Main content
                VStack(spacing: 0) {
                    Spacer()
                    
                    // Cat icon with glow
                    ZStack {
                        Circle()
                            .fill(Color(hex: "F59E0B").opacity(0.3))
                            .frame(width: 200, height: 200)
                            .blur(radius: 30)
                        
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color(hex: "F59E0B").opacity(0.4),
                                        Color(hex: "EA580C").opacity(0.4)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 160, height: 160)
                            .overlay(
                                Circle()
                                    .stroke(Color(hex: "FCD34D").opacity(0.3), lineWidth: 2)
                            )
                        
                        Image(systemName: "cat.fill")
                            .font(.system(size: 80))
                            .foregroundColor(Color(hex: "FEF3C7"))
                            .shadow(color: .black.opacity(0.2), radius: 8, y: 4)
                    }
                    .scaleEffect(animationPhase == .displaying ? 1.0 : 0.85)
                    .animation(.spring(response: 0.7, dampingFraction: 0.6), value: animationPhase)
                    .padding(.bottom, 50)
                    
                    // Welcome text
                    let firstName = welcome.guestName.components(separatedBy: " ").first ?? welcome.guestName
                    
                    Text("Welcome, \(firstName)!")
                        .font(.system(size: 80, weight: .bold, design: .serif))
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.3), radius: 12, y: 4)
                        .scaleEffect(animationPhase == .displaying ? 1.0 : 0.9)
                        .offset(y: animationPhase == .displaying ? 0 : 20)
                        .animation(.spring(response: 0.7, dampingFraction: 0.7).delay(0.1), value: animationPhase)
                        .padding(.bottom, 16)
                    
                    // Subtitle
                    let isGroup = welcome.guestCount > 1
                    Text(isGroup
                         ? "Party of \(welcome.guestCount) — Your purrfect adventure awaits!"
                         : "Your purrfect adventure awaits!")
                        .font(.system(size: 36))
                        .foregroundColor(Color(hex: "FEF3C7"))
                        .shadow(color: .black.opacity(0.2), radius: 8, y: 2)
                        .offset(y: animationPhase == .displaying ? 0 : 15)
                        .animation(.spring(response: 0.7, dampingFraction: 0.7).delay(0.2), value: animationPhase)
                        .padding(.bottom, 40)
                    
                    // Session info badge
                    let sessionLabel = sessionLabels[welcome.duration] ?? "\(welcome.duration) min"
                    
                    HStack(spacing: 20) {
                        HStack(spacing: 10) {
                            Image(systemName: "clock.fill")
                                .font(.system(size: 24))
                            Text(sessionLabel)
                                .font(.system(size: 24, weight: .medium))
                        }
                        .foregroundColor(Color(hex: "FCD34D"))
                        
                        if isGroup {
                            Rectangle()
                                .fill(Color(hex: "FCD34D").opacity(0.3))
                                .frame(width: 1, height: 28)
                            
                            HStack(spacing: 10) {
                                Image(systemName: "person.2.fill")
                                    .font(.system(size: 24))
                                Text("\(welcome.guestCount) Guest\(welcome.guestCount != 1 ? "s" : "")")
                                    .font(.system(size: 24, weight: .medium))
                            }
                            .foregroundColor(Color(hex: "FCD34D"))
                        }
                    }
                    .padding(.horizontal, 40)
                    .padding(.vertical, 20)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Capsule())
                    .overlay(
                        Capsule()
                            .stroke(Color(hex: "FCD34D").opacity(0.2), lineWidth: 1)
                    )
                    .offset(y: animationPhase == .displaying ? 0 : 10)
                    .animation(.spring(response: 0.7, dampingFraction: 0.7).delay(0.3), value: animationPhase)
                    .padding(.bottom, 50)
                    
                    // Hearts and paws decoration
                    HStack(spacing: 30) {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 32))
                            .foregroundColor(Color.red.opacity(0.7))
                        
                        Image(systemName: "pawprint.fill")
                            .font(.system(size: 40))
                            .foregroundColor(Color(hex: "FCD34D").opacity(0.5))
                        
                        Image(systemName: "heart.fill")
                            .font(.system(size: 40))
                            .foregroundColor(Color.red)
                        
                        Image(systemName: "pawprint.fill")
                            .font(.system(size: 40))
                            .foregroundColor(Color(hex: "FCD34D").opacity(0.5))
                        
                        Image(systemName: "heart.fill")
                            .font(.system(size: 32))
                            .foregroundColor(Color.red.opacity(0.7))
                    }
                    .offset(y: animationPhase == .displaying ? 0 : 10)
                    .animation(.spring(response: 0.7, dampingFraction: 0.7).delay(0.4), value: animationPhase)
                    
                    Spacer()
                }
                .opacity(animationPhase == .entering ? 0 : (animationPhase == .exiting ? 0 : 1))
                .animation(.easeInOut(duration: animationPhase == .entering ? fadeInDuration : fadeOutDuration), value: animationPhase)
            }
        }
        .allowsHitTesting(false) // Don't block remote input
        .task {
            // Generate random positions for sparkles and paws
            generateParticlePositions()
            
            // Polling loop for new check-ins
            while !Task.isCancelled {
                await fetchRecentCheckIns()
                showNextIfNeeded()
                try? await Task.sleep(nanoseconds: 5_000_000_000) // 5 seconds
            }
        }
    }
    
    // MARK: - Particle Positions
    
    private func generateParticlePositions() {
        sparklePositions = (0..<20).map { _ in
            (
                x: CGFloat.random(in: 100...1820),
                y: CGFloat.random(in: 100...980),
                size: CGFloat.random(in: 16...40),
                delay: Double.random(in: 0...3)
            )
        }
        pawPositions = (0..<8).map { _ in
            (
                x: CGFloat.random(in: 150...1770),
                y: CGFloat.random(in: 150...930),
                size: CGFloat.random(in: 40...70),
                delay: Double.random(in: 0...4)
            )
        }
    }
    
    // MARK: - Fetch & Queue
    
    private func fetchRecentCheckIns() async {
        do {
            let recentSessions = try await apiClient.fetchRecentlyCheckedIn()
            
            await MainActor.run {
                for session in recentSessions {
                    if !welcomedIds.contains(session.id) {
                        welcomedIds.insert(session.id)
                        
                        let welcome = WelcomeGuest(
                            id: session.id,
                            guestName: session.guestName,
                            guestCount: session.guestCount,
                            duration: session.duration,
                            appearedAt: Date()
                        )
                        welcomeQueue.append(welcome)
                        print("[WelcomeOverlay] Queued welcome for \(session.guestName) (id=\(session.id))")
                    }
                }
            }
        } catch {
            print("[WelcomeOverlay] Fetch error: \(error)")
        }
    }
    
    private func showNextIfNeeded() {
        guard currentWelcome == nil, !welcomeQueue.isEmpty else { return }
        
        let next = welcomeQueue.removeFirst()
        currentWelcome = next
        animationPhase = .entering
        
        // Play chime
        chimeManager.playChime(for: "welcome-overlay-\(next.id)")
        
        print("[WelcomeOverlay] Showing full-screen welcome for \(next.guestName)")
        
        // Animation timeline
        DispatchQueue.main.asyncAfter(deadline: .now() + fadeInDuration) {
            animationPhase = .displaying
        }
        
        // Schedule exit
        DispatchQueue.main.asyncAfter(deadline: .now() + fadeInDuration + displayDuration) {
            animationPhase = .exiting
            
            DispatchQueue.main.asyncAfter(deadline: .now() + fadeOutDuration) {
                currentWelcome = nil
                animationPhase = .hidden
                
                // Show next in queue after a small delay
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    showNextIfNeeded()
                }
            }
        }
    }
    
    // Periodically clean up old welcomed IDs
    private func cleanUpWelcomedIds() {
        if welcomedIds.count > 100 {
            welcomedIds.removeAll()
            print("[WelcomeOverlay] Cleaned up welcomed IDs")
        }
    }
}

// MARK: - Preview

#if DEBUG
struct WelcomeOverlayView_Previews: PreviewProvider {
    static var previews: some View {
        WelcomeOverlayView()
            .environmentObject(APIClient.shared)
    }
}
#endif
