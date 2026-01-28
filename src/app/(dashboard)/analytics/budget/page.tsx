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

export default function BudgetPage() {
  const spendTrendData = [
    { date: "01/01", spend: 1.2, projected: 1.5 },
    { date: "05/01", spend: 1.4, projected: 1.5 },
    { date: "10/01", spend: 1.8, projected: 1.5 },
    { date: "15/01", spend: 2.1, projected: 1.5 },
    { date: "20/01", spend: 1.9, projected: 1.5 },
    { date: "25/01", spend: 2.3, projected: 1.5 },
  ];

  const platformData = [
    { name: "Google Ads", budget: 20, spent: 12.6, percentage: 63 },
    { name: "Facebook", budget: 20, spent: 14.4, percentage: 72 },
    { name: "Zalo Ads", budget: 10, spent: 5.5, percentage: 55 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Monthly Budget</h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi ngân sách marketing hàng tháng
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ngân sách tháng 1/2024</h2>
        <Select defaultValue="jan-2024">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn tháng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jan-2024">Tháng 1 2024</SelectItem>
            <SelectItem value="dec-2023">Tháng 12 2023</SelectItem>
            <SelectItem value="nov-2023">Tháng 11 2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Budget Summary */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                TỔNG NGÂN SÁCH: 50,000,000 VND
              </h3>
              <div className="w-full bg-muted rounded-full h-4 mb-2">
                <div
                  className="bg-primary h-4 rounded-full transition-all duration-500"
                  style={{ width: "65%" }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-medium">Đã chi:</span> 32,500,000 VND
                </span>
                <span>
                  <span className="font-medium">Còn lại:</span> 17,500,000 VND
                </span>
                <span className="text-muted-foreground">10 ngày còn lại</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Đã chi</p>
            <p className="text-2xl font-semibold text-primary">32.5M VND</p>
            <p className="text-xs text-muted-foreground mt-1">65% ngân sách</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Còn lại</p>
            <p className="text-2xl font-semibold">17.5M VND</p>
            <p className="text-xs text-muted-foreground mt-1">35% ngân sách</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Chi tiêu TB/ngày</p>
            <p className="text-2xl font-semibold">1.63M VND</p>
            <p className="text-xs text-muted-foreground mt-1">Dự kiến: 1.67M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Dự kiến cuối tháng</p>
            <p className="text-2xl font-semibold">48.9M VND</p>
            <p className="text-xs text-green-600 mt-1">Dưới ngân sách 1.1M</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết theo nền tảng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {platformData.map((platform) => (
              <div key={platform.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{platform.name}</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {platform.spent}M / {platform.budget}M VND
                    </span>
                    <Badge
                      variant={
                        platform.percentage > 70
                          ? "destructive"
                          : platform.percentage > 60
                          ? "secondary"
                          : "default"
                      }
                    >
                      {platform.percentage}%
                    </Badge>
                    {platform.percentage > 70 ? (
                      <span className="text-xs text-red-500">⚠️ Vượt dự kiến</span>
                    ) : platform.percentage > 60 ? (
                      <span className="text-xs text-amber-500">✓ Đúng tiến độ</span>
                    ) : (
                      <span className="text-xs text-green-500">✓ Dưới dự kiến</span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      platform.percentage > 70
                        ? "bg-red-500"
                        : platform.percentage > 60
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${platform.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Spend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiêu hàng ngày</CardTitle>
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

      {/* Alerts */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle>Cảnh báo & Thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                ⚠️
              </Badge>
              <div>
                <p className="font-medium text-amber-800">
                  Facebook spend vượt dự kiến 5%
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Đã chi 72% ngân sách nhưng còn 33% thời gian. Cần xem xét điều
                  chỉnh pacing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                ℹ️
              </Badge>
              <div>
                <p className="font-medium text-blue-800">
                  Dự kiến cuối tháng: 48,500,000 VND
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Dưới ngân sách 1.5M - có thể tăng chi tiêu cho campaign hiệu
                  quả.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                ✓
              </Badge>
              <div>
                <p className="font-medium text-green-800">
                  Zalo Ads đang dưới pacing
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Chỉ chi 55% ngân sách. Có thể tăng budget hoặc reallocate cho
                  platform khác.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiêu theo Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Campaign</th>
                  <th className="text-left p-3 font-medium">Platform</th>
                  <th className="text-right p-3 font-medium">Ngân sách</th>
                  <th className="text-right p-3 font-medium">Đã chi</th>
                  <th className="text-right p-3 font-medium">%</th>
                  <th className="text-left p-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-accent/50">
                  <td className="p-3 font-medium">Summer Promo</td>
                  <td className="p-3">
                    <Badge variant="secondary">Facebook</Badge>
                  </td>
                  <td className="p-3 text-right">10M VND</td>
                  <td className="p-3 text-right">7.2M VND</td>
                  <td className="p-3 text-right">
                    <span className="font-medium text-amber-600">72%</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary">⚠️ Vượt pace</Badge>
                  </td>
                </tr>
                <tr className="border-b hover:bg-accent/50">
                  <td className="p-3 font-medium">Implant Ads</td>
                  <td className="p-3">
                    <Badge variant="secondary">Google</Badge>
                  </td>
                  <td className="p-3 text-right">12M VND</td>
                  <td className="p-3 text-right">7.8M VND</td>
                  <td className="p-3 text-right">
                    <span className="font-medium text-green-600">65%</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="default">✓ Đúng pace</Badge>
                  </td>
                </tr>
                <tr className="border-b hover:bg-accent/50">
                  <td className="p-3 font-medium">Teeth Whitening</td>
                  <td className="p-3">
                    <Badge variant="secondary">Zalo</Badge>
                  </td>
                  <td className="p-3 text-right">5M VND</td>
                  <td className="p-3 text-right">2.5M VND</td>
                  <td className="p-3 text-right">
                    <span className="font-medium text-green-600">50%</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">Dưới pace</Badge>
                  </td>
                </tr>
                <tr className="border-b hover:bg-accent/50">
                  <td className="p-3 font-medium">Braces Campaign</td>
                  <td className="p-3">
                    <Badge variant="secondary">Facebook</Badge>
                  </td>
                  <td className="p-3 text-right">8M VND</td>
                  <td className="p-3 text-right">5.2M VND</td>
                  <td className="p-3 text-right">
                    <span className="font-medium text-green-600">65%</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="default">✓ Đúng pace</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
