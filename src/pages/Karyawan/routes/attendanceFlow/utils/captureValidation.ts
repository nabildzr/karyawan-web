// * Utility ini menangani validasi capture kamera sebelum submit absensi.
// & This utility provides camera-frame validation and conversion helpers.
// % Utility ini menyediakan helper validasi frame kamera dan konversi data.

export interface ValidationState {
  faceStraight: boolean;
  lightEnough: boolean;
  noAccessories: boolean;
  avgBrightness: number;
  brightnessGap: number;
  accessories: string[];
  caption: string;
  captionError: string | null;
  lastUpdatedAt: number | null;
}

export const INITIAL_VALIDATION: ValidationState = {
  faceStraight: false,
  lightEnough: false,
  noAccessories: false,
  avgBrightness: 0,
  brightnessGap: 0,
  accessories: [],
  caption: "",
  captionError: null,
  lastUpdatedAt: null,
};

// & Convert camera frame Blob into data URL string.
// % Konversi Blob frame kamera menjadi string data URL.
export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Gagal mengubah gambar ke format data URL."));
    };

    reader.onerror = () => reject(new Error("Gagal membaca frame kamera."));
    reader.readAsDataURL(blob);
  });

// & Analyze average brightness and left-right brightness gap in frame.
// % Analisis brightness rata-rata dan selisih kiri-kanan pada frame.
export const analyzeFrameBrightness = (data: ImageData) => {
  const { width, data: rgba } = data;

  let sum = 0;
  let leftSum = 0;
  let rightSum = 0;

  const pixels = rgba.length / 4;

  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];

    const brightness = (r + g + b) / 3;
    sum += brightness;

    const pixelIndex = i / 4;
    const x = pixelIndex % width;

    if (x < width / 2) {
      leftSum += brightness;
    } else {
      rightSum += brightness;
    }
  }

  const avgBrightness = sum / pixels;
  const sidePixels = pixels / 2;
  const leftBrightness = leftSum / sidePixels;
  const rightBrightness = rightSum / sidePixels;
  const brightnessGap = Math.abs(leftBrightness - rightBrightness);

  return {
    avgBrightness,
    brightnessGap,
  };
};
