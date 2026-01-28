"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

interface Proposal {
  id: string;
  title: string;
  category: string;
  priority: "high" | "normal" | "low";
  status: "draft" | "under-review" | "approved" | "rejected";
  description: string;
  budget: string;
  timeline: string;
  expectedOutcome: string;
  createdAt: string;
  approvalProgress: number;
  approvers: { name: string; status: "pending" | "approved" | "rejected" }[];
}

const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "Campaign Tết Nguyên Đán 2024",
    category: "Marketing Campaign",
    priority: "high",
    status: "under-review",
    description: "Chiến dịch marketing tổng hợp cho dịp Tết Nguyên Đán, bao gồm social media, email marketing và khuyến mãi đặc biệt.",
    budget: "50,000,000 VNĐ",
    timeline: "15/01 - 15/02/2024",
    expectedOutcome: "Tăng 30% lượt đặt lịch trong tháng 1-2",
    createdAt: "2024-01-05",
    approvalProgress: 66,
    approvers: [
      { name: "Nguyễn Văn A", status: "approved" },
      { name: "Trần Thị B", status: "approved" },
      { name: "Lê Văn C", status: "pending" },
    ],
  },
  {
    id: "2",
    title: "Video Series: Chăm sóc răng miệng tại nhà",
    category: "Content",
    priority: "normal",
    status: "approved",
    description: "Series 10 video ngắn hướng dẫn chăm sóc răng miệng cơ bản cho bệnh nhân.",
    budget: "15,000,000 VNĐ",
    timeline: "01/02 - 28/02/2024",
    expectedOutcome: "50,000 views, 2,000 followers mới",
    createdAt: "2024-01-02",
    approvalProgress: 100,
    approvers: [
      { name: "Nguyễn Văn A", status: "approved" },
      { name: "Trần Thị B", status: "approved" },
    ],
  },
  {
    id: "3",
    title: "Redesign Landing Page Implant",
    category: "Design",
    priority: "high",
    status: "draft",
    description: "Thiết kế lại trang landing page dịch vụ cấy ghép Implant với UX/UI mới.",
    budget: "8,000,000 VNĐ",
    timeline: "20/01 - 10/02/2024",
    expectedOutcome: "Tăng conversion rate lên 5%",
    createdAt: "2024-01-08",
    approvalProgress: 0,
    approvers: [],
  },
  {
    id: "4",
    title: "Influencer Partnership - Dr. Beauty",
    category: "Partnership",
    priority: "normal",
    status: "rejected",
    description: "Hợp tác với influencer Dr. Beauty để quảng bá dịch vụ niềng răng.",
    budget: "30,000,000 VNĐ",
    timeline: "01/02 - 31/03/2024",
    expectedOutcome: "100,000 reach, 500 leads",
    createdAt: "2024-01-01",
    approvalProgress: 0,
    approvers: [
      { name: "Nguyễn Văn A", status: "rejected" },
    ],
  },
];

const statusConfig = {
  draft: { label: "Bản nháp", color: "bg-gray-100 text-gray-700", icon: FileText },
  "under-review": { label: "Đang duyệt", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "Đã duyệt", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "Từ chối", color: "bg-red-100 text-red-700", icon: XCircle },
};

const priorityConfig = {
  high: { label: "Cao", color: "border-red-500 text-red-500" },
  normal: { label: "Bình thường", color: "border-blue-500 text-blue-500" },
  low: { label: "Thấp", color: "border-gray-500 text-gray-500" },
};

export default function ProposalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredProposals = statusFilter === "all"
    ? mockProposals
    : mockProposals.filter((p) => p.status === statusFilter);

  const stats = {
    total: mockProposals.length,
    underReview: mockProposals.filter((p) => p.status === "under-review").length,
    approved: mockProposals.filter((p) => p.status === "approved").length,
    rejected: mockProposals.filter((p) => p.status === "rejected").length,
  };

  const openDetail = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đề xuất của tôi</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi các đề xuất</p>
        </div>
        <Link href="/proposals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo đề xuất
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Tổng đề xuất</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.underReview}</p>
                <p className="text-sm text-muted-foreground">Đang duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Đã duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Từ chối</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="under-review">Đang duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => {
          const statusInfo = statusConfig[proposal.status];
          const priorityInfo = priorityConfig[proposal.priority];
          const StatusIcon = statusInfo.icon;

          return (
            <Card
              key={proposal.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetail(proposal)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={priorityInfo.color}>
                        {priorityInfo.label}
                      </Badge>
                      <Badge variant="secondary">{proposal.category}</Badge>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {proposal.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {proposal.budget}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {proposal.timeline}
                      </span>
                    </div>
                  </div>
                  {proposal.status === "under-review" && (
                    <div className="ml-4 w-32">
                      <p className="text-xs text-muted-foreground mb-1">Tiến độ duyệt</p>
                      <Progress value={proposal.approvalProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {proposal.approvers.filter((a) => a.status === "approved").length}/
                        {proposal.approvers.length} đã duyệt
                      </p>
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
        <DialogContent className="sm:max-w-[600px]">
          {selectedProposal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={priorityConfig[selectedProposal.priority].color}
                  >
                    {priorityConfig[selectedProposal.priority].label}
                  </Badge>
                  <Badge variant="secondary">{selectedProposal.category}</Badge>
                  <Badge className={statusConfig[selectedProposal.status].color}>
                    {statusConfig[selectedProposal.status].label}
                  </Badge>
                </div>
                <DialogTitle>{selectedProposal.title}</DialogTitle>
                <DialogDescription>
                  Tạo ngày {new Date(selectedProposal.createdAt).toLocaleDateString("vi-VN")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Mô tả</p>
                  <p>{selectedProposal.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Ngân sách</p>
                    <p className="font-semibold">{selectedProposal.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Thời gian</p>
                    <p>{selectedProposal.timeline}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Kết quả mong đợi</p>
                  <p>{selectedProposal.expectedOutcome}</p>
                </div>
                {selectedProposal.approvers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Người duyệt</p>
                    <div className="space-y-2">
                      {selectedProposal.approvers.map((approver, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span>{approver.name}</span>
                          <Badge
                            variant={
                              approver.status === "approved"
                                ? "success"
                                : approver.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {approver.status === "approved"
                              ? "Đã duyệt"
                              : approver.status === "rejected"
                              ? "Từ chối"
                              : "Chờ duyệt"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Đóng
                </Button>
                {selectedProposal.status === "draft" && (
                  <Button>Gửi duyệt</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
