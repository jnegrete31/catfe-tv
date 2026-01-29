import { motion, AnimatePresence } from "framer-motion";
import type { Screen, Settings } from "@shared/types";
import { SCREEN_TYPE_CONFIG } from "@shared/types";
import { QRCodeSVG } from "qrcode.react";

interface ScreenRendererProps {
  screen: Screen;
  settings: Settings | null;
}

// Base layout for all screen types
function ScreenLayout({ 
  children, 
  bgColor,
  imagePath,
}: { 
  children: React.ReactNode;
  bgColor?: string;
  imagePath?: string | null;
}) {
  return (
    <div 
      className="tv-screen relative flex items-center justify-center"
      style={{ 
        backgroundColor: bgColor || "var(--background)",
      }}
    >
      {/* Background image with overlay */}
      {imagePath && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imagePath})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-16">
        {children}
      </div>
    </div>
  );
}

// QR Code component
function QRCode({ url, size = 180 }: { url: string; size?: number }) {
  return (
    <div className="qr-container">
      <QRCodeSVG 
        value={url} 
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  );
}

// SNAP_AND_PURR - Photo sharing prompt
function SnapAndPurrScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} bgColor="#fce7f3">
      <div className="text-center text-white max-w-4xl">
        <h1 className="tv-text-large mb-6 drop-shadow-lg">
          {screen.title || "Snap & Purr!"}
        </h1>
        {screen.subtitle && (
          <p className="tv-text-medium mb-8 drop-shadow-md">
            {screen.subtitle}
          </p>
        )}
        {screen.body && (
          <p className="tv-text-body mb-8 drop-shadow">
            {screen.body}
          </p>
        )}
        {screen.qrUrl && (
          <div className="flex justify-center">
            <QRCode url={screen.qrUrl} size={200} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// EVENT - Special events
function EventScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} bgColor="#ede9fe">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8">
        <div className="text-white flex-1">
          <div className="inline-block px-4 py-2 rounded-full bg-purple-500 text-white text-lg mb-4">
            Event
          </div>
          <h1 className="tv-text-large mb-4 drop-shadow-lg">
            {screen.title}
          </h1>
          {screen.subtitle && (
            <p className="tv-text-medium mb-4 drop-shadow-md">
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="tv-text-body drop-shadow">
              {screen.body}
            </p>
          )}
        </div>
        {screen.qrUrl && (
          <div className="flex-shrink-0">
            <QRCode url={screen.qrUrl} size={180} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// TODAY_AT_CATFE - Daily specials/activities
function TodayAtCatfeScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} bgColor="#fef3c7">
      <div className="text-center max-w-5xl">
        <div className="inline-block px-6 py-3 rounded-full bg-amber-500 text-white text-xl mb-6">
          Today at {settings?.locationName || "Catfé"}
        </div>
        <h1 className="tv-text-large mb-6 text-amber-900 drop-shadow-sm">
          {screen.title}
        </h1>
        {screen.subtitle && (
          <p className="tv-text-medium mb-6 text-amber-800">
            {screen.subtitle}
          </p>
        )}
        {screen.body && (
          <p className="tv-text-body text-amber-700 mb-8">
            {screen.body}
          </p>
        )}
        {screen.qrUrl && (
          <div className="flex justify-center">
            <QRCode url={screen.qrUrl} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// MEMBERSHIP - Membership promotion
function MembershipScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} bgColor="#d1fae5">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8">
        <div className="flex-1">
          <div className="inline-block px-4 py-2 rounded-full bg-emerald-500 text-white text-lg mb-4">
            Membership
          </div>
          <h1 className="tv-text-large mb-4 text-emerald-900">
            {screen.title}
          </h1>
          {screen.subtitle && (
            <p className="tv-text-medium mb-4 text-emerald-800">
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="tv-text-body text-emerald-700">
              {screen.body}
            </p>
          )}
        </div>
        {screen.qrUrl && (
          <div className="flex-shrink-0">
            <QRCode url={screen.qrUrl} size={200} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// REMINDER - General reminders
function ReminderScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} bgColor="#dbeafe">
      <div className="text-center max-w-4xl">
        <div className="inline-block px-4 py-2 rounded-full bg-blue-500 text-white text-lg mb-6">
          Reminder
        </div>
        <h1 className="tv-text-large mb-6 text-blue-900">
          {screen.title}
        </h1>
        {screen.subtitle && (
          <p className="tv-text-medium mb-4 text-blue-800">
            {screen.subtitle}
          </p>
        )}
        {screen.body && (
          <p className="tv-text-body text-blue-700">
            {screen.body}
          </p>
        )}
      </div>
    </ScreenLayout>
  );
}

// ADOPTION - Cat adoption promotion
function AdoptionScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} bgColor="#fee2e2">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8">
        <div className="text-white flex-1">
          <div className="inline-block px-4 py-2 rounded-full bg-red-500 text-white text-lg mb-4">
            Adopt Me!
          </div>
          <h1 className="tv-text-large mb-4 drop-shadow-lg">
            {screen.title}
          </h1>
          {screen.subtitle && (
            <p className="tv-text-medium mb-4 drop-shadow-md">
              {screen.subtitle}
            </p>
          )}
          {screen.body && (
            <p className="tv-text-body drop-shadow">
              {screen.body}
            </p>
          )}
        </div>
        {screen.qrUrl && (
          <div className="flex-shrink-0">
            <QRCode url={screen.qrUrl} size={180} />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// THANK_YOU - Appreciation messages
function ThankYouScreen({ screen, settings }: ScreenRendererProps) {
  return (
    <ScreenLayout imagePath={screen.imagePath} bgColor="#e0e7ff">
      <div className="text-center max-w-4xl">
        <h1 className="tv-text-large mb-6 text-indigo-900">
          {screen.title || "Thank You!"}
        </h1>
        {screen.subtitle && (
          <p className="tv-text-medium mb-4 text-indigo-800">
            {screen.subtitle}
          </p>
        )}
        {screen.body && (
          <p className="tv-text-body text-indigo-700">
            {screen.body}
          </p>
        )}
      </div>
    </ScreenLayout>
  );
}

// Main renderer that selects the appropriate component
export function ScreenRenderer({ screen, settings }: ScreenRendererProps) {
  const renderers: Record<string, React.FC<ScreenRendererProps>> = {
    SNAP_AND_PURR: SnapAndPurrScreen,
    EVENT: EventScreen,
    TODAY_AT_CATFE: TodayAtCatfeScreen,
    MEMBERSHIP: MembershipScreen,
    REMINDER: ReminderScreen,
    ADOPTION: AdoptionScreen,
    THANK_YOU: ThankYouScreen,
  };
  
  const Renderer = renderers[screen.type] || EventScreen;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        <Renderer screen={screen} settings={settings} />
      </motion.div>
    </AnimatePresence>
  );
}

// Fallback screen when no content is available
export function FallbackScreen({ settings }: { settings: Settings | null }) {
  return (
    <div 
      className="tv-screen flex items-center justify-center"
      style={{ backgroundColor: "#f5f0e8" }}
    >
      <div className="text-center">
        <h1 className="tv-text-large text-amber-800 mb-4">
          {settings?.locationName || "Catfé"}
        </h1>
        <p className="tv-text-medium text-amber-600">
          Welcome! Content loading...
        </p>
      </div>
    </div>
  );
}
