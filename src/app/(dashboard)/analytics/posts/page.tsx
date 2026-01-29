"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n";
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
  Calendar,
  Download,
  ExternalLink,
  BarChart2,
  Smile,
  ThumbsUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { format, subDays } from "date-fns";

type PlatformFilter = "all" | "google_ads" | "facebook" | "instagram" | "zalo" | "tiktok";
type TimeRange = "7d" | "30d" | "90d";

export default function PostsPage() {
  const { t } = useLanguage();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate date range
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = subDays(endDate, days);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [timeRange]);

  // Fetch posts data
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = trpc.analytics.getPostPerformance.useQuery({
    platform: platformFilter !== "all" ? platformFilter : undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 50,
  });

  // Filter posts by search query
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.content?.toLowerCase().includes(query) ||
        p.platform.toLowerCase().includes(query) ||
        p.campaign?.name.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  // Get selected post
  const selectedPost = useMemo(() => {
    if (!selectedPostId || !posts) return null;
    return posts.find((p) => p.id === selectedPostId) ?? null;
  }, [selectedPostId, posts]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!filteredPosts.length)
      return { totalPosts: 0, totalReach: 0, totalEngagement: 0, avgER: "0", bestPlatform: "N/A", bestPlatformER: "0" };

    const totalReach = filteredPosts.reduce((sum, p) => sum + p.reach, 0);
    const totalEngagement = filteredPosts.reduce((sum, p) => sum + p.engagement, 0);
    const avgER =
      filteredPosts.reduce((sum, p) => sum + p.engagementRate, 0) / filteredPosts.length;

    // Find best platform by average engagement rate
    const platformStats: Record<string, { totalER: number; count: number }> = {};
    filteredPosts.forEach((p) => {
      if (!platformStats[p.platform]) {
        platformStats[p.platform] = { totalER: 0, count: 0 };
      }
      platformStats[p.platform].totalER += p.engagementRate;
      platformStats[p.platform].count++;
    });

    let bestPlatform = "N/A";
    let bestAvgER = 0;
    Object.entries(platformStats).forEach(([platform, stats]) => {
      const avgPlatformER = stats.totalER / stats.count;
      if (avgPlatformER > bestAvgER) {
        bestAvgER = avgPlatformER;
        bestPlatform = platform;
      }
    });

    return {
      totalPosts: filteredPosts.length,
      totalReach,
      totalEngagement,
      avgER: avgER.toFixed(2),
      bestPlatform: getPlatformLabel(bestPlatform),
      bestPlatformER: bestAvgER.toFixed(2),
    };
  }, [filteredPosts]);

  // Platform comparison data
  const platformComparison = useMemo(() => {
    if (!filteredPosts.length) return [];

    const stats: Record<
      string,
      { posts: number; reach: number; engagement: number; totalER: number }
    > = {};

    filteredPosts.forEach((p) => {
      if (!stats[p.platform]) {
        stats[p.platform] = { posts: 0, reach: 0, engagement: 0, totalER: 0 };
      }
      stats[p.platform].posts++;
      stats[p.platform].reach += p.reach;
      stats[p.platform].engagement += p.engagement;
      stats[p.platform].totalER += p.engagementRate;
    });

    return Object.entries(stats).map(([platform, data]) => ({
      platform: getPlatformLabel(platform),
      totalPosts: data.posts,
      totalReach: data.reach,
      totalEngagement: data.engagement,
      avgEngagementRate: (data.totalER / data.posts).toFixed(2),
    }));
  }, [filteredPosts]);

  // Content type performance (based on video vs image detection from mediaUrl)
  const contentTypePerformance = useMemo(() => {
    if (!filteredPosts.length) return [];

    const stats: Record<string, { posts: number; totalER: number; totalReach: number }> = {};

    filteredPosts.forEach((p) => {
      // Determine type based on mediaUrl or videoViews
      let type = "Text";
      if (p.videoViews > 0) {
        type = "Video";
      } else if (p.mediaUrl) {
        type = "Image";
      }

      if (!stats[type]) {
        stats[type] = { posts: 0, totalER: 0, totalReach: 0 };
      }
      stats[type].posts++;
      stats[type].totalER += p.engagementRate;
      stats[type].totalReach += p.reach;
    });

    return Object.entries(stats).map(([type, data]) => ({
      type,
      posts: data.posts,
      avgER: (data.totalER / data.posts).toFixed(2),
      avgReach: Math.round(data.totalReach / data.posts),
    }));
  }, [filteredPosts]);

  function getPlatformLabel(platform: string) {
    const labels: Record<string, string> = {
      google_ads: "Google Ads",
      facebook: "Facebook",
      instagram: "Instagram",
      zalo: "Zalo",
      tiktok: "TikTok",
    };
    return labels[platform] || platform;
  }

  function getPostType(post: { videoViews: number; mediaUrl: string | null }) {
    if (post.videoViews > 0) return "Video";
    if (post.mediaUrl) return "Image";
    return "Text";
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderPostDetailModal = () => {
    if (!selectedPost) return null;

    // Mock sentiment data (would come from API in real app)
    const sentimentData = [
      { name: "Positive", value: 75, color: "#10B981" },
      { name: "Neutral", value: 20, color: "#94A3B8" },
      { name: "Negative", value: 5, color: "#EF4444" },
    ];

    const postType = getPostType(selectedPost);

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-background rounded-lg shadow-2xl max-w-5xl w-full my-8">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline">{getPlatformLabel(selectedPost.platform)}</Badge>
                  <Badge variant="secondary">{postType}</Badge>
                </div>
                <h2 className="text-xl font-bold mb-2 line-clamp-2">
                  {selectedPost.content?.substring(0, 100) || "Post Content"}...
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectedPost.publishedAt
                    ? format(new Date(selectedPost.publishedAt), "MMM d, yyyy h:mm a")
                    : "Not published"}
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
                <Button variant="ghost" size="icon" onClick={() => setSelectedPostId(null)}>
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
                  <p className="text-2xl font-bold">{formatNumber(selectedPost.reach)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(selectedPost.engagement)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">ER</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedPost.engagementRate.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(selectedPost.clicks)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(selectedPost.comments)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Shares</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(selectedPost.shares)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Post Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{selectedPost.content || "No content available"}</p>
                {selectedPost.campaign && (
                  <div className="mt-3">
                    <Badge variant="outline">Campaign: {selectedPost.campaign.name}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smile className="w-5 h-5" />
                    Estimated Sentiment
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
                          label={(entry) => `${entry.name}: ${entry.value}%`}
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
                    {sentimentData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Impressions</span>
                      <span className="font-semibold">{formatNumber(selectedPost.impressions)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Clicks</span>
                      <span className="font-semibold">{formatNumber(selectedPost.clicks)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">CTR</span>
                      <span className="font-semibold">{selectedPost.ctr.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Reach Rate</span>
                      <span className="font-semibold">
                        {selectedPost.impressions > 0
                          ? ((selectedPost.reach / selectedPost.impressions) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    {selectedPost.videoViews > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Video Views</span>
                        <span className="font-semibold">{formatNumber(selectedPost.videoViews)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={platformFilter}
          onValueChange={(v) => setPlatformFilter(v as PlatformFilter)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.all}</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="zalo">Zalo</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
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
          <Input
            placeholder={t.common.search}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            <p className="text-sm text-muted-foreground mb-1">{t.analytics.posts.totalPosts}</p>
            <p className="text-2xl font-bold">{summaryStats.totalPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.analytics.posts.reach}</p>
            <p className="text-2xl font-bold">{formatNumber(summaryStats.totalReach)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.analytics.posts.engagement}</p>
            <p className="text-2xl font-bold">{formatNumber(summaryStats.totalEngagement)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg ER</p>
            <p className="text-2xl font-bold text-green-600">{summaryStats.avgER}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Best Platform</p>
            <p className="text-2xl font-bold">{summaryStats.bestPlatform}</p>
            {summaryStats.bestPlatformER && (
              <p className="text-xs text-muted-foreground">{summaryStats.bestPlatformER}% ER</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Comparison */}
      {platformComparison.length > 0 && (
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
                  </tr>
                </thead>
                <tbody>
                  {platformComparison.map((platform) => (
                    <tr key={platform.platform} className="border-b hover:bg-accent/50">
                      <td className="p-3 font-medium">{platform.platform}</td>
                      <td className="p-3 text-right">{platform.totalPosts}</td>
                      <td className="p-3 text-right">{formatNumber(platform.totalReach)}</td>
                      <td className="p-3 text-right">{formatNumber(platform.totalEngagement)}</td>
                      <td className="p-3 text-right">
                        <span className="font-bold text-green-600">
                          {platform.avgEngagementRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Posts */}
      {filteredPosts.length === 0 ? (
        <PageEmpty
          title={t.common.noData}
          description={t.common.noData}
        />
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-4">{t.analytics.posts.topPosts}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredPosts.slice(0, 9).map((post) => {
              const postType = getPostType(post);
              return (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedPostId(post.id)}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-4xl">{postType}</span>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{getPlatformLabel(post.platform)}</Badge>
                      <Badge variant="outline">{postType}</Badge>
                    </div>
                    <p className="font-medium mb-3 line-clamp-2">
                      {post.content?.substring(0, 80) || "No content"}...
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground text-xs">{t.analytics.posts.reach}</p>
                        <p className="font-semibold">{formatNumber(post.reach)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">ER</p>
                        <p className="font-semibold text-green-600">
                          {post.engagementRate.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(post.engagement)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatNumber(post.comments)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {formatNumber(post.shares)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Type Performance */}
      {contentTypePerformance.length > 0 && (
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
      )}

      {/* Post Detail Modal */}
      {selectedPost && renderPostDetailModal()}
    </div>
  );
}
