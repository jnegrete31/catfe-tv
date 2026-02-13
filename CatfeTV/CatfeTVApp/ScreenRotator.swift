//
//  ScreenRotator.swift
//  CatfeTVApp
//
//  Manages automatic screen rotation with configurable timing
//

import Foundation
import SwiftUI
import Combine

@MainActor
class ScreenRotator: ObservableObject {
    @Published var screens: [Screen] = []
    @Published var currentIndex: Int = 0
    @Published var isAutoAdvancing: Bool = true
    @Published var progress: Double = 0.0
    
    private var settings: AppSettings = .default
    private var timer: Timer?
    private var progressTimer: Timer?
    private var snapPurrCounter: Int = 0
    
    var currentScreen: Screen? {
        guard !screens.isEmpty, currentIndex < screens.count else { return nil }
        return screens[currentIndex]
    }
    
    /// The effective duration for the current screen in seconds
    private var currentDuration: TimeInterval {
        guard let screen = currentScreen else {
            return TimeInterval(settings.defaultDurationSeconds)
        }
        let dur = screen.duration > 0 ? screen.duration : settings.defaultDurationSeconds
        print("[ScreenRotator] Screen '\(screen.title)' (type: \(screen.type.rawValue)) duration: \(dur)s (screen.duration=\(screen.duration), default=\(settings.defaultDurationSeconds))")
        return TimeInterval(dur)
    }
    
    // MARK: - Configuration
    
    func configure(screens: [Screen], settings: AppSettings) {
        self.screens = screens.shuffled()
        self.settings = settings
        self.currentIndex = 0
        self.snapPurrCounter = 0
        print("[ScreenRotator] Configured with \(screens.count) screens, defaultDuration=\(settings.defaultDurationSeconds)s")
    }
    
    func updateScreens(_ newScreens: [Screen]) {
        // Preserve current screen if possible
        let currentId = currentScreen?.id
        self.screens = newScreens.shuffled()
        
        if let id = currentId, let newIndex = screens.firstIndex(where: { $0.id == id }) {
            currentIndex = newIndex
        } else if currentIndex >= screens.count {
            currentIndex = 0
        }
        // Note: Don't restart timers here — the existing timer for the current screen
        // should continue running with its original duration
    }
    
    /// Update settings (e.g., when admin changes default duration)
    func updateSettings(_ newSettings: AppSettings) {
        self.settings = newSettings
    }
    
    // MARK: - Playback Control
    
    func start() {
        guard !screens.isEmpty else { return }
        isAutoAdvancing = true
        startTimersForCurrentScreen()
    }
    
    func stop() {
        isAutoAdvancing = false
        cancelTimers()
    }
    
    func toggleAutoAdvance() {
        if isAutoAdvancing {
            stop()
        } else {
            start()
        }
    }
    
    // MARK: - Navigation
    
    func nextScreen() {
        guard !screens.isEmpty else { return }
        
        // Cancel existing timers
        cancelTimers()
        
        // Check if we should insert a Snap & Purr screen
        snapPurrCounter += 1
        if snapPurrCounter >= settings.snapAndPurrFrequency {
            if let snapPurrIndex = screens.firstIndex(where: { $0.type == .snapPurr }) {
                currentIndex = snapPurrIndex
                snapPurrCounter = 0
            } else {
                advanceIndex()
            }
        } else {
            advanceIndex()
        }
        
        // Restart timers for the NEW current screen
        if isAutoAdvancing {
            startTimersForCurrentScreen()
        }
    }
    
    func previousScreen() {
        guard !screens.isEmpty else { return }
        
        // Cancel existing timers
        cancelTimers()
        
        // Go to previous screen
        currentIndex = (currentIndex - 1 + screens.count) % screens.count
        
        // Restart timers for the NEW current screen
        if isAutoAdvancing {
            startTimersForCurrentScreen()
        }
    }
    
    func goToScreen(at index: Int) {
        guard index >= 0, index < screens.count else { return }
        
        cancelTimers()
        currentIndex = index
        
        if isAutoAdvancing {
            startTimersForCurrentScreen()
        }
    }
    
    // MARK: - Private Methods
    
    private func advanceIndex() {
        // Skip to next non-Snap & Purr screen (unless it's the only type)
        var nextIndex = (currentIndex + 1) % screens.count
        var attempts = 0
        
        while screens[nextIndex].type == .snapPurr && attempts < screens.count {
            nextIndex = (nextIndex + 1) % screens.count
            attempts += 1
        }
        
        // If we've completed a full cycle, reshuffle for variety
        if nextIndex == 0 {
            let currentScreenObj = screens[currentIndex]
            screens.shuffle()
            // Make sure we don't repeat the same screen after shuffle
            if let first = screens.first, first.id == currentScreenObj.id, screens.count > 1 {
                screens.swapAt(0, Int.random(in: 1..<screens.count))
            }
        }
        
        currentIndex = nextIndex
    }
    
    /// Cancel all active timers
    private func cancelTimers() {
        timer?.invalidate()
        timer = nil
        progressTimer?.invalidate()
        progressTimer = nil
        progress = 0
    }
    
    /// Start both the advance timer and progress timer for the current screen
    private func startTimersForCurrentScreen() {
        let duration = currentDuration
        
        // Schedule the advance timer
        timer = Timer.scheduledTimer(withTimeInterval: duration, repeats: false) { [weak self] _ in
            Task { @MainActor in
                self?.nextScreen()
            }
        }
        
        // Schedule the progress timer
        let updateInterval: TimeInterval = 0.1
        let progressIncrement = updateInterval / duration
        progress = 0
        
        progressTimer = Timer.scheduledTimer(withTimeInterval: updateInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self = self else { return }
                self.progress = min(1.0, self.progress + progressIncrement)
            }
        }
    }
}
