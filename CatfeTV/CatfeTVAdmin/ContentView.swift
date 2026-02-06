//
//  ContentView.swift
//  CatfeTVAdmin
//
//  Main content view with tab navigation
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var apiClient: APIClient
    @EnvironmentObject var authService: AuthService
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Screens Tab
            NavigationStack {
                ScreenListView()
            }
            .tabItem {
                Label("Screens", systemImage: "tv")
            }
            .tag(0)
            
            // Preview Tab
            NavigationStack {
                PreviewView()
            }
            .tabItem {
                Label("Preview", systemImage: "play.rectangle")
            }
            .tag(1)
            
            // Settings Tab
            NavigationStack {
                SettingsView()
            }
            .tabItem {
                Label("Settings", systemImage: "gear")
            }
            .tag(2)
        }
        .tint(.catfeTerracotta)
    }
}

// MARK: - Preview

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(APIClient.shared)
            .environmentObject(WeatherService.shared)
            .environmentObject(AuthService.shared)
    }
}
#endif
