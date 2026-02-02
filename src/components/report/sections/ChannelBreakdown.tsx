import { ReportSectionTitle, ReportHighlightBox } from "../shared";
import { formatCurrencyVND } from "@/lib/report/calculations";
import type { ChannelBreakdownData, ChannelPerformance } from "@/lib/report/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChannelBreakdownProps {
  data: ChannelBreakdownData;
}

function ChannelCard({ channel }: { channel: ChannelPerformance }) {
  const bgColors: Record<string, string> = {
    facebook: "bg-blue-50 border-blue-500",
    google_ads: "bg-red-50 border-red-500",
    tiktok: "bg-gray-50 border-gray-800",
    zalo: "bg-blue-50 border-blue-600",
  };

  const bgColor = bgColors[channel.platform] || "bg-gray-50 border-gray-400";

  return (
    <div
      className={cn(
        "border rounded-lg p-3 mb-3",
        bgColor,
        channel.isBestPerformer && "ring-2 ring-green-500"
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{channel.platformLabel}</span>
          {channel.isBestPerformer && (
            <Badge variant="default" className="bg-green-500 text-xs">
              BEST PERFORMER
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          Chi phí: {formatCurrencyVND(channel.spend, true)} | Leads:{" "}
          {channel.leads} | CPL: {formatCurrencyVND(channel.cpl, true)} | ROAS:{" "}
          {channel.roas}x
        </span>
      </div>

      {channel.topAds && channel.topAds.length > 0 && (
        <div className="mt-2">
          <strong className="text-xs">Top Performing Ads:</strong>
          <table className="w-full text-xs mt-1">
            <tbody>
              {channel.topAds.map((ad, index) => (
                <tr key={index}>
                  <td>{ad.name}</td>
                  <td className="text-right">CPL: {formatCurrencyVND(ad.cpl, true)}</td>
                  <td className="text-right">{ad.leads} leads</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {channel.demographics && (
        <div className="text-xs text-muted-foreground mt-2">
          <strong>Demographics:</strong> {channel.demographics}
        </div>
      )}

      {channel.bestTime && (
        <div className="text-xs text-muted-foreground">
          <strong>Best time:</strong> {channel.bestTime}
        </div>
      )}

      {channel.issues && channel.issues.length > 0 && (
        <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded text-xs">
          <strong>Issues:</strong>
          <ul className="list-disc ml-4">
            {channel.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {channel.recommendations && channel.recommendations.length > 0 && (
        <div className="text-xs text-muted-foreground mt-2">
          <strong>Recommendation:</strong> {channel.recommendations.join(", ")}
        </div>
      )}
    </div>
  );
}

export function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  return (
    <div className="section mb-5">
      <ReportSectionTitle number={5} title="PHÂN TÍCH CHI TIẾT THEO KÊNH" />

      {data.channels.map((channel) => (
        <ChannelCard key={channel.platform} channel={channel} />
      ))}
    </div>
  );
}
