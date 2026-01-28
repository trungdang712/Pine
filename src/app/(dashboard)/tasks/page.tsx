"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, MessageSquare, Paperclip } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime, getInitials } from "@/lib/utils";

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-blue-500",
  low: "bg-gray-400",
};

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  const { data: kanbanData, isLoading } = trpc.task.getKanbanBoard.useQuery({
    category: undefined,
    assigneeId: undefined,
  });

  const allTasks = kanbanData
    ? [
        ...kanbanData.todo,
        ...kanbanData.in_progress,
        ...kanbanData.review,
        ...kanbanData.done,
      ]
    : [];

  const filteredTasks = allTasks.filter((task) => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500">Manage your tasks and assignments</p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter ?? "all"}
          onValueChange={(v) => setPriorityFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* To Do Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">
                To Do ({kanbanData?.todo.length ?? 0})
              </h3>
            </div>
            <div className="space-y-3">
              {kanbanData?.todo.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">
                In Progress ({kanbanData?.in_progress.length ?? 0})
              </h3>
            </div>
            <div className="space-y-3">
              {kanbanData?.in_progress.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Review Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">
                Review ({kanbanData?.review.length ?? 0})
              </h3>
            </div>
            <div className="space-y-3">
              {kanbanData?.review.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">
                Done ({kanbanData?.done.length ?? 0})
              </h3>
            </div>
            <div className="space-y-3">
              {kanbanData?.done.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    category: string;
    dueDate: Date | null;
    assignee: { id: string; name: string; avatar: string | null } | null;
    _count: { comments: number; attachments: number };
  };
}

function TaskCard({ task }: TaskCardProps) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? "border-red-200" : ""}`}>
      <CardContent className="p-4">
        {/* Priority indicator */}
        <div className="flex items-start justify-between mb-2">
          <div
            className={`h-2 w-2 rounded-full ${priorityColors[task.priority]}`}
          />
          <Badge variant="secondary" className="text-xs">
            {task.category}
          </Badge>
        </div>

        {/* Title */}
        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? "text-red-600" : ""
                }`}
              >
                <Calendar className="h-3 w-3" />
                {formatRelativeTime(task.dueDate)}
              </span>
            )}
            {task._count.comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task._count.comments}
              </span>
            )}
            {task._count.attachments > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {task._count.attachments}
              </span>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar ?? ""} />
              <AvatarFallback className="text-xs">
                {getInitials(task.assignee.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
