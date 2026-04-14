// * File route karyawan: absensi/hooks/useAbsensiQueries.ts
import { useQuery } from "@tanstack/react-query";
import { attendancesService } from "../../../../../services/attendances.service";
import { geofencesService } from "../../../../../services/geofences.service";
import { karyawanService } from "../../../../../services/karyawan.service";
import { formatLocationLabel } from "../../../utils/absensi/formatters";
import type { GeocodingResponse, LocationState } from "../types/AbsensiTypes";

type UseAbsensiQueriesParams = {
  employeeId?: string;
  hasUser: boolean;
  locationState: LocationState;
  currentCoordinates: [number, number];
};

// & This hook encapsulates all attendance page queries into one reusable place.
// % Hook ini membungkus semua query halaman absensi ke satu tempat yang reusable.
const useAbsensiQueries = ({
  employeeId,
  hasUser,
  locationState,
  currentCoordinates,
}: UseAbsensiQueriesParams) => {
  const { data: selfDetail } = useQuery({
    queryKey: ["karyawan", "self-detail", employeeId],
    queryFn: () => {
      if (!employeeId) {
        throw new Error("Employee ID tidak tersedia.");
      }
      return karyawanService.getById(employeeId);
    },
    enabled: !!employeeId && locationState === "ready",
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const { data: myHistory } = useQuery({
    queryKey: ["attendances", "my-history", "schedule"],
    queryFn: () =>
      attendancesService.getMyHistory({
        page: 1,
        limit: 60,
        period: "month",
        filter: "all",
      }),
    enabled: hasUser && locationState === "ready",
    staleTime: 60 * 1000,
    retry: 1,
  });

  const { data: todayContext } = useQuery({
    queryKey: ["attendances", "today-context"],
    queryFn: () => attendancesService.getTodayContext("Asia/Jakarta"),
    enabled: hasUser && locationState === "ready",
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  });

  const { data: officeLocations } = useQuery({
    queryKey: ["geofences", "office-locations"],
    queryFn: () => geofencesService.getOfficeLocations(),
    enabled: locationState === "ready",
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: geocodedLocationLabel } = useQuery({
    queryKey: ["reverse-geocode", currentCoordinates[0], currentCoordinates[1]],
    queryFn: async () => {
      const [latitude, longitude] = currentCoordinates;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=id`,
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil nama lokasi dari API geocoding.");
      }

      const payload = (await response.json()) as GeocodingResponse;
      return formatLocationLabel(payload);
    },
    enabled: locationState === "ready",
    staleTime: 3 * 60 * 1000,
    retry: 1,
  });

  return {
    selfDetail,
    myHistory,
    todayContext,
    officeLocations,
    geocodedLocationLabel,
  };
};

export default useAbsensiQueries;
