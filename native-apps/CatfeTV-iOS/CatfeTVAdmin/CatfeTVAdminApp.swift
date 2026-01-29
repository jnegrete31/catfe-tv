import SwiftUI

@main
struct CatfeTVAdminApp: App {
    @StateObject private var viewModel = AdminViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
                .preferredColorScheme(.light)
        }
    }
}
