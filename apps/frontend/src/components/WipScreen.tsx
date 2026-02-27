import { useI18n } from "../contexts/I18nContext";

export function WipScreen() {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <p className="text-xl font-medium text-neutral-600">
        {t("workInProgress")}
      </p>
      <div className="w-full max-w-xs overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-2 w-1/3 shrink-0 animate-loading-bar rounded-full bg-neutral-500"
          aria-busy
          aria-label={t("loading")}
        />
      </div>
    </div>
  );
}
