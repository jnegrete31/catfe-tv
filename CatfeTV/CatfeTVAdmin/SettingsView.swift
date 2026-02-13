//
//  SettingsView.swift
//  CatfeTVAdmin
//
//  App settings and configuration
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var apiClient: APIClient
    @EnvironmentObject var weatherService: WeatherService
    @EnvironmentObject var authService: AuthService
    
    @State private var locationName: String = ""
    @State private var defaultDurationSeconds: Int = 10
    @State private var snapAndPurrFrequency: Int = 5
    @State private var refreshIntervalSeconds: Int = 60
    @State private var transitionDuration: Double = 1.0
    
    @State private var isSaving = false
    @State private var showingSaveConfirmation = false
    @State private var showingLogoutConfirmation = false
    
    var body: some View {
        Form {
            // User Profile Section
            Section {
                if let user = authService.currentUser {
                    HStack(spacing: 16) {
                        // Avatar
                        if let avatarUrl = user.avatarUrl, let url = URL(string: avatarUrl) {
                            AsyncImage(url: url) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Image(systemName: "person.circle.fill")
                                    .font(.system(size: 50))
                                    .foregroundColor(.catfeTerracotta)
                            }
                            .frame(width: 50, height: 50)
                            .clipShape(Circle())
                        } else {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.catfeTerracotta)
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(user.name)
                                .font(.headline)
                            
                            HStack(spacing: 4) {
                                Image(systemName: user.isAdmin ? "checkmark.shield.fill" : "person.fill")
                                    .font(.caption)
                                Text(user.isAdmin ? "Admin" : "User")
                                    .font(.caption)
                            }
                            .foregroundColor(user.isAdmin ? .green : .secondary)
                        }
                        
                        Spacer()
                    }
                }
            } header: {
                Text("Account")
            }
            
            // Location
            Section {
                TextField("Location Name", text: $locationName)
                
                HStack {
                    Text("Coordinates")
                    Spacer()
                    Text("\(apiClient.settings.latitude, specifier: "%.4f"), \(apiClient.settings.longitude, specifier: "%.4f")")
                        .foregroundColor(.secondary)
                }
            } header: {
                Text("Location")
            } footer: {
                Text("Santa Clarita, CA")
            }
            
            // Display Settings
            Section {
                Stepper("Default Duration: \(defaultDurationSeconds)s", value: $defaultDurationSeconds, in: 5...60, step: 5)
                
                Stepper("Snap & Purr Frequency: Every \(snapAndPurrFrequency) screens", value: $snapAndPurrFrequency, in: 2...10)
                
                VStack(alignment: .leading) {
                    Text("Transition Duration: \(transitionDuration, specifier: "%.1f")s")
                    Slider(value: $transitionDuration, in: 0.5...3.0, step: 0.5)
                }
            } header: {
                Text("Display")
            } footer: {
                Text("These settings affect how screens are displayed on the TV.")
            }
            
            // Refresh Settings
            Section {
                Picker("Auto-Refresh Interval", selection: $refreshIntervalSeconds) {
                    Text("30 seconds").tag(30)
                    Text("1 minute").tag(60)
                    Text("2 minutes").tag(120)
                    Text("5 minutes").tag(300)
                }
            } header: {
                Text("Data Refresh")
            } footer: {
                Text("How often the TV app checks for new content.")
            }
            
            // Weather
            Section {
                HStack {
                    Text("Current Weather")
                    Spacer()
                    if let weather = weatherService.currentWeather {
                        HStack(spacing: 8) {
                            Image(systemName: weather.conditionIcon)
                            Text(weather.temperatureString)
                            Text(weather.condition)
                                .foregroundColor(.secondary)
                        }
                    } else {
                        Text("Loading...")
                            .foregroundColor(.secondary)
                    }
                }
                
                Button {
                    Task {
                        await weatherService.fetchWeather()
                    }
                } label: {
                    Label("Refresh Weather", systemImage: "arrow.clockwise")
                }
            } header: {
                Text("Weather")
            }
            
            // Data Management
            Section {
                Button {
                    Task {
                        await apiClient.fetchScreens()
                        HapticFeedback.success()
                    }
                } label: {
                    Label("Sync Screens", systemImage: "arrow.triangle.2.circlepath")
                }
                
                Button(role: .destructive) {
                    ImageCacheManager.shared.clearCache()
                    HapticFeedback.success()
                } label: {
                    Label("Clear Image Cache", systemImage: "trash")
                }
            } header: {
                Text("Data")
            }
            
            // About
            Section {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Build")
                    Spacer()
                    Text("1")
                        .foregroundColor(.secondary)
                }
                
                Link(destination: URL(string: "https://github.com/jnegrete31/catfe-tv")!) {
                    HStack {
                        Text("GitHub Repository")
                        Spacer()
                        Image(systemName: "arrow.up.right.square")
                            .foregroundColor(.secondary)
                    }
                }
            } header: {
                Text("About")
            } footer: {
                Text("Catfé TV Digital Signage System\n© 2026 Catfé Santa Clarita")
            }
            
            // Save Button
            Section {
                Button {
                    saveSettings()
                } label: {
                    HStack {
                        Spacer()
                        if isSaving {
                            ProgressView()
                        } else {
                            Text("Save Settings")
                                .fontWeight(.semibold)
                        }
                        Spacer()
                    }
                }
                .disabled(isSaving)
            }
            
            // Logout Section
            Section {
                Button(role: .destructive) {
                    showingLogoutConfirmation = true
                } label: {
                    HStack {
                        Spacer()
                        Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                        Spacer()
                    }
                }
            }
        }
        .navigationTitle("Settings")
        .onAppear {
            loadSettings()
        }
        .alert("Settings Saved", isPresented: $showingSaveConfirmation) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your settings have been saved successfully.")
        }
        .alert("Sign Out", isPresented: $showingLogoutConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Sign Out", role: .destructive) {
                Task {
                    await authService.logout()
                }
            }
        } message: {
            Text("Are you sure you want to sign out?")
        }
    }
    
    // MARK: - Methods
    
    private func loadSettings() {
        locationName = apiClient.settings.locationName ?? "Catfé Santa Clarita"
        defaultDurationSeconds = apiClient.settings.defaultDurationSeconds
        snapAndPurrFrequency = apiClient.settings.snapAndPurrFrequency
        refreshIntervalSeconds = apiClient.settings.refreshIntervalSeconds
        transitionDuration = apiClient.settings.transitionDuration
    }
    
    private func saveSettings() {
        isSaving = true
        
        let newSettings = AppSettings(
            locationName: locationName,
            defaultDurationSeconds: defaultDurationSeconds,
            snapAndPurrFrequency: snapAndPurrFrequency,
            latitude: apiClient.settings.latitude,
            longitude: apiClient.settings.longitude,
            refreshIntervalSeconds: refreshIntervalSeconds,
            transitionDuration: transitionDuration,
            totalAdoptionCount: apiClient.settings.totalAdoptionCount,
            logoUrl: apiClient.settings.logoUrl
        )
        
        Task {
            do {
                try await apiClient.updateSettings(newSettings)
                HapticFeedback.success()
                showingSaveConfirmation = true
            } catch {
                HapticFeedback.error()
            }
            isSaving = false
        }
    }
}

// MARK: - Preview

#if DEBUG
struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            SettingsView()
                .environmentObject(APIClient.shared)
                .environmentObject(WeatherService.shared)
                .environmentObject(AuthService.shared)
        }
    }
}
#endif
