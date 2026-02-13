import Foundation

// MARK: - Screen Types
enum ScreenType: String, Codable, CaseIterable {
    case snapAndPurr = "SNAP_AND_PURR"
    case event = "EVENT"
    case todayAtCatfe = "TODAY_AT_CATFE"
    case membership = "MEMBERSHIP"
    case reminder = "REMINDER"
    case adoption = "ADOPTION"
    case adoptionShowcase = "ADOPTION_SHOWCASE"
    case adoptionCounter = "ADOPTION_COUNTER"
    case thankYou = "THANK_YOU"
    case livestream = "LIVESTREAM"
    case happyTails = "HAPPY_TAILS"
    case snapPurrGallery = "SNAP_PURR_GALLERY"
    case happyTailsQr = "HAPPY_TAILS_QR"
    case snapPurrQr = "SNAP_PURR_QR"
    case poll = "POLL"
    case pollQr = "POLL_QR"
    case checkIn = "CHECK_IN"
    case guestStatusBoard = "GUEST_STATUS_BOARD"
    case custom = "CUSTOM"
    
    var displayName: String {
        switch self {
        case .snapAndPurr: return "Snap & Purr"
        case .event: return "Event"
        case .todayAtCatfe: return "Today at Catfé"
        case .membership: return "Membership"
        case .reminder: return "Reminder"
        case .adoption: return "Adoption"
        case .adoptionShowcase: return "Adoption Showcase"
        case .adoptionCounter: return "Adoption Counter"
        case .thankYou: return "Thank You"
        case .livestream: return "Livestream"
        case .happyTails: return "Happy Tails"
        case .snapPurrGallery: return "Snap & Purr Gallery"
        case .happyTailsQr: return "Happy Tails QR"
        case .snapPurrQr: return "Snap & Purr QR"
        case .poll: return "Poll"
        case .pollQr: return "Poll QR"
        case .checkIn: return "Check In"
        case .guestStatusBoard: return "Guest Status Board"
        case .custom: return "Custom"
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
        case .adoptionShowcase: return "#ffedd5"
        case .adoptionCounter: return "#d1fae5"
        case .thankYou: return "#e0e7ff"
        case .livestream: return "#fef3c7"
        case .happyTails: return "#fce7f3"
        case .snapPurrGallery: return "#fef3c7"
        case .happyTailsQr: return "#fce7f3"
        case .snapPurrQr: return "#fef3c7"
        case .poll: return "#dbeafe"
        case .pollQr: return "#dbeafe"
        case .checkIn: return "#d1fae5"
        case .guestStatusBoard: return "#e0e7ff"
        case .custom: return "#f3f4f6"
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
    let isAdopted: Bool?
    let sortOrder: Int
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, type, title, subtitle, body, imagePath, qrUrl
        case startDate, endDate, daysOfWeek, startTime, endTime
        case priority, durationSeconds, isActive, isAdopted, sortOrder
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

// MARK: - Cat Model (from cats database table)
struct CatModel: Codable, Identifiable {
    let id: Int
    let name: String
    let photoUrl: String?
    let breed: String?
    let colorPattern: String?
    let dob: String? // ISO date string
    let sex: String
    let weight: String?
    let personalityTags: [String]?
    let bio: String?
    let adoptionFee: String?
    let isAltered: Bool
    let felvFivStatus: String
    let status: String // "available", "adopted", "medical_hold"
    let isFeatured: Bool
    let sortOrder: Int
    let adoptedDate: String?
    let createdAt: String
    let updatedAt: String
    
    /// Computed age string from dob
    var ageString: String? {
        guard let dobStr = dob else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let dobDate = formatter.date(from: dobStr) else {
            // Try without fractional seconds
            formatter.formatOptions = [.withInternetDateTime]
            guard let d = formatter.date(from: dobStr) else { return nil }
            return Self.calculateAge(from: d)
        }
        return Self.calculateAge(from: dobDate)
    }
    
    private static func calculateAge(from date: Date) -> String {
        let months = Calendar.current.dateComponents([.month], from: date, to: Date()).month ?? 0
        if months < 1 { return "< 1 month" }
        if months < 12 { return "\(months) month\(months == 1 ? "" : "s")" }
        let years = months / 12
        let remainingMonths = months % 12
        if remainingMonths == 0 { return "\(years) year\(years == 1 ? "" : "s")" }
        return "\(years) yr\(years == 1 ? "" : "s") \(remainingMonths) mo"
    }
}

struct CatCountsResponse: Codable {
    let available: Int
    let adopted: Int
    let total: Int
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
