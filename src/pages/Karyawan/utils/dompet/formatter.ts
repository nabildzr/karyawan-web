// * This file provides formatter helpers for employee dompet displays.

// & Format ISO date into compact Indonesian date text.
// % Memformat tanggal ISO menjadi teks tanggal Indonesia ringkas.
export function formatLedgerDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// & Format ISO date into detailed Indonesian datetime text for history timeline.
// % Memformat tanggal ISO menjadi teks tanggal-jam Indonesia yang lebih detail untuk timeline riwayat.
export function formatLedgerDateTime(iso: string) {
  const value = new Date(iso);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return `${value.toLocaleString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  })} WIB`;
}

// & Build short avatar label from full name or fallback NIP.
// % Membuat label avatar singkat dari nama lengkap atau fallback NIP.
export function getAvatarLabel(fullName?: string | null, nip?: string | null) {
  const initials = fullName
    ?.split(" ")
    .map((value) => value[0])
    .join("");

  return initials || nip?.substring(0, 2).toUpperCase() || "ND";
}
