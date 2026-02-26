import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Trophy, Camera, Heart, RotateCcw, Play, Image as ImageIcon,
  Clock, TrendingUp, Users, Award, ChevronRight, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import PhotoModeration from "./PhotoModeration";

function ContestManagement() {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newRoundDialogOpen, setNewRoundDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.catPhotos.getContestStats.useQuery();
  const { data: leaderboard, isLoading: leaderboardLoading } = trpc.catPhotos.getPhotosForCurrentRound.useQuery();
  const { data: pastRounds } = trpc.catPhotos.getAdminPastRounds.useQuery({ limit: 5 });

  const resetVotesMutation = trpc.catPhotos.resetCurrentRoundVotes.useMutation({
    onSuccess: (result) => {
      toast.success(`Votes reset! ${result.photosReset} photos cleared.`);
      utils.catPhotos.invalidate();
      setResetDialogOpen(false);
    },
    onError: () => toast.error("Failed to reset votes"),
  });

  const newRoundMutation = trpc.catPhotos.forceNewRound.useMutation({
    onSuccess: (round) => {
      toast.success(`New round #${round.roundNumber} started!`);
      utils.catPhotos.invalidate();
      setNewRoundDialogOpen(false);
    },
    onError: () => toast.error("Failed to start new round"),
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const sortedLeaderboard = leaderboard
    ? [...leaderboard].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
    : [];

  return (
    <div className="space-y-6">
      {/* Current Round Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {statsLoading ? "..." : stats?.activeRound ? `#${stats.activeRound.roundNumber}` : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Current Round</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? "..." : stats?.currentRoundPhotos ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Photos This Round</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? "..." : stats?.currentRoundVotes ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Votes This Round</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {statsLoading ? "..." : stats?.completedRounds ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Past Rounds</div>
          </CardContent>
        </Card>
      </div>

      {/* Round Details & Actions */}
      {stats?.activeRound && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Round #{stats.activeRound.roundNumber}
                </CardTitle>
                <CardDescription>
                  {formatDate(stats.activeRound.startAt)} — {formatDate(stats.activeRound.endAt)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setResetDialogOpen(true)}
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset Votes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewRoundDialogOpen(true)}
                >
                  <Play className="w-4 h-4 mr-1" /> New Round
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Current Leaderboard
          </CardTitle>
          <CardDescription>
            Top voted cat photos this round
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboardLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : sortedLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No photos uploaded yet this round</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedLeaderboard.slice(0, 10).map((photo, index) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    index === 0 ? "bg-amber-100 text-amber-700" :
                    index === 1 ? "bg-gray-100 text-gray-600" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || "Cat photo"}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {photo.catName || `Cat #${photo.catId}`}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      by {photo.uploaderName}
                      {photo.caption && ` · "${photo.caption}"`}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {photo.voteCount || 0} {(photo.voteCount || 0) === 1 ? "vote" : "votes"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Rounds */}
      {pastRounds && pastRounds.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Past Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastRounds.map((round) => (
                <div key={round.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                    #{round.roundNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {formatDate(round.startAt)} — {formatDate(round.endAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {round.totalPhotos} photos · {round.totalVotes} votes
                    </div>
                  </div>
                  {round.winners && round.winners.length > 0 && (
                    <div className="flex -space-x-2">
                      {round.winners.slice(0, 3).map((winner) => (
                        <img
                          key={winner.id}
                          src={winner.photoUrl}
                          alt={winner.catName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-background"
                          title={`${winner.rank === 1 ? "🥇" : winner.rank === 2 ? "🥈" : "🥉"} ${winner.catName} by ${winner.uploaderName}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Votes Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Reset All Votes
            </DialogTitle>
            <DialogDescription>
              This will clear all votes for the current round. Photos will remain but their vote counts will be set to zero. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => resetVotesMutation.mutate()}
              disabled={resetVotesMutation.isPending}
            >
              {resetVotesMutation.isPending ? "Resetting..." : "Reset All Votes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Round Dialog */}
      <Dialog open={newRoundDialogOpen} onOpenChange={setNewRoundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-500" />
              Start New Round
            </DialogTitle>
            <DialogDescription>
              This will close the current round, archive the top 3 winners, and start a fresh round. The current leaderboard will be saved to Past Rounds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRoundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => newRoundMutation.mutate()}
              disabled={newRoundMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {newRoundMutation.isPending ? "Starting..." : "Start New Round"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrapper to filter PhotoModeration by type
function SnapPurrModeration() {
  return <PhotoModeration filterType="snap_purr" />;
}

function HappyTailsModeration() {
  return <PhotoModeration filterType="happy_tails" />;
}

export default function PhotosTab() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="contest">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="contest" className="gap-2">
              <Trophy className="w-4 h-4" />
              Photo Contest
            </TabsTrigger>
            <TabsTrigger value="snap_purr" className="gap-2">
              <Camera className="w-4 h-4" />
              Snap & Purr
            </TabsTrigger>
            <TabsTrigger value="happy_tails" className="gap-2">
              <Heart className="w-4 h-4" />
              Happy Tails
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="contest" className="mt-4">
          <ContestManagement />
        </TabsContent>

        <TabsContent value="snap_purr" className="mt-4">
          <SnapPurrModeration />
        </TabsContent>

        <TabsContent value="happy_tails" className="mt-4">
          <HappyTailsModeration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
