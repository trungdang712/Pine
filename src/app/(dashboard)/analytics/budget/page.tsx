"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Pause,
  Play,
  Send,
  Settings,
  X,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Area,
  ResponsiveContainer,
} from "recharts";

export default function BudgetPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showAdjustmentRequest, setShowAdjustmentRequest] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("jan-2025");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const monthlyBudgetData = {
    "jan-2025": {
      total: 50000000,
      spent: 32500000,
      remaining: 17500000,
      daysRemaining: 10,
      projectedEndSpend: 48500000,
      projectedVariance: -1500000,
    },
    "dec-2024": {
      total: 45000000,
      spent: 44200000,
      remaining: 800000,
      daysRemaining: 0,
      projectedEndSpend: 44200000,
      projectedVariance: -800000,
    },
    "nov-2024": {
      total: 48000000,
      spent: 49500000,
      remaining: -1500000,
      daysRemaining: 0,
      projectedEndSpend: 49500000,
      projectedVariance: 1500000,
    },
  };

  const currentMonthData = monthlyBudgetData[selectedMonth as keyof typeof monthlyBudgetData];

  const platformBudgets = [
    {
      name: "Google Ads",
      budget: 20000000,
      spent: 12600000,
      percentage: 63,
      pace: "ok",
      campaigns: 8,
      avgROAS: 4.2,
      topCampaign: "Implant Ads",
      dailyAvg: 420000,
    },
    {
      name: "Facebook Ads",
      budget: 20000000,
      spent: 14400000,
      percentage: 72,
      pace: "over",
      campaigns: 12,
      avgROAS: 3.5,
      topCampaign: "Summer Promo",
      dailyAvg: 480000,
    },
    {
      name: "Zalo Ads",
      budget: 10000000,
      spent: 5500000,
      percentage: 55,
      pace: "under",
      campaigns: 5,
      avgROAS: 2.8,
      topCampaign: "Teeth Whitening",
      dailyAvg: 183000,
    },
  ];

  const dailySpendData = [
    { date: "01/01", actual: 1200000, projected: 1500000, cumulative: 1200000 },
    { date: "05/01", actual: 1400000, projected: 1500000, cumulative: 7000000 },
    { date: "10/01", actual: 1800000, projected: 1500000, cumulative: 15000000 },
    { date: "15/01", actual: 2100000, projected: 1500000, cumulative: 25500000 },
    { date: "20/01", actual: 1900000, projected: 1500000, cumulative: 32500000 },
    { date: "25/01", actual: 0, projected: 1500000, cumulative: 40000000 },
    { date: "30/01", actual: 0, projected: 1500000, cumulative: 48500000 },
  ];

  const categorySpend = [
    { name: "Lead Generation", amount: 18500000, percentage: 57, color: "#0D9488" },
    { name: "Brand Awareness", amount: 8200000, percentage: 25, color: "#F59E0B" },
    { name: "Retargeting", amount: 4800000, percentage: 15, color: "#8B5CF6" },
    { name: "Testing", amount: 1000000, percentage: 3, color: "#94A3B8" },
  ];

  const channelROI = [
    {
      channel: "Google Ads",
      spent: 12600000,
      leads: 45,
      costPerLead: 280000,
      conversions: 18,
      revenue: 52920000,
      roas: 4.2,
    },
    {
      channel: "Facebook Ads",
      spent: 14400000,
      leads: 78,
      costPerLead: 185000,
      conversions: 23,
      revenue: 50400000,
      roas: 3.5,
    },
    {
      channel: "Zalo Ads",
      spent: 5500000,
      leads: 32,
      costPerLead: 172000,
      conversions: 12,
      revenue: 15400000,
      roas: 2.8,
    },
  ];

  const budgetAlerts = [
    {
      type: "warning",
      title: "Facebook Ads vượt pace 12%",
      description: "Đang ở 72% budget với 33% tháng còn lại. Dự kiến vượt budget 2.4M nếu không điều chỉnh.",
      impact: "high",
      recommendation: "Giảm daily budget xuống 380K hoặc pause low-performing campaigns",
    },
    {
      type: "warning",
      title: "Google Ads campaign 'Implant Premium' consuming 45%",
      description: "1 campaign chiếm 45% tổng budget Google Ads",
      impact: "medium",
      recommendation: "Monitor closely - ROAS tốt (4.8x) nhưng cần đa dạng budget allocation",
    },
    {
      type: "positive",
      title: "Zalo Ads under-utilized",
      description: "Chỉ dùng 55% budget với ROAS ổn định 2.8x",
      impact: "low",
      recommendation: "Có thể tăng spend 20% để maximize reach trong target audience trẻ",
    },
    {
      type: "info",
      title: "Overall tracking tốt",
      description: "Tổng budget tracking ở mức an toàn, dự kiến dưới budget 1.5M",
      impact: "low",
      recommendation: "Continue monitoring daily, no action needed",
    },
  ];

  const historicalComparison = [
    { month: "Aug", budget: 42000000, spent: 41500000, variance: -500000 },
    { month: "Sep", budget: 45000000, spent: 46200000, variance: 1200000 },
    { month: "Oct", budget: 47000000, spent: 45800000, variance: -1200000 },
    { month: "Nov", budget: 48000000, spent: 49500000, variance: 1500000 },
    { month: "Dec", budget: 45000000, spent: 44200000, variance: -800000 },
    { month: "Jan", budget: 50000000, spent: 32500000, variance: -17500000 },
  ];

  const quarterlyPlan = [
    {
      quarter: "Q1 2025",
      months: ["Jan", "Feb", "Mar"],
      totalBudget: 150000000,
      allocation: {
        google: 60000000,
        facebook: 60000000,
        zalo: 30000000,
      },
      objectives: ["Launch Invisalign campaign", "Scale implant ads", "Test TikTok channel"],
      expectedROAS: 3.5,
    },
    {
      quarter: "Q2 2025",
      months: ["Apr", "May", "Jun"],
      totalBudget: 165000000,
      allocation: {
        google: 65000000,
        facebook: 65000000,
        zalo: 35000000,
      },
      objectives: ["Summer promo campaigns", "Family dental packages", "Expand to YouTube"],
      expectedROAS: 3.8,
    },
  ];

  const budgetAdjustmentRequests = [
    {
      id: 1,
      platform: "Facebook Ads",
      requestedBy: "Nguyễn Văn A",
      requestDate: "Jan 18, 2025",
      currentBudget: 20000000,
      requestedBudget: 25000000,
      increase: 5000000,
      reason: "Summer Promo campaign performing exceptionally well (ROAS 3.5x). Need to scale before end of month.",
      status: "pending",
      approver: "Marketing Manager",
    },
    {
      id: 2,
      platform: "Zalo Ads",
      requestedBy: "Trần Thị B",
      requestDate: "Jan 15, 2025",
      currentBudget: 10000000,
      requestedBudget: 8000000,
      increase: -2000000,
      reason: "Campaign underperforming. Reallocating to Google Ads.",
      status: "approved",
      approver: "Marketing Manager",
    },
  ];

  const scheduledReports = [
    {
      id: 1,
      name: "Weekly Budget Summary",
      frequency: "Weekly",
      day: "Monday",
      time: "09:00 AM",
      recipients: ["vana@greenfielddental.vn", "thib@greenfielddental.vn"],
      format: "PDF + Excel",
      active: true,
    },
    {
      id: 2,
      name: "Monthly Performance Report",
      frequency: "Monthly",
      day: "1st",
      time: "08:00 AM",
      recipients: ["vana@greenfielddental.vn", "management@greenfielddental.vn"],
      format: "PDF",
      active: true,
    },
    {
      id: 3,
      name: "Daily Spend Alert",
      frequency: "Daily",
      day: "Every day",
      time: "06:00 PM",
      recipients: ["vana@greenfielddental.vn"],
      format: "Email",
      active: true,
    },
  ];

  const handlePlatformClick = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const handleClosePlatformDetail = () => {
    setSelectedPlatform(null);
  };

  const handleSubmitAdjustment = () => {
    setShowAdjustmentRequest(false);
    setAdjustmentAmount("");
    setAdjustmentReason("");
  };

  const selectedPlatformData = platformBudgets.find((p) => p.name === selectedPlatform);

  const renderPlatformDetailModal = () => {
    if (!selectedPlatformData) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedPlatformData.name} - Budget Detail</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Budget: {(selectedPlatformData.budget / 1000000).toFixed(1)}M VND</span>
                  <span>•</span>
                  <span>{selectedPlatformData.campaigns} campaigns</span>
                  <span>•</span>
                  <span>Avg ROAS: {selectedPlatformData.avgROAS}x</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClosePlatformDetail}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Spent: {(selectedPlatformData.spent / 1000000).toFixed(1)}M VND ({selectedPlatformData.percentage}%)</span>
                    <span>Remaining: {((selectedPlatformData.budget - selectedPlatformData.spent) / 1000000).toFixed(1)}M VND</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        selectedPlatformData.pace === "over"
                          ? "bg-destructive"
                          : selectedPlatformData.pace === "under"
                          ? "bg-blue-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${selectedPlatformData.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Daily avg: {(selectedPlatformData.dailyAvg / 1000).toFixed(0)}K VND</span>
                    <Badge
                      variant={
                        selectedPlatformData.pace === "over"
                          ? "destructive"
                          : selectedPlatformData.pace === "under"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {selectedPlatformData.pace === "over"
                        ? "Over Pace"
                        : selectedPlatformData.pace === "under"
                        ? "Under Pace"
                        : "On Pace"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPlatformData.pace === "over" && (
                    <div className="p-3 rounded-lg border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
                      <p className="font-semibold text-sm mb-1">Reduce Daily Spend</p>
                      <p className="text-sm text-muted-foreground">
                        Giảm daily budget xuống {((selectedPlatformData.budget - selectedPlatformData.spent) / 10 / 1000).toFixed(0)}K VND để tránh overspend cuối tháng
                      </p>
                    </div>
                  )}
                  {selectedPlatformData.pace === "under" && (
                    <div className="p-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                      <p className="font-semibold text-sm mb-1">Increase Budget Utilization</p>
                      <p className="text-sm text-muted-foreground">
                        Có thể tăng spend lên {(selectedPlatformData.dailyAvg * 1.2 / 1000).toFixed(0)}K VND/day để maximize ROI
                      </p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                    <p className="font-semibold text-sm mb-1">Top Performing Campaign</p>
                    <p className="text-sm text-muted-foreground">
                      "{selectedPlatformData.topCampaign}" đang có performance tốt nhất - consider scaling
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Budget Adjustment</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setShowAdjustmentRequest(true);
                    handleClosePlatformDetail();
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Adjustment Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderAdjustmentRequestModal = () => {
    if (!showAdjustmentRequest) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Request Budget Adjustment</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAdjustmentRequest(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                  <SelectItem value="zalo">Zalo Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">New Budget Amount (VND)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="25,000,000"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Adjustment</Label>
              <Textarea
                id="reason"
                rows={4}
                placeholder="Explain why this budget adjustment is needed..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
            <div className="bg-accent/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Note:</strong> Budget adjustment requests require approval from Marketing Manager.
                You will receive notification when approved/rejected.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmitAdjustment}>
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowAdjustmentRequest(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Monthly Budget</h1>
        <p className="text-muted-foreground">Quản lý và theo dõi ngân sách marketing hàng tháng</p>
      </div>

      {/* Header with Month Selector and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Ngân sách tháng {selectedMonth === "jan-2025" ? "1" : selectedMonth === "dec-2024" ? "12" : "11"}/2024
          </h2>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jan-2025">Tháng 1 2025</SelectItem>
              <SelectItem value="dec-2024">Tháng 12 2024</SelectItem>
              <SelectItem value="nov-2024">Tháng 11 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Alert Settings
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Budget Summary Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  TỔNG NGÂN SÁCH: {(currentMonthData.total / 1000000).toFixed(1)}M VND
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentMonthData.daysRemaining > 0 ? `${currentMonthData.daysRemaining} ngày còn lại` : "Đã kết thúc"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {((currentMonthData.spent / currentMonthData.total) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Used</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-4 mb-2">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{ width: `${(currentMonthData.spent / currentMonthData.total) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Đã chi</p>
                <p className="font-semibold">{(currentMonthData.spent / 1000000).toFixed(1)}M VND</p>
              </div>
              <div>
                <p className="text-muted-foreground">Còn lại</p>
                <p className="font-semibold">{(currentMonthData.remaining / 1000000).toFixed(1)}M VND</p>
              </div>
              <div>
                <p className="text-muted-foreground">Dự báo cuối tháng</p>
                <p className="font-semibold">{(currentMonthData.projectedEndSpend / 1000000).toFixed(1)}M VND</p>
              </div>
              <div>
                <p className="text-muted-foreground">Variance</p>
                <p className={`font-semibold flex items-center gap-1 ${currentMonthData.projectedVariance < 0 ? "text-green-600" : "text-red-600"}`}>
                  {currentMonthData.projectedVariance < 0 ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                  {Math.abs(currentMonthData.projectedVariance / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Budget Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết theo nền tảng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformBudgets.map((platform) => (
              <div
                key={platform.name}
                className="space-y-2 p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => handlePlatformClick(platform.name)}
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{platform.name}</span>
                    <Badge
                      variant={platform.pace === "over" ? "destructive" : platform.pace === "under" ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {platform.pace === "over" ? "Over Pace" : platform.pace === "under" ? "Under Pace" : "On Pace"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">ROAS: {platform.avgROAS}x</span>
                    <span>
                      {(platform.spent / 1000000).toFixed(1)}M / {(platform.budget / 1000000).toFixed(0)}M VND
                    </span>
                    <Badge variant={platform.percentage > 70 ? "destructive" : platform.percentage > 60 ? "secondary" : "default"}>
                      {platform.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      platform.percentage > 70 ? "bg-destructive" : platform.percentage > 60 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${platform.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{platform.campaigns} campaigns active</span>
                  <span>Top: {platform.topCampaign}</span>
                  <span>Daily avg: {(platform.dailyAvg / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Spend Chart & Budget Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chi tiêu hàng ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailySpendData}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative"
                    fill="url(#colorCumulative)"
                    stroke="#0D9488"
                    name="Cumulative"
                  />
                  <Bar yAxisId="left" dataKey="actual" fill="#F59E0B" name="Actual Daily" />
                  <Line yAxisId="left" type="monotone" dataKey="projected" stroke="#94a3b8" strokeDasharray="5 5" name="Projected" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpend}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ value }) => `${value}%`}
                    outerRadius={80}
                    dataKey="percentage"
                  >
                    {categorySpend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categorySpend.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-medium">{(cat.amount / 1000000).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI by Channel */}
      <Card>
        <CardHeader>
          <CardTitle>ROI by Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Channel</th>
                  <th className="text-right p-3 font-medium">Spent</th>
                  <th className="text-right p-3 font-medium">Leads</th>
                  <th className="text-right p-3 font-medium">Cost/Lead</th>
                  <th className="text-right p-3 font-medium">Conversions</th>
                  <th className="text-right p-3 font-medium">Revenue</th>
                  <th className="text-right p-3 font-medium">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {channelROI.map((channel, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50">
                    <td className="p-3 font-medium">{channel.channel}</td>
                    <td className="p-3 text-right">{(channel.spent / 1000000).toFixed(1)}M</td>
                    <td className="p-3 text-right">{channel.leads}</td>
                    <td className="p-3 text-right">{(channel.costPerLead / 1000).toFixed(0)}K</td>
                    <td className="p-3 text-right">{channel.conversions}</td>
                    <td className="p-3 text-right">{(channel.revenue / 1000000).toFixed(1)}M</td>
                    <td className="p-3 text-right">
                      <span className={`font-bold ${channel.roas >= 4 ? "text-green-600" : channel.roas >= 3 ? "text-blue-600" : "text-orange-600"}`}>
                        {channel.roas}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Budget Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === "positive"
                    ? "border-l-green-500 bg-green-50 dark:bg-green-950/20"
                    : alert.type === "warning"
                    ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
                    : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {alert.type === "positive" ? "✅" : alert.type === "warning" ? "⚠️" : "ℹ️"}
                    </span>
                    <p className="font-semibold">{alert.title}</p>
                  </div>
                  <Badge variant={alert.impact === "high" ? "destructive" : alert.impact === "medium" ? "secondary" : "outline"}>
                    {alert.impact} impact
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2 ml-7">{alert.description}</p>
                <div className="ml-7 bg-background/50 p-2 rounded text-sm">
                  <p className="font-medium mb-1">Recommendation:</p>
                  <p className="text-muted-foreground">{alert.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Budget Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#94A3B8" name="Budget" />
                <Bar dataKey="spent" fill="#0D9488" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Quarterly Budget Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {quarterlyPlan.map((quarter, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{quarter.quarter}</h3>
                    <p className="text-sm text-muted-foreground">{quarter.months.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{(quarter.totalBudget / 1000000).toFixed(0)}M VND</p>
                    <p className="text-sm text-muted-foreground">Expected ROAS: {quarter.expectedROAS}x</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-accent/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Google Ads</p>
                    <p className="font-semibold">{(quarter.allocation.google / 1000000).toFixed(0)}M</p>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Facebook</p>
                    <p className="font-semibold">{(quarter.allocation.facebook / 1000000).toFixed(0)}M</p>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Zalo</p>
                    <p className="font-semibold">{(quarter.allocation.zalo / 1000000).toFixed(0)}M</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Key Objectives:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {quarter.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Adjustment Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Adjustment Requests</CardTitle>
            <Button size="sm" onClick={() => setShowAdjustmentRequest(true)}>
              <Send className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetAdjustmentRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{request.platform}</h4>
                      <Badge variant={request.status === "pending" ? "secondary" : request.status === "approved" ? "default" : "destructive"}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requested by {request.requestedBy} on {request.requestDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Budget Change</p>
                    <p className={`font-bold text-lg ${request.increase > 0 ? "text-green-600" : "text-red-600"}`}>
                      {request.increase > 0 ? "+" : ""}
                      {(request.increase / 1000000).toFixed(1)}M VND
                    </p>
                  </div>
                </div>
                <p className="text-sm mb-3">{request.reason}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {(request.currentBudget / 1000000).toFixed(0)}M → {(request.requestedBudget / 1000000).toFixed(0)}M VND
                  </span>
                  <span>Approver: {request.approver}</span>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button size="sm" variant="default">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline">
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{report.name}</h4>
                    <Badge variant={report.active ? "default" : "secondary"}>{report.active ? "Active" : "Paused"}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {report.frequency} - {report.day} at {report.time}
                    </span>
                    <span>Format: {report.format}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recipients: {report.recipients.join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    {report.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {renderPlatformDetailModal()}
      {renderAdjustmentRequestModal()}
    </div>
  );
}
