"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Users,
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  ExternalLink,
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
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<string | null>(null);

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
    super_admin: t.dashboard.roles.admin,
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

  // Role priority for sorting (lower = higher priority)
  const rolePriority: Record<string, number> = {
    super_admin: 0,
    marketing_manager: 1,
    content_creator: 2,
    digital_marketing: 3,
    graphic_designer: 4,
    video_producer: 5,
  };

  // Build team member data from real users + tasks
  const teamMembers = useMemo(() => {
    if (!usersQuery.data || !tasksQuery.data) return [];

    const allTasks = tasksQuery.data.tasks;

    return usersQuery.data
      .map((user) => {
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

        // All tasks for detail view
        const allMemberTasks = memberTasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
        }));

        return {
          id: user.id,
          name: user.name,
          role: roleLabels[user.role] ?? user.role,
          rawRole: user.role, // Keep raw role for sorting
          avatar: user.avatar,
          stats: { total, completed, inProgress, overdue },
          tasks: activeTasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
          })),
          allTasks: allMemberTasks,
        };
      })
      .sort((a, b) => {
        // Sort by role priority first
        const priorityA = rolePriority[a.rawRole] ?? 99;
        const priorityB = rolePriority[b.rawRole] ?? 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        // Secondary sort by name
        return a.name.localeCompare(b.name);
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
            <Card
              key={member.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMemberDetail(member.id)}
            >
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
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/tasks?taskId=${task.id}`);
                          }}
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
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
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

      {/* Member Detail Sheet */}
      <Sheet open={!!selectedMemberDetail} onOpenChange={(open) => !open && setSelectedMemberDetail(null)}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          {(() => {
            const member = teamMembers.find((m) => m.id === selectedMemberDetail);
            if (!member) return null;

            const completionRate =
              member.stats.total > 0
                ? Math.round((member.stats.completed / member.stats.total) * 100)
                : 0;

            return (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={member.avatar ?? ""} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle>{member.name}</SheetTitle>
                      <SheetDescription>{member.role}</SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">{t.common.completed}</p>
                    <p className="text-xl font-bold">
                      {member.stats.completed}/{member.stats.total}
                    </p>
                    <Progress value={completionRate} className="h-1 mt-1" />
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">{t.common.inProgress}</p>
                    <p className="text-xl font-bold">{member.stats.inProgress}</p>
                  </div>
                  {member.stats.overdue > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg col-span-2">
                      <p className="text-xs text-red-600">{t.common.overdue}</p>
                      <p className="text-xl font-bold text-red-600">{member.stats.overdue}</p>
                    </div>
                  )}
                </div>

                {/* All Tasks */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">{t.tasks.team.assignedTasks} ({member.allTasks.length})</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {member.allTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">{t.tasks.noTasks}</p>
                    ) : (
                      member.allTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedMemberDetail(null);
                            router.push(`/tasks?taskId=${task.id}`);
                          }}
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
                            <span className={`font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[task.status] ?? ""} variant="secondary">
                              {statusLabels[task.status] ?? task.status}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* View All Tasks Button */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedMemberDetail(null);
                      router.push(`/tasks?assignee=${member.id}`);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t.common.viewAll}
                  </Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
