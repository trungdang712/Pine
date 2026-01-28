"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Inbox,
  MessageSquare,
  FileText,
  ArrowRight,
  Camera,
  Video,
  Mic,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const contentOpportunities = [
  {
    id: "1",
    type: "testimonial",
    title: "Bệnh nhân hài lòng - Implant",
    from: "Điều dưỡng Lan",
    department: "Phòng khám 1",
    priority: "high",
    consent: true,
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    type: "before-after",
    title: "Kết quả niềng răng 18 tháng",
    from: "Bác sĩ Minh",
    department: "Chỉnh nha",
    priority: "normal",
    consent: true,
    createdAt: "2024-01-09",
  },
  {
    id: "3",
    type: "event",
    title: "Sự kiện khai trương chi nhánh mới",
    from: "Marketing",
    department: "Admin",
    priority: "high",
    consent: false,
    createdAt: "2024-01-08",
  },
];

const taskRequests = [
  {
    id: "1",
    title: "Thiết kế poster khuyến mãi Tết",
    requester: "Sales Team",
    type: "design",
    urgency: "urgent",
    deadline: "2024-01-15",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    title: "Viết bài SEO về dịch vụ tẩy trắng",
    requester: "Dr. Hương",
    type: "content",
    urgency: "normal",
    deadline: "2024-01-20",
    createdAt: "2024-01-09",
  },
  {
    id: "3",
    title: "Video giới thiệu bác sĩ mới",
    requester: "HR",
    type: "video",
    urgency: "low",
    deadline: "2024-01-25",
    createdAt: "2024-01-08",
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  testimonial: <Mic className="h-4 w-4" />,
  "before-after": <Camera className="h-4 w-4" />,
  event: <Video className="h-4 w-4" />,
  design: <FileText className="h-4 w-4" />,
  content: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
};

const urgencyConfig = {
  urgent: { label: "Khẩn cấp", color: "bg-red-100 text-red-700" },
  high: { label: "Cao", color: "bg-orange-100 text-orange-700" },
  normal: { label: "Bình thường", color: "bg-blue-100 text-blue-700" },
  low: { label: "Thấp", color: "bg-gray-100 text-gray-700" },
};

export default function InboxPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">
          Quản lý cơ hội content và yêu cầu từ các phòng ban
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Camera className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contentOpportunities.length}</p>
              <p className="text-sm text-muted-foreground">Cơ hội content</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{taskRequests.length}</p>
              <p className="text-sm text-muted-foreground">Yêu cầu task</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {taskRequests.filter((r) => r.urgency === "urgent").length}
              </p>
              <p className="text-sm text-muted-foreground">Khẩn cấp</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">
            <Camera className="h-4 w-4 mr-2" />
            Cơ hội Content
            <Badge variant="secondary" className="ml-2">
              {contentOpportunities.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileText className="h-4 w-4 mr-2" />
            Yêu cầu Task
            <Badge variant="secondary" className="ml-2">
              {taskRequests.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Cơ hội content từ Sales/Điều dưỡng
            </p>
            <Link href="/inbox/opportunities">
              <Button variant="outline" size="sm">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {contentOpportunities.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {typeIcons[item.type]}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Từ {item.from} • {item.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.consent ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {item.consent ? "Đã consent" : "Chưa consent"}
                      </Badge>
                      <Badge className={urgencyConfig[item.priority as keyof typeof urgencyConfig].color}>
                        {urgencyConfig[item.priority as keyof typeof urgencyConfig].label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Yêu cầu task từ các phòng ban
            </p>
            <Link href="/inbox/requests">
              <Button variant="outline" size="sm">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {taskRequests.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {typeIcons[item.type]}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Từ {item.requester} • Deadline:{" "}
                          {new Date(item.deadline).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={urgencyConfig[item.urgency as keyof typeof urgencyConfig].color}>
                        {urgencyConfig[item.urgency as keyof typeof urgencyConfig].label}
                      </Badge>
                      <Button size="sm">Nhận task</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
