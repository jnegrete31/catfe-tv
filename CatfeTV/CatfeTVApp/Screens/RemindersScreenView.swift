//
//  RemindersScreenView.swift
//  CatfeTVApp
//
//  Reminders and rules screen
//

import SwiftUI

struct RemindersScreenView: View {
    let screen: Screen
    
    private let reminderIcons = [
        "hand.raised.fill",
        "camera.fill",
        "heart.fill",
        "cup.and.saucer.fill",
        "bell.fill",
        "pawprint.fill"
    ]
    
    var body: some View {
        BaseScreenLayout(screen: screen) {
            VStack(spacing: 48) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(screen.title)
                            .font(CatfeTypography.heroTitle)
                            .foregroundColor(.catfeBrown)
                        
                        if let subtitle = screen.subtitle {
                            Text(subtitle)
                                .font(CatfeTypography.title)
                                .foregroundColor(Color(hex: "F57C00"))
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "bell.fill")
                        .font(.system(size: 60))
                        .foregroundColor(Color(hex: "F57C00").opacity(0.3))
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
                                icon: reminderIcons[index % reminderIcons.count],
                                color: Color(hex: "F57C00")
                            )
                        }
                    }
                }
                
                Spacer()
                
                // Footer
                HStack {
                    Text("Thank you for helping us keep our cats happy and healthy!")
                        .font(CatfeTypography.body)
                        .foregroundColor(.catfeBrown.opacity(0.7))
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

// MARK: - Reminder Card

struct ReminderCard: View {
    let text: String
    let icon: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 24) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.15))
                    .frame(width: 80, height: 80)
                
                Image(systemName: icon)
                    .font(.system(size: 36))
                    .foregroundColor(color)
            }
            
            Text(text)
                .font(CatfeTypography.body)
                .foregroundColor(.catfeBrown)
                .multilineTextAlignment(.leading)
            
            Spacer()
        }
        .padding(24)
        .background(Color.white.opacity(0.7))
        .cornerRadius(20)
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
