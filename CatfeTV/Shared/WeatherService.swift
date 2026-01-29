//
//  WeatherService.swift
//  CatfeTV
//
//  Weather service for Santa Clarita, CA
//

import Foundation
import CoreLocation

@MainActor
class WeatherService: ObservableObject {
    static let shared = WeatherService()
    
    @Published var currentWeather: WeatherData?
    @Published var isLoading = false
    @Published var error: String?
    
    // Santa Clarita, CA coordinates
    private let defaultLatitude = 34.3917
    private let defaultLongitude = -118.5426
    
    private var lastFetchTime: Date?
    private let cacheValidityDuration: TimeInterval = 600 // 10 minutes
    
    private init() {}
    
    // MARK: - Fetch Weather
    
    func fetchWeather(latitude: Double? = nil, longitude: Double? = nil) async {
        let lat = latitude ?? defaultLatitude
        let lon = longitude ?? defaultLongitude
        
        // Check cache validity
        if let lastFetch = lastFetchTime,
           Date().timeIntervalSince(lastFetch) < cacheValidityDuration,
           currentWeather != nil {
            return
        }
        
        isLoading = true
        error = nil
        
        do {
            // Using Open-Meteo API (free, no API key required)
            let urlString = "https://api.open-meteo.com/v1/forecast?latitude=\(lat)&longitude=\(lon)&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles"
            
            guard let url = URL(string: urlString) else {
                throw APIError(message: "Invalid URL")
            }
            
            let (data, response) = try await URLSession.shared.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                throw APIError(message: "Failed to fetch weather")
            }
            
            let weatherResponse = try JSONDecoder().decode(OpenMeteoResponse.self, from: data)
            
            currentWeather = WeatherData(
                temperature: weatherResponse.current.temperature_2m,
                condition: weatherCodeToCondition(weatherResponse.current.weather_code),
                icon: weatherCodeToIcon(weatherResponse.current.weather_code),
                humidity: Int(weatherResponse.current.relative_humidity_2m),
                lastUpdated: Date()
            )
            
            lastFetchTime = Date()
            saveToCache()
            
        } catch {
            self.error = error.localizedDescription
            loadFromCache()
        }
        
        isLoading = false
    }
    
    // MARK: - Weather Code Conversion
    
    private func weatherCodeToCondition(_ code: Int) -> String {
        switch code {
        case 0: return "Clear"
        case 1, 2, 3: return "Partly Cloudy"
        case 45, 48: return "Foggy"
        case 51, 53, 55: return "Drizzle"
        case 56, 57: return "Freezing Drizzle"
        case 61, 63, 65: return "Rain"
        case 66, 67: return "Freezing Rain"
        case 71, 73, 75: return "Snow"
        case 77: return "Snow Grains"
        case 80, 81, 82: return "Rain Showers"
        case 85, 86: return "Snow Showers"
        case 95: return "Thunderstorm"
        case 96, 99: return "Thunderstorm with Hail"
        default: return "Clear"
        }
    }
    
    private func weatherCodeToIcon(_ code: Int) -> String {
        switch code {
        case 0: return "sun.max.fill"
        case 1, 2, 3: return "cloud.sun.fill"
        case 45, 48: return "cloud.fog.fill"
        case 51, 53, 55, 61, 63, 65, 80, 81, 82: return "cloud.rain.fill"
        case 56, 57, 66, 67: return "cloud.sleet.fill"
        case 71, 73, 75, 77, 85, 86: return "cloud.snow.fill"
        case 95, 96, 99: return "cloud.bolt.fill"
        default: return "sun.max.fill"
        }
    }
    
    // MARK: - Cache
    
    private var cacheURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("weather_cache.json")
    }
    
    private func saveToCache() {
        guard let weather = currentWeather else { return }
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(weather)
            try data.write(to: cacheURL)
        } catch {
            print("Failed to save weather cache: \(error)")
        }
    }
    
    private func loadFromCache() {
        do {
            let data = try Data(contentsOf: cacheURL)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            currentWeather = try decoder.decode(WeatherData.self, from: data)
        } catch {
            // Use fallback weather
            currentWeather = WeatherData(
                temperature: 72,
                condition: "Clear",
                icon: "sun.max.fill",
                humidity: 45,
                lastUpdated: Date()
            )
        }
    }
}

// MARK: - Open-Meteo Response Models

struct OpenMeteoResponse: Codable {
    let current: CurrentWeather
}

struct CurrentWeather: Codable {
    let temperature_2m: Double
    let relative_humidity_2m: Double
    let weather_code: Int
}
