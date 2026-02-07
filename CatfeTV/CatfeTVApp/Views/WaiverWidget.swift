//
//  WaiverWidget.swift
//  CatfeTVApp
//
//  Overlay widget that shows a QR code for the guest waiver form.
//  Positioned in the top-left area of the TV display, matching the web layout.
//  Only shows when waiverUrl is configured in settings.
//
import SwiftUI

struct WaiverWidget: View {
    @EnvironmentObject var apiClient: APIClient
    
    @State private var qrImage: UIImage?
    
    private var waiverUrl: String? {
        apiClient.settings.waiverUrl
    }
    
    var body: some View {
        Group {
            if let url = waiverUrl, !url.isEmpty {
                VStack(spacing: 8) {
                    // Icon
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundColor(.white)
                    
                    // Label
                    Text("Sign Waiver")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    
                    // QR Code
                    if let image = qrImage {
                        Image(uiImage: image)
                            .interpolation(.none)
                            .resizable()
                            .frame(width: 100, height: 100)
                            .background(Color.white)
                            .cornerRadius(8)
                    } else {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.white.opacity(0.3))
                            .frame(width: 100, height: 100)
                            .overlay(
                                ProgressView()
                                    .tint(.white)
                            )
                    }
                }
                .padding(16)
                .background(
                    LinearGradient(
                        colors: [Color.blue, Color.indigo],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .cornerRadius(20)
                .shadow(color: .black.opacity(0.4), radius: 12, x: 0, y: 4)
                .onAppear {
                    generateQRCode(from: url)
                }
                .onChange(of: apiClient.settings.waiverUrl) { _, newUrl in
                    if let newUrl = newUrl, !newUrl.isEmpty {
                        generateQRCode(from: newUrl)
                    }
                }
            }
        }
    }
    
    private func generateQRCode(from string: String) {
        qrImage = QRCodeGenerator.generate(
            from: string,
            size: CGSize(width: 200, height: 200)
        )
    }
}

// MARK: - Preview
#if DEBUG
struct WaiverWidget_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.loungeCharcoal
                .ignoresSafeArea()
            
            VStack {
                HStack {
                    WaiverWidget()
                        .environmentObject(APIClient.shared)
                        .padding(.top, 40)
                        .padding(.leading, 60)
                    Spacer()
                }
                Spacer()
            }
        }
    }
}
#endif
