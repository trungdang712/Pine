"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { useLanguage } from "@/i18n";

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-700",
};

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
};

export default function TeamTasksPage() {
  const { t } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<string>("all");

  const statusLabels: Record<string, string> = {
    todo: t.tasks.statuses.todo,
    in_progress: t.tasks.statuses.inProgress,
    review: t.tasks.statuses.review,
    done: t.tasks.statuses.done,
  };

  const priorityLabels: Record<string, string> = {
    urgent: t.tasks.priorities.urgent,
    high: t.tasks.priorities.high,
    normal: t.tasks.priorities.medium,
    low: t.tasks.priorities.low,
  };

  const roleLabels: Record<string, string> = {
    admin: t.dashboard.roles.admin,
    marketing_manager: t.dashboard.roles.marketingManager,
    content_creator: t.dashboard.roles.contentCreator,
    digital_marketing: t.dashboard.roles.digitalMarketing,
    graphic_designer: t.dashboard.roles.graphicDesigner,
    video_producer: t.dashboard.roles.videoProducer,
  };

  const usersQuery = trpc.user.getTeamMembers.useQuery();
  const tasksQuery = trpc.task.getAll.useQuery();
  const statsQuery = trpc.task.getTaskStats.useQuery();

  const isLoading = usersQuery.isLoading || tasksQuery.isLoading || statsQuery.isLoading;
  const error = usersQuery.error || tasksQuery.error || statsQuery.error;

  // Build team member data from real users + tasks
  const teamMembers = useMemo(() => {
    if (!usersQuery.data || !tasksQuery.data) return [];

    const allTasks = tasksQuery.data.tasks;

    return usersQuery.data.map((user) => {
      const memberTasks = allTasks.filter(
        (t) => t.assignee?.id === user.id
      );

      const total = memberTasks.length;
      const completed = memberTasks.filter((t) => t.status === "done").length;
      const inProgress = memberTasks.filter((t) => t.status === "in_progress").length;
      const overdue = memberTasks.filter(
        (t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < new Date()
      ).length;

      // Show active tasks (not done)
      const activeTasks = memberTasks
        .filter((t) => t.status !== "done")
        .slice(0, 5);

      return {
        id: user.id,
        name: user.name,
        role: roleLabels[user.role] ?? user.role,
        avatar: user.avatar,
        stats: { total, completed, inProgress, overdue },
        tasks: activeTasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
        })),
      };
    });
  }, [usersQuery.data, tasksQuery.data]);

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) {
    return (
      <PageError
        error={error}
        onRetry={() => {
          void usersQuery.refetch();
          void tasksQuery.refetch();
          void statsQuery.refetch();
        }}
      />
    );
  }

  const totalStats = statsQuery.data ?? { total: 0, completed: 0, inProgress: 0, overdue: 0 };

  const filteredMembers =
    selectedMember === "all"
      ? teamMembers
      : teamMembers.filter((m) => m.id === selectedMember);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.tasks.team.title}</h1>
          <p className="text-muted-foreground">
            {t.tasks.team.subtitle}
          </p>
        </div>
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t.common.all} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.all}</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Overview Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.kpis.teamMembers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <CheckSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.total}</p>
              <p className="text-sm text-muted-foreground">{t.tasks.title}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.completed}</p>
              <p className="text-sm text-muted-foreground">{t.common.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.inProgress}</p>
              <p className="text-sm text-muted-foreground">{t.common.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.overdue}</p>
              <p className="text-sm text-muted-foreground">{t.common.overdue}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Workload */}
      <div className="space-y-6">
        {filteredMembers.map((member) => {
          const completionRate =
            member.stats.total > 0
              ? Math.round((member.stats.completed / member.stats.total) * 100)
              : 0;

          return (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar ?? ""} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t.common.completed}</p>
                      <p className="text-xl font-bold">
                        {member.stats.completed}/{member.stats.total}
                      </p>
                    </div>
                    <div className="w-24">
                      <Progress value={completionRate} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {completionRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {member.stats.inProgress} {t.common.inProgress.toLowerCase()}
                  </Badge>
                  {member.stats.overdue > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {member.stats.overdue} {t.common.overdue.toLowerCase()}
                    </Badge>
                  )}
                </div>

                {/* Current Tasks */}
                <div className="space-y-2">
                  {member.tasks.length > 0 ? (
                    <>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        {t.tasks.team.assignedTasks}:
                      </p>
                      {member.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                task.priority === "urgent"
                                  ? "bg-red-500"
                                  : task.priority === "high"
                                  ? "bg-orange-500"
                                  : task.priority === "normal"
                                  ? "bg-blue-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            <span className="font-medium">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={priorityColors[task.priority] ?? ""}>
                              {priorityLabels[task.priority] ?? task.priority}
                            </Badge>
                            <Badge className={statusColors[task.status] ?? ""}>
                              {statusLabels[task.status] ?? task.status}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {t.tasks.noTasks}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workload Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t.tasks.team.workload}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const workloadPercent =
                member.stats.total > 0
                  ? Math.round(
                      (member.stats.inProgress / member.stats.total) * 100
                    )
                  : 0;
              return (
                <div key={member.id} className="flex items-center gap-4">
                  <div className="w-32 truncate">{member.name}</div>
                  <div className="flex-1">
                    <Progress
                      value={workloadPercent}
                      className={`h-3 ${
                        workloadPercent > 80 ? "[&>div]:bg-red-500" : ""
                      }`}
                    />
                  </div>
                  <div className="w-16 text-right text-sm">
                    {member.stats.inProgress} tasks
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
