"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  FileText,
  Image,
  Video,
  Palette,
  Upload,
  Copy,
  Check,
  BookOpen,
  Folder,
  File,
  Sparkles,
} from "lucide-react";

export default function BrandLibraryPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Brand Guidelines Data
  const brandColors = {
    primary: [
      { name: "Teal", hex: "#0D9488", rgb: "13, 148, 136", usage: "Primary brand color, CTAs, headers" },
      { name: "Teal Dark", hex: "#0F766E", rgb: "15, 118, 110", usage: "Hover states, emphasis" },
      { name: "Teal Light", hex: "#14B8A6", rgb: "20, 184, 166", usage: "Backgrounds, subtle accents" },
    ],
    secondary: [
      { name: "Gold", hex: "#F59E0B", rgb: "245, 158, 11", usage: "Accent color, highlights, promotions" },
      { name: "Gray", hex: "#6B7280", rgb: "107, 114, 128", usage: "Text, borders, neutral elements" },
      { name: "White", hex: "#FFFFFF", rgb: "255, 255, 255", usage: "Backgrounds, negative space" },
    ],
  };

  const brandLogos = [
    {
      name: "Primary Logo",
      format: ["PNG", "SVG", "AI"],
      size: "2048x2048",
      usage: "Main logo for all digital and print materials",
      variants: 4,
    },
    {
      name: "White Version",
      format: ["PNG", "SVG"],
      size: "2048x2048",
      usage: "Dark backgrounds, photos, video overlays",
      variants: 2,
    },
    {
      name: "Icon Only",
      format: ["PNG", "SVG", "ICO"],
      size: "512x512",
      usage: "Social media avatars, favicons, app icons",
      variants: 3,
    },
    {
      name: "Horizontal Layout",
      format: ["PNG", "SVG"],
      size: "2048x512",
      usage: "Website headers, email signatures, letterheads",
      variants: 2,
    },
  ];

  const brandTypography = [
    {
      name: "Inter",
      type: "Primary Font",
      weights: ["Regular", "Medium", "SemiBold", "Bold"],
      usage: "Headings, UI elements, body text",
      fileFormat: "TTF, WOFF, WOFF2",
    },
    {
      name: "Playfair Display",
      type: "Display Font",
      weights: ["Regular", "Bold"],
      usage: "Hero headings, elegant titles",
      fileFormat: "TTF, WOFF",
    },
  ];

  const brandGuidelines = [
    {
      name: "Brand Book 2024",
      type: "PDF",
      size: "5.2 MB",
      date: "Jan 2024",
      pages: 45,
      description: "Complete brand identity guidelines including logo usage, color palette, typography",
    },
    {
      name: "Voice & Tone Guide",
      type: "PDF",
      size: "1.8 MB",
      date: "Jan 2024",
      pages: 12,
      description: "Writing style, messaging guidelines, patient communication standards",
    },
    {
      name: "Logo Usage Guidelines",
      type: "PDF",
      size: "2.5 MB",
      date: "Jan 2024",
      pages: 8,
      description: "Proper logo placement, clear space, dos and don'ts",
    },
    {
      name: "Font Package",
      type: "ZIP",
      size: "12.5 MB",
      date: "Jan 2024",
      pages: null,
      description: "All brand fonts in multiple formats (TTF, WOFF, WOFF2)",
    },
  ];

  // Media Assets Data
  const mediaAssets = {
    photos: [
      {
        name: "Clinic Exterior",
        count: 15,
        type: "High-res JPG",
        size: "125 MB",
        lastUpdated: "Dec 2024",
        description: "Building exterior, entrance, parking area",
      },
      {
        name: "Team Photos",
        count: 25,
        type: "High-res JPG",
        size: "310 MB",
        lastUpdated: "Dec 2024",
        description: "Doctors, nurses, staff portraits and team shots",
      },
      {
        name: "Equipment & Technology",
        count: 18,
        type: "High-res JPG",
        size: "220 MB",
        lastUpdated: "Nov 2024",
        description: "Dental chairs, X-ray machines, sterilization equipment",
      },
      {
        name: "Treatment Rooms",
        count: 12,
        type: "High-res JPG",
        size: "180 MB",
        lastUpdated: "Dec 2024",
        description: "Interior shots of treatment rooms, waiting area, reception",
      },
      {
        name: "Before & After",
        count: 35,
        type: "High-res JPG",
        size: "290 MB",
        lastUpdated: "Jan 2025",
        description: "Patient treatment results (with consent)",
      },
      {
        name: "Stock Medical",
        count: 50,
        type: "High-res JPG",
        size: "420 MB",
        lastUpdated: "Oct 2024",
        description: "Licensed stock photos for social media and marketing",
      },
    ],
    videos: [
      {
        name: "Clinic Tour",
        duration: "2:30",
        format: "MP4",
        size: "450 MB",
        resolution: "4K",
        description: "Complete walkthrough of clinic facilities",
      },
      {
        name: "Patient Testimonials",
        duration: "Various",
        format: "MP4",
        size: "1.2 GB",
        resolution: "1080p",
        description: "12 patient success stories and reviews",
      },
      {
        name: "Procedure Demonstrations",
        duration: "1-3 min each",
        format: "MP4",
        size: "850 MB",
        resolution: "1080p",
        description: "Educational videos showing various dental procedures",
      },
      {
        name: "Social Media Clips",
        duration: "15-60 sec",
        format: "MP4",
        size: "320 MB",
        resolution: "1080p",
        description: "Short-form content for Instagram, TikTok, Facebook",
      },
    ],
    templates: [
      {
        name: "Facebook Post Template",
        type: "PSD",
        size: "45 MB",
        updated: "Jan 2025",
        description: "1200x1200px with brand elements and smart objects",
      },
      {
        name: "Instagram Stories Template",
        type: "PSD",
        size: "38 MB",
        updated: "Jan 2025",
        description: "1080x1920px with swipeable layouts",
      },
      {
        name: "Zalo Post Template",
        type: "PSD",
        size: "32 MB",
        updated: "Dec 2024",
        description: "Vietnamese social media optimized",
      },
      {
        name: "Email Newsletter",
        type: "HTML",
        size: "2.5 MB",
        updated: "Dec 2024",
        description: "Responsive HTML email template",
      },
      {
        name: "Presentation Deck",
        type: "PPTX",
        size: "12 MB",
        updated: "Jan 2025",
        description: "Corporate presentation with 30 slide layouts",
      },
      {
        name: "Brochure Template",
        type: "AI",
        size: "28 MB",
        updated: "Nov 2024",
        description: "Tri-fold brochure print-ready",
      },
      {
        name: "Business Card",
        type: "AI",
        size: "8 MB",
        updated: "Jan 2024",
        description: "Standard business card with staff template",
      },
      {
        name: "Flyer Template",
        type: "PSD",
        size: "55 MB",
        updated: "Dec 2024",
        description: "A4 promotional flyer with editable layers",
      },
    ],
    documents: [
      {
        name: "Marketing Plan 2025",
        type: "PPTX",
        size: "8.5 MB",
        updated: "Jan 2025",
        description: "Annual marketing strategy and campaigns",
      },
      {
        name: "Content Calendar Q1",
        type: "XLSX",
        size: "1.2 MB",
        updated: "Jan 2025",
        description: "Social media content plan for Q1 2025",
      },
      {
        name: "Campaign Reports",
        type: "PDF",
        size: "15 MB",
        updated: "Dec 2024",
        description: "Performance reports for all 2024 campaigns",
      },
      {
        name: "Patient Journey Map",
        type: "PDF",
        size: "3.8 MB",
        updated: "Nov 2024",
        description: "Customer experience mapping document",
      },
    ],
  };

  const recentAssets = [
    { name: "Primary Logo", type: "Brand", category: "Logo", format: "SVG", icon: "🎨" },
    { name: "FB Post Template", type: "Media", category: "Template", format: "PSD", icon: "📐" },
    { name: "Clinic Exterior", type: "Media", category: "Photo", format: "JPG", icon: "📸" },
    { name: "Brand Book 2024", type: "Brand", category: "Guide", format: "PDF", icon: "📘" },
  ];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Library</h1>
        <p className="text-muted-foreground">
          Greenfield Dental brand guidelines va media assets
        </p>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList>
          <TabsTrigger value="brand">
            <Sparkles className="w-4 h-4 mr-2" />
            Brand Guidelines
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Folder className="w-4 h-4 mr-2" />
            Media Assets
          </TabsTrigger>
        </TabsList>

        {/* Brand Guidelines Tab */}
        <TabsContent value="brand" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Brand Guidelines</h2>
              <p className="text-sm text-muted-foreground">
                Logo, mau sac, typography va brand standards
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Tim kiem..." className="w-64" />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Recently Used */}
          <div>
            <h3 className="font-semibold mb-3">Recently Used</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentAssets.map((asset, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-4xl">{asset.icon}</span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{asset.name}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{asset.category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {asset.format}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Brand Colors
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy All Codes
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">PRIMARY COLORS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {brandColors.primary.map((color, index) => (
                    <Card key={index} className="overflow-hidden border-2">
                      <div className="h-24" style={{ backgroundColor: color.hex }} />
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">{color.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{color.usage}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">HEX</span>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono font-semibold">{color.hex}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopyColor(color.hex)}
                              >
                                {copiedColor === color.hex ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">RGB</span>
                            <code className="text-xs font-mono">{color.rgb}</code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">SECONDARY COLORS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {brandColors.secondary.map((color, index) => (
                    <Card key={index} className="overflow-hidden border-2">
                      <div className="h-24 border-b" style={{ backgroundColor: color.hex }} />
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">{color.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{color.usage}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">HEX</span>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono font-semibold">{color.hex}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopyColor(color.hex)}
                              >
                                {copiedColor === color.hex ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">RGB</span>
                            <code className="text-xs font-mono">{color.rgb}</code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">🎨</span>
                LOGO SUITE
              </h3>
              <Button variant="ghost" size="sm">
                Download All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brandLogos.map((logo, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-white border-2 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
                          <span className="text-white font-bold text-sm">GF</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{logo.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{logo.usage}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {logo.size}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {logo.variants} variants
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          {logo.format.map((fmt) => (
                            <Badge key={fmt} variant="secondary" className="text-xs">
                              {fmt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Typography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brandTypography.map((font, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="text-2xl font-semibold mb-1" style={{ fontFamily: font.name }}>
                          {font.name}
                        </h3>
                        <Badge variant="secondary">{font.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{font.usage}</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Weights Available</p>
                          <div className="flex flex-wrap gap-1">
                            {font.weights.map((weight) => (
                              <Badge key={weight} variant="outline" className="text-xs">
                                {weight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Formats</p>
                          <p className="text-xs">{font.fileFormat}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        <Download className="w-4 h-4 mr-2" />
                        Download Font Files
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Brand Guidelines Documents */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">📘</span>
                BRAND GUIDELINES & DOCUMENTATION
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brandGuidelines.map((guide, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{guide.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{guide.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {guide.type}
                          </Badge>
                          <span>{guide.size}</span>
                          {guide.pages && <span>• {guide.pages} pages</span>}
                          <span>• {guide.date}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Media Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Media Assets</h2>
              <p className="text-sm text-muted-foreground">
                Photos, videos, templates va documents cho marketing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Tim kiem..." className="w-64" />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Assets
              </Button>
            </div>
          </div>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">📸</span>
                PHOTOGRAPHY
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mediaAssets.photos.map((photo, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3">
                      <Image className="w-12 h-12 text-gray-500" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{photo.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{photo.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-medium text-primary">{photo.count} images</span>
                      <span>{photo.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {photo.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{photo.lastUpdated}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">🎥</span>
                VIDEO CONTENT
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaAssets.videos.map((video, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{video.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{video.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="secondary">{video.format}</Badge>
                          <Badge variant="outline">{video.resolution}</Badge>
                          <span className="text-muted-foreground">{video.duration}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{video.size}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">📐</span>
                DESIGN TEMPLATES
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaAssets.templates.map((template, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center mb-3">
                      <Palette className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <Badge variant="secondary">{template.type}</Badge>
                      <span className="text-muted-foreground">{template.size}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Updated: {template.updated}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">📄</span>
                DOCUMENTS & REPORTS
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaAssets.documents.map((doc, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <File className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {doc.type}
                          </Badge>
                          <span>{doc.size}</span>
                          <span>• {doc.updated}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
