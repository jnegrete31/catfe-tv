import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Tv, Settings, Play, ArrowRight, Cat } from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero Section */}
      <div className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Cat className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          
          <h1 
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Catfé TV
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Digital signage made simple. Display beautiful content on your TV screens 
            with easy scheduling and real-time updates.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/tv">
                <Play className="w-5 h-5 mr-2" />
                Launch TV Display
              </Link>
            </Button>
            
            {isAuthenticated && user?.role === "admin" ? (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/admin">
                  <Settings className="w-5 h-5 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <a href={getLoginUrl()}>
                  <Settings className="w-5 h-5 mr-2" />
                  Admin Login
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Tv className="w-8 h-8" />}
            title="Full-Screen Display"
            description="Beautiful 16:9 layouts optimized for TVs and digital displays with smooth fade transitions."
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="Easy Management"
            description="Mobile-friendly admin app to create, edit, and schedule content from your phone."
          />
          <FeatureCard
            icon={<Play className="w-8 h-8" />}
            title="Smart Scheduling"
            description="Set date ranges, days of week, and time windows to show the right content at the right time."
          />
        </div>
      </div>
      
      {/* Screen Types Preview */}
      <div className="container py-16">
        <h2 
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Multiple Screen Types
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <ScreenTypeCard color="#ec4899" label="Snap & Purr" />
          <ScreenTypeCard color="#8b5cf6" label="Events" />
          <ScreenTypeCard color="#f59e0b" label="Today at Catfé" />
          <ScreenTypeCard color="#10b981" label="Membership" />
          <ScreenTypeCard color="#3b82f6" label="Reminders" />
          <ScreenTypeCard color="#ef4444" label="Adoption" />
          <ScreenTypeCard color="#6366f1" label="Thank You" />
          <div className="bg-card rounded-xl p-4 border flex items-center justify-center">
            <span className="text-sm text-muted-foreground">+ More</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="container py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Catfé TV Digital Signage System</p>
          <div className="flex items-center gap-4">
            <Link href="/tv" className="hover:text-foreground transition">
              TV Display
            </Link>
            <Link href="/admin" className="hover:text-foreground transition">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function ScreenTypeCard({ color, label }: { color: string; label: string }) {
  return (
    <div className="bg-card rounded-xl p-4 border">
      <div 
        className="w-8 h-8 rounded-full mb-3"
        style={{ backgroundColor: color }}
      />
      <p className="font-medium text-sm">{label}</p>
    </div>
  );
}
