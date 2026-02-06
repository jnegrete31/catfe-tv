import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DAYS_OF_WEEK, SCREEN_TYPE_CONFIG } from "@shared/types";
import type { Playlist, Screen } from "@shared/types";
import { Calendar, Clock, ChevronLeft, ChevronRight, ListMusic, Tv } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIMELINE_HEIGHT = 48; // px per row

// Predefined playlist colors
const PLAYLIST_COLORS = [
  "#C2884E", // Catfé brown
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
];

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function timeToPercent(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * 100;
}

interface TimeBlock {
  id: number;
  name: string;
  color: string;
  startPercent: number;
  endPercent: number;
  timeStart: string;
  timeEnd: string;
  type: "playlist" | "screen";
  screenType?: string;
  schedulingEnabled: boolean;
  daysOfWeek?: number[];
}

function buildTimeBlocks(
  playlists: Playlist[],
  screens: Screen[],
  view: "playlists" | "screens"
): TimeBlock[] {
  if (view === "playlists") {
    const blocks: TimeBlock[] = [];
    playlists
      .filter((p) => p.schedulingEnabled)
      .forEach((p, i) => {
        const color = p.color || PLAYLIST_COLORS[i % PLAYLIST_COLORS.length];
        // Use timeSlots array if available, fallback to legacy timeStart/timeEnd
        const slots: Array<{ timeStart: string; timeEnd: string }> =
          (p as any).timeSlots && (p as any).timeSlots.length > 0
            ? (p as any).timeSlots
            : p.timeStart && p.timeEnd
              ? [{ timeStart: p.timeStart, timeEnd: p.timeEnd }]
              : [];

        slots.forEach((slot, slotIndex) => {
          blocks.push({
            id: p.id * 1000 + slotIndex, // unique id per slot
            name: p.name + (slots.length > 1 ? ` (${slotIndex + 1})` : ""),
            color,
            startPercent: timeToPercent(slot.timeStart),
            endPercent: timeToPercent(slot.timeEnd),
            timeStart: slot.timeStart,
            timeEnd: slot.timeEnd,
            type: "playlist" as const,
            schedulingEnabled: true,
            daysOfWeek: p.daysOfWeek || undefined,
          });
        });
      });
    return blocks;
  }

  return screens
    .filter((s) => s.schedulingEnabled && s.timeStart && s.timeEnd && s.isActive)
    .map((s) => ({
      id: s.id,
      name: s.title,
      color: SCREEN_TYPE_CONFIG[s.type as keyof typeof SCREEN_TYPE_CONFIG]?.color || "#6b7280",
      startPercent: timeToPercent(s.timeStart!),
      endPercent: timeToPercent(s.timeEnd!),
      timeStart: s.timeStart!,
      timeEnd: s.timeEnd!,
      type: "screen" as const,
      screenType: s.type,
      schedulingEnabled: true,
      daysOfWeek: s.daysOfWeek || undefined,
    }));
}

function AlwaysOnItems({
  playlists,
  screens,
  view,
}: {
  playlists: Playlist[];
  screens: Screen[];
  view: "playlists" | "screens";
}) {
  if (view === "playlists") {
    const alwaysOn = playlists.filter(
      (p) => !p.schedulingEnabled || (
        !p.timeStart && !p.timeEnd && 
        (!(p as any).timeSlots || (p as any).timeSlots.length === 0)
      )
    );
    const manualActive = playlists.find((p) => p.isActive);

    if (alwaysOn.length === 0 && !manualActive) return null;

    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Always Available / Manual Activation
        </p>
        <div className="flex flex-wrap gap-2">
          {manualActive && (
            <Badge
              className="text-white"
              style={{ backgroundColor: "#10b981" }}
            >
              <ListMusic className="w-3 h-3 mr-1" />
              {manualActive.name} (Active)
            </Badge>
          )}
          {alwaysOn
            .filter((p) => p.id !== manualActive?.id)
            .map((p, i) => (
              <Badge
                key={p.id}
                variant="outline"
                style={{
                  borderColor:
                    p.color || PLAYLIST_COLORS[i % PLAYLIST_COLORS.length],
                  color:
                    p.color || PLAYLIST_COLORS[i % PLAYLIST_COLORS.length],
                }}
              >
                <ListMusic className="w-3 h-3 mr-1" />
                {p.name}
              </Badge>
            ))}
        </div>
      </div>
    );
  }

  const alwaysOn = screens.filter(
    (s) =>
      s.isActive &&
      (!s.schedulingEnabled || (!s.timeStart && !s.timeEnd))
  );

  if (alwaysOn.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Always Showing (No Schedule)
      </p>
      <div className="flex flex-wrap gap-2">
        {alwaysOn.slice(0, 12).map((s) => {
          const config =
            SCREEN_TYPE_CONFIG[s.type as keyof typeof SCREEN_TYPE_CONFIG];
          return (
            <Badge
              key={s.id}
              variant="outline"
              style={{
                borderColor: config?.color || "#6b7280",
                color: config?.color || "#6b7280",
              }}
            >
              <Tv className="w-3 h-3 mr-1" />
              {s.title}
            </Badge>
          );
        })}
        {alwaysOn.length > 12 && (
          <Badge variant="secondary">+{alwaysOn.length - 12} more</Badge>
        )}
      </div>
    </div>
  );
}

export function ScheduleTimeline() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [view, setView] = useState<"playlists" | "screens">("playlists");

  const { data: playlists } = trpc.playlists.getAll.useQuery(undefined, {
    staleTime: 0,
  });
  const { data: screens } = trpc.screens.getAll.useQuery(undefined, {
    staleTime: 0,
  });

  const timeBlocks = useMemo(() => {
    if (!playlists || !screens) return [];
    const blocks = buildTimeBlocks(playlists, screens, view);
    // Filter by selected day
    return blocks.filter((b) => {
      if (!b.daysOfWeek || b.daysOfWeek.length === 0) return true;
      return b.daysOfWeek.includes(selectedDay);
    });
  }, [playlists, screens, view, selectedDay]);

  // Current time indicator
  const now = new Date();
  const currentTimePercent =
    ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100;
  const isToday = selectedDay === now.getDay();

  // Find what's currently active
  const currentlyActive = useMemo(() => {
    if (!isToday) return null;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return timeBlocks.find(
      (b) => currentTime >= b.timeStart && currentTime <= b.timeEnd
    );
  }, [timeBlocks, isToday]);

  const hasScheduledItems = timeBlocks.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Timeline
            </CardTitle>
            <CardDescription>
              Visual overview of when playlists and screens are scheduled
            </CardDescription>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              size="sm"
              variant={view === "playlists" ? "default" : "ghost"}
              className="h-7 text-xs"
              onClick={() => setView("playlists")}
            >
              <ListMusic className="w-3 h-3 mr-1" />
              Playlists
            </Button>
            <Button
              size="sm"
              variant={view === "screens" ? "default" : "ghost"}
              className="h-7 text-xs"
              onClick={() => setView("screens")}
            >
              <Tv className="w-3 h-3 mr-1" />
              Screens
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Selector */}
        <div className="flex items-center justify-center gap-1 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSelectedDay((d) => (d === 0 ? 6 : d - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {DAYS_OF_WEEK.map((day) => (
            <Button
              key={day.value}
              size="sm"
              variant={selectedDay === day.value ? "default" : "outline"}
              className={`h-8 w-10 text-xs font-medium ${
                day.value === now.getDay()
                  ? "ring-2 ring-primary/30"
                  : ""
              }`}
              onClick={() => setSelectedDay(day.value)}
            >
              {day.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSelectedDay((d) => (d === 6 ? 0 : d + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Currently Active */}
        {isToday && currentlyActive && (
          <div
            className="mb-4 p-3 rounded-lg border-2 flex items-center gap-3"
            style={{
              borderColor: currentlyActive.color,
              backgroundColor: `${currentlyActive.color}10`,
            }}
          >
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: currentlyActive.color }}
            />
            <div>
              <p className="text-sm font-medium">
                Now Playing: {currentlyActive.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentlyActive.timeStart} – {currentlyActive.timeEnd}
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Hour Labels */}
          <div className="flex mb-1">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-[10px] text-muted-foreground"
              >
                {hour % 3 === 0 ? formatHour(hour) : ""}
              </div>
            ))}
          </div>

          {/* Hour Grid Lines */}
          <div className="relative h-2 mb-1">
            <div className="absolute inset-0 flex">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 border-l border-border/50"
                />
              ))}
            </div>
          </div>

          {/* Timeline Blocks */}
          <div
            className="relative bg-muted/30 rounded-lg border overflow-hidden"
            style={{
              minHeight: hasScheduledItems
                ? `${Math.max(TIMELINE_HEIGHT, timeBlocks.length * (TIMELINE_HEIGHT + 4) + 8)}px`
                : `${TIMELINE_HEIGHT + 16}px`,
            }}
          >
            {/* Hour grid lines inside */}
            <div className="absolute inset-0 flex pointer-events-none">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 border-l border-border/20"
                />
              ))}
            </div>

            {/* Current time indicator */}
            {isToday && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                style={{ left: `${currentTimePercent}%` }}
              >
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-red-500" />
              </div>
            )}

            {/* Time blocks */}
            {hasScheduledItems ? (
              <TooltipProvider delayDuration={200}>
                {timeBlocks.map((block, index) => {
                  const width = block.endPercent - block.startPercent;
                  return (
                    <Tooltip key={`${block.type}-${block.id}`}>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute rounded-md cursor-pointer transition-all hover:brightness-110 hover:shadow-md flex items-center px-2 overflow-hidden"
                          style={{
                            left: `${block.startPercent}%`,
                            width: `${width}%`,
                            top: `${index * (TIMELINE_HEIGHT + 4) + 4}px`,
                            height: `${TIMELINE_HEIGHT}px`,
                            backgroundColor: block.color,
                            opacity: 0.9,
                          }}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {block.type === "playlist" ? (
                              <ListMusic className="w-3.5 h-3.5 text-white shrink-0" />
                            ) : (
                              <Tv className="w-3.5 h-3.5 text-white shrink-0" />
                            )}
                            <span className="text-xs font-medium text-white truncate">
                              {block.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/80 ml-auto shrink-0 pl-1">
                            {block.timeStart}–{block.timeEnd}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{block.name}</p>
                          <p className="text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {block.timeStart} – {block.timeEnd}
                          </p>
                          {block.screenType && (
                            <p className="text-xs">
                              Type:{" "}
                              {SCREEN_TYPE_CONFIG[
                                block.screenType as keyof typeof SCREEN_TYPE_CONFIG
                              ]?.label || block.screenType}
                            </p>
                          )}
                          {block.daysOfWeek && block.daysOfWeek.length > 0 && (
                            <p className="text-xs">
                              Days:{" "}
                              {block.daysOfWeek
                                .map(
                                  (d) =>
                                    DAYS_OF_WEEK.find((dw) => dw.value === d)
                                      ?.label
                                )
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No scheduled {view} for{" "}
                  {DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.fullLabel}
                </p>
              </div>
            )}
          </div>

          {/* Bottom hour ticks */}
          <div className="flex mt-1">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-[10px] text-muted-foreground"
              >
                {hour % 6 === 0 ? formatHour(hour) : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Always-on items */}
        <AlwaysOnItems
          playlists={playlists || []}
          screens={screens || []}
          view={view}
        />

        {/* Legend */}
        {hasScheduledItems && (
          <div className="mt-4 flex flex-wrap gap-3">
            {timeBlocks.map((block) => (
              <div
                key={`${block.type}-${block.id}`}
                className="flex items-center gap-1.5"
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: block.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {block.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
