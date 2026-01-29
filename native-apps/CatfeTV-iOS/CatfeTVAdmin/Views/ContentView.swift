import SwiftUI

struct ContentView: View {
    @EnvironmentObject var viewModel: AdminViewModel
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            ScreenListView()
                .tabItem {
                    Label("Screens", systemImage: "tv")
                }
                .tag(0)
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(1)
            
            PreviewView()
                .tabItem {
                    Label("Preview", systemImage: "play.rectangle")
                }
                .tag(2)
        }
        .tint(Color(hex: "#92400e"))
    }
}

// MARK: - Screen List View
struct ScreenListView: View {
    @EnvironmentObject var viewModel: AdminViewModel
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading screens...")
                } else if let error = viewModel.error {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.red)
                        Text(error)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            viewModel.refresh()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    List {
                        ForEach(viewModel.screens) { screen in
                            ScreenRowView(screen: screen)
                                .onTapGesture {
                                    viewModel.selectScreen(screen)
                                }
                        }
                        .onMove(perform: viewModel.moveScreen)
                    }
                    .listStyle(.insetGrouped)
                    .refreshable {
                        await viewModel.loadData()
                    }
                }
            }
            .navigationTitle("Screens")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    EditButton()
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        viewModel.createNewScreen()
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $viewModel.isEditing) {
                if let screen = viewModel.selectedScreen {
                    ScreenEditorView(screen: screen)
                }
            }
            .sheet(isPresented: $viewModel.showingNewScreen) {
                ScreenEditorView(screen: nil)
            }
        }
    }
}

// MARK: - Screen Row View
struct ScreenRowView: View {
    let screen: Screen
    
    var body: some View {
        HStack(spacing: 12) {
            // Type indicator
            Circle()
                .fill(Color(hex: screen.type.backgroundColor))
                .frame(width: 12, height: 12)
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(screen.title)
                    .font(.headline)
                    .lineLimit(1)
                
                HStack {
                    Text(screen.type.displayName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    if !screen.isActive {
                        Text("Inactive")
                            .font(.caption2)
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.gray)
                            .clipShape(Capsule())
                    }
                }
            }
            
            Spacer()
            
            // Duration
            Text("\(screen.durationSeconds)s")
                .font(.caption)
                .foregroundColor(.secondary)
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Screen Editor View
struct ScreenEditorView: View {
    @EnvironmentObject var viewModel: AdminViewModel
    @Environment(\.dismiss) var dismiss
    
    let screen: Screen?
    
    @State private var type: ScreenType = .event
    @State private var title: String = ""
    @State private var subtitle: String = ""
    @State private var body: String = ""
    @State private var qrUrl: String = ""
    @State private var priority: Int = 1
    @State private var durationSeconds: Int = 10
    @State private var isActive: Bool = true
    
    var isNew: Bool { screen == nil }
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Screen Type") {
                    Picker("Type", selection: $type) {
                        ForEach(ScreenType.allCases, id: \.self) { screenType in
                            HStack {
                                Circle()
                                    .fill(Color(hex: screenType.backgroundColor))
                                    .frame(width: 12, height: 12)
                                Text(screenType.displayName)
                            }
                            .tag(screenType)
                        }
                    }
                }
                
                Section("Content") {
                    TextField("Title", text: $title)
                    TextField("Subtitle", text: $subtitle)
                    TextField("Body Text", text: $body, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("QR Code URL", text: $qrUrl)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                }
                
                Section("Display Settings") {
                    Stepper("Priority: \(priority)", value: $priority, in: 1...10)
                    Stepper("Duration: \(durationSeconds)s", value: $durationSeconds, in: 5...120, step: 5)
                    Toggle("Active", isOn: $isActive)
                }
                
                Section("Preview") {
                    ScreenPreviewCard(
                        type: type,
                        title: title,
                        subtitle: subtitle
                    )
                    .frame(height: 120)
                }
            }
            .navigationTitle(isNew ? "New Screen" : "Edit Screen")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveScreen()
                    }
                    .disabled(title.isEmpty)
                }
            }
            .onAppear {
                if let screen = screen {
                    type = screen.type
                    title = screen.title
                    subtitle = screen.subtitle ?? ""
                    body = screen.body ?? ""
                    qrUrl = screen.qrUrl ?? ""
                    priority = screen.priority
                    durationSeconds = screen.durationSeconds
                    isActive = screen.isActive
                }
            }
        }
    }
    
    private func saveScreen() {
        // TODO: Implement API call to save screen
        dismiss()
        viewModel.refresh()
    }
}

// MARK: - Screen Preview Card
struct ScreenPreviewCard: View {
    let type: ScreenType
    let title: String
    let subtitle: String
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(hex: type.backgroundColor))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(type.displayName)
                    .font(.caption2)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.black.opacity(0.3))
                    .clipShape(Capsule())
                
                Text(title.isEmpty ? "Screen Title" : title)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                if !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @EnvironmentObject var viewModel: AdminViewModel
    
    var body: some View {
        NavigationStack {
            Form {
                if let settings = viewModel.settings {
                    Section("Location") {
                        LabeledContent("Name", value: settings.locationName)
                    }
                    
                    Section("Display") {
                        LabeledContent("Default Duration", value: "\(settings.defaultDurationSeconds)s")
                        LabeledContent("Snap & Purr Frequency", value: "Every \(settings.snapAndPurrFrequency) screens")
                        LabeledContent("Refresh Interval", value: "\(settings.refreshIntervalSeconds)s")
                    }
                    
                    Section("GitHub") {
                        if let repo = settings.githubRepo {
                            LabeledContent("Repository", value: repo)
                        } else {
                            Text("Not configured")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Section("Backend") {
                        LabeledContent("API URL", value: APIClient.shared.baseURL)
                    }
                } else {
                    Text("Loading settings...")
                }
            }
            .navigationTitle("Settings")
            .refreshable {
                await viewModel.loadData()
            }
        }
    }
}

// MARK: - Preview View
struct PreviewView: View {
    @EnvironmentObject var viewModel: AdminViewModel
    @State private var currentIndex = 0
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if viewModel.screens.isEmpty {
                    ContentUnavailableView(
                        "No Screens",
                        systemImage: "tv.slash",
                        description: Text("Add screens to preview them here")
                    )
                } else {
                    // Preview area
                    GeometryReader { geo in
                        let screen = viewModel.screens[currentIndex]
                        
                        ZStack {
                            Color(hex: screen.type.backgroundColor)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text(screen.type.displayName)
                                    .font(.caption)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.black.opacity(0.3))
                                    .clipShape(Capsule())
                                
                                Text(screen.title)
                                    .font(.title2.bold())
                                
                                if let subtitle = screen.subtitle {
                                    Text(subtitle)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding()
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                        }
                        .aspectRatio(16/9, contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .shadow(radius: 8)
                        .padding()
                    }
                    
                    // Navigation
                    HStack(spacing: 20) {
                        Button {
                            withAnimation {
                                currentIndex = (currentIndex - 1 + viewModel.screens.count) % viewModel.screens.count
                            }
                        } label: {
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.title)
                        }
                        
                        Text("\(currentIndex + 1) / \(viewModel.screens.count)")
                            .font(.headline)
                        
                        Button {
                            withAnimation {
                                currentIndex = (currentIndex + 1) % viewModel.screens.count
                            }
                        } label: {
                            Image(systemName: "chevron.right.circle.fill")
                                .font(.title)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Preview")
        }
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    ContentView()
        .environmentObject(AdminViewModel())
}
