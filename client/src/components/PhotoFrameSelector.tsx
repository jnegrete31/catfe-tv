import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";

export interface PhotoFrame {
  id: string;
  name: string;
  thumbnail: string;
  overlay: string;
}

export const PHOTO_FRAMES: PhotoFrame[] = [
  {
    id: "none",
    name: "No Frame",
    thumbnail: "",
    overlay: "",
  },
  {
    id: "paw-prints",
    name: "Paw Prints",
    thumbnail: "/frames/paw-prints-frame.png",
    overlay: "/frames/paw-prints-frame.png",
  },
  {
    id: "cat-ears",
    name: "Cat Ears",
    thumbnail: "/frames/cat-ears-frame.png",
    overlay: "/frames/cat-ears-frame.png",
  },
  {
    id: "whiskers",
    name: "Whiskers",
    thumbnail: "/frames/whiskers-border-frame.png",
    overlay: "/frames/whiskers-border-frame.png",
  },
  {
    id: "hearts-cats",
    name: "Hearts & Cats",
    thumbnail: "/frames/hearts-cats-frame.png",
    overlay: "/frames/hearts-cats-frame.png",
  },
  {
    id: "polaroid",
    name: "Polaroid",
    thumbnail: "/frames/polaroid-cat-frame.png",
    overlay: "/frames/polaroid-cat-frame.png",
  },
];

interface PhotoFrameSelectorProps {
  photoPreview: string | null;
  selectedFrame: string;
  onFrameSelect: (frameId: string) => void;
  onCompositeReady?: (compositeBase64: string) => void;
}

export default function PhotoFrameSelector({
  photoPreview,
  selectedFrame,
  onFrameSelect,
  onCompositeReady,
}: PhotoFrameSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [compositePreview, setCompositePreview] = useState<string | null>(null);

  // Composite the photo with the selected frame
  useEffect(() => {
    if (!photoPreview || !canvasRef.current) {
      setCompositePreview(null);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frame = PHOTO_FRAMES.find((f) => f.id === selectedFrame);
    const photoImg = new Image();
    photoImg.crossOrigin = "anonymous";

    photoImg.onload = () => {
      // Set canvas size to match photo (square for frames)
      const size = Math.max(photoImg.width, photoImg.height);
      canvas.width = size;
      canvas.height = size;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Draw photo centered
      const offsetX = (size - photoImg.width) / 2;
      const offsetY = (size - photoImg.height) / 2;
      ctx.drawImage(photoImg, offsetX, offsetY, photoImg.width, photoImg.height);

      // If a frame is selected, overlay it
      if (frame && frame.overlay) {
        const frameImg = new Image();
        frameImg.crossOrigin = "anonymous";
        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, size, size);
          const composite = canvas.toDataURL("image/jpeg", 0.9);
          setCompositePreview(composite);
          onCompositeReady?.(composite);
        };
        frameImg.onerror = () => {
          // If frame fails to load, just use the photo
          const composite = canvas.toDataURL("image/jpeg", 0.9);
          setCompositePreview(composite);
          onCompositeReady?.(composite);
        };
        frameImg.src = frame.overlay;
      } else {
        // No frame selected
        const composite = canvas.toDataURL("image/jpeg", 0.9);
        setCompositePreview(composite);
        onCompositeReady?.(composite);
      }
    };

    photoImg.src = photoPreview;
  }, [photoPreview, selectedFrame, onCompositeReady]);

  return (
    <div className="space-y-4">
      {/* Preview with frame */}
      {photoPreview && (
        <div className="relative aspect-square max-w-xs mx-auto rounded-lg overflow-hidden bg-gray-100">
          {compositePreview ? (
            <img
              src={compositePreview}
              alt="Preview with frame"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Hidden canvas for compositing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Frame selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Choose a Frame (optional)</p>
        <div className="grid grid-cols-3 gap-2">
          {PHOTO_FRAMES.map((frame) => (
            <button
              key={frame.id}
              onClick={() => onFrameSelect(frame.id)}
              className={`
                relative aspect-square rounded-lg border-2 overflow-hidden
                transition-all duration-200
                ${
                  selectedFrame === frame.id
                    ? "border-amber-500 ring-2 ring-amber-200"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              {frame.id === "none" ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <span className="text-xs text-gray-500">None</span>
                </div>
              ) : (
                <img
                  src={frame.thumbnail}
                  alt={frame.name}
                  className="w-full h-full object-cover"
                />
              )}
              {selectedFrame === frame.id && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                <span className="text-[10px] text-white truncate block">
                  {frame.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
