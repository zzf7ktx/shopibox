import { Row } from "@tanstack/react-table";

export const getRowRange = <T>(
  rows: Row<T>[],
  currentId: string,
  selectedId: string
): Row<T>[] => {
  const rangeStart = +selectedId > +currentId ? currentId : selectedId;
  const rangeEnd = rangeStart === currentId ? selectedId : currentId;
  return rows.slice(+rangeStart, +rangeEnd + 1);
};
