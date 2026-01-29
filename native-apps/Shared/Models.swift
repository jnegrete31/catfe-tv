import Foundation

// MARK: - Screen Types
enum ScreenType: String, Codable, CaseIterable {
    case snapAndPurr = "SNAP_AND_PURR"
    case event = "EVENT"
    case todayAtCatfe = "TODAY_AT_CATFE"
    case membership = "MEMBERSHIP"
    case reminder = "REMINDER"
    case adoption = "ADOPTION"
    case thankYou = "THANK_YOU"
    
    var displayName: String {
        switch self {
        case .snapAndPurr: return "Snap & Purr"
        case .event: return "Event"
        case .todayAtCatfe: return "Today at Catfé"
        case .membership: return "Membership"
        case .reminder: return "Reminder"
        case .adoption: return "Adoption"
        case .thankYou: return "Thank You"
        }
    }
    
    var backgroundColor: String {
        switch self {
        case .snapAndPurr: return "#fef3c7"
        case .event: return "#fce7f3"
        case .todayAtCatfe: return "#dbeafe"
        case .membership: return "#d1fae5"
        case .reminder: return "#fee2e2"
        case .adoption: return "#ede9fe"
        case .thankYou: return "#e0e7ff"
        }
    }
}

// MARK: - Screen Model
struct Screen: Codable, Identifiable {
    let id: Int
    let type: ScreenType
    let title: String
    let subtitle: String?
    let body: String?
    let imagePath: String?
    let qrUrl: String?
    let startDate: Date?
    let endDate: Date?
    let daysOfWeek: [Int]?
    let startTime: String?
    let endTime: String?
    let priority: Int
    let durationSeconds: Int
    let isActive: Bool
    let sortOrder: Int
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, type, title, subtitle, body, imagePath, qrUrl
        case startDate, endDate, daysOfWeek, startTime, endTime
        case priority, durationSeconds, isActive, sortOrder
        case createdAt, updatedAt
    }
}

// MARK: - Settings Model
struct Settings: Codable {
    let id: Int
    let locationName: String
    let defaultDurationSeconds: Int
    let fallbackMode: String
    let brandColors: BrandColors?
    let snapAndPurrFrequency: Int
    let githubRepo: String?
    let githubBranch: String?
    let refreshIntervalSeconds: Int
    let updatedAt: Date
}

struct BrandColors: Codable {
    let primary: String
    let secondary: String
    let background: String
    let text: String
}

// MARK: - API Response Wrappers
struct APIResponse<T: Codable>: Codable {
    let result: ResultWrapper<T>
}

struct ResultWrapper<T: Codable>: Codable {
    let data: T
}

// MARK: - tRPC Response Types
struct ScreensResponse: Codable {
    let screens: [Screen]
}

struct SettingsResponse: Codable {
    let settings: Settings
}

// MARK: - Weather Model (Open-Meteo)
struct WeatherResponse: Codable {
    let current: CurrentWeather
}

struct CurrentWeather: Codable {
    let temperature2m: Double
    let weatherCode: Int
    
    enum CodingKeys: String, CodingKey {
        case temperature2m = "temperature_2m"
        case weatherCode = "weather_code"
    }
}

// MARK: - Weather Code Helper
extension Int {
    var weatherDescription: String {
        switch self {
        case 0: return "Clear"
        case 1...2: return "Partly Cloudy"
        case 3: return "Cloudy"
        case 45...48: return "Foggy"
        case 51...57: return "Drizzle"
        case 61...67: return "Rain"
        case 71...77: return "Snow"
        case 80...82: return "Showers"
        case 85...86: return "Snow Showers"
        case 95...99: return "Thunderstorm"
        default: return "Unknown"
        }
    }
    
    var weatherIcon: String {
        switch self {
        case 0: return "sun.max.fill"
        case 1...2: return "cloud.sun.fill"
        case 3: return "cloud.fill"
        case 45...48: return "cloud.fog.fill"
        case 51...67: return "cloud.rain.fill"
        case 71...86: return "cloud.snow.fill"
        case 95...99: return "cloud.bolt.fill"
        default: return "cloud.fill"
        }
    }
}
