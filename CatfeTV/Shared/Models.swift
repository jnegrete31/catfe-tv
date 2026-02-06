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
    case snapPurr = "snap_purr"
    case events = "events"
    case today = "today"
    case membership = "membership"
    case reminders = "reminders"
    case adoption = "adoption"
    case adoptionShowcase = "adoption_showcase"
    case thankYou = "thank_you"
    
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
        case .thankYou: return "Thank You"
        }
    }
    
    var icon: String {
        switch self {
        case .snapPurr: return "camera.fill"
        case .events: return "calendar"
        case .today: return "sun.max.fill"
        case .membership: return "person.crop.circle.badge.checkmark"
        case .reminders: return "bell.fill"
        case .adoption: return "heart.fill"
        case .adoptionShowcase: return "square.grid.2x2.fill"
        case .thankYou: return "hands.clap.fill"
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
    var qrCodeURL: String?
    var duration: Int // seconds
    var priority: Int
    var isActive: Bool
    var isAdopted: Bool // For adoption screens
    var sortOrder: Int
    var schedule: ScreenSchedule?
    var createdAt: Date
    var updatedAt: Date
    
    // Adoption-specific fields
    var catName: String?
    var catAge: String?
    var catGender: String?
    var catBreed: String?
    var catDescription: String?
    
    // Event-specific fields
    var eventDate: Date?
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
        qrCodeURL: String? = nil,
        duration: Int = 10,
        priority: Int = 0,
        isActive: Bool = true,
        isAdopted: Bool = false,
        sortOrder: Int = 0,
        schedule: ScreenSchedule? = nil,
        catName: String? = nil,
        catAge: String? = nil,
        catGender: String? = nil,
        catBreed: String? = nil,
        catDescription: String? = nil,
        eventDate: Date? = nil,
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
        self.qrCodeURL = qrCodeURL
        self.duration = duration
        self.priority = priority
        self.isActive = isActive
        self.isAdopted = isAdopted
        self.sortOrder = sortOrder
        self.schedule = schedule
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
    var snapAndPurrFrequency: Int // Show every N screens
    var latitude: Double
    var longitude: Double
    var refreshIntervalSeconds: Int // seconds
    var transitionDuration: Double // seconds
    var totalAdoptionCount: Int
    var logoUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case locationName
        case defaultDurationSeconds
        case snapAndPurrFrequency
        case latitude, longitude
        case refreshIntervalSeconds
        case transitionDuration
        case totalAdoptionCount
        case logoUrl
    }
    
    static var `default`: AppSettings {
        AppSettings(
            locationName: "Catfé Santa Clarita",
            defaultDurationSeconds: 10,
            snapAndPurrFrequency: 5,
            latitude: 34.3917,
            longitude: -118.5426,
            refreshIntervalSeconds: 60,
            transitionDuration: 1.0,
            totalAdoptionCount: 0,
            logoUrl: nil
        )
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
                subtitle: "Looking for a forever home",
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
                eventDate: Date().addingTimeInterval(86400 * 14),
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
    var guestName: String?
    var partySize: Int
    var checkInTime: Date
    var checkOutTime: Date?
    var sessionDurationMinutes: Int
    var status: String
    var notes: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case guestName
        case partySize
        case checkInTime
        case checkOutTime
        case sessionDurationMinutes
        case status
        case notes
    }
}
