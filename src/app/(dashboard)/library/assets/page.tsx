"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image,
  Video,
  FileText,
  Search,
  Download,
  Upload,
  Grid,
  List,
  Filter,
  Eye,
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: "photo" | "video" | "template";
  category: string;
  thumbnail: string;
  size: string;
  downloads: number;
  uploadedAt: string;
}

const mockPhotos: Asset[] = [
  { id: "1", name: "Clinic Interior 01", type: "photo", category: "Clinic", thumbnail: "", size: "2.4 MB", downloads: 45, uploadedAt: "2024-01-05" },
  { id: "2", name: "Team Photo 2024", type: "photo", category: "Team", thumbnail: "", size: "3.1 MB", downloads: 38, uploadedAt: "2024-01-03" },
  { id: "3", name: "Equipment - Scanner", type: "photo", category: "Equipment", thumbnail: "", size: "1.8 MB", downloads: 22, uploadedAt: "2024-01-02" },
  { id: "4", name: "Before After - Implant", type: "photo", category: "Before/After", thumbnail: "", size: "2.2 MB", downloads: 67, uploadedAt: "2024-01-01" },
  { id: "5", name: "Stock - Smile 01", type: "photo", category: "Stock", thumbnail: "", size: "1.5 MB", downloads: 89, uploadedAt: "2023-12-28" },
  { id: "6", name: "Clinic Reception", type: "photo", category: "Clinic", thumbnail: "", size: "2.8 MB", downloads: 34, uploadedAt: "2023-12-25" },
];

const mockVideos: Asset[] = [
  { id: "v1", name: "Clinic Tour", type: "video", category: "Tour", thumbnail: "", size: "45 MB", downloads: 23, uploadedAt: "2024-01-08" },
  { id: "v2", name: "Patient Testimonial - Nguyen", type: "video", category: "Testimonial", thumbnail: "", size: "120 MB", downloads: 56, uploadedAt: "2024-01-06" },
  { id: "v3", name: "Teeth Whitening Procedure", type: "video", category: "Procedure", thumbnail: "", size: "85 MB", downloads: 34, uploadedAt: "2024-01-04" },
  { id: "v4", name: "Doctor Introduction - Dr. Minh", type: "video", category: "Team", thumbnail: "", size: "65 MB", downloads: 28, uploadedAt: "2024-01-02" },
];

const mockTemplates: Asset[] = [
  { id: "t1", name: "Facebook Post - Promotion", type: "template", category: "Social Media", thumbnail: "", size: "15 MB", downloads: 156, uploadedAt: "2024-01-10" },
  { id: "t2", name: "Instagram Story - Tips", type: "template", category: "Social Media", thumbnail: "", size: "8 MB", downloads: 134, uploadedAt: "2024-01-08" },
  { id: "t3", name: "Email Newsletter", type: "template", category: "Email", thumbnail: "", size: "5 MB", downloads: 78, uploadedAt: "2024-01-05" },
  { id: "t4", name: "Brochure - Services", type: "template", category: "Print", thumbnail: "", size: "25 MB", downloads: 45, uploadedAt: "2024-01-03" },
  { id: "t5", name: "Business Card", type: "template", category: "Print", thumbnail: "", size: "3 MB", downloads: 89, uploadedAt: "2024-01-01" },
];

const photoCategories = ["All", "Clinic", "Team", "Equipment", "Before/After", "Stock"];
const videoCategories = ["All", "Tour", "Testimonial", "Procedure", "Team"];
const templateCategories = ["All", "Social Media", "Email", "Print"];

export default function AssetLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [photoFilter, setPhotoFilter] = useState("All");
  const [videoFilter, setVideoFilter] = useState("All");
  const [templateFilter, setTemplateFilter] = useState("All");

  const filterAssets = (assets: Asset[], filter: string, query: string) => {
    return assets.filter((asset) => {
      const matchesFilter = filter === "All" || asset.category === filter;
      const matchesQuery = asset.name.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  };

  const AssetCard = ({ asset }: { asset: Asset }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-video bg-muted flex items-center justify-center relative">
        {asset.type === "photo" && <Image className="h-12 w-12 text-muted-foreground" />}
        {asset.type === "video" && <Video className="h-12 w-12 text-muted-foreground" />}
        {asset.type === "template" && <FileText className="h-12 w-12 text-muted-foreground" />}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-medium text-sm truncate">{asset.name}</h4>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-xs">
            {asset.category}
          </Badge>
          <span className="text-xs text-muted-foreground">{asset.size}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {asset.downloads} downloads
        </p>
      </CardContent>
    </Card>
  );

  const AssetListItem = ({ asset }: { asset: Asset }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
          {asset.type === "photo" && <Image className="h-6 w-6 text-muted-foreground" />}
          {asset.type === "video" && <Video className="h-6 w-6 text-muted-foreground" />}
          {asset.type === "template" && <FileText className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div>
          <h4 className="font-medium">{asset.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">{asset.category}</Badge>
            <span className="text-xs text-muted-foreground">{asset.size}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{asset.downloads} downloads</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asset Library</h1>
          <p className="text-muted-foreground">
            Hình ảnh, video và templates cho content marketing
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {/* Search and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm assets..."
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
      <Tabs defaultValue="photos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="photos">
            <Image className="h-4 w-4 mr-2" />
            Photos
            <Badge variant="secondary" className="ml-2">{mockPhotos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Videos
            <Badge variant="secondary" className="ml-2">{mockVideos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
            <Badge variant="secondary" className="ml-2">{mockTemplates.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {photoCategories.map((cat) => (
              <Button
                key={cat}
                variant={photoFilter === cat ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPhotoFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filterAssets(mockPhotos, photoFilter, searchQuery).map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filterAssets(mockPhotos, photoFilter, searchQuery).map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {videoCategories.map((cat) => (
              <Button
                key={cat}
                variant={videoFilter === cat ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setVideoFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filterAssets(mockVideos, videoFilter, searchQuery).map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filterAssets(mockVideos, videoFilter, searchQuery).map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {templateCategories.map((cat) => (
              <Button
                key={cat}
                variant={templateFilter === cat ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTemplateFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filterAssets(mockTemplates, templateFilter, searchQuery).map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filterAssets(mockTemplates, templateFilter, searchQuery).map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
