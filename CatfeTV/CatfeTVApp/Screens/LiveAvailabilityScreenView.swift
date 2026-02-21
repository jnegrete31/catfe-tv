//
//  LiveAvailabilityScreenView.swift
//  CatfeTVApp
//
//  Live Availability - Shows next available sessions with capacity from Roller
//  Emerald/teal theme with animated background, capacity bars, and upcoming sessions list
//

import SwiftUI

struct LiveAvailabilityScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @EnvironmentObject var apiClient: APIClient
    @State private var appeared = false
    
    // Current time in PST for session filtering
    private var pstCalendar: Calendar {
        var cal = Calendar.current
        cal.timeZone = TimeZone(identifier: "America/Los_Angeles") ?? .current
        return cal
    }
    
    private var currentMinutes: Int {
        let now = Date()
        let hour = pstCalendar.component(.hour, from: now)
        let minute = pstCalendar.component(.minute, from: now)
        return hour * 60 + minute
    }
    
    private var pstDateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        formatter.timeZone = TimeZone(identifier: "America/Los_Angeles")
        return formatter.string(from: Date())
    }
    
    // Group sessions by time slot and filter to upcoming
    private var upcomingSessions: [(time: String, products: [RollerSession])] {
        let sessions = apiClient.cachedRollerSessions
        guard !sessions.isEmpty else { return [] }
        
        // Group by startTime
        var timeSlotMap: [String: [RollerSession]] = [:]
        for s in sessions {
            let parts = s.startTime.split(separator: ":").compactMap { Int($0) }
            guard parts.count >= 2 else { continue }
            let endParts = s.endTime.split(separator: ":").compactMap { Int($0) }
            guard endParts.count >= 2 else { continue }
            let endMinutes = endParts[0] * 60 + endParts[1]
            // Only show sessions that haven't ended yet
            if endMinutes <= currentMinutes { continue }
            
            if timeSlotMap[s.startTime] == nil {
                timeSlotMap[s.startTime] = []
            }
            timeSlotMap[s.startTime]?.append(s)
        }
        
        // Sort by start time and take next 6 slots
        let sorted = timeSlotMap.sorted { $0.key < $1.key }.prefix(6)
        return sorted.map { (time: $0.key, products: $0.value.sorted { $0.cost > $1.cost }) }
    }
    
    private var nextSession: (time: String, products: [RollerSession])? {
        upcomingSessions.first
    }
    
    private var totalCapacity: Int {
        nextSession?.products.reduce(0) { $0 + $1.capacityRemaining } ?? 0
    }
    
    private var maxCapacity: Int {
        nextSession?.products.first?.capacityRemaining ?? 12
    }
    
    private var isCurrentlyInSession: Bool {
        guard let next = nextSession else { return false }
        let parts = next.time.split(separator: ":").compactMap { Int($0) }
        guard parts.count >= 2 else { return false }
        return currentMinutes >= parts[0] * 60 + parts[1]
    }
    
    var body: some View {
        ZStack {
            // Emerald gradient background
            LinearGradient(
                colors: [
                    Color(hex: "065f46"),
                    Color(hex: "064e3b"),
                    Color(hex: "022c22")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Subtle animated background glows
            GeometryReader { geo in
                Circle()
                    .fill(Color(hex: "6ee7b7").opacity(0.05))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .blur(radius: 80)
                    .position(x: geo.size.width * 0.8, y: geo.size.height * 0.2)
                    .opacity(appeared ? 1 : 0)
                
                Circle()
                    .fill(Color(hex: "2dd4bf").opacity(0.04))
                    .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                    .blur(radius: 60)
                    .position(x: geo.size.width * 0.2, y: geo.size.height * 0.8)
                    .opacity(appeared ? 1 : 0)
            }
            
            // Main content
            VStack(spacing: 0) {
                // Header
                headerView
                    .padding(.horizontal, 60)
                    .padding(.top, 50)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6), value: appeared)
                
                Spacer().frame(height: 30)
                
                // Content
                if apiClient.cachedRollerSessions.isEmpty {
                    emptyState
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                } else if upcomingSessions.isEmpty {
                    allCompleteState
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                } else {
                    mainContent
                        .padding(.horizontal, 60)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.6).delay(0.15), value: appeared)
                }
                
                Spacer()
                
                // QR Code footer
                if let qrUrl = screen.qrCodeURL, !qrUrl.isEmpty {
                    qrFooter(url: qrUrl)
                        .padding(.horizontal, 60)
                        .padding(.bottom, 50)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                }
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
    
    // MARK: - Header
    
    private var headerView: some View {
        HStack {
            HStack(spacing: 16) {
                // Pulsing green dot
                Circle()
                    .fill(Color(hex: "34d399"))
                    .frame(width: 16, height: 16)
                    .shadow(color: Color(hex: "34d399").opacity(0.6), radius: 8)
                
                Text("LIVE AVAILABILITY")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .tracking(3)
            }
            
            Spacer()
            
            Text(pstDateString)
                .font(.system(size: 28, weight: .medium, design: .rounded))
                .foregroundColor(Color(hex: "6ee7b7").opacity(0.8))
        }
    }
    
    // MARK: - Main Content (Next Session + Upcoming List)
    
    private var mainContent: some View {
        HStack(spacing: 40) {
            // Left: Next Session Highlight
            nextSessionCard
                .frame(maxWidth: .infinity)
            
            // Right: Upcoming Sessions List
            upcomingList
                .frame(width: 500)
        }
        .frame(maxHeight: .infinity)
    }
    
    // MARK: - Next Session Card
    
    private var nextSessionCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Status badge
            Text(isCurrentlyInSession ? "🟢 HAPPENING NOW" : "⏰ NEXT SESSION")
                .font(.system(size: 24, weight: .semibold, design: .rounded))
                .foregroundColor(Color(hex: "6ee7b7"))
                .tracking(2)
            
            // Session name
            Text(nextSession?.products.first?.sessionName ?? nextSession?.time ?? "")
                .font(.system(size: 72, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .lineLimit(2)
            
            // Product tags
            if let products = nextSession?.products {
                HStack(spacing: 12) {
                    ForEach(products.prefix(3), id: \.id) { product in
                        VStack(spacing: 4) {
                            Text(cleanProductName(product.productName))
                                .font(.system(size: 22, weight: .semibold, design: .rounded))
                                .foregroundColor(.white)
                            Text("$\(String(format: "%.0f", product.cost))")
                                .font(.system(size: 18, weight: .medium, design: .rounded))
                                .foregroundColor(Color(hex: "6ee7b7"))
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.white.opacity(0.1), lineWidth: 1)
                        )
                    }
                }
            }
            
            Spacer().frame(height: 10)
            
            // Capacity display
            HStack(alignment: .firstTextBaseline, spacing: 16) {
                Text("\(totalCapacity)")
                    .font(.system(size: 64, weight: .bold, design: .rounded))
                    .foregroundColor(capacityColor(totalCapacity))
                
                Text(totalCapacity == 1 ? "spot remaining" : "spots remaining")
                    .font(.system(size: 28, weight: .medium, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
            }
            
            // Capacity bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 12)
                    
                    RoundedRectangle(cornerRadius: 6)
                        .fill(capacityColor(totalCapacity))
                        .frame(width: geo.size.width * min(CGFloat(totalCapacity) / CGFloat(max(maxCapacity, 1)), 1.0), height: 12)
                        .animation(.easeInOut(duration: 1.0), value: totalCapacity)
                }
            }
            .frame(height: 12)
        }
        .padding(40)
        .background(
            RoundedRectangle(cornerRadius: 28)
                .fill(Color.white.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 28)
                        .stroke(Color.white.opacity(0.15), lineWidth: 1)
                )
        )
    }
    
    // MARK: - Upcoming Sessions List
    
    private var upcomingList: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("COMING UP")
                .font(.system(size: 24, weight: .semibold, design: .rounded))
                .foregroundColor(Color(hex: "6ee7b7"))
                .tracking(2)
                .padding(.bottom, 4)
            
            ForEach(Array(upcomingSessions.dropFirst().prefix(5).enumerated()), id: \.offset) { index, slot in
                let capacity = slot.products.reduce(0) { $0 + $1.capacityRemaining }
                
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(slot.products.first?.sessionName ?? slot.time)
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        
                        Text(slot.products.map { cleanProductName($0.productName) }.joined(separator: " · "))
                            .font(.system(size: 18, weight: .regular, design: .rounded))
                            .foregroundColor(.white.opacity(0.6))
                            .lineLimit(1)
                    }
                    
                    Spacer()
                    
                    Text("\(capacity) left")
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundColor(capacityColor(capacity))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(capacityColor(capacity).opacity(0.15))
                        .cornerRadius(12)
                }
                .padding(16)
                .background(Color.white.opacity(0.05))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                )
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.4).delay(Double(index) * 0.1 + 0.3), value: appeared)
            }
            
            Spacer()
        }
    }
    
    // MARK: - Empty / Complete States
    
    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer()
            Text("😺")
                .font(.system(size: 100))
            Text("No Sessions Today")
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            Text("Check back tomorrow for available sessions!")
                .font(.system(size: 28, weight: .medium, design: .rounded))
                .foregroundColor(Color(hex: "6ee7b7").opacity(0.8))
            Spacer()
        }
    }
    
    private var allCompleteState: some View {
        VStack(spacing: 20) {
            Spacer()
            Text("🌙")
                .font(.system(size: 100))
            Text("All Sessions Complete")
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            Text("See you tomorrow!")
                .font(.system(size: 28, weight: .medium, design: .rounded))
                .foregroundColor(Color(hex: "6ee7b7").opacity(0.8))
            Spacer()
        }
    }
    
    // MARK: - QR Footer
    
    private func qrFooter(url: String) -> some View {
        HStack {
            Spacer()
            HStack(spacing: 16) {
                QRCodeView(url: url, size: 80, label: nil)
                Text(screen.qrLabel ?? "Book Now")
                    .font(.system(size: 22, weight: .medium, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
            }
        }
    }
    
    // MARK: - Helpers
    
    private func capacityColor(_ capacity: Int) -> Color {
        if capacity <= 3 { return Color(hex: "f87171") }      // Red
        if capacity <= 6 { return Color(hex: "fbbf24") }      // Amber
        return Color(hex: "34d399")                             // Emerald
    }
    
    private func cleanProductName(_ name: String) -> String {
        // Remove parenthetical content like "(60 min)"
        if let range = name.range(of: "\\s*\\(.*\\)", options: .regularExpression) {
            return String(name[name.startIndex..<range.lowerBound])
        }
        return name
    }
}
