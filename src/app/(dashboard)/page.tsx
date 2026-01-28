"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Clock,
  Calendar,
  Trophy,
  Plus,
  ArrowRight,
  FileText,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "User";

  // Fetch dashboard data
  const { data: taskStats } = trpc.task.getTaskStats.useQuery({
    userId: session?.user?.id,
  });

  const { data: myPoints } = trpc.gamification.getMyPoints.useQuery();

  const { data: upcomingContent } = trpc.calendar.getUpcoming.useQuery({
    days: 7,
  });

  const { data: myTasks } = trpc.task.getMyTasks.useQuery({
    status: undefined,
  });

  const todayTasks = myTasks?.filter(
    (task) =>
      task.status !== "done" &&
      task.dueDate &&
      new Date(task.dueDate).toDateString() === new Date().toDateString()
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {firstName}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
          <Link href="/proposals/new">
            <Button variant="outline">
              <Lightbulb className="h-4 w-4 mr-2" />
              New Proposal
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Tasks Due Today"
          value={todayTasks?.length ?? 0}
          subtitle={`${taskStats?.completed ?? 0} completed this week`}
          icon={<CheckSquare className="h-5 w-5" />}
        />
        <KPICard
          title="In Progress"
          value={taskStats?.inProgress ?? 0}
          subtitle={`${taskStats?.overdue ?? 0} overdue`}
          icon={<Clock className="h-5 w-5" />}
          className={taskStats?.overdue ? "border-destructive/50" : ""}
        />
        <KPICard
          title="This Week's Content"
          value={upcomingContent?.length ?? 0}
          subtitle="scheduled posts"
          icon={<Calendar className="h-5 w-5" />}
        />
        <KPICard
          title="My Points"
          value={myPoints?.points.totalPoints ?? 0}
          subtitle={`Rank #${myPoints?.points.level ?? 1}`}
          icon={<Trophy className="h-5 w-5" />}
          trend={
            myPoints?.points.weeklyPoints
              ? { value: myPoints.points.weeklyPoints, label: "this week" }
              : undefined
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Content</CardTitle>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">
                View Calendar
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingContent && upcomingContent.length > 0 ? (
              <div className="space-y-4">
                {upcomingContent.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          item.platform === "facebook"
                            ? "bg-info"
                            : item.platform === "instagram"
                            ? "bg-pink-500"
                            : item.platform === "zalo"
                            ? "bg-blue-400"
                            : item.platform === "tiktok"
                            ? "bg-foreground"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.scheduledAt &&
                            new Date(item.scheduledAt).toLocaleDateString("vi-VN", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.status === "approved"
                          ? "success"
                          : item.status === "scheduled"
                          ? "info"
                          : "secondary"
                      }
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No upcoming content scheduled
              </p>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Tasks</CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {myTasks && myTasks.length > 0 ? (
              <div className="space-y-4">
                {myTasks
                  .filter((t) => t.status !== "done")
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            task.priority === "urgent"
                              ? "bg-destructive"
                              : task.priority === "high"
                              ? "bg-warning"
                              : task.priority === "normal"
                              ? "bg-info"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.dueDate
                              ? `Due ${formatRelativeTime(task.dueDate)}`
                              : "No due date"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          task.status === "in_progress"
                            ? "info"
                            : task.status === "review"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending tasks
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Points Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Points</CardTitle>
            <Link href="/gamification">
              <Button variant="ghost" size="sm">
                View Leaderboard
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {myPoints?.recentTransactions &&
            myPoints.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {myPoints.recentTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(transaction.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        transaction.points > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {transaction.points > 0 ? "+" : ""}
                      {transaction.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent point activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/tasks/new">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                >
                  <CheckSquare className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Create Task</p>
                    <p className="text-xs text-muted-foreground">Add new task</p>
                  </div>
                </Button>
              </Link>
              <Link href="/proposals/new">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Submit Proposal</p>
                    <p className="text-xs text-muted-foreground">New proposal</p>
                  </div>
                </Button>
              </Link>
              <Link href="/calendar">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Content Calendar</p>
                    <p className="text-xs text-muted-foreground">Schedule content</p>
                  </div>
                </Button>
              </Link>
              <Link href="/proposals/ideas">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                >
                  <Lightbulb className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Innovation Idea</p>
                    <p className="text-xs text-muted-foreground">Submit idea</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
