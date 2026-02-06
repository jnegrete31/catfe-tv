
import SwiftUI

struct ThankYouScreenView: View {
    let screen: Screen

    var body: some View {
        BaseScreenLayout(screen: screen) {
            ZStack {
                // Background Gradient
                LinearGradient(
                    gradient: Gradient(colors: [Color(hex: "1a1a2e"), Color(hex: "16213e"), Color(hex: "0f3460")]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                // Animated decorative elements
                FloatingEmojisView(emojis: ["💜", "✨", "💖", "😻"])
                LightRaysView(color: Color(hex: "8b5cf6").opacity(0.3))
                AnimatedCirclesView()

                // Main Content
                VStack(spacing: 30) {
                    ScreenBadge(text: "Thank You", color: Color(hex: "4f46e5"), emoji: "🙏")

                    Text(screen.title)
                        .font(.system(size: 96, weight: .bold, design: .serif))
                        .foregroundColor(Color(hex: "818cf8"))
                        .multilineTextAlignment(.center)

                    if let subtitle = screen.subtitle {
                        Text(subtitle)
                            .font(CatfeTypography.subtitle)
                            .foregroundColor(.white.opacity(0.8))
                            .multilineTextAlignment(.center)
                    }

                    if let bodyText = screen.bodyText {
                        Text(bodyText)
                            .font(CatfeTypography.body)
                            .foregroundColor(.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: 1200)
                    }
                }
                .padding()
            }
        }
    }
}

// MARK: - Reusable Decorative Views

private struct FloatingEmojisView: View {
    let emojis: [String]
    @State private var particles: [Particle] = []

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas {
                context, size in
                let now = timeline.date.timeIntervalSinceReferenceDate
                for particle in particles {
                    var context = context
                    context.opacity = particle.opacity(at: now)
                    context.draw(Text(particle.emoji), at: particle.position(at: now, in: size))
                }
            }
        }
        .onAppear {
            particles = emojis.flatMap { emoji in
                (0..<10).map { _ in Particle(emoji: emoji) }
            }
        }
    }

    private struct Particle {
        let emoji: String
        let creationDate = Date.now.timeIntervalSinceReferenceDate
        let initialPosition = CGPoint(x: .random(in: -0.1...1.1), y: 1.2)
        let finalPosition = CGPoint(x: .random(in: -0.1...1.1), y: -0.2)
        let duration = Double.random(in: 8...15)
        let initialOpacity = Double.random(in: 0.1...0.5)

        func position(at time: TimeInterval, in size: CGSize) -> CGPoint {
            let timeAlive = time - creationDate
            let progress = min(1, timeAlive / duration)

            let x = initialPosition.x * size.width + (finalPosition.x - initialPosition.x) * size.width * progress
            let y = initialPosition.y * size.height + (finalPosition.y - initialPosition.y) * size.height * progress
            return CGPoint(x: x, y: y)
        }

        func opacity(at time: TimeInterval) -> Double {
            let timeAlive = time - creationDate
            if timeAlive > duration {
                return 0
            }
            let progress = timeAlive / duration
            return initialOpacity * (1 - progress)
        }
    }
}

private struct LightRaysView: View {
    let color: Color
    @State private var isAnimating = false

    var body: some View {
        ZStack {
            ForEach(0..<5) { i in
                RadialGradient(
                    gradient: Gradient(colors: [color, .clear]),
                    center: .center,
                    startRadius: 50,
                    endRadius: 600
                )
                .rotationEffect(.degrees(Double(i) * 72 + (isAnimating ? 360 : 0)))
                .opacity(isAnimating ? 0.8 : 0.4)
            }
        }
        .onAppear {
            withAnimation(Animation.linear(duration: 60).repeatForever(autoreverses: false)) {
                isAnimating = true
            }
        }
    }
}

private struct AnimatedCirclesView: View {
    @State private var scale: CGFloat = 1.0

    var body: some View {
        ZStack {
            ForEach(0..<10) { i in
                Circle()
                    .stroke(lineWidth: 1)
                    .foregroundColor(.white.opacity(0.1))
                    .frame(width: CGFloat(i * 200), height: CGFloat(i * 200))
                    .scaleEffect(scale)
                    .animation(Animation.easeInOut(duration: Double(i) * 2 + 5).repeatForever(autoreverses: true), value: scale)
            }
        }
        .onAppear {
            scale = 1.2
        }
    }
}

struct ThankYouScreenView_Previews: PreviewProvider {
    static var previews: some View {
        ThankYouScreenView(screen: Screen(
            id: "1",
            title: "Your Support Means the World",
            subtitle: "Every contribution helps us care for these wonderful cats.",
            bodyText: "From the bottom of our furry hearts, thank you for being a friend to the Catfé.",
            type: .thankYou
        ))
    }
}
