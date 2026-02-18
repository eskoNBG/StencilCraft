export const PRICING_TIERS = {
  free: {
    name: "Free",
    nameKey: "pricing.free" as const,
    price: 0,
    priceId: null,
    features: {
      stencilsPerDay: 3,
      styles: ["outline", "simple"],
      gallery: false,
      galleryLimit: 0,
      svgExport: false,
      upscaling: false,
      priority: false,
    },
  },
  pro: {
    name: "Pro",
    nameKey: "pricing.pro" as const,
    price: 14,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    features: {
      stencilsPerMonth: 100,
      styles: ["outline", "simple", "detailed", "hatching", "solid"],
      gallery: true,
      galleryLimit: 50,
      svgExport: true,
      upscaling: true,
      priority: false,
    },
  },
  studio: {
    name: "Studio",
    nameKey: "pricing.studio" as const,
    price: 29,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID || null,
    features: {
      stencilsPerMonth: Infinity,
      styles: ["outline", "simple", "detailed", "hatching", "solid"],
      gallery: true,
      galleryLimit: Infinity,
      svgExport: true,
      upscaling: true,
      priority: true,
    },
  },
} as const;

export type TierKey = keyof typeof PRICING_TIERS;

export function canUseStyle(tier: TierKey, style: string): boolean {
  return (PRICING_TIERS[tier].features.styles as readonly string[]).includes(style);
}

export function getGalleryLimit(tier: TierKey): number {
  return PRICING_TIERS[tier].features.galleryLimit;
}

export function canUseGallery(tier: TierKey): boolean {
  return PRICING_TIERS[tier].features.gallery;
}

export function canExportSvg(tier: TierKey): boolean {
  return PRICING_TIERS[tier].features.svgExport;
}
