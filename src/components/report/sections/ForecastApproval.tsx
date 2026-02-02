import { ReportSectionTitle, ReportTable, ReportHighlightBox } from "../shared";
import { formatCurrencyVND } from "@/lib/report/calculations";
import type { ForecastApprovalData } from "@/lib/report/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ForecastApprovalProps {
  data: ForecastApprovalData;
}

export function ForecastApproval({ data }: ForecastApprovalProps) {
  const scenarioColumns = [
    {
      key: "name",
      header: "Kịch bản",
      align: "left" as const,
      render: (value: unknown, row: unknown) => {
        const scenario = row as ForecastApprovalData["scenarios"][0];
        return (
          <span className="flex items-center gap-2">
            <strong>{value as string}</strong>
            {scenario.isRecommended && (
              <Badge variant="default" className="bg-green-500 text-xs">
                ĐỀ XUẤT
              </Badge>
            )}
          </span>
        );
      },
    },
    {
      key: "budget",
      header: "Ngân sách",
      align: "right" as const,
      render: (value: unknown) => formatCurrencyVND(value as number),
    },
    {
      key: "leads",
      header: "Leads dự kiến",
      align: "right" as const,
    },
    {
      key: "revenue",
      header: "Revenue dự kiến",
      align: "right" as const,
      render: (value: unknown) => formatCurrencyVND(value as number),
    },
    {
      key: "roi",
      header: "ROI dự kiến",
      align: "right" as const,
      render: (value: unknown) => `${value}x`,
    },
  ];

  const allocationColumns = [
    {
      key: "platformLabel",
      header: "Kênh",
      align: "left" as const,
      render: (value: unknown, row: unknown) => {
        const allocation = row as ForecastApprovalData["allocations"][0];
        return (
          <span className="flex items-center gap-2">
            {value as string}
            {allocation.isNew && (
              <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                MỚI
              </Badge>
            )}
            {allocation.isIncreased && (
              <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                TĂNG
              </Badge>
            )}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Ngân sách",
      align: "right" as const,
      render: (value: unknown) => formatCurrencyVND(value as number),
    },
    {
      key: "percentage",
      header: "Tỷ lệ",
      align: "right" as const,
      render: (value: unknown) => `${value}%`,
    },
    {
      key: "note",
      header: "Ghi chú",
      align: "left" as const,
    },
  ];

  return (
    <div className="section mb-5">
      <ReportSectionTitle number={10} title="DỰ BÁO & PHÊ DUYỆT" />

      <div className="mb-5">
        <div className="text-sm font-semibold mb-3">Kịch bản tháng tới</div>
        <ReportTable
          columns={scenarioColumns}
          data={data.scenarios as unknown as Record<string, unknown>[]}
          highlightRow={(row) =>
            (row as { isRecommended?: boolean }).isRecommended === true
          }
        />
      </div>

      <div className="mb-5">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2">
          Đề xuất ngân sách tháng tới
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              data.budgetChange >= 0
                ? "border-green-500 text-green-600"
                : "border-red-500 text-red-600"
            )}
          >
            {data.budgetChange >= 0 ? "+" : ""}
            {data.budgetChange}% so với tháng này
          </Badge>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrencyVND(data.recommendedBudget)}
            </div>
            <div className="text-xs text-muted-foreground">
              Ngân sách đề xuất
            </div>
          </div>
        </div>

        <ReportTable columns={allocationColumns} data={data.allocations as unknown as Record<string, unknown>[]} />
      </div>

      {data.expectedOutcomes.length > 0 && (
        <ReportHighlightBox
          title="KẾT QUẢ DỰ KIẾN"
          icon="🎯"
          items={data.expectedOutcomes}
          variant="success"
        />
      )}

      {data.approvalItems.length > 0 && (
        <div className="mt-5 border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span>✅</span>
            <span>HẠNG MỤC CẦN PHÊ DUYỆT</span>
          </div>
          <div className="space-y-2">
            {data.approvalItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  Người lập báo cáo
                </div>
                <div className="border-b border-gray-400 pb-1 text-sm">
                  Marketing Manager
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ngày: ___/___/______
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  Phê duyệt
                </div>
                <div className="border-b border-gray-400 pb-1 text-sm">
                  Ban Giám đốc
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ngày: ___/___/______
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
