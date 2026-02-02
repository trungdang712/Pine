// Report Data Types

export interface ExecutiveSummaryData {
  totalSpend: number;
  totalLeads: number;
  conversionRate: number;
  roi: number;
  cpl: number;
  spendChange: number;
  leadsChange: number;
  cplChange: number;
  roiChange: number;
  highlights: string[];
  warnings: string[];
  recommendations: string[];
}

export interface BudgetAllocation {
  platform: string;
  platformLabel: string;
  budget: number;
  spent: number;
  utilization: number;
  cpl: number;
  leads: number;
  cplTrend: number; // negative is good (decreasing)
  color: string;
}

export interface BudgetAnalysisData {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationPercent: number;
  allocations: BudgetAllocation[];
}

export interface CampaignPerformanceItem {
  id: string;
  name: string;
  spend: number;
  leads: number;
  cpl: number;
  conversions: number;
  revenue: number;
  roi: number;
  targetAchievement: number;
  rating: number; // 1-5 stars
}

export interface CampaignPerformanceData {
  campaigns: CampaignPerformanceItem[];
  insights: string[];
}

export interface FunnelStage {
  name: string;
  value: number;
  rate?: number; // conversion rate to next stage
}

export interface FunnelComparisonMetric {
  name: string;
  current: number;
  previous: number;
  change: number;
  isPositive: boolean;
  unit: string;
}

export interface FunnelAnalysisData {
  stages: FunnelStage[];
  comparison: FunnelComparisonMetric[];
  bottlenecks: string[];
}

export interface ChannelPerformance {
  platform: string;
  platformLabel: string;
  spend: number;
  leads: number;
  cpl: number;
  roas: number;
  color: string;
  topAds: {
    name: string;
    cpl: number;
    leads: number;
  }[];
  demographics?: string;
  bestTime?: string;
  issues?: string[];
  recommendations?: string[];
  isBestPerformer?: boolean;
}

export interface ChannelBreakdownData {
  channels: ChannelPerformance[];
}

export interface ServicePerformance {
  serviceType: string;
  serviceLabel: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  avgTicket: number;
  roi: number;
  isBest?: boolean;
}

export interface ServiceAnalysisData {
  services: ServicePerformance[];
  insights: string[];
}

export interface DemographicBreakdown {
  category: string;
  items: {
    label: string;
    value: number;
    percentage: number;
  }[];
}

export interface LeadSourceBreakdown {
  source: string;
  percentage: number;
  color: string;
}

export interface TimeDistribution {
  label: string;
  value: number;
  isPeak?: boolean;
}

export interface CustomerInsightsData {
  demographics: DemographicBreakdown[];
  leadSources: LeadSourceBreakdown[];
  hourlyDistribution: TimeDistribution[];
  dailyDistribution: TimeDistribution[];
}

export interface CompetitorInfo {
  name: string;
  observations: string[];
  focus: string;
  weakness: string;
  color: string;
}

export interface CompetitiveAnalysisData {
  shareOfVoice: {
    name: string;
    percentage: number;
    isOwn?: boolean;
  }[];
  competitors: CompetitorInfo[];
  recommendations: string[];
}

export interface ActionItem {
  id: number;
  title: string;
  owner: string;
  deadline?: string;
  impact?: string;
  actions?: string;
  budget?: string;
  expectedOutcome?: string;
  priority: "urgent" | "important" | "strategic";
}

export interface ActionItemsData {
  urgent: ActionItem[];
  important: ActionItem[];
  strategic: ActionItem[];
}

export interface ForecastScenario {
  name: string;
  budget: number;
  leads: number;
  revenue: number;
  roi: number;
  isRecommended?: boolean;
}

export interface BudgetRequestAllocation {
  platform: string;
  platformLabel: string;
  amount: number;
  percentage: number;
  note: string;
  isNew?: boolean;
  isIncreased?: boolean;
}

export interface ForecastApprovalData {
  scenarios: ForecastScenario[];
  recommendedBudget: number;
  budgetChange: number;
  allocations: BudgetRequestAllocation[];
  expectedOutcomes: string[];
  approvalItems: string[];
}

export interface ReportData {
  month: string;
  generatedAt: Date;
  executiveSummary: ExecutiveSummaryData;
  budgetAnalysis: BudgetAnalysisData;
  campaignPerformance: CampaignPerformanceData;
  funnelAnalysis: FunnelAnalysisData;
  channelBreakdown: ChannelBreakdownData;
  serviceAnalysis: ServiceAnalysisData;
  customerInsights: CustomerInsightsData;
  competitiveAnalysis: CompetitiveAnalysisData;
  actionItems: ActionItemsData;
  forecastApproval: ForecastApprovalData;
}
