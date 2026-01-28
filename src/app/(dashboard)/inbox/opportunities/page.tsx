"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Camera,
  Video,
  Mic,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowRight,
  Calendar,
  User,
} from "lucide-react";

interface ContentOpportunity {
  id: string;
  type: "testimonial" | "before-after" | "event" | "procedure";
  title: string;
  description: string;
  from: string;
  department: string;
  priority: "high" | "normal" | "low";
  consent: boolean;
  patientName?: string;
  createdAt: string;
  notes?: string;
}

const mockOpportunities: ContentOpportunity[] = [
  {
    id: "1",
    type: "testimonial",
    title: "Bệnh nhân hài lòng sau cấy ghép Implant",
    description: "Bệnh nhân 45 tuổi, rất hài lòng sau khi cấy ghép 2 Implant, muốn chia sẻ trải nghiệm.",
    from: "Điều dưỡng Lan",
    department: "Phòng khám 1",
    priority: "high",
    consent: true,
    patientName: "Nguyễn Văn X",
    createdAt: "2024-01-10",
    notes: "Bệnh nhân sẵn sàng quay video và cho sử dụng hình ảnh.",
  },
  {
    id: "2",
    type: "before-after",
    title: "Kết quả niềng răng sau 18 tháng",
    description: "Case niềng răng mắc cài sứ, kết quả rất đẹp, có đầy đủ ảnh before/after.",
    from: "Bác sĩ Minh",
    department: "Chỉnh nha",
    priority: "high",
    consent: true,
    patientName: "Trần Thị Y",
    createdAt: "2024-01-09",
    notes: "Đã có consent form, bệnh nhân đồng ý che mặt.",
  },
  {
    id: "3",
    type: "event",
    title: "Sự kiện khai trương chi nhánh mới",
    description: "Chi nhánh 3 sẽ khai trương vào ngày 20/01, cần coverage cho sự kiện.",
    from: "Marketing",
    department: "Admin",
    priority: "high",
    consent: false,
    createdAt: "2024-01-08",
  },
  {
    id: "4",
    type: "procedure",
    title: "Ca phẫu thuật nhổ răng khôn phức tạp",
    description: "Ca nhổ 4 răng khôn mọc ngầm trong 1 lần, bệnh nhân đồng ý quay video.",
    from: "Bác sĩ Hùng",
    department: "Phẫu thuật",
    priority: "normal",
    consent: true,
    patientName: "Lê Văn Z",
    createdAt: "2024-01-07",
  },
  {
    id: "5",
    type: "testimonial",
    title: "Review từ khách hàng VIP",
    description: "Khách hàng VIP đã sử dụng dịch vụ từ 2019, muốn viết review chi tiết.",
    from: "Lễ tân Mai",
    department: "Reception",
    priority: "normal",
    consent: true,
    patientName: "Phạm Thị A",
    createdAt: "2024-01-06",
  },
];

const typeConfig = {
  testimonial: { label: "Testimonial", icon: Mic, color: "bg-purple-100 text-purple-700" },
  "before-after": { label: "Before/After", icon: Camera, color: "bg-blue-100 text-blue-700" },
  event: { label: "Sự kiện", icon: Calendar, color: "bg-green-100 text-green-700" },
  procedure: { label: "Thủ thuật", icon: Video, color: "bg-orange-100 text-orange-700" },
};

const priorityConfig = {
  high: { label: "Cao", color: "border-red-500 text-red-500" },
  normal: { label: "Bình thường", color: "border-blue-500 text-blue-500" },
  low: { label: "Thấp", color: "border-gray-500 text-gray-500" },
};

export default function ContentOpportunitiesPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<ContentOpportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [response, setResponse] = useState("");

  const filteredOpportunities =
    typeFilter === "all"
      ? mockOpportunities
      : mockOpportunities.filter((o) => o.type === typeFilter);

  const openDetail = (opportunity: ContentOpportunity) => {
    setSelectedOpportunity(opportunity);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Content Opportunities</h1>
        <p className="text-muted-foreground">
          Cơ hội content từ Sales, Điều dưỡng và các phòng ban
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Mic className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockOpportunities.filter((o) => o.type === "testimonial").length}
              </p>
              <p className="text-sm text-muted-foreground">Testimonials</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockOpportunities.filter((o) => o.type === "before-after").length}
              </p>
              <p className="text-sm text-muted-foreground">Before/After</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockOpportunities.filter((o) => o.consent).length}
              </p>
              <p className="text-sm text-muted-foreground">Đã consent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Camera className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockOpportunities.filter((o) => o.priority === "high").length}
              </p>
              <p className="text-sm text-muted-foreground">Ưu tiên cao</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="testimonial">Testimonial</SelectItem>
            <SelectItem value="before-after">Before/After</SelectItem>
            <SelectItem value="event">Sự kiện</SelectItem>
            <SelectItem value="procedure">Thủ thuật</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => {
          const typeInfo = typeConfig[opportunity.type];
          const TypeIcon = typeInfo.icon;
          const priorityInfo = priorityConfig[opportunity.priority];

          return (
            <Card
              key={opportunity.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                opportunity.priority === "high" ? "border-l-4 border-l-red-500" : ""
              }`}
              onClick={() => openDetail(opportunity)}
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
                        <Badge variant="outline" className={priorityInfo.color}>
                          {priorityInfo.label}
                        </Badge>
                        <Badge variant={opportunity.consent ? "success" : "secondary"}>
                          {opportunity.consent ? "Đã consent" : "Chưa consent"}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{opportunity.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {opportunity.from} • {opportunity.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(opportunity.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Hỏi thêm
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Nhận
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
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={typeConfig[selectedOpportunity.type].color}>
                    {typeConfig[selectedOpportunity.type].label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={priorityConfig[selectedOpportunity.priority].color}
                  >
                    {priorityConfig[selectedOpportunity.priority].label}
                  </Badge>
                </div>
                <DialogTitle>{selectedOpportunity.title}</DialogTitle>
                <DialogDescription>
                  Từ {selectedOpportunity.from} • {selectedOpportunity.department}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-muted-foreground">Mô tả</Label>
                  <p className="mt-1">{selectedOpportunity.description}</p>
                </div>
                {selectedOpportunity.patientName && (
                  <div>
                    <Label className="text-muted-foreground">Bệnh nhân</Label>
                    <p className="mt-1">{selectedOpportunity.patientName}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Trạng thái consent</Label>
                  <div className="mt-1">
                    <Badge variant={selectedOpportunity.consent ? "success" : "destructive"}>
                      {selectedOpportunity.consent
                        ? "Đã có consent"
                        : "Chưa có consent - Cần xin phép"}
                    </Badge>
                  </div>
                </div>
                {selectedOpportunity.notes && (
                  <div>
                    <Label className="text-muted-foreground">Ghi chú</Label>
                    <p className="mt-1">{selectedOpportunity.notes}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="response">Phản hồi</Label>
                  <Textarea
                    id="response"
                    placeholder="Ghi chú hoặc yêu cầu thêm thông tin..."
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
