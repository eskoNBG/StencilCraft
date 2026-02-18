"use client";

import { Shield, Clock, Globe } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export function TrustBadges() {
  const { t } = useLocale();

  const badges = [
    { icon: Shield, label: t("trust.ssl"), desc: t("trust.sslDesc") },
    { icon: Clock, label: t("trust.uptime"), desc: t("trust.uptimeDesc") },
    { icon: Globe, label: t("trust.gdpr"), desc: t("trust.gdprDesc") },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-12">
      {badges.map((badge, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/10 text-sm"
        >
          <badge.icon className="w-4 h-4 text-primary" />
          <span className="font-medium">{badge.label}</span>
          <span className="text-muted-foreground hidden sm:inline">- {badge.desc}</span>
        </div>
      ))}
    </div>
  );
}
