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
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { toast } from "sonner";

// Static category data (navigational, not from DB)
const assetCategories = [
  {
    id: "photos",
    name: "Photos",
    icon: Image,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    description: "Anh phong kham, doi ngu, thiet bi",
    href: "/library/assets?category=photos",
  },
  {
    id: "videos",
    name: "Videos",
    icon: Video,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    description: "Tour, testimonials, thu thuat",
    href: "/library/assets?category=videos",
  },
  {
    id: "templates",
    name: "Templates",
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    description: "Social media, email, in an",
    href: "/library/assets?category=templates",
  },
  {
    id: "brand",
    name: "Brand Kit",
    icon: Palette,
    color: "text-pink-500",
    bgColor: "bg-pink-100",
    description: "Logos, mau sac, fonts",
    href: "/library/brand",
  },
];

const typeIcons: Record<string, typeof Palette> = {
  logo: Palette,
  photo: Image,
  image: Image,
  guideline: FileText,
  document: FileText,
  template: Folder,
  video: Video,
  font: FileText,
  icon: Palette,
};

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LibraryPage() {
  const brandAssetsQuery = trpc.library.getBrandAssets.useQuery();
  const assetsQuery = trpc.library.getAssets.useQuery();
  const recentQuery = trpc.library.getRecentlyUsedBrandAssets.useQuery();
  const popularQuery = trpc.library.getMostDownloadedBrandAssets.useQuery();
  const brandColorsQuery = trpc.library.getBrandColors.useQuery();

  const downloadMutation = trpc.library.downloadBrandAsset.useMutation({
    onSuccess: () => {
      toast.success("Download recorded");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const isLoading =
    brandAssetsQuery.isLoading ||
    assetsQuery.isLoading ||
    recentQuery.isLoading ||
    popularQuery.isLoading;

  const error =
    brandAssetsQuery.error ||
    assetsQuery.error ||
    recentQuery.error ||
    popularQuery.error;

  if (isLoading) return <PageLoading text="Loading library..." />;
  if (error) {
    return (
      <PageError
        error={error}
        onRetry={() => {
          void brandAssetsQuery.refetch();
          void assetsQuery.refetch();
          void recentQuery.refetch();
          void popularQuery.refetch();
        }}
      />
    );
  }

  const brandAssets = brandAssetsQuery.data ?? [];
  const assets = assetsQuery.data?.assets ?? [];
  const recentAssets = recentQuery.data ?? [];
  const popularAssets = popularQuery.data ?? [];
  const brandColors = brandColorsQuery.data ?? [];

  // Derive counts
  const totalBrandElements = brandAssets.length + brandColors.length;
  const totalAssets = assets.length + brandAssets.length;

  // Build recent downloads from recentAssets
  const recentDownloads = recentAssets.slice(0, 6).map((asset) => ({
    id: asset.id,
    name: asset.name,
    type: asset.category,
    date: new Date(asset.createdAt).toISOString().split("T")[0],
    size: formatFileSize(asset.fileSize),
  }));

  // Build popular assets list
  const popularList = popularAssets.slice(0, 6).map((asset) => ({
    id: asset.id,
    name: asset.name,
    downloads: asset._count.downloads,
    category: asset.category,
  }));

  // Count assets by category for nav cards
  const imageCount = assets.filter((a) => a.category === "image").length;
  const videoCount = assets.filter((a) => a.category === "video").length;
  const templateCount = assets.filter((a) => a.category === "template").length;
  const categoryCountMap: Record<string, string> = {
    photos: `${imageCount}`,
    videos: `${videoCount}`,
    templates: `${templateCount}`,
    brand: `${brandAssets.length}`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-muted-foreground">
          Quan ly brand assets va tai nguyen marketing cho Greenfield Dental
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
                    Brand colors, logos, typography va guidelines chinh thuc cua
                    Greenfield Dental.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">{brandColors.length} mau</Badge>
                    <Badge variant="secondary">
                      {brandAssets.filter((a) => a.category === "logo").length} logo variants
                    </Badge>
                    <Badge variant="secondary">
                      {brandAssets.filter((a) => a.category === "font").length} fonts
                    </Badge>
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
                    Hinh anh, video, templates va cac tai nguyen cho content
                    marketing.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">{imageCount} photos</Badge>
                    <Badge variant="secondary">{videoCount} videos</Badge>
                    <Badge variant="secondary">{templateCount} templates</Badge>
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
              <p className="text-2xl font-bold">{totalBrandElements}</p>
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
              <p className="text-2xl font-bold">{totalAssets}</p>
              <p className="text-sm text-muted-foreground">Tong Assets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {popularAssets.reduce((sum, a) => sum + a._count.downloads, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentAssets.length}</p>
              <p className="text-sm text-muted-foreground">Recently Used</p>
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
              Tai gan day
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/library/assets">Xem tat ca</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDownloads.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">
                  Chua co tai nguyen nao duoc tai gan day
                </p>
              ) : (
                recentDownloads.map((item) => {
                  const IconComp = typeIcons[item.type] ?? FileText;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-background border">
                          <IconComp className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {new Date(item.date).toLocaleDateString("vi-VN")}
                            </span>
                            <span>&bull;</span>
                            <span>{item.size}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        onClick={() => downloadMutation.mutate({ id: item.id })}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Pho bien nhat
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/library/assets">Xem tat ca</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularList.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">
                  Chua co du lieu pho bien
                </p>
              ) : (
                popularList.map((item) => (
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
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600 border-green-200"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {item.downloads}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadMutation.mutate({ id: item.id })}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh muc Assets</CardTitle>
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
                    <Badge variant="secondary">
                      {categoryCountMap[category.id] ?? "0"} items
                    </Badge>
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
          <CardTitle className="text-lg">Hanh dong nhanh</CardTitle>
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
                Duyet Photos
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
