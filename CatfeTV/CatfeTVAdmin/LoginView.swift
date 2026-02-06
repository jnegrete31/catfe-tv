//
//  LoginView.swift
//  CatfeTVAdmin
//
//  Login screen for OAuth authentication
//

import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @EnvironmentObject var authService: AuthService
    @State private var isAuthenticating = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.catfeCream, Color.catfeBlush.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // Logo and title
                VStack(spacing: 20) {
                    Image(systemName: "cat.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.catfeTerracotta)
                    
                    Text("Catfé TV Admin")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(.catfeBrown)
                    
                    Text("Manage your digital signage")
                        .font(.system(size: 18, weight: .medium, design: .rounded))
                        .foregroundColor(.catfeBrown.opacity(0.7))
                }
                
                Spacer()
                
                // Login button
                VStack(spacing: 16) {
                    Button {
                        startAuthentication()
                    } label: {
                        HStack(spacing: 12) {
                            if isAuthenticating {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "person.crop.circle.badge.checkmark")
                                    .font(.title2)
                            }
                            Text(isAuthenticating ? "Signing in..." : "Sign in with Manus")
                                .font(.headline)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.catfeTerracotta)
                        .cornerRadius(12)
                    }
                    .disabled(isAuthenticating)
                    
                    Text("Sign in to create and manage screens")
                        .font(.caption)
                        .foregroundColor(.catfeBrown.opacity(0.6))
                }
                .padding(.horizontal, 40)
                
                Spacer()
                
                // Footer
                VStack(spacing: 8) {
                    Text("Catfé Santa Clarita")
                        .font(.caption)
                        .foregroundColor(.catfeBrown.opacity(0.5))
                    
                    Text("© 2026")
                        .font(.caption2)
                        .foregroundColor(.catfeBrown.opacity(0.3))
                }
                .padding(.bottom, 20)
            }
        }
        .alert("Sign In Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
    }
    
    private func startAuthentication() {
        isAuthenticating = true
        
        // Use ASWebAuthenticationSession for OAuth
        let callbackScheme = "catfetv"
        let authURL = buildAuthURL()
        
        let session = ASWebAuthenticationSession(
            url: authURL,
            callbackURLScheme: callbackScheme
        ) { callbackURL, error in
            isAuthenticating = false
            
            if let error = error {
                if (error as NSError).code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                    // User cancelled, no error to show
                    return
                }
                errorMessage = error.localizedDescription
                showError = true
                return
            }
            
            guard let callbackURL = callbackURL else {
                errorMessage = "No callback URL received"
                showError = true
                return
            }
            
            // Handle the callback
            Task {
                let success = await authService.handleCallback(url: callbackURL)
                if !success {
                    errorMessage = authService.error ?? "Authentication failed"
                    showError = true
                }
            }
        }
        
        session.presentationContextProvider = WebAuthSessionHandler.shared
        session.prefersEphemeralWebBrowserSession = false
        
        if !session.start() {
            isAuthenticating = false
            errorMessage = "Failed to start authentication"
            showError = true
        }
    }
    
    private func buildAuthURL() -> URL {
        // Use the direct Manus OAuth URL
        // This matches the web app's OAuth flow exactly
        let appId = "aMDMXCoQ2ycSYTjhkKKJzm"
        let baseURL = "https://catfetv-amdmxcoq.manus.space"
        let callbackPath = "/api/oauth/mobile-callback"
        let redirectUri = "\(baseURL)\(callbackPath)"
        
        // State is base64 encoded callback URL (same format as web)
        let state = Data(redirectUri.utf8).base64EncodedString()
        
        var components = URLComponents(string: "https://manus.im/app-auth")!
        components.queryItems = [
            URLQueryItem(name: "appId", value: appId),
            URLQueryItem(name: "redirectUri", value: redirectUri),
            URLQueryItem(name: "state", value: state),
            URLQueryItem(name: "type", value: "signIn")
        ]
        
        return components.url!
    }
}

// MARK: - Preview

#if DEBUG
struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
            .environmentObject(AuthService.shared)
    }
}
#endif
