import { ReportSectionTitle, ReportHighlightBox, ReportProgressBarWithLabel } from "../shared";
import type { CompetitiveAnalysisData } from "@/lib/report/types";
import { cn } from "@/lib/utils";

interface CompetitiveAnalysisProps {
  data: CompetitiveAnalysisData;
}

function CompetitorCard({
  competitor,
}: {
  competitor: CompetitiveAnalysisData["competitors"][0];
}) {
  return (
    <div
      className="border rounded-lg p-3 mb-3"
      style={{ borderLeftWidth: 4, borderLeftColor: competitor.color }}
    >
      <div className="font-bold text-sm mb-2">{competitor.name}</div>
      <div className="text-xs space-y-1">
        <ul className="list-disc ml-4 mb-2">
          {competitor.observations.map((obs, index) => (
            <li key={index}>{obs}</li>
          ))}
        </ul>
        <div>
          <strong>Focus:</strong> {competitor.focus}
        </div>
        <div>
          <strong>Weakness:</strong> {competitor.weakness}
        </div>
      </div>
    </div>
  );
}

export function CompetitiveAnalysis({ data }: CompetitiveAnalysisProps) {
  return (
    <div className="section mb-5">
      <ReportSectionTitle number={8} title="PHÂN TÍCH CẠNH TRANH" />

      <div className="mb-5">
        <strong className="text-sm">Share of Voice (Estimated)</strong>
        <div className="mt-3">
          {data.shareOfVoice.map((item) => (
            <div key={item.name} className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "text-xs",
                  item.isOwn ? "font-bold w-36" : "w-36"
                )}
              >
                {item.name}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.isOwn ? "#16a34a" : "#9ca3af",
                  }}
                />
              </div>
              <span
                className={cn(
                  "text-sm w-12 text-right",
                  item.isOwn && "font-bold text-green-600"
                )}
              >
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm font-semibold mb-3">Competitor Ad Observations</div>
      {data.competitors.map((competitor) => (
        <CompetitorCard key={competitor.name} competitor={competitor} />
      ))}

      {data.recommendations.length > 0 && (
        <ReportHighlightBox
          title="COMPETITIVE RESPONSE RECOMMENDATIONS"
          icon="💡"
          items={data.recommendations}
          variant="default"
        />
      )}
    </div>
  );
}
