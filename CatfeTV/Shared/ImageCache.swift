//
//  ImageCache.swift
//  CatfeTV
//
//  Image caching with animated GIF support
//

import Foundation
import SwiftUI

#if os(iOS)
import UIKit
typealias PlatformImage = UIImage
#elseif os(tvOS)
import UIKit
typealias PlatformImage = UIImage
#endif

// MARK: - Cached Image Data (preserves raw bytes for GIFs)

struct CachedImageData {
    let image: PlatformImage
    let rawData: Data
    let isAnimated: Bool
    
    init(image: PlatformImage, data: Data) {
        self.image = image
        self.rawData = data
        self.isAnimated = (image.images?.count ?? 0) > 1
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
    
    /// Legacy method — returns static UIImage (first frame only for GIFs)
    func image(for url: URL) async -> PlatformImage? {
        let result = await imageData(for: url)
        return result?.image
    }
    
    /// Full method — returns CachedImageData with animation info
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
        let image: PlatformImage?
        if isGIFData(data) {
            image = createAnimatedImage(from: data) ?? PlatformImage(data: data)
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
            
            let image: PlatformImage?
            if isGIFData(data) {
                image = createAnimatedImage(from: data) ?? PlatformImage(data: data)
            } else {
                image = PlatformImage(data: data)
            }
            
            guard let validImage = image else { return nil }
            
            let cachedData = CachedImageData(image: validImage, data: data)
            memoryCache.setObject(CachedImageEntry(cachedData), forKey: key as NSString)
            // Save original bytes to disk (preserves GIF frames, no JPEG conversion)
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
    
    private func createAnimatedImage(from data: Data) -> PlatformImage? {
        guard let source = CGImageSourceCreateWithData(data as CFData, nil) else { return nil }
        let frameCount = CGImageSourceGetCount(source)
        guard frameCount > 1 else { return nil }
        
        var images: [PlatformImage] = []
        var totalDuration: Double = 0
        
        for i in 0..<frameCount {
            guard let cgImage = CGImageSourceCreateImageAtIndex(source, i, nil) else { continue }
            images.append(PlatformImage(cgImage: cgImage))
            
            if let properties = CGImageSourceCopyPropertiesAtIndex(source, i, nil) as? [String: Any],
               let gifDict = properties[kCGImagePropertyGIFDictionary as String] as? [String: Any] {
                let delay = (gifDict[kCGImagePropertyGIFUnclampedDelayTime as String] as? Double)
                    ?? (gifDict[kCGImagePropertyGIFDelayTime as String] as? Double)
                    ?? 0.1
                totalDuration += max(delay, 0.02)
            } else {
                totalDuration += 0.1
            }
        }
        
        guard !images.isEmpty else { return nil }
        return PlatformImage.animatedImage(with: images, duration: totalDuration)
    }
}

// MARK: - Animated GIF UIViewRepresentable

/// Renders an animated UIImage (GIF) using UIImageView for smooth frame-by-frame playback.
/// UIImageView natively supports animatedImage, which SwiftUI Image does not.
struct AnimatedGIFView: UIViewRepresentable {
    let image: PlatformImage
    let contentMode: UIView.ContentMode
    
    init(image: PlatformImage, contentMode: UIView.ContentMode = .scaleAspectFill) {
        self.image = image
        self.contentMode = contentMode
    }
    
    func makeUIView(context: Context) -> UIImageView {
        let imageView = UIImageView()
        imageView.contentMode = contentMode
        imageView.clipsToBounds = true
        imageView.backgroundColor = .clear
        // Allow the view to be sized by SwiftUI layout
        imageView.setContentHuggingPriority(.defaultLow, for: .horizontal)
        imageView.setContentHuggingPriority(.defaultLow, for: .vertical)
        imageView.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        imageView.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        return imageView
    }
    
    func updateUIView(_ uiView: UIImageView, context: Context) {
        if let frames = image.images, !frames.isEmpty {
            uiView.animationImages = frames
            uiView.animationDuration = image.duration
            uiView.animationRepeatCount = 0
            uiView.image = frames.first
            uiView.startAnimating()
        } else {
            uiView.stopAnimating()
            uiView.animationImages = nil
            uiView.image = image
        }
        uiView.contentMode = contentMode
    }
}

// MARK: - Cached Async Image View (with automatic GIF support)

/// Drop-in replacement for AsyncImage with caching and animated GIF support.
/// - Static images: renders via the `content` closure (SwiftUI Image) — fully backward compatible
/// - Animated GIFs: renders via AnimatedGIFView (UIViewRepresentable) — automatic, no code changes needed
struct CachedAsyncImage<Content: View, Placeholder: View>: View {
    let url: URL?
    let content: (Image) -> Content
    let placeholder: () -> Placeholder
    let gifContentMode: UIView.ContentMode
    
    @State private var cachedData: CachedImageData?
    @State private var isLoading = true
    
    /// Standard initializer — backward compatible with all existing usages.
    /// `gifContentMode` controls how animated GIFs are scaled (defaults to .scaleAspectFill).
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
                if data.isAnimated {
                    AnimatedGIFView(image: data.image, contentMode: gifContentMode)
                } else {
                    content(Image(uiImage: data.image))
                }
            } else if isLoading {
                placeholder()
            } else {
                placeholder()
            }
        }
        .task {
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
