//
//  PollResultsWidget.swift
//  CatfeTV
//
//  Poll results widget overlay for tvOS - shows poll results during results time
//

import SwiftUI

struct PollResultsWidget: View {
    @StateObject private var pollService = PollService.shared
    @State private var currentTime = Date()
    @State private var showWidget = false
    @State private var hasRefreshedForResults = false
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        Group {
            if showWidget, let poll = pollService.currentPoll {
                VStack(alignment: .leading, spacing: 12) {
                    // Header
                    HStack(spacing: 8) {
                        Text("📊")
                            .font(.title2)
                        Text("Poll Results!")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                    
                    // Question
                    Text(poll.question)
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                        .lineLimit(2)
                    
                    // Results
                    let sortedOptions = poll.options.sorted { ($0.votes ?? 0) > ($1.votes ?? 0) }
                    let winner = sortedOptions.first
                    
                    if poll.totalVotes > 0, let winner = winner {
                        // Winner announcement
                        VStack(spacing: 8) {
                            Text("🏆 Winner!")
                                .font(.caption)
                                .foregroundColor(.yellow)
                            
                            // Winner image
                            if let imageUrl = winner.imageUrl, let url = URL(string: imageUrl) {
                                AsyncImage(url: url) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                } placeholder: {
                                    Color.white.opacity(0.2)
                                }
                                .frame(width: 80, height: 80)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(Color.yellow, lineWidth: 3))
                            }
                            
                            Text(winner.text)
                                .font(.headline)
                                .foregroundColor(.white)
                            
                            let percentage = poll.totalVotes > 0 
                                ? Int(Double(winner.votes ?? 0) / Double(poll.totalVotes) * 100) 
                                : 0
                            Text("\(percentage)% of votes")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                        }
                        .padding(.vertical, 8)
                    } else {
                        // No votes yet
                        VStack(spacing: 4) {
                            Text("🐱")
                                .font(.largeTitle)
                            Text("No votes yet!")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                    }
                    
                    // Total votes
                    Text("\(poll.totalVotes) total votes")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.6))
                }
                .padding(16)
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.9, green: 0.5, blue: 0.2),
                            Color(red: 0.8, green: 0.4, blue: 0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .cornerRadius(16)
                .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: 4)
                .frame(maxWidth: 280)
                .transition(.move(edge: .leading).combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.5), value: showWidget)
        .onReceive(timer) { _ in
            currentTime = Date()
            updateWidgetVisibility()
        }
        .task {
            await pollService.fetchCurrentPoll()
        }
    }
    
    private func updateWidgetVisibility() {
        let minutes = Calendar.current.component(.minute, from: currentTime)
        
        // Show widget during results time: x:12-x:14, x:27-x:29, x:42-x:44, x:57-x:59 (3 min results)
        let minuteInQuarter = minutes % 15
        let isResultsTime = minuteInQuarter >= 12 && minuteInQuarter < 15
        
        let _ = showWidget // previous state
        showWidget = isResultsTime && pollService.currentPoll != nil
        
        // Refresh poll data when entering results time to get final vote counts
        if isResultsTime && !hasRefreshedForResults {
            hasRefreshedForResults = true
            Task {
                await pollService.fetchCurrentPoll()
            }
        }
        
        // Reset the refresh flag when we exit results time
        if !isResultsTime {
            hasRefreshedForResults = false
        }
    }
}

#Preview {
    ZStack {
        Color.black
        PollResultsWidget()
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding()
    }
}
