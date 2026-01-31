import { motion, AnimatePresence } from "framer-motion";
import type { Screen, Settings } from "@shared/types";
import { SCREEN_TYPE_CONFIG } from "@shared/types";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";

interface ScreenRendererProps {
  screen: Screen;
  settings: Settings | null;
  adoptionCats?: Screen[]; // For ADOPTION_SHOWCASE
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
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#fce7f3">
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
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#ede9fe">
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
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#fef3c7">
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
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#d1fae5">
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
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#dbeafe">
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
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#fee2e2">
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

// ADOPTION_SHOWCASE - Grid of 4 random adoptable cats
function AdoptionShowcaseScreen({ screen, settings, adoptionCats }: ScreenRendererProps) {
  const cats = adoptionCats || [];
  const { data: adoptionCountData } = trpc.screens.getAdoptionCount.useQuery();
  const adoptedCount = adoptionCountData?.count || 0;
  
  return (
    <ScreenLayout bgColor="#ffedd5">
      <div className="w-full h-full flex flex-col p-8">
        <div className="text-center mb-6">
          <div className="inline-block px-6 py-3 rounded-full bg-orange-500 text-white text-xl mb-2">
            Meet Our Adoptable Cats
          </div>
          <h1 className="tv-text-medium text-orange-900">
            {screen.title || "Find Your Purrfect Match"}
          </h1>
          {/* Adoption success counter */}
          {adoptedCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800">
              <span className="text-2xl">🎉</span>
              <span className="text-lg font-semibold">
                {adoptedCount} {adoptedCount === 1 ? 'cat' : 'cats'} adopted and counting!
              </span>
            </div>
          )}
        </div>
        
        {/* 2x2 Grid of cats - using square aspect ratio */}
        <div className="flex-1 grid grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {cats.slice(0, 4).map((cat, index) => (
            <div 
              key={cat.id || index}
              className="relative bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col"
            >
              {/* Square image container using aspect-square */}
              <div className="relative aspect-square">
                {cat.imagePath ? (
                  <>
                    <img 
                      src={cat.imagePath} 
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Adopted badge overlay */}
                    {(cat as any).isAdopted && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg animate-pulse">
                        🎉 Adopted!
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-orange-100 flex items-center justify-center">
                    <span className="text-6xl">🐱</span>
                    {/* Adopted badge overlay for no-image cats */}
                    {(cat as any).isAdopted && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg animate-pulse">
                        🎉 Adopted!
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 bg-white">
                <h3 className="text-2xl font-bold text-orange-900 truncate">{cat.title}</h3>
                {cat.subtitle && (
                  <p className="text-lg text-orange-700 truncate">{cat.subtitle}</p>
                )}
              </div>
            </div>
          ))}
          
          {/* Fill empty slots with placeholders */}
          {cats.length < 4 && Array.from({ length: 4 - cats.length }).map((_, i) => (
            <div 
              key={`empty-${i}`}
              className="bg-orange-100 rounded-2xl flex flex-col overflow-hidden shadow-lg"
            >
              <div className="aspect-square flex items-center justify-center">
                <div className="text-center text-orange-400">
                  <span className="text-6xl block mb-2">🐱</span>
                  <span className="text-xl">Coming Soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {screen.qrUrl && (
          <div className="text-center mt-6">
            <p className="text-lg text-orange-700 mb-2">Scan to see all adoptable cats</p>
            <div className="inline-block">
              <QRCode url={screen.qrUrl} size={120} />
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// THANK_YOU - Appreciation messages
function ThankYouScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} imageDisplayMode={(screen as any).imageDisplayMode} bgColor="#e0e7ff">
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
    THANK_YOU: ThankYouScreen,
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
