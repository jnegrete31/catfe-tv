import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useState } from "react";
import {
  Tv, Settings, Play, Cat, Users, Camera, Image, ListMusic,
  Clock, QrCode, Heart, PawPrint, CalendarDays, LayoutGrid,
  Monitor, Smartphone, ChevronDown, ChevronRight, BookOpen,
  Palette, Timer, Upload, Star, MessageSquare, Sliders,
  Apple, Globe, Shield, Zap, Eye, Volume2
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [openGuide, setOpenGuide] = useState<string | null>(null);

  const toggleGuide = (id: string) => {
    setOpenGuide(openGuide === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-amber-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-amber-50/80 backdrop-blur-md border-b border-amber-200/50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Cat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Catfé TV
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="#features">Features</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="#how-to">How-To Guide</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/tv">
                <Tv className="w-4 h-4 mr-1" />
                TV Display
              </Link>
            </Button>
            {isAuthenticated && user?.role === "admin" ? (
              <Button asChild size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
              <Cat className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Catfé TV
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
            The all-in-one digital signage and guest management system for
          </p>
          <p className="text-xl md:text-2xl font-semibold text-primary mb-8">
            Catfé Lounge — Santa Clarita, CA
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/tv">
                <Play className="w-5 h-5 mr-2" />
                Launch TV Display
              </Link>
            </Button>
            {isAuthenticated && user?.role === "admin" ? (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white">
                <Link href="/admin">
                  <Settings className="w-5 h-5 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white">
                <a href={getLoginUrl()}>
                  <Settings className="w-5 h-5 mr-2" />
                  Admin Login
                </a>
              </Button>
            )}
            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
              <a href="#how-to">
                <BookOpen className="w-5 h-5 mr-2" />
                Staff Guide
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="bg-primary/5 border-y border-primary/10">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <QuickStat icon={<Monitor className="w-5 h-5" />} label="Screen Types" value="15+" />
            <QuickStat icon={<Users className="w-5 h-5" />} label="Guest Tracking" value="Real-time" />
            <QuickStat icon={<Camera className="w-5 h-5" />} label="Photo System" value="Upload & Vote" />
            <QuickStat icon={<Apple className="w-5 h-5" />} label="Apple TV" value="Native App" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete system for managing your cat lounge's TV displays, guest sessions, photo sharing, and more.
            </p>
          </div>

          {/* Primary Features - Large Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <FeatureCardLarge
              icon={<Tv className="w-7 h-7" />}
              title="TV Display System"
              description="Beautiful full-screen slides optimized for TVs. 15+ screen types including adoption profiles, events, photo galleries, membership promos, and more. Smooth transitions with auto-rotation."
              color="bg-blue-500"
              tags={["16:9 Layout", "Auto-Rotate", "Dark Theme", "Responsive"]}
            />
            <FeatureCardLarge
              icon={<Users className="w-7 h-7" />}
              title="Guest Session Management"
              description="Track guest check-ins with countdown timers. Welcome messages appear on TV when guests arrive. Automatic reminders at 5 minutes remaining. Support for Guest Pass (15min), Mini Meow (30min), and Full Meow (60min)."
              color="bg-green-500"
              tags={["Check-in/Out", "Countdown Timer", "Welcome Messages", "Chime Alerts"]}
            />
          </div>

          {/* Secondary Features - Medium Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <FeatureCard
              icon={<Heart className="w-6 h-6" />}
              title="Adoption Screens"
              description="Showcase adoptable cats with photos, personality traits, and QR codes. Track adopted cats with badges and a celebration counter."
              color="bg-pink-500"
            />
            <FeatureCard
              icon={<Camera className="w-6 h-6" />}
              title="Photo Upload System"
              description="Guests scan QR codes to upload photos. Snap & Purr for lounge visits, Happy Tails for adopted cats in new homes. Moderation queue included."
              color="bg-purple-500"
            />
            <FeatureCard
              icon={<ListMusic className="w-6 h-6" />}
              title="Playlist Management"
              description="Create multiple playlists (Lounge, Events, Orientation). Schedule playlists by time of day and day of week. Visual timeline editor."
              color="bg-indigo-500"
            />
            <FeatureCard
              icon={<CalendarDays className="w-6 h-6" />}
              title="Smart Scheduling"
              description="Set date ranges, days of week, and time windows for each slide. Toggle scheduling on/off per slide. Slides auto-show when active."
              color="bg-amber-500"
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6" />}
              title="Visual Slide Editor"
              description="Drag-and-drop editor to customize any slide. Move, resize, and style text and images. Snap-to-grid with center guides. Create custom slides."
              color="bg-teal-500"
            />
            <FeatureCard
              icon={<Apple className="w-6 h-6" />}
              title="Apple TV Native App"
              description="Native tvOS app with all the same screens, guest reminders, chime alerts, and real-time updates. Designed for Siri Remote navigation."
              color="bg-gray-700"
            />
          </div>

          {/* Tertiary Features - Small Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FeatureCardSmall icon={<QrCode className="w-5 h-5" />} title="QR Codes" description="Auto-generated on slides" />
            <FeatureCardSmall icon={<Clock className="w-5 h-5" />} title="Clock & Weather" description="Live overlay on all slides" />
            <FeatureCardSmall icon={<Star className="w-5 h-5" />} title="Photo Likes" description="Guests vote on favorites" />
            <FeatureCardSmall icon={<MessageSquare className="w-5 h-5" />} title="Cat Polls" description="Fun voting every 15 min" />
            <FeatureCardSmall icon={<Shield className="w-5 h-5" />} title="Waiver QR" description="Digital waiver on screen" />
            <FeatureCardSmall icon={<Globe className="w-5 h-5" />} title="WiFi & Rules" description="Check-in screen for guests" />
            <FeatureCardSmall icon={<Image className="w-5 h-5" />} title="Photo Frames" description="Cat-themed frame overlays" />
            <FeatureCardSmall icon={<Volume2 className="w-5 h-5" />} title="Chime Alerts" description="Sound on guest reminders" />
          </div>
        </div>
      </section>

      {/* Screen Types Gallery */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent border-t border-primary/10">
        <div className="container py-16">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              15+ Screen Types
            </h2>
            <p className="text-muted-foreground">Every slide type you need to run your cat lounge</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            <ScreenTypeCard icon={<PawPrint className="w-5 h-5" />} label="Snap & Purr" color="#ec4899" />
            <ScreenTypeCard icon={<CalendarDays className="w-5 h-5" />} label="Events" color="#8b5cf6" />
            <ScreenTypeCard icon={<Zap className="w-5 h-5" />} label="Today at Catfé" color="#f59e0b" />
            <ScreenTypeCard icon={<Star className="w-5 h-5" />} label="Membership" color="#10b981" />
            <ScreenTypeCard icon={<Clock className="w-5 h-5" />} label="Reminders" color="#3b82f6" />
            <ScreenTypeCard icon={<Heart className="w-5 h-5" />} label="Adoption" color="#ef4444" />
            <ScreenTypeCard icon={<LayoutGrid className="w-5 h-5" />} label="Adoption Grid" color="#f97316" />
            <ScreenTypeCard icon={<Heart className="w-5 h-5" />} label="Adopted Counter" color="#e11d48" />
            <ScreenTypeCard icon={<MessageSquare className="w-5 h-5" />} label="Thank You" color="#6366f1" />
            <ScreenTypeCard icon={<Camera className="w-5 h-5" />} label="Photo Gallery" color="#d946ef" />
            <ScreenTypeCard icon={<Image className="w-5 h-5" />} label="Happy Tails" color="#14b8a6" />
            <ScreenTypeCard icon={<QrCode className="w-5 h-5" />} label="Upload QR" color="#64748b" />
            <ScreenTypeCard icon={<Eye className="w-5 h-5" />} label="Livestream" color="#dc2626" />
            <ScreenTypeCard icon={<Globe className="w-5 h-5" />} label="Check-In" color="#059669" />
            <ScreenTypeCard icon={<Sliders className="w-5 h-5" />} label="Custom" color="#7c3aed" />
          </div>
        </div>
      </section>

      {/* How-To Guide Section */}
      <section id="how-to" className="container py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Staff Training Guide
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How to Use Catfé TV
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Step-by-step instructions for every feature. Click each section to expand.
            </p>
          </div>

          <div className="space-y-3">
            {/* Getting Started */}
            <GuideSection
              id="getting-started"
              title="Getting Started"
              icon={<Zap className="w-5 h-5" />}
              isOpen={openGuide === "getting-started"}
              onToggle={() => toggleGuide("getting-started")}
            >
              <GuideStep number={1} title="Log in to the Admin Dashboard">
                <p>Go to the homepage and click <strong>"Admin Login"</strong> or <strong>"Admin Dashboard"</strong>. You'll be redirected to sign in with your Manus account. Only authorized admin accounts can access the dashboard.</p>
              </GuideStep>
              <GuideStep number={2} title="Explore the Dashboard Tabs">
                <p>The admin dashboard has several tabs at the top:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li><strong>Screens</strong> — Manage all your TV slides</li>
                  <li><strong>Guests</strong> — Check in and track guest sessions</li>
                  <li><strong>Photos</strong> — Moderate guest photo uploads</li>
                  <li><strong>Playlists</strong> — Organize slides into playlists</li>
                  <li><strong>Settings</strong> — Configure global settings</li>
                </ul>
              </GuideStep>
              <GuideStep number={3} title="Launch the TV Display">
                <p>Click <strong>"Launch TV Display"</strong> on the homepage or go to <code>/tv</code>. This is the full-screen view that runs on your TV. On Apple TV, use the native Catfé TV app instead.</p>
              </GuideStep>
            </GuideSection>

            {/* Managing Slides */}
            <GuideSection
              id="managing-slides"
              title="Managing Slides (Screens Tab)"
              icon={<Tv className="w-5 h-5" />}
              isOpen={openGuide === "managing-slides"}
              onToggle={() => toggleGuide("managing-slides")}
            >
              <GuideStep number={1} title="View All Slides">
                <p>The <strong>Screens</strong> tab shows all your slides as cards. Each card shows the slide title, type, and an active/inactive toggle. Green means active (showing on TV), gray means inactive.</p>
              </GuideStep>
              <GuideStep number={2} title="Create a New Slide">
                <p>Click the <strong>"+ New Screen"</strong> button. Choose a screen type from the dropdown (Adoption, Event, Reminder, etc.). Fill in the title, subtitle, body text, and upload an image. Set the duration (how long it shows on TV).</p>
              </GuideStep>
              <GuideStep number={3} title="Toggle Slides On/Off">
                <p>Use the <strong>Active toggle</strong> on each card to quickly show or hide a slide from the TV rotation. No need to open the editor — just tap the toggle.</p>
              </GuideStep>
              <GuideStep number={4} title="Edit a Slide">
                <p>Click on any slide card to open the editor. You can change the text, image, type, duration, and scheduling. Click <strong>"Save"</strong> when done. Changes appear on TV within 60 seconds.</p>
              </GuideStep>
              <GuideStep number={5} title="Set Slide Duration">
                <p>Each slide has a <strong>Duration</strong> field (in seconds). This controls how long the slide shows before moving to the next one. Default is set in Settings. Common values: 10s for simple slides, 15-20s for text-heavy slides, 30s for check-in screens.</p>
              </GuideStep>
              <GuideStep number={6} title="Schedule a Slide">
                <p>Enable <strong>"Scheduling"</strong> on a slide to set when it appears. You can set a date range (start/end dates), specific days of the week, and a time window (e.g., only show between 10am-2pm). When scheduling is off, the slide shows anytime it's active.</p>
              </GuideStep>
              <GuideStep number={7} title="Upload Images">
                <p>Click the image area to upload a photo. Supports JPG, PNG, and HEIC (Apple Photos format). You can crop the image before uploading or click <strong>"Use Original"</strong> to skip cropping. Images are stored in the cloud.</p>
              </GuideStep>
            </GuideSection>

            {/* Adoption Screens */}
            <GuideSection
              id="adoption"
              title="Adoption Cat Profiles"
              icon={<Heart className="w-5 h-5" />}
              isOpen={openGuide === "adoption"}
              onToggle={() => toggleGuide("adoption")}
            >
              <GuideStep number={1} title="Create an Adoption Slide">
                <p>Create a new screen with type <strong>"Adoption"</strong>. Add the cat's name as the title, age/breed as the subtitle, and a description of their personality in the body text. Upload a clear photo of the cat.</p>
              </GuideStep>
              <GuideStep number={2} title="Add a QR Code Link">
                <p>In the <strong>QR URL</strong> field, paste the link to the cat's adoption page (e.g., from your rescue partner's website). A QR code will automatically appear on the TV slide with the label <strong>"Scan to Adopt Me"</strong>.</p>
              </GuideStep>
              <GuideStep number={3} title="Mark a Cat as Adopted">
                <p>When a cat gets adopted, open their slide and toggle <strong>"Adopted"</strong> to on. An "Adopted!" badge will appear on their slide. The adoption counter will automatically update.</p>
              </GuideStep>
              <GuideStep number={4} title="Adoption Showcase Grid">
                <p>The <strong>Adoption Showcase</strong> screen type shows 4 adoptable cats in a grid. It automatically pulls random cats from your active adoption slides and shuffles every 6 seconds.</p>
              </GuideStep>
              <GuideStep number={5} title="Adoption Counter">
                <p>The <strong>Adoption Counter</strong> screen shows the total number of cats adopted. Set the total count in <strong>Settings → Total Adoptions</strong>. Recently adopted cats' photos appear on either side of the counter.</p>
              </GuideStep>
            </GuideSection>

            {/* Guest Sessions */}
            <GuideSection
              id="guest-sessions"
              title="Guest Check-In & Sessions"
              icon={<Users className="w-5 h-5" />}
              isOpen={openGuide === "guest-sessions"}
              onToggle={() => toggleGuide("guest-sessions")}
            >
              <GuideStep number={1} title="Check In a Guest">
                <p>Go to the <strong>Guests</strong> tab and click <strong>"Check In"</strong>. Enter the guest's first name, party size, and select their session type:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li><strong>Guest Pass</strong> — 15 minutes</li>
                  <li><strong>Mini Meow</strong> — 30 minutes</li>
                  <li><strong>Full Meow</strong> — 60 minutes</li>
                </ul>
              </GuideStep>
              <GuideStep number={2} title="Welcome Message on TV">
                <p>When you check in a guest, a <strong>green welcome card</strong> appears on the TV (and Apple TV) for 20 seconds showing their name, party size, and session type. A chime sound plays to announce the arrival.</p>
              </GuideStep>
              <GuideStep number={3} title="Countdown Reminders">
                <p>When a guest has <strong>5 minutes or less</strong> remaining, an orange countdown card appears on the TV with their name and time remaining. The card turns red when under 2 minutes. A chime plays when the reminder first appears.</p>
              </GuideStep>
              <GuideStep number={4} title="Scheduled Reminders">
                <p>At <strong>:55</strong> each hour, a general reminder appears for Full Meow sessions. At <strong>:25 and :55</strong>, reminders appear for Mini Meow sessions. These are automatic — no action needed.</p>
              </GuideStep>
              <GuideStep number={5} title="Extend a Session">
                <p>From the Guests tab, click <strong>"+15 min"</strong> or <strong>"+30 min"</strong> on any active session to extend their time. The countdown timer updates automatically.</p>
              </GuideStep>
              <GuideStep number={6} title="Check Out a Guest">
                <p>Click <strong>"Check Out"</strong> when a guest leaves. Their session card disappears from the TV and moves to the completed list. The expired session card auto-hides after 30 seconds if you forget.</p>
              </GuideStep>
            </GuideSection>

            {/* Photo System */}
            <GuideSection
              id="photos"
              title="Photo Upload & Moderation"
              icon={<Camera className="w-5 h-5" />}
              isOpen={openGuide === "photos"}
              onToggle={() => toggleGuide("photos")}
            >
              <GuideStep number={1} title="How Guests Upload Photos">
                <p>Guests scan the QR code on the <strong>Snap & Purr</strong> or <strong>Happy Tails</strong> TV slides. This opens a mobile upload page where they can take or choose a photo, add their name, pick a caption, and optionally add a cat-themed frame.</p>
              </GuideStep>
              <GuideStep number={2} title="Moderate Submissions">
                <p>Go to the <strong>Photos</strong> tab in the admin dashboard. New submissions appear in the <strong>Pending</strong> queue. Click <strong>"Approve"</strong> to show the photo on TV, or <strong>"Reject"</strong> to remove it. You can also preview each photo before deciding.</p>
              </GuideStep>
              <GuideStep number={3} title="Feature a Photo">
                <p>After approving a photo, click the <strong>star icon</strong> to mark it as featured. Featured photos get a special star badge on the TV gallery slideshow.</p>
              </GuideStep>
              <GuideStep number={4} title="Photo Gallery on TV">
                <p>Approved photos appear in the <strong>Snap & Purr Gallery</strong> and <strong>Happy Tails Gallery</strong> slides. Photos rotate in groups of 3 with a shuffle animation every 6 seconds. Each photo shows the uploader's name and caption.</p>
              </GuideStep>
              <GuideStep number={5} title="Photo Likes & Voting">
                <p>Guests can vote on their favorite photos by scanning the <strong>Photo Vote QR code</strong>. The most-liked photos get highlighted in the gallery.</p>
              </GuideStep>
            </GuideSection>

            {/* Playlists */}
            <GuideSection
              id="playlists"
              title="Playlists & Scheduling"
              icon={<ListMusic className="w-5 h-5" />}
              isOpen={openGuide === "playlists"}
              onToggle={() => toggleGuide("playlists")}
            >
              <GuideStep number={1} title="What Are Playlists?">
                <p>Playlists are groups of slides that play together on the TV. You might have a <strong>"Lounge"</strong> playlist for normal hours, an <strong>"Events"</strong> playlist for special occasions, and a <strong>"Volunteer Orientation"</strong> playlist for training.</p>
              </GuideStep>
              <GuideStep number={2} title="Create a Playlist">
                <p>Go to the <strong>Playlists</strong> tab and click <strong>"New Playlist"</strong>. Give it a name and description. Then add slides to it by selecting from your existing screens.</p>
              </GuideStep>
              <GuideStep number={3} title="Set the Active Playlist">
                <p>Click <strong>"Set Active"</strong> on the playlist you want to play on TV. Only one playlist can be active at a time. The TV display will immediately switch to showing slides from the active playlist.</p>
              </GuideStep>
              <GuideStep number={4} title="Schedule Playlists">
                <p>You can schedule playlists to auto-activate at certain times. Add time slots with start/end times and days of the week. The system will automatically switch playlists based on the schedule.</p>
              </GuideStep>
              <GuideStep number={5} title="View the Schedule Timeline">
                <p>The <strong>Schedule Timeline</strong> at the bottom of the Playlists tab shows a 24-hour visual timeline of when each playlist is active. Switch between days to see the full weekly schedule.</p>
              </GuideStep>
            </GuideSection>

            {/* Visual Slide Editor */}
            <GuideSection
              id="slide-editor"
              title="Visual Slide Editor"
              icon={<Palette className="w-5 h-5" />}
              isOpen={openGuide === "slide-editor"}
              onToggle={() => toggleGuide("slide-editor")}
            >
              <GuideStep number={1} title="Open the Editor">
                <p>Click the <strong>"Editor"</strong> button in the admin dashboard header. Select a slide to customize from the dropdown, or create a new custom slide.</p>
              </GuideStep>
              <GuideStep number={2} title="Drag & Drop Elements">
                <p>Click on any text or image element on the canvas to select it. Drag to move, use the handles to resize. The properties panel on the right shows font size, color, and position controls.</p>
              </GuideStep>
              <GuideStep number={3} title="Use Snap-to-Grid">
                <p>Toggle the <strong>grid</strong> button to show alignment guides. Elements will snap to the grid and center lines as you drag them, making it easy to align content perfectly.</p>
              </GuideStep>
              <GuideStep number={4} title="Create Custom Slides">
                <p>Click <strong>"New Custom Slide"</strong> to create a completely blank slide. Add text, images, and other elements from scratch. Custom slides can be added to any playlist.</p>
              </GuideStep>
              <GuideStep number={5} title="Widget Controls">
                <p>Each slide can show or hide overlay widgets (logo, weather, clock, waiver QR). Use the widget toggles in the editor to control which widgets appear on each slide.</p>
              </GuideStep>
            </GuideSection>

            {/* Settings */}
            <GuideSection
              id="settings"
              title="Settings & Configuration"
              icon={<Settings className="w-5 h-5" />}
              isOpen={openGuide === "settings"}
              onToggle={() => toggleGuide("settings")}
            >
              <GuideStep number={1} title="Fallback Slide Duration">
                <p>Set the default duration (in seconds) for slides that don't have a custom duration. This is the fallback — individual slides can override this with their own duration setting.</p>
              </GuideStep>
              <GuideStep number={2} title="Total Adoptions Count">
                <p>Enter the total number of cats adopted from the lounge. This number appears on the <strong>Adoption Counter</strong> TV slide. Update it whenever a new cat is adopted.</p>
              </GuideStep>
              <GuideStep number={3} title="Logo Upload">
                <p>Upload your lounge's logo. It appears as an overlay on all TV slides (bottom-right corner on web, bottom-right on Apple TV).</p>
              </GuideStep>
              <GuideStep number={4} title="Waiver URL">
                <p>Enter the URL to your digital waiver. A QR code will appear on the TV so guests can scan and sign the waiver on their phone.</p>
              </GuideStep>
              <GuideStep number={5} title="WiFi & House Rules">
                <p>Enter your WiFi network name and password. Add house rules (one per line). These appear on the <strong>Check-In</strong> screen type to help new guests get settled.</p>
              </GuideStep>
              <GuideStep number={6} title="Refresh Interval">
                <p>Controls how often the TV checks for new content (in seconds). Default is 60 seconds. Lower values mean faster updates but more network traffic.</p>
              </GuideStep>
            </GuideSection>

            {/* Apple TV */}
            <GuideSection
              id="apple-tv"
              title="Apple TV App"
              icon={<Apple className="w-5 h-5" />}
              isOpen={openGuide === "apple-tv"}
              onToggle={() => toggleGuide("apple-tv")}
            >
              <GuideStep number={1} title="Installing the App">
                <p>The Catfé TV app is built with Xcode and deployed via <strong>TestFlight</strong>. Once installed on Apple TV, it connects to the same backend as the web display. All slides, settings, and guest sessions sync automatically.</p>
              </GuideStep>
              <GuideStep number={2} title="Using the Siri Remote">
                <p>The app runs in full-screen slideshow mode automatically. <strong>Swipe left/right</strong> on the remote to manually change slides. The app prevents the Apple TV screensaver from activating.</p>
              </GuideStep>
              <GuideStep number={3} title="Guest Reminders & Chimes">
                <p>The Apple TV app shows the same guest welcome messages and countdown reminders as the web display. A gentle chime sound plays when new reminders appear — it won't interrupt Apple Music or other audio playing in the background.</p>
              </GuideStep>
              <GuideStep number={4} title="Updating the App">
                <p>When changes are pushed to GitHub, open the project in Xcode, pull the latest code (<strong>Integrate → Pull</strong>), and build to your Apple TV. For TestFlight distribution, archive and upload to App Store Connect.</p>
              </GuideStep>
            </GuideSection>

            {/* Quick Links */}
            <GuideSection
              id="quick-links"
              title="Guest-Facing Pages (QR Destinations)"
              icon={<QrCode className="w-5 h-5" />}
              isOpen={openGuide === "quick-links"}
              onToggle={() => toggleGuide("quick-links")}
            >
              <GuideStep number={1} title="Photo Upload Pages">
                <p>These are the pages guests see when they scan QR codes on the TV:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li><strong>/upload/snap-purr</strong> — Upload lounge visit photos</li>
                  <li><strong>/upload/happy-tails</strong> — Upload photos of adopted cats in their new homes</li>
                </ul>
                <p className="mt-2">Both pages support photo cropping, cat-themed frames, captions, and anonymous uploads.</p>
              </GuideStep>
              <GuideStep number={2} title="Photo Voting Page">
                <p><strong>/photos/vote</strong> — Guests can browse and like their favorite Snap & Purr photos. The most-liked photos get highlighted in the gallery.</p>
              </GuideStep>
              <GuideStep number={3} title="Poll Voting Page">
                <p><strong>/vote/:pollId</strong> — When cat polls are active, guests scan the QR code to vote on fun questions like "Who has the fluffiest tail?" Results show on their phone after voting ends.</p>
              </GuideStep>
              <GuideStep number={4} title="Live Slideshow Page">
                <p><strong>/slideshow/:type</strong> — A mobile-friendly view of the photo gallery. Guests can watch the slideshow on their phone after uploading a photo.</p>
              </GuideStep>
            </GuideSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-primary/10">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6">
              Launch the TV display on your screen or log in to manage your content.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/tv">
                  <Play className="w-5 h-5 mr-2" />
                  Launch TV Display
                </Link>
              </Button>
              {isAuthenticated && user?.role === "admin" ? (
                <Button asChild variant="outline" size="lg" className="bg-white">
                  <Link href="/admin">
                    <Settings className="w-5 h-5 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="lg" className="bg-white">
                  <a href={getLoginUrl()}>
                    <Settings className="w-5 h-5 mr-2" />
                    Admin Login
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cat className="w-4 h-4 text-primary" />
            <p>Catfé TV — Digital Signage for Catfé Lounge, Santa Clarita, CA</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tv" className="hover:text-foreground transition">
              TV Display
            </Link>
            <Link href="/admin" className="hover:text-foreground transition">
              Admin
            </Link>
            <Link href="/upload/snap-purr" className="hover:text-foreground transition">
              Upload Photos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-Components ─── */

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-primary">{icon}</div>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function FeatureCardLarge({
  icon, title, description, color, tags
}: {
  icon: React.ReactNode; title: string; description: string; color: string; tags: string[];
}) {
  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white mb-5`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  icon, title, description, color
}: {
  icon: React.ReactNode; title: string; description: string; color: string;
}) {
  return (
    <div className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCardSmall({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card rounded-lg p-4 border flex items-start gap-3 hover:shadow-sm transition-shadow">
      <div className="text-primary mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ScreenTypeCard({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="bg-card rounded-xl p-3 border text-center hover:shadow-sm transition-shadow">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white mx-auto mb-2"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <p className="font-medium text-xs">{label}</p>
    </div>
  );
}

function GuideSection({
  id, title, icon, isOpen, onToggle, children
}: {
  id: string; title: string; icon: React.ReactNode; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <span className="font-semibold text-base flex-1">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 md:px-5 pb-5 pt-1 border-t bg-accent/20">
          <div className="space-y-4 mt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function GuideStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <div className="text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
