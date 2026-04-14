// * Utility ini menangani helper umum untuk flow processing absensi.
// & This utility provides generic async and browser helper functions.
// % Utility ini menyediakan fungsi helper umum untuk async dan browser API.

// & Create simple async delay for step transition synchronization.
// % Buat delay async sederhana untuk sinkronisasi perpindahan step.
export const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

// & Convert captured data URL into File object for multipart upload.
// % Konversi data URL hasil capture menjadi File untuk upload multipart.
export const dataUrlToFile = (dataUrl: string): File => {
  const [header, raw] = dataUrl.split(",");

  if (!header || !raw) {
    throw new Error("Data foto capture tidak valid.");
  }

  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const binary = window.atob(raw);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], `attendance-${Date.now()}.jpg`, { type: mime });
};

// & Get user device coordinates via Geolocation API.
// % Ambil koordinat perangkat user via Geolocation API.
export const getDeviceLocation = async (): Promise<{
  latitude?: number;
  longitude?: number;
  label: string;
}> => {
  if (!navigator.geolocation) {
    return { label: "Lokasi perangkat tidak tersedia" };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        resolve({
          latitude,
          longitude,
          label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        });
      },
      () => {
        resolve({ label: "Lokasi perangkat tidak tersedia" });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      },
    );
  });
};
