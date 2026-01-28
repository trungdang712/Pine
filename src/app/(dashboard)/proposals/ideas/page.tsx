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
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Lightbulb,
  Plus,
  ThumbsUp,
  MessageSquare,
  Rocket,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
} from "lucide-react";

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "reviewing" | "approved" | "implemented" | "rejected";
  impactScore: number;
  pointsEarned: number;
  submittedBy: string;
  submittedAt: string;
  likes: number;
  comments: number;
}

const mockIdeas: Idea[] = [
  {
    id: "1",
    title: "Chatbot tư vấn răng miệng 24/7",
    description: "Xây dựng chatbot AI để tự động trả lời các câu hỏi thường gặp về chăm sóc răng miệng, giúp giảm tải cho hotline và tăng trải nghiệm khách hàng.",
    category: "Technology",
    status: "implemented",
    impactScore: 95,
    pointsEarned: 50,
    submittedBy: "Nguyễn Văn A",
    submittedAt: "2023-12-01",
    likes: 24,
    comments: 8,
  },
  {
    id: "2",
    title: "Video Before/After series cho từng dịch vụ",
    description: "Tạo series video ngắn so sánh trước/sau điều trị cho các dịch vụ chính: niềng răng, tẩy trắng, implant. Mỗi video khoảng 30-60 giây, tối ưu cho TikTok và Reels.",
    category: "Content",
    status: "approved",
    impactScore: 85,
    pointsEarned: 25,
    submittedBy: "Trần Thị B",
    submittedAt: "2024-01-02",
    likes: 18,
    comments: 5,
  },
  {
    id: "3",
    title: "Loyalty program cho khách hàng cũ",
    description: "Chương trình tích điểm cho khách hàng: mỗi 1M chi tiêu = 1 điểm, tích đủ điểm đổi voucher giảm giá hoặc dịch vụ miễn phí.",
    category: "Marketing",
    status: "reviewing",
    impactScore: 78,
    pointsEarned: 15,
    submittedBy: "Lê Văn C",
    submittedAt: "2024-01-08",
    likes: 12,
    comments: 3,
  },
  {
    id: "4",
    title: "Partnership với phòng gym/yoga",
    description: "Hợp tác cross-promotion với các phòng gym/yoga trong khu vực: họ giới thiệu khách hàng, ta cung cấp ưu đãi đặc biệt.",
    category: "Partnership",
    status: "reviewing",
    impactScore: 72,
    pointsEarned: 15,
    submittedBy: "Phạm Văn D",
    submittedAt: "2024-01-10",
    likes: 8,
    comments: 2,
  },
  {
    id: "5",
    title: "Live Q&A với bác sĩ mỗi tuần",
    description: "Tổ chức livestream Q&A với bác sĩ mỗi tuần trên Facebook để giải đáp thắc mắc của khách hàng về các vấn đề răng miệng.",
    category: "Content",
    status: "approved",
    impactScore: 68,
    pointsEarned: 25,
    submittedBy: "Nguyễn Thị E",
    submittedAt: "2024-01-05",
    likes: 15,
    comments: 4,
  },
];

const statusConfig = {
  reviewing: { label: "Đang xem xét", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "Đã duyệt", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  implemented: { label: "Đã triển khai", color: "bg-green-100 text-green-700", icon: Rocket },
  rejected: { label: "Không phù hợp", color: "bg-gray-100 text-gray-700", icon: Clock },
};

export default function InnovationIdeasPage() {
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredIdeas =
    selectedCategory === "all"
      ? mockIdeas
      : mockIdeas.filter((idea) => idea.category === selectedCategory);

  const stats = {
    total: mockIdeas.length,
    implemented: mockIdeas.filter((i) => i.status === "implemented").length,
    totalPoints: mockIdeas.reduce((sum, i) => sum + i.pointsEarned, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Innovation Ideas</h1>
          <p className="text-muted-foreground">
            Đóng góp ý tưởng sáng tạo và nhận điểm thưởng
          </p>
        </div>
        <Dialog open={isNewIdeaOpen} onOpenChange={setIsNewIdeaOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Gửi ý tưởng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Gửi ý tưởng mới</DialogTitle>
              <DialogDescription>
                Chia sẻ ý tưởng sáng tạo của bạn. Nếu được triển khai, bạn sẽ nhận được điểm thưởng!
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tiêu đề ý tưởng</Label>
                <Input id="title" placeholder="Nhập tiêu đề ngắn gọn..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select defaultValue="content">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ý tưởng của bạn: vấn đề cần giải quyết, giải pháp đề xuất, lợi ích mong đợi..."
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewIdeaOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => setIsNewIdeaOpen(false)}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Gửi ý tưởng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Tổng ý tưởng</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Rocket className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.implemented}</p>
              <p className="text-sm text-muted-foreground">Đã triển khai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
              <p className="text-sm text-muted-foreground">Điểm đã nhận</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem value="Content">Content</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Partnership">Partnership</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ideas Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredIdeas.map((idea) => {
          const statusInfo = statusConfig[idea.status];
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={idea.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary">{idea.category}</Badge>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {idea.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {idea.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {idea.comments}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{idea.impactScore}</span>
                    </div>
                    {idea.pointsEarned > 0 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        +{idea.pointsEarned} pts
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t text-sm text-muted-foreground">
                  Gửi bởi <span className="font-medium">{idea.submittedBy}</span> •{" "}
                  {new Date(idea.submittedAt).toLocaleDateString("vi-VN")}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cách thức hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-3">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-1">1. Gửi ý tưởng</h4>
              <p className="text-sm text-muted-foreground">
                Chia sẻ ý tưởng sáng tạo của bạn
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-1">2. Xem xét</h4>
              <p className="text-sm text-muted-foreground">
                Team đánh giá tính khả thi (+15 pts)
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-1">3. Phê duyệt</h4>
              <p className="text-sm text-muted-foreground">
                Ý tưởng được chấp nhận (+25 pts)
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                <Rocket className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-1">4. Triển khai</h4>
              <p className="text-sm text-muted-foreground">
                Ý tưởng được thực hiện (+50 pts)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
