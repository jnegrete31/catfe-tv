//
//  SponsorPromoScreenView.swift
//  CatfeTVApp
//
//  Sponsor Promo screen — Premium dark theme
//  NutriSource + PetStop adoption perk promo.
//  Matches the Adoption Counter's premium dark aesthetic.
//

import SwiftUI

// MARK: - Premium Dark Theme Colors (shared with AdoptionCounter)

private let promoBg = Color(hex: "1C1410")
private let promoCream = Color(hex: "F5E6D3")
private let promoCopper = Color(hex: "C4956A")
private let promoBronze = Color(hex: "B87333")
private let promoGold = Color(hex: "D4A574")
private let promoAmber = Color(hex: "E8913A")
private let promoGoldenrod = Color(hex: "DAA520")
private let promoMint = Color(hex: "86C5A9")
private let promoDarkCard = Color(hex: "2A1F18")

struct SponsorPromoScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    private let nutrisourceLogoUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663322973980/aMDMXCoQ2ycSYTjhkKKJzm/nutrisource-logo-official_a4a0409d.webp"
    private let petstopLogoUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663322973980/aMDMXCoQ2ycSYTjhkKKJzm/petstop-logo_ff8d5686.png"
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                ZStack {
                    // Full dark background
                    promoBg.ignoresSafeArea()
                    
                    // Warm radial glows
                    Circle()
                        .fill(RadialGradient(
                            colors: [Color(hex: "8B5E3C").opacity(0.12), .clear],
                            center: .center, startRadius: 0,
                            endRadius: geo.size.width * 0.35
                        ))
                        .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                        .position(x: geo.size.width * 0.2, y: geo.size.height * 0.1)
                    
                    Circle()
                        .fill(RadialGradient(
                            colors: [promoCopper.opacity(0.08), .clear],
                            center: .center, startRadius: 0,
                            endRadius: geo.size.width * 0.25
                        ))
                        .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                        .position(x: geo.size.width * 0.8, y: geo.size.height * 0.85)
                    
                    Circle()
                        .fill(RadialGradient(
                            colors: [promoMint.opacity(0.06), .clear],
                            center: .center, startRadius: 0,
                            endRadius: geo.size.width * 0.15
                        ))
                        .frame(width: geo.size.width * 0.3, height: geo.size.width * 0.3)
                        .position(x: geo.size.width * 0.6, y: geo.size.height * 0.4)
                    
                    // Top accent line
                    VStack {
                        LinearGradient(
                            colors: [.clear, promoCopper, promoBronze, promoGold, .clear],
                            startPoint: .leading, endPoint: .trailing
                        )
                        .frame(height: 2)
                        Spacer()
                    }
                    .ignoresSafeArea()
                    
                    // Bottom accent line
                    VStack {
                        Spacer()
                        LinearGradient(
                            colors: [.clear, promoCopper, promoBronze, promoCopper, .clear],
                            startPoint: .leading, endPoint: .trailing
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
                                .rotationEffect(.degrees(12))
                                .frame(width: 70, height: 70)
                                .padding(.trailing, 40)
                                .padding(.top, 40)
                        }
                        Spacer()
                    }
                    
                    // Main content
                    VStack(spacing: 0) {
                        Spacer()
                        
                        // Top label with decorative lines
                        HStack(spacing: 14) {
                            LinearGradient(
                                colors: [.clear, promoCopper],
                                startPoint: .leading, endPoint: .trailing
                            )
                            .frame(width: 60, height: 1)
                            
                            Text("✦ Adoption Perk ✦")
                                .font(.system(size: 14, weight: .medium, design: .serif))
                                .tracking(6)
                                .textCase(.uppercase)
                                .foregroundColor(promoMint)
                            
                            LinearGradient(
                                colors: [promoCopper, .clear],
                                startPoint: .leading, endPoint: .trailing
                            )
                            .frame(width: 60, height: 1)
                        }
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : -15)
                        .animation(.easeOut(duration: 0.8), value: appeared)
                        .padding(.bottom, 20)
                        
                        // Headline with gradient text
                        Text("FREE Bag of Cat Food")
                            .font(.system(size: geo.size.height * 0.08, weight: .black, design: .serif))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [promoAmber, promoGoldenrod, promoGold],
                                    startPoint: .top, endPoint: .bottom
                                )
                            )
                            .shadow(color: promoGoldenrod.opacity(0.3), radius: 20, y: 4)
                            .multilineTextAlignment(.center)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 20)
                            .animation(.easeOut(duration: 0.8).delay(0.2), value: appeared)
                        
                        // Subtitle
                        Text("Adopt from Catfé & head to Pet Stop for your free bag of NutriSource!")
                            .font(.system(size: 20, weight: .regular, design: .serif))
                            .foregroundColor(promoCream.opacity(0.5))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, geo.size.width * 0.15)
                            .padding(.top, 8)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 15)
                            .animation(.easeOut(duration: 0.8).delay(0.3), value: appeared)
                        
                        // Logos in decorative frame
                        logoFrame(geo: geo)
                            .padding(.top, 28)
                            .opacity(appeared ? 1 : 0)
                            .scaleEffect(appeared ? 1 : 0.9)
                            .animation(.easeOut(duration: 0.8).delay(0.4), value: appeared)
                        
                        // How it works steps
                        stepsView(geo: geo)
                            .padding(.top, 28)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 15)
                            .animation(.easeOut(duration: 0.8).delay(0.5), value: appeared)
                        
                        Spacer()
                        
                        // Bottom note
                        HStack(spacing: 10) {
                            LinearGradient(
                                colors: [.clear, promoCopper.opacity(0.3)],
                                startPoint: .leading, endPoint: .trailing
                            )
                            .frame(width: 30, height: 1)
                            
                            Text("26870 Sierra Hwy, Santa Clarita · petstopsantaclarita.com")
                                .font(.system(size: 12, weight: .medium, design: .serif))
                                .tracking(1.5)
                                .foregroundColor(promoCopper.opacity(0.4))
                            
                            LinearGradient(
                                colors: [promoCopper.opacity(0.3), .clear],
                                startPoint: .leading, endPoint: .trailing
                            )
                            .frame(width: 30, height: 1)
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.8).delay(0.7), value: appeared)
                        .padding(.bottom, geo.size.height * 0.04)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
        }
        .onAppear {
            withAnimation(.easeIn(duration: 0.5)) {
                appeared = true
            }
        }
    }
    
    // MARK: - Logo Frame
    
    private func logoFrame(geo: GeometryProxy) -> some View {
        ZStack {
            // Frame background
            RoundedRectangle(cornerRadius: 4)
                .fill(
                    LinearGradient(
                        colors: [promoDarkCard.opacity(0.8), promoBg.opacity(0.9)],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(promoCopper.opacity(0.2), lineWidth: 1)
                )
                .shadow(color: promoBronze.opacity(0.08), radius: 30)
            
            // Corner accents
            cornerAccents
            
            // Logo content
            HStack(spacing: geo.size.width * 0.04) {
                // NutriSource logo on light background
                RoundedRectangle(cornerRadius: 6)
                    .fill(promoCream.opacity(0.95))
                    .frame(width: geo.size.height * 0.18, height: geo.size.height * 0.12)
                    .overlay(
                        AsyncImage(url: URL(string: nutrisourceLogoUrl)) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .padding(8)
                            default:
                                Text("NutriSource")
                                    .font(.system(size: 16, weight: .bold, design: .serif))
                                    .foregroundColor(Color(hex: "2d2d2d"))
                            }
                        }
                    )
                
                Text("+")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(promoGold)
                
                // PetStop logo on light background
                RoundedRectangle(cornerRadius: 6)
                    .fill(promoCream.opacity(0.95))
                    .frame(width: geo.size.height * 0.18, height: geo.size.height * 0.12)
                    .overlay(
                        AsyncImage(url: URL(string: petstopLogoUrl)) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .padding(8)
                            default:
                                Text("Pet Stop")
                                    .font(.system(size: 16, weight: .bold, design: .serif))
                                    .foregroundColor(Color(hex: "2d2d2d"))
                            }
                        }
                    )
            }
            .padding(.vertical, 16)
            .padding(.horizontal, 24)
        }
        .fixedSize()
    }
    
    // MARK: - Corner Accents
    
    private var cornerAccents: some View {
        GeometryReader { geo in
            let cornerSize: CGFloat = 12
            let lineWidth: CGFloat = 1.5
            
            // Top-left
            Path { path in
                path.move(to: CGPoint(x: 0, y: cornerSize))
                path.addLine(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: cornerSize, y: 0))
            }
            .stroke(promoCopper, lineWidth: lineWidth)
            
            // Top-right
            Path { path in
                path.move(to: CGPoint(x: geo.size.width - cornerSize, y: 0))
                path.addLine(to: CGPoint(x: geo.size.width, y: 0))
                path.addLine(to: CGPoint(x: geo.size.width, y: cornerSize))
            }
            .stroke(promoCopper, lineWidth: lineWidth)
            
            // Bottom-left
            Path { path in
                path.move(to: CGPoint(x: 0, y: geo.size.height - cornerSize))
                path.addLine(to: CGPoint(x: 0, y: geo.size.height))
                path.addLine(to: CGPoint(x: cornerSize, y: geo.size.height))
            }
            .stroke(promoCopper, lineWidth: lineWidth)
            
            // Bottom-right
            Path { path in
                path.move(to: CGPoint(x: geo.size.width - cornerSize, y: geo.size.height))
                path.addLine(to: CGPoint(x: geo.size.width, y: geo.size.height))
                path.addLine(to: CGPoint(x: geo.size.width, y: geo.size.height - cornerSize))
            }
            .stroke(promoCopper, lineWidth: lineWidth)
        }
    }
    
    // MARK: - Steps View
    
    private func stepsView(geo: GeometryProxy) -> some View {
        HStack(spacing: geo.size.width * 0.02) {
            stepView(icon: "cat.fill", label: "Adopt from Catfé", accentColor: promoMint, geo: geo)
            
            stepArrow
            
            stepView(icon: "mappin.and.ellipse", label: "Visit Pet Stop", accentColor: promoGoldenrod, geo: geo)
            
            stepArrow
            
            stepView(icon: "gift.fill", label: "Get FREE Food!", accentColor: promoAmber, geo: geo)
        }
    }
    
    private func stepView(icon: String, label: String, accentColor: Color, geo: GeometryProxy) -> some View {
        VStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(accentColor.opacity(0.12))
                    .frame(width: 52, height: 52)
                
                Circle()
                    .stroke(accentColor.opacity(0.25), lineWidth: 1)
                    .frame(width: 52, height: 52)
                
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(accentColor)
            }
            
            Text(label)
                .font(.system(size: 14, weight: .medium, design: .serif))
                .foregroundColor(promoCream)
                .multilineTextAlignment(.center)
        }
    }
    
    private var stepArrow: some View {
        Image(systemName: "chevron.right")
            .font(.system(size: 20, weight: .semibold))
            .foregroundStyle(
                LinearGradient(
                    colors: [promoCopper, promoGoldenrod],
                    startPoint: .leading, endPoint: .trailing
                )
            )
            .padding(.bottom, 24) // offset to align with circle centers, not labels
    }
    
    // MARK: - Cat Silhouette
    
    private var catSilhouetteView: some View {
        Canvas { context, size in
            // Body (ellipse)
            let bodyRect = CGRect(
                x: size.width * 0.15,
                y: size.height * 0.35,
                width: size.width * 0.7,
                height: size.height * 0.55
            )
            context.fill(Ellipse().path(in: bodyRect), with: .color(promoCream))
            
            // Head (circle)
            let headSize = size.width * 0.44
            let headRect = CGRect(
                x: (size.width - headSize) / 2,
                y: size.height * 0.08,
                width: headSize,
                height: headSize
            )
            context.fill(Circle().path(in: headRect), with: .color(promoCream))
            
            // Left ear
            var leftEar = Path()
            leftEar.move(to: CGPoint(x: size.width * 0.30, y: size.height * 0.15))
            leftEar.addLine(to: CGPoint(x: size.width * 0.35, y: size.height * 0.35))
            leftEar.addLine(to: CGPoint(x: size.width * 0.25, y: size.height * 0.30))
            leftEar.closeSubpath()
            context.fill(leftEar, with: .color(promoCream))
            
            // Right ear
            var rightEar = Path()
            rightEar.move(to: CGPoint(x: size.width * 0.70, y: size.height * 0.15))
            rightEar.addLine(to: CGPoint(x: size.width * 0.65, y: size.height * 0.35))
            rightEar.addLine(to: CGPoint(x: size.width * 0.75, y: size.height * 0.30))
            rightEar.closeSubpath()
            context.fill(rightEar, with: .color(promoCream))
        }
    }
}

#Preview {
    SponsorPromoScreenView(
        screen: Screen(
            type: .sponsorPromo,
            title: "NutriSource + Pet Stop",
            subtitle: "FREE bag of cat food when you adopt!",
            duration: 10
        )
    )
}
