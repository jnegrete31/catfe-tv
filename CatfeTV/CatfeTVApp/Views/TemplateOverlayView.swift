//
//  TemplateOverlayView.swift
//  CatfeTVApp
//
//  Native SwiftUI renderer for template overlay elements from the Slide Editor.
//  Renders custom text, images, shapes, and other elements on top of the default
//  screen designs, matching the web TemplateRenderer behavior.
//

import SwiftUI

// MARK: - Template Overlay View

/// Renders template overlay elements on top of the native screen view.
/// Elements use percentage-based positioning (0-100) relative to the screen bounds.
struct TemplateOverlayView: View {
    let screen: Screen
    let settings: AppSettings
    
    var body: some View {
        // Only render if there's template overlay data with elements
        if let overlay = screen.templateOverlay {
            let elements = overlay.parsedElements()
            
            if !elements.isEmpty {
                GeometryReader { geometry in
                    ZStack {
                        ForEach(elements) { element in
                            if element.visible != false {
                                TemplateElementView(
                                    element: element,
                                    screen: screen,
                                    settings: settings,
                                    containerSize: geometry.size
                                )
                            }
                        }
                    }
                }
                .allowsHitTesting(false) // Overlay is non-interactive
            }
        }
    }
}

// MARK: - Individual Template Element View

/// Renders a single template element with proper positioning, sizing, and styling
struct TemplateElementView: View {
    let element: TemplateElement
    let screen: Screen
    let settings: AppSettings
    let containerSize: CGSize
    
    // Computed position and size in points
    private var xPos: CGFloat { containerSize.width * CGFloat(element.x) / 100.0 }
    private var yPos: CGFloat { containerSize.height * CGFloat(element.y) / 100.0 }
    private var elemWidth: CGFloat { containerSize.width * CGFloat(element.width) / 100.0 }
    private var elemHeight: CGFloat { containerSize.height * CGFloat(element.height) / 100.0 }
    
    // Styling
    private var elementOpacity: Double { element.opacity ?? 1.0 }
    private var elementRotation: Double { element.rotation ?? 0.0 }
    private var elementZIndex: Double { Double(element.zIndex ?? 1) }
    private var elementBorderRadius: CGFloat { CGFloat(element.borderRadius ?? 0) }
    private var elementPadding: CGFloat { CGFloat(element.padding ?? 0) }
    private var bgColor: Color {
        if let bg = element.backgroundColor, !bg.isEmpty, bg != "transparent" {
            return Color(hex: bg.replacingOccurrences(of: "#", with: ""))
        }
        return .clear
    }
    
    var body: some View {
        elementContent
            .frame(width: elemWidth, height: elemHeight)
            .background(bgColor)
            .clipShape(RoundedRectangle(cornerRadius: elementBorderRadius))
            .opacity(elementOpacity)
            .rotationEffect(.degrees(elementRotation))
            .position(x: xPos + elemWidth / 2, y: yPos + elemHeight / 2)
            .zIndex(elementZIndex)
    }
    
    @ViewBuilder
    private var elementContent: some View {
        switch element.type {
        case "title":
            titleElement
        case "subtitle":
            subtitleElement
        case "body":
            bodyElement
        case "photo":
            photoElement
        case "catPhoto":
            catPhotoElement
        case "qrCode":
            qrCodeElement
        case "logo":
            logoElement
        case "clock":
            clockElement
        case "weather":
            weatherElement
        case "counter":
            counterElement
        default:
            EmptyView()
        }
    }
    
    // MARK: - Title Element
    
    private var titleElement: some View {
        Text(screen.title)
            .font(fontForElement)
            .fontWeight(fontWeightForElement)
            .foregroundColor(textColor)
            .multilineTextAlignment(textAlignment)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(elementPadding)
    }
    
    // MARK: - Subtitle Element
    
    private var subtitleElement: some View {
        Text(screen.subtitle ?? "")
            .font(fontForElement)
            .fontWeight(fontWeightForElement)
            .foregroundColor(textColor)
            .multilineTextAlignment(textAlignment)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(elementPadding)
    }
    
    // MARK: - Body Element
    
    private var bodyElement: some View {
        Text(screen.bodyText ?? "")
            .font(fontForElement)
            .fontWeight(fontWeightForElement)
            .foregroundColor(textColor)
            .multilineTextAlignment(textAlignment)
            .lineSpacing(4)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(elementPadding)
    }
    
    // MARK: - Photo Element
    
    private var photoElement: some View {
        Group {
            if let imageURL = screen.imageURL, !imageURL.isEmpty {
                CachedAsyncImage(url: URL(string: imageURL)!) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: objectFitMode)
                } placeholder: {
                    Rectangle()
                        .fill(Color.loungeStone.opacity(0.3))
                        .overlay(
                            Image(systemName: "photo")
                                .font(.system(size: 40))
                                .foregroundColor(.loungeStone.opacity(0.5))
                        )
                }
            } else {
                Rectangle()
                    .fill(Color.loungeCharcoal.opacity(0.5))
                    .overlay(
                        Text("🐱")
                            .font(.system(size: 60))
                    )
            }
        }
    }
    
    // MARK: - Cat Photo Element (polaroid style)
    
    private var catPhotoElement: some View {
        Group {
            if let imageURL = screen.imageURL, !imageURL.isEmpty {
                VStack(spacing: 0) {
                    CachedAsyncImage(url: URL(string: imageURL)!) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(Color.loungeStone.opacity(0.3))
                            .overlay(
                                ProgressView()
                                    .tint(.loungeWarmOrange)
                            )
                    }
                }
                .background(Color.white)
                .padding(12)
                .padding(.bottom, 36) // Extra bottom padding for polaroid effect
                .background(Color.white)
                .shadow(color: .black.opacity(0.3), radius: 15, x: 0, y: 8)
            } else {
                VStack(spacing: 12) {
                    Text("🐱")
                        .font(.system(size: 60))
                    Text("Photo Coming Soon")
                        .font(CatfeTypography.caption)
                        .foregroundColor(.loungeStone)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.loungeCharcoal.opacity(0.5))
                .cornerRadius(12)
            }
        }
    }
    
    // MARK: - QR Code Element
    
    private var qrCodeElement: some View {
        Group {
            if let qrUrl = screen.qrCodeURL, !qrUrl.isEmpty {
                QRCodeView(url: qrUrl, size: min(elemWidth, elemHeight) * 0.8)
            } else {
                EmptyView()
            }
        }
    }
    
    // MARK: - Logo Element
    
    private var logoElement: some View {
        Group {
            if let logoUrl = settings.logoUrl, !logoUrl.isEmpty, let url = URL(string: logoUrl) {
                CachedAsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                } placeholder: {
                    EmptyView()
                }
            } else {
                HStack(spacing: 8) {
                    Text("🐱")
                        .font(.system(size: 32))
                    Text("Catfé")
                        .font(fontForElement)
                        .foregroundColor(textColor)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Clock Element
    
    private var clockElement: some View {
        VStack(spacing: 4) {
            Text(timeString)
                .font(fontForElement)
                .fontWeight(.bold)
                .foregroundColor(textColor)
            Text(dateString)
                .font(.system(size: max(fontSize * 0.6, 14)))
                .foregroundColor(textColor.opacity(0.7))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Weather Element
    
    private var weatherElement: some View {
        HStack(spacing: 8) {
            Text("☀️")
                .font(.system(size: fontSize * 0.8))
            Text("72°F")
                .font(fontForElement)
                .foregroundColor(textColor)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Counter Element
    
    private var counterElement: some View {
        Text("\(settings.totalAdoptionCount)")
            .font(fontForElement)
            .fontWeight(.bold)
            .foregroundColor(textColor)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Styling Helpers
    
    private var fontSize: CGFloat {
        // Scale font size for tvOS (web uses px, tvOS needs larger sizes for 10-foot viewing)
        let baseFontSize = CGFloat(element.fontSize ?? 24)
        // tvOS screens are typically 1920x1080, web is similar, so use a 1:1 mapping
        // but ensure minimum readability
        return max(baseFontSize, 16)
    }
    
    private var fontForElement: Font {
        .system(size: fontSize, design: .rounded)
    }
    
    private var fontWeightForElement: Font.Weight {
        switch element.fontWeight {
        case "bold", "700": return .bold
        case "semibold", "600": return .semibold
        case "medium", "500": return .medium
        case "light", "300": return .light
        case "100": return .ultraLight
        case "200": return .thin
        case "400": return .regular
        case "800": return .heavy
        case "900": return .black
        default: return .regular
        }
    }
    
    private var textColor: Color {
        if let color = element.color, !color.isEmpty {
            return Color(hex: color.replacingOccurrences(of: "#", with: ""))
        }
        return .white
    }
    
    private var textAlignment: TextAlignment {
        switch element.textAlign {
        case "left": return .leading
        case "right": return .trailing
        default: return .center
        }
    }
    
    private var objectFitMode: ContentMode {
        switch element.objectFit {
        case "contain": return .fit
        case "fill": return .fill
        default: return .fill // "cover" maps to .fill
        }
    }
    
    // Time/Date helpers
    private var timeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: Date())
    }
    
    private var dateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        return formatter.string(from: Date())
    }
}

// MARK: - Preview

#if DEBUG
struct TemplateOverlayView_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.loungeCharcoal
                .ignoresSafeArea()
            
            // Simulate a screen with template overlay
            TemplateOverlayView(
                screen: Screen(
                    type: .events,
                    title: "Valentine's Day Special",
                    subtitle: "February 14th",
                    bodyText: "Join us for a special event!",
                    templateOverlay: TemplateOverlay(
                        elements: """
                        [
                            {"id": "1", "type": "title", "x": 10, "y": 5, "width": 80, "height": 15, "fontSize": 48, "fontWeight": "bold", "color": "#ffffff", "textAlign": "center"},
                            {"id": "2", "type": "subtitle", "x": 10, "y": 22, "width": 80, "height": 10, "fontSize": 32, "color": "#d97706", "textAlign": "center"}
                        ]
                        """,
                        backgroundColor: "#1a1a2e"
                    )
                ),
                settings: .default
            )
        }
    }
}
#endif
