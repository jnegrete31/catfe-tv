//
//  MembershipScreenView.swift
//  CatfeTVApp
//
//  Membership screen - Three-tier showcase with styled text names
//  Matches web design: dark premium theme with ornate typography
//

import SwiftUI

// MARK: - Membership Tier Data

private struct MembershipTier {
    let name: String
    let displayLines: [String]  // Multi-line styled name
    let price: String
    let perks: [String]
    let accent: Color
    let accentFaded: Color
    let isFeatured: Bool
    
    init(name: String, displayLines: [String], price: String, perks: [String],
         accent: Color, isFeatured: Bool = false) {
        self.name = name
        self.displayLines = displayLines
        self.price = price
        self.perks = perks
        self.accent = accent
        self.accentFaded = accent.opacity(0.6)
        self.isFeatured = isFeatured
    }
}

private let membershipTiers: [MembershipTier] = [
    MembershipTier(
        name: "The Curious Cat",
        displayLines: ["The", "Curious", "Cat"],
        price: "$60",
        perks: [
            "Four 30-minute lounge visits per month",
            "10% off at Guanatos Tacos (same-day check-in)"
        ],
        accent: Color(hex: "C4956A")
    ),
    MembershipTier(
        name: "The Neighborhood Cat",
        displayLines: ["The", "Neighborhood", "Cat"],
        price: "$70",
        perks: [
            "2 × 30-minute visits",
            "2 × 60-minute visits",
            "10% off at Guanatos Tacos (same-day check-in)",
            "1 guided cat treat per visit"
        ],
        accent: Color(hex: "B87333"),
        isFeatured: true
    ),
    MembershipTier(
        name: "Catfé+",
        displayLines: ["Catfé+"],
        price: "$85",
        perks: [
            "3 × 60-minute visits",
            "3 × 30-minute visits",
            "10% off at Guanatos Tacos (same-day check-in)",
            "Priority access to cat treats"
        ],
        accent: Color(hex: "D4A574")
    )
]

// MARK: - Main View

struct MembershipScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    var body: some View {
        ZStack {
            // Dark premium background
            Color(hex: "1C1410")
                .ignoresSafeArea()
            
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
                        colors: [Color(hex: "C4956A").opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.2, y: geo.size.height)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "B87333").opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.8, y: geo.size.height)
            }
            
            // Top accent line
            VStack {
                LinearGradient(
                    colors: [.clear, Color(hex: "C4956A"), Color(hex: "B87333"), Color(hex: "D4A574"), .clear],
                    startPoint: .leading, endPoint: .trailing
                )
                .frame(height: 2)
                Spacer()
            }
            .ignoresSafeArea()
            
            // Content
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 8) {
                    Text("BECOME A MEMBER")
                        .font(.system(size: 22, weight: .medium, design: .serif))
                        .tracking(8)
                        .foregroundColor(Color(hex: "C4956A"))
                    
                    Text("Catfé Memberships")
                        .font(.system(size: 64, weight: .bold, design: .serif))
                        .foregroundColor(Color(hex: "F5E6D3"))
                    
                    // Divider line
                    LinearGradient(
                        colors: [.clear, Color(hex: "C4956A"), .clear],
                        startPoint: .leading, endPoint: .trailing
                    )
                    .frame(width: 120, height: 1)
                    .padding(.top, 4)
                }
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : -20)
                .animation(.easeOut(duration: 0.6), value: appeared)
                .padding(.top, 50)
                .padding(.bottom, 30)
                
                // Three tier cards
                HStack(alignment: .top, spacing: 40) {
                    ForEach(Array(membershipTiers.enumerated()), id: \.offset) { index, tier in
                        TierCardView(tier: tier)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 40)
                            .animation(
                                .easeOut(duration: 0.5).delay(0.15 + Double(index) * 0.12),
                                value: appeared
                            )
                    }
                }
                .padding(.horizontal, 80)
                
                Spacer(minLength: 16)
                
                // QR code at bottom
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    QRCodeView(url: qrURL, size: 100, label: screen.qrLabel ?? "Scan to Join")
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.4).delay(0.7), value: appeared)
                        .padding(.bottom, 40)
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}

// MARK: - Tier Card

private struct TierCardView: View {
    let tier: MembershipTier
    
    var body: some View {
        VStack(spacing: 0) {
            // Featured badge
            if tier.isFeatured {
                Text("✦ MOST POPULAR ✦")
                    .font(.system(size: 16, weight: .bold, design: .default))
                    .tracking(4)
                    .foregroundColor(Color(hex: "1C1410"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: "B87333"), Color(hex: "D4956A"), Color(hex: "B87333")],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
            }
            
            // Tier name
            VStack(spacing: 2) {
                if tier.displayLines.count == 1 {
                    // Single name like "Catfé+"
                    Text(tier.displayLines[0])
                        .font(.system(size: 56, weight: .black, design: .serif))
                        .foregroundColor(tier.accent)
                        .shadow(color: tier.accent.opacity(0.2), radius: 20, x: 0, y: 2)
                } else {
                    // Multi-line: "The" / "Curious" / "Cat"
                    Text(tier.displayLines[0].uppercased())
                        .font(.system(size: 20, weight: .medium, design: .serif))
                        .tracking(6)
                        .foregroundColor(tier.accent.opacity(0.6))
                    
                    Text(tier.displayLines[1])
                        .font(.system(size: 44, weight: .black, design: .serif))
                        .foregroundColor(tier.accent)
                        .shadow(color: tier.accent.opacity(0.2), radius: 20, x: 0, y: 2)
                    
                    Text(tier.displayLines[2])
                        .font(.system(size: 30, weight: .bold, design: .serif))
                        .tracking(4)
                        .foregroundColor(tier.accent.opacity(0.8))
                }
                
                // Decorative flourish
                HStack(spacing: 8) {
                    Rectangle()
                        .fill(tier.accent.opacity(0.25))
                        .frame(width: 30, height: 1)
                    Text("✦")
                        .font(.system(size: 10))
                        .foregroundColor(tier.accent)
                    Rectangle()
                        .fill(tier.accent.opacity(0.25))
                        .frame(width: 30, height: 1)
                }
                .padding(.top, 8)
            }
            .padding(.top, tier.isFeatured ? 24 : 32)
            .padding(.bottom, 16)
            
            // Price
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(tier.price)
                    .font(.system(size: 52, weight: .bold, design: .serif))
                    .foregroundColor(Color(hex: "F5E6D3"))
                Text("/month")
                    .font(.system(size: 22, weight: .regular, design: .serif))
                    .foregroundColor(Color(hex: "C4956A").opacity(0.7))
            }
            .padding(.bottom, 16)
            
            // Divider
            LinearGradient(
                colors: [.clear, tier.accent.opacity(0.4), .clear],
                startPoint: .leading, endPoint: .trailing
            )
            .frame(height: 1)
            .padding(.horizontal, 30)
            
            // Perks
            VStack(alignment: .leading, spacing: 14) {
                ForEach(tier.perks, id: \.self) { perk in
                    HStack(alignment: .top, spacing: 12) {
                        Text("✦")
                            .font(.system(size: 16))
                            .foregroundColor(tier.accent)
                            .padding(.top, 2)
                        Text(perk)
                            .font(.system(size: 22, weight: .regular, design: .default))
                            .foregroundColor(Color(hex: "F5E6D3").opacity(0.85))
                            .lineSpacing(4)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 20)
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(
                    LinearGradient(
                        colors: tier.isFeatured
                            ? [Color(hex: "2E2218"), Color(hex: "251C14"), Color(hex: "1E1610")]
                            : [Color(hex: "261E16"), Color(hex: "1E1610")],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(
                    tier.isFeatured
                        ? Color(hex: "B87333").opacity(0.5)
                        : Color(hex: "C4956A").opacity(0.15),
                    lineWidth: tier.isFeatured ? 2 : 1
                )
        )
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .shadow(
            color: tier.isFeatured
                ? Color(hex: "B87333").opacity(0.2)
                : .black.opacity(0.3),
            radius: tier.isFeatured ? 30 : 15,
            x: 0, y: 10
        )
    }
}
