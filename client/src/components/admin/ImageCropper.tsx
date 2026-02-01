import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Crop as CropIcon, RotateCcw, ZoomIn, Check, X } from "lucide-react";

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageBase64: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // Default 16:9 for TV
}

// Helper to create a centered crop with aspect ratio
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({ 
  imageUrl, 
  onCropComplete, 
  onCancel,
  aspectRatio = 16 / 9 
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  const getCroppedImage = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate the scale factor between natural and displayed size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to the cropped area (in natural pixels)
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    
    // Use a reasonable max size for the output
    const maxSize = 1920;
    let outputWidth = cropWidth;
    let outputHeight = cropHeight;
    
    if (outputWidth > maxSize || outputHeight > maxSize) {
      const ratio = Math.min(maxSize / outputWidth, maxSize / outputHeight);
      outputWidth *= ratio;
      outputHeight *= ratio;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Apply transformations
    ctx.save();
    
    // Move to center for rotation
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-outputWidth / 2, -outputHeight / 2);

    // Draw the cropped portion
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );

    ctx.restore();

    // Convert to base64
    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(base64);
  }, [completedCrop, rotate, scale, onCropComplete]);

  const resetTransforms = () => {
    setScale(1);
    setRotate(0);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="w-5 h-5" />
            Crop & Adjust Image
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Crop Area */}
          <div className="flex justify-center bg-muted/30 rounded-lg p-4">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: "50vh",
                  maxWidth: "100%",
                }}
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="mt-6 space-y-4">
            {/* Zoom */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  Zoom
                </Label>
                <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={([value]) => setScale(value)}
                min={0.5}
                max={2}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Rotate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Rotate
                </Label>
                <span className="text-sm text-muted-foreground">{rotate}°</span>
              </div>
              <Slider
                value={[rotate]}
                onValueChange={([value]) => setRotate(value)}
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotate(r => r - 90)}
              >
                Rotate Left
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotate(r => r + 90)}
              >
                Rotate Right
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetTransforms}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Preview hint */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> The crop area shows how your image will appear on the TV screen (16:9 aspect ratio). 
              Drag the corners to adjust, or use zoom/rotate to fine-tune.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="button" onClick={getCroppedImage}>
            <Check className="w-4 h-4 mr-2" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
