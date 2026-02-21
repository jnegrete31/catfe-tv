//
//  VolunteerSpotlightScreenView.swift
//  CatfeTVApp
//
//  Volunteer Spotlight - highlights featured volunteers
//

import SwiftUI

struct VolunteerSpotlightScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var appeared = false
    @State private var currentIndex = 0
    
    private var volunteers: [Volunteer] {
        apiClient.cachedFeaturedVolunteers
    }
    
    private var currentVolunteer: Volunteer? {
        guard !volunteers.isEmpty else { return nil }
        return volunteers[currentIndex % volunteers.count]
    }
    
    var body: some View {
        ZStack {
            // Background - sage/green inspired
            volunteerBackground
            
            VStack(spacing: 0) {
                // Header
                headerView
                    .padding(.top, 40)
                    .padding(.horizontal, 60)
                
                Spacer(minLength: 20)
                
                if let volunteer = currentVolunteer {
                    // Featured volunteer card
                    volunteerCard(volunteer: volunteer)
                        .padding(.horizontal, 80)
                } else {
                    emptyStateView
                }
                
                Spacer(minLength: 20)
                
                // Navigation dots
                if volunteers.count > 1 {
                    navigationDots
                        .padding(.bottom, 30)
                }
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                appeared = true
            }
            if volunteers.count > 1 {
                startRotationTimer()
            }
        }
    }
    
    // MARK: - Background
    
    private var volunteerBackground: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(hex: "1a2e1a"),
                    Color(hex: "1a1a2e"),
                    Color(hex: "1a2e1a")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Sage green glow
            GeometryReader { geo in
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.catfeSage.opacity(0.25), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.35
                        )
                    )
                    .frame(width: geo.size.width * 0.7, height: geo.size.width * 0.7)
                    .position(x: geo.size.width * 0.3, y: geo.size.height * 0.4)
                
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.loungeMintGreen.opacity(0.15), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geo.size.width * 0.3
                        )
                    )
                    .frame(width: geo.size.width * 0.6, height: geo.size.width * 0.6)
                    .position(x: geo.size.width * 0.75, y: geo.size.height * 0.6)
            }
        }
    }
    
    // MARK: - Header
    
    private var headerView: some View {
        HStack(spacing: 16) {
            Image(systemName: "star.fill")
                .font(.system(size: 32))
                .foregroundColor(.catfeSage)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(screen.title.isEmpty ? "Volunteer Spotlight" : screen.title)
                    .font(.system(size: 42, weight: .bold, design: .serif))
                    .foregroundColor(.loungeCream)
                
                Text(screen.subtitle ?? "Thank you for making Catfé possible")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(.catfeSage.opacity(0.8))
            }
            
            Spacer()
            
            Image(systemName: "heart.fill")
                .font(.system(size: 28))
                .foregroundColor(.catfeSage.opacity(0.6))
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -20)
    }
    
    // MARK: - Volunteer Card
    
    private func volunteerCard(volunteer: Volunteer) -> some View {
        HStack(spacing: 40) {
            // Photo
            volunteerPhoto(volunteer: volunteer)
            
            // Info
            volunteerInfo(volunteer: volunteer)
        }
        .padding(40)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.white.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(Color.catfeSage.opacity(0.3), lineWidth: 1)
                )
        )
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 30)
    }
    
    private func volunteerPhoto(volunteer: Volunteer) -> some View {
        Group {
            if let photoUrl = volunteer.photoUrl, !photoUrl.isEmpty {
                ScreenImage(url: photoUrl)
                    .frame(width: 320, height: 380)
                    .clipShape(RoundedRectangle(cornerRadius: 20))
            } else {
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.catfeSage.opacity(0.2))
                    .frame(width: 320, height: 380)
                    .overlay(
                        VStack(spacing: 12) {
                            Image(systemName: "person.fill")
                                .font(.system(size: 80))
                                .foregroundColor(.catfeSage.opacity(0.4))
                            Text(String(volunteer.name.prefix(1)))
                                .font(.system(size: 60, weight: .bold, design: .serif))
                                .foregroundColor(.catfeSage.opacity(0.6))
                        }
                    )
            }
        }
        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
    }
    
    private func volunteerInfo(volunteer: Volunteer) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Name
            Text(volunteer.name)
                .font(.system(size: 48, weight: .bold, design: .serif))
                .foregroundColor(.loungeCream)
            
            // Role
            if let role = volunteer.role, !role.isEmpty {
                HStack(spacing: 8) {
                    Image(systemName: "briefcase.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.catfeSage)
                    Text(role)
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundColor(.catfeSage)
                }
            }
            
            // Divider
            Rectangle()
                .fill(Color.catfeSage.opacity(0.3))
                .frame(height: 1)
                .padding(.vertical, 8)
            
            // Bio
            if let bio = volunteer.bio, !bio.isEmpty {
                Text(bio)
                    .font(.system(size: 22, weight: .regular, design: .serif))
                    .foregroundColor(.loungeCream.opacity(0.8))
                    .lineSpacing(6)
                    .lineLimit(6)
            }
            
            Spacer(minLength: 0)
            
            // Thank you message
            HStack(spacing: 8) {
                Image(systemName: "heart.fill")
                    .font(.system(size: 16))
                    .foregroundColor(.catfeBlush)
                Text("Thank you for volunteering!")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.catfeBlush.opacity(0.8))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Navigation Dots
    
    private var navigationDots: some View {
        HStack(spacing: 8) {
            ForEach(0..<volunteers.count, id: \.self) { index in
                Circle()
                    .fill(index == (currentIndex % volunteers.count) ? Color.catfeSage : Color.white.opacity(0.3))
                    .frame(width: 10, height: 10)
            }
        }
    }
    
    // MARK: - Empty State
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "star.fill")
                .font(.system(size: 80))
                .foregroundColor(.loungeStone.opacity(0.4))
            Text("No featured volunteers yet")
                .font(.system(size: 28, weight: .medium))
                .foregroundColor(.loungeStone.opacity(0.6))
            Text("Add volunteers in the admin panel")
                .font(.system(size: 20))
                .foregroundColor(.loungeStone.opacity(0.4))
            Spacer()
        }
    }
    
    // MARK: - Rotation Timer
    
    private func startRotationTimer() {
        Timer.scheduledTimer(withTimeInterval: 10, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.6)) {
                currentIndex += 1
            }
        }
    }
}
