import type { Column } from "../../../../../components/tables/DataTables/DataTableOnline";
import type {
  CreatePointRuleInput,
  PointRule,
} from "../../../../../types/integrity.types";
import type { ConditionFieldOption, TargetRoleOption } from "../types";

export const CONDITION_FIELDS = [
  {
    value: "attendance.monthlyCount",
    label: "Absensi Sempurna per Bulan (jumlah hari)",
    valueType: "number",
    allowedOps: ["<", ">", "==", "BETWEEN", "<=", ">="],
    placeholder: "Contoh: 20",
    betweenPlaceholder: "15,22",
  },
  {
    value: "attendance.lateMinutes",
    label: "Durasi Keterlambatan (menit)",
    valueType: "number",
    allowedOps: ["<", ">", "==", "BETWEEN", "<=", ">="],
    placeholder: "15",
    betweenPlaceholder: "5,15",
  },
  {
    value: "attendance.minutesEarly",
    label: "Datang Lebih Awal (menit)",
    valueType: "number",
    allowedOps: ["<", ">", "==", "BETWEEN", "<=", ">="],
    placeholder: "10",
    betweenPlaceholder: "5,30",
  },
  {
    value: "attendance.isAbsent",
    label: "Status Alpa",
    valueType: "boolean",
    allowedOps: ["=="],
    placeholder: "true",
    betweenPlaceholder: "true",
  },
  {
    value: "attendance.isLate",
    label: "Status Terlambat",
    valueType: "boolean",
    allowedOps: ["=="],
    placeholder: "true",
    betweenPlaceholder: "true",
  },
] as const satisfies readonly ConditionFieldOption[];

export const CONDITION_OPS = [
  { value: "<", label: "Kurang Dari (<)" },
  { value: ">", label: "Lebih Dari (>)" },
  { value: "==", label: "Sama Dengan (==)" },
  { value: "BETWEEN", label: "Antara (BETWEEN)" },
  { value: "<=", label: "Kurang Sama Dengan (<=)" },
  { value: ">=", label: "Lebih Sama Dengan (>=)" },
];

export const BOOLEAN_VALUE_OPTIONS = [
  { value: "true", label: "True (Ya)" },
  { value: "false", label: "False (Tidak)" },
];

export const OPERATOR_SENTENCE_MAP: Record<string, string> = {
  "<": "lebih kecil dari",
  ">": "lebih besar dari",
  "==": "sama dengan",
  "<=": "lebih kecil atau sama dengan",
  ">=": "lebih besar atau sama dengan",
};

export const FALLBACK_TARGET_ROLES: TargetRoleOption[] = [
  { value: "*", label: "Semua" },
  { value: "KARYAWAN", label: "Karyawan" },
  { value: "SISWA", label: "Siswa" },
  { value: "HR", label: "HR" },
  { value: "MANAGER", label: "Manager" },
];

export const EMPTY_FORM: CreatePointRuleInput = {
  ruleName: "",
  targetRole: "*",
  conditionField: "",
  conditionOp: "<",
  conditionValue: "",
  pointModifier: 0,
  description: "",
};

export const DASHBOARD_RULES_TABLE_COLUMNS: Column<PointRule>[] = [
  {
    header: "Nama Aturan",
    accessor: "ruleName",
    render: (rule) =>
      rule.targetRole && rule.targetRole !== "*"
        ? `${rule.ruleName} (${rule.targetRole})`
        : rule.ruleName,
  },
  {
    header: "Kriteria",
    render: (rule) =>
      `${rule.conditionField} ${rule.conditionOp} ${rule.conditionValue}`,
  },
  {
    header: "Poin",
    render: (rule) => `${rule.pointModifier > 0 ? "+" : ""}${rule.pointModifier}`,
    className: "text-center",
    width: "w-28",
  },
  {
    header: "Status",
    render: (rule) => (rule.isActive ? "AKTIF" : "NONAKTIF"),
    className: "text-center",
    width: "w-28",
  },
];

export const DASHBOARD_RULES_SEARCH_PLACEHOLDER =
  "Cari nama aturan atau kriteria...";