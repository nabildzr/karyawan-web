import type { FlexibilityItem } from "../../../../../types/integrity.types";

export type MarketplaceItemCardProps = {
  item: FlexibilityItem;
  index: number;
  onEdit: (item: FlexibilityItem) => void;
  onDelete: (item: FlexibilityItem) => void;
};