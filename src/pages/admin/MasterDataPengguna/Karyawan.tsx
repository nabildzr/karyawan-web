import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "../../../api/apiClient";
import ComponentCard from "../../../components/common/ComponentCard";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import type { Column } from "../../../components/tables/DataTables/DataTable";
import DataTableOnline from "../../../components/tables/DataTables/DataTableOnline";
import { Modal } from "../../../components/ui/modal";
import { useAuthContext } from "../../../context/AuthContext";
import { useKaryawan } from "../../../hooks/useKaryawan";
import { jabatanService } from "../../../services/jabatan.service";
import { karyawanService } from "../../../services/karyawan.service";
import { rbacService } from "../../../services/rbac.service";
import type { Position } from "../../../types/hierarki.types";
import type {
    CreateEmployeeInput,
    Employee,
    EmployeeDetail2,
    UpdateEmployeeInput,
    WorkingScheduleBasic,
} from "../../../types/karyawan.types";
import type { RbacRole } from "../../../types/rbac.types";

const GENDER_OPTIONS = ["Laki-laki", "Perempuan"];
const MARITAL_OPTIONS = ["Belum Menikah", "Menikah", "Cerai"];
const RELIGION_OPTIONS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];
const EMPLOYMENT_TYPE_OPTIONS = ["Full-Time", "Part-Time", "Contract", "Internship"];

// ── Helpers ──────────────────────────────────────────────────
function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDateInputValue(isoStr: string | null | undefined): string {
  if (!isoStr) return "";
  return isoStr.slice(0, 10);
}

// Badge component
function RoleBadge({ label, inactive = false }: { label: string; inactive?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        inactive
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          : "bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
      }`}
    >
      {label}
    </span>
  );
}

// ── Detail Modal ─────────────────────────────────────────────
function KaryawanDetailModal({
  employeeId,
  onClose,
}: {
  employeeId: string | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<EmployeeDetail2 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employeeId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    karyawanService
      .getById(employeeId)
      .then(setDetail)
      .catch(() => toast.error("Gagal memuat detail karyawan"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const d = detail?.employeeDetails?.[0];
  const roleLabel = detail?.user?.rbacRole?.name ?? "—";
  const roleInactive = detail?.user?.rbacRole
    ? !detail.user.rbacRole.isActive
    : false;

  return (
    <Modal isOpen={!!employeeId} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      )}
      {!loading && detail && (
        <>
          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-xl font-bold shrink-0">
              {detail.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {detail.fullName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                NIP: {detail.user.nip} •{" "}
                <RoleBadge label={roleLabel} inactive={roleInactive} />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Informasi Akun & Jabatan */}
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Informasi Kerja
              </p>
              <div className="space-y-2.5 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                <DetailRow label="Posisi" value={detail.position?.name} />
                <DetailRow label="Divisi" value={detail.position?.division?.name} />
                <DetailRow label="Gaji Pokok" value={detail.position?.gajiPokok != null ? `Rp ${detail.position.gajiPokok.toLocaleString("id-ID")}` : null} />
                <DetailRow label="Tipe Karyawan" value={d?.employmentType} />
                <DetailRow label="Jadwal Kerja" value={detail.workingSchedules?.name} />
                <DetailRow label="Tanggal Bergabung" value={formatDate(detail.joinDate)} />
                <DetailRow label="Tanggal Hire" value={formatDate(d?.hireDate)} />
              </div>
            </section>

            {/* Informasi Pribadi */}
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Informasi Pribadi
              </p>
              <div className="space-y-2.5 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                <DetailRow label="Email" value={detail.email} />
                <DetailRow label="No. Telepon" value={detail.phoneNumber} />
                <DetailRow label="Alamat" value={detail.address} />
                <DetailRow label="Jenis Kelamin" value={d?.gender} />
                <DetailRow label="Tempat Lahir" value={d?.placeOfBirth} />
                <DetailRow label="Tanggal Lahir" value={formatDate(d?.dateOfBirth)} />
                <DetailRow label="Status Pernikahan" value={d?.maritalStatus} />
                <DetailRow label="Agama" value={d?.religion} />
              </div>
            </section>

            {/* Informasi Bank */}
            <section className="md:col-span-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Informasi Bank
              </p>
              <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                <DetailRow label="Nama Bank" value={d?.bankName} />
                <DetailRow label="No. Rekening" value={d?.bankAccountNumber} />
              </div>
            </section>
          </div>
        </>
      )}
    </Modal>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-right">
        {value ?? <span className="italic text-gray-300 dark:text-gray-600">—</span>}
      </span>
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────
function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500";

const selectCls = inputCls;

// ── Create Modal ──────────────────────────────────────────────
interface CreateKaryawanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeInput) => Promise<void>;
  loading?: boolean;
  positions: Position[];
  workingSchedules: WorkingScheduleBasic[];
  rbacRoles: RbacRole[];
}

function CreateKaryawanModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  positions,
  workingSchedules,
  rbacRoles,
}: CreateKaryawanModalProps) {
  const activeRoles = rbacRoles.filter((role) => role.isActive);

  const [activeTab, setActiveTab] = useState<"main" | "details">("main");
  const [form, setForm] = useState({
    // user
    nip: "",
    rbacRoleId: "",
    // employee
    fullName: "",
    address: "",
    email: "",
    phoneNumber: "",
    joinDate: "",
    positionId: "",
    workingSchedulesId: "",
    // details (all optional)
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "",
    maritalStatus: "",
    religion: "",
    bankName: "",
    bankAccountNumber: "",
    hireDate: "",
    employmentType: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || activeRoles.length === 0) return;

    setForm((prev) => {
      if (prev.rbacRoleId) return prev;

      const defaultRole =
        activeRoles.find((role) => role.key === "USER") ?? activeRoles[0];

      return {
        ...prev,
        rbacRoleId: defaultRole.id,
      };
    });
  }, [activeRoles, isOpen]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.rbacRoleId) {
      setErrorMsg("Role RBAC wajib dipilih.");
      return;
    }

    const payload: CreateEmployeeInput = {
      user: { nip: form.nip, rbacRoleId: form.rbacRoleId },
      employee: {
        fullName: form.fullName,
        address: form.address || null,
        email: form.email,
        phoneNumber: form.phoneNumber || null,
        joinDate: form.joinDate ? new Date(form.joinDate).toISOString() : new Date().toISOString(),
        positionId: form.positionId || null,
        workingSchedulesId: form.workingSchedulesId || null,
      },
    };

    // Only include details if any field is non-empty
    const hasDetails =
      form.dateOfBirth ||
      form.placeOfBirth ||
      form.gender ||
      form.maritalStatus ||
      form.religion ||
      form.bankName ||
      form.bankAccountNumber ||
      form.hireDate ||
      form.employmentType;

    if (hasDetails) {
      payload.details = {
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
        placeOfBirth: form.placeOfBirth || null,
        gender: form.gender || null,
        maritalStatus: form.maritalStatus || null,
        religion: form.religion || null,
        bankName: form.bankName || null,
        bankAccountNumber: form.bankAccountNumber || null,
        hireDate: form.hireDate ? new Date(form.hireDate).toISOString() : null,
        employmentType: form.employmentType || null,
      };
    }

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan data.");
    }
  };

  const Tab = ({
    id,
    label,
  }: {
    id: "main" | "details";
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === id
          ? "bg-brand-500 text-white"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
        Tambah Karyawan Baru
      </h3>

      {/* Tabs */}
      <div className="mb-5 flex gap-2 rounded-xl bg-gray-50 p-1 dark:bg-white/[0.03]">
        <Tab id="main" label="Data Utama" />
        <Tab id="details" label="Data Pribadi (Opsional)" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === "main" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="NIP" required hint="Harus berupa angka">
                <input
                  type="text"
                  required
                  pattern="[0-9]+"
                  title="NIP harus berupa angka"
                  value={form.nip}
                  onChange={(e) => set("nip", e.target.value)}
                  placeholder="Contoh: 1001"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Role Sistem (RBAC)" required>
                <select
                  required
                  value={form.rbacRoleId}
                  onChange={(e) => set("rbacRoleId", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Pilih Role RBAC —</option>
                  {activeRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.key})
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Nama Lengkap" required>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Nama lengkap karyawan"
                className={inputCls}
              />
            </FormField>

            <FormField
              label="Email"
              required
              hint="Email harus aktif untuk pengiriman akun NIP dan password karyawan"
            >
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@perusahaan.com"
                className={inputCls}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="No. Telepon">
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => set("phoneNumber", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Tanggal Bergabung" required>
                <input
                  type="date"
                  required
                  value={form.joinDate}
                  onChange={(e) => set("joinDate", e.target.value)}
                  className={inputCls}
                />
              </FormField>
            </div>

            <FormField label="Alamat">
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Alamat lengkap (opsional)"
                className={`${inputCls} resize-none`}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Posisi / Jabatan">
                <select
                  value={form.positionId}
                  onChange={(e) => set("positionId", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Pilih Posisi —</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.division ? ` (${p.division.name})` : ""}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Jadwal Kerja">
                <select
                  value={form.workingSchedulesId}
                  onChange={(e) => set("workingSchedulesId", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Tanpa Jadwal —</option>
                  {workingSchedules.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </>
        )}

        {activeTab === "details" && (
          <>
            <p className="text-sm text-gray-400 dark:text-gray-500 -mt-1">
              Semua field di bawah ini bersifat opsional.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Jenis Kelamin">
                <select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Pilih —</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Status Pernikahan">
                <select
                  value={form.maritalStatus}
                  onChange={(e) => set("maritalStatus", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Pilih —</option>
                  {MARITAL_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Tempat Lahir">
                <input
                  type="text"
                  value={form.placeOfBirth}
                  onChange={(e) => set("placeOfBirth", e.target.value)}
                  placeholder="Kota kelahiran"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Tanggal Lahir">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Agama">
                <select
                  value={form.religion}
                  onChange={(e) => set("religion", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Pilih —</option>
                  {RELIGION_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Tipe Karyawan">
                <select
                  value={form.employmentType}
                  onChange={(e) => set("employmentType", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Pilih —</option>
                  {EMPLOYMENT_TYPE_OPTIONS.map((et) => (
                    <option key={et} value={et}>
                      {et}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Tanggal Hire">
                <input
                  type="date"
                  value={form.hireDate}
                  onChange={(e) => set("hireDate", e.target.value)}
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nama Bank">
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => set("bankName", e.target.value)}
                  placeholder="BCA, BNI, dll."
                  className={inputCls}
                />
              </FormField>
              <FormField label="No. Rekening">
                <input
                  type="text"
                  value={form.bankAccountNumber}
                  onChange={(e) => set("bankAccountNumber", e.target.value)}
                  placeholder="Nomor rekening"
                  className={inputCls}
                />
              </FormField>
            </div>
          </>
        )}

        {errorMsg && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Tambah Karyawan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit Modal ────────────────────────────────────────────────
interface EditKaryawanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateEmployeeInput) => Promise<void>;
  loading?: boolean;
  employee: Employee | null;
  positions: Position[];
  workingSchedules: WorkingScheduleBasic[];
  rbacRoles: RbacRole[];
}

function EditKaryawanModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  employee,
  positions,
  workingSchedules,
  rbacRoles,
}: EditKaryawanModalProps) {
  const activeRoles = rbacRoles.filter((role) => role.isActive);

  const [activeTab, setActiveTab] = useState<"main" | "details">("main");
  const [form, setForm] = useState({
    nip: "",
    rbacRoleId: "",
    fullName: "",
    address: "",
    email: "",
    phoneNumber: "",
    joinDate: "",
    positionId: "",
    workingSchedulesId: "",
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "",
    maritalStatus: "",
    religion: "",
    bankName: "",
    bankAccountNumber: "",
    hireDate: "",
    employmentType: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate form when employee changes
  useEffect(() => {
    if (!employee) return;
    // Fetch full detail to get details fields
    karyawanService
      .getById(employee.id)
      .then((detail) => {
        const d = detail.employeeDetails?.[0];
        setForm({
          nip: detail.user.nip ?? "",
          rbacRoleId: detail.user.rbacRoleId ?? "",
          fullName: detail.fullName ?? "",
          address: detail.address ?? "",
          email: detail.email ?? "",
          phoneNumber: detail.phoneNumber ?? "",
          joinDate: toDateInputValue(detail.joinDate),
          positionId: detail.position?.id ?? "",
          workingSchedulesId: detail.workingSchedulesId ?? "",
          dateOfBirth: toDateInputValue(d?.dateOfBirth),
          placeOfBirth: d?.placeOfBirth ?? "",
          gender: d?.gender ?? "",
          maritalStatus: d?.maritalStatus ?? "",
          religion: d?.religion ?? "",
          bankName: d?.bankName ?? "",
          bankAccountNumber: d?.bankAccountNumber ?? "",
          hireDate: toDateInputValue(d?.hireDate),
          employmentType: d?.employmentType ?? "",
        });
      })
      .catch(() => toast.error("Gagal memuat data karyawan"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.id]);

  useEffect(() => {
    if (!isOpen || activeRoles.length === 0) return;

    setForm((prev) => {
      if (prev.rbacRoleId) return prev;

      const defaultRole =
        activeRoles.find((role) => role.key === "USER") ?? activeRoles[0];

      return {
        ...prev,
        rbacRoleId: defaultRole.id,
      };
    });
  }, [activeRoles, isOpen]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setErrorMsg(null);

    if (!form.rbacRoleId) {
      setErrorMsg("Role RBAC wajib dipilih.");
      return;
    }

    const payload: UpdateEmployeeInput = {
      user: { nip: form.nip, rbacRoleId: form.rbacRoleId },
      employee: {
        fullName: form.fullName,
        address: form.address || null,
        email: form.email,
        phoneNumber: form.phoneNumber || null,
        joinDate: form.joinDate ? new Date(form.joinDate).toISOString() : undefined,
        positionId: form.positionId || null,
        workingSchedulesId: form.workingSchedulesId || null,
      },
      details: {
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
        placeOfBirth: form.placeOfBirth || null,
        gender: form.gender || null,
        maritalStatus: form.maritalStatus || null,
        religion: form.religion || null,
        bankName: form.bankName || null,
        bankAccountNumber: form.bankAccountNumber || null,
        hireDate: form.hireDate ? new Date(form.hireDate).toISOString() : null,
        employmentType: form.employmentType || null,
      },
    };
    try {
      await onSubmit(employee.id, payload);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan data.");
    }
  };

  const Tab = ({ id, label }: { id: "main" | "details"; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === id
          ? "bg-brand-500 text-white"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
        Edit Karyawan — <span className="text-brand-500">{employee?.fullName}</span>
      </h3>

      <div className="mb-5 flex gap-2 rounded-xl bg-gray-50 p-1 dark:bg-white/[0.03]">
        <Tab id="main" label="Data Utama" />
        <Tab id="details" label="Data Pribadi" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === "main" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="NIP" required hint="Harus berupa angka">
                <input
                  type="text"
                  required
                  pattern="[0-9]+"
                  value={form.nip}
                  onChange={(e) => set("nip", e.target.value)}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Role Sistem (RBAC)" required>
                <select
                  required
                  value={form.rbacRoleId}
                  onChange={(e) => set("rbacRoleId", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Pilih Role RBAC —</option>
                  {activeRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.key})
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Nama Lengkap" required>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className={inputCls}
              />
            </FormField>

            <FormField label="Email" required hint="Email harus aktif untuk pengiriman akun NIP dan password karyawan">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputCls}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="No. Telepon">
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => set("phoneNumber", e.target.value)}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Tanggal Bergabung">
                <input
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => set("joinDate", e.target.value)}
                  className={inputCls}
                />
              </FormField>
            </div>

            <FormField label="Alamat">
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Posisi / Jabatan">
                <select
                  value={form.positionId}
                  onChange={(e) => set("positionId", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Pilih Posisi —</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.division ? ` (${p.division.name})` : ""}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Jadwal Kerja">
                <select
                  value={form.workingSchedulesId}
                  onChange={(e) => set("workingSchedulesId", e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Tanpa Jadwal —</option>
                  {workingSchedules.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </>
        )}

        {activeTab === "details" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Jenis Kelamin">
                <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={selectCls}>
                  <option value="">— Pilih —</option>
                  {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </FormField>
              <FormField label="Status Pernikahan">
                <select value={form.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value)} className={selectCls}>
                  <option value="">— Pilih —</option>
                  {MARITAL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </FormField>
              <FormField label="Tempat Lahir">
                <input type="text" value={form.placeOfBirth} onChange={(e) => set("placeOfBirth", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="Tanggal Lahir">
                <input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="Agama">
                <select value={form.religion} onChange={(e) => set("religion", e.target.value)} className={selectCls}>
                  <option value="">— Pilih —</option>
                  {RELIGION_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </FormField>
              <FormField label="Tipe Karyawan">
                <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={selectCls}>
                  <option value="">— Pilih —</option>
                  {EMPLOYMENT_TYPE_OPTIONS.map((et) => <option key={et} value={et}>{et}</option>)}
                </select>
              </FormField>
              <FormField label="Tanggal Hire">
                <input type="date" value={form.hireDate} onChange={(e) => set("hireDate", e.target.value)} className={inputCls} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nama Bank">
                <input type="text" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="BCA, BNI, dll." className={inputCls} />
              </FormField>
              <FormField label="No. Rekening">
                <input type="text" value={form.bankAccountNumber} onChange={(e) => set("bankAccountNumber", e.target.value)} className={inputCls} />
              </FormField>
            </div>
          </>
        )}

        {errorMsg && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Batal
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Karyawan() {
  const { user: authUser } = useAuthContext();
  const currentUserId = authUser?.id ?? "";

  const { employees, meta, loading, error, handleQueryChange, fetchAll, create, update, remove } =
    useKaryawan();

  // Supporting data
  const [positions, setPositions] = useState<Position[]>([]);
  const [workingSchedules, setWorkingSchedules] = useState<WorkingScheduleBasic[]>([]);
  const [rbacRoles, setRbacRoles] = useState<RbacRole[]>([]);

  // Modal state
  const [detailId, setDetailId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch supporting data on mount
  useEffect(() => {
    jabatanService.getAll(true, false).then(setPositions).catch(console.error);

    rbacService
      .getRoles({ page: 1, limit: 100 })
      .then((result) => setRbacRoles(result.data))
      .catch((error) => {
        console.error(error);
        toast.error("Gagal memuat role RBAC.");
      });

    // Fetch working schedules
    apiClient
      .get<{ data: WorkingScheduleBasic[] }>("/working-schedules")
      .then((r) => setWorkingSchedules(r.data.data ?? []))
      .catch(console.error);

    // Initial employee load
    fetchAll({ page: 1, limit: 5, search: "" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (data: CreateEmployeeInput) => {
    setCreateLoading(true);
    try {
      await create(data);
      toast.success(`Karyawan "${data.employee.fullName}" berhasil ditambahkan.`);
      setCreateOpen(false);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async (id: string, data: UpdateEmployeeInput) => {
    setEditLoading(true);
    try {
      await update(id, data);
      toast.success("Data karyawan berhasil diperbarui.");
      setEditTarget(null);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.user.id === currentUserId) {
      setDeleteError("Anda tidak dapat menghapus data diri sendiri.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await remove(deleteTarget.id);
      toast.success(`Karyawan "${deleteTarget.fullName}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus karyawan.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: "Nama",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">{row.fullName}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">NIP: {row.user.nip}</p>
        </div>
      ),
    },
    {
      header: "Email",
      render: (row) => (
        <span className="text-xs">{row.email ?? <span className="italic text-gray-400">—</span>}</span>
      ),
    },
    {
      header: "Posisi",
      render: (row) => (
        <div>
          <p className="text-sm">{row.position?.name ?? <span className="italic text-gray-400">—</span>}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {row.position?.division?.name ?? ""}
          </p>
        </div>
      ),
    },
    {
      header: "Role",
      render: (row) => (
        <RoleBadge
          label={row.user.rbacRole?.name ?? "—"}
          inactive={row.user.rbacRole ? !row.user.rbacRole.isActive : false}
        />
      ),
    },
    {
      header: "Tipe",
      render: (row) => (
        <span className="text-xs">{row.employeeDetails?.[0]?.employmentType ?? "—"}</span>
      ),
    },
    {
      header: "Bergabung",
      render: (row) => (
        <span className="text-xs">{formatDate(row.joinDate)}</span>
      ),
    },
    {
      header: "Aksi",
      width: "w-48",
      render: (row) => {
        const isSelf = row.user.id === currentUserId;

        return (
          <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setDetailId(row.id)}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Detail
          </button>
          <button
            onClick={() => setEditTarget(row)}
            className="rounded-lg bg-brand-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={isSelf}
            title={isSelf ? "Anda tidak dapat menghapus data diri sendiri" : "Hapus karyawan"}
            onClick={() => {
              if (isSelf) return;
              setDeleteTarget(row);
              setDeleteError(null);
            }}
            className="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hapus
          </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageMeta
        title="Karyawan"
        description="Manajemen data karyawan perusahaan"
      />
      <PageBreadcrumb pageTitle="Karyawan" />

      <div className="space-y-6">
        <ComponentCard
          title="Data Karyawan"
          desc={`${meta.total} karyawan terdaftar`}
          action={
            <div className="flex justify-end">
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Karyawan
              </button>
            </div>
          }
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <DataTableOnline
            columns={columns}
            data={employees}
            meta={meta}
            loading={loading}
            onQueryChange={handleQueryChange}
            searchPlaceholder="Cari nama, NIP, atau email..."
          />
        </ComponentCard>
      </div>

      {/* Detail Modal */}
      <KaryawanDetailModal
        employeeId={detailId}
        onClose={() => setDetailId(null)}
      />

      {/* Create Modal */}
      <CreateKaryawanModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={createLoading}
        positions={positions}
        workingSchedules={workingSchedules}
        rbacRoles={rbacRoles}
      />

      {/* Edit Modal */}
      <EditKaryawanModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        loading={editLoading}
        employee={editTarget}
        positions={positions}
        workingSchedules={workingSchedules}
        rbacRoles={rbacRoles}
      />

      {/* Delete Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        itemName={deleteTarget?.fullName ?? ""}
        onConfirm={handleDelete}
        loading={deleteLoading}
        errorMessage={deleteError}
      />
    </>
  );
}
