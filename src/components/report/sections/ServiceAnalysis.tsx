import { ReportSectionTitle, ReportTable, ReportHighlightBox, ReportProgressBar } from "../shared";
import { formatCurrencyVND } from "@/lib/report/calculations";
import type { ServiceAnalysisData } from "@/lib/report/types";
import { cn } from "@/lib/utils";

interface ServiceAnalysisProps {
  data: ServiceAnalysisData;
}

export function ServiceAnalysis({ data }: ServiceAnalysisProps) {
  const columns = [
    {
      key: "serviceLabel",
      header: "Dịch vụ",
      align: "left" as const,
      render: (value: unknown, row: unknown) => {
        const service = row as ServiceAnalysisData["services"][0];
        return (
          <span className="flex items-center gap-1">
            <strong>{value as string}</strong>
            {service.isBest && <span className="text-yellow-500">⭐</span>}
          </span>
        );
      },
    },
    {
      key: "leads",
      header: "Leads",
      align: "right" as const,
    },
    {
      key: "conversions",
      header: "Conversions",
      align: "right" as const,
    },
    {
      key: "conversionRate",
      header: "Conv. Rate",
      align: "right" as const,
      render: (value: unknown) => `${value}%`,
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right" as const,
      render: (value: unknown) => formatCurrencyVND(value as number),
    },
    {
      key: "avgTicket",
      header: "Avg Ticket",
      align: "right" as const,
      render: (value: unknown) => formatCurrencyVND(value as number),
    },
    {
      key: "roi",
      header: "ROI",
      align: "right" as const,
      render: (value: unknown, row: unknown) => {
        const service = row as ServiceAnalysisData["services"][0];
        return (
          <span
            className={cn(
              "font-bold",
              service.roi >= 3 ? "text-green-600" : "text-gray-600"
            )}
          >
            {String(value)}x
          </span>
        );
      },
    },
  ];

  const totals = data.services.reduce(
    (acc, service) => ({
      leads: acc.leads + service.leads,
      conversions: acc.conversions + service.conversions,
      revenue: acc.revenue + service.revenue,
    }),
    { leads: 0, conversions: 0, revenue: 0 }
  );

  const avgConversionRate =
    totals.leads > 0 ? ((totals.conversions / totals.leads) * 100).toFixed(1) : "0";
  const avgTicket =
    totals.conversions > 0 ? Math.round(totals.revenue / totals.conversions) : 0;
  const avgRoi = data.services.length > 0
    ? (data.services.reduce((sum, s) => sum + s.roi, 0) / data.services.length).toFixed(1)
    : "0";

  // Get max revenue for chart scaling
  const maxRevenue = Math.max(...data.services.map((s) => s.revenue));

  return (
    <div className="section mb-5">
      <ReportSectionTitle number={6} title="PHÂN TÍCH THEO DỊCH VỤ" />

      <ReportTable
        columns={columns}
        data={data.services as unknown as Record<string, unknown>[]}
        highlightRow={(row) => (row as { isBest?: boolean }).isBest === true}
        footerRow={{
          serviceLabel: "TỔNG",
          leads: totals.leads,
          conversions: totals.conversions,
          conversionRate: avgConversionRate,
          revenue: totals.revenue,
          avgTicket: avgTicket,
          roi: avgRoi,
        }}
      />

      <div className="mt-5">
        <div className="text-sm font-semibold mb-3">Revenue vs Chi phí theo dịch vụ</div>
        {data.services.map((service) => (
          <div key={service.serviceType} className="flex items-center gap-2 mb-3">
            <span className="text-xs w-24">{service.serviceLabel}</span>
            <div className="flex-1 flex items-center gap-1">
              <ReportProgressBar
                value={(service.revenue / maxRevenue) * 100}
                color="#16a34a"
                height={12}
                className="flex-1"
              />
              <span className="text-xs w-20 text-right">
                {formatCurrencyVND(service.revenue, true)}
              </span>
            </div>
          </div>
        ))}
        <div className="text-xs text-muted-foreground mt-2">
          <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span> Revenue
        </div>
      </div>

      {data.insights.length > 0 && (
        <ReportHighlightBox
          title="SERVICE INSIGHTS"
          icon="💡"
          items={data.insights}
          variant="default"
        />
      )}
    </div>
  );
}
