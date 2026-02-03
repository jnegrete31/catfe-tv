import { trpc } from "@/lib/trpc";

/**
 * LogoWidget - A small logo overlay in the bottom-left corner
 * Shows the cat cafe logo consistently across all screens
 * 
 * Positioned with safe area margins for TV overscan
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
    <div className="absolute bottom-12 left-12 z-40">
      <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg bg-white/90 p-1">
        <img 
          src={logoUrl} 
          alt="Logo"
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    </div>
  );
}
