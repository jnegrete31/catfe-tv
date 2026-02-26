/**
 * Generate and persist a device fingerprint for voting/upload tracking.
 * This is a simple localStorage-based fingerprint — not cryptographic,
 * but sufficient for casual vote-limiting in a community context.
 */
export function getFingerprint(): string {
  const key = "catfe_device_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = `fp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(key, fp);
  }
  return fp;
}
