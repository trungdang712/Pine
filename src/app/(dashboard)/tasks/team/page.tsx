"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
  }[];
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    role: "Content Creator",
    avatar: null,
    stats: { total: 12, completed: 8, inProgress: 3, overdue: 1 },
    tasks: [
      { id: "t1", title: "Viết bài SEO dịch vụ niềng răng", status: "in_progress", priority: "high", dueDate: "2024-01-15" },
      { id: "t2", title: "Content plan tháng 2", status: "in_progress", priority: "normal", dueDate: "2024-01-20" },
      { id: "t3", title: "Review caption social media", status: "todo", priority: "low", dueDate: "2024-01-18" },
    ],
  },
  {
    id: "2",
    name: "Trần Thị B",
    role: "Graphic Designer",
    avatar: null,
    stats: { total: 15, completed: 12, inProgress: 2, overdue: 1 },
    tasks: [
      { id: "t4", title: "Thiết kế banner Tết", status: "in_progress", priority: "urgent", dueDate: "2024-01-12" },
      { id: "t5", title: "Social media templates Q1", status: "in_progress", priority: "high", dueDate: "2024-01-25" },
    ],
  },
  {
    id: "3",
    name: "Lê Văn C",
    role: "Video Producer",
    avatar: null,
    stats: { total: 8, completed: 5, inProgress: 3, overdue: 0 },
    tasks: [
      { id: "t6", title: "Video testimonial khách hàng", status: "in_progress", priority: "high", dueDate: "2024-01-18" },
      { id: "t7", title: "Clinic tour video", status: "in_progress", priority: "normal", dueDate: "2024-01-22" },
      { id: "t8", title: "Edit video procedure", status: "todo", priority: "normal", dueDate: "2024-01-25" },
    ],
  },
  {
    id: "4",
    name: "Phạm Thị D",
    role: "Digital Marketing",
    avatar: null,
    stats: { total: 10, completed: 7, inProgress: 2, overdue: 1 },
    tasks: [
      { id: "t9", title: "Setup Google Ads campaign", status: "in_progress", priority: "urgent", dueDate: "2024-01-14" },
      { id: "t10", title: "Phân tích Facebook Ads Q4", status: "todo", priority: "high", dueDate: "2024-01-16" },
    ],
  },
];

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

const statusLabels: Record<string, string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  review: "Chờ review",
  done: "Hoàn thành",
};

const priorityLabels: Record<string, string> = {
  urgent: "Khẩn cấp",
  high: "Cao",
  normal: "Bình thường",
  low: "Thấp",
};

export default function TeamTasksPage() {
  const [selectedMember, setSelectedMember] = useState<string>("all");

  const totalStats = teamMembers.reduce(
    (acc, member) => ({
      total: acc.total + member.stats.total,
      completed: acc.completed + member.stats.completed,
      inProgress: acc.inProgress + member.stats.inProgress,
      overdue: acc.overdue + member.stats.overdue,
    }),
    { total: 0, completed: 0, inProgress: 0, overdue: 0 }
  );

  const filteredMembers =
    selectedMember === "all"
      ? teamMembers
      : teamMembers.filter((m) => m.id === selectedMember);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Tasks</h1>
          <p className="text-muted-foreground">
            Tổng quan workload và tasks của team
          </p>
        </div>
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả thành viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thành viên</SelectItem>
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
              <p className="text-sm text-muted-foreground">Thành viên</p>
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
              <p className="text-sm text-muted-foreground">Tổng tasks</p>
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
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
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
              <p className="text-sm text-muted-foreground">Đang làm</p>
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
              <p className="text-sm text-muted-foreground">Quá hạn</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Workload */}
      <div className="space-y-6">
        {filteredMembers.map((member) => {
          const completionRate = Math.round(
            (member.stats.completed / member.stats.total) * 100
          );

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
                      <p className="text-sm text-muted-foreground">Hoàn thành</p>
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
                    {member.stats.inProgress} đang làm
                  </Badge>
                  {member.stats.overdue > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {member.stats.overdue} quá hạn
                    </Badge>
                  )}
                </div>

                {/* Current Tasks */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Tasks đang thực hiện:
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
                        <Badge className={priorityColors[task.priority]}>
                          {priorityLabels[task.priority]}
                        </Badge>
                        <Badge className={statusColors[task.status]}>
                          {statusLabels[task.status]}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workload Distribution Chart (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const workloadPercent = Math.round(
                (member.stats.inProgress / (member.stats.total || 1)) * 100
              );
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
