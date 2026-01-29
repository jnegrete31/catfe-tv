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
    
    // MARK: - Configuration
    
    func configure(screens: [Screen], settings: AppSettings) {
        self.screens = screens
        self.settings = settings
        self.currentIndex = 0
        self.snapPurrCounter = 0
    }
    
    func updateScreens(_ newScreens: [Screen]) {
        // Preserve current position if possible
        let currentId = currentScreen?.id
        self.screens = newScreens
        
        if let id = currentId, let newIndex = screens.firstIndex(where: { $0.id == id }) {
            currentIndex = newIndex
        } else if currentIndex >= screens.count {
            currentIndex = 0
        }
    }
    
    // MARK: - Playback Control
    
    func start() {
        guard !screens.isEmpty else { return }
        isAutoAdvancing = true
        scheduleNextScreen()
        startProgressTimer()
    }
    
    func stop() {
        isAutoAdvancing = false
        timer?.invalidate()
        timer = nil
        progressTimer?.invalidate()
        progressTimer = nil
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
        
        // Reset timers
        timer?.invalidate()
        progressTimer?.invalidate()
        progress = 0
        
        // Check if we should insert a Snap & Purr screen
        snapPurrCounter += 1
        if snapPurrCounter >= settings.snapPurrFrequency {
            if let snapPurrIndex = screens.firstIndex(where: { $0.type == .snapPurr }) {
                currentIndex = snapPurrIndex
                snapPurrCounter = 0
            } else {
                advanceIndex()
            }
        } else {
            advanceIndex()
        }
        
        // Restart timers if auto-advancing
        if isAutoAdvancing {
            scheduleNextScreen()
            startProgressTimer()
        }
    }
    
    func previousScreen() {
        guard !screens.isEmpty else { return }
        
        // Reset timers
        timer?.invalidate()
        progressTimer?.invalidate()
        progress = 0
        
        // Go to previous screen
        currentIndex = (currentIndex - 1 + screens.count) % screens.count
        
        // Restart timers if auto-advancing
        if isAutoAdvancing {
            scheduleNextScreen()
            startProgressTimer()
        }
    }
    
    func goToScreen(at index: Int) {
        guard index >= 0, index < screens.count else { return }
        
        timer?.invalidate()
        progressTimer?.invalidate()
        progress = 0
        
        currentIndex = index
        
        if isAutoAdvancing {
            scheduleNextScreen()
            startProgressTimer()
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
        
        currentIndex = nextIndex
    }
    
    private func scheduleNextScreen() {
        guard let screen = currentScreen else { return }
        
        let duration = TimeInterval(screen.duration > 0 ? screen.duration : settings.defaultDuration)
        
        timer = Timer.scheduledTimer(withTimeInterval: duration, repeats: false) { [weak self] _ in
            Task { @MainActor in
                self?.nextScreen()
            }
        }
    }
    
    private func startProgressTimer() {
        guard let screen = currentScreen else { return }
        
        let duration = TimeInterval(screen.duration > 0 ? screen.duration : settings.defaultDuration)
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
