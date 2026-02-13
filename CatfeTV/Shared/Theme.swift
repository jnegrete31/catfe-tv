//
//  Theme.swift
//  CatfeTV
//
//  Catfé brand colors and typography - Lounge-inspired design
//

import SwiftUI

// MARK: - Lounge-Inspired Colors (matching the physical space)

extension Color {
    // Lounge palette - inspired by the cat lounge interior
    static let loungeMintGreen = Color(hex: "a8d5ba")    // Epoxy floor
    static let loungeWarmOrange = Color(hex: "f97316")   // Mural accents
    static let loungeCream = Color(hex: "fef3c7")        // Walls
    static let loungeAmber = Color(hex: "d97706")        // Wicker pendant lights
    static let loungeCharcoal = Color(hex: "1f2937")     // Industrial ceiling
    static let loungeDarkBrown = Color(hex: "292524")    // Dark accents
    static let loungeStone = Color(hex: "78716c")        // Neutral tones
    
    // Primary brand colors (legacy support)
    static let catfeTerracotta = Color(hex: "C4704F")
    static let catfeCream = Color(hex: "FDF6E3")
    static let catfeBrown = Color(hex: "3D2914")
    
    // Extended palette
    static let catfeLightTerracotta = Color(hex: "D4907F")
    static let catfeDarkTerracotta = Color(hex: "A45A3F")
    static let catfeWarmWhite = Color(hex: "FAF3E8")
    static let catfeLightBrown = Color(hex: "5D4934")
    
    // Accent colors
    static let catfeGold = Color(hex: "D4A574")
    static let catfeSage = Color(hex: "8B9A7D")
    static let catfeBlush = Color(hex: "E8C4B8")
    
    // Semantic colors
    static let catfeSuccess = Color(hex: "7D9A6B")
    static let catfeWarning = Color(hex: "D4A574")
    static let catfeError = Color(hex: "C45C4F")
    
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Typography

struct CatfeTypography {
    // TV Display sizes (optimized for 10-foot viewing)
    #if os(tvOS)
    static let heroTitle: Font = .system(size: 96, weight: .bold, design: .rounded)
    static let largeTitle: Font = .system(size: 72, weight: .bold, design: .rounded)
    static let title: Font = .system(size: 56, weight: .semibold, design: .rounded)
    static let subtitle: Font = .system(size: 42, weight: .medium, design: .rounded)
    static let body: Font = .system(size: 36, weight: .regular, design: .rounded)
    static let caption: Font = .system(size: 28, weight: .regular, design: .rounded)
    static let small: Font = .system(size: 24, weight: .regular, design: .rounded)
    static let badge: Font = .system(size: 32, weight: .semibold, design: .rounded)
    static let clock: Font = .system(size: 36, weight: .medium, design: .monospaced)
    #else
    // iOS sizes
    static let heroTitle: Font = .system(size: 34, weight: .bold, design: .rounded)
    static let largeTitle: Font = .system(size: 28, weight: .bold, design: .rounded)
    static let title: Font = .system(size: 22, weight: .semibold, design: .rounded)
    static let subtitle: Font = .system(size: 18, weight: .medium, design: .rounded)
    static let body: Font = .system(size: 16, weight: .regular, design: .rounded)
    static let caption: Font = .system(size: 14, weight: .regular, design: .rounded)
    static let small: Font = .system(size: 12, weight: .regular, design: .rounded)
    static let badge: Font = .system(size: 14, weight: .semibold, design: .rounded)
    static let clock: Font = .system(size: 16, weight: .medium, design: .monospaced)
    #endif
}

// MARK: - Theme Environment

struct CatfeTheme {
    let primaryColor: Color
    let backgroundColor: Color
    let textColor: Color
    let accentColor: Color
    
    static let standard = CatfeTheme(
        primaryColor: .catfeTerracotta,
        backgroundColor: .catfeCream,
        textColor: .catfeBrown,
        accentColor: .catfeGold
    )
    
    static let dark = CatfeTheme(
        primaryColor: .catfeLightTerracotta,
        backgroundColor: .catfeBrown,
        textColor: .catfeCream,
        accentColor: .catfeGold
    )
    
    // New lounge-inspired theme
    static let lounge = CatfeTheme(
        primaryColor: .loungeWarmOrange,
        backgroundColor: .loungeCharcoal,
        textColor: .loungeCream,
        accentColor: .loungeAmber
    )
}

// MARK: - View Modifiers

struct CatfeCardStyle: ViewModifier {
    var backgroundColor: Color = .catfeCream
    var cornerRadius: CGFloat = 24
    var shadowRadius: CGFloat = 10
    
    func body(content: Content) -> some View {
        content
            .background(backgroundColor)
            .cornerRadius(cornerRadius)
            .shadow(color: .black.opacity(0.1), radius: shadowRadius, x: 0, y: 4)
    }
}

// Lounge-inspired polaroid card style
struct LoungePolaroidStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(Color.loungeCream)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
            .rotationEffect(.degrees(-2))
    }
}

struct CatfeBadgeStyle: ViewModifier {
    var color: Color = .catfeTerracotta
    
    func body(content: Content) -> some View {
        content
            .font(CatfeTypography.badge)
            .foregroundColor(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(color)
            .cornerRadius(20)
    }
}

struct CatfeButtonStyle: ButtonStyle {
    var isPrimary: Bool = true
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(CatfeTypography.body)
            .foregroundColor(isPrimary ? .white : .catfeTerracotta)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(isPrimary ? Color.catfeTerracotta : Color.clear)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.catfeTerracotta, lineWidth: isPrimary ? 0 : 2)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - View Extensions

extension View {
    func catfeCard(
        backgroundColor: Color = .catfeCream,
        cornerRadius: CGFloat = 24,
        shadowRadius: CGFloat = 10
    ) -> some View {
        modifier(CatfeCardStyle(
            backgroundColor: backgroundColor,
            cornerRadius: cornerRadius,
            shadowRadius: shadowRadius
        ))
    }
    
    func catfeBadge(color: Color = .catfeTerracotta) -> some View {
        modifier(CatfeBadgeStyle(color: color))
    }
    
    func loungePolaroid() -> some View {
        modifier(LoungePolaroidStyle())
    }
}

// MARK: - Gradient Backgrounds

extension LinearGradient {
    static let catfeWarm = LinearGradient(
        colors: [.catfeCream, .catfeBlush.opacity(0.3)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let catfeSunset = LinearGradient(
        colors: [.catfeLightTerracotta.opacity(0.3), .catfeGold.opacity(0.2)],
        startPoint: .top,
        endPoint: .bottom
    )
    
    static let catfeOverlay = LinearGradient(
        colors: [.clear, .black.opacity(0.4)],
        startPoint: .top,
        endPoint: .bottom
    )
    
    // Lounge-inspired gradients
    static let loungeFloor = LinearGradient(
        colors: [.clear, .loungeMintGreen.opacity(0.3)],
        startPoint: .top,
        endPoint: .bottom
    )
    
    static let loungeAmberGlow = LinearGradient(
        colors: [.loungeAmber.opacity(0.3), .clear],
        startPoint: .top,
        endPoint: .center
    )
}

// MARK: - Screen Type Colors (Updated for lounge theme)

extension ScreenType {
    // All screens now use the dark lounge background
    var backgroundColor: Color {
        return .loungeCharcoal
    }
    
    var accentColor: Color {
        switch self {
        case .snapPurr, .snapPurrGallery, .snapPurrQR: return .loungeWarmOrange
        case .events: return .loungeAmber
        case .today: return .loungeWarmOrange
        case .membership: return .loungeMintGreen
        case .reminders: return .loungeWarmOrange
        case .adoption: return .loungeWarmOrange
        case .adoptionShowcase: return .loungeAmber
        case .adoptionCounter: return .loungeAmber
        case .thankYou: return .loungeMintGreen
        case .livestream: return .loungeWarmOrange
        case .happyTails, .happyTailsQR: return .loungeMintGreen
        case .poll, .pollQR: return .loungeAmber
        case .checkIn: return .loungeMintGreen
        case .guestStatusBoard: return .loungeAmber
        case .custom: return .loungeWarmOrange
        }
    }
    
    var textColor: Color {
        return .loungeCream
    }
}
