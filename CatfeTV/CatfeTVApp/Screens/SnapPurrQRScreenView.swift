//
//  SnapPurrQRScreenView.swift
//  CatfeTVApp
//
//  Snap & Purr QR screen - premium dark theme matching adoption grid & membership.
//  Shows guest photos in polaroid style when available, falls back to camera CTA.
//

import SwiftUI

struct SnapPurrQRScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
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
                    .position(x: geo.size.width * 0.3, y: 0)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [copperColor.opacity(0.08), .clear],
                        center: .center, startRadius: 0,
                        endRadius: geo.size.width * 0.3
                    ))
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.85, y: geo.size.height * 0.7)
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
            GeometryReader { geo in
                if screen.imageURL != nil {
                    photoLayout(geo: geo)
                } else {
                    ctaLayout(geo: geo)
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
        }
    }
    
    // MARK: - Photo Gallery Layout
    
    @ViewBuilder
    private func photoLayout(geo: GeometryProxy) -> some View {
        HStack(alignment: .center, spacing: geo.size.width * 0.05) {
            // Left: Image in polaroid frame
            VStack(spacing: 0) {
                ScreenImage(url: screen.imageURL)
                    .frame(width: geo.size.width * 0.38, height: geo.size.height * 0.58)
                    .clipShape(RoundedRectangle(cornerRadius: 6))
                
                Text("Guest Photo")
                    .font(.system(size: 18, weight: .medium, design: .serif))
                    .foregroundColor(Color(hex: "3d3d3d"))
                    .padding(.top, 14)
                    .padding(.bottom, 6)
            }
            .padding(18)
            .padding(.bottom, 26)
            .background(Color(hex: "FFFEF9"))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.5), radius: 25, x: 0, y: 12)
            .rotationEffect(.degrees(2))
            .opacity(appeared ? 1 : 0)
            .scaleEffect(appeared ? 1 : 0.85)
            .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
            
            // Right: Details + QR
            VStack(alignment: .leading, spacing: 20) {
                Spacer()
                
                // Badge
                HStack(spacing: 8) {
                    Text("📸")
                        .font(.system(size: 16))
                    Text("Snap & Purr")
                        .font(.system(size: 16, weight: .semibold, design: .serif))
                        .foregroundColor(creamColor)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(copperColor.opacity(0.25))
                        .overlay(Capsule().stroke(copperColor.opacity(0.3), lineWidth: 1))
                )
                
                Text(screen.title)
                    .font(.system(size: 46, weight: .bold, design: .serif))
                    .foregroundColor(creamColor)
                    .lineLimit(3)
                
                // Decorative divider
                HStack(spacing: 10) {
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [copperColor, copperColor.opacity(0.3)],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .frame(width: 50, height: 1)
                    Text("✦")
                        .font(.system(size: 8))
                        .foregroundColor(copperColor)
                }
                
                if let subtitle = screen.subtitle {
                    Text(subtitle)
                        .font(.system(size: 22, weight: .regular, design: .serif))
                        .foregroundColor(creamColor.opacity(0.6))
                        .lineSpacing(6)
                        .lineLimit(3)
                }
                
                Spacer()
                
                if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                    QRCodeView(url: qrURL, size: 170, label: screen.qrLabel)
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.8)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3), value: appeared)
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 60)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .opacity(appeared ? 1 : 0)
        .animation(.easeOut(duration: 0.6), value: appeared)
    }
    
    // MARK: - Camera CTA Layout (no photo)
    
    @ViewBuilder
    private func ctaLayout(geo: GeometryProxy) -> some View {
        VStack(spacing: 0) {
            Spacer()
            
            // Camera icon with premium glow
            ZStack {
                // Glow behind
                Circle()
                    .fill(RadialGradient(
                        colors: [copperColor.opacity(0.3), .clear],
                        center: .center, startRadius: 0,
                        endRadius: 70
                    ))
                    .frame(width: 140, height: 140)
                
                RoundedRectangle(cornerRadius: 28)
                    .fill(
                        LinearGradient(
                            colors: [copperColor, bronzeColor],
                            startPoint: .top, endPoint: .bottom
                        )
                    )
                    .frame(width: 90, height: 90)
                    .shadow(color: copperColor.opacity(0.4), radius: 15)
                
                Image(systemName: "camera.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 36, height: 36)
                    .foregroundColor(.white)
            }
            .opacity(appeared ? 1 : 0)
            .scaleEffect(appeared ? 1 : 0.7)
            .animation(.spring(response: 0.6, dampingFraction: 0.7), value: appeared)
            
            Spacer().frame(height: 24)
            
            Text(screen.title)
                .font(.system(size: 50, weight: .bold, design: .serif))
                .foregroundColor(creamColor)
                .multilineTextAlignment(.center)
                .frame(maxWidth: geo.size.width * 0.7)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
            
            // Decorative divider
            HStack(spacing: 12) {
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [.clear, copperColor],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
                    .frame(width: 50, height: 1)
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
                    .frame(width: 50, height: 1)
            }
            .padding(.top, 8)
            .opacity(appeared ? 1 : 0)
            .animation(.easeOut(duration: 0.6).delay(0.15), value: appeared)
            
            if let subtitle = screen.subtitle {
                Spacer().frame(height: 16)
                Text(subtitle)
                    .font(.system(size: 22, weight: .regular, design: .serif))
                    .foregroundColor(creamColor.opacity(0.6))
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: geo.size.width * 0.6)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
            }
            
            Spacer()
            
            if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                QRCodeView(url: qrURL, size: 210, label: screen.qrLabel)
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0.8)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.3), value: appeared)
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
