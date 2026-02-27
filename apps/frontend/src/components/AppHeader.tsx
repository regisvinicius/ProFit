import type { AuthUser } from "backend/schemas/auth";
import { useState } from "react";
import { useI18n } from "../contexts/I18nContext";
import type { Locale } from "../locales";
import { ProfileModal } from "./ProfileModal";

type AppHeaderProps = { user: AuthUser };

export function AppHeader({ user }: AppHeaderProps) {
  const { t, locale, setLocale } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-end gap-4 border-b border-neutral-200 bg-white px-4">
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <span>{t("language")}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded border border-neutral-300 bg-white px-2 py-1 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            aria-label={t("language")}
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
          </select>
        </label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">
            {user.name || user.email}
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-2 ring-white shadow-sm transition-all hover:ring-neutral-200 focus:outline-none focus:ring-neutral-400"
          >
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.name || user.email}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-500">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </button>
        </div>
      </header>

      {isModalOpen && (
        <ProfileModal user={user} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
