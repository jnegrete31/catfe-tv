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
        // Note: Screen is a struct with let properties, so we can't mutate sortOrder in-place.
        // The sort order update would need to be sent to the backend API.
        // TODO: Implement API call to update sort orders
    }
}
