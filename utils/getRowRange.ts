import { Row } from "@tanstack/react-table";

export const getRowRange = <T>(
  rows: Row<T>[],
  currentId: number,
  selectedId: number
): Row<T>[] => {
  const currentIndex = rows.findIndex((r) => r.index === currentId);
  const selectedIndex = rows.findIndex((r) => r.index === selectedId);
  const rangeStart = selectedId > currentId ? currentIndex : selectedIndex;
  const rangeEnd = rangeStart === currentIndex ? selectedIndex : currentIndex;
  return rows.slice(rangeStart, rangeEnd + 1);
};
