//
//  EventsScreenView.swift
//  CatfeTVApp
//
//  Event screen - Split Diagonal design with image on left, details on right
//

import SwiftUI

struct EventsScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    private var formattedDate: String? {
        guard let date = screen.eventDate, !date.isEmpty else { return nil }
        return date
    }
    
    private var hasEventDetails: Bool {
        formattedDate != nil || screen.eventTime != nil || screen.eventLocation != nil
    }
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Warm cream/amber gradient background (fills entire screen)
                LinearGradient(
                    colors: [
                        Color(hex: "fef3c7"),
                        Color(hex: "f5e6d3"),
                        Color(hex: "ede0d4")
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                // Diagonal image panel - upper left triangle
                if screen.imageURL != nil {
                    ScreenImage(url: screen.imageURL)
                        .frame(width: geo.size.width, height: geo.size.height)
                        .clipped()
                        .clipShape(EventDiagonalShape())
                        .opacity(appeared ? 1 : 0)
                        .offset(x: appeared ? 0 : -40)
                        .animation(.easeOut(duration: 0.8), value: appeared)
                }
                
                // Mint green diagonal accent line
                if screen.imageURL != nil {
                    EventDiagonalLineShape()
                        .fill(Color(hex: "a8d5ba"))
                        .frame(width: geo.size.width, height: geo.size.height)
                        .allowsHitTesting(false)
                }
                
                // Content area - right cream panel, vertically centered
                HStack(spacing: 0) {
                    if screen.imageURL != nil {
                        Spacer()
                            .frame(width: geo.size.width * 0.62)
                    }
                    
                    // Use a centered VStack so content fills the vertical space evenly
                    VStack(alignment: .leading, spacing: 0) {
                        Spacer()
                        
                        // Upcoming Event badge
                        HStack(spacing: 10) {
                            Text("🎉")
                                .font(.system(size: 30))
                            Text("Upcoming Event")
                                .font(.system(size: 26, weight: .semibold, design: .rounded))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 26)
                        .padding(.vertical, 14)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "d97706"), Color(hex: "b45309")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .cornerRadius(30)
                        .shadow(color: Color(hex: "d97706").opacity(0.35), radius: 10, x: 0, y: 4)
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.8)
                        .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(0.3), value: appeared)
                        
                        Spacer().frame(height: 28)
                        
                        // Title - large and prominent
                        Text(screen.title)
                            .font(.system(size: 58, weight: .bold, design: .serif))
                            .foregroundColor(Color(hex: "3d2914"))
                            .lineLimit(3)
                            .fixedSize(horizontal: false, vertical: true)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 15)
                            .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                        
                        Spacer().frame(height: 28)
                        
                        // Event details - stacked vertically with generous spacing
                        if hasEventDetails {
                            VStack(alignment: .leading, spacing: 16) {
                                if let time = screen.eventTime {
                                    eventDetailItem(icon: "clock", text: time)
                                }
                                if let location = screen.eventLocation {
                                    eventDetailItem(icon: "mappin.and.ellipse", text: location)
                                }
                                if let date = formattedDate {
                                    eventDetailItem(icon: "calendar", text: date)
                                }
                            }
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 10)
                            .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                        }
                        
                        // Subtitle
                        if let subtitle = screen.subtitle {
                            Spacer().frame(height: 28)
                            Text(subtitle)
                                .font(.system(size: 30, weight: .medium, design: .serif))
                                .italic()
                                .foregroundColor(Color(hex: "6a5a4a"))
                                .lineLimit(3)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.45), value: appeared)
                        }
                        
                        // Body text
                        if let body = screen.bodyText {
                            Spacer().frame(height: 20)
                            Text(body)
                                .font(.system(size: 26, weight: .regular, design: .rounded))
                                .foregroundColor(Color(hex: "7a6a5a"))
                                .lineSpacing(6)
                                .lineLimit(4)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                        }
                        
                        Spacer()
                        
                        // QR Code - anchored at bottom
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            HStack(spacing: 18) {
                                QRCodeView(url: qrURL, size: 110, label: nil)
                                
                                VStack(alignment: .leading, spacing: 6) {
                                    Text(screen.qrLabel ?? "Scan to RSVP")
                                        .font(.system(size: 22, weight: .bold, design: .rounded))
                                        .foregroundColor(Color(hex: "3d2914"))
                                    Text("Point your camera here")
                                        .font(.system(size: 16, weight: .regular, design: .rounded))
                                        .foregroundColor(Color(hex: "8a7a6a"))
                                }
                            }
                            .padding(20)
                            .background(Color.white.opacity(0.85))
                            .cornerRadius(20)
                            .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 4)
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.9)
                            .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(0.5), value: appeared)
                        }
                        
                        Spacer().frame(height: 30)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.trailing, 40)
                    .padding(.leading, 20)
                    .opacity(appeared ? 1 : 0)
                    .offset(x: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                }
                
                // No-image fallback: warm amber glow
                if screen.imageURL == nil {
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "daa520").opacity(0.3), Color.clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.4
                            )
                        )
                        .frame(width: geo.size.width * 0.8, height: geo.size.width * 0.8)
                        .position(x: geo.size.width * 0.25, y: 0)
                    
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "a8d5ba").opacity(0.3), Color.clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.3
                            )
                        )
                        .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                        .position(x: geo.size.width * 0.75, y: geo.size.height)
                }
                
                // Mint green accent strip at bottom
                VStack {
                    Spacer()
                    Rectangle()
                        .fill(Color(hex: "a8d5ba"))
                        .frame(height: 4)
                }
                .ignoresSafeArea()
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation { appeared = true }
        }
    }
    
    // Event detail item with icon in amber circle
    @ViewBuilder
    private func eventDetailItem(icon: String, text: String) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color(hex: "d97706").opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(Color(hex: "d97706"))
            }
            Text(text)
                .font(.system(size: 28, weight: .medium, design: .rounded))
                .foregroundColor(Color(hex: "5a4a3a"))
        }
    }
}

// MARK: - Diagonal Clip Shape (upper-left triangle for image)

struct EventDiagonalShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 0, y: 0))
        path.addLine(to: CGPoint(x: rect.width * 0.60, y: 0))
        path.addLine(to: CGPoint(x: rect.width * 0.35, y: rect.height))
        path.addLine(to: CGPoint(x: 0, y: rect.height))
        path.closeSubpath()
        return path
    }
}

// MARK: - Diagonal Accent Line Shape

struct EventDiagonalLineShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let lineWidth: CGFloat = rect.width * 0.015
        path.move(to: CGPoint(x: rect.width * 0.595, y: 0))
        path.addLine(to: CGPoint(x: rect.width * 0.595 + lineWidth, y: 0))
        path.addLine(to: CGPoint(x: rect.width * 0.345 + lineWidth, y: rect.height))
        path.addLine(to: CGPoint(x: rect.width * 0.345, y: rect.height))
        path.closeSubpath()
        return path
    }
}
