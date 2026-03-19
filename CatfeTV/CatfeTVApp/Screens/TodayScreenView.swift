//
//  TodayScreenView.swift
//  CatfeTVApp
//
//  Today at Catfé screen - shows today's events from the events API
//  Falls back to screen title/subtitle/body when no events are scheduled
//

import SwiftUI

struct TodayScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @EnvironmentObject var apiClient: APIClient
    @State private var appeared = false
    
    private var todayEvents: [CatfeEvent] {
        apiClient.cachedTodayEvents
    }
    
    private var todayDateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d, yyyy"
        formatter.timeZone = TimeZone(identifier: "America/Los_Angeles")
        return formatter.string(from: Date())
    }
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Dark premium background
                Color(hex: "1C1410")
                    .ignoresSafeArea()
                
                // Warm radial glows
                RadialGradient(
                    colors: [Color(hex: "8B5E3C").opacity(0.12), .clear],
                    center: .top,
                    startRadius: 0,
                    endRadius: geo.size.height * 0.6
                )
                
                RadialGradient(
                    colors: [Color(hex: "86C5A9").opacity(0.06), .clear],
                    center: .bottomTrailing,
                    startRadius: 0,
                    endRadius: geo.size.width * 0.4
                )
                
                // Top accent line
                VStack {
                    LinearGradient(
                        colors: [.clear, Color(hex: "C4956A"), Color(hex: "E8913A"), Color(hex: "86C5A9"), .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(height: 2)
                    Spacer()
                }
                
                // Content
                VStack(spacing: 0) {
                    // Header
                    VStack(spacing: 8) {
                        Text(todayDateString.uppercased())
                            .font(.system(size: 16, weight: .medium))
                            .tracking(6)
                            .foregroundColor(Color(hex: "C4956A"))
                        
                        Text("Today at \(settings.locationName ?? "Catfé")")
                            .font(.system(size: 56, weight: .bold, design: .serif))
                            .foregroundColor(Color(hex: "F5E6D3"))
                        
                        // Divider line
                        LinearGradient(
                            colors: [.clear, Color(hex: "C4956A"), .clear],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        .frame(width: 100, height: 1)
                        .padding(.top, 4)
                    }
                    .padding(.top, 50)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : -20)
                    .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    Spacer().frame(height: 40)
                    
                    // Events or fallback
                    if todayEvents.isEmpty {
                        // Fallback: show screen image + title/subtitle/body
                        Group {
                        if let imageURL = screen.imageURL, !imageURL.isEmpty {
                            // Has image — use hero layout with image on left, text on right
                            HStack(spacing: 40) {
                                // Left: Screen image
                                AsyncImage(url: URL(string: imageURL)) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image
                                            .resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .clipShape(RoundedRectangle(cornerRadius: 20))
                                    case .failure:
                                        RoundedRectangle(cornerRadius: 20)
                                            .fill(Color(hex: "261E16"))
                                            .overlay(
                                                Image(systemName: "photo")
                                                    .font(.system(size: 60))
                                                    .foregroundColor(Color(hex: "C4956A").opacity(0.3))
                                            )
                                    default:
                                        RoundedRectangle(cornerRadius: 20)
                                            .fill(Color(hex: "261E16"))
                                            .overlay(
                                                ProgressView()
                                                    .tint(Color(hex: "C4956A"))
                                            )
                                    }
                                }
                                .frame(maxWidth: geo.size.width * 0.45, maxHeight: geo.size.height * 0.55)
                                .shadow(color: .black.opacity(0.4), radius: 24, x: 0, y: 12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 20)
                                        .stroke(Color(hex: "C4956A").opacity(0.15), lineWidth: 1)
                                )
                                .opacity(appeared ? 1 : 0)
                                .offset(x: appeared ? 0 : -30)
                                .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                                
                                // Right: Text content
                                VStack(alignment: .leading, spacing: 20) {
                                    if !screen.title.isEmpty {
                                        Text(screen.title)
                                            .font(.system(size: 48, weight: .bold, design: .serif))
                                            .foregroundColor(Color(hex: "F5E6D3"))
                                            .lineLimit(3)
                                    }
                                    
                                    // Decorative divider
                                    LinearGradient(
                                        colors: [Color(hex: "C4956A"), Color(hex: "E8913A"), .clear],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                    .frame(width: 120, height: 2)
                                    
                                    if let subtitle = screen.subtitle, !subtitle.isEmpty {
                                        Text(subtitle)
                                            .font(.system(size: 28, weight: .semibold))
                                            .foregroundColor(Color(hex: "E8913A"))
                                    }
                                    
                                    if let body = screen.bodyText, !body.isEmpty {
                                        Text(body)
                                            .font(.system(size: 24))
                                            .foregroundColor(Color(hex: "F5E6D3").opacity(0.6))
                                            .lineLimit(6)
                                            .lineSpacing(6)
                                    }
                                }
                                .frame(maxWidth: geo.size.width * 0.4, alignment: .leading)
                                .opacity(appeared ? 1 : 0)
                                .offset(x: appeared ? 0 : 30)
                                .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                            }
                            .padding(.horizontal, 60)
                        } else {
                            // No image — centered text layout
                            VStack(spacing: 20) {
                                Spacer()
                                
                                if !screen.title.isEmpty {
                                    Text(screen.title)
                                        .font(.system(size: 48, weight: .bold, design: .serif))
                                        .foregroundColor(Color(hex: "F5E6D3"))
                                        .multilineTextAlignment(.center)
                                }
                                
                                if let subtitle = screen.subtitle, !subtitle.isEmpty {
                                    Text(subtitle)
                                        .font(.system(size: 28, weight: .regular, design: .serif))
                                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.7))
                                        .multilineTextAlignment(.center)
                                }
                                
                                if let body = screen.bodyText, !body.isEmpty {
                                    Text(body)
                                        .font(.system(size: 22))
                                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.5))
                                        .multilineTextAlignment(.center)
                                        .frame(maxWidth: geo.size.width * 0.6)
                                }
                                
                                if screen.title.isEmpty && screen.subtitle == nil && screen.bodyText == nil {
                                    Text("☕")
                                        .font(.system(size: 60))
                                        .padding(.bottom, 10)
                                    
                                    Text("No events scheduled today")
                                        .font(.system(size: 28, design: .serif))
                                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.5))
                                    
                                    Text("Check back soon for upcoming activities!")
                                        .font(.system(size: 20))
                                        .foregroundColor(Color(hex: "C4956A").opacity(0.5))
                                        .padding(.top, 4)
                                }
                                
                                Spacer()
                            }
                    }
                    } // end Group
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                } else if todayEvents.count == 1 {
                        // Single event — prominent hero layout
                        singleEventHero(event: todayEvents[0], geo: geo)
                    } else {
                        // Multiple events grid
                        let columns = todayEvents.count <= 4 ? 2 : 3
                        let gridColumns = Array(repeating: GridItem(.flexible(), spacing: 24), count: columns)
                        
                        LazyVGrid(columns: gridColumns, spacing: 24) {
                            ForEach(Array(todayEvents.enumerated()), id: \.element.id) { idx, event in
                                eventCard(event: event, geo: geo, index: idx)
                            }
                        }
                        .padding(.horizontal, 50)
                    }
                    
                    Spacer()
                    
                    // Screen QR code at bottom if set
                    if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                        HStack(spacing: 16) {
                            QRCodeView(url: qrURL, size: 64, label: screen.qrLabel)
                        }
                        .padding(.bottom, 30)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.6), value: appeared)
                    }
                }
            }
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }
    
    // MARK: - Single Event Hero Layout
    
    @ViewBuilder
    private func singleEventHero(event: CatfeEvent, geo: GeometryProxy) -> some View {
        HStack(spacing: 40) {
            // Left side: Large event image
            if let imagePath = event.imagePath, !imagePath.isEmpty {
                AsyncImage(url: URL(string: imagePath)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .clipShape(RoundedRectangle(cornerRadius: 20))
                    case .failure:
                        RoundedRectangle(cornerRadius: 20)
                            .fill(Color(hex: "261E16"))
                            .overlay(
                                Image(systemName: "calendar.badge.clock")
                                    .font(.system(size: 60))
                                    .foregroundColor(Color(hex: "C4956A").opacity(0.3))
                            )
                    default:
                        RoundedRectangle(cornerRadius: 20)
                            .fill(Color(hex: "261E16"))
                            .overlay(
                                ProgressView()
                                    .tint(Color(hex: "C4956A"))
                            )
                    }
                }
                .frame(maxWidth: geo.size.width * 0.45, maxHeight: geo.size.height * 0.55)
                .shadow(color: .black.opacity(0.4), radius: 24, x: 0, y: 12)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color(hex: "C4956A").opacity(0.15), lineWidth: 1)
                )
                .opacity(appeared ? 1 : 0)
                .offset(x: appeared ? 0 : -30)
                .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
            }
            
            // Right side: Event details
            VStack(alignment: .leading, spacing: 20) {
                Text(event.name)
                    .font(.system(size: 48, weight: .bold, design: .serif))
                    .foregroundColor(Color(hex: "F5E6D3"))
                    .lineLimit(3)
                
                // Decorative divider
                LinearGradient(
                    colors: [Color(hex: "C4956A"), Color(hex: "E8913A"), .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: 120, height: 2)
                
                // Time
                if let eventTime = event.eventTime, !eventTime.isEmpty {
                    HStack(spacing: 12) {
                        Image(systemName: "clock.fill")
                            .font(.system(size: 22))
                            .foregroundColor(Color(hex: "E8913A"))
                        Text(eventTime)
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundColor(Color(hex: "E8913A"))
                    }
                }
                
                // Description
                if let description = event.description, !description.isEmpty {
                    Text(description)
                        .font(.system(size: 24))
                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.6))
                        .lineLimit(4)
                        .lineSpacing(6)
                        .padding(.top, 4)
                }
                
                // Location
                if let location = event.location, !location.isEmpty {
                    HStack(spacing: 10) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 20))
                            .foregroundColor(Color(hex: "C4956A").opacity(0.7))
                        Text(location)
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(Color(hex: "C4956A").opacity(0.7))
                    }
                    .padding(.top, 8)
                }
            }
            .frame(maxWidth: geo.size.width * 0.4, alignment: .leading)
            .opacity(appeared ? 1 : 0)
            .offset(x: appeared ? 0 : 30)
            .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
        }
        .padding(.horizontal, 60)
    }
    
    // MARK: - Multi-Event Card
    
    @ViewBuilder
    private func eventCard(event: CatfeEvent, geo: GeometryProxy, index: Int) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Event image
            if let imagePath = event.imagePath, !imagePath.isEmpty {
                AsyncImage(url: URL(string: imagePath)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(maxHeight: 200)
                    default:
                        EmptyView()
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 200)
                .background(Color(hex: "F5E6D3").opacity(0.04))
                .clipped()
            }
            
            // Event details
            VStack(alignment: .leading, spacing: 12) {
                Text(event.name)
                    .font(.system(size: 28, weight: .bold, design: .serif))
                    .foregroundColor(Color(hex: "F5E6D3"))
                    .lineLimit(2)
                
                // Time
                if let eventTime = event.eventTime, !eventTime.isEmpty {
                    HStack(spacing: 8) {
                        Image(systemName: "clock")
                            .font(.system(size: 16))
                            .foregroundColor(Color(hex: "E8913A"))
                        Text(eventTime)
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(Color(hex: "E8913A"))
                    }
                }
                
                // Description
                if let description = event.description, !description.isEmpty {
                    Text(description)
                        .font(.system(size: 18))
                        .foregroundColor(Color(hex: "F5E6D3").opacity(0.6))
                        .lineLimit(3)
                        .lineSpacing(4)
                }
                
                // Location
                if let location = event.location, !location.isEmpty {
                    HStack(spacing: 6) {
                        Image(systemName: "mappin")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "C4956A").opacity(0.6))
                        Text(location)
                            .font(.system(size: 16))
                            .foregroundColor(Color(hex: "C4956A").opacity(0.6))
                    }
                    .padding(.top, 4)
                }
            }
            .padding(24)
        }
        .background(
            LinearGradient(
                colors: [Color(hex: "261E16"), Color(hex: "1E1610")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color(hex: "C4956A").opacity(0.15), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.3), radius: 16, x: 0, y: 8)
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 30)
        .animation(.easeOut(duration: 0.5).delay(0.15 + Double(index) * 0.1), value: appeared)
    }
}
