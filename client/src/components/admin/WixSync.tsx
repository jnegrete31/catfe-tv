import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Calendar, Users, Clock, AlertCircle, Zap, Timer } from "lucide-react";

export function WixSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Test Wix connection
  const { data: connectionStatus, isLoading: isTestingConnection, refetch: retestConnection } = 
    trpc.wix.testConnection.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  // Get today's bookings from Wix
  const { data: bookingsData, isLoading: isLoadingBookings, refetch: refetchBookings } = 
    trpc.wix.getTodaysBookings.useQuery(undefined, {
      enabled: connectionStatus?.success === true,
      refetchOnWindowFocus: false,
    });

  // Get synced sessions
  const { data: syncedSessions, refetch: refetchSynced } = 
    trpc.wix.getSyncedSessions.useQuery(undefined, {
      enabled: connectionStatus?.success === true,
    });

  // Get auto-sync status
  const { data: autoSyncStatus, refetch: refetchAutoSyncStatus } = 
    trpc.wix.getAutoSyncStatus.useQuery(undefined, {
      enabled: connectionStatus?.success === true,
      refetchInterval: 30000, // Refresh every 30 seconds
    });

  // Toggle auto-sync mutation
  const toggleAutoSyncMutation = trpc.wix.toggleAutoSync.useMutation({
    onSuccess: () => {
      refetchAutoSyncStatus();
    },
    onError: (error) => {
      alert(`Failed to toggle auto-sync: ${error.message}`);
    },
  });

  // Trigger manual sync mutation
  const triggerSyncMutation = trpc.wix.triggerSync.useMutation({
    onSuccess: (result) => {
      alert(`Sync Complete: Synced ${result.synced} bookings, skipped ${result.skipped} already synced.`);
      refetchSynced();
      refetchBookings();
      refetchAutoSyncStatus();
    },
    onError: (error) => {
      alert(`Sync Failed: ${error.message}`);
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });

  const handleSync = () => {
    setIsSyncing(true);
    triggerSyncMutation.mutate();
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    toggleAutoSyncMutation.mutate({ enabled });
  };

  // Update countdown timer
  useEffect(() => {
    if (!autoSyncStatus?.enabled || !autoSyncStatus?.nextSyncIn) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      if (autoSyncStatus.nextSyncIn) {
        const minutes = Math.floor(autoSyncStatus.nextSyncIn / 60000);
        const seconds = Math.floor((autoSyncStatus.nextSyncIn % 60000) / 1000);
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(() => {
      refetchAutoSyncStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSyncStatus?.nextSyncIn, autoSyncStatus?.enabled, refetchAutoSyncStatus]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatLastSync = (date: Date | string | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Wix Bookings Integration
          </CardTitle>
          <CardDescription>
            Sync your Wix Bookings with Catfé TV guest sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {isTestingConnection ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : connectionStatus?.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {isTestingConnection ? "Testing connection..." : 
                   connectionStatus?.success ? "Connected to Wix" : "Not Connected"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {connectionStatus?.message}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => retestConnection()}
              disabled={isTestingConnection}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
              Retest
            </Button>
          </div>

          {/* Auto-Sync Status */}
          {connectionStatus?.success && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${autoSyncStatus?.enabled ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
                    <Zap className={`h-5 w-5 ${autoSyncStatus?.enabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Auto-Sync</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync bookings every 15 minutes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoSyncStatus?.enabled ?? false}
                  onCheckedChange={handleToggleAutoSync}
                  disabled={toggleAutoSyncMutation.isPending}
                />
              </div>

              {autoSyncStatus?.enabled && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last sync:</span>
                    <span className="font-medium">{formatLastSync(autoSyncStatus.lastSyncTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next sync:</span>
                    <span className="font-medium">{countdown || "Soon"}</span>
                  </div>
                </div>
              )}

              {autoSyncStatus?.lastSyncResult && (
                <div className="flex items-center gap-4 pt-2 border-t text-sm">
                  <span className="text-muted-foreground">Last result:</span>
                  <Badge variant={autoSyncStatus.lastSyncResult.success ? "secondary" : "destructive"}>
                    {autoSyncStatus.lastSyncResult.success ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {autoSyncStatus.lastSyncResult.synced} synced, {autoSyncStatus.lastSyncResult.skipped} skipped
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </>
                    )}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Manual Sync Button */}
          {connectionStatus?.success && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Manual Sync</p>
                <p className="text-sm text-muted-foreground">
                  Sync now without waiting for auto-sync
                </p>
              </div>
              <Button 
                onClick={handleSync}
                disabled={isSyncing || !connectionStatus?.success}
                variant="outline"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Not Connected Warning */}
          {!connectionStatus?.success && !isTestingConnection && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Wix API Not Configured</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  To connect Wix Bookings, you need to provide your Wix API Key and Site ID. 
                  Contact support to set up the integration.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Wix Bookings */}
      {connectionStatus?.success && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Today's Wix Bookings
                </CardTitle>
                <CardDescription>
                  {bookingsData?.bookings?.length || 0} bookings found
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchBookings()}
                disabled={isLoadingBookings}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingBookings ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
              <div className="space-y-3">
                {bookingsData.bookings.map((booking) => {
                  const isSynced = syncedSessions?.some(s => s.wixBookingId === booking.id);
                  return (
                    <div 
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </span>
                            <span>•</span>
                            <span>{booking.participants} guest{booking.participants !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSynced ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Pending Sync
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : bookingsData?.error ? (
              <div className="text-center py-8 text-red-500">
                <XCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{bookingsData.error}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No bookings found for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Synced Sessions Summary */}
      {connectionStatus?.success && syncedSessions && syncedSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Synced Sessions Today
            </CardTitle>
            <CardDescription>
              {syncedSessions.length} sessions imported from Wix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{syncedSessions.length}</p>
                <p className="text-sm text-muted-foreground">Total Synced</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {syncedSessions.filter(s => s.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {syncedSessions.reduce((sum, s) => sum + s.guestCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Guests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
