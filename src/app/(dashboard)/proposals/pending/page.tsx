"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  User,
  Filter,
  ArrowRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";

type ProposalPriority = "urgent" | "high" | "normal" | "low";
type LayerFilter = "all" | "layer1" | "layer2";

const getPriorityConfig = (t: ReturnType<typeof useLanguage>["t"]) => ({
  urgent: { label: t.tasks.priorities.urgent, color: "border-red-500 text-red-500 bg-red-50" },
  high: { label: t.tasks.priorities.high, color: "border-red-500 text-red-500 bg-red-50" },
  normal: { label: t.tasks.priorities.medium, color: "border-blue-500 text-blue-500 bg-blue-50" },
  low: { label: t.tasks.priorities.low, color: "border-gray-500 text-gray-500 bg-gray-50" },
});

export default function PendingApprovalPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const priorityConfig = getPriorityConfig(t);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [layerFilter, setLayerFilter] = useState<LayerFilter>("all");

  const utils = trpc.useUtils();

  // Check if user can approve at different layers
  const isAdmin = profile?.role === "super_admin" || profile?.role === "admin";
  const isManager = profile?.role === "marketing_manager" || isAdmin;

  // Fetch pending approvals with layer filter
  const { data: pendingProposals, isLoading, error, refetch } =
    trpc.proposal.getPendingApprovals.useQuery({ layerFilter });

  // Fetch detail of selected proposal
  const { data: selectedProposal } = trpc.proposal.getById.useQuery(
    { id: selectedProposalId ?? "" },
    { enabled: !!selectedProposalId && isDetailOpen }
  );

  // Mutations
  const approveMutation = trpc.proposal.approve.useMutation({
    onSuccess: () => {
      utils.proposal.getPendingApprovals.invalidate();
      utils.proposal.getById.invalidate();
      utils.proposal.getMyProposals.invalidate();
      setIsDetailOpen(false);
      setFeedback("");
      toast.success("Proposal da duoc phe duyet");
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = trpc.proposal.reject.useMutation({
    onSuccess: () => {
      utils.proposal.getPendingApprovals.invalidate();
      utils.proposal.getById.invalidate();
      utils.proposal.getMyProposals.invalidate();
      setIsDetailOpen(false);
      setFeedback("");
      toast.success("Proposal da bi tu choi");
    },
    onError: (err) => toast.error(err.message),
  });

  const openDetail = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setIsDetailOpen(true);
    setFeedback("");
  };

  const handleApprove = () => {
    if (!selectedProposalId) return;
    approveMutation.mutate({
      proposalId: selectedProposalId,
      comments: feedback || undefined,
    });
  };

  const handleReject = () => {
    if (!selectedProposalId) return;
    if (!feedback.trim()) {
      toast.error("Vui long nhap ly do tu choi");
      return;
    }
    rejectMutation.mutate({
      proposalId: selectedProposalId,
      comments: feedback,
    });
  };

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  const proposals = pendingProposals ?? [];

  const highPriorityCount = proposals.filter(
    (p) => p.priority === "high" || p.priority === "urgent"
  ).length;

  // Calculate total budget across pending proposals
  const totalBudget = proposals.reduce((sum, p) => sum + (p.budget ?? 0), 0);
  const totalBudgetDisplay = totalBudget > 0
    ? new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 0 }).format(totalBudget)
    : "0";

  // Calculate layer-specific counts
  const layer1Count = proposals.filter(
    (p) => (p as unknown as { currentLayer: number }).currentLayer === 1
  ).length;
  const layer2Count = proposals.filter(
    (p) => (p as unknown as { currentLayer: number }).currentLayer === 2
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.proposals.pending.title}</h1>
          <p className="text-muted-foreground">
            {t.proposals.pending.subtitle}
          </p>
        </div>

        {/* Layer Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={layerFilter} onValueChange={(v) => setLayerFilter(v as LayerFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Loc theo layer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca ({proposals.length})</SelectItem>
              {isManager && <SelectItem value="layer1">Layer 1 - Manager ({layer1Count})</SelectItem>}
              {isAdmin && <SelectItem value="layer2">Layer 2 - Admin ({layer2Count})</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{proposals.length}</p>
              <p className="text-sm text-muted-foreground">{t.common.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={layerFilter === "layer1" ? "ring-2 ring-blue-500" : ""}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{layer1Count}</p>
              <p className="text-sm text-muted-foreground">Layer 1 (Manager)</p>
            </div>
          </CardContent>
        </Card>
        <Card className={layerFilter === "layer2" ? "ring-2 ring-purple-500" : ""}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{layer2Count}</p>
              <p className="text-sm text-muted-foreground">Layer 2 (Admin)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBudgetDisplay}</p>
              <p className="text-sm text-muted-foreground">{t.analytics.budget.totalBudget}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proposals List */}
      {proposals.length === 0 ? (
        <PageEmpty
          icon={CheckCircle}
          title={t.proposals.pending.noPending}
          description={t.proposals.pending.subtitle}
        />
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const priority = proposal.priority as ProposalPriority;
            const priorityInfo = priorityConfig[priority] ?? priorityConfig.normal;

            // Calculate approval progress
            const totalApprovals = proposal.approvals?.length ?? 0;
            const approvedCount = proposal.approvals?.filter(
              (a) => a.status === "approved"
            ).length ?? 0;
            const approvalProgress =
              totalApprovals > 0 ? (approvedCount / totalApprovals) * 100 : 0;

            // Get current layer info
            const currentLayer = (proposal as unknown as { currentLayer: number }).currentLayer || 1;
            const totalLayers = (proposal as unknown as { totalLayers: number }).totalLayers || 1;

            return (
              <Card
                key={proposal.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  priority === "high" || priority === "urgent"
                    ? "border-l-4 border-l-red-500"
                    : currentLayer === 2
                    ? "border-l-4 border-l-purple-500"
                    : "border-l-4 border-l-blue-500"
                }`}
                onClick={() => openDetail(proposal.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={currentLayer === 1
                            ? "border-blue-500 text-blue-500 bg-blue-50"
                            : "border-purple-500 text-purple-500 bg-purple-50"
                          }
                        >
                          Layer {currentLayer}/{totalLayers}
                        </Badge>
                        <Badge variant="outline" className={priorityInfo.color}>
                          {priorityInfo.label}
                        </Badge>
                        <Badge variant="secondary">{proposal.category}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {proposal.creator.name}
                        </span>
                        {proposal.budget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {new Intl.NumberFormat("vi-VN").format(proposal.budget)} VND
                          </span>
                        )}
                        {proposal.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(proposal.dueDate), "dd/MM/yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <div className="w-40">
                        <p className="text-xs text-muted-foreground mb-1 text-right">
                          Layer {currentLayer} of {totalLayers}
                        </p>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 flex-1 rounded-full ${
                            currentLayer >= 1 ? "bg-blue-500" : "bg-gray-200"
                          }`} />
                          {totalLayers === 2 && (
                            <>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <div className={`h-2 flex-1 rounded-full ${
                                currentLayer >= 2 ? "bg-purple-500" : "bg-gray-200"
                              }`} />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(proposal.id);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t.proposals.pending.reject}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(proposal.id);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t.proposals.pending.approve}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-[700px] w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          {selectedProposal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={
                      (priorityConfig[selectedProposal.priority as ProposalPriority] ??
                        priorityConfig.normal
                      ).color
                    }
                  >
                    {(priorityConfig[selectedProposal.priority as ProposalPriority] ??
                      priorityConfig.normal
                    ).label}
                  </Badge>
                  <Badge variant="secondary">{selectedProposal.category}</Badge>
                </div>
                <DialogTitle>{selectedProposal.title}</DialogTitle>
                <DialogDescription>
                  {t.proposals.submittedBy} {selectedProposal.creator.name} {t.proposals.submittedAt}{" "}
                  {format(new Date(selectedProposal.createdAt), "dd/MM/yyyy")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label className="text-muted-foreground">{t.proposals.new.proposalDescription}</Label>
                  <p className="mt-1">{selectedProposal.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProposal.budget && (
                    <div>
                      <Label className="text-muted-foreground">{t.analytics.budget.title}</Label>
                      <p className="mt-1 text-lg font-semibold">
                        {new Intl.NumberFormat("vi-VN").format(selectedProposal.budget)} VND
                      </p>
                    </div>
                  )}
                  {selectedProposal.dueDate && (
                    <div>
                      <Label className="text-muted-foreground">{t.tasks.dueDate}</Label>
                      <p className="mt-1">
                        {format(new Date(selectedProposal.dueDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">{t.proposals.submittedBy}</Label>
                  <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar>
                      <AvatarImage src={selectedProposal.creator.avatar ?? ""} />
                      <AvatarFallback>
                        {selectedProposal.creator.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedProposal.creator.name}</p>
                    </div>
                  </div>
                </div>
                {selectedProposal.approvals && selectedProposal.approvals.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">{t.proposals.reviewedBy}</Label>
                    <div className="mt-2 space-y-2">
                      {selectedProposal.approvals.map((approver) => (
                        <div
                          key={approver.id}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <span>{approver.approver.name}</span>
                          <Badge
                            variant={
                              approver.status === "approved"
                                ? "default"
                                : approver.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {approver.status === "approved"
                              ? t.proposals.statuses.approved
                              : approver.status === "rejected"
                              ? t.proposals.statuses.rejected
                              : approver.status === "revision_requested"
                              ? t.proposals.statuses.needsRevision
                              : t.common.pending}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="feedback">{t.proposals.pending.addComment}</Label>
                  <Textarea
                    id="feedback"
                    placeholder={t.proposals.pending.addComment}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  {t.common.close}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {rejectMutation.isPending ? t.common.loading : t.proposals.pending.reject}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {approveMutation.isPending ? t.common.loading : t.proposals.pending.approve}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
