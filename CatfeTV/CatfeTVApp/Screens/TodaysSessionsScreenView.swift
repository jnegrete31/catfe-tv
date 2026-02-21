//
//  TodaysSessionsScreenView.swift
//  CatfeTVApp
//
//  Today's Sessions (Session Board) - Shows all today's sessions in a comprehensive grid from Roller
//  Cyan/sky theme with past/current/future session states and capacity indicators
//

import SwiftUI

struct TodaysSessionsScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @EnvironmentObject var apiClient: APIClient
    @State private var appeared = false
    
    // Current time in PST
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
    
    // Group sessions by unique time slots
    private var timeSlots: [(time: String, startTime: String, endTime: String, products: [RollerSession])] {
        let sessions = apiClient.cachedRollerSessions
        guard !sessions.isEmpty else { return [] }
        
        var slotMap: [String: (startTime: String, endTime: String, products: [RollerSession])] = [:]
        for s in sessions {
            if slotMap[s.startTime] == nil {
                slotMap[s.startTime] = (startTime: s.startTime, endTime: s.endTime, products: [])
            }
            slotMap[s.startTime]?.products.append(s)
        }
        
        return slotMap.sorted { $0.key < $1.key }.map {
            (time: $0.key, startTime: $0.value.startTime, endTime: $0.value.endTime, products: $0.value.products)
        }
    }
    
    var body: some View {
        ZStack {
            // Cyan/sky gradient background
            LinearGradient(
                colors: [
                    Color(hex: "0c4a6e"),
                    Color(hex: "0e7490"),
                    Color(hex: "155e75")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Background decoration
            GeometryReader { geo in
                Circle()
                    .fill(Color(hex: "67e8f9").opacity(0.05))
                    .frame(width: 400, height: 400)
                    .blur(radius: 60)
                    .position(x: geo.size.width * 0.85, y: geo.size.height * 0.15)
                    .opacity(appeared ? 1 : 0)
                
                Circle()
                    .fill(Color(hex: "38bdf8").opacity(0.04))
                    .frame(width: 300, height: 300)
                    .blur(radius: 50)
                    .position(x: geo.size.width * 0.15, y: geo.size.height * 0.85)
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
                } else {
                    sessionGrid
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
            VStack(alignment: .leading, spacing: 4) {
                Text("Today's Sessions")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text(pstDateString)
                    .font(.system(size: 24, weight: .medium, design: .rounded))
                    .foregroundColor(Color(hex: "67e8f9").opacity(0.8))
            }
            
            Spacer()
            
            // Legend
            HStack(spacing: 20) {
                legendItem(color: Color(hex: "34d399"), label: "Available")
                legendItem(color: Color(hex: "fbbf24"), label: "Limited")
                legendItem(color: Color(hex: "f87171"), label: "Almost Full")
            }
        }
    }
    
    private func legendItem(color: Color, label: String) -> some View {
        HStack(spacing: 8) {
            Circle()
                .fill(color)
                .frame(width: 12, height: 12)
            Text(label)
                .font(.system(size: 18, weight: .regular, design: .rounded))
                .foregroundColor(.white.opacity(0.6))
        }
    }
    
    // MARK: - Session Grid
    
    private var sessionGrid: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            LazyHGrid(rows: [GridItem(.flexible())], spacing: 16) {
                ForEach(Array(timeSlots.enumerated()), id: \.offset) { index, slot in
                    sessionCard(slot: slot, index: index)
                }
            }
            .padding(.vertical, 8)
        }
    }
    
    private func sessionCard(slot: (time: String, startTime: String, endTime: String, products: [RollerSession]), index: Int) -> some View {
        let startParts = slot.startTime.split(separator: ":").compactMap { Int($0) }
        let endParts = slot.endTime.split(separator: ":").compactMap { Int($0) }
        let slotStart = startParts.count >= 2 ? startParts[0] * 60 + startParts[1] : 0
        let slotEnd = endParts.count >= 2 ? endParts[0] * 60 + endParts[1] : 0
        let isPast = slotEnd <= currentMinutes
        let isCurrent = currentMinutes >= slotStart && currentMinutes < slotEnd
        let totalCapacity = slot.products.reduce(0) { $0 + $1.capacityRemaining }
        
        let cardBgColor: Color = isPast ? Color.white.opacity(0.03) : isCurrent ? Color.white.opacity(0.15) : Color.white.opacity(0.08)
        let cardBorderColor: Color = isCurrent ? Color(hex: "34d399").opacity(0.5) : Color.white.opacity(isPast ? 0.03 : 0.08)
        let cardBorderWidth: CGFloat = isCurrent ? 2 : 1
        let cardOpacity: Double = isPast ? 0.4 : 1.0
        let titleColor: Color = isPast ? .white.opacity(0.5) : .white
        
        return VStack(alignment: .leading, spacing: 12) {
            // Session name + current indicator
            sessionCardHeader(slot: slot, isPast: isPast, isCurrent: isCurrent, titleColor: titleColor)
            
            // Products in this slot
            ForEach(slot.products, id: \.id) { product in
                sessionProductRow(product: product, isPast: isPast)
            }
            
            Spacer()
            
            // Total capacity badge (if not past)
            if !isPast {
                sessionCapacityBadge(totalCapacity: totalCapacity)
            }
        }
        .padding(20)
        .frame(width: 260, minHeight: 200)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(cardBgColor)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(cardBorderColor, lineWidth: cardBorderWidth)
                )
        )
        .opacity(cardOpacity)
        .opacity(appeared ? 1 : 0)
        .animation(.easeOut(duration: 0.4).delay(Double(index) * 0.08 + 0.2), value: appeared)
    }
    
    private func sessionCardHeader(slot: (time: String, startTime: String, endTime: String, products: [RollerSession]), isPast: Bool, isCurrent: Bool, titleColor: Color) -> some View {
        HStack {
            Text(slot.products.first?.sessionName ?? slot.time)
                .font(.system(size: 26, weight: .bold, design: .rounded))
                .foregroundColor(titleColor)
                .lineLimit(1)
            
            Spacer()
            
            if isCurrent {
                Circle()
                    .fill(Color(hex: "34d399"))
                    .frame(width: 10, height: 10)
                    .shadow(color: Color(hex: "34d399").opacity(0.6), radius: 4)
            }
        }
    }
    
    private func sessionProductRow(product: RollerSession, isPast: Bool) -> some View {
        let labelColor: Color = isPast ? .white.opacity(0.3) : .white.opacity(0.6)
        let valueColor: Color = isPast ? .white.opacity(0.3) : capacityColor(product.capacityRemaining)
        let valueText: String = isPast ? "Ended" : "\(product.capacityRemaining) spots"
        
        return VStack(alignment: .leading, spacing: 2) {
            Text(cleanProductName(product.productName))
                .font(.system(size: 18, weight: .regular, design: .rounded))
                .foregroundColor(labelColor)
                .lineLimit(1)
            
            Text(valueText)
                .font(.system(size: 20, weight: .semibold, design: .rounded))
                .foregroundColor(valueColor)
        }
    }
    
    private func sessionCapacityBadge(totalCapacity: Int) -> some View {
        let badgeColor = capacityColor(totalCapacity)
        return HStack {
            Spacer()
            Text("\(totalCapacity) total")
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundColor(badgeColor)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(badgeColor.opacity(0.15))
                .cornerRadius(8)
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer()
            Text("📅")
                .font(.system(size: 100))
            Text("No Sessions Scheduled")
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            Text("Check back soon!")
                .font(.system(size: 28, weight: .medium, design: .rounded))
                .foregroundColor(Color(hex: "67e8f9").opacity(0.8))
            Spacer()
        }
    }
    
    // MARK: - QR Footer
    
    private func qrFooter(url: String) -> some View {
        HStack {
            Spacer()
            HStack(spacing: 16) {
                QRCodeView(url: url, size: 80, label: nil)
                Text(screen.qrLabel ?? "Book a Session")
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
        if let range = name.range(of: "\\s*\\(.*\\)", options: .regularExpression) {
            return String(name[name.startIndex..<range.lowerBound])
        }
        return name
    }
}
