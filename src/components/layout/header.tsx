"use client";

import { Bell, Search, User, LogOut, Settings, Menu, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/components/ui/sidebar";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function Header() {
  const { profile, signOut, isAuthenticated } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar();
  const utils = trpc.useUtils();

  const userName = profile?.name ?? "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Fetch real notification data
  const { data: unreadCount = 0 } = trpc.alerts.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: isAuthenticated,
  });

  const { data: recentAlerts = [] } = trpc.alerts.getMyAlerts.useQuery(
    { limit: 5 },
    {
      refetchInterval: 30000,
      enabled: isAuthenticated,
    }
  );

  const markAsRead = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => {
      utils.alerts.getUnreadCount.invalidate();
      utils.alerts.getMyAlerts.invalidate();
    },
  });

  const markAllAsRead = trpc.alerts.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.alerts.getUnreadCount.invalidate();
      utils.alerts.getMyAlerts.invalidate();
    },
  });

  const handleAlertClick = (alertId: string, link: string | null, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate({ alertId });
    }
    if (link) {
      window.location.href = link;
    }
  };

  const formatAlertTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch {
      return "";
    }
  };

  return (
    <header className="border-b bg-card sticky top-0 z-10">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Thông báo
                {unreadCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{unreadCount} mới</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs"
                      onClick={() => markAllAsRead.mutate()}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Đánh dấu đã đọc
                    </Button>
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {recentAlerts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Không có thông báo
                  </div>
                ) : (
                  recentAlerts.map((alert) => (
                    <DropdownMenuItem
                      key={alert.id}
                      className={`flex flex-col items-start p-3 cursor-pointer ${
                        !alert.isRead ? "bg-accent/50" : ""
                      }`}
                      onClick={() => handleAlertClick(alert.id, alert.link, alert.isRead)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        {!alert.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        )}
                        <div className={!alert.isRead ? "" : "ml-4"}>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {alert.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatAlertTime(alert.createdAt)}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-center justify-center text-primary">
                <Link href="/notifications">Xem tất cả</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar ?? ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{profile?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {profile?.email}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      {profile?.role?.replace(/_/g, ' ')} • {profile?.team}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="w-4 h-4 mr-2" />
                    Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Cài đặt thông báo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
