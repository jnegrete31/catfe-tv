import { motion } from "framer-motion";
import type { Screen, Settings } from "@shared/types";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";

// Template element type (matches the schema)
interface TemplateElement {
  id: string;
  type: "title" | "subtitle" | "body" | "photo" | "qrCode" | "logo" | "clock" | "weather" | "counter";
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
}

interface TemplateRendererProps {
  screen: Screen;
  settings: Settings | null;
  adoptionCount?: number;
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
      const count = adoptionCount || settings?.totalAdoptionCount || 0;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={baseStyle}
        >
          <span style={{ ...textStyle, fontWeight: "bold" }}>{count}</span>
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

  // If no template or no elements, return null (fallback to default renderer)
  if (!template || elements.length === 0) {
    return null;
  }

  const backgroundColor = template.backgroundColor || "#1a1a2e";

  return (
    <div
      className="tv-screen relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-white/30 rounded-full" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-white/30 rounded-full" />
      </div>

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse at center top, rgba(255,255,255,0.1) 0%, transparent 50%)",
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
