"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Send,
  ArrowUp,
  Filter,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { PageEmpty } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";

type IdeaStatus = "submitted" | "reviewing" | "approved" | "implemented" | "rejected";
type IdeaCategory = "content_format" | "process_improvement" | "new_platform" | "campaign_concept" | "automation";
type SortBy = "recent" | "top_voted" | "most_discussed";

const getStatusConfig = (t: ReturnType<typeof useLanguage>["t"]) => ({
  submitted: { label: t.proposals.statuses.submitted, color: "bg-blue-100 text-blue-700", icon: Clock },
  reviewing: { label: t.proposals.statuses.underReview, color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: t.proposals.statuses.approved, color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  implemented: { label: t.common.completed, color: "bg-green-100 text-green-700", icon: Rocket },
  rejected: { label: t.proposals.statuses.rejected, color: "bg-gray-100 text-gray-700", icon: Clock },
});

const categoryLabels: Record<IdeaCategory, string> = {
  content_format: "Content Format",
  process_improvement: "Process Improvement",
  new_platform: "New Platform",
  campaign_concept: "Campaign Concept",
  automation: "Automation",
};

export default function InnovationIdeasPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const statusConfig = getStatusConfig(t);
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Form state
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [ideaCategory, setIdeaCategory] = useState<IdeaCategory>("content_format");

  const utils = trpc.useUtils();

  // Fetch all ideas with sorting and filtering
  const { data: allIdeas, isLoading, error, refetch } = trpc.gamification.getAllIdeas.useQuery({
    sortBy,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  // Fetch my points for stats
  const { data: pointsData } = trpc.gamification.getMyPoints.useQuery();

  // Fetch selected idea details
  const { data: selectedIdea } = trpc.gamification.getIdeaById.useQuery(
    { id: selectedIdeaId ?? "" },
    { enabled: !!selectedIdeaId && isDetailOpen }
  );

  // Submit idea mutation
  const submitIdeaMutation = trpc.gamification.submitIdea.useMutation({
    onSuccess: () => {
      utils.gamification.getAllIdeas.invalidate();
      utils.gamification.getMyPoints.invalidate();
      setIsNewIdeaOpen(false);
      setIdeaTitle("");
      setIdeaDescription("");
      setIdeaCategory("content_format");
      toast.success("Y tuong da duoc gui! +30 diem");
    },
    onError: (err) => toast.error(err.message),
  });

  // Vote mutation
  const voteMutation = trpc.gamification.voteForIdea.useMutation({
    onSuccess: () => {
      utils.gamification.getAllIdeas.invalidate();
      utils.gamification.getIdeaById.invalidate();
      toast.success("Da vote! +2 diem");
    },
    onError: (err) => toast.error(err.message),
  });

  // Remove vote mutation
  const removeVoteMutation = trpc.gamification.removeVote.useMutation({
    onSuccess: () => {
      utils.gamification.getAllIdeas.invalidate();
      utils.gamification.getIdeaById.invalidate();
      toast.success("Da bo vote");
    },
    onError: (err) => toast.error(err.message),
  });

  // Add comment mutation
  const addCommentMutation = trpc.gamification.addIdeaComment.useMutation({
    onSuccess: () => {
      utils.gamification.getIdeaById.invalidate();
      utils.gamification.getAllIdeas.invalidate();
      setNewComment("");
      setReplyTo(null);
      toast.success("Da them comment! +3 diem");
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

  const handleVote = (ideaId: string, hasVoted: boolean) => {
    if (hasVoted) {
      removeVoteMutation.mutate({ ideaId });
    } else {
      voteMutation.mutate({ ideaId });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedIdeaId) return;
    addCommentMutation.mutate({
      ideaId: selectedIdeaId,
      content: newComment,
      parentId: replyTo ?? undefined,
    });
  };

  const openIdeaDetail = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setIsDetailOpen(true);
    setNewComment("");
    setReplyTo(null);
  };

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) return <PageError error={error} onRetry={refetch} />;

  const ideas = allIdeas ?? [];

  const stats = {
    total: ideas.length,
    implemented: ideas.filter((i) => i.status === "implemented").length,
    totalPoints: pointsData?.points?.totalPoints ?? 0,
    totalVotes: ideas.reduce((sum, i) => sum + (i._count?.votes ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.proposals.ideas.title}</h1>
          <p className="text-muted-foreground">
            {t.proposals.ideas.subtitle}
          </p>
        </div>
        <Dialog open={isNewIdeaOpen} onOpenChange={setIsNewIdeaOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.proposals.ideas.submitIdea}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[100vw] sm:max-w-[500px] w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.proposals.ideas.submitIdea}</DialogTitle>
              <DialogDescription>
                {t.proposals.ideas.subtitle}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="idea-title">{t.proposals.new.proposalTitle}</Label>
                <Input
                  id="idea-title"
                  placeholder={t.proposals.new.proposalTitle}
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idea-category">{t.proposals.new.category}</Label>
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
                <Label htmlFor="idea-description">{t.proposals.new.proposalDescription}</Label>
                <Textarea
                  id="idea-description"
                  placeholder={t.proposals.new.proposalDescription}
                  rows={5}
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewIdeaOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button
                onClick={handleSubmitIdea}
                disabled={submitIdeaMutation.isPending}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {submitIdeaMutation.isPending ? t.common.loading : t.proposals.ideas.submitIdea}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">{t.proposals.ideas.title}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <ThumbsUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalVotes}</p>
              <p className="text-sm text-muted-foreground">Tong so vote</p>
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
              <p className="text-sm text-muted-foreground">{t.common.completed}</p>
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
              <p className="text-sm text-muted-foreground">{t.gamification.points.earned}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.common.all} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              <SelectItem value="content_format">Content Format</SelectItem>
              <SelectItem value="process_improvement">Process Improvement</SelectItem>
              <SelectItem value="new_platform">New Platform</SelectItem>
              <SelectItem value="campaign_concept">Campaign Concept</SelectItem>
              <SelectItem value="automation">Automation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sap xep" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Moi nhat</SelectItem>
              <SelectItem value="top_voted">Nhieu vote nhat</SelectItem>
              <SelectItem value="most_discussed">Nhieu binh luan nhat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <PageEmpty
          icon={Lightbulb}
          title={t.proposals.ideas.noIdeas}
          description={t.proposals.ideas.subtitle}
          action={
            selectedCategory === "all"
              ? { label: t.proposals.ideas.submitIdea, onClick: () => setIsNewIdeaOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ideas.map((idea) => {
            const status = (idea.status as IdeaStatus) ?? "submitted";
            const statusInfo = statusConfig[status] ?? statusConfig.submitted;
            const StatusIcon = statusInfo.icon;
            const category = idea.category as IdeaCategory;
            const hasVoted = idea.votes && idea.votes.length > 0;
            const voteCount = idea._count?.votes ?? 0;
            const commentCount = idea._count?.comments ?? 0;

            return (
              <Card key={idea.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openIdeaDetail(idea.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {categoryLabels[category] ?? idea.category}
                      </Badge>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    {/* Vote button */}
                    <Button
                      variant={hasVoted ? "default" : "outline"}
                      size="sm"
                      className={`gap-1 ${hasVoted ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(idea.id, hasVoted);
                      }}
                      disabled={voteMutation.isPending || removeVoteMutation.isPending}
                    >
                      <ArrowUp className={`h-4 w-4 ${hasVoted ? "fill-current" : ""}`} />
                      {voteCount}
                    </Button>
                  </div>

                  {/* Submitter info */}
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={idea.submitter?.avatar ?? ""} />
                      <AvatarFallback className="text-xs">
                        {idea.submitter?.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{idea.submitter?.name}</span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {commentCount}
                      </span>
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
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t text-sm text-muted-foreground">
                    {t.proposals.submittedAt}{" "}
                    {format(new Date(idea.createdAt), "dd/MM/yyyy")}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Idea Detail Dialog with Comments */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-3xl w-full max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
          {selectedIdea && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {categoryLabels[selectedIdea.category as IdeaCategory] ?? selectedIdea.category}
                    </Badge>
                    <Badge className={(statusConfig[selectedIdea.status as IdeaStatus] ?? statusConfig.submitted).color}>
                      {(statusConfig[selectedIdea.status as IdeaStatus] ?? statusConfig.submitted).label}
                    </Badge>
                  </div>
                  <Button
                    variant={selectedIdea.votes && selectedIdea.votes.length > 0 ? "default" : "outline"}
                    size="sm"
                    className={`gap-1 ${selectedIdea.votes && selectedIdea.votes.length > 0 ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                    onClick={() => handleVote(selectedIdea.id, !!(selectedIdea.votes && selectedIdea.votes.length > 0))}
                    disabled={voteMutation.isPending || removeVoteMutation.isPending}
                  >
                    <ArrowUp className={`h-4 w-4 ${selectedIdea.votes && selectedIdea.votes.length > 0 ? "fill-current" : ""}`} />
                    {selectedIdea._count?.votes ?? 0} votes
                  </Button>
                </div>
                <DialogTitle className="text-xl">{selectedIdea.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedIdea.submitter?.avatar ?? ""} />
                    <AvatarFallback className="text-xs">
                      {selectedIdea.submitter?.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedIdea.submitter?.name}</span>
                  <span>-</span>
                  <span>{format(new Date(selectedIdea.createdAt), "dd/MM/yyyy")}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Description */}
                <div>
                  <Label className="text-sm text-muted-foreground">Mo ta</Label>
                  <p className="mt-2 text-sm p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
                    {selectedIdea.description}
                  </p>
                </div>

                {/* Impact Score if available */}
                {selectedIdea.impactScore && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Impact Score</Label>
                    <p className="mt-1 text-lg font-semibold text-blue-600">{selectedIdea.impactScore}/10</p>
                  </div>
                )}

                {/* Comments Section */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">
                    Binh luan ({selectedIdea.comments?.length ?? 0})
                  </Label>

                  {/* Comment Input */}
                  <div className="flex gap-2 mb-4">
                    <Textarea
                      placeholder={replyTo ? "Tra loi binh luan..." : "Them binh luan..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={addCommentMutation.isPending || !newComment.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      {replyTo && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyTo(null)}
                        >
                          Huy
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {selectedIdea.comments?.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author?.avatar ?? ""} />
                            <AvatarFallback className="text-xs">
                              {comment.author?.name?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{comment.author?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), "dd/MM HH:mm")}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs mt-1 h-auto py-1 px-2"
                              onClick={() => setReplyTo(comment.id)}
                            >
                              Tra loi
                            </Button>
                          </div>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-10 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3 p-2 bg-muted/20 rounded-lg">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={reply.author?.avatar ?? ""} />
                                  <AvatarFallback className="text-xs">
                                    {reply.author?.name?.charAt(0) ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">{reply.author?.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(reply.createdAt), "dd/MM HH:mm")}
                                    </span>
                                  </div>
                                  <p className="text-sm">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {(!selectedIdea.comments || selectedIdea.comments.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Chua co binh luan nao
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  {t.common.close}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
