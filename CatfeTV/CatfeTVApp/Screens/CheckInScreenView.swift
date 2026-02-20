//
//  CheckInScreenView.swift
//  CatfeTVApp
//
//  Check-In screen - matches web design, fills full TV
//

import SwiftUI

struct CheckInScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @State private var appeared = false
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                VStack(spacing: 30) {
                    // Header
                    HStack(spacing: 0) {
                        Text("Welcome to ")
                            .foregroundColor(.loungeCream)
                        Text(settings.locationName ?? "Catfé")
                            .foregroundColor(.loungeAmber)
                    }
                    .font(.system(size: 52, weight: .bold, design: .serif))
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    Spacer()
                    
                    // 3-column card layout
                    HStack(alignment: .top, spacing: 30) {
                        // Column 1: Sign Waiver
                        CheckInCard {
                            VStack(spacing: 20) {
                                Text("✍️").font(.system(size: 36))
                                Text("Sign Waiver")
                                    .font(.system(size: 24, weight: .semibold, design: .serif))
                                    .foregroundColor(.loungeCream)
                                
                                Text("Please sign our waiver before entering the cat lounge.")
                                    .font(CatfeTypography.caption)
                                    .foregroundColor(.loungeCream.opacity(0.7))
                                    .multilineTextAlignment(.center)
                                
                                // Use waiverUrl from settings, fall back to screen qrCodeURL
                                if let qrURL = settings.waiverUrl ?? screen.qrCodeURL, !qrURL.isEmpty {
                                    QRCodeView(url: qrURL, size: 180, label: screen.qrLabel)
                                } else {
                                    Text("Ask staff for waiver")
                                        .font(CatfeTypography.caption)
                                        .foregroundColor(.loungeCream.opacity(0.5))
                                        .italic()
                                }
                            }
                        }
                        
                        // Column 2: Free WiFi
                        CheckInCard {
                            VStack(spacing: 20) {
                                Text("📶").font(.system(size: 36))
                                Text("Free WiFi")
                                    .font(.system(size: 24, weight: .semibold, design: .serif))
                                    .foregroundColor(.loungeCream)
                                
                                VStack(spacing: 16) {
                                    // Use wifiName/wifiPassword from settings, fall back to screen fields
                                    WiFiInfoRow(label: "NETWORK", value: settings.wifiName ?? screen.subtitle ?? "Catfé WiFi")
                                    WiFiInfoRow(label: "PASSWORD", value: settings.wifiPassword ?? screen.bodyText ?? "Ask staff")
                                }
                            }
                        }
                        
                        // Column 3: House Rules
                        CheckInCard {
                            VStack(alignment: .leading, spacing: 16) {
                                HStack {
                                    Spacer()
                                    Text("📜").font(.system(size: 36))
                                    Spacer()
                                }
                                HStack {
                                    Spacer()
                                    Text("House Rules")
                                        .font(.system(size: 24, weight: .semibold, design: .serif))
                                        .foregroundColor(.loungeCream)
                                    Spacer()
                                }
                                
                                let rules = settings.houseRules ?? [
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
                                            .font(CatfeTypography.caption)
                                            .foregroundColor(.loungeAmber)
                                            .bold()
                                        Text(rule)
                                            .font(CatfeTypography.caption)
                                            .foregroundColor(.loungeCream.opacity(0.8))
                                    }
                                }
                            }
                        }
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                    
                    Spacer()
                    
                    // Footer
                    Text("Enjoy your visit and all the purrs! ✨")
                        .font(CatfeTypography.caption)
                        .foregroundColor(.loungeCream.opacity(0.5))
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}

private struct CheckInCard<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(30)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.white.opacity(0.06))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.loungeAmber.opacity(0.15), lineWidth: 1)
                    )
            )
    }
}

private struct WiFiInfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.loungeAmber.opacity(0.8))
                .tracking(1.5)
            Text(value)
                .font(.system(size: 22, weight: .medium))
                .foregroundColor(.loungeCream)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white.opacity(0.08))
        )
    }
}
