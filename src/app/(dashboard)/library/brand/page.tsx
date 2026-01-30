"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading, LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { toast } from "sonner";
import { useLanguage } from "@/i18n";
import { useUpload } from "@/hooks/use-upload";
import { useAuth } from "@/hooks/use-auth";

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseFormats(formatsJson: string | null): string[] {
  if (!formatsJson) return [];
  try {
    const parsed = JSON.parse(formatsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function BrandLibraryPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [searchBrand, setSearchBrand] = useState("");
  const [searchMedia, setSearchMedia] = useState("");

  // Upload dialog state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    name: "",
    description: "",
    category: "logo" as "logo" | "guideline" | "template" | "photo" | "video" | "font" | "icon",
    usageNotes: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is admin
  const isAdmin = profile?.role === "super_admin" || profile?.role === "admin";

  // tRPC queries
  const brandColorsQuery = trpc.library.getBrandColors.useQuery();
  const brandAssetsQuery = trpc.library.getBrandAssets.useQuery();
  const recentQuery = trpc.library.getRecentlyUsedBrandAssets.useQuery();
  const assetsQuery = trpc.library.getAssets.useQuery();

  const downloadMutation = trpc.library.downloadBrandAsset.useMutation({
    onSuccess: (data) => {
      // Actually trigger the download
      if (data?.fileUrl) {
        const link = document.createElement("a");
        link.href = data.fileUrl;
        link.download = data.name ?? "asset";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success(`Download started: ${data?.name ?? "Asset"}`);
      void recentQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Upload mutation
  const createBrandAssetMutation = trpc.library.createBrandAsset.useMutation({
    onSuccess: () => {
      toast.success(t.library.brand.uploadSuccess ?? "Logo uploaded successfully");
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadData({
        name: "",
        description: "",
        category: "logo",
        usageNotes: "",
      });
      void brandAssetsQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Upload hook
  const { upload: uploadFileToStorage, uploading: isUploading } = useUpload({
    bucket: "brand-assets",
    onSuccess: (result) => {
      // After file is uploaded to storage, create the brand asset record
      createBrandAssetMutation.mutate({
        name: uploadData.name || uploadFile?.name || "Untitled",
        description: uploadData.description || undefined,
        category: uploadData.category,
        fileUrl: result.url,
        fileType: uploadFile?.name.split(".").pop()?.toUpperCase(),
        fileSize: result.size,
        usageNotes: uploadData.usageNotes || undefined,
        formats: uploadFile?.name.split(".").pop()?.toUpperCase()
          ? [uploadFile.name.split(".").pop()!.toUpperCase()]
          : undefined,
      });
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Pre-fill name from filename
      if (!uploadData.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setUploadData((prev) => ({ ...prev, name: nameWithoutExt }));
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }
    if (!uploadData.name) {
      toast.error("Please enter a name");
      return;
    }

    // Upload to Supabase Storage
    await uploadFileToStorage(uploadFile, `logos/${Date.now()}`);
  };

  const isLoading =
    brandColorsQuery.isLoading ||
    brandAssetsQuery.isLoading ||
    recentQuery.isLoading ||
    assetsQuery.isLoading;

  const error =
    brandColorsQuery.error ||
    brandAssetsQuery.error ||
    recentQuery.error ||
    assetsQuery.error;

  // Organize brand assets by category
  const organizedBrand = useMemo(() => {
    const assets = brandAssetsQuery.data ?? [];

    const filterBySearch = (items: typeof assets) => {
      if (!searchBrand) return items;
      const lower = searchBrand.toLowerCase();
      return items.filter(
        (a) =>
          a.name.toLowerCase().includes(lower) ||
          (a.description ?? "").toLowerCase().includes(lower) ||
          (a.tags ?? "").toLowerCase().includes(lower)
      );
    };

    const filtered = filterBySearch(assets);

    return {
      logos: filtered.filter((a) => a.category === "logo"),
      guidelines: filtered.filter(
        (a) => a.category === "guideline" || a.category === "template"
      ),
      fonts: filtered.filter((a) => a.category === "font"),
      icons: filtered.filter((a) => a.category === "icon"),
      photos: filtered.filter((a) => a.category === "photo"),
      videos: filtered.filter((a) => a.category === "video"),
    };
  }, [brandAssetsQuery.data, searchBrand]);

  // Organize media assets
  const organizedMedia = useMemo(() => {
    const assets = assetsQuery.data?.assets ?? [];

    const filterBySearch = (items: typeof assets) => {
      if (!searchMedia) return items;
      const lower = searchMedia.toLowerCase();
      return items.filter(
        (a) =>
          a.name.toLowerCase().includes(lower) ||
          (a.description ?? "").toLowerCase().includes(lower) ||
          (a.tags ?? "").toLowerCase().includes(lower)
      );
    };

    const filtered = filterBySearch(assets);

    return {
      images: filtered.filter((a) => a.category === "image"),
      videos: filtered.filter((a) => a.category === "video"),
      templates: filtered.filter((a) => a.category === "template"),
      documents: filtered.filter((a) => a.category === "document"),
    };
  }, [assetsQuery.data, searchMedia]);

  // Brand colors organized
  const brandColorGroups = useMemo(() => {
    const colors = brandColorsQuery.data ?? [];
    const primary = colors.filter(
      (c) => c.usage?.toLowerCase().includes("primary") ?? false
    );
    const secondary = colors.filter(
      (c) =>
        !c.usage?.toLowerCase().includes("primary") ||
        (!c.usage && true)
    );
    // If no usage specified, split evenly
    if (primary.length === 0 && secondary.length === 0) {
      const half = Math.ceil(colors.length / 2);
      return {
        primary: colors.slice(0, half),
        secondary: colors.slice(half),
      };
    }
    return { primary, secondary: secondary.length > 0 ? secondary : [] };
  }, [brandColorsQuery.data]);

  const recentAssets = recentQuery.data ?? [];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Copied ${hex}`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleDownload = (id: string) => {
    downloadMutation.mutate({ id });
  };

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) {
    return (
      <PageError
        error={error}
        onRetry={() => {
          void brandColorsQuery.refetch();
          void brandAssetsQuery.refetch();
          void recentQuery.refetch();
          void assetsQuery.refetch();
        }}
      />
    );
  }

  // Category icon helpers
  const categoryIcon: Record<string, string> = {
    logo: "Logo",
    guideline: "Guide",
    template: "Template",
    photo: "Photo",
    video: "Video",
    font: "Font",
    icon: "Icon",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">{t.library.title}</h1>
        <p className="text-muted-foreground">
          {t.library.subtitle}
        </p>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList>
          <TabsTrigger value="brand">
            <Sparkles className="w-4 h-4 mr-2" />
            {t.library.brand.guidelines}
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Folder className="w-4 h-4 mr-2" />
            {t.library.assets.title}
          </TabsTrigger>
        </TabsList>

        {/* Brand Guidelines Tab */}
        <TabsContent value="brand" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t.library.brand.title}</h2>
              <p className="text-sm text-muted-foreground">
                {t.library.brand.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t.common.search}
                className="w-64"
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Recently Used */}
          {recentAssets.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recently Used</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentAssets.slice(0, 4).map((asset) => (
                  <Card
                    key={asset.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mb-3">
                        {asset.category === "logo" ? (
                          <Palette className="w-10 h-10 text-primary" />
                        ) : asset.category === "photo" ? (
                          <Image className="w-10 h-10 text-blue-500" />
                        ) : asset.category === "guideline" ? (
                          <BookOpen className="w-10 h-10 text-green-500" />
                        ) : (
                          <FileText className="w-10 h-10 text-orange-500" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{asset.name}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{categoryIcon[asset.category] ?? asset.category}</span>
                        <Badge variant="secondary" className="text-xs">
                          {asset.fileType ?? "N/A"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Brand Colors */}
          {(brandColorGroups.primary.length > 0 ||
            brandColorGroups.secondary.length > 0) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    {t.library.brand.colors}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const allColors = [
                        ...brandColorGroups.primary,
                        ...brandColorGroups.secondary,
                      ];
                      const codes = allColors
                        .map((c) => `${c.name}: ${c.hexCode}`)
                        .join("\n");
                      navigator.clipboard.writeText(codes);
                      toast.success("All color codes copied!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy All Codes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {brandColorGroups.primary.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                      PRIMARY COLORS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {brandColorGroups.primary.map((color) => (
                        <Card key={color.id} className="overflow-hidden border-2">
                          <div
                            className="h-24"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-1">{color.name}</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              {color.usage ?? "Brand color"}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  HEX
                                </span>
                                <div className="flex items-center gap-2">
                                  <code className="text-xs font-mono font-semibold">
                                    {color.hexCode}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleCopyColor(color.hexCode)}
                                  >
                                    {copiedColor === color.hexCode ? (
                                      <Check className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              {color.rgbCode && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    RGB
                                  </span>
                                  <code className="text-xs font-mono">
                                    {color.rgbCode}
                                  </code>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {brandColorGroups.secondary.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                      SECONDARY COLORS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {brandColorGroups.secondary.map((color) => (
                        <Card key={color.id} className="overflow-hidden border-2">
                          <div
                            className="h-24 border-b"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-1">{color.name}</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              {color.usage ?? "Brand color"}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  HEX
                                </span>
                                <div className="flex items-center gap-2">
                                  <code className="text-xs font-mono font-semibold">
                                    {color.hexCode}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleCopyColor(color.hexCode)}
                                  >
                                    {copiedColor === color.hexCode ? (
                                      <Check className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              {color.rgbCode && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    RGB
                                  </span>
                                  <code className="text-xs font-mono">
                                    {color.rgbCode}
                                  </code>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Logos */}
          {(organizedBrand.logos.length > 0 || isAdmin) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {t.library.brand.logos}
                </h3>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      {t.library.brand.uploadLogo ?? "Upload Logo"}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    {t.library.brand.downloadAll}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizedBrand.logos.map((logo) => {
                  const formats = parseFormats(logo.formats);
                  return (
                    <Card
                      key={logo.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-white border-2 rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                GF
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{logo.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {logo.usageNotes ?? logo.description ?? ""}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {formatFileSize(logo.fileSize)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {logo._count.downloads} downloads
                              </Badge>
                            </div>
                            {formats.length > 0 && (
                              <div className="flex gap-1">
                                {formats.map((fmt) => (
                                  <Badge
                                    key={fmt}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {fmt}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(logo.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Typography (Fonts) */}
          {organizedBrand.fonts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t.library.brand.fonts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizedBrand.fonts.map((font) => {
                    const formats = parseFormats(font.formats);
                    return (
                      <Card key={font.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="mb-3">
                            <h3 className="text-2xl font-semibold mb-1">
                              {font.name}
                            </h3>
                            <Badge variant="secondary">Font</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {font.usageNotes ?? font.description ?? ""}
                          </p>
                          {formats.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground mb-1">
                                Formats
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {formats.map((f) => (
                                  <Badge
                                    key={f}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => handleDownload(font.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t.library.brand.downloadAll}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand Guidelines Documents */}
          {organizedBrand.guidelines.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {t.library.brand.guidelines}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizedBrand.guidelines.map((guide) => (
                  <Card
                    key={guide.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{guide.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {guide.description ?? ""}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {guide.fileType ?? guide.category}
                            </Badge>
                            <span>{formatFileSize(guide.fileSize)}</span>
                            <span>
                              &bull;{" "}
                              {new Date(guide.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownload(guide.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for brand tab */}
          {organizedBrand.logos.length === 0 &&
            organizedBrand.guidelines.length === 0 &&
            organizedBrand.fonts.length === 0 &&
            brandColorGroups.primary.length === 0 &&
            brandColorGroups.secondary.length === 0 && (
              <div className="text-center py-12">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchBrand
                    ? t.common.noData
                    : t.library.assets.noAssets}
                </p>
              </div>
            )}
        </TabsContent>

        {/* Media Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t.library.assets.title}</h2>
              <p className="text-sm text-muted-foreground">
                {t.library.assets.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t.common.search}
                className="w-64"
                value={searchMedia}
                onChange={(e) => setSearchMedia(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                {t.library.assets.uploadAsset}
              </Button>
            </div>
          </div>

          {/* Images/Photos */}
          {organizedMedia.images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {t.library.assets.images}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {organizedMedia.images.map((photo) => (
                  <Card
                    key={photo.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3">
                        <Image className="w-12 h-12 text-gray-500" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{photo.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {photo.description ?? ""}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="font-medium text-primary">
                          {photo.fileType ?? "Image"}
                        </span>
                        <span>{formatFileSize(photo.fileSize)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {photo.tags ?? "image"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(photo.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {organizedMedia.videos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {t.library.assets.videos}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizedMedia.videos.map((video) => (
                  <Card
                    key={video.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Video className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">
                            {video.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {video.description ?? ""}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="secondary">
                              {video.fileType ?? "Video"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatFileSize(video.fileSize)}
                          </p>
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
          )}

          {/* Templates */}
          {organizedMedia.templates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {t.library.brand.templates}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {organizedMedia.templates.map((template) => (
                  <Card
                    key={template.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center mb-3">
                        <Palette className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {template.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {template.description ?? ""}
                      </p>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Badge variant="secondary">
                          {template.fileType ?? "Template"}
                        </Badge>
                        <span className="text-muted-foreground">
                          {formatFileSize(template.fileSize)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(template.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {organizedMedia.documents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {t.library.assets.documents}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizedMedia.documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <File className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {doc.description ?? ""}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {doc.fileType ?? "Document"}
                            </Badge>
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>
                              &bull;{" "}
                              {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                            </span>
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
          )}

          {/* Empty state for media tab */}
          {organizedMedia.images.length === 0 &&
            organizedMedia.videos.length === 0 &&
            organizedMedia.templates.length === 0 &&
            organizedMedia.documents.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchMedia
                    ? t.common.noData
                    : t.library.assets.noAssets}
                </p>
              </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.library.brand.uploadLogo ?? "Upload Brand Asset"}</DialogTitle>
            <DialogDescription>
              {t.library.brand.uploadDescription ?? "Upload a logo or brand asset to the library"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Input */}
            <div>
              <Label>{t.library.assets.selectFile ?? "Select File"}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ai,.eps,.svg,.png,.pdf,.jpg,.jpeg,.gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <span className="font-medium">{uploadFile.name}</span>
                    <Badge variant="secondary">{formatFileSize(uploadFile.size)}</Badge>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t.library.assets.dragDrop ?? "Click to select or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI, EPS, SVG, PNG, PDF, JPG
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="asset-name">{t.library.brand.assetName ?? "Name"} *</Label>
              <Input
                id="asset-name"
                placeholder={t.library.brand.assetNamePlaceholder ?? "Enter asset name"}
                value={uploadData.name}
                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Category */}
            <div>
              <Label>{t.library.brand.category ?? "Category"}</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) =>
                  setUploadData({
                    ...uploadData,
                    category: value as typeof uploadData.category,
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logo">Logo</SelectItem>
                  <SelectItem value="guideline">{t.library.brand.guidelines}</SelectItem>
                  <SelectItem value="template">{t.library.brand.templates}</SelectItem>
                  <SelectItem value="font">{t.library.brand.fonts}</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="icon">Icon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="asset-description">{t.tasks.description}</Label>
              <Textarea
                id="asset-description"
                placeholder={t.library.brand.descriptionPlaceholder ?? "Enter description"}
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Usage Notes */}
            <div>
              <Label htmlFor="usage-notes">{t.library.brand.usageNotes ?? "Usage Notes"}</Label>
              <Textarea
                id="usage-notes"
                placeholder={t.library.brand.usageNotesPlaceholder ?? "How should this asset be used?"}
                value={uploadData.usageNotes}
                onChange={(e) => setUploadData({ ...uploadData, usageNotes: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || createBrandAssetMutation.isPending || !uploadFile}
            >
              {isUploading || createBrandAssetMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {t.common.upload}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
