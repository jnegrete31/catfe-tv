import Foundation

// MARK: - API Configuration
enum APIConfig {
    static let baseURL = "https://catfetv-amdmxcoq.manus.space"
    static let screensEndpoint = "/api/trpc/screens.getActive"
    static let settingsEndpoint = "/api/trpc/settings.get"
    static let randomAdoptionsEndpoint = "/api/trpc/screens.getRandomAdoptions"
    static let recentlyAdoptedEndpoint = "/api/trpc/screens.getRecentlyAdopted"
    static let adoptionCountEndpoint = "/api/trpc/screens.getAdoptionCount"
}

// Adoption count response model
struct AdoptionCountResponse: Codable {
    let count: Int
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
    let isAdopted: Bool?
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
    let totalAdoptionCount: Int?
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
// tRPC with superjson returns: { result: { data: { json: [...] } } }
struct TRPCResponse<T: Codable>: Codable {
    let result: TRPCResult<T>
}

struct TRPCResult<T: Codable>: Codable {
    let data: TRPCData<T>
}

struct TRPCData<T: Codable>: Codable {
    let json: T
}

// MARK: - API Client
@MainActor
class APIClient: ObservableObject {
    @Published var screens: [Screen] = []
    @Published var settings: Settings?
    @Published var adoptionCats: [Screen] = []
    @Published var recentlyAdopted: [Screen] = []
    @Published var adoptionCount: Int = 0
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
            request.timeoutInterval = 15
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw URLError(.badServerResponse)
            }
            
            // Log for debugging
            print("[APIClient] Response status: \(httpResponse.statusCode)")
            
            guard httpResponse.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }
            
            // Debug: print raw response
            if let jsonString = String(data: data, encoding: .utf8) {
                print("[APIClient] Raw response (first 500 chars): \(String(jsonString.prefix(500)))")
            }
            
            let decoded = try JSONDecoder().decode(TRPCResponse<[Screen]>.self, from: data)
            self.screens = decoded.result.data.json
            self.isOffline = false
            
            print("[APIClient] Successfully fetched \(self.screens.count) screens")
            
            // Cache the screens
            cache.saveScreens(decoded.result.data.json)
            
        } catch {
            print("[APIClient] Error fetching screens: \(error)")
            self.error = error.localizedDescription
            self.isOffline = true
            
            // Use cached data if available
            if let cachedScreens = cache.loadScreens(), !cachedScreens.isEmpty {
                self.screens = cachedScreens
                print("[APIClient] Using \(cachedScreens.count) cached screens")
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
            request.timeoutInterval = 15
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }
            
            let decoded = try JSONDecoder().decode(TRPCResponse<Settings?>.self, from: data)
            self.settings = decoded.result.data.json
            
            print("[APIClient] Successfully fetched settings")
            
            // Cache the settings
            if let settings = decoded.result.data.json {
                cache.saveSettings(settings)
            }
            
        } catch {
            print("[APIClient] Error fetching settings: \(error)")
            // Use cached settings if available
            if let cachedSettings = cache.loadSettings() {
                self.settings = cachedSettings
            }
        }
    }
    
    func refresh() async {
        await fetchScreens()
        await fetchSettings()
        await fetchRecentlyAdopted()
    }
    
func fetchRecentlyAdopted(limit: Int = 5) async {
        // tRPC with superjson requires the input wrapped in a "json" key
        let inputJson = "{\"json\":{\"limit\":\(limit)}}"
        guard let encodedInput = inputJson.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(APIConfig.baseURL)\(APIConfig.recentlyAdoptedEndpoint)?input=\(encodedInput)") else {
            return
        }
        
        do {
            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.timeoutInterval = 15
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }
            
            let decoded = try JSONDecoder().decode(TRPCResponse<[Screen]>.self, from: data)
            self.recentlyAdopted = decoded.result.data.json
            
            print("[APIClient] Successfully fetched \(self.recentlyAdopted.count) recently adopted cats")
            
        } catch {
            print("[APIClient] Error fetching recently adopted: \(error)")
        }
    }
    
func fetchRandomAdoptions(count: Int = 4) async {
        // tRPC with superjson requires the input wrapped in a "json" key
        let inputJson = "{\"json\":{\"count\":\(count)}}"
        guard let encodedInput = inputJson.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(APIConfig.baseURL)\(APIConfig.randomAdoptionsEndpoint)?input=\(encodedInput)") else {
            return
        }
        
        do {
            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.timeoutInterval = 15
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }
            
            let decoded = try JSONDecoder().decode(TRPCResponse<[Screen]>.self, from: data)
            self.adoptionCats = decoded.result.data.json
            
            print("[APIClient] Successfully fetched \(self.adoptionCats.count) random adoption cats")
            
        } catch {
            print("[APIClient] Error fetching random adoptions: \(error)")
        }
    }
    
    func fetchAdoptionCount() async {
        guard let url = URL(string: "\(APIConfig.baseURL)\(APIConfig.adoptionCountEndpoint)") else {
            return
        }
        
        do {
            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.timeoutInterval = 10
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }
            
            let decoded = try JSONDecoder().decode(TRPCResponse<AdoptionCountResponse>.self, from: data)
            self.adoptionCount = decoded.result.data.json.count
            
            print("[APIClient] Adoption count: \(self.adoptionCount)")
            
        } catch {
            print("[APIClient] Error fetching adoption count: \(error)")
        }
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
