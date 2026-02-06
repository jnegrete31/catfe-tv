//
//  AdoptionScreenView.swift
//  CatfeTVApp
//
//  Individual cat adoption screen - matches web AdoptionScreen design
//

import SwiftUI

struct AdoptionScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    private var catName: String {
        screen.catName ?? screen.title.replacingOccurrences(of: "Meet ", with: "")
    }
    
    var body: some View {
        ZStack {
            // Dark background gradient (#2d2d2d -> #1a1a1a)
            LinearGradient(
                colors: [Color(hex: "2d2d2d"), Color(hex: "1a1a1a")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Mint green floor reflection
            VStack {
                Spacer()
                LinearGradient(
                    colors: [Color.clear, Color.loungeMintGreen.opacity(0.2)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 360)
            }
            .ignoresSafeArea()
            
            // Warm amber light glows from top
            GeometryReader { geo in
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "DAA520").opacity(0.4), Color.clear],
                        center: .center, startRadius: 0, endRadius: geo.size.width * 0.35
                    ))
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.25, y: -geo.size.height * 0.1)
                
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: "DAA520").opacity(0.4), Color.clear],
                        center: .center, startRadius: 0, endRadius: geo.size.width * 0.35
                    ))
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.75, y: -geo.size.height * 0.1)
            }
            
            // Cat silhouettes at 6% opacity
            GeometryReader { geo in
                Text("\u{1F431}")
                    .font(.system(size: 100))
                    .opacity(0.06)
                    .position(x: 80, y: geo.size.height - 120)
                
                Text("\u{1F431}")
                    .font(.system(size: 80))
                    .opacity(0.06)
                    .position(x: geo.size.width - 100, y: 140)
            }
            
            // Main content
            VStack(spacing: 0) {
                // Header: "Meet [name]"
                HStack(spacing: 0) {
                    Text("Meet ")
                        .foregroundColor(.white.opacity(0.9))
                    Text(catName)
                        .foregroundColor(Color(hex: "E8913A"))
                }
                .font(.system(size: 72, weight: .bold, design: .serif))
                .padding(.top, 40)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : -20)
                .animation(.easeOut(duration: 0.6), value: appeared)
                
                Spacer().frame(height: 40)
                
                // Horizontal layout: Polaroid + Info
                HStack(alignment: .top, spacing: 60) {
                    // Left: Polaroid photo
                    if screen.imageURL != nil {
                        VStack(spacing: 0) {
                            ScreenImage(url: screen.imageURL)
                                .frame(width: 420, height: 420)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            
                            // Adopted badge overlay
                            if screen.isAdopted {
                                HStack(spacing: 6) {
                                    Text("\u{1F389}")
                                    Text("Adopted!")
                                        .font(.system(size: 22, weight: .bold))
                                }
                                .foregroundColor(.white)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 8)
                                .background(
                                    LinearGradient(
                                        colors: [Color(hex: "86C5A9"), Color(hex: "6BA58D")],
                                        startPoint: .topLeading, endPoint: .bottomTrailing
                                    )
                                )
                                .cornerRadius(20)
                                .shadow(radius: 8)
                                .offset(y: -30)
                            }
                            
                            Spacer().frame(height: 16)
                            
                            // Name in polaroid bottom
                            Text("Meet \(catName)")
                                .font(.system(size: 28, weight: .medium, design: .serif))
                                .foregroundColor(Color(hex: "3d3d3d"))
                        }
                        .padding(20)
                        .padding(.bottom, 40)
                        .background(Color(hex: "FFFEF9"))
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.5), radius: 30, x: 0, y: 15)
                        .rotationEffect(.degrees(-2))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.8)
                        .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.1), value: appeared)
                    }
                    
                    // Right: Info section
                    VStack(alignment: .leading, spacing: 24) {
                        // Status badge
                        HStack(spacing: 12) {
                            Text(screen.isAdopted ? "\u{1F389}" : "\u{1F431}")
                                .font(.system(size: 30))
                            Text(screen.isAdopted ? "Found a Forever Home!" : "Looking for Love")
                                .font(.system(size: 24, weight: .medium))
                                .foregroundColor(screen.isAdopted ? Color(hex: "86C5A9") : Color(hex: "E8913A"))
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 30)
                                .fill(screen.isAdopted ? Color(hex: "86C5A9").opacity(0.15) : Color(hex: "E8913A").opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 30)
                                        .stroke(screen.isAdopted ? Color(hex: "86C5A9") : Color(hex: "E8913A"), lineWidth: 2)
                                )
                        )
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.9)
                        .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                        
                        // Age, gender, breed info
                        if let age = screen.catAge, let gender = screen.catGender {
                            Text("\(age) \u{2022} \(gender)")
                                .font(.system(size: 36, weight: .light))
                                .foregroundColor(.white.opacity(0.9))
                        }
                        
                        if let breed = screen.catBreed {
                            Text(breed)
                                .font(.system(size: 28, weight: .regular))
                                .foregroundColor(Color.loungeMintGreen)
                        }
                        
                        // Subtitle
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(.system(size: 36, weight: .light))
                                .foregroundColor(.white.opacity(0.9))
                                .opacity(appeared ? 1 : 0)
                                .offset(x: appeared ? 0 : -20)
                                .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                        }
                        
                        // Body / Description
                        if let body = screen.catDescription ?? screen.bodyText {
                            Text(body)
                                .font(.system(size: 24, weight: .regular))
                                .foregroundColor(.white.opacity(0.6))
                                .lineSpacing(6)
                                .lineLimit(5)
                                .opacity(appeared ? 1 : 0)
                                .offset(x: appeared ? 0 : -20)
                                .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                        }
                        
                        // Adoption quote (if not adopted)
                        if !screen.isAdopted {
                            Text("\"Scan the QR to Adopt Me :)\"")
                                .font(.system(size: 20, weight: .regular, design: .serif))
                                .italic()
                                .foregroundColor(.white.opacity(0.7))
                                .padding(20)
                                .background(
                                    RoundedRectangle(cornerRadius: 16)
                                        .fill(Color(hex: "F5E6D3").opacity(0.1))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 16)
                                                .stroke(Color(hex: "F5E6D3").opacity(0.2), lineWidth: 1)
                                        )
                                )
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                        }
                        
                        Spacer()
                        
                        // QR Code in cream gradient card
                        if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                            QRCodeView(url: qrURL, size: 180)
                                .opacity(appeared ? 1 : 0)
                                .scaleEffect(appeared ? 1 : 0.8)
                                .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.6), value: appeared)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(.horizontal, 60)
                
                Spacer()
            }
        }
        .onAppear {
            withAnimation {
                appeared = true
            }
        }
    }
}

// MARK: - Corner Radius Extension

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#if DEBUG
struct AdoptionScreenView_Previews: PreviewProvider {
    static var previews: some View {
        AdoptionScreenView(screen: Screen.sampleScreens[1])
    }
}
#endif

