import { motion, AnimatePresence } from "framer-motion";
import type { Screen } from "@shared/types";

interface RecentlyAdoptedBannerProps {
  adoptedCats: Screen[];
  className?: string;
}

/**
 * A celebratory banner that scrolls through recently adopted cats
 * Creates a positive atmosphere by celebrating successful adoptions
 */
export function RecentlyAdoptedBanner({ adoptedCats, className = "" }: RecentlyAdoptedBannerProps) {
  if (!adoptedCats || adoptedCats.length === 0) {
    return null;
  }

  return (
    <div className={`recently-adopted-banner ${className}`}>
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white py-3 px-4 shadow-lg">
        <div className="flex items-center gap-4 overflow-hidden">
          {/* Static label */}
          <div className="flex-shrink-0 flex items-center gap-2 pr-4 border-r border-white/30">
            <span className="text-2xl">🎉</span>
            <span className="font-bold text-lg whitespace-nowrap">Recently Adopted!</span>
          </div>
          
          {/* Scrolling cats */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              className="flex items-center gap-6"
              animate={{
                x: adoptedCats.length > 2 ? [0, -100 * adoptedCats.length] : 0,
              }}
              transition={{
                x: {
                  duration: adoptedCats.length * 4,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate cats for seamless loop */}
              {[...adoptedCats, ...adoptedCats].map((cat, index) => (
                <div 
                  key={`${cat.id}-${index}`}
                  className="flex items-center gap-3 flex-shrink-0"
                >
                  {/* Cat thumbnail */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-md flex-shrink-0">
                    {cat.imagePath ? (
                      <img 
                        src={cat.imagePath} 
                        alt={cat.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-400 flex items-center justify-center">
                        <span className="text-lg">🐱</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Cat name */}
                  <span className="font-semibold text-lg whitespace-nowrap">
                    {cat.title.replace("Meet ", "")}
                  </span>
                  
                  {/* Heart icon */}
                  <span className="text-pink-200">❤️</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for overlay on screens
 */
export function RecentlyAdoptedOverlay({ adoptedCats }: RecentlyAdoptedBannerProps) {
  if (!adoptedCats || adoptedCats.length === 0) {
    return null;
  }

  // Show only first 3 cats in compact view
  const displayCats = adoptedCats.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20"
    >
      <div className="bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4">
        <span className="text-xl">🎉</span>
        <span className="font-bold">Recently Adopted:</span>
        <div className="flex items-center gap-3">
          {displayCats.map((cat, index) => (
            <div key={cat.id} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50">
                {cat.imagePath ? (
                  <img 
                    src={cat.imagePath} 
                    alt={cat.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-green-400 flex items-center justify-center text-sm">
                    🐱
                  </div>
                )}
              </div>
              <span className="font-medium">
                {cat.title.replace("Meet ", "")}
              </span>
              {index < displayCats.length - 1 && <span className="text-white/50">•</span>}
            </div>
          ))}
        </div>
        {adoptedCats.length > 3 && (
          <span className="text-white/80 text-sm">+{adoptedCats.length - 3} more</span>
        )}
      </div>
    </motion.div>
  );
}
