//
//  CheckInScreenView.swift
//  CatfeTVApp
//
//  Check-in screen - matches web CheckInScreen design
//

import SwiftUI

struct CheckInScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    var body: some View {
        ZStack {
            // Dark cosmic background
            LinearGradient(
                colors: [Color(hex: "1a1a2e"), Color(hex: "16213e"), Color(hex: "0f3460")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Animated circles and light rays
            AnimatedCirclesView(color: .cyan.opacity(0.1))
            LightRaysView(color: .cyan)
            
            VStack(spacing: 40) {
                // Header
                HStack(spacing: 0) {
                    Text("Welcome to ")
                        .font(CatfeTypography.largeTitle)
                        .foregroundColor(.white)
                    Text(settings.locationName ?? "Catfé")
                        .font(CatfeTypography.largeTitle)
                        .foregroundColor(.cyan)
                }
                .padding(.top, 60)
                
                // Main content: 3 glass cards
                HStack(alignment: .top, spacing: 50) {
                    // Column 1: Sign Waiver
                    VStack(spacing: 20) {
                        HStack(spacing: 8) {
                            Text("✍️")
                                .font(.system(size: 30))
                            Text("Sign Waiver")
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.white)
                        }
                        
                        Text("Please sign our waiver before entering the cat lounge.")
                            .font(CatfeTypography.body)
                            .foregroundColor(.white.opacity(0.8))
                            .multilineTextAlignment(.center)
                        
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            QRCodeView(url: qrURL, size: 220)
                        }
                    }
                    .padding(30)
                    .frame(maxWidth: .infinity)
                    .background(
                        RoundedRectangle(cornerRadius: 24)
                            .fill(Color.white.opacity(0.08))
                            .overlay(
                                RoundedRectangle(cornerRadius: 24)
                                    .stroke(Color.cyan.opacity(0.2), lineWidth: 1)
                            )
                    )
                    
                    // Column 2: Free WiFi
                    VStack(spacing: 20) {
                        HStack(spacing: 8) {
                            Text("📶")
                                .font(.system(size: 30))
                            Text("Free WiFi")
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.white)
                        }
                        
                        Spacer().frame(height: 20)
                        
                        // WiFi info from screen subtitle/body
                        VStack(spacing: 16) {
                            VStack(spacing: 4) {
                                Text("NETWORK")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.cyan.opacity(0.8))
                                    .tracking(1.5)
                                Text(screen.subtitle ?? "Catfé WiFi")
                                    .font(.system(size: 28, weight: .medium))
                                    .foregroundColor(.white)
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.white.opacity(0.1))
                            )
                            
                            VStack(spacing: 4) {
                                Text("PASSWORD")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.cyan.opacity(0.8))
                                    .tracking(1.5)
                                Text(screen.bodyText ?? "Ask staff")
                                    .font(.system(size: 28, weight: .medium))
                                    .foregroundColor(.white)
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.white.opacity(0.1))
                            )
                        }
                        
                        Spacer()
                    }
                    .padding(30)
                    .frame(maxWidth: .infinity)
                    .background(
                        RoundedRectangle(cornerRadius: 24)
                            .fill(Color.white.opacity(0.08))
                            .overlay(
                                RoundedRectangle(cornerRadius: 24)
                                    .stroke(Color.cyan.opacity(0.2), lineWidth: 1)
                            )
                    )
                    
                    // Column 3: House Rules
                    VStack(spacing: 20) {
                        HStack(spacing: 8) {
                            Text("📜")
                                .font(.system(size: 30))
                            Text("House Rules")
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.white)
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            let rules = [
                                "Be gentle with all cats",
                                "Wash hands before & after",
                                "No flash photography",
                                "Keep voices low",
                                "Don't pick up sleeping cats",
                                "Have fun & enjoy the purrs!"
                            ]
                            ForEach(Array(rules.enumerated()), id: \.offset) { index, rule in
                                HStack(alignment: .top, spacing: 8) {
                                    Text("\(index + 1).")
                                        .font(CatfeTypography.body)
                                        .foregroundColor(.cyan)
                                        .bold()
                                    Text(rule)
                                        .font(CatfeTypography.body)
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                        }
                        .padding(.horizontal, 8)
                    }
                    .padding(30)
                    .frame(maxWidth: .infinity)
                    .background(
                        RoundedRectangle(cornerRadius: 24)
                            .fill(Color.white.opacity(0.08))
                            .overlay(
                                RoundedRectangle(cornerRadius: 24)
                                    .stroke(Color.cyan.opacity(0.2), lineWidth: 1)
                            )
                    )
                }
                .padding(.horizontal, 60)
                
                Spacer()
                
                // Footer
                Text("Enjoy your visit and all the purrs! ✨")
                    .font(CatfeTypography.subtitle)
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.bottom, 40)
            }
        }
    }
}
