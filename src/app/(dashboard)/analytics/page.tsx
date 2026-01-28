"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/kpi-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  MousePointer,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { subDays, format } from "date-fns";

const PLATFORM_COLORS = {
  google_ads: "#4285F4",
  facebook: "#1877F2",
  instagram: "#E4405F",
  zalo: "#0068FF",
  tiktok: "#000000",
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");

  const startDate = subDays(new Date(), parseInt(dateRange)).toISOString();
  const endDate = new Date().toISOString();

  const { data: dashboardStats } = trpc.analytics.getDashboardStats.useQuery({
    startDate,
    endDate,
  });

  const { data: spendByPlatform } = trpc.analytics.getSpendByPlatform.useQuery({
    startDate,
    endDate,
  });

  const { data: spendTrend } = trpc.analytics.getSpendTrend.useQuery({
    startDate,
    endDate,
    groupBy: "day",
  });

  const { data: campaigns } = trpc.analytics.getCampaigns.useQuery({
    startDate,
    endDate,
  });

  const platformData = spendByPlatform
    ? Object.entries(spendByPlatform).map(([platform, data]) => ({
        name: platform.replace("_", " "),
        spend: data.spend,
        leads: data.leads,
        conversions: data.conversions,
        color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || "#gray",
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Marketing Analytics
          </h1>
          <p className="text-gray-500">
            Track campaign performance and ROI
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Spend"
          value={formatCurrency(dashboardStats?.spend ?? 0)}
          subtitle={`${dateRange} days`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          title="Total Leads"
          value={formatNumber(dashboardStats?.leadCount ?? 0)}
          subtitle={`CPL: ${formatCurrency(dashboardStats?.cpl ?? 0)}`}
          icon={<Users className="h-5 w-5" />}
        />
        <KPICard
          title="Conversions"
          value={formatNumber(dashboardStats?.conversions ?? 0)}
          subtitle={`Rate: ${formatPercent(dashboardStats?.conversionRate ?? 0)}`}
          icon={<Target className="h-5 w-5" />}
        />
        <KPICard
          title="Clicks"
          value={formatNumber(dashboardStats?.clicks ?? 0)}
          subtitle={`CTR: ${formatPercent(dashboardStats?.ctr ?? 0)}`}
          icon={<MousePointer className="h-5 w-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spend Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spend Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), "MM/dd")}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(0)}M`
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) =>
                      format(new Date(label as string), "MMM dd, yyyy")
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#0D9488"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spend by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="spend"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {platformData.map((platform) => (
                <div key={platform.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-sm text-gray-600 capitalize">
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads & Conversions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads & Conversions by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="leads" fill="#0D9488" name="Leads" />
                <Bar dataKey="conversions" fill="#F59E0B" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Platform</th>
                  <th className="pb-3 font-medium text-right">Spend</th>
                  <th className="pb-3 font-medium text-right">Leads</th>
                  <th className="pb-3 font-medium text-right">CPL</th>
                  <th className="pb-3 font-medium text-right">CTR</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {campaigns?.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 font-medium">{campaign.name}</td>
                    <td className="py-4 capitalize">
                      {campaign.platform.replace("_", " ")}
                    </td>
                    <td className="py-4 text-right">
                      {formatCurrency(campaign.totalMetrics.spend)}
                    </td>
                    <td className="py-4 text-right">
                      {formatNumber(campaign.totalMetrics.leads)}
                    </td>
                    <td className="py-4 text-right">
                      {formatCurrency(campaign.cpl)}
                    </td>
                    <td className="py-4 text-right">
                      {formatPercent(campaign.ctr)}
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          campaign.status === "active"
                            ? "success"
                            : campaign.status === "paused"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {(!campaigns || campaigns.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No campaigns found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
