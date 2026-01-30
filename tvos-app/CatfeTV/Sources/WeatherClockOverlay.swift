import SwiftUI

struct WeatherClockOverlay: View {
    @State private var currentTime = Date()
    @State private var weather: WeatherData?
    @State private var isLoadingWeather = false
    
    // Santa Clarita, CA coordinates
    private let latitude = 34.3917
    private let longitude = -118.5426
    
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        VStack(alignment: .trailing, spacing: 12) {
            // Time
            Text(timeString)
                .font(.system(size: 48, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            // Date
            Text(dateString)
                .font(.system(size: 24, weight: .medium))
                .foregroundColor(.white.opacity(0.9))
            
            // Weather
            if let weather = weather {
                HStack(spacing: 12) {
                    Image(systemName: weather.icon)
                        .font(.system(size: 32))
                    
                    Text("\(weather.temperature)°F")
                        .font(.system(size: 32, weight: .medium))
                }
                .foregroundColor(.white)
            }
        }
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
                .opacity(0.8)
        )
        .onReceive(timer) { _ in
            currentTime = Date()
        }
        .task {
            await fetchWeather()
        }
        .onAppear {
            // Refresh weather every 10 minutes
            Timer.scheduledTimer(withTimeInterval: 600, repeats: true) { _ in
                Task {
                    await fetchWeather()
                }
            }
        }
    }
    
    private var timeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: currentTime)
    }
    
    private var dateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: currentTime)
    }
    
    private func fetchWeather() async {
        guard !isLoadingWeather else { return }
        isLoadingWeather = true
        
        let urlString = "https://api.open-meteo.com/v1/forecast?latitude=\(latitude)&longitude=\(longitude)&current=temperature_2m,weather_code&temperature_unit=fahrenheit"
        
        guard let url = URL(string: urlString) else {
            isLoadingWeather = false
            return
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(OpenMeteoResponse.self, from: data)
            
            let temp = Int(response.current.temperature_2m)
            let icon = weatherIcon(for: response.current.weather_code)
            
            await MainActor.run {
                self.weather = WeatherData(temperature: temp, icon: icon)
            }
        } catch {
            print("Weather fetch error: \(error)")
        }
        
        isLoadingWeather = false
    }
    
    private func weatherIcon(for code: Int) -> String {
        switch code {
        case 0:
            return "sun.max.fill"
        case 1, 2, 3:
            return "cloud.sun.fill"
        case 45, 48:
            return "cloud.fog.fill"
        case 51, 53, 55, 56, 57:
            return "cloud.drizzle.fill"
        case 61, 63, 65, 66, 67:
            return "cloud.rain.fill"
        case 71, 73, 75, 77:
            return "cloud.snow.fill"
        case 80, 81, 82:
            return "cloud.heavyrain.fill"
        case 85, 86:
            return "cloud.snow.fill"
        case 95, 96, 99:
            return "cloud.bolt.rain.fill"
        default:
            return "cloud.fill"
        }
    }
}

// MARK: - Weather Models
struct WeatherData {
    let temperature: Int
    let icon: String
}

struct OpenMeteoResponse: Codable {
    let current: OpenMeteoCurrent
}

struct OpenMeteoCurrent: Codable {
    let temperature_2m: Double
    let weather_code: Int
}

#Preview {
    ZStack {
        Color.black
        WeatherClockOverlay()
    }
}
