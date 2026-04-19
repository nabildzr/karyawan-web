import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({

  server: {
    allowedHosts: true,
    host: true,         // Sama dengan --host
    port: 5173
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    VitePWA({
      // Gunakan 'injectManifest' agar kita bisa kontrol SW kita sendiri
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",
      // File output SW yang sudah di-inject manifest
      injectManifest: {
        injectionPoint: undefined, // kita handle caching manual
      },
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "Portal Karyawan",
        short_name: "Karyawan",
        description: "Portal absensi dan informasi karyawan",
        theme_color: "#3B82F6",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/karyawan",
        icons: [
          {
            src: "/favicon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
