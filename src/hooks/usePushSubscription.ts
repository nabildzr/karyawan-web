// * Frontend hook: usePushSubscription.ts
// Mengelola lifecycle Web Push Subscription — subscribe, unsubscribe, cek status.

import { useCallback, useEffect, useState } from "react";
import { notificationsService } from "../services/notifications.service";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PermissionState = "default" | "granted" | "denied";

export const usePushSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cek dukungan browser dan status awal
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission as PermissionState);

    // Cek apakah sudah subscribe
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
      });
    });

    // Listen pushsubscriptionchange dari SW (re-subscribe kalau expired)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGE") {
        const sub = event.data.subscription as PushSubscriptionJSON;
        if (sub) {
          notificationsService.subscribeToPush(sub).catch(console.error);
        }
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  const resolveVapidPublicKey = useCallback(async () => {
    const fromEnv = String(VAPID_PUBLIC_KEY ?? "").trim();
    const looksLikeValidEnvKey = (() => {
      if (!fromEnv) {
        return false;
      }

      try {
        const bytes = urlBase64ToUint8Array(fromEnv);
        return bytes.length === 65 && bytes[0] === 0x04;
      } catch {
        return false;
      }
    })();

    if (looksLikeValidEnvKey) {
      return fromEnv;
    }

    return notificationsService.getPushPublicKey();
  }, []);

  const validateVapidPublicKey = useCallback((key: string) => {
    const normalized = String(key || "").trim();
    if (!normalized) {
      throw new Error("VAPID public key belum dikonfigurasi.");
    }

    const bytes = urlBase64ToUint8Array(normalized);
    // Uncompressed P-256 public key should be 65 bytes and start with 0x04.
    if (bytes.length !== 65 || bytes[0] !== 0x04) {
      throw new Error("VAPID public key tidak valid. Periksa konfigurasi server/frontend.");
    }

    const keyBuffer = new ArrayBuffer(bytes.length);
    new Uint8Array(keyBuffer).set(bytes);

    return keyBuffer;
  }, []);

  /** Minta izin & subscribe ke Web Push */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Browser kamu tidak mendukung push notification.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Minta permission dari user
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result !== "granted") {
        setError("Izin notifikasi ditolak. Aktifkan dari pengaturan browser.");
        return false;
      }

      // 2. Resolve VAPID key from env or backend and validate shape
      const vapidKey = await resolveVapidPublicKey();
      const appServerKey = validateVapidPublicKey(vapidKey);

      // 3. Subscribe via PushManager
      const registration = await navigator.serviceWorker.ready;

      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        const existingJson = existingSubscription.toJSON();
        if (existingJson.endpoint && existingJson.keys) {
          await notificationsService.subscribeToPush(existingJson);
        }
        setIsSubscribed(true);
        return true;
      }

      let subscription: PushSubscription;
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey,
        });
      } catch (firstError: any) {
        // Recover once for stale SW push state and retry subscribe.
        const stale = await registration.pushManager.getSubscription();
        if (stale) {
          await stale.unsubscribe().catch(() => undefined);
        }

        if (firstError?.name === "AbortError" || firstError?.name === "InvalidStateError") {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: appServerKey,
          });
        } else {
          throw firstError;
        }
      }

      // 4. Kirim ke backend
      const subJson = subscription.toJSON();
      if (subJson.endpoint && subJson.keys) {
        await notificationsService.subscribeToPush(subJson);
      }

      setIsSubscribed(true);
      return true;
    } catch (err: any) {
      console.error("Failed to subscribe push notification:", err);
      if (err.name === "NotAllowedError") {
        setError("Izin notifikasi ditolak.");
      } else if (err.name === "AbortError") {
        setError(
          "Registrasi push gagal. Jika kamu menggunakan Brave Browser, pastikan 'Use Google Services for Push Messaging' aktif di pengaturan privasi (brave://settings/privacy).",
        );
      } else {
        setError(err.message || "Gagal mengaktifkan notifikasi.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, resolveVapidPublicKey, validateVapidPublicKey]);

  /** Unsubscribe dari Web Push */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        // Hapus dari backend juga
        await notificationsService.unsubscribeFromPush(endpoint).catch(console.error);
      }

      setIsSubscribed(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Gagal menonaktifkan notifikasi.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
    error,
  };
};
