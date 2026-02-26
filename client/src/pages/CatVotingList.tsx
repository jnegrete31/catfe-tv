import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Cat, Camera, Heart, ArrowLeft, Home, Clock, Trophy } from "lucide-react";
import { Link } from "wouter";

function useCountdown(endAt: Date | string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!endAt) return;
    const update = () => {
      const end = new Date(endAt).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft("Round ended"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) setTimeLeft(`${days}d ${hours}h remaining`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m remaining`);
      else setTimeLeft(`${mins}m remaining`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endAt]);
  return timeLeft;
}

export default function CatVotingList() {
  const { data: cats, isLoading } = trpc.catPhotos.getAvailableCatsWithPhotos.useQuery();
  const { data: round } = trpc.catPhotos.getCurrentRound.useQuery();
  const timeLeft = useCountdown(round?.endAt);

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
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center shadow-sm">
              <Cat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-900" style={{ fontFamily: "var(--font-display)" }}>
                Photo Contest
              </h1>
              <p className="text-xs text-amber-600 flex items-center gap-1">
                {round && <span>Week {round.roundNumber}</span>}
                {timeLeft && (
                  <>
                    <span className="opacity-40">·</span>
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="text-amber-600 hover:bg-amber-100">
              <Link href="/vote/winners">
                <Trophy className="w-5 h-5" />
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
        {/* Contest info banner */}
        {round && timeLeft && (
          <div className="mb-6 bg-white/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{timeLeft}</span>
            </div>
            <Link href="/vote/winners">
              <span className="text-xs text-amber-600 hover:text-amber-800 underline underline-offset-2 cursor-pointer">
                Past winners
              </span>
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" />
          </div>
        ) : !cats || cats.length === 0 ? (
          <div className="text-center py-24">
            <Cat className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <p className="text-amber-700 text-lg font-medium">No cats available right now.</p>
            <p className="text-amber-500 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-amber-700 text-sm">
                {cats.length} cats looking for love — tap to vote & upload photos
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {cats.map((cat) => {
                const photoCount = cat.topGuestPhotos?.length || 0;
                const totalVotes = cat.topGuestPhotos?.reduce(
                  (sum: number, p: any) => sum + (p.voteCount || 0),
                  0
                ) || 0;

                return (
                  <Link key={cat.id} href={`/vote/cat/${cat.id}`}>
                    <div className="group cursor-pointer">
                      {/* Photo */}
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300">
                        {cat.photoUrl ? (
                          <img
                            src={cat.photoUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                            <Cat className="w-14 h-14 text-amber-400" />
                          </div>
                        )}
                        {/* Bottom gradient */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                        {/* Name overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-3">
                          <h3 className="text-white font-bold text-base leading-tight drop-shadow-md">
                            {cat.name}
                          </h3>
                          {cat.breed && (
                            <p className="text-white/80 text-xs mt-0.5 drop-shadow-sm">
                              {cat.breed}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stats below photo */}
                      <div className="flex items-center gap-3 mt-2 px-1">
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Camera className="w-3.5 h-3.5" />
                          {photoCount}
                        </span>
                        {totalVotes > 0 && (
                          <span className="flex items-center gap-1 text-xs text-red-400">
                            <Heart className="w-3.5 h-3.5 fill-current" />
                            {totalVotes}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 text-center text-amber-400 text-xs px-4">
        <p>Catfé Lounge — Santa Clarita, CA</p>
        <p className="mt-1">
          Top voted photos appear on our in-lounge TV!
        </p>
      </footer>
    </div>
  );
}
