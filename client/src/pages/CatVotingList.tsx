import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cat, Camera, Heart, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function CatVotingList() {
  const { data: cats, isLoading } = trpc.catPhotos.getAvailableCatsWithPhotos.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-sm">
              <Cat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900">Catfé Photo Contest</h1>
              <p className="text-sm text-amber-600">
                Upload photos &amp; vote for your favorites!
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Intro */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-amber-900">Choose a Cat</h2>
          <p className="text-sm text-amber-600 mt-1">
            Tap a cat to view their photos, upload your own, and vote!
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" />
          </div>
        ) : !cats || cats.length === 0 ? (
          <div className="text-center py-20">
            <Cat className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <p className="text-amber-600 text-lg">No cats available right now.</p>
            <p className="text-amber-400 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cats.map((cat) => {
              const topPhoto = cat.topGuestPhotos?.[0];
              const photoCount = cat.topGuestPhotos?.length || 0;
              const totalVotes = cat.topGuestPhotos?.reduce(
                (sum: number, p: any) => sum + (p.voteCount || 0),
                0
              ) || 0;

              return (
                <Link key={cat.id} href={`/vote/cat/${cat.id}`}>
                  <Card className="overflow-hidden border-amber-100 shadow-md hover:shadow-xl transition-all cursor-pointer group">
                    <div className="relative h-48">
                      {cat.photoUrl ? (
                        <img
                          src={cat.photoUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                          <Cat className="w-16 h-16 text-amber-400" />
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {cat.breed && (
                            <Badge className="bg-white/20 text-white border-0 text-xs">
                              {cat.breed}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {/* Arrow indicator */}
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-amber-600">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" />
                          {photoCount} photo{photoCount !== 1 ? "s" : ""}
                        </span>
                        {totalVotes > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {(cat.personalityTags as string[] | null)?.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-amber-50 border-amber-200 text-amber-600 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-amber-500 text-sm px-4">
        <p>Catfé Lounge — Santa Clarita, CA</p>
        <p className="mt-1">
          Photos are community-submitted. Top voted photos appear on our in-lounge TV!
        </p>
      </footer>
    </div>
  );
}
