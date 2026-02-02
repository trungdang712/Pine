import { cn } from "@/lib/utils";

interface ReportTableColumn<T> {
  key: keyof T | string;
  header: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface ReportTableProps<T> {
  columns: ReportTableColumn<T>[];
  data: T[];
  className?: string;
  highlightRow?: (row: T) => boolean;
  footerRow?: Partial<T>;
}

export function ReportTable<T extends Record<string, unknown>>({
  columns,
  data,
  className,
  highlightRow,
  footerRow,
}: ReportTableProps<T>) {
  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getCellValue = (row: T, column: ReportTableColumn<T>) => {
    const keyStr = String(column.key);
    if (column.render) {
      const value = keyStr.includes(".")
        ? keyStr.split(".").reduce((obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key], row)
        : row[column.key as keyof T];
      return column.render(value, row);
    }

    const value = keyStr.includes(".")
      ? keyStr.split(".").reduce((obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key], row)
      : row[column.key as keyof T];

    return value as React.ReactNode;
  };

  return (
    <table className={cn("w-full border-collapse text-sm", className)}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className={cn(
                "bg-gray-100 p-2 font-semibold border-b-2 border-gray-200",
                getAlignClass(column.align)
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={index}
            className={cn(
              "border-b border-gray-200 hover:bg-gray-50",
              highlightRow?.(row) && "bg-green-50"
            )}
          >
            {columns.map((column) => (
              <td
                key={String(column.key)}
                className={cn("p-2", getAlignClass(column.align))}
              >
                {getCellValue(row, column)}
              </td>
            ))}
          </tr>
        ))}
        {footerRow && (
          <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
            {columns.map((column) => (
              <td
                key={String(column.key)}
                className={cn("p-2", getAlignClass(column.align))}
              >
                {footerRow[column.key as keyof T] as React.ReactNode}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
}
