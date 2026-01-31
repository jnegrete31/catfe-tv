import SwiftUI
import WebKit

/// Simple WebView screen that loads the Catfé TV display URL
/// This approach ensures the tvOS app always shows the latest web content
/// without needing app updates for new features
struct WebViewScreen: View {
    // IMPORTANT: Update this URL to your published Catfé TV URL
    // For development, you can use the preview URL
    private let tvDisplayURL = "https://catfe-tv.manus.space/tv"
    
    @State private var isLoading = true
    @State private var hasError = false
    @State private var errorMessage = ""
    
    var body: some View {
        ZStack {
            // Background color while loading
            Color.black
                .ignoresSafeArea()
            
            // WebView
            TVWebView(
                urlString: tvDisplayURL,
                isLoading: $isLoading,
                hasError: $hasError,
                errorMessage: $errorMessage
            )
            .ignoresSafeArea()
            
            // Loading indicator
            if isLoading && !hasError {
                VStack(spacing: 20) {
                    ProgressView()
                        .scaleEffect(2)
                        .tint(.white)
                    
                    Text("Loading Catfé TV...")
                        .font(.title2)
                        .foregroundColor(.white.opacity(0.8))
                }
            }
            
            // Error state
            if hasError {
                VStack(spacing: 24) {
                    Image(systemName: "wifi.exclamationmark")
                        .font(.system(size: 60))
                        .foregroundColor(.orange)
                    
                    Text("Unable to Load")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(errorMessage)
                        .font(.body)
                        .foregroundColor(.white.opacity(0.7))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                    
                    Text("The app will automatically retry when connection is restored.")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.5))
                        .padding(.top, 8)
                }
            }
        }
    }
}

/// UIViewRepresentable wrapper for WKWebView on tvOS
struct TVWebView: UIViewRepresentable {
    let urlString: String
    @Binding var isLoading: Bool
    @Binding var hasError: Bool
    @Binding var errorMessage: String
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        
        // Enable JavaScript
        configuration.preferences.javaScriptEnabled = true
        
        // Allow inline media playback
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        
        // Disable scrolling for TV display
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        
        // Load the TV display URL
        if let url = URL(string: urlString) {
            let request = URLRequest(url: url)
            webView.load(request)
        }
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        // No updates needed - the WebView manages itself
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: TVWebView
        private var retryTimer: Timer?
        private var retryCount = 0
        private let maxRetries = 5
        
        init(_ parent: TVWebView) {
            self.parent = parent
        }
        
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.isLoading = true
                self.parent.hasError = false
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
                self.parent.hasError = false
                self.retryCount = 0
            }
            
            // Inject CSS to hide any browser-specific UI elements
            let hideControlsScript = """
                document.body.style.overflow = 'hidden';
                document.body.style.cursor = 'none';
            """
            webView.evaluateJavaScript(hideControlsScript, completionHandler: nil)
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            handleError(webView: webView, error: error)
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            handleError(webView: webView, error: error)
        }
        
        private func handleError(webView: WKWebView, error: Error) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
                self.parent.hasError = true
                self.parent.errorMessage = error.localizedDescription
            }
            
            // Auto-retry with exponential backoff
            if retryCount < maxRetries {
                retryCount += 1
                let delay = Double(retryCount * retryCount) * 2.0 // 2, 8, 18, 32, 50 seconds
                
                retryTimer?.invalidate()
                retryTimer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in
                    guard let self = self else { return }
                    if let url = URL(string: self.parent.urlString) {
                        let request = URLRequest(url: url)
                        webView.load(request)
                    }
                }
            }
        }
    }
}

#Preview {
    WebViewScreen()
}
