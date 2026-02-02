"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, Loader2, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { ReportPreview } from "@/components/report";
import { getPreviousMonth } from "@/lib/report/calculations";

function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();

  // Generate last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }

  return options;
}

export default function ReportPage() {
  const { t } = useLanguage();
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to previous month
    return getPreviousMonth(
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
    );
  });
  const [isExporting, setIsExporting] = useState(false);

  // Fetch report data
  const {
    data: reportData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = trpc.report.getReportData.useQuery({ month: selectedMonth });

  const handleExportPDF = async () => {
    if (!reportData) return;

    setIsExporting(true);
    try {
      const response = await fetch("/api/report/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month: selectedMonth }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao-cao-Quang-cao-${selectedMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Có lỗi khi xuất PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{t.analytics.report.title}</h1>
          <p className="text-muted-foreground">{t.analytics.report.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t.analytics.report.selectMonth} />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>

          <Button variant="outline" onClick={handlePrint}>
            In báo cáo
          </Button>

          <Button onClick={handleExportPDF} disabled={isExporting || !reportData}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                {t.analytics.report.exportPdf}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-0 print:p-0">
            <ReportPreview data={reportData} />
          </CardContent>
        </Card>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .report-preview,
          .report-preview * {
            visibility: visible;
          }
          .report-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}
