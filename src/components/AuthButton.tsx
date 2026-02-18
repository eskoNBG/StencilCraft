"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import Link from "next/link";

export function AuthButton() {
  const { data: session, status } = useSession();
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link href="/auth/signin">
        <Button variant="ghost" size="sm" className="gap-1">
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">{t("auth.signIn")}</span>
        </Button>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold hover:opacity-80 transition-opacity"
      >
        {session.user.image ? (
          <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          (session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 py-1">
          <div className="px-3 py-2 border-b border-zinc-700">
            <p className="text-sm font-medium truncate">{session.user.name || session.user.email}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            {t("account.title")}
          </Link>
          <button
            onClick={() => { signOut(); setMenuOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-800 transition-colors w-full text-left text-red-400"
          >
            <LogOut className="w-4 h-4" />
            {t("auth.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
