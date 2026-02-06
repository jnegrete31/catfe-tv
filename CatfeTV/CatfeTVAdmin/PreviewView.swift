//
//  PreviewView.swift
//  CatfeTVAdmin
//
//  Live 16:9 preview of how screens will look on TV
//

import SwiftUI

struct PreviewView: View {
    @EnvironmentObject var apiClient: APIClient
    @EnvironmentObject var weatherService: WeatherService
    
    @State private var currentIndex = 0
    @State private var isPlaying = false
    @State private var timer: Timer?
    
    var activeScreens: [Screen] {
        apiClient.getActiveScreens()
    }
    
    var body: some View {
        GeometryReader { geometry in
            let previewWidth = geometry.size.width - 32
            let previewHeight = previewWidth * 9 / 16
            
            ScrollView {
                VStack(spacing: 20) {
                    // 16:9 Preview Container
                    ZStack {
                        if activeScreens.isEmpty {
                            EmptyPreviewView()
                        } else {
                            MiniScreenPreview(screen: activeScreens[currentIndex])
                                .id(activeScreens[currentIndex].id)
                                .transition(.opacity)
                        }
                        
                        // Weather overlay (mini version)
                        VStack {
                            HStack {
                                Spacer()
                                MiniWeatherWidget()
                                    .padding(12)
                            }
                            Spacer()
                        }
                    }
                    .frame(width: previewWidth, height: previewHeight)
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.2), radius: 10)
                    
                    // Playback Controls
                    HStack(spacing: 24) {
                        Button {
                            previousScreen()
                        } label: {
                            Image(systemName: "backward.fill")
                                .font(.title2)
                        }
                        .disabled(activeScreens.isEmpty)
                        
                        Button {
                            togglePlayback()
                        } label: {
                            Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                                .font(.title)
                        }
                        .disabled(activeScreens.isEmpty)
                        
                        Button {
                            nextScreen()
                        } label: {
                            Image(systemName: "forward.fill")
                                .font(.title2)
                        }
                        .disabled(activeScreens.isEmpty)
                    }
                    .foregroundColor(.catfeTerracotta)
                    
                    // Screen Info
                    if !activeScreens.isEmpty {
                        VStack(spacing: 8) {
                            Text(activeScreens[currentIndex].title)
                                .font(.headline)
                            
                            Text("\(currentIndex + 1) of \(activeScreens.count)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            // Duration indicator
                            HStack {
                                Image(systemName: "clock")
                                Text("\(activeScreens[currentIndex].duration) seconds")
                            }
                            .font(.caption)
                            .foregroundColor(.secondary)
                        }
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    // Screen Thumbnails
                    if !activeScreens.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(Array(activeScreens.enumerated()), id: \.element.id) { index, screen in
                                    ScreenThumbnail(
                                        screen: screen,
                                        isSelected: index == currentIndex
                                    )
                                    .onTapGesture {
                                        goToScreen(index)
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                    
                    Spacer(minLength: 40)
                }
                .padding()
            }
        }
        .navigationTitle("Preview")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    Task {
                        await apiClient.fetchScreens()
                    }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
            }
        }
        .onDisappear {
            stopPlayback()
        }
    }
    
    // MARK: - Playback Controls
    
    private func togglePlayback() {
        if isPlaying {
            stopPlayback()
        } else {
            startPlayback()
        }
    }
    
    private func startPlayback() {
        guard !activeScreens.isEmpty else { return }
        isPlaying = true
        scheduleNextScreen()
    }
    
    private func stopPlayback() {
        isPlaying = false
        timer?.invalidate()
        timer = nil
    }
    
    private func scheduleNextScreen() {
        guard isPlaying, !activeScreens.isEmpty else { return }
        
        let duration = TimeInterval(activeScreens[currentIndex].duration)
        timer = Timer.scheduledTimer(withTimeInterval: duration, repeats: false) { _ in
            nextScreen()
            if isPlaying {
                scheduleNextScreen()
            }
        }
    }
    
    private func nextScreen() {
        guard !activeScreens.isEmpty else { return }
        withAnimation(.easeInOut(duration: 0.5)) {
            currentIndex = (currentIndex + 1) % activeScreens.count
        }
        HapticFeedback.light()
    }
    
    private func previousScreen() {
        guard !activeScreens.isEmpty else { return }
        withAnimation(.easeInOut(duration: 0.5)) {
            currentIndex = (currentIndex - 1 + activeScreens.count) % activeScreens.count
        }
        HapticFeedback.light()
    }
    
    private func goToScreen(_ index: Int) {
        guard index >= 0, index < activeScreens.count else { return }
        withAnimation(.easeInOut(duration: 0.5)) {
            currentIndex = index
        }
        HapticFeedback.selection()
        
        // Reset timer if playing
        if isPlaying {
            timer?.invalidate()
            scheduleNextScreen()
        }
    }
}

// MARK: - Empty Preview View

struct EmptyPreviewView: View {
    var body: some View {
        ZStack {
            Color.catfeCream
            
            VStack(spacing: 16) {
                Image(systemName: "tv")
                    .font(.system(size: 48))
                    .foregroundColor(.catfeBrown.opacity(0.3))
                
                Text("No Active Screens")
                    .font(.headline)
                    .foregroundColor(.catfeBrown.opacity(0.5))
                
                Text("Create screens and mark them as active to preview")
                    .font(.caption)
                    .foregroundColor(.catfeBrown.opacity(0.3))
                    .multilineTextAlignment(.center)
            }
            .padding()
        }
    }
}

// MARK: - Mini Screen Preview

struct MiniScreenPreview: View {
    let screen: Screen
    
    var body: some View {
        ZStack {
            screen.type.backgroundColor
            
            VStack(alignment: .leading, spacing: 8) {
                // Badge
                Text(screen.type.displayName)
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(screen.type.accentColor)
                    .cornerRadius(8)
                
                Spacer()
                
                // Title
                Text(screen.title)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(screen.type.textColor)
                    .lineLimit(2)
                
                // Subtitle
                if let subtitle = screen.subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(screen.type.textColor.opacity(0.7))
                        .lineLimit(1)
                }
                
                Spacer()
            }
            .padding(16)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            
            // Image thumbnail
            if let imageURL = screen.imageURL, let url = URL(string: imageURL) {
                HStack {
                    Spacer()
                    CachedAsyncImage(url: url) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Color.gray.opacity(0.2)
                    }
                    .frame(width: 80, height: 60)
                    .cornerRadius(8)
                    .padding(16)
                }
                .frame(maxHeight: .infinity, alignment: .bottom)
            }
        }
    }
}

// MARK: - Mini Weather Widget

struct MiniWeatherWidget: View {
    @EnvironmentObject var weatherService: WeatherService
    
    var body: some View {
        if let weather = weatherService.currentWeather {
            HStack(spacing: 4) {
                Image(systemName: weather.conditionIcon)
                    .font(.caption2)
                Text(weather.temperatureString)
                    .font(.caption2)
            }
            .foregroundColor(.catfeBrown)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.white.opacity(0.9))
            .cornerRadius(8)
        }
    }
}

// MARK: - Screen Thumbnail

struct ScreenThumbnail: View {
    let screen: Screen
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                screen.type.backgroundColor
                
                Image(systemName: screen.type.icon)
                    .font(.title3)
                    .foregroundColor(screen.type.accentColor)
            }
            .frame(width: 80, height: 45)
            .cornerRadius(6)
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(isSelected ? Color.catfeTerracotta : Color.clear, lineWidth: 2)
            )
            
            Text(screen.type.displayName)
                .font(.caption2)
                .foregroundColor(isSelected ? .catfeTerracotta : .secondary)
                .lineLimit(1)
        }
    }
}

// MARK: - Preview

#if DEBUG
struct PreviewView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            PreviewView()
                .environmentObject(APIClient.shared)
                .environmentObject(WeatherService.shared)
        }
    }
}
#endif
