"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  FileText,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Inbox as InboxIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

const opportunityTypeLabels: Record<string, { label: string; color: string }> = {
  testimonial: { label: "Testimonial", color: "bg-blue-100 text-blue-800" },
  before_after: { label: "Before/After", color: "bg-purple-100 text-purple-800" },
  success_story: { label: "Success Story", color: "bg-green-100 text-green-800" },
  educational: { label: "Educational", color: "bg-yellow-100 text-yellow-800" },
};

const requestTypeLabels: Record<string, { label: string; color: string }> = {
  design: { label: "Design", color: "bg-pink-100 text-pink-800" },
  content: { label: "Content", color: "bg-blue-100 text-blue-800" },
  video: { label: "Video", color: "bg-purple-100 text-purple-800" },
  other: { label: "Other", color: "bg-gray-100 text-gray-800" },
};

const urgencyConfig: Record<string, { label: string; variant: "destructive" | "secondary" | "outline" }> = {
  urgent: { label: "Khẩn cấp", variant: "destructive" },
  high: { label: "Cao", variant: "destructive" },
  normal: { label: "Bình thường", variant: "secondary" },
  low: { label: "Thấp", variant: "outline" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Mới", variant: "secondary" },
  accepted: { label: "Đã nhận", variant: "default" },
  declined: { label: "Từ chối", variant: "destructive" },
  need_more_info: { label: "Cần thêm info", variant: "outline" },
  in_progress: { label: "Đang xử lý", variant: "default" },
  published: { label: "Đã xuất bản", variant: "default" },
  completed: { label: "Hoàn thành", variant: "default" },
};

export default function InboxPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isOpportunityDetailOpen, setIsOpportunityDetailOpen] = useState(false);
  const [isRequestDetailOpen, setIsRequestDetailOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const utils = trpc.useUtils();

  // Fetch data
  const {
    data: opportunities = [],
    isLoading: loadingOpportunities,
    error: opportunitiesError,
    refetch: refetchOpportunities,
  } = trpc.external.getContentOpportunities.useQuery();

  const {
    data: taskRequests = [],
    isLoading: loadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = trpc.external.getTaskRequests.useQuery();

  const { data: users = [] } = trpc.user.getTeamMembers.useQuery();

  // Mutations
  const updateOpportunity = trpc.external.updateContentOpportunity.useMutation({
    onSuccess: () => {
      utils.external.getContentOpportunities.invalidate();
      setIsOpportunityDetailOpen(false);
      setSelectedAssignee("");
      toast.success("Cập nhật thành công");
    },
    onError: (error) => toast.error(error.message),
  });

  const acceptRequest = trpc.external.acceptTaskRequest.useMutation({
    onSuccess: () => {
      utils.external.getTaskRequests.invalidate();
      setIsRequestDetailOpen(false);
      setSelectedAssignee("");
      toast.success("Task request đã được chấp nhận và tạo task mới");
    },
    onError: (error) => toast.error(error.message),
  });

  const declineRequest = trpc.external.declineTaskRequest.useMutation({
    onSuccess: () => {
      utils.external.getTaskRequests.invalidate();
      setIsRequestDetailOpen(false);
      toast.success("Task request đã bị từ chối");
    },
    onError: (error) => toast.error(error.message),
  });

  const selectedOpp = opportunities.find((o) => o.id === selectedOpportunity);
  const selectedReq = taskRequests.find((r) => r.id === selectedRequest);

  const newOpportunitiesCount = opportunities.filter((o) => o.status === "new").length;
  const newRequestsCount = taskRequests.filter((r) => r.status === "new").length;

  const handleAcceptOpportunity = (id: string, assigneeId: string) => {
    updateOpportunity.mutate({ id, status: "accepted", assignedToId: assigneeId });
  };

  const handleDeclineOpportunity = (id: string) => {
    updateOpportunity.mutate({ id, status: "declined" });
  };

  const handleAcceptRequest = () => {
    if (!selectedRequest || !selectedAssignee) {
      toast.error("Vui lòng chọn người được giao");
      return;
    }
    acceptRequest.mutate({ id: selectedRequest, assigneeId: selectedAssignee });
  };

  const isLoading = loadingOpportunities || loadingRequests;
  const error = opportunitiesError || requestsError;

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={() => { refetchOpportunities(); refetchRequests(); }} />;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">{t.inbox.title}</h1>
        <p className="text-muted-foreground">
          {t.inbox.subtitle}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.inbox.opportunities.title}</p>
                <p className="text-2xl font-semibold">{opportunities.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.inbox.requests.title}</p>
                <p className="text-2xl font-semibold">{taskRequests.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.common.pending}</p>
                <p className="text-2xl font-semibold">{newOpportunitiesCount + newRequestsCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.common.inProgress}</p>
                <p className="text-2xl font-semibold">
                  {opportunities.filter((o) => o.status === "in_progress").length +
                    taskRequests.filter((r) => r.status === "in_progress").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities" className="gap-2">
            {t.inbox.opportunities.title}
            {newOpportunitiesCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {newOpportunitiesCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            {t.inbox.requests.title}
            {newRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {newRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Content Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {opportunities.length === 0 ? (
            <PageEmpty
              icon={MessageSquare}
              title={t.inbox.opportunities.noOpportunities}
              description={t.inbox.opportunities.subtitle}
            />
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <Card
                  key={opp.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    opp.status === "new" ? "border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedOpportunity(opp.id);
                    setIsOpportunityDetailOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            opportunityTypeLabels[opp.type]?.color ?? "bg-gray-100"
                          }`}
                        >
                          {opportunityTypeLabels[opp.type]?.label ?? opp.type}
                        </span>
                        <Badge variant={urgencyConfig[opp.urgency]?.variant ?? "secondary"}>
                          {urgencyConfig[opp.urgency]?.label ?? opp.urgency}
                        </Badge>
                        <Badge variant={opp.consentStatus === "obtained" ? "default" : "outline"}>
                          Consent: {opp.consentStatus}
                        </Badge>
                      </div>
                      <Badge variant={statusConfig[opp.status]?.variant ?? "outline"}>
                        {statusConfig[opp.status]?.label ?? opp.status}
                      </Badge>
                    </div>

                    <p className="text-sm mb-3 line-clamp-2">{opp.description}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>
                            {opp.submitterName} ({opp.submitterTeam})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(opp.createdAt), "MMM d, HH:mm")}</span>
                        </div>
                      </div>
                      {opp.assignedTo && (
                        <span className="text-primary">
                          Assigned: {opp.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Task Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {taskRequests.length === 0 ? (
            <PageEmpty
              icon={FileText}
              title={t.inbox.requests.noRequests}
              description={t.inbox.requests.subtitle}
            />
          ) : (
            <div className="space-y-3">
              {taskRequests.map((req) => (
                <Card
                  key={req.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    req.status === "new" ? "border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedRequest(req.id);
                    setIsRequestDetailOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-medium mb-1">{req.title}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              requestTypeLabels[req.requestType]?.color ?? "bg-gray-100"
                            }`}
                          >
                            {requestTypeLabels[req.requestType]?.label ?? req.requestType}
                          </span>
                          <Badge variant={urgencyConfig[req.urgency]?.variant ?? "secondary"}>
                            {urgencyConfig[req.urgency]?.label ?? req.urgency}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={statusConfig[req.status]?.variant ?? "outline"}>
                        {statusConfig[req.status]?.label ?? req.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {req.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>
                            {req.requesterName} ({req.requesterTeam})
                          </span>
                        </div>
                        {req.deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Deadline: {format(new Date(req.deadline), "MMM d")}</span>
                          </div>
                        )}
                      </div>
                      {req.assignedTo && (
                        <span className="text-primary">
                          Assigned: {req.assignedTo.name}
                        </span>
                      )}
                    </div>

                    {req.relatedTask && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          Task: {req.relatedTask.title} ({req.relatedTask.status})
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Opportunity Detail Modal */}
      <Dialog open={isOpportunityDetailOpen} onOpenChange={setIsOpportunityDetailOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-2xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          {selectedOpp && (
            <>
              <DialogHeader>
                <DialogTitle>{t.inbox.opportunities.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        opportunityTypeLabels[selectedOpp.type]?.color ?? "bg-gray-100"
                      }`}
                    >
                      {opportunityTypeLabels[selectedOpp.type]?.label ?? selectedOpp.type}
                    </span>
                    <Badge variant={statusConfig[selectedOpp.status]?.variant ?? "outline"}>
                      {statusConfig[selectedOpp.status]?.label ?? selectedOpp.status}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Submitter</Label>
                    <p className="mt-1">{selectedOpp.submitterName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Team</Label>
                    <p className="mt-1 capitalize">{selectedOpp.submitterTeam}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Urgency</Label>
                    <p className="mt-1">{urgencyConfig[selectedOpp.urgency]?.label}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Consent Status</Label>
                    <p className="mt-1 capitalize">{selectedOpp.consentStatus}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="mt-2 p-3 bg-muted/50 rounded-md text-sm">{selectedOpp.description}</p>
                </div>

                {selectedOpp.assignedTo && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Assigned To</Label>
                    <p className="mt-1">{selectedOpp.assignedTo.name}</p>
                  </div>
                )}

                {/* Comments */}
                {selectedOpp.comments && selectedOpp.comments.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Comments ({selectedOpp.comments.length})
                    </Label>
                    <div className="space-y-2">
                      {selectedOpp.comments.map((comment) => (
                        <div key={comment.id} className="p-2 bg-muted/50 rounded text-sm">
                          {comment.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOpp.status === "new" && (
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.inbox.opportunities.assignTo}</Label>
                    <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t.inbox.opportunities.assignTo} />
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
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {selectedOpp.status === "new" && (
                  <>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleDeclineOpportunity(selectedOpp.id)}
                      disabled={updateOpportunity.isPending}
                    >
                      <XCircle className="w-4 h-4" />
                      {t.tasks.requests.reject}
                    </Button>
                    <Button
                      className="gap-2"
                      onClick={() => {
                        if (!selectedAssignee) {
                          toast.error(t.inbox.opportunities.assignTo);
                          return;
                        }
                        handleAcceptOpportunity(selectedOpp.id, selectedAssignee);
                      }}
                      disabled={updateOpportunity.isPending || !selectedAssignee}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t.tasks.requests.approve}
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setIsOpportunityDetailOpen(false)}>
                  {t.common.close}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Request Detail Modal */}
      <Dialog open={isRequestDetailOpen} onOpenChange={setIsRequestDetailOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-2xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          {selectedReq && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReq.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        requestTypeLabels[selectedReq.requestType]?.color ?? "bg-gray-100"
                      }`}
                    >
                      {requestTypeLabels[selectedReq.requestType]?.label ?? selectedReq.requestType}
                    </span>
                    <Badge variant={statusConfig[selectedReq.status]?.variant ?? "outline"}>
                      {statusConfig[selectedReq.status]?.label ?? selectedReq.status}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Requester</Label>
                    <p className="mt-1">{selectedReq.requesterName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Team</Label>
                    <p className="mt-1 capitalize">{selectedReq.requesterTeam}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Urgency</Label>
                    <p className="mt-1">{urgencyConfig[selectedReq.urgency]?.label}</p>
                  </div>
                  {selectedReq.deadline && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Deadline</Label>
                      <p className="mt-1">{format(new Date(selectedReq.deadline), "MMM d, yyyy")}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="mt-2 p-3 bg-muted/50 rounded-md text-sm">{selectedReq.description}</p>
                </div>

                {selectedReq.assignedTo && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Assigned To</Label>
                    <p className="mt-1">{selectedReq.assignedTo.name}</p>
                  </div>
                )}

                {selectedReq.relatedTask && (
                  <div className="p-3 bg-green-50 rounded-md">
                    <Label className="text-sm text-muted-foreground">Related Task</Label>
                    <p className="mt-1 font-medium">{selectedReq.relatedTask.title}</p>
                    <Badge variant="secondary" className="mt-1">
                      {selectedReq.relatedTask.status}
                    </Badge>
                  </div>
                )}

                {selectedReq.status === "new" && (
                  <div>
                    <Label className="text-sm text-muted-foreground">{t.inbox.opportunities.assignTo}</Label>
                    <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t.inbox.opportunities.assignTo} />
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
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {selectedReq.status === "new" && (
                  <>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => declineRequest.mutate({ id: selectedReq.id })}
                      disabled={declineRequest.isPending}
                    >
                      <XCircle className="w-4 h-4" />
                      {t.tasks.requests.reject}
                    </Button>
                    <Button
                      className="gap-2"
                      onClick={handleAcceptRequest}
                      disabled={acceptRequest.isPending || !selectedAssignee}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t.tasks.requests.approve} & {t.inbox.opportunities.createTask}
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setIsRequestDetailOpen(false)}>
                  {t.common.close}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
