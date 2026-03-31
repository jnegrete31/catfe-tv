//
//  TodayAtCatfeWidget.swift
//  CatfeTVApp
//
//  Persistent overlay widget showing today's events in the top-left corner.
//  Each event row shows the uploaded photo filling the left half,
//  with event name, time, and NOW badge on the right half.
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
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 10) {
                Image(systemName: "calendar.badge.clock")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundColor(.loungeWarmOrange)
                
                Text("Today at Catfé")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.loungeCream)
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 12)
            
            // Event cards
            VStack(spacing: 0) {
                ForEach(Array(todayEvents.enumerated()), id: \.element.id) { index, event in
                    if index > 0 {
                        Rectangle()
                            .fill(Color.loungeWarmOrange.opacity(0.15))
                            .frame(height: 1)
                    }
                    eventRow(event: event, currentTime: currentTime)
                }
            }
        }
        .frame(width: 380)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.loungeCharcoal.opacity(0.92))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.loungeWarmOrange.opacity(0.3), lineWidth: 1)
                )
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.4), radius: 12, x: 0, y: 4)
    }
    
    @ViewBuilder
    private func eventRow(event: CatfeEvent, currentTime: Date) -> some View {
        let isAllDay = event.eventTime == nil || event.eventTime?.isEmpty == true
        let isHappening = isEventHappeningNow(event: event, currentTime: currentTime)
        let hasPhoto = event.imagePath != nil && !(event.imagePath?.isEmpty ?? true)
        
        HStack(spacing: 0) {
            // Left half: Event photo
            if hasPhoto, let imagePath = event.imagePath, let url = URL(string: imagePath) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 160, height: 100)
                            .clipped()
                    case .failure:
                        photoPlaceholder(isHappening: isHappening)
                    default:
                        Rectangle()
                            .fill(Color.loungeStone.opacity(0.2))
                            .frame(width: 160, height: 100)
                            .overlay(
                                ProgressView()
                                    .tint(.loungeStone)
                            )
                    }
                }
            } else {
                // No photo: show a styled placeholder with icon
                photoPlaceholder(isHappening: isHappening)
            }
            
            // Right half: Event info
            VStack(alignment: .leading, spacing: 6) {
                // NOW badge
                if isHappening {
                    Text("NOW")
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.green.opacity(0.8))
                        .cornerRadius(6)
                }
                
                // Event name
                Text(event.name)
                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                    .foregroundColor(isHappening ? .loungeWarmOrange : .loungeCream)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                
                // Time or "All Day"
                HStack(spacing: 6) {
                    Image(systemName: isAllDay ? "sun.max.fill" : "clock")
                        .font(.system(size: 14))
                        .foregroundColor(.loungeStone)
                    
                    Text(isAllDay ? "All Day" : formatEventTime(event.eventTime))
                        .font(.system(size: 16, weight: .regular, design: .rounded))
                        .foregroundColor(.loungeStone)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(height: 100)
    }
    
    // MARK: - Subviews
    
    @ViewBuilder
    private func photoPlaceholder(isHappening: Bool) -> some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [
                        isHappening ? Color.loungeWarmOrange.opacity(0.3) : Color.loungeAmber.opacity(0.2),
                        isHappening ? Color.loungeWarmOrange.opacity(0.1) : Color.loungeAmber.opacity(0.05)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(width: 160, height: 100)
            .overlay(
                Image(systemName: "party.popper.fill")
                    .font(.system(size: 32))
                    .foregroundColor(isHappening ? .loungeWarmOrange.opacity(0.5) : .loungeAmber.opacity(0.4))
            )
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
