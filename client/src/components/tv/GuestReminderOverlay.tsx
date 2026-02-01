import { useEffect, useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Clock, Bell, Users, AlertTriangle, Timer } from "lucide-react";

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

export function GuestReminderOverlay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const markedIds = useRef<Set<number>>(new Set());
  const [dismissedScheduled, setDismissedScheduled] = useState<Set<string>>(new Set());
  
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
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // Reset at the start of each new reminder window
    if (currentMinute === 25 || currentMinute === 55) {
      setDismissedScheduled(new Set());
    }
  }, [currentTime.getMinutes()]);
  
  // Mark reminders as shown in database (for analytics/tracking)
  useEffect(() => {
    if (sessionsNeedingReminder) {
      sessionsNeedingReminder.forEach((session: GuestSession) => {
        if (!session.reminderShown && !markedIds.current.has(session.id)) {
          markedIds.current.add(session.id);
          markReminderMutation.mutate({ id: session.id });
        }
      });
    }
  }, [sessionsNeedingReminder]);
  
  // Get active scheduled reminders
  const activeScheduledReminders = getActiveScheduledReminders(currentTime)
    .filter(r => !dismissedScheduled.has(`${r.id}-${currentTime.getHours()}`));
  
  // Cast to proper type
  const sessions = (sessionsNeedingReminder || []) as GuestSession[];
  
  // No reminders to show
  if (sessions.length === 0 && activeScheduledReminders.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-24 right-6 z-50 flex flex-col gap-4" style={{ maxWidth: '420px' }}>
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
            className="animate-in slide-in-from-right duration-500 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600"
            style={{
              boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)'
            }}
          >
            <div className="p-5 text-white">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-white/20">
                  <Timer className="w-8 h-8" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-semibold opacity-90">
                      🔔 Scheduled Reminder
                    </span>
                  </div>
                  
                  {/* Session Type - Large */}
                  <h3 className="text-2xl font-bold">
                    {reminder.sessionType}
                  </h3>
                  
                  {/* Message */}
                  <p className="text-xl mt-1 opacity-95">
                    {reminder.message}
                  </p>
                  
                  {/* Time Info */}
                  <div className="flex items-center gap-3 mt-2 text-white/80">
                    <span>{reminder.sessionDuration} sessions</span>
                    <span>•</span>
                    <span>:{targetMinute.toString().padStart(2, '0')} reminder</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress bar - shows time remaining in reminder window */}
            <div className="h-2 bg-white/30">
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
              animate-in slide-in-from-right duration-500 
              rounded-2xl shadow-2xl overflow-hidden
              ${isUrgent 
                ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }
            `}
            style={{
              boxShadow: isUrgent 
                ? '0 0 30px rgba(239, 68, 68, 0.5)' 
                : '0 0 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            <div className="p-5 text-white">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center
                  ${isUrgent ? 'bg-white/30' : 'bg-white/20'}
                `}>
                  {isUrgent ? (
                    <AlertTriangle className="w-8 h-8 animate-bounce" />
                  ) : (
                    <Bell className="w-8 h-8 animate-pulse" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-semibold opacity-90">
                      {isUrgent ? '⚠️ Time Almost Up!' : '⏰ Time Reminder'}
                    </span>
                  </div>
                  
                  {/* Guest Name - Large */}
                  <h3 className="text-2xl font-bold truncate">
                    {session.guestName}
                  </h3>
                  
                  {/* Time Remaining - Very Prominent */}
                  <div className="mt-2">
                    {isExpired ? (
                      <span className="text-3xl font-bold">Session Ended!</span>
                    ) : minutesLeft < 1 ? (
                      <span className="text-3xl font-bold">
                        {secondsLeft} seconds remaining!
                      </span>
                    ) : (
                      <span className="text-2xl">
                        <span className="font-bold text-3xl">{minutesLeft}:{secondsLeft.toString().padStart(2, '0')}</span>
                        <span className="ml-2 opacity-90">remaining</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Session Info */}
                  <div className="flex items-center gap-3 mt-2 text-white/80">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{session.guestCount} {session.guestCount === 1 ? "guest" : "guests"}</span>
                    </div>
                    <span>•</span>
                    <span>{session.duration} min session</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-white/30">
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
