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
  Edit,
  Share2,
  Download,
  X,
  Calendar,
  Clock,
  DollarSign,
  Target,
  Sparkles,
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
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { format, subDays } from "date-fns";

type PlatformFilter = "all" | "google_ads" | "facebook" | "instagram" | "zalo" | "tiktok";

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
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

  // Fetch campaigns data
  const {
    data: campaigns,
    isLoading,
    error,
    refetch,
  } = trpc.analytics.getCampaigns.useQuery(
    platformFilter !== "all" ? { platform: platformFilter } : undefined
  );

  // Fetch dashboard stats
  const { data: dashboardStats } = trpc.analytics.getDashboardStats.useQuery(dateRange);

  // Fetch selected campaign details
  const { data: campaignDetails } = trpc.analytics.getCampaignById.useQuery(
    { id: selectedCampaignId ?? "" },
    { enabled: !!selectedCampaignId }
  );

  // Filter campaigns by search query
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    if (!searchQuery.trim()) return campaigns;
    const query = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) => c.name.toLowerCase().includes(query) || c.platform.toLowerCase().includes(query)
    );
  }, [campaigns, searchQuery]);

  // Calculate totals from campaigns
  const totals = useMemo(() => {
    if (!filteredCampaigns.length)
      return { spend: 0, leads: 0, conversions: 0, avgRoas: 0 };

    const totalSpend = filteredCampaigns.reduce(
      (sum, c) => sum + (c.totalMetrics?.spend ?? 0),
      0
    );
    const totalLeads = filteredCampaigns.reduce(
      (sum, c) => sum + (c.totalMetrics?.leads ?? 0),
      0
    );
    const totalConversions = filteredCampaigns.reduce(
      (sum, c) => sum + (c.totalMetrics?.conversions ?? 0),
      0
    );
    // Calculate average ROAS (simplified: revenue / spend ratio)
    // Using a mock multiplier since we don't have revenue data
    const avgRoas = totalSpend > 0 ? ((totalConversions * 500000) / totalSpend).toFixed(1) : "0";

    return { spend: totalSpend, leads: totalLeads, conversions: totalConversions, avgRoas };
  }, [filteredCampaigns]);

  const handleViewCampaign = (id: string) => {
    setSelectedCampaignId(id);
  };

  const handleCloseCampaignDetail = () => {
    setSelectedCampaignId(null);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const getPlatformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      google_ads: "Google Ads",
      facebook: "Facebook",
      instagram: "Instagram",
      zalo: "Zalo",
      tiktok: "TikTok",
    };
    return labels[platform] || platform;
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge variant="default">Dang chay</Badge>;
    if (status === "paused") return <Badge variant="secondary">Tam dung</Badge>;
    if (status === "completed") return <Badge variant="outline">Hoan thanh</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const renderCampaignDetail = () => {
    if (!campaignDetails) return null;

    // Process metrics for charts
    const dailyPerformance =
      campaignDetails.metrics?.map((m) => ({
        date: format(new Date(m.date), "dd/MM"),
        impressions: m.impressions,
        clicks: m.clicks,
        leads: m.leads,
        spend: m.spend,
      })) ?? [];

    // Mock demographics and insights (since these aren't in the API)
    const ageDistribution = [
      { range: "18-24", percentage: 12 },
      { range: "25-34", percentage: 45 },
      { range: "35-44", percentage: 28 },
      { range: "45-54", percentage: 12 },
      { range: "55+", percentage: 3 },
    ];

    const genderChartData = [
      { name: "Female", value: 65, color: "#F59E0B" },
      { name: "Male", value: 35, color: "#0D9488" },
    ];

    const cityChartData = [
      { name: "TP. HCM", value: 55, color: "#0D9488" },
      { name: "Ha Noi", value: 25, color: "#F59E0B" },
      { name: "Da Nang", value: 12, color: "#8B5CF6" },
      { name: "Khac", value: 8, color: "#94A3B8" },
    ];

    // Calculate campaign stats
    const totalMetrics =
      campaignDetails.metrics?.reduce(
        (acc, m) => ({
          impressions: acc.impressions + m.impressions,
          clicks: acc.clicks + m.clicks,
          leads: acc.leads + m.leads,
          conversions: acc.conversions + m.conversions,
          spend: acc.spend + m.spend,
        }),
        { impressions: 0, clicks: 0, leads: 0, conversions: 0, spend: 0 }
      ) ?? { impressions: 0, clicks: 0, leads: 0, conversions: 0, spend: 0 };

    const ctr =
      totalMetrics.impressions > 0
        ? ((totalMetrics.clicks / totalMetrics.impressions) * 100).toFixed(2)
        : "0";
    const costPerLead =
      totalMetrics.leads > 0 ? Math.round(totalMetrics.spend / totalMetrics.leads) : 0;
    const roas = totalMetrics.spend > 0 ? ((totalMetrics.conversions * 500000) / totalMetrics.spend).toFixed(1) : "0";

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="text-sm">
                    {getPlatformLabel(campaignDetails.platform)}
                  </Badge>
                  {getStatusBadge(campaignDetails.status)}
                  <Badge variant="secondary">{campaignDetails.objective ?? "Lead Generation"}</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">{campaignDetails.name}</h2>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {campaignDetails.startDate
                      ? format(new Date(campaignDetails.startDate), "MMM d, yyyy")
                      : "N/A"}{" "}
                    -{" "}
                    {campaignDetails.endDate
                      ? format(new Date(campaignDetails.endDate), "MMM d, yyyy")
                      : "Ongoing"}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Budget: {formatCurrency(campaignDetails.budget ?? 0)} VND
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCloseCampaignDetail}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">ROAS</p>
                  <p className="text-2xl font-bold text-green-600">{roas}x</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Leads</p>
                  <p className="text-2xl font-bold">{totalMetrics.leads}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Conversions</p>
                  <p className="text-2xl font-bold">{totalMetrics.conversions}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">CTR</p>
                  <p className="text-2xl font-bold">{ctr}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Impressions</p>
                  <p className="text-2xl font-bold">
                    {(totalMetrics.impressions / 1000).toFixed(0)}K
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Cost/Lead</p>
                  <p className="text-2xl font-bold">{formatCurrency(costPerLead)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Budget Progress */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Budget Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Spent: {formatCurrency(totalMetrics.spend)} VND</span>
                    <span>
                      Remaining:{" "}
                      {formatCurrency(
                        Math.max(0, (campaignDetails.budget ?? 0) - totalMetrics.spend)
                      )}{" "}
                      VND
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (totalMetrics.spend / (campaignDetails.budget || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Performance Trend */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyPerformance}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="leads"
                          stroke="#0D9488"
                          fillOpacity={1}
                          fill="url(#colorLeads)"
                          name="Leads"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="spend"
                          stroke="#F59E0B"
                          fillOpacity={1}
                          fill="url(#colorSpend)"
                          name="Spend (VND)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Targeting */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Targeting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Age</p>
                    <p className="font-medium">25-45 tuoi</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Gender</p>
                    <p className="font-medium">Tat ca</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">TP. HCM, Ha Noi</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Interests</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["Dental care", "Health", "Beauty"].map((interest: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#0D9488" name="%" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gender Split */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gender Split</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {genderChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Cities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Cities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cityChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ value }) => `${value}%`}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {cityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-1">
                    {cityChartData.map((city, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: city.color }}
                          />
                          <span>{city.name}</span>
                        </div>
                        <span className="font-medium">{city.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Ads Performance */}
            {campaignDetails.ads && campaignDetails.ads.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Ads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Ad</th>
                          <th className="text-right p-3 font-medium">Impressions</th>
                          <th className="text-right p-3 font-medium">Clicks</th>
                          <th className="text-right p-3 font-medium">CTR</th>
                          <th className="text-right p-3 font-medium">Conversions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaignDetails.ads.map((ad) => (
                          <tr key={ad.id} className="border-b hover:bg-accent/50">
                            <td className="p-3 font-medium">{ad.headline ?? `Ad ${ad.id.substring(0, 8)}`}</td>
                            <td className="p-3 text-right">{ad.impressions?.toLocaleString() ?? 0}</td>
                            <td className="p-3 text-right">{ad.clicks?.toLocaleString() ?? 0}</td>
                            <td className="p-3 text-right">
                              {ad.impressions
                                ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                                : 0}
                              %
                            </td>
                            <td className="p-3 text-right">{ad.conversions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parseFloat(roas) >= 3 && (
                    <div className="p-4 rounded-lg border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">Good</div>
                        <div className="flex-1">
                          <p className="font-semibold mb-1">ROAS vuot target</p>
                          <p className="text-sm text-muted-foreground">
                            Campaign dang hoat dong hieu qua voi ROAS {roas}x
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {parseFloat(ctr) > 1 && (
                    <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">Info</div>
                        <div className="flex-1">
                          <p className="font-semibold mb-1">CTR cao hon benchmark</p>
                          <p className="text-sm text-muted-foreground">
                            CTR {ctr}% cao hon muc trung binh nganh (0.9%)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {totalMetrics.spend > (campaignDetails.budget ?? 0) * 0.8 && (
                    <div className="p-4 rounded-lg border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">Warning</div>
                        <div className="flex-1">
                          <p className="font-semibold mb-1">Budget sap het</p>
                          <p className="text-sm text-muted-foreground">
                            Da su dung hon 80% budget, can xem xet tang ngan sach hoac toi uu chi tieu
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">{t.analytics.campaigns.title}</h1>
        <p className="text-muted-foreground">
          {t.analytics.campaigns.subtitle}
        </p>
      </div>

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
            <SelectItem value="google_ads">Google Ads</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="zalo">Zalo</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as "7d" | "30d" | "90d")}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Khoang thoi gian" />
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.analytics.campaigns.totalSpend}</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(dashboardStats?.spend ?? totals.spend)} VND
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.analytics.campaigns.conversions}</p>
            <p className="text-2xl font-semibold">
              {dashboardStats?.leads ?? totals.leads}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Conversions</p>
            <p className="text-2xl font-semibold">
              {dashboardStats?.conversions ?? totals.conversions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.analytics.campaigns.roas}</p>
            <p className="text-2xl font-semibold">{totals.avgRoas}x</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      {filteredCampaigns.length === 0 ? (
        <PageEmpty
          title={t.analytics.campaigns.noCampaigns}
          description={t.analytics.campaigns.noCampaigns}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.campaigns.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Campaign</th>
                    <th className="text-left p-3 font-medium">Platform</th>
                    <th className="text-right p-3 font-medium">Chi tieu</th>
                    <th className="text-right p-3 font-medium">Leads</th>
                    <th className="text-right p-3 font-medium">ROAS</th>
                    <th className="text-left p-3 font-medium">Trang thai</th>
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => {
                    const campaignRoas =
                      campaign.totalMetrics?.spend > 0
                        ? (
                            (campaign.totalMetrics.conversions * 500000) /
                            campaign.totalMetrics.spend
                          ).toFixed(1)
                        : "0";

                    return (
                      <tr
                        key={campaign.id}
                        className="border-b hover:bg-accent/50 cursor-pointer"
                      >
                        <td className="p-3 font-medium">{campaign.name}</td>
                        <td className="p-3">
                          <Badge variant="secondary">
                            {getPlatformLabel(campaign.platform)}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(campaign.totalMetrics?.spend ?? 0)} VND
                        </td>
                        <td className="p-3 text-right">
                          {campaign.totalMetrics?.leads ?? 0}
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-medium text-green-600">
                            {campaignRoas}x
                          </span>
                        </td>
                        <td className="p-3">{getStatusBadge(campaign.status)}</td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCampaign(campaign.id)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaignId && renderCampaignDetail()}
    </div>
  );
}
