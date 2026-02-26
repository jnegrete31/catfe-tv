import { useEffect, useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, AlertTriangle, Volume2, VolumeX } from "lucide-react";
import { playReminderChime } from "@/lib/chime";

type GuestSession = {
  id: number;
  guestName: string;
  guestCount: number;
  duration: "15" | "30" | "60" | "90";
  status: "active" | "completed" | "extended";
  checkInAt: Date;
  expiresAt: Date;
  notes: string | null;
  reminderShown: boolean;
};

// Grace period: hide expired sessions from TV overlay after 2 minutes
const EXPIRED_GRACE_MS = 2 * 60 * 1000;

// Custom hook for chime with Web Audio API
function useChime() {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('catfe-chime-muted');
    return saved === 'true';
  });
  const playedRemindersRef = useRef<Set<string>>(new Set());
  
  // Save mute preference
  useEffect(() => {
    localStorage.setItem('catfe-chime-muted', String(isMuted));
  }, [isMuted]);
  
  const playChime = useCallback((reminderId: string) => {
    if (!isMuted && !playedRemindersRef.current.has(reminderId)) {
      playedRemindersRef.current.add(reminderId);
      playReminderChime(0.3);
    }
  }, [isMuted]);
  
  const resetPlayedReminders = useCallback(() => {
    playedRemindersRef.current.clear();
  }, []);
  
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  return { playChime, resetPlayedReminders, isMuted, toggleMute };
}

export function GuestReminderOverlay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const markedIds = useRef<Set<number>>(new Set());
  const { playChime, isMuted, toggleMute } = useChime();
  
  // Query for sessions needing reminder - poll every 5 seconds for responsiveness
  const { data: sessionsNeedingReminder } = trpc.guestSessions.getNeedingReminder.useQuery(undefined, {
    refetchInterval: 15000, // Check every 15 seconds
    staleTime: 10000,
  });
  
  // Mutation to mark reminder as shown (for tracking purposes only)
  const markReminderMutation = trpc.guestSessions.markReminderShown.useMutation();
  
  // Update current time every second for accurate countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  

  
  // Mark reminders as shown in database (for analytics/tracking)
  useEffect(() => {
    if (sessionsNeedingReminder) {
      sessionsNeedingReminder.forEach((session: GuestSession) => {
        if (!session.reminderShown && !markedIds.current.has(session.id)) {
          markedIds.current.add(session.id);
          markReminderMutation.mutate({ id: session.id });
          // Play chime for new individual guest reminders
          playChime(`guest-${session.id}`);
        }
      });
    }
  }, [sessionsNeedingReminder, playChime]);
  
  // Cast to proper type and filter out sessions expired beyond grace period
  const sessions = ((sessionsNeedingReminder || []) as GuestSession[]).filter((s) => {
    const msLeft = new Date(s.expiresAt).getTime() - currentTime.getTime();
    return msLeft > -EXPIRED_GRACE_MS; // Show until 2 min past expiry
  });
  
  // No reminders to show
  if (sessions.length === 0) {
    return null;
  }
  
  return (
    <div 
      className="fixed tv-widget-position-bottom-left z-50 flex flex-col gap-[clamp(0.5rem,1vw,1rem)]"
      style={{ maxWidth: 'clamp(250px, 25vw, 450px)', left: 'clamp(1rem, 2vw, 3rem)', bottom: 'clamp(5rem, 8vw, 10rem)' }}
    >
      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="self-start flex items-center gap-[clamp(0.25rem,0.5vw,0.75rem)] px-[clamp(0.75rem,1.25vw,1.5rem)] py-[clamp(0.5rem,0.75vw,1rem)] rounded-full bg-black/60 backdrop-blur-sm text-white tv-widget-text-lg hover:bg-black/80 transition-colors"
        title={isMuted ? "Unmute chime" : "Mute chime"}
      >
        {isMuted ? (
          <>
            <VolumeX className="tv-icon-sm" />
            <span>Chime Off</span>
          </>
        ) : (
          <>
            <Volume2 className="tv-icon-sm" />
            <span>Chime On</span>
          </>
        )}
      </button>
      
      {/* Individual Guest Session Reminders */}
      {sessions.map((session) => {
        const expiresAt = new Date(session.expiresAt);
        const msLeft = Math.max(0, expiresAt.getTime() - currentTime.getTime());
        const minutesLeft = Math.floor(msLeft / 60000);
        const secondsLeft = Math.floor((msLeft % 60000) / 1000);
        const isUrgent = minutesLeft < 2;
        const isExpired = msLeft <= 0;
        
        return (
          <div
            key={session.id}
            className={`
              animate-in slide-in-from-left duration-500 
              rounded-2xl shadow-lg overflow-hidden
              ${isUrgent 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }
            `}
          >
            <div className="tv-widget-padding text-white">
              <div className="flex items-center gap-[clamp(0.5rem,1vw,1rem)]">
                {isUrgent ? (
                  <AlertTriangle className="tv-icon-md flex-shrink-0 animate-pulse" />
                ) : (
                  <Bell className="tv-icon-md flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold tv-widget-text-lg truncate">{session.guestName}</div>
                  <div className="tv-widget-text-lg opacity-90">
                    {isExpired ? (
                      "Session ended!"
                    ) : (
                      <>{minutesLeft}:{secondsLeft.toString().padStart(2, '0')} left • {session.guestCount} guest{session.guestCount !== 1 ? 's' : ''}</>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[clamp(0.25rem,0.5vw,0.5rem)] bg-white/30">
              <div 
                className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-white' : 'bg-white/80'}`}
                style={{ 
                  width: `${Math.max(0, Math.min(100, (msLeft / (5 * 60 * 1000)) * 100))}%` 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
