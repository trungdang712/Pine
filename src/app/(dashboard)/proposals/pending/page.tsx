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
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";

type ProposalPriority = "urgent" | "high" | "normal" | "low";

const priorityConfig: Record<ProposalPriority, { label: string; color: string }> = {
  urgent: { label: "Khẩn cấp", color: "border-red-500 text-red-500 bg-red-50" },
  high: { label: "Uu tien cao", color: "border-red-500 text-red-500 bg-red-50" },
  normal: { label: "Binh thuong", color: "border-blue-500 text-blue-500 bg-blue-50" },
  low: { label: "Thap", color: "border-gray-500 text-gray-500 bg-gray-50" },
};

export default function PendingApprovalPage() {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const utils = trpc.useUtils();

  // Fetch pending approvals
  const { data: pendingProposals, isLoading, error, refetch } =
    trpc.proposal.getPendingApprovals.useQuery();

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

  if (isLoading) return <PageLoading text="Dang tai danh sach cho duyet..." />;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cho duyet</h1>
        <p className="text-muted-foreground">
          Co {proposals.length} de xuat dang cho ban duyet
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{proposals.length}</p>
              <p className="text-sm text-muted-foreground">Cho duyet</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highPriorityCount}</p>
              <p className="text-sm text-muted-foreground">Uu tien cao</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBudgetDisplay}</p>
              <p className="text-sm text-muted-foreground">Tong budget</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proposals List */}
      {proposals.length === 0 ? (
        <PageEmpty
          icon={CheckCircle}
          title="Khong co de xuat nao cho duyet"
          description="Tat ca de xuat da duoc xu ly. Kiem tra lai sau."
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

            return (
              <Card
                key={proposal.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  priority === "high" || priority === "urgent"
                    ? "border-l-4 border-l-red-500"
                    : ""
                }`}
                onClick={() => openDetail(proposal.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                      <div className="w-32">
                        <p className="text-xs text-muted-foreground mb-1 text-right">
                          Tien do duyet
                        </p>
                        <Progress value={approvalProgress} className="h-2" />
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
                          Tu choi
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
                          Duyet
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
        <DialogContent className="sm:max-w-[700px]">
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
                  Gui boi {selectedProposal.creator.name} vao{" "}
                  {format(new Date(selectedProposal.createdAt), "dd/MM/yyyy")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label className="text-muted-foreground">Mo ta chi tiet</Label>
                  <p className="mt-1">{selectedProposal.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProposal.budget && (
                    <div>
                      <Label className="text-muted-foreground">Ngan sach de xuat</Label>
                      <p className="mt-1 text-lg font-semibold">
                        {new Intl.NumberFormat("vi-VN").format(selectedProposal.budget)} VND
                      </p>
                    </div>
                  )}
                  {selectedProposal.dueDate && (
                    <div>
                      <Label className="text-muted-foreground">Thoi gian thuc hien</Label>
                      <p className="mt-1">
                        {format(new Date(selectedProposal.dueDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Nguoi gui</Label>
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
                    <Label className="text-muted-foreground">Nguoi duyet khac</Label>
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
                              ? "Da duyet"
                              : approver.status === "rejected"
                              ? "Tu choi"
                              : approver.status === "revision_requested"
                              ? "Yeu cau sua"
                              : "Cho duyet"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="feedback">Ghi chu / Phan hoi</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Nhap ghi chu hoac ly do tu choi (neu co)..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Dong
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {rejectMutation.isPending ? "Dang xu ly..." : "Tu choi"}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {approveMutation.isPending ? "Dang xu ly..." : "Phe duyet"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
