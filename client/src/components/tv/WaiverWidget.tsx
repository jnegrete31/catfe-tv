import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";
import { FileText } from "lucide-react";

/**
 * WaiverWidget - A small overlay showing QR code for guest waiver
 * Positioned in the top-left area of the TV display (where poll widget used to be)
 * Only shows when waiverUrl is configured in settings
 * 
 * Uses responsive CSS classes for proper scaling on different TV sizes
 */
export function WaiverWidget() {
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    staleTime: 60000, // Cache for 1 minute
  });

  // Don't show if no waiver URL is configured
  if (!settings?.waiverUrl) {
    return null;
  }

  return (
    <div className="absolute tv-widget-position-top-left z-40 animate-in fade-in slide-in-from-left duration-500">
      <div 
        className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl tv-widget-padding shadow-2xl"
        style={{ minWidth: 'clamp(200px, 20vw, 400px)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-[clamp(0.5rem,1vw,1rem)] mb-[clamp(0.5rem,1vw,1.5rem)]">
          <FileText className="tv-icon-md text-white" />
          <span className="text-white font-bold tv-widget-text-xl">Sign Waiver</span>
        </div>
        
        {/* QR Code */}
        <div className="bg-white p-[clamp(0.25rem,0.5vw,0.75rem)] rounded-xl qr-responsive">
          <QRCodeSVG
            value={settings.waiverUrl}
            size={200}
            level="M"
            includeMargin={false}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
