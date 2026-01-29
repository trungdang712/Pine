"use client";

import { Badge } from "@/components/ui/badge";
import { usePlatforms } from "@/hooks/use-platforms";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  code: string;
  showIcon?: boolean;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function PlatformBadge({
  code,
  showIcon = true,
  variant = "secondary",
  size = "default",
  className,
}: PlatformBadgeProps) {
  const { getPlatformByCode, getPlatformDisplayName, getPlatformColor, getPlatformIcon } = usePlatforms();

  const platform = getPlatformByCode(code);
  const displayName = getPlatformDisplayName(code);
  const color = getPlatformColor(code);
  const icon = getPlatformIcon(code);

  const sizeClasses = {
    default: "text-xs px-2 py-0.5",
    sm: "text-[10px] px-1.5 py-0",
    lg: "text-sm px-3 py-1",
  };

  return (
    <Badge
      variant={variant}
      className={cn(sizeClasses[size], className)}
      style={{
        borderColor: color,
        backgroundColor: variant === "outline" ? "transparent" : `${color}20`,
      }}
    >
      {showIcon && icon && <span className="mr-1">{icon}</span>}
      {displayName}
    </Badge>
  );
}

interface PlatformDotProps {
  code: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function PlatformDot({ code, size = "default", className }: PlatformDotProps) {
  const { getPlatformColor } = usePlatforms();
  const color = getPlatformColor(code);

  const sizeClasses = {
    sm: "w-2 h-2",
    default: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div
      className={cn("rounded-full", sizeClasses[size], className)}
      style={{ backgroundColor: color }}
    />
  );
}

interface PlatformLegendProps {
  platforms?: string[];
  className?: string;
}

export function PlatformLegend({ platforms: platformCodes, className }: PlatformLegendProps) {
  const { platforms, getPlatformDisplayName, getPlatformColor } = usePlatforms();

  const displayPlatforms = platformCodes
    ? platforms.filter((p) => platformCodes.includes(p.code))
    : platforms;

  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-sm", className)}>
      {displayPlatforms.map((platform) => (
        <div key={platform.id} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: platform.color }}
          />
          <span>{platform.displayName}</span>
        </div>
      ))}
    </div>
  );
}
