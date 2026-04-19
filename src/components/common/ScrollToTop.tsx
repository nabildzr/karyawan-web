// * Frontend module: karyawan-web/src/components/common/ScrollToTop.tsx
// & This file defines frontend UI or logic for ScrollToTop.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk ScrollToTop.tsx.

import { useEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}
