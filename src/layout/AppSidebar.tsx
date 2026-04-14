import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import { useAuthContext } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
} from "../icons";
import type { PermissionAction, UserRole } from "../types/auth.types";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  requiredAction?: PermissionAction;
  /** Kalau diisi, item hanya muncul untuk role yang ada di list ini */
  roles?: UserRole[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Inline SVG icon untuk map pin (tidak ada di icon library)
const MapPinIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

 const adminPath = (path: string) => (path === "/" ? "/admin" : `/admin${path}`);

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: adminPath("/"),
  },
];

const hierarkiItems: NavItem[] = [
  { icon: <CalenderIcon />, name: "Divisi", path: adminPath("/divisi") },
  { icon: <CalenderIcon />, name: "Jabatan", path: adminPath("/jabatan") },
];

const karyawanItems: NavItem[] = [
  {
    icon: <BoxCubeIcon />,
    name: "Karyawan & Pengguna",
    path: adminPath("/karyawan"),
    roles: ["ADMIN", "HR", "CEO"],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Manajemen Wajah",
    path: adminPath("/manajemen-wajah"),
    roles: ["ADMIN", "HR"],
  },
];

const jadwalKerjaItems: NavItem[] = [
  {
    icon: <CalenderIcon />,
    name: "Jadwal Kerja",
    path: adminPath("/jadwal-kerja"),
    roles: ["ADMIN", "CEO", "HR"],
  },
  // { icon: <CalenderIcon />, name: "Shift", path: "/shift" },
  // { icon: <CalenderIcon />, name: "Jadwal Hari", path: "/jadwal-hari" },
  {
    icon: <CalenderIcon />,
    name: "Manajemen Libur",
    path: adminPath("/manajemen-libur"),
    roles: ["ADMIN", "HR"],
  },
];

const absensiItems: NavItem[] = [
  {
    icon: <ListIcon />,
    name: "Data Absensi",
    path: adminPath("/daftar-absensi"),
    roles: ["ADMIN", "CEO", "HR"],
  },
  {
    icon: <ListIcon />,
    name: "Koreksi Absensi",
    path: adminPath("/koreksi-absensi"),
    roles: ["ADMIN", "HR"],
  },
  {
    icon: <ListIcon />,
    name: "Absensi Manual",
    path: adminPath("/absensi-manual"),
    roles: ["ADMIN", "HR"],
  },
  {
    icon: MapPinIcon,
    name: "Geofence",
    path: adminPath("/geofences"),
    roles: ["ADMIN", "CEO"],
  },
];

const pengajuanItems: NavItem[] = [
  {
    icon: <ListIcon />,
    name: "Daftar Pengajuan",
    path: adminPath("/daftar-pengajuan"),
    roles: ["ADMIN", "HR", "MANAGER", "CEO"],
  },
];

const penilaianItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Penilaian Karyawan",
    path: adminPath("/input-penilaian"),
    roles: ["ADMIN", "HR", "MANAGER", "CEO"],
  },
  {
    icon: <PieChartIcon />,
    name: "Penilaian per Divisi",
    path: adminPath("/penilaian-per-divisi"),
    roles: ["ADMIN", "HR", "CEO"],
  },
  {
    icon: <PieChartIcon />,
    name: "Kategori Penilaian",
    path: adminPath("/manajemen-kategori"),
    roles: ["ADMIN", "HR", "CEO"],
  },
  {
    icon: <PieChartIcon />,
    name: "Laporan Penilaian",
    path: adminPath("/laporan-penilaian"),
    roles: ["ADMIN", "HR", "CEO"],
  },
];

const laporanItems: NavItem[] = [
  {
    icon: <TableIcon />,
    name: "Laporan Absensi",
    path: adminPath("/laporan-absensi"),
  },
  {
    icon: <TableIcon />,
    name: "Laporan Pengajuan",
    path: adminPath("/laporan-pengajuan"),
  },
];

const logsItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Audit Logs",
    path: adminPath("/audit-logs"),
    roles: ["ADMIN"],
  },
];

const keamananItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "RBAC",
    path: adminPath("/rbac"),
    roles: ["ADMIN"],
  },
];

const menuGroups: { type: string; items: NavItem[] }[] = [
  { type: "main", items: navItems },
  { type: "hierarki", items: hierarkiItems },
  { type: "karyawan", items: karyawanItems },
  { type: "jadwalKerja", items: jadwalKerjaItems },
  { type: "absensi", items: absensiItems },
  { type: "pengajuan", items: pengajuanItems },
  { type: "penilaian", items: penilaianItems },
  { type: "laporan", items: laporanItems },
  { type: "logs", items: logsItems },
  { type: "keamanan", items: keamananItems },
];



// const othersItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Charts",
//     subItems: [
//       { name: "Line Chart", path: "/line-chart", pro: false },
//       { name: "Bar Chart", path: "/bar-chart", pro: false },
//     ],
//   },
//   {
//     icon: <BoxCubeIcon />,
//     name: "UI Elements",
//     subItems: [
//       { name: "Alerts", path: "/alerts", pro: false },
//       { name: "Avatar", path: "/avatars", pro: false },
//       { name: "Badge", path: "/badge", pro: false },
//       { name: "Buttons", path: "/buttons", pro: false },
//       { name: "Images", path: "/images", pro: false },
//       { name: "Videos", path: "/videos", pro: false },
//     ],
//   },
//   {
//     icon: <PlugInIcon />,
//     name: "Authentication",
//     subItems: [
//       { name: "Sign In", path: "/signin", pro: false },
//       { name: "Sign Up", path: "/signup", pro: false },
//     ],
//   },
// ];



const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, hasRole, hasRoutePermission } = useAuthContext();
  const location = useLocation();

  /** True jika item boleh dilihat user saat ini */
  const canSee = useCallback(
    (item: NavItem) => {
      if (!user) return false;

      if (item.path) {
        return hasRoutePermission(item.path, item.requiredAction ?? "READ");
      }

      if (!item.roles || item.roles.length === 0) {
        return true;
      }

      return hasRole(item.roles);
    },
    [hasRole, hasRoutePermission, user],
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: string;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    menuGroups.forEach(({ type: menuType, items }) => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: string) => (
    <ul className="flex flex-col gap-4">
      {items.filter(canSee).map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text text-start">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  /** Renders a named section; returns null when no items are visible for current role */
  const renderSection = (label: string, items: NavItem[], menuType: string) => {
    if (!items.some(canSee)) return null;
    return (
      <div>
        <h2
          className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            label
          ) : (
            <HorizontaLDots className="size-6" />
          )}
        </h2>
        {renderMenuItems(items, menuType)}
      </div>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/admin">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {renderSection("Master Data Hierarki", hierarkiItems, "hierarki")}
            {renderSection("Master Data Pengguna", karyawanItems, "karyawan")}
            {renderSection(
              "Master Data Jadwal Kerja",
              jadwalKerjaItems,
              "jadwalKerja",
            )}
            {renderSection("Master Data Absensi", absensiItems, "absensi")}
            {renderSection("Master Data Pengajuan", pengajuanItems, "pengajuan")}
            {renderSection(
              "Master Data Penilaian",
              penilaianItems,
              "penilaian",
            )}
            {renderSection("Master Data Keamanan", keamananItems, "keamanan")}
            {renderSection("Master Data Logs", logsItems, "logs")}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
