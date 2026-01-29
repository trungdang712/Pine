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
import { useRealtimeAlerts } from "@/hooks/use-realtime-alerts";
import { useSidebar } from "@/components/ui/sidebar";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi as viLocale, enUS } from "date-fns/locale";
import { useLanguage } from "@/i18n";

export function Header() {
  const { profile, signOut, isAuthenticated, isDemoMode } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar();
  const utils = trpc.useUtils();
  const { t, language } = useLanguage();

  // Subscribe to realtime alerts via Supabase Realtime
  // This handles instant notifications; polling below is a fallback
  useRealtimeAlerts({
    userId: profile?.id,
    isDemoMode,
  });

  // Use first name for display, fallback to full name, then empty string
  const fullName = profile?.name ?? "";
  const firstName = fullName.split(" ")[0] || fullName;
  const userInitials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const dateLocale = language === "vi" ? viLocale : enUS;

  // Fetch real notification data (polling as fallback, realtime handles instant updates)
  const { data: unreadCount = 0 } = trpc.alerts.getUnreadCount.useQuery(undefined, {
    refetchInterval: 60000, // Fallback poll every 60 seconds (realtime handles instant updates)
    enabled: isAuthenticated,
  });

  const { data: recentAlerts = [] } = trpc.alerts.getMyAlerts.useQuery(
    { limit: 5 },
    {
      refetchInterval: 60000, // Fallback poll every 60 seconds
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
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: dateLocale });
    } catch {
      return "";
    }
  };

  return (
    <header className="border-b bg-card sticky top-0 z-10">
      <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 px-3 sm:px-6">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search Bar - hidden on very small screens, compact on mobile */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.header.search}
              className="pl-10 bg-background"
            />
          </div>
        </div>
        {/* Spacer for mobile when search is hidden */}
        <div className="flex-1 sm:hidden" />

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
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
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm">
              <DropdownMenuLabel className="flex items-center justify-between">
                {t.header.notifications}
                {unreadCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{unreadCount} {t.header.newCount}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs"
                      onClick={() => markAllAsRead.mutate()}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      {t.header.markAllRead}
                    </Button>
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {recentAlerts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {t.header.noNotifications}
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
                <Link href="/notifications">{t.header.viewAll}</Link>
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
                  <span className="hidden md:inline">{firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t.header.myAccount}</DropdownMenuLabel>
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
                    {t.header.profile}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    {t.header.notificationSettings}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.header.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
