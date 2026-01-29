"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Trash2,
  Edit,
  UserPlus,
  Crown,
  Link2,
  Loader2,
  Wifi,
  WifiOff,
  AlertTriangle,
  Settings,
  ListTodo,
  Plus,
  GripVertical,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage, type Language } from "@/i18n";

export default function SettingsPage() {
  const { profile, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { t, language, setLanguage } = useLanguage();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });
  const [profileFormInitialized, setProfileFormInitialized] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Appearance state (client-side only)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Team invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "content_creator" as string,
  });

  // Edit member dialog
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [editMemberForm, setEditMemberForm] = useState({
    id: "",
    name: "",
    role: "",
    isActive: true,
  });

  // Integration dialog state
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState("");
  const [connectCredentials, setConnectCredentials] = useState("");
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [managePlatform, setManagePlatform] = useState("");
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [disconnectPlatform, setDisconnectPlatform] = useState("");

  // Notification preferences (client-side)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // --- tRPC Queries ---
  const { data: currentUser, isLoading: userLoading, error: userError, refetch: refetchUser } = trpc.user.getMe.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Initialize profile form when user data loads
  useEffect(() => {
    if (!profileFormInitialized && currentUser) {
      const parts = currentUser.name?.split(" ") || [""];
      setProfileForm({
        firstName: parts.slice(0, -1).join(" ") || parts[0] || "",
        lastName: parts.length > 1 ? parts[parts.length - 1] : "",
        bio: "",
      });
      setProfileFormInitialized(true);
    }
  }, [currentUser, profileFormInitialized]);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin" || profile?.role === "marketing_manager";

  const { data: teamMembers, isLoading: teamLoading, error: teamError, refetch: refetchTeam } = trpc.user.getAll.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
  });

  const { data: brandColors, isLoading: colorsLoading } = trpc.library.getBrandColors.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Integration queries
  const { data: integrations, isLoading: integrationsLoading, error: integrationsError, refetch: refetchIntegrations } = trpc.integration.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: managedIntegration, isLoading: managedIntegrationLoading } = trpc.integration.getById.useQuery(
    { id: managePlatform },
    { enabled: !!managePlatform && manageDialogOpen }
  );

  // Task templates query
  const { data: taskTemplates, isLoading: templatesLoading, refetch: refetchTemplates } = trpc.calendar.getAllTemplates.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
  });

  // Social channels query
  const { data: socialChannels, isLoading: channelsLoading, refetch: refetchChannels } = trpc.channels.getAll.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
  });

  // Platforms query
  const { data: allPlatforms, isLoading: platformsLoading, refetch: refetchPlatforms } = trpc.platform.getAll.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
  });

  // --- tRPC Mutations ---
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      utils.user.getMe.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => toast.error(error.message),
  });

  const createUserMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      toast.success("Team member invited successfully");
      setInviteDialogOpen(false);
      setInviteForm({ name: "", email: "", password: "", role: "content_creator" });
      utils.user.getAll.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateUserMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success("Team member updated successfully");
      setEditMemberDialogOpen(false);
      utils.user.getAll.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // Integration mutations
  const connectMutation = trpc.integration.connect.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully connected ${getPlatformDisplay(data.platform)}`);
      setConnectDialogOpen(false);
      setConnectPlatform("");
      setConnectCredentials("");
      utils.integration.getAll.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const disconnectMutation = trpc.integration.disconnect.useMutation({
    onSuccess: (data) => {
      toast.success(`Disconnected ${getPlatformDisplay(data.platform)}`);
      setDisconnectDialogOpen(false);
      setDisconnectPlatform("");
      utils.integration.getAll.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const testConnectionMutation = trpc.integration.testConnection.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const updateTemplateMutation = trpc.calendar.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template updated successfully");
      setEditTemplateDialogOpen(false);
      refetchTemplates();
    },
    onError: (error) => toast.error(error.message),
  });

  // Template edit state
  const [editTemplateDialogOpen, setEditTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    name: string;
    description: string | null;
    contentType: string | null;
    isActive: boolean;
    tasks: Array<{
      title: string;
      description: string;
      category: string;
      priority: string;
      daysBeforeDeadline: number;
    }>;
  } | null>(null);

  const handleEditTemplate = (template: typeof editingTemplate) => {
    setEditingTemplate(template);
    setEditTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    updateTemplateMutation.mutate({
      id: editingTemplate.id,
      name: editingTemplate.name,
      description: editingTemplate.description || undefined,
      isActive: editingTemplate.isActive,
      tasks: editingTemplate.tasks,
    });
  };

  const handleUpdateTaskInTemplate = (taskIndex: number, field: string, value: string | number) => {
    if (!editingTemplate) return;
    const updatedTasks = [...editingTemplate.tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], [field]: value };
    setEditingTemplate({ ...editingTemplate, tasks: updatedTasks });
  };

  const handleAddTaskToTemplate = () => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      tasks: [
        ...editingTemplate.tasks,
        { title: "", description: "", category: "content", priority: "normal", daysBeforeDeadline: 1 },
      ],
    });
  };

  const handleRemoveTaskFromTemplate = (taskIndex: number) => {
    if (!editingTemplate) return;
    const updatedTasks = editingTemplate.tasks.filter((_, i) => i !== taskIndex);
    setEditingTemplate({ ...editingTemplate, tasks: updatedTasks });
  };

  // Channel mutations
  const createChannelMutation = trpc.channels.create.useMutation({
    onSuccess: () => {
      toast.success("Channel created successfully");
      setChannelDialogOpen(false);
      setEditingChannel(null);
      refetchChannels();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateChannelMutation = trpc.channels.update.useMutation({
    onSuccess: () => {
      toast.success("Channel updated successfully");
      setChannelDialogOpen(false);
      setEditingChannel(null);
      refetchChannels();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteChannelMutation = trpc.channels.delete.useMutation({
    onSuccess: () => {
      toast.success("Channel deleted successfully");
      refetchChannels();
    },
    onError: (error) => toast.error(error.message),
  });

  // Platform mutations
  const createPlatformMutation = trpc.platform.create.useMutation({
    onSuccess: () => {
      toast.success("Platform created successfully");
      setPlatformDialogOpen(false);
      setEditingPlatform(null);
      refetchPlatforms();
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePlatformMutation = trpc.platform.update.useMutation({
    onSuccess: () => {
      toast.success("Platform updated successfully");
      setPlatformDialogOpen(false);
      setEditingPlatform(null);
      refetchPlatforms();
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePlatformMutation = trpc.platform.delete.useMutation({
    onSuccess: () => {
      toast.success("Platform deactivated successfully");
      refetchPlatforms();
    },
    onError: (error) => toast.error(error.message),
  });

  // Platform state
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<{
    id?: string;
    code: string;
    displayName: string;
    icon: string;
    color: string;
    category: string;
    sortOrder: number;
    isActive: boolean;
  } | null>(null);

  const handleAddPlatform = () => {
    setEditingPlatform({
      code: "",
      displayName: "",
      icon: "",
      color: "#3B82F6",
      category: "social",
      sortOrder: 0,
      isActive: true,
    });
    setPlatformDialogOpen(true);
  };

  const handleEditPlatform = (platform: {
    id: string;
    code: string;
    displayName: string;
    icon: string | null;
    color: string;
    category: string;
    sortOrder: number;
    isActive: boolean;
  }) => {
    setEditingPlatform({
      id: platform.id,
      code: platform.code,
      displayName: platform.displayName,
      icon: platform.icon || "",
      color: platform.color,
      category: platform.category,
      sortOrder: platform.sortOrder,
      isActive: platform.isActive,
    });
    setPlatformDialogOpen(true);
  };

  const handleSavePlatform = () => {
    if (!editingPlatform) return;
    if (editingPlatform.id) {
      updatePlatformMutation.mutate({
        id: editingPlatform.id,
        displayName: editingPlatform.displayName,
        icon: editingPlatform.icon || null,
        color: editingPlatform.color,
        category: editingPlatform.category as "social" | "advertising" | "analytics" | "website",
        sortOrder: editingPlatform.sortOrder,
        isActive: editingPlatform.isActive,
      });
    } else {
      createPlatformMutation.mutate({
        code: editingPlatform.code.toLowerCase().replace(/[^a-z_]/g, "_"),
        displayName: editingPlatform.displayName,
        icon: editingPlatform.icon || undefined,
        color: editingPlatform.color,
        category: editingPlatform.category as "social" | "advertising" | "analytics" | "website",
        sortOrder: editingPlatform.sortOrder,
      });
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      social: "Social Media",
      advertising: "Advertising",
      analytics: "Analytics",
      website: "Website",
    };
    return categoryMap[category] || category;
  };

  // Channel state
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<{
    id?: string;
    name: string;
    platform: string;
    accountId: string;
    accountUrl: string;
    avatarUrl: string;
    description: string;
    isActive: boolean;
  } | null>(null);

  const handleAddChannel = () => {
    setEditingChannel({
      name: "",
      platform: "facebook",
      accountId: "",
      accountUrl: "",
      avatarUrl: "",
      description: "",
      isActive: true,
    });
    setChannelDialogOpen(true);
  };

  const handleEditChannel = (channel: {
    id: string;
    name: string;
    platform: string;
    accountId: string | null;
    accountUrl: string | null;
    avatarUrl: string | null;
    description: string | null;
    isActive: boolean;
  }) => {
    setEditingChannel({
      id: channel.id,
      name: channel.name,
      platform: channel.platform,
      accountId: channel.accountId || "",
      accountUrl: channel.accountUrl || "",
      avatarUrl: channel.avatarUrl || "",
      description: channel.description || "",
      isActive: channel.isActive,
    });
    setChannelDialogOpen(true);
  };

  const handleSaveChannel = () => {
    if (!editingChannel) return;
    if (editingChannel.id) {
      updateChannelMutation.mutate({
        id: editingChannel.id,
        name: editingChannel.name,
        platform: editingChannel.platform as "facebook" | "instagram" | "zalo" | "tiktok" | "youtube" | "website",
        accountId: editingChannel.accountId || null,
        accountUrl: editingChannel.accountUrl || null,
        avatarUrl: editingChannel.avatarUrl || null,
        description: editingChannel.description || null,
        isActive: editingChannel.isActive,
      });
    } else {
      createChannelMutation.mutate({
        name: editingChannel.name,
        platform: editingChannel.platform as "facebook" | "instagram" | "zalo" | "tiktok" | "youtube" | "website",
        accountId: editingChannel.accountId || undefined,
        accountUrl: editingChannel.accountUrl || undefined,
        avatarUrl: editingChannel.avatarUrl || undefined,
        description: editingChannel.description || undefined,
        isActive: editingChannel.isActive,
      });
    }
  };

  const getChannelIcon = (platform: string) => {
    const icons: Record<string, string> = {
      facebook: "🔵",
      instagram: "📸",
      zalo: "💙",
      tiktok: "🎵",
      youtube: "🔴",
      website: "🌐",
    };
    return icons[platform] || "📱";
  };

  // --- Helpers ---
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Admin",
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

  const getTeamDisplay = (team: string) => {
    const teamMap: Record<string, string> = {
      admin: "Administration",
      marketing: "Marketing",
      sales: "Sales",
      medical: "Medical",
    };
    return teamMap[team] || team;
  };

  const handleSaveProfile = () => {
    const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
    if (!fullName) {
      toast.error("Name is required");
      return;
    }
    updateProfileMutation.mutate({ name: fullName });
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleInviteMember = () => {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) {
      toast.error("All fields are required");
      return;
    }
    if (inviteForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    createUserMutation.mutate({
      name: inviteForm.name,
      email: inviteForm.email,
      password: inviteForm.password,
      role: inviteForm.role as "admin" | "marketing_manager" | "content_creator" | "digital_marketing" | "graphic_designer" | "video_producer",
    });
  };

  const handleUpdateMember = () => {
    updateUserMutation.mutate({
      id: editMemberForm.id,
      name: editMemberForm.name || undefined,
      role: editMemberForm.role as "admin" | "marketing_manager" | "content_creator" | "digital_marketing" | "graphic_designer" | "video_producer" | undefined,
      isActive: editMemberForm.isActive,
    });
  };

  const handleDeactivateMember = (id: string) => {
    updateUserMutation.mutate({ id, isActive: false });
  };

  // Integration helpers
  const getPlatformDisplay = (platform: string): string => {
    const platformMap: Record<string, string> = {
      facebook: "Facebook Business",
      instagram: "Instagram Business",
      google_ads: "Google Ads",
      google_analytics: "Google Analytics",
      google_business: "Google Business",
      zalo: "Zalo OA",
      mailchimp: "Mailchimp",
      tiktok: "TikTok Business",
      youtube: "YouTube",
    };
    return platformMap[platform] || platform;
  };

  const getPlatformIcon = (platform: string): string => {
    const iconMap: Record<string, string> = {
      facebook: "F",
      instagram: "I",
      google_ads: "GA",
      google_analytics: "G",
      google_business: "GB",
      zalo: "Z",
      mailchimp: "M",
      tiktok: "T",
      youtube: "Y",
    };
    return iconMap[platform] || platform.charAt(0).toUpperCase();
  };

  const handleConnectIntegration = () => {
    if (!connectCredentials.trim()) {
      toast.error("Credentials JSON is required");
      return;
    }
    try {
      JSON.parse(connectCredentials);
    } catch {
      toast.error("Invalid JSON format for credentials");
      return;
    }
    connectMutation.mutate({
      platform: connectPlatform as "google_ads" | "facebook" | "instagram" | "zalo" | "google_analytics" | "google_business" | "mailchimp" | "tiktok" | "youtube",
      credentials: connectCredentials,
      isActive: true,
    });
  };

  const handleDisconnectIntegration = () => {
    disconnectMutation.mutate({ platform: disconnectPlatform });
  };

  const handleTestConnection = (platform: string) => {
    testConnectionMutation.mutate({ platform });
  };

  // Notification settings (static config - no DB model for preferences)
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
        <h1 className="text-2xl font-semibold mb-1">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            {t.settings.tabs.profile}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t.settings.tabs.notifications}
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="w-4 h-4 mr-2" />
            {t.settings.tabs.team}
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link2 className="w-4 h-4 mr-2" />
            {t.settings.tabs.integrations}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            {t.settings.tabs.security}
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Building className="w-4 h-4 mr-2" />
            {t.settings.tabs.workspace}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            {t.settings.tabs.appearance}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="templates">
              <ListTodo className="w-4 h-4 mr-2" />
              Task Templates
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="channels">
              <Link2 className="w-4 h-4 mr-2" />
              Channels
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="platforms">
              <Globe className="w-4 h-4 mr-2" />
              Platforms
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.profile.title}</CardTitle>
              <CardDescription>{t.settings.profile.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl">
                    {currentUser?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      getInitials(currentUser?.name || profile?.name || "U")
                    )}
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
                  <h3 className="font-semibold mb-1">{currentUser?.name || profile?.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {getRoleDisplay(currentUser?.role || profile?.role || "")} - {getTeamDisplay(currentUser?.team || profile?.team || "")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.profile.memberSince} {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t.settings.profile.firstName}</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t.settings.profile.lastName}</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.profile.email}</Label>
                  <Input id="email" type="email" value={currentUser?.email || profile?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.settings.profile.phone}</Label>
                  <Input id="phone" placeholder="+84 xxx xxx xxx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t.settings.profile.department}</Label>
                  <Select value={currentUser?.team || profile?.team || "marketing"} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder={t.settings.profile.department} />
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
                  <Label htmlFor="role">{t.settings.profile.role}</Label>
                  <Select value={currentUser?.role || profile?.role || "content_creator"} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder={t.settings.profile.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                      <SelectItem value="content_creator">Content Creator</SelectItem>
                      <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                      <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
                      <SelectItem value="video_producer">Video Producer</SelectItem>
                      <SelectItem value="sales_manager">Sales Manager</SelectItem>
                      <SelectItem value="sales_consultant">Sales Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t.settings.profile.bio}</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder={language === "vi" ? "Giới thiệu về bản thân..." : "Tell us about yourself..."}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t.settings.profile.saveChanges}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const parts = (currentUser?.name || profile?.name || "").split(" ");
                    setProfileForm({
                      firstName: parts.slice(0, -1).join(" ") || parts[0] || "",
                      lastName: parts.length > 1 ? parts[parts.length - 1] : "",
                      bio: "",
                    });
                  }}
                >
                  {t.common.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.notifications.title}</CardTitle>
              <CardDescription>{t.settings.notifications.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Global Settings */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold">{t.settings.notifications.globalSettings}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.settings.notifications.emailNotifications}</p>
                    <p className="text-sm text-muted-foreground">{t.settings.notifications.emailNotificationsDesc}</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.settings.notifications.pushNotifications}</p>
                    <p className="text-sm text-muted-foreground">{t.settings.notifications.pushNotificationsDesc}</p>
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
                            <Switch defaultChecked={item.email} disabled={!emailNotifications} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Push</span>
                            <Switch defaultChecked={item.push} disabled={!pushNotifications} />
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
                <Button onClick={() => toast.success(language === "vi" ? "Đã lưu tùy chọn thông báo" : "Notification preferences saved")}>
                  <Save className="w-4 h-4 mr-2" />
                  {t.settings.notifications.savePreferences}
                </Button>
                <Button variant="outline" onClick={() => toast.info(language === "vi" ? "Đã đặt lại mặc định" : "Preferences reset to defaults")}>
                  {t.settings.notifications.resetToDefault}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          {isAdmin ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t.settings.team.title}</CardTitle>
                    <CardDescription>
                      {teamMembers ? `${teamMembers.length} ${t.settings.team.activeMembers}` : t.settings.team.subtitle}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setInviteDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t.settings.team.inviteMember}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teamLoading ? (
                  <PageLoading />
                ) : teamError ? (
                  <PageError error={teamError} onRetry={refetchTeam} />
                ) : (
                  <div className="space-y-3">
                    {(teamMembers || []).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl">
                            {member.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              getInitials(member.name)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{member.name}</p>
                              {(member.role === "admin" || member.role === "super_admin") && (
                                <Badge variant="default" className="gap-1">
                                  <Crown className="w-3 h-3" />
                                  Admin
                                </Badge>
                              )}
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getRoleDisplay(member.role)}
                              </Badge>
                              <span>-</span>
                              <span>Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {member.id !== profile?.id && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditMemberForm({
                                  id: member.id,
                                  name: member.name,
                                  role: member.role,
                                  isActive: true,
                                });
                                setEditMemberDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivateMember(member.id)}
                              disabled={updateUserMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your team membership information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl">
                    {currentUser?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      getInitials(currentUser?.name || profile?.name || "U")
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{currentUser?.name || profile?.name || "User"}</p>
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentUser?.email || profile?.email || ""}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getRoleDisplay(currentUser?.role || profile?.role || "")}
                      </Badge>
                      <span>-</span>
                      <span>{getTeamDisplay(profile?.team || "")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Roles & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.team.rolesPermissions}</CardTitle>
              <CardDescription>{t.settings.team.rolesDescription}</CardDescription>
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
              <CardTitle>{t.settings.integrations.title}</CardTitle>
              <CardDescription>{t.settings.integrations.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              {integrationsLoading ? (
                <PageLoading />
              ) : integrationsError ? (
                <PageError error={integrationsError} onRetry={refetchIntegrations} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(integrations || []).map((integration) => (
                    <Card
                      key={integration.id}
                      className={`border-2 ${integration.isActive ? "border-green-200" : "border-gray-200"}`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {getPlatformIcon(integration.platform)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{getPlatformDisplay(integration.platform)}</h4>
                                {integration.isActive ? (
                                  <Badge variant="default" className="gap-1 mt-1">
                                    <Wifi className="w-3 h-3" />
                                    Connected
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="gap-1 mt-1">
                                    <WifiOff className="w-3 h-3" />
                                    Not Connected
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {integration.isActive ? (
                            <>
                              <div className="text-sm space-y-1">
                                <p className="text-muted-foreground">
                                  <span className="font-medium">Connected:</span>{" "}
                                  {new Date(integration.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                {integration.lastSyncAt && (
                                  <p className="text-muted-foreground">
                                    <span className="font-medium">Last Sync:</span>{" "}
                                    {new Date(integration.lastSyncAt).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {isAdmin && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => {
                                        setManagePlatform(integration.id);
                                        setManageDialogOpen(true);
                                      }}
                                    >
                                      <Settings className="w-3 h-3 mr-1" />
                                      Manage
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleTestConnection(integration.platform)}
                                      disabled={testConnectionMutation.isPending}
                                    >
                                      {testConnectionMutation.isPending ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Wifi className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() => {
                                        setDisconnectPlatform(integration.platform);
                                        setDisconnectDialogOpen(true);
                                      }}
                                    >
                                      <WifiOff className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                                {!isAdmin && (
                                  <Badge variant="secondary" className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </>
                          ) : (
                            <div>
                              {isAdmin ? (
                                <Button
                                  className="w-full"
                                  size="sm"
                                  onClick={() => {
                                    setConnectPlatform(integration.platform);
                                    setConnectCredentials("");
                                    setConnectDialogOpen(true);
                                  }}
                                >
                                  <Link2 className="w-4 h-4 mr-2" />
                                  Connect
                                </Button>
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                  Contact an admin to connect this integration
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {integrations?.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No integrations configured yet.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.security.title}</CardTitle>
              <CardDescription>{t.settings.security.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {t.settings.security.changePassword}
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t.settings.security.currentPassword}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t.settings.security.newPassword}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                    />
                    {passwordForm.newPassword && passwordForm.newPassword.length < 8 && (
                      <p className="text-xs text-destructive">{t.settings.security.passwordMinLength}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.settings.security.confirmPassword}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    />
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-destructive">{t.settings.security.passwordsDoNotMatch}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changePasswordMutation.isPending || !passwordForm.currentPassword || passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmPassword}
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {t.settings.security.updatePassword}
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4" />
                      {t.settings.security.twoFactor}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.security.twoFactorDesc}
                    </p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
                {twoFactorEnabled && (
                  <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium">{t.settings.security.twoFactorEnabled}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.security.twoFactorEnabledDesc}
                    </p>
                    <Button variant="outline" size="sm">
                      {t.settings.security.viewRecoveryCodes}
                    </Button>
                  </div>
                )}
              </div>

              {/* Active Sessions */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {t.settings.security.activeSessions}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Monitor className="w-5 h-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">{t.settings.security.currentSession}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentUser?.email || profile?.email || "unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.settings.security.lastActive}: {language === "vi" ? "Hiện tại" : "Now"}</p>
                      </div>
                    </div>
                    <Badge variant="default">{language === "vi" ? "Hiện tại" : "Current"}</Badge>
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
              <CardTitle>{t.settings.workspace.title}</CardTitle>
              <CardDescription>{t.settings.workspace.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t.settings.workspace.companyName}</Label>
                  <Input id="companyName" defaultValue="Greenfield Dental Clinic" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t.settings.workspace.website}</Label>
                  <Input id="website" defaultValue="https://greenfielddental.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">{t.settings.workspace.companyEmail}</Label>
                  <Input id="companyEmail" type="email" defaultValue="info@greenfielddental.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">{t.settings.workspace.companyPhone}</Label>
                  <Input id="companyPhone" defaultValue="+84 28 1234 5678" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t.settings.workspace.address}</Label>
                <Textarea
                  id="address"
                  rows={2}
                  defaultValue="123 Nguyen Van Linh, Quan 7, TP. Ho Chi Minh, Viet Nam"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.settings.workspace.brandColors}</Label>
                {colorsLoading ? (
                  <div className="text-sm text-muted-foreground">{t.settings.workspace.loadingColors}</div>
                ) : brandColors && brandColors.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {brandColors.map((color) => (
                      <div key={color.id} className="space-y-2">
                        <Label className="text-xs">{color.name}</Label>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-12 h-12 rounded-lg border-2"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <div className="text-xs">
                            <p className="font-mono">{color.hexCode}</p>
                            {color.rgbCode && <p className="text-muted-foreground">{color.rgbCode}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t.settings.workspace.primaryColor}</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-[#0D9488] border-2"></div>
                        <Input defaultValue="#0D9488" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t.settings.workspace.accentColor}</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-[#F59E0B] border-2"></div>
                        <Input defaultValue="#F59E0B" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t.settings.workspace.backgroundColor}</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-white border-2"></div>
                        <Input defaultValue="#FFFFFF" className="flex-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={() => toast.success(language === "vi" ? "Đã lưu cài đặt workspace" : "Workspace settings saved")}>
                  <Save className="w-4 h-4 mr-2" />
                  {t.settings.profile.saveChanges}
                </Button>
                <Button variant="outline">{t.common.cancel}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.appearance.title}</CardTitle>
              <CardDescription>{t.settings.appearance.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-4">
                <h3 className="font-semibold">{t.settings.appearance.theme}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card
                    className={`cursor-pointer border-2 ${theme === "light" ? "border-primary" : "hover:border-primary"} transition-colors`}
                    onClick={() => setTheme("light")}
                  >
                    <CardContent className="p-4 text-center">
                      <Sun className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{t.settings.appearance.light}</p>
                      {theme === "light" && <Badge variant="default" className="mt-2">{t.common.active}</Badge>}
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer border-2 ${theme === "dark" ? "border-primary" : "hover:border-primary"} transition-colors`}
                    onClick={() => setTheme("dark")}
                  >
                    <CardContent className="p-4 text-center">
                      <Moon className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{t.settings.appearance.dark}</p>
                      {theme === "dark" && <Badge variant="default" className="mt-2">{t.common.active}</Badge>}
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer border-2 ${theme === "system" ? "border-primary" : "hover:border-primary"} transition-colors`}
                    onClick={() => setTheme("system")}
                  >
                    <CardContent className="p-4 text-center">
                      <Monitor className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{t.settings.appearance.system}</p>
                      {theme === "system" && <Badge variant="default" className="mt-2">{t.common.active}</Badge>}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Language */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t.settings.appearance.language}
                </h3>
                <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div>
                  <p className="font-medium">{t.settings.appearance.compactMode}</p>
                  <p className="text-sm text-muted-foreground">{t.settings.appearance.compactModeDesc}</p>
                </div>
                <Switch />
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.settings.appearance.animations}</p>
                  <p className="text-sm text-muted-foreground">{t.settings.appearance.animationsDesc}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={() => toast.success(language === "vi" ? "Đã lưu tùy chọn giao diện" : "Appearance preferences saved")}>
                  <Save className="w-4 h-4 mr-2" />
                  {t.settings.appearance.savePreferences}
                </Button>
                <Button variant="outline" onClick={() => { setTheme("light"); setLanguage("vi"); toast.info(language === "vi" ? "Đã đặt lại mặc định" : "Preferences reset to defaults"); }}>
                  {t.settings.appearance.resetToDefault}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Templates Tab */}
        {isAdmin && (
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Templates</CardTitle>
                <CardDescription>
                  Quản lý templates để tự động tạo tasks khi tạo nội dung mới trên calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : taskTemplates && taskTemplates.length > 0 ? (
                  <div className="space-y-4">
                    {taskTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant={template.isActive ? "default" : "secondary"}>
                                {template.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Content Type: <strong>{template.contentType || "N/A"}</strong> • {template.tasks.length} tasks
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <div className="pl-4 border-l-2 space-y-1">
                          {template.tasks.map((task, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span>{task.title}</span>
                              <span className="text-muted-foreground">
                                {task.daysBeforeDeadline === 0 ? "Ngày đăng" : `-${task.daysBeforeDeadline} ngày`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Channels Tab */}
        {isAdmin && (
          <TabsContent value="channels" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Social Channels</CardTitle>
                  <CardDescription>
                    Quản lý các kênh social media của bạn. Mỗi platform có thể có nhiều accounts/pages khác nhau.
                  </CardDescription>
                </div>
                <Button onClick={handleAddChannel}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm Channel
                </Button>
              </CardHeader>
              <CardContent>
                {channelsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : socialChannels && socialChannels.length > 0 ? (
                  <div className="space-y-4">
                    {["facebook", "instagram", "zalo", "tiktok", "youtube", "website"].map((platform) => {
                      const platformChannels = socialChannels.filter((c) => c.platform === platform);
                      if (platformChannels.length === 0) return null;
                      return (
                        <div key={platform} className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            {getChannelIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            <Badge variant="outline">{platformChannels.length}</Badge>
                          </h4>
                          <div className="space-y-2 pl-6">
                            {platformChannels.map((channel) => (
                              <div
                                key={channel.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  {channel.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={channel.avatarUrl}
                                      alt={channel.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                                      {getChannelIcon(channel.platform)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium">{channel.name}</p>
                                    {channel.description && (
                                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                                    )}
                                    {channel.accountUrl && (
                                      <a
                                        href={channel.accountUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline"
                                      >
                                        {channel.accountUrl}
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={channel.isActive ? "default" : "secondary"}>
                                    {channel.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditChannel(channel)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this channel?")) {
                                        deleteChannelMutation.mutate({ id: channel.id });
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Chưa có channel nào.</p>
                    <p className="text-sm">Thêm channel đầu tiên để bắt đầu quản lý nội dung.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Platforms Tab */}
        {isAdmin && (
          <TabsContent value="platforms" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Platforms</CardTitle>
                  <CardDescription>
                    Manage available platforms for content creation and analytics. Custom platforms can be added dynamically.
                  </CardDescription>
                </div>
                <Button onClick={handleAddPlatform}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Platform
                </Button>
              </CardHeader>
              <CardContent>
                {platformsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : allPlatforms && allPlatforms.length > 0 ? (
                  <div className="space-y-4">
                    {["social", "advertising", "analytics", "website"].map((category) => {
                      const categoryPlatforms = allPlatforms.filter((p) => p.category === category);
                      if (categoryPlatforms.length === 0) return null;
                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            {getCategoryDisplay(category)}
                            <Badge variant="outline">{categoryPlatforms.length}</Badge>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categoryPlatforms.map((platform) => (
                              <div
                                key={platform.id}
                                className={`flex items-center justify-between p-3 border rounded-lg ${!platform.isActive ? "opacity-60" : ""}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: platform.color }}
                                  >
                                    {platform.icon || platform.displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium">{platform.displayName}</p>
                                    <p className="text-xs text-muted-foreground">Code: {platform.code}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={platform.isActive ? "default" : "secondary"}>
                                    {platform.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditPlatform(platform)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {platform.isActive && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to deactivate this platform?")) {
                                          deletePlatformMutation.mutate({ id: platform.id });
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No platforms configured.</p>
                    <p className="text-sm">Add your first platform to start managing content across channels.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Platform Dialog */}
      <Dialog open={platformDialogOpen} onOpenChange={setPlatformDialogOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingPlatform?.id ? "Edit Platform" : "Add New Platform"}</DialogTitle>
            <DialogDescription>
              {editingPlatform?.id ? "Update platform settings" : "Add a new platform for content management"}
            </DialogDescription>
          </DialogHeader>
          {editingPlatform && (
            <div className="space-y-4">
              {!editingPlatform.id && (
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={editingPlatform.code}
                    onChange={(e) => setEditingPlatform({ ...editingPlatform, code: e.target.value.toLowerCase().replace(/[^a-z_]/g, "_") })}
                    placeholder="e.g., linkedin, twitter"
                    disabled={!!editingPlatform.id}
                  />
                  <p className="text-xs text-muted-foreground">Lowercase letters and underscores only. Cannot be changed later.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input
                  value={editingPlatform.displayName}
                  onChange={(e) => setEditingPlatform({ ...editingPlatform, displayName: e.target.value })}
                  placeholder="e.g., LinkedIn, Twitter/X"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (Emoji)</Label>
                <Input
                  value={editingPlatform.icon}
                  onChange={(e) => setEditingPlatform({ ...editingPlatform, icon: e.target.value })}
                  placeholder="e.g., 🔗"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Color *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editingPlatform.color}
                    onChange={(e) => setEditingPlatform({ ...editingPlatform, color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={editingPlatform.color}
                    onChange={(e) => setEditingPlatform({ ...editingPlatform, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={editingPlatform.category}
                  onValueChange={(value) => setEditingPlatform({ ...editingPlatform, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="advertising">Advertising</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={editingPlatform.sortOrder}
                  onChange={(e) => setEditingPlatform({ ...editingPlatform, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingPlatform.isActive}
                  onCheckedChange={(checked) => setEditingPlatform({ ...editingPlatform, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlatformDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePlatform}
              disabled={!editingPlatform?.displayName || (!editingPlatform?.id && !editingPlatform?.code) || createPlatformMutation.isPending || updatePlatformMutation.isPending}
            >
              {(createPlatformMutation.isPending || updatePlatformMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingPlatform?.id ? "Save Changes" : "Create Platform"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Channel Dialog */}
      <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingChannel?.id ? "Edit Channel" : "Add New Channel"}</DialogTitle>
            <DialogDescription>
              {editingChannel?.id ? "Chỉnh sửa thông tin channel" : "Thêm một channel mới để đăng nội dung"}
            </DialogDescription>
          </DialogHeader>
          {editingChannel && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên Channel *</Label>
                <Input
                  value={editingChannel.name}
                  onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                  placeholder="VD: Greenfield Dental - Trang chính"
                />
              </div>
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select
                  value={editingChannel.platform}
                  onValueChange={(value) => setEditingChannel({ ...editingChannel, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">🔵 Facebook</SelectItem>
                    <SelectItem value="instagram">📸 Instagram</SelectItem>
                    <SelectItem value="zalo">💙 Zalo</SelectItem>
                    <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                    <SelectItem value="youtube">🔴 YouTube</SelectItem>
                    <SelectItem value="website">🌐 Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account/Page URL</Label>
                <Input
                  value={editingChannel.accountUrl}
                  onChange={(e) => setEditingChannel({ ...editingChannel, accountUrl: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar URL</Label>
                <Input
                  value={editingChannel.avatarUrl}
                  onChange={(e) => setEditingChannel({ ...editingChannel, avatarUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Input
                  value={editingChannel.description}
                  onChange={(e) => setEditingChannel({ ...editingChannel, description: e.target.value })}
                  placeholder="Mô tả ngắn về channel"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingChannel.isActive}
                  onCheckedChange={(checked) => setEditingChannel({ ...editingChannel, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setChannelDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveChannel}
              disabled={!editingChannel?.name || createChannelMutation.isPending || updateChannelMutation.isPending}
            >
              {(createChannelMutation.isPending || updateChannelMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingChannel?.id ? "Save Changes" : "Create Channel"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editTemplateDialogOpen} onOpenChange={setEditTemplateDialogOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-2xl w-full max-h-[100dvh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
            <DialogDescription>
              Chỉnh sửa các tasks trong template này
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={editingTemplate.isActive}
                    onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingTemplate.description || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tasks ({editingTemplate.tasks.length})</Label>
                  <Button variant="outline" size="sm" onClick={handleAddTaskToTemplate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                {editingTemplate.tasks.map((task, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Task {idx + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemoveTaskFromTemplate(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={task.title}
                          onChange={(e) => handleUpdateTaskInTemplate(idx, "title", e.target.value)}
                          placeholder="Task title"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Days Before Deadline</Label>
                        <Input
                          type="number"
                          value={task.daysBeforeDeadline}
                          onChange={(e) => handleUpdateTaskInTemplate(idx, "daysBeforeDeadline", parseInt(e.target.value) || 0)}
                          min={0}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={task.description}
                        onChange={(e) => handleUpdateTaskInTemplate(idx, "description", e.target.value)}
                        placeholder="Task description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Select
                          value={task.category}
                          onValueChange={(value) => handleUpdateTaskInTemplate(idx, "category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="content">Content</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Priority</Label>
                        <Select
                          value={task.priority}
                          onValueChange={(value) => handleUpdateTaskInTemplate(idx, "priority", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={updateTemplateMutation.isPending}>
              {updateTemplateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-md w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={inviteForm.name}
                onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Password</Label>
              <Input
                type="password"
                value={inviteForm.password}
                onChange={(e) => setInviteForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content_creator">Content Creator</SelectItem>
                  <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                  <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
                  <SelectItem value="video_producer">Video Producer</SelectItem>
                  <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteMember} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editMemberDialogOpen} onOpenChange={setEditMemberDialogOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-md w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editMemberForm.name}
                onChange={(e) => setEditMemberForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editMemberForm.role} onValueChange={(v) => setEditMemberForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content_creator">Content Creator</SelectItem>
                  <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                  <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
                  <SelectItem value="video_producer">Video Producer</SelectItem>
                  <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Deactivated members cannot log in</p>
              </div>
              <Switch
                checked={editMemberForm.isActive}
                onCheckedChange={(v) => setEditMemberForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMemberDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateMember} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Integration Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect {getPlatformDisplay(connectPlatform)}</DialogTitle>
            <DialogDescription>
              Enter the API credentials for {getPlatformDisplay(connectPlatform)} to establish the connection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Input value={getPlatformDisplay(connectPlatform)} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credentials">Credentials (JSON)</Label>
              <Textarea
                id="credentials"
                rows={6}
                placeholder='{"api_key": "your-key", "api_secret": "your-secret"}'
                value={connectCredentials}
                onChange={(e) => setConnectCredentials(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter valid JSON with the required API keys and secrets for this platform.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnectIntegration} disabled={connectMutation.isPending}>
              {connectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Link2 className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Integration Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={(open) => {
        setManageDialogOpen(open);
        if (!open) setManagePlatform("");
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {managedIntegration ? getPlatformDisplay(managedIntegration.platform) : "Integration"} Details
            </DialogTitle>
            <DialogDescription>
              View and manage integration connection details.
            </DialogDescription>
          </DialogHeader>
          {managedIntegrationLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : managedIntegration ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Platform</Label>
                <p className="font-medium">{getPlatformDisplay(managedIntegration.platform)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Status</Label>
                <div>
                  {managedIntegration.isActive ? (
                    <Badge variant="default" className="gap-1">
                      <Wifi className="w-3 h-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <WifiOff className="w-3 h-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Credentials (masked)</Label>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-40 font-mono">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(managedIntegration.credentials), null, 2);
                    } catch {
                      return managedIntegration.credentials;
                    }
                  })()}
                </pre>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Connected Since</Label>
                <p className="text-sm">{new Date(managedIntegration.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
              </div>
              {managedIntegration.lastSyncAt && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Last Synced</Label>
                  <p className="text-sm">{new Date(managedIntegration.lastSyncAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>Integration details not found.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageDialogOpen(false)}>
              Close
            </Button>
            {managedIntegration?.isActive && (
              <Button
                variant="outline"
                onClick={() => handleTestConnection(managedIntegration.platform)}
                disabled={testConnectionMutation.isPending}
              >
                {testConnectionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Disconnect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {getPlatformDisplay(disconnectPlatform)}? This will clear all stored credentials and deactivate the integration.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              This action cannot be undone. You will need to re-enter credentials to reconnect.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnectIntegration}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
