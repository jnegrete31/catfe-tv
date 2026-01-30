import Foundation

// MARK: - API Configuration
enum APIConfig {
    static let baseURL = "https://catfetv-amdmxcoq.manus.space"
    static let screensEndpoint = "/api/trpc/screens.getActive"
    static let settingsEndpoint = "/api/trpc/settings.get"
}

// MARK: - Models
struct Screen: Codable, Identifiable, Hashable {
    let id: Int
    let type: String
    let title: String
    let subtitle: String?
    let body: String?
    let imagePath: String?
    let imageDisplayMode: String?
    let qrUrl: String?
    let startAt: String?
    let endAt: String?
    let daysOfWeek: [Int]?
    let timeStart: String?
    let timeEnd: String?
    let priority: Int
    let durationSeconds: Int
    let sortOrder: Int
    let isActive: Bool
    let isProtected: Bool
    let createdAt: String
    let updatedAt: String
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Screen, rhs: Screen) -> Bool {
        lhs.id == rhs.id
    }
}

struct Settings: Codable {
    let id: Int?
    let locationName: String?
    let defaultDurationSeconds: Int?
    let fallbackMode: String?
    let brandColors: BrandColors?
    let snapAndPurrFrequency: Int?
    let githubRepo: String?
    let githubBranch: String?
    let refreshIntervalSeconds: Int?
}

struct BrandColors: Codable {
    let primary: String?
    let secondary: String?
    let background: String?
    let text: String?
}

// MARK: - tRPC Response Wrappers
struct TRPCResponse<T: Codable>: Codable {
    let result: TRPCResult<T>
}

struct TRPCResult<T: Codable>: Codable {
    let data: T
}

// MARK: - API Client
@MainActor
class APIClient: ObservableObject {
    @Published var screens: [Screen] = []
    @Published var settings: Settings?
    @Published var isLoading = false
    @Published var error: String?
    @Published var isOffline = false
    
    private let cache = ScreenCache()
    
    init() {
        // Load cached data on init
        if let cachedScreens = cache.loadScreens() {
            self.screens = cachedScreens
        }
        if let cachedSettings = cache.loadSettings() {
            self.settings = cachedSettings
        }
    }
    
    func fetchScreens() async {
        isLoading = true
        error = nil
        
        guard let url = URL(string: "\(APIConfig.baseURL)\(APIConfig.screensEndpoint)") else {
            error = "Invalid URL"
            isLoading = false
            return
        }
        
        do {
            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }
            
            let decoded = try JSONDecoder().decode(TRPCResponse<[Screen]>.self, from: data)
            self.screens = decoded.result.data
            self.isOffline = false
            
            // Cache the screens
            cache.saveScreens(decoded.result.data)
            
        } catch {
            self.error = error.localizedDescription
            self.isOffline = true
            
            // Use cached data if available
            if let cachedScreens = cache.loadScreens(), !cachedScreens.isEmpty {
                self.screens = cachedScreens
            }
        }
        
        isLoading = false
    }
    
    func fetchSettings() async {
        guard let url = URL(string: "\(APIConfig.baseURL)\(APIConfig.settingsEndpoint)") else {
            return
        }
        
        do {
            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }
            
            let decoded = try JSONDecoder().decode(TRPCResponse<Settings?>.self, from: data)
            self.settings = decoded.result.data
            
            // Cache the settings
            if let settings = decoded.result.data {
                cache.saveSettings(settings)
            }
            
        } catch {
            // Use cached settings if available
            if let cachedSettings = cache.loadSettings() {
                self.settings = cachedSettings
            }
        }
    }
    
    func refresh() async {
        await fetchScreens()
        await fetchSettings()
    }
}

// MARK: - Cache Manager
class ScreenCache {
    private let screensKey = "cached_screens"
    private let settingsKey = "cached_settings"
    private let defaults = UserDefaults.standard
    
    func saveScreens(_ screens: [Screen]) {
        if let encoded = try? JSONEncoder().encode(screens) {
            defaults.set(encoded, forKey: screensKey)
        }
    }
    
    func loadScreens() -> [Screen]? {
        guard let data = defaults.data(forKey: screensKey),
              let screens = try? JSONDecoder().decode([Screen].self, from: data) else {
            return nil
        }
        return screens
    }
    
    func saveSettings(_ settings: Settings) {
        if let encoded = try? JSONEncoder().encode(settings) {
            defaults.set(encoded, forKey: settingsKey)
        }
    }
    
    func loadSettings() -> Settings? {
        guard let data = defaults.data(forKey: settingsKey),
              let settings = try? JSONDecoder().decode(Settings.self, from: data) else {
            return nil
        }
        return settings
    }
}
