"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import { LucideIcon } from "lucide-react";

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
}

interface UpcomingItem {
  date: string;
  time: string;
  platform: string;
  title: string;
  status: "ready" | "in-production" | "review";
  assignedTo: string;
}

interface ActivityItem {
  user: string;
  action: string;
  item: string;
  time: string;
  type: "success" | "info" | "warning";
}

// Role configurations
const roleConfigs: Record<RoleType, { kpis: KPIConfig[]; quickActions: QuickAction[] }> = {
  Admin: {
    kpis: [
      { title: "Team Members", value: 15, icon: Users, color: "bg-primary", trend: { value: 2, isPositive: true } },
      { title: "Ngân sách tháng này", value: "85M", subtitle: "/ 100M VND", icon: DollarSign, color: "bg-success" },
      { title: "Active Campaigns", value: 8, icon: Target, color: "bg-info", trend: { value: 3, isPositive: true } },
      { title: "Team Performance", value: "92%", subtitle: "Hiệu suất", icon: BarChart3, color: "bg-amber-500", trend: { value: 5, isPositive: true } },
    ],
    quickActions: [
      { label: "Thêm Team Member", icon: Plus, variant: "default" },
      { label: "Xem Budget Report", icon: DollarSign, variant: "outline" },
      { label: "Team Performance", icon: BarChart3, variant: "outline" },
      { label: "Duyệt Proposals", icon: CheckCircle, variant: "outline" },
    ],
  },
  "Marketing Manager": {
    kpis: [
      { title: "Proposals chờ duyệt", value: 5, icon: Clock, color: "bg-warning" },
      { title: "Active Campaigns", value: 8, icon: Target, color: "bg-primary", trend: { value: 2, isPositive: true } },
      { title: "Ngân sách đã dùng", value: "68%", subtitle: "68M / 100M", icon: DollarSign, color: "bg-info" },
      { title: "Team Tasks", value: "45/52", subtitle: "Tuần này", icon: CheckSquare, color: "bg-success", trend: { value: 12, isPositive: true } },
    ],
    quickActions: [
      { label: "Duyệt Proposals", icon: CheckCircle, variant: "default" },
      { label: "Tạo Campaign mới", icon: Plus, variant: "outline" },
      { label: "Xem Analytics", icon: BarChart3, variant: "outline" },
      { label: "Assign Tasks", icon: Users, variant: "outline" },
    ],
  },
  "Content Creator": {
    kpis: [
      { title: "Task hôm nay", value: 3, icon: CheckSquare, color: "bg-primary" },
      { title: "Nội dung tuần này", value: "12/15", icon: FileText, color: "bg-info", trend: { value: 8, isPositive: true } },
      { title: "Chờ duyệt", value: 4, subtitle: "Contents", icon: Clock, color: "bg-warning" },
      { title: "Điểm của tôi", value: 450, subtitle: "Hạng #2", icon: Trophy, color: "bg-amber-500", trend: { value: 15, isPositive: true } },
    ],
    quickActions: [
      { label: "Tạo Content mới", icon: Plus, variant: "default" },
      { label: "Xem Content Calendar", icon: CalendarIcon, variant: "outline" },
      { label: "My Tasks", icon: CheckSquare, variant: "outline" },
      { label: "Brand Library", icon: FileText, variant: "outline" },
    ],
  },
  "Digital Marketing": {
    kpis: [
      { title: "Active Ads", value: 12, icon: Megaphone, color: "bg-primary", trend: { value: 3, isPositive: true } },
      { title: "Landing Pages", value: 5, subtitle: "Live", icon: Target, color: "bg-info" },
      { title: "Ad Spend", value: "42M", subtitle: "Tháng này", icon: DollarSign, color: "bg-warning" },
      { title: "Conversion Rate", value: "3.8%", icon: TrendingUp, color: "bg-success", trend: { value: 0.5, isPositive: true } },
    ],
    quickActions: [
      { label: "Tạo Campaign mới", icon: Plus, variant: "default" },
      { label: "Xem Analytics", icon: BarChart3, variant: "outline" },
      { label: "Manage Ads", icon: Megaphone, variant: "outline" },
      { label: "Landing Pages", icon: Target, variant: "outline" },
    ],
  },
  "Graphic Designer": {
    kpis: [
      { title: "Design Tasks", value: 5, icon: Palette, color: "bg-primary" },
      { title: "Hoàn thành tuần này", value: 18, icon: CheckCircle, color: "bg-success", trend: { value: 12, isPositive: true } },
      { title: "Chờ feedback", value: 3, subtitle: "Designs", icon: Clock, color: "bg-warning" },
      { title: "Design Points", value: 520, subtitle: "Hạng #1", icon: Trophy, color: "bg-amber-500", trend: { value: 25, isPositive: true } },
    ],
    quickActions: [
      { label: "Upload Design mới", icon: Plus, variant: "default" },
      { label: "Brand Library", icon: Palette, variant: "outline" },
      { label: "My Tasks", icon: CheckSquare, variant: "outline" },
      { label: "Design Requests", icon: ImageIcon, variant: "outline" },
    ],
  },
  "Video Producer": {
    kpis: [
      { title: "Video Projects", value: 4, icon: VideoIcon, color: "bg-primary" },
      { title: "Đang sản xuất", value: 2, subtitle: "Videos", icon: Film, color: "bg-warning" },
      { title: "Hoàn thành tháng này", value: 8, icon: CheckCircle, color: "bg-success", trend: { value: 3, isPositive: true } },
      { title: "Video Points", value: 320, subtitle: "Hạng #4", icon: Trophy, color: "bg-amber-500", trend: { value: 18, isPositive: true } },
    ],
    quickActions: [
      { label: "Tạo Video Project", icon: Plus, variant: "default" },
      { label: "Production Timeline", icon: CalendarIcon, variant: "outline" },
      { label: "My Tasks", icon: CheckSquare, variant: "outline" },
      { label: "Video Assets", icon: Film, variant: "outline" },
    ],
  },
};

// Role-specific upcoming content
const getUpcomingContent = (role: RoleType): UpcomingItem[] => {
  const allContent: Record<RoleType, UpcomingItem[]> = {
    "Content Creator": [
      { date: "Hôm nay", time: "10:00", platform: "Facebook", title: "Post khuyến mãi tẩy trắng răng", status: "ready", assignedTo: "Tôi" },
      { date: "Hôm nay", time: "15:00", platform: "Zalo", title: "Bài viết chăm sóc răng miệng", status: "ready", assignedTo: "Tôi" },
      { date: "Mai", time: "09:00", platform: "TikTok", title: "Video testimonial bệnh nhân", status: "in-production", assignedTo: "Tôi" },
      { date: "Mai", time: "14:00", platform: "Facebook", title: "Giới thiệu dịch vụ niềng răng", status: "review", assignedTo: "Trần Văn B" },
    ],
    "Graphic Designer": [
      { date: "Hôm nay", time: "14:00", platform: "Design", title: "Banner Facebook - Valentine Campaign", status: "in-production", assignedTo: "Tôi" },
      { date: "Mai", time: "10:00", platform: "Design", title: "Social media templates - Tháng 2", status: "review", assignedTo: "Tôi" },
      { date: "Mai", time: "16:00", platform: "Design", title: "Landing page mockup - Niềng răng", status: "ready", assignedTo: "Lê Thị C" },
    ],
    "Video Producer": [
      { date: "Hôm nay", time: "09:00", platform: "Video", title: "Patient testimonial - Implant case", status: "in-production", assignedTo: "Tôi" },
      { date: "Hôm nay", time: "15:00", platform: "Video", title: "Clinic tour video", status: "ready", assignedTo: "Tôi" },
      { date: "Mai", time: "10:00", platform: "TikTok", title: "Behind the scenes - Tẩy trắng răng", status: "in-production", assignedTo: "Nguyễn Văn D" },
    ],
    "Digital Marketing": [
      { date: "Hôm nay", time: "11:00", platform: "Facebook Ads", title: "Valentine Campaign - Launch", status: "ready", assignedTo: "Tôi" },
      { date: "Hôm nay", time: "16:00", platform: "Google Ads", title: "Niềng răng - Keyword optimization", status: "in-production", assignedTo: "Tôi" },
      { date: "Mai", time: "09:00", platform: "Landing Page", title: "A/B test - Valentine offer page", status: "review", assignedTo: "Team" },
    ],
    "Marketing Manager": [
      { date: "Hôm nay", time: "10:00", platform: "Campaign", title: "Valentine Campaign - Review & Launch", status: "review", assignedTo: "Team" },
      { date: "Hôm nay", time: "14:00", platform: "Meeting", title: "Weekly team sync", status: "ready", assignedTo: "All" },
      { date: "Mai", time: "10:00", platform: "Campaign", title: "Q1 Campaign Planning", status: "in-production", assignedTo: "Team" },
    ],
    Admin: [
      { date: "Hôm nay", time: "09:00", platform: "Budget", title: "Monthly budget review meeting", status: "ready", assignedTo: "Finance + Marketing" },
      { date: "Hôm nay", time: "15:00", platform: "Review", title: "Proposal approvals - 5 pending", status: "review", assignedTo: "Management" },
      { date: "Mai", time: "10:00", platform: "Strategy", title: "Q1 Strategy alignment", status: "in-production", assignedTo: "Leadership" },
    ],
  };

  return allContent[role] || allContent["Content Creator"];
};

// Role-specific recent activities
const getRecentActivities = (role: RoleType): ActivityItem[] => {
  const allActivities: Record<RoleType, ActivityItem[]> = {
    "Content Creator": [
      { user: "Bạn", action: "đã hoàn thành", item: "Bài viết Facebook - Khuyến mãi", time: "10 phút trước", type: "success" },
      { user: "Trần Văn B", action: "đã comment trên", item: "Task #456 - Review content", time: "30 phút trước", type: "info" },
      { user: "Marketing Manager", action: "đã approve", item: "Content #789 - Blog post", time: "1 giờ trước", type: "success" },
      { user: "Lê Thị C", action: "đã assign cho bạn", item: "Task #890 - Video script", time: "2 giờ trước", type: "info" },
    ],
    "Graphic Designer": [
      { user: "Bạn", action: "đã upload", item: "Design - Banner Valentine", time: "15 phút trước", type: "success" },
      { user: "Content Creator", action: "đã request", item: "Social media graphics cho campaign mới", time: "45 phút trước", type: "info" },
      { user: "Marketing Manager", action: "đã approve", item: "Design #345 - Landing page", time: "1 giờ trước", type: "success" },
      { user: "Video Producer", action: "đã request", item: "Thumbnail cho video testimonial", time: "3 giờ trước", type: "info" },
    ],
    "Video Producer": [
      { user: "Bạn", action: "đã hoàn thành", item: "Video - Patient testimonial", time: "20 phút trước", type: "success" },
      { user: "Content Creator", action: "đã request", item: "Video cho TikTok campaign", time: "1 giờ trước", type: "info" },
      { user: "Graphic Designer", action: "đã upload", item: "Thumbnail cho video của bạn", time: "2 giờ trước", type: "success" },
      { user: "Marketing Manager", action: "đã approve", item: "Video #234 - Clinic tour", time: "3 giờ trước", type: "success" },
    ],
    "Digital Marketing": [
      { user: "Bạn", action: "đã launch", item: "Facebook Ads - Valentine Campaign", time: "30 phút trước", type: "success" },
      { user: "Bạn", action: "đã optimize", item: "Google Ads - Niềng răng campaign", time: "1 giờ trước", type: "info" },
      { user: "Marketing Manager", action: "đã approve", item: "Ad budget increase request", time: "2 giờ trước", type: "success" },
      { user: "System", action: "alert", item: "Landing page conversion rate dropped 15%", time: "3 giờ trước", type: "warning" },
    ],
    "Marketing Manager": [
      { user: "Bạn", action: "đã approve", item: "Proposal #123 - Valentine Campaign", time: "15 phút trước", type: "success" },
      { user: "Content Creator", action: "đã submit", item: "Proposal #124 - Q1 Content Strategy", time: "1 giờ trước", type: "info" },
      { user: "Digital Marketing", action: "đã báo cáo", item: "Campaign performance - Week 3", time: "2 giờ trước", type: "info" },
      { user: "Graphic Designer", action: "đã hoàn thành", item: "Design request #456", time: "3 giờ trước", type: "success" },
    ],
    Admin: [
      { user: "Marketing Manager", action: "đã submit", item: "Monthly budget report - January", time: "30 phút trước", type: "info" },
      { user: "System", action: "alert", item: "Budget utilization: 85% (target: <90%)", time: "1 giờ trước", type: "success" },
      { user: "HR", action: "đã thêm", item: "New team member: Phạm Văn G - Designer", time: "2 giờ trước", type: "success" },
      { user: "Content Creator", action: "đã request", item: "Budget approval cho influencer partnership", time: "4 giờ trước", type: "info" },
    ],
  };

  return allActivities[role] || allActivities["Content Creator"];
};

// Get role-specific title for upcoming content card
const getUpcomingTitle = (role: RoleType): string => {
  const titles: Record<RoleType, string> = {
    Admin: "Hoạt động sắp tới",
    "Marketing Manager": "Hoạt động sắp tới",
    "Content Creator": "Nội dung sắp đăng",
    "Digital Marketing": "Campaigns sắp tới",
    "Graphic Designer": "Design tasks sắp tới",
    "Video Producer": "Video projects sắp tới",
  };
  return titles[role];
};

const platformColors: Record<string, string> = {
  Facebook: "bg-blue-500",
  Zalo: "bg-blue-600",
  TikTok: "bg-black",
  Instagram: "bg-pink-500",
  Design: "bg-purple-500",
  Video: "bg-red-500",
  "Facebook Ads": "bg-blue-600",
  "Google Ads": "bg-green-500",
  "Landing Page": "bg-indigo-500",
  Campaign: "bg-primary",
  Meeting: "bg-gray-500",
  Budget: "bg-success",
  Review: "bg-warning",
  Strategy: "bg-purple-600",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ready: { label: "Sẵn sàng", variant: "default" },
  "in-production": { label: "Đang thực hiện", variant: "secondary" },
  review: { label: "Đang review", variant: "outline" },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] ?? "User";
  const [selectedRole, setSelectedRole] = useState<RoleType>("Content Creator");

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

  const roleConfig = roleConfigs[selectedRole];
  const upcomingContent = getUpcomingContent(selectedRole);
  const recentActivities = getRecentActivities(selectedRole);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        {/* Role Selector */}
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleConfig.kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            color={kpi.color}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Content */}
        <Card>
          <CardHeader>
            <CardTitle>{getUpcomingTitle(selectedRole)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingContent.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={`${platformColors[item.platform] || "bg-gray-500"} w-2 h-2 rounded-full mt-2`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{item.date}</span>
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.platform}
                      </Badge>
                    </div>
                    <p className="text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={statusLabels[item.status].variant} className="text-xs">
                        {statusLabels[item.status].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.assignedTo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "success"
                        ? "bg-success"
                        : activity.type === "warning"
                        ? "bg-warning"
                        : "bg-info"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
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
                <Button key={index} variant={action.variant} className="gap-2">
                  <Icon className="w-4 h-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
