//
//  ImageCache.swift
//  CatfeTV
//
//  Image caching — GIF animation disabled (shows first frame as static image)
//

import Foundation
import SwiftUI
import ImageIO

#if os(iOS)
import UIKit
typealias PlatformImage = UIImage
#elseif os(tvOS)
import UIKit
typealias PlatformImage = UIImage
#endif

// MARK: - Cached Image Data

struct CachedImageData {
    let image: PlatformImage
    let rawData: Data
    /// Always false — GIF animation is disabled to prevent crashes in archive builds
    let isAnimated: Bool = false
    
    init(image: PlatformImage, data: Data) {
        self.image = image
        self.rawData = data
    }
}

// MARK: - Image Cache Manager

@MainActor
class ImageCacheManager: ObservableObject {
    static let shared = ImageCacheManager()
    
    private let memoryCache = NSCache<NSString, CachedImageEntry>()
    private let fileManager = FileManager.default
    private var cacheDirectory: URL
    
    private class CachedImageEntry {
        let data: CachedImageData
        init(_ data: CachedImageData) { self.data = data }
    }
    
    private init() {
        let paths = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)
        cacheDirectory = paths[0].appendingPathComponent("ImageCache")
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        
        memoryCache.countLimit = 50
        memoryCache.totalCostLimit = 100 * 1024 * 1024 // 100 MB
    }
    
    // MARK: - Cache Operations
    
    func image(for url: URL) async -> PlatformImage? {
        let result = await imageData(for: url)
        return result?.image
    }
    
    func imageData(for url: URL) async -> CachedImageData? {
        let key = cacheKey(for: url)
        
        if let cached = memoryCache.object(forKey: key as NSString) {
            return cached.data
        }
        
        if let diskData = loadFromDisk(key: key) {
            memoryCache.setObject(CachedImageEntry(diskData), forKey: key as NSString)
            return diskData
        }
        
        return await downloadAndCache(url: url, key: key)
    }
    
    func preloadImages(urls: [URL]) async {
        await withTaskGroup(of: Void.self) { group in
            for url in urls {
                group.addTask {
                    _ = await self.image(for: url)
                }
            }
        }
    }
    
    func clearCache() {
        memoryCache.removeAllObjects()
        try? fileManager.removeItem(at: cacheDirectory)
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }
    
    // MARK: - Private Methods
    
    private func cacheKey(for url: URL) -> String {
        url.absoluteString.data(using: .utf8)?.base64EncodedString() ?? url.lastPathComponent
    }
    
    private func diskPath(for key: String) -> URL {
        cacheDirectory.appendingPathComponent(key)
    }
    
    private func loadFromDisk(key: String) -> CachedImageData? {
        let path = diskPath(for: key)
        guard let data = try? Data(contentsOf: path) else { return nil }
        // For GIFs, extract just the first frame to avoid memory issues
        let image: PlatformImage?
        if isGIFData(data) {
            image = extractFirstFrame(from: data) ?? PlatformImage(data: data)
        } else {
            image = PlatformImage(data: data)
        }
        guard let validImage = image else { return nil }
        return CachedImageData(image: validImage, data: data)
    }
    
    private func saveToDisk(data: Data, key: String) {
        let path = diskPath(for: key)
        try? data.write(to: path)
    }
    
    private func downloadAndCache(url: URL, key: String) async -> CachedImageData? {
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                return nil
            }
            
            // For GIFs, extract just the first frame to avoid memory issues
            let image: PlatformImage?
            if isGIFData(data) {
                image = extractFirstFrame(from: data) ?? PlatformImage(data: data)
            } else {
                image = PlatformImage(data: data)
            }
            
            guard let validImage = image else { return nil }
            
            let cachedData = CachedImageData(image: validImage, data: data)
            memoryCache.setObject(CachedImageEntry(cachedData), forKey: key as NSString)
            saveToDisk(data: data, key: key)
            
            return cachedData
        } catch {
            print("Failed to download image: \(error)")
            return nil
        }
    }
    
    // MARK: - GIF Helpers
    
    private func isGIFData(_ data: Data) -> Bool {
        guard data.count >= 6 else { return false }
        return data.prefix(3).elementsEqual([0x47, 0x49, 0x46]) // "GIF"
    }
    
    /// Extract only the first frame of a GIF — avoids loading all frames into memory
    private func extractFirstFrame(from data: Data) -> PlatformImage? {
        guard let source = CGImageSourceCreateWithData(data as CFData, nil) else { return nil }
        guard CGImageSourceGetCount(source) > 0 else { return nil }
        guard let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else { return nil }
        return PlatformImage(cgImage: cgImage)
    }
}

// MARK: - AnimatedGIFView (disabled — kept as stub for compatibility)

/// GIF animation is disabled to prevent crashes in archive/TestFlight builds.
/// This stub renders the first frame as a static image.
struct AnimatedGIFView: UIViewRepresentable {
    let imageData: Data
    let contentMode: UIView.ContentMode
    
    init(image: PlatformImage, contentMode: UIView.ContentMode = .scaleAspectFill) {
        self.imageData = Data()
        self.contentMode = contentMode
    }
    
    init(data: Data, contentMode: UIView.ContentMode = .scaleAspectFill) {
        self.imageData = data
        self.contentMode = contentMode
    }
    
    func makeUIView(context: Context) -> UIImageView {
        let imageView = UIImageView()
        imageView.contentMode = contentMode
        imageView.clipsToBounds = true
        imageView.backgroundColor = .clear
        imageView.setContentHuggingPriority(.defaultLow, for: .horizontal)
        imageView.setContentHuggingPriority(.defaultLow, for: .vertical)
        imageView.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        imageView.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        
        // Show first frame only — no animation
        if !imageData.isEmpty, let staticImage = UIImage(data: imageData) {
            imageView.image = staticImage
        }
        return imageView
    }
    
    func updateUIView(_ uiView: UIImageView, context: Context) {
        uiView.contentMode = contentMode
        if !imageData.isEmpty, let staticImage = UIImage(data: imageData) {
            uiView.image = staticImage
        }
    }
}

// MARK: - Cached Async Image View

/// Drop-in replacement for AsyncImage with caching.
/// GIF animation is disabled — GIFs render as static first-frame images.
struct CachedAsyncImage<Content: View, Placeholder: View>: View {
    let url: URL?
    let content: (Image) -> Content
    let placeholder: () -> Placeholder
    let gifContentMode: UIView.ContentMode
    
    @State private var cachedData: CachedImageData?
    @State private var isLoading = true
    
    init(
        url: URL?,
        gifContentMode: UIView.ContentMode = .scaleAspectFill,
        @ViewBuilder content: @escaping (Image) -> Content,
        @ViewBuilder placeholder: @escaping () -> Placeholder
    ) {
        self.url = url
        self.gifContentMode = gifContentMode
        self.content = content
        self.placeholder = placeholder
    }
    
    var body: some View {
        Group {
            if let data = cachedData {
                // Always render as static SwiftUI Image (no AnimatedGIFView)
                content(Image(uiImage: data.image))
            } else if isLoading {
                placeholder()
            } else {
                placeholder()
            }
        }
        .task(id: url) {
            await loadImage()
        }
    }
    
    private func loadImage() async {
        guard let url = url else {
            isLoading = false
            return
        }
        cachedData = await ImageCacheManager.shared.imageData(for: url)
        isLoading = false
    }
}

// MARK: - Convenience Extensions

extension CachedAsyncImage where Placeholder == ProgressView<EmptyView, EmptyView> {
    init(
        url: URL?,
        gifContentMode: UIView.ContentMode = .scaleAspectFill,
        @ViewBuilder content: @escaping (Image) -> Content
    ) {
        self.init(url: url, gifContentMode: gifContentMode, content: content, placeholder: { ProgressView() })
    }
}

// MARK: - QR Code Generator

struct QRCodeGenerator {
    static func generate(from string: String, size: CGSize = CGSize(width: 200, height: 200)) -> PlatformImage? {
        guard let data = string.data(using: .utf8) else { return nil }
        
        guard let filter = CIFilter(name: "CIQRCodeGenerator") else { return nil }
        filter.setValue(data, forKey: "inputMessage")
        filter.setValue("H", forKey: "inputCorrectionLevel")
        
        guard let ciImage = filter.outputImage else { return nil }
        
        let scaleX = size.width / ciImage.extent.size.width
        let scaleY = size.height / ciImage.extent.size.height
        let transformedImage = ciImage.transformed(by: CGAffineTransform(scaleX: scaleX, y: scaleY))
        
        let context = CIContext()
        guard let cgImage = context.createCGImage(transformedImage, from: transformedImage.extent) else {
            return nil
        }
        
        return PlatformImage(cgImage: cgImage)
    }
}
