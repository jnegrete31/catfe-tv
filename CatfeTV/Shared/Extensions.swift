//
//  Extensions.swift
//  CatfeTV
//
//  Utility extensions for both platforms
//

import Foundation
import SwiftUI

// MARK: - Date Extensions

extension Date {
    var formattedTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: self)
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: self)
    }
    
    var shortDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: self)
    }
    
    var dayOfWeek: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        return formatter.string(from: self)
    }
    
    var clockTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm"
        return formatter.string(from: self)
    }
    
    var clockPeriod: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "a"
        return formatter.string(from: self)
    }
}

// MARK: - String Extensions

extension String {
    var isValidURL: Bool {
        guard let url = URL(string: self) else { return false }
        return url.scheme != nil && url.host != nil
    }
    
    func truncated(to length: Int, trailing: String = "...") -> String {
        if self.count > length {
            return String(self.prefix(length)) + trailing
        }
        return self
    }
}

// MARK: - View Extensions

extension View {
    func fadeTransition() -> some View {
        self.transition(.opacity.animation(.easeInOut(duration: 1.0)))
    }
    
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
    
    func aspectRatio16x9() -> some View {
        self.aspectRatio(16/9, contentMode: .fit)
    }
    
    #if os(tvOS)
    func tvOSFocusable() -> some View {
        self.focusable()
    }
    #else
    func tvOSFocusable() -> some View {
        self
    }
    #endif
}

// MARK: - Animation Extensions

extension Animation {
    static let catfeFade = Animation.easeInOut(duration: 1.0)
    static let catfeSpring = Animation.spring(response: 0.3, dampingFraction: 0.7)
    static let catfeBounce = Animation.interpolatingSpring(stiffness: 300, damping: 15)
}

// MARK: - Array Extensions

extension Array where Element == Screen {
    func activeScreens() -> [Screen] {
        self.filter { screen in
            guard screen.isActive else { return false }
            if let schedule = screen.schedule {
                return schedule.isActiveNow()
            }
            return true
        }.sorted { $0.sortOrder < $1.sortOrder }
    }
    
    func screensByType(_ type: ScreenType) -> [Screen] {
        self.filter { $0.type == type }
    }
}

// MARK: - Timer Publisher

import Combine

extension Publishers {
    static func timer(every interval: TimeInterval) -> AnyPublisher<Date, Never> {
        Timer.publish(every: interval, on: .main, in: .common)
            .autoconnect()
            .eraseToAnyPublisher()
    }
}

// MARK: - Haptic Feedback (iOS only)

#if os(iOS)
import UIKit

struct HapticFeedback {
    static func light() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    static func medium() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }
    
    static func heavy() {
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
    }
    
    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }
    
    static func error() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }
    
    static func selection() {
        UISelectionFeedbackGenerator().selectionChanged()
    }
}
#endif

// MARK: - Keyboard Dismissal (iOS only)

#if os(iOS)
extension UIApplication {
    func dismissKeyboard() {
        sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}
#endif

// MARK: - Safe Area Insets

struct SafeAreaInsetsKey: EnvironmentKey {
    static var defaultValue: EdgeInsets {
        EdgeInsets()
    }
}

extension EnvironmentValues {
    var safeAreaInsets: EdgeInsets {
        get { self[SafeAreaInsetsKey.self] }
        set { self[SafeAreaInsetsKey.self] = newValue }
    }
}

// MARK: - Screen Size

struct ScreenSizeKey: EnvironmentKey {
    static var defaultValue: CGSize {
        #if os(tvOS)
        return CGSize(width: 1920, height: 1080)
        #else
        return UIScreen.main.bounds.size
        #endif
    }
}

extension EnvironmentValues {
    var screenSize: CGSize {
        get { self[ScreenSizeKey.self] }
        set { self[ScreenSizeKey.self] = newValue }
    }
}

// MARK: - Debug Helpers

extension View {
    func debugBorder(_ color: Color = .red) -> some View {
        #if DEBUG
        return self.border(color, width: 1)
        #else
        return self
        #endif
    }
    
    func debugPrint(_ message: String) -> some View {
        #if DEBUG
        print(message)
        #endif
        return self
    }
}

// MARK: - Codable Helpers

extension JSONEncoder {
    static var catfeEncoder: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return encoder
    }
}

extension JSONDecoder {
    static var catfeDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}

// MARK: - Optional Binding

extension Binding {
    func unwrap<T>(_ defaultValue: T) -> Binding<T> where Value == T? {
        Binding<T>(
            get: { self.wrappedValue ?? defaultValue },
            set: { self.wrappedValue = $0 }
        )
    }
}
