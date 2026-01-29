"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatforms, type Platform } from "@/hooks/use-platforms";
import { PlatformBadge } from "./platform-badge";

interface PlatformSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  category?: string;
  includeAll?: boolean;
  allLabel?: string;
  className?: string;
}

export function PlatformSelect({
  value,
  onValueChange,
  placeholder = "Select platform",
  disabled = false,
  category,
  includeAll = false,
  allLabel = "All",
  className,
}: PlatformSelectProps) {
  const { platforms, isLoading, getPlatformsByCategory } = usePlatforms();

  const filteredPlatforms = category
    ? getPlatformsByCategory(category)
    : platforms;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && (
          <SelectItem value="all">{allLabel}</SelectItem>
        )}
        {filteredPlatforms.map((platform: Platform) => (
          <SelectItem key={platform.id} value={platform.code}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: platform.color }}
              />
              <span>{platform.displayName}</span>
            </div>
          </SelectItem>
        ))}
        {filteredPlatforms.length === 0 && !isLoading && (
          <SelectItem value="none" disabled>
            No platforms available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

interface PlatformFilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  allLabel?: string;
  category?: string;
  className?: string;
}

export function PlatformFilterSelect({
  value,
  onValueChange,
  allLabel = "All Platforms",
  category,
  className,
}: PlatformFilterSelectProps) {
  return (
    <PlatformSelect
      value={value}
      onValueChange={onValueChange}
      includeAll
      allLabel={allLabel}
      category={category}
      className={className}
    />
  );
}
