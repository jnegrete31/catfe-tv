import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Share, Plus } from "lucide-react";

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if running on iOS Safari and not already installed as PWA
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    const hasBeenDismissed = localStorage.getItem('ios-install-dismissed');
    
    if (isIOS && !isStandalone && !hasBeenDismissed) {
      // Show prompt after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('ios-install-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Will show again next session
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Add to Home Screen</h3>
          <Button variant="ghost" size="icon" onClick={handleRemindLater}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-muted-foreground text-sm">
            Install Catfé TV on your iPhone for quick access and a native app experience.
          </p>
          
          {/* Instructions */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm">
                  Tap the <Share className="w-4 h-4 inline-block mx-1 text-primary" /> Share button in Safari
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm">
                  Scroll down and tap <span className="font-medium">"Add to Home Screen"</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm">
                  Tap <span className="font-medium">"Add"</span> in the top right corner
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleRemindLater}>
            Maybe Later
          </Button>
          <Button variant="ghost" className="text-muted-foreground" onClick={handleDismiss}>
            Don't Show Again
          </Button>
        </div>
      </div>
    </div>
  );
}
