import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";

/**
 * PollWidget - A small overlay in the top-left corner showing the current poll
 * Shows during voting time (x:00-x:25 and x:30-x:55)
 * Displays: poll question, QR code to vote, countdown to results
 */
export function PollWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWidget, setShowWidget] = useState(false);
  const [minutesUntilResults, setMinutesUntilResults] = useState(0);

  const { data: poll } = trpc.polls.getForTV.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
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
    
    // Show widget during voting time: x:00-x:10, x:15-x:25, x:30-x:40, x:45-x:55
    // Hide during results time: x:10-x:14, x:25-x:29, x:40-x:44, x:55-x:59
    const minuteInQuarter = minutes % 15;
    const isVotingTime = minuteInQuarter < 10;
    
    setShowWidget(isVotingTime && !!poll);
    
    // Calculate minutes until results (results show at :10, :25, :40, :55)
    if (minuteInQuarter < 10) {
      setMinutesUntilResults(10 - minuteInQuarter);
    } else {
      setMinutesUntilResults(0); // Results showing
    }
  }, [currentTime, poll]);

  if (!showWidget || !poll) {
    return null;
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const voteUrl = `${baseUrl}/vote/${poll.id}`;

  return (
    <div className="absolute top-4 left-4 z-40 animate-in fade-in slide-in-from-left duration-500">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 shadow-2xl max-w-xs">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🗳️</span>
          <span className="text-white font-bold text-lg">Cat Poll</span>
        </div>
        
        {/* Question */}
        <p className="text-white/90 text-sm font-medium mb-3 line-clamp-2">
          {poll.question}
        </p>
        
        {/* QR Code */}
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <QRCodeSVG
              value={voteUrl}
              size={64}
              level="M"
              includeMargin={false}
            />
          </div>
          <div className="flex-1">
            <p className="text-white/80 text-xs mb-1">Scan to vote!</p>
            <div className="bg-white/20 rounded-lg px-2 py-1">
              <p className="text-white text-xs font-medium">
                ⏱️ Results in {minutesUntilResults} min
              </p>
            </div>
          </div>
        </div>
        
        {/* Vote count hint */}
        <p className="text-white/60 text-xs mt-2 text-center">
          {poll.totalVotes} votes so far
        </p>
      </div>
    </div>
  );
}
