import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useParams, useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getFingerprint } from "@/lib/fingerprint";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Heart,
  Camera,
  Share2,
  Trophy,
  Sparkles,
  ChevronUp,
  X,
  ImagePlus,
  Gift,
  Cat,
  Coins,
  CalendarCheck,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Donation tier display info
const TIER_ICONS: Record<string, string> = {
  tier_1: "🐾",
  tier_2: "😺",
  tier_3: "🏆",
};

export default function CatVotingPage() {
  const params = useParams<{ catId: string }>();
  const catId = parseInt(params.catId || "0");
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const fingerprint = useMemo(() => getFingerprint(), []);
  const [showUpload, setShowUpload] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [uploaderName, setUploaderName] = useState(
    localStorage.getItem("catfe_uploader_name") || ""
  );
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState("image/jpeg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for donation success/cancel from Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("donated") === "true") {
      const tokens = params.get("tokens");
      toast.success(`Thank you for your donation! ${tokens} vote tokens added.`, {
        duration: 5000,
      });
      // Clean URL
      navigate(`/vote/cat/${catId}`, { replace: true });
    }
    if (params.get("cancelled") === "true") {
      toast.info("Donation cancelled.");
      navigate(`/vote/cat/${catId}`, { replace: true });
    }
  }, [searchString, catId, navigate]);

  // Fetch cat data + photos
  const { data, isLoading, refetch } = trpc.catPhotos.getCatVotingPage.useQuery(
    { catId },
    { enabled: catId > 0 }
  );

  // Uploader count
  const { data: uploaderData, refetch: refetchUploaderCount } =
    trpc.catPhotos.getUploaderCount.useQuery(
      { catId, fingerprint },
      { enabled: catId > 0 }
    );

  // Vote status for all photos
  const photoIds = useMemo(
    () => data?.photos?.map((p) => p.id) || [],
    [data?.photos]
  );
  const { data: voteStatus, refetch: refetchVotes } =
    trpc.catPhotos.getVoteStatus.useQuery(
      { photoIds, fingerprint },
      { enabled: photoIds.length > 0 }
    );

  // Token balance
  const { data: tokenData, refetch: refetchTokens } =
    trpc.catPhotos.getTokenBalance.useQuery({ fingerprint });

  // Donation tiers
  const { data: donationTiers } = trpc.catPhotos.getDonationTiers.useQuery();

  // Mutations
  const uploadMutation = trpc.catPhotos.upload.useMutation({
    onSuccess: () => {
      toast.success("Photo uploaded successfully!");
      setShowUpload(false);
      setSelectedImage(null);
      setCaption("");
      refetch();
      refetchUploaderCount();
    },
    onError: (err) => toast.error(err.message),
  });

  const freeVoteMutation = trpc.catPhotos.castFreeVote.useMutation({
    onSuccess: () => {
      toast.success("Vote cast!");
      refetch();
      refetchVotes();
    },
    onError: (err) => toast.error(err.message),
  });

  const donationVoteMutation = trpc.catPhotos.castDonationVotes.useMutation({
    onSuccess: () => {
      toast.success("Bonus votes applied!");
      refetch();
      refetchVotes();
      refetchTokens();
    },
    onError: (err) => toast.error(err.message),
  });

  const checkoutMutation = trpc.catPhotos.createDonationCheckout.useMutation({
    onSuccess: (result) => {
      window.open(result.checkoutUrl, "_blank");
      toast.info("Redirecting to checkout...");
    },
    onError: (err) => toast.error(err.message),
  });

  // Handle image selection
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10MB");
        return;
      }
      setSelectedMimeType(file.type || "image/jpeg");
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix to get base64
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleUpload = useCallback(() => {
    if (!selectedImage || !uploaderName.trim()) {
      toast.error("Please add your first name and select a photo.");
      return;
    }
    // Save name for next time
    localStorage.setItem("catfe_uploader_name", uploaderName.trim());
    // Extract base64 from data URL
    const base64 = selectedImage.split(",")[1] || selectedImage;
    uploadMutation.mutate({
      catId,
      uploaderName: uploaderName.trim(),
      uploaderFingerprint: fingerprint,
      caption: caption.trim() || undefined,
      imageBase64: base64,
      mimeType: selectedMimeType,
    });
  }, [
    selectedImage,
    uploaderName,
    caption,
    catId,
    fingerprint,
    selectedMimeType,
    uploadMutation,
  ]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    const catName = data?.cat?.name || "this cat";
    const text = `Vote for ${catName}'s best photo at Catfé! 🐱📸`;
    if (navigator.share) {
      navigator.share({ title: `Vote for ${catName}`, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  }, [data?.cat?.name]);

  const handleDonationVote = useCallback(
    (photoId: number, votes: number) => {
      donationVoteMutation.mutate({ photoId, fingerprint, votes });
    },
    [fingerprint, donationVoteMutation]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data?.cat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Cat className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-amber-900">Cat not found</h2>
          <p className="text-amber-600 mt-2">This cat may have been adopted already!</p>
        </div>
      </div>
    );
  }

  const cat = data.cat;
  const photos = data.photos || [];
  const remaining = uploaderData?.remaining ?? 3;
  const tokenBalance = tokenData?.balance ?? 0;

  // Calculate age from dob
  const getAge = () => {
    if (!cat.dob) return null;
    const dob = new Date(cat.dob);
    const now = new Date();
    const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0
      ? `${years} year${years !== 1 ? "s" : ""}, ${rem} month${rem !== 1 ? "s" : ""}`
      : `${years} year${years !== 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-sm">
              <Cat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-900 leading-tight">
                {cat.name}
              </h1>
              <p className="text-xs text-amber-600">Catfé Photo Contest</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tokenBalance > 0 && (
              <Badge
                variant="outline"
                className="bg-amber-50 border-amber-300 text-amber-700 gap-1"
              >
                <Coins className="w-3 h-3" />
                {tokenBalance}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-amber-700 hover:bg-amber-100"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* Cat Kennel Card */}
        <Card className="mt-4 overflow-hidden border-amber-200 shadow-md">
          <div className="relative">
            {cat.photoUrl ? (
              <img
                src={cat.photoUrl}
                alt={cat.name}
                className="w-full h-56 object-cover"
              />
            ) : (
              <div className="w-full h-56 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Cat className="w-20 h-20 text-amber-400" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h2 className="text-2xl font-bold text-white">{cat.name}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {cat.breed && (
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    {cat.breed}
                  </Badge>
                )}
                {getAge() && (
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    {getAge()}
                  </Badge>
                )}
                {cat.sex && cat.sex !== "unknown" && (
                  <Badge className="bg-white/20 text-white border-0 text-xs capitalize">
                    {cat.sex}
                  </Badge>
                )}
                {cat.colorPattern && (
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    {cat.colorPattern}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            {/* Personality Tags */}
            {cat.personalityTags && (cat.personalityTags as string[]).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(cat.personalityTags as string[]).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-amber-50 border-amber-200 text-amber-700 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {/* Bio */}
            {cat.bio && (
              <p className="text-sm text-gray-700 leading-relaxed">{cat.bio}</p>
            )}
            {/* Adoption Info */}
            <div className="flex items-center justify-between text-sm pt-1 border-t border-amber-100">
              <span className="text-amber-600 font-medium">
                Adoption Fee: {cat.adoptionFee || "$150.00"}
              </span>
              {cat.isAltered && (
                <Badge
                  variant="outline"
                  className="bg-green-50 border-green-200 text-green-700 text-xs"
                >
                  Spayed/Neutered
                </Badge>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                asChild
                size="sm"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <a href="https://www.catfe.la/catfe-experiences" target="_blank" rel="noopener noreferrer">
                  <CalendarCheck className="w-4 h-4 mr-1.5" />
                  Book a Visit
                  <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="flex-1 border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                <a href="https://www.catfe.la/adopt" target="_blank" rel="noopener noreferrer">
                  <Heart className="w-4 h-4 mr-1.5" />
                  Adopt Me
                  <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery + Voting */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Guest Photos
              {photos.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {photos.length}
                </Badge>
              )}
            </h3>
            {remaining > 0 && (
              <Button
                size="sm"
                onClick={() => setShowUpload(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1"
              >
                <ImagePlus className="w-4 h-4" />
                Upload ({remaining} left)
              </Button>
            )}
          </div>

          {photos.length === 0 ? (
            <Card className="border-dashed border-2 border-amber-200 bg-amber-50/50">
              <CardContent className="py-12 text-center">
                <Camera className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                <p className="text-amber-700 font-medium">No photos yet!</p>
                <p className="text-amber-500 text-sm mt-1">
                  Be the first to share a photo of {cat.name}
                </p>
                {remaining > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setShowUpload(true)}
                    className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <ImagePlus className="w-4 h-4 mr-1" />
                    Upload Photo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {photos.map((photo, index) => {
                  const vs = voteStatus?.votes?.[photo.id];
                  const hasFreeVoted = vs?.freeVoted ?? false;

                  return (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden border-amber-100 shadow-md hover:shadow-lg transition-shadow">
                        {/* Photo */}
                        <div className="relative">
                          <img
                            src={photo.photoUrl}
                            alt={photo.caption || `Photo of ${cat.name}`}
                            className="w-full aspect-[4/3] object-cover"
                          />
                          {/* Rank badge */}
                          {index < 3 && (
                            <div
                              className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : "bg-amber-600"
                              }`}
                            >
                              #{index + 1}
                            </div>
                          )}
                        </div>

                        {/* Info & Voting */}
                        <CardContent className="p-3">
                          {photo.caption && (
                            <p className="text-sm text-gray-700 mb-2">
                              {photo.caption}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-amber-600">
                                by {photo.uploaderName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Vote count */}
                              <div className="flex items-center gap-1 text-amber-700">
                                <Heart
                                  className={`w-4 h-4 ${
                                    photo.voteCount > 0
                                      ? "fill-red-400 text-red-400"
                                      : ""
                                  }`}
                                />
                                <span className="text-sm font-semibold">
                                  {photo.voteCount}
                                </span>
                              </div>

                              {/* Free vote button */}
                              <Button
                                size="sm"
                                variant={hasFreeVoted ? "outline" : "default"}
                                disabled={
                                  hasFreeVoted || freeVoteMutation.isPending
                                }
                                onClick={() =>
                                  freeVoteMutation.mutate({
                                    photoId: photo.id,
                                    fingerprint,
                                  })
                                }
                                className={
                                  hasFreeVoted
                                    ? "border-green-300 text-green-700 bg-green-50"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                                }
                              >
                                <Heart
                                  className={`w-4 h-4 mr-1 ${
                                    hasFreeVoted ? "fill-green-500" : ""
                                  }`}
                                />
                                {hasFreeVoted ? "Voted" : "Vote"}
                              </Button>

                              {/* Bonus vote button (if has tokens) */}
                              {tokenBalance > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDonationVote(photo.id, 1)}
                                  disabled={donationVoteMutation.isPending}
                                  className="border-amber-300 text-amber-700 hover:bg-amber-50 gap-1"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                  +1
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Donation CTA */}
        <Card className="mt-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-bold text-amber-900">
              Want more votes? Support Catfé!
            </h3>
            <p className="text-sm text-amber-600 mt-1 mb-3">
              Donate to get extra vote tokens. 100% goes to our cats!
            </p>
            <Button
              onClick={() => setShowDonation(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Get Vote Tokens
            </Button>
            {tokenBalance > 0 && (
              <p className="text-xs text-amber-500 mt-2">
                You have {tokenBalance} token{tokenBalance !== 1 ? "s" : ""}{" "}
                remaining
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-amber-100 flex items-center justify-between">
                <h3 className="font-bold text-amber-900">
                  Upload Photo of {cat.name}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUpload(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 space-y-4">
                {/* Image preview / picker */}
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full aspect-[4/3] object-cover rounded-xl"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[4/3] border-2 border-dashed border-amber-300 rounded-xl bg-amber-50 flex flex-col items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
                  >
                    <Camera className="w-10 h-10 text-amber-400" />
                    <span className="text-amber-600 font-medium">
                      Tap to select photo
                    </span>
                    <span className="text-amber-400 text-xs">Max 10MB</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-amber-800 mb-1 block">
                    Your First Name
                  </label>
                  <Input
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder="e.g., Sarah"
                    maxLength={100}
                    className="border-amber-200 focus:ring-amber-500"
                  />
                </div>

                {/* Caption */}
                <div>
                  <label className="text-sm font-medium text-amber-800 mb-1 block">
                    Caption (optional)
                  </label>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={`What makes this photo of ${cat.name} special?`}
                    maxLength={300}
                    rows={2}
                    className="border-amber-200 focus:ring-amber-500"
                  />
                  <p className="text-xs text-amber-400 mt-1">
                    {caption.length}/300
                  </p>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={
                    !selectedImage ||
                    !uploaderName.trim() ||
                    uploadMutation.isPending
                  }
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {uploadMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <ImagePlus className="w-4 h-4 mr-2" />
                  )}
                  Upload Photo
                </Button>

                <p className="text-xs text-amber-400 text-center">
                  {remaining} upload{remaining !== 1 ? "s" : ""} remaining for{" "}
                  {cat.name}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <AnimatePresence>
        {showDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowDonation(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-amber-100 flex items-center justify-between">
                <h3 className="font-bold text-amber-900">
                  Support Catfé with a Donation
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDonation(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-amber-600">
                  Every dollar helps our cats! Choose a tier to get extra vote
                  tokens:
                </p>

                {donationTiers?.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setShowDonation(false);
                      checkoutMutation.mutate({
                        tierId: tier.id,
                        fingerprint,
                        catId,
                        catName: cat.name,
                      });
                    }}
                    disabled={checkoutMutation.isPending}
                    className="w-full p-4 border-2 border-amber-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all text-left flex items-center gap-3"
                  >
                    <span className="text-3xl">
                      {TIER_ICONS[tier.id] || "🎁"}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">
                          {tier.label}
                        </span>
                        <span className="font-bold text-amber-700">
                          ${(tier.amountCents / 100).toFixed(0)}
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 mt-0.5">
                        {tier.description}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-0">
                      {tier.tokens} votes
                    </Badge>
                  </button>
                ))}

                <p className="text-xs text-amber-400 text-center pt-2">
                  Secure payment via Stripe. 100% of donations support our
                  adoptable cats.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Action Bar (mobile-friendly) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-amber-200 p-3 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="text-xs text-amber-600">
            <span className="font-semibold">{photos.length}</span> photo
            {photos.length !== 1 ? "s" : ""} &middot;{" "}
            <span className="font-semibold">
              {photos.reduce((sum, p) => sum + p.voteCount, 0)}
            </span>{" "}
            total votes
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDonation(true)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Gift className="w-4 h-4 mr-1" />
              Donate
            </Button>
            <Button
              size="sm"
              onClick={handleShare}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
