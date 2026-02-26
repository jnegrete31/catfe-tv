import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useState } from "react";
import {
  Cat, Camera, Heart, PawPrint, Upload, Gift, Star,
  ChevronDown, ChevronRight, Settings, Tv, BookOpen,
  Smartphone, QrCode, Trophy, Sparkles, Users,
  ArrowRight, Image, MessageSquare, Shield
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
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
              Catfé
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
              <a href="#how-it-works">How It Works</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
              <a href="#get-involved">Get Involved</a>
            </Button>
            {isAuthenticated && user?.role === "admin" ? (
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/admin">
                  <Settings className="w-3.5 h-3.5 mr-1" />
                  Staff
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="ghost" className="text-xs text-muted-foreground">
                <a href={getLoginUrl()}>Staff Login</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Guest Welcome */}
      <section className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <PawPrint className="w-4 h-4" />
            Welcome to Catfé Lounge
          </div>

          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Meet Our Cats,<br className="hidden sm:block" />
            Share Your Moments
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Snap photos of your favorite cats, vote on the cutest shots, and help support adoptable cats through our photo contest. Every donation goes directly to their care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Button asChild size="lg" className="w-full sm:w-auto shadow-md">
              <Link href="/vote/cats">
                <Camera className="w-5 h-5 mr-2" />
                Browse Cats & Vote
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white">
              <Link href="/upload/happy-tails">
                <Heart className="w-5 h-5 mr-2" />
                Happy Tails
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Santa Clarita, CA &middot; No account needed
          </p>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="bg-white/60 border-y border-amber-200/50">
        <div className="container py-5">
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            <QuickAction
              icon={<Camera className="w-5 h-5" />}
              label="Photo Contest"
              desc="Vote on cat photos"
              href="/vote/cats"
            />
            <QuickAction
              icon={<Heart className="w-5 h-5" />}
              label="Happy Tails"
              desc="Adopted cat updates"
              href="/upload/happy-tails"
            />
            <QuickAction
              icon={<Star className="w-5 h-5" />}
              label="Photo Gallery"
              desc="Browse all photos"
              href="/photos/vote"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container py-14 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How It Works
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Three easy ways to participate during your visit
            </p>
          </div>

          {/* Step Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StepCard
              number={1}
              icon={<Camera className="w-7 h-7" />}
              title="Snap a Photo"
              description="Find a cat you love, tap their profile, and upload up to 3 photos. Capture their personality!"
              color="bg-pink-500"
              cta="Browse Cats"
              href="/vote/cats"
            />
            <StepCard
              number={2}
              icon={<Heart className="w-7 h-7" />}
              title="Vote for Favorites"
              description="Browse photos from other guests and vote for the cutest ones. Everyone gets 1 free vote per photo — make it count!"
              color="bg-red-500"
              cta="Start Voting"
              href="/vote/cats"
            />
            <StepCard
              number={3}
              icon={<Gift className="w-7 h-7" />}
              title="Donate for Bonus Votes"
              description="Want more votes? Donate to support our cats and get bonus vote tokens. Every dollar helps with food, medical care, and shelter."
              color="bg-amber-600"
              cta="Learn More"
              href="#donation-tiers"
            />
          </div>
        </div>
      </section>

      {/* Photo Contest Explainer */}
      <section className="bg-gradient-to-b from-amber-100/50 to-amber-50 border-y border-amber-200/30">
        <div className="container py-14 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-200/60 text-amber-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Trophy className="w-4 h-4" />
                  Photo Contest
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your Photos on the Big Screen
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The top-voted photos for each cat appear on our in-lounge TV displays throughout the day. It's a fun way to see your photo featured and show off the cats you love.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Photos are tagged to each cat, so visitors can see which cats are the most popular and discover new favorites. The leaderboard updates in real time!
                </p>
                <Button asChild>
                  <Link href="/vote/cats">
                    See the Leaderboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-amber-200/50 shadow-sm">
                <div className="space-y-4">
                  <ContestFeature
                    icon={<Smartphone className="w-5 h-5" />}
                    title="Mobile-Friendly"
                    desc="Upload and vote right from your phone — no app download needed"
                  />
                  <ContestFeature
                    icon={<QrCode className="w-5 h-5" />}
                    title="Scan to Start"
                    desc="Look for QR codes around the lounge to jump straight to a cat's page"
                  />
                  <ContestFeature
                    icon={<Shield className="w-5 h-5" />}
                    title="No Account Required"
                    desc="Just pick a display name and start uploading — it's that simple"
                  />
                  <ContestFeature
                    icon={<Tv className="w-5 h-5" />}
                    title="Featured on TV"
                    desc="Top photos rotate on our lounge TV screens for everyone to enjoy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Tiers */}
      <section id="donation-tiers" className="container py-14 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Support Our Cats
            </div>
            <h2
              className="text-2xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Donation Vote Tokens
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Every donation goes directly to cat care — food, medical needs, and finding forever homes. As a thank you, you get bonus votes!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            <DonationTier
              emoji="🐾"
              name="Paw Print"
              price="$1"
              votes={5}
              description="A small gesture that makes a big difference"
              color="border-amber-300 bg-amber-50/50"
            />
            <DonationTier
              emoji="😺"
              name="Happy Cat"
              price="$5"
              votes={30}
              description="Helps cover a day of food and treats"
              popular
              color="border-pink-300 bg-pink-50/50"
            />
            <DonationTier
              emoji="🏆"
              name="Champion"
              price="$10"
              votes={75}
              description="Supports medical care and adoption prep"
              color="border-amber-400 bg-amber-50/50"
            />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Donations are processed securely through Stripe. You can donate from any cat's voting page.
          </p>
        </div>
      </section>

      {/* Get Involved Section */}
      <section id="get-involved" className="bg-gradient-to-b from-amber-100/50 to-amber-50 border-y border-amber-200/30">
        <div className="container py-14 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2
                className="text-2xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                More Ways to Participate
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Beyond the photo contest, here's how you can engage with Catfé
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <ActivityCard
                icon={<Heart className="w-6 h-6" />}
                title="Happy Tails Updates"
                description="Adopted a cat from Catfé? Share photos of them in their forever home! We love seeing our alumni living their best lives."
                cta="Share an Update"
                href="/upload/happy-tails"
                color="bg-teal-500"
              />
              <ActivityCard
                icon={<Star className="w-6 h-6" />}
                title="Photo Gallery & Likes"
                description="Browse the full gallery of guest photos and like your favorites. The most-liked photos get featured on our lounge displays."
                cta="Browse Gallery"
                href="/photos/vote"
                color="bg-indigo-500"
              />
              <ActivityCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="Cat Polls"
                description="Fun polls appear on our TV screens throughout the day — scan the QR code to vote on questions like 'Who has the fluffiest tail?'"
                cta="Watch for QR Codes"
                href="#"
                color="bg-amber-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Guide Sections */}
      <section className="container py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            <FAQItem
              question="How do I upload a photo?"
              isOpen={openSection === "faq-upload"}
              onToggle={() => toggleSection("faq-upload")}
            >
              <p>There are two ways to upload photos:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2 text-muted-foreground">
                <li><strong>Scan a QR code</strong> on the TV screens or table cards in the lounge. This takes you directly to the upload page for that cat.</li>
                <li><strong>Visit the Photo Contest page</strong> by tapping "Browse Cats & Vote" above, then select a cat and tap "Upload Photo."</li>
              </ol>
              <p className="mt-2">You can upload up to 3 photos per cat. Just enter a display name (it can be anything!) and pick or take a photo from your phone.</p>
            </FAQItem>

            <FAQItem
              question="How does voting work?"
              isOpen={openSection === "faq-voting"}
              onToggle={() => toggleSection("faq-voting")}
            >
              <p>Every visitor gets <strong>1 free vote per photo</strong>. Just tap the heart icon on any photo to cast your vote. No account needed — we use a simple browser fingerprint so you can vote right away.</p>
              <p className="mt-2">Want more votes? You can purchase bonus vote tokens through our donation tiers. The donations go directly to supporting the cats, and you get extra votes as a thank you.</p>
            </FAQItem>

            <FAQItem
              question="What happens to the top-voted photos?"
              isOpen={openSection === "faq-featured"}
              onToggle={() => toggleSection("faq-featured")}
            >
              <p>The highest-voted photos for each cat are featured on our <strong>in-lounge TV displays</strong> throughout the day. They appear in a special "Guest Photo Contest" slide that shows the top photos with a live leaderboard. It's a fun way to see your photo up on the big screen!</p>
            </FAQItem>

            <FAQItem
              question="Where do donations go?"
              isOpen={openSection === "faq-donations"}
              onToggle={() => toggleSection("faq-donations")}
            >
              <p>Every dollar donated through the photo contest goes directly to <strong>Catfé's cat care fund</strong>. This covers daily food and treats, medical checkups and vaccinations, spay/neuter procedures, and preparing cats for adoption. Donations are processed securely through Stripe.</p>
            </FAQItem>

            <FAQItem
              question="What is Happy Tails?"
              isOpen={openSection === "faq-types"}
              onToggle={() => toggleSection("faq-types")}
            >
              <p><strong>Happy Tails</strong> is for people who've adopted a cat from Catfé. Share photos of your cat in their forever home so we can celebrate their new life! These heartwarming updates appear on our lounge TV displays.</p>
            </FAQItem>

            <FAQItem
              question="Do I need an account?"
              isOpen={openSection === "faq-account"}
              onToggle={() => toggleSection("faq-account")}
            >
              <p><strong>No!</strong> You don't need to create an account or download an app. Everything works right from your phone's browser. Just scan a QR code or visit the site, pick a display name, and you're good to go.</p>
            </FAQItem>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary/5 border-t border-primary/10">
        <div className="container py-14">
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to Join the Fun?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start snapping photos, voting for your favorites, and supporting our adoptable cats.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="shadow-md">
                <Link href="/vote/cats">
                  <Camera className="w-5 h-5 mr-2" />
                  Browse Cats & Vote
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white">
                <Link href="/upload/happy-tails">
                  <Heart className="w-5 h-5 mr-2" />
                  Share a Happy Tail
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cat className="w-4 h-4 text-primary" />
            <p>Catfé Lounge — Santa Clarita, CA</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/vote/cats" className="hover:text-foreground transition">
              Photo Contest
            </Link>
            <Link href="/upload/happy-tails" className="hover:text-foreground transition">
              Happy Tails
            </Link>
            <Link href="/photos/vote" className="hover:text-foreground transition">
              Gallery
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/tv" className="hover:text-foreground transition">
              TV Display
            </Link>
            {isAuthenticated && user?.role === "admin" ? (
              <Link href="/admin" className="hover:text-foreground transition">
                Admin
              </Link>
            ) : (
              <a href={getLoginUrl()} className="hover:text-foreground transition">
                Staff
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-Components ─── */

function QuickAction({ icon, label, desc, href }: { icon: React.ReactNode; label: string; desc: string; href: string }) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl p-3.5 border border-amber-200/50 hover:shadow-md hover:border-amber-300 transition-all text-center group cursor-pointer">
        <div className="text-primary mb-1.5 flex justify-center group-hover:scale-110 transition-transform">{icon}</div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}

function StepCard({
  number, icon, title, description, color, cta, href
}: {
  number: number; icon: React.ReactNode; title: string; description: string; color: string; cta: string; href: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-amber-200/30 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="absolute -top-3 -left-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-sm">
        {number}
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
      <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 -ml-2">
        <Link href={href}>
          {cta}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </Button>
    </div>
  );
}

function ContestFeature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function DonationTier({
  emoji, name, price, votes, description, popular, color
}: {
  emoji: string; name: string; price: string; votes: number; description: string; popular?: boolean; color: string;
}) {
  return (
    <div className={`relative rounded-2xl p-6 border-2 ${color} text-center hover:shadow-md transition-shadow`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
          Most Popular
        </div>
      )}
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-bold text-base mb-1">{name}</h3>
      <div className="text-3xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
        {price}
      </div>
      <p className="text-sm font-medium text-amber-700 mb-3">
        {votes} bonus votes
      </p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ActivityCard({
  icon, title, description, cta, href, color
}: {
  icon: React.ReactNode; title: string; description: string; cta: string; href: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-amber-200/30 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
      <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 -ml-2">
        <Link href={href}>
          {cta}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </Button>
    </div>
  );
}

function FAQItem({
  question, isOpen, onToggle, children
}: {
  question: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-amber-200/30 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-amber-50/50 transition-colors"
      >
        <span className="font-semibold text-sm flex-1">{question}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t border-amber-100">
          <div className="text-sm text-muted-foreground leading-relaxed mt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
