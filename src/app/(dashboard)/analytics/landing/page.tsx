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
  Eye,
  Target,
  MousePointer,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  X,
  ExternalLink,
  Download,
  Edit,
  Users,
  Activity,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";

// Helper to format seconds into mm:ss
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LandingPagesPage() {
  const { t } = useLanguage();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate date ranges
  const dateParams = useMemo(() => {
    const end = new Date();
    const start = new Date();
    if (dateRange === "7d") start.setDate(end.getDate() - 7);
    else if (dateRange === "30d") start.setDate(end.getDate() - 30);
    else if (dateRange === "90d") start.setDate(end.getDate() - 90);
    else start.setDate(end.getDate() - 30);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [dateRange]);

  const landingPagesQuery = trpc.analytics.getLandingPagePerformance.useQuery(dateParams);

  if (landingPagesQuery.isLoading) return <PageLoading text={t.common.loading} />;
  if (landingPagesQuery.error) {
    return (
      <PageError
        error={landingPagesQuery.error}
        onRetry={() => void landingPagesQuery.refetch()}
      />
    );
  }

  const landingPages = landingPagesQuery.data ?? [];

  // Filter by search
  const filteredPages = searchQuery
    ? landingPages.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : landingPages;

  // Aggregate stats
  const totalVisitors = filteredPages.reduce((s, p) => s + p.totalVisits, 0);
  const totalConversions = filteredPages.reduce((s, p) => s + p.totalConversions, 0);
  const avgCvr =
    totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;
  const avgBounce =
    filteredPages.length > 0
      ? filteredPages.reduce((s, p) => s + p.avgBounceRate, 0) / filteredPages.length
      : 0;

  const selectedPageData = filteredPages.find((p) => p.id === selectedPage);

  // Build traffic trend data from individual page metrics
  const trafficTrendData = useMemo(() => {
    const byDate: Record<string, { visitors: number; conversions: number }> = {};
    for (const page of landingPages) {
      for (const metric of page.metrics) {
        const dateKey = new Date(metric.date).toISOString().split("T")[0];
        if (!byDate[dateKey]) byDate[dateKey] = { visitors: 0, conversions: 0 };
        byDate[dateKey].visitors += metric.visits;
        byDate[dateKey].conversions += metric.conversions;
      }
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("vi-VN", {
          month: "short",
          day: "numeric",
        }),
        visitors: data.visitors,
        conversions: data.conversions,
      }));
  }, [landingPages]);

  // Device data (not in DB -- static placeholder)
  const deviceData = [
    { name: "Mobile", value: 62, color: "#0D9488" },
    { name: "Desktop", value: 28, color: "#F59E0B" },
    { name: "Tablet", value: 10, color: "#94A3B8" },
  ];

  const getPerformanceBadge = (cvr: number) => {
    if (cvr >= 2.5)
      return <Badge className="bg-green-500 hover:bg-green-600">Xuat sac</Badge>;
    if (cvr >= 1.5)
      return <Badge className="bg-blue-500 hover:bg-blue-600">Tot</Badge>;
    if (cvr >= 0.5)
      return <Badge variant="secondary">Trung binh</Badge>;
    return <Badge variant="outline">Can cai thien</Badge>;
  };

  const renderPageDetailModal = () => {
    if (!selectedPageData) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-background rounded-lg shadow-2xl max-w-7xl w-full my-8">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPerformanceBadge(selectedPageData.conversionRate)}
                  <Badge variant="default">Dang chay</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedPageData.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="w-4 h-4" />
                  <span>{selectedPageData.url}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPage(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Visitors</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {selectedPageData.totalVisits.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {selectedPageData.totalConversions}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MousePointer className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">CVR</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedPageData.conversionRate.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Bounce Rate</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {selectedPageData.avgBounceRate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Metrics Chart */}
            {selectedPageData.metrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={selectedPageData.metrics
                          .sort(
                            (a, b) =>
                              new Date(a.date).getTime() - new Date(b.date).getTime()
                          )
                          .map((m) => ({
                            date: new Date(m.date).toLocaleDateString("vi-VN", {
                              month: "short",
                              day: "numeric",
                            }),
                            visits: m.visits,
                            conversions: m.conversions,
                            bounceRate: m.bounceRate,
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="visits"
                          stroke="#0d9488"
                          name="Visits"
                          strokeWidth={2}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="conversions"
                          stroke="#f59e0b"
                          name="Conversions"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Page Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Unique Visitors</p>
                    <p className="font-semibold">
                      {selectedPageData.uniqueVisitors.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Avg Time on Page</p>
                    <p className="font-semibold">
                      {formatTime(selectedPageData.avgTimeOnPage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">
                      Campaign
                    </p>
                    <p className="font-semibold">
                      {selectedPageData.campaign?.name ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Data Points</p>
                    <p className="font-semibold">
                      {selectedPageData.metrics.length} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      stage: "Page Views",
                      visitors: selectedPageData.totalVisits,
                      percentage: 100,
                    },
                    {
                      stage: "Unique Visitors",
                      visitors: selectedPageData.uniqueVisitors,
                      percentage:
                        selectedPageData.totalVisits > 0
                          ? (selectedPageData.uniqueVisitors /
                              selectedPageData.totalVisits) *
                            100
                          : 0,
                    },
                    {
                      stage: "Conversions",
                      visitors: selectedPageData.totalConversions,
                      percentage:
                        selectedPageData.totalVisits > 0
                          ? (selectedPageData.totalConversions /
                              selectedPageData.totalVisits) *
                            100
                          : 0,
                    },
                  ].map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-4">
                          <span>
                            {stage.visitors.toLocaleString()} visitors
                          </span>
                          <span className="font-bold text-primary">
                            {stage.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{
                            width: `${Math.min(stage.percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bounce Rate Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Bounce Rate Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedPageData.metrics
                        .sort(
                          (a, b) =>
                            new Date(a.date).getTime() - new Date(b.date).getTime()
                        )
                        .map((m) => ({
                          date: new Date(m.date).toLocaleDateString("vi-VN", {
                            month: "short",
                            day: "numeric",
                          }),
                          bounceRate: m.bounceRate,
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="bounceRate"
                        fill="#ef4444"
                        name="Bounce Rate (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Khoang thoi gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngay</SelectItem>
              <SelectItem value="30d">30 ngay</SelectItem>
              <SelectItem value="90d">90 ngay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Tao Landing Page Moi
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t.analytics.landing.visitors}</p>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {totalVisitors.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t.analytics.campaigns.conversions}</p>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalConversions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {t.analytics.landing.conversionRate}
              </p>
              <MousePointer className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{avgCvr.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t.analytics.landing.bounceRate}</p>
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{avgBounce.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic & Conversion Trend */}
      {trafficTrendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.analytics.landing.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="visitors"
                      stroke="#0d9488"
                      name="Visitors"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversions"
                      stroke="#f59e0b"
                      name="Conversions"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.analytics.overview}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {deviceData.map((device) => (
                  <div
                    key={device.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: device.color }}
                      />
                      <span>{device.name}</span>
                    </div>
                    <span className="font-medium">{device.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Landing Pages Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.analytics.landing.title}</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.common.search}
              className="pl-10 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPages.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t.common.noData}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedPage(page.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{page.name}</h3>
                        {getPerformanceBadge(page.conversionRate)}
                        <Badge variant="default">Dang chay</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <ExternalLink className="w-3 h-3" />
                        <span>{page.url}</span>
                      </div>
                    </div>
                    {page.campaign && (
                      <Badge variant="outline">{page.campaign.name}</Badge>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Visitors
                      </p>
                      <p className="text-lg font-semibold">
                        {page.totalVisits.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Conversions
                      </p>
                      <p className="text-lg font-semibold">
                        {page.totalConversions}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CVR</p>
                      <p className="text-lg font-semibold text-green-600">
                        {page.conversionRate.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Bounce Rate
                      </p>
                      <p className="text-lg font-semibold">
                        {page.avgBounceRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Avg Time
                      </p>
                      <p className="text-lg font-semibold">
                        {formatTime(page.avgTimeOnPage)}
                      </p>
                    </div>
                  </div>

                  {/* Campaign info */}
                  {page.campaign && (
                    <div className="bg-accent/50 p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Campaign:</p>
                      <p className="text-sm">{page.campaign.name}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Detail Modal */}
      {selectedPage && renderPageDetailModal()}
    </div>
  );
}
