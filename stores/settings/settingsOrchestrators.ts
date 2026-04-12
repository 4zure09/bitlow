import { orchestrator } from "satcheljs";
import { setTheme } from "./settingsActions";

// Apply theme class to document root whenever theme changes
orchestrator(setTheme, ({ theme }) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
});
