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
                // Warm cream/amber gradient background
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
                        .clipShape(DiagonalShape())
                        .opacity(appeared ? 1 : 0)
                        .offset(x: appeared ? 0 : -40)
                        .animation(.easeOut(duration: 0.8), value: appeared)
                }
                
                // Mint green diagonal accent line
                if screen.imageURL != nil {
                    DiagonalLineShape()
                        .fill(Color(hex: "a8d5ba"))
                        .frame(width: geo.size.width, height: geo.size.height)
                        .allowsHitTesting(false)
                }
                
                // Content area - right side
                HStack {
                    if screen.imageURL != nil {
                        Spacer()
                            .frame(width: geo.size.width * 0.42)
                    }
                    
                    VStack(alignment: .leading, spacing: 20) {
                        Spacer()
                        
                        // Upcoming Event badge
                        HStack(spacing: 10) {
                            Text("🎉")
                                .font(.system(size: 28))
                            Text("Upcoming Event")
                                .font(.system(size: 24, weight: .semibold, design: .rounded))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
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
                        
                        // Title
                        Text(screen.title)
                            .font(.system(size: 60, weight: .bold, design: .serif))
                            .foregroundColor(Color(hex: "3d2914"))
                            .lineLimit(3)
                            .fixedSize(horizontal: false, vertical: true)
                        
                        // Event details row
                        if hasEventDetails {
                            HStack(spacing: 24) {
                                if let date = formattedDate {
                                    eventDetailItem(icon: "calendar", text: date)
                                }
                                if let time = screen.eventTime {
                                    eventDetailItem(icon: "clock", text: time)
                                }
                                if let location = screen.eventLocation {
                                    eventDetailItem(icon: "mappin.and.ellipse", text: location)
                                }
                            }
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 10)
                            .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                        }
                        
                        // Subtitle
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(.system(size: 32, weight: .medium, design: .serif))
                                .italic()
                                .foregroundColor(Color(hex: "6a5a4a"))
                        }
                        
                        // Body text
                        if let body = screen.bodyText {
                            Text(body)
                                .font(.system(size: 28, weight: .regular, design: .rounded))
                                .foregroundColor(Color(hex: "7a6a5a"))
                                .lineSpacing(6)
                                .lineLimit(4)
                        }
                        
                        Spacer()
                        
                        // QR Code
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            HStack(spacing: 20) {
                                QRCodeView(url: qrURL, size: 120, label: nil)
                                
                                VStack(alignment: .leading, spacing: 4) {
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
                            .shadow(color: .black.opacity(0.1), radius: 15, x: 0, y: 4)
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.9)
                            .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(0.5), value: appeared)
                        }
                        
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.trailing, geo.size.width * 0.05)
                    .padding(.leading, screen.imageURL != nil ? geo.size.width * 0.02 : geo.size.width * 0.08)
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
                    .frame(width: 40, height: 40)
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(Color(hex: "d97706"))
            }
            Text(text)
                .font(.system(size: 26, weight: .medium, design: .rounded))
                .foregroundColor(Color(hex: "5a4a3a"))
        }
    }
}

// MARK: - Diagonal Clip Shape (upper-left triangle for image)

struct DiagonalShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 0, y: 0))
        path.addLine(to: CGPoint(x: rect.width * 0.65, y: 0))
        path.addLine(to: CGPoint(x: rect.width * 0.40, y: rect.height))
        path.addLine(to: CGPoint(x: 0, y: rect.height))
        path.closeSubpath()
        return path
    }
}

// MARK: - Diagonal Accent Line Shape

struct DiagonalLineShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let lineWidth: CGFloat = rect.width * 0.02
        path.move(to: CGPoint(x: rect.width * 0.64, y: 0))
        path.addLine(to: CGPoint(x: rect.width * 0.64 + lineWidth, y: 0))
        path.addLine(to: CGPoint(x: rect.width * 0.39 + lineWidth, y: rect.height))
        path.addLine(to: CGPoint(x: rect.width * 0.39, y: rect.height))
        path.closeSubpath()
        return path
    }
}
