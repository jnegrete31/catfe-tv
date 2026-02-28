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
                // Diagonal goes from x=0.60 at top to x=0.35 at bottom
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
                
                // Content area - positioned safely in the right cream panel
                // The diagonal's rightmost point is at x=0.60 (top of screen)
                // So content must start well past that
                HStack(spacing: 0) {
                    if screen.imageURL != nil {
                        Spacer()
                            .frame(width: geo.size.width * 0.62)
                    }
                    
                    VStack(alignment: .leading, spacing: 16) {
                        Spacer()
                            .frame(height: 20)
                        
                        // Upcoming Event badge
                        HStack(spacing: 10) {
                            Text("🎉")
                                .font(.system(size: 26))
                            Text("Upcoming Event")
                                .font(.system(size: 22, weight: .semibold, design: .rounded))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 22)
                        .padding(.vertical, 10)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "d97706"), Color(hex: "b45309")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .cornerRadius(28)
                        .shadow(color: Color(hex: "d97706").opacity(0.35), radius: 10, x: 0, y: 4)
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.8)
                        .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(0.3), value: appeared)
                        
                        // Title
                        Text(screen.title)
                            .font(.system(size: 52, weight: .bold, design: .serif))
                            .foregroundColor(Color(hex: "3d2914"))
                            .lineLimit(3)
                            .fixedSize(horizontal: false, vertical: true)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 15)
                            .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                        
                        // Event details - stacked vertically for better readability
                        if hasEventDetails {
                            VStack(alignment: .leading, spacing: 12) {
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
                            Text(subtitle)
                                .font(.system(size: 26, weight: .medium, design: .serif))
                                .italic()
                                .foregroundColor(Color(hex: "6a5a4a"))
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.45), value: appeared)
                        }
                        
                        // Body text
                        if let body = screen.bodyText {
                            Text(body)
                                .font(.system(size: 24, weight: .regular, design: .rounded))
                                .foregroundColor(Color(hex: "7a6a5a"))
                                .lineSpacing(5)
                                .lineLimit(3)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                        }
                        
                        Spacer()
                        
                        // QR Code
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            HStack(spacing: 16) {
                                QRCodeView(url: qrURL, size: 100, label: nil)
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(screen.qrLabel ?? "Scan to RSVP")
                                        .font(.system(size: 20, weight: .bold, design: .rounded))
                                        .foregroundColor(Color(hex: "3d2914"))
                                    Text("Point your camera here")
                                        .font(.system(size: 15, weight: .regular, design: .rounded))
                                        .foregroundColor(Color(hex: "8a7a6a"))
                                }
                            }
                            .padding(16)
                            .background(Color.white.opacity(0.85))
                            .cornerRadius(18)
                            .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 4)
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.9)
                            .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(0.5), value: appeared)
                        }
                        
                        Spacer()
                            .frame(height: 20)
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
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(Color(hex: "d97706").opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(Color(hex: "d97706"))
            }
            Text(text)
                .font(.system(size: 24, weight: .medium, design: .rounded))
                .foregroundColor(Color(hex: "5a4a3a"))
        }
    }
}

// MARK: - Diagonal Clip Shape (upper-left triangle for image)
// Narrower diagonal: from x=0.60 at top to x=0.35 at bottom
// This gives the image less horizontal spread and more room for content

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
// Runs along the right edge of the diagonal image clip

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
