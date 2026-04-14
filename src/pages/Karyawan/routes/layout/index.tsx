// * This file defines route module logic for src/pages/Karyawan/routes/layout/index.tsx.

import { NavLink, Outlet, useLocation } from "react-router";
import { NAV_ITEMS } from "../../utils/layout/constants";

// & This function component/helper defines KaryawanLayoutPage behavior for this route file.
// % Fungsi komponen/helper ini mendefinisikan perilaku KaryawanLayoutPage untuk file route ini.
const KaryawanLayoutPage = () => {
  // & Process the main execution steps of KaryawanLayoutPage inside this function body.
  // % Memproses langkah eksekusi utama KaryawanLayoutPage di dalam body fungsi ini.
  const location = useLocation();
  const hideBottomNav = location.pathname.startsWith("/karyawan/absensi");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex min-h-screen w-full items-center justify-center">
        <div className="relative flex h-screen w-full max-w-[425px] flex-col overflow-hidden border border-gray-300 bg-white shadow-md">
          <div
            className={`
            flex-1 overflow-y-auto no-scrollbar ${hideBottomNav ? "pb-4" : "pb-24"}`}
          >
            <Outlet />
          </div>

          {!hideBottomNav && (
            <nav className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-theme-sm backdrop-blur">
              <ul
                className="grid gap-1 text-center text-[11px] font-semibold text-gray-500"
                style={{ gridTemplateColumns: `repeat(${NAV_ITEMS.length}, minmax(0, 1fr))` }}
              >
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `block rounded-xl px-2 py-2 transition ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-500 hover:bg-gray-50"}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default KaryawanLayoutPage;
