"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle, XCircle, MessageSquare, ArrowRight, User, FileText, BarChart3, Send } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/i18n";

type ProposalStatus = "draft" | "submitted" | "layer1_review" | "layer2_review" | "approved" | "rejected" | "in_progress" | "completed";
type ProposalCategory = "content" | "design" | "video" | "budget" | "campaign" | "event" | "partnership";
type ProposalPriority = "urgent" | "high" | "normal" | "low";

// Categories that require 2-layer approval
const TWO_LAYER_CATEGORIES = ["budget", "campaign", "event", "partnership"];

const getStatusConfig = (t: ReturnType<typeof useLanguage>["t"]) => ({
  draft: { label: t.proposals.statuses.draft, variant: "outline" as const },
  submitted: { label: t.proposals.statuses.submitted, variant: "secondary" as const },
  layer1_review: { label: "Layer 1 Review", variant: "secondary" as const },
  layer2_review: { label: "Layer 2 Review", variant: "secondary" as const },
  approved: { label: t.proposals.statuses.approved, variant: "default" as const },
  rejected: { label: t.proposals.statuses.rejected, variant: "destructive" as const },
  in_progress: { label: t.common.inProgress, variant: "default" as const },
  completed: { label: t.common.completed, variant: "default" as const },
});

// Updated categories with layer info
const CATEGORIES = [
  // 1-layer approval
  { value: "content", label: "Noi dung", layers: 1 },
  { value: "design", label: "Thiet ke", layers: 1 },
  { value: "video", label: "Video", layers: 1 },
  // 2-layer approval
  { value: "budget", label: "Ngan sach", layers: 2 },
  { value: "campaign", label: "Chien dich", layers: 2 },
  { value: "event", label: "Su kien", layers: 2 },
  { value: "partnership", label: "Hop tac", layers: 2 },
];

const categoryLabels: Record<ProposalCategory, string> = {
  content: "Noi dung",
  design: "Thiet ke",
  video: "Video",
  budget: "Ngan sach",
  campaign: "Chien dich",
  event: "Su kien",
  partnership: "Hop tac",
};

const getPriorityConfig = (t: ReturnType<typeof useLanguage>["t"]) => ({
  urgent: { label: t.tasks.priorities.urgent, variant: "destructive" as const },
  high: { label: t.tasks.priorities.high, variant: "destructive" as const },
  normal: { label: t.tasks.priorities.medium, variant: "secondary" as const },
  low: { label: t.tasks.priorities.low, variant: "secondary" as const },
});

export default function ProposalsPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();

  const statusConfig = getStatusConfig(t);
  const priorityConfig = getPriorityConfig(t);

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | "revision">("approve");
  const [approvalComment, setApprovalComment] = useState("");
  const [newComment, setNewComment] = useState("");

  // New proposal form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<ProposalCategory>("content");
  const [newPriority, setNewPriority] = useState<ProposalPriority>("normal");
  const [newBudget, setNewBudget] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const utils = trpc.useUtils();

  // Fetch proposals
  const { data: proposalsData, isLoading, error, refetch } = trpc.proposal.getMyProposals.useQuery();

  // Fetch proposal details when selected
  const { data: selectedProposal } = trpc.proposal.getById.useQuery(
    { id: selectedProposalId ?? "" },
    { enabled: !!selectedProposalId && isDetailOpen }
  );

  // Mutations
  const createProposal = trpc.proposal.create.useMutation({
    onSuccess: () => {
      utils.proposal.getMyProposals.invalidate();
      setIsNewProposalOpen(false);
      resetNewProposalForm();
      toast.success("Proposal đã được tạo thành công");
    },
    onError: (error) => toast.error(error.message),
  });

  const submitProposal = trpc.proposal.submit.useMutation({
    onSuccess: () => {
      utils.proposal.getMyProposals.invalidate();
      utils.proposal.getById.invalidate();
      toast.success("Proposal đã được gửi để duyệt");
    },
    onError: (error) => toast.error(error.message),
  });

  const approveProposal = trpc.proposal.approve.useMutation({
    onSuccess: () => {
      utils.proposal.getMyProposals.invalidate();
      utils.proposal.getById.invalidate();
      setIsApprovalModalOpen(false);
      setApprovalComment("");
      toast.success("Proposal đã được duyệt");
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectProposal = trpc.proposal.reject.useMutation({
    onSuccess: () => {
      utils.proposal.getMyProposals.invalidate();
      utils.proposal.getById.invalidate();
      setIsApprovalModalOpen(false);
      setApprovalComment("");
      toast.success("Proposal đã bị từ chối");
    },
    onError: (error) => toast.error(error.message),
  });

  const requestRevision = trpc.proposal.requestRevision.useMutation({
    onSuccess: () => {
      utils.proposal.getMyProposals.invalidate();
      utils.proposal.getById.invalidate();
      setIsApprovalModalOpen(false);
      setApprovalComment("");
      toast.success("Đã yêu cầu chỉnh sửa");
    },
    onError: (error) => toast.error(error.message),
  });

  const addComment = trpc.proposal.addComment.useMutation({
    onSuccess: () => {
      utils.proposal.getById.invalidate();
      setNewComment("");
      toast.success("Comment đã được thêm");
    },
    onError: (error) => toast.error(error.message),
  });

  const resetNewProposalForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewCategory("content");
    setNewPriority("normal");
    setNewBudget("");
    setNewDueDate("");
  };

  const proposals = proposalsData ?? [];

  const stats = {
    total: proposals.length,
    underReview: proposals.filter(p => ["submitted", "layer1_review", "layer2_review"].includes(p.status)).length,
    approved: proposals.filter(p => p.status === "approved").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
  };

  const handleProposalClick = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setIsDetailOpen(true);
  };

  const handleApprovalAction = (action: "approve" | "reject" | "revision") => {
    setApprovalAction(action);
    setIsApprovalModalOpen(true);
  };

  const handleSubmitApproval = () => {
    if (!selectedProposalId) return;

    if (approvalAction === "approve") {
      approveProposal.mutate({ proposalId: selectedProposalId, comments: approvalComment || undefined });
    } else if (approvalAction === "reject") {
      if (!approvalComment.trim()) {
        toast.error("Vui lòng nhập lý do từ chối");
        return;
      }
      rejectProposal.mutate({ proposalId: selectedProposalId, comments: approvalComment });
    } else if (approvalAction === "revision") {
      if (!approvalComment.trim()) {
        toast.error("Vui lòng nhập yêu cầu chỉnh sửa");
        return;
      }
      requestRevision.mutate({ proposalId: selectedProposalId, comments: approvalComment });
    }
  };

  const handleCreateProposal = (submit: boolean) => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Vui lòng nhập tiêu đề và mô tả");
      return;
    }

    createProposal.mutate(
      {
        title: newTitle,
        description: newDescription,
        category: newCategory,
        priority: newPriority,
        budget: newBudget ? parseFloat(newBudget.replace(/[^0-9]/g, "")) : undefined,
        dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      },
      {
        onSuccess: (data) => {
          if (submit && data.id) {
            submitProposal.mutate({ id: data.id });
          }
        },
      }
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedProposalId) return;
    addComment.mutate({ proposalId: selectedProposalId, content: newComment });
  };

  const isManager = profile?.role === "super_admin" || profile?.role === "admin" || profile?.role === "marketing_manager";

  // Check if current user can approve
  const canApprove = isManager && selectedProposal?.approvals?.some(
    a => a.approverId === profile?.id && a.status === "pending"
  );

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  const renderProposalsList = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t.proposals.title}</h1>
          <p className="text-muted-foreground text-sm">{t.proposals.subtitle}</p>
        </div>
        <Button className="gap-2" onClick={() => setIsNewProposalOpen(true)}>
          <Plus className="w-4 h-4" />
          {t.proposals.createProposal}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-semibold">{stats.underReview}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-semibold">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-semibold">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {proposals.length === 0 ? (
        <PageEmpty
          icon={FileText}
          title={t.proposals.noProposals}
          description={t.proposals.subtitle}
          action={{ label: t.proposals.createProposal, onClick: () => setIsNewProposalOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProposalClick(proposal.id)}
            >
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">#{proposal.id.slice(0, 8)} | {proposal.title}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline">{categoryLabels[proposal.category as ProposalCategory]}</Badge>
                        <Badge variant={priorityConfig[proposal.priority as ProposalPriority]?.variant ?? "secondary"}>
                          {priorityConfig[proposal.priority as ProposalPriority]?.label ?? proposal.priority}
                        </Badge>
                        {proposal.budget && (
                          <span className="text-sm text-muted-foreground">
                            Budget: {new Intl.NumberFormat('vi-VN').format(proposal.budget)} VND
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={statusConfig[proposal.status as ProposalStatus]?.variant ?? "outline"}>
                      {statusConfig[proposal.status as ProposalStatus]?.label ?? proposal.status}
                    </Badge>
                  </div>

                  {["layer1_review", "layer2_review"].includes(proposal.status) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Dang o: Layer {(proposal as unknown as { currentLayer: number }).currentLayer || 1} / {(proposal as unknown as { totalLayers: number }).totalLayers || 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {(proposal as unknown as { currentLayer: number }).currentLayer === 1 ? "Manager Review" : "Admin Review"}
                        </Badge>
                      </div>
                      <Progress
                        value={((proposal as unknown as { currentLayer: number }).currentLayer || 1) / ((proposal as unknown as { totalLayers: number }).totalLayers || 1) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {proposal.status === "approved" && (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>{t.proposals.statuses.approved}</span>
                    </div>
                  )}

                  {proposal.status === "rejected" && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>{t.proposals.statuses.rejected}</span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(proposal.createdAt), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{proposal._count.comments}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleProposalClick(proposal.id); }}>
                      {t.common.view}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      {renderProposalsList()}

      {/* Proposal Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-4xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          {selectedProposal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">#{selectedProposal.id.slice(0, 8)} | {selectedProposal.title}</DialogTitle>
                <DialogDescription>
                  <Badge variant={statusConfig[selectedProposal.status as ProposalStatus]?.variant ?? "outline"} className="mt-2">
                    {statusConfig[selectedProposal.status as ProposalStatus]?.label ?? selectedProposal.status}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Proposal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Category</Label>
                    <p className="mt-1">{categoryLabels[selectedProposal.category as ProposalCategory]}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Priority</Label>
                    <p className="mt-1">{priorityConfig[selectedProposal.priority as ProposalPriority]?.label}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Submitted By</Label>
                    <p className="mt-1">{selectedProposal.creator.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Created Date</Label>
                    <p className="mt-1">{format(new Date(selectedProposal.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  {selectedProposal.budget && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Budget</Label>
                      <p className="mt-1 font-medium">{new Intl.NumberFormat('vi-VN').format(selectedProposal.budget)} VND</p>
                    </div>
                  )}
                  {selectedProposal.dueDate && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Due Date</Label>
                      <p className="mt-1">{format(new Date(selectedProposal.dueDate), "MMM d, yyyy")}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="mt-2 text-sm p-3 bg-muted/50 rounded-md">{selectedProposal.description}</p>
                </div>

                {/* 2-Layer Approval Workflow Display */}
                {selectedProposal.approvals && selectedProposal.approvals.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-3 block">
                      Quy trinh duyet ({(selectedProposal as unknown as { totalLayers: number }).totalLayers || 1} lop)
                    </Label>
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Layer 1 */}
                      <div className={`p-4 rounded-lg border-2 min-w-[180px] ${
                        selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 1 && a.status === "approved").length > 0
                          ? "border-green-500 bg-green-50"
                          : selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 1 && a.status === "rejected").length > 0
                          ? "border-red-500 bg-red-50"
                          : (selectedProposal as unknown as { currentLayer: number }).currentLayer === 1
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 1 && a.status === "approved").length > 0
                              ? "bg-green-500 text-white"
                              : selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 1 && a.status === "rejected").length > 0
                              ? "bg-red-500 text-white"
                              : (selectedProposal as unknown as { currentLayer: number }).currentLayer === 1
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}>
                            {selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 1 && a.status === "approved").length > 0
                              ? <CheckCircle className="w-5 h-5" />
                              : selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 1 && a.status === "rejected").length > 0
                              ? <XCircle className="w-5 h-5" />
                              : "1"}
                          </div>
                          <span className="font-semibold">Layer 1: Manager</span>
                        </div>
                        <div className="space-y-1">
                          {selectedProposal.approvals
                            .filter(a => (a as unknown as { layer: number }).layer === 1)
                            .map(step => (
                              <div key={step.id} className="text-xs flex items-center justify-between">
                                <span>{step.approver.name}</span>
                                <Badge variant={
                                  step.status === "approved" ? "default" :
                                  step.status === "rejected" ? "destructive" : "secondary"
                                } className="text-xs">
                                  {step.status === "approved" ? "Da duyet" :
                                   step.status === "rejected" ? "Tu choi" :
                                   step.status === "revision_requested" ? "Yeu cau sua" : "Cho duyet"}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Arrow between layers (only show for 2-layer proposals) */}
                      {((selectedProposal as unknown as { totalLayers: number }).totalLayers || 1) === 2 && (
                        <>
                          <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />

                          {/* Layer 2 */}
                          <div className={`p-4 rounded-lg border-2 min-w-[180px] ${
                            selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 2 && a.status === "approved").length > 0
                              ? "border-green-500 bg-green-50"
                              : selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 2 && a.status === "rejected").length > 0
                              ? "border-red-500 bg-red-50"
                              : (selectedProposal as unknown as { currentLayer: number }).currentLayer === 2
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 2 && a.status === "approved").length > 0
                                  ? "bg-green-500 text-white"
                                  : selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 2 && a.status === "rejected").length > 0
                                  ? "bg-red-500 text-white"
                                  : (selectedProposal as unknown as { currentLayer: number }).currentLayer === 2
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-500"
                              }`}>
                                {selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 2 && a.status === "approved").length > 0
                                  ? <CheckCircle className="w-5 h-5" />
                                  : selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 2 && a.status === "rejected").length > 0
                                  ? <XCircle className="w-5 h-5" />
                                  : "2"}
                              </div>
                              <span className="font-semibold">Layer 2: Admin</span>
                            </div>
                            <div className="space-y-1">
                              {selectedProposal.approvals
                                .filter(a => (a as unknown as { layer: number }).layer === 2)
                                .map(step => (
                                  <div key={step.id} className="text-xs flex items-center justify-between">
                                    <span>{step.approver.name}</span>
                                    <Badge variant={
                                      step.status === "approved" ? "default" :
                                      step.status === "rejected" ? "destructive" : "secondary"
                                    } className="text-xs">
                                      {step.status === "approved" ? "Da duyet" :
                                       step.status === "rejected" ? "Tu choi" :
                                       step.status === "revision_requested" ? "Yeu cau sua" : "Cho duyet"}
                                    </Badge>
                                  </div>
                                ))}
                              {selectedProposal.approvals.filter(a => (a as unknown as { layer: number }).layer === 2).length === 0 && (
                                <p className="text-xs text-muted-foreground italic">Chua den buoc nay</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments & Feedback */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">
                    Comments & Feedback ({selectedProposal.comments?.length ?? 0})
                  </Label>
                  <div className="space-y-4 mb-4 max-h-[200px] overflow-y-auto">
                    {selectedProposal.comments?.map((comment) => (
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
                    {(!selectedProposal.comments || selectedProposal.comments.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t.common.noData}
                      </p>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.proposals.pending.addComment}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    />
                    <Button size="sm" className="gap-2" onClick={handleAddComment} disabled={addComment.isPending}>
                      <Send className="w-4 h-4" />
                      {t.common.submit}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {selectedProposal.status === "draft" && selectedProposal.creatorId === profile?.id && (
                    <Button
                      className="gap-2"
                      onClick={() => submitProposal.mutate({ id: selectedProposal.id })}
                      disabled={submitProposal.isPending}
                    >
                      <Send className="w-4 h-4" />
                      {t.proposals.submitProposal}
                    </Button>
                  )}
                  {canApprove && (
                    <>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleApprovalAction("revision")}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {t.proposals.pending.requestRevision}
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2 text-red-500 hover:text-red-600"
                        onClick={() => handleApprovalAction("reject")}
                      >
                        <XCircle className="w-4 h-4" />
                        {t.proposals.pending.reject}
                      </Button>
                      <Button
                        className="gap-2"
                        onClick={() => handleApprovalAction("approve")}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t.proposals.pending.approve}
                      </Button>
                    </>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  {t.common.close}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-lg w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? t.proposals.pending.approve :
               approvalAction === "reject" ? t.proposals.pending.reject : t.proposals.pending.requestRevision}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? t.proposals.pending.approve
                : approvalAction === "reject"
                ? t.proposals.pending.reject
                : t.proposals.pending.requestRevision}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t.proposals.pending.addComment} {approvalAction !== "approve" && "*"}</Label>
              <Textarea
                placeholder={t.proposals.pending.addComment}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant={approvalAction === "approve" ? "default" : approvalAction === "reject" ? "destructive" : "secondary"}
              onClick={handleSubmitApproval}
              disabled={approveProposal.isPending || rejectProposal.isPending || requestRevision.isPending}
            >
              {approvalAction === "approve" ? t.proposals.pending.approve : approvalAction === "reject" ? t.proposals.pending.reject : t.common.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Proposal Modal */}
      <Dialog open={isNewProposalOpen} onOpenChange={setIsNewProposalOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-3xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.proposals.new.title}</DialogTitle>
            <DialogDescription>{t.proposals.new.subtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t.proposals.new.proposalTitle} *</Label>
              <Input
                placeholder={t.proposals.new.proposalTitle}
                className="mt-1"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.proposals.new.category} *</Label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as ProposalCategory)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Noi dung (1 lop duyet)</SelectItem>
                    <SelectItem value="design">Thiet ke (1 lop duyet)</SelectItem>
                    <SelectItem value="video">Video (1 lop duyet)</SelectItem>
                    <SelectItem value="budget">Ngan sach (2 lop duyet)</SelectItem>
                    <SelectItem value="campaign">Chien dich (2 lop duyet)</SelectItem>
                    <SelectItem value="event">Su kien (2 lop duyet)</SelectItem>
                    <SelectItem value="partnership">Hop tac (2 lop duyet)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {TWO_LAYER_CATEGORIES.includes(newCategory)
                    ? "Danh muc nay can duyet 2 lop: Manager -> Admin"
                    : "Danh muc nay chi can duyet 1 lop: Manager"}
                </p>
              </div>

              <div>
                <Label>{t.tasks.priority}</Label>
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as ProposalPriority)}>
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
            </div>

            <div>
              <Label>{t.proposals.new.proposalDescription} *</Label>
              <Textarea
                placeholder={t.proposals.new.proposalDescription}
                rows={4}
                className="mt-1"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.analytics.budget.title} (VND)</Label>
                <Input
                  placeholder="VD: 30,000,000"
                  className="mt-1"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
              </div>

              <div>
                <Label>{t.tasks.dueDate}</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleCreateProposal(false)} disabled={createProposal.isPending}>
              {t.proposals.new.saveDraft}
            </Button>
            <Button onClick={() => handleCreateProposal(true)} disabled={createProposal.isPending}>
              {createProposal.isPending ? t.common.loading : t.proposals.new.submitForReview}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
