"use client";

import { useEffect, useState } from "react";
import { loadProfile, saveProfile } from "@/lib/client";
import { useI18n } from "@/lib/i18n";
import { AvatarPicker, DEFAULT_AVATAR } from "./ui";

export function useProfile() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage
      setName(p.name);
      setAvatar(p.avatar);
    }
  }, []);

  return {
    name,
    avatar,
    setName,
    setAvatar,
    persist: () => saveProfile(name.trim(), avatar),
  };
}

export function ProfileFields({ profile }: { profile: ReturnType<typeof useProfile> }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-extrabold uppercase tracking-wider">{t("yourName")}</span>
        <input
          value={profile.name}
          onChange={(e) => profile.setName(e.target.value)}
          maxLength={16}
          placeholder={t("namePlaceholder")}
          className="brut-sm w-full bg-white px-4 py-3 text-xl font-bold outline-none focus:bg-lemon/30"
        />
      </label>
      <div>
        <span className="mb-2 block text-sm font-extrabold uppercase tracking-wider">{t("yourAvatar")}</span>
        <AvatarPicker value={profile.avatar} onChange={profile.setAvatar} />
      </div>
    </div>
  );
}
