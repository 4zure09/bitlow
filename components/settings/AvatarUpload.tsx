"use client";

import { useRef } from "react";
import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import { getSettingsStore } from "@/stores/settings/settingsStore";
import { setAvatarUrl } from "@/stores/settings/settingsActions";

export const AvatarUpload = observer(function AvatarUpload() {
  const t = useTranslations("settings");
  const store = getSettingsStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="w-9 h-9 rounded-full overflow-hidden border-2 border-[var(--card-border)] hover:border-[var(--accent)] transition-colors flex items-center justify-center bg-[var(--card)] flex-shrink-0"
      title={t("uploadAvatar")}
    >
      {store.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={store.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </button>
  );
});
