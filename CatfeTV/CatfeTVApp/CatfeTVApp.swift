//
//  CatfeTVApp.swift
//  CatfeTVApp
//
//  tvOS Digital Signage App for Catfé
//

import SwiftUI

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
        // Initial data load
        Task {
            await apiClient.fetchScreens()
            await apiClient.fetchSettings()
            await weatherService.fetchWeather(
                latitude: apiClient.settings.latitude,
                longitude: apiClient.settings.longitude
            )
            
            // Start screen rotation
            screenRotator.configure(
                screens: apiClient.getActiveScreens(),
                settings: apiClient.settings
            )
            screenRotator.start()
        }
    }
}
