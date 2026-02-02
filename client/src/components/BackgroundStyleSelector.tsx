import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BackgroundStyleSelectorProps {
  imageUrl: string;
  value: "blur" | "gradient";
  onChange: (value: "blur" | "gradient") => void;
}

// Extract dominant colors from an image
function extractColors(img: HTMLImageElement): string[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return ["#f5f0e8", "#d4a574"];
  
  canvas.width = 50;
  canvas.height = 50;
  ctx.drawImage(img, 0, 0, 50, 50);
  
  const imageData = ctx.getImageData(0, 0, 50, 50).data;
  const colors: { [key: string]: number } = {};
  
  // Sample pixels and count colors
  for (let i = 0; i < imageData.length; i += 16) { // Sample every 4th pixel
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    // Quantize to reduce color variations
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;
    colors[key] = (colors[key] || 0) + 1;
  }
  
  // Sort by frequency and get top 2
  const sorted = Object.entries(colors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return `rgb(${r}, ${g}, ${b})`;
    });
  
  return sorted.length >= 2 ? sorted : ["#f5f0e8", "#d4a574"];
}

export default function BackgroundStyleSelector({ 
  imageUrl, 
  value, 
  onChange 
}: BackgroundStyleSelectorProps) {
  const [gradientColors, setGradientColors] = useState<string[]>(["#f5f0e8", "#d4a574"]);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Extract colors when image loads
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const colors = extractColors(img);
      setGradientColors(colors);
    };
    img.src = imageUrl;
  }, [imageUrl]);
  
  if (!imageUrl) return null;
  
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Background Style</Label>
      <p className="text-sm text-gray-500">
        Choose how portrait photos will look on the TV
      </p>
      
      <RadioGroup 
        value={value} 
        onValueChange={(v) => onChange(v as "blur" | "gradient")}
        className="grid grid-cols-2 gap-4"
      >
        {/* Blur Option */}
        <div className="relative">
          <RadioGroupItem value="blur" id="blur" className="peer sr-only" />
          <Label
            htmlFor="blur"
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 p-3 cursor-pointer transition-all hover:border-amber-300 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50"
          >
            {/* Preview */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
              {/* Blurred background */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(20px)",
                  transform: "scale(1.2)",
                }}
              />
              {/* Centered photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-h-full max-w-[60%] object-contain"
                />
              </div>
            </div>
            <span className="font-medium text-sm">Blur</span>
            <span className="text-xs text-gray-500 text-center">
              Blurred version of your photo
            </span>
          </Label>
        </div>
        
        {/* Gradient Option */}
        <div className="relative">
          <RadioGroupItem value="gradient" id="gradient" className="peer sr-only" />
          <Label
            htmlFor="gradient"
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 p-3 cursor-pointer transition-all hover:border-amber-300 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50"
          >
            {/* Preview */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
              {/* Gradient background */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
                }}
              />
              {/* Centered photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-h-full max-w-[60%] object-contain"
                />
              </div>
            </div>
            <span className="font-medium text-sm">Gradient</span>
            <span className="text-xs text-gray-500 text-center">
              Colors from your photo
            </span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
