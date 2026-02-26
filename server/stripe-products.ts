/**
 * Donation tiers for vote token purchases.
 * Each tier maps a donation amount to a number of vote tokens.
 */
export const DONATION_TIERS = [
  {
    id: "tier_1",
    label: "Paw Print",
    amountCents: 100, // $1.00
    tokens: 5,
    description: "5 extra votes for your favorite cat photo",
  },
  {
    id: "tier_2",
    label: "Cat Nap",
    amountCents: 500, // $5.00
    tokens: 30,
    description: "30 extra votes — help your fave rise to the top!",
  },
  {
    id: "tier_3",
    label: "Full Purr",
    amountCents: 1000, // $10.00
    tokens: 75,
    description: "75 extra votes — the ultimate cat champion boost!",
  },
] as const;

export type DonationTier = (typeof DONATION_TIERS)[number];

export function getDonationTier(tierId: string): DonationTier | undefined {
  return DONATION_TIERS.find((t) => t.id === tierId);
}

export function getTokensForAmount(amountCents: number): number {
  const tier = DONATION_TIERS.find((t) => t.amountCents === amountCents);
  return tier?.tokens ?? 0;
}
