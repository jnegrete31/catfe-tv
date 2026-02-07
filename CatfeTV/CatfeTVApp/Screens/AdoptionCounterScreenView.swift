//
//  AdoptionCounterScreenView.swift
//  CatfeTVApp
//
//  Adoption Counter screen - matches web design, fills full TV
//

import SwiftUI

struct AdoptionCounterScreenView: View {
    let screen: Screen
    var settings: AppSettings = .default
    
    @State private var appeared = false
    @State private var displayCount: Int = 0
    
    private var targetCount: Int {
        settings.totalAdoptionCount
    }
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            GeometryReader { geo in
                VStack(spacing: 0) {
                    Spacer()
                    
                    // Paw prints
                    Text("🐾")
                        .font(.system(size: 80))
                        .opacity(appeared ? 1 : 0)
                        .scaleEffect(appeared ? 1 : 0.5)
                        .animation(.spring(response: 0.6, dampingFraction: 0.6), value: appeared)
                    
                    Spacer().frame(height: 30)
                    
                    // Counter number
                    Text("\(displayCount)")
                        .font(.system(size: 140, weight: .bold, design: .serif))
                        .foregroundColor(.loungeAmber)
                    
                    Spacer().frame(height: 16)
                    
                    // Title
                    Text(screen.title)
                        .font(.system(size: 48, weight: .bold, design: .serif))
                        .foregroundColor(.loungeCream)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: geo.size.width * 0.7)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                    
                    if let subtitle = screen.subtitle {
                        Spacer().frame(height: 16)
                        Text(subtitle)
                            .font(CatfeTypography.subtitle)
                            .foregroundColor(.loungeCream.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: geo.size.width * 0.6)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                    }
                    
                    Spacer()
                    
                    // QR Code
                    if let qrURL = screen.qrCodeURL, !qrURL.isEmpty {
                        QRCodeView(url: qrURL, size: 150)
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.6), value: appeared)
                    }
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .onAppear {
            withAnimation { appeared = true }
            animateCounter()
        }
    }
    
    private func animateCounter() {
        let steps = 40
        let delay = 1.5 / Double(steps)
        for i in 0...steps {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * delay) {
                withAnimation(.easeOut(duration: 0.05)) {
                    displayCount = Int(Double(targetCount) * Double(i) / Double(steps))
                }
            }
        }
    }
}
