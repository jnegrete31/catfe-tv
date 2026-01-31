import { motion } from "framer-motion";
import type { Screen } from "@shared/types";

interface RecentlyAdoptedBannerProps {
  adoptedCats: Screen[];
  className?: string;
}

/**
 * A celebratory banner that scrolls through recently adopted cats
 * Creates a positive atmosphere by celebrating successful adoptions
 * Improved with larger sizing, better visibility, and responsive design for TV displays
 */
export function RecentlyAdoptedBanner({ adoptedCats, className = "" }: RecentlyAdoptedBannerProps) {
  if (!adoptedCats || adoptedCats.length === 0) {
    return null;
  }

  return (
    <div className={`recently-adopted-banner ${className}`}>
      {/* Larger, more visible banner - increased height and better contrast */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.3)] border-t-[6px] border-green-300">
        <div className="flex items-center overflow-hidden h-[120px]">
          {/* Static label - larger and more prominent */}
          <div className="flex-shrink-0 flex items-center gap-4 px-10 h-full bg-green-600 border-r-[3px] border-white/40">
            <motion.span 
              className="text-5xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            >
              🎉
            </motion.span>
            <span className="font-bold text-3xl whitespace-nowrap tracking-wide drop-shadow-lg">
              Recently Adopted!
            </span>
          </div>
          
          {/* Scrolling cats - larger thumbnails and text */}
          <div className="flex-1 overflow-hidden h-full flex items-center">
            <motion.div
              className="flex items-center gap-12 px-8"
              animate={{
                x: adoptedCats.length > 2 ? [0, -200 * adoptedCats.length] : 0,
              }}
              transition={{
                x: {
                  duration: adoptedCats.length * 6, // Slower scroll for better readability
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate cats for seamless loop */}
              {[...adoptedCats, ...adoptedCats].map((cat, index) => (
                <div 
                  key={`${cat.id}-${index}`}
                  className="flex items-center gap-5 flex-shrink-0"
                >
                  {/* Cat thumbnail - larger for TV visibility (80px) */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0 ring-4 ring-white/30">
                    {cat.imagePath ? (
                      <img 
                        src={cat.imagePath} 
                        alt={cat.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-400 flex items-center justify-center">
                        <span className="text-4xl">🐱</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Cat name - larger text (28px) */}
                  <span className="font-bold text-[28px] whitespace-nowrap drop-shadow-lg">
                    {cat.title.replace("Meet ", "")}
                  </span>
                  
                  {/* Heart icon - larger with pulse animation */}
                  <motion.span 
                    className="text-3xl text-pink-200"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ❤️
                  </motion.span>
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
 * Compact version for overlay on screens - now larger and more visible
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
      className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20"
    >
      <div className="bg-green-500/95 backdrop-blur-sm text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-6 border-3 border-white/40">
        <motion.span 
          className="text-4xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          🎉
        </motion.span>
        <span className="font-bold text-2xl">Recently Adopted:</span>
        <div className="flex items-center gap-5">
          {displayCats.map((cat, index) => (
            <div key={cat.id} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-white/60 shadow-lg">
                {cat.imagePath ? (
                  <img 
                    src={cat.imagePath} 
                    alt={cat.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-green-400 flex items-center justify-center text-2xl">
                    🐱
                  </div>
                )}
              </div>
              <span className="font-semibold text-xl">
                {cat.title.replace("Meet ", "")}
              </span>
              {index < displayCats.length - 1 && <span className="text-white/50 text-2xl">•</span>}
            </div>
          ))}
        </div>
        {adoptedCats.length > 3 && (
          <span className="text-white/90 text-xl font-medium">+{adoptedCats.length - 3} more</span>
        )}
      </div>
    </motion.div>
  );
}
