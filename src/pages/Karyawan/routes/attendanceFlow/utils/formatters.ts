// * Utility ini menangani formatter tampilan hasil attendance flow.
// & This utility formats attendance flow values into UI-friendly labels.
// % Utility ini memformat nilai flow absensi menjadi label yang ramah UI.

// & Format action type into user-friendly UI label.
// % Ubah CHECK_IN atau CHECK_OUT menjadi label UI.
export const formatActionLabel = (action?: string | null) => {
  if (action === "CHECK_IN") return "Check In";
  if (action === "CHECK_OUT") return "Check Out";
  return "-";
};

// & Format ISO timestamp into Indonesian local date-time string.
// % Format timestamp ISO ke string waktu lokal Indonesia.
export const formatDateTime = (iso: string | null) => {
  if (!iso) return "-";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
};
