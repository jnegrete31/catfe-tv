import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";

/**
 * PollWidget - A small overlay in the top-left corner showing the current poll
 * Only displays QR code for voting - results are shown on guests' devices after voting ends
 * 
 * Sized larger for TV visibility with safe area margins for overscan
 */
export function PollWidget() {
  const { data: poll } = trpc.polls.getForTV.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!poll) {
    return null;
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const voteUrl = `${baseUrl}/vote/${poll.id}`;

  return (
    <div className="absolute top-12 left-12 z-40 animate-in fade-in slide-in-from-left duration-500">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 shadow-2xl" style={{ minWidth: '300px' }}>
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
            <p className="text-white text-lg font-medium">Scan to vote!</p>
            <p className="text-white/70 text-base mt-1">
              Results on your device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
