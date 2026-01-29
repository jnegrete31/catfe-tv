//
//  APIClient.swift
//  CatfeTV
//
//  API client for Supabase backend
//

import Foundation

// MARK: - API Client

@MainActor
class APIClient: ObservableObject {
    static let shared = APIClient()
    
    // Supabase configuration - Update these with your actual Supabase project details
    private let supabaseURL = "https://your-project.supabase.co"
    private let supabaseKey = "your-anon-key"
    
    // GitHub raw content base URL for images
    private let githubRawURL = "https://raw.githubusercontent.com/jnegrete31/catfe-tv/main"
    
    @Published var screens: [Screen] = []
    @Published var settings: AppSettings = .default
    @Published var isLoading = false
    @Published var error: String?
    @Published var lastRefresh: Date?
    
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder
    
    private init() {
        encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
    }
    
    // MARK: - Screens CRUD
    
    func fetchScreens() async {
        isLoading = true
        error = nil
        
        do {
            // Try to fetch from Supabase
            let url = URL(string: "\(supabaseURL)/rest/v1/screens?select=*&order=sort_order.asc")!
            var request = URLRequest(url: url)
            request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                screens = try decoder.decode([Screen].self, from: data)
            } else {
                // Fall back to local cache or sample data
                loadFromCache()
            }
        } catch {
            // Fall back to local cache or sample data
            loadFromCache()
            self.error = error.localizedDescription
        }
        
        lastRefresh = Date()
        isLoading = false
    }
    
    func createScreen(_ screen: Screen) async throws {
        let url = URL(string: "\(supabaseURL)/rest/v1/screens")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        request.httpBody = try encoder.encode(screen)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw APIError(message: "Failed to create screen")
        }
        
        if let newScreens = try? decoder.decode([Screen].self, from: data),
           let newScreen = newScreens.first {
            screens.append(newScreen)
            saveToCache()
        }
    }
    
    func updateScreen(_ screen: Screen) async throws {
        let url = URL(string: "\(supabaseURL)/rest/v1/screens?id=eq.\(screen.id.uuidString)")!
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        var updatedScreen = screen
        updatedScreen.updatedAt = Date()
        request.httpBody = try encoder.encode(updatedScreen)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError(message: "Failed to update screen")
        }
        
        if let index = screens.firstIndex(where: { $0.id == screen.id }) {
            screens[index] = updatedScreen
            saveToCache()
        }
    }
    
    func deleteScreen(_ screen: Screen) async throws {
        let url = URL(string: "\(supabaseURL)/rest/v1/screens?id=eq.\(screen.id.uuidString)")!
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 204 else {
            throw APIError(message: "Failed to delete screen")
        }
        
        screens.removeAll { $0.id == screen.id }
        saveToCache()
    }
    
    func reorderScreens(_ screens: [Screen]) async throws {
        for (index, var screen) in screens.enumerated() {
            screen.sortOrder = index
            try await updateScreen(screen)
        }
        self.screens = screens
        saveToCache()
    }
    
    // MARK: - Settings
    
    func fetchSettings() async {
        do {
            let url = URL(string: "\(supabaseURL)/rest/v1/settings?select=*&limit=1")!
            var request = URLRequest(url: url)
            request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                if let settingsArray = try? decoder.decode([AppSettings].self, from: data),
                   let fetchedSettings = settingsArray.first {
                    settings = fetchedSettings
                }
            }
        } catch {
            // Use default settings
            loadSettingsFromCache()
        }
    }
    
    func updateSettings(_ newSettings: AppSettings) async throws {
        let url = URL(string: "\(supabaseURL)/rest/v1/settings?id=eq.1")!
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        request.httpBody = try encoder.encode(newSettings)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError(message: "Failed to update settings")
        }
        
        settings = newSettings
        saveSettingsToCache()
    }
    
    // MARK: - Active Screens
    
    func getActiveScreens() -> [Screen] {
        screens.filter { screen in
            guard screen.isActive else { return false }
            if let schedule = screen.schedule {
                return schedule.isActiveNow()
            }
            return true
        }.sorted { $0.sortOrder < $1.sortOrder }
    }
    
    // MARK: - Local Cache
    
    private var cacheURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("screens_cache.json")
    }
    
    private var settingsCacheURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("settings_cache.json")
    }
    
    func saveToCache() {
        do {
            let data = try encoder.encode(screens)
            try data.write(to: cacheURL)
        } catch {
            print("Failed to save cache: \(error)")
        }
    }
    
    func loadFromCache() {
        do {
            let data = try Data(contentsOf: cacheURL)
            screens = try decoder.decode([Screen].self, from: data)
        } catch {
            // Use sample data if no cache exists
            screens = Screen.sampleScreens
            saveToCache()
        }
    }
    
    func saveSettingsToCache() {
        do {
            let data = try encoder.encode(settings)
            try data.write(to: settingsCacheURL)
        } catch {
            print("Failed to save settings cache: \(error)")
        }
    }
    
    func loadSettingsFromCache() {
        do {
            let data = try Data(contentsOf: settingsCacheURL)
            settings = try decoder.decode(AppSettings.self, from: data)
        } catch {
            settings = .default
            saveSettingsToCache()
        }
    }
    
    // MARK: - GitHub Image Upload
    
    func uploadImageToGitHub(imageData: Data, filename: String) async throws -> String {
        // This would require GitHub API authentication
        // For now, return a placeholder URL
        // In production, implement proper GitHub API integration
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy/MM"
        let datePath = dateFormatter.string(from: Date())
        
        let timestamp = Int(Date().timeIntervalSince1970 * 1000)
        let fullFilename = "\(timestamp)-\(filename)"
        
        // Return the expected URL after upload
        return "\(githubRawURL)/assets/catfe-tv/\(datePath)/\(fullFilename)"
    }
    
    // MARK: - Image URL Helper
    
    func getImageURL(for path: String) -> URL? {
        if path.hasPrefix("http") {
            return URL(string: path)
        }
        return URL(string: "\(githubRawURL)/\(path)")
    }
}

// MARK: - Offline Support

extension APIClient {
    func isOffline() -> Bool {
        // Simple offline check - in production, use NWPathMonitor
        return false
    }
    
    func syncWhenOnline() {
        // Queue operations for when connectivity returns
    }
}
