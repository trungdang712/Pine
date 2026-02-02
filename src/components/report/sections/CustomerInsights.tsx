import { ReportSectionTitle, ReportProgressBarWithLabel } from "../shared";
import type { CustomerInsightsData } from "@/lib/report/types";
import { cn } from "@/lib/utils";

interface CustomerInsightsProps {
  data: CustomerInsightsData;
}

function DemographicChart({
  category,
  items,
}: {
  category: string;
  items: { label: string; value: number; percentage: number }[];
}) {
  const colors = ["#ec4899", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6"];

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="font-bold text-sm mb-3">{category}</div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs w-16">{item.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: colors[index % colors.length],
                }}
              />
            </div>
            <span className="text-xs w-10 text-right font-bold">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeDistributionChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number; isPeak?: boolean }[];
}) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div>
      <strong className="text-xs">{title}</strong>
      <div className="mt-2 space-y-1">
        {data.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-2",
              item.isPeak && "bg-green-50 -mx-1 px-1 rounded"
            )}
          >
            <span className="text-xs w-12">
              {item.isPeak ? <strong>{item.label}</strong> : item.label}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            {item.isPeak && <span className="text-xs">← Peak</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerInsights({ data }: CustomerInsightsProps) {
  return (
    <div className="section mb-5">
      <ReportSectionTitle number={7} title="CUSTOMER INSIGHTS" />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {data.demographics.map((demo) => (
          <DemographicChart
            key={demo.category}
            category={demo.category}
            items={demo.items}
          />
        ))}

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="font-bold text-sm mb-3">Khu vực</div>
          <div className="space-y-2 text-xs">
            {[
              { label: "Quận 1", percentage: 18 },
              { label: "Quận 3", percentage: 22 },
              { label: "Quận 7", percentage: 15 },
              { label: "Bình Thạnh", percentage: 12 },
              { label: "Khác", percentage: 33 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-20">{item.label}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right">
                  {item.percentage === 22 ? <strong>{item.percentage}%</strong> : `${item.percentage}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-semibold mb-3">Lead Source Breakdown</div>
        {data.leadSources.map((source) => (
          <ReportProgressBarWithLabel
            key={source.source}
            label={source.source}
            value={source.percentage}
            color={source.color}
            labelWidth={120}
          />
        ))}
      </div>

      <div className="text-sm font-semibold mb-3">Thời gian hoạt động cao điểm</div>
      <div className="grid grid-cols-2 gap-5">
        <TimeDistributionChart
          title="Theo giờ trong ngày:"
          data={data.hourlyDistribution}
        />
        <TimeDistributionChart
          title="Theo ngày trong tuần:"
          data={data.dailyDistribution}
        />
      </div>
    </div>
  );
}
