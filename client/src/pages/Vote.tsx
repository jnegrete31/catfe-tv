import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cat, CheckCircle2, Vote as VoteIcon, Tv } from "lucide-react";

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

  const { data: poll, isLoading, error } = trpc.polls.getWithResults.useQuery(
    { id: pollId },
    { enabled: pollId > 0 }
  );

  const { data: alreadyVoted } = trpc.polls.hasVoted.useQuery(
    { pollId, fingerprint },
    { enabled: pollId > 0 && !!fingerprint }
  );

  const voteMutation = trpc.polls.vote.useMutation({
    onSuccess: () => {
      setHasVoted(true);
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

  if (poll.status !== "active") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-2xl font-bold mb-2">Poll Ended</h1>
            <p className="text-muted-foreground mb-4">
              This poll is no longer accepting votes.
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Tv className="w-5 h-5" />
              <span>Watch the TV for results!</span>
            </div>
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

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2">Thanks for Voting!</h1>
            <p className="text-muted-foreground mb-6">
              Your vote has been recorded.
            </p>
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Tv className="w-8 h-8 text-purple-600" />
                <span className="text-lg font-semibold text-purple-900">Watch the TV!</span>
              </div>
              <p className="text-purple-700">
                Results will be revealed on the big screen soon. Keep an eye out! 👀
              </p>
            </div>
          </CardContent>
        </Card>
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

        {/* Hint to watch TV */}
        <p className="text-center text-white/60 mt-4 text-sm flex items-center justify-center gap-2">
          <Tv className="w-4 h-4" />
          Results revealed on TV!
        </p>
      </div>
    </div>
  );
}
