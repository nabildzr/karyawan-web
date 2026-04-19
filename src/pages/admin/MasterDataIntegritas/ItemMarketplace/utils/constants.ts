import type { Column } from "../../../../../components/tables/DataTables/DataTableOnline";
import type {
  CreateFlexibilityItemInput,
  FlexibilityItem,
} from "../../../../../types/integrity.types";

export const ITEM_TYPES = [
  { value: "late_allowance_15m", label: "Bebas Telat 15 Menit" },
  { value: "late_allowance_30m", label: "Bebas Telat 30 Menit" },
  { value: "late_allowance_60m", label: "Bebas Telat 60 Menit" },
  { value: "absence_excuse", label: "Konversi ABSENT -> LEAVE" },
  { value: "wfh_allowance", label: "Kelonggaran WFH (LATE/ABSENT -> LEAVE)" },
  { value: "flexibility_token", label: "Token Fleksibilitas (custom)" },
];

export const CONDITION_FIELD_OPTIONS = [
  { value: "", label: "Tanpa auto-apply (manual saja)" },
  {
    value: "attendance.lateMinutes",
    label: "Berlaku jika LATE <= N menit (attendance.lateMinutes)",
    hint: "Masukkan batas menit telat (mis: 15). Token dipakai otomatis jika karyawan terlambat <= nilai ini.",
  },
  {
    value: "attendance.status",
    label: "Berlaku untuk status absensi tertentu (attendance.status)",
    hint: "Pilih status LATE atau ABSENT. Token akan meng-override status tersebut.",
  },
] as const;

export const STATUS_VALUE_OPTIONS = [
  { value: "LATE", label: "LATE -> override ke PRESENT" },
  { value: "ABSENT", label: "ABSENT -> override ke LEAVE" },
  { value: "LATE,ABSENT", label: "LATE + ABSENT (keduanya)" },
];

export const EMPTY_FORM: CreateFlexibilityItemInput = {
  itemName: "",
  pointCost: 0,
  itemType: "late_allowance_15m",
  durationDays: 1,
  maxPerMonth: null,
  conditionField: "attendance.lateMinutes",
  conditionValue: "15",
  expiredAt: null,
  description: "",
  iconUrl: "",
  isActive: true,
};

export const CARD_GRADIENTS = [
  "from-brand-500 to-brand-600",
  "from-success-500 to-success-600",
  "from-warning-500 to-warning-600",
  "from-error-500 to-error-600",
  "from-purple-500 to-purple-600",
  "from-cyan-500 to-cyan-600",
];

export const MARKETPLACE_PAGE_LIMIT = 12;

export const DASHBOARD_MARKETPLACE_TABLE_COLUMNS: Column<FlexibilityItem>[] = [
  {
    header: "Item",
    accessor: "itemName",
  },
  {
    header: "Deskripsi",
    render: (item) => item.description || "-",
  },
  {
    header: "Tipe",
    accessor: "itemType",
    width: "w-40",
  },
  {
    header: "Harga",
    render: (item) => `${item.pointCost} Poin`,
    width: "w-32",
  },
  {
    header: "Status",
    render: (item) => (item.isActive ? "AKTIF" : "NONAKTIF"),
    width: "w-28",
  },
];

export const DASHBOARD_MARKETPLACE_SEARCH_PLACEHOLDER =
  "Cari nama item marketplace...";