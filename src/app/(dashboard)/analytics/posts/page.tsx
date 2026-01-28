"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ExternalLink,
  BarChart2,
  Users,
  Smile,
  Meh,
  Frown,
  ThumbsUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export default function PostsPage() {
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");

  // Post Performance Data
  const postsData = [
    {
      id: 1,
      platform: "Facebook",
      type: "Video",
      title: "Before/After nieng rang Invisalign - Transformation ky dieu",
      thumbnail: "📹",
      postedDate: "Jan 25, 2025, 6:00 PM",
      reach: 18240,
      impressions: 24560,
      engagement: 1285,
      engagementRate: 7.05,
      likes: 856,
      comments: 234,
      shares: 145,
      saves: 50,
      clicks: 342,
      ctr: 1.87,
      videoViews: 15230,
      avgWatchTime: "2:45",
      caption: "🦷 ✨ Chuyen bien nu cuoi chi trong 8 thang! Tu rang mom den nu cuoi tu tin rang ro voi cong nghe nieng rang Invisalign tai Greenfield Dental. #NiengRang #Invisalign #NuCuoiHoanHao",
      hashtags: ["#NiengRang", "#Invisalign", "#NuCuoiHoanHao", "#NhaKhoaGreenfield"],
      sentiment: {
        positive: 78,
        neutral: 18,
        negative: 4,
      },
      topComments: [
        { user: "Nguyen Thi A", text: "Dep qua! Minh cung dang muon nieng rang", sentiment: "positive", likes: 45 },
        { user: "Tran Van B", text: "Co phai dau lam khong?", sentiment: "neutral", likes: 23 },
        { user: "Le Thi C", text: "Gia bao nhieu vay shop?", sentiment: "neutral", likes: 18 },
      ],
      hourlyEngagement: [
        { hour: "6PM", engagement: 145 },
        { hour: "7PM", engagement: 234 },
        { hour: "8PM", engagement: 298 },
        { hour: "9PM", engagement: 256 },
        { hour: "10PM", engagement: 187 },
        { hour: "11PM", engagement: 98 },
        { hour: "12AM", engagement: 67 },
      ],
      demographics: {
        age: [
          { range: "18-24", percentage: 12 },
          { range: "25-34", percentage: 48 },
          { range: "35-44", percentage: 28 },
          { range: "45-54", percentage: 10 },
          { range: "55+", percentage: 2 },
        ],
        gender: [
          { type: "Female", percentage: 72 },
          { type: "Male", percentage: 28 },
        ],
        topCities: [
          { city: "TP. HCM", percentage: 58 },
          { city: "Ha Noi", percentage: 22 },
          { city: "Da Nang", percentage: 12 },
          { city: "Khac", percentage: 8 },
        ],
      },
    },
    {
      id: 2,
      platform: "Instagram",
      type: "Carousel",
      title: "5 ly do nen chon Implant thay vi cau rang",
      thumbnail: "📸",
      postedDate: "Jan 23, 2025, 12:00 PM",
      reach: 12580,
      impressions: 16750,
      engagement: 892,
      engagementRate: 7.09,
      likes: 645,
      comments: 128,
      shares: 89,
      saves: 30,
      clicks: 215,
      ctr: 1.71,
      caption: "💡 Ban dang phan van giua Implant va cau rang? Hay xem 5 ly do tai sao Implant la lua chon vuot troi! Swipe de kham pha ➡️",
      hashtags: ["#Implant", "#CayGhepRang", "#NhaKhoa"],
      sentiment: {
        positive: 82,
        neutral: 15,
        negative: 3,
      },
      topComments: [
        { user: "Mai Phuong", text: "Thong tin rat huu ich, cam on!", sentiment: "positive", likes: 38 },
        { user: "Hoang Anh", text: "Implant co ben khong?", sentiment: "neutral", likes: 19 },
        { user: "Thu Ha", text: "Gia implant bao nhieu?", sentiment: "neutral", likes: 15 },
      ],
      hourlyEngagement: [
        { hour: "12PM", engagement: 98 },
        { hour: "1PM", engagement: 156 },
        { hour: "2PM", engagement: 189 },
        { hour: "3PM", engagement: 165 },
        { hour: "4PM", engagement: 134 },
        { hour: "5PM", engagement: 98 },
        { hour: "6PM", engagement: 52 },
      ],
      demographics: {
        age: [
          { range: "18-24", percentage: 8 },
          { range: "25-34", percentage: 38 },
          { range: "35-44", percentage: 35 },
          { range: "45-54", percentage: 15 },
          { range: "55+", percentage: 4 },
        ],
        gender: [
          { type: "Female", percentage: 58 },
          { type: "Male", percentage: 42 },
        ],
        topCities: [
          { city: "TP. HCM", percentage: 62 },
          { city: "Ha Noi", percentage: 20 },
          { city: "Da Nang", percentage: 10 },
          { city: "Khac", percentage: 8 },
        ],
      },
    },
    {
      id: 3,
      platform: "Zalo",
      type: "Image",
      title: "Flash Sale - Tay trang rang Zoom giam 30%",
      thumbnail: "🎨",
      postedDate: "Jan 20, 2025, 9:00 AM",
      reach: 8940,
      impressions: 11250,
      engagement: 456,
      engagementRate: 5.10,
      likes: 324,
      comments: 89,
      shares: 32,
      saves: 11,
      clicks: 178,
      ctr: 1.99,
      caption: "⚡ FLASH SALE 48H ⚡ Tay trang rang Zoom - Trang sang chi trong 1 gio! Giam ngay 30% - Chi tu 3.5 trieu. Book ngay!",
      hashtags: ["#TayTrangRang", "#FlashSale", "#ZoomWhitening"],
      sentiment: {
        positive: 85,
        neutral: 12,
        negative: 3,
      },
      topComments: [
        { user: "Lan Anh", text: "Dat lich luon! Gia qua tot", sentiment: "positive", likes: 28 },
        { user: "Minh Tuan", text: "Co ben khong?", sentiment: "neutral", likes: 12 },
        { user: "Huong Giang", text: "Da book roi, hen gap", sentiment: "positive", likes: 15 },
      ],
      hourlyEngagement: [
        { hour: "9AM", engagement: 78 },
        { hour: "10AM", engagement: 112 },
        { hour: "11AM", engagement: 98 },
        { hour: "12PM", engagement: 76 },
        { hour: "1PM", engagement: 54 },
        { hour: "2PM", engagement: 38 },
      ],
      demographics: {
        age: [
          { range: "18-24", percentage: 35 },
          { range: "25-34", percentage: 45 },
          { range: "35-44", percentage: 15 },
          { range: "45-54", percentage: 4 },
          { range: "55+", percentage: 1 },
        ],
        gender: [
          { type: "Female", percentage: 78 },
          { type: "Male", percentage: 22 },
        ],
        topCities: [
          { city: "TP. HCM", percentage: 55 },
          { city: "Ha Noi", percentage: 25 },
          { city: "Da Nang", percentage: 12 },
          { city: "Khac", percentage: 8 },
        ],
      },
    },
  ];

  // Platform Comparison
  const platformComparison = [
    {
      platform: "Facebook",
      totalPosts: 48,
      totalReach: 284500,
      totalEngagement: 18940,
      avgEngagementRate: 6.65,
      bestPerformingType: "Video",
    },
    {
      platform: "Instagram",
      totalPosts: 38,
      totalReach: 195800,
      totalEngagement: 14250,
      avgEngagementRate: 7.28,
      bestPerformingType: "Carousel",
    },
    {
      platform: "Zalo",
      totalPosts: 28,
      totalReach: 126400,
      totalEngagement: 7890,
      avgEngagementRate: 6.24,
      bestPerformingType: "Image",
    },
    {
      platform: "TikTok",
      totalPosts: 15,
      totalReach: 89500,
      totalEngagement: 12340,
      avgEngagementRate: 13.79,
      bestPerformingType: "Video",
    },
  ];

  // Content Type Performance
  const contentTypePerformance = [
    { type: "Video", posts: 42, avgER: 8.45, avgReach: 15240 },
    { type: "Carousel", posts: 28, avgER: 6.85, avgReach: 11580 },
    { type: "Image", posts: 56, avgER: 5.12, avgReach: 8940 },
    { type: "Story/Reel", posts: 18, avgER: 11.24, avgReach: 6780 },
  ];

  // Posting Time Heatmap Data
  const postingTimeHeatmap = [
    { day: "Mon", "6-9am": 2, "9-12pm": 4, "12-3pm": 5, "3-6pm": 3, "6-9pm": 4, "9-12am": 2 },
    { day: "Tue", "6-9am": 3, "9-12pm": 5, "12-3pm": 4, "3-6pm": 4, "6-9pm": 3, "9-12am": 2 },
    { day: "Wed", "6-9am": 2, "9-12pm": 4, "12-3pm": 5, "3-6pm": 3, "6-9pm": 4, "9-12am": 2 },
    { day: "Thu", "6-9am": 3, "9-12pm": 5, "12-3pm": 4, "3-6pm": 4, "6-9pm": 3, "9-12am": 2 },
    { day: "Fri", "6-9am": 2, "9-12pm": 4, "12-3pm": 5, "3-6pm": 3, "6-9pm": 5, "9-12am": 3 },
    { day: "Sat", "6-9am": 1, "9-12pm": 3, "12-3pm": 4, "3-6pm": 5, "6-9pm": 5, "9-12am": 3 },
    { day: "Sun", "6-9am": 1, "9-12pm": 2, "12-3pm": 3, "3-6pm": 4, "6-9pm": 5, "9-12am": 4 },
  ];

  // Hashtag Performance
  const hashtagPerformance = [
    { hashtag: "#NhaKhoaGreenfield", uses: 45, avgReach: 8500, avgER: 4.2, trend: 12 },
    { hashtag: "#NiengRang", uses: 32, avgReach: 12300, avgER: 6.8, trend: 8 },
    { hashtag: "#Invisalign", uses: 28, avgReach: 15400, avgER: 7.5, trend: 15 },
    { hashtag: "#RangDep", uses: 38, avgReach: 6700, avgER: 3.1, trend: -5 },
    { hashtag: "#TayTrangRang", uses: 24, avgReach: 9200, avgER: 5.4, trend: 10 },
  ];

  // Competitor Analysis
  const competitorData = [
    {
      name: "Nha Khoa Smile",
      platform: "Facebook",
      followers: 45200,
      avgPostsPerWeek: 5,
      avgEngagementRate: 5.8,
      topContentType: "Before/After Photos",
      recentTrend: "up",
    },
    {
      name: "Dental Care Plus",
      platform: "Instagram",
      followers: 38500,
      avgPostsPerWeek: 7,
      avgEngagementRate: 7.2,
      topContentType: "Educational Carousels",
      recentTrend: "up",
    },
    {
      name: "Elite Dental Clinic",
      platform: "Facebook",
      followers: 28900,
      avgPostsPerWeek: 3,
      avgEngagementRate: 4.5,
      topContentType: "Testimonial Videos",
      recentTrend: "down",
    },
  ];

  // Competitive Benchmark
  const competitiveBenchmark = [
    { metric: "Posting Frequency", greenfield: 4.5, industryAvg: 5.2, topPerformer: 7 },
    { metric: "Engagement Rate", greenfield: 6.8, industryAvg: 5.5, topPerformer: 7.5 },
    { metric: "Response Time", greenfield: 2.5, industryAvg: 4.2, topPerformer: 1.8 },
    { metric: "Content Quality", greenfield: 8.2, industryAvg: 7.0, topPerformer: 8.5 },
    { metric: "Audience Growth", greenfield: 12, industryAvg: 8, topPerformer: 15 },
  ];

  const selectedPostData = postsData.find((p) => p.id === selectedPost);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="w-4 h-4 text-green-600" />;
      case "negative":
        return <Frown className="w-4 h-4 text-red-600" />;
      default:
        return <Meh className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderPostDetailModal = () => {
    if (!selectedPostData) return null;

    const sentimentData = [
      { name: "Positive", value: selectedPostData.sentiment.positive, color: "#10B981" },
      { name: "Neutral", value: selectedPostData.sentiment.neutral, color: "#94A3B8" },
      { name: "Negative", value: selectedPostData.sentiment.negative, color: "#EF4444" },
    ];

    const genderData = selectedPostData.demographics.gender.map((item) => ({
      name: item.type,
      value: item.percentage,
      color: item.type === "Female" ? "#F59E0B" : "#0D9488",
    }));

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-background rounded-lg shadow-2xl max-w-7xl w-full my-8">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline">{selectedPostData.platform}</Badge>
                  <Badge variant="secondary">{selectedPostData.type}</Badge>
                  <span className="text-2xl">{selectedPostData.thumbnail}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedPostData.title}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectedPostData.postedDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Post
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                  <p className="text-2xl font-bold">{(selectedPostData.reach / 1000).toFixed(1)}K</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <p className="text-2xl font-bold">{selectedPostData.engagement}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">ER</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{selectedPostData.engagementRate}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <p className="text-2xl font-bold">{selectedPostData.likes}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                  <p className="text-2xl font-bold">{selectedPostData.comments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Shares</p>
                  </div>
                  <p className="text-2xl font-bold">{selectedPostData.shares}</p>
                </CardContent>
              </Card>
            </div>

            {/* Post Caption */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Caption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{selectedPostData.caption}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPostData.hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedPostData.hourlyEngagement}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="engagement" stroke="#0D9488" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smile className="w-5 h-5" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Positive</span>
                      </div>
                      <span className="font-semibold">{selectedPostData.sentiment.positive}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span>Neutral</span>
                      </div>
                      <span className="font-semibold">{selectedPostData.sentiment.neutral}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Negative</span>
                      </div>
                      <span className="font-semibold">{selectedPostData.sentiment.negative}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPostData.topComments.map((comment, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{comment.user}</p>
                          {getSentimentIcon(comment.sentiment)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{comment.text}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {comment.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedPostData.demographics.age}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#0D9488" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 5) return "bg-primary";
    if (value >= 4) return "bg-primary/80";
    if (value >= 3) return "bg-primary/60";
    if (value >= 2) return "bg-primary/40";
    return "bg-primary/20";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="zalo">Zalo</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 ngay</SelectItem>
            <SelectItem value="30d">30 ngay</SelectItem>
            <SelectItem value="90d">90 ngay</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tim kiem post..." className="pl-10" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
            <p className="text-2xl font-bold">156</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Reach</p>
            <p className="text-2xl font-bold">696.2K</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Engagement</p>
            <p className="text-2xl font-bold">53.4K</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg ER</p>
            <p className="text-2xl font-bold text-green-600">7.67%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Best Platform</p>
            <p className="text-2xl font-bold">TikTok</p>
            <p className="text-xs text-muted-foreground">13.79% ER</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Platform</th>
                  <th className="text-right p-3 font-medium">Posts</th>
                  <th className="text-right p-3 font-medium">Total Reach</th>
                  <th className="text-right p-3 font-medium">Engagement</th>
                  <th className="text-right p-3 font-medium">Avg ER</th>
                  <th className="text-left p-3 font-medium">Best Type</th>
                </tr>
              </thead>
              <tbody>
                {platformComparison.map((platform, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50">
                    <td className="p-3 font-medium">{platform.platform}</td>
                    <td className="p-3 text-right">{platform.totalPosts}</td>
                    <td className="p-3 text-right">{(platform.totalReach / 1000).toFixed(1)}K</td>
                    <td className="p-3 text-right">{(platform.totalEngagement / 1000).toFixed(1)}K</td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-green-600">{platform.avgEngagementRate}%</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary">{platform.bestPerformingType}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {postsData.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedPost(post.id)}>
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-6xl">{post.thumbnail}</span>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{post.platform}</Badge>
                  <Badge variant="outline">{post.type}</Badge>
                </div>
                <p className="font-medium mb-3 line-clamp-2">{post.title}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Reach</p>
                    <p className="font-semibold">{(post.reach / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">ER</p>
                    <p className="font-semibold text-green-600">{post.engagementRate}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {post.shares}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Content Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Content Type Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentTypePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis yAxisId="left" orientation="left" stroke="#0D9488" />
                <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="avgER" fill="#0D9488" name="Avg ER (%)" />
                <Bar yAxisId="right" dataKey="avgReach" fill="#F59E0B" name="Avg Reach" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Posting Time Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Best Posting Times (Engagement Level)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium">Day</th>
                  <th className="p-2 text-center font-medium">6-9 AM</th>
                  <th className="p-2 text-center font-medium">9-12 PM</th>
                  <th className="p-2 text-center font-medium">12-3 PM</th>
                  <th className="p-2 text-center font-medium">3-6 PM</th>
                  <th className="p-2 text-center font-medium">6-9 PM</th>
                  <th className="p-2 text-center font-medium">9-12 AM</th>
                </tr>
              </thead>
              <tbody>
                {postingTimeHeatmap.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2 font-medium">{row.day}</td>
                    <td className="p-2">
                      <div className={`h-12 rounded flex items-center justify-center ${getHeatmapColor(row["6-9am"])}`}>
                        <span className="text-sm font-semibold text-white">{row["6-9am"]}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className={`h-12 rounded flex items-center justify-center ${getHeatmapColor(row["9-12pm"])}`}>
                        <span className="text-sm font-semibold text-white">{row["9-12pm"]}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className={`h-12 rounded flex items-center justify-center ${getHeatmapColor(row["12-3pm"])}`}>
                        <span className="text-sm font-semibold text-white">{row["12-3pm"]}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className={`h-12 rounded flex items-center justify-center ${getHeatmapColor(row["3-6pm"])}`}>
                        <span className="text-sm font-semibold text-white">{row["3-6pm"]}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className={`h-12 rounded flex items-center justify-center ${getHeatmapColor(row["6-9pm"])}`}>
                        <span className="text-sm font-semibold text-white">{row["6-9pm"]}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className={`h-12 rounded flex items-center justify-center ${getHeatmapColor(row["9-12am"])}`}>
                        <span className="text-sm font-semibold text-white">{row["9-12am"]}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Best times: Weekday afternoons (12-3 PM) and weekend evenings (6-9 PM)
          </p>
        </CardContent>
      </Card>

      {/* Hashtag Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Hashtag Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Hashtag</th>
                  <th className="text-right p-3 font-medium">Uses</th>
                  <th className="text-right p-3 font-medium">Avg Reach</th>
                  <th className="text-right p-3 font-medium">Avg ER</th>
                  <th className="text-right p-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {hashtagPerformance.map((tag, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50">
                    <td className="p-3 font-medium">{tag.hashtag}</td>
                    <td className="p-3 text-right">{tag.uses}</td>
                    <td className="p-3 text-right">{(tag.avgReach / 1000).toFixed(1)}K</td>
                    <td className="p-3 text-right">{tag.avgER}%</td>
                    <td className="p-3 text-right">
                      <span className={`flex items-center justify-end gap-1 ${tag.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                        {tag.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(tag.trend)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitorData.map((competitor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{competitor.name}</h4>
                    <p className="text-sm text-muted-foreground">{competitor.platform}</p>
                  </div>
                  <Badge variant={competitor.recentTrend === "up" ? "default" : "destructive"}>
                    {competitor.recentTrend === "up" ? (
                      <>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending Up
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Trending Down
                      </>
                    )}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Followers</p>
                    <p className="font-semibold">{(competitor.followers / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Posts/Week</p>
                    <p className="font-semibold">{competitor.avgPostsPerWeek}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg ER</p>
                    <p className="font-semibold">{competitor.avgEngagementRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Top Content</p>
                    <p className="font-semibold text-xs">{competitor.topContentType}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Benchmark */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={competitiveBenchmark}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar name="Greenfield" dataKey="greenfield" stroke="#0D9488" fill="#0D9488" fillOpacity={0.6} />
                <Radar name="Industry Avg" dataKey="industryAvg" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.3} />
                <Radar name="Top Performer" dataKey="topPerformer" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Modal */}
      {selectedPost && renderPostDetailModal()}
    </div>
  );
}
