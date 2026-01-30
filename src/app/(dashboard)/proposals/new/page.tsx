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
import { useLanguage } from "@/i18n";

type ProposalCategory = "content" | "design" | "video" | "budget" | "campaign" | "event" | "partnership";
type ProposalPriority = "urgent" | "high" | "normal" | "low";

// Categories that require 2-layer approval
const TWO_LAYER_CATEGORIES = ["budget", "campaign", "event", "partnership"];

export default function NewProposalPage() {
  const { t } = useLanguage();
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
          <h1 className="text-2xl font-bold">{t.proposals.new.title}</h1>
          <p className="text-muted-foreground">
            {t.proposals.new.subtitle}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.proposals.proposalDetails}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">
              {t.proposals.new.proposalTitle} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder={t.proposals.new.proposalTitle}
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                {t.proposals.new.category} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(v) => handleSelectChange("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.proposals.new.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Noi dung (1 lop duyet)</SelectItem>
                  <SelectItem value="design">Thiet ke (1 lop duyet)</SelectItem>
                  <SelectItem value="video">Video (1 lop duyet)</SelectItem>
                  <SelectItem value="budget">Ngan sach (2 lop duyet)</SelectItem>
                  <SelectItem value="campaign">Chien dich (2 lop duyet)</SelectItem>
                  <SelectItem value="event">Su kien (2 lop duyet)</SelectItem>
                  <SelectItem value="partnership">Hop tac (2 lop duyet)</SelectItem>
                </SelectContent>
              </Select>
              {formData.category && (
                <p className="text-xs text-muted-foreground mt-1">
                  {TWO_LAYER_CATEGORIES.includes(formData.category)
                    ? "Danh muc nay can duyet 2 lop: Manager -> Admin"
                    : "Danh muc nay chi can duyet 1 lop: Manager"}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>
                {t.tasks.priority} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => handleSelectChange("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.tasks.priority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">{t.tasks.priorities.urgent}</SelectItem>
                  <SelectItem value="high">{t.tasks.priorities.high}</SelectItem>
                  <SelectItem value="normal">{t.tasks.priorities.medium}</SelectItem>
                  <SelectItem value="low">{t.tasks.priorities.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">
              {t.proposals.new.proposalDescription} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t.proposals.new.proposalDescription}
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Budget & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">
                {t.analytics.budget.title}
              </Label>
              <Input
                id="budget"
                name="budget"
                placeholder="VD: 50000000"
                value={formData.budget}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">(VND)</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">
                {t.tasks.dueDate}
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
              {t.performance.goals}
            </Label>
            <Textarea
              id="expectedOutcome"
              name="expectedOutcome"
              placeholder={t.performance.goals}
              rows={3}
              value={formData.expectedOutcome}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/proposals">
          <Button variant="outline">{t.common.cancel}</Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {createProposal.isPending && !submitProposal.isPending
              ? t.common.loading
              : t.proposals.new.saveDraft}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting && submitProposal.isPending
              ? t.common.loading
              : t.proposals.new.submitForReview}
          </Button>
        </div>
      </div>
    </div>
  );
}
