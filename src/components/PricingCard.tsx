"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Crown } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface PricingCardProps {
  tier: "free" | "pro" | "studio";
  name: string;
  price: number;
  yearlyPrice?: number;
  creditsPerMonth?: number;
  features: { label: string; included: boolean }[];
  highlighted?: boolean;
  onSelect: () => void;
  currentTier?: string;
}

export function PricingCard({
  tier,
  name,
  price,
  yearlyPrice,
  creditsPerMonth,
  features,
  highlighted,
  onSelect,
  currentTier,
}: PricingCardProps) {
  const { t } = useLocale();
  const isCurrent = currentTier === tier;

  return (
    <Card
      className={`relative overflow-hidden ${
        highlighted
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
          : "glass border-zinc-700"
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]" />
      )}
      <CardHeader className="text-center pb-2">
        {highlighted && (
          <div className="flex justify-center mb-2">
            <Crown className="w-6 h-6 text-primary" />
          </div>
        )}
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {price === 0 ? t("pricing.freePrice") : `${price}\u20AC`}
          </span>
          {price > 0 && (
            <span className="text-muted-foreground">
              {yearlyPrice ? t("pricing.perMonthYearly") : t("pricing.perMonth")}
            </span>
          )}
        </div>
        {price > 0 && creditsPerMonth && creditsPerMonth < Infinity && (
          <p className="text-xs text-muted-foreground mt-1">
            {(price / creditsPerMonth).toFixed(2)}{"\u20AC"} {t("pricing.perStencil")}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              {feature.included ? (
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              )}
              <span className={feature.included ? "" : "text-muted-foreground"}>
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
        <Button
          onClick={onSelect}
          disabled={isCurrent}
          className={`w-full ${
            highlighted
              ? "bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] hover:opacity-90"
              : ""
          }`}
          variant={highlighted ? "default" : "outline"}
        >
          {isCurrent
            ? t("pricing.currentPlan")
            : price === 0
            ? t("pricing.getStarted")
            : t("pricing.subscribe")}
        </Button>
      </CardContent>
    </Card>
  );
}
