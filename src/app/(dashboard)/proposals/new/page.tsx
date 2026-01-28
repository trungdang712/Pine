"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Send, FileText } from "lucide-react";
import Link from "next/link";

export default function NewProposalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "normal",
    description: "",
    budget: "",
    timeline: "",
    expectedOutcome: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveDraft = () => {
    // Save draft logic
    router.push("/proposals");
  };

  const handleSubmit = () => {
    // Submit logic
    router.push("/proposals");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/proposals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Tạo đề xuất mới</h1>
          <p className="text-muted-foreground">
            Điền thông tin chi tiết để gửi đề xuất
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thông tin đề xuất
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Nhập tiêu đề đề xuất..."
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                Danh mục <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(v) => handleSelectChange("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing-campaign">Marketing Campaign</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="video">Video Production</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>
                Độ ưu tiên <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => handleSelectChange("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Cao - Cần xử lý ngay</SelectItem>
                  <SelectItem value="normal">Bình thường</SelectItem>
                  <SelectItem value="low">Thấp - Có thể chờ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mô tả mục tiêu, phạm vi và các hoạt động chính của đề xuất..."
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
            />
            <p className="text-xs text-muted-foreground">
              Mô tả càng chi tiết, đề xuất càng dễ được phê duyệt
            </p>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">
                Ngân sách dự kiến <span className="text-red-500">*</span>
              </Label>
              <Input
                id="budget"
                name="budget"
                placeholder="VD: 50,000,000 VNĐ"
                value={formData.budget}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeline">
                Thời gian thực hiện <span className="text-red-500">*</span>
              </Label>
              <Input
                id="timeline"
                name="timeline"
                placeholder="VD: 15/01 - 15/02/2024"
                value={formData.timeline}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Expected Outcome */}
          <div className="grid gap-2">
            <Label htmlFor="expectedOutcome">
              Kết quả mong đợi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="expectedOutcome"
              name="expectedOutcome"
              placeholder="Mô tả các KPI, metrics hoặc kết quả cụ thể mong đợi đạt được..."
              rows={3}
              value={formData.expectedOutcome}
              onChange={handleInputChange}
            />
          </div>

          {/* Tips */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">💡 Mẹo để đề xuất được duyệt nhanh</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Mô tả rõ ràng vấn đề cần giải quyết</li>
              <li>• Đưa ra các số liệu cụ thể về kết quả mong đợi</li>
              <li>• Giải thích tại sao ngân sách này là hợp lý</li>
              <li>• Nêu rõ timeline và các milestone quan trọng</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/proposals">
          <Button variant="outline">Hủy</Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Lưu bản nháp
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Gửi duyệt
          </Button>
        </div>
      </div>
    </div>
  );
}
