import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

type PollOption = {
  id: string;
  text: string;
  imageUrl?: string;
  voteCount?: number;
};

/**
 * PollResultsWidget - A small overlay in the top-right corner showing poll results
 * Shows during results time (x:25-x:29 and x:55-x:59)
 * Displays: poll question, results with percentages, winner highlight
 */
export function PollResultsWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWidget, setShowWidget] = useState(false);

  const { data: poll } = trpc.polls.getForTV.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds during results
  });

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine if we should show the widget based on time (15-minute intervals)
  useEffect(() => {
    const minutes = currentTime.getMinutes();
    
    // Show widget during results time: x:12-x:14, x:27-x:29, x:42-x:44, x:57-x:59 (3 min results)
    const minuteInQuarter = minutes % 15;
    const isResultsTime = minuteInQuarter >= 12 && minuteInQuarter < 15;
    
    setShowWidget(isResultsTime && !!poll);
  }, [currentTime, poll]);

  if (!showWidget || !poll) {
    return null;
  }

  // Calculate percentages and find winner
  const options = poll.options || [];
  const totalVotes = poll.totalVotes || 0;
  
  const optionsWithPercentage = options.map((opt: PollOption) => ({
    ...opt,
    percentage: totalVotes > 0 ? Math.round(((opt.voteCount || 0) / totalVotes) * 100) : 0,
  }));
  
  // Sort by vote count to find winner
  const sortedOptions = [...optionsWithPercentage].sort(
    (a, b) => (b.voteCount || 0) - (a.voteCount || 0)
  );
  const winner = sortedOptions[0];
  const hasWinner = totalVotes > 0 && winner;

  return (
    <div className="absolute top-4 left-4 z-40 animate-in fade-in slide-in-from-left duration-500">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 shadow-2xl max-w-xs">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📊</span>
          <span className="text-white font-bold text-lg">Poll Results!</span>
        </div>
        
        {/* Question */}
        <p className="text-white/90 text-sm font-medium mb-3 line-clamp-2">
          {poll.question}
        </p>
        
        {/* Results */}
        <div className="space-y-2">
          {sortedOptions.slice(0, 4).map((opt, idx) => {
            const isWinner = idx === 0 && hasWinner;
            return (
              <div 
                key={opt.id} 
                className={`flex items-center gap-2 ${isWinner ? 'bg-white/20 rounded-lg p-1' : ''}`}
              >
                {/* Cat image */}
                {opt.imageUrl ? (
                  <img 
                    src={opt.imageUrl} 
                    alt={opt.text}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                    🐱
                  </div>
                )}
                
                {/* Name and bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs text-white mb-0.5">
                    <span className="truncate font-medium">
                      {isWinner && "🏆 "}{opt.text.replace("Meet ", "")}
                    </span>
                    <span className="font-bold ml-1">{opt.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isWinner ? 'bg-yellow-300' : 'bg-white/60'
                      }`}
                      style={{ width: `${opt.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Total votes */}
        <p className="text-white/60 text-xs mt-3 text-center">
          {totalVotes} total votes
        </p>
      </div>
    </div>
  );
}
