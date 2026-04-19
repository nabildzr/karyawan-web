// * Frontend module: karyawan-web/src/layout/Backdrop.tsx
// & This file defines frontend UI or logic for Backdrop.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk Backdrop.tsx.

import { useSidebar } from "../context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
