//
//  TabbyTokensScreenView.swift
//  CatfeTVApp
//
//  Tabby Tokens loyalty rewards program screen — Premium dark theme
//  3-column layout: Earn Rates | How It Works | QR Code
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

// MARK: - Data Models

private struct EarnRate {
    let tokens: Int
    let title: String
    let subtitle: String
    let bgOpacity: Double
    let borderOpacity: Double
}

private let earnRates: [EarnRate] = [
    EarnRate(tokens: 5, title: "Mini Meow", subtitle: "30-minute session", bgOpacity: 0.08, borderOpacity: 0.15),
    EarnRate(tokens: 10, title: "Full Purr", subtitle: "60-minute session", bgOpacity: 0.12, borderOpacity: 0.25),
    EarnRate(tokens: 15, title: "Events", subtitle: "Special event bonus", bgOpacity: 0.08, borderOpacity: 0.15),
]

private struct HowItWorksStep {
    let number: String
    let title: String
    let description: String
}

private let steps: [HowItWorksStep] = [
    HowItWorksStep(number: "1", title: "Check In", description: "Tokens added automatically"),
    HowItWorksStep(number: "2", title: "Collect", description: "Build your balance over time"),
    HowItWorksStep(number: "3", title: "Redeem", description: "Free visits, discounts & perks"),
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
                        colors: [tokenAmber.opacity(0.12), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.35
                    ))
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.15, y: geo.size.height * 0.1)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [tokenLightGold.opacity(0.10), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.25
                    ))
                    .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                    .position(x: geo.size.width * 0.85, y: geo.size.height * 0.9)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [tokenGold.opacity(0.04), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.2
                    ))
                    .frame(width: geo.size.width * 0.35, height: geo.size.width * 0.35)
                    .position(x: geo.size.width * 0.5, y: geo.size.height * 0.5)
                
                // Top accent bar
                VStack {
                    LinearGradient(
                        colors: [tokenAmber, tokenLightGold, tokenGold, tokenLightGold, tokenAmber],
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
                        colors: [tokenAmber, tokenLightGold, tokenGold, tokenLightGold, tokenAmber],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(height: 3)
                }
                .ignoresSafeArea()
                
                // Main content
                VStack(spacing: 0) {
                    // Header: Logo + Title
                    headerView(geo: geo)
                        .padding(.top, geo.size.height * 0.06)
                        .padding(.bottom, geo.size.height * 0.04)
                    
                    // 3-column layout
                    HStack(alignment: .top, spacing: geo.size.width * 0.03) {
                        // Column 1: Earn Rates
                        earnRatesColumn(geo: geo)
                            .frame(width: geo.size.width * 0.34)
                        
                        // Column 2: How It Works
                        howItWorksColumn(geo: geo)
                            .frame(width: geo.size.width * 0.26)
                        
                        // Column 3: QR Code
                        qrCodeColumn(geo: geo)
                            .frame(width: geo.size.width * 0.28)
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
            .frame(width: 140, height: 140)
            .shadow(color: tokenGold.opacity(0.4), radius: 20, x: 0, y: 4)
            
            VStack(alignment: .leading, spacing: 6) {
                Text("Tabby Tokens")
                    .font(.system(size: 60, weight: .bold, design: .serif))
                    .foregroundColor(tokenCream)
                
                Text("Earn Rewards Every Visit")
                    .font(.system(size: 24, weight: .medium, design: .serif))
                    .foregroundColor(tokenAmber)
            }
            
            Spacer()
        }
        .padding(.horizontal, geo.size.width * 0.06)
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -30)
        .animation(.easeOut(duration: 0.7), value: appeared)
    }
    
    // MARK: - Earn Rates Column
    
    private func earnRatesColumn(geo: GeometryProxy) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Earn Tokens")
                .font(.system(size: 30, weight: .semibold, design: .serif))
                .foregroundColor(tokenGold)
                .padding(.bottom, 20)
                .opacity(appeared ? 1 : 0)
                .offset(x: appeared ? 0 : -40)
                .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
            
            VStack(spacing: 16) {
                ForEach(Array(earnRates.enumerated()), id: \.offset) { index, rate in
                    earnRateRow(rate: rate, index: index)
                }
            }
        }
    }
    
    private func earnRateRow(rate: EarnRate, index: Int) -> some View {
        HStack(spacing: 20) {
            // Big token number
            Text("\(rate.tokens)")
                .font(.system(size: 48, weight: .bold, design: .serif))
                .foregroundColor(tokenGold)
                .frame(minWidth: 70)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(rate.title)
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundColor(tokenCream)
                
                Text(rate.subtitle)
                    .font(.system(size: 16, weight: .regular, design: .default))
                    .foregroundColor(tokenCopper.opacity(0.6))
            }
            
            Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 18)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(tokenAmber.opacity(rate.bgOpacity))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(tokenGold.opacity(rate.borderOpacity), lineWidth: 1)
                )
        )
        .opacity(appeared ? 1 : 0)
        .offset(x: appeared ? 0 : -40)
        .animation(.easeOut(duration: 0.5).delay(0.3 + Double(index) * 0.12), value: appeared)
    }
    
    // MARK: - How It Works Column
    
    private func howItWorksColumn(geo: GeometryProxy) -> some View {
        VStack(spacing: 0) {
            Text("How It Works")
                .font(.system(size: 30, weight: .semibold, design: .serif))
                .foregroundColor(tokenGold)
                .padding(.bottom, 20)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
            
            VStack(spacing: 12) {
                ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                    // Step card
                    VStack(spacing: 8) {
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
                        
                        Text(step.title)
                            .font(.system(size: 22, weight: .semibold, design: .serif))
                            .foregroundColor(tokenCream)
                        
                        Text(step.description)
                            .font(.system(size: 14, weight: .regular, design: .default))
                            .foregroundColor(tokenCopper.opacity(0.5))
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 18)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(tokenAmber.opacity(0.06))
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(tokenGold.opacity(0.1), lineWidth: 1)
                            )
                    )
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.5).delay(0.5 + Double(index) * 0.15), value: appeared)
                    
                    // Arrow between steps
                    if index < steps.count - 1 {
                        Text("▼")
                            .font(.system(size: 20))
                            .foregroundColor(tokenGold.opacity(0.4))
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.3).delay(0.6 + Double(index) * 0.15), value: appeared)
                    }
                }
            }
        }
    }
    
    // MARK: - QR Code Column
    
    private func qrCodeColumn(geo: GeometryProxy) -> some View {
        VStack(spacing: 0) {
            Spacer()
            
            VStack(spacing: 20) {
                Text("Scan to Start")
                    .font(.system(size: 24, weight: .semibold, design: .serif))
                    .foregroundColor(tokenCream)
                    .multilineTextAlignment(.center)
                
                // QR Code
                QRCodeView(url: qrUrl, size: 180, label: screen.qrLabel ?? "View your tokens & redeem rewards")
                
                // Green dot + "No app needed"
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color(hex: "22c55e"))
                        .frame(width: 8, height: 8)
                    
                    Text("No app needed")
                        .font(.system(size: 14, weight: .regular, design: .default))
                        .foregroundColor(tokenCopper.opacity(0.5))
                }
                .padding(.top, 4)
            }
            .padding(.horizontal, 28)
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
