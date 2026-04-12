"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { NextIntlClientProvider } from "next-intl";
import { getSettingsStore } from "@/stores/settings/settingsStore";
import { setTheme } from "@/stores/settings/settingsActions";
import enMessages from "@/lib/i18n/en.json";
import viMessages from "@/lib/i18n/vi.json";

// Register all mutators + orchestrators (client-only)
import "@/stores/index";

const messages = { en: enMessages, vi: viMessages };

function ThemeApplier() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // Apply saved theme on mount
    setTheme(getSettingsStore().theme);
  }, []);

  return null;
}

const IntlWrapper = observer(function IntlWrapper({ children }: { children: ReactNode }) {
  const locale = getSettingsStore().locale;
  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  );
});

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <IntlWrapper>
      <ThemeApplier />
      {children}
    </IntlWrapper>
  );
}
