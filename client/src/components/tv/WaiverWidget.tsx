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
          padding: 'clamp(0.575rem, 1.15vw, 1.15rem)',
          width: 'clamp(92px, 9.2vw, 161px)'
        }}
      >
        {/* Icon */}
        <FileText 
          className="text-white mb-[clamp(0.29rem,0.575vw,0.575rem)]" 
          style={{ width: 'clamp(18px, 1.725vw, 32px)', height: 'clamp(18px, 1.725vw, 32px)' }}
        />
        
        {/* Label */}
        <span 
          className="text-white font-bold text-center mb-[clamp(0.29rem,0.575vw,0.575rem)]"
          style={{ fontSize: 'clamp(0.575rem, 1.035vw, 1.15rem)', lineHeight: 1.2 }}
        >
          Sign Waiver
        </span>
        
        {/* QR Code - smaller */}
        <div 
          className="bg-white rounded-lg"
          style={{ padding: 'clamp(0.17rem, 0.345vw, 0.46rem)' }}
        >
          <QRCodeSVG
            value={settings.waiverUrl}
            size={115}
            level="M"
            includeMargin={false}
            style={{ 
              width: 'clamp(57px, 5.75vw, 103px)', 
              height: 'clamp(57px, 5.75vw, 103px)' 
            }}
          />
        </div>
      </div>
    </div>
  );
}
