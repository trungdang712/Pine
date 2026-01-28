"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Lightbulb,
  Plus,
  ThumbsUp,
  MessageSquare,
  Rocket,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";

type IdeaStatus = "submitted" | "reviewing" | "approved" | "implemented" | "rejected";
type IdeaCategory = "content_format" | "process_improvement" | "new_platform" | "campaign_concept" | "automation";

const statusConfig: Record<IdeaStatus, { label: string; color: string; icon: typeof Clock }> = {
  submitted: { label: "Da gui", color: "bg-blue-100 text-blue-700", icon: Clock },
  reviewing: { label: "Dang xem xet", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "Da duyet", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  implemented: { label: "Da trien khai", color: "bg-green-100 text-green-700", icon: Rocket },
  rejected: { label: "Khong phu hop", color: "bg-gray-100 text-gray-700", icon: Clock },
};

const categoryLabels: Record<IdeaCategory, string> = {
  content_format: "Content Format",
  process_improvement: "Process Improvement",
  new_platform: "New Platform",
  campaign_concept: "Campaign Concept",
  automation: "Automation",
};

export default function InnovationIdeasPage() {
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Form state
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [ideaCategory, setIdeaCategory] = useState<IdeaCategory>("content_format");

  const utils = trpc.useUtils();

  // Fetch ideas
  const { data: myIdeas, isLoading, error, refetch } = trpc.gamification.getMyIdeas.useQuery();

  // Fetch my points for stats
  const { data: pointsData } = trpc.gamification.getMyPoints.useQuery();

  // Submit idea mutation
  const submitIdeaMutation = trpc.gamification.submitIdea.useMutation({
    onSuccess: () => {
      utils.gamification.getMyIdeas.invalidate();
      utils.gamification.getMyPoints.invalidate();
      setIsNewIdeaOpen(false);
      setIdeaTitle("");
      setIdeaDescription("");
      setIdeaCategory("content_format");
      toast.success("Y tuong da duoc gui! +30 diem");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmitIdea = () => {
    if (!ideaTitle.trim()) {
      toast.error("Vui long nhap tieu de y tuong");
      return;
    }
    if (!ideaDescription.trim() || ideaDescription.trim().length < 10) {
      toast.error("Mo ta phai co it nhat 10 ky tu");
      return;
    }
    submitIdeaMutation.mutate({
      title: ideaTitle.trim(),
      description: ideaDescription.trim(),
      category: ideaCategory,
    });
  };

  if (isLoading) return <PageLoading text="Dang tai y tuong..." />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  const ideas = myIdeas ?? [];

  const filteredIdeas =
    selectedCategory === "all"
      ? ideas
      : ideas.filter((idea) => idea.category === selectedCategory);

  const stats = {
    total: ideas.length,
    implemented: ideas.filter((i) => i.status === "implemented").length,
    totalPoints: pointsData?.points?.totalPoints ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Innovation Ideas</h1>
          <p className="text-muted-foreground">
            Dong gop y tuong sang tao va nhan diem thuong
          </p>
        </div>
        <Dialog open={isNewIdeaOpen} onOpenChange={setIsNewIdeaOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Gui y tuong
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[100vw] sm:max-w-[500px] w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gui y tuong moi</DialogTitle>
              <DialogDescription>
                Chia se y tuong sang tao cua ban. Neu duoc trien khai, ban se nhan duoc diem thuong!
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="idea-title">Tieu de y tuong</Label>
                <Input
                  id="idea-title"
                  placeholder="Nhap tieu de ngan gon..."
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idea-category">Danh muc</Label>
                <Select
                  value={ideaCategory}
                  onValueChange={(v) => setIdeaCategory(v as IdeaCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content_format">Content Format</SelectItem>
                    <SelectItem value="process_improvement">Process Improvement</SelectItem>
                    <SelectItem value="new_platform">New Platform</SelectItem>
                    <SelectItem value="campaign_concept">Campaign Concept</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idea-description">Mo ta chi tiet</Label>
                <Textarea
                  id="idea-description"
                  placeholder="Mo ta y tuong cua ban: van de can giai quyet, giai phap de xuat, loi ich mong doi..."
                  rows={5}
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewIdeaOpen(false)}>
                Huy
              </Button>
              <Button
                onClick={handleSubmitIdea}
                disabled={submitIdeaMutation.isPending}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {submitIdeaMutation.isPending ? "Dang gui..." : "Gui y tuong (+30 diem)"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Tong y tuong</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Rocket className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.implemented}</p>
              <p className="text-sm text-muted-foreground">Da trien khai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
              <p className="text-sm text-muted-foreground">Diem da nhan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tat ca danh muc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca danh muc</SelectItem>
            <SelectItem value="content_format">Content Format</SelectItem>
            <SelectItem value="process_improvement">Process Improvement</SelectItem>
            <SelectItem value="new_platform">New Platform</SelectItem>
            <SelectItem value="campaign_concept">Campaign Concept</SelectItem>
            <SelectItem value="automation">Automation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <PageEmpty
          icon={Lightbulb}
          title="Chua co y tuong nao"
          description={
            selectedCategory !== "all"
              ? "Khong co y tuong nao trong danh muc nay"
              : "Gui y tuong dau tien de nhan diem thuong"
          }
          action={
            selectedCategory === "all"
              ? { label: "Gui y tuong", onClick: () => setIsNewIdeaOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredIdeas.map((idea) => {
            const status = (idea.status as IdeaStatus) ?? "submitted";
            const statusInfo = statusConfig[status] ?? statusConfig.submitted;
            const StatusIcon = statusInfo.icon;
            const category = idea.category as IdeaCategory;

            return (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary">
                      {categoryLabels[category] ?? idea.category}
                    </Badge>
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {idea.impactScore && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{idea.impactScore}/10</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {status === "implemented" && (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          +50 pts
                        </Badge>
                      )}
                      {status === "approved" && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Approved
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t text-sm text-muted-foreground">
                    Gui ngay{" "}
                    {format(new Date(idea.createdAt), "dd/MM/yyyy")}
                    {idea.implementedAt && (
                      <span>
                        {" "}
                        | Trien khai{" "}
                        {format(new Date(idea.implementedAt), "dd/MM/yyyy")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cach thuc hoat dong</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-3">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-1">1. Gui y tuong</h4>
              <p className="text-sm text-muted-foreground">
                Chia se y tuong sang tao cua ban (+30 pts)
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-1">2. Xem xet</h4>
              <p className="text-sm text-muted-foreground">
                Team danh gia tinh kha thi
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-1">3. Phe duyet</h4>
              <p className="text-sm text-muted-foreground">
                Y tuong duoc chap nhan
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                <Rocket className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-1">4. Trien khai</h4>
              <p className="text-sm text-muted-foreground">
                Y tuong duoc thuc hien (+50 pts)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
