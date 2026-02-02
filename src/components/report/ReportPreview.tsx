"use client";

import type { ReportData } from "@/lib/report/types";
import {
  ExecutiveSummary,
  BudgetAnalysis,
  CampaignPerformance,
  FunnelAnalysis,
  ChannelBreakdown,
  ServiceAnalysis,
  CustomerInsights,
  CompetitiveAnalysis,
  ActionItems,
  ForecastApproval,
} from "./sections";

interface ReportPreviewProps {
  data: ReportData;
}

export function ReportPreview({ data }: ReportPreviewProps) {
  const monthLabel = new Date(data.month + "-01").toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="report-preview bg-white p-8 max-w-4xl mx-auto">
      {/* Report Header */}
      <div className="text-center mb-8 pb-5 border-b-2 border-green-500">
        <div className="text-xs text-muted-foreground mb-1">
          BÁO CÁO QUẢNG CÁO HÀNG THÁNG
        </div>
        <h1 className="text-2xl font-bold text-green-700 mb-2">
          GREENFIELD DENTAL
        </h1>
        <div className="text-lg font-semibold">{monthLabel.toUpperCase()}</div>
        <div className="text-xs text-muted-foreground mt-2">
          Ngày tạo:{" "}
          {new Date(data.generatedAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Report Sections */}
      <div className="report-content space-y-8">
        <ExecutiveSummary data={data.executiveSummary} />

        <div className="page-break" />
        <BudgetAnalysis data={data.budgetAnalysis} />

        <div className="page-break" />
        <CampaignPerformance data={data.campaignPerformance} />

        <div className="page-break" />
        <FunnelAnalysis data={data.funnelAnalysis} />

        <div className="page-break" />
        <ChannelBreakdown data={data.channelBreakdown} />

        <div className="page-break" />
        <ServiceAnalysis data={data.serviceAnalysis} />

        <div className="page-break" />
        <CustomerInsights data={data.customerInsights} />

        <div className="page-break" />
        <CompetitiveAnalysis data={data.competitiveAnalysis} />

        <div className="page-break" />
        <ActionItems data={data.actionItems} />

        <div className="page-break" />
        <ForecastApproval data={data.forecastApproval} />
      </div>

      {/* Report Footer */}
      <div className="mt-10 pt-5 border-t text-center text-xs text-muted-foreground">
        <div>Greenfield Dental - Báo cáo Quảng cáo {monthLabel}</div>
        <div className="mt-1">
          Tài liệu này chỉ dành cho nội bộ. Vui lòng không chia sẻ ra ngoài.
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          .page-break {
            page-break-before: always;
          }
          .report-preview {
            padding: 0;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
