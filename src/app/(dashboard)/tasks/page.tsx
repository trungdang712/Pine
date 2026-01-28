"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, MessageSquare, Paperclip, GripVertical } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityLabels: Record<string, string> = {
  urgent: "Khẩn cấp",
  high: "Cao",
  normal: "Bình thường",
  low: "Thấp",
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-blue-500",
  low: "bg-gray-400",
};

const statusLabels: Record<string, string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  review: "Chờ review",
  done: "Hoàn thành",
};

type TaskType = {
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

interface SortableTaskCardProps {
  task: TaskType;
  onOpenDetail: (task: TaskType) => void;
}

function SortableTaskCard({ task, onOpenDetail }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          isOverdue ? "border-red-200" : ""
        }`}
        onClick={() => onOpenDetail(task)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing mt-1"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              {/* Priority indicator and category */}
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    task.priority === "urgent"
                      ? "border-red-500 text-red-500"
                      : task.priority === "high"
                      ? "border-orange-500 text-orange-500"
                      : ""
                  }`}
                >
                  {priorityLabels[task.priority]}
                </Badge>
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
                        isOverdue ? "text-red-600 font-medium" : ""
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskCard({ task }: { task: TaskType }) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isOverdue ? "border-red-200" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge
            variant="outline"
            className={`text-xs ${
              task.priority === "urgent"
                ? "border-red-500 text-red-500"
                : task.priority === "high"
                ? "border-orange-500 text-orange-500"
                : ""
            }`}
          >
            {priorityLabels[task.priority]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {task.category}
          </Badge>
        </div>

        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>

        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? "text-red-600 font-medium" : ""
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

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

  const { data: kanbanData, isLoading } = trpc.task.getKanbanBoard.useQuery({
    category: undefined,
    assigneeId: undefined,
  });

  const utils = trpc.useUtils();
  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.getKanbanBoard.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const allTasks = kanbanData
      ? [
          ...kanbanData.todo,
          ...kanbanData.in_progress,
          ...kanbanData.review,
          ...kanbanData.done,
        ]
      : [];
    const task = allTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const columns = ["todo", "in_progress", "review", "done"];
    if (columns.includes(overId)) {
      // Update the task status
      updateTaskMutation.mutate({
        id: activeId,
        status: overId as "todo" | "in_progress" | "review" | "done",
      });
    }
  };

  const openTaskDetail = (task: TaskType) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const columnConfig = [
    { id: "todo", label: "Cần làm", color: "bg-gray-500" },
    { id: "in_progress", label: "Đang làm", color: "bg-blue-500" },
    { id: "review", label: "Chờ review", color: "bg-yellow-500" },
    { id: "done", label: "Hoàn thành", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500">Quản lý công việc và phân công</p>
        </div>
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Task mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo Task mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo task mới cho team
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input id="title" placeholder="Nhập tiêu đề task..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết công việc..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Độ ưu tiên</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="normal">Bình thường</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Danh mục</Label>
                  <Select defaultValue="content">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="ads">Ads</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Deadline</Label>
                <Input id="dueDate" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => setIsNewTaskOpen(false)}>Tạo Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="todo">Cần làm</SelectItem>
            <SelectItem value="in_progress">Đang làm</SelectItem>
            <SelectItem value="review">Chờ review</SelectItem>
            <SelectItem value="done">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter ?? "all"}
          onValueChange={(v) => setPriorityFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tất cả độ ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
            <SelectItem value="urgent">Khẩn cấp</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="normal">Bình thường</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {columnConfig.map((column) => {
              const tasks = kanbanData?.[column.id as keyof typeof kanbanData] ?? [];
              const taskIds = tasks.map((t) => t.id);

              return (
                <div key={column.id} className="space-y-4" id={column.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${column.color}`} />
                      <h3 className="font-semibold text-gray-700">
                        {column.label}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        {tasks.length}
                      </Badge>
                    </div>
                  </div>
                  <div
                    className="space-y-3 min-h-[200px] p-2 rounded-lg bg-muted/30"
                    data-column={column.id}
                  >
                    <SortableContext
                      items={taskIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {tasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onOpenDetail={openTaskDetail}
                        />
                      ))}
                    </SortableContext>
                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Kéo thả task vào đây
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      selectedTask.priority === "urgent"
                        ? "border-red-500 text-red-500"
                        : selectedTask.priority === "high"
                        ? "border-orange-500 text-orange-500"
                        : ""
                    }`}
                  >
                    {priorityLabels[selectedTask.priority]}
                  </Badge>
                  <Badge variant="secondary">{selectedTask.category}</Badge>
                  <Badge variant="outline">
                    {statusLabels[selectedTask.status]}
                  </Badge>
                </div>
                <DialogTitle className="text-xl mt-2">
                  {selectedTask.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedTask.description && (
                  <div>
                    <Label className="text-muted-foreground">Mô tả</Label>
                    <p className="mt-1">{selectedTask.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Deadline</Label>
                    <p className="mt-1">
                      {selectedTask.dueDate
                        ? new Date(selectedTask.dueDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Không có"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Người thực hiện</Label>
                    <div className="mt-1 flex items-center gap-2">
                      {selectedTask.assignee ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={selectedTask.assignee.avatar ?? ""}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(selectedTask.assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedTask.assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Chưa phân công
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {selectedTask._count.comments} bình luận
                  </span>
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-4 w-4" />
                    {selectedTask._count.attachments} tệp đính kèm
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Đóng
                </Button>
                <Button>Cập nhật</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
