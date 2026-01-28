"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle, XCircle, MessageSquare, ArrowRight, User, FileText, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Proposal {
  id: number;
  title: string;
  category: string;
  priority: "High" | "Normal" | "Low";
  submittedBy: string;
  submittedDate: string;
  status: "under-review" | "approved" | "rejected" | "draft";
  currentStep: number;
  totalSteps: number;
  description: string;
  budget?: string;
  timeline?: string;
  expectedOutcome?: string;
  approvedDate?: string;
  rejectedDate?: string;
  reason?: string;
}

interface Comment {
  id: string;
  user: string;
  role: string;
  text: string;
  timestamp: string;
  type: "comment" | "approval" | "rejection";
}

export default function ProposalsPage() {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");
  const [approvalComment, setApprovalComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("proposals");

  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 123,
      title: "Campaign: Valentine's Day 2024",
      category: "Campaign",
      priority: "High",
      submittedBy: "Nguyen Van A",
      submittedDate: "Jan 3, 2024",
      status: "under-review",
      currentStep: 2,
      totalSteps: 3,
      description: "De xuat chien dich quang cao Valentine 2024 tren cac nen tang Facebook, Zalo, TikTok voi ngan sach 30,000,000 VND.",
      budget: "30,000,000 VND",
      timeline: "Jan 20 - Feb 14, 2024",
      expectedOutcome: "Tang 50% engagement, 200+ leads moi"
    },
    {
      id: 122,
      title: "Content: Bai viet blog ve nieng rang",
      category: "Content",
      priority: "Normal",
      submittedBy: "Tran Van B",
      submittedDate: "Jan 2, 2024",
      status: "approved",
      currentStep: 3,
      totalSteps: 3,
      approvedDate: "Jan 4, 2024",
      description: "Bai viet chi tiet ve cac phuong phap nieng rang hien dai, SEO-optimized de tang organic traffic.",
      timeline: "Jan 10 - Jan 15, 2024",
      expectedOutcome: "Tang organic traffic 20%, tao authority trong linh vuc nieng rang"
    },
    {
      id: 121,
      title: "Innovation: Su dung Reels cho testimonials",
      category: "Innovation",
      priority: "Normal",
      submittedBy: "Le Thi C",
      submittedDate: "Jan 1, 2024",
      status: "under-review",
      currentStep: 1,
      totalSteps: 3,
      description: "De xuat thu nghiem format Reels/Short-form video cho testimonial cua benh nhan de tang engagement.",
      budget: "5,000,000 VND",
      timeline: "Jan 8 - Jan 31, 2024",
      expectedOutcome: "Test voi 5 videos, danh gia engagement rate"
    },
    {
      id: 120,
      title: "Campaign: Khuyen mai thang 1",
      category: "Campaign",
      priority: "High",
      submittedBy: "Nguyen Van A",
      submittedDate: "Dec 28, 2023",
      status: "rejected",
      currentStep: 2,
      totalSteps: 3,
      rejectedDate: "Jan 2, 2024",
      reason: "Ngan sach chua phu hop voi ke hoach tai chinh Q1. De xuat giam xuong 15M hoac doi sang Q2.",
      description: "Campaign khuyen mai thang 1 voi ngan sach 25M VND",
      budget: "25,000,000 VND"
    },
    {
      id: 119,
      title: "Partnership: Hop tac voi KOL dia phuong",
      category: "Partnership",
      priority: "High",
      submittedBy: "Pham Van D",
      submittedDate: "Dec 25, 2023",
      status: "approved",
      currentStep: 3,
      totalSteps: 3,
      approvedDate: "Dec 30, 2023",
      description: "Hop tac voi 3 KOL dia phuong de review dich vu va tang brand awareness",
      budget: "20,000,000 VND",
      timeline: "Jan 15 - Feb 15, 2024",
      expectedOutcome: "Reach 100K+ nguoi, 50+ conversions"
    },
  ]);

  const innovationIdeas = [
    {
      id: 1,
      title: "Try Reels format for patient testimonials",
      category: "Content",
      submittedBy: "Le Thi C",
      status: "implemented",
      impactScore: 8,
      pointsEarned: 50,
    },
    {
      id: 2,
      title: "Weekly dental tips series on TikTok",
      category: "Content",
      submittedBy: "Nguyen Van A",
      status: "reviewing",
      impactScore: null,
      pointsEarned: null,
    },
    {
      id: 3,
      title: "Partner with local influencers",
      category: "Partnership",
      submittedBy: "Tran Van B",
      status: "approved",
      impactScore: null,
      pointsEarned: null,
    },
  ];

  // Mock comments for proposal detail
  const mockComments: Comment[] = [
    {
      id: "cm1",
      user: "Tran Van B",
      role: "Content Lead",
      text: "Y tuong hay! Da review noi dung va approve tu content team. Budget hop ly.",
      timestamp: "Jan 3, 10:30 AM",
      type: "approval"
    },
    {
      id: "cm2",
      user: "Le Thi C",
      role: "Marketing Manager",
      text: "Can bo sung them KPIs cu the va timeline chi tiet cho tung platform.",
      timestamp: "Jan 3, 2:15 PM",
      type: "comment"
    },
    {
      id: "cm3",
      user: "Nguyen Van A",
      role: "Content Creator",
      text: "Da update timeline va KPIs theo gop y. Moi nguoi check lai nhe!",
      timestamp: "Jan 3, 4:00 PM",
      type: "comment"
    },
  ];

  // Approval workflow stages
  const approvalStages = [
    { step: 1, name: "Content Review", role: "Content Lead" },
    { step: 2, name: "Manager Approval", role: "Marketing Manager" },
    { step: 3, name: "Admin Approval", role: "Admin" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "under-review":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "under-review":
        return "Dang review";
      case "approved":
        return "Da duyet";
      case "rejected":
        return "Tu choi";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const getStatistics = () => {
    const total = proposals.length;
    const underReview = proposals.filter(p => p.status === "under-review").length;
    const approved = proposals.filter(p => p.status === "approved").length;
    const rejected = proposals.filter(p => p.status === "rejected").length;

    return { total, underReview, approved, rejected };
  };

  const stats = getStatistics();

  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailOpen(true);
  };

  const handleApprovalAction = (action: "approve" | "reject") => {
    setApprovalAction(action);
    setIsApprovalModalOpen(true);
  };

  const handleConvertToTask = () => {
    // Logic to convert proposal to task
    console.log("Converting proposal to task:", selectedProposal);
    // In real app, this would navigate to Task Management with pre-filled data
  };

  const renderInnovationIdeas = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Innovation Ideas</h2>
          <p className="text-muted-foreground text-sm">De xuat y tuong sang tao va nhan diem thuong</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          De xuat y tuong moi
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {innovationIdeas.map((idea) => (
              <div key={idea.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{idea.title}</h3>
                      {idea.status === "implemented" && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">{idea.category}</Badge>
                      <span>Submitted by: {idea.submittedBy}</span>
                    </div>
                  </div>
                  {idea.status === "implemented" && (
                    <div className="text-right">
                      <div className="text-sm font-medium">Impact Score: {idea.impactScore}/10</div>
                      <div className="text-sm text-green-500">+{idea.pointsEarned} points earned</div>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <Badge variant={idea.status === "implemented" ? "default" : "secondary"}>
                    {idea.status === "implemented" ? "Implemented" : idea.status === "reviewing" ? "Reviewing" : "Approved"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Cach thuc de xuat y tuong</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>- De xuat y tuong moi de cai thien cong viec marketing</p>
            <p>- Cac y tuong duoc ap dung se nhan diem thuong dua tren impact score</p>
            <p>- Impact score duoc danh gia boi team lead sau khi trien khai</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProposalsList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Proposals</h1>
          <p className="text-muted-foreground text-sm">Quan ly proposals va theo doi trang thai phe duyet</p>
        </div>
        <Button className="gap-2" onClick={() => setIsNewProposalOpen(true)}>
          <Plus className="w-4 h-4" />
          Tao Proposal moi
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-semibold">{stats.underReview}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-semibold">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-semibold">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {proposals.map((proposal) => (
          <Card
            key={proposal.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleProposalClick(proposal)}
          >
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">#{proposal.id} | {proposal.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{proposal.category}</Badge>
                      <Badge variant={proposal.priority === "High" ? "destructive" : "secondary"}>
                        {proposal.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">By: {proposal.submittedBy}</span>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(proposal.status) as "default" | "secondary" | "destructive" | "outline"}>
                    {getStatusLabel(proposal.status)}
                  </Badge>
                </div>

                {proposal.status === "under-review" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Quy trinh duyet</span>
                      <span className="text-muted-foreground">
                        Step {proposal.currentStep}/{proposal.totalSteps}
                      </span>
                    </div>
                    <Progress value={(proposal.currentStep / proposal.totalSteps) * 100} className="h-2" />
                  </div>
                )}

                {proposal.status === "approved" && (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Approved on {proposal.approvedDate}</span>
                  </div>
                )}

                {proposal.status === "rejected" && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>Rejected on {proposal.rejectedDate}</span>
                    </div>
                    {proposal.reason && (
                      <p className="text-sm text-muted-foreground pl-6">{proposal.reason}</p>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Submitted: {proposal.submittedDate}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleProposalClick(proposal); }}>
                    Xem chi tiet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="ideas">Innovation Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals">
          {renderProposalsList()}
        </TabsContent>

        <TabsContent value="ideas">
          {renderInnovationIdeas()}
        </TabsContent>
      </Tabs>

      {/* Proposal Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProposal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">#{selectedProposal.id} | {selectedProposal.title}</DialogTitle>
                <DialogDescription>
                  <Badge variant={getStatusColor(selectedProposal.status) as "default" | "secondary" | "destructive" | "outline"} className="mt-2">
                    {getStatusLabel(selectedProposal.status)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Proposal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Category</Label>
                    <p className="mt-1">{selectedProposal.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Priority</Label>
                    <p className="mt-1">{selectedProposal.priority}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Submitted By</Label>
                    <p className="mt-1">{selectedProposal.submittedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Submitted Date</Label>
                    <p className="mt-1">{selectedProposal.submittedDate}</p>
                  </div>
                  {selectedProposal.budget && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Budget</Label>
                      <p className="mt-1 font-medium">{selectedProposal.budget}</p>
                    </div>
                  )}
                  {selectedProposal.timeline && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Timeline</Label>
                      <p className="mt-1">{selectedProposal.timeline}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="mt-2 text-sm">{selectedProposal.description}</p>
                </div>

                {selectedProposal.expectedOutcome && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Expected Outcome</Label>
                    <p className="mt-2 text-sm">{selectedProposal.expectedOutcome}</p>
                  </div>
                )}

                {/* Approval Workflow */}
                {selectedProposal.status === "under-review" && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-3 block">Approval Workflow</Label>
                    <div className="flex items-center gap-2">
                      {approvalStages.map((stage, index) => (
                        <div key={stage.step} className="flex items-center flex-1">
                          <div className={`flex-1 p-3 rounded border ${
                            selectedProposal.currentStep >= stage.step
                              ? "border-primary bg-primary/10"
                              : "border-border"
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                selectedProposal.currentStep >= stage.step
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}>
                                {selectedProposal.currentStep > stage.step ? <CheckCircle className="w-4 h-4" /> : stage.step}
                              </div>
                              <span className="text-sm font-medium">{stage.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-8">{stage.role}</p>
                          </div>
                          {index < approvalStages.length - 1 && (
                            <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments & Feedback */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">
                    Comments & Feedback ({mockComments.length})
                  </Label>
                  <div className="space-y-4 mb-4">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.user}</span>
                            <Badge variant="outline" className="text-xs">{comment.role}</Badge>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                            {comment.type === "approval" && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Them comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button size="sm">
                      Gui
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  {selectedProposal.status === "approved" && (
                    <Button variant="outline" onClick={handleConvertToTask} className="gap-2">
                      <FileText className="w-4 h-4" />
                      Convert to Task
                    </Button>
                  )}
                  {selectedProposal.status === "under-review" && (
                    <>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleApprovalAction("reject")}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                      <Button
                        className="gap-2"
                        onClick={() => handleApprovalAction("approve")}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                    </>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Dong
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Approve Proposal" : "Reject Proposal"}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? "Xac nhan duyet proposal nay va chuyen sang buoc tiep theo"
                : "Tu choi proposal va cung cap ly do"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Comment {approvalAction === "reject" && "*"}</Label>
              <Textarea
                placeholder={approvalAction === "approve" ? "Them comment (optional)..." : "Ly do tu choi..."}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalModalOpen(false)}>
              Huy
            </Button>
            <Button
              variant={approvalAction === "approve" ? "default" : "destructive"}
              onClick={() => {
                setIsApprovalModalOpen(false);
                setApprovalComment("");
              }}
            >
              {approvalAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Proposal Modal */}
      <Dialog open={isNewProposalOpen} onOpenChange={setIsNewProposalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tao Proposal moi</DialogTitle>
            <DialogDescription>Dien thong tin day du cho proposal cua ban</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tieu de *</Label>
              <Input placeholder="Nhap tieu de proposal..." className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chon category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Campaign">Campaign</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Innovation">Innovation</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Budget">Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select defaultValue="Normal">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Mo ta *</Label>
              <Textarea
                placeholder="Mo ta chi tiet ve proposal..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget</Label>
                <Input placeholder="VD: 30,000,000 VND" className="mt-1" />
              </div>

              <div>
                <Label>Timeline</Label>
                <Input placeholder="VD: Jan 20 - Feb 14" className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Expected Outcome</Label>
              <Textarea
                placeholder="Ket qua mong doi tu proposal nay..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProposalOpen(false)}>
              Luu Draft
            </Button>
            <Button onClick={() => setIsNewProposalOpen(false)}>
              Submit Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
