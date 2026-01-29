"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle, XCircle, MessageSquare, ArrowRight, User, FileText, BarChart3, Send, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type ProposalStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "in_progress" | "completed";
type ProposalCategory = "content" | "design" | "video" | "campaign" | "event" | "partnership";
type ProposalPriority = "urgent" | "high" | "normal" | "low";

const getStatusConfig = (t: ReturnType<typeof useLanguage>["t"]) => ({
  draft: { label: t.proposals.statuses.draft, variant: "outline" as const },
  submitted: { label: t.proposals.statuses.submitted, variant: "secondary" as const },
  under_review: { label: t.proposals.statuses.underReview, variant: "secondary" as const },
  approved: { label: t.proposals.statuses.approved, variant: "default" as const },
  rejected: { label: t.proposals.statuses.rejected, variant: "destructive" as const },
  in_progress: { label: t.common.inProgress, variant: "default" as const },
  completed: { label: t.common.completed, variant: "default" as const },
});

const categoryLabels: Record<ProposalCategory, string> = {
  content: "Content",
  design: "Design",
  video: "Video",
  campaign: "Campaign",
  event: "Event",
  partnership: "Partnership",
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
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | "revision">("approve");
  const [approvalComment, setApprovalComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("proposals");

  // New proposal form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<ProposalCategory>("content");
  const [newPriority, setNewPriority] = useState<ProposalPriority>("normal");
  const [newBudget, setNewBudget] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // New idea form states
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [ideaCategory, setIdeaCategory] = useState<"content_format" | "process_improvement" | "new_platform" | "campaign_concept" | "automation">("content_format");

  const utils = trpc.useUtils();

  // Fetch proposals
  const { data: proposalsData, isLoading, error, refetch } = trpc.proposal.getMyProposals.useQuery();

  // Fetch proposal details when selected
  const { data: selectedProposal } = trpc.proposal.getById.useQuery(
    { id: selectedProposalId ?? "" },
    { enabled: !!selectedProposalId && isDetailOpen }
  );

  // Fetch innovation ideas
  const { data: innovationIdeas = [] } = trpc.gamification.getMyIdeas.useQuery();

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

  const submitIdea = trpc.gamification.submitIdea.useMutation({
    onSuccess: () => {
      utils.gamification.getMyIdeas.invalidate();
      setIsNewIdeaOpen(false);
      setIdeaTitle("");
      setIdeaDescription("");
      setIdeaCategory("content_format");
      toast.success("Ý tưởng đã được gửi! +30 điểm");
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
    underReview: proposals.filter(p => ["submitted", "under_review"].includes(p.status)).length,
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

  const handleSubmitIdea = () => {
    if (!ideaTitle.trim() || !ideaDescription.trim()) {
      toast.error("Vui lòng nhập tiêu đề và mô tả");
      return;
    }
    submitIdea.mutate({
      title: ideaTitle,
      description: ideaDescription,
      category: ideaCategory,
    });
  };

  const isManager = profile?.role === "super_admin" || profile?.role === "admin" || profile?.role === "marketing_manager";

  // Check if current user can approve
  const canApprove = isManager && selectedProposal?.approvals?.some(
    a => a.approverId === profile?.id && a.status === "pending"
  );

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  const renderInnovationIdeas = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{t.proposals.ideas.title}</h2>
          <p className="text-muted-foreground text-sm">{t.proposals.ideas.subtitle}</p>
        </div>
        <Button className="gap-2" onClick={() => setIsNewIdeaOpen(true)}>
          <Plus className="w-4 h-4" />
          {t.proposals.ideas.submitIdea}
        </Button>
      </div>

      {innovationIdeas.length === 0 ? (
        <PageEmpty
          icon={Lightbulb}
          title={t.proposals.ideas.noIdeas}
          description={t.proposals.ideas.subtitle}
          action={{ label: t.proposals.ideas.submitIdea, onClick: () => setIsNewIdeaOpen(true) }}
        />
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {innovationIdeas.map((idea) => (
                <div key={idea.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{idea.title}</h3>
                        {idea.status === "implemented" && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{idea.description}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">{idea.category}</Badge>
                        <span>{format(new Date(idea.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    {idea.status === "implemented" && idea.impactScore && (
                      <div className="text-right">
                        <div className="text-sm font-medium">Impact: {idea.impactScore}/10</div>
                        <div className="text-sm text-green-500">+50 points</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <Badge variant={idea.status === "implemented" ? "default" : "secondary"}>
                      {idea.status === "implemented" ? "Implemented" :
                       idea.status === "reviewing" ? "Reviewing" :
                       idea.status === "approved" ? "Approved" : "Submitted"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );

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

                  {["submitted", "under_review"].includes(proposal.status) && proposal.approvals && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{t.proposals.status}</span>
                        <span className="text-muted-foreground">
                          {proposal.approvals.filter(a => a.status === "approved").length}/{proposal.approvals.length}
                        </span>
                      </div>
                      <Progress
                        value={(proposal.approvals.filter(a => a.status === "approved").length / proposal.approvals.length) * 100}
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="proposals">{t.proposals.title}</TabsTrigger>
          <TabsTrigger value="ideas">{t.proposals.ideas.title}</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals">
          {renderProposalsList()}
        </TabsContent>

        <TabsContent value="ideas">
          {renderInnovationIdeas()}
        </TabsContent>
      </Tabs>

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

                {/* Approval Workflow */}
                {selectedProposal.approvals && selectedProposal.approvals.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-3 block">Approval Workflow</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedProposal.approvals.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                          <div className={`p-3 rounded border min-w-[150px] ${
                            step.status === "approved"
                              ? "border-green-500 bg-green-50"
                              : step.status === "rejected"
                              ? "border-red-500 bg-red-50"
                              : step.status === "revision_requested"
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-border"
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                step.status === "approved"
                                  ? "bg-green-500 text-white"
                                  : step.status === "rejected"
                                  ? "bg-red-500 text-white"
                                  : step.status === "revision_requested"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-muted"
                              }`}>
                                {step.status === "approved" ? <CheckCircle className="w-4 h-4" /> :
                                 step.status === "rejected" ? <XCircle className="w-4 h-4" /> : step.stepNumber}
                              </div>
                              <span className="text-sm font-medium">Step {step.stepNumber}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{step.approver.name}</p>
                            {step.comments && (
                              <p className="text-xs mt-1 italic">"{step.comments}"</p>
                            )}
                          </div>
                          {index < selectedProposal.approvals.length - 1 && (
                            <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      ))}
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
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* New Idea Modal */}
      <Dialog open={isNewIdeaOpen} onOpenChange={setIsNewIdeaOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-2xl w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.proposals.ideas.submitIdea}</DialogTitle>
            <DialogDescription>{t.proposals.ideas.subtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t.proposals.new.proposalTitle} *</Label>
              <Input
                placeholder={t.proposals.new.proposalTitle}
                className="mt-1"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>{t.proposals.new.category}</Label>
              <Select value={ideaCategory} onValueChange={(v) => setIdeaCategory(v as "content_format" | "process_improvement" | "new_platform" | "campaign_concept" | "automation")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content_format">Content Format</SelectItem>
                  <SelectItem value="process_improvement">Process Improvement</SelectItem>
                  <SelectItem value="new_platform">New Platform</SelectItem>
                  <SelectItem value="campaign_concept">Campaign Concept</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t.proposals.new.proposalDescription} *</Label>
              <Textarea
                placeholder={t.proposals.new.proposalDescription}
                rows={4}
                className="mt-1"
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewIdeaOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmitIdea} disabled={submitIdea.isPending}>
              {submitIdea.isPending ? t.common.loading : t.proposals.ideas.submitIdea}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
