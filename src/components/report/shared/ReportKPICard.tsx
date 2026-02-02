import { cn } from "@/lib/utils";

interface ReportKPICardProps {
  label: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
  className?: string;
}

export function ReportKPICard({
  label,
  value,
  change,
  isPositive = true,
  className,
}: ReportKPICardProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center",
        className
      )}
    >
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold text-green-600">{value}</div>
      {change !== undefined && (
        <div
          className={cn(
            "text-xs mt-1",
            isPositive ? "text-green-600" : "text-red-600"
          )}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(change)}% vs tháng trước
        </div>
      )}
    </div>
  );
}
