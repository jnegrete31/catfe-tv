import type { Screen, Settings } from "@shared/types";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Template element type (matches the schema)
interface TemplateElement {
  id: string;
  type: "title" | "subtitle" | "body" | "photo" | "qrCode" | "logo" | "clock" | "weather" | "counter" | "galleryGrid" | "adoptionGrid" | "catPhoto";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  padding?: number;
  objectFit?: "cover" | "contain" | "fill";
  visible?: boolean;
  galleryType?: "snap_purr" | "happy_tails"; // For gallery grid elements
  photosToShow?: number; // Number of photos to display in gallery
}

// Widget overrides type for per-slide widget customization
interface WidgetOverride {
  visible?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  size?: number;
  label?: string;
  showDate?: boolean;
}

interface WidgetOverrides {
  logo?: WidgetOverride;
  weather?: WidgetOverride;
  clock?: WidgetOverride;
  waiverQr?: WidgetOverride;
}

interface TemplateRendererProps {
  screen: Screen;
  settings: Settings | null;
  adoptionCount?: number;
  adoptionCats?: Screen[];
}

// Clock component for template
function ClockElement({ style }: { style: React.CSSProperties }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  });
  const dateStr = now.toLocaleDateString("en-US", { 
    weekday: "short", 
    month: "short", 
    day: "numeric" 
  });
  
  return (
    <div style={style} className="flex flex-col items-center justify-center">
      <span className="font-bold">{timeStr}</span>
      <span className="text-sm opacity-70">{dateStr}</span>
    </div>
  );
}

// Weather placeholder component
function WeatherElement({ style }: { style: React.CSSProperties }) {
  return (
    <div style={style} className="flex items-center justify-center gap-2">
      <span className="text-2xl">☀️</span>
      <span>72°F</span>
    </div>
  );
}

// Gallery Grid Element - fetches and displays photos from database
function GalleryGridElement({ 
  element, 
  style 
}: { 
  element: TemplateElement; 
  style: React.CSSProperties;
}) {
  const galleryType = element.galleryType || "snap_purr";
  const photosToShow = element.photosToShow || 3;
  
  const { data: photos } = trpc.photos.getApproved.useQuery({ type: galleryType });
  const [displayedPhotos, setDisplayedPhotos] = useState<typeof photos>([]);
  
  // Shuffle photos every 6 seconds
  useEffect(() => {
    if (!photos || photos.length === 0) return;
    
    const shufflePhotos = () => {
      const shuffled = [...photos].sort(() => Math.random() - 0.5);
      setDisplayedPhotos(shuffled.slice(0, photosToShow));
    };
    
    shufflePhotos();
    
    if (photos.length > photosToShow) {
      const interval = setInterval(shufflePhotos, 6000);
      return () => clearInterval(interval);
    }
  }, [photos, photosToShow]);
  
  const currentPhotos = displayedPhotos || [];
  
  // Polaroid rotation angles for visual interest
  const rotations = [-3, 2, -2, 3, -1];
  
  if (!photos || photos.length === 0) {
    return (
      <div style={style} className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-white/60 text-lg">No photos yet</p>
          <p className="text-white/40 text-sm">Scan the QR code to share!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={style} className="flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhotos.map(p => p.id).join('-')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-6 w-full h-full px-4"
        >
          {currentPhotos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8, rotate: rotations[idx % rotations.length] - 10 }}
              animate={{ opacity: 1, scale: 1, rotate: rotations[idx % rotations.length] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: idx * 0.15, duration: 0.5, type: 'spring', stiffness: 100 }}
              className="flex-1"
              style={{ 
                maxWidth: `${90 / photosToShow}%`,
                transform: `rotate(${rotations[idx % rotations.length]}deg)` 
              }}
            >
              {/* Polaroid frame */}
              <div className="bg-white p-3 pb-12 shadow-2xl rounded-sm" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || "Gallery photo"}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Caption */}
                {photo.caption && (
                  <div className="mt-2 text-center">
                    <p className="text-gray-700 text-sm font-medium truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Render a single template element with screen data
function RenderElement({ 
  element, 
  screen, 
  settings,
  adoptionCount 
}: { 
  element: TemplateElement; 
  screen: Screen; 
  settings: Settings | null;
  adoptionCount?: number;
}) {
  if (element.visible === false) return null;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    opacity: element.opacity || 1,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    zIndex: element.zIndex || 1,
    borderRadius: element.borderRadius || 0,
    padding: element.padding || 0,
    backgroundColor: element.backgroundColor || "transparent",
    display: "flex",
    alignItems: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const textStyle: React.CSSProperties = {
    fontSize: element.fontSize || 24,
    fontWeight: element.fontWeight || "normal",
    fontFamily: element.fontFamily || "Inter, sans-serif",
    color: element.color || "#ffffff",
    textAlign: element.textAlign || "center",
    width: "100%",
    lineHeight: 1.2,
  };

  switch (element.type) {
    case "title":
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={baseStyle}
        >
          <h1 style={textStyle}>{screen.title}</h1>
        </motion.div>
      );

    case "subtitle":
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={baseStyle}
        >
          <h2 style={textStyle}>{screen.subtitle || ""}</h2>
        </motion.div>
      );

    case "body":
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={baseStyle}
        >
          <p style={textStyle}>{screen.body || ""}</p>
        </motion.div>
      );

    case "photo":
      if (!screen.imagePath) {
        return (
          <div style={baseStyle} className="bg-gray-800/50 flex items-center justify-center">
            <span className="text-4xl">🐱</span>
          </div>
        );
      }
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={baseStyle}
        >
          <img
            src={screen.imagePath}
            alt={screen.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: element.objectFit || "cover",
              borderRadius: element.borderRadius || 0,
            }}
          />
        </motion.div>
      );

    case "qrCode":
      if (!screen.qrUrl) return null;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ ...baseStyle, backgroundColor: "white", padding: 8 }}
        >
          <QRCodeSVG
            value={screen.qrUrl}
            style={{ width: "100%", height: "100%" }}
            level="M"
          />
        </motion.div>
      );

    case "logo":
      const logoUrl = settings?.logoUrl;
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={baseStyle}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-3xl">🐱</span>
              <span style={textStyle}>Catfé</span>
            </div>
          )}
        </motion.div>
      );

    case "clock":
      return <ClockElement style={{ ...baseStyle, ...textStyle }} />;

    case "weather":
      return <WeatherElement style={{ ...baseStyle, ...textStyle }} />;

    case "counter":
      const count = adoptionCount || 0;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={baseStyle}
        >
          <span style={{ ...textStyle, fontWeight: "bold" }}>{count}</span>
        </motion.div>
      );

    case "galleryGrid":
      // Dynamic gallery grid that fetches photos from database
      return <GalleryGridElement element={element} style={baseStyle} />;

    case "adoptionGrid":
      // Placeholder for adoption grid - will be rendered by parent component
      return (
        <div style={{ ...baseStyle, border: "2px dashed rgba(255,255,255,0.3)", borderRadius: 8 }} className="flex items-center justify-center">
          <span className="text-white/50 text-lg">🐱 Adoption Cats Load Here</span>
        </div>
      );

    case "catPhoto":
      // Cat photo from the screen's imagePath
      if (!screen.imagePath) {
        return (
          <div style={baseStyle} className="bg-gray-800/50 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <span className="text-6xl">🐱</span>
              <p className="text-white/50 mt-2">Photo Coming Soon</p>
            </div>
          </div>
        );
      }
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ ...baseStyle, backgroundColor: "white", padding: "12px", paddingBottom: "48px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
        >
          <img
            src={screen.imagePath}
            alt={screen.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: element.objectFit || "cover",
              borderRadius: 4,
            }}
          />
        </motion.div>
      );

    default:
      return null;
  }
}

// Main template-based renderer
export function TemplateRenderer({ screen, settings, adoptionCount }: TemplateRendererProps) {
  // Fetch template for this screen type
  const { data: template } = trpc.templates.getByScreenType.useQuery(
    { screenType: screen.type },
    { staleTime: 60000 } // Cache for 1 minute
  );

  // Parse elements from template
  let elements: TemplateElement[] = [];
  try {
    elements = JSON.parse(template?.elements || "[]");
  } catch (e) {
    console.error("Failed to parse template elements:", e);
  }

  // Parse widget overrides from template
  let widgetOverrides: WidgetOverrides = {};
  try {
    if (template && 'widgetOverrides' in template && template.widgetOverrides) {
      widgetOverrides = JSON.parse(template.widgetOverrides as string);
    }
  } catch (e) {
    console.error("Failed to parse widget overrides:", e);
  }

  // If no template or no elements, return null (fallback to default renderer)
  if (!template || elements.length === 0) {
    return null;
  }

  const backgroundColor = template.backgroundColor || "#1a1a2e";
  
  // Helper to render overlay widgets with overrides
  const renderOverlayWidgets = () => {
    const widgets = [];
    
    // Logo widget
    if (widgetOverrides.logo?.visible !== false && settings?.logoUrl) {
      const logo = widgetOverrides.logo || {};
      widgets.push(
        <div
          key="logo-widget"
          className="absolute"
          style={{
            left: `${logo.x || 2}%`,
            top: `${logo.y || 2}%`,
            width: `${logo.width || 8}%`,
            height: `${logo.height || 8}%`,
            opacity: logo.opacity || 1,
            zIndex: 100,
          }}
        >
          <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
        </div>
      );
    }
    
    // Weather widget
    if (widgetOverrides.weather?.visible !== false) {
      const weather = widgetOverrides.weather || {};
      widgets.push(
        <div
          key="weather-widget"
          className="absolute flex items-center gap-1"
          style={{
            left: `${weather.x || 85}%`,
            top: `${weather.y || 2}%`,
            fontSize: weather.fontSize || 18,
            color: weather.color || "#ffffff",
            opacity: weather.opacity || 1,
            zIndex: 100,
          }}
        >
          <span>☀️</span>
          <span>72°F</span>
        </div>
      );
    }
    
    // Clock widget
    if (widgetOverrides.clock?.visible !== false) {
      const clock = widgetOverrides.clock || {};
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      widgets.push(
        <div
          key="clock-widget"
          className="absolute text-right"
          style={{
            right: `${100 - (clock.x || 92) - 8}%`,
            top: `${clock.y || 2}%`,
            fontSize: clock.fontSize || 24,
            color: clock.color || "#ffffff",
            opacity: clock.opacity || 1,
            zIndex: 100,
          }}
        >
          <div className="font-bold">{timeStr}</div>
          {clock.showDate !== false && <div className="text-sm opacity-70">{dateStr}</div>}
        </div>
      );
    }
    
    // Waiver QR widget
    if (widgetOverrides.waiverQr?.visible !== false && settings?.waiverUrl) {
      const qr = widgetOverrides.waiverQr || {};
      widgets.push(
        <div
          key="waiver-qr-widget"
          className="absolute flex flex-col items-center"
          style={{
            left: `${qr.x || 2}%`,
            top: `${qr.y || 2}%`,
            opacity: qr.opacity || 1,
            zIndex: 100,
          }}
        >
          <div className="bg-white p-2 rounded-lg">
            <QRCodeSVG value={settings.waiverUrl} size={qr.size || 80} level="M" />
          </div>
          <span className="text-white text-xs mt-1">{qr.label || "Sign Waiver"}</span>
        </div>
      );
    }
    
    return widgets;
  };

  // Determine if using dark or light background for appropriate decorations
  const isDarkBg = backgroundColor.startsWith('#1') || backgroundColor.startsWith('#2') || backgroundColor.startsWith('#0');
  
  return (
    <div
      className="tv-screen relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Lounge-inspired warm amber light glows (like wicker pendant lights) */}
      {isDarkBg && (
        <>
          <div 
            className="absolute -top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #d97706 0%, transparent 70%)" }}
          />
          <div 
            className="absolute -top-20 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)" }}
          />
        </>
      )}

      {/* Mint green floor reflection (matching epoxy floor) */}
      {isDarkBg && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 opacity-30"
          style={{ 
            background: "linear-gradient(to top, #a8d5ba 0%, transparent 100%)",
          }}
        />
      )}

      {/* Playful cat silhouette decorations */}
      {isDarkBg && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-4 right-8 text-6xl opacity-10">🐱</div>
          <div className="absolute top-1/3 left-4 text-4xl opacity-5 rotate-12">🐾</div>
          <div className="absolute bottom-1/4 left-1/4 text-3xl opacity-5">🐾</div>
        </div>
      )}

      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: isDarkBg 
            ? "radial-gradient(ellipse at center top, rgba(217,119,6,0.15) 0%, transparent 50%)"
            : "radial-gradient(ellipse at center top, rgba(0,0,0,0.05) 0%, transparent 50%)",
        }}
      />

      {/* Render all template elements */}
      {elements.map((element) => (
        <RenderElement
          key={element.id}
          element={element}
          screen={screen}
          settings={settings}
          adoptionCount={adoptionCount}
        />
      ))}

      {/* Render overlay widgets with per-slide customizations */}
      {renderOverlayWidgets()}
    </div>
  );
}

// Hook to check if a template exists for a screen type
export function useHasTemplate(screenType: string): boolean {
  const { data: template } = trpc.templates.getByScreenType.useQuery(
    { screenType },
    { staleTime: 60000 }
  );
  
  try {
    const elements = JSON.parse(template?.elements || "[]");
    return elements.length > 0;
  } catch {
    return false;
  }
}
