import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";
import {
  formatCurrencyVND,
  getMonthDateRange,
  getPlatformLabel,
  getServiceLabel,
  calculateCPL,
  calculateROI,
} from "@/lib/report/calculations";

const generateRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

async function fetchReportData(month: string) {
  const { startDate, endDate } = getMonthDateRange(month);

  // Fetch campaign metrics
  const campaignMetrics = await prisma.campaignMetric.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    include: {
      campaign: true,
    },
  });

  // Aggregate metrics
  const aggregatedMetrics = campaignMetrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + (m.impressions ?? 0),
      clicks: acc.clicks + (m.clicks ?? 0),
      leads: acc.leads + (m.leads ?? 0),
      spend: acc.spend + (m.spend ?? 0),
      conversions: acc.conversions + (m.conversions ?? 0),
    }),
    { impressions: 0, clicks: 0, leads: 0, spend: 0, conversions: 0 }
  );

  // Fetch budget
  const budget = await prisma.monthlyBudget.findFirst({
    where: { month },
  });

  // Calculate metrics
  const totalSpend = aggregatedMetrics.spend;
  const totalLeads = aggregatedMetrics.leads;
  const cpl = calculateCPL(totalSpend, totalLeads);
  const estimatedRevenue = aggregatedMetrics.conversions * 5000000; // Estimate 5M per conversion
  const roi = calculateROI(estimatedRevenue, totalSpend);

  return {
    month,
    totalBudget: budget?.totalBudget ?? 0,
    totalSpend,
    totalLeads,
    conversions: aggregatedMetrics.conversions,
    impressions: aggregatedMetrics.impressions,
    clicks: aggregatedMetrics.clicks,
    cpl,
    roi,
    estimatedRevenue,
  };
}

function generateReportHTML(data: Awaited<ReturnType<typeof fetchReportData>>) {
  const monthLabel = new Date(data.month + "-01").toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo cáo Hiệu quả Quảng cáo - Greenfield Dental</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #333;
      background: #fff;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 20mm;
      margin: 0 auto;
      background: white;
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #16a34a;
    }

    .header h1 {
      font-size: 24px;
      color: #16a34a;
      margin-bottom: 5px;
    }

    .header .subtitle {
      font-size: 14px;
      color: #666;
    }

    .header .period {
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }

    .section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #16a34a;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e5e7eb;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .kpi-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .kpi-card .value {
      font-size: 22px;
      font-weight: bold;
      color: #16a34a;
    }

    .kpi-card .label {
      font-size: 10px;
      color: #666;
      margin-bottom: 5px;
    }

    .kpi-card .change {
      font-size: 10px;
      margin-top: 5px;
    }

    .kpi-card .change.positive { color: #16a34a; }
    .kpi-card .change.negative { color: #dc2626; }

    .highlight-box {
      background: #fefce8;
      border-left: 4px solid #eab308;
      padding: 10px 15px;
      margin-bottom: 10px;
      border-radius: 0 6px 6px 0;
    }

    .highlight-box.success {
      background: #f0fdf4;
      border-left-color: #16a34a;
    }

    .highlight-box.warning {
      background: #fef2f2;
      border-left-color: #dc2626;
    }

    .highlight-box h4 {
      font-size: 11px;
      margin-bottom: 5px;
    }

    .highlight-box ul {
      margin-left: 15px;
      font-size: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 10px;
    }

    table th {
      background: #f3f4f6;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }

    table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e7eb;
    }

    table tr:hover {
      background: #f9fafb;
    }

    .bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #16a34a, #22c55e);
      border-radius: 4px;
    }

    .funnel {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
    }

    .funnel-step {
      text-align: center;
      margin-bottom: 5px;
    }

    .funnel-box {
      background: linear-gradient(135deg, #16a34a, #22c55e);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      margin-bottom: 5px;
    }

    .funnel-box .number {
      font-size: 18px;
      font-weight: bold;
    }

    .funnel-box .label {
      font-size: 10px;
    }

    .footer {
      text-align: center;
      font-size: 10px;
      color: #888;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <!-- Page 1: Executive Summary -->
  <div class="page">
    <div class="header">
      <div class="subtitle">BÁO CÁO HIỆU QUẢ QUẢNG CÁO</div>
      <h1>GREENFIELD DENTAL</h1>
      <div class="period">${monthLabel.toUpperCase()}</div>
    </div>

    <div class="section">
      <div class="section-title">1. TÓM TẮT ĐIỀU HÀNH</div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="label">Tổng Chi phí</div>
          <div class="value">${formatCurrencyVND(data.totalSpend, true)}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Tổng Leads</div>
          <div class="value">${data.totalLeads.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="label">CPL</div>
          <div class="value">${formatCurrencyVND(data.cpl, true)}</div>
        </div>
        <div class="kpi-card">
          <div class="label">ROI</div>
          <div class="value">${data.roi}x</div>
        </div>
      </div>

      <div class="highlight-box success">
        <h4>✅ ĐIỂM MẠNH</h4>
        <ul>
          <li>Tổng chi phí quảng cáo: ${formatCurrencyVND(data.totalSpend)}</li>
          <li>Số leads thu được: ${data.totalLeads} leads</li>
          <li>Số conversions: ${data.conversions}</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Page 2: Budget Analysis -->
  <div class="page">
    <div class="section">
      <div class="section-title">2. PHÂN BỔ NGÂN SÁCH</div>

      <table>
        <tr>
          <th>Hạng mục</th>
          <th style="text-align: right">Ngân sách</th>
          <th style="text-align: right">Chi tiêu</th>
          <th style="text-align: right">Còn lại</th>
          <th style="text-align: right">% Sử dụng</th>
        </tr>
        <tr>
          <td><strong>Tổng cộng</strong></td>
          <td style="text-align: right">${formatCurrencyVND(data.totalBudget)}</td>
          <td style="text-align: right">${formatCurrencyVND(data.totalSpend)}</td>
          <td style="text-align: right">${formatCurrencyVND(data.totalBudget - data.totalSpend)}</td>
          <td style="text-align: right">${data.totalBudget > 0 ? ((data.totalSpend / data.totalBudget) * 100).toFixed(1) : 0}%</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Page 3: Campaign Performance -->
  <div class="page">
    <div class="section">
      <div class="section-title">3. HIỆU QUẢ CHIẾN DỊCH</div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="label">Impressions</div>
          <div class="value">${data.impressions.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Clicks</div>
          <div class="value">${data.clicks.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Leads</div>
          <div class="value">${data.totalLeads.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Conversions</div>
          <div class="value">${data.conversions.toLocaleString()}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Page 4: Funnel Analysis -->
  <div class="page">
    <div class="section">
      <div class="section-title">4. PHỄU CHUYỂN ĐỔI</div>

      <div class="funnel">
        <div class="funnel-step">
          <div class="funnel-box" style="width: 350px;">
            <div class="number">${data.impressions.toLocaleString()}</div>
            <div class="label">IMPRESSIONS</div>
          </div>
          <div style="font-size: 10px; color: #666;">↓ ${data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="funnel-step">
          <div class="funnel-box" style="width: 300px;">
            <div class="number">${data.clicks.toLocaleString()}</div>
            <div class="label">CLICKS</div>
          </div>
          <div style="font-size: 10px; color: #666;">↓ ${data.clicks > 0 ? ((data.totalLeads / data.clicks) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="funnel-step">
          <div class="funnel-box" style="width: 250px;">
            <div class="number">${data.totalLeads.toLocaleString()}</div>
            <div class="label">LEADS</div>
          </div>
          <div style="font-size: 10px; color: #666;">↓ ${data.totalLeads > 0 ? ((data.conversions / data.totalLeads) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="funnel-step">
          <div class="funnel-box" style="width: 200px;">
            <div class="number">${data.conversions.toLocaleString()}</div>
            <div class="label">CONVERSIONS</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Page 5-9: Placeholder pages for other sections -->
  <div class="page">
    <div class="section">
      <div class="section-title">5. PHÂN TÍCH CHI TIẾT THEO KÊNH</div>
      <p style="text-align: center; color: #666; padding: 50px;">Chi tiết phân tích theo kênh quảng cáo sẽ được cập nhật trong phiên bản tiếp theo.</p>
    </div>
  </div>

  <div class="page">
    <div class="section">
      <div class="section-title">6. PHÂN TÍCH THEO DỊCH VỤ</div>
      <p style="text-align: center; color: #666; padding: 50px;">Chi tiết phân tích theo dịch vụ sẽ được cập nhật trong phiên bản tiếp theo.</p>
    </div>
  </div>

  <div class="page">
    <div class="section">
      <div class="section-title">7. CUSTOMER INSIGHTS</div>
      <p style="text-align: center; color: #666; padding: 50px;">Chi tiết Customer Insights sẽ được cập nhật trong phiên bản tiếp theo.</p>
    </div>
  </div>

  <div class="page">
    <div class="section">
      <div class="section-title">8. PHÂN TÍCH CẠNH TRANH</div>
      <p style="text-align: center; color: #666; padding: 50px;">Chi tiết phân tích cạnh tranh sẽ được cập nhật trong phiên bản tiếp theo.</p>
    </div>
  </div>

  <div class="page">
    <div class="section">
      <div class="section-title">9. HÀNH ĐỘNG TIẾP THEO</div>
      <p style="text-align: center; color: #666; padding: 50px;">Danh sách hành động sẽ được cập nhật trong phiên bản tiếp theo.</p>
    </div>
  </div>

  <!-- Page 10: Forecast & Approval -->
  <div class="page">
    <div class="section">
      <div class="section-title">10. DỰ BÁO & PHÊ DUYỆT</div>

      <div class="highlight-box success">
        <h4>📊 KẾT QUẢ THÁNG ${monthLabel.toUpperCase()}</h4>
        <ul>
          <li>Tổng chi tiêu: ${formatCurrencyVND(data.totalSpend)}</li>
          <li>Tổng leads: ${data.totalLeads}</li>
          <li>ROI: ${data.roi}x</li>
        </ul>
      </div>

      <div style="margin-top: 30px; border: 2px dashed #ccc; border-radius: 8px; padding: 20px;">
        <h4 style="margin-bottom: 15px;">✅ HẠNG MỤC CẦN PHÊ DUYỆT</h4>
        <div style="margin-bottom: 15px;">
          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #666; border-radius: 3px; margin-right: 10px; vertical-align: middle;"></span>
          Phê duyệt kết quả tháng ${monthLabel}
        </div>
        <div style="margin-bottom: 15px;">
          <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #666; border-radius: 3px; margin-right: 10px; vertical-align: middle;"></span>
          Phê duyệt ngân sách tháng tiếp theo
        </div>

        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <div>
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Người lập báo cáo</div>
            <div style="border-bottom: 1px solid #333; padding-bottom: 5px;">Marketing Manager</div>
            <div style="font-size: 10px; color: #666; margin-top: 5px;">Ngày: ___/___/______</div>
          </div>
          <div>
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Phê duyệt</div>
            <div style="border-bottom: 1px solid #333; padding-bottom: 5px;">Ban Giám đốc</div>
            <div style="font-size: 10px; color: #666; margin-top: 5px;">Ngày: ___/___/______</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Greenfield Dental - Báo cáo Quảng cáo ${monthLabel}</p>
      <p>Tài liệu này chỉ dành cho nội bộ. Vui lòng không chia sẻ ra ngoài.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month } = generateRequestSchema.parse(body);

    // Fetch report data
    const reportData = await fetchReportData(month);

    // Generate HTML
    const html = generateReportHTML(reportData);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await browser.close();

    // Return PDF
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Bao-cao-Quang-cao-${month}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error generating report PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
