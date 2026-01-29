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
import { vi as viLocale, enUS } from "date-fns/locale";
import { useLanguage } from "@/i18n";

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

// Role configurations - now using translation keys
interface RoleQuickActionConfig {
  labelKey: string;
  icon: LucideIcon;
  variant: "default" | "outline";
  href: string;
}

const roleConfigsData: Record<RoleType, { quickActions: RoleQuickActionConfig[] }> = {
  Admin: {
    quickActions: [
      { labelKey: "addTeamMember", icon: Plus, variant: "default", href: "/settings" },
      { labelKey: "viewBudgetReport", icon: DollarSign, variant: "outline", href: "/analytics/budget" },
      { labelKey: "teamPerformance", icon: BarChart3, variant: "outline", href: "/performance/team" },
      { labelKey: "reviewProposals", icon: CheckCircle, variant: "outline", href: "/proposals" },
    ],
  },
  "Marketing Manager": {
    quickActions: [
      { labelKey: "reviewProposals", icon: CheckCircle, variant: "default", href: "/proposals" },
      { labelKey: "createCampaign", icon: Plus, variant: "outline", href: "/analytics/campaigns" },
      { labelKey: "viewAnalytics", icon: BarChart3, variant: "outline", href: "/analytics" },
      { labelKey: "assignTasks", icon: Users, variant: "outline", href: "/tasks" },
    ],
  },
  "Content Creator": {
    quickActions: [
      { labelKey: "createContent", icon: Plus, variant: "default", href: "/calendar" },
      { labelKey: "viewCalendar", icon: CalendarIcon, variant: "outline", href: "/calendar" },
      { labelKey: "myTasks", icon: CheckSquare, variant: "outline", href: "/tasks" },
      { labelKey: "brandLibrary", icon: FileText, variant: "outline", href: "/library/brand" },
    ],
  },
  "Digital Marketing": {
    quickActions: [
      { labelKey: "createCampaign", icon: Plus, variant: "default", href: "/analytics/campaigns" },
      { labelKey: "viewAnalytics", icon: BarChart3, variant: "outline", href: "/analytics" },
      { labelKey: "manageAds", icon: Megaphone, variant: "outline", href: "/analytics/campaigns" },
      { labelKey: "landingPages", icon: Target, variant: "outline", href: "/analytics/landing" },
    ],
  },
  "Graphic Designer": {
    quickActions: [
      { labelKey: "uploadDesign", icon: Plus, variant: "default", href: "/library/assets" },
      { labelKey: "brandLibrary", icon: Palette, variant: "outline", href: "/library/brand" },
      { labelKey: "myTasks", icon: CheckSquare, variant: "outline", href: "/tasks" },
      { labelKey: "designRequests", icon: ImageIcon, variant: "outline", href: "/inbox" },
    ],
  },
  "Video Producer": {
    quickActions: [
      { labelKey: "createVideoProject", icon: Plus, variant: "default", href: "/tasks" },
      { labelKey: "productionTimeline", icon: CalendarIcon, variant: "outline", href: "/calendar" },
      { labelKey: "myTasks", icon: CheckSquare, variant: "outline", href: "/tasks" },
      { labelKey: "videoAssets", icon: Film, variant: "outline", href: "/library/assets" },
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

const statusLabelsData: Record<string, { labelKey: string; variant: "default" | "secondary" | "outline" }> = {
  scheduled: { labelKey: "scheduled", variant: "default" },
  in_production: { labelKey: "inProduction", variant: "secondary" },
  ready_for_review: { labelKey: "readyForReview", variant: "outline" },
  published: { labelKey: "published", variant: "default" },
};

export default function DashboardPage() {
  const { profile, isAuthenticated, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  // For Vietnamese names, the given name is the last word
  const nameParts = profile?.name?.split(" ") || [];
  const userName = nameParts[nameParts.length - 1] || "";
  const isAdmin = profile?.role === "super_admin" || profile?.role === "admin" || profile?.role === "marketing_manager";
  const dateLocale = language === "vi" ? viLocale : enUS;

  // Map user's actual role to dashboard role type
  const getUserRoleType = (): RoleType => {
    const roleMap: Record<string, RoleType> = {
      super_admin: "Admin",
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

  // Get action label from translations
  const getActionLabel = (key: string): string => {
    return (t.dashboard.actions as Record<string, string>)[key] || key;
  };

  // Get status label from translations
  const getStatusLabel = (key: string): string => {
    return (t.dashboard.status as Record<string, string>)[key] || key;
  };

  // Get stable date range for calendar query (memoized to prevent re-renders)
  const [dateRange] = useState(() => {
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return {
      calendarStartDate: now.toISOString(),
      calendarEndDate: twoWeeksFromNow.toISOString(),
      alertsLimit: 5,
    };
  });

  // Single combined query for all dashboard data - much faster than 4 separate calls
  const { data: dashboardData, isLoading: isLoadingData, isError: hasError } = trpc.dashboard.getData.useQuery(
    dateRange,
    { enabled: isAuthenticated, retry: false, staleTime: 60000 }
  );

  // Extract data from combined response
  const taskStats = dashboardData?.taskStats;
  const calendarItems = dashboardData?.calendarItems ?? [];
  const recentAlerts = dashboardData?.alerts ?? [];
  const myPoints = dashboardData?.points;

  const currentDate = new Date().toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greeting.morning;
    if (hour < 18) return t.dashboard.greeting.afternoon;
    return t.dashboard.greeting.evening;
  };

  // For non-admin users, always use their actual role
  const effectiveRole = isAdmin ? selectedRole : getUserRoleType();
  const roleConfig = roleConfigsData[effectiveRole];

  // Generate KPIs based on real data
  const generateKPIs = (): KPIConfig[] => {
    const totalTasks = taskStats?.total ?? 0;
    const inProgressCount = taskStats?.inProgress ?? 0;
    const completedCount = taskStats?.completed ?? 0;
    const overdueCount = taskStats?.overdue ?? 0;
    const pendingCount = totalTasks - inProgressCount - completedCount;
    const totalPoints = myPoints?.totalPoints ?? 0;
    const weeklyPoints = myPoints?.weeklyPoints ?? 0;

    switch (effectiveRole) {
      case "Admin":
        return [
          { title: t.dashboard.kpis.teamMembers, value: 8, icon: Users, color: "bg-primary", trend: { value: 2, isPositive: true } },
          { title: t.dashboard.kpis.monthlyBudget, value: "85M", subtitle: "/ 100M VND", icon: DollarSign, color: "bg-success" },
          { title: t.dashboard.kpis.activeTasks, value: pendingCount + inProgressCount, icon: Target, color: "bg-info" },
          { title: t.dashboard.kpis.teamPerformance, value: "92%", subtitle: t.dashboard.kpis.performance, icon: BarChart3, color: "bg-amber-500" },
        ];
      case "Marketing Manager":
        return [
          { title: t.dashboard.kpis.tasksAwaitingReview, value: overdueCount, icon: Clock, color: "bg-warning" },
          { title: t.dashboard.kpis.activeTasks, value: pendingCount + inProgressCount, icon: Target, color: "bg-primary" },
          { title: t.dashboard.kpis.completedThisWeek, value: completedCount, icon: CheckCircle, color: "bg-success" },
          { title: t.dashboard.kpis.teamPoints, value: totalPoints, subtitle: `+${weeklyPoints} ${t.dashboard.kpis.thisWeek}`, icon: Trophy, color: "bg-amber-500" },
        ];
      case "Content Creator":
        return [
          { title: t.dashboard.kpis.todayTasks, value: pendingCount, icon: CheckSquare, color: "bg-primary" },
          { title: t.dashboard.kpis.inProgress, value: inProgressCount, icon: Clock, color: "bg-info" },
          { title: t.dashboard.kpis.overdue, value: overdueCount, icon: FileText, color: "bg-warning" },
          { title: t.dashboard.kpis.myPoints, value: totalPoints, subtitle: `+${weeklyPoints} ${t.dashboard.kpis.thisWeek}`, icon: Trophy, color: "bg-amber-500" },
        ];
      case "Graphic Designer":
        return [
          { title: t.dashboard.kpis.designTasks, value: pendingCount, icon: Palette, color: "bg-primary" },
          { title: t.dashboard.kpis.inProgress, value: inProgressCount, icon: Clock, color: "bg-info" },
          { title: t.dashboard.kpis.overdue, value: overdueCount, icon: Clock, color: "bg-warning" },
          { title: t.dashboard.kpis.designPoints, value: totalPoints, subtitle: `+${weeklyPoints} ${t.dashboard.kpis.thisWeek}`, icon: Trophy, color: "bg-amber-500" },
        ];
      case "Video Producer":
        return [
          { title: t.dashboard.kpis.videoProjects, value: pendingCount, icon: VideoIcon, color: "bg-primary" },
          { title: t.dashboard.kpis.inProduction, value: inProgressCount, icon: Film, color: "bg-warning" },
          { title: t.dashboard.kpis.completed, value: completedCount, icon: CheckCircle, color: "bg-success" },
          { title: t.dashboard.kpis.videoPoints, value: totalPoints, subtitle: `+${weeklyPoints} ${t.dashboard.kpis.thisWeek}`, icon: Trophy, color: "bg-amber-500" },
        ];
      case "Digital Marketing":
        return [
          { title: t.dashboard.kpis.activeCampaigns, value: pendingCount + inProgressCount, icon: Megaphone, color: "bg-primary" },
          { title: t.dashboard.kpis.running, value: inProgressCount, icon: Target, color: "bg-info" },
          { title: t.dashboard.kpis.completed, value: completedCount, icon: CheckCircle, color: "bg-success" },
          { title: t.dashboard.kpis.marketingPoints, value: totalPoints, subtitle: `+${weeklyPoints} ${t.dashboard.kpis.thisWeek}`, icon: Trophy, color: "bg-amber-500" },
        ];
      default:
        return [];
    }
  };

  const kpis = generateKPIs();

  // Check if query has auth error (UNAUTHORIZED)
  const hasAuthError = hasError;

  // Loading state: auth loading OR data loading
  const isLoading = authLoading || isLoadingData;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Auth Error Banner */}
      {hasAuthError && !authLoading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-amber-800">{t.errors.sessionExpired}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {t.common.refresh}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        {/* Role Selector - Only for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{t.dashboard.viewAsRole}</span>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleType)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">{t.dashboard.roles.admin}</SelectItem>
                <SelectItem value="Marketing Manager">{t.dashboard.roles.marketingManager}</SelectItem>
                <SelectItem value="Content Creator">{t.dashboard.roles.contentCreator}</SelectItem>
                <SelectItem value="Digital Marketing">{t.dashboard.roles.digitalMarketing}</SelectItem>
                <SelectItem value="Graphic Designer">{t.dashboard.roles.graphicDesigner}</SelectItem>
                <SelectItem value="Video Producer">{t.dashboard.roles.videoProducer}</SelectItem>
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
            <CardTitle>{t.dashboard.upcomingContent}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : hasError ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t.errors.generic}
              </div>
            ) : calendarItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.dashboard.noUpcomingContent}
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
                              {format(new Date(item.scheduledAt), "dd/MM", { locale: dateLocale })}
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
                        <Badge variant={statusLabelsData[item.status]?.variant ?? "outline"} className="text-xs">
                          {statusLabelsData[item.status] ? getStatusLabel(statusLabelsData[item.status].labelKey) : item.status}
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
              {t.dashboard.recentNotifications}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : hasError ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t.errors.generic}
              </div>
            ) : recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.dashboard.noNewNotifications}
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
                        {format(new Date(alert.createdAt), "dd/MM HH:mm", { locale: dateLocale })}
                      </p>
                    </div>
                    {alert.link && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={alert.link}>{t.common.view}</Link>
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
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {roleConfig.quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button key={index} variant={action.variant} className="gap-2" asChild>
                  <Link href={action.href}>
                    <Icon className="w-4 h-4" />
                    {getActionLabel(action.labelKey)}
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
