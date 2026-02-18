"use client";

import { Users, Image, Star, Zap } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export function SocialProof() {
  const { t } = useLocale();

  const stats = [
    { icon: Users, value: "1,000+", label: t("social.artists") },
    { icon: Image, value: "50,000+", label: t("social.stencils") },
    { icon: Star, value: "4.9/5", label: t("social.rating") },
    { icon: Zap, value: "<5s", label: t("social.avgTime") },
  ];

  const testimonials = [
    {
      quote: t("social.testimonial1"),
      author: t("social.author1"),
      role: t("social.role1"),
    },
    {
      quote: t("social.testimonial2"),
      author: t("social.author2"),
      role: t("social.role2"),
    },
    {
      quote: t("social.testimonial3"),
      author: t("social.author3"),
      role: t("social.role3"),
    },
  ];

  return (
    <section className="py-16 border-t border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold theme-gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">{t("social.title")}</h2>
          <p className="text-muted-foreground">{t("social.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="glass rounded-xl p-6 border-primary/10"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div>
                <div className="font-medium text-sm">{item.author}</div>
                <div className="text-xs text-muted-foreground">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
