//
//  WeatherWidget.swift
//  CatfeTVApp
//
//  Weather and clock overlay widget
//

import SwiftUI

struct WeatherWidget: View {
    @EnvironmentObject var weatherService: WeatherService
    @State private var currentTime = Date()
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        HStack(spacing: 20) {
            // Weather
            if let weather = weatherService.currentWeather {
                HStack(spacing: 12) {
                    Image(systemName: weather.conditionIcon)
                        .font(.system(size: 28))
                        .foregroundColor(.catfeTerracotta)
                    
                    Text(weather.temperatureString)
                        .font(CatfeTypography.subtitle)
                        .foregroundColor(.catfeBrown)
                    
                    Text(weather.condition)
                        .font(CatfeTypography.caption)
                        .foregroundColor(.catfeBrown.opacity(0.7))
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(Color.white.opacity(0.9))
                .cornerRadius(16)
                .shadow(color: .black.opacity(0.1), radius: 8)
            }
            
            // Clock
            VStack(alignment: .trailing, spacing: 2) {
                Text(currentTime.clockTime)
                    .font(CatfeTypography.clock)
                    .foregroundColor(.catfeBrown)
                
                HStack(spacing: 8) {
                    Text(currentTime.clockPeriod)
                        .font(CatfeTypography.small)
                        .foregroundColor(.catfeBrown.opacity(0.7))
                    
                    Text(currentTime.shortDate)
                        .font(CatfeTypography.small)
                        .foregroundColor(.catfeBrown.opacity(0.7))
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.white.opacity(0.9))
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.1), radius: 8)
        }
        .onReceive(timer) { time in
            currentTime = time
        }
    }
}

// MARK: - Compact Weather Widget (for smaller screens)

struct CompactWeatherWidget: View {
    @EnvironmentObject var weatherService: WeatherService
    @State private var currentTime = Date()
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        HStack(spacing: 16) {
            if let weather = weatherService.currentWeather {
                HStack(spacing: 8) {
                    Image(systemName: weather.conditionIcon)
                        .font(.system(size: 20))
                        .foregroundColor(.catfeTerracotta)
                    
                    Text(weather.temperatureString)
                        .font(CatfeTypography.caption)
                        .foregroundColor(.catfeBrown)
                }
            }
            
            Text(currentTime, style: .time)
                .font(CatfeTypography.caption)
                .foregroundColor(.catfeBrown)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color.white.opacity(0.85))
        .cornerRadius(12)
        .onReceive(timer) { time in
            currentTime = time
        }
    }
}

// MARK: - Preview

#if DEBUG
struct WeatherWidget_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.catfeCream
            WeatherWidget()
                .environmentObject(WeatherService.shared)
        }
    }
}
#endif
