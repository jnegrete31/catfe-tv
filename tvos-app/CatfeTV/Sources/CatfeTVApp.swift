import SwiftUI
import UIKit

@main
struct CatfeTVApp: App {
    @StateObject private var apiClient = APIClient()
    
    init() {
        // Disable idle timer to prevent Apple TV from going to screensaver/wallpaper
        UIApplication.shared.isIdleTimerDisabled = true
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(apiClient)
                .preferredColorScheme(.dark)
                .onAppear {
                    // Ensure idle timer stays disabled when app appears
                    UIApplication.shared.isIdleTimerDisabled = true
                }
        }
    }
}
