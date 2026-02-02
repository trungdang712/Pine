import { ReportSectionTitle } from "../shared";
import type { ActionItemsData, ActionItem } from "@/lib/report/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ActionItemsProps {
  data: ActionItemsData;
}

function ActionItemCard({ item }: { item: ActionItem }) {
  const priorityColors = {
    urgent: "border-red-500 bg-red-50",
    important: "border-yellow-500 bg-yellow-50",
    strategic: "border-blue-500 bg-blue-50",
  };

  const priorityBadgeColors = {
    urgent: "bg-red-500",
    important: "bg-yellow-500",
    strategic: "bg-blue-500",
  };

  const priorityLabels = {
    urgent: "KHẨN CẤP",
    important: "QUAN TRỌNG",
    strategic: "CHIẾN LƯỢC",
  };

  return (
    <div
      className={cn(
        "border rounded-lg p-3 mb-3",
        priorityColors[item.priority]
      )}
      style={{ borderLeftWidth: 4 }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">
            {item.id}. {item.title}
          </span>
          <Badge className={cn("text-xs text-white", priorityBadgeColors[item.priority])}>
            {priorityLabels[item.priority]}
          </Badge>
        </div>
        {item.deadline && (
          <span className="text-xs text-muted-foreground">
            Deadline: {item.deadline}
          </span>
        )}
      </div>

      <div className="text-xs space-y-1">
        <div>
          <strong>Người phụ trách:</strong> {item.owner}
        </div>
        {item.impact && (
          <div>
            <strong>Impact:</strong> {item.impact}
          </div>
        )}
        {item.actions && (
          <div>
            <strong>Actions:</strong> {item.actions}
          </div>
        )}
        {item.budget && (
          <div>
            <strong>Budget:</strong> {item.budget}
          </div>
        )}
        {item.expectedOutcome && (
          <div>
            <strong>Expected Outcome:</strong> {item.expectedOutcome}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionItemSection({
  title,
  items,
  icon,
}: {
  title: string;
  items: ActionItem[];
  icon: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="font-semibold text-sm mb-3 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      {items.map((item) => (
        <ActionItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export function ActionItems({ data }: ActionItemsProps) {
  return (
    <div className="section mb-5">
      <ReportSectionTitle number={9} title="HÀNH ĐỘNG TIẾP THEO" />

      <ActionItemSection
        title="Khẩn cấp (Tuần này)"
        items={data.urgent}
        icon="🔴"
      />

      <ActionItemSection
        title="Quan trọng (2 tuần tới)"
        items={data.important}
        icon="🟡"
      />

      <ActionItemSection
        title="Chiến lược (Tháng tới)"
        items={data.strategic}
        icon="🔵"
      />

      {data.urgent.length === 0 &&
        data.important.length === 0 &&
        data.strategic.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-5">
            Không có action items nào được ghi nhận.
          </div>
        )}
    </div>
  );
}
