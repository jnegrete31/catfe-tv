import { useEffect, useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Clock, Bell, Users, AlertTriangle, Timer, Volume2, VolumeX } from "lucide-react";

type GuestSession = {
  id: number;
  guestName: string;
  guestCount: number;
  duration: "15" | "30" | "60";
  status: "active" | "completed" | "extended";
  checkInAt: Date;
  expiresAt: Date;
  notes: string | null;
  reminderShown: boolean;
};

// Scheduled reminder configuration
type ScheduledReminder = {
  id: string;
  minute: number; // Minute of the hour (25 or 55)
  sessionType: string;
  sessionDuration: string;
  message: string;
};

const SCHEDULED_REMINDERS: ScheduledReminder[] = [
  {
    id: "mini-meow-25",
    minute: 25,
    sessionType: "Mini Meow",
    sessionDuration: "30 min",
    message: "Mini Meow sessions ending soon!",
  },
  {
    id: "full-purr-55",
    minute: 55,
    sessionType: "Full Purr",
    sessionDuration: "60 min",
    message: "Full Purr sessions ending soon!",
  },
  {
    id: "mini-meow-55",
    minute: 55,
    sessionType: "Mini Meow",
    sessionDuration: "30 min",
    message: "Mini Meow sessions ending soon!",
  },
];

// Check if we're within the reminder window (5 minutes before the scheduled time)
function isInReminderWindow(currentMinute: number, targetMinute: number): boolean {
  // Show reminder from targetMinute to targetMinute + 5
  // e.g., for :55, show from :55 to :59 (and :00 for the next hour)
  // e.g., for :25, show from :25 to :29
  const diff = currentMinute - targetMinute;
  return diff >= 0 && diff < 5;
}

// Get active scheduled reminders based on current time
function getActiveScheduledReminders(currentTime: Date): ScheduledReminder[] {
  const currentMinute = currentTime.getMinutes();
  
  return SCHEDULED_REMINDERS.filter(reminder => 
    isInReminderWindow(currentMinute, reminder.minute)
  );
}

// Custom hook for audio chime
function useAudioChime() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    // Check localStorage for mute preference
    const saved = localStorage.getItem('catfe-chime-muted');
    return saved === 'true';
  });
  const playedRemindersRef = useRef<Set<string>>(new Set());
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/chime.mp3');
    audioRef.current.volume = 0.7;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Save mute preference
  useEffect(() => {
    localStorage.setItem('catfe-chime-muted', String(isMuted));
  }, [isMuted]);
  
  const playChime = useCallback((reminderId: string) => {
    // Only play if not muted and hasn't played for this reminder yet
    if (!isMuted && audioRef.current && !playedRemindersRef.current.has(reminderId)) {
      playedRemindersRef.current.add(reminderId);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors - user interaction required
      });
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
  const [dismissedScheduled, setDismissedScheduled] = useState<Set<string>>(new Set());
  const { playChime, resetPlayedReminders, isMuted, toggleMute } = useAudioChime();
  
  // Query for sessions needing reminder - poll every 5 seconds for responsiveness
  const { data: sessionsNeedingReminder } = trpc.guestSessions.getNeedingReminder.useQuery(undefined, {
    refetchInterval: 5000, // Check every 5 seconds
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
  
  // Reset dismissed scheduled reminders when the hour changes
  useEffect(() => {
    const currentMinute = currentTime.getMinutes();
    
    // Reset at the start of each new reminder window
    if (currentMinute === 25 || currentMinute === 55) {
      setDismissedScheduled(new Set());
      resetPlayedReminders();
    }
  }, [currentTime.getMinutes(), resetPlayedReminders]);
  
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
  
  // Get active scheduled reminders
  const activeScheduledReminders = getActiveScheduledReminders(currentTime)
    .filter(r => !dismissedScheduled.has(`${r.id}-${currentTime.getHours()}`));
  
  // Play chime for scheduled reminders when they first appear
  useEffect(() => {
    activeScheduledReminders.forEach(reminder => {
      const reminderId = `scheduled-${reminder.id}-${currentTime.getHours()}`;
      playChime(reminderId);
    });
  }, [activeScheduledReminders.length, currentTime.getHours(), playChime]);
  
  // Cast to proper type
  const sessions = (sessionsNeedingReminder || []) as GuestSession[];
  
  // No reminders to show
  if (sessions.length === 0 && activeScheduledReminders.length === 0) {
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
      
      {/* Scheduled Time-Based Reminders */}
      {activeScheduledReminders.map((reminder) => {
        const targetMinute = reminder.minute;
        const currentMinute = currentTime.getMinutes();
        const currentSecond = currentTime.getSeconds();
        
        // Calculate time remaining until the 5-minute window ends
        const minutesIntoWindow = currentMinute - targetMinute;
        const minutesLeft = 4 - minutesIntoWindow;
        const secondsLeft = 59 - currentSecond;
        
        return (
          <div
            key={`${reminder.id}-${currentTime.getHours()}`}
            className="animate-in slide-in-from-left duration-500 rounded-2xl shadow-lg overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600"
          >
            <div className="tv-widget-padding text-white">
              <div className="flex items-center gap-[clamp(0.5rem,1vw,1rem)]">
                <Timer className="tv-icon-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold tv-widget-text-lg">{reminder.sessionType}</div>
                  <div className="tv-widget-text-lg opacity-90">Ending soon • {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}</div>
                </div>
              </div>
            </div>
            <div className="h-[clamp(0.25rem,0.5vw,0.5rem)] bg-white/30">
              <div 
                className="h-full transition-all duration-1000 bg-white/80"
                style={{ 
                  width: `${Math.max(0, ((minutesLeft * 60 + secondsLeft) / (5 * 60)) * 100)}%` 
                }}
              />
            </div>
          </div>
        );
      })}
      
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
