"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Copy,
  BarChart3,
} from "lucide-react";

interface ContentItem {
  id: string;
  platform: string;
  title: string;
  description: string;
  status: "planned" | "in-production" | "review" | "ready" | "published";
  date: string;
  time: string;
  assignee: string;
  contentType: string;
  tags: string[];
}

const initialContentItems: ContentItem[] = [
  {
    id: "c1",
    platform: "Facebook",
    title: "Post khuyến mãi tẩy trắng răng",
    description: "Chương trình khuyến mãi giảm 30% dịch vụ tẩy trắng răng cho khách hàng mới",
    status: "ready",
    date: "2026-01-03",
    time: "10:00",
    assignee: "Nguyễn Văn A",
    contentType: "Social Post",
    tags: ["Promotion", "Facebook"],
  },
  {
    id: "c2",
    platform: "Facebook",
    title: "Video testimonial bệnh nhân",
    description: "Video phỏng vấn bệnh nhân sau implant thành công",
    status: "ready",
    date: "2026-01-03",
    time: "15:00",
    assignee: "Nguyễn Văn D",
    contentType: "Video",
    tags: ["Testimonial", "Video"],
  },
  {
    id: "c3",
    platform: "Zalo",
    title: "Bài viết chăm sóc răng miệng",
    description: "Tips chăm sóc răng miệng hàng ngày",
    status: "in-production",
    date: "2026-01-05",
    time: "09:00",
    assignee: "Nguyễn Văn A",
    contentType: "Article",
    tags: ["Education", "Zalo"],
  },
  {
    id: "c4",
    platform: "Facebook",
    title: "Banner campaign tháng 1",
    description: "Banner quảng cáo cho campaign tháng 1",
    status: "in-production",
    date: "2026-01-08",
    time: "10:00",
    assignee: "Trần Văn B",
    contentType: "Graphic",
    tags: ["Design", "Campaign"],
  },
  {
    id: "c5",
    platform: "TikTok",
    title: "Video Before/After",
    description: "Video so sánh before/after niềng răng",
    status: "review",
    date: "2026-01-08",
    time: "14:00",
    assignee: "Nguyễn Văn D",
    contentType: "Video",
    tags: ["Before-After", "TikTok"],
  },
  {
    id: "c6",
    platform: "Website",
    title: "Blog: Hướng dẫn niềng răng",
    description: "Bài blog chi tiết về quy trình niềng răng",
    status: "ready",
    date: "2026-01-10",
    time: "08:00",
    assignee: "Lê Thị C",
    contentType: "Blog Post",
    tags: ["Blog", "Education"],
  },
  {
    id: "c7",
    platform: "Facebook",
    title: "Giới thiệu dịch vụ implant",
    description: "Post giới thiệu dịch vụ cấy ghép implant",
    status: "planned",
    date: "2026-01-12",
    time: "10:00",
    assignee: "Nguyễn Văn A",
    contentType: "Social Post",
    tags: ["Service", "Implant"],
  },
  {
    id: "c8",
    platform: "Instagram",
    title: "Carousel: Quy trình tẩy trắng",
    description: "Carousel 5 bước quy trình tẩy trắng răng",
    status: "in-production",
    date: "2026-01-15",
    time: "11:00",
    assignee: "Trần Văn B",
    contentType: "Carousel",
    tags: ["Instagram", "Process"],
  },
  {
    id: "c9",
    platform: "TikTok",
    title: "Trending sound - Dental tips",
    description: "Video ngắn với trending sound về tips răng miệng",
    status: "review",
    date: "2026-01-18",
    time: "16:00",
    assignee: "Nguyễn Văn D",
    contentType: "Short Video",
    tags: ["TikTok", "Trending"],
  },
  {
    id: "c10",
    platform: "Zalo",
    title: "Thông báo lịch nghỉ Tết",
    description: "Thông báo lịch nghỉ và hoạt động dịp Tết",
    status: "planned",
    date: "2026-01-25",
    time: "09:00",
    assignee: "Lê Thị C",
    contentType: "Announcement",
    tags: ["Announcement", "Holiday"],
  },
  {
    id: "c11",
    platform: "Facebook",
    title: "Valentine Campaign Launch",
    description: "Khởi động chiến dịch Valentine với ưu đãi đặc biệt",
    status: "planned",
    date: "2026-02-01",
    time: "09:00",
    assignee: "Nguyễn Văn A",
    contentType: "Campaign",
    tags: ["Valentine", "Campaign"],
  },
  {
    id: "c12",
    platform: "Instagram",
    title: "Valentine Stories Series",
    description: "Chuỗi stories về chăm sóc nụ cười cho Valentine",
    status: "planned",
    date: "2026-02-10",
    time: "10:00",
    assignee: "Trần Văn B",
    contentType: "Stories",
    tags: ["Valentine", "Instagram"],
  },
];

const platformColors: Record<string, string> = {
  Facebook: "bg-blue-500",
  Zalo: "bg-blue-600",
  TikTok: "bg-black",
  Instagram: "bg-pink-500",
  Website: "bg-yellow-500",
};

const statusColors: Record<string, string> = {
  planned: "border-gray-300",
  "in-production": "border-yellow-500",
  review: "border-orange-500",
  ready: "border-green-500",
  published: "bg-blue-50",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isContentDetailOpen, setIsContentDetailOpen] = useState(false);
  const [isNewContentOpen, setIsNewContentOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysArray = () => {
    const days: (number | null)[] = [];
    const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getContentForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return contentItems.filter((item) => {
      const matchesDate = item.date === dateStr;
      const matchesPlatform = filterPlatform === "all" || item.platform === filterPlatform;
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      return matchesDate && matchesPlatform && matchesStatus;
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleContentClick = (content: ContentItem) => {
    setSelectedContent(content);
    setIsContentDetailOpen(true);
  };

  const getStatistics = () => {
    const total = contentItems.length;
    const planned = contentItems.filter((c) => c.status === "planned").length;
    const inProduction = contentItems.filter((c) => c.status === "in-production").length;
    const ready = contentItems.filter((c) => c.status === "ready").length;
    const published = contentItems.filter((c) => c.status === "published").length;

    return { total, planned, inProduction, ready, published };
  };

  const stats = getStatistics();

  const monthName = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Content Calendar</h1>
          <p className="text-muted-foreground">Lịch xuất bản nội dung trên các nền tảng</p>
        </div>
        <Button className="gap-2" onClick={() => setIsNewContentOpen(true)}>
          <Plus className="w-4 h-4" />
          Thêm nội dung
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Content</p>
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
                <p className="text-sm text-muted-foreground">Planned</p>
                <p className="text-2xl font-semibold">{stats.planned}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Production</p>
                <p className="text-2xl font-semibold">{stats.inProduction}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-semibold">{stats.ready}</p>
              </div>
              <Clock className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-semibold">{stats.published}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm mb-2 block">Platform</Label>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả platforms</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Zalo">Zalo</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-sm mb-2 block">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả status</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-production">In Production</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-xl font-semibold capitalize">{monthName}</span>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
            >
              Tháng
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              Tuần
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
            >
              Ngày
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Platform Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Facebook</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Zalo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black" />
              <span>TikTok</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span>Instagram</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Website</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Week Day Headers */}
            <div className="grid grid-cols-7 bg-muted">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {getDaysArray().map((day, index) => {
                const dayContent = day ? getContentForDay(day) : [];
                const isToday =
                  day === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                      day ? "bg-card hover:bg-accent/50" : "bg-muted/30"
                    } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${isToday ? "text-primary" : ""}`}>
                          {day}
                          {isToday && <span className="ml-1 text-xs">(Hôm nay)</span>}
                        </div>
                        <div className="space-y-1">
                          {dayContent.map((item) => (
                            <div
                              key={item.id}
                              className={`text-xs p-1.5 rounded border-l-2 ${statusColors[item.status]} bg-card hover:shadow-md cursor-pointer transition-all`}
                              onClick={() => handleContentClick(item)}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <div className={`w-2 h-2 rounded-full ${platformColors[item.platform]}`} />
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                  {item.platform}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {item.time}
                                </span>
                              </div>
                              <div className="line-clamp-2 font-medium">{item.title}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 border-l-2 border-gray-300 bg-white" />
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 border-l-2 border-yellow-500 bg-white" />
              <span>In Production</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 border-l-2 border-orange-500 bg-white" />
              <span>Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 border-l-2 border-green-500 bg-white" />
              <span>Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 bg-blue-50 border" />
              <span>Published</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Detail Modal */}
      <Dialog open={isContentDetailOpen} onOpenChange={setIsContentDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedContent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedContent.title}</DialogTitle>
                <DialogDescription>Content ID: #{selectedContent.id}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Platform</Label>
                    <div className="mt-1">
                      <Select defaultValue={selectedContent.platform}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Zalo">Zalo</SelectItem>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="Website">Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Select defaultValue={selectedContent.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in-production">In Production</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Publish Date</Label>
                    <Input type="date" defaultValue={selectedContent.date} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Publish Time</Label>
                    <Input type="time" defaultValue={selectedContent.time} className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <Textarea defaultValue={selectedContent.description} rows={3} className="mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Content Type</Label>
                    <Input defaultValue={selectedContent.contentType} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Assignee</Label>
                    <Input defaultValue={selectedContent.assignee} className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedContent.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsContentDetailOpen(false)}>
                    Đóng
                  </Button>
                  <Button>Lưu thay đổi</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Content Modal */}
      <Dialog open={isNewContentOpen} onOpenChange={setIsNewContentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm nội dung mới</DialogTitle>
            <DialogDescription>Tạo content mới cho Content Calendar</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tiêu đề *</Label>
              <Input placeholder="Nhập tiêu đề content..." className="mt-1" />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea placeholder="Mô tả chi tiết về content..." rows={3} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform *</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn platform..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Zalo">Zalo</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Content Type</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn loại..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Social Post">Social Post</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Graphic">Graphic</SelectItem>
                    <SelectItem value="Blog Post">Blog Post</SelectItem>
                    <SelectItem value="Carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Publish Date *</Label>
                <Input type="date" className="mt-1" />
              </div>

              <div>
                <Label>Publish Time</Label>
                <Input type="time" defaultValue="10:00" className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assignee</Label>
                <Input placeholder="Người phụ trách..." className="mt-1" />
              </div>

              <div>
                <Label>Status</Label>
                <Select defaultValue="planned">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-production">In Production</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <Input placeholder="Tag1, Tag2, Tag3..." className="mt-1" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewContentOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setIsNewContentOpen(false)}>Tạo Content</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
