"use client";

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

export default function CampaignsPage() {
  const spendTrendData = [
    { date: "01/01", spend: 1.2, projected: 1.5 },
    { date: "05/01", spend: 1.4, projected: 1.5 },
    { date: "10/01", spend: 1.8, projected: 1.5 },
    { date: "15/01", spend: 2.1, projected: 1.5 },
    { date: "20/01", spend: 1.9, projected: 1.5 },
    { date: "25/01", spend: 2.3, projected: 1.5 },
  ];

  const campaigns = [
    {
      name: "Summer Promo",
      platform: "Facebook",
      spend: "15,000,000",
      leads: 78,
      roas: "3.5x",
      status: "active",
    },
    {
      name: "Implant Ads",
      platform: "Google",
      spend: "20,000,000",
      leads: 45,
      roas: "4.2x",
      status: "active",
    },
    {
      name: "Teeth Whitening",
      platform: "Zalo",
      spend: "8,000,000",
      leads: 32,
      roas: "2.8x",
      status: "active",
    },
    {
      name: "Braces Campaign",
      platform: "Facebook",
      spend: "12,000,000",
      leads: 56,
      roas: "3.1x",
      status: "active",
    },
    {
      name: "Family Dental Care",
      platform: "Google",
      spend: "10,000,000",
      leads: 38,
      roas: "2.9x",
      status: "paused",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Campaigns Overview</h1>
        <p className="text-muted-foreground">
          Phân tích và theo dõi hiệu quả các chiến dịch marketing
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
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="zalo">Zalo</SelectItem>
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm campaign..." className="pl-10" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Tổng chi</p>
            <p className="text-2xl font-semibold">45.2M VND</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Tổng leads</p>
            <p className="text-2xl font-semibold">234</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Conversions</p>
            <p className="text-2xl font-semibold">89</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">ROAS trung bình</p>
            <p className="text-2xl font-semibold">3.2x</p>
          </CardContent>
        </Card>
      </div>

      {/* Spend Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng chi tiêu</CardTitle>
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
                name="Thực tế (M VND)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#94a3b8"
                name="Dự kiến (M VND)"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Campaign</th>
                  <th className="text-left p-3 font-medium">Platform</th>
                  <th className="text-right p-3 font-medium">Chi tiêu</th>
                  <th className="text-right p-3 font-medium">Leads</th>
                  <th className="text-right p-3 font-medium">ROAS</th>
                  <th className="text-left p-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50">
                    <td className="p-3 font-medium">{campaign.name}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{campaign.platform}</Badge>
                    </td>
                    <td className="p-3 text-right">{campaign.spend} VND</td>
                    <td className="p-3 text-right">{campaign.leads}</td>
                    <td className="p-3 text-right">
                      <span className="font-medium text-green-600">
                        {campaign.roas}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          campaign.status === "active" ? "default" : "secondary"
                        }
                      >
                        {campaign.status === "active" ? "Đang chạy" : "Tạm dừng"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
