import type { AuthUser } from "backend/schemas/auth";
import { useRef, useState } from "react";
import { updateProfile, uploadProfilePicture } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";

type ProfileModalProps = {
  user: AuthUser;
  onClose: () => void;
};

export function ProfileModal({ user, onClose }: ProfileModalProps) {
  const { t } = useI18n();
  const { accessToken, refreshUser } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || isSaving) return;

    try {
      setIsSaving(true);
      await updateProfile(accessToken, { name });
      await refreshUser();
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert(t("update_failed") || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !accessToken || isUploading) return;

    try {
      setIsUploading(true);
      await uploadProfilePicture(accessToken, file);
      await refreshUser();
    } catch (err) {
      console.error("[ProfileModal] Failed to upload profile picture:", err);
      alert(t("upload_failed") || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="border-b border-neutral-100 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            {t("profile")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group h-24 w-24 overflow-hidden rounded-full bg-neutral-100 ring-4 ring-white shadow-md">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.name || user.email}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-neutral-400">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-[10px] font-medium uppercase">
                  {isUploading ? "..." : t("change")}
                </span>
              </button>

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              >
                {t("email")}
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              >
                {t("name")}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("enter_your_name")}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-300"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-md shadow-neutral-200 flex items-center justify-center gap-2"
            >
              {isSaving && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
