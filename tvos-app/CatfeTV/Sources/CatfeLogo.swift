import SwiftUI

/// Catfé logo component for branding on TV screens
/// Supports custom logo URL from settings, falls back to default Catfé branding
struct CatfeLogo: View {
    var logoUrl: String?
    
    var body: some View {
        Group {
            if let logoUrl = logoUrl, !logoUrl.isEmpty {
                // Custom logo from settings
                AsyncImage(url: URL(string: logoUrl)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(height: 50)
                            .shadow(color: .black.opacity(0.5), radius: 3, x: 0, y: 2)
                    case .failure, .empty:
                        defaultLogo
                    @unknown default:
                        defaultLogo
                    }
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.black.opacity(0.3))
                        .blur(radius: 1)
                )
            } else {
                defaultLogo
            }
        }
    }
    
    private var defaultLogo: some View {
        HStack(spacing: 10) {
            // Cat icon in amber background
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(hex: "#d97706")) // amber-600
                    .frame(width: 50, height: 50)
                    .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 2)
                
                Text("🐱")
                    .font(.system(size: 28))
            }
            
            // Catfé text
            Text("Catfé")
                .font(.custom("Georgia", size: 28))
                .fontWeight(.bold)
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.5), radius: 3, x: 0, y: 2)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.black.opacity(0.3))
                .blur(radius: 1)
        )
    }
}

#Preview {
    ZStack {
        Color.blue
        VStack {
            Spacer()
            HStack {
                CatfeLogo(logoUrl: nil)
                    .padding(40)
                Spacer()
            }
        }
    }
}
