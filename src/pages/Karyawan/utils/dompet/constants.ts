// * This file stores static defaults and UI constants for the employee dompet route.
import type { DompetTabItem } from "./types";

// & Keep query limits in one place so tabs fetch data consistently.
// % Menaruh limit query di satu tempat agar fetch data tiap tab konsisten.
export const DOMPET_QUERY_LIMITS = {
  ledger: 3,
  marketplace: 12,
  inventory: 10,
} as const;

// & Define ordered tab button configuration for dompet navigation.
// % Mendefinisikan konfigurasi urutan tombol tab untuk navigasi dompet.
export const DOMPET_TABS: readonly DompetTabItem[] = [
  { key: "wallet", label: "Dompet" },
  { key: "ledger", label: "Riwayat" },
  { key: "marketplace", label: "Marketplace" },
  { key: "inventory", label: "Inventory" },
];

// & Provide visual gradients for marketplace cards.
// % Menyediakan warna gradient visual untuk kartu marketplace.
export const MARKETPLACE_GRADIENTS: readonly string[] = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-purple-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-rose-500 to-pink-600",
];
