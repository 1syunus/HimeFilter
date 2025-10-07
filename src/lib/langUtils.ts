import { FilterOption } from "../types"

export const toFilterOptions = (arr?: string[]): FilterOption[] =>
  arr?.map((val) => ({
    value: val,
    label: val.charAt(0).toUpperCase() + val.slice(1),
  })) ?? []