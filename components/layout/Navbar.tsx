"use client";

import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SearchBar } from "@/components/search/SearchBar";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { AvatarUpload } from "@/components/settings/AvatarUpload";

export const Navbar = observer(function Navbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className="font-bold text-lg text-[var(--foreground)] hidden sm:block">
            Bitlow
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          <ThemeToggle />
          <LanguageSwitcher />
          <AvatarUpload />
        </div>
      </div>
    </header>
  );
});
