import SwiftUI
import Combine

@MainActor
class AdminViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var screens: [Screen] = []
    @Published var settings: Settings?
    @Published var isLoading: Bool = true
    @Published var error: String?
    @Published var selectedScreen: Screen?
    @Published var isEditing: Bool = false
    @Published var showingNewScreen: Bool = false
    
    // MARK: - Initialization
    init() {
        Task {
            await loadData()
        }
    }
    
    // MARK: - Data Loading
    func loadData() async {
        isLoading = true
        error = nil
        
        do {
            async let screensResult = APIClient.shared.getActiveScreens()
            async let settingsResult = APIClient.shared.getSettings()
            
            let (fetchedScreens, fetchedSettings) = try await (screensResult, settingsResult)
            
            self.screens = fetchedScreens.sorted { $0.sortOrder < $1.sortOrder }
            self.settings = fetchedSettings
            
        } catch {
            self.error = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func refresh() {
        Task {
            await loadData()
        }
    }
    
    // MARK: - Screen Management
    func selectScreen(_ screen: Screen) {
        selectedScreen = screen
        isEditing = true
    }
    
    func createNewScreen() {
        selectedScreen = nil
        showingNewScreen = true
    }
    
    func dismissEditor() {
        selectedScreen = nil
        isEditing = false
        showingNewScreen = false
    }
    
    // MARK: - Reordering
    func moveScreen(from source: IndexSet, to destination: Int) {
        screens.move(fromOffsets: source, toOffset: destination)
        // Update sort orders
        for (index, _) in screens.enumerated() {
            screens[index] = Screen(
                id: screens[index].id,
                type: screens[index].type,
                title: screens[index].title,
                subtitle: screens[index].subtitle,
                body: screens[index].body,
                imagePath: screens[index].imagePath,
                qrUrl: screens[index].qrUrl,
                startDate: screens[index].startDate,
                endDate: screens[index].endDate,
                daysOfWeek: screens[index].daysOfWeek,
                startTime: screens[index].startTime,
                endTime: screens[index].endTime,
                priority: screens[index].priority,
                durationSeconds: screens[index].durationSeconds,
                isActive: screens[index].isActive,
                sortOrder: index,
                createdAt: screens[index].createdAt,
                updatedAt: screens[index].updatedAt
            )
        }
        // TODO: Save order to backend
    }
}
