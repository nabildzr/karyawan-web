// * This file defines route module logic for src/pages/Karyawan/routes/review/types/RadarTypes.ts.

// & This interface defines one radar chart point with current and max values.
// % Interface ini mendefinisikan satu titik radar chart dengan nilai saat ini dan maksimum.

export interface RadarPoint {
  label: string;
  value: number;
  max: number;
}
