//
//  CatfeTVAdminApp.swift
//  CatfeTVAdmin
//
//  iOS Admin app for Catfé TV - opens web admin dashboard
//

import SwiftUI

@main
struct CatfeTVAdminApp: App {
    var body: some Scene {
        WindowGroup {
            LoginView()
                .preferredColorScheme(.light)
        }
    }
}
