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
import { Search, Filter } from "lucide-react";
import {
  LineChart,
  Line,
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
import { subDays } from "date-fns";

type PlatformFilter = "all" | "google_ads" | "facebook" | "instagram" | "zalo" | "tiktok";
type TimeRange = "7d" | "30d" | "90d";

export default function CampaignsPage() {
  const { t } = useLanguage();
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

  // Fetch campaigns data
  const {
    data: campaigns,
    isLoading,
    error,
    refetch,
  } = trpc.analytics.getCampaigns.useQuery(
    platformFilter !== "all" ? { platform: platformFilter } : undefined
  );

  // Fetch spend trend data
  const { data: spendTrend } = trpc.analytics.getSpendTrend.useQuery({
    ...dateRange,
    groupBy: timeRange === "7d" ? "day" : timeRange === "30d" ? "day" : "week",
  });

  // Filter campaigns by search query
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    if (!searchQuery.trim()) return campaigns;
    const query = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) => c.name.toLowerCase().includes(query) || c.platform.toLowerCase().includes(query)
    );
  }, [campaigns, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!filteredCampaigns.length) return { spend: 0, leads: 0, conversions: 0, avgRoas: "0" };

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
    const avgRoas = totalSpend > 0 ? ((totalConversions * 500000) / totalSpend).toFixed(1) : "0";

    return { spend: totalSpend, leads: totalLeads, conversions: totalConversions, avgRoas };
  }, [filteredCampaigns]);

  // Transform spend trend for chart
  const spendTrendData = useMemo(() => {
    if (!spendTrend) return [];
    return spendTrend.map((item) => ({
      date: item.date.substring(5), // MM-DD format
      spend: (item.spend / 1000000).toFixed(2),
      projected: 1.5, // Placeholder for projected spend
    }));
  }, [spendTrend]);

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

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
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
          onValueChange={(v) => setTimeRange(v as TimeRange)}
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
            <p className="text-2xl font-semibold">{formatCurrency(totals.spend)} VND</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.analytics.campaigns.conversions}</p>
            <p className="text-2xl font-semibold">{totals.leads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Conversions</p>
            <p className="text-2xl font-semibold">{totals.conversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.analytics.campaigns.roas}</p>
            <p className="text-2xl font-semibold">{totals.avgRoas}x</p>
          </CardContent>
        </Card>
      </div>

      {/* Spend Trend Chart */}
      {spendTrendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.analytics.budget.dailySpend}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke="#0d9488"
                  name="Thuc te (M VND)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#94a3b8"
                  name="Du kien (M VND)"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => {
                    const campaignRoas =
                      campaign.totalMetrics?.spend > 0
                        ? ((campaign.totalMetrics.conversions * 500000) / campaign.totalMetrics.spend).toFixed(1)
                        : "0";

                    return (
                      <tr key={campaign.id} className="border-b hover:bg-accent/50">
                        <td className="p-3 font-medium">{campaign.name}</td>
                        <td className="p-3">
                          <Badge variant="secondary">
                            {getPlatformLabel(campaign.platform)}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(campaign.totalMetrics?.spend ?? 0)} VND
                        </td>
                        <td className="p-3 text-right">{campaign.totalMetrics?.leads ?? 0}</td>
                        <td className="p-3 text-right">
                          <span className="font-medium text-green-600">
                            {campaignRoas}x
                          </span>
                        </td>
                        <td className="p-3">{getStatusBadge(campaign.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
