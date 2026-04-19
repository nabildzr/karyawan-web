// * This file defines type contracts used by employee wallet (dompet) route modules.

// & Define supported tab keys in karyawan dompet page.
// % Mendefinisikan key tab yang didukung di halaman dompet karyawan.
export type DompetTabKey = "wallet" | "ledger" | "marketplace" | "inventory";

// & Define metadata for each dompet tab button.
// % Mendefinisikan metadata untuk tiap tombol tab dompet.
export interface DompetTabItem {
  key: DompetTabKey;
  label: string;
}
