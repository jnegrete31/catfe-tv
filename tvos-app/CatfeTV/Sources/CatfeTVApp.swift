import SwiftUI
import UIKit

@main
struct CatfeTVApp: App {
    init() {
        // Disable idle timer to prevent Apple TV from going to screensaver/wallpaper
        UIApplication.shared.isIdleTimerDisabled = true
    }
    
    var body: some Scene {
        WindowGroup {
            WebViewScreen()
                .preferredColorScheme(.dark)
                .ignoresSafeArea()
                .onAppear {
                    // Ensure idle timer stays disabled when app appears
                    UIApplication.shared.isIdleTimerDisabled = true
                }
        }
    }
}
