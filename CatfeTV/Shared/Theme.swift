//
//  Theme.swift
//  CatfeTV
//
//  Catfé brand colors and typography
//

import SwiftUI

// MARK: - Catfé Colors

extension Color {
    // Primary brand colors
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
}

// MARK: - Screen Type Colors

extension ScreenType {
    var backgroundColor: Color {
        switch self {
        case .snapPurr: return Color(hex: "FFE4E1") // Misty Rose
        case .events: return Color(hex: "E6F3FF") // Light Blue
        case .today: return Color(hex: "FFF8E7") // Warm Cream
        case .membership: return Color(hex: "E8F5E9") // Light Green
        case .reminders: return Color(hex: "FFF3E0") // Light Orange
        case .adoption: return Color(hex: "FCE4EC") // Light Pink
        case .adoptionShowcase: return Color(hex: "FFEDD5") // Light Orange/Peach
        case .thankYou: return Color(hex: "F3E5F5") // Light Purple
        }
    }
    
    var accentColor: Color {
        switch self {
        case .snapPurr: return .catfeTerracotta
        case .events: return Color(hex: "1976D2")
        case .today: return .catfeGold
        case .membership: return .catfeSage
        case .reminders: return Color(hex: "F57C00")
        case .adoption: return Color(hex: "E91E63")
        case .adoptionShowcase: return Color(hex: "EA580C") // Orange
        case .thankYou: return Color(hex: "7B1FA2")
        }
    }
}
