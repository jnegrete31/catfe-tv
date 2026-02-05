import { motion, AnimatePresence } from "framer-motion";
import type { Screen, Settings } from "@shared/types";
import { SCREEN_TYPE_CONFIG } from "@shared/types";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { PollScreen } from "./PollScreen";
import { TemplateRenderer } from "./TemplateRenderer";

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
}: { 
  children: React.ReactNode;
  bgColor?: string;
  imagePath?: string | null;
  imageDisplayMode?: "cover" | "contain" | null;
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
      
      {/* Logo is now handled by LogoWidget overlay in TVDisplay */}
      
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
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-pink-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-amber-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-pink-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(255,150,200,0.3) 0%, transparent 50%)' }} />
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl"
        >
          <h1 className="text-6xl font-light tracking-wider text-white mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-pink-400">{screen.title || "Snap"}</span> <span className="text-white/80">& Purr!</span>
          </h1>
          {screen.subtitle && (
            <p className="text-2xl text-white/70 mb-8">
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="text-xl text-white/60 mb-8">
              {screen.body}
            </p>
          )}
          {screen.qrUrl && (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
            >
              <QRCodeSVG value={screen.qrUrl} size={200} level="M" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// EVENT - Special events
function EventScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-purple-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-violet-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-purple-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(150,100,255,0.3) 0%, transparent 50%)' }} />
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center px-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-row items-center justify-center w-full max-w-7xl gap-16"
        >
          {/* Event image - polaroid style */}
          {screen.imagePath && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 80 }}
              className="flex-shrink-0"
            >
              <div className="bg-white p-4 pb-16 shadow-2xl rounded-sm relative" style={{ boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)' }}>
                <div className="relative w-[380px] h-[380px] overflow-hidden bg-gray-100">
                  <img
                    src={screen.imagePath}
                    alt={screen.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.15)' }} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-gray-800 text-2xl font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    {screen.title}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Event info */}
          <div className="flex-1 max-w-xl">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full bg-purple-500/20 border border-purple-400/30"
            >
              <span className="text-3xl">🎉</span>
              <span className="text-purple-300 text-2xl font-medium tracking-wide">Event</span>
            </motion.div>
            {!screen.imagePath && (
              <h1 className="text-6xl font-light tracking-wider text-white mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                <span className="text-purple-400">{screen.title}</span>
              </h1>
            )}
            {screen.imagePath && (
              <h1 className="text-5xl font-light tracking-wider text-white mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                <span className="text-purple-400">{screen.title}</span>
              </h1>
            )}
            {screen.subtitle && (
              <p className="text-3xl text-white/80 mb-4">
                {screen.subtitle}
              </p>
            )}
            {screen.body && (
              <p className="text-2xl text-white/70 leading-relaxed">
                {screen.body}
              </p>
            )}
            {screen.qrUrl && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl"
              >
                <div className="text-center mb-2">
                  <p className="text-lg font-semibold text-gray-700">Learn More</p>
                </div>
                <QRCodeSVG value={screen.qrUrl} size={150} level="M" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// TODAY_AT_CATFE - Daily specials/activities
function TodayAtCatfeScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-amber-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-orange-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-amber-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(255,200,100,0.3) 0%, transparent 50%)' }} />
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-5xl"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-8 py-4 mb-8 rounded-full bg-amber-500/20 border border-amber-400/30"
          >
            <span className="text-4xl">☕</span>
            <span className="text-amber-300 text-3xl font-medium tracking-wide">Today at {settings?.locationName || "Catfé"}</span>
          </motion.div>
          <h1 className="text-7xl font-light tracking-wider text-white mb-8" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-amber-400">{screen.title}</span>
          </h1>
          {screen.subtitle && (
            <p className="text-4xl text-white/80 mb-6">
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="text-3xl text-white/70 mb-8 leading-relaxed">
              {screen.body}
            </p>
          )}
          {screen.qrUrl && (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl"
            >
              <QRCodeSVG value={screen.qrUrl} size={160} level="M" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// MEMBERSHIP - Membership promotion
function MembershipScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-emerald-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-teal-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-emerald-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(100,255,200,0.3) 0%, transparent 50%)' }} />
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12"
        >
          <div className="flex-1">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full bg-emerald-500/20 border border-emerald-400/30"
            >
              <span className="text-3xl">⭐</span>
              <span className="text-emerald-300 text-2xl font-medium tracking-wide">Membership</span>
            </motion.div>
            <h1 className="text-6xl font-light tracking-wider text-white mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-emerald-400">{screen.title}</span>
            </h1>
            {screen.subtitle && (
              <p className="text-3xl text-white/80 mb-4">
                {screen.subtitle}
              </p>
            )}
            {screen.body && (
              <p className="text-2xl text-white/70 leading-relaxed">
                {screen.body}
              </p>
            )}
          </div>
          {screen.qrUrl && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl"
            >
              <QRCodeSVG value={screen.qrUrl} size={200} level="M" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// REMINDER - General reminders
function ReminderScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-blue-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-cyan-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-blue-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(100,150,255,0.3) 0%, transparent 50%)' }} />
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full bg-blue-500/20 border border-blue-400/30"
          >
            <span className="text-3xl">📌</span>
            <span className="text-blue-300 text-2xl font-medium tracking-wide">Reminder</span>
          </motion.div>
          <h1 className="text-7xl font-light tracking-wider text-white mb-8" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-blue-400">{screen.title}</span>
          </h1>
          {screen.subtitle && (
            <p className="text-4xl text-white/80 mb-6">
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="text-3xl text-white/70 leading-relaxed">
              {screen.body}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ADOPTION - Cat adoption promotion
function AdoptionScreen({ screen, settings }: ScreenRendererProps) {
  const isAdopted = (screen as any).isAdopted;
  
  // Floating decorative elements
  const floatingElements = [
    { emoji: '🐾', x: '5%', y: '15%', delay: 0, size: 'text-4xl' },
    { emoji: '❤️', x: '92%', y: '20%', delay: 0.5, size: 'text-3xl' },
    { emoji: '🐾', x: '88%', y: '75%', delay: 1, size: 'text-4xl' },
    { emoji: '✨', x: '8%', y: '80%', delay: 1.5, size: 'text-3xl' },
    { emoji: '🧡', x: '15%', y: '45%', delay: 2, size: 'text-2xl' },
    { emoji: '💕', x: '85%', y: '50%', delay: 2.5, size: 'text-2xl' },
  ];
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-orange-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-pink-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-orange-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(255,150,100,0.3) 0%, transparent 50%)' }} />
      
      {/* Floating decorative elements */}
      {floatingElements.map((el, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.4, 0.7, 0.4], 
            scale: [1, 1.1, 1],
            y: [0, -10, 0]
          }}
          transition={{ 
            delay: el.delay, 
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          className={`absolute ${el.size} pointer-events-none`}
          style={{ left: el.x, top: el.y }}
        >
          {el.emoji}
        </motion.div>
      ))}
      
      {/* Header - "Meet [Name]" */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-0 right-0 text-center z-10"
      >
        <h1 className="text-7xl font-light tracking-wider text-white" style={{ fontFamily: 'Georgia, serif' }}>
          Meet <span className="text-orange-400">{screen.title?.replace('Meet ', '')}</span>
        </h1>
      </motion.div>
      
      {/* Main content - larger layout */}
      <div className="absolute inset-0 flex items-center justify-center px-16 pt-20">
        <div className="flex flex-row items-center justify-center w-full max-w-7xl gap-12">
          {/* Large Polaroid-style cat photo */}
          {screen.imagePath && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 80 }}
              className="flex-shrink-0"
            >
              <div className="bg-white p-4 pb-20 shadow-2xl rounded-sm relative" style={{ boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)' }}>
                <div className="relative w-[420px] h-[420px] overflow-hidden bg-gray-100">
                  <img
                    src={screen.imagePath}
                    alt={screen.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.15)' }} />
                  {isAdopted && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 5 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute top-4 right-4 px-5 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold shadow-lg"
                    >
                      🎉 Adopted!
                    </motion.div>
                  )}
                </div>
                {/* Polaroid caption */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-gray-800 text-3xl font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    Meet {screen.title?.replace('Meet ', '')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Info section - richer content */}
          <div className="flex-1 max-w-xl space-y-6">
            {/* Status badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${isAdopted ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/40' : 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border-orange-400/40'} border backdrop-blur-sm`}
            >
              <span className="text-3xl">{isAdopted ? '🎉' : '🐱'}</span>
              <span className={`${isAdopted ? 'text-green-300' : 'text-orange-300'} text-2xl font-medium tracking-wide`}>
                {isAdopted ? 'Found a Forever Home!' : 'Looking for Love'}
              </span>
            </motion.div>
            
            {/* Age/Gender info */}
            {screen.subtitle && (
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl text-white/90 font-light"
              >
                {screen.subtitle}
              </motion.p>
            )}
            
            {/* Bio/Description */}
            {screen.body && (
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl text-white/70 leading-relaxed"
              >
                {screen.body}
              </motion.p>
            )}
            
            {/* Call to action message */}
            {!isAdopted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
              >
                <p className="text-lg text-white/70 italic" style={{ fontFamily: 'Georgia, serif' }}>
                  "Scan the QR to Adopt Me :)"
                </p>
              </motion.div>
            )}
            
            {/* QR Code */}
            {screen.qrUrl && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl"
              >
                <div className="text-center mb-3">
                  <p className="text-base font-semibold text-gray-700">Learn More</p>
                </div>
                <QRCodeSVG value={screen.qrUrl} size={150} level="M" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-full">
          <path fill="rgba(255,150,100,0.3)" d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,25 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </div>
  );
}

// ADOPTION_SHOWCASE - Grid of 4 random adoptable cats with 6-second shuffle
function AdoptionShowcaseScreen({ screen, settings, adoptionCats }: ScreenRendererProps) {
  const cats = adoptionCats || [];
  const { data: adoptionCountData } = trpc.screens.getAdoptionCount.useQuery();
  const adoptedCount = adoptionCountData?.count || 0;
  
  // Use all cats passed in (already limited to 4 by parent)
  const displayCats = cats;
  
  // Polaroid rotation angles for visual interest
  const rotations = [-2, 3, -3, 2];
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-orange-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-pink-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-orange-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(255,150,100,0.3) 0%, transparent 50%)' }} />
      
      {/* Header - elegant and minimal */}
      <div className="absolute top-6 left-0 right-0 z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <h1 className="text-7xl font-light tracking-wider text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-orange-400">Meet</span> Our <span className="text-pink-400">Cats</span>
          </h1>
          <p className="text-2xl text-white/60 tracking-widest uppercase">Find Your Purrfect Match</p>
          {/* Adoption success counter */}
          {adoptedCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/20 border border-green-400/30 text-green-300">
              <span className="text-3xl">🎉</span>
              <span className="text-xl font-medium">
                {adoptedCount} {adoptedCount === 1 ? 'cat' : 'cats'} found their forever home!
              </span>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Single Row Polaroid Grid */}
      <div className="absolute inset-0 flex items-center justify-center px-6 pt-40 pb-24">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={displayCats.map(c => c.id).join('-')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-row gap-5 justify-center items-center w-full"
          >
            {displayCats.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8, rotate: rotations[idx] - 10 }}
                animate={{ opacity: 1, scale: 1, rotate: rotations[idx] }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
                style={{ transform: `rotate(${rotations[idx]}deg)` }}
              >
                {/* Polaroid frame */}
                <div className="bg-white p-3 pb-16 shadow-2xl rounded-sm relative" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)' }}>
                  {/* Photo */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {cat.imagePath ? (
                      <img
                        src={cat.imagePath}
                        alt={cat.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                        <span className="text-7xl">🐱</span>
                      </div>
                    )}
                    {/* Subtle vignette */}
                    <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.15)' }} />
                    
                    {/* Adopted badge */}
                    {(cat as any).isAdopted && (
                      <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg">
                        🎉 Adopted!
                      </div>
                    )}
                  </div>
                  
                  {/* Cat name - handwritten style */}
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <p className="text-gray-800 text-2xl font-semibold truncate" style={{ fontFamily: 'Georgia, serif' }}>
                      Meet {cat.title?.replace('Meet ', '')}
                    </p>
                    {cat.subtitle && (
                      <p className="text-gray-600 text-lg truncate">{cat.subtitle}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Empty polaroid placeholders */}
            {displayCats.length < 4 && Array.from({ length: 4 - displayCats.length }).map((_, idx) => (
              <motion.div
                key={`empty-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                style={{ transform: `rotate(${rotations[displayCats.length + idx] || 0}deg)` }}
              >
                <div className="bg-white/20 p-3 pb-16 rounded-sm border-2 border-dashed border-white/30">
                  <div className="aspect-square flex items-center justify-center bg-white/10">
                    <div className="text-center text-white/50">
                      <span className="text-5xl">🐱</span>
                      <p className="text-sm mt-2">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Cat count indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-orange-400 text-lg">🐾</span>
          <span className="text-white/80 text-sm">{cats.length} cats looking for homes</span>
        </div>
      </div>
      
      {/* QR Code - bottom left - sleek design */}
      {screen.qrUrl && (
        <div className="absolute bottom-6 left-8 z-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl flex items-center gap-4"
          >
            <div className="bg-white p-1.5 rounded-lg shadow-inner">
              <QRCodeSVG
                value={screen.qrUrl}
                size={70}
                level="M"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">See all cats</p>
              <p className="text-xs text-gray-500">Scan to browse</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ADOPTION_COUNTER - Full-screen celebration of total adoptions
function AdoptionCounterScreen({ screen, settings }: ScreenRendererProps) {
  const { data: settingsData } = trpc.settings.get.useQuery();
  const totalCount = settingsData?.totalAdoptionCount || 0;
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-green-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-emerald-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(100,255,150,0.3) 0%, transparent 50%)' }} />
      
      {/* Floating celebration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-16 left-16 text-5xl"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🎉
        </motion.div>
        <motion.div 
          className="absolute top-24 right-24 text-4xl"
          animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          🎊
        </motion.div>
        <motion.div 
          className="absolute bottom-32 left-24 text-4xl"
          animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          ❤️
        </motion.div>
        <motion.div 
          className="absolute bottom-24 right-20 text-5xl"
          animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        >
          🐱
        </motion.div>
        <motion.div 
          className="absolute top-1/3 left-1/5 text-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ⭐
        </motion.div>
        <motion.div 
          className="absolute top-1/4 right-1/4 text-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          🌟
        </motion.div>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 mb-8 rounded-full bg-green-500/20 border border-green-400/30"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-green-300 text-xl font-medium tracking-wide">Forever Homes Found</span>
          </motion.div>
          
          {/* Big counter number */}
          <div className="my-6">
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
              className="text-[14rem] font-black leading-none inline-block"
              style={{ 
                fontFamily: 'Georgia, serif',
                background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 20px rgba(74, 222, 128, 0.3))'
              }}
            >
              {totalCount}
            </motion.span>
          </div>
          
          <h1 className="text-5xl font-light tracking-wider text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-green-400">{screen.title || "Cats"}</span> <span className="text-white/80">Adopted</span>
          </h1>
          
          {screen.subtitle && (
            <p className="text-2xl text-white/60 mb-6">
              {screen.subtitle}
            </p>
          )}
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <span className="text-green-400">💚</span>
            <span className="text-white/80 text-lg">Thank you for making a difference!</span>
            <span className="text-green-400">💚</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// THANK_YOU - Appreciation messages
function ThankYouScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-indigo-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-violet-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(150,100,255,0.3) 0%, transparent 50%)' }} />
      
      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 text-4xl"
          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          💜
        </motion.div>
        <motion.div 
          className="absolute top-32 right-32 text-3xl"
          animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          ✨
        </motion.div>
        <motion.div 
          className="absolute bottom-28 left-28 text-3xl"
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          💖
        </motion.div>
        <motion.div 
          className="absolute bottom-20 right-24 text-4xl"
          animate={{ y: [0, -8, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        >
          😻
        </motion.div>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-8 py-4 mb-8 rounded-full bg-indigo-500/20 border border-indigo-400/30"
          >
            <span className="text-4xl">🙏</span>
            <span className="text-indigo-300 text-3xl font-medium tracking-wide">Thank You</span>
          </motion.div>
          <h1 className="text-8xl font-light tracking-wider text-white mb-8" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-indigo-400">{screen.title || "Thank You!"}</span>
          </h1>
          {screen.subtitle && (
            <p className="text-4xl text-white/80 mb-6">
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="text-3xl text-white/70 leading-relaxed">
              {screen.body}
            </p>
          )}
        </motion.div>
      </div>
    </div>
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
      <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
          <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-red-400/30 rounded-full" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">❤️</div>
            <h1 className="text-5xl font-light tracking-wider text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-red-400">Happy</span> <span className="text-white/80">Tails</span>
            </h1>
            <p className="text-xl text-white/60">Coming soon - photos of our adopted cats!</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-red-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-pink-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-red-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(255,100,100,0.3) 0%, transparent 50%)' }} />
      
      {/* Header */}
      <div className="absolute top-8 left-0 right-0 z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <h1 className="text-5xl font-light tracking-wider text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-red-400">Happy</span> <span className="text-white/80">Tails</span>
          </h1>
          <p className="text-lg text-white/60 tracking-widest uppercase">Forever Homes Found</p>
        </motion.div>
      </div>
      
      {/* Main photo area with polaroid */}
      <div className="absolute inset-0 flex items-center justify-center pt-28 pb-20 px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto?.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="flex gap-12 items-center max-w-6xl"
          >
            {/* Polaroid-style photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
              style={{ transform: 'rotate(-2deg)' }}
              className="flex-shrink-0"
            >
              <div className="bg-white p-3 pb-16 shadow-2xl rounded-sm relative" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)' }}>
                <div className="relative w-96 h-96 overflow-hidden bg-gray-100">
                  <img
                    src={currentPhoto?.photoUrl}
                    alt={currentPhoto?.catName || "Adopted cat"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.15)' }} />
                  {currentPhoto?.isFeatured && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-sm font-bold shadow-lg flex items-center gap-1">
                      <span>⭐</span> Featured
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <p className="text-gray-800 text-2xl font-semibold truncate" style={{ fontFamily: 'Georgia, serif' }}>
                    {currentPhoto?.catName || "Our Friend"}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Info */}
            <div className="flex-1 space-y-6">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/20 border border-red-400/30"
              >
                <span className="text-xl">🏠</span>
                <span className="text-red-300 text-lg font-medium tracking-wide">Forever Home</span>
              </motion.div>
              
              {currentPhoto?.caption && (
                <p className="text-2xl text-white/70 leading-relaxed italic">
                  "{currentPhoto.caption}"
                </p>
              )}
              
              <p className="text-xl text-white/50">
                — {currentPhoto?.submitterName}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-red-400 text-lg">❤️</span>
          <span className="text-white/80 text-sm">{currentIndex + 1} / {photos.length}</span>
        </div>
      </div>
      
      {/* QR Code for uploads - bottom right */}
      <div className="absolute bottom-6 right-8 z-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl flex items-center gap-4"
        >
          <div className="bg-white p-1.5 rounded-lg shadow-inner">
            <QRCodeSVG 
              value={typeof window !== 'undefined' ? `${window.location.origin}/upload/happy-tails` : '/upload/happy-tails'}
              size={70}
              level="M"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Share yours!</p>
            <p className="text-xs text-gray-500">Scan to upload</p>
          </div>
        </motion.div>
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
  
  // Shuffle photos every 6 seconds
  useEffect(() => {
    if (!photos || photos.length === 0) return;
    
    // Initial shuffle
    const shufflePhotos = () => {
      const shuffled = [...photos].sort(() => Math.random() - 0.5);
      setDisplayedPhotos(shuffled.slice(0, photosToShow));
    };
    
    shufflePhotos();
    
    if (photos.length > photosToShow) {
      const interval = setInterval(shufflePhotos, 6000);
      return () => clearInterval(interval);
    }
  }, [photos]);
  
  const currentPhotos = displayedPhotos || [];
  
  if (!photos || photos.length === 0) {
    return (
      <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
          <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-amber-400/30 rounded-full" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">📸</div>
            <h1 className="text-5xl font-light tracking-wider text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-amber-400">Snap</span> & <span className="text-orange-400">Purr</span>
            </h1>
            <p className="text-xl text-white/60">Scan the QR code to share your photos!</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Polaroid rotation angles for visual interest
  const rotations = [-3, 2, -2];
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-amber-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-orange-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-amber-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(255,200,100,0.3) 0%, transparent 50%)' }} />
      
      {/* Header - elegant and minimal */}
      <div className="absolute top-8 left-0 right-0 z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <h1 className="text-5xl font-light tracking-wider text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-amber-400">Snap</span> & <span className="text-orange-400">Purr</span>
          </h1>
          <p className="text-lg text-white/60 tracking-widest uppercase">Guest Gallery</p>
        </motion.div>
      </div>
      
      {/* Polaroid Photo Grid */}
      <div className="absolute inset-0 flex items-center justify-center px-16 pt-28 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhotos.map(p => p.id).join('-')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-8 w-full max-w-6xl"
          >
            {currentPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8, rotate: rotations[idx] - 10 }}
                animate={{ opacity: 1, scale: 1, rotate: rotations[idx] }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.15, duration: 0.5, type: 'spring', stiffness: 100 }}
                className="flex-1 max-w-sm"
                style={{ transform: `rotate(${rotations[idx]}deg)` }}
              >
                {/* Polaroid frame */}
                <div className="bg-white p-3 pb-16 shadow-2xl rounded-sm" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)' }}>
                  {/* Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || "Visitor photo"}
                      className="w-full h-full object-cover"
                    />
                    {/* Subtle vignette */}
                    <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.15)' }} />
                    
                    {/* Featured star */}
                    {photo.isFeatured && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm">⭐</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Caption area - handwritten style */}
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    {photo.caption ? (
                      <p className="text-gray-700 text-lg truncate" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                        "{photo.caption}"
                      </p>
                    ) : (
                      <p className="text-gray-500 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                        — {photo.submitterName}
                      </p>
                    )}
                    {photo.caption && (
                      <p className="text-gray-400 text-sm mt-1">— {photo.submitterName}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Empty polaroid placeholders */}
            {currentPhotos.length < photosToShow && Array.from({ length: photosToShow - currentPhotos.length }).map((_, idx) => (
              <motion.div
                key={`empty-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="flex-1 max-w-sm"
                style={{ transform: `rotate(${rotations[currentPhotos.length + idx] || 0}deg)` }}
              >
                <div className="bg-white/20 p-3 pb-16 rounded-sm border-2 border-dashed border-white/30">
                  <div className="aspect-[4/3] flex items-center justify-center bg-white/10">
                    <div className="text-center text-white/50">
                      <span className="text-5xl">📷</span>
                      <p className="text-sm mt-2">Your photo here!</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Photo count indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-amber-400 text-lg">📸</span>
          <span className="text-white/80 text-sm">{photos?.length || 0} memories shared</span>
        </div>
      </div>
      
      {/* QR Code - bottom right - sleek design */}
      <div className="absolute bottom-6 right-8 z-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl flex items-center gap-4"
        >
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">Share your moment</p>
            <p className="text-xs text-gray-500">Scan to upload</p>
          </div>
          <div className="bg-white p-1.5 rounded-lg shadow-inner">
            <QRCodeSVG 
              value={typeof window !== 'undefined' ? `${window.location.origin}/upload/snap-purr` : '/upload/snap-purr'}
              size={70}
              level="M"
            />
          </div>
        </motion.div>
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
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-red-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-pink-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-red-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(255,100,100,0.3) 0%, transparent 50%)' }} />
      
      {/* Floating emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 text-4xl"
          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🏠
        </motion.div>
        <motion.div 
          className="absolute top-32 right-32 text-3xl"
          animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          ❤️
        </motion.div>
        <motion.div 
          className="absolute bottom-28 left-28 text-3xl"
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          🐱
        </motion.div>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-light tracking-wider text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-red-400">Happy</span> <span className="text-white/80">Tails</span>
          </h1>
          <p className="text-xl text-white/60 mb-8">
            Share photos of your adopted cat in their new home!
          </p>
          
          {/* QR Code */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl mb-8"
          >
            <QRCode url={uploadUrl} size={280} />
          </motion.div>
          
          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-lg text-white/70">
              📱 Scan with your phone to upload
            </p>
            <p className="text-base text-white/50">
              Your photo will appear on our TV after approval!
            </p>
          </div>
        </motion.div>
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
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-amber-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-yellow-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-amber-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(255,200,100,0.3) 0%, transparent 50%)' }} />
      
      {/* Floating emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 text-4xl"
          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          📸
        </motion.div>
        <motion.div 
          className="absolute top-32 right-32 text-3xl"
          animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          😸
        </motion.div>
        <motion.div 
          className="absolute bottom-28 left-28 text-3xl"
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          ✨
        </motion.div>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-light tracking-wider text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-amber-400">Snap</span> <span className="text-white/80">& Purr!</span>
          </h1>
          <p className="text-xl text-white/60 mb-8">
            Share your photos from today's visit!
          </p>
          
          {/* QR Code */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl mb-8"
          >
            <QRCode url={uploadUrl} size={280} />
          </motion.div>
          
          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-lg text-white/70">
              📱 Scan with your phone to upload
            </p>
            <p className="text-base text-white/50">
              Your photo will appear on our TV after approval!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// LIVESTREAM - Live video stream from camera
function LivestreamScreen({ screen, settings }: ScreenRendererProps) {
  const livestreamUrl = (screen as any).livestreamUrl;
  
  if (!livestreamUrl) {
    return (
      <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
          <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-red-400/30 rounded-full" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6">📹</div>
            <h1 className="text-5xl font-light tracking-wider text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-red-400">Live</span><span className="text-white/80">stream</span>
            </h1>
            <p className="text-xl text-white/60">No stream URL configured</p>
          </div>
        </div>
      </div>
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
      
      {/* Live indicator with elegant styling */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-2xl"
      >
        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        <span className="text-white font-bold text-xl tracking-wider">LIVE</span>
      </motion.div>
      
      {/* Title overlay if provided */}
      {screen.title && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-8 right-8"
        >
          <div className="bg-black/70 backdrop-blur-md rounded-2xl px-8 py-5 border border-white/10">
            <h2 className="text-white text-3xl font-light tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>{screen.title}</h2>
            {screen.subtitle && (
              <p className="text-white/70 text-xl mt-2">{screen.subtitle}</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// CHECK_IN - Guest check-in screen with waiver QR, WiFi, and house rules
function CheckInScreen({ screen, settings }: ScreenRendererProps) {
  const { data: settingsData } = trpc.settings.get.useQuery();
  const waiverUrl = settingsData?.waiverUrl;
  const wifiName = settingsData?.wifiName;
  const wifiPassword = settingsData?.wifiPassword;
  const houseRules = settingsData?.houseRules || [];
  const locationName = settingsData?.locationName || "Catfé";
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-cyan-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-teal-400/30 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-cyan-400/10 rounded-full" />
      </div>
      
      {/* Subtle light rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] opacity-5" 
           style={{ background: 'radial-gradient(ellipse at center top, rgba(100,200,255,0.3) 0%, transparent 50%)' }} />
      
      <div className="absolute inset-0 p-10 flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-light tracking-wider text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome to <span className="text-cyan-400">{locationName}</span>!
          </h1>
          <p className="text-xl text-white/60">
            {screen.subtitle || "Please complete these steps before your visit"}
          </p>
        </motion.div>
        
        {/* Main content - 3 columns */}
        <div className="flex-1 grid grid-cols-3 gap-6">
          {/* Column 1: Waiver */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="text-2xl font-light text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Sign Waiver</h2>
            <p className="text-sm text-white/60 text-center mb-4">
              Scan to complete your liability waiver
            </p>
            {waiverUrl ? (
              <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl">
                <QRCodeSVG value={waiverUrl} size={140} level="M" />
              </div>
            ) : (
              <p className="text-white/50 italic text-sm">Ask staff for waiver</p>
            )}
          </motion.div>
          
          {/* Column 2: WiFi */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mb-4">
              <span className="text-3xl">📶</span>
            </div>
            <h2 className="text-2xl font-light text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Free WiFi</h2>
            <p className="text-sm text-white/60 text-center mb-4">
              Connect to our guest network
            </p>
            {wifiName ? (
              <div className="text-center space-y-3 w-full">
                <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Network Name</p>
                  <p className="text-xl font-medium text-white">{wifiName}</p>
                </div>
                {wifiPassword && (
                  <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                    <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Password</p>
                    <p className="text-xl font-mono text-white">{wifiPassword}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/50 italic text-sm">Ask staff for WiFi details</p>
            )}
          </motion.div>
          
          {/* Column 3: House Rules */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
            </div>
            <h2 className="text-2xl font-light text-white mb-2 text-center" style={{ fontFamily: 'Georgia, serif' }}>House Rules</h2>
            <p className="text-sm text-white/60 text-center mb-4">
              Help keep our cats happy & safe
            </p>
            {houseRules.length > 0 ? (
              <ul className="space-y-2 flex-1 overflow-auto">
                {houseRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center flex-shrink-0 text-orange-400 text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-white/70 pt-0.5">{rule}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-white/50 italic text-sm">Rules will be displayed here</p>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-lg text-white/50">
            🐱 Thank you for visiting! Enjoy your time with our furry friends! 🐱
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Main renderer that selects the appropriate component
export function ScreenRenderer({ screen, settings, adoptionCats }: ScreenRendererProps) {
  // Check if a custom template exists for this screen type
  const { data: template } = trpc.templates.getByScreenType.useQuery(
    { screenType: screen.type },
    { staleTime: 60000 }
  );
  
  // Check if template has custom elements (not just defaults)
  let hasCustomTemplate = false;
  try {
    const elements = JSON.parse(template?.elements || "[]");
    // Consider it custom if it has elements and was explicitly saved
    hasCustomTemplate = !!(elements.length > 0 && template && 'id' in template && (template as any).id !== undefined);
  } catch {
    hasCustomTemplate = false;
  }
  
  // If custom template exists, use TemplateRenderer
  if (hasCustomTemplate) {
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
          <TemplateRenderer 
            screen={screen} 
            settings={settings} 
            adoptionCount={settings?.totalAdoptionCount}
          />
        </motion.div>
      </AnimatePresence>
    );
  }
  
  // Otherwise use default hardcoded renderers
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
    CHECK_IN: CheckInScreen,
    // Custom slides always use TemplateRenderer with their saved template
    CUSTOM: ({ screen }) => {
      // For CUSTOM screens, render with dark elegant theme
      return (
        <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
            <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-pink-400/30 rounded-full" />
            <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-blue-400/30 rounded-full" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 md:p-16">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 text-center">{screen.title}</h1>
            {screen.subtitle && (
              <p className="text-3xl md:text-4xl text-white/80 text-center">{screen.subtitle}</p>
            )}
            {screen.body && (
              <p className="text-2xl md:text-3xl text-white/60 mt-6 max-w-4xl text-center">{screen.body}</p>
            )}
            {screen.imagePath && (
              <div className="mt-8">
                <div className="bg-white p-4 pb-16 shadow-2xl" style={{ transform: 'rotate(-2deg)' }}>
                  <img 
                    src={screen.imagePath} 
                    alt={screen.title}
                    className="w-[400px] h-[300px] object-cover"
                  />
                </div>
              </div>
            )}
            {screen.qrUrl && (
              <div className="mt-8 bg-white p-4 rounded-lg shadow-xl">
                <QRCodeSVG value={screen.qrUrl} size={150} level="M" />
              </div>
            )}
          </div>
        </div>
      );
    },
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
