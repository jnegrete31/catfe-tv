//
//  WeatherWidget.swift
//  CatfeTVApp
//
//  Weather and clock overlay widget
//

import SwiftUI

struct WeatherWidget: View {
    @EnvironmentObject var weatherService: WeatherService
    
    var body: some View {
        // TimelineView ensures the clock updates reliably every second,
        // even when SwiftUI re-evaluates the parent view hierarchy.
        TimelineView(.periodic(from: .now, by: 1)) { context in
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
                    Text(context.date.clockTime)
                        .font(CatfeTypography.clock)
                        .foregroundColor(.catfeBrown)
                    
                    HStack(spacing: 8) {
                        Text(context.date.clockPeriod)
                            .font(CatfeTypography.small)
                            .foregroundColor(.catfeBrown.opacity(0.7))
                        
                        Text(context.date.shortDate)
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
        }
    }
}

// MARK: - Compact Weather Widget (for smaller screens)

struct CompactWeatherWidget: View {
    @EnvironmentObject var weatherService: WeatherService
    
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
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
                
                Text(context.date, style: .time)
                    .font(CatfeTypography.caption)
                    .foregroundColor(.catfeBrown)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.white.opacity(0.85))
            .cornerRadius(12)
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
