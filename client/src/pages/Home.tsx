import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  Cat, Camera, Heart, PawPrint, Upload, Gift, Star,
  ChevronDown, ChevronRight, Settings, Tv, BookOpen,
  Smartphone, QrCode, Trophy, Sparkles, Users,
  ArrowRight, Image, MessageSquare, Shield,
  MapPin, Clock, Phone, Mail, CalendarCheck,
  Coffee, Ticket, PartyPopper, HandHeart, ExternalLink
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Fetch guest photos
  const { data: snapPurrPhotos } = trpc.photos.getApproved.useQuery({ type: "snap_purr" });
  const { data: happyTailsPhotos } = trpc.photos.getApproved.useQuery({ type: "happy_tails" });
  const { data: topContestPhotos } = trpc.catPhotos.getTopPhotosForTV.useQuery({ limit: 8 });

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-body)" }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/50">
        <div className="container flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Cat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Catfé
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-medium">
              <a href="#visit">Visit</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-medium">
              <a href="#adopt">Adopt</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-medium">
              <a href="#activities">Activities</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-medium">
              <a href="#faq">FAQ</a>
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
                <a href={getLoginUrl()}>Staff</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100/30">
        {/* Decorative paw prints */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <PawPrint className="absolute w-24 h-24 top-12 left-[8%] rotate-[-20deg]" />
          <PawPrint className="absolute w-16 h-16 top-32 right-[12%] rotate-[15deg]" />
          <PawPrint className="absolute w-20 h-20 bottom-20 left-[20%] rotate-[30deg]" />
          <PawPrint className="absolute w-14 h-14 bottom-32 right-[25%] rotate-[-10deg]" />
        </div>

        <div className="container py-16 md:py-24 lg:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/70 border border-amber-200/60 text-amber-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <PawPrint className="w-4 h-4" />
              Santa Clarita's First Cat Lounge
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Relax and Make<br className="hidden sm:block" />
              a New Furry Friend
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Catfé is your cozy escape with adoptable cats in a comfy space. Unwind, play, and maybe find your forever companion.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
              <Button asChild size="lg" className="w-full sm:w-auto shadow-md text-base px-8 h-12">
                <a href="https://www.catfe.la/" target="_blank" rel="noopener noreferrer">
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  Book Your Visit
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white/80 text-base px-8 h-12">
                <a href="#adopt">
                  <Heart className="w-5 h-5 mr-2" />
                  Meet the Cats
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Santa Clarita, CA
              </span>
              <span className="text-amber-300">|</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                17+ Cats Adopted
              </span>
            </div>
          </div>
        </div>

        {/* Photo strip from guest uploads */}
        {snapPurrPhotos && snapPurrPhotos.length > 0 && (
          <PhotoStrip photos={snapPurrPhotos.slice(0, 12)} />
        )}

        {/* Wave divider */}
        <div className="relative h-16 md:h-20 overflow-hidden">
          <svg viewBox="0 0 1200 80" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,80 L0,30 Q150,0 300,30 Q450,55 600,25 Q750,0 900,30 Q1050,55 1200,30 L1200,80 Z" fill="rgb(255,251,235)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          QUICK INFO BAR
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-amber-50 border-b border-amber-200/40">
        <div className="container py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <InfoChip icon={<Cat className="w-4 h-4" />} label="Cat Lounge" />
            <InfoChip icon={<Heart className="w-4 h-4" />} label="Adoptable Cats" />
            <InfoChip icon={<PartyPopper className="w-4 h-4" />} label="Private Events" />
            <InfoChip icon={<Coffee className="w-4 h-4" />} label="Snacks & Drinks" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW A VISIT WORKS
      ═══════════════════════════════════════════════════════════════ */}
      <section id="visit" className="bg-white">
        <div className="container py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-2xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                How a Visit to Catfé Works
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Four simple steps to your purrfect experience
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-5">
              <VisitStep
                number={1}
                icon={<Ticket className="w-6 h-6" />}
                title="Reserve Your Spot"
                description="Book your visit ahead of time to guarantee your session."
              />
              <VisitStep
                number={2}
                icon={<Coffee className="w-6 h-6" />}
                title="Grab a Bite"
                description="Order food or drinks from Bagel Boyz and our plaza neighbors before heading in."
              />
              <VisitStep
                number={3}
                icon={<CalendarCheck className="w-6 h-6" />}
                title="Check In"
                description="Arrive a few minutes early, sign your waiver, and get settled."
              />
              <VisitStep
                number={4}
                icon={<Cat className="w-6 h-6" />}
                title="Enjoy the Lounge"
                description="Relax, play, and meet the cats. Take photos and make memories!"
              />
            </div>

            <div className="text-center mt-10">
              <Button asChild size="lg" className="shadow-sm">
                <a href="https://www.catfe.la/" target="_blank" rel="noopener noreferrer">
                  Book Your Visit
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHAT TO EXPECT — with real guest photos
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-amber-50/50 to-white border-y border-amber-200/30">
        <div className="container py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  The Experience
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your Cozy Escape Awaits
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Step into a warm, inviting space where adoptable cats roam freely. Our lounge features comfy seating, cat trees, and plenty of toys. Whether you're here to de-stress, socialize, or find your next family member, Catfé is the place.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Every cat at Catfé comes from <strong>Kitten Rescue</strong>, a dedicated rescue saving lives across Los Angeles. When you visit, you're directly supporting their mission.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200/60 px-3 py-1.5 rounded-full text-xs font-medium">
                    <PawPrint className="w-3 h-3" /> Cat Therapy
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-200/60 px-3 py-1.5 rounded-full text-xs font-medium">
                    <Heart className="w-3 h-3" /> Adoption Center
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1.5 rounded-full text-xs font-medium">
                    <PartyPopper className="w-3 h-3" /> Private Events
                  </span>
                </div>
              </div>

              {/* Photo mosaic from Snap & Purr */}
              <div>
                {snapPurrPhotos && snapPurrPhotos.length >= 4 ? (
                  <PhotoMosaic photos={snapPurrPhotos.slice(0, 5)} />
                ) : (
                  <div className="space-y-4">
                    <ExperienceCard
                      icon={<Cat className="w-5 h-5" />}
                      title="Cat Therapy"
                      desc="Unwind in our cozy lounge and let the soothing purrs melt your stress away. Perfect for a midday reset."
                      color="bg-amber-100 text-amber-700"
                    />
                    <ExperienceCard
                      icon={<PartyPopper className="w-5 h-5" />}
                      title="Host an Event"
                      desc="Birthday parties, private events, or cozy gatherings — celebrate with the purrfect company."
                      color="bg-pink-100 text-pink-700"
                    />
                    <ExperienceCard
                      icon={<Heart className="w-5 h-5" />}
                      title="Adopt a Cat"
                      desc="Spend time with our adoptable cats, discover their personalities, and give a loving home to a furry friend."
                      color="bg-rose-100 text-rose-700"
                    />
                    <ExperienceCard
                      icon={<Coffee className="w-5 h-5" />}
                      title="Bagel Boyz Next Door"
                      desc="Grab delicious bagels and coffee from our plaza neighbor. Supporting local businesses is part of our mission."
                      color="bg-teal-100 text-teal-700"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ADOPT SECTION — with Happy Tails photos
      ═══════════════════════════════════════════════════════════════ */}
      <section id="adopt" className="bg-white">
        <div className="container py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-pink-100/80 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              Find Your Forever Friend
            </div>
            <h2
              className="text-2xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Every Cat Deserves a Home
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto mb-10 leading-relaxed">
              All of our cats come from Kitten Rescue and are looking for their forever families. Spend time with them during your visit, fall in love, and start the adoption process right here at Catfé.
            </p>

            {/* Happy Tails photo gallery */}
            {happyTailsPhotos && happyTailsPhotos.length > 0 && (
              <div className="mb-10">
                <p className="text-sm font-semibold text-amber-700 mb-4 flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Happy Tails — Our Alumni in Their Forever Homes
                </p>
                <HappyTailsGallery photos={happyTailsPhotos.slice(0, 6)} />
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-5 mb-10">
              <AdoptStep
                number="01"
                title="Visit & Bond"
                description="Spend quality time with our cats during your lounge session. See who you connect with."
                color="bg-amber-500"
              />
              <AdoptStep
                number="02"
                title="Apply to Adopt"
                description="Fill out an adoption application through Kitten Rescue. Our staff can help you get started."
                color="bg-pink-500"
              />
              <AdoptStep
                number="03"
                title="Welcome Home"
                description="Once approved, bring your new family member home! Share updates on our Happy Tails page."
                color="bg-rose-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="shadow-sm">
                <a href="https://www.catfe.la/adopt" target="_blank" rel="noopener noreferrer">
                  View Adoptable Cats
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white">
                <Link href="/upload/happy-tails">
                  <Heart className="w-5 h-5 mr-2" />
                  Happy Tails Stories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ACTIVITIES & PHOTO CONTEST — with real contest photos
      ═══════════════════════════════════════════════════════════════ */}
      <section id="activities" className="bg-gradient-to-b from-amber-50/50 to-amber-100/30 border-y border-amber-200/30">
        <div className="container py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-200/60 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                <Trophy className="w-4 h-4" />
                While You're Here
              </div>
              <h2
                className="text-2xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Fun Things to Do at Catfé
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Beyond hanging out with cats, there's plenty to enjoy
              </p>
            </div>

            {/* Photo Contest Feature — with real top-voted photos */}
            <div className="bg-white rounded-2xl border border-amber-200/50 shadow-sm overflow-hidden mb-8">
              <div className="grid md:grid-cols-2">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                      Photo Contest
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Snap photos of your favorite cats, upload them, and vote for the cutest shots. Top-voted photos appear on our in-lounge TV displays! Every donation for bonus votes goes directly to cat care.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <MiniFeature icon={<Smartphone className="w-3.5 h-3.5" />} text="Mobile-friendly" />
                    <MiniFeature icon={<QrCode className="w-3.5 h-3.5" />} text="Scan QR to start" />
                    <MiniFeature icon={<Shield className="w-3.5 h-3.5" />} text="No account needed" />
                    <MiniFeature icon={<Tv className="w-3.5 h-3.5" />} text="Featured on TV" />
                  </div>
                  <Button asChild size="sm">
                    <Link href="/vote/cats">
                      Browse Cats & Vote
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-amber-50 p-6 md:p-8 flex flex-col justify-center">
                  {topContestPhotos && topContestPhotos.length >= 3 ? (
                    <ContestLeaderboard photos={topContestPhotos.slice(0, 3)} />
                  ) : (
                    <div className="space-y-3">
                      <DonationTierMini emoji="🐾" name="Paw Print" price="$1" votes={1} />
                      <DonationTierMini emoji="😺" name="Cat Nap" price="$5" votes={5} popular />
                      <DonationTierMini emoji="🏆" name="Full Purr" price="$10" votes={15} />
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-3 text-center">
                    {topContestPhotos && topContestPhotos.length >= 3
                      ? "Vote for your favorites — top photos appear on our TV!"
                      : "Donations support cat care via Stripe"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Other Activities */}
            <div className="grid md:grid-cols-3 gap-5">
              <ActivityCard
                icon={<Heart className="w-6 h-6" />}
                title="Happy Tails"
                description="Adopted from Catfé? Share photos of your cat in their forever home. We love seeing our alumni thrive!"
                cta="Share an Update"
                href="/upload/happy-tails"
                color="bg-teal-500"
              />
              <ActivityCard
                icon={<Star className="w-6 h-6" />}
                title="Photo Gallery"
                description="Browse all guest photos, like your favorites, and see which cats are the most popular."
                cta="Browse Gallery"
                href="/photos/vote"
                color="bg-indigo-500"
              />
              <ActivityCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="Cat Polls"
                description="Fun polls on our TV screens throughout the day — scan the QR code to vote on silly cat questions!"
                cta="Watch for QR Codes"
                href="#"
                color="bg-amber-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GET INVOLVED
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="container py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2
                className="text-2xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Get Involved
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Catfé is built on community. Here's how you can be part of it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <InvolveCard
                icon={<HandHeart className="w-7 h-7" />}
                title="Volunteer"
                description="Help us care for the cats and keep the lounge running. We love our volunteers!"
                cta="Learn More"
                href="https://www.catfe.la/"
                external
              />
              <InvolveCard
                icon={<Gift className="w-7 h-7" />}
                title="Donate"
                description="Every dollar goes to food, medical care, and preparing cats for adoption. You can donate through our photo contest too!"
                cta="Support the Cats"
                href="/vote/cats"
              />
              <InvolveCard
                icon={<Users className="w-7 h-7" />}
                title="Memberships"
                description="Become a regular! Membership perks include unlimited visits, discounts, and early access to events."
                cta="View Plans"
                href="https://www.catfe.la/"
                external
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="bg-gradient-to-b from-amber-50/50 to-white border-t border-amber-200/30">
        <div className="container py-16 md:py-20">
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
                question="Do I need a reservation?"
                isOpen={openSection === "faq-reservation"}
                onToggle={() => toggleSection("faq-reservation")}
              >
                <p>We highly recommend booking online to guarantee your spot. Walk-ins are welcome when space is available, but sessions can fill up — especially on weekends. Book at <a href="https://www.catfe.la/" target="_blank" rel="noopener noreferrer" className="text-primary underline">catfe.la</a>.</p>
              </FAQItem>

              <FAQItem
                question="How much does a visit cost?"
                isOpen={openSection === "faq-cost"}
                onToggle={() => toggleSection("faq-cost")}
              >
                <p>A Full Lounge Experience is <strong>$25 for one hour</strong>. We also offer shorter sessions and special packages. Check our booking page for the latest pricing and session options.</p>
              </FAQItem>

              <FAQItem
                question="Can I bring food or drinks?"
                isOpen={openSection === "faq-food"}
                onToggle={() => toggleSection("faq-food")}
              >
                <p>Yes! We encourage you to grab food and drinks from <strong>Bagel Boyz</strong> and other neighbors in our plaza before your session. You're welcome to bring them into the lounge.</p>
              </FAQItem>

              <FAQItem
                question="How does the photo contest work?"
                isOpen={openSection === "faq-contest"}
                onToggle={() => toggleSection("faq-contest")}
              >
                <p>During your visit, snap photos of the cats and upload them through our website (scan a QR code or visit the Photo Contest page). Other guests can vote on photos, and the top-voted ones appear on our in-lounge TV displays. You get 1 free vote per photo, and can earn bonus votes through donations that support cat care.</p>
              </FAQItem>

              <FAQItem
                question="How do I adopt a cat?"
                isOpen={openSection === "faq-adopt"}
                onToggle={() => toggleSection("faq-adopt")}
              >
                <p>All our cats come from <strong>Kitten Rescue</strong>. If you fall in love with a cat during your visit, ask our staff about the adoption process. You'll fill out an application through Kitten Rescue, and once approved, you can bring your new family member home!</p>
              </FAQItem>

              <FAQItem
                question="Can I host a private event?"
                isOpen={openSection === "faq-events"}
                onToggle={() => toggleSection("faq-events")}
              >
                <p>Absolutely! We host birthday parties, team outings, and private gatherings. Contact us to learn about event packages and availability.</p>
              </FAQItem>

              <FAQItem
                question="Is the lounge kid-friendly?"
                isOpen={openSection === "faq-kids"}
                onToggle={() => toggleSection("faq-kids")}
              >
                <p>Yes! Children are welcome with a supervising adult. We ask that all guests (including little ones) be gentle with the cats and follow our lounge guidelines. A waiver must be signed for all visitors.</p>
              </FAQItem>

              <FAQItem
                question="Where are you located?"
                isOpen={openSection === "faq-location"}
                onToggle={() => toggleSection("faq-location")}
              >
                <p><strong>18560 Via Princessa, Unit 100, Santa Clarita, CA 91387</strong>. We're in the plaza with Bagel Boyz — easy to find with plenty of parking.</p>
              </FAQItem>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LOCATION & CONTACT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-amber-200/30">
        <div className="container py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Visit Us
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Address</p>
                      <p className="text-sm text-muted-foreground">18560 Via Princessa, Unit 100</p>
                      <p className="text-sm text-muted-foreground">Santa Clarita, CA 91387</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        <a href="tel:+16613094468" className="hover:text-primary transition">(661) 309-4468</a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Hours</p>
                      <p className="text-sm text-muted-foreground">Check our booking page for current hours</p>
                      <a href="https://www.catfe.la/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                        catfe.la <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <a
                    href="https://www.instagram.com/catfescv/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a
                    href="https://www.facebook.com/CatfeSCV/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                </div>
              </div>

              {/* Partnership Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <HandHeart className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-amber-800">In Proud Partnership With</span>
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Kitten Rescue
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Every cat you meet at Catfé comes from Kitten Rescue, a dedicated rescue saving lives across Los Angeles. Their adoption center provides a safe haven for cats until they find their forever homes — maybe with you!
                </p>
                <div className="bg-white/80 rounded-xl p-4 border border-amber-200/40">
                  <p className="text-sm font-semibold mb-1">Bagel Boyz</p>
                  <p className="text-xs text-muted-foreground">
                    Try delicious bagels and treats from our plaza neighbor. Fresh, handmade goodness — open 8am to 1pm. Supporting small businesses is part of our mission!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-primary/5 border-t border-primary/10">
        <div className="container py-14">
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to Meet the Cats?
            </h2>
            <p className="text-muted-foreground mb-6">
              Book your visit, snap some photos, and maybe find your new best friend.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="shadow-md">
                <a href="https://www.catfe.la/" target="_blank" rel="noopener noreferrer">
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  Book Your Visit
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white">
                <Link href="/vote/cats">
                  <Camera className="w-5 h-5 mr-2" />
                  Photo Contest
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="bg-amber-50 border-t border-amber-200/50">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Cat className="w-4 h-4 text-primary-foreground" />
              </div>
              <p className="font-medium">Catfé Lounge — Santa Clarita, CA</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <a href="https://www.catfe.la/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">
                Book Online
              </a>
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
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO COMPONENTS
═══════════════════════════════════════════════════════════════ */

/** Scrolling photo strip below the hero */
function PhotoStrip({ photos }: { photos: Array<{ id: number; photoUrl: string; caption?: string | null }> }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animationId: number;
    let offset = 0;
    const speed = 0.3; // pixels per frame

    const animate = () => {
      offset += speed;
      if (offset >= el.scrollWidth / 2) offset = 0;
      el.scrollLeft = offset;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [photos]);

  // Double the photos for seamless loop
  const doubled = [...photos, ...photos];

  return (
    <div className="relative overflow-hidden pb-2">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-amber-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none" />
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-hidden px-4"
        style={{ scrollBehavior: "auto" }}
      >
        {doubled.map((photo, i) => (
          <div
            key={`${photo.id}-${i}`}
            className="shrink-0 w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden shadow-md border-2 border-white/80"
          >
            <img
              src={photo.photoUrl}
              alt={photo.caption || "Guest photo at Catfé"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Photo mosaic for the experience section */
function PhotoMosaic({ photos }: { photos: Array<{ id: number; photoUrl: string; caption?: string | null; submitterName: string }> }) {
  if (photos.length < 4) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Large featured photo */}
      <div className="col-span-2 rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 aspect-[16/9] relative group">
        <img
          src={photos[0].photoUrl}
          alt={photos[0].caption || "Life at Catfé"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <p className="text-white text-xs font-medium">
            {photos[0].caption || `📸 by ${photos[0].submitterName}`}
          </p>
        </div>
      </div>
      {/* Smaller photos */}
      {photos.slice(1, 5).map((photo) => (
        <div
          key={photo.id}
          className="rounded-xl overflow-hidden shadow-md border-2 border-white/80 aspect-square relative group"
        >
          <img
            src={photo.photoUrl}
            alt={photo.caption || "Guest photo"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      ))}
      <p className="col-span-2 text-center text-xs text-muted-foreground mt-1">
        <Camera className="w-3 h-3 inline mr-1" />
        Real photos from our guests — <Link href="/upload/snap-purr" className="text-primary hover:underline">share yours!</Link>
      </p>
    </div>
  );
}

/** Happy Tails gallery for the adoption section */
function HappyTailsGallery({ photos }: { photos: Array<{ id: number; photoUrl: string; catName?: string | null; caption?: string | null }> }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-3xl mx-auto">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="rounded-xl overflow-hidden shadow-md border-2 border-pink-100 aspect-square relative group cursor-pointer"
        >
          <img
            src={photo.photoUrl}
            alt={photo.catName ? `${photo.catName} in their forever home` : "Happy Tails"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
            <p className="text-white text-[10px] font-medium leading-tight">
              {photo.catName ? `${photo.catName} 💕` : photo.caption || "Happy at home!"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Contest leaderboard showing top-voted photos */
function ContestLeaderboard({ photos }: { photos: Array<{ id: number; photoUrl: string; catName: string; voteCount: number; uploaderName: string }> }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="space-y-3">
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          className={`flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border ${i === 0 ? 'border-amber-300 shadow-sm' : 'border-amber-200/50'}`}
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-amber-200/50">
            <img
              src={photo.photoUrl}
              alt={photo.catName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm truncate block">{medals[i]} {photo.catName}</span>
            <span className="text-[10px] text-muted-foreground">by {photo.uploaderName}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="font-bold text-sm text-primary">{photo.voteCount}</span>
            <span className="text-[10px] text-muted-foreground block">votes</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 bg-white/70 border border-amber-200/50 rounded-full px-3 py-2 text-sm font-medium text-amber-800">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
  );
}

function VisitStep({
  number, icon, title, description
}: {
  number: number; icon: React.ReactNode; title: string; description: string;
}) {
  return (
    <div className="relative text-center group">
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
        {icon}
      </div>
      <div className="absolute -top-2 -right-1 md:right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
        {number}
      </div>
      <h3 className="font-bold text-sm mb-1.5" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function ExperienceCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-amber-200/30 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm mb-0.5">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function AdoptStep({ number, title, description, color }: { number: string; title: string; description: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-amber-200/30 shadow-sm text-center">
      <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-3`}>
        {number}
      </div>
      <h3 className="font-bold text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function MiniFeature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[11px] font-medium">
      {icon}
      {text}
    </span>
  );
}

function DonationTierMini({ emoji, name, price, votes, popular }: { emoji: string; name: string; price: string; votes: number; popular?: boolean }) {
  return (
    <div className={`flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border ${popular ? 'border-pink-300 shadow-sm' : 'border-amber-200/50'}`}>
      <span className="text-xl">{emoji}</span>
      <div className="flex-1">
        <span className="font-semibold text-sm">{name}</span>
        {popular && <span className="ml-1.5 text-[10px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full font-medium">Popular</span>}
      </div>
      <div className="text-right">
        <span className="font-bold text-sm text-primary">{price}</span>
        <span className="text-[10px] text-muted-foreground block">{votes} vote{votes > 1 ? 's' : ''}</span>
      </div>
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

function InvolveCard({
  icon, title, description, cta, href, external
}: {
  icon: React.ReactNode; title: string; description: string; cta: string; href: string; external?: boolean;
}) {
  const content = (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200/40 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{description}</p>
      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 -ml-2 w-fit">
        {cta}
        {external ? <ExternalLink className="w-3.5 h-3.5 ml-1" /> : <ArrowRight className="w-4 h-4 ml-1" />}
      </Button>
    </div>
  );

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
  }
  return <Link href={href} className="block">{content}</Link>;
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
