import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";

/**
 * PollWidget - A small overlay in the top-left corner showing the current poll
 * Shows during voting time (x:00-x:12, x:15-x:27, x:30-x:42, x:45-x:57)
 * Displays: poll question, QR code to vote, countdown to results
 * 
 * Sized larger for TV visibility with safe area margins for overscan
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
    
    // Show widget during voting time: x:00-x:12, x:15-x:27, x:30-x:42, x:45-x:57 (12 min voting)
    // Hide during results time: x:12-x:14, x:27-x:29, x:42-x:44, x:57-x:59 (3 min results)
    const minuteInQuarter = minutes % 15;
    const isVotingTime = minuteInQuarter < 12;
    
    setShowWidget(isVotingTime && !!poll);
    
    // Calculate minutes until results (results show at :12, :27, :42, :57)
    if (minuteInQuarter < 12) {
      setMinutesUntilResults(12 - minuteInQuarter);
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
    <div className="absolute top-12 left-12 z-40 animate-in fade-in slide-in-from-left duration-500">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 shadow-2xl" style={{ minWidth: '320px' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🗳️</span>
          <span className="text-white font-bold text-2xl">Cat Poll</span>
        </div>
        
        {/* Question */}
        <p className="text-white/90 text-lg font-medium mb-4 line-clamp-2">
          {poll.question}
        </p>
        
        {/* QR Code */}
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG
              value={voteUrl}
              size={100}
              level="M"
              includeMargin={false}
            />
          </div>
          <div className="flex-1">
            <p className="text-white/80 text-base mb-2">Scan to vote!</p>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-white text-base font-medium">
                ⏱️ Results in {minutesUntilResults} min
              </p>
            </div>
          </div>
        </div>
        
        {/* Vote count hint */}
        <p className="text-white/60 text-sm mt-3 text-center">
          {poll.totalVotes} votes so far
        </p>
      </div>
    </div>
  );
}
