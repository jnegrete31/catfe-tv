//
//  CatfeTVApp.swift
//  CatfeTVApp
//
//  tvOS Digital Signage App for Catfé
//

import SwiftUI
import UIKit

@main
struct CatfeTVApp: App {
    @StateObject private var apiClient = APIClient.shared
    @StateObject private var weatherService = WeatherService.shared
    @StateObject private var screenRotator = ScreenRotator()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(apiClient)
                .environmentObject(weatherService)
                .environmentObject(screenRotator)
                .preferredColorScheme(.light)
                .onAppear {
                    setupApp()
                }
        }
    }
    
    private func setupApp() {
        // Prevent Apple TV screensaver from activating
        // This keeps the digital signage display always on
        UIApplication.shared.isIdleTimerDisabled = true
        
        // Initial data load
        Task {
            await apiClient.fetchScreens()
            await apiClient.fetchSettings()
            await weatherService.fetchWeather(
                latitude: apiClient.settings.latitude,
                longitude: apiClient.settings.longitude
            )
            
            // Pre-fetch photos so gallery screens display instantly
            await apiClient.refreshPhotos()
            
            // Start screen rotation
            screenRotator.configure(
                screens: apiClient.getActiveScreens(),
                settings: apiClient.settings
            )
            screenRotator.start()
        }
    }
}
