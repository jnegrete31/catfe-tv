//
//  EventsScreenView.swift
//  CatfeTVApp
//
//  Event screen - Magazine split-screen design matching AdoptionScreenView
//  Full-bleed event image on left, orange accent divider, cream info panel on right
//

import SwiftUI

struct EventsScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    private var formattedDate: String? {
        guard let date = screen.eventDate, !date.isEmpty else { return nil }
        return date
    }
    
    var body: some View {
        GeometryReader { geo in
            HStack(spacing: 0) {
                // ── LEFT HALF: Full-bleed event image ──
                ZStack(alignment: .bottom) {
                    if screen.imageURL != nil {
                        ScreenImage(url: screen.imageURL)
                            .frame(width: geo.size.width * 0.52, height: geo.size.height)
                            .clipped()
                    } else {
                        // Fallback placeholder
                        Rectangle()
                            .fill(Color(hex: "e8e4dc"))
                            .overlay(
                                Text("🎉")
                                    .font(.system(size: 160))
                            )
                    }
                    
                    // Subtle gradient for depth at right edge
                    HStack {
                        Spacer()
                        LinearGradient(
                            colors: [.clear, Color(hex: "FAFAF5").opacity(0.15)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        .frame(width: 80)
                    }
                }
                .frame(width: geo.size.width * 0.52, height: geo.size.height)
                .opacity(appeared ? 1 : 0)
                .offset(x: appeared ? 0 : -40)
                .animation(.easeOut(duration: 0.7), value: appeared)
                
                // ── ORANGE ACCENT DIVIDER ──
                Rectangle()
                    .fill(Color(hex: "E8913A"))
                    .frame(width: 6)
                
                // ── RIGHT HALF: Clean cream info panel ──
                ZStack {
                    // Cream background
                    Color(hex: "FAFAF5")
                    
                    // Subtle paw print watermark
                    VStack {
                        HStack {
                            Spacer()
                            PawPrintWatermark()
                                .frame(width: 120, height: 120)
                                .opacity(0.04)
                                .padding(.top, 30)
                                .padding(.trailing, 30)
                        }
                        Spacer()
                    }
                    
                    // Info content
                    VStack(alignment: .leading, spacing: 0) {
                        Spacer()
                        
                        // Title
                        VStack(alignment: .leading, spacing: 8) {
                            Text(screen.title)
                                .font(.system(size: 64, weight: .heavy, design: .default))
                                .foregroundColor(Color(hex: "1a1a1a"))
                                .lineLimit(2)
                                .minimumScaleFactor(0.7)
                            
                            // Orange accent underline
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color(hex: "E8913A"))
                                .frame(width: 180, height: 4)
                        }
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : -20)
                        .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                        
                        Spacer().frame(height: 28)
                        
                        // Upcoming Event badge
                        HStack(spacing: 8) {
                            Text("🎉")
                                .font(.system(size: 22))
                            Text("Upcoming Event")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "E8913A"), Color(hex: "D4782A")],
                                startPoint: .topLeading, endPoint: .bottomTrailing
                            )
                        )
                        .cornerRadius(24)
                        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 3)
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.9)
                        .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                        
                        Spacer().frame(height: 24)
                        
                        // Event details - stacked vertically
                        VStack(alignment: .leading, spacing: 16) {
                            if let date = formattedDate {
                                eventDetailItem(icon: "calendar", text: date)
                            }
                            if let time = screen.eventTime {
                                eventDetailItem(icon: "clock", text: time)
                            }
                            if let location = screen.eventLocation {
                                eventDetailItem(icon: "mappin.and.ellipse", text: location)
                            }
                        }
                        .opacity(appeared ? 1 : 0)
                        .offset(x: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                        
                        Spacer().frame(height: 20)
                        
                        // Subtitle / Description
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(.system(size: 18, weight: .regular, design: .serif))
                                .italic()
                                .foregroundColor(Color(hex: "888888"))
                                .lineLimit(3)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                        }
                        
                        // Body text
                        if let body = screen.bodyText {
                            Spacer().frame(height: 12)
                            Text(body)
                                .font(.system(size: 18, weight: .regular))
                                .foregroundColor(Color(hex: "666666"))
                                .lineSpacing(6)
                                .lineLimit(4)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.52), value: appeared)
                        }
                        
                        Spacer().frame(height: 20)
                        
                        // QR Code
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            let fullURL = qrURL.hasPrefix("http") ? qrURL : "https://catfetv.com" + qrURL
                            EventQRCode(url: fullURL, label: screen.qrLabel ?? "Scan to RSVP")
                                .opacity(appeared ? 1 : 0)
                                .scaleEffect(appeared ? 1 : 0.9)
                                .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.6), value: appeared)
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 50)
                    .padding(.vertical, 40)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation {
                appeared = true
            }
        }
    }
    
    // Event detail item with icon in amber circle
    @ViewBuilder
    private func eventDetailItem(icon: String, text: String) -> some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color(hex: "E8913A").opacity(0.15))
                    .frame(width: 48, height: 48)
                Image(systemName: icon)
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(Color(hex: "E8913A"))
            }
            Text(text)
                .font(.system(size: 28, weight: .light))
                .foregroundColor(Color(hex: "444444"))
        }
    }
}

// MARK: - Paw Print Watermark
private struct PawPrintWatermark: View {
    var body: some View {
        ZStack {
            // Main pad
            Circle()
                .fill(Color(hex: "2d2d2d"))
                .frame(width: 50, height: 50)
                .offset(y: 10)
            // Toe beans
            ForEach(0..<4) { i in
                let angle = Double(i) * 30 - 45
                let x = cos(angle * .pi / 180) * 35
                let y = sin(angle * .pi / 180) * 35 - 15
                Circle()
                    .fill(Color(hex: "2d2d2d"))
                    .frame(width: 22, height: 22)
                    .offset(x: CGFloat(x), y: CGFloat(y))
            }
        }
    }
}

// MARK: - Event QR Code (matching adoption magazine style)
private struct EventQRCode: View {
    let url: String
    var label: String?
    
    @State private var qrImage: UIImage?
    
    var body: some View {
        Group {
            if let image = qrImage {
                VStack(spacing: 8) {
                    Image(uiImage: image)
                        .interpolation(.none)
                        .resizable()
                        .frame(width: 130, height: 130)
                    
                    Text(label ?? "Scan to RSVP")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color(hex: "666666"))
                }
                .padding(18)
                .background(Color.white)
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color(hex: "e5e0d8"), lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.08), radius: 10, x: 0, y: 4)
            } else {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .frame(width: 166, height: 196)
                    .overlay(
                        ProgressView()
                            .tint(Color(hex: "E8913A"))
                    )
            }
        }
        .onAppear {
            generateQR()
        }
    }
    
    private func generateQR() {
        guard let data = url.data(using: .utf8) else { return }
        let filter = CIFilter(name: "CIQRCodeGenerator")
        filter?.setValue(data, forKey: "inputMessage")
        filter?.setValue("M", forKey: "inputCorrectionLevel")
        guard let ciImage = filter?.outputImage else { return }
        let scale = 130.0 / ciImage.extent.width
        let transformed = ciImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
        let context = CIContext()
        guard let cgImage = context.createCGImage(transformed, from: transformed.extent) else { return }
        qrImage = UIImage(cgImage: cgImage)
    }
}
