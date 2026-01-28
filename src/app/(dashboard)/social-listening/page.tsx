"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Heart,
  Smile,
  Frown,
  Meh,
  Users,
  Clock,
  ExternalLink,
  Star,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bell,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Activity,
  Bot,
  Zap,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Loader2,
  Trophy,
  RefreshCw,
  Settings,
  AlertTriangle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";
import { trpc } from "@/lib/trpc";

export default function SocialListeningPage() {
  const [selectedLeadFilter, setSelectedLeadFilter] = useState("all");
  const [selectedSubreddit, setSelectedSubreddit] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // tRPC queries for Reddit data
  const { data: redditStats, isLoading: statsLoading } =
    trpc.reddit.getStats.useQuery();

  const { data: redditPosts, isLoading: postsLoading, refetch: refetchPosts } =
    trpc.reddit.getPosts.useQuery({
      status: selectedLeadFilter === "all" ? undefined : selectedLeadFilter as "new" | "reviewed" | "responded" | "ignored",
      subreddit: selectedSubreddit === "all" ? undefined : selectedSubreddit,
      search: searchQuery || undefined,
      limit: 20,
    });

  const { data: subreddits } = trpc.reddit.getSubreddits.useQuery();

  const refreshMutation = trpc.reddit.refreshPosts.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  const updateStatusMutation = trpc.reddit.updatePostStatus.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  // Mock data for other tabs (keeping existing functionality)
  const sentimentTrendData = [
    { date: "T2", positive: 145, neutral: 78, negative: 23 },
    { date: "T3", positive: 167, neutral: 82, negative: 19 },
    { date: "T4", positive: 189, neutral: 91, negative: 28 },
    { date: "T5", positive: 203, neutral: 87, negative: 31 },
    { date: "T6", positive: 234, neutral: 95, negative: 25 },
    { date: "T7", positive: 256, neutral: 102, negative: 22 },
    { date: "CN", positive: 278, neutral: 108, negative: 27 },
  ];

  const sentimentDistribution = [
    { name: "Positive", value: 72, color: "#10b981" },
    { name: "Neutral", value: 21, color: "#94a3b8" },
    { name: "Negative", value: 7, color: "#ef4444" },
  ];

  const platformMentions = [
    {
      platform: "Facebook",
      mentions: 1243,
      sentiment: 4.2,
      trend: 12.5,
      icon: "📘",
    },
    {
      platform: "Instagram",
      mentions: 892,
      sentiment: 4.5,
      trend: 18.3,
      icon: "📷",
    },
    { platform: "Zalo", mentions: 567, sentiment: 4.1, trend: 8.7, icon: "💬" },
    {
      platform: "TikTok",
      mentions: 423,
      sentiment: 4.6,
      trend: 25.4,
      icon: "🎵",
    },
    {
      platform: "Google Reviews",
      mentions: 234,
      sentiment: 4.4,
      trend: 5.2,
      icon: "⭐",
    },
    {
      platform: "Reddit",
      mentions: redditStats?.totalPosts ?? 0,
      sentiment: 4.0,
      trend: redditStats?.postsLast24h ?? 0,
      icon: "🔴",
    },
  ];

  const trendingTopics = [
    {
      keyword: "niềng răng invisalign",
      mentions: 456,
      sentiment: "positive",
      change: 23,
    },
    {
      keyword: "tẩy trắng răng",
      mentions: 389,
      sentiment: "positive",
      change: 15,
    },
    {
      keyword: "nha khoa uy tín",
      mentions: 312,
      sentiment: "positive",
      change: 31,
    },
    {
      keyword: "cấy ghép implant",
      mentions: 278,
      sentiment: "positive",
      change: 12,
    },
    {
      keyword: "giá cả hợp lý",
      mentions: 234,
      sentiment: "neutral",
      change: -5,
    },
    { keyword: "đau răng", mentions: 189, sentiment: "neutral", change: 8 },
  ];

  const topMentions = [
    {
      id: 1,
      platform: "Facebook",
      author: "Nguyễn Thị Mai",
      authorType: "customer",
      content:
        "Mình vừa niềng răng xong ở Greenfield Dental, răng đều và đẹp lắm! Bác sĩ tư vấn rất tận tình, giá cả hợp lý. Recommend cho mọi người nha! 😍",
      timestamp: "2 giờ trước",
      sentiment: "positive",
      engagement: { likes: 234, comments: 45, shares: 12 },
      responded: true,
    },
    {
      id: 2,
      platform: "Instagram",
      author: "@dental_influencer",
      authorType: "influencer",
      content:
        "Vừa trải nghiệm dịch vụ tẩy trắng răng tại @greenfielddental - công nghệ Zoom hiện đại, kết quả trắng sáng ngay sau 1 giờ. Không đau, không ê buốt! ⭐⭐⭐⭐⭐",
      timestamp: "4 giờ trước",
      sentiment: "positive",
      engagement: { likes: 1245, comments: 89, shares: 34 },
      responded: true,
    },
    {
      id: 3,
      platform: "Google Reviews",
      author: "Trần Văn Hùng",
      authorType: "customer",
      content:
        "Phòng khám sạch sẽ, trang thiết bị hiện đại. Tuy nhiên thời gian chờ hơi lâu vào cuối tuần. Nhưng nhìn chung dịch vụ ok, sẽ quay lại.",
      timestamp: "6 giờ trước",
      sentiment: "neutral",
      engagement: { likes: 12, comments: 3, shares: 0 },
      responded: true,
    },
    {
      id: 4,
      platform: "Zalo",
      author: "Phạm Thu Hương",
      authorType: "customer",
      content:
        "Cho hỏi giá niềng răng là bao nhiêu vậy ạ? Có gói ưu đãi cho sinh viên không?",
      timestamp: "1 giờ trước",
      sentiment: "neutral",
      engagement: { likes: 5, comments: 2, shares: 0 },
      responded: false,
    },
  ];

  const competitorData = [
    {
      id: 1,
      name: "Greenfield Dental",
      logo: "🌿",
      mentions: 1472,
      sentiment: 4.3,
      marketShare: 35,
      trend: 12.5,
      strengths: ["Công nghệ hiện đại", "Bác sĩ tận tình", "Giá cả hợp lý"],
      weaknesses: ["Thời gian chờ cuối tuần"],
      pricing: "Trung bình - Cao",
      locations: ["Q1", "Q7", "Thủ Đức"],
      services: ["Niềng răng", "Implant", "Tẩy trắng", "Nhổ răng khôn"],
      topKeywords: ["invisalign", "zoom whitening", "implant"],
    },
    {
      id: 2,
      name: "Nha Khoa Đông Nam",
      logo: "🏥",
      mentions: 1189,
      sentiment: 4.1,
      marketShare: 28,
      trend: 8.3,
      strengths: ["Nhiều chi nhánh", "Giá rẻ", "Khuyến mãi nhiều"],
      weaknesses: ["Chất lượng không đồng đều", "Bác sĩ thay đổi"],
      pricing: "Thấp - Trung bình",
      locations: ["Q1", "Q3", "Q5", "Q10", "Bình Thạnh"],
      services: ["Niềng răng", "Implant", "Tẩy trắng", "Bọc răng sứ"],
      topKeywords: ["giá rẻ", "khuyến mãi", "nhiều chi nhánh"],
    },
    {
      id: 3,
      name: "Nha Khoa Paris",
      logo: "🗼",
      mentions: 892,
      sentiment: 4.0,
      marketShare: 21,
      trend: 5.7,
      strengths: ["Thương hiệu lâu năm", "Vị trí trung tâm"],
      weaknesses: ["Giá cao", "Trang thiết bị cũ"],
      pricing: "Cao",
      locations: ["Q1", "Q3"],
      services: ["Niềng răng", "Implant", "Bọc răng sứ"],
      topKeywords: ["lâu năm", "uy tín", "trung tâm"],
    },
    {
      id: 4,
      name: "Nha Khoa Kim",
      logo: "💎",
      mentions: 678,
      sentiment: 3.9,
      marketShare: 16,
      trend: -2.1,
      strengths: ["Chuyên sâu về niềng răng", "Có bác sĩ nước ngoài"],
      weaknesses: ["Giá rất cao", "Ít chi nhánh"],
      pricing: "Rất cao",
      locations: ["Q1"],
      services: ["Niềng răng cao cấp", "Implant cao cấp"],
      topKeywords: ["cao cấp", "chuyên sâu", "bác sĩ nước ngoài"],
    },
  ];

  const competitorComparisonData = [
    { metric: "Mentions", greenfield: 90, dongnam: 75, paris: 60, kim: 45 },
    { metric: "Sentiment", greenfield: 86, dongnam: 82, paris: 80, kim: 78 },
    { metric: "Engagement", greenfield: 85, dongnam: 70, paris: 65, kim: 60 },
    {
      metric: "Response Rate",
      greenfield: 94,
      dongnam: 65,
      paris: 58,
      kim: 42,
    },
    { metric: "Innovation", greenfield: 92, dongnam: 60, paris: 45, kim: 75 },
    {
      metric: "Price Competitiveness",
      greenfield: 75,
      dongnam: 90,
      paris: 40,
      kim: 30,
    },
  ];

  const influencerMentions = [
    {
      name: "Dr. Beauty Tips",
      platform: "Instagram",
      followers: "125K",
      mentions: 3,
      reach: "45K",
      sentiment: "positive",
    },
    {
      name: "Vietnam Beauty",
      platform: "Facebook",
      followers: "89K",
      mentions: 2,
      reach: "32K",
      sentiment: "positive",
    },
    {
      name: "Dental Care VN",
      platform: "TikTok",
      followers: "67K",
      mentions: 5,
      reach: "78K",
      sentiment: "positive",
    },
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="w-4 h-4 text-green-500" />;
      case "negative":
        return <Frown className="w-4 h-4 text-red-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            Positive
          </Badge>
        );
      case "negative":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            Negative
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-300">
            Neutral
          </Badge>
        );
    }
  };

  const getPriorityBadge = (score: number | null) => {
    if (!score) return null;
    if (score >= 70) {
      return (
        <Badge variant="destructive" className="gap-1">
          🔥 Hot Lead
        </Badge>
      );
    }
    if (score >= 40) {
      return (
        <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700">
          💡 Warm Lead
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        📊 Low Score
      </Badge>
    );
  };

  const getLeadScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 70) return "text-red-500";
    if (score >= 40) return "text-orange-500";
    return "text-yellow-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">New</Badge>;
      case "reviewed":
        return <Badge variant="secondary">Reviewed</Badge>;
      case "responded":
        return <Badge className="bg-green-100 text-green-700">Responded</Badge>;
      case "ignored":
        return <Badge variant="outline">Ignored</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const responseMetrics = {
    avgResponseTime: "24 phút",
    responseRate: 94,
    totalResponses: 387,
    pendingResponses: 12,
  };

  // Convert subreddit stats to chart data
  const subredditChartData = Object.entries(redditStats?.postsBySubreddit ?? {})
    .map(([subreddit, count]) => ({
      name: `r/${subreddit}`,
      posts: count,
    }))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Social Listening</h1>
        <p className="text-muted-foreground">
          Theo dõi và phân tích conversations về Greenfield Dental trên mạng xã
          hội
        </p>
      </div>

      <Tabs defaultValue="reddit" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="reddit">
            <Bot className="w-4 h-4 mr-2" />
            Reddit Leads
            {redditStats && redditStats.newPosts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {redditStats.newPosts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overview">
            <Activity className="w-4 h-4 mr-2" />
            Tổng Quan
          </TabsTrigger>
          <TabsTrigger value="mentions">
            <MessageCircle className="w-4 h-4 mr-2" />
            Mentions
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending Topics
          </TabsTrigger>
          <TabsTrigger value="competitors">
            <Target className="w-4 h-4 mr-2" />
            Competitors
          </TabsTrigger>
          <TabsTrigger value="influencers">
            <Star className="w-4 h-4 mr-2" />
            Influencers
          </TabsTrigger>
        </TabsList>

        {/* Reddit Leads Tab - NEW */}
        <TabsContent value="reddit" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bot className="w-6 h-6 text-primary" />
                Reddit Lead Detection
              </h2>
              <p className="text-sm text-muted-foreground">
                AI-powered monitoring of dental tourism discussions on Reddit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                {refreshMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <Target className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : redditStats?.totalPosts ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">New Leads</p>
                  <Zap className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-500">
                  {statsLoading ? "-" : redditStats?.newPosts ?? 0}
                </p>
                <p className="text-xs text-red-600 mt-1">Needs attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">High Score</p>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-orange-500">
                  {statsLoading ? "-" : redditStats?.highScoreCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Score 70+</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-primary">
                  {statsLoading ? "-" : redditStats?.avgLeadScore ?? 0}/100
                </p>
                <p className="text-xs text-muted-foreground mt-1">Lead quality</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Responded</p>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? "-" : redditStats?.respondedPosts ?? 0}
                </p>
                <p className="text-xs text-green-600 mt-1">Engaged</p>
              </CardContent>
            </Card>
          </div>

          {/* Subreddit Distribution Chart */}
          {subredditChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Posts by Subreddit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subredditChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="posts" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search posts..."
              className="flex-1 max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={selectedLeadFilter} onValueChange={setSelectedLeadFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSubreddit} onValueChange={setSelectedSubreddit}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Subreddit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subreddits</SelectItem>
                {subreddits?.map((s) => (
                  <SelectItem key={s.subreddit} value={s.subreddit}>
                    r/{s.subreddit} ({s.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Posts List */}
          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !redditPosts?.posts?.length ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reddit Posts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Click &quot;Refresh&quot; to fetch new posts from monitored subreddits,
                  or configure monitoring in settings.
                </p>
                <Button
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                >
                  {refreshMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Fetch Posts Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {redditPosts.posts.map((post) => (
                <Card
                  key={post.id}
                  className={`${
                    (post.leadScore ?? 0) >= 70
                      ? "border-l-4 border-l-red-500"
                      : (post.leadScore ?? 0) >= 40
                        ? "border-l-4 border-l-orange-400"
                        : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            🔴
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                r/{post.subreddit}
                              </Badge>
                              {getPriorityBadge(post.leadScore)}
                              {getStatusBadge(post.status)}
                            </div>
                            <h3 className="font-semibold mb-1">{post.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>u/{post.author}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(post.createdUtc).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{post.score}↑</span>
                              <span>•</span>
                              <span>{post.numComments} comments</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              Lead Score
                            </span>
                            <div
                              className={`text-2xl font-bold ${getLeadScoreColor(
                                post.leadScore
                              )}`}
                            >
                              {post.leadScore ?? "-"}
                            </div>
                          </div>
                          {getSentimentBadge(post.sentiment ?? "neutral")}
                        </div>
                      </div>

                      {/* Content */}
                      {post.content && (
                        <div className="bg-accent/50 p-4 rounded-lg">
                          <p className="text-sm">
                            {post.content.length > 500
                              ? `${post.content.substring(0, 500)}...`
                              : post.content}
                          </p>
                        </div>
                      )}

                      {/* Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {post.intent && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">
                                Intent Detected
                              </p>
                              <Badge className="bg-primary/10 text-primary border-primary">
                                <Target className="w-3 h-3 mr-1" />
                                {post.intent}
                              </Badge>
                            </div>
                          )}

                          {post.keySignals && post.keySignals.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">
                                Key Signals
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {post.keySignals.map((signal, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {signal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {post.aiNotes && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                AI Notes
                              </p>
                              <p className="text-xs bg-accent/50 p-2 rounded">
                                {post.aiNotes}
                              </p>
                            </div>
                          )}

                          {post.suggestedResponse && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Suggested Response
                              </p>
                              <p className="text-xs bg-primary/5 p-2 rounded border-l-2 border-primary max-h-24 overflow-y-auto">
                                {post.suggestedResponse}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t">
                        {post.status === "new" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: post.id,
                                  status: "reviewed",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Mark Reviewed
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: post.id,
                                  status: "ignored",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Ignore
                            </Button>
                          </>
                        )}
                        {post.status === "reviewed" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: post.id,
                                status: "responded",
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Mark Responded
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          asChild
                        >
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Reddit
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Total Mentions</p>
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">3,359</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+14.2% vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Avg Sentiment</p>
                  <Heart className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">4.3/5.0</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+0.2 vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">
                  {responseMetrics.responseRate}%
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+3% vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    Avg Response Time
                  </p>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">
                  {responseMetrics.avgResponseTime}
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>-8min vs last week</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sentiment Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sentimentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Positive"
                    />
                    <Area
                      type="monotone"
                      dataKey="neutral"
                      stackId="1"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.6}
                      name="Neutral"
                    />
                    <Area
                      type="monotone"
                      dataKey="negative"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                      name="Negative"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformMentions.map((platform, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="text-2xl w-8">{platform.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{platform.platform}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {platform.mentions.toLocaleString()} mentions
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">
                              {platform.sentiment}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-1 text-sm ${
                              platform.trend > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {platform.trend > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>
                              {platform.trend > 0 ? "+" : ""}
                              {platform.trend}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentions Tab */}
        <TabsContent value="mentions" className="space-y-6">
          <div className="flex items-center gap-4">
            <Input placeholder="Search mentions..." className="flex-1" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-platforms">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-platforms">All Platforms</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="zalo">Zalo</SelectItem>
                <SelectItem value="google">Google Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {topMentions.map((mention) => (
              <Card
                key={mention.id}
                className={
                  !mention.responded ? "border-l-4 border-l-destructive" : ""
                }
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                          {mention.author[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {mention.author}
                            </span>
                            {mention.authorType === "influencer" && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Influencer
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{mention.platform}</span>
                            <span>•</span>
                            <span>{mention.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentBadge(mention.sentiment)}
                        {!mention.responded && (
                          <Badge variant="destructive">
                            <Bell className="w-3 h-3 mr-1" />
                            Needs Response
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm">{mention.content}</p>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{mention.engagement.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{mention.engagement.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          <span>{mention.engagement.shares}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Post
                        </Button>
                        {!mention.responded && (
                          <Button size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trending Topics Tab */}
        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trending Keywords & Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{topic.keyword}</span>
                        {getSentimentIcon(topic.sentiment)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{topic.mentions.toLocaleString()} mentions</span>
                        <div
                          className={`flex items-center gap-1 ${
                            topic.change > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {topic.change > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          <span>
                            {topic.change > 0 ? "+" : ""}
                            {topic.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Competitive Intelligence</h2>
              <p className="text-sm text-muted-foreground">
                Phân tích chi tiết competitors và market positioning
              </p>
            </div>
            <Select defaultValue="last-7-days">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {competitorData.map((comp) => (
              <Card
                key={comp.id}
                className={comp.id === 1 ? "border-2 border-primary" : ""}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-4xl">{comp.logo}</div>
                    <h3 className="font-semibold text-sm">{comp.name}</h3>
                    <div className="text-3xl font-bold text-primary">
                      {comp.marketShare}%
                    </div>
                    <p className="text-xs text-muted-foreground">Market Share</p>
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{comp.sentiment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Multi-Dimensional Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={competitorComparisonData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Greenfield"
                    dataKey="greenfield"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Đông Nam"
                    dataKey="dongnam"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Paris"
                    dataKey="paris"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Kim"
                    dataKey="kim"
                    stroke="#6b7280"
                    fill="#6b7280"
                    fillOpacity={0.2}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {competitorData.map((comp) => (
              <Card
                key={comp.id}
                className={comp.id === 1 ? "border-2 border-primary/50" : ""}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{comp.logo}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">
                              {comp.name}
                            </h3>
                            {comp.id === 1 && (
                              <Badge variant="default">
                                <Trophy className="w-3 h-3 mr-1" />
                                Your Brand
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {comp.mentions.toLocaleString()} mentions
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span>{comp.sentiment}</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                comp.trend > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {comp.trend > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              <span>
                                {comp.trend > 0 ? "+" : ""}
                                {comp.trend}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {comp.marketShare}% Market Share
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {comp.strengths.map((strength, i) => (
                              <li
                                key={i}
                                className="text-sm flex items-center gap-2"
                              >
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                            Weaknesses
                          </h4>
                          <ul className="space-y-1">
                            {comp.weaknesses.map((weakness, i) => (
                              <li
                                key={i}
                                className="text-sm flex items-center gap-2"
                              >
                                <XCircle className="w-3 h-3 text-red-600" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Pricing
                              </p>
                              <p className="text-sm font-medium">
                                {comp.pricing}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Locations
                              </p>
                              <p className="text-sm font-medium">
                                {comp.locations.length} chi nhánh
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Locations
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {comp.locations.map((loc, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {loc}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Top Keywords
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {comp.topKeywords.map((keyword, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                #{keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Influencers Tab */}
        <TabsContent value="influencers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Influencer Mentions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {influencerMentions.map((influencer, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <Star className="w-8 h-8 text-amber-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{influencer.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {influencer.platform}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {influencer.followers} followers
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {influencer.mentions} mentions
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {influencer.reach} reach
                        </span>
                        {getSentimentIcon(influencer.sentiment)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
