"use client";

import { Users } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export function TeamSection() {
  const { t } = useLocale();

  const team = [
    {
      name: t("team.member1Name"),
      role: t("team.member1Role"),
      bio: t("team.member1Bio"),
    },
    {
      name: t("team.member2Name"),
      role: t("team.member2Role"),
      bio: t("team.member2Bio"),
    },
  ];

  return (
    <section id="team" className="py-16 border-t border-border/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gradient-from)]/20 to-[var(--gradient-to)]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">{t("team.title")}</h2>
          <p className="text-muted-foreground">{t("team.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {team.map((member, i) => (
            <div key={i} className="glass rounded-xl p-6 border-primary/10 text-center">
              <div className="w-20 h-20 rounded-full theme-gradient mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
                {member.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-primary mb-2">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
