import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";
import { FileText } from "lucide-react";

/**
 * WaiverWidget - A compact vertical overlay showing QR code for guest waiver
 * Positioned in the top-left area of the TV display
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
        className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl flex flex-col items-center"
        style={{ 
          padding: 'clamp(0.5rem, 1vw, 1rem)',
          width: 'clamp(80px, 8vw, 140px)'
        }}
      >
        {/* Icon */}
        <FileText 
          className="text-white mb-[clamp(0.25rem,0.5vw,0.5rem)]" 
          style={{ width: 'clamp(16px, 1.5vw, 28px)', height: 'clamp(16px, 1.5vw, 28px)' }}
        />
        
        {/* Label */}
        <span 
          className="text-white font-bold text-center mb-[clamp(0.25rem,0.5vw,0.5rem)]"
          style={{ fontSize: 'clamp(0.5rem, 0.9vw, 1rem)', lineHeight: 1.2 }}
        >
          Sign Waiver
        </span>
        
        {/* QR Code - smaller */}
        <div 
          className="bg-white rounded-lg"
          style={{ padding: 'clamp(0.15rem, 0.3vw, 0.4rem)' }}
        >
          <QRCodeSVG
            value={settings.waiverUrl}
            size={100}
            level="M"
            includeMargin={false}
            style={{ 
              width: 'clamp(50px, 5vw, 90px)', 
              height: 'clamp(50px, 5vw, 90px)' 
            }}
          />
        </div>
      </div>
    </div>
  );
}
