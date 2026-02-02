import { ReportSectionTitle, ReportHighlightBox } from "../shared";
import { formatCurrencyVND } from "@/lib/report/calculations";
import type { CampaignPerformanceData } from "@/lib/report/types";
import { cn } from "@/lib/utils";

interface CampaignPerformanceProps {
  data: CampaignPerformanceData;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-xs">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

function CampaignCard({
  campaign,
  rank,
}: {
  campaign: CampaignPerformanceData["campaigns"][0];
  rank: number;
}) {
  const isExceeded = campaign.targetAchievement >= 100;
  const borderColor = isExceeded ? "border-l-green-500" : "border-l-yellow-500";
  const textColor = isExceeded ? "text-green-600" : "text-yellow-600";

  return (
    <div
      className={cn(
        "border rounded-lg p-3 mb-3 border-l-4",
        borderColor
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {rank}. {campaign.name}
          </span>
          <StarRating rating={campaign.rating} />
        </div>
        <span className={cn("font-bold text-sm", textColor)}>
          Target: {campaign.targetAchievement.toFixed(0)}% {isExceeded ? "✓" : ""}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>
          <strong>Chi phí:</strong> {formatCurrencyVND(campaign.spend, true)}
        </span>
        <span>
          <strong>Leads:</strong> {campaign.leads}
        </span>
        <span>
          <strong>CPL:</strong> {formatCurrencyVND(campaign.cpl, true)}
        </span>
        <span>
          <strong>Conversions:</strong> {campaign.conversions}
        </span>
        <span>
          <strong>Revenue:</strong> {formatCurrencyVND(campaign.revenue, true)}
        </span>
        <span>
          <strong>ROI:</strong> {campaign.roi}x
        </span>
      </div>
    </div>
  );
}

export function CampaignPerformance({ data }: CampaignPerformanceProps) {
  return (
    <div className="section mb-5">
      <ReportSectionTitle number={3} title="HIỆU QUẢ THEO CHIẾN DỊCH" />

      <div className="mb-4">
        {data.campaigns.slice(0, 5).map((campaign, index) => (
          <CampaignCard key={campaign.id} campaign={campaign} rank={index + 1} />
        ))}
      </div>

      {data.insights.length > 0 && (
        <ReportHighlightBox
          title="CAMPAIGN INSIGHTS"
          icon="💡"
          items={data.insights}
          variant="default"
        />
      )}
    </div>
  );
}
