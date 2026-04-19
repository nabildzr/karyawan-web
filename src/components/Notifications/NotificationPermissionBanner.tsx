// * Frontend component: NotificationPermissionBanner.tsx
// Banner untuk meminta izin push notification dari user.

import { Bell, BellOff, X } from "lucide-react";
import { useState } from "react";
import { usePushSubscription } from "../../hooks/usePushSubscription";

interface Props {
  onDismiss?: () => void;
}

const NotificationPermissionBanner = ({ onDismiss }: Props) => {
  const { isSupported, isSubscribed, permission, isLoading, subscribe, error } =
    usePushSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Jangan tampilkan kalau:
  // - Browser tidak support
  // - User sudah subscribe
  // - User sudah menolak permission (denied) — tidak bisa diminta lagi
  // - User sudah dismiss banner ini
  if (!isSupported || isSubscribed || permission === "denied" || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleSubscribe = async () => {
    await subscribe();
  };

  return (
    <div
      role="alert"
      className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 shadow-sm"
    >
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
        <Bell size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900">Aktifkan Notifikasi</p>
        <p className="mt-0.5 text-xs text-blue-700 leading-snug">
          Dapatkan notifikasi real-time untuk absensi, poin, dan pengajuanmu.
        </p>

        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}

        <button
          id="btn-enable-push-notification"
          onClick={handleSubscribe}
          disabled={isLoading}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Mengaktifkan...
            </>
          ) : (
            <>
              <Bell size={12} />
              Aktifkan Sekarang
            </>
          )}
        </button>
      </div>

      {/* Dismiss button */}
      <button
        id="btn-dismiss-notification-banner"
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition"
        aria-label="Tutup banner"
      >
        <X size={14} />
      </button>
    </div>
  );
};

/** Badge kecil untuk tombol toggle notifikasi di settings */
export const NotificationToggle = () => {
  const { isSupported, isSubscribed, permission, isLoading, subscribe, unsubscribe } =
    usePushSubscription();

  if (!isSupported) return null;

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const isDenied = permission === "denied";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isSubscribed ? (
          <Bell size={16} className="text-blue-500" />
        ) : (
          <BellOff size={16} className="text-gray-400" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-800">
            Push Notification
          </p>
          <p className="text-xs text-gray-500">
            {isDenied
              ? "Diblokir di pengaturan browser"
              : isSubscribed
              ? "Notifikasi aktif di perangkat ini"
              : "Belum aktif di perangkat ini"}
          </p>
        </div>
      </div>

      <button
        id="btn-toggle-push-notification"
        onClick={handleToggle}
        disabled={isLoading || isDenied}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
          isSubscribed ? "bg-blue-500" : "bg-gray-200"
        }`}
        aria-checked={isSubscribed}
        role="switch"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isSubscribed ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default NotificationPermissionBanner;
