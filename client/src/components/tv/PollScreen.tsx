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

type Poll = {
  id: number;
  question: string;
  options: string;
  status: string;
  totalVotes: number;
  parsedOptions?: PollOption[];
};

interface PollScreenProps {
  showResults?: boolean;
  countdownSeconds?: number;
}

export function PollScreen({ showResults = false, countdownSeconds }: PollScreenProps) {
  const [countdown, setCountdown] = useState(countdownSeconds || 0);
  
  const { data: poll, refetch } = trpc.polls.getCurrent.useQuery(undefined, {
    refetchInterval: showResults ? 5000 : 10000, // Refresh more often during results
  });

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

  if (!poll) {
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

  // Handle potentially double-encoded options
  let options: PollOption[] = [];
  try {
    let parsed = poll.options;
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
      // Handle double-encoded JSON
      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
    }
    options = parsed as PollOption[];
  } catch (e) {
    console.error('Failed to parse poll options:', e);
    options = [];
  }
  const voteUrl = `${window.location.origin}/vote/${poll.id}`;

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
          {poll.question}
        </h1>

        {/* Results */}
        <div className="flex-1 flex flex-col justify-center gap-6 max-w-4xl mx-auto w-full">
          {options.map((opt, idx) => {
            const percentage = poll.totalVotes > 0 
              ? Math.round((opt.voteCount || 0) / poll.totalVotes * 100) 
              : 0;
            const isWinner = poll.totalVotes > 0 && 
              (opt.voteCount || 0) === Math.max(...options.map(o => o.voteCount || 0));
            
            return (
              <div key={opt.id} className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl">
                    {idx === 0 ? "🐱" : idx === 1 ? "😺" : idx === 2 ? "😸" : "🐈"}
                  </span>
                  <span className="text-2xl text-white font-semibold flex-1">{opt.text}</span>
                  <span className="text-3xl font-bold text-white">
                    {percentage}%
                    {isWinner && poll.totalVotes > 0 && " 🏆"}
                  </span>
                </div>
                <div className="h-12 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isWinner ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-white/40"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right text-white/60 text-sm mt-1">
                  {opt.voteCount || 0} votes
                </div>
              </div>
            );
          })}
        </div>

        {/* Total votes */}
        <div className="text-center mt-8 text-white/80 text-xl">
          Total votes: {poll.totalVotes}
        </div>
      </div>
    );
  }

  // Voting view
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
          {poll.question}
        </h1>

        {/* Options preview */}
        <div className="space-y-4">
          {options.map((opt, idx) => (
            <div
              key={opt.id}
              className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {idx === 0 ? "🐱" : idx === 1 ? "😺" : idx === 2 ? "😸" : "🐈"}
              </div>
              <span className="text-2xl text-white font-medium">{opt.text}</span>
            </div>
          ))}
        </div>

        {/* Vote count */}
        <div className="mt-8 text-white/60 text-lg">
          {poll.totalVotes} votes so far
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

  const { data: poll } = trpc.polls.getCurrent.useQuery(undefined, {
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
