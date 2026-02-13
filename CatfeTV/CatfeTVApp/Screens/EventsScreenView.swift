//
//  EventsScreenView.swift
//  CatfeTVApp
//
//  Event screen - matches web EventScreen design, fills full TV
//

import SwiftUI

struct EventsScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    private var formattedDate: String? {
        guard let date = screen.eventDate, !date.isEmpty else { return nil }
        // eventDate is already a formatted String from the API
        return date
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                HStack(alignment: .center, spacing: geo.size.width * 0.04) {
                    // Left: Event image in polaroid frame
                    if screen.imageURL != nil {
                        VStack(spacing: 0) {
                            ScreenImage(url: screen.imageURL)
                                .frame(width: geo.size.width * 0.4, height: geo.size.height * 0.65)
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
                        .shadow(color: .black.opacity(0.4), radius: 20, x: 0, y: 10)
                        .rotationEffect(.degrees(-2))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.85)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                    }
                    
                    // Right: Event details
                    VStack(alignment: .leading, spacing: 20) {
                        Spacer()
                        
                        // Badge
                        ScreenBadge(text: "Upcoming Event", color: .loungeAmber, emoji: "🎉")
                        
                        // Title
                        Text(screen.title)
                            .font(.system(size: 52, weight: .bold, design: .serif))
                            .foregroundColor(.loungeCream)
                            .lineLimit(3)
                        
                        // Date & Time & Location
                        VStack(alignment: .leading, spacing: 12) {
                            if let date = formattedDate {
                                HStack(spacing: 10) {
                                    Image(systemName: "calendar")
                                        .foregroundColor(.loungeWarmOrange)
                                    Text(date)
                                        .font(CatfeTypography.body)
                                        .foregroundColor(.loungeCream.opacity(0.9))
                                }
                            }
                            if let time = screen.eventTime {
                                HStack(spacing: 10) {
                                    Image(systemName: "clock")
                                        .foregroundColor(.loungeWarmOrange)
                                    Text(time)
                                        .font(CatfeTypography.body)
                                        .foregroundColor(.loungeCream.opacity(0.9))
                                }
                            }
                            if let location = screen.eventLocation {
                                HStack(spacing: 10) {
                                    Image(systemName: "mappin.and.ellipse")
                                        .foregroundColor(.loungeWarmOrange)
                                    Text(location)
                                        .font(CatfeTypography.body)
                                        .foregroundColor(.loungeCream.opacity(0.9))
                                }
                            }
                        }
                        
                        // Subtitle
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeAmber)
                        }
                        
                        // Body
                        if let body = screen.bodyText {
                            Text(body)
                                .font(CatfeTypography.caption)
                                .foregroundColor(.loungeCream.opacity(0.6))
                                .lineSpacing(6)
                                .lineLimit(4)
                        }
                        
                        Spacer()
                        
                        // QR Code
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            QRCodeView(url: qrURL, size: 140)
                        }
                        
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6), value: appeared)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
}
