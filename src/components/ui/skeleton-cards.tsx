/**
 * Loading Skeleton Components
 *
 * Pre-built skeleton components for common UI patterns in the application.
 * Uses Tailwind's animate-pulse for the shimmer effect.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * TaskCardSkeleton - For task cards in Kanban board
 * Mimics the layout of a typical task card with title, meta info, and assignee
 */
export function TaskCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Priority badge and category */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Meta info row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Due date */}
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Assignee avatar */}
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Comment/attachment counts */}
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ProposalCardSkeleton - For proposal list items
 * Mimics a proposal card with title, status, creator, and stats
 */
export function ProposalCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Header row: status badge and priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>

        {/* Title and description */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Meta row: creator avatar, date, counts */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Approval progress bar */}
        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

/**
 * StatsCardSkeleton - For dashboard stat/KPI cards
 * Mimics a statistics card with icon, value, and trend
 */
export function StatsCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Label */}
            <Skeleton className="h-4 w-24" />
            {/* Value and trend */}
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
            {/* Subtitle */}
            <Skeleton className="h-4 w-32" />
          </div>
          {/* Icon */}
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * TableRowSkeleton - For table rows
 * Configurable number of columns
 */
export function TableRowSkeleton({
  className,
  columns = 5,
}: SkeletonProps & { columns?: number }) {
  return (
    <tr className={cn("border-b", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            className={cn(
              "h-5",
              i === 0 ? "w-32" : i === columns - 1 ? "w-20" : "w-24"
            )}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * TableSkeleton - Complete table skeleton with header and rows
 */
export function TableSkeleton({
  className,
  columns = 5,
  rows = 5,
}: SkeletonProps & { columns?: number; rows?: number }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-lg border", className)}>
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * CalendarItemSkeleton - For content calendar items
 */
export function CalendarItemSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-3 space-y-2">
        {/* Platform badge */}
        <Skeleton className="h-5 w-20 rounded-full" />
        {/* Title */}
        <Skeleton className="h-5 w-full" />
        {/* Time and status */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * KanbanColumnSkeleton - For a complete Kanban column with cards
 */
export function KanbanColumnSkeleton({
  className,
  cardCount = 3,
}: SkeletonProps & { cardCount?: number }) {
  return (
    <div className={cn("flex flex-col gap-3 min-w-[280px]", className)}>
      {/* Column header */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      {/* Cards */}
      <div className="space-y-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * DashboardGridSkeleton - For dashboard with multiple stat cards
 */
export function DashboardGridSkeleton({
  className,
  cardCount = 4,
}: SkeletonProps & { cardCount?: number }) {
  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: cardCount }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * ChartSkeleton - For chart placeholders
 */
export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

/**
 * ListItemSkeleton - Generic list item skeleton
 */
export function ListItemSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 border-b last:border-b-0",
        className
      )}
    >
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-16 rounded" />
    </div>
  );
}

/**
 * AlertItemSkeleton - For notification/alert items
 */
export function AlertItemSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-start gap-3 p-3", className)}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/**
 * PageHeaderSkeleton - For page headers with title and actions
 */
export function PageHeaderSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
        className
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}
