// sw.js — Service Worker untuk Portal Karyawan
// Menangani: Push Notifications + Offline Caching (PWA)

const CACHE_NAME = "karyawan-v1";
const STATIC_ASSETS = [
  "/",
  "/favicon.png",
];

// ─── Install: Cache static assets ───────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: Bersihkan cache lama ────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: Network-first untuk API, Cache-first untuk assets ─────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Jangan intercept API calls atau chrome-extension
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/v1/") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // Cache-first untuk assets statis (gambar, font, dll)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff2|woff|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Network-first untuk HTML pages (SPA routing)
  event.respondWith(
    fetch(event.request).catch(() => caches.match("/"))
  );
});

// ─── Push Notification ────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Notifikasi Baru", body: event.data.text() };
    }
  }

  const title = data.title || "Portal Karyawan";
  const options = {
    body: data.body || "Kamu punya notifikasi baru",
    icon: data.icon || "/favicon.png",
    badge: "/favicon.png",
    vibrate: [100, 50, 100],
    tag: data.tag || "karyawan-notification",
    renotify: true,
    data: {
      url: data.url || "/karyawan/notifikasi",
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Buka",
      },
      {
        action: "close",
        title: "Tutup",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification Click ──────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.action === "close"
      ? null
      : new URL(
          event.notification.data?.url || "/karyawan/notifikasi",
          self.location.origin
        ).href;

  if (!targetUrl) return;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Kalau tab sudah terbuka, focus saja
        for (const client of windowClients) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // Kalau belum ada, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── Push Subscription Change (auto re-subscribe kalau expired) ──────────
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
      })
      .then((subscription) => {
        // Kirim subscription baru ke backend via postMessage ke client
        return clients.matchAll({ type: "window" }).then((clients) => {
          clients.forEach((client) =>
            client.postMessage({
              type: "PUSH_SUBSCRIPTION_CHANGE",
              subscription: subscription.toJSON(),
            })
          );
        });
      })
  );
});
