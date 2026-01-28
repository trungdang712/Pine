"use client";

import { useState, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Image,
  Video,
  FileText,
  Search,
  Download,
  Upload,
  Grid,
  List,
  Eye,
  Calendar,
  HardDrive,
  Play,
  ChevronLeft,
  ChevronRight,
  Share2,
  MoreHorizontal,
  Trash2,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { useUpload, formatFileSize, validateFile } from "@/hooks/use-upload";
import { Progress } from "@/components/ui/progress";

type AssetCategory = "image" | "video" | "document" | "template";

interface Asset {
  id: string;
  name: string;
  description: string | null;
  category: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileType: string | null;
  fileSize: number | null;
  tags: string | null;
  version: number;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}

const categoryLabels: Record<AssetCategory, string> = {
  image: "Images",
  video: "Videos",
  document: "Documents",
  template: "Templates",
};

const categoryIcons: Record<AssetCategory, typeof Image> = {
  image: Image,
  video: Video,
  document: FileText,
  template: FileText,
};

export default function AssetLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<AssetCategory>("image");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);

  // Upload form state
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState<AssetCategory>("image");
  const [uploadTags, setUploadTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assets for each category
  const imagesQuery = trpc.library.getAssets.useQuery({ category: "image" });
  const videosQuery = trpc.library.getAssets.useQuery({ category: "video" });
  const documentsQuery = trpc.library.getAssets.useQuery({ category: "document" });
  const templatesQuery = trpc.library.getAssets.useQuery({ category: "template" });

  const utils = trpc.useUtils();

  // Mutations
  const createAssetMutation = trpc.library.createAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset uploaded successfully");
      resetUploadForm();
      setIsUploadOpen(false);
      // Invalidate all asset queries
      utils.library.getAssets.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create asset: ${error.message}`);
    },
  });

  const deleteAssetMutation = trpc.library.deleteAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      setDeleteAssetId(null);
      utils.library.getAssets.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete asset: ${error.message}`);
    },
  });

  // Upload hook
  const { upload, uploading, progress } = useUpload({
    bucket: "assets",
    onSuccess: (result) => {
      // Create the asset record after successful upload
      createAssetMutation.mutate({
        name: uploadName || result.name,
        description: uploadDescription || undefined,
        category: uploadCategory,
        fileUrl: result.url,
        fileType: selectedFile?.type || undefined,
        fileSize: result.size,
        tags: uploadTags || undefined,
      });
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  // Get current query based on active tab
  const getCurrentQuery = () => {
    switch (activeTab) {
      case "image":
        return imagesQuery;
      case "video":
        return videosQuery;
      case "document":
        return documentsQuery;
      case "template":
        return templatesQuery;
    }
  };

  const currentQuery = getCurrentQuery();

  // Filter assets based on search
  const filteredAssets = useMemo(() => {
    const assets = currentQuery.data?.assets ?? [];
    if (!searchQuery.trim()) return assets;

    const query = searchQuery.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query) ||
        asset.tags?.toLowerCase().includes(query)
    );
  }, [currentQuery.data?.assets, searchQuery]);

  // Get all assets for navigation in preview
  const allAssets = useMemo(() => {
    return [
      ...(imagesQuery.data?.assets ?? []),
      ...(videosQuery.data?.assets ?? []),
      ...(documentsQuery.data?.assets ?? []),
      ...(templatesQuery.data?.assets ?? []),
    ];
  }, [imagesQuery.data, videosQuery.data, documentsQuery.data, templatesQuery.data]);

  const resetUploadForm = () => {
    setUploadName("");
    setUploadDescription("");
    setUploadCategory("image");
    setUploadTags("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file, {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: [
          "image/*",
          "video/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ],
      });

      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setSelectedFile(file);
      if (!uploadName) {
        setUploadName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }

      // Auto-detect category from file type
      if (file.type.startsWith("image/")) {
        setUploadCategory("image");
      } else if (file.type.startsWith("video/")) {
        setUploadCategory("video");
      } else {
        setUploadCategory("document");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!uploadName.trim()) {
      toast.error("Please enter a name for the asset");
      return;
    }

    await upload(selectedFile, uploadCategory);
  };

  const openPreview = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedAsset(null);
  };

  const navigateAsset = (direction: "prev" | "next") => {
    if (!selectedAsset) return;

    const currentIndex = allAssets.findIndex((a) => a.id === selectedAsset.id);
    let newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0) newIndex = allAssets.length - 1;
    if (newIndex >= allAssets.length) newIndex = 0;

    setSelectedAsset(allAssets[newIndex]);
  };

  const handleDelete = (assetId: string) => {
    setDeleteAssetId(assetId);
  };

  const confirmDelete = () => {
    if (deleteAssetId) {
      deleteAssetMutation.mutate({ id: deleteAssetId });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category as AssetCategory] || FileText;
    return <Icon className="h-12 w-12 text-muted-foreground/50" />;
  };

  const AssetCard = ({ asset }: { asset: Asset }) => (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => openPreview(asset)}
    >
      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
        {asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {asset.category === "image" && (
              <Image className="h-12 w-12 text-muted-foreground/50" />
            )}
            {asset.category === "video" && (
              <div className="relative">
                <Video className="h-12 w-12 text-muted-foreground/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            )}
            {(asset.category === "document" || asset.category === "template") && (
              <FileText className="h-12 w-12 text-muted-foreground/50" />
            )}
          </>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={(e) => e.stopPropagation()}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(asset.fileUrl, "_blank");
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm truncate flex-1" title={asset.name}>
            {asset.name}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(asset.fileUrl, "_blank");
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(asset.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-xs">
            {asset.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {asset.fileSize ? formatFileSize(asset.fileSize) : "Unknown size"}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(asset.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const AssetListItem = ({ asset }: { asset: Asset }) => (
    <div
      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => openPreview(asset)}
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-14 bg-gradient-to-br from-muted to-muted/50 rounded flex items-center justify-center relative overflow-hidden">
          {asset.thumbnailUrl ? (
            <img
              src={asset.thumbnailUrl}
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {asset.category === "image" && (
                <Image className="h-6 w-6 text-muted-foreground/50" />
              )}
              {asset.category === "video" && (
                <div className="relative">
                  <Video className="h-6 w-6 text-muted-foreground/50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-3 w-3 text-primary" />
                  </div>
                </div>
              )}
              {(asset.category === "document" || asset.category === "template") && (
                <FileText className="h-6 w-6 text-muted-foreground/50" />
              )}
            </>
          )}
        </div>
        <div>
          <h4 className="font-medium">{asset.name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary" className="text-xs">
              {asset.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {asset.fileSize ? formatFileSize(asset.fileSize) : "Unknown"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(asset.createdAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            openPreview(asset);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            window.open(asset.fileUrl, "_blank");
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(asset.id);
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );

  // Loading state
  const isLoading =
    imagesQuery.isLoading ||
    videosQuery.isLoading ||
    documentsQuery.isLoading ||
    templatesQuery.isLoading;

  // Error state
  const error =
    imagesQuery.error ||
    videosQuery.error ||
    documentsQuery.error ||
    templatesQuery.error;

  if (isLoading) {
    return <PageLoading text="Loading assets..." />;
  }

  if (error) {
    return (
      <PageError
        error={error}
        onRetry={() => {
          imagesQuery.refetch();
          videosQuery.refetch();
          documentsQuery.refetch();
          templatesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asset Library</h1>
          <p className="text-muted-foreground">
            Images, videos, and templates for content marketing
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {/* Search and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by name or tags..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as AssetCategory)}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="image">
            <Image className="h-4 w-4 mr-2" />
            Images
            <Badge variant="secondary" className="ml-2">
              {imagesQuery.data?.assets.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="h-4 w-4 mr-2" />
            Videos
            <Badge variant="secondary" className="ml-2">
              {videosQuery.data?.assets.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="document">
            <FileText className="h-4 w-4 mr-2" />
            Documents
            <Badge variant="secondary" className="ml-2">
              {documentsQuery.data?.assets.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="template">
            <FileText className="h-4 w-4 mr-2" />
            Templates
            <Badge variant="secondary" className="ml-2">
              {templatesQuery.data?.assets.length ?? 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Content for each tab */}
        {(["image", "video", "document", "template"] as AssetCategory[]).map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {filteredAssets.length === 0 ? (
              <EmptyState
                icon={categoryIcons[category]}
                title={`No ${categoryLabels[category].toLowerCase()} found`}
                description={
                  searchQuery
                    ? "Try adjusting your search terms"
                    : `Upload your first ${category} to get started`
                }
                action={{
                  label: "Upload Asset",
                  onClick: () => {
                    setUploadCategory(category);
                    setIsUploadOpen(true);
                  },
                }}
              />
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <AssetListItem key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-md w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Asset</DialogTitle>
            <DialogDescription>
              Upload images, videos, documents, or templates to your asset library.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>File</Label>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-name">Name</Label>
              <Input
                id="upload-name"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Asset name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Description</Label>
              <Input
                id="upload-description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={uploadCategory}
                onValueChange={(v) => setUploadCategory(v as AssetCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-tags">Tags</Label>
              <Input
                id="upload-tags"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="Comma-separated tags (e.g., marketing, social)"
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {progress}%
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetUploadForm();
                setIsUploadOpen(false);
              }}
              disabled={uploading || createAssetMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !uploadName.trim() || uploading || createAssetMutation.isPending}
            >
              {uploading || createAssetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-4xl w-full max-h-[100dvh] sm:max-h-[90vh] overflow-hidden">
          {selectedAsset && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedAsset.name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedAsset.description || "No description"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Preview Area */}
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedAsset.thumbnailUrl || selectedAsset.category === "image" ? (
                      <img
                        src={selectedAsset.thumbnailUrl || selectedAsset.fileUrl}
                        alt={selectedAsset.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : selectedAsset.category === "video" ? (
                      <div className="relative">
                        <Video className="h-20 w-20 text-muted-foreground/30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors"
                            onClick={() => window.open(selectedAsset.fileUrl, "_blank")}
                          >
                            <Play className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <FileText className="h-20 w-20 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {allAssets.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                        onClick={() => navigateAsset("prev")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                        onClick={() => navigateAsset("next")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Asset Details */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge>{selectedAsset.category.toUpperCase()}</Badge>
                      {selectedAsset.fileType && (
                        <Badge variant="outline">{selectedAsset.fileType}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="h-4 w-4" />
                        <span>
                          Size:{" "}
                          {selectedAsset.fileSize
                            ? formatFileSize(selectedAsset.fileSize)
                            : "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedAsset.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedAsset.tags && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAsset.tags.split(",").map((tag) => (
                          <Badge key={tag.trim()} variant="outline" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={() => window.open(selectedAsset.fileUrl, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAsset.fileUrl);
                        toast.success("URL copied to clipboard");
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>

                  {selectedAsset.uploadedBy && (
                    <p className="text-xs text-muted-foreground">
                      Uploaded by: {selectedAsset.uploadedBy.name}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAssetId} onOpenChange={() => setDeleteAssetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAssetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
