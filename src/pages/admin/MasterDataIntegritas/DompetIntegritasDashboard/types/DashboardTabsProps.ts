import type { DashboardTabKey } from "./DashboardTabKey";

export type DashboardTabsProps = {
  activeTab: DashboardTabKey;
  onChangeTab: (tab: DashboardTabKey) => void;
};