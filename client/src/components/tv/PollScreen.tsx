import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";

type PollOption = {
  id: string;
  text: string;
  catId?: number;
  imageUrl?: string;
  voteCount?: number;
  percentage?: number;
};

interface PollScreenProps {
  showResults?: boolean;
  countdownSeconds?: number;
}

export function PollScreen({ showResults = false, countdownSeconds }: PollScreenProps) {
  const [countdown, setCountdown] = useState(countdownSeconds || 0);
  
  // Use getForTV for dynamic cat selection
  const { data: tvPoll, refetch } = trpc.polls.getForTV.useQuery(undefined, {
    refetchInterval: showResults ? 5000 : 30000, // Refresh less often, cats change per 30-min session
  });

  // Also get results if showing results
  const { data: pollResults } = trpc.polls.getWithResults.useQuery(
    { id: tvPoll?.id || 0 },
    { 
      enabled: showResults && !!tvPoll?.id,
      refetchInterval: 5000,
    }
  );

  // Countdown timer
  useEffect(() => {
    if (countdownSeconds && countdownSeconds > 0) {
      setCountdown(countdownSeconds);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdownSeconds]);

  if (!tvPoll) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🐱</div>
          <h2 className="text-3xl font-bold">No Active Poll</h2>
          <p className="text-xl opacity-80 mt-2">Check back soon!</p>
        </div>
      </div>
    );
  }

  const options = tvPoll.options || [];
  const voteUrl = `${window.location.origin}/vote/${tvPoll.id}`;

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get vote counts from results
  const getVoteCount = (optionId: string) => {
    if (!pollResults?.parsedOptions) return 0;
    const opt = pollResults.parsedOptions.find(o => o.id === optionId);
    return opt?.voteCount || 0;
  };

  const totalVotes = pollResults?.totalVotes || tvPoll.totalVotes || 0;

  if (showResults) {
    // Results view
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-12 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full mb-4">
            <span className="text-2xl">📊</span>
            <span className="text-white text-xl font-semibold">Poll Results</span>
          </div>
          {countdown > 0 && (
            <div className="text-amber-300 text-lg">
              Next poll in {formatCountdown(countdown)}
            </div>
          )}
        </div>

        {/* Question */}
        <h1 className="text-5xl font-bold text-white text-center mb-12" style={{ fontFamily: "var(--font-display)" }}>
          {tvPoll.question}
        </h1>

        {/* Results with cat images */}
        <div className="flex-1 flex flex-col justify-center gap-6 max-w-5xl mx-auto w-full">
          {options.map((opt, idx) => {
            const voteCount = getVoteCount(opt.id);
            const percentage = totalVotes > 0 
              ? Math.round(voteCount / totalVotes * 100) 
              : 0;
            const isWinner = totalVotes > 0 && 
              voteCount === Math.max(...options.map(o => getVoteCount(o.id)));
            
            return (
              <div key={opt.id} className="relative">
                <div className="flex items-center gap-6 mb-2">
                  {/* Cat image */}
                  {opt.imageUrl ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0">
                      <img 
                        src={opt.imageUrl} 
                        alt={opt.text}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">
                      {idx === 0 ? "🐱" : idx === 1 ? "😺" : idx === 2 ? "😸" : "🐈"}
                    </div>
                  )}
                  <span className="text-3xl text-white font-semibold flex-1">{opt.text}</span>
                  <span className="text-4xl font-bold text-white">
                    {percentage}%
                    {isWinner && totalVotes > 0 && " 🏆"}
                  </span>
                </div>
                <div className="h-10 bg-white/20 rounded-full overflow-hidden ml-30">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isWinner ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-white/40"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right text-white/60 text-sm mt-1">
                  {voteCount} votes
                </div>
              </div>
            );
          })}
        </div>

        {/* Total votes */}
        <div className="text-center mt-8 text-white/80 text-xl">
          Total votes: {totalVotes}
        </div>
      </div>
    );
  }

  // Voting view with cat images
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-12 flex">
      {/* Left side - Question and options */}
      <div className="flex-1 flex flex-col justify-center pr-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full">
            <span className="text-2xl">🗳️</span>
            <span className="text-white text-xl font-semibold">Cat Poll</span>
          </div>
        </div>

        {/* Question */}
        <h1 className="text-5xl font-bold text-white mb-12" style={{ fontFamily: "var(--font-display)" }}>
          {tvPoll.question}
        </h1>

        {/* Options with cat images */}
        <div className="space-y-4">
          {options.map((opt, idx) => (
            <div
              key={opt.id}
              className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur"
            >
              {/* Cat image */}
              {opt.imageUrl ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
                  <img 
                    src={opt.imageUrl} 
                    alt={opt.text}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                  {idx === 0 ? "🐱" : idx === 1 ? "😺" : idx === 2 ? "😸" : "🐈"}
                </div>
              )}
              <span className="text-2xl text-white font-medium">{opt.text}</span>
            </div>
          ))}
        </div>

        {/* Vote count */}
        <div className="mt-8 text-white/60 text-lg">
          {totalVotes} votes so far
        </div>
      </div>

      {/* Right side - QR Code */}
      <div className="w-96 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <QRCodeSVG
            value={voteUrl}
            size={280}
            level="H"
            includeMargin={false}
          />
        </div>
        <div className="mt-6 text-center">
          <p className="text-white text-2xl font-bold mb-2">Scan to Vote!</p>
          <p className="text-white/70 text-lg">Use your phone camera</p>
        </div>
      </div>
    </div>
  );
}

// Poll Overlay - shows on top of other content at specific times
export function PollOverlay() {
  const [showPoll, setShowPoll] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { data: poll } = trpc.polls.getForTV.useQuery(undefined, {
    enabled: showPoll || showResults,
  });

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      
      // Show poll at x:00-x:05 and x:30-x:35
      const isPollTime = (minutes >= 0 && minutes < 5) || (minutes >= 30 && minutes < 35);
      
      // Show results at x:25-x:30 and x:55-x:00
      const isResultsTime = (minutes >= 25 && minutes < 30) || (minutes >= 55);
      
      if (isResultsTime && !showResults) {
        setShowResults(true);
        setShowPoll(false);
        // Calculate countdown to next poll
        const secsUntilNextPoll = minutes >= 55 
          ? (60 - minutes) * 60 - now.getSeconds()
          : (30 - minutes) * 60 - now.getSeconds();
        setCountdown(secsUntilNextPoll);
      } else if (isPollTime && !showPoll) {
        setShowPoll(true);
        setShowResults(false);
      } else if (!isPollTime && !isResultsTime) {
        setShowPoll(false);
        setShowResults(false);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [showPoll, showResults]);

  if (!poll || (!showPoll && !showResults)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <PollScreen showResults={showResults} countdownSeconds={showResults ? countdown : undefined} />
    </div>
  );
}
