"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Calendar,
  CheckSquare,
  Lightbulb,
  Inbox,
  FolderOpen,
  Award,
  Trophy,
  Settings,
  ChevronDown,
  TrendingUp,
  FileText,
  DollarSign,
  ListChecks,
  Users,
  Palette,
  Ear,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLanguage } from "@/i18n";
import type { LucideIcon } from "lucide-react";

interface NavSubItem {
  titleKey: string;
  icon: LucideIcon;
  url: string;
}

interface NavItem {
  titleKey: string;
  icon: LucideIcon;
  url?: string;
  items?: NavSubItem[];
}

const getNavigationItems = (): NavItem[] => [
  {
    titleKey: "dashboard",
    icon: Home,
    url: "/",
  },
  {
    titleKey: "analytics",
    icon: BarChart3,
    items: [
      { titleKey: "campaigns", icon: TrendingUp, url: "/analytics/campaigns" },
      { titleKey: "postPerformance", icon: FileText, url: "/analytics/posts" },
      { titleKey: "landingPages", icon: FileText, url: "/analytics/landing" },
      { titleKey: "budget", icon: DollarSign, url: "/analytics/budget" },
    ],
  },
  {
    titleKey: "socialListening",
    icon: Ear,
    url: "/social-listening",
  },
  {
    titleKey: "contentCalendar",
    icon: Calendar,
    url: "/calendar",
  },
  {
    titleKey: "tasks",
    icon: CheckSquare,
    items: [
      { titleKey: "myTasks", icon: ListChecks, url: "/tasks" },
      { titleKey: "teamTasks", icon: Users, url: "/tasks/team" },
    ],
  },
  {
    titleKey: "proposals",
    icon: Lightbulb,
    items: [
      { titleKey: "myProposals", icon: FileText, url: "/proposals" },
      { titleKey: "pendingApproval", icon: ListChecks, url: "/proposals/pending" },
      { titleKey: "innovationIdeas", icon: Lightbulb, url: "/proposals/ideas" },
    ],
  },
  {
    titleKey: "inbox",
    icon: Inbox,
    url: "/inbox",
  },
  {
    titleKey: "library",
    icon: FolderOpen,
    items: [
      { titleKey: "brandLibrary", icon: Palette, url: "/library/brand" },
      { titleKey: "assetLibrary", icon: FolderOpen, url: "/library/assets" },
    ],
  },
  {
    titleKey: "performance",
    icon: Award,
    items: [
      { titleKey: "myPerformance", icon: Award, url: "/performance" },
      { titleKey: "teamPerformance", icon: Users, url: "/performance/team" },
      { titleKey: "leaderboard", icon: Trophy, url: "/gamification" },
    ],
  },
  {
    titleKey: "settings",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const navigationItems = getNavigationItems();

  const isItemActive = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(url);
  };

  const isGroupActive = (
    items: Array<{ url: string }> | undefined,
    url?: string
  ) => {
    if (url && isItemActive(url)) return true;
    if (items) {
      return items.some((item) => isItemActive(item.url));
    }
    return false;
  };

  const getNavTitle = (key: string): string => {
    return (t.nav as Record<string, string>)[key] || key;
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg mb-2 px-2 py-4">
            <div className="flex items-center gap-2">
              <img
                src="https://adbfuurtaoyutukczfdm.supabase.co/storage/v1/object/public/assets/logos/original/Greenfield-original.png"
                alt="Greenfield Dental"
                className="h-8 w-auto"
              />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) =>
                item.items ? (
                  <Collapsible
                    key={item.titleKey}
                    defaultOpen={isGroupActive(item.items)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="w-4 h-4" />
                          <span>{getNavTitle(item.titleKey)}</span>
                          <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.titleKey}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isItemActive(subItem.url)}
                              >
                                <Link href={subItem.url}>
                                  <subItem.icon className="w-4 h-4" />
                                  <span>{getNavTitle(subItem.titleKey)}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isItemActive(item.url!)}
                    >
                      <Link href={item.url!}>
                        <item.icon className="w-4 h-4" />
                        <span>{getNavTitle(item.titleKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
