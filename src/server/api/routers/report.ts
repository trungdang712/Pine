import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  calculateCPL,
  calculateROI,
  calculateConversionRate,
  calculatePercentChange,
  calculateUtilization,
  getPlatformLabel,
  getPlatformColor,
  getServiceLabel,
  calculateStarRating,
  estimateServiceRevenue,
  getMonthDateRange,
  getPreviousMonth,
} from "@/lib/report/calculations";
import type {
  ReportData,
  ExecutiveSummaryData,
  BudgetAnalysisData,
  CampaignPerformanceData,
  FunnelAnalysisData,
  ChannelBreakdownData,
  ServiceAnalysisData,
  CustomerInsightsData,
  CompetitiveAnalysisData,
  ActionItemsData,
  ForecastApprovalData,
} from "@/lib/report/types";

export const reportRouter = createTRPCRouter({
  // Get complete report data for a month
  getReportData: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getMonthDateRange(input.month);
      const prevMonth = getPreviousMonth(input.month);
      const { startDate: prevStartDate, endDate: prevEndDate } = getMonthDateRange(prevMonth);

      // Fetch all required data in parallel
      const [
        executiveSummary,
        budgetAnalysis,
        campaignPerformance,
        funnelAnalysis,
        channelBreakdown,
        serviceAnalysis,
        customerInsights,
      ] = await Promise.all([
        getExecutiveSummary(ctx.prisma, startDate, endDate, prevStartDate, prevEndDate),
        getBudgetAnalysis(ctx.prisma, input.month),
        getCampaignPerformance(ctx.prisma, startDate, endDate),
        getFunnelAnalysis(ctx.prisma, startDate, endDate, prevStartDate, prevEndDate),
        getChannelBreakdown(ctx.prisma, startDate, endDate),
        getServiceAnalysis(ctx.prisma, startDate, endDate),
        getCustomerInsights(ctx.prisma, startDate, endDate),
      ]);

      // Static/manual data for competitive analysis, action items, and forecast
      const competitiveAnalysis = getCompetitiveAnalysis();
      const actionItems = getActionItems();
      const forecastApproval = getForecastApproval(budgetAnalysis.totalBudget);

      const reportData: ReportData = {
        month: input.month,
        generatedAt: new Date(),
        executiveSummary,
        budgetAnalysis,
        campaignPerformance,
        funnelAnalysis,
        channelBreakdown,
        serviceAnalysis,
        customerInsights,
        competitiveAnalysis,
        actionItems,
        forecastApproval,
      };

      return reportData;
    }),

  // Get executive summary only
  getExecutiveSummary: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getMonthDateRange(input.month);
      const prevMonth = getPreviousMonth(input.month);
      const { startDate: prevStartDate, endDate: prevEndDate } = getMonthDateRange(prevMonth);
      return getExecutiveSummary(ctx.prisma, startDate, endDate, prevStartDate, prevEndDate);
    }),

  // Get budget analysis only
  getBudgetAnalysis: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      return getBudgetAnalysis(ctx.prisma, input.month);
    }),

  // Get campaign performance only
  getCampaignPerformance: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getMonthDateRange(input.month);
      return getCampaignPerformance(ctx.prisma, startDate, endDate);
    }),

  // Get funnel analysis only
  getFunnelAnalysis: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getMonthDateRange(input.month);
      const prevMonth = getPreviousMonth(input.month);
      const { startDate: prevStartDate, endDate: prevEndDate } = getMonthDateRange(prevMonth);
      return getFunnelAnalysis(ctx.prisma, startDate, endDate, prevStartDate, prevEndDate);
    }),

  // Get channel breakdown only
  getChannelBreakdown: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getMonthDateRange(input.month);
      return getChannelBreakdown(ctx.prisma, startDate, endDate);
    }),

  // Get service analysis only
  getServiceAnalysis: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getMonthDateRange(input.month);
      return getServiceAnalysis(ctx.prisma, startDate, endDate);
    }),

  // Get customer insights only
  getCustomerInsights: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getMonthDateRange(input.month);
      return getCustomerInsights(ctx.prisma, startDate, endDate);
    }),
});

// Helper functions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getExecutiveSummary(
  prisma: any,
  startDate: Date,
  endDate: Date,
  prevStartDate: Date,
  prevEndDate: Date
): Promise<ExecutiveSummaryData> {
  // Get current month metrics
  const currentMetrics = await prisma.campaignMetric.aggregate({
    where: { date: { gte: startDate, lte: endDate } },
    _sum: { spend: true, leads: true, clicks: true, conversions: true, impressions: true },
  });

  // Get previous month metrics
  const prevMetrics = await prisma.campaignMetric.aggregate({
    where: { date: { gte: prevStartDate, lte: prevEndDate } },
    _sum: { spend: true, leads: true, clicks: true, conversions: true, impressions: true },
  });

  // Get lead counts
  const currentLeadCount = await prisma.crmLead.count({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const prevLeadCount = await prisma.crmLead.count({
    where: { createdAt: { gte: prevStartDate, lte: prevEndDate } },
  });

  const totalSpend = currentMetrics._sum.spend || 0;
  const totalLeads = currentLeadCount || currentMetrics._sum.leads || 0;
  const prevSpend = prevMetrics._sum.spend || 0;
  const prevLeads = prevLeadCount || prevMetrics._sum.leads || 0;

  const cpl = calculateCPL(totalSpend, totalLeads);
  const prevCpl = calculateCPL(prevSpend, prevLeads);

  // Estimate revenue (placeholder - would come from actual revenue tracking)
  const estimatedRevenue = totalSpend * 3.2; // Assume 3.2x ROI
  const prevRevenue = prevSpend * 2.7;
  const roi = calculateROI(estimatedRevenue, totalSpend);
  const prevRoi = calculateROI(prevRevenue, prevSpend);

  const conversionRate = calculateConversionRate(
    currentMetrics._sum.conversions || 0,
    currentMetrics._sum.clicks || 0
  );

  return {
    totalSpend,
    totalLeads,
    conversionRate,
    roi,
    cpl,
    spendChange: calculatePercentChange(totalSpend, prevSpend),
    leadsChange: calculatePercentChange(totalLeads, prevLeads),
    cplChange: calculatePercentChange(cpl, prevCpl),
    roiChange: calculatePercentChange(roi, prevRoi),
    highlights: [
      `Chi phí/lead ${cpl < prevCpl ? "giảm" : "tăng"} ${Math.abs(calculatePercentChange(cpl, prevCpl))}% so với tháng trước`,
      `Tổng leads đạt ${totalLeads} (${totalLeads >= prevLeads ? "+" : ""}${calculatePercentChange(totalLeads, prevLeads)}%)`,
      `ROI đạt ${roi}x`,
    ],
    warnings: cpl > prevCpl
      ? [`CPL tăng từ ${Math.round(prevCpl / 1000)}K lên ${Math.round(cpl / 1000)}K`]
      : [],
    recommendations: [
      "Tiếp tục theo dõi và tối ưu hóa campaigns",
      "Review và cải thiện landing pages",
      "Tối ưu keywords và targeting",
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBudgetAnalysis(prisma: any, month: string): Promise<BudgetAnalysisData> {
  const budget = await prisma.monthlyBudget.findUnique({
    where: { month },
    include: { spends: true },
  });

  if (!budget) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      utilizationPercent: 0,
      allocations: [],
    };
  }

  // Calculate spend by platform
  const spendByPlatform: Record<string, number> = {};
  for (const spend of budget.spends) {
    spendByPlatform[spend.platform] = (spendByPlatform[spend.platform] || 0) + spend.amount;
  }

  const totalSpent = Object.values(spendByPlatform).reduce((a, b) => a + b, 0);

  // Get lead counts by platform (from campaign metrics)
  const campaignMetricsRaw = await prisma.campaignMetric.groupBy({
    by: ["campaignId"],
    where: {
      date: {
        gte: new Date(month + "-01"),
        lte: new Date(new Date(month + "-01").getFullYear(), new Date(month + "-01").getMonth() + 1, 0),
      },
    },
    _sum: { leads: true, spend: true },
  });

  type CampaignMetricGroup = typeof campaignMetricsRaw[number];

  // Get campaigns to map platforms
  const campaignIds = campaignMetricsRaw.map((m: CampaignMetricGroup) => m.campaignId);
  const campaigns = await prisma.marketingCampaign.findMany({
    where: { id: { in: campaignIds } },
    select: { id: true, platform: true },
  });

  const campaignPlatformMap = new Map<string, string>(
    campaigns.map((c: { id: string; platform: string }) => [c.id, c.platform])
  );

  const leadsByPlatform: Record<string, number> = {};
  for (const metric of campaignMetricsRaw) {
    const campaignId = String(metric.campaignId);
    const platform = campaignPlatformMap.get(campaignId) ?? "other";
    leadsByPlatform[platform] = (leadsByPlatform[platform] ?? 0) + (metric._sum.leads ?? 0);
  }

  const allocations = [
    {
      platform: "google_ads",
      platformLabel: getPlatformLabel("google_ads"),
      budget: budget.googleAdsAllocation,
      spent: spendByPlatform["google_ads"] || 0,
      utilization: calculateUtilization(spendByPlatform["google_ads"] || 0, budget.googleAdsAllocation),
      cpl: calculateCPL(spendByPlatform["google_ads"] || 0, leadsByPlatform["google_ads"] || 0),
      leads: leadsByPlatform["google_ads"] || 0,
      cplTrend: 0,
      color: getPlatformColor("google_ads"),
    },
    {
      platform: "facebook",
      platformLabel: getPlatformLabel("facebook"),
      budget: budget.facebookAllocation,
      spent: spendByPlatform["facebook"] || 0,
      utilization: calculateUtilization(spendByPlatform["facebook"] || 0, budget.facebookAllocation),
      cpl: calculateCPL(spendByPlatform["facebook"] || 0, leadsByPlatform["facebook"] || 0),
      leads: leadsByPlatform["facebook"] || 0,
      cplTrend: 0,
      color: getPlatformColor("facebook"),
    },
    {
      platform: "zalo",
      platformLabel: getPlatformLabel("zalo"),
      budget: budget.zaloAllocation,
      spent: spendByPlatform["zalo"] || 0,
      utilization: calculateUtilization(spendByPlatform["zalo"] || 0, budget.zaloAllocation),
      cpl: calculateCPL(spendByPlatform["zalo"] || 0, leadsByPlatform["zalo"] || 0),
      leads: leadsByPlatform["zalo"] || 0,
      cplTrend: 0,
      color: getPlatformColor("zalo"),
    },
  ];

  return {
    totalBudget: budget.totalBudget,
    totalSpent,
    remaining: budget.totalBudget - totalSpent,
    utilizationPercent: calculateUtilization(totalSpent, budget.totalBudget),
    allocations,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCampaignPerformance(
  prisma: any,
  startDate: Date,
  endDate: Date
): Promise<CampaignPerformanceData> {
  const campaigns = await prisma.marketingCampaign.findMany({
    where: {
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
        { startDate: { lte: endDate }, endDate: null },
      ],
    },
    include: {
      metrics: {
        where: { date: { gte: startDate, lte: endDate } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const campaignItems = campaigns.map((campaign: {
    id: string;
    name: string;
    budget: number | null;
    metrics: { spend: number; leads: number; conversions: number }[];
  }) => {
    const totalSpend = campaign.metrics.reduce((sum: number, m: { spend: number }) => sum + m.spend, 0);
    const totalLeads = campaign.metrics.reduce((sum: number, m: { leads: number }) => sum + m.leads, 0);
    const totalConversions = campaign.metrics.reduce((sum: number, m: { conversions: number }) => sum + m.conversions, 0);
    const cpl = calculateCPL(totalSpend, totalLeads);
    const revenue = estimateServiceRevenue("general_checkup", totalConversions) * 3; // Rough estimate
    const roi = calculateROI(revenue, totalSpend);
    const targetAchievement = campaign.budget ? (totalSpend / campaign.budget) * 100 : 100;

    return {
      id: campaign.id,
      name: campaign.name,
      spend: totalSpend,
      leads: totalLeads,
      cpl,
      conversions: totalConversions,
      revenue,
      roi,
      targetAchievement,
      rating: calculateStarRating(targetAchievement),
    };
  });

  return {
    campaigns: campaignItems,
    insights: [
      "Campaigns với ROI cao nên được scale",
      "Review campaigns có CPL cao để tối ưu",
      "Focus vào các campaigns đạt target",
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getFunnelAnalysis(
  prisma: any,
  startDate: Date,
  endDate: Date,
  prevStartDate: Date,
  prevEndDate: Date
): Promise<FunnelAnalysisData> {
  // Get current month metrics
  const currentMetrics = await prisma.campaignMetric.aggregate({
    where: { date: { gte: startDate, lte: endDate } },
    _sum: { impressions: true, clicks: true, leads: true, conversions: true },
  });

  // Get previous month metrics
  const prevMetrics = await prisma.campaignMetric.aggregate({
    where: { date: { gte: prevStartDate, lte: prevEndDate } },
    _sum: { impressions: true, clicks: true, leads: true, conversions: true },
  });

  // Get appointment data
  const currentAppointments = await prisma.crmAppointment.count({
    where: { appointmentDate: { gte: startDate, lte: endDate } },
  });

  const prevAppointments = await prisma.crmAppointment.count({
    where: { appointmentDate: { gte: prevStartDate, lte: prevEndDate } },
  });

  const impressions = currentMetrics._sum.impressions || 0;
  const clicks = currentMetrics._sum.clicks || 0;
  const leads = currentMetrics._sum.leads || 0;
  const consultations = currentAppointments || Math.round(leads * 0.32);
  const customers = currentMetrics._sum.conversions || Math.round(consultations * 0.52);

  const prevImpressions = prevMetrics._sum.impressions || 0;
  const prevClicks = prevMetrics._sum.clicks || 0;
  const prevLeads = prevMetrics._sum.leads || 0;
  const prevConsultations = prevAppointments || Math.round(prevLeads * 0.32);
  const prevCustomers = prevMetrics._sum.conversions || Math.round(prevConsultations * 0.48);

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cvr = clicks > 0 ? (leads / clicks) * 100 : 0;
  const contactRate = leads > 0 ? (consultations / leads) * 100 : 0;
  const closeRate = consultations > 0 ? (customers / consultations) * 100 : 0;

  const prevCtr = prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0;
  const prevCvr = prevClicks > 0 ? (prevLeads / prevClicks) * 100 : 0;
  const prevContactRate = prevLeads > 0 ? (prevConsultations / prevLeads) * 100 : 0;
  const prevCloseRate = prevConsultations > 0 ? (prevCustomers / prevConsultations) * 100 : 0;

  return {
    stages: [
      { name: "Impressions", value: impressions, rate: ctr },
      { name: "Clicks", value: clicks, rate: cvr },
      { name: "Leads", value: leads, rate: contactRate },
      { name: "Consultations", value: consultations, rate: closeRate },
      { name: "Customers", value: customers },
    ],
    comparison: [
      {
        name: "CTR",
        current: Number(ctr.toFixed(2)),
        previous: Number(prevCtr.toFixed(2)),
        change: Number((ctr - prevCtr).toFixed(2)),
        isPositive: ctr >= prevCtr,
        unit: "%",
      },
      {
        name: "CVR",
        current: Number(cvr.toFixed(2)),
        previous: Number(prevCvr.toFixed(2)),
        change: Number((cvr - prevCvr).toFixed(2)),
        isPositive: cvr >= prevCvr,
        unit: "%",
      },
      {
        name: "Contact Rate",
        current: Number(contactRate.toFixed(1)),
        previous: Number(prevContactRate.toFixed(1)),
        change: Number((contactRate - prevContactRate).toFixed(1)),
        isPositive: contactRate >= prevContactRate,
        unit: "%",
      },
      {
        name: "Close Rate",
        current: Number(closeRate.toFixed(1)),
        previous: Number(prevCloseRate.toFixed(1)),
        change: Number((closeRate - prevCloseRate).toFixed(1)),
        isPositive: closeRate >= prevCloseRate,
        unit: "%",
      },
    ],
    bottlenecks: contactRate < prevContactRate
      ? ["Contact Rate giảm - cần review quy trình follow-up"]
      : [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getChannelBreakdown(
  prisma: any,
  startDate: Date,
  endDate: Date
): Promise<ChannelBreakdownData> {
  const campaigns = await prisma.marketingCampaign.findMany({
    include: {
      metrics: {
        where: { date: { gte: startDate, lte: endDate } },
      },
    },
  });

  // Aggregate by platform
  const platformData: Record<string, { spend: number; leads: number; impressions: number; clicks: number }> = {};

  for (const campaign of campaigns) {
    const platform = campaign.platform;
    if (!platformData[platform]) {
      platformData[platform] = { spend: 0, leads: 0, impressions: 0, clicks: 0 };
    }
    for (const metric of campaign.metrics) {
      platformData[platform].spend += metric.spend;
      platformData[platform].leads += metric.leads;
      platformData[platform].impressions += metric.impressions;
      platformData[platform].clicks += metric.clicks;
    }
  }

  const channels = Object.entries(platformData).map(([platform, data]) => {
    const cpl = calculateCPL(data.spend, data.leads);
    const revenue = data.leads * 1500000; // Rough estimate
    const roas = data.spend > 0 ? revenue / data.spend : 0;

    let isBestPerformer = false;
    const allCpls = Object.values(platformData).map((d) => calculateCPL(d.spend, d.leads));
    if (cpl > 0 && cpl === Math.min(...allCpls.filter((c) => c > 0))) {
      isBestPerformer = true;
    }

    return {
      platform,
      platformLabel: getPlatformLabel(platform),
      spend: data.spend,
      leads: data.leads,
      cpl,
      roas: Number(roas.toFixed(1)),
      color: getPlatformColor(platform),
      topAds: [], // Would need ad-level data
      isBestPerformer,
    };
  });

  return { channels };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getServiceAnalysis(
  prisma: any,
  startDate: Date,
  endDate: Date
): Promise<ServiceAnalysisData> {
  // Get appointments grouped by service type
  const appointments = await prisma.crmAppointment.groupBy({
    by: ["serviceType"],
    where: {
      appointmentDate: { gte: startDate, lte: endDate },
    },
    _count: true,
  });

  // Get leads (if we had service type on leads, we'd filter here)
  const totalLeads = await prisma.crmLead.count({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const services = appointments.map((apt: { serviceType: string | null; _count: number }) => {
    const serviceType = apt.serviceType || "other";
    const conversions = apt._count;
    // Estimate leads proportionally
    const leads = Math.round((conversions / Math.max(1, appointments.reduce((sum: number, a: { _count: number }) => sum + a._count, 0))) * totalLeads);
    const conversionRate = leads > 0 ? (conversions / leads) * 100 : 0;
    const revenue = estimateServiceRevenue(serviceType, conversions);
    const avgTicket = conversions > 0 ? revenue / conversions : 0;
    // Rough estimate of spend per service
    const estimatedSpend = revenue / 3.5;
    const roi = calculateROI(revenue, estimatedSpend);

    return {
      serviceType,
      serviceLabel: getServiceLabel(serviceType),
      leads,
      conversions,
      conversionRate: Number(conversionRate.toFixed(1)),
      revenue,
      avgTicket: Math.round(avgTicket),
      roi,
    };
  });

  // Mark best performer
  if (services.length > 0) {
    const bestRoi = Math.max(...services.map((s: { roi: number }) => s.roi));
    services.forEach((s: { roi: number; isBest?: boolean }) => {
      if (s.roi === bestRoi) s.isBest = true;
    });
  }

  return {
    services,
    insights: [
      "Dịch vụ có ROI cao nên là focus chính",
      "Dịch vụ có ticket thấp → cơ hội upsell",
      "Tracking LTV để đánh giá đúng hiệu quả",
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCustomerInsights(
  prisma: any,
  startDate: Date,
  endDate: Date
): Promise<CustomerInsightsData> {
  // Get lead sources
  const leadsBySource = await prisma.crmLead.groupBy({
    by: ["source"],
    where: { createdAt: { gte: startDate, lte: endDate } },
    _count: true,
  });

  const totalLeads = leadsBySource.reduce((sum: number, s: { _count: number }) => sum + s._count, 0);

  const leadSources = leadsBySource.map((s: { source: string | null; _count: number }) => ({
    source: s.source || "unknown",
    percentage: totalLeads > 0 ? Number(((s._count / totalLeads) * 100).toFixed(1)) : 0,
    color: getPlatformColor(s.source || "other"),
  }));

  // Static demographic data (would need actual data in production)
  const demographics = [
    {
      category: "Giới tính",
      items: [
        { label: "Nữ", value: 68, percentage: 68 },
        { label: "Nam", value: 32, percentage: 32 },
      ],
    },
    {
      category: "Độ tuổi",
      items: [
        { label: "18-24", value: 15, percentage: 15 },
        { label: "25-34", value: 38, percentage: 38 },
        { label: "35-44", value: 28, percentage: 28 },
        { label: "45-54", value: 12, percentage: 12 },
        { label: "55+", value: 7, percentage: 7 },
      ],
    },
  ];

  const hourlyDistribution = [
    { label: "06:00", value: 5 },
    { label: "09:00", value: 25 },
    { label: "12:00", value: 45 },
    { label: "15:00", value: 35 },
    { label: "18:00", value: 65 },
    { label: "21:00", value: 90, isPeak: true },
    { label: "24:00", value: 15 },
  ];

  const dailyDistribution = [
    { label: "T2", value: 85 },
    { label: "T3", value: 90 },
    { label: "T4", value: 95, isPeak: true },
    { label: "T5", value: 80 },
    { label: "T6", value: 70 },
    { label: "T7", value: 55 },
    { label: "CN", value: 45 },
  ];

  return {
    demographics,
    leadSources,
    hourlyDistribution,
    dailyDistribution,
  };
}

function getCompetitiveAnalysis(): CompetitiveAnalysisData {
  // This would be manually entered or pulled from external tools
  return {
    shareOfVoice: [
      { name: "Greenfield Dental", percentage: 22, isOwn: true },
      { name: "Competitor A", percentage: 18 },
      { name: "Competitor B", percentage: 15 },
      { name: "Competitor C", percentage: 14 },
      { name: "Others", percentage: 31 },
    ],
    competitors: [
      {
        name: "Competitor A",
        observations: [
          "Đang push mạnh campaign pricing aggressive",
          "Tăng ngân sách TikTok",
        ],
        focus: "Giá rẻ, trả góp, khuyến mãi lớn",
        weakness: "Brand perception thấp, reviews trung bình",
        color: "#3b82f6",
      },
      {
        name: "Competitor B",
        observations: [
          "Launch chương trình referral",
          "Heavy KOL marketing",
        ],
        focus: "Celebrity endorsement, premium positioning",
        weakness: "Giá cao, target audience hẹp",
        color: "#22c55e",
      },
    ],
    recommendations: [
      "Highlight 'Chất lượng' và 'Bác sĩ chuyên môn cao'",
      "Develop KOL partnerships (micro-influencers)",
      "Create comparison content",
    ],
  };
}

function getActionItems(): ActionItemsData {
  return {
    urgent: [
      {
        id: 1,
        title: "Tối ưu Google Ads Keywords",
        owner: "Marketing Team",
        deadline: "7 ngày",
        impact: "Giảm CPC 15-20%",
        actions: "Review & pause low QS keywords, add negative keywords",
        priority: "urgent",
      },
      {
        id: 2,
        title: "Fix landing page load time",
        owner: "Tech Team",
        deadline: "7 ngày",
        impact: "Tăng CVR 10-15%",
        actions: "Optimize images, implement lazy loading",
        priority: "urgent",
      },
    ],
    important: [
      {
        id: 3,
        title: "Scale TikTok Ads Budget +30%",
        owner: "Marketing Manager",
        deadline: "15 ngày",
        budget: "+15M",
        expectedOutcome: "+45 leads/tháng",
        priority: "important",
      },
      {
        id: 4,
        title: "Implement Remarketing Campaign",
        owner: "Digital Marketing",
        deadline: "20 ngày",
        budget: "10M",
        expectedOutcome: "+25 consultations",
        priority: "important",
      },
    ],
    strategic: [
      {
        id: 5,
        title: "Build KOL Partnership Program",
        owner: "Marketing Director",
        budget: "50M/quarter",
        expectedOutcome: "Brand awareness +20%",
        priority: "strategic",
      },
      {
        id: 6,
        title: "Develop Customer LTV Tracking",
        owner: "Data Team",
        expectedOutcome: "Better attribution",
        priority: "strategic",
      },
    ],
  };
}

function getForecastApproval(currentBudget: number): ForecastApprovalData {
  const recommendedBudget = Math.round(currentBudget * 1.167); // +16.7%

  return {
    scenarios: [
      {
        name: "Conservative",
        budget: currentBudget,
        leads: 520,
        revenue: 400000000,
        roi: 2.7,
      },
      {
        name: "Base Case (Recommended)",
        budget: recommendedBudget,
        leads: 620,
        revenue: 510000000,
        roi: 2.9,
        isRecommended: true,
      },
      {
        name: "Aggressive",
        budget: Math.round(currentBudget * 1.333),
        leads: 750,
        revenue: 650000000,
        roi: 3.2,
      },
    ],
    recommendedBudget,
    budgetChange: 16.7,
    allocations: [
      { platform: "facebook", platformLabel: "Facebook Ads", amount: Math.round(recommendedBudget * 0.31), percentage: 31, note: "Maintain" },
      { platform: "google_ads", platformLabel: "Google Ads", amount: Math.round(recommendedBudget * 0.23), percentage: 23, note: "Optimize first" },
      { platform: "tiktok", platformLabel: "TikTok Ads", amount: Math.round(recommendedBudget * 0.26), percentage: 26, note: "Scale winner", isIncreased: true },
      { platform: "zalo", platformLabel: "Zalo Ads", amount: Math.round(recommendedBudget * 0.09), percentage: 9, note: "Maintain" },
      { platform: "remarketing", platformLabel: "Remarketing", amount: Math.round(recommendedBudget * 0.06), percentage: 6, note: "NEW", isNew: true },
      { platform: "contingency", platformLabel: "Contingency", amount: Math.round(recommendedBudget * 0.05), percentage: 5, note: "Buffer" },
    ],
    expectedOutcomes: [
      "Leads: 620 (+28% vs tháng này)",
      "CPL: ổn định",
      "Consultations: 210 (+35%)",
      "New Customers: 110 (+36%)",
      "Revenue từ Ads: 510M",
    ],
    approvalItems: [
      `Phê duyệt ngân sách ${Math.round(recommendedBudget / 1000000)}M VNĐ cho tháng tới`,
      "Phê duyệt tăng ngân sách TikTok",
      "Phê duyệt triển khai Remarketing Campaign",
    ],
  };
}
