import { mutator } from "satcheljs";
import { getSettingsStore } from "./settingsStore";
import { setLocale, setTheme, toggleFavorite, setAvatarUrl } from "./settingsActions";

function persistSettings() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("bitlow:settings", JSON.stringify(getSettingsStore()));
  } catch {
    // ignore
  }
}

mutator(setLocale, ({ locale }) => {
  getSettingsStore().locale = locale;
  persistSettings();
});

mutator(setTheme, ({ theme }) => {
  getSettingsStore().theme = theme;
  persistSettings();
});

mutator(toggleFavorite, ({ symbol }) => {
  const store = getSettingsStore();
  const idx = store.favorites.indexOf(symbol);
  if (idx === -1) {
    store.favorites.push(symbol);
  } else {
    store.favorites.splice(idx, 1);
  }
  persistSettings();
});

mutator(setAvatarUrl, ({ avatarUrl }) => {
  getSettingsStore().avatarUrl = avatarUrl;
  persistSettings();
});
