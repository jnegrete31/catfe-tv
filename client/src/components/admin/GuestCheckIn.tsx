import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { playWelcomeChime, playReminderChime } from "@/lib/chime";
import { requestNotificationPermission, notifySessionWarning, notifySessionExpired, notifyGuestCheckIn } from "@/lib/notifications";
import { 
  UserPlus, 
  Clock, 
  Users, 
  LogOut, 
  Plus, 
  Timer,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

type GuestSession = {
  id: number;
  guestName: string;
  guestCount: number;
  duration: "15" | "30" | "60";
  status: "active" | "completed" | "extended";
  checkInAt: Date;
  expiresAt: Date;
  checkedOutAt: Date | null;
  notes: string | null;
  reminderShown: boolean;
};

function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function getStatusColor(session: GuestSession): string {
  const now = new Date();
  const timeLeft = session.expiresAt.getTime() - now.getTime();
  
  if (session.status === "completed") return "bg-gray-100 text-gray-600";
  if (timeLeft <= 0) return "bg-red-100 text-red-700";
  if (timeLeft <= 5 * 60 * 1000) return "bg-amber-100 text-amber-700";
  if (session.status === "extended") return "bg-blue-100 text-blue-700";
  return "bg-green-100 text-green-700";
}

export function GuestCheckIn() {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [duration, setDuration] = useState<"15" | "30" | "60">("30");
  const [notes, setNotes] = useState("");
  const [, setTick] = useState(0);
  const warnedSessionIds = useRef<Set<number>>(new Set());
  const expiredSessionIds = useRef<Set<number>>(new Set());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const utils = trpc.useUtils();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(granted => {
      setNotificationsEnabled(granted);
      if (granted) {
        console.log("[Notifications] Desktop notifications enabled");
      }
    });
  }, []);
  
  const activeSessionsQuery = trpc.guestSessions.getActive.useQuery(undefined, {
    refetchInterval: 10000,
  });
  
  const todayStatsQuery = trpc.guestSessions.getTodayStats.useQuery();
  
  const checkInMutation = trpc.guestSessions.checkIn.useMutation({
    onSuccess: (_, variables) => {
      playWelcomeChime(0.4);
      notifyGuestCheckIn(variables.guestName, variables.guestCount ?? 1, variables.duration);
      toast.success("Guest checked in successfully!");
      setIsCheckInOpen(false);
      resetForm();
      utils.guestSessions.getActive.invalidate();
      utils.guestSessions.getTodayStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to check in: ${error.message}`);
    },
  });
  
  const checkOutMutation = trpc.guestSessions.checkOut.useMutation({
    onSuccess: () => {
      toast.success("Guest checked out successfully!");
      utils.guestSessions.getActive.invalidate();
      utils.guestSessions.getTodayStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to check out: ${error.message}`);
    },
  });
  
  const extendMutation = trpc.guestSessions.extend.useMutation({
    onSuccess: () => {
      toast.success("Session extended!");
      utils.guestSessions.getActive.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to extend: ${error.message}`);
    },
  });
  
  // Tick every second to update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Play chime when sessions hit 5-minute warning or expire
  useEffect(() => {
    if (!activeSessions.length) return;
    const now = Date.now();
    
    for (const session of activeSessions) {
      const msLeft = new Date(session.expiresAt).getTime() - now;
      
      // 5-minute warning chime + desktop notification
      if (msLeft > 0 && msLeft <= 5 * 60 * 1000 && !warnedSessionIds.current.has(session.id)) {
        warnedSessionIds.current.add(session.id);
        playReminderChime(0.35);
        notifySessionWarning(session.guestName, Math.ceil(msLeft / 60000));
        toast.warning(`${session.guestName}'s session ends in ${Math.ceil(msLeft / 60000)} minutes!`, {
          duration: 8000,
          icon: "⏰",
        });
      }
      
      // Expired chime + desktop notification
      if (msLeft <= 0 && !expiredSessionIds.current.has(session.id)) {
        expiredSessionIds.current.add(session.id);
        playReminderChime(0.4);
        notifySessionExpired(session.guestName);
        toast.error(`${session.guestName}'s session has expired!`, {
          duration: 10000,
          icon: "🔔",
        });
      }
    }
    
    // Clean up IDs for sessions no longer in the list
    const activeIds = new Set(activeSessions.map((s: GuestSession) => s.id));
    Array.from(warnedSessionIds.current).forEach(id => {
      if (!activeIds.has(id)) warnedSessionIds.current.delete(id);
    });
    Array.from(expiredSessionIds.current).forEach(id => {
      if (!activeIds.has(id)) expiredSessionIds.current.delete(id);
    });
  });
  
  const resetForm = () => {
    setGuestName("");
    setGuestCount("1");
    setDuration("30");
    setNotes("");
  };
  
  const handleCheckIn = () => {
    if (!guestName.trim()) {
      toast.error("Please enter a guest name");
      return;
    }
    
    checkInMutation.mutate({
      guestName: guestName.trim(),
      guestCount: parseInt(guestCount),
      duration,
      notes: notes.trim() || null,
    });
  };
  
  const handleCheckOut = (id: number) => {
    checkOutMutation.mutate({ id });
  };
  
  const handleExtend = (id: number, minutes: number) => {
    extendMutation.mutate({ id, additionalMinutes: minutes });
  };
  
  const activeSessions = useMemo(() => (activeSessionsQuery.data || []) as GuestSession[], [activeSessionsQuery.data]);
  const stats = todayStatsQuery.data || { totalGuests: 0, activeSessions: 0, completedSessions: 0 };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalGuests}</p>
            <p className="text-xs text-muted-foreground">guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.activeSessions}</p>
            <p className="text-xs text-muted-foreground">sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Done</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.completedSessions}</p>
            <p className="text-xs text-muted-foreground">sessions</p>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" size="lg">
            <UserPlus className="w-5 h-5 mr-2" />
            Check In Guest
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                placeholder="Enter guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestCount">Party Size</Label>
                <Select value={guestCount} onValueChange={setGuestCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={(v) => setDuration(v as "15" | "30" | "60")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Active Sessions</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => utils.guestSessions.getActive.invalidate()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        {activeSessionsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active sessions</p>
              <p className="text-sm">Check in a guest to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeSessions.map((session: GuestSession) => {
              const timeRemaining = formatTimeRemaining(new Date(session.expiresAt));
              const isExpired = new Date(session.expiresAt).getTime() <= Date.now();
              const isWarning = !isExpired && new Date(session.expiresAt).getTime() - Date.now() <= 5 * 60 * 1000;
              
              return (
                <Card key={session.id} className={isExpired ? "border-red-300" : isWarning ? "border-amber-300" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{session.guestName}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {session.guestCount} {session.guestCount === 1 ? "guest" : "guests"}
                          </Badge>
                          {session.status === "extended" && (
                            <Badge variant="outline" className="text-xs text-blue-600">
                              Extended
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.duration} min session
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            {session.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(session)}`}>
                          {isExpired ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Timer className="w-3 h-3" />
                          )}
                          {timeRemaining}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleExtend(session.id, 15)}
                        disabled={extendMutation.isPending}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        +15 min
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleExtend(session.id, 30)}
                        disabled={extendMutation.isPending}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        +30 min
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCheckOut(session.id)}
                        disabled={checkOutMutation.isPending}
                      >
                        <LogOut className="w-3 h-3 mr-1" />
                        Check Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
