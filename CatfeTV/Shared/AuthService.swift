//
//  AuthService.swift
//  CatfeTV
//
//  OAuth authentication service for Manus backend
//

import Foundation
import AuthenticationServices

// MARK: - User Model

struct User: Codable, Identifiable {
    var id: String { openId }
    var openId: String
    var name: String
    var avatarUrl: String?
    var role: String
    
    var isAdmin: Bool {
        role == "admin"
    }
}

// MARK: - Auth Response Models

struct AuthMeResponse: Codable {
    var result: AuthMeResult
    
    struct AuthMeResult: Codable {
        var data: AuthMeData
        
        struct AuthMeData: Codable {
            var json: User?
        }
    }
}

struct LoginResponse: Codable {
    var token: String
    var user: User
}

// MARK: - Auth Service

@MainActor
class AuthService: ObservableObject {
    static let shared = AuthService()
    
    // Manus OAuth configuration
    private let baseURL = "https://catfetv-amdmxcoq.manus.space"
    private let oauthPortalURL = "https://manus.im/login"
    
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var error: String?
    @Published var authToken: String?
    
    private let tokenKey = "catfe_auth_token"
    
    private init() {
        // Load saved token on init
        loadSavedToken()
    }
    
    // MARK: - Token Management
    
    private func loadSavedToken() {
        if let token = UserDefaults.standard.string(forKey: tokenKey) {
            authToken = token
            // Verify token is still valid
            Task {
                await checkAuthStatus()
            }
        }
    }
    
    func saveToken(_ token: String) {
        authToken = token
        UserDefaults.standard.set(token, forKey: tokenKey)
    }
    
    func clearToken() {
        authToken = nil
        UserDefaults.standard.removeObject(forKey: tokenKey)
    }
    
    // MARK: - OAuth Flow
    
    var loginURL: URL {
        // Construct the OAuth login URL
        // The callback will redirect back to our app with a token
        var components = URLComponents(string: oauthPortalURL)!
        components.queryItems = [
            URLQueryItem(name: "app_id", value: "catfe-tv"),
            URLQueryItem(name: "redirect_uri", value: "\(baseURL)/api/oauth/callback"),
            URLQueryItem(name: "response_type", value: "code")
        ]
        return components.url!
    }
    
    // MARK: - Auth Status Check
    
    func checkAuthStatus() async {
        guard let token = authToken else {
            isAuthenticated = false
            currentUser = nil
            return
        }
        
        isLoading = true
        error = nil
        
        do {
            let url = URL(string: "\(baseURL)/api/trpc/auth.me")!
            var request = URLRequest(url: url)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                print("Auth check response: \(httpResponse.statusCode)")
                
                if httpResponse.statusCode == 200 {
                    let authResponse = try JSONDecoder().decode(AuthMeResponse.self, from: data)
                    if let user = authResponse.result.data.json {
                        currentUser = user
                        isAuthenticated = true
                    } else {
                        // No user in response means not authenticated
                        isAuthenticated = false
                        currentUser = nil
                        clearToken()
                    }
                } else {
                    // Token invalid or expired
                    isAuthenticated = false
                    currentUser = nil
                    clearToken()
                }
            }
        } catch {
            print("Auth check error: \(error)")
            self.error = error.localizedDescription
            isAuthenticated = false
            currentUser = nil
        }
        
        isLoading = false
    }
    
    // MARK: - Handle OAuth Callback
    
    func handleCallback(url: URL) async -> Bool {
        print("OAuth callback URL: \(url.absoluteString)")
        
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            error = "Invalid callback URL format"
            return false
        }
        
        // Check for error response first
        if let errorParam = components.queryItems?.first(where: { $0.name == "error" })?.value {
            print("OAuth error received: \(errorParam)")
            error = "Authentication failed: \(errorParam)"
            return false
        }
        
        // Look for the token
        guard let token = components.queryItems?.first(where: { $0.name == "token" })?.value else {
            print("No token found in callback URL")
            print("Query items: \(components.queryItems ?? [])")
            error = "No authentication token received"
            return false
        }
        
        print("Token received, saving and checking auth status")
        saveToken(token)
        await checkAuthStatus()
        return isAuthenticated
    }
    
    // MARK: - Logout
    
    func logout() async {
        isLoading = true
        
        // Call logout endpoint if we have a token
        if let token = authToken {
            do {
                let url = URL(string: "\(baseURL)/api/trpc/auth.logout")!
                var request = URLRequest(url: url)
                request.httpMethod = "POST"
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                request.httpBody = "{}".data(using: .utf8)
                
                let (_, _) = try await URLSession.shared.data(for: request)
            } catch {
                print("Logout error: \(error)")
            }
        }
        
        clearToken()
        currentUser = nil
        isAuthenticated = false
        isLoading = false
    }
}

// MARK: - Web Authentication Session Handler

#if os(iOS)
import UIKit

class WebAuthSessionHandler: NSObject, ASWebAuthenticationPresentationContextProviding {
    static let shared = WebAuthSessionHandler()
    
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = scene.windows.first else {
            return ASPresentationAnchor()
        }
        return window
    }
}
#endif
