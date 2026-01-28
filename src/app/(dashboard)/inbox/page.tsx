"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Inbox as InboxIcon,
  CheckCircle,
  XCircle,
  Camera,
  FileText,
  Mic,
  Video,
  Image as ImageIcon,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  FileCheck,
  BarChart3,
} from "lucide-react";

// Content Opportunity types
interface ContentOpportunity {
  id: string;
  type: "testimonial" | "before-after" | "event" | "procedure";
  title: string;
  from: string;
  priority: "high" | "normal" | "low";
  consentStatus: "obtained" | "pending" | "not-required";
  createdAt: string;
}

// Task Request types
interface TaskRequest {
  id: string;
  title: string;
  requester: string;
  requesterRole: string;
  type: "design" | "content" | "video" | "other";
  urgency: "urgent" | "high" | "normal" | "low";
  deadline: string;
}

// Mock data for Content Opportunities
const mockOpportunities: ContentOpportunity[] = [
  {
    id: "1",
    type: "testimonial",
    title: "Patient testimonial - Implant success",
    from: "Sales Team (Nguyen Van C)",
    priority: "high",
    consentStatus: "obtained",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    type: "before-after",
    title: "Before/After case - Teeth whitening",
    from: "Nurse Team (Tran Thi D)",
    priority: "normal",
    consentStatus: "pending",
    createdAt: "2024-01-09",
  },
  {
    id: "3",
    type: "procedure",
    title: "Orthodontics case study - Invisalign",
    from: "Doctor (BS. Le Van E)",
    priority: "normal",
    consentStatus: "obtained",
    createdAt: "2024-01-08",
  },
];

// Mock data for Task Requests
const mockRequests: TaskRequest[] = [
  {
    id: "1",
    title: "Poster design for Tet promotion",
    requester: "Nguyen Van Manager",
    requesterRole: "Sales Manager",
    type: "design",
    urgency: "urgent",
    deadline: "2024-01-15",
  },
  {
    id: "2",
    title: "SEO article - Teeth whitening service",
    requester: "Dr. Huong",
    requesterRole: "Dentist",
    type: "content",
    urgency: "normal",
    deadline: "2024-01-20",
  },
  {
    id: "3",
    title: "Video introduction for new doctor",
    requester: "HR Department",
    requesterRole: "HR",
    type: "video",
    urgency: "low",
    deadline: "2024-01-25",
  },
];

const opportunityTypeConfig = {
  testimonial: { label: "Testimonial", icon: Mic, color: "bg-purple-100 text-purple-700" },
  "before-after": { label: "Before/After", icon: Camera, color: "bg-blue-100 text-blue-700" },
  event: { label: "Event", icon: Calendar, color: "bg-green-100 text-green-700" },
  procedure: { label: "Procedure", icon: Video, color: "bg-orange-100 text-orange-700" },
};

const taskTypeConfig = {
  design: { label: "Design", icon: ImageIcon, color: "bg-pink-100 text-pink-700" },
  content: { label: "Content", icon: FileText, color: "bg-blue-100 text-blue-700" },
  video: { label: "Video", icon: Video, color: "bg-purple-100 text-purple-700" },
  other: { label: "Other", icon: FileText, color: "bg-gray-100 text-gray-700" },
};

const priorityConfig = {
  high: { label: "High", color: "bg-red-100 text-red-700" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
};

const urgencyConfig = {
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
};

const consentConfig = {
  obtained: { label: "Consent Obtained", color: "bg-green-100 text-green-700" },
  pending: { label: "Consent Pending", color: "bg-yellow-100 text-yellow-700" },
  "not-required": { label: "Not Required", color: "bg-gray-100 text-gray-700" },
};

export default function InboxHubPage() {
  const [activeTab, setActiveTab] = useState("opportunities");

  // Calculate stats
  const opportunityStats = {
    total: mockOpportunities.length,
    highPriority: mockOpportunities.filter((o) => o.priority === "high").length,
    withConsent: mockOpportunities.filter((o) => o.consentStatus === "obtained").length,
  };

  const requestStats = {
    total: mockRequests.length,
    urgent: mockRequests.filter((r) => r.urgency === "urgent").length,
    design: mockRequests.filter((r) => r.type === "design").length,
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">Inbox Hub</h1>
        <p className="text-muted-foreground">
          Manage content opportunities and task requests from across the organization
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Content Opportunities</p>
                <p className="text-2xl font-semibold">{opportunityStats.total}</p>
              </div>
              <InboxIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Task Requests</p>
                <p className="text-2xl font-semibold">{requestStats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Consent</p>
                <p className="text-2xl font-semibold">{opportunityStats.withConsent}</p>
              </div>
              <FileCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent Items</p>
                <p className="text-2xl font-semibold">
                  {opportunityStats.highPriority + requestStats.urgent}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Content Opportunities and Task Requests */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="opportunities" className="gap-2">
            <Camera className="w-4 h-4" />
            Content Opportunities ({opportunityStats.total})
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="w-4 h-4" />
            Task Requests ({requestStats.total})
          </TabsTrigger>
        </TabsList>

        {/* Content Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Recent content opportunities from Sales and Nurse teams
            </p>
            <Link href="/inbox/opportunities">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {mockOpportunities.slice(0, 3).map((opportunity) => {
              const typeInfo = opportunityTypeConfig[opportunity.type];
              const TypeIcon = typeInfo.icon;
              const priorityInfo = priorityConfig[opportunity.priority];
              const consentInfo = consentConfig[opportunity.consentStatus];

              return (
                <Card
                  key={opportunity.id}
                  className={`hover:shadow-md transition-shadow ${
                    opportunity.priority === "high" ? "border-l-4 border-l-red-500" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                            <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
                            <Badge className={consentInfo.color}>{consentInfo.label}</Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{opportunity.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{opportunity.from}</span>
                            <span>•</span>
                            <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Need Info
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Task Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              External task requests from other departments
            </p>
            <Link href="/inbox/requests">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {mockRequests.slice(0, 3).map((request) => {
              const typeInfo = taskTypeConfig[request.type];
              const TypeIcon = typeInfo.icon;
              const urgencyInfo = urgencyConfig[request.urgency];
              const daysLeft = getDaysUntilDeadline(request.deadline);

              return (
                <Card
                  key={request.id}
                  className={`hover:shadow-md transition-shadow ${
                    request.urgency === "urgent" ? "border-l-4 border-l-red-500" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                            <Badge className={urgencyInfo.color}>{urgencyInfo.label}</Badge>
                            {daysLeft <= 3 && daysLeft > 0 && (
                              <Badge variant="destructive">
                                <Clock className="h-3 w-3 mr-1" />
                                {daysLeft} days left
                              </Badge>
                            )}
                            {daysLeft <= 0 && <Badge variant="destructive">Overdue!</Badge>}
                          </div>
                          <h3 className="font-semibold mb-1">{request.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                              {request.requester} ({request.requesterRole})
                            </span>
                            <span>•</span>
                            <Calendar className="h-4 w-4" />
                            <span>
                              Deadline: {new Date(request.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
