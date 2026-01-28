"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Image,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";

interface TaskRequest {
  id: string;
  title: string;
  description: string;
  requester: string;
  requesterRole: string;
  type: "design" | "content" | "video" | "other";
  urgency: "urgent" | "high" | "normal" | "low";
  deadline: string;
  createdAt: string;
  attachments: number;
  notes?: string;
}

const mockRequests: TaskRequest[] = [
  {
    id: "1",
    title: "Thiết kế poster khuyến mãi Tết",
    description: "Cần poster A3 cho chương trình khuyến mãi Tết, giảm 20% tất cả dịch vụ. Style: festive, màu đỏ/vàng.",
    requester: "Nguyễn Văn Manager",
    requesterRole: "Sales Manager",
    type: "design",
    urgency: "urgent",
    deadline: "2024-01-15",
    createdAt: "2024-01-10",
    attachments: 2,
    notes: "Tham khảo poster năm ngoái trong thư mục Brand > Tết 2023",
  },
  {
    id: "2",
    title: "Viết bài SEO về dịch vụ tẩy trắng",
    description: "Bài viết 1500-2000 từ về dịch vụ tẩy trắng răng, target keyword: tẩy trắng răng HCM, làm trắng răng.",
    requester: "Dr. Hương",
    requesterRole: "Dentist",
    type: "content",
    urgency: "normal",
    deadline: "2024-01-20",
    createdAt: "2024-01-09",
    attachments: 1,
  },
  {
    id: "3",
    title: "Video giới thiệu bác sĩ mới",
    description: "Video 2-3 phút giới thiệu Dr. Minh, bác sĩ chỉnh nha mới. Cần phỏng vấn ngắn và footage tại phòng khám.",
    requester: "HR Department",
    requesterRole: "HR",
    type: "video",
    urgency: "low",
    deadline: "2024-01-25",
    createdAt: "2024-01-08",
    attachments: 0,
  },
  {
    id: "4",
    title: "Update menu giá dịch vụ 2024",
    description: "Cập nhật bảng giá dịch vụ mới cho năm 2024. Có file Excel đính kèm với giá mới.",
    requester: "Accounting",
    requesterRole: "Finance",
    type: "design",
    urgency: "high",
    deadline: "2024-01-12",
    createdAt: "2024-01-10",
    attachments: 1,
    notes: "Giữ nguyên layout, chỉ thay số",
  },
  {
    id: "5",
    title: "Social media post cho dịch vụ mới",
    description: "3 bài post cho Facebook/Instagram về dịch vụ niềng răng trong suốt mới nhập về.",
    requester: "Dr. An",
    requesterRole: "Dentist",
    type: "content",
    urgency: "normal",
    deadline: "2024-01-18",
    createdAt: "2024-01-07",
    attachments: 3,
  },
];

const typeConfig = {
  design: { label: "Design", icon: Image, color: "bg-pink-100 text-pink-700" },
  content: { label: "Content", icon: FileText, color: "bg-blue-100 text-blue-700" },
  video: { label: "Video", icon: Video, color: "bg-purple-100 text-purple-700" },
  other: { label: "Khác", icon: FileText, color: "bg-gray-100 text-gray-700" },
};

const urgencyConfig = {
  urgent: { label: "Khẩn cấp", color: "bg-red-100 text-red-700", borderColor: "border-l-red-500" },
  high: { label: "Cao", color: "bg-orange-100 text-orange-700", borderColor: "border-l-orange-500" },
  normal: { label: "Bình thường", color: "bg-blue-100 text-blue-700", borderColor: "" },
  low: { label: "Thấp", color: "bg-gray-100 text-gray-700", borderColor: "" },
};

export default function TaskRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<TaskRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [response, setResponse] = useState("");

  const filteredRequests = mockRequests.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
    return true;
  });

  const openDetail = (request: TaskRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
    setResponse("");
  };

  const handleAccept = () => {
    // Accept and create task logic
    setIsDetailOpen(false);
  };

  const handleDecline = () => {
    // Decline logic
    setIsDetailOpen(false);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Task Requests</h1>
        <p className="text-muted-foreground">
          Yêu cầu công việc từ các phòng ban khác
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockRequests.length}</p>
              <p className="text-sm text-muted-foreground">Tổng yêu cầu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockRequests.filter((r) => r.urgency === "urgent").length}
              </p>
              <p className="text-sm text-muted-foreground">Khẩn cấp</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-100">
              <Image className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockRequests.filter((r) => r.type === "design").length}
              </p>
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
              <p className="text-2xl font-bold">
                {mockRequests.filter((r) => r.type === "video").length}
              </p>
              <p className="text-sm text-muted-foreground">Video</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Loại công việc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="other">Khác</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Độ khẩn cấp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="urgent">Khẩn cấp</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="normal">Bình thường</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const typeInfo = typeConfig[request.type];
          const TypeIcon = typeInfo.icon;
          const urgencyInfo = urgencyConfig[request.urgency];
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
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        <Badge className={urgencyInfo.color}>{urgencyInfo.label}</Badge>
                        {daysLeft <= 3 && daysLeft > 0 && (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            Còn {daysLeft} ngày
                          </Badge>
                        )}
                        {daysLeft <= 0 && (
                          <Badge variant="destructive">Quá hạn!</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{request.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {request.requester} ({request.requesterRole})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Deadline: {new Date(request.deadline).toLocaleDateString("vi-VN")}
                        </span>
                        {request.attachments > 0 && (
                          <span>{request.attachments} tệp đính kèm</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(request);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Từ chối
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccept();
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Nhận task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={typeConfig[selectedRequest.type].color}>
                    {typeConfig[selectedRequest.type].label}
                  </Badge>
                  <Badge className={urgencyConfig[selectedRequest.urgency].color}>
                    {urgencyConfig[selectedRequest.urgency].label}
                  </Badge>
                </div>
                <DialogTitle>{selectedRequest.title}</DialogTitle>
                <DialogDescription>
                  Yêu cầu từ {selectedRequest.requester} ({selectedRequest.requesterRole})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-muted-foreground">Mô tả chi tiết</Label>
                  <p className="mt-1">{selectedRequest.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Deadline</Label>
                    <p className="mt-1 font-semibold">
                      {new Date(selectedRequest.deadline).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tệp đính kèm</Label>
                    <p className="mt-1">{selectedRequest.attachments} tệp</p>
                  </div>
                </div>
                {selectedRequest.notes && (
                  <div>
                    <Label className="text-muted-foreground">Ghi chú thêm</Label>
                    <p className="mt-1">{selectedRequest.notes}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="response">Phản hồi (nếu từ chối)</Label>
                  <Textarea
                    id="response"
                    placeholder="Lý do từ chối hoặc yêu cầu thêm thông tin..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Đóng
                </Button>
                <Button variant="destructive" onClick={handleDecline}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>
                <Button onClick={handleAccept}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Nhận & Tạo Task
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
