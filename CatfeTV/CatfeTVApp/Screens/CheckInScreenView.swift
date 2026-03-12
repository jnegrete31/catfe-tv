//
//  CheckInScreenView.swift
//  CatfeTVApp
//
//  Check-In screen - redesigned for tvOS with robust layout
//

import SwiftUI

struct CheckInScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @State private var appeared = false
    
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
    
    var body: some View {
        ZStack {
            // Background
            LoungeBackground()
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header area
                VStack(spacing: 12) {
                    Text("🐾")
                        .font(.system(size: 50))
                    
                    HStack(spacing: 0) {
                        Text("Welcome to ")
                            .foregroundColor(.loungeCream)
                        Text(settings.locationName ?? "Catfé")
                            .foregroundColor(.loungeAmber)
                    }
                    .font(.system(size: 56, weight: .bold, design: .serif))
                    
                    Text("Please review before entering the lounge")
                        .font(.system(size: 22, weight: .regular))
                        .foregroundColor(.loungeCream.opacity(0.6))
                }
                .padding(.top, 80)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6), value: appeared)
                
                Spacer().frame(height: 50)
                
                // 3-column card layout with fixed heights
                HStack(alignment: .top, spacing: 40) {
                    
                    // Column 1: Sign Waiver
                    VStack(spacing: 24) {
                        Text("✍️")
                            .font(.system(size: 44))
                        
                        Text("Sign Waiver")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundColor(.loungeCream)
                        
                        Text("Please sign our waiver\nbefore entering the lounge")
                            .font(.system(size: 18, weight: .regular))
                            .foregroundColor(.loungeCream.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                        
                        Spacer().frame(height: 8)
                        
                        if let qrURL = waiverURL, !qrURL.isEmpty {
                            QRCodeView(url: qrURL, size: 160, label: screen.qrLabel ?? "Scan to sign")
                        } else {
                            VStack(spacing: 8) {
                                Image(systemName: "doc.text")
                                    .font(.system(size: 36))
                                    .foregroundColor(.loungeAmber.opacity(0.5))
                                Text("Ask staff for waiver")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(.loungeCream.opacity(0.5))
                                    .italic()
                            }
                            .padding(.top, 16)
                        }
                    }
                    .padding(36)
                    .frame(maxWidth: .infinity)
                    .frame(height: 480)
                    .background(
                        RoundedRectangle(cornerRadius: 24)
                            .fill(Color.white.opacity(0.06))
                            .overlay(
                                RoundedRectangle(cornerRadius: 24)
                                    .stroke(Color.loungeAmber.opacity(0.15), lineWidth: 1)
                            )
                    )
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.5).delay(0.15), value: appeared)
                    
                    // Column 2: Free WiFi
                    VStack(spacing: 24) {
                        Text("📶")
                            .font(.system(size: 44))
                        
                        Text("Free WiFi")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundColor(.loungeCream)
                        
                        Spacer().frame(height: 8)
                        
                        // Network name
                        VStack(spacing: 6) {
                            Text("NETWORK")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.loungeAmber.opacity(0.8))
                                .tracking(2)
                            Text(wifiNetwork)
                                .font(.system(size: 26, weight: .semibold))
                                .foregroundColor(.loungeCream)
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 18)
                        .frame(maxWidth: .infinity)
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(Color.white.opacity(0.08))
                        )
                        
                        // Password
                        VStack(spacing: 6) {
                            Text("PASSWORD")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.loungeAmber.opacity(0.8))
                                .tracking(2)
                            Text(wifiPass)
                                .font(.system(size: 26, weight: .semibold))
                                .foregroundColor(.loungeCream)
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 18)
                        .frame(maxWidth: .infinity)
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(Color.white.opacity(0.08))
                        )
                        
                        Spacer()
                    }
                    .padding(36)
                    .frame(maxWidth: .infinity)
                    .frame(height: 480)
                    .background(
                        RoundedRectangle(cornerRadius: 24)
                            .fill(Color.white.opacity(0.06))
                            .overlay(
                                RoundedRectangle(cornerRadius: 24)
                                    .stroke(Color.loungeAmber.opacity(0.15), lineWidth: 1)
                            )
                    )
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                    
                    // Column 3: House Rules
                    VStack(alignment: .leading, spacing: 20) {
                        HStack {
                            Spacer()
                            Text("📜")
                                .font(.system(size: 44))
                            Spacer()
                        }
                        
                        HStack {
                            Spacer()
                            Text("House Rules")
                                .font(.system(size: 28, weight: .bold, design: .serif))
                                .foregroundColor(.loungeCream)
                            Spacer()
                        }
                        
                        Spacer().frame(height: 4)
                        
                        ForEach(Array(rules.prefix(6).enumerated()), id: \.offset) { index, rule in
                            HStack(alignment: .top, spacing: 12) {
                                Text("\(index + 1).")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.loungeAmber)
                                    .frame(width: 28, alignment: .trailing)
                                Text(rule)
                                    .font(.system(size: 20, weight: .regular))
                                    .foregroundColor(.loungeCream.opacity(0.85))
                                    .lineSpacing(2)
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(36)
                    .frame(maxWidth: .infinity)
                    .frame(height: 480)
                    .background(
                        RoundedRectangle(cornerRadius: 24)
                            .fill(Color.white.opacity(0.06))
                            .overlay(
                                RoundedRectangle(cornerRadius: 24)
                                    .stroke(Color.loungeAmber.opacity(0.15), lineWidth: 1)
                            )
                    )
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.5).delay(0.45), value: appeared)
                }
                .padding(.horizontal, 80)
                
                Spacer().frame(height: 40)
                
                // Footer
                Text("Enjoy your visit and all the purrs! ✨")
                    .font(.system(size: 20, weight: .regular))
                    .foregroundColor(.loungeCream.opacity(0.4))
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.6), value: appeared)
                
                Spacer().frame(height: 60)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}
