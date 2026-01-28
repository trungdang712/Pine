"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

interface ContentOpportunity {
  id: string;
  type: "testimonial" | "before-after" | "event" | "procedure";
  title: string;
  description: string;
  from: string;
  fromEmail: string;
  department: string;
  priority: "high" | "normal" | "low";
  consentStatus: "obtained" | "pending" | "not-required";
  patientName?: string;
  createdAt: string;
  notes?: string;
  status: "new" | "accepted" | "declined" | "needs-info";
  mediaAttached: {
    photos: number;
    videos: number;
    documents: number;
  };
  suggestedContent: string[];
  estimatedReach: string;
}

const mockOpportunities: ContentOpportunity[] = [
  {
    id: "1",
    type: "testimonial",
    title: "Patient testimonial - Implant success",
    description:
      "Patient is very satisfied after implant surgery, agrees to record video testimonial and take before/after photos.",
    from: "Nguyen Van C",
    fromEmail: "vanc@greenfielddental.vn",
    department: "Sales Team",
    priority: "high",
    consentStatus: "obtained",
    patientName: "Nguyen Thi Lan Anh (PT-12458)",
    createdAt: "2024-01-10",
    notes: "Patient is ready to record video and allow photo usage.",
    status: "new",
    mediaAttached: { photos: 6, videos: 1, documents: 2 },
    suggestedContent: [
      "Facebook post with before/after photos",
      "Instagram Reel with video testimonial",
      "Case study for website",
      "Success story email campaign",
    ],
    estimatedReach: "8,000 - 12,000",
  },
  {
    id: "2",
    type: "before-after",
    title: "Before/After case - Teeth whitening",
    description:
      "Teeth whitening case with excellent results. Before/after photos available. Waiting for patient consent confirmation.",
    from: "Tran Thi D",
    fromEmail: "trand@greenfielddental.vn",
    department: "Nurse Team",
    priority: "normal",
    consentStatus: "pending",
    patientName: "Le Van Minh (PT-12461)",
    createdAt: "2024-01-09",
    status: "new",
    mediaAttached: { photos: 4, videos: 0, documents: 1 },
    suggestedContent: [
      "Before/After social media post",
      "Instagram Stories highlight",
      "Zoom whitening promotion",
    ],
    estimatedReach: "5,000 - 8,000",
  },
  {
    id: "3",
    type: "event",
    title: "New branch opening event",
    description:
      "Branch 3 will open on January 20th. Need content coverage for the event including photos and video.",
    from: "Marketing Team",
    fromEmail: "marketing@greenfielddental.vn",
    department: "Admin",
    priority: "high",
    consentStatus: "not-required",
    createdAt: "2024-01-08",
    status: "new",
    mediaAttached: { photos: 0, videos: 0, documents: 3 },
    suggestedContent: [
      "Event announcement post",
      "Live coverage on Facebook",
      "Grand opening video",
      "Press release",
    ],
    estimatedReach: "15,000 - 20,000",
  },
  {
    id: "4",
    type: "procedure",
    title: "Complex wisdom tooth extraction case",
    description:
      "Extraction of 4 impacted wisdom teeth in one session. Patient agrees to video recording for educational content.",
    from: "Dr. Hung",
    fromEmail: "drhung@greenfielddental.vn",
    department: "Surgery",
    priority: "normal",
    consentStatus: "obtained",
    patientName: "Le Van Z (PT-12455)",
    createdAt: "2024-01-07",
    notes: "Patient signed consent form for educational use.",
    status: "accepted",
    mediaAttached: { photos: 12, videos: 2, documents: 2 },
    suggestedContent: [
      "Educational video for YouTube",
      "Procedure highlights reel",
      "Patient experience story",
    ],
    estimatedReach: "10,000 - 15,000",
  },
  {
    id: "5",
    type: "testimonial",
    title: "VIP customer review",
    description:
      "VIP customer who has been using services since 2019 wants to write a detailed review and appear in promotional materials.",
    from: "Mai",
    fromEmail: "mai@greenfielddental.vn",
    department: "Reception",
    priority: "normal",
    consentStatus: "obtained",
    patientName: "Pham Thi A (PT-10234)",
    createdAt: "2024-01-06",
    status: "new",
    mediaAttached: { photos: 2, videos: 0, documents: 1 },
    suggestedContent: [
      "Long-form testimonial post",
      "Customer spotlight video",
      "Google review request",
    ],
    estimatedReach: "6,000 - 9,000",
  },
];

const typeConfig = {
  testimonial: { label: "Testimonial", icon: Mic, color: "bg-purple-100 text-purple-700" },
  "before-after": { label: "Before/After", icon: Camera, color: "bg-blue-100 text-blue-700" },
  event: { label: "Event", icon: Calendar, color: "bg-green-100 text-green-700" },
  procedure: { label: "Procedure", icon: Video, color: "bg-orange-100 text-orange-700" },
};

const priorityConfig = {
  high: { label: "High Priority", color: "bg-red-100 text-red-700", borderColor: "border-l-red-500" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700", borderColor: "" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700", borderColor: "" },
};

const consentConfig = {
  obtained: { label: "Consent Obtained", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "Consent Pending", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  "not-required": { label: "Not Required", color: "bg-gray-100 text-gray-700", icon: FileCheck },
};

const statusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
  "needs-info": { label: "Needs Info", color: "bg-yellow-100 text-yellow-700" },
};

export default function ContentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ContentOpportunity[]>(mockOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ContentOpportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertType, setConvertType] = useState<"task" | "proposal">("task");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [response, setResponse] = useState("");

  const filteredOpportunities = opportunities.filter((o) => {
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: opportunities.length,
    testimonials: opportunities.filter((o) => o.type === "testimonial").length,
    beforeAfter: opportunities.filter((o) => o.type === "before-after").length,
    withConsent: opportunities.filter((o) => o.consentStatus === "obtained").length,
    highPriority: opportunities.filter((o) => o.priority === "high").length,
  };

  const openDetail = (opportunity: ContentOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
    setResponse("");
  };

  const handleAccept = (opportunity: ContentOpportunity) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === opportunity.id ? { ...o, status: "accepted" as const } : o))
    );
    setIsDetailOpen(false);
  };

  const handleDecline = (opportunity: ContentOpportunity) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === opportunity.id ? { ...o, status: "declined" as const } : o))
    );
    setIsDetailOpen(false);
  };

  const handleNeedMoreInfo = (opportunity: ContentOpportunity) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === opportunity.id ? { ...o, status: "needs-info" as const } : o))
    );
    setIsDetailOpen(false);
  };

  const openConvertModal = (type: "task" | "proposal") => {
    setConvertType(type);
    setIsConvertModalOpen(true);
  };

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
              <p className="text-2xl font-bold">{stats.highPriority}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
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
            <SelectItem value="before-after">Before/After</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="procedure">Procedure</SelectItem>
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
            <SelectItem value="needs-info">Needs Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => {
          const typeInfo = typeConfig[opportunity.type];
          const TypeIcon = typeInfo.icon;
          const priorityInfo = priorityConfig[opportunity.priority];
          const consentInfo = consentConfig[opportunity.consentStatus];
          const ConsentIcon = consentInfo.icon;
          const statusInfo = statusConfig[opportunity.status];

          return (
            <Card
              key={opportunity.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                priorityInfo.borderColor ? `border-l-4 ${priorityInfo.borderColor}` : ""
              }`}
              onClick={() => openDetail(opportunity)}
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
                        <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
                        <Badge className={consentInfo.color}>
                          <ConsentIcon className="h-3 w-3 mr-1" />
                          {consentInfo.label}
                        </Badge>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{opportunity.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {opportunity.from} ({opportunity.department})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(opportunity.createdAt).toLocaleDateString()}
                        </span>
                        {opportunity.patientName && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Patient: {opportunity.patientName}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNeedMoreInfo(opportunity);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Need Info
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecline(opportunity);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(opportunity);
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
                          setSelectedOpportunity(opportunity);
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
                          setSelectedOpportunity(opportunity);
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
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={typeConfig[selectedOpportunity.type].color}>
                    {typeConfig[selectedOpportunity.type].label}
                  </Badge>
                  <Badge className={priorityConfig[selectedOpportunity.priority].color}>
                    {priorityConfig[selectedOpportunity.priority].label}
                  </Badge>
                  <Badge className={consentConfig[selectedOpportunity.consentStatus].color}>
                    {consentConfig[selectedOpportunity.consentStatus].label}
                  </Badge>
                  <Badge className={statusConfig[selectedOpportunity.status].color}>
                    {statusConfig[selectedOpportunity.status].label}
                  </Badge>
                </div>
                <DialogTitle>{selectedOpportunity.title}</DialogTitle>
                <DialogDescription>
                  From {selectedOpportunity.from} ({selectedOpportunity.department}) -{" "}
                  {selectedOpportunity.fromEmail}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-6 py-4">
                {/* Main Content */}
                <div className="col-span-2 space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1">{selectedOpportunity.description}</p>
                  </div>

                  {selectedOpportunity.patientName && (
                    <div>
                      <Label className="text-muted-foreground">Patient</Label>
                      <p className="mt-1 font-medium">{selectedOpportunity.patientName}</p>
                    </div>
                  )}

                  {selectedOpportunity.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="mt-1">{selectedOpportunity.notes}</p>
                    </div>
                  )}

                  {/* Media Attached */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Media Attached</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 border rounded">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 text-primary" />
                          <p className="text-xl font-bold">
                            {selectedOpportunity.mediaAttached.photos}
                          </p>
                          <p className="text-xs text-muted-foreground">Photos</p>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <Video className="w-6 h-6 mx-auto mb-1 text-primary" />
                          <p className="text-xl font-bold">
                            {selectedOpportunity.mediaAttached.videos}
                          </p>
                          <p className="text-xs text-muted-foreground">Videos</p>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <FileText className="w-6 h-6 mx-auto mb-1 text-primary" />
                          <p className="text-xl font-bold">
                            {selectedOpportunity.mediaAttached.documents}
                          </p>
                          <p className="text-xs text-muted-foreground">Docs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedOpportunity.status === "new" && (
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
                    </div>
                  )}
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
                        {selectedOpportunity.suggestedContent.map((suggestion, i) => (
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

                  {/* Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Estimated Reach</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedOpportunity.estimatedReach}</p>
                      <p className="text-sm text-muted-foreground">potential audience</p>
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
                      onClick={() => handleNeedMoreInfo(selectedOpportunity)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Need More Info
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDecline(selectedOpportunity)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button onClick={() => handleAccept(selectedOpportunity)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
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
              <Label>Title</Label>
              <Input defaultValue={selectedOpportunity?.title} className="mt-1" />
            </div>
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
                <Input placeholder="Select assignee..." className="mt-1" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" className="mt-1" />
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
                    <SelectItem value="photo">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsConvertModalOpen(false)}>
              {convertType === "task" ? "Create Task" : "Create Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
