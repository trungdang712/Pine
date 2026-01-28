"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { KPICard } from "@/components/dashboard/kpi-card";
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
  CheckSquare,
  Clock,
  FileText,
  Trophy,
  Users,
  DollarSign,
  Target,
  Palette,
  Video as VideoIcon,
  Megaphone,
  BarChart3,
  CheckCircle,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Film,
  TrendingUp,
  Plus,
  Bell,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type RoleType = "Admin" | "Marketing Manager" | "Content Creator" | "Digital Marketing" | "Graphic Designer" | "Video Producer";

interface KPIConfig {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: { value: number; isPositive: boolean };
}

interface QuickAction {
  label: string;
  icon: LucideIcon;
  variant: "default" | "outline";
  href: string;
}

// Role configurations
const roleConfigs: Record<RoleType, { quickActions: QuickAction[] }> = {
  Admin: {
    quickActions: [
      { label: "Thêm Team Member", icon: Plus, variant: "default", href: "/settings" },
      { label: "Xem Budget Report", icon: DollarSign, variant: "outline", href: "/analytics/budget" },
      { label: "Team Performance", icon: BarChart3, variant: "outline", href: "/performance/team" },
      { label: "Duyệt Proposals", icon: CheckCircle, variant: "outline", href: "/proposals" },
    ],
  },
  "Marketing Manager": {
    quickActions: [
      { label: "Duyệt Proposals", icon: CheckCircle, variant: "default", href: "/proposals" },
      { label: "Tạo Campaign mới", icon: Plus, variant: "outline", href: "/analytics/campaigns" },
      { label: "Xem Analytics", icon: BarChart3, variant: "outline", href: "/analytics" },
      { label: "Assign Tasks", icon: Users, variant: "outline", href: "/tasks" },
    ],
  },
  "Content Creator": {
    quickActions: [
      { label: "Tạo Content mới", icon: Plus, variant: "default", href: "/calendar" },
      { label: "Xem Content Calendar", icon: CalendarIcon, variant: "outline", href: "/calendar" },
      { label: "My Tasks", icon: CheckSquare, variant: "outline", href: "/tasks" },
      { label: "Brand Library", icon: FileText, variant: "outline", href: "/library/brand" },
    ],
  },
  "Digital Marketing": {
    quickActions: [
      { label: "Tạo Campaign mới", icon: Plus, variant: "default", href: "/analytics/campaigns" },
      { label: "Xem Analytics", icon: BarChart3, variant: "outline", href: "/analytics" },
      { label: "Manage Ads", icon: Megaphone, variant: "outline", href: "/analytics/campaigns" },
      { label: "Landing Pages", icon: Target, variant: "outline", href: "/analytics/landing" },
    ],
  },
  "Graphic Designer": {
    quickActions: [
      { label: "Upload Design mới", icon: Plus, variant: "default", href: "/library/assets" },
      { label: "Brand Library", icon: Palette, variant: "outline", href: "/library/brand" },
      { label: "My Tasks", icon: CheckSquare, variant: "outline", href: "/tasks" },
      { label: "Design Requests", icon: ImageIcon, variant: "outline", href: "/inbox" },
    ],
  },
  "Video Producer": {
    quickActions: [
      { label: "Tạo Video Project", icon: Plus, variant: "default", href: "/tasks" },
      { label: "Production Timeline", icon: CalendarIcon, variant: "outline", href: "/calendar" },
      { label: "My Tasks", icon: CheckSquare, variant: "outline", href: "/tasks" },
      { label: "Video Assets", icon: Film, variant: "outline", href: "/library/assets" },
    ],
  },
};

const platformColors: Record<string, string> = {
  facebook: "bg-blue-500",
  zalo: "bg-blue-600",
  tiktok: "bg-black",
  instagram: "bg-pink-500",
  youtube: "bg-red-500",
  design: "bg-purple-500",
  video: "bg-red-500",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  scheduled: { label: "Scheduled", variant: "default" },
  in_production: { label: "Đang thực hiện", variant: "secondary" },
  ready_for_review: { label: "Chờ review", variant: "outline" },
  published: { label: "Đã xuất bản", variant: "default" },
};

export default function DashboardPage() {
  const { profile, isAuthenticated } = useAuth();
  const userName = profile?.name?.split(" ")[0] ?? "User";
  const isAdmin = profile?.role === "admin" || profile?.role === "marketing_manager";

  // Map user's actual role to dashboard role type
  const getUserRoleType = (): RoleType => {
    const roleMap: Record<string, RoleType> = {
      admin: "Admin",
      marketing_manager: "Marketing Manager",
      content_creator: "Content Creator",
      digital_marketing: "Digital Marketing",
      graphic_designer: "Graphic Designer",
      video_producer: "Video Producer",
    };
    return roleMap[profile?.role || ""] || "Content Creator";
  };

  const [selectedRole, setSelectedRole] = useState<RoleType>(getUserRoleType());

  // Fetch real data
  const { data: taskStats, isLoading: loadingTaskStats } = trpc.task.getTaskStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: recentAlerts = [], isLoading: loadingAlerts } = trpc.alerts.getMyAlerts.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  // Get upcoming calendar items (next 2 weeks)
  const now = new Date();
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const { data: calendarItems = [], isLoading: loadingCalendar } = trpc.calendar.getItems.useQuery(
    {
      startDate: now.toISOString(),
      endDate: twoWeeksFromNow.toISOString(),
    },
    { enabled: isAuthenticated }
  );

  const { data: myPoints, isLoading: loadingPoints } = trpc.gamification.getMyPoints.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // For non-admin users, always use their actual role
  const effectiveRole = isAdmin ? selectedRole : getUserRoleType();
  const roleConfig = roleConfigs[effectiveRole];

  // Generate KPIs based on real data
  const generateKPIs = (): KPIConfig[] => {
    const totalTasks = taskStats?.total ?? 0;
    const inProgressCount = taskStats?.inProgress ?? 0;
    const completedCount = taskStats?.completed ?? 0;
    const overdueCount = taskStats?.overdue ?? 0;
    const pendingCount = totalTasks - inProgressCount - completedCount;
    const totalPoints = myPoints?.points?.totalPoints ?? 0;
    const weeklyPoints = myPoints?.points?.weeklyPoints ?? 0;

    switch (effectiveRole) {
      case "Admin":
        return [
          { title: "Team Members", value: 8, icon: Users, color: "bg-primary", trend: { value: 2, isPositive: true } },
          { title: "Ngân sách tháng này", value: "85M", subtitle: "/ 100M VND", icon: DollarSign, color: "bg-success" },
          { title: "Active Tasks", value: pendingCount + inProgressCount, icon: Target, color: "bg-info" },
          { title: "Team Performance", value: "92%", subtitle: "Hiệu suất", icon: BarChart3, color: "bg-amber-500" },
        ];
      case "Marketing Manager":
        return [
          { title: "Tasks chờ review", value: overdueCount, icon: Clock, color: "bg-warning" },
          { title: "Active Tasks", value: pendingCount + inProgressCount, icon: Target, color: "bg-primary" },
          { title: "Hoàn thành tuần này", value: completedCount, icon: CheckCircle, color: "bg-success" },
          { title: "Team Points", value: totalPoints, subtitle: `+${weeklyPoints} tuần này`, icon: Trophy, color: "bg-amber-500" },
        ];
      case "Content Creator":
        return [
          { title: "Task hôm nay", value: pendingCount, icon: CheckSquare, color: "bg-primary" },
          { title: "Đang thực hiện", value: inProgressCount, icon: Clock, color: "bg-info" },
          { title: "Quá hạn", value: overdueCount, icon: FileText, color: "bg-warning" },
          { title: "Điểm của tôi", value: totalPoints, subtitle: `+${weeklyPoints} tuần này`, icon: Trophy, color: "bg-amber-500" },
        ];
      case "Graphic Designer":
        return [
          { title: "Design Tasks", value: pendingCount, icon: Palette, color: "bg-primary" },
          { title: "Đang thực hiện", value: inProgressCount, icon: Clock, color: "bg-info" },
          { title: "Quá hạn", value: overdueCount, icon: Clock, color: "bg-warning" },
          { title: "Design Points", value: totalPoints, subtitle: `+${weeklyPoints} tuần này`, icon: Trophy, color: "bg-amber-500" },
        ];
      case "Video Producer":
        return [
          { title: "Video Projects", value: pendingCount, icon: VideoIcon, color: "bg-primary" },
          { title: "Đang sản xuất", value: inProgressCount, icon: Film, color: "bg-warning" },
          { title: "Hoàn thành", value: completedCount, icon: CheckCircle, color: "bg-success" },
          { title: "Video Points", value: totalPoints, subtitle: `+${weeklyPoints} tuần này`, icon: Trophy, color: "bg-amber-500" },
        ];
      case "Digital Marketing":
        return [
          { title: "Active Campaigns", value: pendingCount + inProgressCount, icon: Megaphone, color: "bg-primary" },
          { title: "Đang chạy", value: inProgressCount, icon: Target, color: "bg-info" },
          { title: "Hoàn thành", value: completedCount, icon: CheckCircle, color: "bg-success" },
          { title: "Marketing Points", value: totalPoints, subtitle: `+${weeklyPoints} tuần này`, icon: Trophy, color: "bg-amber-500" },
        ];
      default:
        return [];
    }
  };

  const kpis = generateKPIs();

  const isLoading = loadingTaskStats || loadingAlerts || loadingCalendar || loadingPoints;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        {/* Role Selector - Only for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Xem dashboard với vai trò:</span>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleType)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                <SelectItem value="Content Creator">Content Creator</SelectItem>
                <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                <SelectItem value="Video Producer">Video Producer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <LoadingSpinner size="sm" />
            </Card>
          ))
        ) : (
          kpis.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              icon={kpi.icon}
              color={kpi.color}
              trend={kpi.trend}
            />
          ))
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Content */}
        <Card>
          <CardHeader>
            <CardTitle>Nội dung sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCalendar ? (
              <LoadingSpinner size="sm" />
            ) : calendarItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có nội dung nào sắp tới
              </div>
            ) : (
              <div className="space-y-4">
                {calendarItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className={`${platformColors[item.platform] || "bg-gray-500"} w-2 h-2 rounded-full mt-2`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {item.scheduledAt && (
                          <>
                            <span className="text-sm font-medium">
                              {format(new Date(item.scheduledAt), "dd/MM", { locale: vi })}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(item.scheduledAt), "HH:mm")}
                            </span>
                          </>
                        )}
                        <Badge variant="secondary" className="text-xs capitalize">
                          {item.platform}
                        </Badge>
                      </div>
                      <p className="text-sm">{item.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={statusLabels[item.status]?.variant ?? "outline"} className="text-xs">
                          {statusLabels[item.status]?.label ?? item.status}
                        </Badge>
                        {item.creator && (
                          <span className="text-xs text-muted-foreground">{item.creator.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Thông báo gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAlerts ? (
              <LoadingSpinner size="sm" />
            ) : recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có thông báo mới
              </div>
            ) : (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        !alert.isRead ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(alert.createdAt), "dd/MM HH:mm", { locale: vi })}
                      </p>
                    </div>
                    {alert.link && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={alert.link}>Xem</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {roleConfig.quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button key={index} variant={action.variant} className="gap-2" asChild>
                  <Link href={action.href}>
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
