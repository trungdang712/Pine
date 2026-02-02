import { cn } from "@/lib/utils";

type HighlightVariant = "default" | "success" | "warning" | "info";

interface ReportHighlightBoxProps {
  title: string;
  items: string[];
  variant?: HighlightVariant;
  icon?: string;
  className?: string;
}

const variantStyles: Record<HighlightVariant, { bg: string; border: string }> = {
  default: {
    bg: "bg-yellow-50",
    border: "border-l-yellow-500",
  },
  success: {
    bg: "bg-green-50",
    border: "border-l-green-500",
  },
  warning: {
    bg: "bg-red-50",
    border: "border-l-red-500",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-l-blue-500",
  },
};

export function ReportHighlightBox({
  title,
  items,
  variant = "default",
  icon,
  className,
}: ReportHighlightBoxProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "border-l-4 rounded-r-md p-3 mb-3",
        styles.bg,
        styles.border,
        className
      )}
    >
      <h4 className="font-semibold text-sm mb-2">
        {icon && <span className="mr-1">{icon}</span>}
        {title}
      </h4>
      <ul className="text-xs space-y-1 ml-4 list-disc">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

interface ReportSectionTitleProps {
  number: number;
  title: string;
  className?: string;
}

export function ReportSectionTitle({
  number,
  title,
  className,
}: ReportSectionTitleProps) {
  return (
    <div
      className={cn(
        "text-sm font-bold text-green-600 mb-3 pb-1 border-b-2 border-gray-200",
        className
      )}
    >
      {number}. {title}
    </div>
  );
}

interface ReportPageHeaderProps {
  title: string;
  subtitle: string;
  period: string;
}

export function ReportPageHeader({ title, subtitle, period }: ReportPageHeaderProps) {
  return (
    <div className="text-center mb-5 pb-4 border-b-4 border-green-500">
      <h1 className="text-2xl font-bold text-green-600 mb-1">{title}</h1>
      <div className="text-sm text-muted-foreground">{subtitle}</div>
      <div className="text-xs text-muted-foreground mt-1">{period}</div>
    </div>
  );
}

interface ReportPageFooterProps {
  pageNumber: number;
  totalPages: number;
}

export function ReportPageFooter({ pageNumber, totalPages }: ReportPageFooterProps) {
  return (
    <div className="text-center text-xs text-muted-foreground mt-5">
      Trang {pageNumber}/{totalPages}
    </div>
  );
}
