"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PricingCard } from "@/components/PricingCard";
import { Header } from "@/components/Header";
import { useLocale } from "@/hooks/useLocale";
import { Sparkles } from "lucide-react";

export default function PricingPage() {
  const { t } = useLocale();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSelect = async (tier: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    if (tier === "free") return;

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  const freeFeatures = [
    { label: t("pricing.feat.stencilsDay", { count: "3" }), included: true },
    { label: t("pricing.feat.basicStyles"), included: true },
    { label: t("pricing.feat.pngExport"), included: true },
    { label: t("pricing.feat.allStyles"), included: false },
    { label: t("pricing.feat.gallery"), included: false },
    { label: t("pricing.feat.svgExport"), included: false },
    { label: t("pricing.feat.psdExport"), included: false },
  ];

  const proFeatures = [
    { label: t("pricing.feat.stencilsMonth", { count: "100" }), included: true },
    { label: t("pricing.feat.allStyles"), included: true },
    { label: t("pricing.feat.gallery"), included: true },
    { label: t("pricing.feat.svgExport"), included: true },
    { label: t("pricing.feat.psdExport"), included: true },
    { label: t("pricing.feat.pngExport"), included: true },
    { label: t("pricing.feat.priority"), included: false },
  ];

  const studioFeatures = [
    { label: t("pricing.feat.unlimited"), included: true },
    { label: t("pricing.feat.allStyles"), included: true },
    { label: t("pricing.feat.gallery"), included: true },
    { label: t("pricing.feat.svgExport"), included: true },
    { label: t("pricing.feat.psdExport"), included: true },
    { label: t("pricing.feat.pngExport"), included: true },
    { label: t("pricing.feat.priority"), included: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">{t("pricing.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard
            tier="free"
            name="Free"
            price={0}
            features={freeFeatures}
            onSelect={() => handleSelect("free")}
          />
          <PricingCard
            tier="pro"
            name="Pro"
            price={14}
            features={proFeatures}
            highlighted
            onSelect={() => handleSelect("pro")}
          />
          <PricingCard
            tier="studio"
            name="Studio"
            price={29}
            features={studioFeatures}
            onSelect={() => handleSelect("studio")}
          />
        </div>
      </div>
    </div>
  );
}
