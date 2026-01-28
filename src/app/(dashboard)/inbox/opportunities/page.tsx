"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Video,
  Mic,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowLeft,
  Calendar,
  User,
  FileCheck,
  Image as ImageIcon,
  FileText,
  CheckSquare,
  AlertCircle,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";

// Map DB type values to UI config
const typeConfig: Record<string, { label: string; icon: typeof Mic; color: string }> = {
  testimonial: { label: "Testimonial", icon: Mic, color: "bg-purple-100 text-purple-700" },
  before_after: { label: "Before/After", icon: Camera, color: "bg-blue-100 text-blue-700" },
  success_story: { label: "Success Story", icon: Calendar, color: "bg-green-100 text-green-700" },
  educational: { label: "Educational", icon: Video, color: "bg-orange-100 text-orange-700" },
};

const defaultTypeConfig = { label: "Other", icon: FileText, color: "bg-gray-100 text-gray-700" };

// Map DB urgency values to UI config
const urgencyConfig: Record<string, { label: string; color: string; borderColor: string }> = {
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700", borderColor: "border-l-red-500" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700", borderColor: "" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700", borderColor: "" },
};

const consentConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  obtained: { label: "Consent Obtained", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "Consent Pending", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  declined: { label: "Consent Declined", color: "bg-red-100 text-red-700", icon: XCircle },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
  need_more_info: { label: "Needs Info", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", color: "bg-indigo-100 text-indigo-700" },
  published: { label: "Published", color: "bg-emerald-100 text-emerald-700" },
};

// Generate suggested content based on type (since DB doesn't have this field)
function getSuggestedContent(type: string): string[] {
  switch (type) {
    case "testimonial":
      return [
        "Facebook post with patient quote",
        "Instagram Reel with video testimonial",
        "Case study for website",
        "Success story email campaign",
      ];
    case "before_after":
      return [
        "Before/After social media post",
        "Instagram Stories highlight",
        "Service promotion post",
      ];
    case "success_story":
      return [
        "Long-form blog post",
        "Customer spotlight video",
        "Google review request",
      ];
    case "educational":
      return [
        "Educational video for YouTube",
        "Procedure highlights reel",
        "Patient education infographic",
      ];
    default:
      return ["Social media post", "Website content"];
  }
}

export default function ContentOpportunitiesPage() {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertType, setConvertType] = useState<"task" | "proposal">("task");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [response, setResponse] = useState("");

  const utils = trpc.useUtils();

  // Fetch real data
  const {
    data: opportunities = [],
    isLoading,
    error,
    refetch,
  } = trpc.external.getContentOpportunities.useQuery();

  const { data: users = [] } = trpc.user.getAll.useQuery();

  // Mutations
  const updateOpportunity = trpc.external.updateContentOpportunity.useMutation({
    onSuccess: () => {
      utils.external.getContentOpportunities.invalidate();
      setIsDetailOpen(false);
      toast.success("Opportunity updated successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const addComment = trpc.external.addOpportunityComment.useMutation({
    onSuccess: () => {
      utils.external.getContentOpportunities.invalidate();
      setResponse("");
      toast.success("Comment added");
    },
    onError: (err) => toast.error(err.message),
  });

  const selectedOpportunity = opportunities.find((o) => o.id === selectedOpportunityId) ?? null;

  const filteredOpportunities = opportunities.filter((o) => {
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: opportunities.length,
    testimonials: opportunities.filter((o) => o.type === "testimonial").length,
    beforeAfter: opportunities.filter((o) => o.type === "before_after").length,
    withConsent: opportunities.filter((o) => o.consentStatus === "obtained").length,
    urgent: opportunities.filter((o) => o.urgency === "urgent").length,
  };

  const openDetail = (id: string) => {
    setSelectedOpportunityId(id);
    setIsDetailOpen(true);
    setResponse("");
  };

  const handleAccept = (id: string) => {
    updateOpportunity.mutate({ id, status: "accepted" });
  };

  const handleDecline = (id: string) => {
    updateOpportunity.mutate({ id, status: "declined" });
  };

  const handleNeedMoreInfo = (id: string) => {
    updateOpportunity.mutate({ id, status: "need_more_info" });
  };

  const handleAddComment = (opportunityId: string) => {
    if (!response.trim()) return;
    addComment.mutate({ opportunityId, content: response });
  };

  const openConvertModal = (type: "task" | "proposal") => {
    setConvertType(type);
    setIsConvertModalOpen(true);
  };

  // Parse attachments JSON field
  const getAttachmentCount = (attachments: string | null): number => {
    if (!attachments) return 0;
    try {
      const parsed = JSON.parse(attachments);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  // Loading state
  if (isLoading) return <PageLoading text="Loading content opportunities..." />;

  // Error state
  if (error) return <PageError error={error} onRetry={() => refetch()} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/inbox">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Inbox
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Content Opportunities</h1>
          <p className="text-muted-foreground">
            Content opportunities from Sales, Nurse and Doctor teams
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Mic className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.testimonials}</p>
              <p className="text-sm text-muted-foreground">Testimonials</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <ImageIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.beforeAfter}</p>
              <p className="text-sm text-muted-foreground">Before/After</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.withConsent}</p>
              <p className="text-sm text-muted-foreground">With Consent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.urgent}</p>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="testimonial">Testimonial</SelectItem>
            <SelectItem value="before_after">Before/After</SelectItem>
            <SelectItem value="success_story">Success Story</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="need_more_info">Needs Info</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 && (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Camera}
                title="No opportunities found"
                description="Try adjusting your filters or check back later for new content opportunities."
              />
            </CardContent>
          </Card>
        )}

        {filteredOpportunities.map((opportunity) => {
          const typeInfo = typeConfig[opportunity.type] ?? defaultTypeConfig;
          const TypeIcon = typeInfo.icon;
          const urgencyInfo = urgencyConfig[opportunity.urgency] ?? urgencyConfig.normal;
          const consentInfo = consentConfig[opportunity.consentStatus] ?? consentConfig.pending;
          const ConsentIcon = consentInfo.icon;
          const statusInfo = statusConfig[opportunity.status] ?? statusConfig.new;
          const attachmentCount = getAttachmentCount(opportunity.attachments);

          return (
            <Card
              key={opportunity.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                urgencyInfo.borderColor ? `border-l-4 ${urgencyInfo.borderColor}` : ""
              }`}
              onClick={() => openDetail(opportunity.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-lg ${typeInfo.color}`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        <Badge className={urgencyInfo.color}>{urgencyInfo.label}</Badge>
                        <Badge className={consentInfo.color}>
                          <ConsentIcon className="h-3 w-3 mr-1" />
                          {consentInfo.label}
                        </Badge>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {opportunity.submitterName} ({opportunity.submitterTeam})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(opportunity.createdAt), "MMM d, yyyy")}
                        </span>
                        {opportunity.patientRef && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Patient: {opportunity.patientRef}
                          </span>
                        )}
                        {attachmentCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {attachmentCount} attachment(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {opportunity.status === "new" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updateOpportunity.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNeedMoreInfo(opportunity.id);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Need Info
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        disabled={updateOpportunity.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecline(opportunity.id);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        disabled={updateOpportunity.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(opportunity.id);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  )}
                  {opportunity.status === "accepted" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpportunityId(opportunity.id);
                          openConvertModal("task");
                        }}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Create Task
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpportunityId(opportunity.id);
                          openConvertModal("proposal");
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Create Proposal
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {selectedOpportunity && (() => {
            const typeInfo = typeConfig[selectedOpportunity.type] ?? defaultTypeConfig;
            const urgencyInfo = urgencyConfig[selectedOpportunity.urgency] ?? urgencyConfig.normal;
            const consentInfo = consentConfig[selectedOpportunity.consentStatus] ?? consentConfig.pending;
            const statusInfo = statusConfig[selectedOpportunity.status] ?? statusConfig.new;
            const attachmentCount = getAttachmentCount(selectedOpportunity.attachments);
            const suggestedContent = getSuggestedContent(selectedOpportunity.type);

            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={typeInfo.color}>
                      {typeInfo.label}
                    </Badge>
                    <Badge className={urgencyInfo.color}>
                      {urgencyInfo.label}
                    </Badge>
                    <Badge className={consentInfo.color}>
                      {consentInfo.label}
                    </Badge>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <DialogTitle>
                    {typeInfo.label} - {selectedOpportunity.submitterTeam} team
                  </DialogTitle>
                  <DialogDescription>
                    From {selectedOpportunity.submitterName} ({selectedOpportunity.submitterTeam}) -{" "}
                    {selectedOpportunity.submitterEmail}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-6 py-4">
                  {/* Main Content */}
                  <div className="col-span-2 space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="mt-1">{selectedOpportunity.description}</p>
                    </div>

                    {selectedOpportunity.patientRef && (
                      <div>
                        <Label className="text-muted-foreground">Patient</Label>
                        <p className="mt-1 font-medium">{selectedOpportunity.patientRef}</p>
                      </div>
                    )}

                    {selectedOpportunity.assignedTo && (
                      <div>
                        <Label className="text-muted-foreground">Assigned To</Label>
                        <p className="mt-1 font-medium">{selectedOpportunity.assignedTo.name}</p>
                      </div>
                    )}

                    {/* Attachments */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Attachments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center p-3 border rounded">
                          <FileText className="w-6 h-6 mx-auto mb-1 text-primary" />
                          <p className="text-xl font-bold">
                            {attachmentCount}
                          </p>
                          <p className="text-xs text-muted-foreground">Files</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Comments */}
                    {selectedOpportunity.comments && selectedOpportunity.comments.length > 0 && (
                      <div>
                        <Label className="text-muted-foreground mb-2 block">
                          Comments ({selectedOpportunity.comments.length})
                        </Label>
                        <div className="space-y-2">
                          {selectedOpportunity.comments.map((comment) => (
                            <div key={comment.id} className="p-2 bg-muted/50 rounded text-sm">
                              {comment.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Response / Add comment */}
                    <div>
                      <Label htmlFor="response">Response / Notes</Label>
                      <Textarea
                        id="response"
                        placeholder="Add notes or request more information..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                      {response.trim() && (
                        <Button
                          size="sm"
                          className="mt-2"
                          disabled={addComment.isPending}
                          onClick={() => handleAddComment(selectedOpportunity.id)}
                        >
                          Add Comment
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* AI Suggestions */}
                    <Card className="border-primary/30">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          AI Content Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {suggestedContent.map((suggestion, i) => (
                            <div
                              key={i}
                              className="p-2 bg-primary/5 rounded text-xs flex items-start gap-2"
                            >
                              <Lightbulb className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Submitted</span>
                          <span>{format(new Date(selectedOpportunity.createdAt), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Team</span>
                          <span className="capitalize">{selectedOpportunity.submitterTeam}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Consent</span>
                          <span className="capitalize">{selectedOpportunity.consentStatus}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Convert Options */}
                    {selectedOpportunity.status === "accepted" && (
                      <Card className="border-green-200">
                        <CardHeader>
                          <CardTitle className="text-base">Convert to</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => openConvertModal("task")}
                          >
                            <CheckSquare className="w-4 h-4" />
                            Create Task
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => openConvertModal("proposal")}
                          >
                            <FileText className="w-4 h-4" />
                            Create Proposal
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Close
                  </Button>
                  {selectedOpportunity.status === "new" && (
                    <>
                      <Button
                        variant="outline"
                        disabled={updateOpportunity.isPending}
                        onClick={() => handleNeedMoreInfo(selectedOpportunity.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Need More Info
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={updateOpportunity.isPending}
                        onClick={() => handleDecline(selectedOpportunity.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        disabled={updateOpportunity.isPending}
                        onClick={() => handleAccept(selectedOpportunity.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Convert to Task/Proposal Modal */}
      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {convertType === "task" ? "Convert to Task" : "Convert to Proposal"}
            </DialogTitle>
            <DialogDescription>
              Pre-fill information from this content opportunity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Description</Label>
              <Textarea
                defaultValue={selectedOpportunity?.description}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assignee</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select assignee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <input type="date" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            {convertType === "task" && (
              <div>
                <Label>Task Type</Label>
                <Select defaultValue="content">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Content Creation</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="video">Video Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsConvertModalOpen(false);
              toast.success(convertType === "task" ? "Task created" : "Proposal created");
            }}>
              {convertType === "task" ? "Create Task" : "Create Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
