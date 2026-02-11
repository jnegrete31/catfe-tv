import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Cat, Heart, Sparkles } from "lucide-react";
import { playWelcomeChime } from "@/lib/chime";

interface UpcomingGuest {
  id: number;
  guestName: string;
  guestCount: number;
  checkInAt: Date;
  minutesUntilArrival: number;
}

export function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<UpcomingGuest | null>(null);
  const [animationPhase, setAnimationPhase] = useState<"enter" | "display" | "exit">("enter");
  const chimedGuestIds = useRef<Set<number>>(new Set());

  // Fetch upcoming guests (arriving within 15 minutes)
  const { data: upcomingGuests } = trpc.guestSessions.getUpcomingArrivals.useQuery(
    { minutesAhead: 15 },
    {
      refetchInterval: 30000, // Check every 30 seconds
      staleTime: 15000,
    }
  );

  // Cycle through upcoming guests
  useEffect(() => {
    if (!upcomingGuests || upcomingGuests.length === 0) {
      setIsVisible(false);
      setCurrentGuest(null);
      return;
    }

    // Show welcome for each guest
    let guestIndex = 0;
    
    const showNextGuest = () => {
      if (guestIndex >= upcomingGuests.length) {
        guestIndex = 0;
      }
      
      const guest = upcomingGuests[guestIndex];
      setCurrentGuest(guest);
      setAnimationPhase("enter");
      setIsVisible(true);

      // Play chime when showing a new guest (only once per guest)
      if (!chimedGuestIds.current.has(guest.id)) {
        chimedGuestIds.current.add(guest.id);
        playWelcomeChime(0.35);
      }

      // Animation timeline
      setTimeout(() => setAnimationPhase("display"), 500);
      setTimeout(() => setAnimationPhase("exit"), 8000);
      setTimeout(() => {
        setIsVisible(false);
        guestIndex++;
      }, 8500);
    };

    // Initial show
    showNextGuest();

    // Cycle through guests every 30 seconds
    const interval = setInterval(() => {
      if (upcomingGuests.length > 0) {
        showNextGuest();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [upcomingGuests]);

  // Clean up old chimed IDs periodically (every 30 minutes)
  useEffect(() => {
    const cleanup = setInterval(() => {
      chimedGuestIds.current.clear();
    }, 30 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, []);

  if (!isVisible || !currentGuest) {
    return null;
  }

  // Extract first name for more personal greeting
  const firstName = currentGuest.guestName.split(" ")[0];
  const isGroup = currentGuest.guestCount > 1;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        animationPhase === "enter" ? "opacity-0" : 
        animationPhase === "exit" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/95 via-orange-800/95 to-amber-900/95" />
      
      {/* Animated sparkles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-amber-300/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `scale(${0.5 + Math.random() * 1.5})`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={`relative z-10 text-center px-16 transition-all duration-700 ${
        animationPhase === "display" ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
      }`}>
        {/* Cat icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-amber-500/30 flex items-center justify-center animate-bounce">
            <Cat className="w-20 h-20 text-amber-100" />
          </div>
        </div>

        {/* Welcome text */}
        <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-2xl" style={{ fontFamily: 'Georgia, serif' }}>
          Welcome{isGroup ? "" : ","} {firstName}!
        </h1>

        {/* Subtitle */}
        <p className="text-4xl text-amber-100 mb-8 drop-shadow-lg">
          {isGroup 
            ? `Party of ${currentGuest.guestCount} • Your purrfect adventure awaits!`
            : "Your purrfect adventure awaits!"
          }
        </p>

        {/* Time indicator */}
        <div className="flex items-center justify-center gap-3 text-2xl text-amber-200/80">
          <Heart className="w-6 h-6 text-red-400 animate-pulse" />
          <span>
            {currentGuest.minutesUntilArrival <= 1 
              ? "Arriving now" 
              : `Arriving in ${currentGuest.minutesUntilArrival} minutes`
            }
          </span>
          <Heart className="w-6 h-6 text-red-400 animate-pulse" />
        </div>

        {/* Decorative paw prints */}
        <div className="mt-12 flex justify-center gap-8 opacity-50">
          <span className="text-5xl">🐾</span>
          <span className="text-5xl">🐾</span>
          <span className="text-5xl">🐾</span>
        </div>
      </div>
    </div>
  );
}
