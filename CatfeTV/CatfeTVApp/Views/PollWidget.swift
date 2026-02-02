//
//  PollWidget.swift
//  CatfeTV
//
//  Poll widget overlay for tvOS - shows current poll with QR code
//

import SwiftUI

struct PollWidget: View {
    @StateObject private var pollService = PollService.shared
    @State private var currentTime = Date()
    @State private var showWidget = false
    @State private var minutesUntilResults = 0
    @State private var lastPollRefresh = Date()
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    // Refresh poll data every 5 seconds for real-time vote updates
    private let pollRefreshInterval: TimeInterval = 5
    
    var body: some View {
        Group {
            if showWidget, let poll = pollService.currentPoll {
                VStack(alignment: .leading, spacing: 12) {
                    // Header
                    HStack(spacing: 8) {
                        Text("🗳️")
                            .font(.title2)
                        Text("Cat Poll")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                    
                    // Question
                    Text(poll.question)
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                        .lineLimit(2)
                    
                    // QR Code
                    if let qrImage = generateQRCode(from: pollService.voteURL) {
                        HStack(spacing: 12) {
                            Image(uiImage: qrImage)
                                .interpolation(.none)
                                .resizable()
                                .frame(width: 60, height: 60)
                                .background(Color.white)
                                .cornerRadius(8)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Scan to vote!")
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.8))
                                
                                // Countdown
                                HStack(spacing: 4) {
                                    Image(systemName: "clock.fill")
                                        .font(.caption2)
                                    Text("Results in \(minutesUntilResults) min")
                                        .font(.caption)
                                }
                                .foregroundColor(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.white.opacity(0.2))
                                .cornerRadius(12)
                            }
                        }
                    }
                    
                    // Vote count
                    Text("\(poll.totalVotes) votes so far")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.6))
                }
                .padding(16)
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.5, green: 0.3, blue: 0.7),
                            Color(red: 0.6, green: 0.4, blue: 0.8)
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
            
            // Periodically refresh poll data for real-time vote updates
            if showWidget && Date().timeIntervalSince(lastPollRefresh) >= pollRefreshInterval {
                lastPollRefresh = Date()
                Task {
                    await pollService.fetchCurrentPoll()
                }
            }
        }
        .task {
            await pollService.fetchCurrentPoll()
            lastPollRefresh = Date()
        }
    }
    
    private func updateWidgetVisibility() {
        let minutes = Calendar.current.component(.minute, from: currentTime)
        
        // Show widget during voting time: x:00-x:12, x:15-x:27, x:30-x:42, x:45-x:57 (12 min voting)
        let minuteInQuarter = minutes % 15
        let isVotingTime = minuteInQuarter < 12
        
        let wasShowingWidget = showWidget
        showWidget = isVotingTime && pollService.currentPoll != nil
        
        // If we just entered voting time, refresh poll data immediately
        if showWidget && !wasShowingWidget {
            Task {
                await pollService.fetchCurrentPoll()
                lastPollRefresh = Date()
            }
        }
        
        // Calculate minutes until results (results show at :12, :27, :42, :57)
        if minuteInQuarter < 12 {
            minutesUntilResults = 12 - minuteInQuarter
        } else {
            minutesUntilResults = 0
        }
    }
    
    private func generateQRCode(from string: String) -> UIImage? {
        let data = string.data(using: .ascii)
        
        if let filter = CIFilter(name: "CIQRCodeGenerator") {
            filter.setValue(data, forKey: "inputMessage")
            filter.setValue("M", forKey: "inputCorrectionLevel")
            
            if let output = filter.outputImage {
                let transform = CGAffineTransform(scaleX: 10, y: 10)
                let scaledOutput = output.transformed(by: transform)
                
                let context = CIContext()
                if let cgImage = context.createCGImage(scaledOutput, from: scaledOutput.extent) {
                    return UIImage(cgImage: cgImage)
                }
            }
        }
        return nil
    }
}

// MARK: - Poll Service

@MainActor
class PollService: ObservableObject {
    static let shared = PollService()
    
    @Published var currentPoll: Poll?
    @Published var isLoading = false
    @Published var error: String?
    
    // Update this URL to your published Manus app URL
    private let baseURL = "https://catfetv-amdmxcoq.manus.space"
    
    var voteURL: String {
        if let poll = currentPoll {
            return "\(baseURL)/vote/\(poll.id)"
        }
        return baseURL
    }
    
    func fetchCurrentPoll() async {
        // Don't set isLoading to avoid UI flicker during background refreshes
        error = nil
        
        do {
            let url = URL(string: "\(baseURL)/api/trpc/polls.getForTV")!
            let (data, response) = try await URLSession.shared.data(from: url)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                let pollResponse = try JSONDecoder().decode(PollResponse.self, from: data)
                // Only update if we got valid data
                if let newPoll = pollResponse.result.data.json {
                    currentPoll = newPoll
                }
            }
        } catch {
            self.error = error.localizedDescription
            print("Failed to fetch poll: \(error)")
        }
    }
}

#Preview {
    ZStack {
        Color.black
        PollWidget()
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding()
    }
}
