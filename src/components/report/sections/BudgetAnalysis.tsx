import { ReportSectionTitle, ReportTable, ReportProgressBar, ReportProgressBarWithLabel } from "../shared";
import { formatCurrencyVND } from "@/lib/report/calculations";
import type { BudgetAnalysisData } from "@/lib/report/types";
import { Badge } from "@/components/ui/badge";

interface BudgetAnalysisProps {
  data: BudgetAnalysisData;
}

export function BudgetAnalysis({ data }: BudgetAnalysisProps) {
  const columns = [
    { key: "platformLabel", header: "Kênh", align: "left" as const },
    {
      key: "budget",
      header: "Ngân sách",
      align: "right" as const,
      render: (value: unknown) => formatCurrencyVND(value as number),
    },
    {
      key: "spent",
      header: "Thực chi",
      align: "right" as const,
      render: (value: unknown) => formatCurrencyVND(value as number),
    },
    {
      key: "utilization",
      header: "% Sử dụng",
      align: "right" as const,
      render: (value: unknown) => `${value}%`,
    },
    {
      key: "cpl",
      header: "CPL",
      align: "right" as const,
      render: (value: unknown) => formatCurrencyVND(value as number),
    },
    {
      key: "leads",
      header: "Leads",
      align: "right" as const,
    },
    {
      key: "cplTrend",
      header: "Trend",
      align: "center" as const,
      render: (value: unknown) => {
        const trend = value as number;
        if (trend < 0)
          return <span className="text-green-600">▼ {Math.abs(trend)}%</span>;
        if (trend > 0)
          return <span className="text-red-600">▲ {trend}%</span>;
        return <span className="text-gray-500">→</span>;
      },
    },
  ];

  // Find best performer (lowest CPL)
  const bestPerformer = data.allocations.reduce((best, current) =>
    current.cpl > 0 && (best.cpl === 0 || current.cpl < best.cpl) ? current : best
  );

  const enhancedData = data.allocations.map((item) => ({
    ...item,
    isBest: item.platform === bestPerformer.platform && item.cpl > 0,
  }));

  return (
    <div className="section mb-5">
      <ReportSectionTitle number={2} title="PHÂN BỔ NGÂN SÁCH & CHI TIÊU" />

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1">
                  <strong>Tổng ngân sách tháng:</strong>
                </td>
                <td className="py-1 text-right">
                  <strong>{formatCurrencyVND(data.totalBudget)} VNĐ</strong>
                </td>
              </tr>
              <tr>
                <td className="py-1">
                  <strong>Đã chi tiêu:</strong>
                </td>
                <td className="py-1 text-right">
                  <strong>{formatCurrencyVND(data.totalSpent)} VNĐ</strong>
                </td>
              </tr>
              <tr>
                <td className="py-1">
                  <strong>Còn lại:</strong>
                </td>
                <td className="py-1 text-right">
                  <strong>{formatCurrencyVND(data.remaining)} VNĐ</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="text-xs mb-1">
            Tiến độ chi tiêu: {data.utilizationPercent}%
          </div>
          <ReportProgressBar value={data.utilizationPercent} height={20} />
        </div>
      </div>

      <ReportTable
        columns={columns}
        data={enhancedData}
        highlightRow={(row) => (row as { isBest?: boolean }).isBest === true}
        footerRow={{
          platformLabel: "TỔNG",
          budget: data.totalBudget,
          spent: data.totalSpent,
          utilization: data.utilizationPercent,
          cpl: data.totalSpent > 0 && data.allocations.reduce((sum, a) => sum + a.leads, 0) > 0
            ? Math.round(data.totalSpent / data.allocations.reduce((sum, a) => sum + a.leads, 0))
            : 0,
          leads: data.allocations.reduce((sum, a) => sum + a.leads, 0),
          cplTrend: 0,
        }}
      />

      <div className="mt-5">
        <div className="text-sm font-semibold mb-3">Tỷ trọng chi tiêu theo kênh</div>
        {data.allocations.map((allocation) => (
          <ReportProgressBarWithLabel
            key={allocation.platform}
            label={allocation.platformLabel}
            value={
              data.totalSpent > 0
                ? Math.round((allocation.spent / data.totalSpent) * 100)
                : 0
            }
            color={allocation.color}
          />
        ))}
      </div>
    </div>
  );
}
