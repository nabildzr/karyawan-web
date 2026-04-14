// * File ini berisi type hierarki divisi dan jabatan.
// * Dipakai oleh modul divisi dan jabatan.

export interface EmployeeBasic {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
}

export interface DivisionBasic {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
  gajiPokok: number;
  isManagerial: boolean;
  divisionId: string | null;
  createdAt: string;
  updatedAt: string;
  division?: DivisionBasic;
  employees?: EmployeeBasic[];
}

export interface ManagerBasic {
  id: string;
  nip: string;
  role: string;
  employees?: {
    fullName: string;
    email: string | null;
  };
}

export interface Division {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  manager?: ManagerBasic;
  positions?: Position[];
}

// & Input payload types.
// % Type payload input.

export interface CreatePositionInput {
  name: string;
  gajiPokok: number;
  isManagerial: boolean;
  divisionId: string;
}

export interface UpdatePositionInput {
  name?: string;
  gajiPokok?: number;
  isManagerial?: boolean;
  divisionId?: string;
}

export interface CreateDivisionInput {
  name: string;
  description?: string;
  managerId?: string;
}

export interface UpdateDivisionInput {
  name?: string;
  description?: string;
  managerId?: string | null;
}
