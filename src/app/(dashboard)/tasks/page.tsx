"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Calendar,
  MessageSquare,
  Paperclip,
  GripVertical,
  Filter,
  X,
  Send,
  Download,
  FileText,
  Image as ImageIcon,
  User,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";
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

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

const mockComments: Comment[] = [
  { id: "c1", user: "Nguyễn Văn A", text: "Đã upload file tham khảo vào attachments", timestamp: "2 giờ trước" },
  { id: "c2", user: "Trần Văn B", text: "Cần thêm thông tin về màu sắc và phong cách", timestamp: "1 giờ trước" },
  { id: "c3", user: "Lê Thị C", text: "Đã cập nhật brief, mọi người check lại nhé", timestamp: "30 phút trước" },
];

interface SortableTaskCardProps {
  task: TaskType;
  onOpenDetail: (task: TaskType) => void;
}

function SortableTaskCard({ task, onOpenDetail }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? "border-red-200" : ""}`}
        onClick={() => onOpenDetail(task)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    task.priority === "urgent"
                      ? "bg-destructive/10 text-destructive"
                      : task.priority === "high"
                      ? "bg-orange-100 text-orange-700"
                      : task.priority === "normal"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {task.priority === "urgent" ? "🔴 " : task.priority === "high" ? "🟠 " : task.priority === "normal" ? "🟡 " : "🔵 "}
                  {priorityLabels[task.priority]}
                </Badge>
              </div>

              <h4 className="font-medium mb-1">{task.title}</h4>

              {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}

              {task.category && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {task.category}
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-3">
                  {task.assignee && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{task.assignee.name.split(" ").pop()}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : ""}`}>
                      <Calendar className="h-3 w-3" />
                      {formatRelativeTime(task.dueDate)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {task._count.attachments > 0 && (
                    <span className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      {task._count.attachments}
                    </span>
                  )}
                  {task._count.comments > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {task._count.comments}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskCard({ task }: { task: TaskType }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? "border-red-200" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge
            variant="secondary"
            className={`text-xs ${
              task.priority === "urgent"
                ? "bg-destructive/10 text-destructive"
                : task.priority === "high"
                ? "bg-orange-100 text-orange-700"
                : task.priority === "normal"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {task.priority === "urgent" ? "🔴 " : task.priority === "high" ? "🟠 " : task.priority === "normal" ? "🟡 " : "🔵 "}
            {priorityLabels[task.priority]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {task.category}
          </Badge>
        </div>

        <h4 className="font-medium mb-2">{task.title}</h4>

        {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : ""}`}>
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
              <AvatarFallback className="text-xs">{getInitials(task.assignee.name)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterTags, setFilterTags] = useState<string>("all");
  const [newComment, setNewComment] = useState("");

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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const allTasks = kanbanData
      ? [...kanbanData.todo, ...kanbanData.in_progress, ...kanbanData.review, ...kanbanData.done]
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

    const columns = ["todo", "in_progress", "review", "done"];
    if (columns.includes(overId)) {
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
    { id: "todo", label: "TO DO", color: "bg-gray-500" },
    { id: "in_progress", label: "IN PROGRESS", color: "bg-blue-500" },
    { id: "review", label: "REVIEW", color: "bg-yellow-500" },
    { id: "done", label: "DONE", color: "bg-green-500" },
  ];

  const allTasks = kanbanData
    ? [...kanbanData.todo, ...kanbanData.in_progress, ...kanbanData.review, ...kanbanData.done]
    : [];

  const todoCount = kanbanData?.todo.length ?? 0;
  const inProgressCount = kanbanData?.in_progress.length ?? 0;
  const reviewCount = kanbanData?.review.length ?? 0;
  const doneCount = kanbanData?.done.length ?? 0;
  const totalCount = todoCount + inProgressCount + reviewCount + doneCount;

  const uniqueAssignees = Array.from(new Set(allTasks.filter((t) => t.assignee).map((t) => t.assignee!.name)));
  const uniqueCategories = Array.from(new Set(allTasks.map((t) => t.category)));

  const activeFiltersCount = [filterAssignee, filterPriority, filterTags].filter((f) => f !== "all").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">My Tasks</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi công việc</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <Button className="gap-2" onClick={() => setIsNewTaskOpen(true)}>
            <Plus className="w-4 h-4" />
            Tạo Task mới
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-semibold">{totalCount}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold">{inProgressCount}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-semibold">{reviewCount}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold">{doneCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm mb-2 block">Assignee</Label>
                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {uniqueAssignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm mb-2 block">Priority</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="urgent">🔴 Khẩn cấp</SelectItem>
                    <SelectItem value="high">🟠 Cao</SelectItem>
                    <SelectItem value="normal">🟡 Bình thường</SelectItem>
                    <SelectItem value="low">🔵 Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm mb-2 block">Category</Label>
                <Select value={filterTags} onValueChange={setFilterTags}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterAssignee("all");
                    setFilterPriority("all");
                    setFilterTags("all");
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Kanban / List */}
      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {columnConfig.map((column) => {
                  const tasks = (kanbanData?.[column.id as keyof typeof kanbanData] ?? []) as TaskType[];
                  const taskIds = tasks.map((t: TaskType) => t.id);

                  return (
                    <div key={column.id} className="flex-1 min-w-[280px]">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{column.label}</span>
                            <Badge variant="secondary">{tasks.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                              {tasks.map((task) => (
                                <SortableTaskCard key={task.id} task={task} onOpenDetail={openTaskDetail} />
                              ))}
                            </div>
                          </SortableContext>
                          {tasks.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">Không có task nào</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              <DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {allTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border-b last:border-0 pb-3 last:pb-0 cursor-pointer"
                    onClick={() => openTaskDetail(task)}
                  >
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                <DialogDescription>Task ID: #{selectedTask.id.slice(0, 8)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Task Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Select defaultValue={selectedTask.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">TO DO</SelectItem>
                          <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                          <SelectItem value="review">REVIEW</SelectItem>
                          <SelectItem value="done">DONE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Priority</Label>
                    <div className="mt-1">
                      <Select defaultValue={selectedTask.priority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">🔴 Khẩn cấp</SelectItem>
                          <SelectItem value="high">🟠 Cao</SelectItem>
                          <SelectItem value="normal">🟡 Bình thường</SelectItem>
                          <SelectItem value="low">🔵 Thấp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Assignee</Label>
                    <div className="mt-1">
                      <Select defaultValue={selectedTask.assignee?.name ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người..." />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueAssignees.map((assignee) => (
                            <SelectItem key={assignee} value={assignee}>
                              {assignee}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Due Date</Label>
                    <Input
                      type="date"
                      defaultValue={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split("T")[0] : ""}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <Textarea defaultValue={selectedTask.description ?? ""} rows={3} className="mt-1" />
                </div>

                {/* Category/Tags */}
                <div>
                  <Label className="text-sm text-muted-foreground">Category</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{selectedTask.category}</Badge>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Tag
                    </Button>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Attachments ({selectedTask._count.attachments})
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded border hover:bg-accent/50">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Design_Brief_v2.pdf</p>
                        <p className="text-xs text-muted-foreground">2.4 MB • Uploaded 2 hours ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded border hover:bg-accent/50">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Reference_Image.jpg</p>
                        <p className="text-xs text-muted-foreground">1.8 MB • Uploaded 1 hour ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">Comments ({mockComments.length})</Label>
                  <div className="space-y-4 mb-4">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.user}</span>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input placeholder="Viết comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <Button size="sm" className="gap-2">
                      <Send className="w-4 h-4" />
                      Gửi
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Đóng
                </Button>
                <Button>Lưu thay đổi</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Task Modal */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo Task mới</DialogTitle>
            <DialogDescription>Thêm task mới vào hệ thống quản lý công việc</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tiêu đề *</Label>
              <Input placeholder="Nhập tiêu đề task..." className="mt-1" />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea placeholder="Mô tả chi tiết về task..." rows={4} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select defaultValue="normal">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🔴 Khẩn cấp</SelectItem>
                    <SelectItem value="high">🟠 Cao</SelectItem>
                    <SelectItem value="normal">🟡 Bình thường</SelectItem>
                    <SelectItem value="low">🔵 Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assignee</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn người làm..." />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueAssignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input type="date" className="mt-1" />
              </div>

              <div>
                <Label>Category</Label>
                <Input placeholder="Design, Content..." className="mt-1" />
              </div>
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
  );
}
