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
import {
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  Target,
  MousePointer,
  Users,
  Briefcase,
  DollarSign,
  MapPin,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
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

export default function LandingPagesPage() {
  const landingPages = [
    {
      name: "Niềng Răng Invisalign - Nụ Cười Hoàn Hảo",
      url: "greenfielddental.vn/nieng-rang-invisalign",
      status: "active",
      visitors: 12543,
      conversions: 287,
      conversionRate: 2.29,
      avgTimeOnPage: "3:42",
      bounceRate: 42.3,
      targetMarket: {
        primaryAge: "25-40 tuổi",
        segment: "Chuyên gia trẻ, Doanh nhân",
        income: "20-50 triệu/tháng",
        location: "TP.HCM, Hà Nội",
      },
      services: ["Niềng răng Invisalign", "Tư vấn chỉnh nha", "3D Simulation"],
      performance: "excellent",
      trend: 12.5,
    },
    {
      name: "Cấy Ghép Implant - Răng Mới Vĩnh Viễn",
      url: "greenfielddental.vn/cay-ghep-implant",
      status: "active",
      visitors: 8921,
      conversions: 156,
      conversionRate: 1.75,
      avgTimeOnPage: "4:15",
      bounceRate: 38.7,
      targetMarket: {
        primaryAge: "45-65 tuổi",
        segment: "Người trung niên, Cao tuổi",
        income: "25-60 triệu/tháng",
        location: "TP.HCM, Bình Dương, Đồng Nai",
      },
      services: ["Implant Straumann", "Phục hồi toàn hàm", "CT 3D Scan"],
      performance: "good",
      trend: 8.3,
    },
    {
      name: "Nha Khoa Gia Đình - Chăm Sóc Toàn Diện",
      url: "greenfielddental.vn/nha-khoa-gia-dinh",
      status: "active",
      visitors: 15234,
      conversions: 428,
      conversionRate: 2.81,
      avgTimeOnPage: "2:58",
      bounceRate: 35.2,
      targetMarket: {
        primaryAge: "28-42 tuổi",
        segment: "Gia đình trẻ, Phụ huynh",
        income: "15-40 triệu/tháng",
        location: "TP.HCM và vùng phụ cận",
      },
      services: [
        "Khám tổng quát",
        "Nha khoa trẻ em",
        "Điều trị dự phòng",
        "Gói gia đình",
      ],
      performance: "excellent",
      trend: 15.7,
    },
    {
      name: "Tẩy Trắng Răng Zoom - Trắng Sáng 1 Giờ",
      url: "greenfielddental.vn/tay-trang-rang-zoom",
      status: "testing",
      visitors: 6543,
      conversions: 98,
      conversionRate: 1.5,
      avgTimeOnPage: "2:24",
      bounceRate: 52.1,
      targetMarket: {
        primaryAge: "22-35 tuổi",
        segment: "Người trẻ, Influencer, Nghệ sĩ",
        income: "12-35 triệu/tháng",
        location: "TP.HCM, Hà Nội, Đà Nẵng",
      },
      services: ["Tẩy trắng Zoom", "Whitening Home Kit", "Maintenance Package"],
      performance: "average",
      trend: -5.2,
    },
  ];

  const trafficTrendData = [
    { date: "T1", visitors: 8500, conversions: 165 },
    { date: "T2", visitors: 9200, conversions: 189 },
    { date: "T3", visitors: 11300, conversions: 245 },
    { date: "T4", visitors: 10800, conversions: 223 },
    { date: "T5", visitors: 12400, conversions: 287 },
    { date: "T6", visitors: 13900, conversions: 325 },
    { date: "T7", visitors: 15234, conversions: 378 },
  ];

  const deviceData = [
    { name: "Mobile", value: 62, color: "#0d9488" },
    { name: "Desktop", value: 28, color: "#f59e0b" },
    { name: "Tablet", value: 10, color: "#94a3b8" },
  ];

  const ageDistribution = [
    { age: "18-24", percentage: 12 },
    { age: "25-34", percentage: 38 },
    { age: "35-44", percentage: 28 },
    { age: "45-54", percentage: 15 },
    { age: "55+", percentage: 7 },
  ];

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "excellent":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Xuất sắc</Badge>
        );
      case "good":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Tốt</Badge>;
      case "average":
        return <Badge variant="secondary">Trung bình</Badge>;
      default:
        return <Badge variant="outline">Cần cải thiện</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Landing Pages</h1>
        <p className="text-muted-foreground">
          Phân tích hiệu suất các trang đích marketing
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày</SelectItem>
              <SelectItem value="30d">30 ngày</SelectItem>
              <SelectItem value="90d">90 ngày</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang chạy</SelectItem>
              <SelectItem value="testing">Đang test</SelectItem>
              <SelectItem value="paused">Tạm dừng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Tạo Landing Page Mới
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Tổng Visitors</p>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">43.2K</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground">
                vs tháng trước
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Tổng Conversions</p>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">969</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">+18.3%</span>
              <span className="text-xs text-muted-foreground">
                vs tháng trước
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Conversion Rate TB</p>
              <MousePointer className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">2.24%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">+0.3%</span>
              <span className="text-xs text-muted-foreground">
                vs tháng trước
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Bounce Rate TB</p>
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">42.1%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">-3.2%</span>
              <span className="text-xs text-muted-foreground">
                vs tháng trước
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic & Conversion Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Xu Hướng Traffic & Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân Bố Thiết Bị</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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

      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân Bố Độ Tuổi Khách Hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="percentage"
                fill="#0d9488"
                name="Tỷ lệ (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Landing Pages Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chi Tiết Landing Pages</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm landing page..."
              className="pl-10 w-[250px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {landingPages.map((page, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{page.name}</h3>
                      {getPerformanceBadge(page.performance)}
                      <Badge
                        variant={
                          page.status === "active" ? "default" : "secondary"
                        }
                      >
                        {page.status === "active" ? "Đang chạy" : "Đang test"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <ExternalLink className="w-3 h-3" />
                      <span>{page.url}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      {page.trend > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={
                          page.trend > 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {page.trend > 0 ? "+" : ""}
                        {page.trend}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Visitors
                    </p>
                    <p className="text-lg font-semibold">
                      {page.visitors.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Conversions
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      {page.conversions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Conv. Rate
                    </p>
                    <p className="text-lg font-semibold">
                      {page.conversionRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Avg. Time
                    </p>
                    <p className="text-lg font-semibold">{page.avgTimeOnPage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Bounce Rate
                    </p>
                    <p className="text-lg font-semibold">{page.bounceRate}%</p>
                  </div>
                </div>

                {/* Target Market Info */}
                <div className="bg-muted/50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Thị Trường Mục Tiêu
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Độ tuổi</p>
                        <p className="font-medium">
                          {page.targetMarket.primaryAge}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Phân khúc
                        </p>
                        <p className="font-medium">
                          {page.targetMarket.segment}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Thu nhập</p>
                        <p className="font-medium">{page.targetMarket.income}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Khu vực</p>
                        <p className="font-medium">
                          {page.targetMarket.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Dịch vụ featured:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {page.services.map((service, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button variant="outline" size="sm">
                    Chỉnh sửa
                  </Button>
                  <Button variant="outline" size="sm">
                    A/B Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Insights & Khuyến Nghị
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">
                  Landing page "Nha Khoa Gia Đình" đang có performance xuất sắc
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Conversion rate 2.81% cao hơn 25% so với trung bình. Nên tăng
                  budget cho traffic source này.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">
                  Cơ hội tối ưu hóa cho nhóm tuổi 25-34
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  38% traffic đến từ nhóm này nhưng conversion rate chỉ 1.8%.
                  Nên A/B test message và CTA cho segment này.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">
                  Landing page "Tẩy Trắng Răng" cần cải thiện
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Bounce rate 52.1% cao hơn 23% so với trung bình. Nên kiểm tra
                  tốc độ tải trang và relevance của content với ads.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">
                  Mobile traffic chiếm 62% nhưng conversion rate thấp hơn desktop
                  40%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Nên tối ưu hóa mobile experience, đặc biệt form điền thông tin
                  và CTA buttons.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
