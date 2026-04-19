import type { ConditionValueType } from "./ConditionValueType";

export type ConditionFieldOption = {
  value: string;
  label: string;
  valueType: ConditionValueType;
  allowedOps: string[];
  placeholder: string;
  betweenPlaceholder: string;
};