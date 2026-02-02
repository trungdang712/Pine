import { ReportKPICard, ReportHighlightBox, ReportSectionTitle } from "../shared";
import { formatCurrencyVND } from "@/lib/report/calculations";
import type { ExecutiveSummaryData } from "@/lib/report/types";

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryData;
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  return (
    <div className="section mb-5">
      <ReportSectionTitle number={1} title="TÓM TẮT ĐIỀU HÀNH" />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <ReportKPICard
          label="TỔNG CHI PHÍ"
          value={formatCurrencyVND(data.totalSpend, true)}
          change={data.spendChange}
          isPositive={data.spendChange >= 0}
        />
        <ReportKPICard
          label="TỔNG LEADS"
          value={data.totalLeads.toLocaleString()}
          change={data.leadsChange}
          isPositive={data.leadsChange >= 0}
        />
        <ReportKPICard
          label="TỶ LỆ CHUYỂN ĐỔI"
          value={`${data.conversionRate}%`}
          change={Math.abs(data.cplChange)}
          isPositive={data.cplChange <= 0}
        />
        <ReportKPICard
          label="ROI"
          value={`${data.roi}x`}
          change={data.roiChange}
          isPositive={data.roiChange >= 0}
        />
      </div>

      {data.highlights.length > 0 && (
        <ReportHighlightBox
          title="ĐIỂM NỔI BẬT"
          icon="📌"
          items={data.highlights}
          variant="success"
        />
      )}

      {data.warnings.length > 0 && (
        <ReportHighlightBox
          title="CẦN CHÚ Ý"
          icon="⚠️"
          items={data.warnings}
          variant="warning"
        />
      )}

      {data.recommendations.length > 0 && (
        <ReportHighlightBox
          title="ĐỀ XUẤT CHÍNH"
          icon="💡"
          items={data.recommendations}
          variant="default"
        />
      )}
    </div>
  );
}
