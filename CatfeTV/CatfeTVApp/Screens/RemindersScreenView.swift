//
//  RemindersScreenView.swift
//  CatfeTVApp
//
//  Reminders and rules screen - Lounge-inspired design
//

import SwiftUI

struct RemindersScreenView: View {
    let screen: Screen
    
    private let reminderEmojis = [
        "✋",
        "📸",
        "❤️",
        "☕",
        "🔔",
        "🐾"
    ]
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            VStack(spacing: 48) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 8) {
                        // Badge with emoji
                        ScreenBadge(
                            text: "Friendly Reminders",
                            color: .loungeWarmOrange,
                            emoji: "📢"
                        )
                        
                        Text(screen.title)
                            .font(CatfeTypography.heroTitle)
                            .foregroundColor(.loungeCream)
                        
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(CatfeTypography.title)
                                .foregroundColor(.loungeWarmOrange)
                        }
                    }
                    
                    Spacer()
                    
                    Text("🐱")
                        .font(.system(size: 80))
                        .opacity(0.3)
                }
                
                // Reminders Grid
                if let body = screen.bodyText {
                    let reminders = body.components(separatedBy: "\n").filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 32),
                        GridItem(.flexible(), spacing: 32)
                    ], spacing: 32) {
                        ForEach(Array(reminders.enumerated()), id: \.offset) { index, reminder in
                            ReminderCard(
                                text: reminder.replacingOccurrences(of: "• ", with: ""),
                                emoji: reminderEmojis[index % reminderEmojis.count]
                            )
                        }
                    }
                }
                
                Spacer()
                
                // Footer
                HStack {
                    Text("Thank you for helping us keep our cats happy and healthy!")
                        .font(CatfeTypography.body)
                        .foregroundColor(.loungeCream.opacity(0.7))
                        .italic()
                    
                    Spacer()
                    
                    if let qrURL = screen.qrCodeURL {
                        QRCodeView(url: qrURL, size: 120)
                    }
                }
            }
        }
    }
}

// MARK: - Reminder Card (Lounge-inspired)

struct ReminderCard: View {
    let text: String
    let emoji: String
    
    var body: some View {
        HStack(spacing: 24) {
            ZStack {
                Circle()
                    .fill(Color.loungeWarmOrange.opacity(0.2))
                    .frame(width: 80, height: 80)
                
                Text(emoji)
                    .font(.system(size: 36))
            }
            
            Text(text)
                .font(CatfeTypography.body)
                .foregroundColor(.loungeCharcoal)
                .multilineTextAlignment(.leading)
            
            Spacer()
        }
        .padding(24)
        .background(Color.loungeCream)
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
    }
}

// MARK: - Preview

#if DEBUG
struct RemindersScreenView_Previews: PreviewProvider {
    static var previews: some View {
        RemindersScreenView(screen: Screen.sampleScreens[5])
    }
}
#endif
