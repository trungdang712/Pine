"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  Target,
  MousePointer,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  X,
  ExternalLink,
  Download,
  Edit,
  Users,
  Activity,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function LandingPagesPage() {
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [selectedABTest, setSelectedABTest] = useState<number | null>(null);

  // Landing Pages Data
  const landingPages = [
    {
      id: 1,
      name: "Nieng Rang Invisalign - Nu Cuoi Hoan Hao",
      url: "greenfielddental.vn/nieng-rang-invisalign",
      status: "active",
      visitors: 12543,
      conversions: 287,
      conversionRate: 2.29,
      avgTimeOnPage: "3:42",
      bounceRate: 42.3,
      pageLoadTime: 2.3,
      mobileConversionRate: 2.8,
      desktopConversionRate: 1.9,
      targetMarket: {
        primaryAge: "25-40 tuoi",
        segment: "Chuyen gia tre, Doanh nhan",
        income: "20-50 trieu/thang",
        location: "TP.HCM, Ha Noi",
      },
      services: ["Nieng rang Invisalign", "Tu van chinh nha", "3D Simulation"],
      performance: "excellent",
      trend: 12.5,
      trafficSources: [
        { source: "Organic Search", percentage: 45, visitors: 5644, conversions: 142 },
        { source: "Paid Ads", percentage: 30, visitors: 3763, conversions: 120 },
        { source: "Social Media", percentage: 15, visitors: 1881, conversions: 18 },
        { source: "Direct", percentage: 7, visitors: 878, conversions: 5 },
        { source: "Referral", percentage: 3, visitors: 377, conversions: 2 },
      ],
      deviceSplit: [
        { device: "Mobile", percentage: 62, conversions: 178 },
        { device: "Desktop", percentage: 28, conversions: 80 },
        { device: "Tablet", percentage: 10, conversions: 29 },
      ],
      conversionFunnel: [
        { stage: "Page View", visitors: 12543, percentage: 100 },
        { stage: "Scroll 50%", visitors: 9832, percentage: 78 },
        { stage: "Click CTA", visitors: 3765, percentage: 30 },
        { stage: "Form Start", visitors: 1245, percentage: 10 },
        { stage: "Form Submit", visitors: 287, percentage: 2.3 },
      ],
      scrollDepth: [
        { depth: "0-25%", percentage: 100 },
        { depth: "25-50%", percentage: 78 },
        { depth: "50-75%", percentage: 65 },
        { depth: "75-100%", percentage: 42 },
      ],
      exitPoints: [
        { section: "Header", percentage: 12 },
        { section: "Service Description", percentage: 23 },
        { section: "Pricing", percentage: 35 },
        { section: "Form", percentage: 18 },
        { section: "Footer", percentage: 12 },
      ],
      formAnalytics: {
        fields: [
          { name: "Name", completionRate: 95 },
          { name: "Phone", completionRate: 92 },
          { name: "Email", completionRate: 87 },
          { name: "Service", completionRate: 82 },
          { name: "Message", completionRate: 35 },
        ],
        avgCompletionTime: "2m 34s",
        abandonmentPoint: "Message field",
      },
      heatmapData: {
        clicks: [
          { element: "CTA Button - Book Now", clicks: 2456, x: 50, y: 30 },
          { element: "Phone Number", clicks: 1234, x: 80, y: 15 },
          { element: "Service Cards", clicks: 987, x: 50, y: 45 },
          { element: "Before/After Gallery", clicks: 1876, x: 50, y: 60 },
          { element: "Testimonials", clicks: 654, x: 50, y: 75 },
        ],
        scrollReach: {
          "0-25%": 100,
          "25-50%": 78,
          "50-75%": 65,
          "75-100%": 42,
        },
      },
      pageSpeed: {
        loadTime: 2.3,
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 2.1,
        timeToInteractive: 2.8,
        mobileScore: 78,
        desktopScore: 92,
      },
      seoPerformance: {
        organicKeywords: 145,
        topKeywords: [
          { keyword: "nieng rang invisalign", position: 3, volume: 2400 },
          { keyword: "nieng rang trong suot", position: 5, volume: 1800 },
          { keyword: "nha khoa invisalign", position: 7, volume: 1200 },
        ],
        serpPosition: 4.2,
      },
      gaIntegration: {
        sessionDuration: "4:23",
        pagesPerSession: 1.8,
        newVsReturning: { new: 78, returning: 22 },
        goalCompletions: 287,
        goalValue: 143500000,
      },
      abTests: [
        {
          id: 1,
          name: "CTA Button Text",
          status: "active",
          startDate: "Jan 15, 2025",
          variants: [
            { name: "Control", cta: "Dat lich ngay", visitors: 6250, conversions: 131, cvr: 2.1 },
            { name: "Variant A", cta: "Tu van mien phi", visitors: 6293, conversions: 156, cvr: 2.5 },
          ],
          winner: "Variant A",
          improvement: 19,
          confidence: 95,
        },
      ],
      recommendations: [
        {
          type: "warning",
          title: "High exit rate at Pricing section (35%)",
          description: "Users are leaving when they see pricing. Consider emphasizing value proposition or offering payment plans.",
          impact: "high",
          action: "Add 'Flexible Payment' badge + Success stories",
        },
        {
          type: "positive",
          title: "Mobile conversion 47% higher than desktop",
          description: "Mobile experience is performing exceptionally well. Consider increasing mobile ad spend.",
          impact: "medium",
          action: "Allocate 70% budget to mobile campaigns",
        },
        {
          type: "info",
          title: "Form 'Message' field has low completion (35%)",
          description: "Users are abandoning the form at the message field. Consider making it optional.",
          impact: "medium",
          action: "Change Message field to optional",
        },
        {
          type: "positive",
          title: "Paid Ads traffic has highest CVR (3.2%)",
          description: "Paid traffic is converting better than organic. Ad targeting is effective.",
          impact: "low",
          action: "Maintain current ad strategy",
        },
      ],
    },
    {
      id: 2,
      name: "Cay Ghep Implant - Rang Moi Vinh Vien",
      url: "greenfielddental.vn/cay-ghep-implant",
      status: "active",
      visitors: 8921,
      conversions: 156,
      conversionRate: 1.75,
      avgTimeOnPage: "4:15",
      bounceRate: 38.7,
      pageLoadTime: 2.8,
      mobileConversionRate: 1.6,
      desktopConversionRate: 1.9,
      targetMarket: {
        primaryAge: "45-65 tuoi",
        segment: "Nguoi trung nien, Cao tuoi",
        income: "25-60 trieu/thang",
        location: "TP.HCM, Binh Duong, Dong Nai",
      },
      services: ["Implant Straumann", "Phuc hoi toan ham", "CT 3D Scan"],
      performance: "good",
      trend: 8.3,
      trafficSources: [
        { source: "Organic Search", percentage: 52, visitors: 4639, conversions: 93 },
        { source: "Paid Ads", percentage: 28, visitors: 2498, conversions: 48 },
        { source: "Social Media", percentage: 12, visitors: 1070, conversions: 10 },
        { source: "Direct", percentage: 6, visitors: 535, conversions: 4 },
        { source: "Referral", percentage: 2, visitors: 179, conversions: 1 },
      ],
      deviceSplit: [
        { device: "Mobile", percentage: 58, conversions: 90 },
        { device: "Desktop", percentage: 32, conversions: 50 },
        { device: "Tablet", percentage: 10, conversions: 16 },
      ],
      conversionFunnel: [
        { stage: "Page View", visitors: 8921, percentage: 100 },
        { stage: "Scroll 50%", visitors: 7137, percentage: 80 },
        { stage: "Click CTA", visitors: 2676, percentage: 30 },
        { stage: "Form Start", visitors: 892, percentage: 10 },
        { stage: "Form Submit", visitors: 156, percentage: 1.75 },
      ],
      scrollDepth: [
        { depth: "0-25%", percentage: 100 },
        { depth: "25-50%", percentage: 80 },
        { depth: "50-75%", percentage: 68 },
        { depth: "75-100%", percentage: 45 },
      ],
      exitPoints: [
        { section: "Header", percentage: 15 },
        { section: "Service Description", percentage: 20 },
        { section: "Pricing", percentage: 32 },
        { section: "Form", percentage: 20 },
        { section: "Footer", percentage: 13 },
      ],
      formAnalytics: {
        fields: [
          { name: "Name", completionRate: 94 },
          { name: "Phone", completionRate: 90 },
          { name: "Email", completionRate: 85 },
          { name: "Service", completionRate: 78 },
          { name: "Message", completionRate: 32 },
        ],
        avgCompletionTime: "3m 12s",
        abandonmentPoint: "Message field",
      },
      heatmapData: {
        clicks: [
          { element: "CTA Button - Consultation", clicks: 1876, x: 50, y: 35 },
          { element: "Phone Number", clicks: 1456, x: 80, y: 15 },
          { element: "Service Details", clicks: 876, x: 50, y: 50 },
          { element: "Before/After Images", clicks: 1234, x: 50, y: 65 },
          { element: "Price Calculator", clicks: 987, x: 50, y: 80 },
        ],
        scrollReach: {
          "0-25%": 100,
          "25-50%": 80,
          "50-75%": 68,
          "75-100%": 45,
        },
      },
      pageSpeed: {
        loadTime: 2.8,
        firstContentfulPaint: 1.5,
        largestContentfulPaint: 2.4,
        timeToInteractive: 3.2,
        mobileScore: 72,
        desktopScore: 88,
      },
      seoPerformance: {
        organicKeywords: 128,
        topKeywords: [
          { keyword: "cay ghep implant", position: 2, volume: 3200 },
          { keyword: "implant rang", position: 4, volume: 2800 },
          { keyword: "nha khoa implant", position: 6, volume: 1600 },
        ],
        serpPosition: 3.8,
      },
      gaIntegration: {
        sessionDuration: "5:08",
        pagesPerSession: 2.1,
        newVsReturning: { new: 72, returning: 28 },
        goalCompletions: 156,
        goalValue: 93600000,
      },
      abTests: [
        {
          id: 2,
          name: "Hero Image",
          status: "completed",
          startDate: "Dec 10, 2024",
          variants: [
            { name: "Control", cta: "Clinic Interior", visitors: 4460, conversions: 71, cvr: 1.59 },
            { name: "Variant A", cta: "Happy Patient", visitors: 4461, conversions: 85, cvr: 1.90 },
          ],
          winner: "Variant A",
          improvement: 19.5,
          confidence: 98,
        },
      ],
      recommendations: [
        {
          type: "warning",
          title: "Page load time slightly high (2.8s)",
          description: "Mobile score is 72/100. Optimize images and reduce script size to improve load time.",
          impact: "high",
          action: "Compress images, lazy load below-fold content",
        },
        {
          type: "info",
          title: "Desktop converts better than mobile",
          description: "Unlike other pages, desktop CVR (1.9%) is higher than mobile (1.6%). Review mobile UX.",
          impact: "medium",
          action: "Conduct mobile usability testing",
        },
        {
          type: "positive",
          title: "High scroll depth (45% reach bottom)",
          description: "Users are engaging with full content. Content quality is excellent.",
          impact: "low",
          action: "Continue current content strategy",
        },
      ],
    },
    {
      id: 3,
      name: "Nha Khoa Gia Dinh - Cham Soc Toan Dien",
      url: "greenfielddental.vn/nha-khoa-gia-dinh",
      status: "active",
      visitors: 15234,
      conversions: 428,
      conversionRate: 2.81,
      avgTimeOnPage: "2:58",
      bounceRate: 35.2,
      pageLoadTime: 1.9,
      mobileConversionRate: 3.1,
      desktopConversionRate: 2.4,
      targetMarket: {
        primaryAge: "28-42 tuoi",
        segment: "Gia dinh tre, Phu huynh",
        income: "15-40 trieu/thang",
        location: "TP.HCM va vung phu can",
      },
      services: ["Kham tong quat", "Nha khoa tre em", "Dieu tri du phong", "Goi gia dinh"],
      performance: "excellent",
      trend: 15.7,
      trafficSources: [
        { source: "Organic Search", percentage: 48, visitors: 7312, conversions: 219 },
        { source: "Paid Ads", percentage: 25, visitors: 3809, conversions: 122 },
        { source: "Social Media", percentage: 18, visitors: 2742, conversions: 66 },
        { source: "Direct", percentage: 7, visitors: 1066, conversions: 15 },
        { source: "Referral", percentage: 2, visitors: 305, conversions: 6 },
      ],
      deviceSplit: [
        { device: "Mobile", percentage: 68, conversions: 291 },
        { device: "Desktop", percentage: 24, conversions: 103 },
        { device: "Tablet", percentage: 8, conversions: 34 },
      ],
      conversionFunnel: [
        { stage: "Page View", visitors: 15234, percentage: 100 },
        { stage: "Scroll 50%", visitors: 12797, percentage: 84 },
        { stage: "Click CTA", visitors: 5341, percentage: 35 },
        { stage: "Form Start", visitors: 1676, percentage: 11 },
        { stage: "Form Submit", visitors: 428, percentage: 2.81 },
      ],
      scrollDepth: [
        { depth: "0-25%", percentage: 100 },
        { depth: "25-50%", percentage: 84 },
        { depth: "50-75%", percentage: 72 },
        { depth: "75-100%", percentage: 58 },
      ],
      exitPoints: [
        { section: "Header", percentage: 10 },
        { section: "Service Description", percentage: 18 },
        { section: "Pricing", percentage: 28 },
        { section: "Form", percentage: 22 },
        { section: "Footer", percentage: 22 },
      ],
      formAnalytics: {
        fields: [
          { name: "Name", completionRate: 96 },
          { name: "Phone", completionRate: 94 },
          { name: "Email", completionRate: 90 },
          { name: "Service", completionRate: 88 },
          { name: "Message", completionRate: 42 },
        ],
        avgCompletionTime: "2m 08s",
        abandonmentPoint: "Message field",
      },
      heatmapData: {
        clicks: [
          { element: "Book Appointment", clicks: 3456, x: 50, y: 25 },
          { element: "Family Package Info", clicks: 2345, x: 50, y: 40 },
          { element: "Kids Dental Section", clicks: 1987, x: 50, y: 55 },
          { element: "Pricing Table", clicks: 1654, x: 50, y: 70 },
          { element: "Contact Form", clicks: 1234, x: 50, y: 85 },
        ],
        scrollReach: {
          "0-25%": 100,
          "25-50%": 84,
          "50-75%": 72,
          "75-100%": 58,
        },
      },
      pageSpeed: {
        loadTime: 1.9,
        firstContentfulPaint: 0.9,
        largestContentfulPaint: 1.7,
        timeToInteractive: 2.1,
        mobileScore: 85,
        desktopScore: 95,
      },
      seoPerformance: {
        organicKeywords: 187,
        topKeywords: [
          { keyword: "nha khoa gia dinh", position: 1, volume: 4200 },
          { keyword: "nha khoa tre em", position: 2, volume: 3600 },
          { keyword: "kham rang gia dinh", position: 3, volume: 2400 },
        ],
        serpPosition: 2.1,
      },
      gaIntegration: {
        sessionDuration: "3:45",
        pagesPerSession: 1.9,
        newVsReturning: { new: 82, returning: 18 },
        goalCompletions: 428,
        goalValue: 171200000,
      },
      abTests: [
        {
          id: 3,
          name: "Family Package Pricing Display",
          status: "active",
          startDate: "Jan 20, 2025",
          variants: [
            { name: "Control", cta: "Monthly Price", visitors: 7600, conversions: 206, cvr: 2.71 },
            { name: "Variant A", cta: "Per Person Price", visitors: 7634, conversions: 222, cvr: 2.91 },
          ],
          winner: "Pending",
          improvement: 7.4,
          confidence: 82,
        },
      ],
      recommendations: [
        {
          type: "positive",
          title: "Excellent page speed (1.9s load time)",
          description: "Page loads fast on all devices. Mobile score 85/100 is above average.",
          impact: "low",
          action: "Maintain current optimization strategy",
        },
        {
          type: "positive",
          title: "Highest conversion rate (2.81%)",
          description: "This page outperforms all other landing pages. Use as template for new pages.",
          impact: "medium",
          action: "Analyze and replicate success factors",
        },
        {
          type: "info",
          title: "Strong mobile performance",
          description: "Mobile CVR (3.1%) is 29% higher than desktop. Mobile-first design is working.",
          impact: "low",
          action: "Share mobile UX best practices with team",
        },
      ],
    },
  ];

  const trafficTrendData = [
    { week: "W1", visitors: 8500, conversions: 165 },
    { week: "W2", visitors: 9200, conversions: 189 },
    { week: "W3", visitors: 11300, conversions: 245 },
    { week: "W4", visitors: 10800, conversions: 223 },
    { week: "W5", visitors: 12400, conversions: 287 },
    { week: "W6", visitors: 13900, conversions: 325 },
    { week: "W7", visitors: 15234, conversions: 378 },
  ];

  const deviceData = [
    { name: "Mobile", value: 62, color: "#0D9488" },
    { name: "Desktop", value: 28, color: "#F59E0B" },
    { name: "Tablet", value: 10, color: "#94A3B8" },
  ];

  const ageDistribution = [
    { age: "18-24", percentage: 12 },
    { age: "25-34", percentage: 38 },
    { age: "35-44", percentage: 28 },
    { age: "45-54", percentage: 15 },
    { age: "55+", percentage: 7 },
  ];

  const selectedPageData = landingPages.find((p) => p.id === selectedPage);

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "excellent":
        return <Badge className="bg-green-500 hover:bg-green-600">Xuat sac</Badge>;
      case "good":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Tot</Badge>;
      case "average":
        return <Badge variant="secondary">Trung binh</Badge>;
      default:
        return <Badge variant="outline">Can cai thien</Badge>;
    }
  };

  const renderPageDetailModal = () => {
    if (!selectedPageData) return null;

    const trafficSourcesData = selectedPageData.trafficSources.map((s, index) => ({
      name: s.source,
      value: s.percentage,
      color: ["#0D9488", "#F59E0B", "#8B5CF6", "#94A3B8", "#EF4444"][index],
    }));

    const deviceSplitData = selectedPageData.deviceSplit.map((d, index) => ({
      name: d.device,
      value: d.percentage,
      color: ["#0D9488", "#F59E0B", "#94A3B8"][index],
    }));

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-background rounded-lg shadow-2xl max-w-7xl w-full my-8">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPerformanceBadge(selectedPageData.performance)}
                  <Badge variant={selectedPageData.status === "active" ? "default" : "secondary"}>
                    {selectedPageData.status === "active" ? "Dang chay" : "Tam dung"}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm">
                    {selectedPageData.trend > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={selectedPageData.trend > 0 ? "text-green-500" : "text-red-500"}>
                      {Math.abs(selectedPageData.trend)}%
                    </span>
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedPageData.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="w-4 h-4" />
                  <span>{selectedPageData.url}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPage(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Visitors</p>
                  </div>
                  <p className="text-2xl font-bold">{selectedPageData.visitors.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <p className="text-2xl font-bold">{selectedPageData.conversions}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MousePointer className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">CVR</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{selectedPageData.conversionRate}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Bounce Rate</p>
                  </div>
                  <p className="text-2xl font-bold">{selectedPageData.bounceRate}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Target Market */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Target Market Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Primary Age</p>
                    <p className="font-semibold">{selectedPageData.targetMarket.primaryAge}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Segment</p>
                    <p className="font-semibold">{selectedPageData.targetMarket.segment}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Income</p>
                    <p className="font-semibold">{selectedPageData.targetMarket.income}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Location</p>
                    <p className="font-semibold">{selectedPageData.targetMarket.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedPageData.conversionFunnel.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-4">
                          <span>{stage.visitors.toLocaleString()} visitors</span>
                          <span className="font-bold text-primary">{stage.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                      {index < selectedPageData.conversionFunnel.length - 1 && (
                        <p className="text-xs text-red-600 text-right">
                          Drop-off:{" "}
                          {(
                            ((selectedPageData.conversionFunnel[index].visitors -
                              selectedPageData.conversionFunnel[index + 1].visitors) /
                              selectedPageData.conversionFunnel[index].visitors) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficSourcesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {trafficSourcesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedPageData.trafficSources.map((source, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: trafficSourcesData[i].color }} />
                          <span>{source.source}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-muted-foreground">{source.visitors.toLocaleString()} visitors</span>
                          <span className="font-semibold">{source.conversions} CVs</span>
                          <span className="font-semibold text-green-600">
                            {((source.conversions / source.visitors) * 100).toFixed(2)}% CVR
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Split */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceSplitData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {deviceSplitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedPageData.deviceSplit.map((device, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: deviceSplitData[i].color }} />
                          <span>{device.device}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-muted-foreground">{device.percentage}% traffic</span>
                          <span className="font-semibold">{device.conversions} CVs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-accent/50 rounded-lg text-sm">
                    <p>
                      <strong>Mobile CVR:</strong> {selectedPageData.mobileConversionRate}% |{" "}
                      <strong>Desktop CVR:</strong> {selectedPageData.desktopConversionRate}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scroll Depth & Exit Points */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scroll Depth Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPageData.scrollDepth.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.depth}</span>
                          <span className="font-semibold">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exit Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPageData.exitPoints.map((point, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{point.section}</span>
                          <span className={`font-semibold ${point.percentage > 30 ? "text-red-600" : ""}`}>
                            {point.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${point.percentage > 30 ? "bg-destructive" : "bg-orange-500"}`}
                            style={{ width: `${point.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Field Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {selectedPageData.formAnalytics.fields.map((field, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{field.name}</span>
                        <span
                          className={`font-semibold ${
                            field.completionRate < 50 ? "text-red-600" : field.completionRate < 80 ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          {field.completionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            field.completionRate < 50 ? "bg-destructive" : field.completionRate < 80 ? "bg-orange-500" : "bg-green-500"
                          }`}
                          style={{ width: `${field.completionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-accent/50 rounded-lg">
                  <div>
                    <p className="text-muted-foreground">Avg Completion Time</p>
                    <p className="font-semibold">{selectedPageData.formAnalytics.avgCompletionTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Main Abandonment Point</p>
                    <p className="font-semibold text-red-600">{selectedPageData.formAnalytics.abandonmentPoint}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Click Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Click Heatmap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPageData.heatmapData.clicks.map((click, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{click.element}</p>
                        <p className="text-xs text-muted-foreground">
                          Position: ({click.x}%, {click.y}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{click.clicks.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Page Speed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Page Speed Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Load Time</p>
                    <p className="text-xl font-bold">{selectedPageData.pageSpeed.loadTime}s</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">First Contentful Paint</p>
                    <p className="text-xl font-bold">{selectedPageData.pageSpeed.firstContentfulPaint}s</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time to Interactive</p>
                    <p className="text-xl font-bold">{selectedPageData.pageSpeed.timeToInteractive}s</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Mobile Score</p>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-primary">{selectedPageData.pageSpeed.mobileScore}</div>
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              selectedPageData.pageSpeed.mobileScore >= 90
                                ? "bg-green-500"
                                : selectedPageData.pageSpeed.mobileScore >= 70
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${selectedPageData.pageSpeed.mobileScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Desktop Score</p>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-primary">{selectedPageData.pageSpeed.desktopScore}</div>
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              selectedPageData.pageSpeed.desktopScore >= 90
                                ? "bg-green-500"
                                : selectedPageData.pageSpeed.desktopScore >= 70
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${selectedPageData.pageSpeed.desktopScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-accent/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Organic Keywords</p>
                      <p className="text-2xl font-bold">{selectedPageData.seoPerformance.organicKeywords}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg SERP Position</p>
                      <p className="text-2xl font-bold">{selectedPageData.seoPerformance.serpPosition}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm mb-2">Top Ranking Keywords:</p>
                  {selectedPageData.seoPerformance.topKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                      <span>{keyword.keyword}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{keyword.volume.toLocaleString()} volume</span>
                        <Badge variant="outline">#{keyword.position}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* GA Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Google Analytics Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Session Duration</p>
                    <p className="text-xl font-bold">{selectedPageData.gaIntegration.sessionDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pages/Session</p>
                    <p className="text-xl font-bold">{selectedPageData.gaIntegration.pagesPerSession}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Goal Completions</p>
                    <p className="text-xl font-bold">{selectedPageData.gaIntegration.goalCompletions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Goal Value</p>
                    <p className="text-xl font-bold">{(selectedPageData.gaIntegration.goalValue / 1000000).toFixed(1)}M VND</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">New vs Returning Visitors</p>
                    <div className="flex gap-2">
                      <div className="flex-1 p-2 bg-primary/10 rounded text-center">
                        <p className="text-2xl font-bold text-primary">{selectedPageData.gaIntegration.newVsReturning.new}%</p>
                        <p className="text-xs">New</p>
                      </div>
                      <div className="flex-1 p-2 bg-accent rounded text-center">
                        <p className="text-2xl font-bold">{selectedPageData.gaIntegration.newVsReturning.returning}%</p>
                        <p className="text-xs">Returning</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* A/B Tests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    A/B Tests
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    Create New Test
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedPageData.abTests.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedABTest(test.id)}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{test.name}</h4>
                            <Badge variant={test.status === "active" ? "default" : "secondary"}>
                              {test.status === "active" ? "Active" : "Completed"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Started: {test.startDate}</p>
                        </div>
                        <div className="text-right">
                          {test.winner !== "Pending" && (
                            <div>
                              <Badge className="bg-green-500">Winner: {test.winner}</Badge>
                              <p className="text-sm text-green-600 font-semibold mt-1">+{test.improvement}% improvement</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {test.variants.map((variant, i) => (
                          <div key={i} className={`p-3 border rounded ${test.winner === variant.name ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}`}>
                            <p className="font-semibold text-sm mb-2">{variant.name}</p>
                            <p className="text-xs text-muted-foreground mb-2">&quot;{variant.cta}&quot;</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Visitors</p>
                                <p className="font-semibold">{variant.visitors.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">CVs</p>
                                <p className="font-semibold">{variant.conversions}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">CVR</p>
                                <p className="font-semibold text-primary">{variant.cvr}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {test.confidence && (
                        <p className="text-sm text-muted-foreground mt-3">
                          Statistical confidence: <span className="font-semibold">{test.confidence}%</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPageData.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.type === "positive"
                          ? "border-l-green-500 bg-green-50 dark:bg-green-950"
                          : rec.type === "warning"
                          ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950"
                          : "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {rec.type === "positive" ? "+" : rec.type === "warning" ? "!" : "i"}
                          </span>
                          <p className="font-semibold">{rec.title}</p>
                        </div>
                        <Badge variant={rec.impact === "high" ? "destructive" : rec.impact === "medium" ? "secondary" : "outline"}>
                          {rec.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 ml-7">{rec.description}</p>
                      <div className="ml-7 bg-white/50 dark:bg-black/20 p-2 rounded text-sm">
                        <p className="font-medium mb-1">Action:</p>
                        <p className="text-muted-foreground">{rec.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Khoang thoi gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngay</SelectItem>
              <SelectItem value="30d">30 ngay</SelectItem>
              <SelectItem value="90d">90 ngay</SelectItem>
              <SelectItem value="custom">Tuy chinh</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trang thai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca</SelectItem>
              <SelectItem value="active">Dang chay</SelectItem>
              <SelectItem value="testing">Dang test</SelectItem>
              <SelectItem value="paused">Tam dung</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Tao Landing Page Moi
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Tong Visitors</p>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">43.2K</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground">vs thang truoc</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Tong Conversions</p>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">969</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">+18.3%</span>
              <span className="text-xs text-muted-foreground">vs thang truoc</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Conversion Rate TB</p>
              <MousePointer className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">2.24%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">+0.3%</span>
              <span className="text-xs text-muted-foreground">vs thang truoc</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Bounce Rate TB</p>
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">42.1%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">-3.2%</span>
              <span className="text-xs text-muted-foreground">vs thang truoc</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic & Conversion Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Xu Huong Traffic & Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="visitors" stroke="#0d9488" name="Visitors" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#f59e0b" name="Conversions" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phan Bo Thiet Bi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                    <span>{device.name}</span>
                  </div>
                  <span className="font-medium">{device.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phan Bo Do Tuoi Khach Hang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#0d9488" name="Ty le (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Landing Pages Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chi Tiet Landing Pages</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tim kiem landing page..." className="pl-10 w-[250px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {landingPages.map((page) => (
              <div
                key={page.id}
                className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedPage(page.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{page.name}</h3>
                      {getPerformanceBadge(page.performance)}
                      <Badge variant={page.status === "active" ? "default" : "secondary"}>
                        {page.status === "active" ? "Dang chay" : "Dang test"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <ExternalLink className="w-3 h-3" />
                      <span>{page.url}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      {page.trend > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={page.trend > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                        {Math.abs(page.trend)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Visitors</p>
                    <p className="text-lg font-semibold">{page.visitors.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Conversions</p>
                    <p className="text-lg font-semibold">{page.conversions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">CVR</p>
                    <p className="text-lg font-semibold text-green-600">{page.conversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bounce Rate</p>
                    <p className="text-lg font-semibold">{page.bounceRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg Time</p>
                    <p className="text-lg font-semibold">{page.avgTimeOnPage}</p>
                  </div>
                </div>

                {/* Target Market */}
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-xs font-semibold mb-2">Target Market:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Age:</span> <span className="font-medium">{page.targetMarket.primaryAge}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Segment:</span> <span className="font-medium">{page.targetMarket.segment}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Income:</span> <span className="font-medium">{page.targetMarket.income}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span> <span className="font-medium">{page.targetMarket.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Page Detail Modal */}
      {selectedPage && renderPageDetailModal()}
    </div>
  );
}
