//
//  TodayScreenView.swift
//  CatfeTVApp
//
//  Today at Catfé screen
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
                        Text(screen.title)
                            .font(CatfeTypography.heroTitle)
                            .foregroundColor(.catfeBrown)
                        
                        Text(currentDate.formattedDate)
                            .font(CatfeTypography.title)
                            .foregroundColor(.catfeGold)
                    }
                    
                    Spacer()
                    
                    // Cat icon
                    Image(systemName: "cat.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.catfeTerracotta.opacity(0.3))
                }
                
                // Main Content
                HStack(alignment: .top, spacing: 60) {
                    // Today's Info
                    VStack(alignment: .leading, spacing: 32) {
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(CatfeTypography.subtitle)
                                .foregroundColor(.catfeBrown.opacity(0.8))
                        }
                        
                        // Body text as bullet points
                        if let body = screen.bodyText {
                            VStack(alignment: .leading, spacing: 20) {
                                ForEach(body.components(separatedBy: "\n"), id: \.self) { line in
                                    if !line.trimmingCharacters(in: .whitespaces).isEmpty {
                                        HStack(alignment: .top, spacing: 16) {
                                            if line.hasPrefix("•") {
                                                Circle()
                                                    .fill(Color.catfeTerracotta)
                                                    .frame(width: 16, height: 16)
                                                    .padding(.top, 12)
                                                
                                                Text(line.replacingOccurrences(of: "• ", with: ""))
                                                    .font(CatfeTypography.body)
                                                    .foregroundColor(.catfeBrown)
                                            } else {
                                                Text(line)
                                                    .font(CatfeTypography.body)
                                                    .foregroundColor(.catfeBrown)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    // Image (if available)
                    if let imageURL = screen.imageURL {
                        ScreenImage(url: imageURL)
                            .frame(width: UIScreen.main.bounds.width * 0.35)
                            .aspectRatio(4/3, contentMode: .fit)
                            .cornerRadius(24)
                            .shadow(color: .black.opacity(0.1), radius: 20)
                    }
                }
                
                // QR Code (if available)
                if let qrURL = screen.qrCodeURL {
                    HStack {
                        Spacer()
                        VStack(spacing: 12) {
                            QRCodeView(url: qrURL, size: 150)
                            Text("Learn More")
                                .font(CatfeTypography.caption)
                                .foregroundColor(.catfeBrown.opacity(0.6))
                        }
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
