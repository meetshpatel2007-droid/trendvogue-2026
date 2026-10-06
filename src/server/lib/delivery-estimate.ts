/**
 * Dynamic delivery date estimation.
 * Metro pincodes → 2–3 business days
 * Non-metro → 4–6 business days
 *
 * This is deterministic logic (no external API) suitable for COD/dummy payment flows.
 */

// Major Indian metro area pincode prefixes
const METRO_PREFIXES = new Set([
  "110", // Delhi
  "400", "401", "402", "403", // Mumbai
  "560", // Bengaluru
  "600", "601", "602", "603", // Chennai
  "700", "711", "712", // Kolkata
  "500", "501", "502", // Hyderabad
  "380", "382", "383", // Ahmedabad
  "411", "412", // Pune
  "302", "303", // Jaipur
  "226", "227", // Lucknow
]);

export type DeliveryTier = "metro" | "standard";

interface DeliveryEstimate {
  estimatedDelivery: Date;
  tier: DeliveryTier;
  minDays: number;
  maxDays: number;
  label: string;
}

function isMetroPincode(pincode: string): boolean {
  if (!pincode || pincode.length < 3) return false;
  return METRO_PREFIXES.has(pincode.substring(0, 3));
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // Skip Sunday (0). We allow Saturday deliveries for Indian e-commerce.
    if (dayOfWeek !== 0) {
      added++;
    }
  }
  return result;
}

export function calculateDeliveryEstimate(pincode: string): DeliveryEstimate {
  const metro = isMetroPincode(pincode);
  const tier: DeliveryTier = metro ? "metro" : "standard";
  const minDays = metro ? 2 : 4;
  const maxDays = metro ? 3 : 6;

  // Use max days as the conservative estimate shown to customer
  const now = new Date();
  // Add handling time: 1 business day to pack
  const afterHandling = addBusinessDays(now, 1);
  const estimatedDelivery = addBusinessDays(afterHandling, maxDays);

  const formatter = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return {
    estimatedDelivery,
    tier,
    minDays,
    maxDays,
    label: `Arriving by ${formatter.format(estimatedDelivery)}`,
  };
}

export function getDeliveryTierLabel(tier: DeliveryTier): string {
  return tier === "metro" ? "Express Delivery" : "Standard Delivery";
}
