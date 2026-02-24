import type { AuthUser } from "backend/schemas/auth";
import { useI18n } from "../contexts/I18nContext";
import type { Locale } from "../locales";

type AppHeaderProps = { user: AuthUser };

export function AppHeader({ user }: AppHeaderProps) {
  const { t, locale, setLocale } = useI18n();

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-4 border-b border-neutral-200 bg-white px-4">
      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <span>{t("language")}</span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-neutral-800"
          aria-label={t("language")}
        >
          <option value="pt">PT</option>
          <option value="en">EN</option>
        </select>
      </label>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-neutral-700">
          {user.email}
        </span>
        <div
          className="h-9 w-9 shrink-0 rounded-full bg-neutral-200"
          aria-hidden
        />
      </div>
    </header>
  );
}
