"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function PostsPage() {
  const topPosts = [
    {
      platform: "Facebook",
      title: "Khuyến mãi tẩy trắng răng",
      reach: "5.2K",
      engagement: 234,
      likes: 189,
      comments: 45,
      shares: 12,
    },
    {
      platform: "Zalo",
      title: "Chăm sóc răng miệng mùa hè",
      reach: "3.1K",
      engagement: 156,
      likes: 120,
      comments: 28,
      shares: 8,
    },
    {
      platform: "Instagram",
      title: "Before/After niềng răng",
      reach: "8.4K",
      engagement: 521,
      likes: 423,
      comments: 67,
      shares: 31,
    },
    {
      platform: "TikTok",
      title: "1 ngày tại nha khoa Greenfield",
      reach: "12.5K",
      engagement: 892,
      likes: 745,
      comments: 112,
      shares: 35,
    },
    {
      platform: "Facebook",
      title: "Giới thiệu dịch vụ implant",
      reach: "4.8K",
      engagement: 287,
      likes: 215,
      comments: 52,
      shares: 20,
    },
    {
      platform: "Instagram",
      title: "Tips chăm sóc răng cho bé",
      reach: "6.2K",
      engagement: 398,
      likes: 312,
      comments: 56,
      shares: 30,
    },
  ];

  const engagementData = [
    { day: "T2", reach: 4200, engagement: 340 },
    { day: "T3", reach: 3800, engagement: 290 },
    { day: "T4", reach: 5100, engagement: 420 },
    { day: "T5", reach: 4500, engagement: 380 },
    { day: "T6", reach: 6200, engagement: 510 },
    { day: "T7", reach: 7800, engagement: 680 },
    { day: "CN", reach: 8500, engagement: 720 },
  ];

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Facebook":
        return "bg-blue-500";
      case "Instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "Zalo":
        return "bg-blue-400";
      case "TikTok":
        return "bg-black";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Post Performance</h1>
        <p className="text-muted-foreground">
          Theo dõi hiệu suất bài viết trên các nền tảng mạng xã hội
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="zalo">Zalo</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="30d">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 ngày</SelectItem>
            <SelectItem value="30d">30 ngày</SelectItem>
            <SelectItem value="90d">90 ngày</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Tổng Reach</p>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">48.2K</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% vs tuần trước</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Tổng Engagement</p>
              <Heart className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">2,488</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+8.3% vs tuần trước</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">5.2%</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+0.4% vs tuần trước</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Bài đăng</p>
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">24</p>
            <p className="text-sm text-muted-foreground mt-1">Trong 30 ngày</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Reach & Engagement theo ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="reach"
                fill="#0d9488"
                name="Reach"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="engagement"
                fill="#f59e0b"
                name="Engagement"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Bài viết hiệu suất cao nhất
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPosts.map((post, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className={`aspect-video ${getPlatformColor(
                  post.platform
                )} flex items-center justify-center`}
              >
                <span className="text-4xl opacity-80">
                  {post.platform === "Facebook"
                    ? "📘"
                    : post.platform === "Instagram"
                    ? "📷"
                    : post.platform === "Zalo"
                    ? "💬"
                    : "🎵"}
                </span>
              </div>
              <CardContent className="p-4">
                <Badge variant="secondary" className="mb-2">
                  {post.platform}
                </Badge>
                <p className="font-medium mb-3 line-clamp-2">{post.title}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{post.reach} reach</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Share2 className="w-4 h-4" />
                    <span>{post.shares}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
