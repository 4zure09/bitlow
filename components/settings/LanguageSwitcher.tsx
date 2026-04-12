"use client";

import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import { getSettingsStore } from "@/stores/settings/settingsStore";
import { setLocale } from "@/stores/settings/settingsActions";
import type { Locale } from "@/types/market";

const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

export const LanguageSwitcher = observer(function LanguageSwitcher() {
  const t = useTranslations("settings");
  const store = getSettingsStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--muted-foreground)]">{t("language")}:</span>
      <div className="flex rounded-lg overflow-hidden border border-[var(--card-border)]">
        {LOCALES.map(({ value, label, flag }) => (
          <button
            key={value}
            onClick={() => setLocale(value)}
            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
              store.locale === value
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--card-border)]"
            }`}
            title={label}
          >
            <span>{flag}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
