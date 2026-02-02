// Report calculation utilities

/**
 * Calculate Cost Per Lead
 */
export function calculateCPL(spend: number, leads: number): number {
  if (leads === 0) return 0;
  return Math.round(spend / leads);
}

/**
 * Calculate Return on Investment
 */
export function calculateROI(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return Number((revenue / spend).toFixed(1));
}

/**
 * Calculate Click Through Rate
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return Number(((clicks / impressions) * 100).toFixed(2));
}

/**
 * Calculate Conversion Rate
 */
export function calculateConversionRate(conversions: number, total: number): number {
  if (total === 0) return 0;
  return Number(((conversions / total) * 100).toFixed(1));
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

/**
 * Format currency in Vietnamese format
 */
export function formatCurrencyVND(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString("vi-VN");
  }
  return amount.toLocaleString("vi-VN");
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("vi-VN");
}

/**
 * Calculate utilization percentage
 */
export function calculateUtilization(spent: number, budget: number): number {
  if (budget === 0) return 0;
  return Number(((spent / budget) * 100).toFixed(1));
}

/**
 * Get platform display label
 */
export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    google_ads: "Google Ads",
    facebook: "Facebook Ads",
    zalo: "Zalo Ads",
    tiktok: "TikTok Ads",
    instagram: "Instagram Ads",
    other: "Other",
  };
  return labels[platform] || platform;
}

/**
 * Get platform color
 */
export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    google_ads: "#ea4335",
    facebook: "#1877f2",
    zalo: "#0068ff",
    tiktok: "#000000",
    instagram: "#e4405f",
    other: "#9ca3af",
  };
  return colors[platform] || "#6b7280";
}

/**
 * Get service type display label
 */
export function getServiceLabel(serviceType: string): string {
  const labels: Record<string, string> = {
    orthodontics: "Niềng răng",
    implant: "Implant",
    whitening: "Tẩy trắng",
    veneer: "Veneer",
    general_checkup: "Khám tổng quát",
    crown: "Bọc răng sứ",
    extraction: "Nhổ răng",
    filling: "Trám răng",
    cleaning: "Lấy cao răng",
    other: "Khác",
  };
  return labels[serviceType] || serviceType;
}

/**
 * Calculate star rating from achievement percentage (1-5)
 */
export function calculateStarRating(achievementPercent: number): number {
  if (achievementPercent >= 120) return 5;
  if (achievementPercent >= 100) return 4;
  if (achievementPercent >= 80) return 3;
  if (achievementPercent >= 60) return 2;
  return 1;
}

/**
 * Estimate revenue from service type
 * This is a placeholder - in real implementation, this should come from actual data
 */
export function estimateServiceRevenue(serviceType: string, conversions: number): number {
  const avgTickets: Record<string, number> = {
    orthodontics: 35000000,
    implant: 38000000,
    whitening: 3000000,
    veneer: 48000000,
    general_checkup: 900000,
    crown: 5000000,
    extraction: 1500000,
    filling: 500000,
    cleaning: 300000,
    other: 1000000,
  };
  const avgTicket = avgTickets[serviceType] || 1000000;
  return conversions * avgTicket;
}

/**
 * Get month display string
 */
export function getMonthDisplay(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  return `Tháng ${month.toString().padStart(2, "0")}/${year}`;
}

/**
 * Get previous month string
 */
export function getPreviousMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${(month - 1).toString().padStart(2, "0")}`;
}

/**
 * Get next month string
 */
export function getNextMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  if (month === 12) {
    return `${year + 1}-01`;
  }
  return `${year}-${(month + 1).toString().padStart(2, "0")}`;
}

/**
 * Get date range for a month
 */
export function getMonthDateRange(monthStr: string): { startDate: Date; endDate: Date } {
  const [year, month] = monthStr.split("-").map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}
