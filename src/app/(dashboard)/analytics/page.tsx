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

export default function AnalyticsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  const campaignsData = [
    {
      id: 1,
      name: "Summer Promo - Niềng Răng Invisalign",
      platform: "Facebook",
      spend: "15,000,000",
      leads: 78,
      roas: "3.5x",
      status: "active",
      budget: {
        total: 20000000,
        spent: 15000000,
        remaining: 5000000,
        dailyBudget: 500000,
      },
      schedule: {
        startDate: "Dec 15, 2024",
        endDate: "Jan 31, 2025",
        runtime: "45 days",
        remaining: "15 days",
      },
      objective: "Lead Generation",
      targeting: {
        age: "25-45 tuổi",
        gender: "Tất cả",
        location: "TP. HCM, Hà Nội, Đà Nẵng",
        interests: ["Dental care", "Beauty", "Health & Wellness", "Cosmetic dentistry"],
        behavior: "Actively searching for dental services",
      },
      performance: {
        impressions: 523400,
        reach: 189200,
        clicks: 4523,
        ctr: 0.86,
        cpc: 3315,
        leads: 78,
        costPerLead: 192308,
        conversions: 23,
        conversionRate: 29.5,
        roas: 3.5,
      },
      demographics: {
        age: [
          { range: "18-24", percentage: 8 },
          { range: "25-34", percentage: 42 },
          { range: "35-44", percentage: 35 },
          { range: "45-54", percentage: 12 },
          { range: "55+", percentage: 3 },
        ],
        gender: [
          { type: "Female", percentage: 68 },
          { type: "Male", percentage: 32 },
        ],
        topCities: [
          { city: "TP. Hồ Chí Minh", percentage: 58 },
          { city: "Hà Nội", percentage: 25 },
          { city: "Đà Nẵng", percentage: 12 },
          { city: "Khác", percentage: 5 },
        ],
      },
      dailyPerformance: [
        { date: "01/12", impressions: 12500, clicks: 105, leads: 2, spend: 350000 },
        { date: "05/12", impressions: 15200, clicks: 132, leads: 3, spend: 440000 },
        { date: "10/12", impressions: 18900, clicks: 168, leads: 4, spend: 560000 },
        { date: "15/12", impressions: 22400, clicks: 195, leads: 5, spend: 650000 },
        { date: "20/12", impressions: 19800, clicks: 172, leads: 4, spend: 570000 },
        { date: "25/12", impressions: 21500, clicks: 188, leads: 5, spend: 625000 },
        { date: "30/12", impressions: 24100, clicks: 212, leads: 6, spend: 705000 },
      ],
      topAds: [
        {
          name: "Ad Variant A - Before/After",
          type: "Image",
          impressions: 142300,
          clicks: 1245,
          ctr: 0.87,
          leads: 28,
          costPerLead: 178000,
        },
        {
          name: "Ad Variant B - Testimonial Video",
          type: "Video",
          impressions: 189500,
          clicks: 1876,
          ctr: 0.99,
          leads: 35,
          costPerLead: 165000,
        },
        {
          name: "Ad Variant C - Promo Offer",
          type: "Carousel",
          impressions: 98400,
          clicks: 856,
          ctr: 0.87,
          leads: 15,
          costPerLead: 210000,
        },
      ],
      insights: [
        {
          type: "positive",
          title: "ROAS vượt target 35%",
          description: "Campaign đang hoạt động hiệu quả hơn dự kiến với ROAS 3.5x (target: 2.6x)",
        },
        {
          type: "positive",
          title: "Ad Variant B có performance xuất sắc",
          description: "Video testimonial có CTR cao nhất (0.99%) và cost per lead thấp nhất",
        },
        {
          type: "warning",
          title: "Budget sắp hết",
          description: "Chỉ còn 5M budget, cần xem xét tăng ngân sách hoặc tối ưu chi tiêu",
        },
        {
          type: "info",
          title: "Audience chủ yếu 25-44 tuổi",
          description: "77% leads đến từ nhóm tuổi 25-44, phù hợp với target market",
        },
      ],
    },
    {
      id: 2,
      name: "Implant Ads - Premium Package",
      platform: "Google",
      spend: "20,000,000",
      leads: 45,
      roas: "4.2x",
      status: "active",
      budget: {
        total: 25000000,
        spent: 20000000,
        remaining: 5000000,
        dailyBudget: 650000,
      },
      schedule: {
        startDate: "Jan 1, 2025",
        endDate: "Feb 15, 2025",
        runtime: "45 days",
        remaining: "18 days",
      },
      objective: "Conversions",
      targeting: {
        age: "40-60 tuổi",
        gender: "Tất cả",
        location: "TP. HCM và vùng lân cận",
        interests: ["Healthcare", "Dental implants", "High-income services"],
        behavior: "Searching for dental implant solutions",
      },
      performance: {
        impressions: 289400,
        reach: 124500,
        clicks: 2845,
        ctr: 0.98,
        cpc: 7032,
        leads: 45,
        costPerLead: 444444,
        conversions: 18,
        conversionRate: 40.0,
        roas: 4.2,
      },
      demographics: {
        age: [
          { range: "18-24", percentage: 2 },
          { range: "25-34", percentage: 15 },
          { range: "35-44", percentage: 28 },
          { range: "45-54", percentage: 38 },
          { range: "55+", percentage: 17 },
        ],
        gender: [
          { type: "Female", percentage: 52 },
          { type: "Male", percentage: 48 },
        ],
        topCities: [
          { city: "TP. Hồ Chí Minh", percentage: 72 },
          { city: "Bình Dương", percentage: 15 },
          { city: "Đồng Nai", percentage: 8 },
          { city: "Khác", percentage: 5 },
        ],
      },
      dailyPerformance: [
        { date: "01/01", impressions: 8500, clicks: 82, leads: 1, spend: 575000 },
        { date: "05/01", impressions: 10200, clicks: 98, leads: 2, spend: 690000 },
        { date: "10/01", impressions: 12400, clicks: 118, leads: 2, spend: 830000 },
        { date: "15/01", impressions: 14100, clicks: 135, leads: 3, spend: 950000 },
        { date: "20/01", impressions: 11800, clicks: 112, leads: 2, spend: 785000 },
        { date: "25/01", impressions: 13500, clicks: 128, leads: 3, spend: 900000 },
      ],
      topAds: [
        {
          name: "Search Ad - Implant Straumann",
          type: "Search",
          impressions: 98200,
          clicks: 1245,
          ctr: 1.27,
          leads: 22,
          costPerLead: 395000,
        },
        {
          name: "Display Ad - Premium Service",
          type: "Display",
          impressions: 145800,
          clicks: 1156,
          ctr: 0.79,
          leads: 18,
          costPerLead: 485000,
        },
        {
          name: "YouTube Ad - Patient Journey",
          type: "Video",
          impressions: 45400,
          clicks: 444,
          ctr: 0.98,
          leads: 5,
          costPerLead: 520000,
        },
      ],
      insights: [
        {
          type: "positive",
          title: "ROAS cao nhất trong tất cả campaigns",
          description: "4.2x ROAS cho thấy campaign có ROI rất tốt",
        },
        {
          type: "positive",
          title: "Conversion rate 40% - vượt target",
          description: "Tỷ lệ chuyển đổi từ lead sang booking cao, audience quality tốt",
        },
        {
          type: "info",
          title: "Audience tập trung 45-54 tuổi",
          description: "38% audience trong nhóm tuổi này, phù hợp với service cao cấp",
        },
      ],
    },
    {
      id: 3,
      name: "Teeth Whitening - Quick Results",
      platform: "Zalo",
      spend: "8,000,000",
      leads: 32,
      roas: "2.8x",
      status: "active",
      budget: {
        total: 10000000,
        spent: 8000000,
        remaining: 2000000,
        dailyBudget: 320000,
      },
      schedule: {
        startDate: "Jan 10, 2025",
        endDate: "Jan 31, 2025",
        runtime: "21 days",
        remaining: "8 days",
      },
      objective: "Brand Awareness",
      targeting: {
        age: "20-35 tuổi",
        gender: "Tất cả (ưu tiên nữ)",
        location: "TP. HCM, Hà Nội, Đà Nẵng, Cần Thơ",
        interests: ["Beauty", "Self-care", "Social media", "Cosmetics"],
        behavior: "Active Zalo users, online shoppers",
      },
      performance: {
        impressions: 184200,
        reach: 92400,
        clicks: 1856,
        ctr: 1.01,
        cpc: 4310,
        leads: 32,
        costPerLead: 250000,
        conversions: 12,
        conversionRate: 37.5,
        roas: 2.8,
      },
      demographics: {
        age: [
          { range: "18-24", percentage: 32 },
          { range: "25-34", percentage: 48 },
          { range: "35-44", percentage: 15 },
          { range: "45-54", percentage: 4 },
          { range: "55+", percentage: 1 },
        ],
        gender: [
          { type: "Female", percentage: 78 },
          { type: "Male", percentage: 22 },
        ],
        topCities: [
          { city: "TP. Hồ Chí Minh", percentage: 52 },
          { city: "Hà Nội", percentage: 28 },
          { city: "Đà Nẵng", percentage: 12 },
          { city: "Cần Thơ", percentage: 8 },
        ],
      },
      dailyPerformance: [
        { date: "10/01", impressions: 6200, clicks: 58, leads: 1, spend: 250000 },
        { date: "15/01", impressions: 8500, clicks: 82, leads: 2, spend: 355000 },
        { date: "20/01", impressions: 9800, clicks: 95, leads: 2, spend: 410000 },
        { date: "25/01", impressions: 11400, clicks: 112, leads: 3, spend: 485000 },
      ],
      topAds: [
        {
          name: "Zalo OA - Flash Sale",
          type: "Zalo Article",
          impressions: 78200,
          clicks: 856,
          ctr: 1.09,
          leads: 15,
          costPerLead: 220000,
        },
        {
          name: "Zalo Banner - Before/After",
          type: "Banner",
          impressions: 106000,
          clicks: 1000,
          ctr: 0.94,
          leads: 17,
          costPerLead: 275000,
        },
      ],
      insights: [
        {
          type: "positive",
          title: "CTR cao hơn benchmark",
          description: "1.01% CTR trên Zalo cao hơn mức trung bình ngành (0.7%)",
        },
        {
          type: "warning",
          title: "ROAS thấp hơn target",
          description: "2.8x ROAS thấp hơn target 3.0x, cần optimize ad creative hoặc targeting",
        },
        {
          type: "info",
          title: "Audience trẻ và chủ yếu nữ",
          description: "78% female, 80% dưới 35 tuổi - phù hợp với dịch vụ thẩm mỹ",
        },
      ],
    },
  ];

  const handleViewCampaign = (id: number) => {
    setSelectedCampaign(id);
  };

  const handleCloseCampaignDetail = () => {
    setSelectedCampaign(null);
  };

  const selectedCampaignData = campaignsData.find((c) => c.id === selectedCampaign);

  const renderCampaignDetail = () => {
    if (!selectedCampaignData) return null;

    const genderChartData = selectedCampaignData.demographics.gender.map((item) => ({
      name: item.type,
      value: item.percentage,
      color: item.type === "Female" ? "#F59E0B" : "#0D9488",
    }));

    const cityChartData = selectedCampaignData.demographics.topCities.map((item, index) => ({
      name: item.city,
      value: item.percentage,
      color: ["#0D9488", "#F59E0B", "#8B5CF6", "#94A3B8"][index],
    }));

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="text-sm">
                    {selectedCampaignData.platform}
                  </Badge>
                  <Badge variant="default">
                    {selectedCampaignData.status === "active" ? "Đang chạy" : "Tạm dừng"}
                  </Badge>
                  <Badge variant="secondary">{selectedCampaignData.objective}</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedCampaignData.name}</h2>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedCampaignData.schedule.startDate} - {selectedCampaignData.schedule.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedCampaignData.schedule.remaining} remaining
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Budget: {(selectedCampaignData.budget.total / 1000000).toFixed(1)}M VND
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
                  <p className="text-2xl font-bold text-green-600">{selectedCampaignData.roas}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Leads</p>
                  <p className="text-2xl font-bold">{selectedCampaignData.leads}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Conversions</p>
                  <p className="text-2xl font-bold">{selectedCampaignData.performance.conversions}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">CTR</p>
                  <p className="text-2xl font-bold">{selectedCampaignData.performance.ctr}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Impressions</p>
                  <p className="text-2xl font-bold">{(selectedCampaignData.performance.impressions / 1000).toFixed(0)}K</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Cost/Lead</p>
                  <p className="text-2xl font-bold">{(selectedCampaignData.performance.costPerLead / 1000).toFixed(0)}K</p>
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
                    <span>Spent: {(selectedCampaignData.budget.spent / 1000000).toFixed(1)}M VND</span>
                    <span>Remaining: {(selectedCampaignData.budget.remaining / 1000000).toFixed(1)}M VND</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${(selectedCampaignData.budget.spent / selectedCampaignData.budget.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Daily budget: {(selectedCampaignData.budget.dailyBudget / 1000).toFixed(0)}K VND/day
                  </p>
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
                      <AreaChart data={selectedCampaignData.dailyPerformance}>
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
                    <p className="font-medium">{selectedCampaignData.targeting.age}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Gender</p>
                    <p className="font-medium">{selectedCampaignData.targeting.gender}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{selectedCampaignData.targeting.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Interests</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCampaignData.targeting.interests.map((interest, i) => (
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
                      <BarChart data={selectedCampaignData.demographics.age}>
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
                    {selectedCampaignData.demographics.topCities.map((city, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cityChartData[i].color }} />
                          <span>{city.city}</span>
                        </div>
                        <span className="font-medium">{city.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Ads Performance */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Ads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Ad Name</th>
                        <th className="text-left p-3 font-medium">Type</th>
                        <th className="text-right p-3 font-medium">Impressions</th>
                        <th className="text-right p-3 font-medium">Clicks</th>
                        <th className="text-right p-3 font-medium">CTR</th>
                        <th className="text-right p-3 font-medium">Leads</th>
                        <th className="text-right p-3 font-medium">Cost/Lead</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCampaignData.topAds.map((ad, index) => (
                        <tr key={index} className="border-b hover:bg-accent/50">
                          <td className="p-3 font-medium">{ad.name}</td>
                          <td className="p-3">
                            <Badge variant="secondary">{ad.type}</Badge>
                          </td>
                          <td className="p-3 text-right">{ad.impressions.toLocaleString()}</td>
                          <td className="p-3 text-right">{ad.clicks.toLocaleString()}</td>
                          <td className="p-3 text-right">{ad.ctr}%</td>
                          <td className="p-3 text-right font-medium">{ad.leads}</td>
                          <td className="p-3 text-right">{(ad.costPerLead / 1000).toFixed(0)}K</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Insights & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCampaignData.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === "positive"
                          ? "border-l-green-500 bg-green-50 dark:bg-green-950/20"
                          : insight.type === "warning"
                          ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
                          : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {insight.type === "positive" ? "✅" : insight.type === "warning" ? "⚠️" : "ℹ️"}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold mb-1">{insight.title}</p>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Campaigns Overview</h1>
        <p className="text-muted-foreground">Phân tích chi tiết performance của marketing campaigns</p>
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
            <p className="text-2xl font-semibold">43M VND</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Tổng leads</p>
            <p className="text-2xl font-semibold">155</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Conversions</p>
            <p className="text-2xl font-semibold">53</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">ROAS trung bình</p>
            <p className="text-2xl font-semibold">3.5x</p>
          </CardContent>
        </Card>
      </div>

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
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaignsData.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-accent/50 cursor-pointer">
                    <td className="p-3 font-medium">{campaign.name}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{campaign.platform}</Badge>
                    </td>
                    <td className="p-3 text-right">{campaign.spend} VND</td>
                    <td className="p-3 text-right">{campaign.leads}</td>
                    <td className="p-3 text-right">
                      <span className="font-medium text-green-600">{campaign.roas}</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="default">Đang chạy</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Button size="sm" variant="outline" onClick={() => handleViewCampaign(campaign.id)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Detail Modal */}
      {selectedCampaign && renderCampaignDetail()}
    </div>
  );
}
