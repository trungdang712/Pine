"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Copy,
  BarChart3,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LoadingSpinner, PageLoading } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { toast } from "sonner";

type Platform = "facebook" | "instagram" | "zalo" | "tiktok" | "website";
type ContentStatus = "planned" | "in_production" | "ready_for_review" | "approved" | "scheduled" | "published" | "needs_revision";

interface CalendarItem {
  id: string;
  platform: Platform;
  title: string;
  description: string | null;
  status: ContentStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  creator: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  _count?: {
    comments: number;
    attachments: number;
    socialPosts?: number;
  };
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-500",
  zalo: "bg-blue-600",
  tiktok: "bg-black",
  instagram: "bg-pink-500",
  website: "bg-yellow-500",
};

const platformDisplayNames: Record<string, string> = {
  facebook: "Facebook",
  zalo: "Zalo",
  tiktok: "TikTok",
  instagram: "Instagram",
  website: "Website",
};

const statusColors: Record<string, string> = {
  planned: "border-gray-300",
  in_production: "border-yellow-500",
  ready_for_review: "border-orange-500",
  approved: "border-green-500",
  scheduled: "border-blue-500",
  published: "bg-blue-50 border-blue-300",
  needs_revision: "border-red-500",
};

const statusDisplayNames: Record<string, string> = {
  planned: "Planned",
  in_production: "In Production",
  ready_for_review: "Review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  needs_revision: "Needs Revision",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedContent, setSelectedContent] = useState<CalendarItem | null>(null);
  const [isContentDetailOpen, setIsContentDetailOpen] = useState(false);
  const [isNewContentOpen, setIsNewContentOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Form state for new content
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    platform: "" as Platform | "",
    contentType: "",
    date: "",
    time: "10:00",
    assignee: "",
    status: "planned" as ContentStatus,
    tags: "",
  });

  // Form state for editing content
  const [editContent, setEditContent] = useState({
    platform: "" as Platform | "",
    status: "" as ContentStatus | "",
    date: "",
    time: "",
    description: "",
    contentType: "",
    assignee: "",
  });

  // Calculate date range for current month view
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [currentDate]);

  // Fetch calendar items
  const {
    data: calendarItems,
    isLoading,
    error,
    refetch,
  } = trpc.calendar.getItems.useQuery({
    startDate,
    endDate,
    platform: filterPlatform !== "all" ? (filterPlatform as Platform) : undefined,
    status: filterStatus !== "all" ? (filterStatus as ContentStatus) : undefined,
  });

  // Fetch stats
  const { data: stats } = trpc.calendar.getStats.useQuery({
    startDate,
    endDate,
  });

  // Mutations
  const utils = trpc.useUtils();

  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      toast.success("Content created successfully");
      setIsNewContentOpen(false);
      setNewContent({
        title: "",
        description: "",
        platform: "",
        contentType: "",
        date: "",
        time: "10:00",
        assignee: "",
        status: "planned",
        tags: "",
      });
      utils.calendar.getItems.invalidate();
      utils.calendar.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create content: ${error.message}`);
    },
  });

  const updateMutation = trpc.calendar.update.useMutation({
    onSuccess: () => {
      toast.success("Content updated successfully");
      setIsContentDetailOpen(false);
      utils.calendar.getItems.invalidate();
      utils.calendar.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update content: ${error.message}`);
    },
  });

  const deleteMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      toast.success("Content deleted successfully");
      setIsContentDetailOpen(false);
      utils.calendar.getItems.invalidate();
      utils.calendar.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete content: ${error.message}`);
    },
  });

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysArray = () => {
    const days: (number | null)[] = [];
    const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getContentForDay = (day: number): CalendarItem[] => {
    if (!calendarItems) return [];

    return calendarItems.filter((item) => {
      const itemDate = item.scheduledAt
        ? new Date(item.scheduledAt)
        : item.publishedAt
          ? new Date(item.publishedAt)
          : null;

      if (!itemDate) return false;

      return (
        itemDate.getDate() === day &&
        itemDate.getMonth() === currentDate.getMonth() &&
        itemDate.getFullYear() === currentDate.getFullYear()
      );
    }) as CalendarItem[];
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleContentClick = (content: CalendarItem) => {
    setSelectedContent(content);
    const scheduledDate = content.scheduledAt ? new Date(content.scheduledAt) : null;
    setEditContent({
      platform: content.platform,
      status: content.status,
      date: scheduledDate ? scheduledDate.toISOString().split("T")[0] : "",
      time: scheduledDate ? scheduledDate.toTimeString().slice(0, 5) : "",
      description: content.description || "",
      contentType: "",
      assignee: content.creator?.name || "",
    });
    setIsContentDetailOpen(true);
  };

  const handleCreateContent = () => {
    if (!newContent.title || !newContent.platform || !newContent.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const scheduledAt = new Date(`${newContent.date}T${newContent.time || "10:00"}:00`);

    createMutation.mutate({
      title: newContent.title,
      description: newContent.description || undefined,
      platform: newContent.platform as Platform,
      status: newContent.status,
      scheduledAt: scheduledAt.toISOString(),
    });
  };

  const handleUpdateContent = () => {
    if (!selectedContent) return;

    const scheduledAt = editContent.date && editContent.time
      ? new Date(`${editContent.date}T${editContent.time}:00`).toISOString()
      : null;

    updateMutation.mutate({
      id: selectedContent.id,
      platform: editContent.platform as Platform || undefined,
      status: editContent.status as ContentStatus || undefined,
      description: editContent.description || undefined,
      scheduledAt: scheduledAt,
    });
  };

  const handleDeleteContent = () => {
    if (!selectedContent) return;

    if (confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate({ id: selectedContent.id });
    }
  };

  const handleDuplicateContent = () => {
    if (!selectedContent) return;

    const scheduledDate = selectedContent.scheduledAt
      ? new Date(selectedContent.scheduledAt)
      : new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1);

    createMutation.mutate({
      title: `${selectedContent.title} (Copy)`,
      description: selectedContent.description || undefined,
      platform: selectedContent.platform,
      status: "planned",
      scheduledAt: scheduledDate.toISOString(),
    });
  };

  const getStatistics = () => {
    if (!stats) {
      return {
        total: 0,
        planned: 0,
        inProduction: 0,
        ready: 0,
        published: 0,
      };
    }

    return {
      total: stats.total,
      planned: stats.byStatus.planned || 0,
      inProduction: stats.byStatus.in_production || 0,
      ready: (stats.byStatus.ready_for_review || 0) + (stats.byStatus.approved || 0),
      published: stats.byStatus.published || 0,
    };
  };

  const statsData = getStatistics();

  const monthName = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();

  const formatTime = (date: Date | null): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return <PageLoading text="Loading calendar..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          title="Failed to load calendar"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Content Calendar</h1>
          <p className="text-muted-foreground">Lich xuat ban noi dung tren cac nen tang</p>
        </div>
        <Button className="gap-2" onClick={() => setIsNewContentOpen(true)}>
          <Plus className="w-4 h-4" />
          Them noi dung
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Content</p>
                <p className="text-2xl font-semibold">{statsData.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planned</p>
                <p className="text-2xl font-semibold">{statsData.planned}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Production</p>
                <p className="text-2xl font-semibold">{statsData.inProduction}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-semibold">{statsData.ready}</p>
              </div>
              <Clock className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-semibold">{statsData.published}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm mb-2 block">Platform</Label>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="zalo">Zalo</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-sm mb-2 block">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca status</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_production">In Production</SelectItem>
                  <SelectItem value="ready_for_review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-xl font-semibold capitalize">{monthName}</span>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
            >
              Thang
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              Tuan
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
            >
              Ngay
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Platform Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Facebook</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Zalo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black" />
              <span>TikTok</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span>Instagram</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Website</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Week Day Headers */}
            <div className="grid grid-cols-7 bg-muted">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {getDaysArray().map((day, index) => {
                const dayContent = day ? getContentForDay(day) : [];
                const isToday =
                  day === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                      day ? "bg-card hover:bg-accent/50" : "bg-muted/30"
                    } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${isToday ? "text-primary" : ""}`}>
                          {day}
                          {isToday && <span className="ml-1 text-xs">(Hom nay)</span>}
                        </div>
                        <div className="space-y-1">
                          {dayContent.map((item) => (
                            <div
                              key={item.id}
                              className={`text-xs p-1.5 rounded border-l-2 ${statusColors[item.status]} bg-card hover:shadow-md cursor-pointer transition-all`}
                              onClick={() => handleContentClick(item)}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <div className={`w-2 h-2 rounded-full ${platformColors[item.platform]}`} />
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                  {platformDisplayNames[item.platform]}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {formatTime(item.scheduledAt)}
                                </span>
                              </div>
                              <div className="line-clamp-2 font-medium">{item.title}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 border-l-2 border-gray-300 bg-white" />
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 border-l-2 border-yellow-500 bg-white" />
              <span>In Production</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 border-l-2 border-orange-500 bg-white" />
              <span>Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 border-l-2 border-green-500 bg-white" />
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 bg-blue-50 border" />
              <span>Published</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Detail Modal */}
      <Dialog open={isContentDetailOpen} onOpenChange={setIsContentDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedContent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedContent.title}</DialogTitle>
                <DialogDescription>Content ID: #{selectedContent.id.slice(0, 8)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Platform</Label>
                    <div className="mt-1">
                      <Select
                        value={editContent.platform}
                        onValueChange={(value) => setEditContent({ ...editContent, platform: value as Platform })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="zalo">Zalo</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Select
                        value={editContent.status}
                        onValueChange={(value) => setEditContent({ ...editContent, status: value as ContentStatus })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_production">In Production</SelectItem>
                          <SelectItem value="ready_for_review">Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="needs_revision">Needs Revision</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Publish Date</Label>
                    <Input
                      type="date"
                      value={editContent.date}
                      onChange={(e) => setEditContent({ ...editContent, date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Publish Time</Label>
                    <Input
                      type="time"
                      value={editContent.time}
                      onChange={(e) => setEditContent({ ...editContent, time: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <Textarea
                    value={editContent.description}
                    onChange={(e) => setEditContent({ ...editContent, description: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Content Type</Label>
                    <Input
                      value={editContent.contentType}
                      onChange={(e) => setEditContent({ ...editContent, contentType: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Assignee</Label>
                    <Input
                      value={editContent.assignee}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>

                {selectedContent._count && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{selectedContent._count.comments} comments</span>
                    <span>{selectedContent._count.attachments} attachments</span>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleDuplicateContent}
                    disabled={createMutation.isPending}
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleDeleteContent}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsContentDetailOpen(false)}>
                    Dong
                  </Button>
                  <Button onClick={handleUpdateContent} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2 p-0" />
                        Saving...
                      </>
                    ) : (
                      "Luu thay doi"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Content Modal */}
      <Dialog open={isNewContentOpen} onOpenChange={setIsNewContentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Them noi dung moi</DialogTitle>
            <DialogDescription>Tao content moi cho Content Calendar</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tieu de *</Label>
              <Input
                placeholder="Nhap tieu de content..."
                className="mt-1"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Mo ta</Label>
              <Textarea
                placeholder="Mo ta chi tiet ve content..."
                rows={3}
                className="mt-1"
                value={newContent.description}
                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform *</Label>
                <Select
                  value={newContent.platform}
                  onValueChange={(value) => setNewContent({ ...newContent, platform: value as Platform })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chon platform..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="zalo">Zalo</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Content Type</Label>
                <Select
                  value={newContent.contentType}
                  onValueChange={(value) => setNewContent({ ...newContent, contentType: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chon loai..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Social Post">Social Post</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Graphic">Graphic</SelectItem>
                    <SelectItem value="Blog Post">Blog Post</SelectItem>
                    <SelectItem value="Carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Publish Date *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newContent.date}
                  onChange={(e) => setNewContent({ ...newContent, date: e.target.value })}
                />
              </div>

              <div>
                <Label>Publish Time</Label>
                <Input
                  type="time"
                  value={newContent.time}
                  className="mt-1"
                  onChange={(e) => setNewContent({ ...newContent, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assignee</Label>
                <Input
                  placeholder="Nguoi phu trach..."
                  className="mt-1"
                  value={newContent.assignee}
                  onChange={(e) => setNewContent({ ...newContent, assignee: e.target.value })}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={newContent.status}
                  onValueChange={(value) => setNewContent({ ...newContent, status: value as ContentStatus })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_production">In Production</SelectItem>
                    <SelectItem value="ready_for_review">Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                placeholder="Tag1, Tag2, Tag3..."
                className="mt-1"
                value={newContent.tags}
                onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewContentOpen(false)}>
              Huy
            </Button>
            <Button onClick={handleCreateContent} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2 p-0" />
                  Creating...
                </>
              ) : (
                "Tao Content"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
