//
//  EventsScreenView.swift
//  CatfeTVApp
//
//  Events screen showing upcoming events
//

import SwiftUI

struct EventsScreenView: View {
    let screen: Screen
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            HStack(spacing: 60) {
                // Event Info (Left side)
                VStack(alignment: .leading, spacing: 32) {
                    // Badge
                    ScreenBadge(text: "Upcoming Event", color: screen.type.accentColor)
                    
                    Spacer()
                    
                    // Event Title
                    Text(screen.title)
                        .font(CatfeTypography.heroTitle)
                        .foregroundColor(.catfeBrown)
                        .lineLimit(3)
                    
                    // Subtitle
                    if let subtitle = screen.subtitle {
                        Text(subtitle)
                            .font(CatfeTypography.title)
                            .foregroundColor(screen.type.accentColor)
                    }
                    
                    // Event Details
                    VStack(alignment: .leading, spacing: 16) {
                        // Date
                        if let eventDate = screen.eventDate {
                            HStack(spacing: 16) {
                                Image(systemName: "calendar")
                                    .font(.system(size: 32))
                                    .foregroundColor(screen.type.accentColor)
                                
                                Text(eventDate.formattedDate)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.catfeBrown)
                            }
                        }
                        
                        // Time
                        if let eventTime = screen.eventTime {
                            HStack(spacing: 16) {
                                Image(systemName: "clock")
                                    .font(.system(size: 32))
                                    .foregroundColor(screen.type.accentColor)
                                
                                Text(eventTime)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.catfeBrown)
                            }
                        }
                        
                        // Location
                        if let location = screen.eventLocation {
                            HStack(spacing: 16) {
                                Image(systemName: "mappin.circle")
                                    .font(.system(size: 32))
                                    .foregroundColor(screen.type.accentColor)
                                
                                Text(location)
                                    .font(CatfeTypography.subtitle)
                                    .foregroundColor(.catfeBrown)
                            }
                        }
                    }
                    .padding(.top, 16)
                    
                    // Description
                    if let body = screen.bodyText {
                        Text(body)
                            .font(CatfeTypography.body)
                            .foregroundColor(.catfeBrown.opacity(0.8))
                            .lineLimit(4)
                            .padding(.top, 16)
                    }
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Image and QR Code (Right side)
                VStack(spacing: 32) {
                    if let imageURL = screen.imageURL {
                        ScreenImage(url: imageURL)
                            .frame(maxWidth: .infinity)
                            .aspectRatio(16/9, contentMode: .fit)
                            .cornerRadius(24)
                            .shadow(color: .black.opacity(0.1), radius: 20)
                    }
                    
                    Spacer()
                    
                    if let qrURL = screen.qrCodeURL {
                        VStack(spacing: 16) {
                            QRCodeView(url: qrURL, size: 180)
                            
                            Text("Scan to RSVP")
                                .font(CatfeTypography.caption)
                                .foregroundColor(.catfeBrown.opacity(0.6))
                        }
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
