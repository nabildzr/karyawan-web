// * File ini berisi type untuk RBAC.
// * Dipakai untuk role, resource, dan matrix izin.

export type PermissionAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "APPROVE";

export interface RbacRole {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
  isActive: boolean;
  canAccessAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    permissions: number;
  };
}

export interface PermissionResource {
  id: string;
  key: string;
  name: string;
  routePath: string | null;
  groupName: string | null;
  supportsApprove: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionActionState {
  action: PermissionAction;
  isAllowed: boolean;
}

export interface RolePermissionResourceMatrixItem {
  resourceId: string;
  resourceKey: string;
  resourceName: string;
  routePath: string | null;
  groupName: string | null;
  supportsApprove: boolean;
  actions: PermissionActionState[];
}

// & Role detail with permission matrix.
// % Detail role dengan matrix izin.
export interface RoleDetail {
  role: {
    id: string;
    key: string;
    name: string;
    isSystem: boolean;
    isActive: boolean;
    canAccessAdmin: boolean;
    createdAt: string;
    updatedAt: string;
    userCount: number;
  };
  matrix: RolePermissionResourceMatrixItem[];
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
