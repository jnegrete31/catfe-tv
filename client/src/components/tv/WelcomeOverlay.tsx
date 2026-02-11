import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Cat, Heart, Sparkles, Users, Clock } from "lucide-react";
import { playWelcomeChime } from "@/lib/chime";

interface GuestSession {
  id: number;
  guestName: string;
  guestCount: number;
  duration: "15" | "30" | "60";
  status: string;
  checkInAt: Date;
}

interface WelcomeEntry {
  session: GuestSession;
  appearedAt: number; // timestamp
}

const SESSION_LABELS: Record<string, string> = {
  "15": "Guest Pass",
  "30": "Mini Meow Session",
  "60": "Full Meow Session",
};

const WELCOME_DISPLAY_MS = 12000; // Show welcome for 12 seconds
const POLL_INTERVAL_MS = 5000; // Check for new check-ins every 5 seconds

export function WelcomeOverlay() {
  const [welcomeQueue, setWelcomeQueue] = useState<WelcomeEntry[]>([]);
  const [currentWelcome, setCurrentWelcome] = useState<WelcomeEntry | null>(null);
  const [animationPhase, setAnimationPhase] = useState<"enter" | "display" | "exit">("enter");
  const welcomedIds = useRef<Set<number>>(new Set());
  const displayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for recently checked-in guests
  const { data: recentGuests } = trpc.guestSessions.getRecentlyCheckedIn.useQuery(undefined, {
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: 3000,
  });

  // Process new check-ins into the welcome queue
  useEffect(() => {
    if (!recentGuests || recentGuests.length === 0) return;

    const newEntries: WelcomeEntry[] = [];
    for (const session of recentGuests) {
      if (!welcomedIds.current.has(session.id)) {
        welcomedIds.current.add(session.id);
        newEntries.push({
          session: session as GuestSession,
          appearedAt: Date.now(),
        });
      }
    }

    if (newEntries.length > 0) {
      setWelcomeQueue((prev) => [...prev, ...newEntries]);
    }
  }, [recentGuests]);

  // Show the next welcome from the queue
  const showNextWelcome = useCallback(() => {
    setWelcomeQueue((prev) => {
      if (prev.length === 0) {
        setCurrentWelcome(null);
        return prev;
      }
      const [next, ...rest] = prev;
      setCurrentWelcome(next);
      setAnimationPhase("enter");

      // Play chime
      playWelcomeChime(0.4);

      // Animation timeline
      setTimeout(() => setAnimationPhase("display"), 600);

      // Schedule exit
      if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
      displayTimeoutRef.current = setTimeout(() => {
        setAnimationPhase("exit");
        setTimeout(() => {
          setCurrentWelcome(null);
        }, 600);
      }, WELCOME_DISPLAY_MS);

      return rest;
    });
  }, []);

  // Trigger showing welcome when queue has items and nothing is currently displayed
  useEffect(() => {
    if (welcomeQueue.length > 0 && !currentWelcome) {
      // Small delay to avoid rapid-fire
      const timer = setTimeout(showNextWelcome, 500);
      return () => clearTimeout(timer);
    }
  }, [welcomeQueue.length, currentWelcome, showNextWelcome]);

  // Clean up old welcomed IDs periodically (every 10 minutes)
  useEffect(() => {
    const cleanup = setInterval(() => {
      welcomedIds.current.clear();
    }, 10 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
    };
  }, []);

  if (!currentWelcome) return null;

  const { session } = currentWelcome;
  const firstName = session.guestName.split(" ")[0];
  const isGroup = session.guestCount > 1;
  const sessionLabel = SESSION_LABELS[session.duration] || "Cat Lounge Session";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        animationPhase === "enter"
          ? "opacity-0"
          : animationPhase === "exit"
          ? "opacity-0"
          : "opacity-100"
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/97 via-orange-800/97 to-amber-900/97" />

      {/* Animated sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <Sparkles
              className="text-amber-300/25"
              style={{
                width: `${16 + Math.random() * 32}px`,
                height: `${16 + Math.random() * 32}px`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Floating paw prints */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`paw-${i}`}
            className="absolute text-amber-200/10 animate-bounce"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
              fontSize: `${40 + Math.random() * 60}px`,
            }}
          >
            🐾
          </div>
        ))}
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 text-center px-8 sm:px-16 max-w-5xl mx-auto transition-all duration-700 ${
          animationPhase === "display"
            ? "scale-100 translate-y-0"
            : animationPhase === "enter"
            ? "scale-90 translate-y-12"
            : "scale-95 -translate-y-8"
        }`}
      >
        {/* Cat icon with glow */}
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-2xl scale-150" />
            <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-amber-400/40 to-orange-500/40 flex items-center justify-center border-2 border-amber-300/30">
              <Cat className="w-20 h-20 text-amber-100 drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* Welcome text */}
        <h1
          className="text-[clamp(3rem,8vw,7rem)] font-bold text-white mb-4 drop-shadow-2xl leading-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Welcome, {firstName}!
        </h1>

        {/* Subtitle with party info */}
        <p className="text-[clamp(1.5rem,3.5vw,3rem)] text-amber-100 mb-8 drop-shadow-lg">
          {isGroup
            ? `Party of ${session.guestCount} — Your purrfect adventure awaits!`
            : "Your purrfect adventure awaits!"}
        </p>

        {/* Session info badge */}
        <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 border border-amber-300/20">
          <div className="flex items-center gap-2 text-amber-200">
            <Clock className="w-6 h-6" />
            <span className="text-[clamp(1rem,2vw,1.5rem)] font-medium">{sessionLabel}</span>
          </div>
          {isGroup && (
            <>
              <div className="w-px h-6 bg-amber-300/30" />
              <div className="flex items-center gap-2 text-amber-200">
                <Users className="w-6 h-6" />
                <span className="text-[clamp(1rem,2vw,1.5rem)] font-medium">
                  {session.guestCount} Guest{session.guestCount !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Hearts decoration */}
        <div className="mt-10 flex justify-center gap-6 items-center">
          <Heart className="w-8 h-8 text-red-400/70 animate-pulse" style={{ animationDelay: "0s" }} />
          <span className="text-5xl">🐾</span>
          <Heart className="w-10 h-10 text-red-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
          <span className="text-5xl">🐾</span>
          <Heart className="w-8 h-8 text-red-400/70 animate-pulse" style={{ animationDelay: "0.6s" }} />
        </div>
      </div>
    </div>
  );
}
