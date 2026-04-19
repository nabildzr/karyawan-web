// * Frontend module: karyawan-web/src/pages/admin/MasterDataKeamanan/RbacRoleDetail.tsx
// & This file defines frontend UI or logic for RbacRoleDetail.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk RbacRoleDetail.tsx.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useRbac } from "../../../hooks/useRbac";
import type {
    PermissionAction,
    RoleDetail,
    RolePermissionResourceMatrixItem,
} from "../../../types/rbac.types";

const ACTION_ORDER: PermissionAction[] = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "APPROVE",
];

type MatrixState = Record<string, Partial<Record<PermissionAction, boolean>>>;

function actionLabel(action: PermissionAction) {
  if (action === "CREATE") return "C";
  if (action === "READ") return "R";
  if (action === "UPDATE") return "U";
  if (action === "DELETE") return "D";
  return "A";
}

function getAvailableActions(resource: RolePermissionResourceMatrixItem) {
  return ACTION_ORDER.filter(
    (action) => action !== "APPROVE" || resource.supportsApprove,
  );
}

function buildMatrixState(detail: RoleDetail): MatrixState {
  const next: MatrixState = {};
  for (const row of detail.matrix) {
    next[row.resourceKey] = {};
    for (const item of row.actions) {
      next[row.resourceKey][item.action] = item.isAllowed;
    }
  }
  return next;
}

export default function RbacRoleDetail() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { detailLoading, fetchRoleDetail, updateRole, updateRolePermissions } =
    useRbac();

  const [detail, setDetail] = useState<RoleDetail | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [roleActive, setRoleActive] = useState(true);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [matrix, setMatrix] = useState<MatrixState>({});

  const hydrateFromDetail = (nextDetail: RoleDetail) => {
    setDetail(nextDetail);
    setRoleName(nextDetail.role.name);
    setRoleActive(nextDetail.role.isActive);
    setCanAccessAdmin(nextDetail.role.canAccessAdmin);
    setMatrix(buildMatrixState(nextDetail));
  };

  useEffect(() => {
    if (!roleId) {
      setLoadingError("Role ID tidak valid.");
      return;
    }

    let active = true;
    setLoadingError(null);

    fetchRoleDetail(roleId)
      .then((result) => {
        if (!active) return;
        hydrateFromDetail(result);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setLoadingError(
          err instanceof Error ? err.message : "Gagal memuat detail role.",
        );
      });

    return () => {
      active = false;
    };
  }, [fetchRoleDetail, roleId]);

  const toggleAction = (
    resourceKey: string,
    action: PermissionAction,
    value: boolean,
  ) => {
    setMatrix((prev) => ({
      ...prev,
      [resourceKey]: {
        ...(prev[resourceKey] ?? {}),
        [action]: value,
      },
    }));
  };

  const toggleParent = (resource: RolePermissionResourceMatrixItem) => {
    const actions = getAvailableActions(resource);
    const isAllOn = actions.every(
      (action) => matrix[resource.resourceKey]?.[action] ?? false,
    );

    setMatrix((prev) => {
      const nextResource = { ...(prev[resource.resourceKey] ?? {}) };
      for (const action of actions) {
        nextResource[action] = !isAllOn;
      }

      return {
        ...prev,
        [resource.resourceKey]: nextResource,
      };
    });
  };

  const handleSaveRoleInfo = async () => {
    if (!roleId) return;
    const trimmedName = roleName.trim();
    if (!trimmedName) {
      toast.error("Nama role tidak boleh kosong.");
      return;
    }

    setSaving(true);
    try {
      await updateRole(roleId, {
        name: trimmedName,
        isActive: roleActive,
        canAccessAdmin,
      });

      const refreshed = await fetchRoleDetail(roleId);
      hydrateFromDetail(refreshed);
      toast.success("Info role berhasil diperbarui.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!roleId || !detail) return;

    const payload: Array<{
      resourceKey: string;
      action: PermissionAction;
      isAllowed: boolean;
    }> = [];

    for (const resource of detail.matrix) {
      const actions = getAvailableActions(resource);

      for (const action of actions) {
        const originalValue =
          resource.actions.find((item) => item.action === action)?.isAllowed ??
          false;

        const currentValue = matrix[resource.resourceKey]?.[action] ?? false;

        if (currentValue !== originalValue) {
          payload.push({
            resourceKey: resource.resourceKey,
            action,
            isAllowed: currentValue,
          });
        }
      }
    }

    if (payload.length === 0) {
      toast.info("Tidak ada perubahan permission untuk disimpan.");
      return;
    }

    setSaving(true);
    try {
      const refreshed = await updateRolePermissions(roleId, payload);
      hydrateFromDetail(refreshed);
      toast.success("Permission role berhasil diperbarui.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Kelola Permission Role"
        description="Atur parent resource dan child action (CRUD + A)"
      />
      <PageBreadcrumb pageTitle="Kelola Role" />

      <div className="space-y-6">
        <div className="flex justify-start">
          <button
            onClick={() => navigate("/admin/rbac")}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Kembali ke Daftar Role
          </button>
        </div>

        <ComponentCard
          title="Kelola Permission Role"
          desc="Atur parent resource dan child action (CRUD + A)."
        >
          {detailLoading && !detail ? (
            <div className="rounded-xl border border-gray-100 px-4 py-8 text-center text-sm text-gray-500 dark:border-white/[0.06] dark:text-gray-400">
              Memuat detail role...
            </div>
          ) : loadingError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {loadingError}
            </div>
          ) : detail ? (
            <>
              <div className="mb-5 grid gap-4 rounded-xl border border-gray-100 p-4 dark:border-white/[0.06] sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nama Role
                  </label>
                  <input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-400">Key: {detail.role.key}</p>
                </div>

                <div className="flex flex-col justify-end gap-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={roleActive}
                      onChange={(e) => setRoleActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    Role aktif
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={canAccessAdmin}
                      onChange={(e) => setCanAccessAdmin(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    Bisa Akses Admin
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveRoleInfo}
                    disabled={saving}
                    className="mt-2 w-fit rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    Simpan Info Role
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/[0.06]">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Resource (Parent)
                      </th>
                      <th className="px-3 py-3 text-center font-medium">Parent</th>
                      {ACTION_ORDER.map((action) => (
                        <th
                          key={action}
                          className="px-3 py-3 text-center font-medium"
                        >
                          {actionLabel(action)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.matrix.map((resource) => {
                      const available = getAvailableActions(resource);
                      const allEnabled = available.every(
                        (action) => matrix[resource.resourceKey]?.[action] ?? false,
                      );

                      return (
                        <tr
                          key={resource.resourceKey}
                          className="border-t border-gray-100 dark:border-white/[0.06]"
                        >
                          <td className="px-4 py-3 align-top">
                            <p className="font-medium text-gray-700 dark:text-gray-200">
                              {resource.resourceName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {resource.resourceKey}
                            </p>
                          </td>

                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={allEnabled}
                              onChange={() => toggleParent(resource)}
                              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                            />
                          </td>

                          {ACTION_ORDER.map((action) => {
                            const disabled =
                              action === "APPROVE" && !resource.supportsApprove;

                            if (disabled) {
                              return (
                                <td
                                  key={action}
                                  className="px-3 py-3 text-center text-gray-300 dark:text-gray-600"
                                >
                                  -
                                </td>
                              );
                            }

                            return (
                              <td key={action} className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    matrix[resource.resourceKey]?.[action] ?? false
                                  }
                                  onChange={(e) =>
                                    toggleAction(
                                      resource.resourceKey,
                                      action,
                                      e.target.checked,
                                    )
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/rbac")}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={saving}
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Permission"}
                </button>
              </div>
            </>
          ) : null}
        </ComponentCard>
      </div>
    </>
  );
}
