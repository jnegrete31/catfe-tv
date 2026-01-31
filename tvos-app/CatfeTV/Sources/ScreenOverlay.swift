import SwiftUI

// Unified overlay component that appears on ALL screens in the same position
struct ScreenOverlay: View {
    let logoUrl: String?
    let weatherData: WeatherData?
    
    var body: some View {
        ZStack {
            // Logo in bottom-left corner
            VStack {
                Spacer()
                HStack {
                    CatfeLogo(logoUrl: logoUrl)
                        .padding(.leading, 60)
                        .padding(.bottom, 60)
                    Spacer()
                }
            }
            
            // Weather and time in top-right corner
            VStack {
                HStack {
                    Spacer()
                    WeatherClockOverlay(weatherData: weatherData)
                        .padding(.trailing, 60)
                        .padding(.top, 60)
                }
                Spacer()
            }
        }
    }
}

#Preview {
    ZStack {
        Color.blue
        ScreenOverlay(logoUrl: nil, weatherData: nil)
    }
}
