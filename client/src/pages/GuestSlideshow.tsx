import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Camera, ChevronLeft, ChevronRight } from "lucide-react";

type SlideshowType = "happy-tails" | "snap-purr";

export default function GuestSlideshow() {
  const params = useParams<{ type: SlideshowType }>();
  const type = params.type as SlideshowType;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const isHappyTails = type === "happy-tails";
  const photoType = isHappyTails ? "happy_tails" : "snap_purr";
  
  // Fetch approved photos
  const { data: photos, isLoading } = trpc.photos.getApproved.useQuery(
    { type: photoType },
    { refetchInterval: 30000 } // Refresh every 30 seconds to get new approved photos
  );
  
  // Auto-advance slideshow
  useEffect(() => {
    if (!photos || photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000); // Change photo every 5 seconds
    
    return () => clearInterval(interval);
  }, [photos]);
  
  // Reset index when photos change
  useEffect(() => {
    if (photos && currentIndex >= photos.length) {
      setCurrentIndex(0);
    }
  }, [photos, currentIndex]);
  
  const handlePrev = () => {
    if (!photos) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };
  
  const handleNext = () => {
    if (!photos) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };
  
  const currentPhoto = photos?.[currentIndex];
  
  // Theme colors based on type
  const theme = isHappyTails 
    ? {
        bg: "bg-gradient-to-b from-amber-50 to-orange-50",
        accent: "text-amber-600",
        buttonBg: "bg-amber-500 hover:bg-amber-600",
        icon: Heart,
        title: "Happy Tails",
        subtitle: "Photos of adopted cats in their forever homes",
        uploadPath: "/upload/happy-tails",
      }
    : {
        bg: "bg-gradient-to-b from-yellow-50 to-amber-50",
        accent: "text-yellow-600",
        buttonBg: "bg-yellow-500 hover:bg-yellow-600 text-gray-900",
        icon: Camera,
        title: "Snap & Purr",
        subtitle: "Guest photos from the cat lounge",
        uploadPath: "/upload/snap-purr",
      };
  
  const Icon = theme.icon;
  
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }
  
  if (!photos || photos.length === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`}>
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 ${isHappyTails ? 'bg-amber-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`w-10 h-10 ${theme.accent}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Photos Yet</h2>
          <p className="text-gray-600 mb-6">
            Be the first to share a photo! Your submission will appear here once approved.
          </p>
          <Link href={theme.uploadPath}>
            <Button className={theme.buttonBg}>
              Upload a Photo
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col`}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link href={theme.uploadPath}>
          <Button variant="ghost" size="sm" className="text-gray-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${theme.accent}`} />
          <span className="font-semibold text-gray-800">{theme.title}</span>
        </div>
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {photos.length}
        </div>
      </header>
      
      {/* Main Slideshow Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Navigation Buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 z-10 p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 z-10 p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}
        
        {/* Photo Card */}
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Photo */}
            <div className="aspect-square relative bg-gray-100">
              <img
                src={currentPhoto?.photoUrl}
                alt={currentPhoto?.caption || "Guest photo"}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Photo Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {currentPhoto?.submitterName}
                  </p>
                  {isHappyTails && currentPhoto?.catName && (
                    <p className={`text-sm ${theme.accent}`}>
                      with {currentPhoto.catName}
                    </p>
                  )}
                </div>
                <Icon className={`w-5 h-5 ${theme.accent} ${isHappyTails ? 'fill-current' : ''}`} />
              </div>
              {currentPhoto?.caption && (
                <p className="text-gray-600 text-sm">{currentPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Dots */}
      {photos.length > 1 && (
        <div className="p-4 flex justify-center gap-2">
          {photos.slice(0, 10).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex 
                  ? `${isHappyTails ? 'bg-amber-500' : 'bg-yellow-500'} w-4` 
                  : 'bg-gray-300'
              }`}
            />
          ))}
          {photos.length > 10 && (
            <span className="text-xs text-gray-400">+{photos.length - 10}</span>
          )}
        </div>
      )}
      
      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-sm text-gray-500 mb-2">{theme.subtitle}</p>
        <Link href={theme.uploadPath}>
          <Button variant="outline" size="sm" className="border-gray-300">
            Share Your Photo
          </Button>
        </Link>
      </footer>
    </div>
  );
}
