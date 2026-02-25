import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Ticket,
  CalendarClock,
  CircleDot,
  CircleCheck,
  CircleX,
  Footprints,
  Eye,
  Undo2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Baby,
  AlertTriangle,
  Package,
} from "lucide-react";

type GuestSession = {
  id: number;
  guestName: string;
  guestCount: number;
  duration: "15" | "30" | "60" | "90";
  status: "active" | "completed" | "extended";
  checkInAt: Date;
  expiresAt: Date;
  checkedOutAt: Date | null;
  notes: string | null;
  reminderShown: boolean;
  rollerBookingRef: string | null;
};

type RollerBookingEntry = {
  bookingId: number;
  bookingReference: string;
  customerName: string;
  customerId: number | null;
  productName: string;
  quantity: number;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
  bookingDate: string;
  status: "upcoming" | "checked_in" | "completed" | "expired";
  guestSessionId: number | null;
  total: number;
  bookingStatus: string;
  arrivedAt: string | null;
  markedByUserId: number | null;
};

type DateFilter = "today" | "tomorrow" | "week" | "month";

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

/**
 * Format a time string. Accepts either "HH:mm" or ISO datetime.
 */
function formatTime(timeStr: string | null): string {
  if (!timeStr) return "—";
  // If it's a simple HH:mm format (e.g. "11:00", "14:30")
  const hhmm = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    const h = parseInt(hhmm[1], 10);
    const m = hhmm[2];
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m} ${ampm}`;
  }
  // Otherwise try parsing as a date
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return timeStr;
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return "No time set";
  const startStr = formatTime(start);
  const endStr = end ? formatTime(end) : "";
  return endStr ? `${startStr} – ${endStr}` : startStr;
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

function BookingStatusBadge({ status }: { status: RollerBookingEntry["status"] }) {
  switch (status) {
    case "upcoming":
      return (
        <Badge variant="outline" className="text-xs gap-1 border-blue-300 text-blue-700 bg-blue-50">
          <CalendarClock className="w-3 h-3" />
          Upcoming
        </Badge>
      );
    case "checked_in":
      return (
        <Badge variant="outline" className="text-xs gap-1 border-green-300 text-green-700 bg-green-50">
          <CircleDot className="w-3 h-3" />
          Checked In
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="text-xs gap-1 border-gray-300 text-gray-600 bg-gray-50">
          <CircleCheck className="w-3 h-3" />
          Completed
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="outline" className="text-xs gap-1 border-red-300 text-red-600 bg-red-50">
          <CircleX className="w-3 h-3" />
          No Show
        </Badge>
      );
  }
}

// ============ SESSION TYPE BADGE ============
type SessionType = { label: string; shortLabel: string; duration: string; color: string; bg: string; border: string };

function getSessionType(productName: string): SessionType {
  const name = productName.toLowerCase();
  if (name.includes("mini") || name.includes("meow escape")) {
    return { label: "Mini Meow", shortLabel: "Mini", duration: "30m", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-300" };
  }
  if (name.includes("study")) {
    return { label: "Study Sesh", shortLabel: "Study", duration: "90m", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" };
  }
  // Default: Full Purr / Cat Lounge (60 min)
  return { label: "Full Purr", shortLabel: "Full", duration: "60m", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-300" };
}

function SessionTypeBadge({ productName, compact = false }: { productName: string; compact?: boolean }) {
  const st = getSessionType(productName);
  return (
    <Badge variant="outline" className={`text-[10px] sm:text-xs gap-1 ${st.border} ${st.color} ${st.bg} font-medium shrink-0`}>
      <Timer className="w-3 h-3" />
      {compact ? `${st.shortLabel} ${st.duration}` : `${st.label} (${st.duration})`}
    </Badge>
  );
}

const FILTER_LABELS: Record<DateFilter, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  week: "This Week",
  month: "This Month",
};

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  // Use PST for comparison
  const todayPST = today.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const tomorrowDate = new Date(todayPST + "T12:00:00");
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowPST = tomorrowDate.toISOString().split("T")[0];

  if (dateStr === todayPST) return "Today";
  if (dateStr === tomorrowPST) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ============ SYNC NOW BUTTON ============
function SyncNowButton({ onSynced }: { onSynced?: () => void }) {
  const syncMutation = trpc.roller.manualSync.useMutation({
    onSuccess: (data) => {
      const timeStr = data.lastPollTime
        ? new Date(data.lastPollTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" })
        : "just now";
      toast.success(`Roller synced! Last pull: ${timeStr}`);
      onSynced?.();
    },
    onError: (err) => {
      toast.error(err.message || "Sync failed");
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs gap-1.5 shrink-0"
      onClick={() => syncMutation.mutate()}
      disabled={syncMutation.isPending}
    >
      <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
      {syncMutation.isPending ? "Syncing..." : "Sync Now"}
    </Button>
  );
}

// ============ WAIVER STATUS BADGE ============
function WaiverBadge({ bookingRef }: { bookingRef: string }) {
  const waiverQuery = trpc.roller.getWaiverSummary.useQuery(
    { bookingRef },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );

  if (waiverQuery.isLoading) {
    return (
      <Badge variant="outline" className="text-[10px] gap-0.5 border-gray-200 text-gray-400 bg-gray-50/50 animate-pulse">
        <ShieldCheck className="w-3 h-3" />
        Waiver...
      </Badge>
    );
  }

  if (waiverQuery.isError || !waiverQuery.data) {
    return null; // Silently fail — don't block the card
  }

  const summary = waiverQuery.data;

  if (summary.overallStatus === "no_waivers" && summary.totalTickets === 0) {
    return null; // No ticket data available
  }

  // Format expiry date nicely
  const formatExpiry = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Build tooltip content
  const tooltipLines: string[] = [];
  if (summary.waiverStatuses.length > 0) {
    for (const w of summary.waiverStatuses) {
      const statusLabel = w.status === "valid" ? "✅" : w.status === "expiring_soon" ? "⚠️" : w.status === "expired" ? "❌" : "❓";
      const minorLabel = w.isForMinor ? " (Minor)" : "";
      tooltipLines.push(`${statusLabel} ${w.firstName}${minorLabel} — expires ${formatExpiry(w.expiryDate)}`);
    }
  }
  if (summary.missingWaiverCount > 0) {
    tooltipLines.push(`⚠️ ${summary.missingWaiverCount} guest(s) missing waiver`);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1 flex-wrap">
        {/* Main waiver status badge */}
        {summary.overallStatus === "all_valid" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-0.5 border-green-300 text-green-700 bg-green-50 cursor-help">
                <ShieldCheck className="w-3 h-3" />
                Waiver ✓
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs whitespace-pre-line">
              {tooltipLines.length > 0 ? tooltipLines.join("\n") : "All waivers valid"}
            </TooltipContent>
          </Tooltip>
        )}

        {summary.overallStatus === "has_issues" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-0.5 border-red-300 text-red-700 bg-red-50 cursor-help">
                <ShieldX className="w-3 h-3" />
                Waiver Issue
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs whitespace-pre-line">
              {tooltipLines.length > 0 ? tooltipLines.join("\n") : "Waiver issues detected"}
            </TooltipContent>
          </Tooltip>
        )}

        {summary.overallStatus === "no_waivers" && summary.totalTickets > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-0.5 border-amber-300 text-amber-700 bg-amber-50 cursor-help">
                <ShieldAlert className="w-3 h-3" />
                No Waiver
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              No signed waivers found for {summary.totalTickets} ticket(s)
            </TooltipContent>
          </Tooltip>
        )}

        {/* Expiring soon warning */}
        {summary.hasExpiringSoon && summary.overallStatus !== "has_issues" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-0.5 border-amber-300 text-amber-700 bg-amber-50 cursor-help">
                <AlertTriangle className="w-3 h-3" />
                Expiring
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs whitespace-pre-line">
              {summary.waiverStatuses
                .filter(w => w.isExpiringSoon)
                .map(w => `${w.firstName}'s waiver expires ${formatExpiry(w.expiryDate)}`)
                .join("\n")}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Minor detection */}
        {summary.hasMinors && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-0.5 border-purple-300 text-purple-700 bg-purple-50 cursor-help">
                <Baby className="w-3 h-3" />
                Minor
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs whitespace-pre-line">
              {summary.waiverStatuses
                .filter(w => w.isForMinor)
                .map(w => {
                  const parentWaiver = w.parentSignedWaiverId
                    ? summary.waiverStatuses.find(p => p.signedWaiverId === w.parentSignedWaiverId)
                    : null;
                  return `${w.firstName} is a minor${parentWaiver ? ` (guardian: ${parentWaiver.firstName})` : ""}`;
                })
                .join("\n")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// ============ ADD-ON BADGES ============
function AddOnBadges({ bookingRef }: { bookingRef: string }) {
  const addOnsQuery = trpc.roller.getBookingAddOns.useQuery(
    { bookingRef },
    { staleTime: 10 * 60 * 1000, refetchOnWindowFocus: false }
  );

  if (addOnsQuery.isLoading || addOnsQuery.isError || !addOnsQuery.data) {
    return null;
  }

  const addOns = addOnsQuery.data;
  if (addOns.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1 flex-wrap">
        {addOns.map((addOn, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="text-[10px] gap-0.5 border-teal-300 text-teal-700 bg-teal-50 cursor-help"
              >
                <Package className="w-3 h-3" />
                {addOn.productName || `Add-on`}
                {addOn.quantity > 1 && ` x${addOn.quantity}`}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {addOn.productName || `Product #${addOn.productId}`}
              {addOn.quantity > 1 ? ` (qty: ${addOn.quantity})` : ""}
              {addOn.cost > 0 ? ` — $${addOn.cost.toFixed(2)}` : ""}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

// ============ BOOKING TIMELINE ============
function parseHHMM(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

type TimelineActions = {
  bookings: RollerBookingEntry[];
  onBlockClick?: (bookingRef: string) => void;
  onMarkArrived?: (booking: RollerBookingEntry) => void;
  onUnmarkArrived?: (booking: RollerBookingEntry) => void;
  isMarkingArrived?: string | null; // bookingRef currently being marked
  isUnmarking?: string | null; // bookingRef currently being unmarked
};

function BookingTimeline({ bookings, onBlockClick, onMarkArrived, onUnmarkArrived, isMarkingArrived, isUnmarking }: TimelineActions) {
  const [, setTick] = useState(0);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Update every 30 seconds for the "now" line
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Fixed timeline range: 8 AM – 8 PM (operating hours)
  const timelineStartMin = 8 * 60;  // 8:00 AM = 480 min
  const timelineEndMin = 20 * 60;   // 8:00 PM = 1200 min
  const totalMinutes = timelineEndMin - timelineStartMin; // 720 min

  // Current time in PST
  const now = new Date();
  const pstStr = now.toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour12: false, hour: "2-digit", minute: "2-digit" });
  const nowMinutes = parseHHMM(pstStr);
  const nowPercent = nowMinutes !== null ? ((nowMinutes - timelineStartMin) / totalMinutes) * 100 : null;
  const isNowVisible = nowPercent !== null && nowPercent >= 0 && nowPercent <= 100;

  // Generate hour labels
  const hourLabels: { label: string; percent: number }[] = [];
  for (let m = timelineStartMin; m <= timelineEndMin; m += 60) {
    const h = m / 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    hourLabels.push({
      label: `${h12}${ampm}`,
      percent: ((m - timelineStartMin) / totalMinutes) * 100,
    });
  }

  // Build booking rows (stack overlapping bookings)
  type TimelineBlock = {
    booking: RollerBookingEntry;
    startPct: number;
    widthPct: number;
  };

  const rows: TimelineBlock[][] = [];
  const sortedBookings = [...bookings]
    .filter(b => b.sessionStartTime && b.sessionEndTime)
    .sort((a, b) => (parseHHMM(a.sessionStartTime) || 0) - (parseHHMM(b.sessionStartTime) || 0));

  for (const booking of sortedBookings) {
    const startMin = parseHHMM(booking.sessionStartTime)!;
    const endMin = parseHHMM(booking.sessionEndTime)!;
    const startPct = ((startMin - timelineStartMin) / totalMinutes) * 100;
    const widthPct = ((endMin - startMin) / totalMinutes) * 100;
    const block: TimelineBlock = { booking, startPct, widthPct };

    // Find a row where this block doesn't overlap
    let placed = false;
    for (const row of rows) {
      const lastBlock = row[row.length - 1];
      if (lastBlock.startPct + lastBlock.widthPct <= startPct + 0.5) {
        row.push(block);
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows.push([block]);
    }
  }

  function getBlockColor(booking: RollerBookingEntry): string {
    if (booking.arrivedAt) return "bg-green-500/90 border-green-600";
    if (booking.status === "completed") return "bg-gray-300/80 border-gray-400";
    if (booking.status === "expired") return "bg-red-300/80 border-red-400";
    // Color by session type for upcoming/checked_in
    const st = getSessionType(booking.productName);
    if (st.duration === "30m") return "bg-violet-400/80 border-violet-500"; // Mini Meow
    if (st.duration === "90m") return "bg-amber-400/80 border-amber-500"; // Study Sesh
    return "bg-sky-400/80 border-sky-500"; // Full Purr (60m)
    // Legacy fallback:
    switch (booking.status) {
      case "upcoming": return "bg-blue-400/80 border-blue-500";
      case "checked_in": return "bg-green-400/80 border-green-500";
      case "completed": return "bg-gray-300/80 border-gray-400";
      case "expired": return "bg-red-300/60 border-red-400";
      default: return "bg-gray-300/80 border-gray-400";
    }
  }

  // Auto-scroll to current time
  useEffect(() => {
    if (isNowVisible && timelineRef.current) {
      const container = timelineRef.current;
      const scrollTarget = (nowPercent! / 100) * container.scrollWidth - container.clientWidth / 2;
      container.scrollLeft = Math.max(0, scrollTarget);
    }
  }, [isNowVisible, nowPercent]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Today's Timeline</span>
          {isNowVisible && (
            <Badge variant="outline" className="text-[10px] gap-1 border-red-300 text-red-600 bg-red-50 ml-auto">
              <CircleDot className="w-2.5 h-2.5 animate-pulse" />
              Now: {formatTime(pstStr)}
            </Badge>
          )}
        </div>
        <div ref={timelineRef} className="overflow-x-auto">
          <div className="relative pl-4 pr-4" style={{ minWidth: Math.max(400, totalMinutes * 2 + 32) + "px" }}>
            {/* Hour grid lines and labels */}
            <div className="relative h-5 mb-1">
              {hourLabels.map((h, i) => (
                <div
                  key={i}
                  className="absolute text-[10px] text-muted-foreground font-medium"
                  style={{
                    left: `${h.percent}%`,
                    transform: i === 0 ? "none" : i === hourLabels.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
                  }}
                >
                  {h.label}
                </div>
              ))}
            </div>

            {/* Timeline body */}
            <div className="relative bg-muted/30 rounded-lg border" style={{ minHeight: rows.length * 32 + 8 + "px" }}>
              {/* Hour grid lines */}
              {hourLabels.map((h, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-dashed border-muted-foreground/15"
                  style={{ left: `${h.percent}%` }}
                />
              ))}

               {/* Booking blocks with popovers */}
              {rows.map((row, rowIdx) =>
                row.map((block) => {
                  const bk = block.booking;
                  const isArrived = !!bk.arrivedAt;
                  const isPast = bk.status === "completed" || bk.status === "expired";
                  const canMarkArrived = !isArrived && !isPast && !!bk.bookingId;
                  const canUndo = isArrived && !isPast && !!bk.bookingId;
                  const isOpen = openPopover === bk.bookingReference;

                  return (
                    <Popover
                      key={bk.bookingReference}
                      open={isOpen}
                      onOpenChange={(open) => setOpenPopover(open ? bk.bookingReference : null)}
                    >
                      <PopoverTrigger asChild>
                        <div
                          className={`absolute rounded-md border text-white text-[10px] font-medium px-1.5 py-0.5 truncate cursor-pointer transition-all hover:brightness-110 hover:shadow-md hover:scale-[1.03] hover:z-20 active:scale-[0.98] ${getBlockColor(bk)} ${isOpen ? "ring-2 ring-white/60 shadow-lg z-30 scale-[1.05]" : ""}`}
                          style={{
                            left: `${block.startPct}%`,
                            width: `${Math.max(block.widthPct, 2)}%`,
                            top: rowIdx * 32 + 4 + "px",
                            height: "26px",
                            lineHeight: "16px",
                          }}
                        >
                          <span className="flex items-center gap-1">
                            {isArrived && <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />}
                            {bk.customerName}
                            {bk.quantity > 1 && (
                              <span className="opacity-75">({bk.quantity})</span>
                            )}
                          </span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        align="center"
                        sideOffset={8}
                        className="w-56 p-0 overflow-hidden"
                      >
                        {/* Popover header */}
                        <div className={`px-3 py-2 border-b ${
                          isArrived ? "bg-green-50" :
                          bk.status === "upcoming" ? "bg-blue-50" :
                          bk.status === "completed" ? "bg-gray-50" :
                          "bg-muted/30"
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-sm truncate">{bk.customerName}</h4>
                            <BookingStatusBadge status={bk.status} />
                          </div>
                        </div>
                        {/* Popover details */}
                        <div className="px-3 py-2 space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{formatTimeRange(bk.sessionStartTime, bk.sessionEndTime)}</span>
                          </div>
                          <SessionTypeBadge productName={bk.productName} compact />
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 shrink-0" />
                            <span>{bk.quantity} {bk.quantity === 1 ? "guest" : "guests"}</span>
                          </div>
                          {isArrived && bk.arrivedAt && (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>Arrived at {new Date(bk.arrivedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" })}</span>
                            </div>
                          )}
                          {/* Waiver status */}
                           <WaiverBadge bookingRef={bk.bookingReference} />
                           {/* Add-ons */}
                           <AddOnBadges bookingRef={bk.bookingReference} />
                         </div>
                         {/* Popover actions */}
                        <div className="px-3 py-2 border-t bg-muted/20 flex flex-col gap-1.5">
                          {canMarkArrived && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs gap-1.5 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                              onClick={() => {
                                onMarkArrived?.(bk);
                                setOpenPopover(null);
                              }}
                              disabled={isMarkingArrived === bk.bookingReference}
                            >
                              {isMarkingArrived === bk.bookingReference ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Footprints className="w-3 h-3" />
                              )}
                              Mark Arrived
                            </Button>
                          )}
                          {canUndo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-red-600"
                              onClick={() => {
                                onUnmarkArrived?.(bk);
                                setOpenPopover(null);
                              }}
                              disabled={isUnmarking === bk.bookingReference}
                            >
                              {isUnmarking === bk.bookingReference ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Undo2 className="w-3 h-3" />
                              )}
                              Undo Arrival
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs gap-1.5"
                            onClick={() => {
                              setOpenPopover(null);
                              onBlockClick?.(bk.bookingReference);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                            View Details
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })
              )}

              {/* Now indicator */}
              {isNowVisible && (
                <div
                  className="absolute top-0 bottom-0 z-10"
                  style={{ left: `${nowPercent}%` }}
                >
                  <div className="w-0.5 h-full bg-red-500 relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-400/80" />
                Upcoming
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-green-500/90" />
                Arrived
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-300/80" />
                Completed
              </span>
              <span className="flex items-center gap-1">
                <div className="w-0.5 h-3 bg-red-500" />
                Now
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ ROLLER BOOKINGS SECTION ============
function RollerBookingsSection() {
  const [filter, setFilter] = useState<DateFilter>("today");
  const [markingRef, setMarkingRef] = useState<string | null>(null);
  const [unmarkingRef, setUnmarkingRef] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const bookingsQuery = trpc.roller.getTodayBookings.useQuery(
    { filter },
    { refetchInterval: filter === "today" ? 30000 : 60000 }
  );

  const markArrivedMutation = trpc.roller.markArrived.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Marked as arrived from timeline!`);
      utils.roller.getTodayBookings.invalidate();
      utils.guestSessions.getAll.invalidate();
      setMarkingRef(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark as arrived");
      setMarkingRef(null);
    },
  });

  const unmarkArrivedMutation = trpc.roller.unmarkArrived.useMutation({
    onSuccess: () => {
      toast.success(`Arrival undone from timeline`);
      utils.roller.getTodayBookings.invalidate();
      utils.guestSessions.getAll.invalidate();
      setUnmarkingRef(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to undo arrival");
      setUnmarkingRef(null);
    },
  });

  const handleTimelineMarkArrived = useCallback((booking: RollerBookingEntry) => {
    if (!booking.bookingId) return;
    setMarkingRef(booking.bookingReference);
    markArrivedMutation.mutate({
      bookingId: booking.bookingId,
      bookingRef: booking.bookingReference,
      guestName: booking.customerName,
      partySize: booking.quantity,
      startTime: booking.sessionStartTime || undefined,
      endTime: booking.sessionEndTime || undefined,
      productName: booking.productName,
    });
  }, [markArrivedMutation]);

  const handleTimelineUnmarkArrived = useCallback((booking: RollerBookingEntry) => {
    if (!booking.bookingId) return;
    setUnmarkingRef(booking.bookingReference);
    unmarkArrivedMutation.mutate({
      bookingId: booking.bookingId,
      bookingRef: booking.bookingReference,
    });
  }, [unmarkArrivedMutation]);

  const scrollToCard = useCallback((bookingRef: string) => {
    const card = document.querySelector(`[data-booking-ref="${bookingRef}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("ring-2", "ring-orange-400", "ring-offset-2", "transition-all");
      setTimeout(() => {
        card.classList.remove("ring-2", "ring-orange-400", "ring-offset-2");
      }, 2000);
    }
  }, []);

  const bookings = (bookingsQuery.data || []) as RollerBookingEntry[];
  const upcomingCount = bookings.filter(b => b.status === "upcoming").length;
  const checkedInCount = bookings.filter(b => b.status === "checked_in").length;
  const totalGuests = bookings.reduce((sum, b) => sum + (b.quantity || 1), 0);

  // Group bookings by date for multi-day views
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, RollerBookingEntry[]>();
    for (const b of bookings) {
      const date = b.bookingDate || "unknown";
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(b);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [bookings]);

  const showDateHeaders = filter === "week" || filter === "month";

  return (
    <div className="space-y-3">
      {/* Date filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(["today", "tomorrow", "week", "month"] as DateFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className={`h-7 text-xs px-3 shrink-0 rounded-full ${
              filter === f ? "" : "bg-transparent"
            }`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]}
          </Button>
        ))}
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm sm:text-base">
            {bookings.length} {bookings.length === 1 ? "Booking" : "Bookings"}
          </h3>
          {bookings.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {totalGuests} guests
              </span>
              {filter === "today" && upcomingCount > 0 && (
                <span className="flex items-center gap-1">
                  <CalendarClock className="w-3 h-3 text-blue-500" />
                  {upcomingCount} upcoming
                </span>
              )}
              {filter === "today" && checkedInCount > 0 && (
                <span className="flex items-center gap-1">
                  <CircleDot className="w-3 h-3 text-green-500" />
                  {checkedInCount} active
                </span>
              )}
            </div>
          )}
        </div>
        <SyncNowButton onSynced={() => bookingsQuery.refetch()} />
      </div>

      {/* Timeline (only for Today filter) */}
      {filter === "today" && bookings.length > 0 && !bookingsQuery.isLoading && (
        <BookingTimeline 
          bookings={bookings} 
          onBlockClick={scrollToCard}
          onMarkArrived={handleTimelineMarkArrived}
          onUnmarkArrived={handleTimelineUnmarkArrived}
          isMarkingArrived={markingRef}
          isUnmarking={unmarkingRef}
        />
      )}

      {bookingsQuery.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : bookingsQuery.isError ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-red-400" />
            <p className="text-sm">Could not load Roller bookings</p>
            <p className="text-xs mt-1">Check Roller connection in Settings</p>
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bookings {filter === "today" ? "for today" : filter === "tomorrow" ? "for tomorrow" : `this ${filter}`}</p>
          </CardContent>
        </Card>
      ) : showDateHeaders ? (
        <div className="space-y-4">
          {groupedByDate.map(([date, dateBookings]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {formatDateLabel(date)}
                </h4>
                <Badge variant="secondary" className="text-[10px]">
                  {dateBookings.length} {dateBookings.length === 1 ? "booking" : "bookings"} · {dateBookings.reduce((s, b) => s + (b.quantity || 1), 0)} guests
                </Badge>
              </div>
              {dateBookings.map((booking) => (
                <BookingCard key={booking.bookingReference} booking={booking} showDate={false} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <BookingCard key={booking.bookingReference} booking={booking} showDate={false} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, showDate }: { booking: RollerBookingEntry; showDate: boolean }) {
  const utils = trpc.useUtils();
  const markArrivedMutation = trpc.roller.markArrived.useMutation({
    onSuccess: () => {
      toast.success(`${booking.customerName} marked as arrived! Session started.`);
      utils.roller.getTodayBookings.invalidate();
      utils.guestSessions.getAll.invalidate(); // Refresh Walk-Ins tab too
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark as arrived");
    },
  });
  const unmarkArrivedMutation = trpc.roller.unmarkArrived.useMutation({
    onSuccess: () => {
      toast.success(`Arrival undone for ${booking.customerName}`);
      utils.roller.getTodayBookings.invalidate();
      utils.guestSessions.getAll.invalidate(); // Refresh Walk-Ins tab too
    },
    onError: (err) => {
      toast.error(err.message || "Failed to undo arrival");
    },
  });

  const isArrived = !!booking.arrivedAt;
  const isPast = booking.status === "completed" || booking.status === "expired";

  function handleMarkArrived() {
    if (!booking.bookingId) return;
    markArrivedMutation.mutate({
      bookingId: booking.bookingId,
      bookingRef: booking.bookingReference,
      guestName: booking.customerName,
      partySize: booking.quantity,
      startTime: booking.sessionStartTime || undefined,
      endTime: booking.sessionEndTime || undefined,
      productName: booking.productName,
    });
  }

  function handleUnmarkArrived() {
    if (!booking.bookingId) return;
    unmarkArrivedMutation.mutate({ 
      bookingId: booking.bookingId,
      bookingRef: booking.bookingReference,
    });
  }

  return (
    <Card 
      data-booking-ref={booking.bookingReference}
      className={
        isArrived ? "border-green-300 bg-green-50/40" :
        booking.status === "checked_in" ? "border-green-200 bg-green-50/30" :
        booking.status === "upcoming" ? "border-blue-200 bg-blue-50/20" :
        booking.status === "expired" ? "border-red-200 bg-red-50/20 opacity-60" :
        "opacity-50"
      }
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-semibold text-sm sm:text-base truncate">
                {booking.customerName}
              </h4>
              {booking.quantity > 1 && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                  {booking.quantity} {booking.quantity === 1 ? "guest" : "guests"}
                </Badge>
              )}
              {isArrived && (
                <Badge variant="outline" className="text-[10px] sm:text-xs gap-0.5 border-green-400 text-green-700 bg-green-100">
                  <CheckCircle2 className="w-3 h-3" />
                  Arrived
                </Badge>
              )}
              <WaiverBadge bookingRef={booking.bookingReference} />
              <AddOnBadges bookingRef={booking.bookingReference} />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeRange(booking.sessionStartTime, booking.sessionEndTime)}
              </span>
              <SessionTypeBadge productName={booking.productName} />
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] sm:text-xs text-muted-foreground">
              <span>Ref: {booking.bookingReference}</span>
              {showDate && booking.bookingDate && (
                <span>· {formatDateLabel(booking.bookingDate)}</span>
              )}
              {isArrived && booking.arrivedAt && (
                <span className="text-green-600">
                  · Arrived at {new Date(booking.arrivedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" })}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <BookingStatusBadge status={booking.status} />
            {!isArrived && !isPast && booking.bookingId && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                onClick={handleMarkArrived}
                disabled={markArrivedMutation.isPending}
              >
                {markArrivedMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Footprints className="w-3 h-3" />
                )}
                Mark Arrived
              </Button>
            )}
            {isArrived && !isPast && booking.bookingId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] text-muted-foreground hover:text-red-600"
                onClick={handleUnmarkArrived}
                disabled={unmarkArrivedMutation.isPending}
              >
                {unmarkArrivedMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Undo"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ WALK-INS SECTION ============
function WalkInsSection() {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [duration, setDuration] = useState<"15" | "30" | "60" | "90">("30");
  const [notes, setNotes] = useState("");
  const [, setTick] = useState(0);
  const warnedSessionIds = useRef<Set<number>>(new Set());
  const expiredSessionIds = useRef<Set<number>>(new Set());
  
  const utils = trpc.useUtils();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(granted => {
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

  const allActiveSessions = useMemo(() => (activeSessionsQuery.data || []) as GuestSession[], [activeSessionsQuery.data]);
  
  // Split sessions: walk-ins (no rollerBookingRef) vs roller (has rollerBookingRef)
  const walkInSessions = useMemo(() => allActiveSessions.filter(s => !s.rollerBookingRef), [allActiveSessions]);
  const rollerSessions = useMemo(() => allActiveSessions.filter(s => !!s.rollerBookingRef), [allActiveSessions]);
  
  const stats = todayStatsQuery.data || { totalGuests: 0, activeSessions: 0, completedSessions: 0 };

  // Play chime when sessions hit 5-minute warning or expire
  useEffect(() => {
    if (!allActiveSessions.length) return;
    const now = Date.now();
    
    for (const session of allActiveSessions) {
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
    const activeIds = new Set(allActiveSessions.map((s: GuestSession) => s.id));
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

  const renderSessionCard = (session: GuestSession, isRoller: boolean) => {
    const now = Date.now();
    const checkInTime = new Date(session.checkInAt).getTime();
    const expiresTime = new Date(session.expiresAt).getTime();
    // For Roller guests: session hasn't started yet if checkInAt is in the future
    const isNotStarted = isRoller && checkInTime > now;
    const timeRemaining = isNotStarted
      ? `Starts ${new Date(session.checkInAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" })}`
      : formatTimeRemaining(new Date(session.expiresAt));
    const isExpired = !isNotStarted && expiresTime <= now;
    const isWarning = !isNotStarted && !isExpired && expiresTime - now <= 5 * 60 * 1000;
    
    return (
      <Card key={session.id} className={isExpired ? "border-red-300" : isWarning ? "border-amber-300" : ""}>
        <CardContent className="p-3 sm:p-4">
          {/* Top row: name + timer */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-semibold text-sm sm:text-base truncate">{session.guestName}</h4>
                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                  {session.guestCount} {session.guestCount === 1 ? "guest" : "guests"}
                </Badge>
                {isRoller && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs text-orange-600 border-orange-300 shrink-0">
                    <Ticket className="w-2.5 h-2.5 mr-0.5" />
                    Roller
                  </Badge>
                )}
                {session.status === "extended" && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs text-blue-600 shrink-0">
                    Extended
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {session.duration} min
                </span>
              </div>
              {session.notes && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 italic line-clamp-1">
                  {session.notes}
                </p>
              )}
            </div>
            
            <div className="shrink-0">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                isNotStarted ? "bg-blue-50 text-blue-700" : getStatusColor(session)
              }`}>
                {isNotStarted ? (
                  <CalendarClock className="w-3 h-3" />
                ) : isExpired ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <Timer className="w-3 h-3" />
                )}
                {timeRemaining}
              </div>
            </div>
          </div>
          
          {/* Action buttons - responsive grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => handleExtend(session.id, 15)}
              disabled={extendMutation.isPending}
            >
              <Plus className="w-3 h-3 mr-0.5 sm:mr-1 shrink-0" />
              15m
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => handleExtend(session.id, 30)}
              disabled={extendMutation.isPending}
            >
              <Plus className="w-3 h-3 mr-0.5 sm:mr-1 shrink-0" />
              30m
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-9 text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => handleCheckOut(session.id)}
              disabled={checkOutMutation.isPending}
            >
              <LogOut className="w-3 h-3 mr-0.5 sm:mr-1 shrink-0" />
              Out
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Stats - responsive grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Today</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.totalGuests}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Active</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.activeSessions}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Done</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.completedSessions}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">sessions</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Walk-In Check In Button */}
      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" size="lg">
            <UserPlus className="w-5 h-5 mr-2" />
            Walk-In Check In
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Walk-In Check In</DialogTitle>
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
                className="h-11"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="guestCount">Party Size</Label>
                <Select value={guestCount} onValueChange={setGuestCount}>
                  <SelectTrigger className="h-11">
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
                <Select value={duration} onValueChange={(v) => setDuration(v as "15" | "30" | "60" | "90")}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
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
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="h-11">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
              className="h-11"
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
      
      {/* Active Sessions - Combined (Roller + Walk-ins) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base">Active Sessions</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => utils.guestSessions.getActive.invalidate()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        {activeSessionsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : allActiveSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active sessions</p>
              <p className="text-sm">Check in a guest or wait for Roller auto-check-in</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {/* Roller sessions first */}
            {rollerSessions.map((session) => renderSessionCard(session, true))}
            {/* Walk-in sessions */}
            {walkInSessions.map((session) => renderSessionCard(session, false))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ DAILY SUMMARY BAR ============
function DailySummaryBar() {
  // Fetch today's Roller bookings
  const rollerQuery = trpc.roller.getTodayBookings.useQuery(
    { filter: "today" as DateFilter },
    { refetchInterval: 30000 }
  );
  // Fetch today's Walk-In stats
  const statsQuery = trpc.guestSessions.getTodayStats.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const rollerBookings = (rollerQuery.data || []) as RollerBookingEntry[];
  const rollerGuestCount = rollerBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const rollerBookingCount = rollerBookings.length;
  const rollerArrivedCount = rollerBookings.filter(b => b.arrivedAt).length;

  const walkInStats = statsQuery.data || { totalGuests: 0, activeSessions: 0, completedSessions: 0 };

  const totalGuestsToday = rollerGuestCount + walkInStats.totalGuests;
  const activeSessions = walkInStats.activeSessions;

  const isLoading = rollerQuery.isLoading || statsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="h-4 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-7 w-10 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Total Guests Today */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="text-[10px] sm:text-xs text-orange-700/70 truncate">Total</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-orange-900 mt-1">{totalGuestsToday}</p>
          <p className="text-[10px] sm:text-xs text-orange-700/60">guests today</p>
        </CardContent>
      </Card>

      {/* Roller Bookings */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Roller</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{rollerGuestCount}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {rollerBookingCount} booking{rollerBookingCount !== 1 ? "s" : ""}
            {rollerArrivedCount > 0 && (
              <span className="text-green-600"> · {rollerArrivedCount} arrived</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Walk-Ins */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Walk-Ins</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{walkInStats.totalGuests}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {walkInStats.completedSessions} done
          </p>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">Active</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{activeSessions}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">sessions now</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export function GuestCheckIn() {
  return (
    <div className="space-y-4">
      {/* Daily Summary */}
      <DailySummaryBar />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="gap-1.5">
            <Ticket className="w-3.5 h-3.5" />
            <span>Roller Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="walkins" className="gap-1.5">
            <Footprints className="w-3.5 h-3.5" />
            <span>Walk-Ins</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <RollerBookingsSection />
        </TabsContent>
        
        <TabsContent value="walkins" className="mt-4">
          <WalkInsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
