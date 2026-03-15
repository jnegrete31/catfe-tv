//
//  GuestStatusBoardScreenView.swift
//  CatfeTVApp
//
//  Guest Status Board - Magazine Split design
//  Left: Square grid of cat photos from the lounge (adoption screens)
//  Orange accent divider
//  Right: Clean cream panel with compact session cards
//

import SwiftUI

struct GuestStatusBoardScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @EnvironmentObject var apiClient: APIClient
    @State private var guestSessions: [GuestSession] = []
    @State private var appeared = false
    @State private var fetchError: String?
    
    /// Cat photos from adoption screens
    private var catPhotos: [(url: String, name: String)] {
        apiClient.screens
            .filter { $0.type == .adoption && $0.imageURL != nil && !($0.imageURL ?? "").isEmpty }
            .compactMap { screen in
                guard let url = screen.imageURL else { return nil }
                let name = screen.title
                return (url: url, name: name)
            }
    }
    
    var body: some View {
        GeometryReader { geo in
            HStack(spacing: 0) {
                // -- LEFT PANEL: Cat Photo Grid --
                ZStack {
                    // Background
                    Color(hex: "1a1a1a")
                    
                    if catPhotos.isEmpty {
                        // Fallback: branded placeholder
                        VStack(spacing: 16) {
                            Text("\u{1F431}")
                                .font(.system(size: 100))
                            Text("Our Cats")
                                .font(.system(size: 36, weight: .bold, design: .serif))
                                .foregroundColor(.white)
                            Text("Meet the residents!")
                                .font(.system(size: 20))
                                .foregroundColor(.white.opacity(0.7))
                        }
                    } else {
                        catPhotoSquareGrid(panelWidth: geo.size.width * 0.40, panelHeight: geo.size.height)
                    }
                    
                    // Subtle "Meet Our Cats" label at bottom
                    VStack {
                        Spacer()
                        HStack {
                            HStack(spacing: 8) {
                                Text("\u{1F43E}")
                                    .font(.system(size: 16))
                                Text("Meet Our Cats")
                                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                                    .foregroundColor(.white.opacity(0.9))
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(.black.opacity(0.55))
                            )
                            Spacer()
                        }
                        .padding(16)
                    }
                }
                .frame(width: geo.size.width * 0.40)
                
                // -- ORANGE ACCENT DIVIDER --
                Rectangle()
                    .fill(Color(hex: "E8913A"))
                    .frame(width: 5)
                
                // -- RIGHT PANEL: Session Cards --
                ZStack(alignment: .topTrailing) {
                    // Subtle paw print watermark
                    PawPrintWatermark()
                        .frame(width: 100, height: 100)
                        .opacity(0.04)
                        .padding(24)
                    
                    VStack(alignment: .leading, spacing: 0) {
                        // Header
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Guest Sessions")
                                .font(.system(size: 48, weight: .heavy))
                                .foregroundColor(Color(hex: "1a1a1a"))
                            
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color(hex: "E8913A"))
                                .frame(width: 120, height: 4)
                            
                            let activeGuests = guestSessions.filter { !$0.isWaiting }.reduce(0) { $0 + $1.guestCount }
                            let waitingGuests = guestSessions.filter { $0.isWaiting }.reduce(0) { $0 + $1.guestCount }
                            Text(guestSessions.isEmpty
                                 ? "The lounge is waiting for you!"
                                 : waitingGuests > 0
                                    ? "\(activeGuests) guest\(activeGuests == 1 ? "" : "s") in the lounge \u{00B7} \(waitingGuests) waiting"
                                    : "\(activeGuests) guest\(activeGuests == 1 ? "" : "s") enjoying the lounge")
                                .font(.system(size: 22))
                                .foregroundColor(Color(hex: "78716c"))
                        }
                        .padding(.bottom, 24)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : -20)
                        .animation(.easeOut(duration: 0.5), value: appeared)
                        
                        // Session Cards or Empty State
                        TimelineView(.periodic(from: .now, by: 1.0)) { timeline in
                            let now = timeline.date
                            let sorted = sortedSessions(now: now)
                            
                            if sorted.isEmpty {
                                Spacer()
                                emptyState
                                Spacer()
                            } else {
                                ScrollView(.vertical, showsIndicators: false) {
                                    VStack(spacing: 12) {
                                        ForEach(Array(sorted.enumerated()), id: \.element.id) { index, session in
                                            sessionCard(session: session, now: now, index: index)
                                        }
                                    }
                                }
                            }
                        }
                        
                        Spacer(minLength: 8)
                        
                        // Footer legend
                        sessionLegend
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                    }
                    .padding(.horizontal, 48)
                    .padding(.vertical, 36)
                }
                .frame(maxWidth: .infinity)
                .background(Color(hex: "FAFAF5"))
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
            fetchSessions()
        }
        .onReceive(Timer.publish(every: 10, on: .main, in: .common).autoconnect()) { _ in
            fetchSessions()
        }
    }
    
    // MARK: - Square Cat Photo Grid
    
    /// Calculates the optimal number of columns to make cells as square as possible
    /// and fit all photos in the available space
    @ViewBuilder
    private func catPhotoSquareGrid(panelWidth: CGFloat, panelHeight: CGFloat) -> some View {
        let photos = catPhotos
        let count = photos.count
        let gap: CGFloat = 2
        
        // Calculate optimal columns to make cells square-ish and fit all photos
        // Try different column counts and pick the one that gives the most square cells
        let cols = optimalColumns(count: count, width: panelWidth, height: panelHeight, gap: gap)
        let rows = Int(ceil(Double(count) / Double(cols)))
        
        let totalHGap = gap * CGFloat(cols - 1)
        let totalVGap = gap * CGFloat(rows - 1)
        let cellWidth = (panelWidth - totalHGap) / CGFloat(cols)
        let cellHeight = (panelHeight - totalVGap) / CGFloat(rows)
        
        VStack(spacing: gap) {
            ForEach(0..<rows, id: \.self) { row in
                HStack(spacing: gap) {
                    ForEach(0..<cols, id: \.self) { col in
                        let index = row * cols + col
                        if index < count {
                            squareCatCell(photos[index], width: cellWidth, height: cellHeight)
                        } else {
                            // Empty cell with dark fill to maintain grid
                            Rectangle()
                                .fill(Color(hex: "1a1a1a"))
                                .frame(width: cellWidth, height: cellHeight)
                        }
                    }
                }
            }
        }
    }
    
    /// Find the number of columns that makes cells closest to square
    private func optimalColumns(count: Int, width: CGFloat, height: CGFloat, gap: CGFloat) -> Int {
        guard count > 0 else { return 1 }
        
        var bestCols = 1
        var bestRatio: CGFloat = .infinity
        
        // Try column counts from 1 to count
        let maxCols = min(count, 8) // Cap at 8 columns
        for c in 1...maxCols {
            let r = Int(ceil(Double(count) / Double(c)))
            let cellW = (width - gap * CGFloat(c - 1)) / CGFloat(c)
            let cellH = (height - gap * CGFloat(r - 1)) / CGFloat(r)
            
            // Skip if cells would be too small
            if cellW < 60 || cellH < 60 { continue }
            
            // Ratio of 1.0 = perfect square; we want closest to 1.0
            let ratio = cellW / cellH
            let deviation = abs(ratio - 1.0)
            
            if deviation < bestRatio {
                bestRatio = deviation
                bestCols = c
            }
        }
        
        return bestCols
    }
    
    @ViewBuilder
    private func squareCatCell(_ photo: (url: String, name: String), width: CGFloat, height: CGFloat) -> some View {
        ZStack(alignment: .bottomLeading) {
            AsyncImage(url: URL(string: photo.url)) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: width, height: height)
                        .clipped()
                default:
                    Rectangle()
                        .fill(Color(hex: "2d2418"))
                        .frame(width: width, height: height)
                        .overlay(
                            Text("\u{1F431}")
                                .font(.system(size: min(width, height) * 0.3))
                        )
                }
            }
            
            // Name overlay at bottom
            ZStack(alignment: .bottomLeading) {
                LinearGradient(
                    colors: [.clear, .black.opacity(0.65)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: height * 0.35)
                
                Text(photo.name)
                    .font(.system(size: min(width, height) * 0.10, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.5), radius: 3, x: 0, y: 1)
                    .padding(8)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
        }
        .frame(width: width, height: height)
        .clipped()
    }
    
    // MARK: - Sorted Sessions
    
    private func sortedSessions(now: Date) -> [GuestSession] {
        guestSessions.sorted { a, b in
            let aWaiting = a.isWaiting
            let bWaiting = b.isWaiting
            let aExpired = !aWaiting && a.expiresAt <= now
            let bExpired = !bWaiting && b.expiresAt <= now
            if aExpired != bExpired { return !aExpired }
            if aWaiting != bWaiting { return !aWaiting }
            return a.expiresAt < b.expiresAt
        }
    }
    
    // MARK: - Session Card
    
    @ViewBuilder
    private func sessionCard(session: GuestSession, now: Date, index: Int) -> some View {
        let remaining = session.expiresAt.timeIntervalSince(now)
        let isWaiting = session.isWaiting
        let isExpired = !isWaiting && remaining <= 0
        let isUrgent = !isWaiting && remaining > 0 && remaining <= 300
        let minutes = max(0, Int(remaining)) / 60
        let seconds = max(0, Int(remaining)) % 60
        let accent = accentColor(for: session.duration)
        let totalDuration = (Double(session.duration) ?? 60) * 60
        let percent = isExpired ? 0 : min(1.0, remaining / totalDuration)
        let amberColor = Color(hex: "F59E0B")
        let darkAmberColor = Color(hex: "D97706")
        
        let checkInTime = session.checkInAt
        let formatter = DateFormatter()
        let _ = formatter.dateFormat = "h:mm a"
        let checkInString = formatter.string(from: checkInTime)
        
        HStack(spacing: 16) {
            // Color dot / waiting icon
            if isWaiting {
                ZStack {
                    Circle()
                        .fill(amberColor.opacity(0.2))
                        .frame(width: 24, height: 24)
                    Text("\u{23F3}")
                        .font(.system(size: 14))
                }
            } else {
                Circle()
                    .fill(isExpired ? Color.red : accent)
                    .frame(width: 12, height: 12)
            }
            
            // Guest info
            VStack(alignment: .leading, spacing: 4) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text(session.guestName)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(Color(hex: "1a1a1a"))
                        .lineLimit(1)
                    
                    if session.guestCount > 1 {
                        Text("+\(session.guestCount - 1)")
                            .font(.system(size: 16))
                            .foregroundColor(Color(hex: "9CA3AF"))
                    }
                }
                
                HStack(spacing: 8) {
                    Text(isWaiting ? "Waiting" : session.sessionTypeLabel)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(isWaiting ? amberColor : isExpired ? .red : accent)
                    
                    Text("\u{2022}")
                        .font(.system(size: 12))
                        .foregroundColor(Color(hex: "9CA3AF"))
                    
                    if isWaiting {
                        Text("\(session.sessionTypeLabel) \u{00B7} Starts at \(session.formattedScheduledStart)")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "9CA3AF"))
                    } else {
                        Text("Checked in \(checkInString)")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "9CA3AF"))
                    }
                }
            }
            
            Spacer()
            
            // Countdown / Waiting indicator
            if isWaiting {
                VStack(alignment: .trailing, spacing: 2) {
                    Text(session.formattedScheduledStart)
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundColor(amberColor)
                    Text("Session starts soon")
                        .font(.system(size: 13))
                        .foregroundColor(darkAmberColor)
                }
            } else if isExpired {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Time's up")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.red)
                    Text("Please visit the front desk")
                        .font(.system(size: 13))
                        .foregroundColor(.red.opacity(0.8))
                }
            } else {
                Text(String(format: "%d:%02d", minutes, seconds))
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .foregroundColor(isUrgent ? .red : Color(hex: "1a1a1a"))
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(isWaiting ? amberColor.opacity(0.06) : isExpired ? Color.red.opacity(0.06) : accent.opacity(0.06))
        )
        .overlay(
            HStack {
                RoundedRectangle(cornerRadius: 2)
                    .fill(isWaiting ? amberColor : isExpired ? Color.red : accent)
                    .frame(width: 4)
                Spacer()
            }
        )
        .overlay(
            VStack {
                Spacer()
                GeometryReader { barGeo in
                    if !isExpired && !isWaiting {
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.black.opacity(0.05))
                                .frame(height: 3)
                            Rectangle()
                                .fill(isUrgent ? Color.red : accent)
                                .frame(width: barGeo.size.width * percent, height: 3)
                        }
                    }
                }
                .frame(height: 3)
            }
            .clipShape(RoundedRectangle(cornerRadius: 12))
        )
        .opacity(isWaiting ? 0.85 : 1.0)
        .opacity(appeared ? 1 : 0)
        .offset(x: appeared ? 0 : 20)
        .animation(.easeOut(duration: 0.4).delay(Double(index) * 0.08), value: appeared)
    }
    
    // MARK: - Accent Colors
    
    private func accentColor(for duration: String) -> Color {
        switch duration {
        case "90": return Color(hex: "3B82F6")
        case "60": return Color(hex: "14B8A6")
        case "30": return Color(hex: "F59E0B")
        case "15": return Color(hex: "A855F7")
        default: return Color(hex: "9CA3AF")
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Text("\u{1F43E}")
                .font(.system(size: 72))
            Text("No active sessions")
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(Color(hex: "1a1a1a"))
            Text("Check in at the front desk to see your timer here!")
                .font(.system(size: 20))
                .foregroundColor(Color(hex: "9CA3AF"))
        }
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - Session Legend
    
    private var sessionLegend: some View {
        HStack(spacing: 24) {
            legendItem(color: Color(hex: "3B82F6"), label: "Study Sesh (90 min)")
            legendItem(color: Color(hex: "14B8A6"), label: "Full Meow (60 min)")
            legendItem(color: Color(hex: "F59E0B"), label: "Mini Meow (30 min)")
            legendItem(color: Color(hex: "A855F7"), label: "Quick Purr (15 min)")
        }
        .padding(.top, 12)
        .overlay(
            Rectangle()
                .fill(Color.black.opacity(0.06))
                .frame(height: 1),
            alignment: .top
        )
    }
    
    @ViewBuilder
    private func legendItem(color: Color, label: String) -> some View {
        HStack(spacing: 8) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(Color(hex: "9CA3AF"))
        }
    }
    
    // MARK: - Paw Print Watermark
    
    private struct PawPrintWatermark: View {
        var body: some View {
            Canvas { context, size in
                let color = Color(hex: "E8913A")
                context.fill(
                    Ellipse().path(in: CGRect(x: size.width * 0.22, y: size.height * 0.45, width: size.width * 0.56, height: size.height * 0.44)),
                    with: .color(color)
                )
                let toePositions: [(CGFloat, CGFloat, CGFloat)] = [
                    (0.22, 0.28, 0.10),
                    (0.42, 0.18, 0.10),
                    (0.62, 0.18, 0.10),
                    (0.78, 0.28, 0.10),
                ]
                for toe in toePositions {
                    context.fill(
                        Circle().path(in: CGRect(
                            x: size.width * toe.0 - size.width * toe.2 / 2,
                            y: size.height * toe.1 - size.height * toe.2 / 2,
                            width: size.width * toe.2,
                            height: size.height * toe.2
                        )),
                        with: .color(color)
                    )
                }
            }
        }
    }
    
    // MARK: - Data Fetching
    
    private func fetchSessions() {
        Task {
            do {
                let sessions = try await apiClient.fetchGuestSessions()
                await MainActor.run {
                    self.guestSessions = sessions.filter { $0.status == "active" || $0.status == "extended" || $0.status == "waiting" }
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
