// * File route karyawan: absensi/hooks/useAbsensiLocation.ts
import { useCallback, useState } from "react";
import { getLocationErrorMessage } from "../../../utils/absensi/logic";
import type { LocationState } from "../types/AbsensiTypes";

const DEFAULT_COORDINATES: [number, number] = [-6.2615, 106.8106];

// & This hook centralizes geolocation state and request flow for attendance page.
// % Hook ini memusatkan state geolokasi dan alur request untuk halaman absensi.
const useAbsensiLocation = (initialCoordinates: [number, number] = DEFAULT_COORDINATES) => {
  const [locationState, setLocationState] = useState<LocationState>("checking");
  const [locationError, setLocationError] = useState<string>("");
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [currentCoordinates, setCurrentCoordinates] = useState<[number, number]>(
    initialCoordinates,
  );

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationState("blocked");
      setLocationError(
        "Browser tidak mendukung geolocation. Gunakan browser yang mendukung lokasi.",
      );
      return;
    }

    setLocationState("checking");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentCoordinates([position.coords.latitude, position.coords.longitude]);
        setLocationState("ready");
        setRecenterTrigger((previousValue) => previousValue + 1);
      },
      (error) => {
        setLocationState("blocked");
        setLocationError(getLocationErrorMessage(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  return {
    locationState,
    locationError,
    recenterTrigger,
    currentCoordinates,
    requestLocation,
  };
};

export default useAbsensiLocation;
