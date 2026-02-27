//
//  LogoScreenView.swift
//  CatfeTVApp
//
//  Logo screen - displays the Catfé logo from settings with warm gradient
//  background and subtle paw print accents. Matches the web app's LOGO screen type.
//
import SwiftUI

struct LogoScreenView: View {
    let screen: Screen
    let settings: AppSettings
    
    @State private var appeared = false
    @State private var pulseScale: CGFloat = 1.0
    
    /// Get logo URL from settings
    private var logoUrl: String? {
        settings.logoUrl
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                ZStack {
                    // Warm gradient background
                    LinearGradient(
                        colors: [
                            Color(hex: "2d1f0e"),
                            Color(hex: "1a1408"),
                            Color(hex: "0f0d08")
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    
                    // Ambient amber glow behind logo
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "DAA520").opacity(0.35), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.3
                            )
                        )
                        .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                        .position(x: geo.size.width * 0.5, y: geo.size.height * 0.4)
                        .scaleEffect(pulseScale)
                    
                    // Subtle paw prints
                    pawPrintAccents(geo: geo)
                    
                    // Main content
                    VStack(spacing: geo.size.height * 0.03) {
                        Spacer()
                        
                        // Logo
                        if let url = logoUrl, !url.isEmpty {
                            AsyncImage(url: URL(string: url)) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(maxWidth: geo.size.width * 0.4, maxHeight: geo.size.height * 0.45)
                                        .shadow(color: Color(hex: "DAA520").opacity(0.3), radius: 30, x: 0, y: 10)
                                case .failure:
                                    fallbackLogo(geo: geo)
                                default:
                                    ProgressView()
                                        .tint(.white)
                                        .frame(width: 60, height: 60)
                                }
                            }
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.8)
                            .animation(.spring(response: 0.8, dampingFraction: 0.7), value: appeared)
                        } else {
                            fallbackLogo(geo: geo)
                        }
                        
                        // Title / subtitle
                        if let subtitle = screen.subtitle, !subtitle.isEmpty {
                            Text(subtitle)
                                .font(.system(size: geo.size.height * 0.03, weight: .light, design: .serif))
                                .foregroundColor(.loungeCream.opacity(0.6))
                                .tracking(2)
                                .multilineTextAlignment(.center)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                        }
                        
                        Spacer()
                        
                        // Bottom tagline
                        Text("Santa Clarita's Cat Lounge")
                            .font(.system(size: geo.size.height * 0.02, weight: .medium))
                            .tracking(4)
                            .foregroundColor(.loungeCream.opacity(0.3))
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.6).delay(0.5), value: appeared)
                            .padding(.bottom, geo.size.height * 0.05)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
        }
        .onAppear {
            withAnimation(.easeIn(duration: 0.5)) {
                appeared = true
            }
            // Subtle breathing animation on the glow
            withAnimation(.easeInOut(duration: 3.0).repeatForever(autoreverses: true)) {
                pulseScale = 1.08
            }
        }
    }
    
    // MARK: - Fallback Logo
    
    private func fallbackLogo(geo: GeometryProxy) -> some View {
        VStack(spacing: geo.size.height * 0.02) {
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.12))
                .foregroundColor(Color(hex: "DAA520"))
            
            Text("Catfé")
                .font(.system(size: geo.size.height * 0.08, weight: .bold, design: .serif))
                .foregroundColor(.loungeCream)
        }
        .opacity(appeared ? 1 : 0)
        .scaleEffect(appeared ? 1 : 0.8)
        .animation(.spring(response: 0.8, dampingFraction: 0.7), value: appeared)
    }
    
    // MARK: - Paw Print Accents
    
    private func pawPrintAccents(geo: GeometryProxy) -> some View {
        ZStack {
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.06))
                .foregroundColor(.loungeCream.opacity(0.04))
                .rotationEffect(.degrees(-15))
                .position(x: geo.size.width * 0.12, y: geo.size.height * 0.2)
            
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.04))
                .foregroundColor(.loungeCream.opacity(0.03))
                .rotationEffect(.degrees(25))
                .position(x: geo.size.width * 0.88, y: geo.size.height * 0.15)
            
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.05))
                .foregroundColor(.loungeCream.opacity(0.03))
                .rotationEffect(.degrees(-30))
                .position(x: geo.size.width * 0.85, y: geo.size.height * 0.8)
            
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.035))
                .foregroundColor(.loungeCream.opacity(0.04))
                .rotationEffect(.degrees(10))
                .position(x: geo.size.width * 0.15, y: geo.size.height * 0.85)
        }
    }
}

#Preview {
    LogoScreenView(
        screen: Screen(
            type: .logo,
            title: "Catfé Logo",
            subtitle: "Where every visit saves a life",
            duration: 8
        ),
        settings: .default
    )
}
