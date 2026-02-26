import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Cat, Camera, Heart, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";

export default function CatVotingList() {
  const { data: cats, isLoading } = trpc.catPhotos.getAvailableCatsWithPhotos.useQuery();

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
              <p className="text-xs text-amber-600">
                Tap a cat to vote & upload photos
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="icon" className="text-amber-600 hover:bg-amber-100">
            <Link href="/">
              <Home className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
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
                {cats.length} cats looking for love
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
