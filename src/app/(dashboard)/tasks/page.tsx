"use client";

import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Paperclip,
  MessageSquare,
  Calendar as CalendarIcon,
  User,
  Filter,
  X,
  Send,
  Download,
  Image as ImageIcon,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";

type TaskStatus = "todo" | "in_progress" | "review" | "done";
type TaskPriority = "urgent" | "high" | "normal" | "low";
type TaskCategory = "content" | "design" | "video" | "campaign" | "admin";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  category: string;
  dueDate: Date | null;
  assignee: { id: string; name: string; avatar: string | null } | null;
  creator: { id: string; name: string; avatar: string | null };
  _count: { comments: number; attachments: number };
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const priorityLabels: Record<string, string> = {
    urgent: "Khẩn cấp",
    high: "Cao",
    normal: "Bình thường",
    low: "Thấp",
  };

  const priorityEmoji: Record<string, string> = {
    urgent: "🔴",
    high: "🟠",
    normal: "🟡",
    low: "🔵",
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Card
      className={`mb-3 cursor-pointer hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : ""} ${isOverdue ? "border-destructive" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="text-xs">
              {priorityEmoji[task.priority]} {priorityLabels[task.priority]}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Quá hạn
              </Badge>
            )}
          </div>
          <div>
            <h4 className="font-medium mb-1">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="text-xs">{task.assignee?.name ?? "Unassigned"}</span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-xs">{format(new Date(task.dueDate), "MMM d")}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {task._count.attachments > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-xs">{task._count.attachments}</span>
                </div>
              )}
              {task._count.comments > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs">{task._count.comments}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SortableTaskCardProps {
  task: Task;
  onClick?: () => void;
}

function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  count: number;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

function KanbanColumn({ title, count, status, tasks, onTaskClick }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[280px]">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{title}</span>
            <Badge variant="secondary">{count}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[200px]">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Không có task nào
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Mobile-friendly grouped list view for tasks
function MobileTaskList({
  groups,
  onTaskClick,
}: {
  groups: { title: string; status: TaskStatus; tasks: Task[] }[];
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.status}>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>{group.title}</span>
              <Badge variant="secondary">{group.tasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {group.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không có task nào
              </p>
            ) : (
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TasksPage() {
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Filter states
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // New task form states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("normal");
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>("content");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const utils = trpc.useUtils();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch kanban data
  const { data: kanbanData, isLoading, error, refetch } = trpc.task.getKanbanBoard.useQuery(
    filterAssignee !== "all" || filterCategory !== "all"
      ? {
          assigneeId: filterAssignee !== "all" ? filterAssignee : undefined,
          category: filterCategory !== "all" ? (filterCategory as TaskCategory) : undefined,
        }
      : undefined
  );

  // Fetch users for assignee filter and dropdown
  const { data: users = [] } = trpc.user.getTeamMembers.useQuery();

  // Mutations
  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.task.getKanbanBoard.invalidate();
      setIsNewTaskOpen(false);
      resetNewTaskForm();
      toast.success("Task đã được tạo thành công");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.getKanbanBoard.invalidate();
      toast.success("Task đã được cập nhật");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addComment = trpc.task.addComment.useMutation({
    onSuccess: () => {
      utils.task.getById.invalidate();
      setNewComment("");
      toast.success("Comment đã được thêm");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Get task details when selected
  const { data: taskDetails } = trpc.task.getById.useQuery(
    { id: selectedTask?.id ?? "" },
    { enabled: !!selectedTask && isTaskDetailOpen }
  );

  const resetNewTaskForm = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("normal");
    setNewTaskCategory("content");
    setNewTaskAssignee("");
    setNewTaskDueDate("");
  };

  // Apply priority filter locally
  const filterTasks = (tasks: Task[]) => {
    if (filterPriority === "all") return tasks;
    return tasks.filter((task) => task.priority === filterPriority);
  };

  // Get tasks for each column with filters
  const todoTasks = useMemo(() => filterTasks(kanbanData?.todo ?? []), [kanbanData, filterPriority]);
  const inProgressTasks = useMemo(() => filterTasks(kanbanData?.in_progress ?? []), [kanbanData, filterPriority]);
  const reviewTasks = useMemo(() => filterTasks(kanbanData?.review ?? []), [kanbanData, filterPriority]);
  const doneTasks = useMemo(() => filterTasks(kanbanData?.done ?? []), [kanbanData, filterPriority]);

  const totalTasks = todoTasks.length + inProgressTasks.length + reviewTasks.length + doneTasks.length;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      // Find the task and determine new status
      const allTasks = [...todoTasks, ...inProgressTasks, ...reviewTasks, ...doneTasks];
      const activeTask = allTasks.find((t) => t.id === String(active.id));
      const overTask = allTasks.find((t) => t.id === String(over.id));

      if (activeTask && overTask && activeTask.status !== overTask.status) {
        updateTask.mutate({
          id: activeTask.id,
          status: overTask.status as TaskStatus,
        });
      }
    }

    setActiveId(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề task");
      return;
    }

    createTask.mutate({
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      priority: newTaskPriority,
      category: newTaskCategory,
      assigneeId: newTaskAssignee || undefined,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return;

    addComment.mutate({
      taskId: selectedTask.id,
      content: newComment,
    });
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (!selectedTask) return;
    updateTask.mutate({ id: selectedTask.id, status });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    if (!selectedTask) return;
    updateTask.mutate({ id: selectedTask.id, priority });
  };

  const activeFiltersCount = [filterAssignee, filterPriority, filterCategory].filter(
    (f) => f !== "all"
  ).length;

  const activeTask = activeId
    ? [...todoTasks, ...inProgressTasks, ...reviewTasks, ...doneTasks].find((t) => t.id === activeId)
    : null;

  if (isLoading) return <PageLoading text="Đang tải tasks..." />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header with Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">My Tasks</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi công việc</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-semibold">{totalTasks}</p>
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
                <p className="text-2xl font-semibold">{inProgressTasks.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-semibold">{reviewTasks.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold">{doneTasks.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <Label className="text-sm mb-2 block">Assignee</Label>
                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <Label className="text-sm mb-2 block">Priority</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <Label className="text-sm mb-2 block">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
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
                    setFilterCategory("all");
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

      {totalTasks === 0 ? (
        <PageEmpty
          title="Chưa có task nào"
          description="Tạo task đầu tiên để bắt đầu quản lý công việc"
          action={{ label: "Tạo Task mới", onClick: () => setIsNewTaskOpen(true) }}
        />
      ) : isMobile ? (
        /* Mobile: show grouped list view instead of Kanban */
        <MobileTaskList
          groups={[
            { title: "TO DO", status: "todo", tasks: todoTasks },
            { title: "IN PROGRESS", status: "in_progress", tasks: inProgressTasks },
            { title: "REVIEW", status: "review", tasks: reviewTasks },
            { title: "DONE", status: "done", tasks: doneTasks },
          ]}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                <KanbanColumn
                  title="TO DO"
                  count={todoTasks.length}
                  status="todo"
                  tasks={todoTasks}
                  onTaskClick={handleTaskClick}
                />
                <KanbanColumn
                  title="IN PROGRESS"
                  count={inProgressTasks.length}
                  status="in_progress"
                  tasks={inProgressTasks}
                  onTaskClick={handleTaskClick}
                />
                <KanbanColumn
                  title="REVIEW"
                  count={reviewTasks.length}
                  status="review"
                  tasks={reviewTasks}
                  onTaskClick={handleTaskClick}
                />
                <KanbanColumn
                  title="DONE"
                  count={doneTasks.length}
                  status="done"
                  tasks={doneTasks}
                  onTaskClick={handleTaskClick}
                />
              </div>

              <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
              </DragOverlay>
            </DndContext>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[...todoTasks, ...inProgressTasks, ...reviewTasks, ...doneTasks].map((task) => (
                    <div
                      key={task.id}
                      className="border-b last:border-0 pb-3 last:pb-0"
                    >
                      <TaskCard task={task} onClick={() => handleTaskClick(task)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Task Detail Modal */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-3xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                <DialogDescription>Task ID: #{selectedTask.id.slice(0, 8)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Task Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Select
                        value={taskDetails?.status ?? selectedTask.status}
                        onValueChange={(v) => handleStatusChange(v as TaskStatus)}
                      >
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
                      <Select
                        value={taskDetails?.priority ?? selectedTask.priority}
                        onValueChange={(v) => handlePriorityChange(v as TaskPriority)}
                      >
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
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Assignee</Label>
                    <div className="mt-1 p-2 border rounded-md bg-muted/50">
                      {selectedTask.assignee?.name ?? "Unassigned"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Due Date</Label>
                    <div className="mt-1 p-2 border rounded-md bg-muted/50">
                      {selectedTask.dueDate
                        ? format(new Date(selectedTask.dueDate), "MMM d, yyyy")
                        : "No due date"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <div className="mt-2 p-3 border rounded-md bg-muted/50 min-h-[80px]">
                    {taskDetails?.description ?? selectedTask.description ?? "No description"}
                  </div>
                </div>

                {/* Attachments */}
                {taskDetails?.attachments && taskDetails.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Attachments ({taskDetails.attachments.length})
                    </Label>
                    <div className="space-y-2">
                      {taskDetails.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-2 rounded border hover:bg-accent/50"
                        >
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{attachment.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {((attachment.fileSize ?? 0) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">
                    Comments ({taskDetails?.comments?.length ?? 0})
                  </Label>
                  <div className="space-y-4 mb-4 max-h-[200px] overflow-y-auto">
                    {taskDetails?.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), "MMM d, HH:mm")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {(!taskDetails?.comments || taskDetails.comments.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có comment nào
                      </p>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Viết comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    />
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={handleAddComment}
                      disabled={addComment.isPending}
                    >
                      <Send className="w-4 h-4" />
                      Gửi
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Task Modal */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-2xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo Task mới</DialogTitle>
            <DialogDescription>
              Thêm task mới vào hệ thống quản lý công việc
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tiêu đề *</Label>
              <Input
                placeholder="Nhập tiêu đề task..."
                className="mt-1"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea
                placeholder="Mô tả chi tiết về task..."
                rows={4}
                className="mt-1"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                  <SelectTrigger className="mt-1">
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

              <div>
                <Label>Category</Label>
                <Select value={newTaskCategory} onValueChange={(v) => setNewTaskCategory(v as TaskCategory)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Assignee</Label>
                <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn người làm..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateTask} disabled={createTask.isPending}>
              {createTask.isPending ? "Đang tạo..." : "Tạo Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
