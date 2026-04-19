// * Frontend module: karyawan-web/src/pages/AuthPages/AuthPageLayout.tsx
// & This file defines frontend UI or logic for AuthPageLayout.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk AuthPageLayout.tsx.

import React from "react";
import { Link } from "react-router";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-800 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/admin" className="block mb-4">
                  <img
                    width={231}
                    height={48}
                    src="https://i.pinimg.com/1200x/be/59/53/be59530206c1045d45a5c5a74872e21c.jpg"
                    alt="Logo"
                  />
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60">
               Smart Attendance, Smart Work. Absensi Pintar, Fokus Maksimal
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
