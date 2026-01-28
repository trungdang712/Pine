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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ProposalCategory = "content" | "design" | "video" | "campaign" | "event" | "partnership";
type ProposalPriority = "urgent" | "high" | "normal" | "low";

export default function NewProposalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "" as string,
    priority: "normal" as string,
    description: "",
    budget: "",
    dueDate: "",
    expectedOutcome: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();

  const createProposal = trpc.proposal.create.useMutation({
    onSuccess: () => {
      utils.proposal.getMyProposals.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
      setIsSubmitting(false);
    },
  });

  const submitProposal = trpc.proposal.submit.useMutation({
    onSuccess: () => {
      utils.proposal.getMyProposals.invalidate();
      utils.proposal.getPendingApprovals.invalidate();
      toast.success("De xuat da duoc gui de duyet");
      router.push("/proposals");
    },
    onError: (err) => {
      toast.error(err.message);
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("Vui long nhap tieu de");
      return false;
    }
    if (!formData.category) {
      toast.error("Vui long chon danh muc");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Vui long nhap mo ta");
      return false;
    }
    return true;
  };

  const buildMutationInput = () => {
    const budgetNum = formData.budget
      ? parseFloat(formData.budget.replace(/[^0-9.]/g, ""))
      : undefined;

    return {
      title: formData.title.trim(),
      description: formData.description.trim() +
        (formData.expectedOutcome.trim()
          ? `\n\nKet qua mong doi: ${formData.expectedOutcome.trim()}`
          : ""),
      category: formData.category as ProposalCategory,
      priority: formData.priority as ProposalPriority,
      budget: budgetNum && !isNaN(budgetNum) ? budgetNum : undefined,
      dueDate: formData.dueDate
        ? new Date(formData.dueDate).toISOString()
        : undefined,
    };
  };

  const handleSaveDraft = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    createProposal.mutate(buildMutationInput(), {
      onSuccess: () => {
        toast.success("Ban nhap da duoc luu");
        router.push("/proposals");
      },
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    createProposal.mutate(buildMutationInput(), {
      onSuccess: (data) => {
        // After creating, submit for approval
        submitProposal.mutate({ id: data.id });
      },
    });
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
          <h1 className="text-2xl font-bold">Tao de xuat moi</h1>
          <p className="text-muted-foreground">
            Dien thong tin chi tiet de gui de xuat
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thong tin de xuat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">
              Tieu de <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Nhap tieu de de xuat..."
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                Danh muc <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(v) => handleSelectChange("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chon danh muc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="video">Video Production</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>
                Do uu tien <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => handleSelectChange("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chon do uu tien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Khan cap - Can xu ly ngay</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="normal">Binh thuong</SelectItem>
                  <SelectItem value="low">Thap - Co the cho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">
              Mo ta chi tiet <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mo ta muc tieu, pham vi va cac hoat dong chinh cua de xuat..."
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
            />
            <p className="text-xs text-muted-foreground">
              Mo ta cang chi tiet, de xuat cang de duoc phe duyet
            </p>
          </div>

          {/* Budget & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">
                Ngan sach du kien
              </Label>
              <Input
                id="budget"
                name="budget"
                placeholder="VD: 50000000"
                value={formData.budget}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">Nhap so (VND)</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">
                Han hoan thanh
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Expected Outcome */}
          <div className="grid gap-2">
            <Label htmlFor="expectedOutcome">
              Ket qua mong doi
            </Label>
            <Textarea
              id="expectedOutcome"
              name="expectedOutcome"
              placeholder="Mo ta cac KPI, metrics hoac ket qua cu the mong doi dat duoc..."
              rows={3}
              value={formData.expectedOutcome}
              onChange={handleInputChange}
            />
          </div>

          {/* Tips */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Meo de de xuat duoc duyet nhanh</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- Mo ta ro rang van de can giai quyet</li>
              <li>- Dua ra cac so lieu cu the ve ket qua mong doi</li>
              <li>- Giai thich tai sao ngan sach nay la hop ly</li>
              <li>- Neu ro timeline va cac milestone quan trong</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/proposals">
          <Button variant="outline">Huy</Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {createProposal.isPending && !submitProposal.isPending
              ? "Dang luu..."
              : "Luu ban nhap"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting && submitProposal.isPending
              ? "Dang gui..."
              : "Gui duyet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
