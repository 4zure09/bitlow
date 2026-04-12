import { createStore } from "satcheljs";
import type { Locale, Theme } from "@/types/market";

export interface SettingsStoreState {
  locale: Locale;
  theme: Theme;
  favorites: string[];
  avatarUrl: string | null;
}

const getInitialState = (): SettingsStoreState => {
  if (typeof window === "undefined") {
    return { locale: "en", theme: "dark", favorites: [], avatarUrl: null };
  }
  try {
    const saved = localStorage.getItem("bitlow:settings");
    if (saved) {
      return JSON.parse(saved) as SettingsStoreState;
    }
  } catch {
    // ignore
  }
  return { locale: "en", theme: "dark", favorites: [], avatarUrl: null };
};

export const getSettingsStore = createStore(
  "settingsStore",
  getInitialState()
);
