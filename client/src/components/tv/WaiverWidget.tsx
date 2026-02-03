import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";
import { FileText } from "lucide-react";

/**
 * WaiverWidget - A small overlay showing QR code for guest waiver
 * Positioned in the bottom-right area of the TV display
 * Only shows when waiverUrl is configured in settings
 * 
 * Sized for TV visibility with safe area margins for overscan
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
    <div className="absolute bottom-12 right-12 z-40 animate-in fade-in slide-in-from-right duration-500">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl flex items-center gap-5">
        {/* Icon and text */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-800">Sign Waiver</span>
          </div>
          <p className="text-sm text-gray-600 max-w-[140px]">
            Scan to complete your waiver
          </p>
        </div>
        
        {/* QR Code */}
        <div className="bg-white p-2 rounded-xl border border-gray-100">
          <QRCodeSVG
            value={settings.waiverUrl}
            size={90}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>
    </div>
  );
}
