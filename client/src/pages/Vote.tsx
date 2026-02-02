import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cat, CheckCircle2, Vote as VoteIcon, RefreshCw } from "lucide-react";

type PollOption = {
  id: string;
  text: string;
  catId?: number;
  imageUrl?: string;
  voteCount?: number;
  percentage?: number;
};

// Generate a simple fingerprint for vote tracking
function getFingerprint(): string {
  const stored = localStorage.getItem("catfe_vote_fingerprint");
  if (stored) return stored;
  
  const fp = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem("catfe_vote_fingerprint", fp);
  return fp;
}

export default function Vote() {
  const params = useParams<{ pollId: string }>();
  const pollId = parseInt(params.pollId || "0", 10);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [fingerprint] = useState(getFingerprint);

  const { data: poll, isLoading, error, refetch } = trpc.polls.getWithResults.useQuery(
    { id: pollId },
    { 
      enabled: pollId > 0,
      refetchInterval: hasVoted ? 5000 : false, // Auto-refresh results every 5 seconds after voting
    }
  );

  const { data: alreadyVoted } = trpc.polls.hasVoted.useQuery(
    { pollId, fingerprint },
    { enabled: pollId > 0 && !!fingerprint }
  );

  const voteMutation = trpc.polls.vote.useMutation({
    onSuccess: () => {
      setHasVoted(true);
      refetch(); // Immediately fetch updated results
    },
  });

  useEffect(() => {
    if (alreadyVoted) {
      setHasVoted(true);
    }
  }, [alreadyVoted]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <Cat className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-xl">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Cat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Poll Not Found</h1>
            <p className="text-muted-foreground">
              This poll may have ended or doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle potentially double-encoded options
  let options: PollOption[] = [];
  if (poll.parsedOptions) {
    options = poll.parsedOptions;
  } else {
    try {
      let parsed = poll.options;
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
        while (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
      }
      options = parsed as PollOption[];
    } catch (e) {
      console.error('Failed to parse poll options:', e);
      options = [];
    }
  }

  // Calculate total votes and percentages
  const totalVotes = options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
  const optionsWithPercentage = options.map(opt => ({
    ...opt,
    percentage: totalVotes > 0 ? Math.round(((opt.voteCount || 0) / totalVotes) * 100) : 0
  }));

  // Find the winning option(s)
  const maxVotes = Math.max(...optionsWithPercentage.map(o => o.voteCount || 0));

  if (poll.status !== "active") {
    // Show final results for ended polls
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <span className="text-2xl">📊</span>
              <span className="text-white font-semibold">Final Results</span>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h1 className="text-xl font-bold text-center mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {poll.question}
              </h1>
              <p className="text-center text-muted-foreground text-sm">
                {totalVotes} total votes
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {optionsWithPercentage.map((opt) => {
              const isWinner = (opt.voteCount || 0) === maxVotes && maxVotes > 0;
              return (
                <div
                  key={opt.id}
                  className={`relative overflow-hidden rounded-xl border-2 ${
                    isWinner ? "border-yellow-400 bg-yellow-400/10" : "border-white/20 bg-white/5"
                  }`}
                >
                  {/* Progress bar background */}
                  <div 
                    className={`absolute inset-0 ${isWinner ? "bg-yellow-400/20" : "bg-white/10"}`}
                    style={{ width: `${opt.percentage}%` }}
                  />
                  
                  <div className="relative p-4 flex items-center gap-4">
                    {opt.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={opt.imageUrl} 
                          alt={opt.text}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                        🐱
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isWinner ? "text-yellow-300" : "text-white"}`}>
                          {opt.text}
                        </span>
                        {isWinner && <span className="text-yellow-400">👑</span>}
                      </div>
                      <span className="text-white/60 text-sm">{opt.voteCount || 0} votes</span>
                    </div>
                    <span className={`text-2xl font-bold ${isWinner ? "text-yellow-300" : "text-white"}`}>
                      {opt.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-white/60 mt-6 text-sm">
            This poll has ended. Thanks for participating!
          </p>
        </div>
      </div>
    );
  }

  // Show results after voting
  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
        <div className="max-w-md mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-6">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <h1 className="text-2xl font-bold text-white mb-1">Thanks for Voting!</h1>
            <p className="text-white/70 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Live results • Updates every 5 seconds
            </p>
          </div>

          {/* Question */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold text-center" style={{ fontFamily: "var(--font-display)" }}>
                {poll.question}
              </h2>
              <p className="text-center text-muted-foreground text-sm mt-1">
                {totalVotes} votes so far
              </p>
            </CardContent>
          </Card>

          {/* Live Results */}
          <div className="space-y-3">
            {optionsWithPercentage.map((opt) => {
              const isLeading = (opt.voteCount || 0) === maxVotes && maxVotes > 0;
              return (
                <div
                  key={opt.id}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                    isLeading ? "border-green-400 bg-green-400/10" : "border-white/20 bg-white/5"
                  }`}
                >
                  {/* Animated progress bar */}
                  <div 
                    className={`absolute inset-0 transition-all duration-500 ${isLeading ? "bg-green-400/20" : "bg-white/10"}`}
                    style={{ width: `${opt.percentage}%` }}
                  />
                  
                  <div className="relative p-4 flex items-center gap-4">
                    {opt.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={opt.imageUrl} 
                          alt={opt.text}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                        🐱
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isLeading ? "text-green-300" : "text-white"}`}>
                          {opt.text}
                        </span>
                        {isLeading && <span className="text-green-400">🏆</span>}
                      </div>
                      <span className="text-white/60 text-sm">{opt.voteCount || 0} votes</span>
                    </div>
                    <span className={`text-2xl font-bold ${isLeading ? "text-green-300" : "text-white"}`}>
                      {opt.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-white/50 mt-6 text-xs">
            Keep watching to see how others vote!
          </p>
        </div>
      </div>
    );
  }

  const handleVote = () => {
    if (selectedOption) {
      voteMutation.mutate({
        pollId,
        optionId: selectedOption,
        fingerprint,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
            <VoteIcon className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Catfé Poll</span>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {poll.question}
            </h1>
            <p className="text-center text-muted-foreground text-sm">
              Tap an option to vote
            </p>
          </CardContent>
        </Card>

        {/* Options with cat images */}
        <div className="space-y-3 mb-6">
          {options.map((opt, idx) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                selectedOption === opt.id
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
            >
              {/* Cat image or emoji */}
              {opt.imageUrl ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={opt.imageUrl} 
                    alt={opt.text}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  selectedOption === opt.id ? "bg-primary/20" : "bg-white/10"
                }`}>
                  {idx === 0 ? "🐱" : idx === 1 ? "😺" : idx === 2 ? "😸" : "🐈"}
                </div>
              )}
              <span className={`text-lg font-medium ${
                selectedOption === opt.id ? "text-primary" : "text-white"
              }`}>
                {opt.text}
              </span>
              {selectedOption === opt.id && (
                <CheckCircle2 className="w-6 h-6 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>

        {/* Vote Button */}
        <Button
          className="w-full h-14 text-lg"
          disabled={!selectedOption || voteMutation.isPending}
          onClick={handleVote}
        >
          {voteMutation.isPending ? "Submitting..." : "Submit Vote"}
        </Button>

        {/* Hint */}
        <p className="text-center text-white/60 mt-4 text-sm">
          See live results after you vote!
        </p>
      </div>
    </div>
  );
}
