// * File tipe data Dompet Integritas: src/types/integrity.types.ts
// & Contracts for point rules, ledger, marketplace, tokens, and leaderboard.
// % Kontrak tipe untuk aturan poin, ledger, marketplace, token, dan leaderboard.

// & Paginated response metadata from backend.
// % Metadata paginasi dari response backend.
export interface IntegrityPaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// & Point rule created by admin in the rule engine.
// % Aturan poin yang dibuat admin di rule engine.
export interface PointRule {
  id: string;
  ruleName: string;
  targetRole: string;
  conditionField: string;
  conditionOp: string;
  conditionValue: string;
  pointModifier: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePointRuleInput {
  ruleName: string;
  targetRole: string;
  conditionField: string;
  conditionOp: string;
  conditionValue: string;
  pointModifier: number;
  description?: string;
}

export interface UpdatePointRuleInput {
  ruleName?: string;
  targetRole?: string;
  conditionField?: string;
  conditionOp?: string;
  conditionValue?: string;
  pointModifier?: number;
  description?: string;
  isActive?: boolean;
}

// & Marketplace item that users can buy with points.
// % Item marketplace yang bisa dibeli user dengan poin.
export interface FlexibilityItem {
  id: string;
  itemName: string;
  pointCost: number;
  itemType: string;
  durationDays: number;
  maxPerMonth: number | null;
  monthlyPurchaseCount?: number;
  monthlyRemainingQuota?: number | null;
  canBuyThisMonth?: boolean;
  conditionField: "attendance.status" | "attendance.lateMinutes" | null;
  conditionValue: string | null;
  expiredAt: string | null;
  description: string | null;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlexibilityItemInput {
  itemName: string;
  pointCost: number;
  itemType: string;
  durationDays: number;
  maxPerMonth?: number | null;
  conditionField?: "attendance.status" | "attendance.lateMinutes" | null;
  conditionValue?: string | null;
  expiredAt?: string | null;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

export interface UpdateFlexibilityItemInput {
  itemName?: string;
  pointCost?: number;
  itemType?: string;
  durationDays?: number;
  maxPerMonth?: number | null;
  conditionField?: "attendance.status" | "attendance.lateMinutes" | null;
  conditionValue?: string | null;
  expiredAt?: string | null;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

// & Ledger entry representing a single point mutation.
// % Entry ledger yang merepresentasikan satu mutasi poin.
export interface PointLedgerEntry {
  id: string;
  userId: string;
  transactionType: "EARN" | "SPEND" | "PENALTY" | "ADJUSTMENT";
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  currentBalance: number;
  description: string | null;
  referenceEntity?: string | null;
  referenceId?: string | null;
  createdAt: string;
  updatedAt?: string;
  // & Populated relation fields when available.
  // % Field relasi yang terisi jika tersedia.
  user?: {
    id: string;
    employeeId?: string;
    name: string;
    email?: string;
    role?: string;
    balance?: number;
  };
}

// & Token owned by a user from marketplace purchase.
// % Token yang dimiliki user dari pembelian marketplace.
export interface UserToken {
  id: string;
  userId: string;
  itemId: string;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  usedAt?: string | null;
  expiresAt: string;
  remainingDays: number;
  usedAtAttendanceId: string | null;
  createdAt: string;
  updatedAt: string;
  item?: FlexibilityItem;
}

// & User wallet balance summary.
// % Ringkasan saldo dompet user.
export interface WalletBalance {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  level: IntegrityLevelKey;
  nextLevel?: IntegrityLevelKey;
  rank: number;
  currentPoints?: number;
  integrityLevel?: IntegrityLevelKey;
  nextLevelThreshold?: number;
  percentageToNextLevel?: number;
}

// & Leaderboard entry with user info and points.
// % Entry leaderboard dengan info user dan poin.
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  userName?: string;
  employeeId?: string;
  role?: string;
  position?: string | null;
  division?: string | null;
  balance: number;
  totalEarned: number;
  level: IntegrityLevelKey;
}

// & Integrity level keys and their point thresholds.
// % Key level integritas dan ambang batas poinnya.
export type IntegrityLevelKey =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM";

export interface IntegrityLevelConfig {
  key: IntegrityLevelKey;
  label: string;
  minPoints: number;
  color: string;
  bgColor: string;
  textColor: string;
}

// & Level threshold map used for rendering level badges.
// % Map threshold level untuk render badge level.
export const INTEGRITY_LEVELS: IntegrityLevelConfig[] = [
  {
    key: "BRONZE",
    label: "Bronze",
    minPoints: 0,
    color: "#CD7F32",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
  },
  {
    key: "SILVER",
    label: "Silver",
    minPoints: 500,
    color: "#C0C0C0",
    bgColor: "bg-gray-200",
    textColor: "text-gray-700",
  },
  {
    key: "GOLD",
    label: "Gold",
    minPoints: 1000,
    color: "#FFD700",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  {
    key: "PLATINUM",
    label: "Platinum",
    minPoints: 2000,
    color: "#E5E4E2",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  },
];

// & Buy token response from marketplace.
// % Response pembelian token dari marketplace.
export interface BuyTokenResult {
  success: boolean;
  token?: UserToken;
  error?: string;
}
