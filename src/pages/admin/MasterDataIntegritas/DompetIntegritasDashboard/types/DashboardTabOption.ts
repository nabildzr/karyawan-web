import type { LucideIcon } from "lucide-react";
import type { DashboardTabKey } from "./DashboardTabKey";

export type DashboardTabOption = {
  key: DashboardTabKey;
  label: string;
  icon: LucideIcon;
};