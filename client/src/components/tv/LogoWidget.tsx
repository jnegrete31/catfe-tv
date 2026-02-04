import { trpc } from "@/lib/trpc";

/**
 * LogoWidget - A small logo overlay in the bottom-left corner
 * Shows the cat cafe logo consistently across all screens
 * 
 * Uses responsive CSS classes for proper scaling on different TV sizes
 */
export function LogoWidget() {
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    staleTime: 60000, // Cache for 1 minute
  });

  const logoUrl = settings?.logoUrl;

  if (!logoUrl) {
    return null;
  }

  return (
    <div className="absolute tv-widget-position-bottom-left z-40">
      <div className="tv-logo rounded-full overflow-hidden shadow-lg bg-white/90 p-[clamp(0.125rem,0.25vw,0.25rem)]">
        <img 
          src={logoUrl} 
          alt="Logo"
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    </div>
  );
}
