import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, CheckCircle, Sparkles, Tv, Plus, Crop as CropIcon } from "lucide-react";
import { Link } from "wouter";
import PhotoFrameSelector from "@/components/PhotoFrameSelector";
import BackgroundStyleSelector from "@/components/BackgroundStyleSelector";
import PhotoCropper from "@/components/PhotoCropper";

export default function UploadSnapPurr() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [caption, setCaption] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [compositeBase64, setCompositeBase64] = useState<string | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<"blur" | "gradient">("blur");
  const [isPortrait, setIsPortrait] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = trpc.photos.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  // Fetch suggested captions from database
  const { data: suggestedCaptions = [] } = trpc.captions.getByType.useQuery(
    { type: "snap_purr" },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  // Fallback captions if none in database
  const defaultCaptions = ["Best day ever! 🐱", "Made a new friend!", "Purrfect moment ✨", "Cat cuddles 💕", "Living my best life"];
  const captions = suggestedCaptions.length > 0 
    ? suggestedCaptions.map((c: { text: string }) => c.text) 
    : defaultCaptions;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview and enable cropping mode
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setOriginalPhoto(result);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    setPhotoPreview(croppedImage);
    setPhotoBase64(croppedImage);
    setIsCropping(false);
    
    // Detect orientation of cropped image
    const img = new Image();
    img.onload = () => {
      setIsPortrait(img.height > img.width);
    };
    img.src = croppedImage;
  };

  const handleCropCancel = () => {
    // Use original without cropping
    if (originalPhoto) {
      setPhotoPreview(originalPhoto);
      setPhotoBase64(originalPhoto);
      
      // Detect orientation
      const img = new Image();
      img.onload = () => {
        setIsPortrait(img.height > img.width);
      };
      img.src = originalPhoto;
    }
    setIsCropping(false);
  };

  const handleCompositeReady = useCallback((composite: string) => {
    setCompositeBase64(composite);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnonymous && !name) return;
    
    // Use composite image if available, otherwise use original
    const imageToSubmit = compositeBase64 || photoBase64;
    if (!imageToSubmit) return;

    submitMutation.mutate({
      type: "snap_purr",
      submitterName: isAnonymous ? "A Catfé Guest" : name,
      submitterEmail: email || undefined,
      photoBase64: imageToSubmit,
      caption: caption || undefined,
      backgroundStyle,
    });
  };

  const handleUploadAnother = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setCaption("");
    setPhotoPreview(null);
    setPhotoBase64(null);
    setSelectedFrame("none");
    setCompositeBase64(null);
    setBackgroundStyle("blur");
    setIsPortrait(false);
    setIsCropping(false);
    setOriginalPhoto(null);
    setIsAnonymous(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Purrfect!</h2>
            <p className="text-gray-600 mb-4">
              Your photo has been submitted for review.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Once approved, it will appear on the Catfé TV display for everyone to enjoy!
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/slideshow/snap-purr">
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                  <Tv className="w-4 h-4 mr-2" />
                  Watch Live Slideshow
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={handleUploadAnother}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Another Photo
              </Button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-yellow-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Thanks for visiting Catfé!</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Snap & Purr</h1>
          <p className="text-gray-600">
            Share your cat lounge experience on our TV!
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Share Your Moment
            </CardTitle>
            <CardDescription>
              Upload a photo from your visit to see it on our display
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Your Photo *</Label>
                {isCropping && originalPhoto ? (
                  <PhotoCropper
                    imageUrl={originalPhoto}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                  />
                ) : !photoPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Tap to upload a photo</p>
                        <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Frame Selector with Preview */}
                    <PhotoFrameSelector
                      photoPreview={photoPreview}
                      selectedFrame={selectedFrame}
                      onFrameSelect={setSelectedFrame}
                      onCompositeReady={handleCompositeReady}
                    />
                    
                    {/* Background Style for Portrait Photos - only shown for portrait orientation */}
                    {isPortrait && (
                      <BackgroundStyleSelector
                        imageUrl={compositeBase64 || photoPreview || ""}
                        value={backgroundStyle}
                        onChange={setBackgroundStyle}
                      />
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (originalPhoto) {
                            setIsCropping(true);
                          } else if (photoPreview) {
                            setOriginalPhoto(photoPreview);
                            setIsCropping(true);
                          }
                        }}
                        className="flex-1"
                      >
                        <CropIcon className="w-4 h-4 mr-2" />
                        Edit Crop
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name">First Name {!isAnonymous && "*"}</Label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => {
                        setIsAnonymous(e.target.checked);
                        if (e.target.checked) setName("");
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-gray-600">Stay anonymous</span>
                  </label>
                </div>
                {isAnonymous ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                    Your photo will appear as "A Catfé Guest" on the TV
                  </div>
                ) : (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name only"
                    required={!isAnonymous}
                  />
                )}
              </div>

              {/* Email (optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-gray-500">
                  We'll only use this to notify you when your photo is approved
                </p>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption - it will appear on the TV too!"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {captions.map((suggestion: string) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setCaption(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {caption.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                disabled={!photoBase64 || (!isAnonymous && !name) || submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Photo
                  </>
                )}
              </Button>

              {submitMutation.isError && (
                <p className="text-sm text-red-600 text-center">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By submitting, you agree to have your photo displayed at Catfé
        </p>
      </div>
    </div>
  );
}
