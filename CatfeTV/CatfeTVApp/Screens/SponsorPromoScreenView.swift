//
//  SponsorPromoScreenView.swift
//  CatfeTVApp
//
//  Sponsor Promo screen - NutriSource + PetStop adoption perk promo.
//  Matches the web app's SPONSOR_PROMO screen type.
//
import SwiftUI

struct SponsorPromoScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    private let nutrisourceLogoUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663322973980/aMDMXCoQ2ycSYTjhkKKJzm/nutrisource-logo-official_a4a0409d.webp"
    private let petstopLogoUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663322973980/aMDMXCoQ2ycSYTjhkKKJzm/petstop-logo_ff8d5686.png"
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                ZStack {
                    // Warm cream gradient background
                    LinearGradient(
                        colors: [
                            Color(hex: "F5E6D3"),
                            Color(hex: "EDE0D4"),
                            Color(hex: "E8DDD0")
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    
                    // Decorative warm glow top-right
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "DAA520").opacity(0.3), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.3
                            )
                        )
                        .frame(width: geo.size.width * 0.5, height: geo.size.width * 0.5)
                        .position(x: geo.size.width * 0.8, y: geo.size.height * 0.15)
                    
                    // Decorative mint glow bottom-left
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color(hex: "86C5A9").opacity(0.2), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.25
                            )
                        )
                        .frame(width: geo.size.width * 0.4, height: geo.size.width * 0.4)
                        .position(x: geo.size.width * 0.15, y: geo.size.height * 0.85)
                    
                    // Mint accent bar at top
                    VStack {
                        Rectangle()
                            .fill(Color(hex: "86C5A9"))
                            .frame(height: 4)
                        Spacer()
                    }
                    
                    // Paw print accents
                    pawPrintAccents(geo: geo)
                    
                    // Main content
                    VStack(spacing: geo.size.height * 0.03) {
                        Spacer()
                        
                        // Top label
                        HStack(spacing: 12) {
                            Rectangle()
                                .fill(Color(hex: "DAA520"))
                                .frame(width: 60, height: 1)
                            
                            Text("ADOPTION PERK")
                                .font(.system(size: geo.size.height * 0.022, weight: .medium))
                                .tracking(6)
                                .foregroundColor(Color(hex: "86C5A9"))
                            
                            Rectangle()
                                .fill(Color(hex: "DAA520"))
                                .frame(width: 60, height: 1)
                        }
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : -20)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                        
                        // Headline
                        Text("FREE Bag of Cat Food")
                            .font(.system(size: geo.size.height * 0.07, weight: .bold, design: .serif))
                            .foregroundColor(Color(hex: "2d2d2d"))
                            .multilineTextAlignment(.center)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 20)
                            .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                        
                        // Subtitle
                        Text("When you adopt from Catfé, head to Pet Stop for your free bag of NutriSource!")
                            .font(.system(size: geo.size.height * 0.03, design: .serif))
                            .foregroundColor(Color(hex: "2d2d2d").opacity(0.6))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, geo.size.width * 0.1)
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 20)
                            .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                        
                        // Logos
                        HStack(spacing: geo.size.width * 0.04) {
                            AsyncImage(url: URL(string: nutrisourceLogoUrl)) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(height: geo.size.height * 0.12)
                                default:
                                    Text("NutriSource")
                                        .font(.system(size: geo.size.height * 0.04, weight: .bold, design: .serif))
                                        .foregroundColor(Color(hex: "2d2d2d"))
                                }
                            }
                            
                            Text("+")
                                .font(.system(size: geo.size.height * 0.05, weight: .bold))
                                .foregroundColor(Color(hex: "DAA520"))
                            
                            AsyncImage(url: URL(string: petstopLogoUrl)) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(height: geo.size.height * 0.12)
                                default:
                                    Text("Pet Stop")
                                        .font(.system(size: geo.size.height * 0.04, weight: .bold, design: .serif))
                                        .foregroundColor(Color(hex: "2d2d2d"))
                                }
                            }
                        }
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.9)
                        .animation(.easeOut(duration: 0.6).delay(0.4), value: appeared)
                        .padding(.vertical, geo.size.height * 0.02)
                        
                        // How it works steps
                        HStack(spacing: geo.size.width * 0.03) {
                            stepView(icon: "cat.fill", label: "Adopt from Catfé", bgColor: "86C5A9", geo: geo)
                            
                            Image(systemName: "arrow.right")
                                .font(.system(size: geo.size.height * 0.03))
                                .foregroundColor(Color(hex: "DAA520"))
                            
                            stepView(icon: "mappin.and.ellipse", label: "Visit Pet Stop", bgColor: "DAA520", geo: geo)
                            
                            Image(systemName: "arrow.right")
                                .font(.system(size: geo.size.height * 0.03))
                                .foregroundColor(Color(hex: "DAA520"))
                            
                            stepView(icon: "gift.fill", label: "Get FREE Food!", bgColor: "E8913A", geo: geo)
                        }
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.6).delay(0.5), value: appeared)
                        
                        Spacer()
                        
                        // Bottom note
                        Text("26870 Sierra Hwy, Santa Clarita · petstopsantaclarita.com")
                            .font(.system(size: geo.size.height * 0.018, weight: .medium))
                            .tracking(1)
                            .foregroundColor(Color(hex: "2d2d2d").opacity(0.4))
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.6).delay(0.7), value: appeared)
                            .padding(.bottom, geo.size.height * 0.05)
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
    
    // MARK: - Step View
    
    private func stepView(icon: String, label: String, bgColor: String, geo: GeometryProxy) -> some View {
        VStack(spacing: geo.size.height * 0.015) {
            ZStack {
                Circle()
                    .fill(Color(hex: bgColor).opacity(0.2))
                    .frame(width: geo.size.height * 0.08, height: geo.size.height * 0.08)
                
                Image(systemName: icon)
                    .font(.system(size: geo.size.height * 0.03))
                    .foregroundColor(Color(hex: bgColor))
            }
            
            Text(label)
                .font(.system(size: geo.size.height * 0.02, weight: .medium, design: .serif))
                .foregroundColor(Color(hex: "2d2d2d"))
                .multilineTextAlignment(.center)
        }
    }
    
    // MARK: - Paw Print Accents
    
    private func pawPrintAccents(geo: GeometryProxy) -> some View {
        ZStack {
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.07))
                .foregroundColor(Color(hex: "2d2d2d").opacity(0.04))
                .rotationEffect(.degrees(-15))
                .position(x: geo.size.width * 0.08, y: geo.size.height * 0.12)
            
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.05))
                .foregroundColor(Color(hex: "2d2d2d").opacity(0.03))
                .rotationEffect(.degrees(25))
                .position(x: geo.size.width * 0.9, y: geo.size.height * 0.1)
            
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.06))
                .foregroundColor(Color(hex: "2d2d2d").opacity(0.03))
                .rotationEffect(.degrees(-30))
                .position(x: geo.size.width * 0.92, y: geo.size.height * 0.88)
            
            Image(systemName: "pawprint.fill")
                .font(.system(size: geo.size.height * 0.05))
                .foregroundColor(Color(hex: "2d2d2d").opacity(0.04))
                .rotationEffect(.degrees(10))
                .position(x: geo.size.width * 0.1, y: geo.size.height * 0.9)
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
