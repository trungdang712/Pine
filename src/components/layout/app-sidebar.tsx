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

const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/",
  },
  {
    title: "Marketing Analytics",
    icon: BarChart3,
    items: [
      { title: "Campaigns", icon: TrendingUp, url: "/analytics/campaigns" },
      { title: "Post Performance", icon: FileText, url: "/analytics/posts" },
      { title: "Landing Pages", icon: FileText, url: "/analytics/landing" },
      { title: "Budget", icon: DollarSign, url: "/analytics/budget" },
    ],
  },
  {
    title: "Social Listening",
    icon: Ear,
    url: "/social-listening",
  },
  {
    title: "Content Calendar",
    icon: Calendar,
    url: "/calendar",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    items: [
      { title: "My Tasks", icon: ListChecks, url: "/tasks" },
      { title: "Team Tasks", icon: Users, url: "/tasks/team" },
    ],
  },
  {
    title: "Proposals",
    icon: Lightbulb,
    items: [
      { title: "My Proposals", icon: FileText, url: "/proposals" },
      { title: "Pending Approval", icon: ListChecks, url: "/proposals/pending" },
      { title: "Innovation Ideas", icon: Lightbulb, url: "/proposals/ideas" },
    ],
  },
  {
    title: "Inbox",
    icon: Inbox,
    url: "/inbox",
  },
  {
    title: "Library",
    icon: FolderOpen,
    items: [
      { title: "Brand Library", icon: Palette, url: "/library/brand" },
      { title: "Asset Library", icon: FolderOpen, url: "/library/assets" },
    ],
  },
  {
    title: "Performance",
    icon: Award,
    items: [
      { title: "My Performance", icon: Award, url: "/performance" },
      { title: "Team Performance", icon: Users, url: "/performance/team" },
      { title: "Leaderboard", icon: Trophy, url: "/gamification" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg mb-2 px-2 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  GF
                </span>
              </div>
              <span className="font-semibold text-sidebar-foreground">
                Greenfield Dental
              </span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) =>
                item.items ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={isGroupActive(item.items)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isItemActive(subItem.url)}
                              >
                                <Link href={subItem.url}>
                                  <subItem.icon className="w-4 h-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isItemActive(item.url)}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
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
