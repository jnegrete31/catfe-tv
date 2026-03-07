//
//  UpcomingEventsScreenView.swift
//  CatfeTV
//
//  Upcoming Events overview slide - shows multiple events from the events table
//  Uses APIClient.cachedUpcomingEvents (fetched via fetchUpcomingEvents)
//

import SwiftUI

struct UpcomingEventsScreenView: View {
    let screen: Screen
    let settings: AppSettings?
    
    @EnvironmentObject var apiClient: APIClient
    @State private var appeared = false
    
    private var events: [CatfeEvent] {
        apiClient.cachedUpcomingEvents
    }
    
    var body: some View {
        ZStack {
            // Warm cream gradient background matching Catfé brand
            LinearGradient(
                colors: [
                    Color(hex: "fef3c7"),
                    Color(hex: "f5e6d3"),
                    Color(hex: "ede0d4")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Decorative circles
            Circle()
                .fill(Color.purple.opacity(0.08))
                .frame(width: 400, height: 400)
                .offset(x: 600, y: -300)
            
            Circle()
                .fill(Color.loungeMintGreen.opacity(0.1))
                .frame(width: 300, height: 300)
                .offset(x: -500, y: 350)
            
            if events.isEmpty {
                emptyState
            } else {
                eventsContent
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
    
    // MARK: - Empty State
    
    private var emptyState: some View {
        VStack(spacing: 24) {
            Text("📅")
                .font(.system(size: 80))
            Text("No Upcoming Events")
                .font(.system(size: 56, weight: .bold, design: .serif))
                .foregroundColor(Color(hex: "3d2914"))
            Text("Stay tuned for exciting events at Catfé!")
                .font(.system(size: 32, weight: .regular, design: .rounded))
                .foregroundColor(Color(hex: "7a6a5a"))
        }
    }
    
    // MARK: - Events Content
    
    private var eventsContent: some View {
        VStack(alignment: .leading, spacing: 40) {
            // Header
            HStack(spacing: 16) {
                HStack(spacing: 12) {
                    Text("📅")
                        .font(.system(size: 36))
                    Text("Upcoming Events")
                        .font(.system(size: 36, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 28)
                .padding(.vertical, 14)
                .background(
                    LinearGradient(
                        colors: [Color.purple, Color(hex: "6d28d9")],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(40)
                .shadow(color: Color.purple.opacity(0.35), radius: 15, x: 0, y: 5)
                
                Spacer()
                
                Text(settings?.locationName ?? "Catfé")
                    .font(.system(size: 28, weight: .regular, design: .serif))
                    .italic()
                    .foregroundColor(Color(hex: "8a7a6a"))
            }
            .padding(.horizontal, 60)
            .padding(.top, 50)
            
            // Events Grid
            eventsGrid
                .padding(.horizontal, 60)
                .padding(.bottom, 50)
            
            Spacer(minLength: 0)
        }
    }
    
    @ViewBuilder
    private var eventsGrid: some View {
        let columns = events.count <= 2
            ? [GridItem(.flexible(), spacing: 30), GridItem(.flexible(), spacing: 30)]
            : [GridItem(.flexible(), spacing: 24), GridItem(.flexible(), spacing: 24), GridItem(.flexible(), spacing: 24)]
        
        LazyVGrid(columns: columns, spacing: 24) {
            ForEach(events) { event in
                eventCard(event)
            }
        }
    }
    
    // MARK: - Event Card
    
    private func eventCard(_ event: CatfeEvent) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Event Image
            if let imagePath = event.imagePath, !imagePath.isEmpty {
                AsyncImage(url: URL(string: imagePath)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(height: 180)
                            .clipped()
                    default:
                        Rectangle()
                            .fill(Color.purple.opacity(0.1))
                            .frame(height: 180)
                            .overlay(
                                Text("📅")
                                    .font(.system(size: 50))
                            )
                    }
                }
            }
            
            // Event Info
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    Text(event.name)
                        .font(.system(size: 32, weight: .bold, design: .serif))
                        .foregroundColor(Color(hex: "3d2914"))
                        .lineLimit(2)
                    
                    Spacer()
                    
                    // Days-until badge using eventDate
                    let dateStr = event.eventDate ?? ""
                    if !dateStr.isEmpty {
                        Text(daysUntilText(dateStr))
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(daysUntilColor(dateStr))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(daysUntilBgColor(dateStr))
                            .cornerRadius(12)
                    }
                }
                
                // Date and time row
                HStack(spacing: 16) {
                    let dateStr = event.eventDate ?? ""
                    if !dateStr.isEmpty {
                        HStack(spacing: 6) {
                            Image(systemName: "calendar")
                                .font(.system(size: 20))
                                .foregroundColor(Color(hex: "d97706"))
                            Text(formatDate(dateStr))
                                .font(.system(size: 22, weight: .regular, design: .rounded))
                                .foregroundColor(Color(hex: "6a5a4a"))
                        }
                    }
                    
                    if let time = event.eventTime, !time.isEmpty {
                        HStack(spacing: 6) {
                            Image(systemName: "clock")
                                .font(.system(size: 20))
                                .foregroundColor(Color(hex: "d97706"))
                            Text(time)
                                .font(.system(size: 22, weight: .regular, design: .rounded))
                                .foregroundColor(Color(hex: "6a5a4a"))
                        }
                    }
                }
                
                // Description text
                if let description = event.description, !description.isEmpty {
                    Text(description)
                        .font(.system(size: 22, weight: .regular, design: .rounded))
                        .foregroundColor(Color(hex: "7a6a5a"))
                        .lineLimit(2)
                }
                
                if let location = event.location, !location.isEmpty {
                    HStack(spacing: 6) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 18))
                            .foregroundColor(Color(hex: "8a7a6a"))
                        Text(location)
                            .font(.system(size: 20, weight: .regular, design: .rounded))
                            .foregroundColor(Color(hex: "8a7a6a"))
                    }
                }
            }
            .padding(24)
        }
        .background(Color.white.opacity(0.85))
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.08), radius: 15, x: 0, y: 5)
    }
    
    // MARK: - Helpers
    
    private func daysUntilText(_ dateStr: String) -> String {
        guard let date = parseDate(dateStr) else { return "" }
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let eventDay = calendar.startOfDay(for: date)
        let diff = calendar.dateComponents([.day], from: today, to: eventDay).day ?? 0
        if diff == 0 { return "Today!" }
        if diff == 1 { return "Tomorrow" }
        if diff < 0 { return "Past" }
        return "In \(diff) days"
    }
    
    private func daysUntilColor(_ dateStr: String) -> Color {
        guard let date = parseDate(dateStr) else { return Color(hex: "7c3aed") }
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let eventDay = calendar.startOfDay(for: date)
        let diff = calendar.dateComponents([.day], from: today, to: eventDay).day ?? 0
        if diff == 0 { return Color(hex: "dc2626") }
        if diff == 1 { return Color(hex: "d97706") }
        return Color(hex: "7c3aed")
    }
    
    private func daysUntilBgColor(_ dateStr: String) -> Color {
        guard let date = parseDate(dateStr) else { return Color(hex: "ede9fe") }
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let eventDay = calendar.startOfDay(for: date)
        let diff = calendar.dateComponents([.day], from: today, to: eventDay).day ?? 0
        if diff == 0 { return Color(hex: "fecaca") }
        if diff == 1 { return Color(hex: "fef3c7") }
        return Color(hex: "ede9fe")
    }
    
    private func formatDate(_ dateStr: String) -> String {
        guard let date = parseDate(dateStr) else { return dateStr }
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        formatter.timeZone = TimeZone(identifier: "America/Los_Angeles")
        return formatter.string(from: date)
    }
    
    private func parseDate(_ dateStr: String) -> Date? {
        // Try ISO 8601 with fractional seconds
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = isoFormatter.date(from: dateStr) { return date }
        
        // Try ISO 8601 without fractional seconds
        let isoNoFrac = ISO8601DateFormatter()
        isoNoFrac.formatOptions = [.withInternetDateTime]
        if let date = isoNoFrac.date(from: dateStr) { return date }
        
        // Try simple date format (YYYY-MM-DD)
        let simpleFmt = DateFormatter()
        simpleFmt.dateFormat = "yyyy-MM-dd"
        simpleFmt.timeZone = TimeZone(identifier: "America/Los_Angeles")
        return simpleFmt.date(from: dateStr)
    }
}
