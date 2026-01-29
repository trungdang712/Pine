"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n";
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
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";

type Platform = "google_ads" | "facebook" | "zalo";

export default function BudgetPage() {
  const { t } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showAdjustmentRequest, setShowAdjustmentRequest] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [adjustmentPlatform, setAdjustmentPlatform] = useState<Platform | "">("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const utils = trpc.useUtils();

  // Fetch budget data for selected month
  const {
    data: budgetData,
    isLoading,
    error,
    refetch,
  } = trpc.budget.getByMonth.useQuery({ month: selectedMonth });

  // Fetch budget alerts
  const { data: alerts = [] } = trpc.budget.getAlerts.useQuery({ month: selectedMonth });

  // Fetch historical data
  const { data: budgetHistory = [] } = trpc.budget.getHistory.useQuery({ months: 6 });

  // Mark alert as read mutation
  const markAlertRead = trpc.budget.markAlertRead.useMutation({
    onSuccess: () => {
      utils.budget.getAlerts.invalidate();
      toast.success("Alert da duoc danh dau da doc");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Generate month options (current month and previous 5 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }
    return options;
  }, []);

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
      facebook: "Facebook Ads",
      zalo: "Zalo Ads",
    };
    return labels[platform] || platform;
  };

  const getPaceStatus = (status: string) => {
    if (status === "over_pace") {
      return { label: "Over Pace", variant: "destructive" as const };
    }
    if (status === "under_pace") {
      return { label: "Under Pace", variant: "secondary" as const };
    }
    return { label: "On Pace", variant: "default" as const };
  };

  // Transform budget data for charts
  const dailySpendData = useMemo(() => {
    if (!budgetData?.spendByDate) return [];

    const data = budgetData.spendByDate.map((d, i) => {
      const projected = budgetData.totalBudget / budgetData.daysInMonth;
      const cumulativeSoFar = budgetData.spendByDate.slice(0, i + 1).reduce((sum, item) => sum + item.amount, 0);
      return {
        date: format(new Date(d.date), "dd/MM"),
        actual: d.amount,
        projected,
        cumulative: cumulativeSoFar,
      };
    });

    return data;
  }, [budgetData]);

  // Platform breakdown data
  const platformBudgets = useMemo(() => {
    if (!budgetData) return [];

    return [
      {
        name: "Google Ads",
        platform: "google_ads" as Platform,
        budget: budgetData.googleAdsAllocation,
        spent: budgetData.spendByPlatform?.google_ads ?? 0,
        percentage: budgetData.googleAdsAllocation > 0
          ? Math.round((budgetData.spendByPlatform?.google_ads ?? 0) / budgetData.googleAdsAllocation * 100)
          : 0,
        pace: budgetData.platformStatus?.google_ads ?? "on_track",
        dailyAvg: budgetData.daysElapsed > 0
          ? Math.round((budgetData.spendByPlatform?.google_ads ?? 0) / budgetData.daysElapsed)
          : 0,
      },
      {
        name: "Facebook Ads",
        platform: "facebook" as Platform,
        budget: budgetData.facebookAllocation,
        spent: budgetData.spendByPlatform?.facebook ?? 0,
        percentage: budgetData.facebookAllocation > 0
          ? Math.round((budgetData.spendByPlatform?.facebook ?? 0) / budgetData.facebookAllocation * 100)
          : 0,
        pace: budgetData.platformStatus?.facebook ?? "on_track",
        dailyAvg: budgetData.daysElapsed > 0
          ? Math.round((budgetData.spendByPlatform?.facebook ?? 0) / budgetData.daysElapsed)
          : 0,
      },
      {
        name: "Zalo Ads",
        platform: "zalo" as Platform,
        budget: budgetData.zaloAllocation,
        spent: budgetData.spendByPlatform?.zalo ?? 0,
        percentage: budgetData.zaloAllocation > 0
          ? Math.round((budgetData.spendByPlatform?.zalo ?? 0) / budgetData.zaloAllocation * 100)
          : 0,
        pace: budgetData.platformStatus?.zalo ?? "on_track",
        dailyAvg: budgetData.daysElapsed > 0
          ? Math.round((budgetData.spendByPlatform?.zalo ?? 0) / budgetData.daysElapsed)
          : 0,
      },
    ];
  }, [budgetData]);

  // Category allocation for pie chart
  const categorySpend = useMemo(() => {
    if (!budgetData) return [];

    const total = budgetData.totalSpent;
    if (total === 0) return [];

    return [
      {
        name: "Google Ads",
        amount: budgetData.spendByPlatform?.google_ads ?? 0,
        percentage: Math.round((budgetData.spendByPlatform?.google_ads ?? 0) / total * 100),
        color: "#0D9488"
      },
      {
        name: "Facebook",
        amount: budgetData.spendByPlatform?.facebook ?? 0,
        percentage: Math.round((budgetData.spendByPlatform?.facebook ?? 0) / total * 100),
        color: "#F59E0B"
      },
      {
        name: "Zalo",
        amount: budgetData.spendByPlatform?.zalo ?? 0,
        percentage: Math.round((budgetData.spendByPlatform?.zalo ?? 0) / total * 100),
        color: "#8B5CF6"
      },
    ].filter(item => item.amount > 0);
  }, [budgetData]);

  // Historical comparison data
  const historicalComparison = useMemo(() => {
    return budgetHistory.map((b) => ({
      month: format(new Date(b.month + "-01"), "MMM"),
      budget: b.totalBudget,
      spent: b.totalSpent,
      variance: b.totalSpent - b.totalBudget,
    }));
  }, [budgetHistory]);

  const handlePlatformClick = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const handleClosePlatformDetail = () => {
    setSelectedPlatform(null);
  };

  const handleSubmitAdjustment = () => {
    if (!adjustmentPlatform || !adjustmentAmount || !adjustmentReason) {
      toast.error("Vui long dien day du thong tin");
      return;
    }

    // In a real app, this would submit to the backend
    toast.success("Yeu cau dieu chinh ngan sach da duoc gui");
    setShowAdjustmentRequest(false);
    setAdjustmentPlatform("");
    setAdjustmentAmount("");
    setAdjustmentReason("");
  };

  const selectedPlatformData = platformBudgets.find((p) => p.name === selectedPlatform);

  const renderPlatformDetailModal = () => {
    if (!selectedPlatformData) return null;

    const paceStatus = getPaceStatus(selectedPlatformData.pace);

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedPlatformData.name} - Budget Detail</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Budget: {formatCurrency(selectedPlatformData.budget)} VND</span>
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
                    <span>Spent: {formatCurrency(selectedPlatformData.spent)} VND ({selectedPlatformData.percentage}%)</span>
                    <span>Remaining: {formatCurrency(selectedPlatformData.budget - selectedPlatformData.spent)} VND</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        selectedPlatformData.pace === "over_pace"
                          ? "bg-destructive"
                          : selectedPlatformData.pace === "under_pace"
                          ? "bg-blue-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, selectedPlatformData.percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Daily avg: {formatCurrency(selectedPlatformData.dailyAvg)} VND</span>
                    <Badge variant={paceStatus.variant}>{paceStatus.label}</Badge>
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
                  {selectedPlatformData.pace === "over_pace" && (
                    <div className="p-3 rounded-lg border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
                      <p className="font-semibold text-sm mb-1">Reduce Daily Spend</p>
                      <p className="text-sm text-muted-foreground">
                        Giam daily budget xuong {formatCurrency(Math.max(0, (selectedPlatformData.budget - selectedPlatformData.spent) / Math.max(1, budgetData?.daysRemaining ?? 10)))} VND de tranh overspend cuoi thang
                      </p>
                    </div>
                  )}
                  {selectedPlatformData.pace === "under_pace" && (
                    <div className="p-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                      <p className="font-semibold text-sm mb-1">Increase Budget Utilization</p>
                      <p className="text-sm text-muted-foreground">
                        Co the tang spend len {formatCurrency(Math.round(selectedPlatformData.dailyAvg * 1.2))} VND/day de maximize ROI
                      </p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                    <p className="font-semibold text-sm mb-1">Monitor Performance</p>
                    <p className="text-sm text-muted-foreground">
                      Tiep tuc theo doi va toi uu hoa campaigns de dat hieu qua cao nhat
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
                    setAdjustmentPlatform(selectedPlatformData.platform);
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
              <Select
                value={adjustmentPlatform}
                onValueChange={(v) => setAdjustmentPlatform(v as Platform)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
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

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  if (!budgetData) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">{t.analytics.budget.title}</h1>
          <p className="text-muted-foreground">{t.analytics.budget.subtitle}</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chon thang" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PageEmpty
          title={t.common.noData}
          description={t.common.noData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">{t.analytics.budget.title}</h1>
        <p className="text-muted-foreground">{t.analytics.budget.subtitle}</p>
      </div>

      {/* Header with Month Selector and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Ngan sach thang {format(new Date(selectedMonth + "-01"), "M/yyyy")}
          </h2>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chon thang" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
                  TONG NGAN SACH: {formatCurrency(budgetData.totalBudget)} VND
                </h3>
                <p className="text-sm text-muted-foreground">
                  {budgetData.daysRemaining > 0 ? `${budgetData.daysRemaining} ngay con lai` : "Da ket thuc"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {budgetData.percentSpent.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Used</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-4 mb-2">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{ width: `${Math.min(100, budgetData.percentSpent)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t.analytics.budget.spent}</p>
                <p className="font-semibold">{formatCurrency(budgetData.totalSpent)} VND</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.analytics.budget.remaining}</p>
                <p className="font-semibold">{formatCurrency(budgetData.remaining)} VND</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.analytics.budget.projectedSpend}</p>
                <p className="font-semibold">{formatCurrency(budgetData.projectedSpend)} VND</p>
              </div>
              <div>
                <p className="text-muted-foreground">Variance</p>
                <p className={`font-semibold flex items-center gap-1 ${budgetData.projectedSpend <= budgetData.totalBudget ? "text-green-600" : "text-red-600"}`}>
                  {budgetData.projectedSpend <= budgetData.totalBudget ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                  {formatCurrency(Math.abs(budgetData.projectedSpend - budgetData.totalBudget))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Budget Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t.analytics.budget.byChannel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformBudgets.map((platform) => {
              const paceStatus = getPaceStatus(platform.pace);
              return (
                <div
                  key={platform.name}
                  className="space-y-2 p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handlePlatformClick(platform.name)}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{platform.name}</span>
                      <Badge variant={paceStatus.variant} className="text-xs">
                        {paceStatus.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>
                        {formatCurrency(platform.spent)} / {formatCurrency(platform.budget)} VND
                      </span>
                      <Badge variant={platform.percentage > 70 ? "destructive" : platform.percentage > 60 ? "secondary" : "default"}>
                        {platform.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        platform.percentage > 70 ? "bg-destructive" : platform.percentage > 60 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(100, platform.percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Daily avg: {formatCurrency(platform.dailyAvg)} VND</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Spend Chart & Budget Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.analytics.budget.dailySpend}</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySpendData.length > 0 ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chua co du lieu chi tieu
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {categorySpend.length > 0 ? (
              <>
                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpend}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${Math.round((entry.percent ?? 0) * 100)}%`}
                        outerRadius={80}
                        dataKey="amount"
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
                      <span className="font-medium">{formatCurrency(cat.amount)} VND</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Chua co du lieu phan bo
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Budget Alerts & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === "over_pace"
                      ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : alert.type === "50_percent" || alert.type === "80_percent"
                      ? "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-l-green-500 bg-green-50 dark:bg-green-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {alert.type === "over_pace" ? "Warning" : "Info"}
                      </span>
                      <p className="font-semibold">{alert.type.replace(/_/g, " ").toUpperCase()}</p>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAlertRead.mutate({ alertId: alert.id })}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Comparison */}
      {historicalComparison.length > 0 && (
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
      )}

      {/* Modals */}
      {renderPlatformDetailModal()}
      {renderAdjustmentRequestModal()}
    </div>
  );
}
