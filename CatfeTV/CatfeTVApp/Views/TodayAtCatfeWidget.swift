//
//  TodayAtCatfeWidget.swift
//  CatfeTVApp
//
//  Persistent overlay widget showing today's events in the top-left corner.
//  Displays event names, times, and uploaded photos with a "NOW" indicator
//  for events currently happening.
//

import SwiftUI

struct TodayAtCatfeWidget: View {
    @EnvironmentObject var apiClient: APIClient
    
    private var todayEvents: [CatfeEvent] {
        apiClient.cachedTodayEvents.filter { $0.isActive ?? true }
    }
    
    var body: some View {
        Group {
            if !todayEvents.isEmpty {
                TimelineView(.periodic(from: .now, by: 60)) { context in
                    widgetContent(currentTime: context.date)
                }
            }
        }
    }
    
    @ViewBuilder
    private func widgetContent(currentTime: Date) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack(spacing: 10) {
                Image(systemName: "calendar.badge.clock")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundColor(.loungeWarmOrange)
                
                Text("Today at Catfé")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.loungeCream)
            }
            
            // Divider
            Rectangle()
                .fill(Color.loungeWarmOrange.opacity(0.4))
                .frame(height: 1)
            
            // Event list
            VStack(alignment: .leading, spacing: 10) {
                ForEach(todayEvents) { event in
                    eventRow(event: event, currentTime: currentTime)
                }
            }
        }
        .padding(20)
        .frame(maxWidth: 380)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.loungeCharcoal.opacity(0.92))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.loungeWarmOrange.opacity(0.3), lineWidth: 1)
                )
        )
        .shadow(color: .black.opacity(0.4), radius: 12, x: 0, y: 4)
    }
    
    @ViewBuilder
    private func eventRow(event: CatfeEvent, currentTime: Date) -> some View {
        let isAllDay = event.eventTime == nil || event.eventTime?.isEmpty == true
        let isHappening = isEventHappeningNow(event: event, currentTime: currentTime)
        
        HStack(alignment: .center, spacing: 12) {
            // Event photo (if uploaded) or indicator dot
            if let imagePath = event.imagePath, !imagePath.isEmpty, let url = URL(string: imagePath) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 48, height: 48)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    case .failure:
                        eventDot(isHappening: isHappening)
                    default:
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color.loungeStone.opacity(0.3))
                            .frame(width: 48, height: 48)
                    }
                }
            } else {
                eventDot(isHappening: isHappening)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                // Event name + NOW badge
                HStack(spacing: 8) {
                    Text(event.name)
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(isHappening ? .loungeWarmOrange : .loungeCream)
                        .lineLimit(1)
                    
                    if isHappening {
                        Text("NOW")
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.green.opacity(0.8))
                            .cornerRadius(6)
                    }
                }
                
                // Time or "All Day"
                Text(isAllDay ? "All Day" : formatEventTime(event.eventTime))
                    .font(.system(size: 16, weight: .regular, design: .rounded))
                    .foregroundColor(.loungeStone)
            }
        }
    }
    
    // MARK: - Subviews
    
    @ViewBuilder
    private func eventDot(isHappening: Bool) -> some View {
        Circle()
            .fill(isHappening ? Color.green : Color.loungeAmber.opacity(0.5))
            .frame(width: 10, height: 10)
    }
    
    // MARK: - Helpers
    
    private func isEventHappeningNow(event: CatfeEvent, currentTime: Date) -> Bool {
        // All-day events are always "happening now"
        guard let timeStr = event.eventTime, !timeStr.isEmpty else {
            return true
        }
        
        // Parse time range like "5:30 PM - 7:30 PM" or "17:30 - 19:30"
        let parts = timeStr.components(separatedBy: " - ")
        guard parts.count == 2 else { return false }
        
        let formatter = DateFormatter()
        formatter.timeZone = TimeZone(identifier: "America/Los_Angeles")
        
        // Try 12-hour format first
        formatter.dateFormat = "h:mm a"
        var startDate = formatter.date(from: parts[0].trimmingCharacters(in: .whitespaces))
        var endDate = formatter.date(from: parts[1].trimmingCharacters(in: .whitespaces))
        
        // Try 24-hour format
        if startDate == nil || endDate == nil {
            formatter.dateFormat = "HH:mm"
            startDate = formatter.date(from: parts[0].trimmingCharacters(in: .whitespaces))
            endDate = formatter.date(from: parts[1].trimmingCharacters(in: .whitespaces))
        }
        
        guard let start = startDate, let end = endDate else { return false }
        
        // Build today's start/end times
        let calendar = Calendar.current
        let now = currentTime
        let startComponents = calendar.dateComponents([.hour, .minute], from: start)
        let endComponents = calendar.dateComponents([.hour, .minute], from: end)
        
        guard let todayStart = calendar.date(bySettingHour: startComponents.hour ?? 0,
                                              minute: startComponents.minute ?? 0,
                                              second: 0, of: now),
              let todayEnd = calendar.date(bySettingHour: endComponents.hour ?? 0,
                                            minute: endComponents.minute ?? 0,
                                            second: 0, of: now) else {
            return false
        }
        
        return now >= todayStart && now <= todayEnd
    }
    
    private func formatEventTime(_ time: String?) -> String {
        guard let time = time, !time.isEmpty else { return "All Day" }
        return time
    }
}

// MARK: - Preview

#if DEBUG
struct TodayAtCatfeWidget_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.loungeCharcoal
                .ignoresSafeArea()
            
            VStack {
                HStack {
                    TodayAtCatfeWidget()
                        .environmentObject(APIClient.shared)
                        .padding(.top, 40)
                        .padding(.leading, 60)
                    Spacer()
                }
                Spacer()
            }
        }
    }
}
#endif
