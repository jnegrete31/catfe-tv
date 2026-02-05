//
//  EventsScreenView.swift
//  CatfeTVApp
//
//  Events screen showing upcoming events - Lounge-inspired design
//

import SwiftUI

struct EventsScreenView: View {
    let screen: Screen
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            HStack(spacing: 60) {
                // Event Info (Left side)
                VStack(alignment: .leading, spacing: 32) {
                    // Badge with emoji
                    ScreenBadge(
                        text: "Upcoming Event",
                        color: .loungeAmber,
                        emoji: "🎉"
                    )
                    
                    Spacer()
                    
                    // Event Title
                    Text(screen.title)
                        .font(CatfeTypography.heroTitle)
                        .foregroundColor(.loungeCream)
                        .lineLimit(3)
                    
                    // Subtitle
                    if let subtitle = screen.subtitle {
                        Text(subtitle)
                            .font(CatfeTypography.title)
                            .foregroundColor(.loungeWarmOrange)
                    }
                    
                    // Event Details
                    VStack(alignment: .leading, spacing: 16) {
                        // Date
                        if let eventDate = screen.eventDate {
                            HStack(spacing: 16) {
                                Image(systemName: "calendar")
                                    .font(.system(size: 32))
                                    .foregroundColor(.loungeWarmOrange)
                                
                                Text(eventDate.formattedDate)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.loungeCream)
                            }
                        }
                        
                        // Time
                        if let eventTime = screen.eventTime {
                            HStack(spacing: 16) {
                                Image(systemName: "clock")
                                    .font(.system(size: 32))
                                    .foregroundColor(.loungeWarmOrange)
                                
                                Text(eventTime)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.loungeCream)
                            }
                        }
                        
                        // Location
                        if let location = screen.eventLocation {
                            HStack(spacing: 16) {
                                Image(systemName: "mappin.circle")
                                    .font(.system(size: 32))
                                    .foregroundColor(.loungeWarmOrange)
                                
                                Text(location)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.loungeCream)
                            }
                        }
                    }
                    .padding(.top, 16)
                    
                    // Description
                    if let body = screen.bodyText {
                        Text(body)
                            .font(CatfeTypography.body)
                            .foregroundColor(.loungeCream.opacity(0.8))
                            .lineLimit(4)
                            .padding(.top, 16)
                    }
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Image and QR Code (Right side)
                VStack(spacing: 32) {
                    if let imageURL = screen.imageURL {
                        PolaroidFrame(caption: nil, rotation: 2) {
                            ScreenImage(url: imageURL)
                                .frame(width: 500, height: 350)
                        }
                    }
                    
                    Spacer()
                    
                    if let qrURL = screen.qrCodeURL {
                        QRCodeView(url: qrURL, size: 180)
                    }
                }
                .frame(width: UIScreen.main.bounds.width * 0.35)
            }
        }
    }
}

// MARK: - Preview

#if DEBUG
struct EventsScreenView_Previews: PreviewProvider {
    static var previews: some View {
        EventsScreenView(screen: Screen.sampleScreens[2])
    }
}
#endif
