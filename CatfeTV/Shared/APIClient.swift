//
//  APIClient.swift
//  CatfeTV
//
//  API client for Manus tRPC backend
//

import Foundation

// MARK: - API Client

@MainActor
class APIClient: ObservableObject {
    static let shared = APIClient()
    
    // Manus backend configuration
    private let baseURL = "https://catfetv-amdmxcoq.manus.space"
    
    @Published var screens: [Screen] = []
    @Published var settings: AppSettings = .default
    @Published var isLoading = false
    @Published var error: String?
    @Published var lastRefresh: Date?
    
    // Cached photos for gallery screens (pre-fetched at startup)
    @Published var cachedSnapPurrPhotos: [PhotoSubmission] = []
    @Published var cachedHappyTailsPhotos: [PhotoSubmission] = []
    private var photosLastFetched: Date?
    
    // Cached recently adopted cats for adoption counter screen
    @Published var cachedRecentlyAdoptedCats: [Screen] = []
    
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder
    
    private init() {
        encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            
            // Handle null values for optional Date fields (e.g., checkedOutAt)
            if container.decodeNil() {
                // Return epoch as placeholder — Swift will handle Optional<Date> wrapping
                return Date(timeIntervalSince1970: 0)
            }
            
            let dateString = try container.decode(String.self)
            
            // Try ISO8601 with fractional seconds
            let iso8601Formatter = ISO8601DateFormatter()
            iso8601Formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = iso8601Formatter.date(from: dateString) {
                return date
            }
            
            // Try ISO8601 without fractional seconds
            iso8601Formatter.formatOptions = [.withInternetDateTime]
            if let date = iso8601Formatter.date(from: dateString) {
                return date
            }
            
            // Try simple date format
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd"
            if let date = dateFormatter.date(from: dateString) {
                return date
            }
            
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode date: \(dateString)")
        }
    }
    
    // MARK: - Auth Token Helper
    
    private func getAuthToken() -> String? {
        #if os(iOS)
        return AuthService.shared.authToken
        #else
        return nil
        #endif
    }
    
    private func addAuthHeader(to request: inout URLRequest) {
        if let token = getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }
    
    // MARK: - tRPC Response Wrappers
    
    struct TRPCResponse<T: Decodable>: Decodable {
        let result: TRPCResult<T>
    }
    
    struct TRPCResult<T: Decodable>: Decodable {
        let data: TRPCData<T>
    }
    
    struct TRPCData<T: Decodable>: Decodable {
        let json: T
        
        // Explicitly ignore the 'meta' field from SuperJSON
        enum CodingKeys: String, CodingKey {
            case json
        }
    }
    
    struct TRPCMutationResponse<T: Decodable>: Decodable {
        let result: TRPCMutationResult<T>
    }
    
    struct TRPCMutationResult<T: Decodable>: Decodable {
        let data: TRPCMutationData<T>
    }
    
    struct TRPCMutationData<T: Decodable>: Decodable {
        let json: T
    }
    
    // MARK: - Screens CRUD
    
    func fetchScreens() async {
        isLoading = true
        error = nil
        
        do {
            // Use playlists.getActiveScreensWithTemplates (public, playlist-ordered + template overlay) for TV display
            // Use screens.getAll (protected) for admin
            #if os(tvOS)
            let endpoint = "playlists.getActiveScreensWithTemplates"
            #else
            let endpoint = getAuthToken() != nil ? "screens.getAll" : "screens.getActive"
            #endif
            
            let url = URL(string: "\(baseURL)/api/trpc/\(endpoint)")!
            var request = URLRequest(url: url)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            addAuthHeader(to: &request)
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                print("Fetch screens response (\(endpoint)): \(httpResponse.statusCode)")
            }
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                // Decode using APIScreen model that matches backend JSON exactly
                let trpcResponse = try JSONDecoder().decode(TRPCResponse<[APIScreen]>.self, from: data)
                let apiScreens = trpcResponse.result.data.json
                
                // Convert API screens to local Screen model
                screens = apiScreens.map { $0.toScreen() }
                
                print("Successfully loaded \(screens.count) screens from API")
                saveToCache()
            } else {
                print("API returned non-200, falling back to cache")
                // Fall back to local cache or sample data
                loadFromCache()
            }
        } catch {
            print("Fetch screens error: \(error)")
            // Fall back to local cache or sample data
            loadFromCache()
            self.error = error.localizedDescription
        }
        
        lastRefresh = Date()
        isLoading = false
    }
    
    func createScreen(_ screen: Screen) async throws {
        // Build the input for tRPC mutation
        let input = buildScreenInput(from: screen)
        
        let url = URL(string: "\(baseURL)/api/trpc/screens.create")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeader(to: &request)
        
        let body = ["json": input]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        if let httpResponse = response as? HTTPURLResponse {
            print("Create screen response: \(httpResponse.statusCode)")
            if let responseString = String(data: data, encoding: .utf8) {
                print("Response data: \(responseString.prefix(500))")
            }
        }
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError(message: "Failed to create screen: \(errorMessage)")
        }
        
        // Refresh screens list
        await fetchScreens()
    }
    
    func updateScreen(_ screen: Screen) async throws {
        // Build the input for tRPC mutation
        let input = buildScreenInput(from: screen)
        
        // Get the numeric ID from the screen
        guard let numericId = screen.numericId else {
            throw APIError(message: "Screen has no numeric ID")
        }
        
        let url = URL(string: "\(baseURL)/api/trpc/screens.update")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeader(to: &request)
        
        let body: [String: Any] = [
            "json": [
                "id": numericId,
                "data": input
            ]
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        if let httpResponse = response as? HTTPURLResponse {
            print("Update screen response: \(httpResponse.statusCode)")
            if let responseString = String(data: data, encoding: .utf8) {
                print("Response data: \(responseString.prefix(500))")
            }
        }
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError(message: "Failed to update screen: \(errorMessage)")
        }
        
        // Refresh screens list
        await fetchScreens()
    }
    
    func deleteScreen(_ screen: Screen) async throws {
        guard let numericId = screen.numericId else {
            throw APIError(message: "Screen has no numeric ID")
        }
        
        let url = URL(string: "\(baseURL)/api/trpc/screens.delete")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeader(to: &request)
        
        let body: [String: Any] = ["json": ["id": numericId]]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError(message: "Failed to delete screen: \(errorMessage)")
        }
        
        screens.removeAll { $0.id == screen.id }
        saveToCache()
    }
    
    func reorderScreens(_ screens: [Screen]) async throws {
        var orders: [[String: Any]] = []
        for (index, screen) in screens.enumerated() {
            if let numericId = screen.numericId {
                orders.append(["id": numericId, "sortOrder": index])
            }
        }
        
        let url = URL(string: "\(baseURL)/api/trpc/screens.updateOrder")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeader(to: &request)
        
        let body: [String: Any] = ["json": ["orders": orders]]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError(message: "Failed to reorder screens")
        }
        
        self.screens = screens
        saveToCache()
    }
    
    // MARK: - Helper to build screen input
    
    private func buildScreenInput(from screen: Screen) -> [String: Any] {
        var input: [String: Any] = [
            "type": screen.type.rawValue,
            "title": screen.title,
            "priority": screen.priority,
            "durationSeconds": screen.duration,
            "sortOrder": screen.sortOrder,
            "isActive": screen.isActive,
            "isAdopted": screen.isAdopted
        ]
        
        if let subtitle = screen.subtitle { input["subtitle"] = subtitle }
        if let body = screen.bodyText { input["body"] = body }
        if let imagePath = screen.imageURL { input["imagePath"] = imagePath }
        if let qrUrl = screen.qrCodeURL { input["qrUrl"] = qrUrl }
        
        // Event fields
        if let eventDate = screen.eventDate {
            input["startAt"] = eventDate
        }
        
        return input
    }
    
    // MARK: - Settings
    
    func fetchSettings() async {
        do {
            let url = URL(string: "\(baseURL)/api/trpc/settings.get")!
            var request = URLRequest(url: url)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            addAuthHeader(to: &request)
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                let trpcResponse = try decoder.decode(TRPCResponse<AppSettings>.self, from: data)
                settings = trpcResponse.result.data.json
                print("[Settings] Decoded OK - waiverUrl: \(settings.waiverUrl ?? "nil"), logoUrl: \(settings.logoUrl ?? "nil"), refresh: \(settings.refreshIntervalSeconds)s")
                saveSettingsToCache()
            } else {
                let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
                print("[Settings] HTTP \(statusCode) - falling back to cache")
                loadSettingsFromCache()
            }
        } catch {
            print("[Settings] Decode FAILED: \(error)")
            // Use cached or default settings
            loadSettingsFromCache()
        }
    }
    
    func updateSettings(_ newSettings: AppSettings) async throws {
        let url = URL(string: "\(baseURL)/api/trpc/settings.update")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        addAuthHeader(to: &request)
        
        var input: [String: Any] = [:]
        if let locationName = newSettings.locationName { input["locationName"] = locationName }
        input["defaultDurationSeconds"] = newSettings.defaultDurationSeconds
        if let logoUrl = newSettings.logoUrl { input["logoUrl"] = logoUrl }
        input["totalAdoptionCount"] = newSettings.totalAdoptionCount
        if let waiverUrl = newSettings.waiverUrl { input["waiverUrl"] = waiverUrl }
        if let wifiName = newSettings.wifiName { input["wifiName"] = wifiName }
        if let wifiPassword = newSettings.wifiPassword { input["wifiPassword"] = wifiPassword }
        if let houseRules = newSettings.houseRules { input["houseRules"] = houseRules }
        
        let body: [String: Any] = ["json": input]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError(message: "Failed to update settings")
        }
        
        settings = newSettings
        saveSettingsToCache()
    }
    
    // MARK: - Guest Sessions
    
    func fetchGuestSessions() async throws -> [GuestSession] {
        let url = URL(string: "\(baseURL)/api/trpc/guestSessions.getActive")!
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError(message: "Failed to fetch guest sessions")
        }
        
        let trpcResponse = try decoder.decode(TRPCResponse<[GuestSession]>.self, from: data)
        return trpcResponse.result.data.json
    }
    
    func fetchSessionsNeedingReminder() async throws -> [GuestSession] {
        let url = URL(string: "\(baseURL)/api/trpc/guestSessions.getNeedingReminder")!
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            print("[APIClient] fetchSessionsNeedingReminder failed with status: \(statusCode)")
            throw APIError(message: "Failed to fetch sessions needing reminder")
        }
        
        // Debug: print raw response
        if let rawString = String(data: data, encoding: .utf8) {
            print("[APIClient] getNeedingReminder raw response: \(rawString.prefix(500))")
        }
        
        do {
            let trpcResponse = try decoder.decode(TRPCResponse<[GuestSession]>.self, from: data)
            print("[APIClient] getNeedingReminder decoded \(trpcResponse.result.data.json.count) sessions")
            return trpcResponse.result.data.json
        } catch {
            print("[APIClient] getNeedingReminder DECODE ERROR: \(error)")
            throw error
        }
    }
    
    func fetchRecentlyCheckedIn() async throws -> [GuestSession] {
        let url = URL(string: "\(baseURL)/api/trpc/guestSessions.getRecentlyCheckedIn")!
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            print("[APIClient] fetchRecentlyCheckedIn failed with status: \(statusCode)")
            throw APIError(message: "Failed to fetch recently checked in")
        }
        
        // Debug: print raw response
        if let rawString = String(data: data, encoding: .utf8) {
            print("[APIClient] getRecentlyCheckedIn raw response: \(rawString.prefix(500))")
        }
        
        do {
            let trpcResponse = try decoder.decode(TRPCResponse<[GuestSession]>.self, from: data)
            print("[APIClient] getRecentlyCheckedIn decoded \(trpcResponse.result.data.json.count) sessions")
            return trpcResponse.result.data.json
        } catch {
            print("[APIClient] getRecentlyCheckedIn DECODE ERROR: \(error)")
            throw error
        }
    }
    
    // MARK: - Photos
    
    func fetchApprovedPhotos(type: String) async throws -> [PhotoSubmission] {
        // URL encode the input parameter for tRPC query
        let inputJSON = "{\"json\":{\"type\":\"\(type)\"}}"
        let encodedInput = inputJSON.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? inputJSON
        let url = URL(string: "\(baseURL)/api/trpc/photos.getApproved?input=\(encodedInput)")!
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            print("[Photos] HTTP \(statusCode) fetching \(type) photos")
            throw APIError(message: "Failed to fetch \(type) photos")
        }
        
        let trpcResponse = try JSONDecoder().decode(TRPCResponse<[PhotoSubmission]>.self, from: data)
        print("[Photos] Fetched \(trpcResponse.result.data.json.count) approved \(type) photos")
        return trpcResponse.result.data.json
    }
    
    /// Pre-fetch and cache photos for gallery screens.
    /// Called at startup and during periodic refresh so photos are instantly available.
    func refreshPhotos() async {
        do {
            let snapPurr = try await fetchApprovedPhotos(type: "snap_purr")
            cachedSnapPurrPhotos = snapPurr.shuffled()
            print("[Photos] Cached \(cachedSnapPurrPhotos.count) snap_purr photos")
        } catch {
            print("[Photos] Failed to refresh snap_purr: \(error)")
        }
        
        do {
            let happyTails = try await fetchApprovedPhotos(type: "happy_tails")
            cachedHappyTailsPhotos = happyTails.shuffled()
            print("[Photos] Cached \(cachedHappyTailsPhotos.count) happy_tails photos")
        } catch {
            print("[Photos] Failed to refresh happy_tails: \(error)")
        }
        
        photosLastFetched = Date()
    }
    
    // MARK: - Recently Adopted Cats (for Adoption Counter)
    
    /// Fetch recently adopted cats from the screens.getRecentlyAdopted endpoint.
    /// Returns Screen objects with isAdopted=true and valid image URLs.
    func fetchRecentlyAdoptedCats() async {
        do {
            let inputJSON = "{\"json\":{\"limit\":6}}"
            let encodedInput = inputJSON.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? inputJSON
            let url = URL(string: "\(baseURL)/api/trpc/screens.getRecentlyAdopted?input=\(encodedInput)")!
            var request = URLRequest(url: url)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
                print("[AdoptedCats] HTTP \(statusCode) fetching recently adopted cats")
                return
            }
            
            let trpcResponse = try JSONDecoder().decode(TRPCResponse<[APIScreen]>.self, from: data)
            let apiScreens = trpcResponse.result.data.json
            cachedRecentlyAdoptedCats = apiScreens.map { $0.toScreen() }
            print("[AdoptedCats] Cached \(cachedRecentlyAdoptedCats.count) recently adopted cats")
        } catch {
            print("[AdoptedCats] Failed to fetch recently adopted cats: \(error)")
        }
    }
    
    // MARK: - Active Screens
    
    func getActiveScreens() -> [Screen] {
        // Backend now handles playlist filtering and scheduling via playlists.getActiveScreensWithTemplates
        // Just return all screens as-is (already filtered and ordered by backend)
        screens.filter { $0.isActive }
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
            print("Loaded \(screens.count) screens from cache")
        } catch {
            // Use sample data if no cache exists
            print("No cache found, using sample data")
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
    
    // MARK: - Image Upload (via S3)
    
    func uploadImageToGitHub(imageData: Data, filename: String) async throws -> String {
        // Upload to the backend's image upload endpoint
        let url = URL(string: "\(baseURL)/api/upload/image")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        addAuthHeader(to: &request)
        
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError(message: "Failed to upload image")
        }
        
        // Parse the response to get the URL
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let imageUrl = json["url"] as? String {
            return imageUrl
        }
        
        throw APIError(message: "Failed to parse upload response")
    }
    
    // MARK: - Image URL Helper
    
    func getImageURL(for path: String) -> URL? {
        if path.hasPrefix("http") {
            return URL(string: path)
        }
        return URL(string: "\(baseURL)/\(path)")
    }
}
