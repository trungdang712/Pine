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
  FileText,
  Download,
  Upload,
  Send,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Circle,
  ListTodo,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpload, formatFileSize } from "@/hooks/use-upload";
import { trpc } from "@/lib/trpc";
import { LoadingSpinner, PageLoading } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { toast } from "sonner";
import { useLanguage } from "@/i18n";
import { usePlatforms } from "@/hooks/use-platforms";
import { PlatformFilterSelect, PlatformSelect } from "@/components/platform";
import { PlatformLegend, PlatformDot } from "@/components/platform";

type Platform = "facebook" | "instagram" | "zalo" | "tiktok" | "website";
type ContentStatus = "planned" | "in_production" | "ready_for_review" | "approved" | "scheduled" | "published" | "needs_revision";
type ContentType = "social_post" | "video" | "article" | "graphic" | "carousel" | "blog_post";

interface SocialChannel {
  id: string;
  name: string;
  platform: string;
  accountId: string | null;
  accountUrl: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

interface CalendarItem {
  id: string;
  platform: Platform;
  contentType: ContentType | null;
  title: string;
  description: string | null;
  status: ContentStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  channelId: string | null;
  channel: SocialChannel | null;
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

interface CalendarItemComment {
  id: string;
  calendarItemId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
}

interface CalendarItemAttachment {
  id: string;
  calendarItemId: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: Date;
}

interface LinkedTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  dueDate: Date | null;
  assignee: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
}

interface TemplateTask {
  title: string;
  description: string;
  category: string;
  priority: string;
  daysBeforeDeadline: number;
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-500",
  zalo: "bg-blue-600",
  tiktok: "bg-black",
  instagram: "bg-pink-500",
  website: "bg-yellow-500",
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

export default function CalendarPage() {
  const { t } = useLanguage();
  const { platforms, getPlatformDisplayName, getPlatformColor } = usePlatforms();
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Fallback for platforms not yet in DB (backwards compatibility)
  const platformDisplayNames: Record<string, string> = {
    facebook: t.calendar.platforms.facebook,
    zalo: t.calendar.platforms.zalo,
    tiktok: t.calendar.platforms.tiktok,
    instagram: t.calendar.platforms.instagram,
    website: "Website",
  };

  // Use dynamic platform name if available, fallback to static
  const getDisplayName = (code: string) => {
    const dynamicName = getPlatformDisplayName(code);
    return dynamicName !== code ? dynamicName : (platformDisplayNames[code] ?? code);
  };

  const statusDisplayNames: Record<string, string> = {
    planned: t.dashboard.status.scheduled,
    in_production: t.dashboard.status.inProduction,
    ready_for_review: t.dashboard.status.readyForReview,
    approved: t.proposals.statuses.approved,
    scheduled: t.dashboard.status.scheduled,
    published: t.dashboard.status.published,
    needs_revision: t.proposals.statuses.needsRevision,
  };

  const contentTypeDisplayNames: Record<string, string> = {
    social_post: t.calendar.contentTypes.socialPost,
    video: t.calendar.contentTypes.video,
    article: t.calendar.contentTypes.article,
    graphic: t.calendar.contentTypes.graphic,
    carousel: t.calendar.contentTypes.carousel,
    blog_post: t.calendar.contentTypes.blogPost,
  };

  const [selectedContent, setSelectedContent] = useState<CalendarItem | null>(null);
  const [isContentDetailOpen, setIsContentDetailOpen] = useState(false);
  const [isNewContentOpen, setIsNewContentOpen] = useState(false);
  const [isTaskTemplateOpen, setIsTaskTemplateOpen] = useState(false);
  const [newlyCreatedItemId, setNewlyCreatedItemId] = useState<string | null>(null);
  const [newlyCreatedContentType, setNewlyCreatedContentType] = useState<ContentType | null>(null);
  const [newlyCreatedScheduledAt, setNewlyCreatedScheduledAt] = useState<string | null>(null);
  const [taskAssignees, setTaskAssignees] = useState<Record<string, string>>({});
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Form state for new content
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    platform: "" as Platform | "",
    channelId: "",
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
    channelId: "" as string | "",
    status: "" as ContentStatus | "",
    date: "",
    time: "",
    description: "",
    contentType: "" as ContentType | "",
    assignee: "",
  });

  // Comment state
  const [newComment, setNewComment] = useState("");

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

  // Fetch team members for assignee dropdown
  const { data: teamMembers = [] } = trpc.user.getTeamMembers.useQuery();

  // Fetch active channels
  const { data: channels = [] } = trpc.channels.getActive.useQuery();

  // Filter channels by selected platform
  const getChannelsForPlatform = (platform: string) => {
    return channels.filter((channel: SocialChannel) => channel.platform === platform);
  };

  // Mutations
  const utils = trpc.useUtils();

  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: (data) => {
      toast.success("Content created successfully");
      setIsNewContentOpen(false);

      // Store info for task template modal - use API response data to avoid stale closure
      if (data.contentType) {
        setNewlyCreatedItemId(data.id);
        setNewlyCreatedContentType(data.contentType as ContentType);
        setNewlyCreatedScheduledAt(data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null);
        setTaskAssignees({});
        setIsTaskTemplateOpen(true);
      }

      setNewContent({
        title: "",
        description: "",
        platform: "",
        channelId: "",
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

  const addCommentMutation = trpc.calendar.addComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.calendar.getById.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  const addAttachmentMutation = trpc.calendar.addAttachment.useMutation({
    onSuccess: () => {
      toast.success("Attachment uploaded successfully");
      utils.calendar.getById.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to add attachment: ${error.message}`);
    },
  });

  // Fetch detailed content when modal opens
  const { data: contentDetail, isLoading: isLoadingDetail } = trpc.calendar.getById.useQuery(
    { id: selectedContent?.id ?? "" },
    { enabled: isContentDetailOpen && !!selectedContent?.id }
  );

  // Fetch task template when task template modal opens
  const { data: taskTemplate, isLoading: isLoadingTemplate } = trpc.calendar.getTemplateByContentType.useQuery(
    { contentType: newlyCreatedContentType! },
    { enabled: isTaskTemplateOpen && !!newlyCreatedContentType }
  );

  // Mutation to create tasks from template
  const createTasksMutation = trpc.calendar.createTasksFromTemplate.useMutation({
    onSuccess: (tasks) => {
      toast.success(`Created ${tasks.length} tasks successfully`);
      setIsTaskTemplateOpen(false);
      setNewlyCreatedItemId(null);
      setNewlyCreatedContentType(null);
      setNewlyCreatedScheduledAt(null);
      setTaskAssignees({});
      utils.calendar.getById.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create tasks: ${error.message}`);
    },
  });

  const handleCreateTasksFromTemplate = () => {
    if (!newlyCreatedItemId || !newlyCreatedContentType || !newlyCreatedScheduledAt) return;

    createTasksMutation.mutate({
      calendarItemId: newlyCreatedItemId,
      contentType: newlyCreatedContentType,
      scheduledAt: new Date(newlyCreatedScheduledAt).toISOString(),
      assigneeIds: taskAssignees,
    });
  };

  const handleSkipTaskCreation = () => {
    setIsTaskTemplateOpen(false);
    setNewlyCreatedItemId(null);
    setNewlyCreatedContentType(null);
    setNewlyCreatedScheduledAt(null);
    setTaskAssignees({});
  };

  // Upload hook for attachments
  const { upload: uploadFile, uploading: isUploading } = useUpload({
    bucket: "attachments",
    onSuccess: (result) => {
      if (selectedContent) {
        addAttachmentMutation.mutate({
          calendarItemId: selectedContent.id,
          fileName: result.name,
          fileUrl: result.url,
          fileType: result.name.split(".").pop() || undefined,
          fileSize: result.size,
        });
      }
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedContent) {
      await uploadFile(file, `calendar/${selectedContent.id}`);
    }
    e.target.value = "";
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedContent) return;
    addCommentMutation.mutate({
      calendarItemId: selectedContent.id,
      content: newComment.trim(),
    });
  };

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
      channelId: content.channelId || "",
      status: content.status,
      date: scheduledDate ? scheduledDate.toISOString().split("T")[0] : "",
      time: scheduledDate ? scheduledDate.toTimeString().slice(0, 5) : "",
      description: content.description || "",
      contentType: content.contentType || "",
      assignee: content.creator?.name || "",
    });
    setNewComment("");
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
      channelId: newContent.channelId || undefined,
      contentType: newContent.contentType ? (newContent.contentType as ContentType) : undefined,
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
      channelId: editContent.channelId || null,
      contentType: editContent.contentType ? (editContent.contentType as ContentType) : null,
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
      contentType: selectedContent.contentType || undefined,
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

  const formatCommentDate = (date: Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (isLoading) {
    return <PageLoading text={t.common.loading} />;
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{t.calendar.title}</h1>
          <p className="text-muted-foreground">{t.calendar.subtitle}</p>
        </div>
        <Button className="gap-2" onClick={() => setIsNewContentOpen(true)}>
          <Plus className="w-4 h-4" />
          {t.calendar.createEvent}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.calendar.stats.totalContent}</p>
                <p className="text-2xl font-semibold">{statsData.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.calendar.stats.planned}</p>
                <p className="text-2xl font-semibold">{statsData.planned}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.calendar.stats.inProduction}</p>
                <p className="text-2xl font-semibold">{statsData.inProduction}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.calendar.stats.ready}</p>
                <p className="text-2xl font-semibold">{statsData.ready}</p>
              </div>
              <Clock className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.calendar.stats.published}</p>
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
              <Label className="text-sm mb-2 block">{t.calendar.platform}</Label>
              <PlatformFilterSelect
                value={filterPlatform}
                onValueChange={setFilterPlatform}
                allLabel={t.common.all}
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm mb-2 block">{t.tasks.status}</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.common.all}</SelectItem>
                  <SelectItem value="planned">{statusDisplayNames.planned}</SelectItem>
                  <SelectItem value="in_production">{statusDisplayNames.in_production}</SelectItem>
                  <SelectItem value="ready_for_review">{statusDisplayNames.ready_for_review}</SelectItem>
                  <SelectItem value="approved">{statusDisplayNames.approved}</SelectItem>
                  <SelectItem value="scheduled">{statusDisplayNames.scheduled}</SelectItem>
                  <SelectItem value="published">{statusDisplayNames.published}</SelectItem>
                  <SelectItem value="needs_revision">{statusDisplayNames.needs_revision}</SelectItem>
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
              {t.calendar.views.month}
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              {t.calendar.views.week}
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
            >
              {t.calendar.views.day}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Platform Legend */}
          <PlatformLegend className="mb-4" />

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-x-auto">
            {/* Week Day Headers */}
            <div className="grid grid-cols-7 bg-muted min-w-[640px]">
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
            <div className="grid grid-cols-7 min-w-[640px]">
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
                          {isToday && <span className="ml-1 text-xs">({t.common.today})</span>}
                        </div>
                        <div className="space-y-1">
                          {dayContent.map((item) => (
                            <div
                              key={item.id}
                              className={`text-xs p-1.5 rounded border-l-2 ${statusColors[item.status]} bg-card hover:shadow-md cursor-pointer transition-all`}
                              onClick={() => handleContentClick(item)}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <PlatformDot code={item.platform} size="sm" />
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 truncate max-w-[80px]" title={item.channel?.name || getDisplayName(item.platform)}>
                                  {item.channel?.name || getDisplayName(item.platform)}
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

        </CardContent>
      </Card>

      {/* Content Detail Modal */}
      <Dialog open={isContentDetailOpen} onOpenChange={setIsContentDetailOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-3xl w-full max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
          {selectedContent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedContent.title}</DialogTitle>
                <DialogDescription>Content ID: #{selectedContent.id.slice(0, 8)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.calendar.platform}</Label>
                    <div className="mt-1">
                      <PlatformSelect
                        value={editContent.platform}
                        onValueChange={(value) => setEditContent({ ...editContent, platform: value as Platform, channelId: "" })}
                        placeholder={t.calendar.platform}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Kênh đăng</Label>
                    <div className="mt-1">
                      <Select
                        value={editContent.channelId}
                        onValueChange={(value) => setEditContent({ ...editContent, channelId: value })}
                        disabled={!editContent.platform}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={editContent.platform ? "Chọn kênh" : "Chọn nền tảng trước"} />
                        </SelectTrigger>
                        <SelectContent>
                          {getChannelsForPlatform(editContent.platform).map((channel: SocialChannel) => (
                            <SelectItem key={channel.id} value={channel.id}>
                              <div className="flex items-center gap-2">
                                {channel.avatarUrl && (
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage src={channel.avatarUrl} />
                                    <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                )}
                                {channel.name}
                              </div>
                            </SelectItem>
                          ))}
                          {getChannelsForPlatform(editContent.platform).length === 0 && editContent.platform && (
                            <SelectItem value="none" disabled>Chưa có kênh nào</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.calendar.contentType}</Label>
                    <div className="mt-1">
                      <Select
                        value={editContent.contentType}
                        onValueChange={(value) => setEditContent({ ...editContent, contentType: value as ContentType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.calendar.contentType} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social_post">{contentTypeDisplayNames.social_post}</SelectItem>
                          <SelectItem value="video">{contentTypeDisplayNames.video}</SelectItem>
                          <SelectItem value="article">{contentTypeDisplayNames.article}</SelectItem>
                          <SelectItem value="graphic">{contentTypeDisplayNames.graphic}</SelectItem>
                          <SelectItem value="carousel">{contentTypeDisplayNames.carousel}</SelectItem>
                          <SelectItem value="blog_post">{contentTypeDisplayNames.blog_post}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.tasks.status}</Label>
                    <div className="mt-1">
                      <Select
                        value={editContent.status}
                        onValueChange={(value) => setEditContent({ ...editContent, status: value as ContentStatus })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">{statusDisplayNames.planned}</SelectItem>
                          <SelectItem value="in_production">{statusDisplayNames.in_production}</SelectItem>
                          <SelectItem value="ready_for_review">{statusDisplayNames.ready_for_review}</SelectItem>
                          <SelectItem value="approved">{statusDisplayNames.approved}</SelectItem>
                          <SelectItem value="scheduled">{statusDisplayNames.scheduled}</SelectItem>
                          <SelectItem value="published">{statusDisplayNames.published}</SelectItem>
                          <SelectItem value="needs_revision">{statusDisplayNames.needs_revision}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.tasks.assignee}</Label>
                    <Input
                      value={editContent.assignee}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.calendar.scheduledAt}</Label>
                    <Input
                      type="date"
                      value={editContent.date}
                      onChange={(e) => setEditContent({ ...editContent, date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.calendar.scheduledAt}</Label>
                    <Input
                      type="time"
                      value={editContent.time}
                      onChange={(e) => setEditContent({ ...editContent, time: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">{t.tasks.description}</Label>
                  <Textarea
                    value={editContent.description}
                    onChange={(e) => setEditContent({ ...editContent, description: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Attachments Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      {t.tasks.attachments} ({contentDetail?.attachments?.length || 0})
                    </Label>
                    <div>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading || addAttachmentMutation.isPending}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        disabled={isUploading || addAttachmentMutation.isPending}
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? t.common.loading : t.common.upload}
                      </Button>
                    </div>
                  </div>
                  {isLoadingDetail ? (
                    <div className="text-sm text-muted-foreground">{t.common.loading}</div>
                  ) : contentDetail?.attachments && contentDetail.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {contentDetail.attachments.map((attachment: CalendarItemAttachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{attachment.fileName}</p>
                              {attachment.fileSize && (
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(attachment.fileSize)}
                                </p>
                              )}
                            </div>
                          </div>
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.common.noData}</p>
                  )}
                </div>

                {/* Comments Section */}
                <div className="border-t pt-4">
                  <Label className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4" />
                    {t.tasks.comments} ({contentDetail?.comments?.length || 0})
                  </Label>

                  {/* Add Comment */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder={t.tasks.addComment}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  {isLoadingDetail ? (
                    <div className="text-sm text-muted-foreground">{t.common.loading}</div>
                  ) : contentDetail?.comments && contentDetail.comments.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {contentDetail.comments.map((comment: CalendarItemComment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user?.avatar || undefined} />
                            <AvatarFallback>
                              {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {comment.user?.name || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatCommentDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.common.noData}</p>
                  )}
                </div>

                {/* Linked Tasks Section */}
                <div className="border-t pt-4">
                  <Label className="flex items-center gap-2 mb-3">
                    <ListTodo className="w-4 h-4" />
                    Tasks liên kết ({contentDetail?.tasks?.length || 0})
                  </Label>

                  {isLoadingDetail ? (
                    <div className="text-sm text-muted-foreground">{t.common.loading}</div>
                  ) : contentDetail?.tasks && contentDetail.tasks.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {contentDetail.tasks.map((task: LinkedTask) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            {task.status === "done" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                            <div>
                              <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {task.dueDate && (
                                  <span>{new Date(task.dueDate).toLocaleDateString("vi-VN")}</span>
                                )}
                                {task.assignee && (
                                  <>
                                    <span>•</span>
                                    <span>{task.assignee.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={task.status === "done" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {task.status === "done" ? "Hoàn thành" :
                             task.status === "in_progress" ? "Đang làm" :
                             task.status === "review" ? "Review" : "Chờ"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có tasks liên kết</p>
                  )}
                </div>
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
                    {t.common.add}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleDeleteContent}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.common.delete}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsContentDetailOpen(false)}>
                    {t.common.close}
                  </Button>
                  <Button onClick={handleUpdateContent} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2 p-0" />
                        {t.common.loading}
                      </>
                    ) : (
                      t.common.save
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
        <DialogContent className="max-w-[100vw] sm:max-w-2xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.calendar.createEvent}</DialogTitle>
            <DialogDescription>{t.calendar.subtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t.calendar.title} *</Label>
              <Input
                placeholder={t.calendar.title}
                className="mt-1"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              />
            </div>

            <div>
              <Label>{t.tasks.description}</Label>
              <Textarea
                placeholder={t.tasks.description}
                rows={3}
                className="mt-1"
                value={newContent.description}
                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.calendar.platform} *</Label>
                <PlatformSelect
                  value={newContent.platform}
                  onValueChange={(value) => setNewContent({ ...newContent, platform: value as Platform, channelId: "" })}
                  placeholder={t.calendar.platform}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Kênh đăng</Label>
                <Select
                  value={newContent.channelId}
                  onValueChange={(value) => setNewContent({ ...newContent, channelId: value })}
                  disabled={!newContent.platform}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={newContent.platform ? "Chọn kênh" : "Chọn nền tảng trước"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getChannelsForPlatform(newContent.platform).map((channel: SocialChannel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        <div className="flex items-center gap-2">
                          {channel.avatarUrl && (
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={channel.avatarUrl} />
                              <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          {channel.name}
                        </div>
                      </SelectItem>
                    ))}
                    {getChannelsForPlatform(newContent.platform).length === 0 && newContent.platform && (
                      <SelectItem value="none" disabled>Chưa có kênh nào</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.calendar.contentType}</Label>
                <Select
                  value={newContent.contentType}
                  onValueChange={(value) => setNewContent({ ...newContent, contentType: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t.calendar.contentType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social_post">{contentTypeDisplayNames.social_post}</SelectItem>
                    <SelectItem value="video">{contentTypeDisplayNames.video}</SelectItem>
                    <SelectItem value="article">{contentTypeDisplayNames.article}</SelectItem>
                    <SelectItem value="graphic">{contentTypeDisplayNames.graphic}</SelectItem>
                    <SelectItem value="carousel">{contentTypeDisplayNames.carousel}</SelectItem>
                    <SelectItem value="blog_post">{contentTypeDisplayNames.blog_post}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.tasks.status}</Label>
                <Select
                  value={newContent.status}
                  onValueChange={(value) => setNewContent({ ...newContent, status: value as ContentStatus })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">{statusDisplayNames.planned}</SelectItem>
                    <SelectItem value="in_production">{statusDisplayNames.in_production}</SelectItem>
                    <SelectItem value="ready_for_review">{statusDisplayNames.ready_for_review}</SelectItem>
                    <SelectItem value="approved">{statusDisplayNames.approved}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.calendar.scheduledAt} *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newContent.date}
                  onChange={(e) => setNewContent({ ...newContent, date: e.target.value })}
                />
              </div>

              <div>
                <Label>{t.calendar.scheduledAt}</Label>
                <Input
                  type="time"
                  value={newContent.time}
                  className="mt-1"
                  onChange={(e) => setNewContent({ ...newContent, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>{t.tasks.assignee}</Label>
              <Select
                value={newContent.assignee}
                onValueChange={(value) => setNewContent({ ...newContent, assignee: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t.tasks.assignee} />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateContent} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2 p-0" />
                  {t.common.loading}
                </>
              ) : (
                t.calendar.createEvent
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Template Modal - shown after creating content */}
      <Dialog open={isTaskTemplateOpen} onOpenChange={setIsTaskTemplateOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-2xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              Tạo tasks từ template
            </DialogTitle>
            <DialogDescription>
              {newlyCreatedContentType && (
                <>Template cho: <strong>{contentTypeDisplayNames[newlyCreatedContentType]}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          {isLoadingTemplate ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : taskTemplate ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {taskTemplate.description}
              </p>

              <div className="space-y-3">
                {taskTemplate.tasks.map((task: TemplateTask, index: number) => {
                  const dueDate = newlyCreatedScheduledAt
                    ? new Date(new Date(newlyCreatedScheduledAt).getTime() - task.daysBeforeDeadline * 24 * 60 * 60 * 1000)
                    : null;

                  return (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {task.daysBeforeDeadline === 0 ? "Ngày đăng" : `-${task.daysBeforeDeadline} ngày`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Deadline: {dueDate?.toLocaleDateString("vi-VN")}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground capitalize">{task.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <Select
                          value={taskAssignees[index.toString()] || ""}
                          onValueChange={(value) => setTaskAssignees({ ...taskAssignees, [index.toString()]: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Chọn người thực hiện" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy template cho loại nội dung này
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleSkipTaskCreation}>
              Bỏ qua
            </Button>
            <Button
              onClick={handleCreateTasksFromTemplate}
              disabled={!taskTemplate || createTasksMutation.isPending}
            >
              {createTasksMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2 p-0" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Tạo {taskTemplate?.tasks.length || 0} tasks
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
