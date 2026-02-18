"use client";

import { useLocale } from "@/hooks/useLocale";
import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl theme-gradient flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("contact.title")}</h1>
          <p className="text-muted-foreground">{t("contact.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass rounded-xl p-6 border-primary/10 text-center">
            <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">{t("contact.email")}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t("contact.emailDesc")}</p>
            <a href="mailto:support@stencilcraft.app" className="text-primary hover:underline text-sm font-medium">
              support@stencilcraft.app
            </a>
          </div>
          <div className="glass rounded-xl p-6 border-primary/10 text-center">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">{t("contact.faq")}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t("contact.faqDesc")}</p>
            <Link href="/pricing#faq" className="text-primary hover:underline text-sm font-medium">
              {t("contact.faqLink")}
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">{t("contact.responseTime")}</p>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <Link href="/" className="text-primary hover:underline text-sm">{t("common.back")}</Link>
        </div>
      </div>
    </div>
  );
}
