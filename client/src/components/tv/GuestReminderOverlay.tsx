import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Clock, Bell } from "lucide-react";

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

export function GuestReminderOverlay() {
  const [visibleReminders, setVisibleReminders] = useState<GuestSession[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  
  // Query for sessions needing reminder
  const { data: sessionsNeedingReminder } = trpc.guestSessions.getNeedingReminder.useQuery(undefined, {
    refetchInterval: 10000, // Check every 10 seconds
  });
  
  // Mutation to mark reminder as shown
  const markReminderMutation = trpc.guestSessions.markReminderShown.useMutation();
  
  // Update visible reminders when data changes
  useEffect(() => {
    if (sessionsNeedingReminder) {
      const newReminders = (sessionsNeedingReminder as GuestSession[]).filter(
        session => !dismissedIds.has(session.id)
      );
      setVisibleReminders(newReminders);
      
      // Mark reminders as shown in the database
      newReminders.forEach(session => {
        if (!session.reminderShown) {
          markReminderMutation.mutate({ id: session.id });
        }
      });
    }
  }, [sessionsNeedingReminder, dismissedIds]);
  
  // Auto-dismiss reminders after 30 seconds
  useEffect(() => {
    if (visibleReminders.length === 0) return;
    
    const timeout = setTimeout(() => {
      setDismissedIds(prev => {
        const newSet = new Set(prev);
        visibleReminders.forEach(r => newSet.add(r.id));
        return newSet;
      });
    }, 30000);
    
    return () => clearTimeout(timeout);
  }, [visibleReminders]);
  
  // Clear dismissed IDs periodically to allow re-showing if still in range
  useEffect(() => {
    const interval = setInterval(() => {
      setDismissedIds(new Set());
    }, 60000); // Clear every minute
    
    return () => clearInterval(interval);
  }, []);
  
  if (visibleReminders.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {visibleReminders.map((session) => {
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        const minutesLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 60000));
        
        return (
          <div
            key={session.id}
            className="animate-in slide-in-from-right duration-500 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 text-white">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium opacity-90">Time Reminder</span>
                  </div>
                  <h3 className="text-xl font-bold mt-1 truncate">
                    {session.guestName}
                  </h3>
                  <p className="text-white/90 mt-1">
                    {minutesLeft <= 1 ? (
                      <span className="font-bold">Less than 1 minute remaining!</span>
                    ) : (
                      <span><span className="font-bold">{minutesLeft} minutes</span> remaining</span>
                    )}
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    {session.guestCount} {session.guestCount === 1 ? "guest" : "guests"} • {session.duration} min session
                  </p>
                </div>
              </div>
            </div>
            {/* Animated progress bar */}
            <div className="h-1 bg-white/30">
              <div 
                className="h-full bg-white transition-all duration-1000"
                style={{ 
                  width: `${Math.max(0, Math.min(100, (minutesLeft / 5) * 100))}%` 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
