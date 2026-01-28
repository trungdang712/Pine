"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";

const platformColors: Record<string, string> = {
  facebook: "bg-blue-500",
  instagram: "bg-pink-500",
  zalo: "bg-blue-400",
  tiktok: "bg-black",
  website: "bg-gray-500",
};

const statusColors: Record<string, string> = {
  planned: "border-gray-300 bg-gray-50",
  in_production: "border-yellow-300 bg-yellow-50",
  ready_for_review: "border-orange-300 bg-orange-50",
  approved: "border-green-300 bg-green-50",
  scheduled: "border-blue-300 bg-blue-50",
  published: "border-teal-500 bg-teal-50",
  needs_revision: "border-red-300 bg-red-50",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [platformFilter, setPlatformFilter] = useState<string | undefined>();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: calendarItems, isLoading } = trpc.calendar.getByMonth.useQuery({
    year,
    month,
  });

  const filteredItems = calendarItems?.filter((item) => {
    if (platformFilter && item.platform !== platformFilter) return false;
    return true;
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getItemsForDay = (date: Date) => {
    return filteredItems?.filter((item) => {
      const itemDate = item.scheduledAt
        ? new Date(item.scheduledAt)
        : item.publishedAt
        ? new Date(item.publishedAt)
        : null;
      return itemDate && isSameDay(itemDate, date);
    });
  };

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-500">
            Plan and schedule content across platforms
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={platformFilter ?? "all"}
            onValueChange={(v) =>
              setPlatformFilter(v === "all" ? undefined : v)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="zalo">Zalo</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="website">Website</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-md border border-gray-200">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setView("week")}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-gray-500">Platforms:</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${platformColors.facebook}`} />
            Facebook
          </span>
          <span className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${platformColors.instagram}`} />
            Instagram
          </span>
          <span className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${platformColors.zalo}`} />
            Zalo
          </span>
          <span className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${platformColors.tiktok}`} />
            TikTok
          </span>
          <span className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${platformColors.website}`} />
            Website
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="px-4 py-3 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const dayItems = getItemsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-32 border-b border-r border-gray-100 p-2",
                      !isCurrentMonth && "bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-1 text-sm",
                        isToday
                          ? "flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 font-semibold text-white"
                          : isCurrentMonth
                          ? "font-medium text-gray-900"
                          : "text-gray-400"
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    {/* Items for this day */}
                    <div className="space-y-1">
                      {dayItems?.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center gap-1 rounded px-1 py-0.5 text-xs border",
                            statusColors[item.status]
                          )}
                        >
                          <div
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${
                              platformColors[item.platform]
                            }`}
                          />
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                      {dayItems && dayItems.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{dayItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
