//
//  CatfeTVAdminApp.swift
//  CatfeTVAdmin
//
//  iOS Admin App for managing Catfé TV content
//

import SwiftUI

@main
struct CatfeTVAdminApp: App {
    @StateObject private var apiClient = APIClient.shared
    @StateObject private var weatherService = WeatherService.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(apiClient)
                .environmentObject(weatherService)
                .preferredColorScheme(.light)
                .onAppear {
                    setupApp()
                }
        }
    }
    
    private func setupApp() {
        Task {
            await apiClient.fetchScreens()
            await apiClient.fetchSettings()
            await weatherService.fetchWeather(
                latitude: apiClient.settings.latitude,
                longitude: apiClient.settings.longitude
            )
        }
    }
}
