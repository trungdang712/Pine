"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Image,
  FileText,
  Download,
  ArrowRight,
  Folder,
  Star,
  Clock,
} from "lucide-react";
import Link from "next/link";

const recentDownloads = [
  { name: "Logo Primary.svg", type: "logo", date: "2024-01-10" },
  { name: "Brand Colors.pdf", type: "guideline", date: "2024-01-09" },
  { name: "Clinic Photo 01.jpg", type: "photo", date: "2024-01-08" },
  { name: "Social Template.psd", type: "template", date: "2024-01-07" },
];

const popularAssets = [
  { name: "Facebook Post Template", downloads: 156, category: "Templates" },
  { name: "Clinic Interior Photos", downloads: 124, category: "Photos" },
  { name: "Brand Guidelines PDF", downloads: 98, category: "Guidelines" },
  { name: "Logo Package (All Formats)", downloads: 87, category: "Logos" },
];

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-muted-foreground">
          Quản lý brand assets và tài nguyên marketing
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/library/brand">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Brand Library</h3>
                  <p className="text-muted-foreground mb-4">
                    Brand colors, logos, typography và guidelines chính thức của phòng khám.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">4 màu chính</Badge>
                    <Badge variant="secondary">6 logo variants</Badge>
                    <Badge variant="secondary">2 fonts</Badge>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/library/assets">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Image className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Asset Library</h3>
                  <p className="text-muted-foreground mb-4">
                    Hình ảnh, video, templates và các tài nguyên cho content marketing.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">250+ photos</Badge>
                    <Badge variant="secondary">30+ videos</Badge>
                    <Badge variant="secondary">50+ templates</Badge>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Brand Elements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Image className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">330+</p>
              <p className="text-sm text-muted-foreground">Tổng Assets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-sm text-muted-foreground">Downloads tháng này</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Folder className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Downloads & Popular Assets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tải gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDownloads.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-background">
                      {item.type === "logo" && <Palette className="h-4 w-4" />}
                      {item.type === "photo" && <Image className="h-4 w-4" />}
                      {item.type === "guideline" && <FileText className="h-4 w-4" />}
                      {item.type === "template" && <Folder className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Phổ biến nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularAssets.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.downloads} downloads
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh mục Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/library/assets?category=photos">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
                <Image className="h-8 w-8 mb-2 text-blue-500" />
                <h4 className="font-medium">Photos</h4>
                <p className="text-sm text-muted-foreground">250+ hình ảnh</p>
              </div>
            </Link>
            <Link href="/library/assets?category=videos">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
                <FileText className="h-8 w-8 mb-2 text-purple-500" />
                <h4 className="font-medium">Videos</h4>
                <p className="text-sm text-muted-foreground">30+ video clips</p>
              </div>
            </Link>
            <Link href="/library/assets?category=templates">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
                <Folder className="h-8 w-8 mb-2 text-orange-500" />
                <h4 className="font-medium">Templates</h4>
                <p className="text-sm text-muted-foreground">50+ templates</p>
              </div>
            </Link>
            <Link href="/library/brand">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
                <Palette className="h-8 w-8 mb-2 text-pink-500" />
                <h4 className="font-medium">Brand Kit</h4>
                <p className="text-sm text-muted-foreground">Logos, colors, fonts</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
