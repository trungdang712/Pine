"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Type,
  Image,
  FileText,
  Download,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

const brandColors = [
  {
    name: "Primary",
    hex: "#0D9488",
    rgb: "13, 148, 136",
    usage: "Logo, CTAs, links, primary buttons",
  },
  {
    name: "Secondary",
    hex: "#115E59",
    rgb: "17, 94, 89",
    usage: "Headers, navigation, hover states",
  },
  {
    name: "Accent",
    hex: "#F59E0B",
    rgb: "245, 158, 11",
    usage: "Highlights, warnings, promotions",
  },
  {
    name: "Neutral",
    hex: "#1F2937",
    rgb: "31, 41, 55",
    usage: "Body text, headings",
  },
];

const logos = [
  { name: "Logo Primary", format: "SVG, PNG, PDF", variant: "Full color" },
  { name: "Logo White", format: "SVG, PNG, PDF", variant: "White version" },
  { name: "Logo Dark", format: "SVG, PNG, PDF", variant: "Dark version" },
  { name: "Icon Only", format: "SVG, PNG, ICO", variant: "Symbol only" },
  { name: "Horizontal", format: "SVG, PNG, PDF", variant: "Wide layout" },
  { name: "Vertical", format: "SVG, PNG, PDF", variant: "Stacked layout" },
];

const typography = [
  {
    name: "Inter",
    weights: ["Regular", "Medium", "Semibold", "Bold"],
    usage: "Headings, UI elements",
    sample: "Nha khoa Dental Care",
  },
  {
    name: "Open Sans",
    weights: ["Regular", "Medium", "Semibold"],
    usage: "Body text, paragraphs",
    sample: "Chăm sóc răng miệng chuyên nghiệp",
  },
];

const guidelines = [
  {
    name: "Brand Book 2024",
    description: "Tài liệu hướng dẫn sử dụng thương hiệu đầy đủ",
    size: "12.5 MB",
    format: "PDF",
  },
  {
    name: "Voice & Tone Guide",
    description: "Hướng dẫn giọng điệu và cách viết content",
    size: "2.3 MB",
    format: "PDF",
  },
  {
    name: "Logo Usage Guidelines",
    description: "Quy định sử dụng logo đúng cách",
    size: "4.1 MB",
    format: "PDF",
  },
  {
    name: "Social Media Templates",
    description: "Template cho các nền tảng social media",
    size: "45 MB",
    format: "ZIP",
  },
];

export default function BrandLibraryPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Brand Library</h1>
        <p className="text-muted-foreground">
          Brand guidelines, colors, logos và typography chính thức
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="logos">
            <Image className="h-4 w-4 mr-2" />
            Logos
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="guidelines">
            <FileText className="h-4 w-4 mr-2" />
            Guidelines
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {brandColors.map((color) => (
                  <div key={color.name} className="flex gap-4">
                    <div
                      className="w-24 h-24 rounded-lg shadow-md flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{color.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-12">HEX:</span>
                          <code className="bg-muted px-2 py-0.5 rounded">
                            {color.hex}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(color.hex, color.name + "-hex")}
                          >
                            {copiedColor === color.name + "-hex" ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-12">RGB:</span>
                          <code className="bg-muted px-2 py-0.5 rounded">
                            {color.rgb}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(color.rgb, color.name + "-rgb")}
                          >
                            {copiedColor === color.name + "-rgb" ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {color.usage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color Palette Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex rounded-lg overflow-hidden shadow-md">
                {brandColors.map((color) => (
                  <div
                    key={color.name}
                    className="flex-1 h-20 flex items-end justify-center pb-2"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="text-white text-xs font-medium drop-shadow">
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logos Tab */}
        <TabsContent value="logos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {logos.map((logo) => (
                  <Card key={logo.name} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <div className="text-4xl font-bold text-primary">DC</div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{logo.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {logo.variant}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {logo.format}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logo Usage Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Logo Usage Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✓ Do</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Sử dụng logo với clear space tối thiểu</li>
                    <li>• Giữ nguyên tỷ lệ khi scale</li>
                    <li>• Sử dụng trên nền phù hợp</li>
                    <li>• Download từ brand library</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">✗ Don't</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Thay đổi màu sắc logo</li>
                    <li>• Xoay hoặc nghiêng logo</li>
                    <li>• Thêm hiệu ứng (shadow, glow)</li>
                    <li>• Đặt trên nền busy/phức tạp</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Fonts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {typography.map((font) => (
                  <div key={font.name} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">{font.name}</h4>
                        <p className="text-sm text-muted-foreground">{font.usage}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Google Fonts
                      </Button>
                    </div>
                    <div className="p-6 rounded-lg bg-muted">
                      <p
                        className="text-3xl mb-4"
                        style={{ fontFamily: font.name }}
                      >
                        {font.sample}
                      </p>
                      <p
                        className="text-sm"
                        style={{ fontFamily: font.name }}
                      >
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        <br />
                        abcdefghijklmnopqrstuvwxyz
                        <br />
                        0123456789 !@#$%^&*()
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {font.weights.map((weight) => (
                        <Badge key={weight} variant="secondary">
                          {weight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography Scale */}
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="w-20 text-sm text-muted-foreground">H1 / 36px</span>
                  <span className="text-4xl font-bold">Heading One</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-20 text-sm text-muted-foreground">H2 / 30px</span>
                  <span className="text-3xl font-bold">Heading Two</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-20 text-sm text-muted-foreground">H3 / 24px</span>
                  <span className="text-2xl font-semibold">Heading Three</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-20 text-sm text-muted-foreground">H4 / 20px</span>
                  <span className="text-xl font-semibold">Heading Four</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-20 text-sm text-muted-foreground">Body / 16px</span>
                  <span className="text-base">Body text paragraph</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="w-20 text-sm text-muted-foreground">Small / 14px</span>
                  <span className="text-sm">Small text, captions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Guidelines Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guidelines.map((doc) => (
                  <div
                    key={doc.name}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-red-100">
                        <FileText className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {doc.format}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {doc.size}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
