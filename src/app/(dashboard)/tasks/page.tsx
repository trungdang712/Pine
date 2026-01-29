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
  RotateCcw,
  ArrowRight,
  History,
  ThumbsUp,
  ThumbsDown,
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
import { useLanguage } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";

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
  reviewer?: { id: string; name: string; avatar: string | null } | null;
  reviewNotes?: string | null;
  reviewedAt?: Date | null;
  rejectionCount?: number;
  _count: { comments: number; attachments: number };
}

interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  comment: string | null;
  createdAt: Date;
  user: { id: string; name: string | null; avatar: string | null };
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const { t } = useLanguage();
  const priorityLabels: Record<string, string> = {
    urgent: t.tasks.priorities.urgent,
    high: t.tasks.priorities.high,
    normal: t.tasks.priorities.medium,
    low: t.tasks.priorities.low,
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
                {t.common.overdue}
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
  noTasksLabel: string;
}

function KanbanColumn({ title, count, status, tasks, onTaskClick, noTasksLabel }: KanbanColumnProps) {
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
            items={tasks.map((task) => task.id)}
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
              {noTasksLabel}
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
  noTasksLabel,
}: {
  groups: { title: string; status: TaskStatus; tasks: Task[] }[];
  onTaskClick: (task: Task) => void;
  noTasksLabel: string;
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
                {noTasksLabel}
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
  const { t } = useLanguage();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);

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
      toast.success(t.common.success);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.getKanbanBoard.invalidate();
      toast.success(t.common.success);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addComment = trpc.task.addComment.useMutation({
    onSuccess: () => {
      utils.task.getById.invalidate();
      setNewComment("");
      toast.success(t.common.success);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Workflow mutations
  const submitForReview = trpc.task.submitForReview.useMutation({
    onSuccess: () => {
      utils.task.getKanbanBoard.invalidate();
      utils.task.getById.invalidate();
      toast.success("Task submitted for review");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const approveTask = trpc.task.approveTask.useMutation({
    onSuccess: () => {
      utils.task.getKanbanBoard.invalidate();
      utils.task.getById.invalidate();
      toast.success("Task approved successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const requestRevision = trpc.task.requestRevision.useMutation({
    onSuccess: () => {
      utils.task.getKanbanBoard.invalidate();
      utils.task.getById.invalidate();
      setShowRevisionDialog(false);
      setRevisionFeedback("");
      toast.success("Revision requested");
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
      toast.error(t.common.required);
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

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header with Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{t.tasks.title}</h1>
          <p className="text-muted-foreground">{t.tasks.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            {t.common.filter}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <Button className="gap-2" onClick={() => setIsNewTaskOpen(true)}>
            <Plus className="w-4 h-4" />
            {t.tasks.createTask}
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
                <Label className="text-sm mb-2 block">{t.tasks.assignee}</Label>
                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.all}</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <Label className="text-sm mb-2 block">{t.tasks.priority}</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.all}</SelectItem>
                    <SelectItem value="urgent">{t.tasks.priorities.urgent}</SelectItem>
                    <SelectItem value="high">{t.tasks.priorities.high}</SelectItem>
                    <SelectItem value="normal">{t.tasks.priorities.medium}</SelectItem>
                    <SelectItem value="low">{t.tasks.priorities.low}</SelectItem>
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
                    <SelectItem value="all">{t.common.all}</SelectItem>
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
                  {t.common.clear}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {totalTasks === 0 ? (
        <PageEmpty
          title={t.tasks.noTasks}
          description={t.tasks.subtitle}
          action={{ label: t.tasks.createTask, onClick: () => setIsNewTaskOpen(true) }}
        />
      ) : isMobile ? (
        /* Mobile: show grouped list view instead of Kanban */
        <MobileTaskList
          groups={[
            { title: t.tasks.statuses.todo, status: "todo", tasks: todoTasks },
            { title: t.tasks.statuses.inProgress, status: "in_progress", tasks: inProgressTasks },
            { title: t.tasks.statuses.review, status: "review", tasks: reviewTasks },
            { title: t.tasks.statuses.done, status: "done", tasks: doneTasks },
          ]}
          onTaskClick={handleTaskClick}
          noTasksLabel={t.tasks.noTasks}
        />
      ) : (
        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
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
                  title={t.tasks.statuses.todo}
                  count={todoTasks.length}
                  status="todo"
                  tasks={todoTasks}
                  onTaskClick={handleTaskClick}
                  noTasksLabel={t.tasks.noTasks}
                />
                <KanbanColumn
                  title={t.tasks.statuses.inProgress}
                  count={inProgressTasks.length}
                  status="in_progress"
                  tasks={inProgressTasks}
                  onTaskClick={handleTaskClick}
                  noTasksLabel={t.tasks.noTasks}
                />
                <KanbanColumn
                  title={t.tasks.statuses.review}
                  count={reviewTasks.length}
                  status="review"
                  tasks={reviewTasks}
                  onTaskClick={handleTaskClick}
                  noTasksLabel={t.tasks.noTasks}
                />
                <KanbanColumn
                  title={t.tasks.statuses.done}
                  count={doneTasks.length}
                  status="done"
                  tasks={doneTasks}
                  onTaskClick={handleTaskClick}
                  noTasksLabel={t.tasks.noTasks}
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
                    <Label className="text-sm text-muted-foreground">{t.tasks.status}</Label>
                    <div className="mt-1">
                      <Select
                        value={taskDetails?.status ?? selectedTask.status}
                        onValueChange={(v) => handleStatusChange(v as TaskStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">{t.tasks.statuses.todo}</SelectItem>
                          <SelectItem value="in_progress">{t.tasks.statuses.inProgress}</SelectItem>
                          <SelectItem value="review">{t.tasks.statuses.review}</SelectItem>
                          <SelectItem value="done">{t.tasks.statuses.done}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.tasks.priority}</Label>
                    <div className="mt-1">
                      <Select
                        value={taskDetails?.priority ?? selectedTask.priority}
                        onValueChange={(v) => handlePriorityChange(v as TaskPriority)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">{t.tasks.priorities.urgent}</SelectItem>
                          <SelectItem value="high">{t.tasks.priorities.high}</SelectItem>
                          <SelectItem value="normal">{t.tasks.priorities.medium}</SelectItem>
                          <SelectItem value="low">{t.tasks.priorities.low}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.tasks.assignee}</Label>
                    <div className="mt-1 p-2 border rounded-md bg-muted/50">
                      {selectedTask.assignee?.name ?? "Unassigned"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.tasks.dueDate}</Label>
                    <div className="mt-1 p-2 border rounded-md bg-muted/50">
                      {selectedTask.dueDate
                        ? format(new Date(selectedTask.dueDate), "MMM d, yyyy")
                        : "No due date"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm text-muted-foreground">{t.tasks.description}</Label>
                  <div className="mt-2 p-3 border rounded-md bg-muted/50 min-h-[80px]">
                    {taskDetails?.description ?? selectedTask.description ?? t.common.noData}
                  </div>
                </div>

                {/* Revision Notes (if any) */}
                {taskDetails?.reviewNotes && (
                  <div className="border border-yellow-300 bg-yellow-50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw className="w-4 h-4 text-yellow-600" />
                      <Label className="text-sm font-medium text-yellow-800">Revision Feedback</Label>
                      {taskDetails.rejectionCount && taskDetails.rejectionCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                          {taskDetails.rejectionCount} revision{taskDetails.rejectionCount > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-yellow-800">{taskDetails.reviewNotes}</p>
                    {taskDetails.reviewer && (
                      <p className="text-xs text-yellow-600 mt-2">
                        From: {taskDetails.reviewer.name} {taskDetails.reviewedAt && `on ${format(new Date(taskDetails.reviewedAt), "MMM d, yyyy")}`}
                      </p>
                    )}
                  </div>
                )}

                {/* Workflow Actions */}
                {(() => {
                  const currentStatus = taskDetails?.status ?? selectedTask.status;
                  const isAssignee = selectedTask.assignee?.id === profile?.id;
                  const isCreator = selectedTask.creator?.id === profile?.id;
                  const isManager = ["super_admin", "admin", "marketing_manager"].includes(profile?.role ?? "");
                  const canReview = isCreator || isManager;

                  return (
                    <div className="border-t pt-4">
                      <Label className="text-sm text-muted-foreground mb-3 block">Workflow Actions</Label>
                      <div className="flex flex-wrap gap-2">
                        {/* Submit for Review - Assignee only, when in_progress */}
                        {currentStatus === "in_progress" && isAssignee && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => submitForReview.mutate({ id: selectedTask.id })}
                            disabled={submitForReview.isPending}
                          >
                            <ArrowRight className="w-4 h-4" />
                            {submitForReview.isPending ? "Submitting..." : "Submit for Review"}
                          </Button>
                        )}

                        {/* Approve - Creator/Manager only, when in review */}
                        {currentStatus === "review" && canReview && (
                          <>
                            <Button
                              size="sm"
                              className="gap-2 bg-green-600 hover:bg-green-700"
                              onClick={() => approveTask.mutate({ id: selectedTask.id })}
                              disabled={approveTask.isPending}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              {approveTask.isPending ? "Approving..." : "Approve"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                              onClick={() => setShowRevisionDialog(true)}
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Request Revision
                            </Button>
                          </>
                        )}

                        {/* Status indicator */}
                        {currentStatus === "review" && !canReview && (
                          <Badge variant="secondary" className="text-sm">
                            <Clock className="w-3 h-3 mr-1" />
                            Awaiting review
                          </Badge>
                        )}
                        {currentStatus === "done" && (
                          <Badge variant="default" className="text-sm bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Activity Timeline */}
                {taskDetails?.activities && taskDetails.activities.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Activity ({taskDetails.activities.length})
                    </Label>
                    <div className="space-y-3 max-h-[150px] overflow-y-auto">
                      {taskDetails.activities.map((activity: TaskActivity) => (
                        <div key={activity.id} className="flex gap-3 text-sm">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {activity.action === "approved" && <ThumbsUp className="w-3 h-3 text-green-600" />}
                            {activity.action === "rejected" && <ThumbsDown className="w-3 h-3 text-orange-600" />}
                            {activity.action === "submitted_for_review" && <ArrowRight className="w-3 h-3 text-blue-600" />}
                            {!["approved", "rejected", "submitted_for_review"].includes(activity.action) && (
                              <Clock className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{activity.user.name}</span>
                              {" "}
                              {activity.action === "submitted_for_review" && "submitted for review"}
                              {activity.action === "approved" && "approved this task"}
                              {activity.action === "rejected" && "requested revision"}
                              {activity.action === "created" && "created this task"}
                              {activity.action === "assigned" && "assigned this task"}
                              {activity.action === "started" && "started working"}
                              {activity.action === "completed" && "completed this task"}
                            </p>
                            {activity.comment && (
                              <p className="text-xs text-muted-foreground mt-1 italic">"{activity.comment}"</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.createdAt), "MMM d, HH:mm")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {taskDetails?.attachments && taskDetails.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      {t.tasks.attachments} ({taskDetails.attachments.length})
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
                    {t.tasks.comments} ({taskDetails?.comments?.length ?? 0})
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
                        {t.common.noData}
                      </p>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.tasks.addComment}
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
                      {t.common.submit}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>
                  {t.common.close}
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
            <DialogTitle>{t.tasks.createTask}</DialogTitle>
            <DialogDescription>
              {t.tasks.subtitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t.tasks.title} *</Label>
              <Input
                placeholder={t.tasks.title}
                className="mt-1"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>{t.tasks.description}</Label>
              <Textarea
                placeholder={t.tasks.description}
                rows={4}
                className="mt-1"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.tasks.priority}</Label>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">{t.tasks.priorities.urgent}</SelectItem>
                    <SelectItem value="high">{t.tasks.priorities.high}</SelectItem>
                    <SelectItem value="normal">{t.tasks.priorities.medium}</SelectItem>
                    <SelectItem value="low">{t.tasks.priorities.low}</SelectItem>
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
                <Label>{t.tasks.assignee}</Label>
                <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t.tasks.assignee} />
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
                <Label>{t.tasks.dueDate}</Label>
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
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateTask} disabled={createTask.isPending}>
              {createTask.isPending ? t.common.loading : t.tasks.createTask}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Request Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Provide feedback for the assignee about what needs to be revised.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Feedback *</Label>
              <Textarea
                placeholder="Describe what needs to be changed..."
                rows={4}
                className="mt-1"
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRevisionDialog(false);
                setRevisionFeedback("");
              }}
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedTask || !revisionFeedback.trim()) {
                  toast.error("Please provide feedback");
                  return;
                }
                requestRevision.mutate({
                  id: selectedTask.id,
                  feedback: revisionFeedback.trim(),
                });
              }}
              disabled={requestRevision.isPending || !revisionFeedback.trim()}
            >
              {requestRevision.isPending ? "Sending..." : "Request Revision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
