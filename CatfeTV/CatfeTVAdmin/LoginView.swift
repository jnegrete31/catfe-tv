//
//  LoginView.swift
//  CatfeTVAdmin
//
//  Login screen that opens the web admin dashboard
//

import SwiftUI

struct LoginView: View {
    @State private var showWebView = false
    
    private let adminURL = URL(string: "https://catfetv-amdmxcoq.manus.space/admin")!
    
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
                
                // Action buttons
                VStack(spacing: 16) {
                    // Open in app button
                    Button {
                        showWebView = true
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "rectangle.stack.fill")
                                .font(.title2)
                            Text("Open Admin Dashboard")
                                .font(.headline)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.catfeTerracotta)
                        .cornerRadius(12)
                    }
                    
                    // Open in Safari button
                    Button {
                        UIApplication.shared.open(adminURL)
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "safari")
                                .font(.title2)
                            Text("Open in Safari")
                                .font(.headline)
                        }
                        .foregroundColor(.catfeTerracotta)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.catfeTerracotta, lineWidth: 2)
                        )
                    }
                    
                    Text("Sign in with your Manus account to manage screens")
                        .font(.caption)
                        .foregroundColor(.catfeBrown.opacity(0.6))
                        .multilineTextAlignment(.center)
                    
                    // Add to home screen tip
                    HStack(spacing: 8) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.caption)
                        Text("Tip: Add to Home Screen from Safari for quick access")
                            .font(.caption2)
                    }
                    .foregroundColor(.catfeBrown.opacity(0.5))
                    .padding(.top, 8)
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
        .fullScreenCover(isPresented: $showWebView) {
            WebViewContainer(url: adminURL, isPresented: $showWebView)
        }
    }
}

// MARK: - Web View Container

import WebKit

struct WebViewContainer: View {
    let url: URL
    @Binding var isPresented: Bool
    
    var body: some View {
        NavigationView {
            WebView(url: url)
                .navigationTitle("Catfé TV Admin")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Done") {
                            isPresented = false
                        }
                    }
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button {
                            UIApplication.shared.open(url)
                        } label: {
                            Image(systemName: "safari")
                        }
                    }
                }
        }
    }
}

struct WebView: UIViewRepresentable {
    let url: URL
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default() // Persist cookies/login
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.allowsBackForwardNavigationGestures = true
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        webView.load(request)
    }
}

// MARK: - Preview

#if DEBUG
struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
    }
}
#endif
