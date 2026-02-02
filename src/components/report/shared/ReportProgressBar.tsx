import { cn } from "@/lib/utils";

interface ReportProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ReportProgressBar({
  value,
  max = 100,
  color = "#16a34a",
  height = 8,
  showLabel = false,
  label,
  className,
}: ReportProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span>{label}</span>}
          {showLabel && <span>{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

interface ReportProgressBarWithLabelProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  labelWidth?: number;
  className?: string;
}

export function ReportProgressBarWithLabel({
  label,
  value,
  max = 100,
  color = "#16a34a",
  labelWidth = 100,
  className,
}: ReportProgressBarWithLabelProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("flex items-center gap-2 mb-2", className)}>
      <span className="text-xs" style={{ width: labelWidth }}>
        {label}
      </span>
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs w-10 text-right">{value}%</span>
    </div>
  );
}
