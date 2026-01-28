"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  MessageSquare,
} from "lucide-react";

interface PendingProposal {
  id: string;
  title: string;
  category: string;
  priority: "high" | "normal" | "low";
  description: string;
  budget: string;
  timeline: string;
  expectedOutcome: string;
  submittedAt: string;
  submittedBy: { name: string; avatar: string | null; role: string };
  approvalProgress: number;
  otherApprovers: { name: string; status: "pending" | "approved" | "rejected" }[];
}

const mockPendingProposals: PendingProposal[] = [
  {
    id: "1",
    title: "Campaign Tết Nguyên Đán 2024",
    category: "Marketing Campaign",
    priority: "high",
    description: "Chiến dịch marketing tổng hợp cho dịp Tết Nguyên Đán, bao gồm social media, email marketing và khuyến mãi đặc biệt cho các dịch vụ nha khoa.",
    budget: "50,000,000 VNĐ",
    timeline: "15/01 - 15/02/2024",
    expectedOutcome: "Tăng 30% lượt đặt lịch trong tháng 1-2, 500 leads mới",
    submittedAt: "2024-01-05",
    submittedBy: { name: "Nguyễn Văn A", avatar: null, role: "Content Creator" },
    approvalProgress: 50,
    otherApprovers: [
      { name: "Trần Thị B", status: "approved" },
      { name: "Lê Văn C", status: "pending" },
    ],
  },
  {
    id: "2",
    title: "Mua thêm thiết bị quay video",
    category: "Equipment",
    priority: "normal",
    description: "Đề xuất mua thêm 1 gimbal và 2 đèn softbox để nâng cao chất lượng video content.",
    budget: "12,000,000 VNĐ",
    timeline: "Tháng 1/2024",
    expectedOutcome: "Nâng cao chất lượng video, giảm thời gian edit",
    submittedAt: "2024-01-08",
    submittedBy: { name: "Phạm Văn D", avatar: null, role: "Video Producer" },
    approvalProgress: 0,
    otherApprovers: [
      { name: "Trần Thị B", status: "pending" },
    ],
  },
  {
    id: "3",
    title: "Hợp tác KOL tháng 2",
    category: "Partnership",
    priority: "high",
    description: "Hợp tác với 3 KOL trong lĩnh vực làm đẹp để quảng bá dịch vụ tẩy trắng răng và niềng răng trong suốt.",
    budget: "45,000,000 VNĐ",
    timeline: "01/02 - 28/02/2024",
    expectedOutcome: "200,000 reach, 800 leads, 50 đặt lịch",
    submittedAt: "2024-01-10",
    submittedBy: { name: "Lê Thị C", avatar: null, role: "Digital Marketing" },
    approvalProgress: 33,
    otherApprovers: [
      { name: "Nguyễn Văn A", status: "approved" },
      { name: "Trần Thị B", status: "pending" },
    ],
  },
];

const priorityConfig = {
  high: { label: "Ưu tiên cao", color: "border-red-500 text-red-500 bg-red-50" },
  normal: { label: "Bình thường", color: "border-blue-500 text-blue-500 bg-blue-50" },
  low: { label: "Thấp", color: "border-gray-500 text-gray-500 bg-gray-50" },
};

export default function PendingApprovalPage() {
  const [selectedProposal, setSelectedProposal] = useState<PendingProposal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const openDetail = (proposal: PendingProposal) => {
    setSelectedProposal(proposal);
    setIsDetailOpen(true);
    setFeedback("");
  };

  const handleApprove = () => {
    // Handle approve logic
    setIsDetailOpen(false);
  };

  const handleReject = () => {
    // Handle reject logic
    setIsDetailOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Chờ duyệt</h1>
        <p className="text-muted-foreground">
          Có {mockPendingProposals.length} đề xuất đang chờ bạn duyệt
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
              <p className="text-2xl font-bold">{mockPendingProposals.length}</p>
              <p className="text-sm text-muted-foreground">Chờ duyệt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockPendingProposals.filter((p) => p.priority === "high").length}
              </p>
              <p className="text-sm text-muted-foreground">Ưu tiên cao</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">107M</p>
              <p className="text-sm text-muted-foreground">Tổng budget</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proposals List */}
      <div className="space-y-4">
        {mockPendingProposals.map((proposal) => {
          const priorityInfo = priorityConfig[proposal.priority];

          return (
            <Card
              key={proposal.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                proposal.priority === "high" ? "border-l-4 border-l-red-500" : ""
              }`}
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
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {proposal.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {proposal.submittedBy.name} ({proposal.submittedBy.role})
                      </span>
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
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <div className="w-32">
                      <p className="text-xs text-muted-foreground mb-1 text-right">
                        Tiến độ duyệt
                      </p>
                      <Progress value={proposal.approvalProgress} className="h-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(proposal);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(proposal);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Duyệt
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
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
                </div>
                <DialogTitle>{selectedProposal.title}</DialogTitle>
                <DialogDescription>
                  Gửi bởi {selectedProposal.submittedBy.name} vào{" "}
                  {new Date(selectedProposal.submittedAt).toLocaleDateString("vi-VN")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label className="text-muted-foreground">Mô tả chi tiết</Label>
                  <p className="mt-1">{selectedProposal.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Ngân sách đề xuất</Label>
                    <p className="mt-1 text-lg font-semibold">{selectedProposal.budget}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Thời gian thực hiện</Label>
                    <p className="mt-1">{selectedProposal.timeline}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kết quả mong đợi</Label>
                  <p className="mt-1">{selectedProposal.expectedOutcome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Người gửi</Label>
                  <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar>
                      <AvatarImage src={selectedProposal.submittedBy.avatar ?? ""} />
                      <AvatarFallback>
                        {selectedProposal.submittedBy.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedProposal.submittedBy.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedProposal.submittedBy.role}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedProposal.otherApprovers.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Người duyệt khác</Label>
                    <div className="mt-2 space-y-2">
                      {selectedProposal.otherApprovers.map((approver, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
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
                <div>
                  <Label htmlFor="feedback">Ghi chú / Phản hồi</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Nhập ghi chú hoặc lý do từ chối (nếu có)..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Đóng
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Phê duyệt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
