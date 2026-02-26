import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cat, ArrowLeft, Home, Trophy, Heart, Camera, Crown } from "lucide-react";
import { Link } from "wouter";

const RANK_STYLES: Record<number, { bg: string; text: string; icon: string; label: string }> = {
  1: { bg: "bg-yellow-100 border-yellow-400", text: "text-yellow-700", icon: "🥇", label: "1st Place" },
  2: { bg: "bg-gray-100 border-gray-400", text: "text-gray-600", icon: "🥈", label: "2nd Place" },
  3: { bg: "bg-orange-100 border-orange-400", text: "text-orange-700", icon: "🥉", label: "3rd Place" },
};

export default function PastWinners() {
  const { data: rounds, isLoading } = trpc.catPhotos.getPastWinners.useQuery({ limit: 10 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-amber-700 hover:bg-amber-100 shrink-0"
            >
              <Link href="/vote/cats">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-900" style={{ fontFamily: "var(--font-display)" }}>
                Hall of Fame
              </h1>
              <p className="text-xs text-amber-600">
                Past contest winners
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="text-amber-600 hover:bg-amber-100">
              <Link href="/vote/cats">
                <Cat className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="text-amber-600 hover:bg-amber-100">
              <Link href="/">
                <Home className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" />
          </div>
        ) : !rounds || rounds.length === 0 ? (
          <div className="text-center py-24">
            <Trophy className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <p className="text-amber-700 text-lg font-medium">No past winners yet!</p>
            <p className="text-amber-500 text-sm mt-2">
              The first contest round is still in progress.
            </p>
            <Button asChild className="mt-4 bg-amber-600 hover:bg-amber-700 text-white">
              <Link href="/vote/cats">
                <Camera className="w-4 h-4 mr-2" />
                Vote Now
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {rounds.map((round) => {
              const startDate = new Date(round.startAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const endDate = new Date(round.endAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={round.id}>
                  {/* Round header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-amber-900 text-lg">
                        Week {round.roundNumber}
                      </h2>
                      <p className="text-xs text-amber-500">
                        {startDate} — {endDate}
                        {round.totalPhotos > 0 && (
                          <span className="ml-2">
                            · {round.totalPhotos} photos · {round.totalVotes} votes
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Winners */}
                  {round.winners.length === 0 ? (
                    <p className="text-amber-500 text-sm pl-13">No winners this round.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {round.winners.map((winner) => {
                        const style = RANK_STYLES[winner.rank] || RANK_STYLES[3];
                        return (
                          <Card
                            key={winner.id}
                            className={`overflow-hidden border-2 ${style.bg} shadow-md ${
                              winner.rank === 1 ? "sm:col-span-3 sm:grid sm:grid-cols-2" : ""
                            }`}
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={winner.photoUrl}
                                alt={`${winner.catName} by ${winner.uploaderName}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2">
                                <span className="text-2xl drop-shadow-lg">{style.icon}</span>
                              </div>
                            </div>
                            <CardContent className={`p-4 ${winner.rank === 1 ? "flex flex-col justify-center" : ""}`}>
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className={`${style.text} border-current text-xs`}>
                                  {style.label}
                                </Badge>
                                <span className="flex items-center gap-1 text-sm text-red-400 font-medium">
                                  <Heart className="w-3.5 h-3.5 fill-current" />
                                  {winner.voteCount}
                                </span>
                              </div>
                              <Link href={`/vote/cat/${winner.catId}`}>
                                <h3 className="font-bold text-amber-900 hover:text-amber-700 cursor-pointer mt-2">
                                  {winner.catName}
                                </h3>
                              </Link>
                              {winner.caption && (
                                <p className="text-xs text-amber-600 mt-1 line-clamp-2 italic">
                                  "{winner.caption}"
                                </p>
                              )}
                              <p className="text-xs text-amber-500 mt-2">
                                📸 by {winner.uploaderName}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 text-center text-amber-400 text-xs px-4">
        <p>Catfé Lounge — Santa Clarita, CA</p>
        <p className="mt-1">
          New winners crowned every week!
        </p>
      </footer>
    </div>
  );
}
