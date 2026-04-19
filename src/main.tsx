// * Frontend module: karyawan-web/src/main.tsx
// & This file defines frontend UI or logic for main.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk main.tsx.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </ThemeProvider>
    </StrictMode>
);

// Register Service Worker untuk Push Notification & PWA Caching
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[SW] Registered, scope:", registration.scope);

        // Cek update saat ada versi SW baru
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("[SW] New version available, will update on next reload.");
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error("[SW] Registration failed:", err);
      });
  });
}
