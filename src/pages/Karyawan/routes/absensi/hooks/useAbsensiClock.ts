// * File route karyawan: absensi/hooks/useAbsensiClock.ts
import { useEffect, useMemo, useState } from "react";
import { formatClock24WithSeconds } from "../../../utils/absensi/formatters";

// & This hook provides realtime clock state and formatted date/time labels.
// % Hook ini menyediakan state jam realtime dan label tanggal/jam terformat.
const useAbsensiClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const currentTimeLabel = useMemo(() => formatClock24WithSeconds(now), [now]);

  const currentDateLabel = useMemo(
    () =>
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }),
    [now],
  );

  return {
    now,
    currentTimeLabel,
    currentDateLabel,
  };
};

export default useAbsensiClock;
