//
//  GuestBirthdayScreenView.swift
//  CatfeTVApp
//
//  Guest Birthday Celebration - displays guest first names celebrating
//  their birthday at Catfé. Premium dark theme matching cat birthday screen.
//  Supports optional guest photo (side-by-side layout when photo present).
//

import SwiftUI

// MARK: - Guest Birthday Screen

struct GuestBirthdayScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    /// Extract guest name from the screen data.
    /// The backend injects it as `guestName` in the screen title (e.g. "🎂 Happy Birthday, Sarah! 🎂")
    /// or as a separate field. We parse the first name from the title as fallback.
    private var guestName: String {
        // The title format is "🎂 Happy Birthday, {name}! 🎂"
        // Extract name between "Birthday, " and "!"
        let title = screen.title
        if let range = title.range(of: "Birthday, ") {
            let afterBirthday = title[range.upperBound...]
            if let exclamation = afterBirthday.firstIndex(of: "!") {
                let name = String(afterBirthday[..<exclamation]).trimmingCharacters(in: .whitespaces)
                if !name.isEmpty { return name }
            }
        }
        // Fallback: strip emoji from title
        let cleaned = title
            .replacingOccurrences(of: "🎂", with: "")
            .replacingOccurrences(of: "Happy Birthday,", with: "")
            .replacingOccurrences(of: "Happy Birthday", with: "")
            .replacingOccurrences(of: "!", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return cleaned.isEmpty ? "Our Guest" : cleaned
    }
    
    /// Guest photo URL from imageURL field
    private var guestPhotoUrl: String? {
        guard let path = screen.imageURL, !path.isEmpty else { return nil }
        return path
    }
    
    private var hasPhoto: Bool {
        guestPhotoUrl != nil
    }
    
    // Premium dark theme colors (matching cat birthday screen)
    private let darkBg = Color(hex: "1C1410")
    private let promoCopper = Color(hex: "CD7F32")
    private let promoGold = Color(hex: "DAA520")
    private let promoCream = Color(hex: "F5DEB3")
    private let warmCream = Color(hex: "F5E6D3")
    private let copperAccent = Color(hex: "B87333")
    private let softCopper = Color(hex: "C4956A")
    private let lightCopper = Color(hex: "D4A574")
    
    var body: some View {
        ZStack {
            // Dark background
            darkBg.ignoresSafeArea()
            
            // Warm radial glows
            GeometryReader { geo in
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [softCopper.opacity(0.15), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.35
                        )
                    )
                    .frame(width: geo.size.width * 0.55, height: geo.size.width * 0.55)
                    .position(x: geo.size.width * 0.15, y: geo.size.height * 0.3)
                
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color(hex: "8B5E3C").opacity(0.1), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.25
                        )
                    )
                    .frame(width: geo.size.width * 0.45, height: geo.size.width * 0.45)
                    .position(x: geo.size.width * 0.9, y: geo.size.height * 0.75)
                
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color(hex: "E8B478").opacity(0.08), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.2
                        )
                    )
                    .frame(width: geo.size.width * 0.35, height: geo.size.width * 0.35)
                    .position(x: geo.size.width * 0.75, y: geo.size.height * 0.25)
            }
            
            // Top decorative line
            VStack {
                LinearGradient(
                    colors: [.clear, softCopper, copperAccent, lightCopper, .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(height: 2)
                Spacer()
                // Bottom decorative line
                LinearGradient(
                    colors: [.clear, softCopper, copperAccent, softCopper, .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(height: 2)
            }
            .ignoresSafeArea()
            
            // Decorative cat silhouettes
            VStack {
                Spacer()
                HStack {
                    catSilhouetteView
                        .opacity(0.04)
                        .frame(width: 100, height: 100)
                        .padding(.leading, 30)
                        .padding(.bottom, 30)
                    Spacer()
                }
            }
            
            VStack {
                HStack {
                    Spacer()
                    catSilhouetteView
                        .opacity(0.03)
                        .frame(width: 72, height: 72)
                        .rotationEffect(.degrees(12))
                        .padding(.trailing, 40)
                        .padding(.top, 40)
                }
                Spacer()
            }
            
            // Subtle sparkles
            ForEach(0..<8, id: \.self) { i in
                Circle()
                    .fill([softCopper, copperAccent, promoGold, lightCopper][i % 4])
                    .frame(width: CGFloat(i % 2 == 0 ? 6 : 4), height: CGFloat(i % 2 == 0 ? 6 : 4))
                    .opacity(appeared ? 0.25 : 0)
                    .position(
                        x: CGFloat(80 + (i * 210) % 1600),
                        y: CGFloat(60 + (i * 130) % 800)
                    )
            }
            
            // Main content - adaptive layout based on photo presence
            if hasPhoto {
                photoLayout
            } else {
                centeredLayout
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                appeared = true
            }
        }
    }
    
    // MARK: - Layout with Photo (side-by-side)
    
    private var photoLayout: some View {
        HStack(spacing: 48) {
            // Photo side (left)
            VStack {
                Spacer()
                ZStack {
                    // Outer glow ring
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [softCopper, copperAccent, lightCopper, softCopper],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 4
                        )
                        .frame(width: 330, height: 330)
                        .opacity(0.6)
                    
                    // Photo
                    if let photoUrl = guestPhotoUrl, let url = URL(string: photoUrl) {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(width: 320, height: 320)
                                    .clipShape(Circle())
                                    .overlay(
                                        Circle()
                                            .stroke(softCopper, lineWidth: 3)
                                    )
                            case .failure:
                                Circle()
                                    .fill(Color(hex: "2A1F18"))
                                    .frame(width: 320, height: 320)
                                    .overlay(
                                        Text("🎂")
                                            .font(.system(size: 80))
                                    )
                            default:
                                Circle()
                                    .fill(Color(hex: "2A1F18"))
                                    .frame(width: 320, height: 320)
                                    .overlay(
                                        ProgressView()
                                            .tint(softCopper)
                                    )
                            }
                        }
                    }
                    
                    // Sparkle accent on photo
                    Text("✨")
                        .font(.system(size: 32))
                        .offset(x: 140, y: -140)
                        .opacity(appeared ? 1 : 0)
                }
                .opacity(appeared ? 1 : 0)
                .offset(x: appeared ? 0 : -40)
                Spacer()
            }
            .frame(maxWidth: .infinity)
            
            // Text side (right)
            VStack(alignment: .leading, spacing: 0) {
                Spacer()
                
                // Top label
                HStack(spacing: 12) {
                    LinearGradient(
                        colors: [.clear, softCopper],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: 60, height: 1)
                    
                    Text("✨ Birthday Celebration ✨")
                        .font(.system(size: 14, weight: .medium))
                        .tracking(4)
                        .foregroundColor(softCopper)
                    
                    LinearGradient(
                        colors: [softCopper, .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: 60, height: 1)
                }
                .opacity(appeared ? 1 : 0)
                
                Spacer().frame(height: 20)
                
                // Birthday cake emoji
                Text("🎂")
                    .font(.system(size: 72))
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1 : 0.5)
                
                Spacer().frame(height: 16)
                
                // Happy Birthday text
                Text("Happy Birthday!")
                    .font(.system(size: 60, weight: .bold, design: .serif))
                    .foregroundColor(warmCream)
                    .opacity(appeared ? 1 : 0)
                
                Spacer().frame(height: 12)
                
                // Guest name
                Text(guestName)
                    .font(.system(size: 48, weight: .semibold, design: .serif))
                    .foregroundColor(softCopper)
                    .opacity(appeared ? 1 : 0)
                
                Spacer().frame(height: 20)
                
                // Decorative divider
                LinearGradient(
                    colors: [.clear, copperAccent, .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: 200, height: 1)
                .opacity(appeared ? 1 : 0)
                
                Spacer().frame(height: 20)
                
                // Subtitle
                Text("We hope you have a wonderful birthday\ncelebration at Catfé!")
                    .font(.system(size: 22, weight: .medium, design: .serif))
                    .foregroundColor(Color(hex: "A89080"))
                    .opacity(appeared ? 1 : 0)
                
                Spacer().frame(height: 24)
                
                // Party emojis
                HStack(spacing: 20) {
                    Text("🎉").font(.system(size: 36))
                    Text("🎈").font(.system(size: 36))
                    Text("🐱").font(.system(size: 36))
                    Text("🎈").font(.system(size: 36))
                    Text("🎉").font(.system(size: 36))
                }
                .opacity(appeared ? 1 : 0)
                
                Spacer()
            }
            .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, 60)
    }
    
    // MARK: - Centered Layout (no photo)
    
    private var centeredLayout: some View {
        VStack(spacing: 0) {
            Spacer()
            
            // Top label with decorative lines
            HStack(spacing: 12) {
                LinearGradient(
                    colors: [.clear, softCopper],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: 80, height: 1)
                
                Text("✨ Birthday Celebration ✨")
                    .font(.system(size: 16, weight: .medium))
                    .tracking(5)
                    .foregroundColor(softCopper)
                
                LinearGradient(
                    colors: [softCopper, .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: 80, height: 1)
            }
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : -20)
            
            Spacer().frame(height: 24)
            
            // Birthday cake emoji
            Text("🎂")
                .font(.system(size: 100))
                .opacity(appeared ? 1 : 0)
                .scaleEffect(appeared ? 1 : 0.5)
            
            Spacer().frame(height: 24)
            
            // Happy Birthday text
            Text("Happy Birthday!")
                .font(.system(size: 72, weight: .bold, design: .serif))
                .foregroundColor(warmCream)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 20)
            
            Spacer().frame(height: 16)
            
            // Guest name - prominent display
            Text(guestName)
                .font(.system(size: 56, weight: .semibold, design: .serif))
                .foregroundColor(softCopper)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 20)
            
            Spacer().frame(height: 28)
            
            // Decorative divider
            LinearGradient(
                colors: [.clear, copperAccent, .clear],
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(width: 200, height: 1)
            .opacity(appeared ? 1 : 0)
            
            Spacer().frame(height: 28)
            
            // Subtitle
            Text("We hope you have a wonderful birthday\ncelebration at Catfé!")
                .font(.system(size: 24, weight: .medium, design: .serif))
                .foregroundColor(Color(hex: "A89080"))
                .multilineTextAlignment(.center)
                .opacity(appeared ? 1 : 0)
            
            Spacer().frame(height: 32)
            
            // Party emojis row
            HStack(spacing: 24) {
                Text("🎉").font(.system(size: 40))
                Text("🎈").font(.system(size: 40))
                Text("🐱").font(.system(size: 40))
                Text("🎈").font(.system(size: 40))
                Text("🎉").font(.system(size: 40))
            }
            .opacity(appeared ? 1 : 0)
            
            Spacer()
        }
        .padding(.horizontal, 60)
    }
    
    // MARK: - Cat Silhouette
    
    private var catSilhouetteView: some View {
        Canvas { context, size in
            let bodyRect = CGRect(x: size.width * 0.15, y: size.height * 0.45, width: size.width * 0.7, height: size.height * 0.45)
            context.fill(Path(ellipseIn: bodyRect), with: .color(warmCream))
            let headRect = CGRect(x: size.width * 0.25, y: size.height * 0.15, width: size.width * 0.5, height: size.height * 0.4)
            context.fill(Path(ellipseIn: headRect), with: .color(warmCream))
            var leftEar = Path()
            leftEar.move(to: CGPoint(x: size.width * 0.28, y: size.height * 0.08))
            leftEar.addLine(to: CGPoint(x: size.width * 0.38, y: size.height * 0.28))
            leftEar.addLine(to: CGPoint(x: size.width * 0.22, y: size.height * 0.25))
            leftEar.closeSubpath()
            context.fill(leftEar, with: .color(warmCream))
            var rightEar = Path()
            rightEar.move(to: CGPoint(x: size.width * 0.72, y: size.height * 0.08))
            rightEar.addLine(to: CGPoint(x: size.width * 0.62, y: size.height * 0.28))
            rightEar.addLine(to: CGPoint(x: size.width * 0.78, y: size.height * 0.25))
            rightEar.closeSubpath()
            context.fill(rightEar, with: .color(warmCream))
        }
    }
}
