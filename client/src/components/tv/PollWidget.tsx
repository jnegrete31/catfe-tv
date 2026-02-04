import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";

/**
 * PollWidget - A small overlay in the top-left corner showing the current poll
 * Only displays QR code for voting - results are shown on guests' devices after voting ends
 * 
 * Uses responsive CSS classes for proper scaling on different TV sizes
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
    <div className="absolute tv-widget-position-top-left z-40 animate-in fade-in slide-in-from-left duration-500">
      <div 
        className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl tv-widget-padding shadow-2xl"
        style={{ minWidth: 'clamp(200px, 20vw, 400px)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-[clamp(0.5rem,1vw,1rem)] mb-[clamp(0.5rem,1vw,1.5rem)]">
          <span className="tv-widget-text-2xl">🗳️</span>
          <span className="text-white font-bold tv-widget-text-xl">Cat Poll</span>
        </div>
        
        {/* Question */}
        <p className="text-white/90 tv-widget-text-lg font-medium mb-[clamp(0.5rem,1vw,1.5rem)] line-clamp-2">
          {poll.question}
        </p>
        
        {/* QR Code */}
        <div className="flex items-center gap-[clamp(0.5rem,1.5vw,1.5rem)]">
          <div className="bg-white p-[clamp(0.25rem,0.5vw,0.75rem)] rounded-xl qr-responsive">
            <QRCodeSVG
              value={voteUrl}
              size={200}
              level="M"
              includeMargin={false}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="flex-1">
            <p className="text-white tv-widget-text-lg font-medium">Scan to vote!</p>
            <p className="text-white/70 text-[clamp(0.75rem,1vw,1.25rem)] mt-1">
              Results on your device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
