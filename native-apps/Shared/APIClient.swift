import Foundation

// MARK: - API Client
class APIClient {
    static let shared = APIClient()
    
    // Configure this with your deployed backend URL
    var baseURL: String = "https://your-catfe-tv-app.manus.space"
    
    private let session: URLSession
    private let decoder: JSONDecoder
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
        
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)
            
            // Try ISO8601 with fractional seconds
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = formatter.date(from: dateString) {
                return date
            }
            
            // Try ISO8601 without fractional seconds
            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: dateString) {
                return date
            }
            
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode date: \(dateString)")
        }
    }
    
    // MARK: - tRPC Query Helper
    private func trpcQuery<T: Codable>(procedure: String, input: [String: Any]? = nil) async throws -> T {
        var urlString = "\(baseURL)/api/trpc/\(procedure)"
        
        if let input = input {
            let inputData = try JSONSerialization.data(withJSONObject: ["json": input])
            let inputString = String(data: inputData, encoding: .utf8)!
            let encoded = inputString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!
            urlString += "?input=\(encoded)"
        }
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        // tRPC wraps response in { result: { data: ... } }
        let wrapper = try decoder.decode(APIResponse<T>.self, from: data)
        return wrapper.result.data
    }
    
    // MARK: - Public API Methods
    
    /// Fetch all active screens for TV display
    func getActiveScreens() async throws -> [Screen] {
        let response: ScreensResponse = try await trpcQuery(procedure: "screens.getActive")
        return response.screens
    }
    
    /// Fetch settings
    func getSettings() async throws -> Settings {
        let response: SettingsResponse = try await trpcQuery(procedure: "settings.get")
        return response.settings
    }
    
    /// Fetch current weather for Santa Clarita, CA
    func getWeather() async throws -> WeatherResponse {
        let urlString = "https://api.open-meteo.com/v1/forecast?latitude=34.3917&longitude=-118.5426&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America/Los_Angeles"
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await session.data(from: url)
        return try decoder.decode(WeatherResponse.self, from: data)
    }
}

// MARK: - API Errors
enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let statusCode):
            return "HTTP error: \(statusCode)"
        case .decodingError(let error):
            return "Decoding error: \(error.localizedDescription)"
        }
    }
}

// MARK: - Image Cache
class ImageCache {
    static let shared = ImageCache()
    
    private let cache = NSCache<NSString, NSData>()
    private let fileManager = FileManager.default
    private let cacheDirectory: URL
    
    private init() {
        let paths = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)
        cacheDirectory = paths[0].appendingPathComponent("ImageCache")
        
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        
        cache.countLimit = 50
        cache.totalCostLimit = 100 * 1024 * 1024 // 100MB
    }
    
    func getImage(from urlString: String) async throws -> Data {
        let key = urlString as NSString
        
        // Check memory cache
        if let cached = cache.object(forKey: key) {
            return cached as Data
        }
        
        // Check disk cache
        let filename = urlString.data(using: .utf8)!.base64EncodedString()
        let fileURL = cacheDirectory.appendingPathComponent(filename)
        
        if let diskData = try? Data(contentsOf: fileURL) {
            cache.setObject(diskData as NSData, forKey: key)
            return diskData
        }
        
        // Fetch from network
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        
        // Save to caches
        cache.setObject(data as NSData, forKey: key)
        try? data.write(to: fileURL)
        
        return data
    }
    
    func preloadImages(urls: [String]) async {
        await withTaskGroup(of: Void.self) { group in
            for url in urls {
                group.addTask {
                    _ = try? await self.getImage(from: url)
                }
            }
        }
    }
}
