import { motion, AnimatePresence } from "framer-motion";
import type { Screen, Settings } from "@shared/types";
import { SCREEN_TYPE_CONFIG } from "@shared/types";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { PollScreen } from "./PollScreen";

// Animated counter hook for counting up effect
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (target === 0) return;
    
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    // Small delay before starting animation
    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [target, duration]);
  
  return count;
}

interface ScreenRendererProps {
  screen: Screen;
  settings: Settings | null;
  adoptionCats?: Screen[]; // For ADOPTION_SHOWCASE
}

// Logo component for branding - visible on both light and dark backgrounds
// Supports custom logo URL from settings, falls back to default Catfé branding
function CatfeLogo({ logoUrl, className = "" }: { logoUrl?: string | null; className?: string }) {
  // If custom logo is provided, show it
  if (logoUrl) {
    return (
      <div className={`px-4 py-3 rounded-2xl bg-black/30 backdrop-blur-sm shadow-lg ${className}`}>
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="h-12 w-auto object-contain drop-shadow-lg"
        />
      </div>
    );
  }
  
  // Default Catfé logo
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/30 backdrop-blur-sm shadow-lg ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-md">
        <span className="text-white text-2xl">🐱</span>
      </div>
      <span className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
        Catfé
      </span>
    </div>
  );
}

// Base layout for all screen types
function ScreenLayout({ 
  children, 
  bgColor,
  imagePath,
  imageDisplayMode = "cover",
  showLogo = true,
  logoUrl,
}: { 
  children: React.ReactNode;
  bgColor?: string;
  imagePath?: string | null;
  imageDisplayMode?: "cover" | "contain" | null;
  showLogo?: boolean;
  logoUrl?: string | null;
}) {
  const isContain = imageDisplayMode === "contain";
  
  return (
    <div 
      className="tv-screen relative flex items-center justify-center"
      style={{ 
        backgroundColor: bgColor || "var(--background)",
      }}
    >
      {/* Background image with overlay */}
      {imagePath && (
        <>
          {isContain ? (
            // Contain mode: show full image centered on themed background
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <img 
                src={imagePath} 
                alt="" 
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
              />
            </div>
          ) : (
            // Cover mode: fill screen with dark overlay
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${imagePath})` }}
              />
              <div className="absolute inset-0 bg-black/40" />
            </>
          )}
        </>
      )}
      
      {/* Logo in bottom-left corner - positioned above the Recently Adopted banner */}
      {showLogo && (
        <div className="absolute z-20" style={{ bottom: '144px', left: '24px' }}>
          <CatfeLogo logoUrl={logoUrl} />
        </div>
      )}
      
      {/* Content - always show text overlay for cover mode, hide for contain mode */}
      {(!isContain) && (
        <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-16">
          {children}
        </div>
      )}
    </div>
  );
}

// QR Code component
function QRCode({ url, size = 180 }: { url: string; size?: number }) {
  return (
    <div className="qr-container">
      <QRCodeSVG 
        value={url} 
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  );
}

// SNAP_AND_PURR - Photo sharing prompt
function SnapAndPurrScreen({ screen, settings }: ScreenRendererProps) {
  const hasImage = !!screen.imagePath;
  const textColorClass = hasImage ? "text-white drop-shadow-lg" : "text-pink-900";
  const subtitleColorClass = hasImage ? "text-white/90 drop-shadow-md" : "text-pink-800";
  const bodyColorClass = hasImage ? "text-white/80 drop-shadow" : "text-pink-700";
  
  return (
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#fce7f3" logoUrl={settings?.logoUrl}>
      <div className="text-center max-w-4xl">
        <h1 className={`tv-text-large mb-6 ${textColorClass}`}>
          {screen.title || "Snap & Purr!"}
        </h1>
        {screen.subtitle && (
          <p className={`tv-text-medium mb-8 ${subtitleColorClass}`}>
            {screen.subtitle}
          </p>
        )}
        {screen.body && (
          <p className={`tv-text-body mb-8 ${bodyColorClass}`}>
            {screen.body}
          </p>
        )}
        {screen.qrUrl && (
          <div className="flex justify-center">
            <QRCode url={screen.qrUrl} size={200} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// EVENT - Special events
function EventScreen({ screen, settings }: ScreenRendererProps) {
  const hasImage = !!screen.imagePath;
  const textColorClass = hasImage ? "text-white drop-shadow-lg" : "text-purple-900";
  const subtitleColorClass = hasImage ? "text-white/90 drop-shadow-md" : "text-purple-800";
  const bodyColorClass = hasImage ? "text-white/80 drop-shadow" : "text-purple-700";
  
  return (
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#ede9fe" logoUrl={settings?.logoUrl}>
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8">
        <div className="flex-1">
          <div className="inline-block px-4 py-2 rounded-full bg-purple-500 text-white text-lg mb-4">
            Event
          </div>
          <h1 className={`tv-text-large mb-4 ${textColorClass}`}>
            {screen.title}
          </h1>
          {screen.subtitle && (
            <p className={`tv-text-medium mb-4 ${subtitleColorClass}`}>
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className={`tv-text-body ${bodyColorClass}`}>
              {screen.body}
            </p>
          )}
        </div>
        {screen.qrUrl && (
          <div className="flex-shrink-0">
            <QRCode url={screen.qrUrl} size={180} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// TODAY_AT_CATFE - Daily specials/activities
function TodayAtCatfeScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#fef3c7" logoUrl={settings?.logoUrl}>
      <div className="text-center max-w-5xl">
        <div className="inline-block px-6 py-3 rounded-full bg-amber-500 text-white text-xl mb-6">
          Today at {settings?.locationName || "Catfé"}
        </div>
        <h1 className="tv-text-large mb-6 text-amber-900 drop-shadow-sm">
          {screen.title}
        </h1>
        {screen.subtitle && (
          <p className="tv-text-medium mb-6 text-amber-800">
            {screen.subtitle}
          </p>
        )}
        {screen.body && (
          <p className="tv-text-body text-amber-700 mb-8">
            {screen.body}
          </p>
        )}
        {screen.qrUrl && (
          <div className="flex justify-center">
            <QRCode url={screen.qrUrl} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// MEMBERSHIP - Membership promotion
function MembershipScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#d1fae5" logoUrl={settings?.logoUrl}>
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8">
        <div className="flex-1">
          <div className="inline-block px-4 py-2 rounded-full bg-emerald-500 text-white text-lg mb-4">
            Membership
          </div>
          <h1 className="tv-text-large mb-4 text-emerald-900">
            {screen.title}
          </h1>
          {screen.subtitle && (
            <p className="tv-text-medium mb-4 text-emerald-800">
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="tv-text-body text-emerald-700">
              {screen.body}
            </p>
          )}
        </div>
        {screen.qrUrl && (
          <div className="flex-shrink-0">
            <QRCode url={screen.qrUrl} size={200} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// REMINDER - General reminders
function ReminderScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#dbeafe" logoUrl={settings?.logoUrl}>
      <div className="text-center max-w-4xl">
        <div className="inline-block px-4 py-2 rounded-full bg-blue-500 text-white text-lg mb-6">
          Reminder
        </div>
        <h1 className="tv-text-large mb-6 text-blue-900">
          {screen.title}
        </h1>
        {screen.subtitle && (
          <p className="tv-text-medium mb-4 text-blue-800">
            {screen.subtitle}
          </p>
        )}
        {screen.body && (
          <p className="tv-text-body text-blue-700">
            {screen.body}
          </p>
        )}
      </div>
    </ScreenLayout>
  );
}

// ADOPTION - Cat adoption promotion
function AdoptionScreen({ screen, settings }: ScreenRendererProps) {
  const hasImage = !!screen.imagePath;
  const isAdopted = (screen as any).isAdopted;
  const textColorClass = hasImage ? "text-white drop-shadow-lg" : "text-red-900";
  const subtitleColorClass = hasImage ? "text-white/90 drop-shadow-md" : "text-red-800";
  const bodyColorClass = hasImage ? "text-white/80 drop-shadow" : "text-red-700";
  
  return (
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#fee2e2" logoUrl={settings?.logoUrl}>
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8">
        <div className="flex-1">
          {isAdopted ? (
            <div className="inline-block px-4 py-2 rounded-full bg-green-500 text-white text-lg mb-4 animate-pulse">
              🎉 Adopted!
            </div>
          ) : (
            <div className="inline-block px-4 py-2 rounded-full bg-red-500 text-white text-lg mb-4">
              Adopt Me!
            </div>
          )}
          <h1 className={`tv-text-large mb-4 ${textColorClass}`}>
            {screen.title}
          </h1>
          {screen.subtitle && (
            <p className={`tv-text-medium mb-4 ${subtitleColorClass}`}>
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className={`tv-text-body ${bodyColorClass}`}>
              {screen.body}
            </p>
          )}
        </div>
        {screen.qrUrl && (
          <div className="flex-shrink-0">
            <QRCode url={screen.qrUrl} size={180} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// ADOPTION_SHOWCASE - Grid of 8 random adoptable cats
function AdoptionShowcaseScreen({ screen, settings, adoptionCats }: ScreenRendererProps) {
  const cats = adoptionCats || [];
  const { data: adoptionCountData } = trpc.screens.getAdoptionCount.useQuery();
  const adoptedCount = adoptionCountData?.count || 0;
  
  // Show only 4 cats for larger display
  const displayCats = cats.slice(0, 4);
  
  return (
    <ScreenLayout bgColor="#ffedd5" logoUrl={settings?.logoUrl}>
      <div className="w-full h-full flex flex-col px-8 py-6">
        {/* Header - compact */}
        <div className="text-center mb-4">
          <div className="inline-block px-6 py-2 rounded-full bg-orange-500 text-white text-2xl font-semibold mb-2">
            Meet Our Adoptable Cats
          </div>
          <h1 className="text-4xl font-bold text-orange-900">
            {screen.title || "Find Your Purrfect Match"}
          </h1>
          {/* Adoption success counter */}
          {adoptedCount > 0 && (
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-800">
              <span className="text-2xl">🎉</span>
              <span className="text-lg font-semibold">
                {adoptedCount} {adoptedCount === 1 ? 'cat' : 'cats'} adopted and counting!
              </span>
            </div>
          )}
        </div>
        
        {/* 2x2 Grid of cats - 4 cats for larger display */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6 max-w-5xl mx-auto w-full">
          {displayCats.map((cat, index) => (
            <div 
              key={cat.id || index}
              className="relative bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col"
            >
              {/* Large square image container */}
              <div className="relative flex-1 min-h-0">
                {cat.imagePath ? (
                  <>
                    <img 
                      src={cat.imagePath} 
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Adopted badge overlay - larger */}
                    {(cat as any).isAdopted && (
                      <div className="absolute top-3 right-3 px-4 py-1.5 rounded-full bg-green-500 text-white text-lg font-bold shadow-lg animate-pulse">
                        🎉 Adopted!
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-orange-100 flex items-center justify-center">
                    <span className="text-8xl">🐱</span>
                    {/* Adopted badge overlay for no-image cats */}
                    {(cat as any).isAdopted && (
                      <div className="absolute top-3 right-3 px-4 py-1.5 rounded-full bg-green-500 text-white text-lg font-bold shadow-lg animate-pulse">
                        🎉 Adopted!
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Cat info - larger text */}
              <div className="p-4 bg-white">
                <h3 className="text-2xl font-bold text-orange-900 truncate">{cat.title}</h3>
                {cat.subtitle && (
                  <p className="text-lg text-orange-700 truncate">{cat.subtitle}</p>
                )}
              </div>
            </div>
          ))}
          
          {/* Fill empty slots with placeholders if less than 4 cats */}
          {displayCats.length < 4 && Array.from({ length: 4 - displayCats.length }).map((_, i) => (
            <div 
              key={`empty-${i}`}
              className="bg-orange-100 rounded-2xl flex flex-col overflow-hidden shadow-xl"
            >
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-orange-400">
                  <span className="text-8xl block mb-2">🐱</span>
                  <span className="text-xl">Coming Soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {screen.qrUrl && (
          <div className="text-center mt-4">
            <p className="text-lg text-orange-700 mb-1">Scan to see all adoptable cats</p>
            <div className="inline-block">
              <QRCode url={screen.qrUrl} size={120} />
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// ADOPTION_COUNTER - Full-screen celebration of total adoptions
function AdoptionCounterScreen({ screen, settings }: ScreenRendererProps) {
  const { data: settingsData } = trpc.settings.get.useQuery();
  const totalCount = settingsData?.totalAdoptionCount || 0;
  const animatedCount = useCountUp(totalCount, 2500); // 2.5 second count-up animation
  
  return (
    <ScreenLayout bgColor="#dcfce7" logoUrl={settings?.logoUrl}>
      <div className="text-center max-w-5xl">
        {/* Confetti-style decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>🎉</div>
          <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
          <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>❤️</div>
          <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDelay: '0.6s' }}>🐱</div>
          <div className="absolute top-1/4 left-1/4 text-4xl animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</div>
          <div className="absolute top-1/3 right-1/4 text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌟</div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          <div className="inline-block px-8 py-3 mb-6 rounded-full bg-green-500 text-white text-2xl font-bold shadow-lg">
            🏠 Forever Homes Found!
          </div>
          
          {/* Big counter number with count-up animation */}
          <div className="my-8">
            <motion.span 
              className="text-[12rem] font-black text-green-700 leading-none drop-shadow-lg inline-block"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {animatedCount}
            </motion.span>
          </div>
          
          <motion.h1 
            className="text-5xl font-bold text-green-800 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.5 }}
          >
            {screen.title || "Cats Adopted"}
          </motion.h1>
          
          {screen.subtitle && (
            <motion.p 
              className="text-3xl text-green-700 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.7 }}
            >
              {screen.subtitle}
            </motion.p>
          )}
          
          <motion.div 
            className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 text-green-800 text-xl font-medium shadow-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.9 }}
          >
            <span>💚</span>
            <span>Thank you for making a difference!</span>
            <span>💚</span>
          </motion.div>
        </div>
      </div>
    </ScreenLayout>
  );
}

// THANK_YOU - Appreciation messages
function ThankYouScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#e0e7ff" logoUrl={settings?.logoUrl}>
      <div className="text-center max-w-4xl">
        <h1 className="tv-text-large mb-6 text-indigo-900">
          {screen.title || "Thank You!"}
        </h1>
        {screen.subtitle && (
          <p className="tv-text-medium mb-4 text-indigo-800">
            {screen.subtitle}
          </p>
        )}
        {screen.body && (
          <p className="tv-text-body text-indigo-700">
            {screen.body}
          </p>
        )}
      </div>
    </ScreenLayout>
  );
}

// HAPPY_TAILS - Slideshow of adopted cats in their new homes
function HappyTailsScreen({ screen, settings }: ScreenRendererProps) {
  const { data: photos } = trpc.photos.getApproved.useQuery({ type: "happy_tails" });
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-rotate through photos every 8 seconds
  useEffect(() => {
    if (!photos || photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [photos]);
  
  const currentPhoto = photos?.[currentIndex];
  
  if (!photos || photos.length === 0) {
    return (
      <ScreenLayout bgColor="#fef3c7" logoUrl={settings?.logoUrl}>
        <div className="text-center">
          <div className="text-8xl mb-6">❤️</div>
          <h1 className="tv-text-large mb-4 text-amber-900">Happy Tails</h1>
          <p className="tv-text-medium text-amber-700">Coming soon - photos of our adopted cats!</p>
        </div>
      </ScreenLayout>
    );
  }
  
  return (
    <div className="tv-screen relative bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f59e0b" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      </div>
      
      {/* Header */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">❤️</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>Happy Tails</h1>
            <p className="text-2xl text-amber-700">Our adopted cats in their forever homes</p>
          </div>
        </div>
        <div className="text-amber-600 text-xl">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>
      
      {/* Main photo area */}
      <div className="absolute inset-0 flex items-center justify-center pt-32 pb-24 px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto?.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="flex gap-12 items-center max-w-6xl"
          >
            {/* Photo with background style for portrait photos */}
            <div className="flex-shrink-0">
              <div className="relative w-[500px] h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                {/* Background for portrait photos */}
                {currentPhoto?.backgroundStyle === "gradient" ? (
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.3) 100%)`,
                    }}
                  />
                ) : (
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${currentPhoto?.photoUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(25px)",
                      transform: "scale(1.2)",
                    }}
                  />
                )}
                {/* Actual photo centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={currentPhoto?.photoUrl}
                    alt={currentPhoto?.catName || "Adopted cat"}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {currentPhoto?.isFeatured && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-10">
                    <span className="text-2xl">⭐</span>
                    <span className="font-bold text-lg">Featured</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-2xl text-amber-600 mb-2">Meet</p>
                <h2 className="text-6xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                  {currentPhoto?.catName || "Our Friend"}
                </h2>
              </div>
              
              {currentPhoto?.caption && (
                <p className="text-3xl text-amber-800 leading-relaxed italic">
                  "{currentPhoto.caption}"
                </p>
              )}
              
              <p className="text-2xl text-amber-600">
                — {currentPhoto?.submitterName}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Logo */}
      <div className="absolute bottom-8 left-8">
        <CatfeLogo logoUrl={settings?.logoUrl} />
      </div>
      
      {/* QR Code for uploads - bottom right */}
      <div className="absolute bottom-8 right-8 flex items-end gap-6">
        {/* Progress dots */}
        <div className="flex gap-2 mb-2">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentIndex ? "bg-amber-600" : "bg-amber-300"
              }`}
            />
          ))}
        </div>
        
        {/* QR Code */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div className="text-center mb-2">
            <p className="text-sm font-semibold text-amber-800">Share yours!</p>
          </div>
          <QRCodeSVG 
            value={typeof window !== 'undefined' ? `${window.location.origin}/upload/happy-tails` : '/upload/happy-tails'}
            size={100}
            level="M"
          />
          <p className="text-xs text-amber-600 text-center mt-2">Scan to upload</p>
        </div>
      </div>
    </div>
  );
}

// SNAP_PURR_GALLERY - Multi-photo collage showcasing customer photos
function SnapPurrGalleryScreen({ screen, settings }: ScreenRendererProps) {
  const { data: photos } = trpc.photos.getApproved.useQuery({ type: "snap_purr" });
  const [displayedPhotos, setDisplayedPhotos] = useState<typeof photos>([]);
  
  // Show 3 photos at a time with shuffle
  const photosToShow = 3;
  
  // Shuffle photos every 8 seconds
  useEffect(() => {
    if (!photos || photos.length === 0) return;
    
    // Initial shuffle
    const shufflePhotos = () => {
      const shuffled = [...photos].sort(() => Math.random() - 0.5);
      setDisplayedPhotos(shuffled.slice(0, photosToShow));
    };
    
    shufflePhotos();
    
    if (photos.length > photosToShow) {
      const interval = setInterval(shufflePhotos, 8000);
      return () => clearInterval(interval);
    }
  }, [photos]);
  
  const currentPhotos = displayedPhotos || [];
  
  if (!photos || photos.length === 0) {
    return (
      <ScreenLayout bgColor="#fef9c3" logoUrl={settings?.logoUrl}>
        <div className="text-center">
          <div className="text-8xl mb-6">📸</div>
          <h1 className="tv-text-large mb-4 text-yellow-900">Snap & Purr Gallery</h1>
          <p className="tv-text-medium text-yellow-700">Scan the QR code to share your photos!</p>
        </div>
      </ScreenLayout>
    );
  }
  
  return (
    <div className="tv-screen relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/20 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <div className="absolute top-6 left-8 right-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">📸</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>Snap & Purr</h1>
            <p className="text-lg text-amber-700">Moments captured by our visitors</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-600 text-lg font-medium">{photos?.length || 0} photos</span>
        </div>
      </div>
      
      {/* Photo Collage Grid - 3 photos in a row */}
      <div className="absolute inset-0 pt-24 pb-28 px-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhotos.map(p => p.id).join('-')}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="h-full grid grid-cols-3 gap-6"
          >
            {currentPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className="relative group"
              >
                {/* Photo card */}
                <div className="relative h-full bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02]">
                  {/* Photo */}
                  <div className="absolute inset-0">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || "Visitor photo"}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  
                  {/* Featured badge */}
                  {photo.isFeatured && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 text-sm font-bold">
                      <span>⭐</span>
                      <span>Featured</span>
                    </div>
                  )}
                  
                  {/* Caption and name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {photo.caption && (
                      <p className="text-white text-lg font-medium line-clamp-2 mb-1 drop-shadow-lg">
                        "{photo.caption}"
                      </p>
                    )}
                    <p className="text-white/90 text-sm drop-shadow-md">
                      — {photo.submitterName}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Fill empty slots with placeholder */}
            {currentPhotos.length < photosToShow && Array.from({ length: photosToShow - currentPhotos.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="relative h-full bg-amber-100/50 rounded-3xl border-3 border-dashed border-amber-200 flex items-center justify-center">
                <div className="text-center text-amber-400">
                  <span className="text-6xl">📷</span>
                  <p className="text-xl mt-3 font-medium">Your photo here!</p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Logo - bottom left */}
      <div className="absolute bottom-6 left-8 z-20">
        <CatfeLogo logoUrl={settings?.logoUrl} />
      </div>
      
      {/* QR Code - bottom right */}
      <div className="absolute bottom-6 right-8 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">Share your moment!</p>
            <p className="text-xs text-amber-600">Scan to upload your photo</p>
          </div>
          <QRCodeSVG 
            value={typeof window !== 'undefined' ? `${window.location.origin}/upload/snap-purr` : '/upload/snap-purr'}
            size={80}
            level="M"
          />
        </div>
      </div>
    </div>
  );
}

// HAPPY_TAILS_QR - QR code screen for customers to upload photos of adopted cats
function HappyTailsQRScreen({ screen, settings }: ScreenRendererProps) {
  // Generate the upload URL based on the current domain
  const uploadUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/upload/happy-tails`
    : '/upload/happy-tails';
  
  return (
    <div className="tv-screen relative bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full translate-x-1/3 translate-y-1/3" />
      
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-6">
            <span className="text-7xl">🏠</span>
            <span className="text-7xl">❤️</span>
            <span className="text-7xl">🐱</span>
          </div>
          <h1 className="text-6xl font-bold text-orange-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Happy Tails
          </h1>
          <p className="text-3xl text-orange-700">
            Share photos of your adopted cat in their new home!
          </p>
        </div>
        
        {/* QR Code */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl mb-8">
          <QRCode url={uploadUrl} size={280} />
        </div>
        
        {/* Instructions */}
        <div className="text-center">
          <p className="text-2xl text-orange-800 mb-2">
            📱 Scan with your phone to upload
          </p>
          <p className="text-xl text-orange-600">
            Your photo will appear on our TV after approval!
          </p>
        </div>
      </div>
      
      {/* Logo */}
      <div className="absolute bottom-8 left-8">
        <CatfeLogo logoUrl={settings?.logoUrl} />
      </div>
      
      {/* Paw prints decoration */}
      <div className="absolute bottom-8 right-8 flex gap-4 opacity-30">
        <span className="text-6xl">🐾</span>
        <span className="text-5xl">🐾</span>
        <span className="text-4xl">🐾</span>
      </div>
    </div>
  );
}

// SNAP_PURR_QR - QR code screen for customers to upload in-lounge photos
function SnapPurrQRScreen({ screen, settings }: ScreenRendererProps) {
  // Generate the upload URL based on the current domain
  const uploadUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/upload/snap-purr`
    : '/upload/snap-purr';
  
  return (
    <div className="tv-screen relative bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200/40 rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/40 rounded-full -translate-x-1/3 translate-y-1/3" />
      
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-6">
            <span className="text-7xl">📸</span>
            <span className="text-7xl">😸</span>
            <span className="text-7xl">✨</span>
          </div>
          <h1 className="text-6xl font-bold text-yellow-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Snap & Purr!
          </h1>
          <p className="text-3xl text-yellow-700">
            Share your photos from today's visit!
          </p>
        </div>
        
        {/* QR Code */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl mb-8">
          <QRCode url={uploadUrl} size={280} />
        </div>
        
        {/* Instructions */}
        <div className="text-center">
          <p className="text-2xl text-yellow-800 mb-2">
            📱 Scan with your phone to upload
          </p>
          <p className="text-xl text-yellow-600">
            Your photo will appear on our TV after approval!
          </p>
        </div>
      </div>
      
      {/* Logo */}
      <div className="absolute bottom-8 left-8">
        <CatfeLogo logoUrl={settings?.logoUrl} />
      </div>
      
      {/* Camera decoration */}
      <div className="absolute bottom-8 right-8 flex gap-4 opacity-30">
        <span className="text-5xl">📷</span>
        <span className="text-4xl">🐱</span>
        <span className="text-5xl">💛</span>
      </div>
    </div>
  );
}

// LIVESTREAM - Live video stream from camera
function LivestreamScreen({ screen, settings }: ScreenRendererProps) {
  const livestreamUrl = (screen as any).livestreamUrl;
  
  if (!livestreamUrl) {
    return (
      <ScreenLayout bgColor="#1f2937" logoUrl={settings?.logoUrl}>
        <div className="text-center">
          <div className="text-6xl mb-6">📹</div>
          <h1 className="tv-text-large mb-4 text-white">Livestream</h1>
          <p className="tv-text-medium text-gray-400">No stream URL configured</p>
        </div>
      </ScreenLayout>
    );
  }
  
  return (
    <div className="tv-screen relative bg-black">
      {/* Video player */}
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        loop
        src={livestreamUrl}
      >
        <source src={livestreamUrl} type="application/x-mpegURL" />
        Your browser does not support HLS video.
      </video>
      
      {/* Live indicator */}
      <div className="absolute top-8 left-8 flex items-center gap-3 px-4 py-2 bg-red-600 rounded-lg shadow-lg">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        <span className="text-white font-bold text-xl">LIVE</span>
      </div>
      
      {/* Logo overlay */}
      <div className="absolute bottom-36 left-8">
        <CatfeLogo logoUrl={settings?.logoUrl} />
      </div>
      
      {/* Title overlay if provided */}
      {screen.title && (
        <div className="absolute bottom-8 left-8 right-8">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-4">
            <h2 className="text-white text-3xl font-bold">{screen.title}</h2>
            {screen.subtitle && (
              <p className="text-gray-300 text-xl mt-1">{screen.subtitle}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Main renderer that selects the appropriate component
export function ScreenRenderer({ screen, settings, adoptionCats }: ScreenRendererProps) {
  const renderers: Record<string, React.FC<ScreenRendererProps>> = {
    SNAP_AND_PURR: SnapAndPurrScreen,
    EVENT: EventScreen,
    TODAY_AT_CATFE: TodayAtCatfeScreen,
    MEMBERSHIP: MembershipScreen,
    REMINDER: ReminderScreen,
    ADOPTION: AdoptionScreen,
    ADOPTION_SHOWCASE: AdoptionShowcaseScreen,
    ADOPTION_COUNTER: AdoptionCounterScreen,
    THANK_YOU: ThankYouScreen,
    LIVESTREAM: LivestreamScreen,
    HAPPY_TAILS: HappyTailsScreen,
    SNAP_PURR_GALLERY: SnapPurrGalleryScreen,
    HAPPY_TAILS_QR: HappyTailsQRScreen,
    SNAP_PURR_QR: SnapPurrQRScreen,
    POLL: () => <PollScreen />,
  };
  
  const Renderer = renderers[screen.type] || EventScreen;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        <Renderer screen={screen} settings={settings} adoptionCats={adoptionCats} />
      </motion.div>
    </AnimatePresence>
  );
}

// Fallback screen when no content is available
export function FallbackScreen({ settings }: { settings: Settings | null }) {
  return (
    <div 
      className="tv-screen flex items-center justify-center"
      style={{ backgroundColor: "#f5f0e8" }}
    >
      <div className="text-center">
        <h1 className="tv-text-large text-amber-800 mb-4">
          {settings?.locationName || "Catfé"}
        </h1>
        <p className="tv-text-medium text-amber-600">
          Welcome! Content loading...
        </p>
      </div>
    </div>
  );
}
