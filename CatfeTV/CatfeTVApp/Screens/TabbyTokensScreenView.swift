//
//  TabbyTokensScreenView.swift
//  CatfeTVApp
//
//  Tabby Tokens loyalty rewards program screen — Premium dark theme
//  Shows program overview, earning rates, how it works, and QR code
//  Matches the web TabbyTokensScreen component design
//

import SwiftUI

// MARK: - Theme Colors (amber/gold loyalty palette)

private let tokenBg = Color(hex: "1C1410")
private let tokenCream = Color(hex: "F5E6D3")
private let tokenAmber = Color(hex: "d97706")
private let tokenGold = Color(hex: "fbbf24")
private let tokenLightGold = Color(hex: "f59e0b")
private let tokenCopper = Color(hex: "C4956A")
private let tokenDarkCard = Color(hex: "2A1F18")

// MARK: - Data Models

private struct TokenRate {
    let name: String
    let duration: String
    let tokens: Int
}

private struct HowItWorksStep {
    let number: String
    let title: String
    let description: String
}

private let defaultRates: [TokenRate] = [
    TokenRate(name: "Quick Purr", duration: "15 min", tokens: 2),
    TokenRate(name: "Mini Meow", duration: "30 min", tokens: 5),
    TokenRate(name: "Full Purr", duration: "60 min", tokens: 10),
    TokenRate(name: "Events", duration: "Special", tokens: 15),
]

private let steps: [HowItWorksStep] = [
    HowItWorksStep(
        number: "1",
        title: "Visit & Check In",
        description: "Tokens are automatically added to your account every time you check in for a session."
    ),
    HowItWorksStep(
        number: "2",
        title: "Collect Tokens",
        description: "The longer your session, the more tokens you earn. Attend events for bonus tokens!"
    ),
    HowItWorksStep(
        number: "3",
        title: "Redeem Rewards",
        description: "Use your tokens for free visits, discounts on sessions, and exclusive Catfé perks."
    ),
]

// MARK: - Main View

struct TabbyTokensScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @State private var appeared = false
    
    private let tokenLogoUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663322973980/aMDMXCoQ2ycSYTjhkKKJzm/tabbytokenssparkle_835b9a0e.png"
    
    private var qrUrl: String {
        screen.qrCodeURL ?? "https://tv.catfe.la/rewards"
    }
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Dark background
                tokenBg.ignoresSafeArea()
                
                // Warm radial glows
                Circle()
                    .fill(RadialGradient(
                        colors: [tokenAmber.opacity(0.10), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.35
                    ))
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.15, y: geo.size.height * 0.1)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [tokenLightGold.opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.25
                    ))
                    .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                    .position(x: geo.size.width * 0.85, y: geo.size.height * 0.9)
                
                // Top accent bar
                VStack {
                    LinearGradient(
                        colors: [.clear, tokenAmber, tokenLightGold, tokenGold, tokenLightGold, tokenAmber, .clear],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(height: 3)
                    Spacer()
                }
                .ignoresSafeArea()
                
                // Bottom accent bar
                VStack {
                    Spacer()
                    LinearGradient(
                        colors: [.clear, tokenAmber, tokenLightGold, tokenGold, tokenLightGold, tokenAmber, .clear],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(height: 3)
                }
                .ignoresSafeArea()
                
                // Main content
                VStack(spacing: 0) {
                    // Header: Logo + Title + Tagline
                    headerView(geo: geo)
                        .padding(.top, geo.size.height * 0.06)
                        .padding(.bottom, 8)
                    
                    // Tagline
                    Text("Every visit earns you tokens. Collect them. Redeem them for free sessions, discounts, and more.")
                        .font(.system(size: 24, weight: .regular, design: .serif))
                        .foregroundColor(tokenCream.opacity(0.8))
                        .multilineTextAlignment(.leading)
                        .padding(.horizontal, geo.size.width * 0.06)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                        .padding(.bottom, geo.size.height * 0.04)
                    
                    // Three columns: How It Works | Earn Per Visit | QR Code
                    HStack(alignment: .top, spacing: geo.size.width * 0.03) {
                        // Column 1: How It Works
                        howItWorksColumn(geo: geo)
                            .frame(width: geo.size.width * 0.32)
                        
                        // Column 2: Earn Per Visit
                        earnPerVisitColumn(geo: geo)
                            .frame(width: geo.size.width * 0.32)
                        
                        // Column 3: QR Code
                        qrCodeColumn(geo: geo)
                            .frame(width: geo.size.width * 0.24)
                    }
                    .padding(.horizontal, geo.size.width * 0.04)
                    
                    Spacer(minLength: 16)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeIn(duration: 0.5)) {
                appeared = true
            }
        }
    }
    
    // MARK: - Header
    
    private func headerView(geo: GeometryProxy) -> some View {
        HStack(spacing: 20) {
            // Token logo
            AsyncImage(url: URL(string: tokenLogoUrl)) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                case .failure:
                    // Fallback coin icon
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [tokenGold, tokenAmber],
                                    startPoint: .topLeading, endPoint: .bottomTrailing
                                )
                            )
                        Text("🪙")
                            .font(.system(size: 50))
                    }
                default:
                    Circle()
                        .fill(tokenAmber.opacity(0.2))
                        .overlay(ProgressView().tint(tokenGold))
                }
            }
            .frame(width: 120, height: 120)
            .shadow(color: tokenGold.opacity(0.4), radius: 20, x: 0, y: 4)
            
            VStack(alignment: .leading, spacing: 6) {
                Text("Tabby Tokens")
                    .font(.system(size: 56, weight: .bold, design: .serif))
                    .foregroundColor(tokenCream)
                
                Text("Catfé's Loyalty Rewards Program")
                    .font(.system(size: 22, weight: .medium, design: .serif))
                    .foregroundColor(tokenAmber)
            }
            
            Spacer()
        }
        .padding(.horizontal, geo.size.width * 0.06)
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -20)
        .animation(.easeOut(duration: 0.7), value: appeared)
    }
    
    // MARK: - How It Works Column
    
    private func howItWorksColumn(geo: GeometryProxy) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("How It Works")
                .font(.system(size: 28, weight: .semibold, design: .serif))
                .foregroundColor(tokenGold)
                .opacity(appeared ? 1 : 0)
                .offset(x: appeared ? 0 : -20)
                .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                .padding(.bottom, 24)
            
            VStack(alignment: .leading, spacing: 24) {
                ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                    stepRow(step: step, index: index)
                }
            }
        }
    }
    
    private func stepRow(step: HowItWorksStep, index: Int) -> some View {
        HStack(alignment: .top, spacing: 16) {
            // Number circle
            ZStack {
                Circle()
                    .fill(tokenAmber.opacity(0.2))
                    .overlay(
                        Circle()
                            .stroke(tokenGold.opacity(0.3), lineWidth: 2)
                    )
                
                Text(step.number)
                    .font(.system(size: 22, weight: .bold, design: .default))
                    .foregroundColor(tokenGold)
            }
            .frame(width: 44, height: 44)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(step.title)
                    .font(.system(size: 20, weight: .semibold, design: .serif))
                    .foregroundColor(tokenCream)
                
                Text(step.description)
                    .font(.system(size: 15, weight: .regular, design: .serif))
                    .foregroundColor(tokenCopper.opacity(0.7))
                    .lineSpacing(3)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .opacity(appeared ? 1 : 0)
        .offset(x: appeared ? 0 : -30)
        .animation(.easeOut(duration: 0.5).delay(0.5 + Double(index) * 0.15), value: appeared)
    }
    
    // MARK: - Earn Per Visit Column
    
    private func earnPerVisitColumn(geo: GeometryProxy) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Earn Per Visit")
                .font(.system(size: 28, weight: .semibold, design: .serif))
                .foregroundColor(tokenGold)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : -20)
                .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                .padding(.bottom, 20)
            
            VStack(spacing: 14) {
                ForEach(Array(defaultRates.enumerated()), id: \.offset) { index, rate in
                    rateRow(rate: rate, index: index)
                }
            }
            
            // Redeem callout
            redeemCallout()
                .padding(.top, 20)
        }
    }
    
    private func rateRow(rate: TokenRate, index: Int) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(rate.name)
                    .font(.system(size: 20, weight: .semibold, design: .serif))
                    .foregroundColor(tokenCream)
                
                Text("\(rate.duration) session")
                    .font(.system(size: 13, weight: .regular, design: .default))
                    .foregroundColor(tokenCopper.opacity(0.5))
            }
            
            Spacer()
            
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text("\(rate.tokens)")
                    .font(.system(size: 34, weight: .bold, design: .serif))
                    .foregroundColor(tokenAmber)
                
                Text("tokens")
                    .font(.system(size: 13, weight: .regular, design: .default))
                    .foregroundColor(tokenCopper.opacity(0.5))
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(tokenAmber.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(tokenAmber.opacity(0.15), lineWidth: 1)
                )
        )
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 20)
        .animation(.easeOut(duration: 0.4).delay(0.6 + Double(index) * 0.1), value: appeared)
    }
    
    private func redeemCallout() -> some View {
        HStack {
            Spacer()
            Text("🎁 Redeem for free visits, discounts & exclusive perks!")
                .font(.system(size: 18, weight: .semibold, design: .serif))
                .foregroundColor(tokenGold)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [tokenAmber.opacity(0.18), tokenLightGold.opacity(0.08)],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(tokenGold.opacity(0.25), lineWidth: 1)
                )
        )
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(1.1), value: appeared)
    }
    
    // MARK: - QR Code Column
    
    private func qrCodeColumn(geo: GeometryProxy) -> some View {
        VStack(spacing: 0) {
            Spacer()
            
            VStack(spacing: 20) {
                Text("Check Your Balance")
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundColor(tokenCream)
                    .multilineTextAlignment(.center)
                
                // QR Code
                QRCodeView(url: qrUrl, size: 160, label: screen.qrLabel ?? "Scan to view your tokens, browse rewards, and redeem")
                
                // Green dot + "No app needed"
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color(hex: "22c55e"))
                        .frame(width: 8, height: 8)
                    
                    Text("No app needed — works on any phone")
                        .font(.system(size: 13, weight: .regular, design: .default))
                        .foregroundColor(tokenCopper.opacity(0.5))
                }
                .padding(.top, 4)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 32)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(tokenAmber.opacity(0.06))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(tokenAmber.opacity(0.12), lineWidth: 1)
                    )
            )
            .opacity(appeared ? 1 : 0)
            .scaleEffect(appeared ? 1 : 0.8)
            .animation(.easeOut(duration: 0.6).delay(0.7), value: appeared)
            
            Spacer()
        }
    }
}
