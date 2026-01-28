"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface TaskRequest {
  id: string;
  title: string;
  description: string;
  requester: string;
  requesterEmail: string;
  requesterRole: string;
  department: string;
  type: "design" | "content" | "video" | "other";
  urgency: "urgent" | "high" | "normal" | "low";
  deadline: string;
  createdAt: string;
  attachments: number;
  notes?: string;
  status: "pending" | "accepted" | "declined";
}

const mockRequests: TaskRequest[] = [
  {
    id: "1",
    title: "Tet Promotion Poster Design",
    description:
      "Need A3 poster for Tet promotion campaign - 20% off all services. Style: festive, red/gold colors. Include clinic logo and QR code for booking.",
    requester: "Nguyen Van Manager",
    requesterEmail: "manager@greenfielddental.vn",
    requesterRole: "Sales Manager",
    department: "Sales",
    type: "design",
    urgency: "urgent",
    deadline: "2024-01-15",
    createdAt: "2024-01-10",
    attachments: 2,
    notes: "Reference last year's poster in Brand > Tet 2023 folder",
    status: "pending",
  },
  {
    id: "2",
    title: "SEO Article - Teeth Whitening Service",
    description:
      "Write 1500-2000 word SEO article about teeth whitening service. Target keywords: teeth whitening HCM, professional whitening. Include procedure details and pricing.",
    requester: "Dr. Huong",
    requesterEmail: "drhuong@greenfielddental.vn",
    requesterRole: "Dentist",
    department: "Clinical",
    type: "content",
    urgency: "normal",
    deadline: "2024-01-20",
    createdAt: "2024-01-09",
    attachments: 1,
    status: "pending",
  },
  {
    id: "3",
    title: "New Doctor Introduction Video",
    description:
      "Create 2-3 minute introduction video for Dr. Minh, new orthodontist. Need short interview and clinic footage. Will be used on website and social media.",
    requester: "HR Department",
    requesterEmail: "hr@greenfielddental.vn",
    requesterRole: "HR Manager",
    department: "HR",
    type: "video",
    urgency: "low",
    deadline: "2024-01-25",
    createdAt: "2024-01-08",
    attachments: 0,
    notes: "Dr. Minh available for filming on Jan 18-20",
    status: "pending",
  },
  {
    id: "4",
    title: "2024 Service Price Menu Update",
    description:
      "Update service price list for 2024. Excel file with new prices attached. Keep same layout, only change numbers and add 3 new services.",
    requester: "Accounting Team",
    requesterEmail: "accounting@greenfielddental.vn",
    requesterRole: "Finance Manager",
    department: "Finance",
    type: "design",
    urgency: "high",
    deadline: "2024-01-12",
    createdAt: "2024-01-10",
    attachments: 1,
    notes: "Urgent - need before branch opening",
    status: "pending",
  },
  {
    id: "5",
    title: "Social Media Posts - New Invisalign Service",
    description:
      "Create 3 posts for Facebook/Instagram about new Invisalign clear aligner service. Include benefits, pricing info, and booking CTA.",
    requester: "Dr. An",
    requesterEmail: "dran@greenfielddental.vn",
    requesterRole: "Senior Dentist",
    department: "Clinical",
    type: "content",
    urgency: "normal",
    deadline: "2024-01-18",
    createdAt: "2024-01-07",
    attachments: 3,
    status: "accepted",
  },
  {
    id: "6",
    title: "Patient Education Brochure",
    description:
      "Design tri-fold brochure about dental implant procedure. Should explain process, timeline, and aftercare. For distribution at clinic reception.",
    requester: "Dr. Tuan",
    requesterEmail: "drtuan@greenfielddental.vn",
    requesterRole: "Implant Specialist",
    department: "Clinical",
    type: "design",
    urgency: "normal",
    deadline: "2024-01-22",
    createdAt: "2024-01-06",
    attachments: 2,
    notes: "Include before/after images from approved cases",
    status: "pending",
  },
];

const typeConfig = {
  design: { label: "Design", icon: ImageIcon, color: "bg-pink-100 text-pink-700" },
  content: { label: "Content", icon: FileText, color: "bg-blue-100 text-blue-700" },
  video: { label: "Video", icon: Video, color: "bg-purple-100 text-purple-700" },
  other: { label: "Other", icon: FileText, color: "bg-gray-100 text-gray-700" },
};

const urgencyConfig = {
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

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
};

export default function TaskRequestsPage() {
  const [requests, setRequests] = useState<TaskRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<TaskRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [declineReason, setDeclineReason] = useState("");

  const filteredRequests = requests.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    urgent: requests.filter((r) => r.urgency === "urgent").length,
    design: requests.filter((r) => r.type === "design").length,
    content: requests.filter((r) => r.type === "content").length,
    video: requests.filter((r) => r.type === "video").length,
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const openDetail = (request: TaskRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
    setDeclineReason("");
  };

  const handleAccept = (request: TaskRequest) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: "accepted" as const } : r))
    );
    setIsDetailOpen(false);
    setSelectedRequest(request);
    setIsCreateTaskOpen(true);
  };

  const handleDecline = (request: TaskRequest) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: "declined" as const } : r))
    );
    setIsDetailOpen(false);
  };

  const handleCreateTask = () => {
    // In real implementation, this would create a task
    setIsCreateTaskOpen(false);
  };

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
            <SelectItem value="high">High</SelectItem>
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const typeInfo = typeConfig[request.type];
          const TypeIcon = typeInfo.icon;
          const urgencyInfo = urgencyConfig[request.urgency];
          const statusInfo = statusConfig[request.status];
          const daysLeft = getDaysUntilDeadline(request.deadline);

          return (
            <Card
              key={request.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                urgencyInfo.borderColor ? `border-l-4 ${urgencyInfo.borderColor}` : ""
              }`}
              onClick={() => openDetail(request)}
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
                        {daysLeft <= 3 && daysLeft > 0 && request.status === "pending" && (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysLeft} days left
                          </Badge>
                        )}
                        {daysLeft <= 0 && request.status === "pending" && (
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
                          {request.requester} ({request.requesterRole})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Deadline: {new Date(request.deadline).toLocaleDateString()}
                        </span>
                        {request.attachments > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-4 w-4" />
                            {request.attachments} attachments
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecline(request);
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

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No requests found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={typeConfig[selectedRequest.type].color}>
                    {typeConfig[selectedRequest.type].label}
                  </Badge>
                  <Badge className={urgencyConfig[selectedRequest.urgency].color}>
                    {urgencyConfig[selectedRequest.urgency].label}
                  </Badge>
                  <Badge className={statusConfig[selectedRequest.status].color}>
                    {statusConfig[selectedRequest.status].label}
                  </Badge>
                </div>
                <DialogTitle>{selectedRequest.title}</DialogTitle>
                <DialogDescription>
                  Request from {selectedRequest.requester} ({selectedRequest.requesterRole}) -{" "}
                  {selectedRequest.department}
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
                    <p className="mt-1 font-medium">{selectedRequest.requester}</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.requesterEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="mt-1 font-medium">{selectedRequest.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Deadline</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-medium">
                        {new Date(selectedRequest.deadline).toLocaleDateString()}
                      </p>
                      {getDaysUntilDeadline(selectedRequest.deadline) <= 3 &&
                        getDaysUntilDeadline(selectedRequest.deadline) > 0 && (
                          <Badge variant="destructive">
                            {getDaysUntilDeadline(selectedRequest.deadline)} days left
                          </Badge>
                        )}
                      {getDaysUntilDeadline(selectedRequest.deadline) <= 0 && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Submitted</Label>
                    <p className="mt-1 font-medium">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedRequest.attachments > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Attachments</Label>
                    <div className="mt-2 p-3 border rounded-lg flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedRequest.attachments} file(s) attached</span>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Download All
                      </Button>
                    </div>
                  </div>
                )}

                {selectedRequest.notes && (
                  <div>
                    <Label className="text-muted-foreground">Additional Notes</Label>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequest.notes}</p>
                  </div>
                )}

                {selectedRequest.status === "pending" && (
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
                {selectedRequest.status === "pending" && (
                  <>
                    <Button variant="destructive" onClick={() => handleDecline(selectedRequest)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button onClick={() => handleAccept(selectedRequest)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept & Create Task
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
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
              Request accepted. Configure the task details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Task Title</Label>
              <Input defaultValue={selectedRequest?.title} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                defaultValue={selectedRequest?.description}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assignee</Label>
                <Select defaultValue="self">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Assign to myself</SelectItem>
                    <SelectItem value="designer1">Designer 1</SelectItem>
                    <SelectItem value="designer2">Designer 2</SelectItem>
                    <SelectItem value="content1">Content Writer 1</SelectItem>
                    <SelectItem value="video1">Video Editor 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  defaultValue={selectedRequest?.deadline}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select defaultValue={selectedRequest?.urgency}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Task Type</Label>
                <Select defaultValue={selectedRequest?.type}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Estimated Hours</Label>
              <Input type="number" placeholder="Enter estimated hours" className="mt-1" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              <CheckSquare className="h-4 w-4 mr-1" />
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
