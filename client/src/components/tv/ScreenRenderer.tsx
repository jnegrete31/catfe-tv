import { motion, AnimatePresence } from "framer-motion";
import type { Screen, Settings, Cat } from "@shared/types";
import { SCREEN_TYPE_CONFIG } from "@shared/types";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useMemo, useCallback } from "react";
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
  adoptionCats?: Screen[]; // For ADOPTION_SHOWCASE (legacy)
  catDbCats?: Cat[]; // Cats from the cats table
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

// SNAP_AND_PURR - Photo sharing prompt (Lounge-inspired design)
function SnapAndPurrScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
      {/* Mint green floor reflection at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3" 
           style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.15) 0%, transparent 100%)' }} />
      
      {/* Warm amber light glow from top (like wicker pendant lights) */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      
      {/* Playful cat silhouettes inspired by mural */}
      <div className="absolute inset-0 opacity-[0.08]">
        {/* Orange cat silhouette */}
        <svg className="absolute top-16 left-16 w-40 h-40" viewBox="0 0 100 100" fill="#E8913A">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
          <circle cx="42" cy="28" r="4" fill="#1a1a1a" />
          <circle cx="58" cy="28" r="4" fill="#1a1a1a" />
        </svg>
        {/* Gray cat silhouette */}
        <svg className="absolute bottom-24 right-20 w-32 h-32" viewBox="0 0 100 100" fill="#7a7a7a">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
        {/* Cream cat silhouette */}
        <svg className="absolute top-1/3 right-12 w-28 h-28" viewBox="0 0 100 100" fill="#F5E6D3">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl"
        >
          {/* Camera icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E8913A 0%, #D4782A 100%)' }}
          >
            <span className="text-4xl">📸</span>
          </motion.div>
          
          <h1 className="text-6xl font-bold tracking-wide mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            <span style={{ color: '#E8913A' }}>{screen.title || "Snap"}</span>
            <span className="text-white/90"> & </span>
            <span style={{ color: '#86C5A9' }}>Purr!</span>
          </h1>
          
          {screen.subtitle && (
            <p className="text-2xl text-white/70 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="text-xl text-white/50 mb-8">
              {screen.body}
            </p>
          )}
          {screen.qrUrl && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block rounded-3xl p-6 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #F5E6D3 0%, #EDE0D4 100%)' }}
            >
              <QRCodeSVG value={screen.qrUrl} size={200} level="M" fgColor="#2d2d2d" />
              <p className="mt-3 text-sm font-medium" style={{ color: '#5a5a5a' }}>{screen.qrLabel || 'Scan to share your photos!'}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// EVENT - Special events (Lounge-inspired design)
function EventScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #F5E6D3 0%, #EDE0D4 40%, #E8DDD0 100%)' }}>
      {/* Industrial ceiling effect at top */}
      <div className="absolute top-0 left-0 right-0 h-16" 
           style={{ background: 'linear-gradient(to bottom, #2d2d2d 0%, transparent 100%)' }} />
      
      {/* Mint green accent strip */}
      <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: '#86C5A9' }} />
      
      {/* Warm light glows */}
      <div className="absolute top-8 left-1/3 w-48 h-48 rounded-full opacity-40"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.3) 0%, transparent 70%)' }} />
      <div className="absolute top-8 right-1/3 w-48 h-48 rounded-full opacity-40"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.3) 0%, transparent 70%)' }} />
      
      {/* Decorative cat silhouettes */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="absolute bottom-20 left-10 w-24 h-24" viewBox="0 0 100 100" fill="#2d2d2d">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
        <svg className="absolute top-32 right-16 w-20 h-20" viewBox="0 0 100 100" fill="#E8913A">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center px-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-row items-center justify-center w-full max-w-7xl gap-16"
        >
          {/* Event image - polaroid style with cream background */}
          {screen.imagePath && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 80 }}
              className="flex-shrink-0"
            >
              <div className="p-4 pb-16 shadow-2xl rounded-lg relative" style={{ background: '#FFFEF9', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.25)' }}>
                <div className="relative w-[380px] h-[380px] overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={screen.imagePath}
                    alt={screen.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.1)' }} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-2xl font-medium" style={{ fontFamily: 'Georgia, serif', color: '#3d3d3d' }}>
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
              className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full border-2"
              style={{ background: 'rgba(232, 145, 58, 0.1)', borderColor: '#E8913A' }}
            >
              <span className="text-3xl">🎉</span>
              <span className="text-2xl font-medium tracking-wide" style={{ color: '#D4782A' }}>Event</span>
            </motion.div>
            {!screen.imagePath && (
              <h1 className="text-6xl font-bold tracking-wide mb-6" style={{ fontFamily: 'Georgia, serif', color: '#2d2d2d' }}>
                {screen.title}
              </h1>
            )}
            {screen.imagePath && (
              <h1 className="text-5xl font-bold tracking-wide mb-6" style={{ fontFamily: 'Georgia, serif', color: '#2d2d2d' }}>
                {screen.title}
              </h1>
            )}
            {screen.subtitle && (
              <p className="text-3xl mb-4" style={{ color: '#5a5a5a' }}>
                {screen.subtitle}
              </p>
            )}
            {screen.body && (
              <p className="text-2xl leading-relaxed" style={{ color: '#6a6a6a' }}>
                {screen.body}
              </p>
            )}
            {screen.qrUrl && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 inline-block rounded-2xl p-5 shadow-xl"
                style={{ background: '#FFFEF9' }}
              >
                <div className="text-center mb-2">
                  <p className="text-lg font-semibold" style={{ color: '#3d3d3d' }}>{screen.qrLabel || 'Scan to Book'}</p>
                </div>
                <QRCodeSVG value={screen.qrUrl} size={150} level="M" fgColor="#2d2d2d" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// TODAY_AT_CATFE - Daily specials/activities (Lounge-inspired design)
function TodayAtCatfeScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: '#86C5A9' }}>
      {/* Cream colored content area */}
      <div className="absolute inset-8 rounded-3xl shadow-2xl" style={{ background: 'linear-gradient(160deg, #F5E6D3 0%, #EDE0D4 100%)' }}>
        {/* Industrial accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-3 rounded-t-3xl" style={{ background: '#2d2d2d' }} />
        
        {/* Warm light glows */}
        <div className="absolute top-12 left-1/4 w-40 h-40 rounded-full opacity-50"
             style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.25) 0%, transparent 70%)' }} />
        <div className="absolute top-12 right-1/4 w-40 h-40 rounded-full opacity-50"
             style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.25) 0%, transparent 70%)' }} />
        
        {/* Decorative cat silhouettes */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="absolute bottom-16 left-12 w-32 h-32" viewBox="0 0 100 100" fill="#E8913A">
            <ellipse cx="50" cy="60" rx="35" ry="30" />
            <circle cx="50" cy="30" r="22" />
            <polygon points="30,15 35,35 25,30" />
            <polygon points="70,15 65,35 75,30" />
          </svg>
          <svg className="absolute top-24 right-16 w-28 h-28" viewBox="0 0 100 100" fill="#7a7a7a">
            <ellipse cx="50" cy="60" rx="35" ry="30" />
            <circle cx="50" cy="30" r="22" />
            <polygon points="30,15 35,35 25,30" />
            <polygon points="70,15 65,35 75,30" />
          </svg>
        </div>
        
        {/* Main content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-5xl px-8"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-3 px-8 py-4 mb-8 rounded-full border-2"
              style={{ background: 'rgba(232, 145, 58, 0.1)', borderColor: '#E8913A' }}
            >
              <span className="text-4xl">☕</span>
              <span className="text-3xl font-medium tracking-wide" style={{ color: '#D4782A' }}>Today at {settings?.locationName || "Catfé"}</span>
            </motion.div>
            <h1 className="text-7xl font-bold tracking-wide mb-8" style={{ fontFamily: 'Georgia, serif', color: '#2d2d2d' }}>
              {screen.title}
            </h1>
            {screen.subtitle && (
              <p className="text-4xl mb-6" style={{ color: '#5a5a5a' }}>
                {screen.subtitle}
              </p>
            )}
            {screen.body && (
              <p className="text-3xl mb-8 leading-relaxed" style={{ color: '#6a6a6a' }}>
                {screen.body}
              </p>
            )}
            {screen.qrUrl && (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-block rounded-2xl p-5 shadow-xl"
                style={{ background: '#FFFEF9' }}
              >
                {screen.qrLabel && (
                  <p className="text-center mb-2 text-base font-semibold" style={{ color: '#3d3d3d' }}>{screen.qrLabel}</p>
                )}
                <QRCodeSVG value={screen.qrUrl} size={160} level="M" fgColor="#2d2d2d" />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// MEMBERSHIP - Membership promotion (Lounge-inspired design)
function MembershipScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
      {/* Mint green accent glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2" 
           style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.2) 0%, transparent 100%)' }} />
      
      {/* Warm amber light glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      
      {/* Decorative cat silhouettes */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg className="absolute bottom-20 left-16 w-36 h-36" viewBox="0 0 100 100" fill="#86C5A9">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
        <svg className="absolute top-24 right-20 w-28 h-28" viewBox="0 0 100 100" fill="#E8913A">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
      </div>
      
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
              className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full border-2"
              style={{ background: 'rgba(134, 197, 169, 0.15)', borderColor: '#86C5A9' }}
            >
              <span className="text-3xl">⭐</span>
              <span className="text-2xl font-medium tracking-wide" style={{ color: '#86C5A9' }}>Membership</span>
            </motion.div>
            <h1 className="text-6xl font-bold tracking-wide mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              <span style={{ color: '#86C5A9' }}>{screen.title}</span>
            </h1>
            {screen.subtitle && (
              <p className="text-3xl mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {screen.subtitle}
              </p>
            )}
            {screen.body && (
              <p className="text-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {screen.body}
              </p>
            )}
          </div>
          {screen.qrUrl && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 rounded-2xl p-5 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #F5E6D3 0%, #EDE0D4 100%)' }}
            >
              <QRCodeSVG value={screen.qrUrl} size={200} level="M" fgColor="#2d2d2d" />
              <p className="mt-3 text-center text-sm font-medium" style={{ color: '#5a5a5a' }}>{screen.qrLabel || 'Scan to join'}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// REMINDER - General reminders (Lounge-inspired design)
function ReminderScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #F5E6D3 0%, #EDE0D4 40%, #E8DDD0 100%)' }}>
      {/* Industrial ceiling effect */}
      <div className="absolute top-0 left-0 right-0 h-20" 
           style={{ background: 'linear-gradient(to bottom, #2d2d2d 0%, transparent 100%)' }} />
      
      {/* Mint green accent at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: '#86C5A9' }} />
      
      {/* Warm light glows */}
      <div className="absolute top-12 left-1/3 w-48 h-48 rounded-full opacity-40"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.3) 0%, transparent 70%)' }} />
      <div className="absolute top-12 right-1/3 w-48 h-48 rounded-full opacity-40"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.3) 0%, transparent 70%)' }} />
      
      {/* Decorative cat silhouettes */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="absolute bottom-16 right-12 w-32 h-32" viewBox="0 0 100 100" fill="#E8913A">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
        <svg className="absolute top-32 left-16 w-24 h-24" viewBox="0 0 100 100" fill="#7a7a7a">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl px-8"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full border-2"
            style={{ background: 'rgba(232, 145, 58, 0.1)', borderColor: '#E8913A' }}
          >
            <span className="text-3xl">📌</span>
            <span className="text-2xl font-medium tracking-wide" style={{ color: '#D4782A' }}>Reminder</span>
          </motion.div>
          <h1 className="text-7xl font-bold tracking-wide mb-8" style={{ fontFamily: 'Georgia, serif', color: '#2d2d2d' }}>
            {screen.title}
          </h1>
          {screen.subtitle && (
            <p className="text-4xl mb-6" style={{ color: '#5a5a5a' }}>
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="text-3xl leading-relaxed" style={{ color: '#6a6a6a' }}>
              {screen.body}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ADOPTION - Cat adoption promotion (Lounge-inspired design)
function AdoptionScreen({ screen, settings }: ScreenRendererProps) {
  const isAdopted = (screen as any).isAdopted;
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
      {/* Mint green floor reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3" 
           style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.2) 0%, transparent 100%)' }} />
      
      {/* Warm amber light glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      
      {/* Decorative cat silhouettes */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg className="absolute bottom-24 left-12 w-32 h-32" viewBox="0 0 100 100" fill="#E8913A">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
        <svg className="absolute top-24 right-16 w-28 h-28" viewBox="0 0 100 100" fill="#86C5A9">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
      </div>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-0 right-0 text-center z-10"
      >
        <h1 className="text-7xl font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
          <span className="text-white/90">Meet </span>
          <span style={{ color: '#E8913A' }}>{screen.title}</span>
        </h1>
      </motion.div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center px-16 pt-20">
        <div className="flex flex-row items-center justify-center w-full max-w-7xl gap-12">
          {/* Polaroid-style cat photo with cream background */}
          {screen.imagePath && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 80 }}
              className="flex-shrink-0"
            >
              <div className="p-4 pb-20 shadow-2xl rounded-lg relative" style={{ background: '#FFFEF9', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)' }}>
                <div className="relative w-[420px] h-[420px] overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={screen.imagePath}
                    alt={screen.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.1)' }} />
                  {isAdopted && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 5 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute top-4 right-4 px-5 py-2 rounded-full text-white text-xl font-bold shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #86C5A9 0%, #6BA58D 100%)' }}
                    >
                      🎉 Adopted!
                    </motion.div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-3xl font-medium" style={{ fontFamily: 'Georgia, serif', color: '#3d3d3d' }}>
                    Meet {screen.title}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Info section */}
          <div className="flex-1 max-w-xl space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2`}
              style={{ 
                background: isAdopted ? 'rgba(134, 197, 169, 0.15)' : 'rgba(232, 145, 58, 0.15)', 
                borderColor: isAdopted ? '#86C5A9' : '#E8913A' 
              }}
            >
              <span className="text-3xl">{isAdopted ? '🎉' : '🐱'}</span>
              <span className="text-2xl font-medium tracking-wide" style={{ color: isAdopted ? '#86C5A9' : '#E8913A' }}>
                {isAdopted ? 'Found a Forever Home!' : 'Looking for Love'}
              </span>
            </motion.div>
            
            {screen.subtitle && (
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                {screen.subtitle}
              </motion.p>
            )}
            
            {screen.body && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {screen.body.split(' · ').map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-full text-xl font-medium" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}>
                    {tag.trim()}
                  </span>
                ))}
              </motion.div>
            )}
            
            {!isAdopted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl p-5 border"
                style={{ background: 'rgba(245, 230, 211, 0.1)', borderColor: 'rgba(245, 230, 211, 0.2)' }}
              >
                <p className="text-lg italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.7)' }}>
                  "Scan the QR to Adopt Me :)"
                </p>
              </motion.div>
            )}
            
            {screen.qrUrl && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-block rounded-2xl p-5 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #F5E6D3 0%, #EDE0D4 100%)' }}
              >
                <div className="text-center mb-3">
                  <p className="text-base font-semibold" style={{ color: '#3d3d3d' }}>{screen.qrLabel || 'Scan to Adopt Me'}</p>
                </div>
                <QRCodeSVG value={screen.qrUrl} size={150} level="M" fgColor="#2d2d2d" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ADOPTION_SHOWCASE - Grid of 4 random adoptable cats (Lounge-inspired design)
// Now pulls from the cats database table when available, falls back to legacy Screen objects
function AdoptionShowcaseScreen({ screen, settings, adoptionCats, catDbCats }: ScreenRendererProps) {
  const legacyCats = adoptionCats || [];
  const { data: dbCats } = trpc.cats.getAvailable.useQuery(undefined, { staleTime: 30000 });
  const { data: adoptionCountData } = trpc.cats.getCounts.useQuery(undefined, { staleTime: 30000 });
  const adoptedCount = adoptionCountData?.adopted || 0;
  
  // Prefer cats from the database, fall back to legacy Screen objects
  const availableCats = catDbCats || dbCats || [];
  const useDbCats = availableCats.length > 0;
  
  // Pick 4 random cats from the database
  const [displayDbCats, setDisplayDbCats] = useState<Cat[]>([]);
  useEffect(() => {
    if (availableCats.length > 0) {
      const shuffled = [...availableCats].sort(() => Math.random() - 0.5);
      setDisplayDbCats(shuffled.slice(0, 4));
    }
  }, [availableCats.length]);
  
  // Shuffle every 6 seconds
  useEffect(() => {
    if (availableCats.length <= 4) return;
    const interval = setInterval(() => {
      const shuffled = [...availableCats].sort(() => Math.random() - 0.5);
      setDisplayDbCats(shuffled.slice(0, 4));
    }, 6000);
    return () => clearInterval(interval);
  }, [availableCats.length]);
  
  const displayCats = useDbCats ? [] : legacyCats; // Only used for legacy fallback
  
  // Polaroid rotation angles for visual interest
  const rotations = [-2, 3, -3, 2];
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
      {/* Mint green floor reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3" 
           style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.2) 0%, transparent 100%)' }} />
      
      {/* Warm amber light glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      
      {/* Decorative cat silhouettes */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="absolute bottom-20 left-8 w-28 h-28" viewBox="0 0 100 100" fill="#E8913A">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
        <svg className="absolute top-20 right-12 w-24 h-24" viewBox="0 0 100 100" fill="#86C5A9">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
      </div>
      
      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <h1 className="text-7xl font-bold tracking-wide mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            <span style={{ color: '#E8913A' }}>Meet</span> <span className="text-white/90">Our</span> <span style={{ color: '#86C5A9' }}>Cats</span>
          </h1>
          <p className="text-2xl tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Find Your Purrfect Match</p>
          {/* Adoption success counter */}
          {adoptedCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-3 px-6 py-3 rounded-full border-2" style={{ background: 'rgba(134, 197, 169, 0.15)', borderColor: '#86C5A9' }}>
              <span className="text-3xl">🎉</span>
              <span className="text-xl font-medium" style={{ color: '#86C5A9' }}>
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
            key={useDbCats ? displayDbCats.map(c => c.id).join('-') : displayCats.map(c => c.id).join('-')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-row gap-5 justify-center items-center w-full"
          >
            {/* Database cats (new system) */}
            {useDbCats && displayDbCats.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8, rotate: rotations[idx] - 10 }}
                animate={{ opacity: 1, scale: 1, rotate: rotations[idx] }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
                style={{ transform: `rotate(${rotations[idx]}deg)` }}
              >
                <div className="p-3 pb-16 shadow-2xl rounded-lg relative" style={{ background: '#FFFEF9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {cat.photoUrl ? (
                      <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                        <span className="text-7xl">🐱</span>
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.15)' }} />
                    {cat.status === 'adopted_in_lounge' && (
                      <div className="absolute top-3 right-3 px-4 py-2 rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #86C5A9, #5fa88a)' }}>
                        <span className="text-white text-sm font-bold tracking-wide">
                          🎉 Adopted{cat.adoptedDate ? ` ${new Date(cat.adoptedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}!
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <p className="text-gray-800 text-2xl font-semibold truncate" style={{ fontFamily: 'Georgia, serif' }}>
                      {cat.status === 'adopted_in_lounge' ? cat.name : `Meet ${cat.name}`}
                    </p>
                    <p className="text-gray-600 text-lg truncate">
                      {cat.status === 'adopted_in_lounge' ? 'Found their forever home!' : `${cat.breed}${cat.colorPattern ? ` \u00b7 ${cat.colorPattern}` : ''}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Legacy Screen cats (fallback) */}
            {!useDbCats && displayCats.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8, rotate: rotations[idx] - 10 }}
                animate={{ opacity: 1, scale: 1, rotate: rotations[idx] }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
                style={{ transform: `rotate(${rotations[idx]}deg)` }}
              >
                <div className="p-3 pb-16 shadow-2xl rounded-lg relative" style={{ background: '#FFFEF9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {cat.imagePath ? (
                      <img src={cat.imagePath} alt={cat.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                        <span className="text-7xl">🐱</span>
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.15)' }} />
                    {(cat as any).isAdopted && (
                      <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg">
                        🎉 Adopted!
                      </div>
                    )}
                  </div>
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
            {(useDbCats ? displayDbCats.length : displayCats.length) < 4 && Array.from({ length: 4 - (useDbCats ? displayDbCats.length : displayCats.length) }).map((_, idx) => (
              <motion.div
                key={`empty-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                style={{ transform: `rotate(${rotations[(useDbCats ? displayDbCats.length : displayCats.length) + idx] || 0}deg)` }}
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
          <span className="text-white/80 text-sm">
            {useDbCats 
              ? `${availableCats.filter(c => c.status === 'available').length} looking for homes${availableCats.filter(c => c.status === 'adopted_in_lounge').length > 0 ? ` \u00b7 ${availableCats.filter(c => c.status === 'adopted_in_lounge').length} recently adopted!` : ''}`
              : `${displayCats.length} cats looking for homes`
            }
          </span>
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

// ADOPTION_COUNTER - Hybrid split layout: counter on left, photo mosaic + carousel on right
// Milestone detection helper
function getMilestoneInfo(count: number): { isMilestone: boolean; label: string; tier: 'bronze' | 'silver' | 'gold' | 'diamond' } {
  if (count > 0 && count % 100 === 0) return { isMilestone: true, label: `${count} Forever Homes!`, tier: 'diamond' };
  if (count > 0 && count % 50 === 0) return { isMilestone: true, label: `${count} Milestone!`, tier: 'gold' };
  if (count > 0 && count % 25 === 0) return { isMilestone: true, label: `${count} and Counting!`, tier: 'silver' };
  if (count > 0 && count % 10 === 0) return { isMilestone: true, label: `${count} Cats Loved!`, tier: 'bronze' };
  return { isMilestone: false, label: '', tier: 'bronze' };
}

// Confetti particle component
function ConfettiParticle({ index, tier }: { index: number; tier: string }) {
  const colors: Record<string, string[]> = {
    diamond: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#7B68EE', '#FFD700'],
    gold: ['#FFD700', '#DAA520', '#FFA500', '#E8913A', '#F5DEB3', '#FFD700'],
    silver: ['#C0C0C0', '#86C5A9', '#DAA520', '#E8913A', '#B8D4C8', '#C0C0C0'],
    bronze: ['#E8913A', '#DAA520', '#86C5A9', '#F5E6D3', '#CD853F', '#E8913A'],
  };
  const palette = colors[tier] || colors.gold;
  const color = palette[index % palette.length];
  const size = 6 + Math.random() * 10;
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 3 + Math.random() * 3;
  const rotation = Math.random() * 720 - 360;
  const shapes = ['rounded-none', 'rounded-full', 'rounded-sm'];
  const shape = shapes[index % shapes.length];

  return (
    <motion.div
      className={`absolute ${shape}`}
      style={{
        width: size,
        height: size * (shape === 'rounded-none' ? 0.6 : 1),
        backgroundColor: color,
        left: `${left}%`,
        top: '-5%',
      }}
      initial={{ y: 0, opacity: 1, rotate: 0, scale: 0 }}
      animate={{
        y: ['0vh', '110vh'],
        opacity: [0, 1, 1, 0.8, 0],
        rotate: [0, rotation],
        scale: [0, 1, 1, 0.8],
        x: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
        ease: 'easeIn',
      }}
    />
  );
}

function AdoptionCounterScreen({ screen, settings }: ScreenRendererProps) {
  const { data: settingsData } = trpc.settings.get.useQuery();
  const { data: recentlyAdopted } = trpc.cats.getRecentlyAdopted.useQuery({ days: 90 });
  const { data: availableCats } = trpc.cats.getAvailable.useQuery();
  const { data: autoCount } = trpc.screens.getAdoptionCount.useQuery(undefined, { staleTime: 30000 });
  // Use automatic DB count; settings.totalAdoptionCount can serve as an offset for pre-database adoptions
  const dbCount = autoCount?.count || 0;
  const manualOffset = settingsData?.totalAdoptionCount || 0;
  const totalCount = dbCount + manualOffset;

  // Milestone detection
  const milestone = useMemo(() => getMilestoneInfo(totalCount), [totalCount]);

  // Cats with photos for the mosaic background
  const allCatsWithPhotos = useMemo(() => {
    const adopted = (recentlyAdopted || []).filter((c: Cat) => c.photoUrl);
    const available = (availableCats || []).filter((c: Cat) => c.photoUrl);
    return [...adopted, ...available];
  }, [recentlyAdopted, availableCats]);

  // Recently adopted cats for the carousel
  const adoptedCats = useMemo(() => {
    return (recentlyAdopted || []).filter((c: Cat) => c.photoUrl);
  }, [recentlyAdopted]);

  // Rotating carousel index
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  useEffect(() => {
    if (adoptedCats.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCatIndex(prev => (prev + 1) % adoptedCats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [adoptedCats.length]);

  // Animate counter up
  const [displayCount, setDisplayCount] = useState(0);
  const [countUpDone, setCountUpDone] = useState(false);
  useEffect(() => {
    if (totalCount === 0) return;
    setCountUpDone(false);
    const duration = 2000;
    const steps = 60;
    const increment = totalCount / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalCount) {
        setDisplayCount(totalCount);
        setCountUpDone(true);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [totalCount]);

  const formatAdoptionDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Milestone tier colors
  const tierGlow: Record<string, string> = {
    diamond: 'rgba(0, 206, 209, 0.4)',
    gold: 'rgba(255, 215, 0, 0.4)',
    silver: 'rgba(192, 192, 192, 0.3)',
    bronze: 'rgba(232, 145, 58, 0.3)',
  };

  const currentCat = adoptedCats[currentCatIndex];

  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: '#2d2d2d' }}>
      {/* Confetti layer — covers full screen when milestone */}
      {milestone.isMilestone && countUpDone && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} tier={milestone.tier} />
          ))}
        </div>
      )}

      {/* Split layout */}
      <div className="absolute inset-0 flex">
        {/* LEFT SIDE — Counter & branding (cream warm tones) */}
        <div className="w-1/2 relative flex flex-col items-center justify-center"
             style={{ background: 'linear-gradient(160deg, #F5E6D3 0%, #EDE0D4 50%, #E8DDD0 100%)' }}>
          
          {/* Warm light glow — enhanced at milestones */}
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full transition-opacity duration-1000"
               style={{
                 opacity: milestone.isMilestone && countUpDone ? 0.7 : 0.4,
                 background: `radial-gradient(circle, ${milestone.isMilestone ? tierGlow[milestone.tier] : 'rgba(218, 165, 32, 0.3)'} 0%, transparent 70%)`,
               }} />
          
          {/* Extra milestone glow pulse */}
          {milestone.isMilestone && countUpDone && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: `radial-gradient(circle at center, ${tierGlow[milestone.tier]} 0%, transparent 60%)` }}
            />
          )}
          
          {/* Mint accent bar at top — gold shimmer at milestones */}
          <div className="absolute top-0 left-0 right-0 h-2 transition-colors duration-1000"
               style={{ background: milestone.isMilestone && countUpDone ? '#DAA520' : '#86C5A9' }} />
          
          {/* Decorative cat silhouette */}
          <div className="absolute bottom-8 left-8 opacity-[0.06]">
            <svg className="w-32 h-32" viewBox="0 0 100 100" fill="#2d2d2d">
              <ellipse cx="50" cy="60" rx="35" ry="30" />
              <circle cx="50" cy="30" r="22" />
              <polygon points="30,15 35,35 25,30" />
              <polygon points="70,15 65,35 75,30" />
            </svg>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-8"
          >
            {/* Milestone badge — appears above the label when at a milestone */}
            {milestone.isMilestone && countUpDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, delay: 0.5 }}
                className="mb-4"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full shadow-lg"
                     style={{
                       background: milestone.tier === 'diamond'
                         ? 'linear-gradient(135deg, #00CED1, #7B68EE, #FFD700)'
                         : milestone.tier === 'gold'
                         ? 'linear-gradient(135deg, #FFD700, #FFA500, #DAA520)'
                         : milestone.tier === 'silver'
                         ? 'linear-gradient(135deg, #C0C0C0, #86C5A9, #DAA520)'
                         : 'linear-gradient(135deg, #E8913A, #DAA520, #86C5A9)',
                     }}>
                  <span className="text-lg">🎉</span>
                  <span className="text-white font-bold text-sm tracking-wider uppercase"
                        style={{ fontFamily: 'Georgia, serif', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                    {milestone.label}
                  </span>
                  <span className="text-lg">🎉</span>
                </div>
              </motion.div>
            )}

            {/* Top label */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12" style={{ background: '#DAA520' }} />
              <span className="text-sm tracking-[0.3em] uppercase" style={{ color: '#86C5A9', fontFamily: 'Georgia, serif' }}>
                Forever Homes
              </span>
              <div className="h-px w-12" style={{ background: '#DAA520' }} />
            </div>

            {/* Big number — with shimmer at milestones */}
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: milestone.isMilestone && countUpDone ? [1, 1.05, 1] : 1,
                opacity: 1,
              }}
              transition={milestone.isMilestone && countUpDone
                ? { scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.5 } }
                : { type: 'spring', stiffness: 80, delay: 0.3 }
              }
              className="text-[8rem] font-black leading-[0.9] block relative"
              style={{
                fontFamily: 'Georgia, serif',
                background: milestone.isMilestone && countUpDone
                  ? 'linear-gradient(135deg, #FFD700 0%, #E8913A 30%, #FFD700 50%, #DAA520 70%, #FFD700 100%)'
                  : 'linear-gradient(180deg, #E8913A 0%, #DAA520 50%, #86C5A9 100%)',
                backgroundSize: milestone.isMilestone && countUpDone ? '200% 200%' : '100% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: milestone.isMilestone && countUpDone
                  ? 'drop-shadow(0 4px 20px rgba(255, 215, 0, 0.4))'
                  : 'drop-shadow(0 4px 15px rgba(218, 165, 32, 0.2))',
              }}
            >
              {displayCount}
            </motion.span>

            <h2 className="text-2xl tracking-wider mt-3" style={{ fontFamily: 'Georgia, serif', color: '#2d2d2d' }}>
              Cats Adopted
            </h2>

            <p className="text-sm mt-2" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
              {milestone.isMilestone ? 'Thank you for making this possible!' : 'Every visit helps us find forever homes'}
            </p>
          </motion.div>
        </div>

        {/* RIGHT SIDE — Photo mosaic background + carousel */}
        <div className="w-1/2 relative flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
          
          {/* Photo mosaic background */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-0.5 opacity-20">
            {Array.from({ length: 12 }).map((_, i) => {
              const cat = allCatsWithPhotos[i % Math.max(allCatsWithPhotos.length, 1)];
              return (
                <motion.div
                  key={i}
                  className="relative overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  {cat?.photoUrl ? (
                    <img
                      src={cat.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #3a3a3a, #2a2a2a)' }} />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Dark overlay to make carousel pop */}
          <div className="absolute inset-0" style={{ 
            background: 'radial-gradient(ellipse at center, rgba(30,30,30,0.5) 0%, rgba(26,26,26,0.8) 70%)' 
          }} />

          {/* Amber glow */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.5) 0%, transparent 70%)' }} />
          
          {/* Mint floor reflection */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4"
               style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.1) 0%, transparent 100%)' }} />

          {/* "Recently Adopted" label */}
          <div className="absolute top-8 left-0 right-0 text-center z-10">
            <span className="text-sm tracking-[0.3em] uppercase" style={{ color: 'rgba(134, 197, 169, 0.6)' }}>
              Recently Adopted
            </span>
          </div>

          {/* Cat card carousel */}
          <AnimatePresence mode="wait">
            {currentCat ? (
              <motion.div
                key={currentCat.id}
                initial={{ opacity: 0, x: 60, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -60, rotateY: 10 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="relative w-72 z-10"
              >
                {/* Polaroid-style card */}
                <div className="rounded-xl overflow-hidden shadow-2xl"
                     style={{ background: '#F5E6D3' }}>
                  {/* Photo */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={currentCat.photoUrl!}
                      alt={currentCat.name}
                      className="w-full h-full object-cover"
                    />
                    {/* "Adopted!" ribbon */}
                    <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full shadow-lg"
                         style={{ background: 'linear-gradient(135deg, #86C5A9, #6BAF92)' }}>
                      <span className="text-white font-bold text-sm tracking-wide">Adopted!</span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-5 text-center">
                    <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: '#2d2d2d' }}>
                      {currentCat.name}
                    </h3>
                    {currentCat.adoptedDate && (
                      <p className="text-sm" style={{ color: '#E8913A' }}>
                        Adopted {formatAdoptionDate(currentCat.adoptedDate)}
                      </p>
                    )}
                    {currentCat.breed && (
                      <p className="text-xs mt-1" style={{ color: 'rgba(45,45,45,0.5)' }}>
                        {currentCat.breed}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center px-8 z-10"
              >
                <div className="text-6xl mb-4">🐱</div>
                <p className="text-xl" style={{ color: 'rgba(245, 230, 211, 0.5)', fontFamily: 'Georgia, serif' }}>
                  More happy tails coming soon
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dot indicators */}
          {adoptedCats.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
              {adoptedCats.slice(0, 8).map((_: Cat, i: number) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i === currentCatIndex % Math.min(adoptedCats.length, 8) ? '#DAA520' : 'rgba(245, 230, 211, 0.2)',
                    transform: i === currentCatIndex % Math.min(adoptedCats.length, 8) ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
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
  const [currentIndex, setCurrentIndex] = useState(() => 
    photos && photos.length > 0 ? Math.floor(Math.random() * photos.length) : 0
  );
  
  // Set random start index when photos first load
  useEffect(() => {
    if (photos && photos.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * photos.length));
    }
  }, [photos?.length]);
  
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
      <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
        {/* Mint green floor reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3" 
             style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.2) 0%, transparent 100%)' }} />
        {/* Warm amber light glows */}
        <div className="absolute top-0 left-1/3 w-48 h-48 rounded-full opacity-30"
             style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-1/3 w-48 h-48 rounded-full opacity-30"
             style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">📸</div>
            <h1 className="text-5xl font-bold tracking-wide mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              <span style={{ color: '#E8913A' }}>Snap</span> <span className="text-white/90">&</span> <span style={{ color: '#86C5A9' }}>Purr</span>
            </h1>
            <p className="text-xl" style={{ color: 'rgba(255,255,255,0.6)' }}>Scan the QR code to share your photos!</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Polaroid rotation angles for visual interest
  const rotations = [-3, 2, -2];
  
  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
      {/* Mint green floor reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3" 
           style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.2) 0%, transparent 100%)' }} />
      
      {/* Warm amber light glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)' }} />
      
      {/* Decorative cat silhouettes */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="absolute bottom-20 left-8 w-24 h-24" viewBox="0 0 100 100" fill="#E8913A">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
        <svg className="absolute top-20 right-12 w-20 h-20" viewBox="0 0 100 100" fill="#86C5A9">
          <ellipse cx="50" cy="60" rx="35" ry="30" />
          <circle cx="50" cy="30" r="22" />
          <polygon points="30,15 35,35 25,30" />
          <polygon points="70,15 65,35 75,30" />
        </svg>
      </div>
      
      {/* Header */}
      <div className="absolute top-8 left-0 right-0 z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <h1 className="text-5xl font-bold tracking-wide mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            <span style={{ color: '#E8913A' }}>Snap</span> <span className="text-white/90">&</span> <span style={{ color: '#86C5A9' }}>Purr</span>
          </h1>
          <p className="text-lg tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Guest Gallery</p>
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
                {/* Polaroid frame with cream background */}
                <div className="p-3 pb-16 shadow-2xl rounded-lg" style={{ background: '#FFFEF9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
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
        <div className="text-center mb-6">
          <h1 className="text-5xl font-light tracking-wider text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome to <span className="text-cyan-400">{locationName}</span>!
          </h1>
          <p className="text-xl text-white/60">
            {screen.subtitle || "Please complete these steps before your visit"}
          </p>
        </div>
        
        {/* Main content - 3 columns */}
        <div className="flex-1 grid grid-cols-3 gap-6">
          {/* Column 1: Waiver */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10 flex flex-col items-center">
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
          </div>
          
          {/* Column 2: WiFi */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10 flex flex-col items-center">
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
          </div>
          
          {/* Column 3: House Rules */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10 flex flex-col">
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
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-lg text-white/50">
            🐱 Thank you for visiting! Enjoy your time with our furry friends! 🐱
          </p>
        </div>
      </div>
    </div>
  );
}

// Guest Status Board - shows all currently checked-in guests with remaining time
// Also shows general session window timers for online reservation guests
function GuestStatusBoardScreen({ screen, settings }: ScreenRendererProps) {
  const { data: activeSessions } = trpc.guestSessions.getActive.useQuery(undefined, {
    refetchInterval: 10000, // Refresh every 10 seconds (reduced from 5s to avoid excess re-renders)
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const locationName = settings?.locationName || "Catf\u00e9";

  // Update current time every second for live countdowns
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const sessions = (activeSessions || []) as Array<{
    id: number;
    guestName: string;
    guestCount: number;
    duration: "15" | "30" | "60";
    status: string;
    checkInAt: Date;
    expiresAt: Date;
  }>;

  // Sort by expiry time (soonest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const aExp = new Date(a.expiresAt).getTime();
    const bExp = new Date(b.expiresAt).getTime();
    return aExp - bExp;
  });

  const getSessionLabel = (duration: string) => {
    switch (duration) {
      case "60": return "Full Purr";
      case "30": return "Mini Meow";
      case "15": return "Quick Peek";
      default: return `${duration} min`;
    }
  };

  const getSessionIcon = (duration: string) => {
    switch (duration) {
      case "60": return "\uD83D\uDC31";
      case "30": return "\uD83D\uDE3A";
      case "15": return "\uD83D\uDC3E";
      default: return "\uD83D\uDC08";
    }
  };

  const getSessionColor = (duration: string) => {
    switch (duration) {
      case "60": return { bg: "from-teal-500/30 to-teal-600/20", border: "border-teal-400/40", text: "text-teal-300", badge: "bg-teal-500/30 text-teal-200" };
      case "30": return { bg: "from-amber-500/30 to-amber-600/20", border: "border-amber-400/40", text: "text-amber-300", badge: "bg-amber-500/30 text-amber-200" };
      case "15": return { bg: "from-purple-500/30 to-purple-600/20", border: "border-purple-400/40", text: "text-purple-300", badge: "bg-purple-500/30 text-purple-200" };
      default: return { bg: "from-gray-500/30 to-gray-600/20", border: "border-gray-400/40", text: "text-gray-300", badge: "bg-gray-500/30 text-gray-200" };
    }
  };

  const getTimeStatus = (expiresAt: Date) => {
    const msLeft = new Date(expiresAt).getTime() - currentTime.getTime();
    if (msLeft <= 0) return { label: "Ended", minutes: 0, seconds: 0, isExpired: true, isUrgent: true, percent: 0 };
    const totalSeconds = Math.floor(msLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const isUrgent = minutes < 5;
    return { label: `${minutes}:${seconds.toString().padStart(2, "0")}`, minutes, seconds, isExpired: false, isUrgent, percent: Math.min(100, (msLeft / (60 * 60 * 1000)) * 100) };
  };

  // Calculate general session window timers
  // Sessions start on the hour: Full Purr (60 min) ends at :00, Mini Meow (30 min) ends at :30
  const getSessionWindows = () => {
    const now = currentTime;
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const windows: Array<{ type: string; icon: string; label: string; endsAt: string; minutesLeft: number; secondsLeft: number; color: string; bgColor: string }> = [];

    // Full Purr (60 min) - ends at the top of the next hour
    const fullPurrMinutesLeft = 59 - currentMinute;
    const fullPurrSecondsLeft = 59 - currentSecond;
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    const fullPurrEnds = nextHour.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    windows.push({
      type: "Full Purr",
      icon: "\uD83D\uDC31",
      label: "60 min session",
      endsAt: fullPurrEnds,
      minutesLeft: fullPurrMinutesLeft,
      secondsLeft: fullPurrSecondsLeft,
      color: "text-teal-300",
      bgColor: "from-teal-500/20 to-teal-600/10 border-teal-400/30",
    });

    // Mini Meow (30 min) - ends at :30 or :00
    let miniMeowMinutesLeft: number;
    let miniMeowSecondsLeft: number;
    let miniMeowEndsAt: string;
    if (currentMinute < 30) {
      // Current session ends at :30
      miniMeowMinutesLeft = 29 - currentMinute;
      miniMeowSecondsLeft = 59 - currentSecond;
      const endsAt = new Date(now);
      endsAt.setMinutes(30, 0, 0);
      miniMeowEndsAt = endsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else {
      // Current session ends at :00 (next hour)
      miniMeowMinutesLeft = 59 - currentMinute;
      miniMeowSecondsLeft = 59 - currentSecond;
      miniMeowEndsAt = fullPurrEnds;
    }
    windows.push({
      type: "Mini Meow",
      icon: "\uD83D\uDE3A",
      label: "30 min session",
      endsAt: miniMeowEndsAt,
      minutesLeft: miniMeowMinutesLeft,
      secondsLeft: miniMeowSecondsLeft,
      color: "text-amber-300",
      bgColor: "from-amber-500/20 to-amber-600/10 border-amber-400/30",
    });

    return windows;
  };

  const sessionWindows = getSessionWindows();

  // Determine grid layout based on number of checked-in guests
  const getGridClass = () => {
    const count = sortedSessions.length;
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  return (
    <div className="tv-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-40 h-40 border-2 border-teal-400/30 rounded-full animate-pulse" />
        <div className="absolute bottom-20 left-20 w-32 h-32 border-2 border-amber-400/30 rounded-full" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 border-2 border-purple-400/20 rounded-full" />
      </div>

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[60%] opacity-5"
           style={{ background: 'radial-gradient(ellipse at center top, rgba(94,234,212,0.4) 0%, transparent 60%)' }} />

      <div className="absolute inset-0 p-8 flex flex-col">
        {/* Header */}
        <div
          className="text-center mb-4 flex-shrink-0"
        >
          <h1 className="text-5xl font-light tracking-wider text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            {screen.title || `${locationName} Session Times`}
          </h1>
          <p className="text-xl text-white/50">
            {sortedSessions.length > 0
              ? `${sortedSessions.length} checked-in session${sortedSessions.length !== 1 ? 's' : ''} \u2022 ${sortedSessions.reduce((sum, s) => sum + s.guestCount, 0)} guests in the lounge`
              : "Current session countdown"}
          </p>
        </div>

        {/* Session Window Timers - always visible for online reservation guests */}
        <div
          className="flex gap-4 mb-4 flex-shrink-0"
        >
          {sessionWindows.map((win) => {
            const isUrgent = win.minutesLeft < 5;
            return (
              <div
                key={win.type}
                className={`flex-1 rounded-xl border bg-gradient-to-br ${win.bgColor} p-4 flex items-center gap-4`}
              >
                <div className="text-4xl">{win.icon}</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-semibold ${win.color}`}>{win.type}</span>
                    <span className="text-sm text-white/40">{win.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-3xl font-mono font-bold ${isUrgent ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                      {win.minutesLeft}:{win.secondsLeft.toString().padStart(2, '0')}
                    </span>
                    <span className="text-sm text-white/40">remaining \u2022 ends at {win.endsAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checked-in Guest Grid */}
        {sortedSessions.length > 0 ? (
          <>
            <div className="text-sm text-white/30 mb-2 flex-shrink-0">Checked-in Guests</div>
            <div className={`flex-1 grid ${getGridClass()} gap-3 auto-rows-fr overflow-hidden`}>
              {sortedSessions.map((session, index) => {
                const colors = getSessionColor(session.duration);
                const timeStatus = getTimeStatus(session.expiresAt);
                const sessionLabel = getSessionLabel(session.duration);
                const icon = getSessionIcon(session.duration);

                return (
                  <div
                    key={session.id}
                    className={`
                      relative rounded-xl border overflow-hidden
                      bg-gradient-to-br ${colors.bg} ${colors.border}
                      ${timeStatus.isExpired ? 'opacity-50' : ''}
                      ${timeStatus.isUrgent && !timeStatus.isExpired ? 'ring-2 ring-red-400/50' : ''}
                      flex flex-col
                    `}

                  >
                    {/* Progress bar at top */}
                    <div className="h-1 bg-white/10 flex-shrink-0">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          timeStatus.isExpired ? 'bg-red-500' :
                          timeStatus.isUrgent ? 'bg-red-400' : 'bg-teal-400/80'
                        }`}
                        style={{ width: `${timeStatus.percent}%` }}
                      />
                    </div>

                    <div className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                      {/* Session type badge */}
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${colors.badge}`}>
                        <span>{icon}</span>
                        <span>{sessionLabel}</span>
                      </div>

                      {/* Guest name */}
                      <h3 className="text-xl font-semibold text-white truncate w-full mb-0.5">
                        {session.guestName}
                      </h3>

                      {/* Party size */}
                      {session.guestCount > 1 && (
                        <p className="text-xs text-white/50 mb-1">
                          Party of {session.guestCount}
                        </p>
                      )}

                      {/* Countdown */}
                      <div className={`text-2xl font-mono font-bold ${
                        timeStatus.isExpired ? 'text-red-400' :
                        timeStatus.isUrgent ? 'text-red-300 animate-pulse' : 'text-white'
                      }`}>
                        {timeStatus.isExpired ? 'TIME UP' : timeStatus.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* When no checked-in guests, show a friendly message below the timers */
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">\uD83D\uDC3E</div>
              <h2 className="text-2xl font-light text-white/50 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Enjoy your time with our cats!
              </h2>
              <p className="text-lg text-white/30">
                Session timers shown above
              </p>
            </div>
          </div>
        )}

        {/* Footer with session type legend */}
        <div
          className="mt-3 flex items-center justify-center gap-8 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-400"></span>
            <span className="text-sm text-white/40">Full Purr (60 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-sm text-white/40">Mini Meow (30 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400"></span>
            <span className="text-sm text-white/40">Quick Peek (15 min)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lightweight overlay that renders only template elements on top of the default screen
// This preserves the original screen design while allowing element additions from the Slide Editor
function TemplateElementsOverlay({ screenType, screen, settings }: { screenType: string; screen: Screen; settings: Settings | null }) {
  const { data: template } = trpc.templates.getByScreenType.useQuery(
    { screenType },
    { staleTime: 60000 }
  );
  
  // Check if there are saved template elements
  let elements: any[] = [];
  try {
    const parsed = JSON.parse(template?.elements || "[]");
    // Only use if template was explicitly saved (has an id in the database)
    if (parsed.length > 0 && template && 'id' in template && (template as any).id !== undefined) {
      elements = parsed;
    }
  } catch {
    elements = [];
  }
  
  if (elements.length === 0) return null;
  
  // Render each template element as an absolute-positioned overlay
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {elements.map((el: any) => {
        if (el.visible === false) return null;
        
        const style: React.CSSProperties = {
          position: "absolute",
          left: `${el.x}%`,
          top: `${el.y}%`,
          width: `${el.width}%`,
          height: `${el.height}%`,
          opacity: el.opacity || 1,
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          zIndex: el.zIndex || 1,
          borderRadius: el.borderRadius || 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: el.textAlign === "left" ? "flex-start" : el.textAlign === "right" ? "flex-end" : "center",
          padding: el.padding || 0,
          backgroundColor: el.backgroundColor || "transparent",
        };
        
        const textStyle: React.CSSProperties = {
          fontSize: `${el.fontSize || 24}px`,
          fontWeight: el.fontWeight || "normal",
          fontFamily: el.fontFamily || "inherit",
          color: el.color || "#ffffff",
          textAlign: el.textAlign || "center",
          width: "100%",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        };
        
        let content: React.ReactNode = null;
        switch (el.type) {
          case "title":
            content = <span style={textStyle}>{screen.title}</span>;
            break;
          case "subtitle":
            content = <span style={textStyle}>{screen.subtitle || ""}</span>;
            break;
          case "body":
            content = <span style={textStyle}>{screen.body || ""}</span>;
            break;
          case "photo":
            if (screen.imagePath) {
              content = <img src={screen.imagePath} alt="" className="w-full h-full object-cover" />;
            }
            break;
          case "qrCode":
            if (screen.qrUrl) {
              content = (
                <div className="bg-white p-3 rounded-lg">
                  <QRCodeSVG value={screen.qrUrl} size={Math.min(el.width, el.height) * 5} level="M" />
                </div>
              );
            }
            break;
          default:
            return null;
        }
        
        if (!content) return null;
        
        return (
          <div key={el.id} style={style}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

// Main renderer that selects the appropriate component
export function ScreenRenderer({ screen, settings, adoptionCats }: ScreenRendererProps) {
  // Auto count adoptions from DB + manual offset
  const { data: autoCount } = trpc.screens.getAdoptionCount.useQuery(undefined, { staleTime: 30000 });
  const dbCount = autoCount?.count || 0;
  const manualOffset = settings?.totalAdoptionCount || 0;
  const autoAdoptionCount = dbCount + manualOffset;

  // Fetch template for this screen type (all types, not just CUSTOM)
  const { data: savedTemplate } = trpc.templates.getByScreenType.useQuery(
    { screenType: screen.type },
    { staleTime: 60000 }
  );
  
  // For CUSTOM screens, check per-screen templateOverride first
  let hasPerScreenOverride = false;
  let perScreenElements: any[] = [];
  let perScreenBg = '';
  if (screen.type === 'CUSTOM' && screen.templateOverride) {
    try {
      const override = JSON.parse(screen.templateOverride);
      const parsed = JSON.parse(override.elements || '[]');
      if (parsed.length > 0) {
        hasPerScreenOverride = true;
        perScreenElements = parsed;
        perScreenBg = override.backgroundColor || '#1a1a2e';
      }
    } catch {
      hasPerScreenOverride = false;
    }
  }

  // Check if this screen type has a saved template with elements
  let hasSavedTemplate = false;
  try {
    const elements = JSON.parse(savedTemplate?.elements || "[]");
    hasSavedTemplate = !!(elements.length > 0 && savedTemplate && 'id' in savedTemplate && (savedTemplate as any).id !== undefined);
  } catch {
    hasSavedTemplate = false;
  }
  
  // Per-screen override takes priority for CUSTOM slides
  if (hasPerScreenOverride) {
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
          <div className="tv-screen relative overflow-hidden w-full h-full" style={{ background: perScreenBg }}>
            <div className="absolute inset-0">
              {perScreenElements.map((el: any) => {
                if (el.visible === false) return null;
                const style: React.CSSProperties = {
                  position: 'absolute',
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  opacity: el.opacity || 1,
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  zIndex: el.zIndex || 1,
                  borderRadius: el.borderRadius || 0,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: el.textAlign === 'left' ? 'flex-start' : el.textAlign === 'right' ? 'flex-end' : 'center',
                  padding: el.padding || 0,
                  backgroundColor: el.backgroundColor || 'transparent',
                };
                const textStyle: React.CSSProperties = {
                  fontSize: `${el.fontSize || 24}px`,
                  fontWeight: el.fontWeight || 'normal',
                  fontFamily: el.fontFamily || 'inherit',
                  color: el.color || '#ffffff',
                  textAlign: (el.textAlign || 'center') as any,
                  width: '100%',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                };
                let content: React.ReactNode = null;
                switch (el.type) {
                  case 'title': content = <span style={textStyle}>{screen.title}</span>; break;
                  case 'subtitle': content = <span style={textStyle}>{screen.subtitle || ''}</span>; break;
                  case 'body': content = <span style={textStyle}>{screen.body || ''}</span>; break;
                  case 'photo': content = screen.imagePath ? <img src={screen.imagePath} alt="" className="w-full h-full object-cover" /> : null; break;
                  case 'qrCode': content = screen.qrUrl ? <div className="bg-white p-3 rounded-lg"><QRCodeSVG value={screen.qrUrl} size={Math.min(el.width, el.height) * 5} level="M" /></div> : null; break;
                  default: return null;
                }
                if (!content) return null;
                return <div key={el.id} style={style}>{content}</div>;
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // If ANY screen type has a saved template, use TemplateRenderer as full replacement
  // This prevents doubling: template elements replace the default design entirely
  if (hasSavedTemplate) {
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
            adoptionCount={autoAdoptionCount}
            adoptionCats={adoptionCats}
          />
        </motion.div>
      </AnimatePresence>
    );
  }
  
  // No saved template: use default renderers
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
    GUEST_STATUS_BOARD: GuestStatusBoardScreen,
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
              <div className="mt-8 bg-white p-4 rounded-lg shadow-xl text-center">
                {screen.qrLabel && (
                  <p className="mb-2 text-sm font-semibold text-gray-700">{screen.qrLabel}</p>
                )}
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
        className="w-full h-full relative"
      >
        {/* Default screen design (no template saved for this type) */}
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
