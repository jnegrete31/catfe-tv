//
//  SocialFeedScreenView.swift
//  CatfeTVApp
//
//  Social Feed - displays Instagram posts in a beautiful grid layout
//

import SwiftUI

struct SocialFeedScreenView: View {
    let screen: Screen
    
    @EnvironmentObject var apiClient: APIClient
    @State private var currentPage = 0
    @State private var appeared = false
    
    // Show 6 posts per page (2 rows x 3 columns)
    private let postsPerPage = 6
    
    private var visiblePosts: [SocialPost] {
        apiClient.cachedSocialPosts.filter { !$0.isHidden }
    }
    
    private var totalPages: Int {
        max(1, Int(ceil(Double(visiblePosts.count) / Double(postsPerPage))))
    }
    
    private var currentPagePosts: [SocialPost] {
        let startIndex = currentPage * postsPerPage
        let endIndex = min(startIndex + postsPerPage, visiblePosts.count)
        guard startIndex < visiblePosts.count else { return [] }
        return Array(visiblePosts[startIndex..<endIndex])
    }
    
    var body: some View {
        ZStack {
            // Background - warm Instagram-inspired gradient
            LinearGradient(
                colors: [
                    Color(hex: "1a1a2e"),
                    Color(hex: "2d1b3d"),
                    Color(hex: "1a1a2e")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Decorative circles
            AnimatedCirclesView(color: Color.purple.opacity(0.1))
            
            VStack(spacing: 24) {
                // Header
                headerView
                
                if visiblePosts.isEmpty {
                    emptyStateView
                } else {
                    // Photo Grid
                    photoGridView
                    
                    // Page indicator
                    if totalPages > 1 {
                        pageIndicatorView
                    }
                }
                
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 60)
            .padding(.top, 40)
            .padding(.bottom, 20)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                appeared = true
            }
            // Auto-advance pages
            startPageTimer()
        }
    }
    
    // MARK: - Header
    
    private var headerView: some View {
        HStack(spacing: 16) {
            // Instagram icon
            Image(systemName: "camera.fill")
                .font(.system(size: 36))
                .foregroundColor(.loungeWarmOrange)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(screen.title.isEmpty ? "Social Feed" : screen.title)
                    .font(.system(size: 42, weight: .bold, design: .serif))
                    .foregroundColor(.loungeCream)
                
                Text(screen.subtitle ?? "@catfesantaclarita")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(.loungeWarmOrange.opacity(0.8))
            }
            
            Spacer()
            
            // Post count badge
            Text("\(visiblePosts.count) posts")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.loungeCream.opacity(0.7))
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.1))
                )
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -20)
    }
    
    // MARK: - Photo Grid
    
    private var photoGridView: some View {
        let gridColumns = [
            GridItem(.flexible(), spacing: 16),
            GridItem(.flexible(), spacing: 16),
            GridItem(.flexible(), spacing: 16)
        ]
        
        return LazyVGrid(columns: gridColumns, spacing: 16) {
            ForEach(Array(currentPagePosts.enumerated()), id: \.element.id) { index, post in
                postCard(post: post, index: index)
            }
        }
        .animation(.easeInOut(duration: 0.5), value: currentPage)
    }
    
    // MARK: - Post Card
    
    private func postCard(post: SocialPost, index: Int) -> some View {
        VStack(spacing: 0) {
            // Image
            ScreenImage(url: post.mediaUrl)
                .frame(height: 280)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            
            // Caption (if available)
            if let caption = post.caption, !caption.isEmpty {
                let truncated = String(caption.prefix(80))
                let displayText = caption.count > 80 ? truncated + "..." : truncated
                Text(displayText)
                    .font(.system(size: 16, weight: .regular))
                    .foregroundColor(.loungeCream.opacity(0.7))
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 8)
                    .padding(.horizontal, 4)
            }
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 30)
        .animation(.easeOut(duration: 0.6).delay(Double(index) * 0.1), value: appeared)
    }
    
    // MARK: - Empty State
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "camera.fill")
                .font(.system(size: 80))
                .foregroundColor(.loungeStone.opacity(0.4))
            Text("No posts yet")
                .font(.system(size: 28, weight: .medium))
                .foregroundColor(.loungeStone.opacity(0.6))
            Text("Add Instagram posts in the admin panel")
                .font(.system(size: 20))
                .foregroundColor(.loungeStone.opacity(0.4))
            Spacer()
        }
    }
    
    // MARK: - Page Indicator
    
    private var pageIndicatorView: some View {
        HStack(spacing: 8) {
            ForEach(0..<totalPages, id: \.self) { page in
                Circle()
                    .fill(page == currentPage ? Color.loungeWarmOrange : Color.white.opacity(0.3))
                    .frame(width: 10, height: 10)
            }
        }
    }
    
    // MARK: - Page Timer
    
    private func startPageTimer() {
        guard totalPages > 1 else { return }
        Timer.scheduledTimer(withTimeInterval: 8, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.5)) {
                currentPage = (currentPage + 1) % totalPages
            }
        }
    }
}
