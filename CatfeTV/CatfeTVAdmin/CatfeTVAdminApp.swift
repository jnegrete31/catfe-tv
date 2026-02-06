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
    @StateObject private var authService = AuthService.shared
    
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(apiClient)
                .environmentObject(weatherService)
                .environmentObject(authService)
                .preferredColorScheme(.light)
                .onOpenURL { url in
                    handleDeepLink(url)
                }
        }
    }
    
    private func handleDeepLink(_ url: URL) {
        // Handle OAuth callback
        if url.scheme == "catfetv" && url.host == "oauth" {
            Task {
                await authService.handleCallback(url: url)
            }
        }
    }
}

// MARK: - Root View (handles auth state)

struct RootView: View {
    @EnvironmentObject var authService: AuthService
    @EnvironmentObject var apiClient: APIClient
    @EnvironmentObject var weatherService: WeatherService
    
    var body: some View {
        Group {
            if authService.isLoading {
                // Loading state
                LoadingAuthView()
            } else if authService.isAuthenticated {
                // Authenticated - show main app
                ContentView()
                    .onAppear {
                        setupApp()
                    }
            } else {
                // Not authenticated - show login
                LoginView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: authService.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: authService.isLoading)
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

// MARK: - Loading Auth View

struct LoadingAuthView: View {
    var body: some View {
        ZStack {
            Color.catfeCream
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                Image(systemName: "cat.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.catfeTerracotta)
                
                ProgressView()
                    .tint(.catfeTerracotta)
                
                Text("Checking authentication...")
                    .font(.subheadline)
                    .foregroundColor(.catfeBrown.opacity(0.7))
            }
        }
    }
}
