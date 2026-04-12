"use client";

import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import { getSettingsStore } from "@/stores/settings/settingsStore";
import { setTheme } from "@/stores/settings/settingsActions";

export const ThemeToggle = observer(function ThemeToggle() {
  const t = useTranslations("settings");
  const store = getSettingsStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--muted-foreground)]">{t("theme")}:</span>
      <button
        onClick={() => setTheme(store.theme === "dark" ? "light" : "dark")}
        className="relative w-12 h-6 rounded-full bg-[var(--card-border)] transition-colors flex items-center"
        aria-label="Toggle theme"
      >
        <span
          className={`absolute w-5 h-5 rounded-full transition-transform flex items-center justify-center text-xs ${
            store.theme === "dark"
              ? "translate-x-6 bg-[var(--accent)]"
              : "translate-x-1 bg-yellow-400"
          }`}
        >
          {store.theme === "dark" ? "🌙" : "☀️"}
        </span>
      </button>
      <span className="text-sm text-[var(--foreground)]">
        {store.theme === "dark" ? t("dark") : t("light")}
      </span>
    </div>
  );
});
