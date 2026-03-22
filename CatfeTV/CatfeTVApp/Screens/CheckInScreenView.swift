//
//  CheckInScreenView.swift
//  CatfeTVApp
//
//  Check-In screen - premium dark theme matching adoption grid & membership.
//  Three-column layout: Sign Waiver, Free WiFi, House Rules.
//

import SwiftUI

struct CheckInScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @State private var appeared = false
    
    // MARK: - Data
    
    private var wifiNetwork: String {
        settings.wifiName ?? screen.subtitle ?? "Catfé WiFi"
    }
    
    private var wifiPass: String {
        settings.wifiPassword ?? screen.bodyText ?? "Ask staff"
    }
    
    private var rules: [String] {
        settings.houseRules ?? [
            "Be gentle with all cats",
            "Wash hands before & after",
            "No flash photography",
            "Keep voices low",
            "Don't pick up sleeping cats",
            "Have fun & enjoy the purrs!"
        ]
    }
    
    private var waiverURL: String? {
        settings.waiverUrl ?? screen.qrCodeURL
    }
    
    // MARK: - Theme Colors
    private let bgColor = Color(hex: "1C1410")
    private let creamColor = Color(hex: "F5E6D3")
    private let copperColor = Color(hex: "C4956A")
    private let bronzeColor = Color(hex: "B87333")
    private let goldColor = Color(hex: "D4A574")
    private let cardBgColor = Color(hex: "261E16")
    private let cardBgDark = Color(hex: "1E1610")
    
    var body: some View {
        ZStack {
            // Dark premium background
            bgColor.ignoresSafeArea()
            
            // Warm radial glows
            GeometryReader { geo in
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "8B5E3C").opacity(0.12), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.4
                    ))
                    .frame(width: geo.size.width * 0.8, height: geo.size.width * 0.8)
                    .position(x: geo.size.width * 0.5, y: 0)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [copperColor.opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.15, y: geo.size.height * 0.85)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [bronzeColor.opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.85, y: geo.size.height * 0.85)
            }
            
            // Top accent line
            VStack {
                LinearGradient(
                    colors: [.clear, copperColor, bronzeColor, goldColor, .clear],
                    startPoint: .leading, endPoint: .trailing
                )
                .frame(height: 2)
                Spacer()
            }
            .ignoresSafeArea()
            
            // Content
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 10) {
                    Text("🐾")
                        .font(.system(size: 44))
                    
                    HStack(spacing: 0) {
                        Text("Welcome to ")
                            .foregroundColor(creamColor)
                        Text(settings.locationName ?? "Catfé")
                            .foregroundColor(copperColor)
                    }
                    .font(.system(size: 52, weight: .bold, design: .serif))
                    
                    // Decorative divider
                    HStack(spacing: 12) {
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [.clear, copperColor],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .frame(width: 60, height: 1)
                        Text("✦")
                            .font(.system(size: 10))
                            .foregroundColor(copperColor)
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [copperColor, .clear],
                                    startPoint: .leading, endPoint: .trailing
                                )
                            )
                            .frame(width: 60, height: 1)
                    }
                    
                    Text("Please review before entering the lounge")
                        .font(.system(size: 20, weight: .regular, design: .serif))
                        .foregroundColor(creamColor.opacity(0.5))
                }
                .padding(.top, 70)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6), value: appeared)
                
                Spacer().frame(height: 40)
                
                // 3-column card layout
                HStack(alignment: .top, spacing: 36) {
                    
                    // Column 1: Sign Waiver
                    VStack(spacing: 20) {
                        Text("✍️")
                            .font(.system(size: 40))
                        
                        Text("Sign Waiver")
                            .font(.system(size: 26, weight: .bold, design: .serif))
                            .foregroundColor(creamColor)
                        
                        // Mini flourish
                        HStack(spacing: 6) {
                            Rectangle()
                                .fill(copperColor.opacity(0.3))
                                .frame(width: 20, height: 1)
                            Text("✦")
                                .font(.system(size: 7))
                                .foregroundColor(copperColor)
                            Rectangle()
                                .fill(copperColor.opacity(0.3))
                                .frame(width: 20, height: 1)
                        }
                        
                        Text("Please sign our waiver\nbefore entering the lounge")
                            .font(.system(size: 17, weight: .regular, design: .serif))
                            .foregroundColor(creamColor.opacity(0.6))
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                        
                        Spacer().frame(height: 4)
                        
                        if let qrURL = waiverURL, !qrURL.isEmpty {
                            QRCodeView(url: qrURL, size: 150, label: screen.qrLabel ?? "Scan to sign")
                        } else {
                            VStack(spacing: 8) {
                                Image(systemName: "doc.text")
                                    .font(.system(size: 32))
                                    .foregroundColor(copperColor.opacity(0.5))
                                Text("Ask staff for waiver")
                                    .font(.system(size: 17, weight: .medium, design: .serif))
                                    .foregroundColor(creamColor.opacity(0.4))
                                    .italic()
                            }
                            .padding(.top, 12)
                        }
                    }
                    .padding(32)
                    .frame(maxWidth: .infinity)
                    .frame(height: 470)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(
                                LinearGradient(
                                    colors: [cardBgColor, cardBgDark],
                                    startPoint: .topLeading, endPoint: .bottomTrailing
                                )
                            )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(copperColor.opacity(0.2), lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.5).delay(0.15), value: appeared)
                    
                    // Column 2: Free WiFi
                    VStack(spacing: 20) {
                        Text("📶")
                            .font(.system(size: 40))
                        
                        Text("Free WiFi")
                            .font(.system(size: 26, weight: .bold, design: .serif))
                            .foregroundColor(creamColor)
                        
                        // Mini flourish
                        HStack(spacing: 6) {
                            Rectangle()
                                .fill(copperColor.opacity(0.3))
                                .frame(width: 20, height: 1)
                            Text("✦")
                                .font(.system(size: 7))
                                .foregroundColor(copperColor)
                            Rectangle()
                                .fill(copperColor.opacity(0.3))
                                .frame(width: 20, height: 1)
                        }
                        
                        Spacer().frame(height: 4)
                        
                        // Network name
                        VStack(spacing: 6) {
                            Text("NETWORK")
                                .font(.system(size: 13, weight: .semibold, design: .serif))
                                .foregroundColor(copperColor.opacity(0.8))
                                .tracking(3)
                            Text(wifiNetwork)
                                .font(.system(size: 24, weight: .semibold, design: .serif))
                                .foregroundColor(creamColor)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 16)
                        .frame(maxWidth: .infinity)
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(Color(hex: "8B5E3C").opacity(0.12))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14)
                                        .stroke(copperColor.opacity(0.15), lineWidth: 1)
                                )
                        )
                        
                        // Password
                        VStack(spacing: 6) {
                            Text("PASSWORD")
                                .font(.system(size: 13, weight: .semibold, design: .serif))
                                .foregroundColor(copperColor.opacity(0.8))
                                .tracking(3)
                            Text(wifiPass)
                                .font(.system(size: 24, weight: .semibold, design: .serif))
                                .foregroundColor(creamColor)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 16)
                        .frame(maxWidth: .infinity)
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(Color(hex: "8B5E3C").opacity(0.12))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14)
                                        .stroke(copperColor.opacity(0.15), lineWidth: 1)
                                )
                        )
                        
                        Spacer()
                    }
                    .padding(32)
                    .frame(maxWidth: .infinity)
                    .frame(height: 470)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(
                                LinearGradient(
                                    colors: [cardBgColor, cardBgDark],
                                    startPoint: .topLeading, endPoint: .bottomTrailing
                                )
                            )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(copperColor.opacity(0.2), lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                    
                    // Column 3: House Rules
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Spacer()
                            Text("📜")
                                .font(.system(size: 40))
                            Spacer()
                        }
                        
                        HStack {
                            Spacer()
                            Text("House Rules")
                                .font(.system(size: 26, weight: .bold, design: .serif))
                                .foregroundColor(creamColor)
                            Spacer()
                        }
                        
                        // Mini flourish
                        HStack {
                            Spacer()
                            HStack(spacing: 6) {
                                Rectangle()
                                    .fill(copperColor.opacity(0.3))
                                    .frame(width: 20, height: 1)
                                Text("✦")
                                    .font(.system(size: 7))
                                    .foregroundColor(copperColor)
                                Rectangle()
                                    .fill(copperColor.opacity(0.3))
                                    .frame(width: 20, height: 1)
                            }
                            Spacer()
                        }
                        
                        Spacer().frame(height: 2)
                        
                        ForEach(Array(rules.prefix(6).enumerated()), id: \.offset) { index, rule in
                            HStack(alignment: .top, spacing: 12) {
                                Text("\(index + 1).")
                                    .font(.system(size: 18, weight: .bold, design: .serif))
                                    .foregroundColor(copperColor)
                                    .frame(width: 26, alignment: .trailing)
                                Text(rule)
                                    .font(.system(size: 18, weight: .regular, design: .serif))
                                    .foregroundColor(creamColor.opacity(0.75))
                                    .lineSpacing(2)
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(32)
                    .frame(maxWidth: .infinity)
                    .frame(height: 470)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(
                                LinearGradient(
                                    colors: [cardBgColor, cardBgDark],
                                    startPoint: .topLeading, endPoint: .bottomTrailing
                                )
                            )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(copperColor.opacity(0.2), lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.5).delay(0.45), value: appeared)
                }
                .padding(.horizontal, 70)
                
                Spacer().frame(height: 30)
                
                // Footer
                Text("Enjoy your visit and all the purrs! ✨")
                    .font(.system(size: 18, weight: .regular, design: .serif))
                    .foregroundColor(creamColor.opacity(0.3))
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.6), value: appeared)
                
                Spacer().frame(height: 50)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}
