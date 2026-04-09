//
//  TabbyTokensScreenView.swift
//  CatfeTVApp
//
//  Tabby Tokens loyalty rewards program screen — Premium dark theme
//  2-column layout: How It Works | QR Code, centered title
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

// MARK: - Raining Token Model

private struct FallingToken: Identifiable {
    let id: Int
    let xPercent: CGFloat   // horizontal position as % of width
    let size: CGFloat       // token image size
    let duration: Double    // fall animation duration
    let delay: Double       // staggered start delay
}

private let fallingTokens: [FallingToken] = (0..<18).map { i in
    FallingToken(
        id: i,
        xPercent: CGFloat(i) * 5.5 + 1,
        size: CGFloat(28 + (i % 5) * 8),
        duration: Double(6 + (i % 4) * 2),
        delay: Double(i) * 0.8.truncatingRemainder(dividingBy: 8)
    )
}

// MARK: - Falling Token View

private struct FallingTokenView: View {
    let token: FallingToken
    let logoUrl: String
    let geoHeight: CGFloat
    
    @State private var falling = false
    
    var body: some View {
        AsyncImage(url: URL(string: logoUrl)) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
            default:
                Color.clear
            }
        }
        .frame(width: token.size, height: token.size)
        .opacity(0.15)
        .blur(radius: 0.5)
        .offset(y: falling ? geoHeight + 80 : -80)
        .rotationEffect(.degrees(falling ? 360 : 0))
        .onAppear {
            withAnimation(
                .linear(duration: token.duration)
                .delay(token.delay)
                .repeatForever(autoreverses: false)
            ) {
                falling = true
            }
        }
    }
}

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
                
                // Raining Tabby Tokens
                ForEach(fallingTokens) { token in
                    FallingTokenView(
                        token: token,
                        logoUrl: tokenLogoUrl,
                        geoHeight: geo.size.height
                    )
                    .position(
                        x: geo.size.width * token.xPercent / 100,
                        y: geo.size.height / 2
                    )
                }
                
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
                    // Header: Centered logo + Title
                    headerView(geo: geo)
                        .padding(.top, geo.size.height * 0.06)
                        .padding(.bottom, geo.size.height * 0.04)
                    
                    // 2-column layout: How It Works | QR Code
                    HStack(alignment: .center, spacing: geo.size.width * 0.06) {
                        // Column 1: How It Works
                        howItWorksColumn(geo: geo)
                            .frame(width: geo.size.width * 0.40)
                        
                        // Column 2: QR Code
                        qrCodeColumn(geo: geo)
                            .frame(width: geo.size.width * 0.35)
                    }
                    .padding(.horizontal, geo.size.width * 0.06)
                    
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
    
    // MARK: - Header (Centered)
    
    private func headerView(geo: GeometryProxy) -> some View {
        VStack(spacing: 12) {
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
            
            Text("Tabby Tokens")
                .font(.system(size: 64, weight: .bold, design: .serif))
                .foregroundColor(tokenCream)
            
            Text("Earn Rewards Every Visit")
                .font(.system(size: 24, weight: .medium, design: .serif))
                .foregroundColor(tokenAmber)
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -30)
        .animation(.easeOut(duration: 0.7), value: appeared)
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
