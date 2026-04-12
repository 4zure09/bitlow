import { action } from "satcheljs";
import type { Locale, Theme } from "@/types/market";

export const setLocale = action(
  "SET_LOCALE",
  (locale: Locale) => ({ locale })
);

export const setTheme = action(
  "SET_THEME",
  (theme: Theme) => ({ theme })
);

export const toggleFavorite = action(
  "TOGGLE_FAVORITE",
  (symbol: string) => ({ symbol })
);

export const setAvatarUrl = action(
  "SET_AVATAR_URL",
  (avatarUrl: string | null) => ({ avatarUrl })
);
