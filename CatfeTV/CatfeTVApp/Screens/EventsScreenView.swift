//
//  EventsScreenView.swift
//  CatfeTVApp
//
//  Events screen - matches web EventScreen design
//

import SwiftUI

struct EventsScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    private var formattedDate: String? {
        guard let date = screen.eventDate else { return nil }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM d, yyyy"
        return formatter.string(from: date)
    }
    
    var body: some View {
        ZStack {
            // Warm cream background
            LinearGradient(
                colors: [Color(hex: "F5E6D3"), Color(hex: "EDE0D4"), Color(hex: "E8DDD0")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Warm amber glow from top
            GeometryReader { geo in
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "DAA520").opacity(0.15), Color.clear],
                        center: .center, startRadius: 0, endRadius: geo.size.width * 0.4
                    ))
                    .frame(width: geo.size.width * 0.8, height: geo.size.width * 0.8)
                    .position(x: geo.size.width * 0.5, y: -geo.size.height * 0.1)
            }
            
            // Cat silhouettes
            GeometryReader { geo in
                ForEach(0..<3, id: \.self) { i in
                    Image(systemName: "cat.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: CGFloat(60 + i * 20))
                        .foregroundColor(Color(hex: "5a4a3a").opacity(0.04))
                        .position(
                            x: geo.size.width * CGFloat([0.1, 0.9, 0.5][i]),
                            y: geo.size.height * CGFloat([0.85, 0.8, 0.9][i])
                        )
                }
            }
            
            // Industrial ceiling bar
            VStack {
                Rectangle()
                    .fill(Color(hex: "3d3d3d"))
                    .frame(height: 6)
                    .overlay(
                        HStack(spacing: 200) {
                            ForEach(0..<4, id: \.self) { _ in
                                Circle()
                                    .fill(Color(hex: "DAA520").opacity(0.6))
                                    .frame(width: 12, height: 12)
                            }
                        }
                    )
                Spacer()
            }
            
            // Main content
            VStack(spacing: 0) {
                Spacer().frame(height: 40)
                
                HStack(alignment: .center, spacing: 60) {
                    // Left: Event image
                    if screen.imageURL != nil {
                        VStack(spacing: 0) {
                            ScreenImage(url: screen.imageURL)
                                .frame(width: 500, height: 400)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                            
                            Text("Upcoming Event")
                                .font(.system(size: 20, weight: .medium, design: .serif))
                                .foregroundColor(Color(hex: "3d3d3d"))
                                .padding(.top, 16)
                                .padding(.bottom, 8)
                        }
                        .padding(20)
                        .padding(.bottom, 30)
                        .background(Color(hex: "FFFEF9"))
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.15), radius: 20, x: 0, y: 10)
                        .rotationEffect(.degrees(-2))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                    }
                    
                    // Right: Event details
                    VStack(alignment: .leading, spacing: 20) {
                        // Badge
                        HStack(spacing: 8) {
                            Text("🎉")
                                .font(.system(size: 20))
                            Text("Upcoming Event")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(Color(hex: "E8913A"))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(Color(hex: "E8913A").opacity(0.15))
                                .overlay(Capsule().stroke(Color(hex: "E8913A").opacity(0.3), lineWidth: 1))
                        )
                        
                        // Title
                        Text(screen.title)
                            .font(.system(size: 48, weight: .bold, design: .serif))
                            .foregroundColor(Color(hex: "3d3d3d"))
                        
                        // Date & Time & Location
                        VStack(alignment: .leading, spacing: 12) {
                            if let date = formattedDate {
                                HStack(spacing: 10) {
                                    Image(systemName: "calendar")
                                        .foregroundColor(Color(hex: "E8913A"))
                                    Text(date)
                                        .font(.system(size: 24))
                                        .foregroundColor(Color(hex: "5a4a3a"))
                                }
                            }
                            
                            if let time = screen.eventTime {
                                HStack(spacing: 10) {
                                    Image(systemName: "clock")
                                        .foregroundColor(Color(hex: "E8913A"))
                                    Text(time)
                                        .font(.system(size: 24))
                                        .foregroundColor(Color(hex: "5a4a3a"))
                                }
                            }
                            
                            if let location = screen.eventLocation {
                                HStack(spacing: 10) {
                                    Image(systemName: "mappin.and.ellipse")
                                        .foregroundColor(Color(hex: "E8913A"))
                                    Text(location)
                                        .font(.system(size: 24))
                                        .foregroundColor(Color(hex: "5a4a3a"))
                                }
                            }
                        }
                        
                        // Subtitle
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(.system(size: 28, weight: .light))
                                .foregroundColor(Color(hex: "5a4a3a").opacity(0.8))
                        }
                        
                        // Body
                        if let body = screen.bodyText {
                            Text(body)
                                .font(.system(size: 22))
                                .foregroundColor(Color(hex: "5a4a3a").opacity(0.6))
                                .lineSpacing(6)
                                .lineLimit(4)
                        }
                        
                        Spacer()
                        
                        // QR Code
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            HStack(spacing: 16) {
                                QRCodeView(url: qrURL, size: 140)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Learn More")
                                        .font(.system(size: 20, weight: .semibold))
                                        .foregroundColor(Color(hex: "E8913A"))
                                    Text("Scan for details")
                                        .font(.system(size: 16))
                                        .foregroundColor(Color(hex: "5a4a3a").opacity(0.5))
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .opacity(appeared ? 1 : 0)
                    .offset(x: appeared ? 0 : 30)
                    .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                }
                .padding(.horizontal, 80)
                
                Spacer()
            }
        }
        .onAppear {
            withAnimation {
                appeared = true
            }
        }
    }
}
