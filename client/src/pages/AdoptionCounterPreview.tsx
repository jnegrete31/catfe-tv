import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Cat } from "@shared/types";

// ============================================================
// CONCEPT A — "Wall of Love" Photo Mosaic
// ============================================================
function ConceptA() {
  const { data: settingsData } = trpc.settings.get.useQuery();
  const { data: recentlyAdopted } = trpc.cats.getRecentlyAdopted.useQuery({ days: 90 });
  const { data: availableCats } = trpc.cats.getAvailable.useQuery();
  const totalCount = settingsData?.totalAdoptionCount || 0;

  // Combine adopted + available cats for the mosaic background
  const allCatsWithPhotos = useMemo(() => {
    const adopted = (recentlyAdopted || []).filter((c: Cat) => c.photoUrl);
    const available = (availableCats || []).filter((c: Cat) => c.photoUrl);
    return [...adopted, ...available];
  }, [recentlyAdopted, availableCats]);

  // Scrolling ticker of adopted cat names
  const adoptedNames = useMemo(() => {
    return (recentlyAdopted || []).map((c: Cat) => c.name);
  }, [recentlyAdopted]);

  // Animate the counter up
  const [displayCount, setDisplayCount] = useState(0);
  useEffect(() => {
    if (totalCount === 0) return;
    const duration = 2000;
    const steps = 60;
    const increment = totalCount / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalCount) {
        setDisplayCount(totalCount);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [totalCount]);

  return (
    <div className="relative overflow-hidden w-full h-full" style={{ background: '#2d2d2d' }}>
      {/* Photo mosaic background */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-0.5 opacity-25">
        {Array.from({ length: 24 }).map((_, i) => {
          const cat = allCatsWithPhotos[i % Math.max(allCatsWithPhotos.length, 1)];
          return (
            <motion.div
              key={i}
              className="relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              {cat?.photoUrl ? (
                <img
                  src={cat.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #3a3a3a, #2a2a2a)' }} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Warm overlay gradient */}
      <div className="absolute inset-0" style={{ 
        background: 'radial-gradient(ellipse at center, rgba(45,45,45,0.6) 0%, rgba(45,45,45,0.85) 60%, rgba(45,45,45,0.95) 100%)' 
      }} />

      {/* Amber light glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.5) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.5) 0%, transparent 70%)' }} />

      {/* Mint green floor reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4" 
           style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.15) 0%, transparent 100%)' }} />

      {/* Main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 px-8 py-3 rounded-full mb-6"
          style={{ background: 'rgba(134, 197, 169, 0.15)', border: '1px solid rgba(134, 197, 169, 0.3)' }}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-xl tracking-widest uppercase" style={{ color: '#86C5A9', fontFamily: 'Georgia, serif' }}>
            Forever Homes Found
          </span>
        </motion.div>

        {/* Big counter */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80, delay: 0.5 }}
          className="relative my-4"
        >
          <span
            className="text-[16rem] font-black leading-none block"
            style={{
              fontFamily: 'Georgia, serif',
              background: 'linear-gradient(180deg, #F5E6D3 0%, #DAA520 40%, #E8913A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 8px 30px rgba(218, 165, 32, 0.3))',
            }}
          >
            {displayCount}
          </span>
          {/* Glow ring behind number */}
          <div className="absolute inset-0 -m-8 rounded-full opacity-20 blur-3xl"
               style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 60%)' }} />
        </motion.div>

        {/* Subtitle */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-5xl tracking-wider mb-4"
          style={{ fontFamily: 'Georgia, serif', color: '#F5E6D3' }}
        >
          Cats Adopted
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl mb-8"
          style={{ color: 'rgba(245, 230, 211, 0.6)' }}
        >
          and counting, thanks to you
        </motion.p>

        {/* Recently adopted photo strip */}
        {recentlyAdopted && recentlyAdopted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-4"
          >
            {recentlyAdopted.slice(0, 5).map((cat: Cat, i: number) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.15 }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 shadow-lg"
                     style={{ borderColor: '#DAA520' }}>
                  {cat.photoUrl ? (
                    <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: '#3a3a3a' }}>
                      🐱
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs"
                     style={{ color: 'rgba(245, 230, 211, 0.7)' }}>
                  {cat.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Scrolling ticker at bottom */}
      {adoptedNames.length > 0 && (
        <div className="absolute bottom-6 left-0 right-0 overflow-hidden z-10">
          <motion.div
            className="flex gap-8 whitespace-nowrap text-lg"
            style={{ color: 'rgba(134, 197, 169, 0.6)' }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: adoptedNames.length * 3, repeat: Infinity, ease: 'linear' }}
          >
            {[...adoptedNames, ...adoptedNames].map((name, i) => (
              <span key={i} className="flex items-center gap-2">
                <span>💚</span>
                <span style={{ fontFamily: 'Georgia, serif' }}>{name} found a home</span>
              </span>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CONCEPT C — "Happy Tails Timeline" Split Layout
// ============================================================
function ConceptC() {
  const { data: settingsData } = trpc.settings.get.useQuery();
  const { data: recentlyAdopted } = trpc.cats.getRecentlyAdopted.useQuery({ days: 90 });
  const { data: availableCats } = trpc.cats.getAvailable.useQuery();
  const totalCount = settingsData?.totalAdoptionCount || 0;

  // Cats with photos for the mosaic background
  const allCatsWithPhotos = useMemo(() => {
    const adopted = (recentlyAdopted || []).filter((c: Cat) => c.photoUrl);
    const available = (availableCats || []).filter((c: Cat) => c.photoUrl);
    return [...adopted, ...available];
  }, [recentlyAdopted, availableCats]);

  // Rotating carousel index
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const adoptedCats = useMemo(() => {
    return (recentlyAdopted || []).filter((c: Cat) => c.photoUrl);
  }, [recentlyAdopted]);

  useEffect(() => {
    if (adoptedCats.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCatIndex(prev => (prev + 1) % adoptedCats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [adoptedCats.length]);

  // Animate counter
  const [displayCount, setDisplayCount] = useState(0);
  useEffect(() => {
    if (totalCount === 0) return;
    const duration = 2000;
    const steps = 60;
    const increment = totalCount / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalCount) {
        setDisplayCount(totalCount);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [totalCount]);

  const formatAdoptionDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const currentCat = adoptedCats[currentCatIndex];

  return (
    <div className="relative overflow-hidden w-full h-full" style={{ background: '#2d2d2d' }}>
      {/* Split layout */}
      <div className="absolute inset-0 flex">
        {/* LEFT SIDE — Counter & branding */}
        <div className="w-1/2 relative flex flex-col items-center justify-center"
             style={{ background: 'linear-gradient(160deg, #F5E6D3 0%, #EDE0D4 50%, #E8DDD0 100%)' }}>
          
          {/* Warm light glow */}
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full opacity-40"
               style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.3) 0%, transparent 70%)' }} />
          
          {/* Mint accent bar at top */}
          <div className="absolute top-0 left-0 right-0 h-2" style={{ background: '#86C5A9' }} />
          
          {/* Decorative cat silhouette */}
          <div className="absolute bottom-8 left-8 opacity-[0.06]">
            <svg className="w-32 h-32" viewBox="0 0 100 100" fill="#2d2d2d">
              <ellipse cx="50" cy="60" rx="35" ry="30" />
              <circle cx="50" cy="30" r="22" />
              <polygon points="30,15 35,35 25,30" />
              <polygon points="70,15 65,35 75,30" />
            </svg>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-8"
          >
            {/* Top label */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12" style={{ background: '#DAA520' }} />
              <span className="text-sm tracking-[0.3em] uppercase" style={{ color: '#86C5A9', fontFamily: 'Georgia, serif' }}>
                Forever Homes
              </span>
              <div className="h-px w-12" style={{ background: '#DAA520' }} />
            </div>

            {/* Big number */}
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 80, delay: 0.3 }}
              className="text-[8rem] font-black leading-[0.9] block"
              style={{
                fontFamily: 'Georgia, serif',
                background: 'linear-gradient(180deg, #E8913A 0%, #DAA520 50%, #86C5A9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 15px rgba(218, 165, 32, 0.2))',
              }}
            >
              {displayCount}
            </motion.span>

            <h2 className="text-2xl tracking-wider mt-3" style={{ fontFamily: 'Georgia, serif', color: '#2d2d2d' }}>
              Cats Adopted
            </h2>

            <p className="text-sm mt-2" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
              Every visit helps us find forever homes
            </p>
          </motion.div>
        </div>

        {/* RIGHT SIDE — Photo mosaic + carousel */}
        <div className="w-1/2 relative flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
          
          {/* Photo mosaic background */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-0.5 opacity-20">
            {Array.from({ length: 12 }).map((_, i) => {
              const cat = allCatsWithPhotos[i % Math.max(allCatsWithPhotos.length, 1)];
              return (
                <motion.div
                  key={i}
                  className="relative overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  {cat?.photoUrl ? (
                    <img src={cat.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #3a3a3a, #2a2a2a)' }} />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Dark overlay to make carousel pop */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, rgba(30,30,30,0.5) 0%, rgba(26,26,26,0.8) 70%)'
          }} />
          
          {/* Amber glow */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(218, 165, 32, 0.5) 0%, transparent 70%)' }} />
          
          {/* Mint floor reflection */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4"
               style={{ background: 'linear-gradient(to top, rgba(134, 197, 169, 0.1) 0%, transparent 100%)' }} />

          {/* "Recently Adopted" label */}
          <div className="absolute top-8 left-0 right-0 text-center z-10">
            <span className="text-sm tracking-[0.3em] uppercase" style={{ color: 'rgba(134, 197, 169, 0.6)' }}>
              Recently Adopted
            </span>
          </div>

          {/* Cat card carousel */}
          <AnimatePresence mode="wait">
            {currentCat ? (
              <motion.div
                key={currentCat.id}
                initial={{ opacity: 0, x: 60, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -60, rotateY: 10 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="relative w-72 z-10"
              >
                {/* Polaroid-style card */}
                <div className="rounded-xl overflow-hidden shadow-2xl"
                     style={{ background: '#F5E6D3' }}>
                  {/* Photo */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={currentCat.photoUrl!}
                      alt={currentCat.name}
                      className="w-full h-full object-cover"
                    />
                    {/* "Adopted!" ribbon */}
                    <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full shadow-lg"
                         style={{ background: 'linear-gradient(135deg, #86C5A9, #6BAF92)' }}>
                      <span className="text-white font-bold text-sm tracking-wide">Adopted!</span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-5 text-center">
                    <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: '#2d2d2d' }}>
                      {currentCat.name}
                    </h3>
                    {currentCat.adoptedDate && (
                      <p className="text-sm" style={{ color: '#E8913A' }}>
                        Adopted {formatAdoptionDate(currentCat.adoptedDate)}
                      </p>
                    )}
                    {currentCat.breed && (
                      <p className="text-xs mt-1" style={{ color: 'rgba(45,45,45,0.5)' }}>
                        {currentCat.breed}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center px-8"
              >
                <div className="text-6xl mb-4">🐱</div>
                <p className="text-xl" style={{ color: 'rgba(245, 230, 211, 0.5)', fontFamily: 'Georgia, serif' }}>
                  More happy tails coming soon
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dot indicators */}
          {adoptedCats.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
              {adoptedCats.slice(0, 8).map((_: Cat, i: number) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i === currentCatIndex % Math.min(adoptedCats.length, 8) ? '#DAA520' : 'rgba(245, 230, 211, 0.2)',
                    transform: i === currentCatIndex % Math.min(adoptedCats.length, 8) ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PREVIEW PAGE — Toggle between concepts
// ============================================================
export default function AdoptionCounterPreview() {
  const [activeConcept, setActiveConcept] = useState<"A" | "C">("C");

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <Link href="/admin">
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
          </Button>
        </Link>
        <h1 className="text-white text-lg font-medium">Adoption Counter — Design Preview</h1>
        <div className="flex gap-2">
          <Button
            variant={activeConcept === "A" ? "default" : "outline"}
            onClick={() => setActiveConcept("A")}
            className={activeConcept === "A" ? "bg-amber-600 hover:bg-amber-700" : "text-gray-400 border-gray-600"}
          >
            Concept A: Wall of Love
          </Button>
          <Button
            variant={activeConcept === "C" ? "default" : "outline"}
            onClick={() => setActiveConcept("C")}
            className={activeConcept === "C" ? "bg-amber-600 hover:bg-amber-700" : "text-gray-400 border-gray-600"}
          >
            Concept C: Happy Tails Timeline
          </Button>
        </div>
      </div>

      {/* Preview area — 16:9 aspect ratio to simulate TV */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          <AnimatePresence mode="wait">
            {activeConcept === "A" ? (
              <motion.div
                key="A"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <ConceptA />
              </motion.div>
            ) : (
              <motion.div
                key="C"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <ConceptC />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-4 bg-gray-900 border-t border-gray-800 text-center">
        {activeConcept === "A" ? (
          <p className="text-gray-400 text-sm">
            <strong className="text-amber-400">Concept A — Wall of Love:</strong> Photo mosaic background of your cats, warm amber tones, animated counter, recently adopted cat photos in circles, scrolling ticker of names at the bottom.
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            <strong className="text-amber-400">Concept C — Happy Tails (Hybrid):</strong> Split layout with the counter on the left (cream/warm tones) and a photo mosaic + rotating carousel of recently adopted cats on the right.
          </p>
        )}
      </div>
    </div>
  );
}
