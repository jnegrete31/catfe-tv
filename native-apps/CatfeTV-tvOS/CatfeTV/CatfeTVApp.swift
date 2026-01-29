import SwiftUI

@main
struct CatfeTVApp: App {
    @StateObject private var viewModel = TVDisplayViewModel()
    
    var body: some Scene {
        WindowGroup {
            TVDisplayView()
                .environmentObject(viewModel)
                .preferredColorScheme(.light)
        }
    }
}
