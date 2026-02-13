//
//  LogoWidget.swift
//  CatfeTVApp
//
//  Overlay widget that shows the cafe logo in the bottom-right corner.
//  Matches the web TV display's LogoWidget positioning.
//  Only shows when logoUrl is configured in settings.
//
import SwiftUI

struct LogoWidget: View {
    @EnvironmentObject var apiClient: APIClient
    
    private var logoUrl: String? {
        apiClient.settings.logoUrl
    }
    
    var body: some View {
        Group {
            if let url = logoUrl, !url.isEmpty, let imageURL = URL(string: url) {
                CachedAsyncImage(url: imageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 80, height: 80)
                        .clipShape(Circle())
                        .overlay(
                            Circle()
                                .stroke(Color.white.opacity(0.9), lineWidth: 2)
                        )
                        .shadow(color: .black.opacity(0.4), radius: 8, x: 0, y: 4)
                        .background(
                            Circle()
                                .fill(Color.white.opacity(0.9))
                                .frame(width: 84, height: 84)
                        )
                } placeholder: {
                    // Default Catfé logo while loading
                    DefaultCatfeLogo()
                }
            } else {
                // No custom logo URL set - show default Catfé branding
                DefaultCatfeLogo()
            }
        }
    }
}

/// Default Catfé logo when no custom logo URL is configured
struct DefaultCatfeLogo: View {
    var body: some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(Color.loungeAmber)
                    .frame(width: 48, height: 48)
                
                Text("🐱")
                    .font(.system(size: 24))
            }
            
            Text("Catfé")
                .font(.system(size: 22, weight: .bold, design: .serif))
                .foregroundColor(.white)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.black.opacity(0.3))
        .clipShape(Capsule())
        .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Preview
#if DEBUG
struct LogoWidget_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.loungeCharcoal
                .ignoresSafeArea()
            
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    LogoWidget()
                        .environmentObject(APIClient.shared)
                        .padding(.bottom, 40)
                        .padding(.trailing, 60)
                }
            }
        }
    }
}
#endif
