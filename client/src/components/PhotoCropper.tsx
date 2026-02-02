import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Check, RotateCcw, ZoomIn, Crop as CropIcon } from "lucide-react";

interface PhotoCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

// Maximum output dimensions to prevent canvas size issues and large uploads
const MAX_OUTPUT_SIZE = 2048;

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
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

export default function PhotoCropper({
  imageUrl,
  onCropComplete,
  onCancel,
}: PhotoCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      // Start with a free-form crop covering most of the image
      setCrop(centerAspectCrop(width, height, 16 / 9));
    },
    []
  );

  const getCroppedImg = useCallback(async () => {
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;

    if (!image || !canvas || !completedCrop) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Calculate the raw crop dimensions
    let cropWidth = completedCrop.width * scaleX;
    let cropHeight = completedCrop.height * scaleY;
    
    // Calculate scale factor to fit within MAX_OUTPUT_SIZE
    // Don't use devicePixelRatio to avoid creating oversized images
    let outputScale = 1;
    const maxDimension = Math.max(cropWidth, cropHeight);
    if (maxDimension > MAX_OUTPUT_SIZE) {
      outputScale = MAX_OUTPUT_SIZE / maxDimension;
    }
    
    // Set canvas size with the constrained dimensions
    canvas.width = Math.floor(cropWidth * outputScale);
    canvas.height = Math.floor(cropHeight * outputScale);

    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    // Scale the context to match our output size
    ctx.scale(outputScale, outputScale);
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0);

    ctx.restore();

    // Convert canvas to base64 with good quality compression
    const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.85);
    
    // Validate the output
    if (croppedImageUrl.length < 1000) {
      console.error("Cropped image appears to be invalid (too small)");
      alert("There was an error processing your photo. Please try again.");
      return;
    }
    
    onCropComplete(croppedImageUrl);
  }, [completedCrop, rotate, scale, onCropComplete]);

  const handleReset = () => {
    setScale(1);
    setRotate(0);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, 16 / 9));
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="font-semibold text-gray-800 flex items-center justify-center gap-2">
          <CropIcon className="w-4 h-4" />
          Crop & Adjust Photo
        </h3>
        <p className="text-sm text-gray-500">Drag to adjust the crop area</p>
      </div>

      <div className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[200px] max-h-[300px]">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          className="max-h-[300px]"
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop preview"
            style={{
              transform: `scale(${scale}) rotate(${rotate}deg)`,
              maxHeight: "300px",
              width: "auto",
            }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>

      {/* Zoom Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ZoomIn className="w-4 h-4" />
          <span>Zoom</span>
          <span className="ml-auto text-gray-400">{Math.round(scale * 100)}%</span>
        </div>
        <Slider
          value={[scale]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={(value) => setScale(value[0])}
          className="w-full"
        />
      </div>

      {/* Rotate Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RotateCcw className="w-4 h-4" />
          <span>Rotate</span>
          <span className="ml-auto text-gray-400">{rotate}°</span>
        </div>
        <Slider
          value={[rotate]}
          min={-180}
          max={180}
          step={1}
          onValueChange={(value) => setRotate(value[0])}
          className="w-full"
        />
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={previewCanvasRef} className="hidden" />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={getCroppedImg}
          className="flex-1 bg-amber-600 hover:bg-amber-700"
        >
          <Check className="w-4 h-4 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
}
