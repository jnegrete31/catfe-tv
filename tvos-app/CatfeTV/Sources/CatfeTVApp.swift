import SwiftUI

@main
struct CatfeTVApp: App {
    @StateObject private var apiClient = APIClient()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(apiClient)
                .preferredColorScheme(.dark)
        }
    }
}
