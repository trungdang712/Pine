"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  CheckSquare,
  Lightbulb,
  Inbox,
  FolderOpen,
  Trophy,
  Target,
  Settings,
  DollarSign,
  Users,
  TrendingUp,
  Palette,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    name: "Marketing Analytics",
    href: "/analytics",
    icon: BarChart3,
    children: [
      { name: "Campaigns", href: "/analytics/campaigns" },
      { name: "Post Performance", href: "/analytics/posts" },
      { name: "Landing Pages", href: "/analytics/landing-pages" },
      { name: "Budget", href: "/analytics/budget" },
    ],
  },
  { name: "Content Calendar", href: "/calendar", icon: Calendar },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    children: [
      { name: "My Tasks", href: "/tasks" },
      { name: "Team Tasks", href: "/tasks/team" },
      { name: "Task Requests", href: "/tasks/requests" },
    ],
  },
  {
    name: "Proposals",
    href: "/proposals",
    icon: Lightbulb,
    children: [
      { name: "My Proposals", href: "/proposals" },
      { name: "Pending Approval", href: "/proposals/pending" },
      { name: "Innovation Ideas", href: "/proposals/ideas" },
    ],
  },
  {
    name: "Inbox",
    href: "/inbox",
    icon: Inbox,
    children: [
      { name: "Content Opportunities", href: "/inbox/opportunities" },
      { name: "Task Requests", href: "/inbox/requests" },
    ],
  },
  {
    name: "Library",
    href: "/library",
    icon: FolderOpen,
    children: [
      { name: "Brand Library", href: "/library/brand" },
      { name: "Asset Library", href: "/library/assets" },
    ],
  },
  {
    name: "Performance",
    href: "/performance",
    icon: Target,
    children: [
      { name: "My Performance", href: "/performance" },
      { name: "Team Performance", href: "/performance/team" },
    ],
  },
  {
    name: "Gamification",
    href: "/gamification",
    icon: Trophy,
    children: [
      { name: "Leaderboard", href: "/gamification" },
      { name: "Achievements", href: "/gamification/achievements" },
      { name: "Rewards", href: "/gamification/rewards" },
    ],
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <img
          src="https://adbfuurtaoyutukczfdm.supabase.co/storage/v1/object/public/assets/logos/original/Greenfield-original.png"
          alt="Greenfield Dental"
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.children && item.children.some((c) => pathname === c.href));

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-teal-600" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>

              {/* Submenu */}
              {item.children && isActive && (
                <div className="ml-10 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "block rounded-md px-3 py-1.5 text-sm transition-colors",
                        pathname === child.href
                          ? "bg-teal-100 text-teal-800"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">User Name</p>
            <p className="truncate text-xs text-gray-500">Marketing Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
