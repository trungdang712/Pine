"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Image as ImageIcon,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertTriangle,
  ArrowLeft,
  Paperclip,
  CheckSquare,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";

const typeConfig: Record<string, { label: string; icon: typeof ImageIcon; color: string }> = {
  design: { label: "Design", icon: ImageIcon, color: "bg-pink-100 text-pink-700" },
  content: { label: "Content", icon: FileText, color: "bg-blue-100 text-blue-700" },
  video: { label: "Video", icon: Video, color: "bg-purple-100 text-purple-700" },
  other: { label: "Other", icon: FileText, color: "bg-gray-100 text-gray-700" },
};

const defaultTypeConfig = { label: "Other", icon: FileText, color: "bg-gray-100 text-gray-700" };

const urgencyConfig: Record<string, { label: string; color: string; borderColor: string }> = {
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-700",
    borderColor: "border-l-red-500",
  },
  high: {
    label: "High",
    color: "bg-orange-100 text-orange-700",
    borderColor: "border-l-orange-500",
  },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700", borderColor: "" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700", borderColor: "" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
  in_progress: { label: "In Progress", color: "bg-indigo-100 text-indigo-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
};

export default function TaskRequestsPage() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [declineReason, setDeclineReason] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const utils = trpc.useUtils();

  // Fetch real data
  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
  } = trpc.external.getTaskRequests.useQuery();

  const { data: users = [] } = trpc.user.getAll.useQuery();

  // Mutations
  const acceptRequest = trpc.external.acceptTaskRequest.useMutation({
    onSuccess: () => {
      utils.external.getTaskRequests.invalidate();
      setIsDetailOpen(false);
      setIsCreateTaskOpen(false);
      setSelectedAssignee("");
      toast.success("Task request accepted and task created");
    },
    onError: (err) => toast.error(err.message),
  });

  const declineRequest = trpc.external.declineTaskRequest.useMutation({
    onSuccess: () => {
      utils.external.getTaskRequests.invalidate();
      setIsDetailOpen(false);
      setDeclineReason("");
      toast.success("Task request declined");
    },
    onError: (err) => toast.error(err.message),
  });

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) ?? null;

  const filteredRequests = requests.filter((r) => {
    if (typeFilter !== "all" && r.requestType !== typeFilter) return false;
    if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "new").length,
    urgent: requests.filter((r) => r.urgency === "urgent").length,
    design: requests.filter((r) => r.requestType === "design").length,
    content: requests.filter((r) => r.requestType === "content").length,
    video: requests.filter((r) => r.requestType === "video").length,
  };

  const getDaysUntilDeadline = (deadline: string | Date | null) => {
    if (!deadline) return null;
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  // Parse attachments JSON field
  const getAttachmentCount = (attachments: string | null): number => {
    if (!attachments) return 0;
    try {
      const parsed = JSON.parse(attachments);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  const openDetail = (id: string) => {
    setSelectedRequestId(id);
    setIsDetailOpen(true);
    setDeclineReason("");
  };

  const handleAccept = (request: typeof selectedRequest) => {
    if (!request) return;
    setIsDetailOpen(false);
    setSelectedRequestId(request.id);
    setIsCreateTaskOpen(true);
  };

  const handleDecline = (id: string) => {
    declineRequest.mutate({ id, reason: declineReason || undefined });
  };

  const handleCreateTask = () => {
    if (!selectedRequestId) return;
    if (!selectedAssignee) {
      toast.error("Please select an assignee");
      return;
    }
    acceptRequest.mutate({ id: selectedRequestId, assigneeId: selectedAssignee });
  };

  // Loading state
  if (isLoading) return <PageLoading text="Loading task requests..." />;

  // Error state
  if (error) return <PageError error={error} onRetry={() => refetch()} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/inbox">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Inbox
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Task Requests</h1>
          <p className="text-muted-foreground">
            External task requests from other departments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.urgent}</p>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-100">
              <ImageIcon className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.design}</p>
              <p className="text-sm text-muted-foreground">Design</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.video}</p>
              <p className="text-sm text-muted-foreground">Video</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={FileText}
                title="No requests found"
                description="Try adjusting your filters to see more results"
              />
            </CardContent>
          </Card>
        )}

        {filteredRequests.map((request) => {
          const typeInfo = typeConfig[request.requestType] ?? defaultTypeConfig;
          const TypeIcon = typeInfo.icon;
          const urgencyInfo = urgencyConfig[request.urgency] ?? urgencyConfig.normal;
          const statusInfo = statusConfig[request.status] ?? statusConfig.new;
          const daysLeft = getDaysUntilDeadline(request.deadline);
          const attachmentCount = getAttachmentCount(request.attachments);

          return (
            <Card
              key={request.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                urgencyInfo.borderColor ? `border-l-4 ${urgencyInfo.borderColor}` : ""
              }`}
              onClick={() => openDetail(request.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-lg ${typeInfo.color}`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        <Badge className={urgencyInfo.color}>{urgencyInfo.label}</Badge>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        {daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && request.status === "new" && (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysLeft} days left
                          </Badge>
                        )}
                        {daysLeft !== null && daysLeft <= 0 && request.status === "new" && (
                          <Badge variant="destructive">Overdue!</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{request.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {request.requesterName} ({request.requesterTeam})
                        </span>
                        {request.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Deadline: {format(new Date(request.deadline), "MMM d, yyyy")}
                          </span>
                        )}
                        {attachmentCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-4 w-4" />
                            {attachmentCount} attachment(s)
                          </span>
                        )}
                        {request.assignedTo && (
                          <span className="text-primary">
                            Assigned: {request.assignedTo.name}
                          </span>
                        )}
                      </div>
                      {request.relatedTask && (
                        <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                          Task: {request.relatedTask.title} ({request.relatedTask.status})
                        </div>
                      )}
                    </div>
                  </div>
                  {request.status === "new" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        disabled={declineRequest.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecline(request.id);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(request);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedRequest && (() => {
            const typeInfo = typeConfig[selectedRequest.requestType] ?? defaultTypeConfig;
            const urgencyInfo = urgencyConfig[selectedRequest.urgency] ?? urgencyConfig.normal;
            const statusInfo = statusConfig[selectedRequest.status] ?? statusConfig.new;
            const daysLeft = getDaysUntilDeadline(selectedRequest.deadline);
            const attachmentCount = getAttachmentCount(selectedRequest.attachments);

            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={typeInfo.color}>
                      {typeInfo.label}
                    </Badge>
                    <Badge className={urgencyInfo.color}>
                      {urgencyInfo.label}
                    </Badge>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <DialogTitle>{selectedRequest.title}</DialogTitle>
                  <DialogDescription>
                    Request from {selectedRequest.requesterName} - {selectedRequest.requesterTeam}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1">{selectedRequest.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Requester</Label>
                      <p className="mt-1 font-medium">{selectedRequest.requesterName}</p>
                      <p className="text-sm text-muted-foreground">{selectedRequest.requesterEmail}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Department</Label>
                      <p className="mt-1 font-medium capitalize">{selectedRequest.requesterTeam}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Deadline</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="font-medium">
                          {selectedRequest.deadline
                            ? format(new Date(selectedRequest.deadline), "MMM d, yyyy")
                            : "No deadline"}
                        </p>
                        {daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && (
                          <Badge variant="destructive">
                            {daysLeft} days left
                          </Badge>
                        )}
                        {daysLeft !== null && daysLeft <= 0 && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Submitted</Label>
                      <p className="mt-1 font-medium">
                        {format(new Date(selectedRequest.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  {attachmentCount > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Attachments</Label>
                      <div className="mt-2 p-3 border rounded-lg flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span>{attachmentCount} file(s) attached</span>
                        <Button variant="outline" size="sm" className="ml-auto">
                          Download All
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedRequest.assignedTo && (
                    <div>
                      <Label className="text-muted-foreground">Assigned To</Label>
                      <p className="mt-1 font-medium">{selectedRequest.assignedTo.name}</p>
                    </div>
                  )}

                  {selectedRequest.relatedTask && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <Label className="text-muted-foreground">Related Task</Label>
                      <p className="mt-1 font-medium">{selectedRequest.relatedTask.title}</p>
                      <Badge variant="secondary" className="mt-1">
                        {selectedRequest.relatedTask.status}
                      </Badge>
                    </div>
                  )}

                  {selectedRequest.status === "new" && (
                    <div>
                      <Label htmlFor="declineReason">Decline Reason (optional)</Label>
                      <Textarea
                        id="declineReason"
                        placeholder="Provide a reason if declining this request..."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Close
                  </Button>
                  {selectedRequest.status === "new" && (
                    <>
                      <Button
                        variant="destructive"
                        disabled={declineRequest.isPending}
                        onClick={() => handleDecline(selectedRequest.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        onClick={() => handleAccept(selectedRequest)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept & Create Task
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog (after accepting) */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Create Task from Request
            </DialogTitle>
            <DialogDescription>
              Request accepted. Select an assignee to create the task.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Task Title</Label>
              <Input defaultValue={selectedRequest?.title} className="mt-1" readOnly />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                defaultValue={selectedRequest?.description}
                rows={3}
                className="mt-1"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assignee *</Label>
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  defaultValue={
                    selectedRequest?.deadline
                      ? format(new Date(selectedRequest.deadline), "yyyy-MM-dd")
                      : undefined
                  }
                  className="mt-1"
                  readOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Urgency</Label>
                <Input
                  defaultValue={selectedRequest?.urgency}
                  className="mt-1 capitalize"
                  readOnly
                />
              </div>
              <div>
                <Label>Request Type</Label>
                <Input
                  defaultValue={selectedRequest?.requestType}
                  className="mt-1 capitalize"
                  readOnly
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={acceptRequest.isPending || !selectedAssignee}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              {acceptRequest.isPending ? "Creating..." : "Accept & Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
