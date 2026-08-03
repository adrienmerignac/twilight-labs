import type { StatCategory } from "./enums";

export type StatId = string;

export interface Stat {
  id: StatId;
  label: string;
  category: StatCategory;
  value: number;
  unit?: "flat" | "percent";
}
