//
//  CatWordCloudScreenView.swift
//  CatfeTVApp
//
//  Cat Word Cloud screen - Community-submitted personality traits
//  Magazine layout: cat photo on left, word cloud on right
//  Matches the EVENT/ADOPTION magazine split-screen style
//

import SwiftUI

struct CatWordCloudScreenView: View {
    let screen: Screen
    
    @State private var appeared = false
    
    // Parse traits from the body field (JSON array of { word, count })
    private var traits: [(word: String, count: Int)] {
        guard let body = screen.bodyText, !body.isEmpty else { return [] }
        guard let data = body.data(using: .utf8) else { return [] }
        
        struct TraitData: Codable {
            let word: String
            let count: Int
        }
        
        let decoded = (try? JSONDecoder().decode([TraitData].self, from: data)) ?? []
        return decoded.map { ($0.word, $0.count) }
    }
    
    private var catName: String {
        screen.catName ?? screen.title
    }
    
    // Warm Catfé color palette for word cloud
    private let wordColors: [Color] = [
        Color(hex: "E8913A"),  // Amber/orange
        Color(hex: "d97706"),  // Dark amber
        Color(hex: "b45309"),  // Brown amber
        Color(hex: "c2410c"),  // Burnt orange
        Color(hex: "ea580c"),  // Orange
        Color(hex: "92400e"),  // Dark brown
        Color(hex: "f59e0b"),  // Yellow amber
        Color(hex: "dc2626"),  // Red
        Color(hex: "e11d48"),  // Rose
        Color(hex: "be123c"),  // Dark rose
        Color(hex: "a16207"),  // Gold brown
        Color(hex: "854d0e"),  // Deep brown
        Color(hex: "9a3412"),  // Rust
    ]
    
    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 0) {
                // LEFT HALF — Cat photo (42% width)
                ZStack(alignment: .bottomLeading) {
                    // Cat photo
                    if let imageURL = screen.imageURL, !imageURL.isEmpty {
                        ScreenImage(url: imageURL)
                            .frame(width: geometry.size.width * 0.42, height: geometry.size.height)
                            .clipped()
                    } else {
                        Rectangle()
                            .fill(Color(hex: "e8e4dc"))
                            .frame(width: geometry.size.width * 0.42, height: geometry.size.height)
                            .overlay(
                                Text("🐱")
                                    .font(.system(size: 180))
                            )
                    }
                    
                    // Gradient overlay at bottom for name
                    LinearGradient(
                        colors: [Color.clear, Color.black.opacity(0.7)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 200)
                    .frame(maxWidth: .infinity, alignment: .bottom)
                    
                    // Cat name at bottom of photo
                    Text(catName)
                        .font(.system(size: 56, weight: .heavy, design: .rounded))
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.5), radius: 8, x: 0, y: 4)
                        .padding(.horizontal, 40)
                        .padding(.bottom, 30)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                }
                .frame(width: geometry.size.width * 0.42)
                .opacity(appeared ? 1 : 0)
                .offset(x: appeared ? 0 : -40)
                .animation(.easeOut(duration: 0.7), value: appeared)
                
                // ORANGE ACCENT DIVIDER
                Rectangle()
                    .fill(Color(hex: "E8913A"))
                    .frame(width: 5)
                
                // RIGHT HALF — Word Cloud
                ZStack {
                    // Cream background
                    Color(hex: "FAFAF5")
                    
                    // Subtle paw print watermark
                    PawWatermark()
                        .opacity(0.04)
                        .frame(width: 120, height: 120)
                        .position(x: geometry.size.width * 0.58 - 80, y: 80)
                    
                    VStack(alignment: .leading, spacing: 20) {
                        // Header
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 12) {
                                Text("💬")
                                    .font(.system(size: 36))
                                Text("WHAT GUESTS SAY")
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .tracking(3)
                                    .foregroundColor(Color(hex: "E8913A"))
                            }
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                            
                            Text("About \(catName)")
                                .font(.system(size: 56, weight: .heavy, design: .rounded))
                                .foregroundColor(Color(hex: "1a1a1a"))
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                            
                            // Orange underline
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color(hex: "E8913A"))
                                .frame(width: 160, height: 4)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5).delay(0.35), value: appeared)
                        }
                        .padding(.top, 40)
                        
                        Spacer().frame(height: 10)
                        
                        // Word Cloud area
                        wordCloudView
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.8).delay(0.5), value: appeared)
                        
                        Spacer()
                        
                        // Footer CTA with QR Code
                        HStack(spacing: 20) {
                            // QR Code
                            if let qrUrl = screen.qrCodeURL, !qrUrl.isEmpty {
                                let fullUrl = qrUrl.hasPrefix("http") ? qrUrl : "https://tv.catfe.la" + qrUrl
                                QRCodeView(url: fullUrl, size: 100, label: nil)
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(screen.qrLabel ?? "Add your words for \(catName)!")
                                    .font(.system(size: 22, weight: .semibold, design: .rounded))
                                    .foregroundColor(Color(hex: "92400e"))
                                Text("Scan to visit \(catName)'s profile")
                                    .font(.system(size: 18, weight: .medium, design: .rounded))
                                    .foregroundColor(Color(hex: "b45309"))
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 14)
                        .background(Color(hex: "E8913A").opacity(0.1))
                        .cornerRadius(16)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(1.0), value: appeared)
                        
                        Spacer().frame(height: 20)
                    }
                    .padding(.horizontal, 50)
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
    
    // MARK: - Word Cloud View
    
    @ViewBuilder
    private var wordCloudView: some View {
        let maxCount = traits.map(\.count).max() ?? 1
        let minCount = traits.map(\.count).min() ?? 1
        
        // Use a wrapping layout via multiple HStacks
        let rows = distributeTraitsIntoRows(traits: traits, maxCount: maxCount, minCount: minCount)
        
        VStack(spacing: 16) {
            ForEach(Array(rows.enumerated()), id: \.offset) { rowIndex, row in
                HStack(spacing: 14) {
                    Spacer()
                    ForEach(Array(row.enumerated()), id: \.offset) { itemIndex, item in
                        let globalIndex = rows.prefix(rowIndex).flatMap({ $0 }).count + itemIndex
                        let ratio = maxCount == minCount ? 0.5 : Double(item.count - minCount) / Double(maxCount - minCount)
                        let fontSize = 24.0 + ratio * 48.0 // 24pt to 72pt
                        let color = wordColors[globalIndex % wordColors.count]
                        let rotation = globalIndex % 5 == 0 ? -6.0 : (globalIndex % 7 == 0 ? 5.0 : (globalIndex % 3 == 0 ? -3.0 : 0.0))
                        
                        Text(item.word)
                            .font(.system(size: CGFloat(fontSize), weight: .bold, design: .rounded))
                            .foregroundColor(color)
                            .opacity(0.7 + ratio * 0.3)
                            .rotationEffect(.degrees(rotation))
                            .scaleEffect(appeared ? 1 : 0.5)
                            .animation(
                                .spring(response: 0.5, dampingFraction: 0.6)
                                    .delay(0.6 + Double(globalIndex) * 0.08),
                                value: appeared
                            )
                    }
                    Spacer()
                }
            }
        }
    }
    
    // Distribute traits into rows for a natural word cloud layout
    private func distributeTraitsIntoRows(traits: [(word: String, count: Int)], maxCount: Int, minCount: Int) -> [[(word: String, count: Int)]] {
        guard !traits.isEmpty else { return [] }
        
        // Sort by count descending so bigger words are more central
        let sorted = traits.sorted { $0.count > $1.count }
        
        // Aim for roughly 3-5 rows depending on trait count
        let targetRows = min(max(3, sorted.count / 3), 5)
        var rows: [[(word: String, count: Int)]] = Array(repeating: [], count: targetRows)
        
        for (index, trait) in sorted.enumerated() {
            // Distribute in a zigzag pattern: center rows get bigger words
            let rowIndex: Int
            if index < targetRows {
                // First pass: one per row, center first
                let mid = targetRows / 2
                let offsets = [0, -1, 1, -2, 2, -3, 3]
                let offset = index < offsets.count ? offsets[index] : index - mid
                rowIndex = max(0, min(targetRows - 1, mid + offset))
            } else {
                rowIndex = index % targetRows
            }
            rows[rowIndex].append(trait)
        }
        
        // Remove empty rows
        return rows.filter { !$0.isEmpty }
    }
}

// MARK: - Paw Print Watermark

private struct PawWatermark: View {
    var body: some View {
        Canvas { context, size in
            let mainPad = CGRect(
                x: size.width * 0.3, y: size.height * 0.5,
                width: size.width * 0.4, height: size.height * 0.35
            )
            context.fill(Ellipse().path(in: mainPad), with: .color(Color(hex: "E8913A")))
            
            // Toe beans
            let toePositions: [(CGFloat, CGFloat, CGFloat)] = [
                (0.22, 0.28, 0.12),
                (0.42, 0.18, 0.12),
                (0.58, 0.18, 0.12),
                (0.78, 0.28, 0.12),
            ]
            for (px, py, r) in toePositions {
                let rect = CGRect(
                    x: size.width * px - size.width * r / 2,
                    y: size.height * py - size.height * r / 2,
                    width: size.width * r,
                    height: size.height * r
                )
                context.fill(Circle().path(in: rect), with: .color(Color(hex: "E8913A")))
            }
        }
    }
}

// MARK: - Preview

#if DEBUG
struct CatWordCloudScreenView_Previews: PreviewProvider {
    static var previews: some View {
        let sampleTraits = [
            ["word": "Playful", "count": 8],
            ["word": "Cuddly", "count": 6],
            ["word": "Curious", "count": 5],
            ["word": "Gentle", "count": 4],
            ["word": "Shy", "count": 3],
            ["word": "Adventurous", "count": 3],
            ["word": "Sleepy", "count": 2],
            ["word": "Friendly", "count": 7],
            ["word": "Sweet", "count": 5],
            ["word": "Sassy", "count": 4],
        ]
        let traitsJSON = (try? JSONSerialization.data(withJSONObject: sampleTraits)) ?? Data()
        let traitsString = String(data: traitsJSON, encoding: .utf8) ?? "[]"
        
        CatWordCloudScreenView(screen: Screen(
            type: .catWordCloud,
            title: "Alpaca",
            bodyText: traitsString,
            imageURL: nil,
            catName: "Alpaca"
        ))
    }
}
#endif
