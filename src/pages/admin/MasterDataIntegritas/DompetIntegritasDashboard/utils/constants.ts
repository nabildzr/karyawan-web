import { ShoppingBag, Trophy, Zap } from "lucide-react";
import type { DashboardTabKey } from "../types";

export const RULES_PAGE_SIZE = 6;
export const ITEMS_PAGE_SIZE = 4;
export const LEADERBOARD_PAGE_SIZE = 5;

export const DASHBOARD_TABS: Array<{
  key: DashboardTabKey;
  label: string;
  icon: typeof Zap;
}> = [
  {
    key: "rules",
    label: "Aturan Poin",
    icon: Zap,
  },
  {
    key: "marketplace",
    label: "Item Marketplace",
    icon: ShoppingBag,
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    icon: Trophy,
  },
];