"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Bell,
  Users,
  Lock,
  Palette,
  Building,
  Camera,
  Save,
  Shield,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Languages,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  UserPlus,
  Crown,
  Link2,
  Upload,
} from "lucide-react";

export default function SettingsPage() {
  const { profile } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("vi");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Get user initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: "Super Admin",
      marketing_manager: "Marketing Manager",
      content_creator: "Content Creator",
      digital_marketing: "Digital Marketing",
      graphic_designer: "Graphic Designer",
      video_producer: "Video Producer",
      sales_consultant: "Sales Consultant",
      sales_manager: "Sales Manager",
    };
    return roleMap[role] || role;
  };

  // Get team display name
  const getTeamDisplay = (team: string) => {
    const teamMap: Record<string, string> = {
      admin: "Administration",
      marketing: "Marketing",
      sales: "Sales",
      medical: "Medical",
    };
    return teamMap[team] || team;
  };

  // Parse name into first and last
  const nameParts = profile?.name?.split(" ") || ["", ""];
  const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
  const lastName = nameParts[nameParts.length - 1] || "";

  const teamMembers = [
    {
      id: 1,
      name: "Trịnh Thu Hoài",
      email: "hoai.tt@nhakhoagreenfield.com",
      role: "Marketing Manager",
      department: "Marketing",
      avatar: "",
      status: "active",
      lastActive: "Online now",
    },
    {
      id: 2,
      name: "Nguyễn Hồng Đức Anh",
      email: "ducanh.nh@nhakhoagreenfield.com",
      role: "Digital Marketing",
      department: "Marketing",
      avatar: "",
      status: "active",
      lastActive: "2 hours ago",
    },
    {
      id: 3,
      name: "Phạm Thị Thu Hoài",
      email: "hoai.ptt@nhakhoagreenfield.com",
      role: "Graphic Designer",
      department: "Marketing",
      avatar: "",
      status: "active",
      lastActive: "30 mins ago",
    },
    {
      id: 4,
      name: "Nguyễn Đình Tiến",
      email: "tien.n@nhakhoagreenfield.com",
      role: "Video Producer",
      department: "Marketing",
      avatar: "",
      status: "active",
      lastActive: "1 hour ago",
    },
  ];

  const integrations = [
    {
      name: "Facebook Business",
      icon: "F",
      status: "connected",
      account: "Greenfield Dental Clinic",
      connectedDate: "Dec 15, 2024",
      permissions: ["Manage Pages", "Read Insights", "Publish Posts"],
    },
    {
      name: "Instagram Business",
      icon: "I",
      status: "connected",
      account: "@greenfielddental",
      connectedDate: "Dec 15, 2024",
      permissions: ["Manage Profile", "Read Insights", "Publish Posts"],
    },
    {
      name: "Google Analytics",
      icon: "G",
      status: "connected",
      account: "GA4 - Greenfield Dental",
      connectedDate: "Dec 10, 2024",
      permissions: ["Read Analytics", "Create Reports"],
    },
    {
      name: "Zalo OA",
      icon: "Z",
      status: "connected",
      account: "Nha Khoa Greenfield",
      connectedDate: "Dec 20, 2024",
      permissions: ["Send Messages", "Read Followers"],
    },
    {
      name: "TikTok Business",
      icon: "T",
      status: "disconnected",
      account: null,
      connectedDate: null,
      permissions: [],
    },
    {
      name: "YouTube",
      icon: "Y",
      status: "disconnected",
      account: null,
      connectedDate: null,
      permissions: [],
    },
  ];

  const notificationSettings = [
    {
      category: "Content Opportunities",
      items: [
        { id: "new-opportunity", label: "New content opportunities", email: true, push: true, inApp: true },
        { id: "consent-obtained", label: "Consent form obtained", email: true, push: false, inApp: true },
        { id: "consent-expiring", label: "Consent expiring soon", email: true, push: true, inApp: true },
      ],
    },
    {
      category: "Tasks & Projects",
      items: [
        { id: "task-assigned", label: "Task assigned to you", email: true, push: true, inApp: true },
        { id: "task-deadline", label: "Task deadline approaching", email: true, push: true, inApp: true },
        { id: "task-completed", label: "Task marked as completed", email: false, push: false, inApp: true },
      ],
    },
    {
      category: "Analytics & Reports",
      items: [
        { id: "weekly-report", label: "Weekly performance report", email: true, push: false, inApp: true },
        { id: "goal-achieved", label: "Goal achieved", email: true, push: true, inApp: true },
        { id: "negative-trend", label: "Negative trend detected", email: true, push: true, inApp: true },
      ],
    },
    {
      category: "Team & Collaboration",
      items: [
        { id: "comment-mention", label: "Someone mentions you", email: true, push: true, inApp: true },
        { id: "proposal-approval", label: "Proposal needs approval", email: true, push: true, inApp: true },
        { id: "team-update", label: "Team updates", email: false, push: false, inApp: true },
      ],
    },
  ];

  const roles = [
    {
      name: "Admin",
      description: "Full access to all features and settings",
      icon: "A",
      permissions: ["All permissions"],
    },
    {
      name: "Marketing Manager",
      description: "Manage campaigns, approve content, view analytics",
      icon: "M",
      permissions: ["View all data", "Approve proposals", "Manage tasks", "View analytics"],
    },
    {
      name: "Content Creator",
      description: "Create and edit content, submit proposals",
      icon: "C",
      permissions: ["Create content", "Edit own content", "Submit proposals", "View calendar"],
    },
    {
      name: "Graphic Designer",
      description: "Design graphics, manage brand assets",
      icon: "G",
      permissions: ["Create designs", "Access brand library", "Upload assets"],
    },
    {
      name: "Digital Marketing",
      description: "Manage social media, run ads, analyze performance",
      icon: "D",
      permissions: ["Manage social media", "Run campaigns", "View analytics"],
    },
    {
      name: "Video Producer",
      description: "Create and edit video content",
      icon: "V",
      permissions: ["Create videos", "Edit videos", "Access media library"],
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Settings</h1>
        <p className="text-muted-foreground">Quan ly tai khoan, team, va cau hinh he thong</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="w-4 h-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link2 className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Building className="w-4 h-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl">
                    {profile?.name ? getInitials(profile.name) : "U"}
                  </div>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    variant="default"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{profile?.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {profile?.role ? getRoleDisplay(profile.role) : "User"} - {profile?.team ? getTeamDisplay(profile.team) : "Team"}
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Photo
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={lastName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={profile?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+84 xxx xxx xxx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select defaultValue={profile?.team || "marketing"} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administration</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue={profile?.role || "content_creator"} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                      <SelectItem value="content_creator">Content Creator</SelectItem>
                      <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                      <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
                      <SelectItem value="video_producer">Video Producer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  defaultValue="Marketing professional voi 8+ nam kinh nghiem trong nganh dental & healthcare. Chuyen ve digital marketing, content strategy va brand development."
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Global Settings */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold">Global Settings</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
              </div>

              {/* Detailed Settings */}
              {notificationSettings.map((category, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="font-semibold">{category.category}</h3>
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <p className="text-sm">{item.label}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Email</span>
                            <Switch defaultChecked={item.email} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Push</span>
                            <Switch defaultChecked={item.push} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">In-App</span>
                            <Switch defaultChecked={item.inApp} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
                <Button variant="outline">Reset to Default</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team members and their roles</CardDescription>
                </div>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl">
                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{member.name}</p>
                          {member.role === "Admin" && (
                            <Badge variant="default" className="gap-1">
                              <Crown className="w-3 h-3" />
                              Admin
                            </Badge>
                          )}
                          {member.status === "active" ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                          <span>-</span>
                          <span>{member.department}</span>
                          <span>-</span>
                          <span>{member.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Roles & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Overview of available roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{role.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Permissions:</p>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.map((perm, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Integrations</CardTitle>
              <CardDescription>Manage your connected social media and analytics tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration, index) => (
                  <Card
                    key={index}
                    className={`border-2 ${integration.status === "connected" ? "border-green-200" : "border-gray-200"}`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {integration.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{integration.name}</h4>
                              {integration.status === "connected" ? (
                                <Badge variant="default" className="gap-1 mt-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Connected
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 mt-1">
                                  Not Connected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {integration.status === "connected" ? (
                          <>
                            <div className="text-sm space-y-1">
                              <p className="text-muted-foreground">
                                <span className="font-medium">Account:</span> {integration.account}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-medium">Connected:</span> {integration.connectedDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Permissions:</p>
                              <div className="flex flex-wrap gap-1">
                                {integration.permissions.map((perm, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {perm}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                Manage
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive">
                                Disconnect
                              </Button>
                            </div>
                          </>
                        ) : (
                          <Button className="w-full" size="sm">
                            <Link2 className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Change Password
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4" />
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
                {twoFactorEnabled && (
                  <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium">Two-Factor Authentication is enabled</p>
                    <p className="text-xs text-muted-foreground">
                      You will be asked for a verification code when signing in
                    </p>
                    <Button variant="outline" size="sm">
                      View Recovery Codes
                    </Button>
                  </div>
                )}
              </div>

              {/* Active Sessions */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Active Sessions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Monitor className="w-5 h-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">Chrome on Windows</p>
                        <p className="text-xs text-muted-foreground">Ho Chi Minh City, Vietnam</p>
                        <p className="text-xs text-muted-foreground">Last active: Now</p>
                      </div>
                    </div>
                    <Badge variant="default">Current</Badge>
                  </div>
                  <div className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">iPhone 14 Pro</p>
                        <p className="text-xs text-muted-foreground">Ho Chi Minh City, Vietnam</p>
                        <p className="text-xs text-muted-foreground">Last active: 2 hours ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workspace Tab */}
        <TabsContent value="workspace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>Manage your organization information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="Greenfield Dental Clinic" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://greenfielddental.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input id="companyEmail" type="email" defaultValue="info@greenfielddental.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input id="companyPhone" defaultValue="+84 28 1234 5678" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  rows={2}
                  defaultValue="123 Nguyen Van Linh, Quan 7, TP. Ho Chi Minh, Viet Nam"
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Colors</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-[#0D9488] border-2"></div>
                      <Input defaultValue="#0D9488" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-[#F59E0B] border-2"></div>
                      <Input defaultValue="#F59E0B" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Background</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-white border-2"></div>
                      <Input defaultValue="#FFFFFF" className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the app looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-4">
                <h3 className="font-semibold">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="cursor-pointer border-2 border-primary">
                    <CardContent className="p-4 text-center">
                      <Sun className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Light</p>
                      <Badge variant="default" className="mt-2">
                        Active
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
                    <CardContent className="p-4 text-center">
                      <Moon className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Dark</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
                    <CardContent className="p-4 text-center">
                      <Monitor className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">System</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Language */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Language
                </h3>
                <Select defaultValue="vi">
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tieng Viet</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div>
                  <p className="font-medium">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">Use a more condensed layout</p>
                </div>
                <Switch />
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Animations</p>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
                <Button variant="outline">Reset to Default</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
