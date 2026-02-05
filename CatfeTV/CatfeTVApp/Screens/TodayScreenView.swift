//
//  TodayScreenView.swift
//  CatfeTVApp
//
//  Today at Catfé screen - Lounge-inspired design
//

import SwiftUI

struct TodayScreenView: View {
    let screen: Screen
    @State private var currentDate = Date()
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            VStack(spacing: 48) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 8) {
                        // Badge with emoji
                        ScreenBadge(
                            text: "Today at Catfé",
                            color: .loungeAmber,
                            emoji: "☀️"
                        )
                        
                        Text(screen.title)
                            .font(CatfeTypography.heroTitle)
                            .foregroundColor(.loungeCream)
                        
                        Text(currentDate.formattedDate)
                            .font(CatfeTypography.title)
                            .foregroundColor(.loungeWarmOrange)
                    }
                    
                    Spacer()
                    
                    // Cat emoji
                    Text("🐱")
                        .font(.system(size: 80))
                        .opacity(0.3)
                }
                
                // Main Content
                HStack(alignment: .top, spacing: 60) {
                    // Today's Info
                    VStack(alignment: .leading, spacing: 32) {
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.loungeCream.opacity(0.8))
                        }
                        
                        // Body text as bullet points
                        if let body = screen.bodyText {
                            VStack(alignment: .leading, spacing: 20) {
                                ForEach(body.components(separatedBy: "\n"), id: \.self) { line in
                                    if !line.trimmingCharacters(in: .whitespaces).isEmpty {
                                        HStack(alignment: .top, spacing: 16) {
                                            if line.hasPrefix("•") {
                                                Circle()
                                                    .fill(Color.loungeWarmOrange)
                                                    .frame(width: 16, height: 16)
                                                    .padding(.top, 12)
                                                
                                                Text(line.replacingOccurrences(of: "• ", with: ""))
                                                    .font(CatfeTypography.body)
                                                    .foregroundColor(.loungeCream)
                                            } else {
                                                Text(line)
                                                    .font(CatfeTypography.body)
                                                    .foregroundColor(.loungeCream)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    // Image (if available) in polaroid frame
                    if let imageURL = screen.imageURL {
                        PolaroidFrame(caption: nil, rotation: 2) {
                            ScreenImage(url: imageURL)
                                .frame(width: 450, height: 340)
                        }
                    }
                }
                
                // QR Code (if available)
                if let qrURL = screen.qrCodeURL {
                    HStack {
                        Spacer()
                        QRCodeView(url: qrURL, size: 150)
                    }
                }
            }
        }
        .onAppear {
            currentDate = Date()
        }
    }
}

// MARK: - Preview

#if DEBUG
struct TodayScreenView_Previews: PreviewProvider {
    static var previews: some View {
        TodayScreenView(screen: Screen.sampleScreens[3])
    }
}
#endif
