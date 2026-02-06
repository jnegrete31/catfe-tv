//
//  ScreenEditorView.swift
//  CatfeTVAdmin
//
//  Screen creation and editing form
//

import SwiftUI
import PhotosUI

struct ScreenEditorView: View {
    @EnvironmentObject var apiClient: APIClient
    @Environment(\.dismiss) var dismiss
    
    let screen: Screen?
    
    @State private var screenType: ScreenType = .today
    @State private var title: String = ""
    @State private var subtitle: String = ""
    @State private var bodyText: String = ""
    @State private var imageURL: String = ""
    @State private var qrCodeURL: String = ""
    @State private var duration: Int = 10
    @State private var priority: Int = 0
    @State private var isActive: Bool = true
    
    // Adoption fields
    @State private var catName: String = ""
    @State private var catAge: String = ""
    @State private var catGender: String = ""
    @State private var catBreed: String = ""
    @State private var catDescription: String = ""
    
    // Event fields
    @State private var eventDate: Date = Date()
    @State private var eventTime: String = ""
    @State private var eventLocation: String = ""
    
    // Schedule
    @State private var hasSchedule: Bool = false
    @State private var scheduleStartDate: Date = Date()
    @State private var scheduleEndDate: Date = Date().addingTimeInterval(86400 * 7)
    @State private var scheduleDays: Set<Int> = Set(0...6)
    @State private var scheduleStartTime: Date = Calendar.current.date(from: DateComponents(hour: 9, minute: 0)) ?? Date()
    @State private var scheduleEndTime: Date = Calendar.current.date(from: DateComponents(hour: 21, minute: 0)) ?? Date()
    
    // Image picker
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var isUploadingImage = false
    
    @State private var isSaving = false
    @State private var showingPreview = false
    
    var isEditing: Bool { screen != nil }
    
    var body: some View {
        Form {
            // Screen Type
            Section("Screen Type") {
                Picker("Type", selection: $screenType) {
                    ForEach(ScreenType.allCases) { type in
                        Label(type.displayName, systemImage: type.icon)
                            .tag(type)
                    }
                }
                .pickerStyle(.navigationLink)
            }
            
            // Basic Info
            Section("Basic Information") {
                TextField("Title", text: $title)
                TextField("Subtitle", text: $subtitle)
                
                VStack(alignment: .leading) {
                    Text("Body Text")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    TextEditor(text: $bodyText)
                        .frame(minHeight: 100)
                }
            }
            
            // Type-specific fields
            if screenType == .adoption {
                Section("Cat Information") {
                    TextField("Cat Name", text: $catName)
                    TextField("Age (e.g., 6 months)", text: $catAge)
                    
                    Picker("Gender", selection: $catGender) {
                        Text("Select").tag("")
                        Text("Male").tag("Male")
                        Text("Female").tag("Female")
                    }
                    
                    TextField("Breed", text: $catBreed)
                    
                    VStack(alignment: .leading) {
                        Text("Description")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        TextEditor(text: $catDescription)
                            .frame(minHeight: 80)
                    }
                }
            }
            
            if screenType == .events {
                Section("Event Details") {
                    DatePicker("Event Date", selection: $eventDate, displayedComponents: .date)
                    TextField("Time (e.g., 2:00 PM - 6:00 PM)", text: $eventTime)
                    TextField("Location", text: $eventLocation)
                }
            }
            
            // Media
            Section("Media") {
                // Image URL
                TextField("Image URL", text: $imageURL)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                
                // Photo Picker
                PhotosPicker(selection: $selectedPhoto, matching: .images) {
                    Label("Choose from Library", systemImage: "photo.on.rectangle")
                }
                .onChange(of: selectedPhoto) { newValue in
                    handlePhotoSelection(newValue)
                }
                
                if isUploadingImage {
                    HStack {
                        ProgressView()
                        Text("Uploading...")
                            .foregroundColor(.secondary)
                    }
                }
                
                // QR Code URL
                TextField("QR Code URL", text: $qrCodeURL)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
            }
            
            // Display Settings
            Section("Display Settings") {
                Stepper("Duration: \(duration) seconds", value: $duration, in: 5...60, step: 5)
                
                Stepper("Priority: \(priority)", value: $priority, in: 0...10)
                
                Toggle("Active", isOn: $isActive)
            }
            
            // Schedule
            Section {
                Toggle("Enable Schedule", isOn: $hasSchedule)
                
                if hasSchedule {
                    NavigationLink {
                        ScheduleView(
                            startDate: $scheduleStartDate,
                            endDate: $scheduleEndDate,
                            selectedDays: $scheduleDays,
                            startTime: $scheduleStartTime,
                            endTime: $scheduleEndTime
                        )
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Schedule Settings")
                            Text(scheduleDescription)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            } header: {
                Text("Schedule")
            } footer: {
                if hasSchedule {
                    Text("This screen will only display during the scheduled times.")
                }
            }
            
            // Preview
            Section {
                Button {
                    showingPreview = true
                } label: {
                    Label("Preview Screen", systemImage: "play.rectangle")
                }
            }
        }
        .navigationTitle(isEditing ? "Edit Screen" : "New Screen")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Cancel") {
                    dismiss()
                }
            }
            
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(isEditing ? "Save" : "Create") {
                    saveScreen()
                }
                .disabled(title.isEmpty || isSaving)
            }
        }
        .sheet(isPresented: $showingPreview) {
            PreviewSheetView(screen: buildScreen())
        }
        .onAppear {
            loadScreenData()
        }
    }
    
    // MARK: - Computed Properties
    
    private var scheduleDescription: String {
        let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        let selectedDayNames = scheduleDays.sorted().map { dayNames[$0] }.joined(separator: ", ")
        
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "h:mm a"
        
        return "\(selectedDayNames) • \(timeFormatter.string(from: scheduleStartTime)) - \(timeFormatter.string(from: scheduleEndTime))"
    }
    
    // MARK: - Methods
    
    private func loadScreenData() {
        guard let screen = screen else { return }
        
        screenType = screen.type
        title = screen.title
        subtitle = screen.subtitle ?? ""
        bodyText = screen.bodyText ?? ""
        imageURL = screen.imageURL ?? ""
        qrCodeURL = screen.qrCodeURL ?? ""
        duration = screen.duration
        priority = screen.priority
        isActive = screen.isActive
        
        catName = screen.catName ?? ""
        catAge = screen.catAge ?? ""
        catGender = screen.catGender ?? ""
        catBreed = screen.catBreed ?? ""
        catDescription = screen.catDescription ?? ""
        
        if let date = screen.eventDate {
            eventDate = date
        }
        eventTime = screen.eventTime ?? ""
        eventLocation = screen.eventLocation ?? ""
        
        if let schedule = screen.schedule {
            hasSchedule = true
            if let start = schedule.startDate { scheduleStartDate = start }
            if let end = schedule.endDate { scheduleEndDate = end }
            scheduleDays = Set(schedule.daysOfWeek)
            
            let timeFormatter = DateFormatter()
            timeFormatter.dateFormat = "HH:mm"
            if let startStr = schedule.startTime, let time = timeFormatter.date(from: startStr) {
                scheduleStartTime = time
            }
            if let endStr = schedule.endTime, let time = timeFormatter.date(from: endStr) {
                scheduleEndTime = time
            }
        }
    }
    
    private func buildScreen() -> Screen {
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"
        
        let schedule: ScreenSchedule? = hasSchedule ? ScreenSchedule(
            startDate: scheduleStartDate,
            endDate: scheduleEndDate,
            daysOfWeek: Array(scheduleDays),
            startTime: timeFormatter.string(from: scheduleStartTime),
            endTime: timeFormatter.string(from: scheduleEndTime)
        ) : nil
        
        return Screen(
            id: screen?.id ?? UUID(),
            numericId: screen?.numericId,
            type: screenType,
            title: title,
            subtitle: subtitle.isEmpty ? nil : subtitle,
            bodyText: bodyText.isEmpty ? nil : bodyText,
            imageURL: imageURL.isEmpty ? nil : imageURL,
            qrCodeURL: qrCodeURL.isEmpty ? nil : qrCodeURL,
            duration: duration,
            priority: priority,
            isActive: isActive,
            sortOrder: screen?.sortOrder ?? apiClient.screens.count,
            schedule: schedule,
            catName: catName.isEmpty ? nil : catName,
            catAge: catAge.isEmpty ? nil : catAge,
            catGender: catGender.isEmpty ? nil : catGender,
            catBreed: catBreed.isEmpty ? nil : catBreed,
            catDescription: catDescription.isEmpty ? nil : catDescription,
            eventDate: screenType == .events ? eventDate : nil,
            eventTime: eventTime.isEmpty ? nil : eventTime,
            eventLocation: eventLocation.isEmpty ? nil : eventLocation
        )
    }
    
    private func saveScreen() {
        isSaving = true
        let newScreen = buildScreen()
        
        Task {
            do {
                if isEditing {
                    try await apiClient.updateScreen(newScreen)
                } else {
                    try await apiClient.createScreen(newScreen)
                }
                HapticFeedback.success()
                dismiss()
            } catch {
                HapticFeedback.error()
            }
            isSaving = false
        }
    }
    
    private func handlePhotoSelection(_ item: PhotosPickerItem?) {
        guard let item = item else { return }
        
        isUploadingImage = true
        
        Task {
            if let data = try? await item.loadTransferable(type: Data.self) {
                // Upload to GitHub
                let filename = "screen_\(UUID().uuidString.prefix(8)).jpg"
                if let url = try? await apiClient.uploadImageToGitHub(imageData: data, filename: filename) {
                    imageURL = url
                }
            }
            isUploadingImage = false
        }
    }
}

// MARK: - Preview Sheet

struct PreviewSheetView: View {
    let screen: Screen
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                let previewWidth = geometry.size.width - 32
                let previewHeight = previewWidth * 9 / 16
                
                ScrollView {
                    VStack(spacing: 20) {
                        // 16:9 Preview
                        MiniScreenPreview(screen: screen)
                            .frame(width: previewWidth, height: previewHeight)
                            .cornerRadius(12)
                            .shadow(color: .black.opacity(0.2), radius: 10)
                        
                        // Info
                        VStack(alignment: .leading, spacing: 8) {
                            Text("This is how your screen will appear on the TV display.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)
                    }
                    .padding()
                }
            }
            .navigationTitle("Preview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Preview

#if DEBUG
struct ScreenEditorView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            ScreenEditorView(screen: nil)
                .environmentObject(APIClient.shared)
        }
    }
}
#endif
