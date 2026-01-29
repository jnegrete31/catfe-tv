import SwiftUI
import Combine

@MainActor
class TVDisplayViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var screens: [Screen] = []
    @Published var settings: Settings?
    @Published var currentIndex: Int = 0
    @Published var isLoading: Bool = true
    @Published var error: String?
    @Published var isPaused: Bool = false
    @Published var isOffline: Bool = false
    
    // Weather
    @Published var temperature: Int?
    @Published var weatherCode: Int?
    
    // MARK: - Private Properties
    private var autoAdvanceTask: Task<Void, Never>?
    private var refreshTask: Task<Void, Never>?
    private var weatherTask: Task<Void, Never>?
    
    // MARK: - Computed Properties
    var currentScreen: Screen? {
        guard !screens.isEmpty, currentIndex < screens.count else { return nil }
        return screens[currentIndex]
    }
    
    var totalScreens: Int {
        screens.count
    }
    
    // MARK: - Initialization
    init() {
        Task {
            await loadContent()
            await loadWeather()
            startAutoAdvance()
            startPeriodicRefresh()
            startWeatherRefresh()
        }
    }
    
    // MARK: - Content Loading
    func loadContent() async {
        isLoading = true
        error = nil
        
        do {
            async let screensResult = APIClient.shared.getActiveScreens()
            async let settingsResult = APIClient.shared.getSettings()
            
            let (fetchedScreens, fetchedSettings) = try await (screensResult, settingsResult)
            
            self.screens = fetchedScreens.sorted { $0.sortOrder < $1.sortOrder }
            self.settings = fetchedSettings
            self.isOffline = false
            
            // Preload images
            let imageURLs = screens.compactMap { $0.imagePath }
            await ImageCache.shared.preloadImages(urls: imageURLs)
            
        } catch {
            self.error = error.localizedDescription
            self.isOffline = true
        }
        
        isLoading = false
    }
    
    func loadWeather() async {
        do {
            let weather = try await APIClient.shared.getWeather()
            self.temperature = Int(weather.current.temperature2m)
            self.weatherCode = weather.current.weatherCode
        } catch {
            print("Weather load failed: \(error)")
        }
    }
    
    // MARK: - Navigation
    func nextScreen() {
        guard !screens.isEmpty else { return }
        withAnimation(.easeInOut(duration: 0.5)) {
            currentIndex = (currentIndex + 1) % screens.count
        }
        restartAutoAdvance()
    }
    
    func previousScreen() {
        guard !screens.isEmpty else { return }
        withAnimation(.easeInOut(duration: 0.5)) {
            currentIndex = (currentIndex - 1 + screens.count) % screens.count
        }
        restartAutoAdvance()
    }
    
    func togglePause() {
        isPaused.toggle()
        if isPaused {
            autoAdvanceTask?.cancel()
        } else {
            startAutoAdvance()
        }
    }
    
    func refresh() {
        Task {
            await loadContent()
        }
    }
    
    // MARK: - Auto Advance
    private func startAutoAdvance() {
        guard !isPaused else { return }
        
        autoAdvanceTask?.cancel()
        autoAdvanceTask = Task {
            while !Task.isCancelled {
                let duration = currentScreen?.durationSeconds ?? settings?.defaultDurationSeconds ?? 10
                try? await Task.sleep(nanoseconds: UInt64(duration) * 1_000_000_000)
                
                if !Task.isCancelled && !isPaused {
                    nextScreen()
                }
            }
        }
    }
    
    private func restartAutoAdvance() {
        if !isPaused {
            startAutoAdvance()
        }
    }
    
    // MARK: - Periodic Refresh
    private func startPeriodicRefresh() {
        refreshTask?.cancel()
        refreshTask = Task {
            while !Task.isCancelled {
                let interval = settings?.refreshIntervalSeconds ?? 60
                try? await Task.sleep(nanoseconds: UInt64(interval) * 1_000_000_000)
                
                if !Task.isCancelled {
                    await loadContent()
                }
            }
        }
    }
    
    private func startWeatherRefresh() {
        weatherTask?.cancel()
        weatherTask = Task {
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 10 * 60 * 1_000_000_000) // 10 minutes
                
                if !Task.isCancelled {
                    await loadWeather()
                }
            }
        }
    }
    
    deinit {
        autoAdvanceTask?.cancel()
        refreshTask?.cancel()
        weatherTask?.cancel()
    }
}
