//
//  ScreenView.swift
//  CatfeTVApp
//
//  Routes to specific screen type views
//

import SwiftUI

struct ScreenView: View {
    let screen: Screen
    
    var body: some View {
        Group {
            switch screen.type {
            case .snapPurr:
                SnapPurrScreenView(screen: screen)
            case .events:
                EventsScreenView(screen: screen)
            case .today:
                TodayScreenView(screen: screen)
            case .membership:
                MembershipScreenView(screen: screen)
            case .reminders:
                RemindersScreenView(screen: screen)
            case .adoption:
                AdoptionScreenView(screen: screen)
            case .thankYou:
                ThankYouScreenView(screen: screen)
            }
        }
        .transition(.opacity)
    }
}

// MARK: - Base Screen Layout

struct BaseScreenLayout<Content: View>: View {
    let screen: Screen
    let backgroundColor: Color
    let content: Content
    
    init(
        screen: Screen,
        backgroundColor: Color? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.screen = screen
        self.backgroundColor = backgroundColor ?? screen.type.backgroundColor
        self.content = content()
    }
    
    var body: some View {
        ZStack {
            // Background
            backgroundColor
                .ignoresSafeArea()
            
            // Content
            content
                .padding(60)
        }
    }
}

// MARK: - QR Code View

struct QRCodeView: View {
    let url: String
    let size: CGFloat
    
    @State private var qrImage: UIImage?
    
    var body: some View {
        Group {
            if let image = qrImage {
                Image(uiImage: image)
                    .interpolation(.none)
                    .resizable()
                    .frame(width: size, height: size)
                    .background(Color.white)
                    .cornerRadius(16)
                    .shadow(color: .black.opacity(0.1), radius: 10)
            } else {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .frame(width: size, height: size)
                    .overlay(
                        ProgressView()
                    )
            }
        }
        .onAppear {
            generateQRCode()
        }
    }
    
    private func generateQRCode() {
        qrImage = QRCodeGenerator.generate(
            from: url,
            size: CGSize(width: size * 2, height: size * 2)
        )
    }
}

// MARK: - Screen Badge

struct ScreenBadge: View {
    let text: String
    let color: Color
    
    var body: some View {
        Text(text)
            .font(CatfeTypography.badge)
            .foregroundColor(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(color)
            .cornerRadius(30)
    }
}

// MARK: - Async Image with Placeholder

struct ScreenImage: View {
    let url: String?
    let contentMode: ContentMode
    
    init(url: String?, contentMode: ContentMode = .fill) {
        self.url = url
        self.contentMode = contentMode
    }
    
    var body: some View {
        if let urlString = url, let imageURL = URL(string: urlString) {
            CachedAsyncImage(url: imageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } placeholder: {
                Rectangle()
                    .fill(Color.catfeBrown.opacity(0.1))
                    .overlay(
                        Image(systemName: "photo")
                            .font(.system(size: 60))
                            .foregroundColor(.catfeBrown.opacity(0.3))
                    )
            }
        } else {
            Rectangle()
                .fill(Color.catfeBrown.opacity(0.1))
                .overlay(
                    Image(systemName: "photo")
                        .font(.system(size: 60))
                        .foregroundColor(.catfeBrown.opacity(0.3))
                )
        }
    }
}

// MARK: - Preview

#if DEBUG
struct ScreenView_Previews: PreviewProvider {
    static var previews: some View {
        ScreenView(screen: Screen.sampleScreens[0])
    }
}
#endif
