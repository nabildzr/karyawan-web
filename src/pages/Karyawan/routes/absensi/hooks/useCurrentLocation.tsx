// * File route karyawan: absensi/hooks/useCurrentLocation.tsx
import { useMemo } from "react";

type UseCurrentLocationResult = {
  currentLocationLabel: string;
  geocodedLocationLabel?: string | undefined;
};

type UseCurrentLocationParams = {
  currentCoordinates: [number, number];
  geocodedLocationLabel?: string | undefined;
};

const useCurrentLocation = ({
  currentCoordinates,
  geocodedLocationLabel,
}: UseCurrentLocationParams): UseCurrentLocationResult => {
  const currentLocationLabel = useMemo(() => {
    if (geocodedLocationLabel) {
      return geocodedLocationLabel;
    }

    // & Fallback to raw coordinates when geocoded label is unavailable.
    // % Cadangan ke koordinat mentah saat label geocoded tidak tersedia.
    return `${currentCoordinates[0].toFixed(4)}, ${currentCoordinates[1].toFixed(4)}`;
  }, [currentCoordinates, geocodedLocationLabel]);

  return { currentLocationLabel, geocodedLocationLabel };
};

export default useCurrentLocation;
