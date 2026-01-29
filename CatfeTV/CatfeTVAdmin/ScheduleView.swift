//
//  ScheduleView.swift
//  CatfeTVAdmin
//
//  Schedule configuration for screens
//

import SwiftUI

struct ScheduleView: View {
    @Binding var startDate: Date
    @Binding var endDate: Date
    @Binding var selectedDays: Set<Int>
    @Binding var startTime: Date
    @Binding var endTime: Date
    
    private let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    private let shortDayNames = ["S", "M", "T", "W", "T", "F", "S"]
    
    var body: some View {
        Form {
            // Date Range
            Section("Date Range") {
                DatePicker("Start Date", selection: $startDate, displayedComponents: .date)
                DatePicker("End Date", selection: $endDate, in: startDate..., displayedComponents: .date)
            }
            
            // Days of Week
            Section("Days of Week") {
                // Quick select buttons
                HStack {
                    Button("Weekdays") {
                        selectedDays = Set([1, 2, 3, 4, 5])
                        HapticFeedback.light()
                    }
                    .buttonStyle(.bordered)
                    
                    Button("Weekends") {
                        selectedDays = Set([0, 6])
                        HapticFeedback.light()
                    }
                    .buttonStyle(.bordered)
                    
                    Button("All Days") {
                        selectedDays = Set(0...6)
                        HapticFeedback.light()
                    }
                    .buttonStyle(.bordered)
                }
                .font(.caption)
                
                // Day selector
                HStack(spacing: 8) {
                    ForEach(0..<7, id: \.self) { day in
                        DayButton(
                            day: shortDayNames[day],
                            isSelected: selectedDays.contains(day)
                        ) {
                            if selectedDays.contains(day) {
                                selectedDays.remove(day)
                            } else {
                                selectedDays.insert(day)
                            }
                            HapticFeedback.selection()
                        }
                    }
                }
                .padding(.vertical, 8)
                
                // Selected days text
                Text(selectedDaysDescription)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Time Window
            Section("Time Window") {
                DatePicker("Start Time", selection: $startTime, displayedComponents: .hourAndMinute)
                DatePicker("End Time", selection: $endTime, displayedComponents: .hourAndMinute)
                
                // Quick time presets
                VStack(alignment: .leading, spacing: 8) {
                    Text("Presets")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        TimePresetButton(label: "Morning", start: (9, 0), end: (12, 0)) { start, end in
                            setTimeRange(start: start, end: end)
                        }
                        
                        TimePresetButton(label: "Afternoon", start: (12, 0), end: (17, 0)) { start, end in
                            setTimeRange(start: start, end: end)
                        }
                        
                        TimePresetButton(label: "Evening", start: (17, 0), end: (21, 0)) { start, end in
                            setTimeRange(start: start, end: end)
                        }
                        
                        TimePresetButton(label: "All Day", start: (9, 0), end: (21, 0)) { start, end in
                            setTimeRange(start: start, end: end)
                        }
                    }
                }
            }
            
            // Summary
            Section("Summary") {
                VStack(alignment: .leading, spacing: 8) {
                    Label(dateRangeDescription, systemImage: "calendar")
                    Label(selectedDaysDescription, systemImage: "repeat")
                    Label(timeRangeDescription, systemImage: "clock")
                }
                .font(.subheadline)
                .foregroundColor(.secondary)
            }
        }
        .navigationTitle("Schedule")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    // MARK: - Computed Properties
    
    private var selectedDaysDescription: String {
        if selectedDays.count == 7 {
            return "Every day"
        } else if selectedDays == Set([1, 2, 3, 4, 5]) {
            return "Weekdays only"
        } else if selectedDays == Set([0, 6]) {
            return "Weekends only"
        } else {
            let sortedDays = selectedDays.sorted()
            return sortedDays.map { dayNames[$0] }.joined(separator: ", ")
        }
    }
    
    private var dateRangeDescription: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return "\(formatter.string(from: startDate)) - \(formatter.string(from: endDate))"
    }
    
    private var timeRangeDescription: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return "\(formatter.string(from: startTime)) - \(formatter.string(from: endTime))"
    }
    
    // MARK: - Methods
    
    private func setTimeRange(start: (Int, Int), end: (Int, Int)) {
        startTime = Calendar.current.date(from: DateComponents(hour: start.0, minute: start.1)) ?? startTime
        endTime = Calendar.current.date(from: DateComponents(hour: end.0, minute: end.1)) ?? endTime
        HapticFeedback.light()
    }
}

// MARK: - Day Button

struct DayButton: View {
    let day: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(day)
                .font(.headline)
                .frame(width: 40, height: 40)
                .background(isSelected ? Color.catfeTerracotta : Color.gray.opacity(0.2))
                .foregroundColor(isSelected ? .white : .primary)
                .clipShape(Circle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Time Preset Button

struct TimePresetButton: View {
    let label: String
    let start: (Int, Int)
    let end: (Int, Int)
    let action: ((Int, Int), (Int, Int)) -> Void
    
    var body: some View {
        Button {
            action(start, end)
        } label: {
            Text(label)
                .font(.caption)
        }
        .buttonStyle(.bordered)
    }
}

// MARK: - Preview

#if DEBUG
struct ScheduleView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            ScheduleView(
                startDate: .constant(Date()),
                endDate: .constant(Date().addingTimeInterval(86400 * 7)),
                selectedDays: .constant(Set(0...6)),
                startTime: .constant(Date()),
                endTime: .constant(Date())
            )
        }
    }
}
#endif
