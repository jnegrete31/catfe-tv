//
//  Models.swift
//  CatfeTV
//
//  Shared data models for tvOS and iOS apps
//

import Foundation
import SwiftUI

// MARK: - Screen Types

enum ScreenType: String, Codable, CaseIterable, Identifiable {
    // Backend values (uppercase with underscores)
    case snapPurr = "SNAP_AND_PURR"
    case events = "EVENT"
    case today = "TODAY_AT_CATFE"
    case membership = "MEMBERSHIP"
    case reminders = "REMINDER"
    case adoption = "ADOPTION"
    case adoptionShowcase = "ADOPTION_SHOWCASE"
    case adoptionCounter = "ADOPTION_COUNTER"
    case thankYou = "THANK_YOU"
    case livestream = "LIVESTREAM"
    case happyTails = "HAPPY_TAILS"
    case snapPurrGallery = "SNAP_PURR_GALLERY"
    case happyTailsQR = "HAPPY_TAILS_QR"
    case snapPurrQR = "SNAP_PURR_QR"
    case poll = "POLL"
    case pollQR = "POLL_QR"
    case checkIn = "CHECK_IN"
    case guestStatusBoard = "GUEST_STATUS_BOARD"
    case custom = "CUSTOM"
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .snapPurr: return "Snap & Purr"
        case .events: return "Events"
        case .today: return "Today at Catfé"
        case .membership: return "Membership"
        case .reminders: return "Reminders"
        case .adoption: return "Adoption"
        case .adoptionShowcase: return "Adoptable Cats"
        case .adoptionCounter: return "Adoption Counter"
        case .thankYou: return "Thank You"
        case .livestream: return "Livestream"
        case .happyTails: return "Happy Tails"
        case .snapPurrGallery: return "Snap & Purr Gallery"
        case .happyTailsQR: return "Happy Tails QR"
        case .snapPurrQR: return "Snap & Purr QR"
        case .poll: return "Poll"
        case .pollQR: return "Poll QR"
        case .checkIn: return "Check In"
        case .guestStatusBoard: return "Guest Status Board"
        case .custom: return "Custom"
        }
    }
    
    var icon: String {
        switch self {
        case .snapPurr, .snapPurrGallery, .snapPurrQR: return "camera.fill"
        case .events: return "calendar"
        case .today: return "sun.max.fill"
        case .membership: return "person.crop.circle.badge.checkmark"
        case .reminders: return "bell.fill"
        case .adoption: return "heart.fill"
        case .adoptionShowcase: return "square.grid.2x2.fill"
        case .adoptionCounter: return "number.circle.fill"
        case .thankYou: return "hands.clap.fill"
        case .livestream: return "video.fill"
        case .happyTails, .happyTailsQR: return "pawprint.fill"
        case .poll, .pollQR: return "chart.bar.fill"
        case .checkIn: return "person.badge.plus"
        case .guestStatusBoard: return "person.3.fill"
        case .custom: return "star.fill"
        }
    }
}

// MARK: - Screen Model

struct Screen: Identifiable, Codable, Equatable {
    var id: UUID
    var numericId: Int? // Database ID for tRPC API calls
    var type: ScreenType
    var title: String
    var subtitle: String?
    var bodyText: String?
    var imageURL: String?
    var imageDisplayMode: String?
    var qrCodeURL: String?
    var duration: Int // seconds
    var priority: Int
    var isActive: Bool
    var isAdopted: Bool // For adoption screens
    var isProtected: Bool
    var sortOrder: Int
    var schedule: ScreenSchedule?
    var livestreamUrl: String?
    var templateOverlay: TemplateOverlay? // Template overlay data from Slide Editor
    var createdAt: Date
    var updatedAt: Date
    
    // Adoption-specific fields
    var catName: String?
    var catAge: String?
    var catGender: String?
    var catBreed: String?
    var catDescription: String?
    
    // Event-specific fields
    var eventDate: String?
    var eventTime: String?
    var eventLocation: String?
    
    init(
        id: UUID = UUID(),
        numericId: Int? = nil,
        type: ScreenType,
        title: String,
        subtitle: String? = nil,
        bodyText: String? = nil,
        imageURL: String? = nil,
        imageDisplayMode: String? = "cover",
        qrCodeURL: String? = nil,
        duration: Int = 10,
        priority: Int = 0,
        isActive: Bool = true,
        isAdopted: Bool = false,
        isProtected: Bool = false,
        sortOrder: Int = 0,
        schedule: ScreenSchedule? = nil,
        livestreamUrl: String? = nil,
        templateOverlay: TemplateOverlay? = nil,
        catName: String? = nil,
        catAge: String? = nil,
        catGender: String? = nil,
        catBreed: String? = nil,
        catDescription: String? = nil,
        eventDate: String? = nil,
        eventTime: String? = nil,
        eventLocation: String? = nil
    ) {
        self.id = id
        self.numericId = numericId
        self.type = type
        self.title = title
        self.subtitle = subtitle
        self.bodyText = bodyText
        self.imageURL = imageURL
        self.imageDisplayMode = imageDisplayMode
        self.qrCodeURL = qrCodeURL
        self.duration = duration
        self.priority = priority
        self.isActive = isActive
        self.isAdopted = isAdopted
        self.isProtected = isProtected
        self.sortOrder = sortOrder
        self.schedule = schedule
        self.livestreamUrl = livestreamUrl
        self.templateOverlay = templateOverlay
        self.createdAt = Date()
        self.updatedAt = Date()
        self.catName = catName
        self.catAge = catAge
        self.catGender = catGender
        self.catBreed = catBreed
        self.catDescription = catDescription
        self.eventDate = eventDate
        self.eventTime = eventTime
        self.eventLocation = eventLocation
    }
    
    static func == (lhs: Screen, rhs: Screen) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - API Screen Model (matches backend JSON exactly)

struct APIScreen: Codable {
    var id: Int
    var type: String
    var title: String
    var subtitle: String?
    var body: String?
    var imagePath: String?
    var imageDisplayMode: String?
    var qrUrl: String?
    var startAt: String?
    var endAt: String?
    var daysOfWeek: [Int]?
    var timeStart: String?
    var timeEnd: String?
    var priority: Int
    var durationSeconds: Int
    var sortOrder: Int
    var isActive: Bool
    var isProtected: Bool
    var isAdopted: Bool
    var livestreamUrl: String?
    var templateOverlay: TemplateOverlay? // Template data from Slide Editor
    var createdAt: String
    var updatedAt: String
    
    // Event-specific fields from API
    var eventDate: String?
    var eventTime: String?
    var eventLocation: String?
    
    /// Convert API screen to local Screen model
    func toScreen() -> Screen {
        let screenType = ScreenType(rawValue: type) ?? .custom
        
        // Parse dates
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        let isoFormatterNoFrac = ISO8601DateFormatter()
        isoFormatterNoFrac.formatOptions = [.withInternetDateTime]
        
        func parseDate(_ str: String?) -> Date? {
            guard let str = str else { return nil }
            return isoFormatter.date(from: str) ?? isoFormatterNoFrac.date(from: str)
        }
        
        // Build schedule if scheduling fields are present
        var schedule: ScreenSchedule? = nil
        if daysOfWeek != nil || timeStart != nil || timeEnd != nil || startAt != nil || endAt != nil {
            schedule = ScreenSchedule(
                startDate: parseDate(startAt),
                endDate: parseDate(endAt),
                daysOfWeek: daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
                startTime: timeStart,
                endTime: timeEnd
            )
        }
        
        return Screen(
            id: UUID(),
            numericId: id,
            type: screenType,
            title: title,
            subtitle: subtitle,
            bodyText: body,
            imageURL: imagePath,
            imageDisplayMode: imageDisplayMode,
            qrCodeURL: qrUrl,
            duration: durationSeconds,
            priority: priority,
            isActive: isActive,
            isAdopted: isAdopted,
            isProtected: isProtected,
            sortOrder: sortOrder,
            schedule: schedule,
            livestreamUrl: livestreamUrl,
            templateOverlay: templateOverlay,
            eventDate: eventDate,
            eventTime: eventTime,
            eventLocation: eventLocation
        )
    }
}

// MARK: - Template Overlay Models

/// Represents a single element in a template overlay (text, image, shape, etc.)
struct TemplateElement: Codable, Identifiable {
    var id: String
    var type: String // "title", "subtitle", "body", "photo", "qrCode", "logo", "clock", "weather", "counter", "galleryGrid", "adoptionGrid", "catPhoto"
    // Position (percentage of canvas, 0-100)
    var x: Double
    var y: Double
    // Size (percentage of canvas, 0-100)
    var width: Double
    var height: Double
    // Typography
    var fontSize: Double?
    var fontWeight: String? // "normal", "bold", "100"-"900"
    var fontFamily: String?
    var textAlign: String? // "left", "center", "right"
    // Styling
    var color: String?
    var backgroundColor: String?
    var borderRadius: Double?
    var opacity: Double?
    var rotation: Double? // degrees
    // Layout
    var zIndex: Int?
    var padding: Double?
    // Photo-specific
    var objectFit: String? // "cover", "contain", "fill"
    // Visibility
    var visible: Bool?
    // Gallery-specific
    var galleryType: String?
    var photosToShow: Int?
}

/// Widget override settings for per-slide customization of overlay widgets
struct WidgetOverride: Codable {
    var visible: Bool?
    var x: Double?
    var y: Double?
    var width: Double?
    var height: Double?
    var fontSize: Double?
    var color: String?
    var opacity: Double?
    var size: Double?
    var label: String?
    var showDate: Bool?
}

struct WidgetOverrides: Codable {
    var logo: WidgetOverride?
    var weather: WidgetOverride?
    var clock: WidgetOverride?
    var waiverQr: WidgetOverride?
}

/// Template overlay data attached to each screen from the API
struct TemplateOverlay: Codable {
    var elements: String // JSON string of TemplateElement[]
    var backgroundColor: String?
    var backgroundGradient: String?
    var backgroundImageUrl: String?
    var defaultFontFamily: String?
    var defaultFontColor: String?
    var widgetOverrides: String? // JSON string of WidgetOverrides
    
    /// Parse the elements JSON string into an array of TemplateElement
    func parsedElements() -> [TemplateElement] {
        guard let data = elements.data(using: .utf8) else { return [] }
        do {
            return try JSONDecoder().decode([TemplateElement].self, from: data)
        } catch {
            print("Failed to parse template elements: \(error)")
            return []
        }
    }
    
    /// Parse the widget overrides JSON string
    func parsedWidgetOverrides() -> WidgetOverrides? {
        guard let str = widgetOverrides, let data = str.data(using: .utf8) else { return nil }
        do {
            return try JSONDecoder().decode(WidgetOverrides.self, from: data)
        } catch {
            print("Failed to parse widget overrides: \(error)")
            return nil
        }
    }
}

// MARK: - Schedule Model

struct ScreenSchedule: Codable, Equatable {
    var startDate: Date?
    var endDate: Date?
    var daysOfWeek: [Int] // 0 = Sunday, 6 = Saturday
    var startTime: String? // "HH:mm" format
    var endTime: String? // "HH:mm" format
    
    init(
        startDate: Date? = nil,
        endDate: Date? = nil,
        daysOfWeek: [Int] = [0, 1, 2, 3, 4, 5, 6],
        startTime: String? = nil,
        endTime: String? = nil
    ) {
        self.startDate = startDate
        self.endDate = endDate
        self.daysOfWeek = daysOfWeek
        self.startTime = startTime
        self.endTime = endTime
    }
    
    func isActiveNow() -> Bool {
        let now = Date()
        let calendar = Calendar.current
        
        // Check date range
        if let start = startDate, now < start { return false }
        if let end = endDate, now > end { return false }
        
        // Check day of week
        let weekday = calendar.component(.weekday, from: now) - 1 // Convert to 0-indexed
        if !daysOfWeek.contains(weekday) { return false }
        
        // Check time window
        if let startTimeStr = startTime, let endTimeStr = endTime {
            let formatter = DateFormatter()
            formatter.dateFormat = "HH:mm"
            let currentTimeStr = formatter.string(from: now)
            
            if currentTimeStr < startTimeStr || currentTimeStr > endTimeStr {
                return false
            }
        }
        
        return true
    }
}

// MARK: - Settings Model

struct AppSettings: Codable {
    var locationName: String?
    var defaultDurationSeconds: Int
    var snapAndPurrFrequency: Int
    var latitude: Double
    var longitude: Double
    var refreshIntervalSeconds: Int
    var transitionDuration: Double
    var totalAdoptionCount: Int
    var logoUrl: String?
    var waiverUrl: String?
    var wifiName: String?
    var wifiPassword: String?
    var houseRules: [String]?
    var livestreamUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case locationName
        case defaultDurationSeconds
        case snapAndPurrFrequency
        case latitude, longitude
        case refreshIntervalSeconds
        case transitionDuration
        case totalAdoptionCount
        case logoUrl
        case waiverUrl
        case wifiName
        case wifiPassword
        case houseRules
        case livestreamUrl
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        locationName = try container.decodeIfPresent(String.self, forKey: .locationName)
        defaultDurationSeconds = (try? container.decode(Int.self, forKey: .defaultDurationSeconds)) ?? 10
        snapAndPurrFrequency = (try? container.decode(Int.self, forKey: .snapAndPurrFrequency)) ?? 5
        latitude = (try? container.decode(Double.self, forKey: .latitude)) ?? 34.3917
        longitude = (try? container.decode(Double.self, forKey: .longitude)) ?? -118.5426
        refreshIntervalSeconds = (try? container.decode(Int.self, forKey: .refreshIntervalSeconds)) ?? 60
        transitionDuration = (try? container.decode(Double.self, forKey: .transitionDuration)) ?? 1.0
        totalAdoptionCount = (try? container.decode(Int.self, forKey: .totalAdoptionCount)) ?? 0
        logoUrl = try container.decodeIfPresent(String.self, forKey: .logoUrl)
        waiverUrl = try container.decodeIfPresent(String.self, forKey: .waiverUrl)
        wifiName = try container.decodeIfPresent(String.self, forKey: .wifiName)
        wifiPassword = try container.decodeIfPresent(String.self, forKey: .wifiPassword)
        houseRules = try container.decodeIfPresent([String].self, forKey: .houseRules)
        livestreamUrl = try container.decodeIfPresent(String.self, forKey: .livestreamUrl)
    }
    
    init(
        locationName: String? = "Catfé Santa Clarita",
        defaultDurationSeconds: Int = 10,
        snapAndPurrFrequency: Int = 5,
        latitude: Double = 34.3917,
        longitude: Double = -118.5426,
        refreshIntervalSeconds: Int = 60,
        transitionDuration: Double = 1.0,
        totalAdoptionCount: Int = 0,
        logoUrl: String? = nil,
        waiverUrl: String? = nil,
        wifiName: String? = nil,
        wifiPassword: String? = nil,
        houseRules: [String]? = nil,
        livestreamUrl: String? = nil
    ) {
        self.locationName = locationName
        self.defaultDurationSeconds = defaultDurationSeconds
        self.snapAndPurrFrequency = snapAndPurrFrequency
        self.latitude = latitude
        self.longitude = longitude
        self.refreshIntervalSeconds = refreshIntervalSeconds
        self.transitionDuration = transitionDuration
        self.totalAdoptionCount = totalAdoptionCount
        self.logoUrl = logoUrl
        self.waiverUrl = waiverUrl
        self.wifiName = wifiName
        self.wifiPassword = wifiPassword
        self.houseRules = houseRules
        self.livestreamUrl = livestreamUrl
    }
    
    static var `default`: AppSettings {
        AppSettings()
    }
}

// MARK: - Photo Submission Model

struct PhotoSubmission: Codable, Identifiable {
    var id: Int
    var type: String // "happy_tails" or "snap_purr"
    var status: String // "pending", "approved", "rejected"
    var submitterName: String
    var submitterEmail: String?
    var photoUrl: String
    var caption: String?
    var catName: String?
    var adoptionDate: String?
    var reviewedAt: String?
    var reviewedBy: Int?
    var rejectionReason: String?
    var displayOrder: Int
    var showOnTv: Bool
    var isFeatured: Bool
    var backgroundStyle: String?
    var borderStyle: String?
    var likesCount: Int
    var createdAt: String
    var updatedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id, type, status
        case submitterName, submitterEmail
        case photoUrl, caption
        case catName, adoptionDate
        case reviewedAt, reviewedBy, rejectionReason
        case displayOrder, showOnTv, isFeatured
        case backgroundStyle, borderStyle
        case likesCount
        case createdAt, updatedAt
    }
}

// MARK: - Weather Model

struct WeatherData: Codable {
    var temperature: Double
    var condition: String
    var icon: String
    var humidity: Int
    var lastUpdated: Date
    
    var temperatureString: String {
        "\(Int(temperature))°F"
    }
    
    var conditionIcon: String {
        switch condition.lowercased() {
        case let c where c.contains("clear") || c.contains("sunny"):
            return "sun.max.fill"
        case let c where c.contains("cloud"):
            return "cloud.fill"
        case let c where c.contains("rain"):
            return "cloud.rain.fill"
        case let c where c.contains("snow"):
            return "cloud.snow.fill"
        case let c where c.contains("thunder"):
            return "cloud.bolt.fill"
        case let c where c.contains("fog") || c.contains("mist"):
            return "cloud.fog.fill"
        default:
            return "sun.max.fill"
        }
    }
}

// MARK: - Poll Models

struct PollOption: Codable, Identifiable {
    var id: String
    var text: String
    var imageUrl: String?
    var votes: Int?
    
    enum CodingKeys: String, CodingKey {
        case id, text
        case imageUrl = "imageUrl"
        case votes
    }
}

struct Poll: Codable, Identifiable {
    var id: Int
    var question: String
    var options: [PollOption]
    var totalVotes: Int
    
    enum CodingKeys: String, CodingKey {
        case id, question, options, totalVotes
    }
}

struct PollResponse: Codable {
    var result: PollResult
    
    struct PollResult: Codable {
        var data: PollData
        
        struct PollData: Codable {
            var json: Poll?
        }
    }
}

// MARK: - API Response Models

struct ScreensResponse: Codable {
    var screens: [Screen]
    var settings: AppSettings?
}

struct APIError: Error, LocalizedError {
    var message: String
    
    var errorDescription: String? {
        message
    }
}

// MARK: - Sample Data

extension Screen {
    static var sampleScreens: [Screen] {
        [
            Screen(
                type: .snapPurr,
                title: "Snap & Purr",
                subtitle: "Share your visit!",
                bodyText: "Take a photo with our cats and share on social media using #CatfeSantaClarita",
                qrCodeURL: "https://instagram.com/catfesantaclarita",
                duration: 15
            ),
            Screen(
                type: .adoption,
                title: "Meet Scout",
                subtitle: "6 months old • Female",
                imageURL: "https://raw.githubusercontent.com/jnegrete31/catfe-tv/main/assets/catfe-tv/2026/01/1769716107287-scout.jpg",
                duration: 12,
                catName: "Scout",
                catAge: "6 months",
                catGender: "Female",
                catBreed: "Domestic Shorthair",
                catDescription: "This sweet cat is looking for her forever home. Ask staff for details!"
            ),
            Screen(
                type: .events,
                title: "Valentine's Day Special",
                subtitle: "February 14th",
                bodyText: "Join us for a special Valentine's Day event with treats and love!",
                duration: 10,
                eventDate: "February 14th",
                eventTime: "2:00 PM - 6:00 PM",
                eventLocation: "Catfé Santa Clarita"
            ),
            Screen(
                type: .today,
                title: "Today at Catfé",
                subtitle: "Thursday, January 29",
                bodyText: "• Open 10 AM - 8 PM\n• Happy Hour 3-5 PM\n• New kittens available!",
                duration: 10
            ),
            Screen(
                type: .membership,
                title: "Become a Member",
                subtitle: "Unlimited visits & perks",
                bodyText: "Get unlimited visits, member discounts, and exclusive events access!",
                qrCodeURL: "https://catfesantaclarita.com/membership",
                duration: 12
            ),
            Screen(
                type: .reminders,
                title: "Friendly Reminders",
                subtitle: "Help us keep our cats happy",
                bodyText: "• Wash hands before and after\n• No flash photography\n• Be gentle with the cats\n• Food and drinks in designated areas only",
                duration: 10
            ),
            Screen(
                type: .thankYou,
                title: "Thank You!",
                subtitle: "For visiting Catfé",
                bodyText: "Your visit helps support local cat rescue organizations. See you next time!",
                duration: 8
            )
        ]
    }
}

// MARK: - Guest Session Model

struct GuestSession: Codable, Identifiable {
    var id: Int
    var guestName: String
    var guestCount: Int
    var duration: String // "15", "30", or "60" minutes
    var status: String // "active", "completed", "extended"
    var checkInAt: Date
    var expiresAt: Date
    var checkedOutAt: Date?
    var notes: String?
    var reminderShown: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case guestName
        case guestCount
        case duration
        case status
        case checkInAt
        case expiresAt
        case checkedOutAt
        case notes
        case reminderShown
    }
    
    /// Time remaining until session expires (in seconds)
    var timeRemaining: TimeInterval {
        return expiresAt.timeIntervalSinceNow
    }
    
    /// Whether the session has less than 5 minutes remaining
    var isNearingExpiry: Bool {
        return timeRemaining > 0 && timeRemaining <= 5 * 60
    }
    
    /// Whether the session has less than 2 minutes remaining (urgent)
    var isUrgent: Bool {
        return timeRemaining > 0 && timeRemaining <= 2 * 60
    }
    
    /// Whether the session has expired
    var isExpired: Bool {
        return timeRemaining <= 0
    }
    
    /// Formatted time remaining string (e.g., "4:32")
    var formattedTimeRemaining: String {
        let remaining = max(0, timeRemaining)
        let minutes = Int(remaining) / 60
        let seconds = Int(remaining) % 60
        return "\(minutes):\(String(format: "%02d", seconds))"
    }
    
    /// Session type label based on duration
    var sessionTypeLabel: String {
        switch duration {
        case "15": return "Guest Pass"
        case "30": return "Mini Meow"
        case "60": return "Full Meow"
        default: return "Session"
        }
    }
}
