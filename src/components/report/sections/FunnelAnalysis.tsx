import { ReportSectionTitle, ReportTable, ReportHighlightBox } from "../shared";
import type { FunnelAnalysisData } from "@/lib/report/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FunnelAnalysisProps {
  data: FunnelAnalysisData;
}

function FunnelVisualization({ stages }: { stages: FunnelAnalysisData["stages"] }) {
  const maxValue = stages[0]?.value || 1;
  const widths = [350, 300, 250, 200, 150];

  return (
    <div className="flex flex-col items-center py-5">
      {stages.map((stage, index) => (
        <div key={stage.name} className="funnel-step text-center mb-1">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-md mb-1 mx-auto"
            style={{ width: widths[index] || 100 }}
          >
            <div className="text-lg font-bold">{stage.value.toLocaleString()}</div>
            <div className="text-xs">{stage.name.toUpperCase()}</div>
          </div>
          {stage.rate !== undefined && index < stages.length - 1 && (
            <div className="text-xs text-muted-foreground my-1">
              ↓ {stage.rate.toFixed(1)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function FunnelAnalysis({ data }: FunnelAnalysisProps) {
  const columns = [
    { key: "name", header: "Metric", align: "left" as const },
    {
      key: "current",
      header: "Tháng này",
      align: "right" as const,
      render: (value: unknown, row: unknown) => {
        const metric = row as FunnelAnalysisData["comparison"][0];
        return `${value}${metric.unit}`;
      },
    },
    {
      key: "previous",
      header: "Tháng trước",
      align: "right" as const,
      render: (value: unknown, row: unknown) => {
        const metric = row as FunnelAnalysisData["comparison"][0];
        return `${value}${metric.unit}`;
      },
    },
    {
      key: "change",
      header: "Thay đổi",
      align: "right" as const,
      render: (value: unknown, row: unknown) => {
        const metric = row as FunnelAnalysisData["comparison"][0];
        const change = value as number;
        return (
          <span className={metric.isPositive ? "text-green-600" : "text-red-600"}>
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        );
      },
    },
    {
      key: "isPositive",
      header: "Đánh giá",
      align: "left" as const,
      render: (value: unknown) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Tốt" : "Cần cải thiện"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="section mb-5">
      <ReportSectionTitle number={4} title="PHỄU CHUYỂN ĐỔI" />

      <FunnelVisualization stages={data.stages} />

      <div className="mt-5">
        <div className="text-sm font-semibold mb-3">So sánh với tháng trước</div>
        <ReportTable columns={columns} data={data.comparison as unknown as Record<string, unknown>[]} />
      </div>

      {data.bottlenecks.length > 0 && (
        <ReportHighlightBox
          title="BOTTLENECK IDENTIFIED"
          icon="⚠️"
          items={data.bottlenecks}
          variant="warning"
        />
      )}
    </div>
  );
}
