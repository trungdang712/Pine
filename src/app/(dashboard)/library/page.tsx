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
  Video,
  TrendingUp,
  Eye,
} from "lucide-react";
import Link from "next/link";

const recentDownloads = [
  {
    id: "1",
    name: "Logo Chính - Greenfield Dental.svg",
    type: "logo",
    date: "2024-01-15",
    size: "245 KB",
  },
  {
    id: "2",
    name: "Hướng dẫn Thương hiệu.pdf",
    type: "guideline",
    date: "2024-01-14",
    size: "2.4 MB",
  },
  {
    id: "3",
    name: "Ảnh Phòng khám - Khu vực Tiếp tân.jpg",
    type: "photo",
    date: "2024-01-13",
    size: "1.8 MB",
  },
  {
    id: "4",
    name: "Template Facebook - Khuyến mãi.psd",
    type: "template",
    date: "2024-01-12",
    size: "15 MB",
  },
  {
    id: "5",
    name: "Video Giới thiệu Bác sĩ Minh.mp4",
    type: "video",
    date: "2024-01-11",
    size: "85 MB",
  },
  {
    id: "6",
    name: "Ảnh Đội ngũ 2024.jpg",
    type: "photo",
    date: "2024-01-10",
    size: "3.2 MB",
  },
];

const popularAssets = [
  {
    id: "1",
    name: "Template Facebook Post - Khuyến mãi",
    downloads: 256,
    category: "Templates",
    views: 1240,
    trend: "+15%",
  },
  {
    id: "2",
    name: "Bộ ảnh Nội thất Phòng khám",
    downloads: 198,
    category: "Photos",
    views: 890,
    trend: "+12%",
  },
  {
    id: "3",
    name: "Hướng dẫn Thương hiệu PDF",
    downloads: 167,
    category: "Guidelines",
    views: 756,
    trend: "+8%",
  },
  {
    id: "4",
    name: "Logo Package (Tất cả định dạng)",
    downloads: 145,
    category: "Logos",
    views: 623,
    trend: "+22%",
  },
  {
    id: "5",
    name: "Video Tour Phòng khám",
    downloads: 134,
    category: "Videos",
    views: 1567,
    trend: "+45%",
  },
  {
    id: "6",
    name: "Template Instagram Story - Tips",
    downloads: 123,
    category: "Templates",
    views: 534,
    trend: "+5%",
  },
];

const assetCategories = [
  {
    id: "photos",
    name: "Photos",
    icon: Image,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    count: "250+",
    description: "Ảnh phòng khám, đội ngũ, thiết bị",
    href: "/library/assets?category=photos",
  },
  {
    id: "videos",
    name: "Videos",
    icon: Video,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    count: "30+",
    description: "Tour, testimonials, thủ thuật",
    href: "/library/assets?category=videos",
  },
  {
    id: "templates",
    name: "Templates",
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    count: "50+",
    description: "Social media, email, in ấn",
    href: "/library/assets?category=templates",
  },
  {
    id: "brand",
    name: "Brand Kit",
    icon: Palette,
    color: "text-pink-500",
    bgColor: "bg-pink-100",
    count: "12",
    description: "Logos, màu sắc, fonts",
    href: "/library/brand",
  },
];

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-muted-foreground">
          Quản lý brand assets và tài nguyên marketing cho Greenfield Dental
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/library/brand">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 hover:border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Brand Library</h3>
                  <p className="text-muted-foreground mb-4">
                    Brand colors, logos, typography và guidelines chính thức của
                    Greenfield Dental.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">4 màu chính</Badge>
                    <Badge variant="secondary">6 logo variants</Badge>
                    <Badge variant="secondary">2 fonts</Badge>
                    <Badge variant="secondary">Brand Guide</Badge>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/library/assets">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 hover:border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <Image className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Asset Library</h3>
                  <p className="text-muted-foreground mb-4">
                    Hình ảnh, video, templates và các tài nguyên cho content
                    marketing.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
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
              <p className="text-2xl font-bold">1,847</p>
              <p className="text-sm text-muted-foreground">Downloads tháng này</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5,234</p>
              <p className="text-sm text-muted-foreground">Lượt xem tháng này</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Downloads & Popular Assets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Tải gần đây
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/library/assets">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDownloads.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-background border">
                      {item.type === "logo" && (
                        <Palette className="h-4 w-4 text-purple-500" />
                      )}
                      {item.type === "photo" && (
                        <Image className="h-4 w-4 text-blue-500" />
                      )}
                      {item.type === "guideline" && (
                        <FileText className="h-4 w-4 text-green-500" />
                      )}
                      {item.type === "template" && (
                        <Folder className="h-4 w-4 text-orange-500" />
                      )}
                      {item.type === "video" && (
                        <Video className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(item.date).toLocaleDateString("vi-VN")}
                        </span>
                        <span>•</span>
                        <span>{item.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Phổ biến nhất
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/library/assets">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularAssets.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.downloads} downloads
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {item.views} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-xs text-green-600 border-green-200"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {item.trend}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
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
            {assetCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link key={category.id} href={category.href}>
                  <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all cursor-pointer group">
                    <div
                      className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <h4 className="font-semibold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {category.description}
                    </p>
                    <Badge variant="secondary">{category.count} items</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/library/brand">
                <Palette className="h-4 w-4 mr-2" />
                Xem Brand Guidelines
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/library/assets?category=photos">
                <Image className="h-4 w-4 mr-2" />
                Duyệt Photos
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/library/assets?category=templates">
                <FileText className="h-4 w-4 mr-2" />
                Xem Templates
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/library/assets?category=videos">
                <Video className="h-4 w-4 mr-2" />
                Xem Videos
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
