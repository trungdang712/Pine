"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Calendar,
  HardDrive,
  Clock,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  MoreHorizontal,
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: "photo" | "video" | "template";
  category: string;
  subcategory: string;
  thumbnail: string;
  size: string;
  dimensions?: string;
  duration?: string;
  format: string;
  downloads: number;
  views: number;
  uploadedAt: string;
  uploadedBy: string;
  description: string;
  tags: string[];
}

// Photos - Clinic Photos
const clinicPhotos: Asset[] = [
  {
    id: "p1",
    name: "Khu vực Tiếp tân Chính",
    type: "photo",
    category: "Clinic",
    subcategory: "Clinic Photos",
    thumbnail: "",
    size: "2.4 MB",
    dimensions: "4000 x 2667",
    format: "JPG",
    downloads: 78,
    views: 234,
    uploadedAt: "2024-01-15",
    uploadedBy: "Admin",
    description: "Hình ảnh khu vực tiếp tân với bàn lễ tân hiện đại và khu vực chờ thoải mái",
    tags: ["tiếp tân", "phòng chờ", "nội thất"],
  },
  {
    id: "p2",
    name: "Phòng Khám Số 1 - Toàn cảnh",
    type: "photo",
    category: "Clinic",
    subcategory: "Clinic Photos",
    thumbnail: "",
    size: "3.1 MB",
    dimensions: "4500 x 3000",
    format: "JPG",
    downloads: 65,
    views: 189,
    uploadedAt: "2024-01-14",
    uploadedBy: "Admin",
    description: "Phòng khám số 1 được trang bị đầy đủ thiết bị hiện đại",
    tags: ["phòng khám", "thiết bị", "ghế nha khoa"],
  },
  {
    id: "p3",
    name: "Khu vực Hành lang Chính",
    type: "photo",
    category: "Clinic",
    subcategory: "Clinic Photos",
    thumbnail: "",
    size: "1.8 MB",
    dimensions: "3500 x 2333",
    format: "JPG",
    downloads: 45,
    views: 156,
    uploadedAt: "2024-01-12",
    uploadedBy: "Admin",
    description: "Hành lang sáng sủa, sạch sẽ của phòng khám",
    tags: ["hành lang", "nội thất", "sạch sẽ"],
  },
  {
    id: "p4",
    name: "Khu vực Chờ - Góc Trẻ em",
    type: "photo",
    category: "Clinic",
    subcategory: "Clinic Photos",
    thumbnail: "",
    size: "2.2 MB",
    dimensions: "4000 x 2667",
    format: "JPG",
    downloads: 52,
    views: 178,
    uploadedAt: "2024-01-10",
    uploadedBy: "Admin",
    description: "Góc chơi dành cho trẻ em trong khu vực chờ",
    tags: ["trẻ em", "phòng chờ", "vui chơi"],
  },
];

// Photos - Team Photos
const teamPhotos: Asset[] = [
  {
    id: "p5",
    name: "Đội ngũ Bác sĩ 2024",
    type: "photo",
    category: "Team",
    subcategory: "Team Photos",
    thumbnail: "",
    size: "4.5 MB",
    dimensions: "5000 x 3333",
    format: "JPG",
    downloads: 123,
    views: 456,
    uploadedAt: "2024-01-08",
    uploadedBy: "Admin",
    description: "Ảnh tập thể đội ngũ bác sĩ Greenfield Dental 2024",
    tags: ["đội ngũ", "bác sĩ", "chuyên gia"],
  },
  {
    id: "p6",
    name: "Bác sĩ Nguyễn Minh - Chân dung",
    type: "photo",
    category: "Team",
    subcategory: "Team Photos",
    thumbnail: "",
    size: "2.8 MB",
    dimensions: "3000 x 4000",
    format: "JPG",
    downloads: 89,
    views: 267,
    uploadedAt: "2024-01-07",
    uploadedBy: "Admin",
    description: "Ảnh chân dung bác sĩ Nguyễn Minh - Giám đốc chuyên môn",
    tags: ["bác sĩ", "chân dung", "giám đốc"],
  },
  {
    id: "p7",
    name: "Nhân viên Lễ tân",
    type: "photo",
    category: "Team",
    subcategory: "Team Photos",
    thumbnail: "",
    size: "2.1 MB",
    dimensions: "3500 x 2333",
    format: "JPG",
    downloads: 56,
    views: 178,
    uploadedAt: "2024-01-06",
    uploadedBy: "Admin",
    description: "Đội ngũ nhân viên lễ tân thân thiện",
    tags: ["lễ tân", "nhân viên", "dịch vụ"],
  },
  {
    id: "p8",
    name: "Bác sĩ Trần Hương - Chuyên gia Niềng răng",
    type: "photo",
    category: "Team",
    subcategory: "Team Photos",
    thumbnail: "",
    size: "2.6 MB",
    dimensions: "3000 x 4000",
    format: "JPG",
    downloads: 78,
    views: 234,
    uploadedAt: "2024-01-05",
    uploadedBy: "Admin",
    description: "Bác sĩ Trần Hương - Chuyên gia chỉnh nha",
    tags: ["bác sĩ", "chỉnh nha", "niềng răng"],
  },
];

// Photos - Equipment
const equipmentPhotos: Asset[] = [
  {
    id: "p9",
    name: "Máy chụp X-quang Panoramic",
    type: "photo",
    category: "Equipment",
    subcategory: "Equipment",
    thumbnail: "",
    size: "1.9 MB",
    dimensions: "3500 x 2333",
    format: "JPG",
    downloads: 34,
    views: 123,
    uploadedAt: "2024-01-04",
    uploadedBy: "Admin",
    description: "Máy chụp X-quang Panoramic hiện đại",
    tags: ["x-quang", "thiết bị", "công nghệ"],
  },
  {
    id: "p10",
    name: "Máy scan 3D iTero",
    type: "photo",
    category: "Equipment",
    subcategory: "Equipment",
    thumbnail: "",
    size: "2.3 MB",
    dimensions: "4000 x 2667",
    format: "JPG",
    downloads: 45,
    views: 167,
    uploadedAt: "2024-01-03",
    uploadedBy: "Admin",
    description: "Máy quét răng 3D iTero Element",
    tags: ["3D scan", "iTero", "công nghệ"],
  },
  {
    id: "p11",
    name: "Ghế nha khoa Sirona",
    type: "photo",
    category: "Equipment",
    subcategory: "Equipment",
    thumbnail: "",
    size: "2.0 MB",
    dimensions: "3800 x 2533",
    format: "JPG",
    downloads: 28,
    views: 98,
    uploadedAt: "2024-01-02",
    uploadedBy: "Admin",
    description: "Ghế nha khoa Sirona cao cấp",
    tags: ["ghế nha khoa", "Sirona", "thiết bị"],
  },
];

// Photos - Before/After
const beforeAfterPhotos: Asset[] = [
  {
    id: "p12",
    name: "Tẩy trắng răng - Trước và Sau",
    type: "photo",
    category: "Before/After",
    subcategory: "Before/After",
    thumbnail: "",
    size: "1.5 MB",
    dimensions: "3000 x 2000",
    format: "JPG",
    downloads: 156,
    views: 678,
    uploadedAt: "2024-01-01",
    uploadedBy: "Admin",
    description: "Kết quả tẩy trắng răng sau 2 buổi điều trị",
    tags: ["tẩy trắng", "trước sau", "kết quả"],
  },
  {
    id: "p13",
    name: "Implant răng - Trước và Sau",
    type: "photo",
    category: "Before/After",
    subcategory: "Before/After",
    thumbnail: "",
    size: "1.8 MB",
    dimensions: "3200 x 2133",
    format: "JPG",
    downloads: 189,
    views: 834,
    uploadedAt: "2023-12-28",
    uploadedBy: "Admin",
    description: "Kết quả cấy ghép implant sau 3 tháng",
    tags: ["implant", "trước sau", "phục hình"],
  },
  {
    id: "p14",
    name: "Niềng răng - 18 tháng điều trị",
    type: "photo",
    category: "Before/After",
    subcategory: "Before/After",
    thumbnail: "",
    size: "2.1 MB",
    dimensions: "3500 x 2333",
    format: "JPG",
    downloads: 234,
    views: 1023,
    uploadedAt: "2023-12-25",
    uploadedBy: "Admin",
    description: "Kết quả niềng răng sau 18 tháng điều trị",
    tags: ["niềng răng", "chỉnh nha", "trước sau"],
  },
];

// Photos - Stock Photos
const stockPhotos: Asset[] = [
  {
    id: "p15",
    name: "Nụ cười hoàn hảo - Stock",
    type: "photo",
    category: "Stock",
    subcategory: "Stock Photos",
    thumbnail: "",
    size: "1.2 MB",
    dimensions: "2500 x 1667",
    format: "JPG",
    downloads: 234,
    views: 890,
    uploadedAt: "2023-12-20",
    uploadedBy: "Admin",
    description: "Hình ảnh stock nụ cười trắng sáng",
    tags: ["nụ cười", "stock", "marketing"],
  },
  {
    id: "p16",
    name: "Gia đình hạnh phúc - Stock",
    type: "photo",
    category: "Stock",
    subcategory: "Stock Photos",
    thumbnail: "",
    size: "1.4 MB",
    dimensions: "2800 x 1867",
    format: "JPG",
    downloads: 178,
    views: 567,
    uploadedAt: "2023-12-18",
    uploadedBy: "Admin",
    description: "Hình ảnh gia đình với nụ cười rạng rỡ",
    tags: ["gia đình", "stock", "hạnh phúc"],
  },
  {
    id: "p17",
    name: "Chăm sóc răng miệng - Stock",
    type: "photo",
    category: "Stock",
    subcategory: "Stock Photos",
    thumbnail: "",
    size: "1.1 MB",
    dimensions: "2400 x 1600",
    format: "JPG",
    downloads: 145,
    views: 456,
    uploadedAt: "2023-12-15",
    uploadedBy: "Admin",
    description: "Hình ảnh chăm sóc răng miệng đúng cách",
    tags: ["chăm sóc", "stock", "sức khỏe"],
  },
];

// Videos - Clinic Tour
const clinicTourVideos: Asset[] = [
  {
    id: "v1",
    name: "Tour Phòng khám Greenfield Dental",
    type: "video",
    category: "Tour",
    subcategory: "Clinic Tour",
    thumbnail: "",
    size: "245 MB",
    duration: "3:45",
    format: "MP4",
    downloads: 89,
    views: 1567,
    uploadedAt: "2024-01-12",
    uploadedBy: "Admin",
    description: "Video giới thiệu toàn cảnh phòng khám Greenfield Dental",
    tags: ["tour", "giới thiệu", "phòng khám"],
  },
  {
    id: "v2",
    name: "Khu vực Tiếp tân - Video Tour",
    type: "video",
    category: "Tour",
    subcategory: "Clinic Tour",
    thumbnail: "",
    size: "85 MB",
    duration: "1:30",
    format: "MP4",
    downloads: 45,
    views: 678,
    uploadedAt: "2024-01-10",
    uploadedBy: "Admin",
    description: "Giới thiệu khu vực tiếp tân và phòng chờ",
    tags: ["tour", "tiếp tân", "phòng chờ"],
  },
];

// Videos - Testimonials
const testimonialVideos: Asset[] = [
  {
    id: "v3",
    name: "Cảm nhận Khách hàng - Chị Nguyễn Lan",
    type: "video",
    category: "Testimonial",
    subcategory: "Testimonials",
    thumbnail: "",
    size: "156 MB",
    duration: "2:15",
    format: "MP4",
    downloads: 67,
    views: 1234,
    uploadedAt: "2024-01-08",
    uploadedBy: "Admin",
    description: "Chị Lan chia sẻ trải nghiệm niềng răng tại Greenfield Dental",
    tags: ["testimonial", "khách hàng", "niềng răng"],
  },
  {
    id: "v4",
    name: "Cảm nhận Khách hàng - Anh Trần Việt",
    type: "video",
    category: "Testimonial",
    subcategory: "Testimonials",
    thumbnail: "",
    size: "134 MB",
    duration: "1:58",
    format: "MP4",
    downloads: 54,
    views: 987,
    uploadedAt: "2024-01-06",
    uploadedBy: "Admin",
    description: "Anh Việt chia sẻ về dịch vụ implant tại phòng khám",
    tags: ["testimonial", "khách hàng", "implant"],
  },
  {
    id: "v5",
    name: "Cảm nhận Khách hàng - Bé Mai Anh",
    type: "video",
    category: "Testimonial",
    subcategory: "Testimonials",
    thumbnail: "",
    size: "98 MB",
    duration: "1:25",
    format: "MP4",
    downloads: 78,
    views: 1456,
    uploadedAt: "2024-01-04",
    uploadedBy: "Admin",
    description: "Phụ huynh chia sẻ trải nghiệm khám răng cho bé",
    tags: ["testimonial", "trẻ em", "gia đình"],
  },
];

// Videos - Procedure Videos
const procedureVideos: Asset[] = [
  {
    id: "v6",
    name: "Quy trình Tẩy trắng răng",
    type: "video",
    category: "Procedure",
    subcategory: "Procedure Videos",
    thumbnail: "",
    size: "178 MB",
    duration: "4:30",
    format: "MP4",
    downloads: 123,
    views: 2345,
    uploadedAt: "2024-01-02",
    uploadedBy: "Admin",
    description: "Video hướng dẫn quy trình tẩy trắng răng chuyên nghiệp",
    tags: ["quy trình", "tẩy trắng", "hướng dẫn"],
  },
  {
    id: "v7",
    name: "Quy trình Cấy ghép Implant",
    type: "video",
    category: "Procedure",
    subcategory: "Procedure Videos",
    thumbnail: "",
    size: "234 MB",
    duration: "6:15",
    format: "MP4",
    downloads: 156,
    views: 3456,
    uploadedAt: "2023-12-28",
    uploadedBy: "Admin",
    description: "Giải thích chi tiết quy trình cấy ghép implant",
    tags: ["quy trình", "implant", "phẫu thuật"],
  },
  {
    id: "v8",
    name: "Hướng dẫn Vệ sinh răng miệng đúng cách",
    type: "video",
    category: "Procedure",
    subcategory: "Procedure Videos",
    thumbnail: "",
    size: "89 MB",
    duration: "2:45",
    format: "MP4",
    downloads: 234,
    views: 4567,
    uploadedAt: "2023-12-25",
    uploadedBy: "Admin",
    description: "Video hướng dẫn cách chải răng và dùng chỉ nha khoa",
    tags: ["hướng dẫn", "vệ sinh", "chăm sóc"],
  },
];

// Templates - Social Media
const socialMediaTemplates: Asset[] = [
  {
    id: "t1",
    name: "Template Facebook - Khuyến mãi Tháng",
    type: "template",
    category: "Social Media",
    subcategory: "Social Media Templates",
    thumbnail: "",
    size: "25 MB",
    dimensions: "1200 x 630",
    format: "PSD",
    downloads: 256,
    views: 1890,
    uploadedAt: "2024-01-15",
    uploadedBy: "Admin",
    description: "Template Facebook post cho các chương trình khuyến mãi hàng tháng",
    tags: ["facebook", "khuyến mãi", "template"],
  },
  {
    id: "t2",
    name: "Template Instagram - Tips Nha khoa",
    type: "template",
    category: "Social Media",
    subcategory: "Social Media Templates",
    thumbnail: "",
    size: "18 MB",
    dimensions: "1080 x 1080",
    format: "PSD",
    downloads: 198,
    views: 1456,
    uploadedAt: "2024-01-14",
    uploadedBy: "Admin",
    description: "Template carousel cho các tips chăm sóc răng miệng",
    tags: ["instagram", "tips", "carousel"],
  },
  {
    id: "t3",
    name: "Template Story - Trước và Sau",
    type: "template",
    category: "Social Media",
    subcategory: "Social Media Templates",
    thumbnail: "",
    size: "12 MB",
    dimensions: "1080 x 1920",
    format: "PSD",
    downloads: 167,
    views: 1234,
    uploadedAt: "2024-01-12",
    uploadedBy: "Admin",
    description: "Template story cho các case trước và sau điều trị",
    tags: ["story", "trước sau", "template"],
  },
  {
    id: "t4",
    name: "Template Zalo OA - Thông báo Lịch hẹn",
    type: "template",
    category: "Social Media",
    subcategory: "Social Media Templates",
    thumbnail: "",
    size: "8 MB",
    dimensions: "800 x 600",
    format: "PSD",
    downloads: 134,
    views: 890,
    uploadedAt: "2024-01-10",
    uploadedBy: "Admin",
    description: "Template tin nhắn Zalo OA nhắc lịch hẹn",
    tags: ["zalo", "lịch hẹn", "thông báo"],
  },
];

// Templates - Email
const emailTemplates: Asset[] = [
  {
    id: "t5",
    name: "Email - Chào mừng Khách hàng mới",
    type: "template",
    category: "Email",
    subcategory: "Email Templates",
    thumbnail: "",
    size: "5 MB",
    format: "HTML",
    downloads: 145,
    views: 678,
    uploadedAt: "2024-01-08",
    uploadedBy: "Admin",
    description: "Template email chào mừng khách hàng đăng ký mới",
    tags: ["email", "welcome", "khách hàng"],
  },
  {
    id: "t6",
    name: "Email - Newsletter Tháng",
    type: "template",
    category: "Email",
    subcategory: "Email Templates",
    thumbnail: "",
    size: "8 MB",
    format: "HTML",
    downloads: 123,
    views: 567,
    uploadedAt: "2024-01-06",
    uploadedBy: "Admin",
    description: "Template newsletter hàng tháng với các tips và tin tức",
    tags: ["email", "newsletter", "monthly"],
  },
  {
    id: "t7",
    name: "Email - Nhắc lịch Tái khám",
    type: "template",
    category: "Email",
    subcategory: "Email Templates",
    thumbnail: "",
    size: "4 MB",
    format: "HTML",
    downloads: 178,
    views: 789,
    uploadedAt: "2024-01-04",
    uploadedBy: "Admin",
    description: "Template email nhắc lịch tái khám định kỳ",
    tags: ["email", "nhắc lịch", "tái khám"],
  },
];

// Templates - Print
const printTemplates: Asset[] = [
  {
    id: "t8",
    name: "Brochure - Giới thiệu Dịch vụ",
    type: "template",
    category: "Print",
    subcategory: "Print Templates",
    thumbnail: "",
    size: "45 MB",
    dimensions: "A4 Tri-fold",
    format: "AI",
    downloads: 89,
    views: 456,
    uploadedAt: "2024-01-02",
    uploadedBy: "Admin",
    description: "Template brochure giới thiệu các dịch vụ của phòng khám",
    tags: ["brochure", "in ấn", "dịch vụ"],
  },
  {
    id: "t9",
    name: "Poster - Khuyến mãi A2",
    type: "template",
    category: "Print",
    subcategory: "Print Templates",
    thumbnail: "",
    size: "35 MB",
    dimensions: "420 x 594 mm",
    format: "AI",
    downloads: 67,
    views: 345,
    uploadedAt: "2023-12-28",
    uploadedBy: "Admin",
    description: "Template poster khuyến mãi kích thước A2",
    tags: ["poster", "in ấn", "khuyến mãi"],
  },
  {
    id: "t10",
    name: "Danh thiếp - Business Card",
    type: "template",
    category: "Print",
    subcategory: "Print Templates",
    thumbnail: "",
    size: "12 MB",
    dimensions: "90 x 55 mm",
    format: "AI",
    downloads: 156,
    views: 678,
    uploadedAt: "2023-12-25",
    uploadedBy: "Admin",
    description: "Template danh thiếp cho bác sĩ và nhân viên",
    tags: ["danh thiếp", "in ấn", "business card"],
  },
  {
    id: "t11",
    name: "Standee - Roll-up Banner",
    type: "template",
    category: "Print",
    subcategory: "Print Templates",
    thumbnail: "",
    size: "55 MB",
    dimensions: "80 x 200 cm",
    format: "AI",
    downloads: 45,
    views: 234,
    uploadedAt: "2023-12-20",
    uploadedBy: "Admin",
    description: "Template standee cho sự kiện và quảng cáo",
    tags: ["standee", "in ấn", "banner"],
  },
];

// Combine all assets
const allPhotos = [
  ...clinicPhotos,
  ...teamPhotos,
  ...equipmentPhotos,
  ...beforeAfterPhotos,
  ...stockPhotos,
];

const allVideos = [...clinicTourVideos, ...testimonialVideos, ...procedureVideos];

const allTemplates = [...socialMediaTemplates, ...emailTemplates, ...printTemplates];

const photoCategories = [
  "All",
  "Clinic Photos",
  "Team Photos",
  "Equipment",
  "Before/After",
  "Stock Photos",
];
const videoCategories = ["All", "Clinic Tour", "Testimonials", "Procedure Videos"];
const templateCategories = ["All", "Social Media Templates", "Email Templates", "Print Templates"];

export default function AssetLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [photoFilter, setPhotoFilter] = useState("All");
  const [videoFilter, setVideoFilter] = useState("All");
  const [templateFilter, setTemplateFilter] = useState("All");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filterAssets = (assets: Asset[], filter: string, query: string) => {
    return assets.filter((asset) => {
      const matchesFilter = filter === "All" || asset.subcategory === filter;
      const matchesQuery =
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        asset.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      return matchesFilter && matchesQuery;
    });
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

    let currentList: Asset[] = [];
    if (selectedAsset.type === "photo") currentList = allPhotos;
    else if (selectedAsset.type === "video") currentList = allVideos;
    else currentList = allTemplates;

    const currentIndex = currentList.findIndex((a) => a.id === selectedAsset.id);
    let newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0) newIndex = currentList.length - 1;
    if (newIndex >= currentList.length) newIndex = 0;

    setSelectedAsset(currentList[newIndex]);
  };

  const AssetCard = ({ asset }: { asset: Asset }) => (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => openPreview(asset)}
    >
      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
        {asset.type === "photo" && (
          <Image className="h-12 w-12 text-muted-foreground/50" />
        )}
        {asset.type === "video" && (
          <div className="relative">
            <Video className="h-12 w-12 text-muted-foreground/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                <Play className="h-4 w-4 text-white ml-0.5" />
              </div>
            </div>
          </div>
        )}
        {asset.type === "template" && (
          <FileText className="h-12 w-12 text-muted-foreground/50" />
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={(e) => e.stopPropagation()}>
            <Eye className="h-4 w-4 mr-1" />
            Xem
          </Button>
          <Button size="sm" onClick={(e) => e.stopPropagation()}>
            <Download className="h-4 w-4 mr-1" />
            Tải
          </Button>
        </div>
        {asset.type === "video" && asset.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {asset.duration}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-medium text-sm truncate" title={asset.name}>
          {asset.name}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-xs">
            {asset.category}
          </Badge>
          <span className="text-xs text-muted-foreground">{asset.size}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {asset.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {asset.views}
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
        <div className="w-20 h-14 bg-gradient-to-br from-muted to-muted/50 rounded flex items-center justify-center relative">
          {asset.type === "photo" && (
            <Image className="h-6 w-6 text-muted-foreground/50" />
          )}
          {asset.type === "video" && (
            <div className="relative">
              <Video className="h-6 w-6 text-muted-foreground/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-3 w-3 text-primary" />
              </div>
            </div>
          )}
          {asset.type === "template" && (
            <FileText className="h-6 w-6 text-muted-foreground/50" />
          )}
        </div>
        <div>
          <h4 className="font-medium">{asset.name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary" className="text-xs">
              {asset.category}
            </Badge>
            <span className="text-xs text-muted-foreground">{asset.size}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Download className="h-3 w-3" />
              {asset.downloads}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {asset.views}
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
        <Button size="sm" onClick={(e) => e.stopPropagation()}>
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
            placeholder="Tìm kiếm assets theo tên hoặc tag..."
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
            <Badge variant="secondary" className="ml-2">
              {allPhotos.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Videos
            <Badge variant="secondary" className="ml-2">
              {allVideos.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
            <Badge variant="secondary" className="ml-2">
              {allTemplates.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {photoCategories.map((cat) => (
              <Button
                key={cat}
                variant={photoFilter === cat ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPhotoFilter(cat)}
              >
                {cat === "All" ? "Tất cả" : cat}
              </Button>
            ))}
          </div>
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filterAssets(allPhotos, photoFilter, searchQuery).map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filterAssets(allPhotos, photoFilter, searchQuery).map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          )}
          {filterAssets(allPhotos, photoFilter, searchQuery).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy ảnh phù hợp</p>
            </div>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {videoCategories.map((cat) => (
              <Button
                key={cat}
                variant={videoFilter === cat ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setVideoFilter(cat)}
              >
                {cat === "All" ? "Tất cả" : cat}
              </Button>
            ))}
          </div>
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filterAssets(allVideos, videoFilter, searchQuery).map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filterAssets(allVideos, videoFilter, searchQuery).map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          )}
          {filterAssets(allVideos, videoFilter, searchQuery).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy video phù hợp</p>
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {templateCategories.map((cat) => (
              <Button
                key={cat}
                variant={templateFilter === cat ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTemplateFilter(cat)}
              >
                {cat === "All" ? "Tất cả" : cat}
              </Button>
            ))}
          </div>
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filterAssets(allTemplates, templateFilter, searchQuery).map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filterAssets(allTemplates, templateFilter, searchQuery).map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          )}
          {filterAssets(allTemplates, templateFilter, searchQuery).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy template phù hợp</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Asset Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedAsset && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedAsset.name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedAsset.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Preview Area */}
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                    {selectedAsset.type === "photo" && (
                      <Image className="h-20 w-20 text-muted-foreground/30" />
                    )}
                    {selectedAsset.type === "video" && (
                      <div className="relative">
                        <Video className="h-20 w-20 text-muted-foreground/30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                            <Play className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedAsset.type === "template" && (
                      <FileText className="h-20 w-20 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Navigation Arrows */}
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
                </div>

                {/* Asset Details */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge>{selectedAsset.type.toUpperCase()}</Badge>
                      <Badge variant="secondary">{selectedAsset.category}</Badge>
                      <Badge variant="outline">{selectedAsset.format}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="h-4 w-4" />
                        <span>Kích thước: {selectedAsset.size}</span>
                      </div>
                      {selectedAsset.dimensions && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Image className="h-4 w-4" />
                          <span>{selectedAsset.dimensions}</span>
                        </div>
                      )}
                      {selectedAsset.duration && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Thời lượng: {selectedAsset.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(selectedAsset.uploadedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Download className="h-4 w-4" />
                        <span>{selectedAsset.downloads} downloads</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{selectedAsset.views} views</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAsset.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Chia sẻ
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Tải lên bởi: {selectedAsset.uploadedBy}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
