import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

type DateRange = "7d" | "30d" | "90d" | "all";

export function SessionHistory() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  // Calculate date filters
  const dateFilters = useMemo(() => {
    if (dateRange === "all") return {};
    
    const now = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    
    return { startDate, endDate: now };
  }, [dateRange]);
  
  // Fetch analytics
  const analyticsQuery = trpc.guestSessions.getAnalytics.useQuery(dateFilters);
  
  // Fetch history
  const historyQuery = trpc.guestSessions.getHistory.useQuery(dateFilters);
  
  const analytics = analyticsQuery.data;
  const history = historyQuery.data || [];
  const displayedHistory = showAllHistory ? history : history.slice(0, 20);
  
  const isLoading = analyticsQuery.isLoading || historyQuery.isLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Session Analytics</h2>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Sessions</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalSessions || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Total Guests</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalGuests || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Avg Group</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.averageGroupSize || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Avg Duration</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.averageSessionLength || 0}m</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Tabs */}
      <Tabs defaultValue="time" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="time">By Time</TabsTrigger>
          <TabsTrigger value="day">By Day</TabsTrigger>
          <TabsTrigger value="duration">By Duration</TabsTrigger>
        </TabsList>
        
        {/* By Time of Day */}
        <TabsContent value="time">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Busiest Hours</CardTitle>
              <CardDescription>When guests typically visit</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.peakHours && analytics.peakHours.length > 0 ? (
                <div className="space-y-3">
                  {analytics.peakHours.map((peak, idx) => (
                    <div key={peak.hour} className="flex items-center gap-3">
                      <Badge variant={idx === 0 ? "default" : "secondary"}>
                        #{idx + 1}
                      </Badge>
                      <span className="font-medium">{formatHour(peak.hour)}</span>
                      <span className="text-muted-foreground">
                        {peak.count} sessions
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No data available</p>
              )}
              
              {/* Hour Distribution */}
              {analytics?.sessionsByHour && analytics.sessionsByHour.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Hourly Distribution</p>
                  <div className="flex items-end gap-1 h-24">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const data = analytics.sessionsByHour.find(h => h.hour === hour);
                      const count = data?.count || 0;
                      const maxCount = Math.max(...analytics.sessionsByHour.map(h => h.count));
                      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      return (
                        <div
                          key={hour}
                          className="flex-1 bg-primary/20 rounded-t hover:bg-primary/40 transition-colors relative group"
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={`${formatHour(hour)}: ${count} sessions`}
                        >
                          {count > 0 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {count}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>12am</span>
                    <span>6am</span>
                    <span>12pm</span>
                    <span>6pm</span>
                    <span>12am</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Day of Week */}
        <TabsContent value="day">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Pattern</CardTitle>
              <CardDescription>Sessions and guests by day</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.sessionsByDayOfWeek && analytics.sessionsByDayOfWeek.length > 0 ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const data = analytics.sessionsByDayOfWeek.find(d => d.day === day);
                    const count = data?.count || 0;
                    const guests = data?.guests || 0;
                    const maxCount = Math.max(...analytics.sessionsByDayOfWeek.map(d => d.count));
                    const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-12 text-sm font-medium">{DAY_NAMES[day]}</span>
                        <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(width, 2)}%` }}
                          >
                            {count > 0 && (
                              <span className="text-xs text-primary-foreground font-medium">
                                {count}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground w-20 text-right">
                          {guests} guests
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Duration */}
        <TabsContent value="duration">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Session Types</CardTitle>
              <CardDescription>Breakdown by duration</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.sessionsByDuration && analytics.sessionsByDuration.length > 0 ? (
                <div className="space-y-4">
                  {analytics.sessionsByDuration
                    .sort((a, b) => parseInt(a.duration) - parseInt(b.duration))
                    .map(item => {
                      const total = analytics.totalSessions;
                      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                      const label = item.duration === "15" ? "Quick Visit (15 min)" :
                                   item.duration === "30" ? "Mini Meow (30 min)" :
                                   "Full Purr (60 min)";
                      
                      return (
                        <div key={item.duration} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{label}</span>
                            <span className="text-muted-foreground">
                              {item.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-3 bg-muted rounded overflow-hidden">
                            <div
                              className="h-full bg-primary rounded transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Session History Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Session History
              </CardTitle>
              <CardDescription>
                {history.length} sessions in selected period
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No sessions found for this period
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {displayedHistory.map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{session.guestName}</span>
                        <Badge variant="outline" className="text-xs">
                          {session.duration} min
                        </Badge>
                        <Badge 
                          variant={
                            session.status === "active" ? "default" :
                            session.status === "extended" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatDate(session.checkInAt)} at {formatTime(session.checkInAt)}
                        {" • "}
                        {session.guestCount} guest{session.guestCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {history.length > 20 && (
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setShowAllHistory(!showAllHistory)}
                >
                  {showAllHistory ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show All ({history.length - 20} more)
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
