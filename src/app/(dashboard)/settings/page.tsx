"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Shield,
  Palette,
  Users,
  Link2,
  Camera,
  Save,
  Trash2,
  Plus,
} from "lucide-react";

const teamMembers = [
  { id: "1", name: "Nguyễn Văn A", email: "a@dental.com", role: "Admin", avatar: null },
  { id: "2", name: "Trần Thị B", email: "b@dental.com", role: "Marketing Manager", avatar: null },
  { id: "3", name: "Lê Văn C", email: "c@dental.com", role: "Content Creator", avatar: null },
  { id: "4", name: "Phạm Văn D", email: "d@dental.com", role: "Graphic Designer", avatar: null },
  { id: "5", name: "Nguyễn Thị E", email: "e@dental.com", role: "Video Producer", avatar: null },
];

const integrations = [
  { id: "facebook", name: "Facebook", description: "Quản lý trang và đăng bài", connected: true, icon: "📘" },
  { id: "instagram", name: "Instagram", description: "Đồng bộ bài viết từ Facebook", connected: true, icon: "📸" },
  { id: "google-ads", name: "Google Ads", description: "Theo dõi chiến dịch quảng cáo", connected: false, icon: "📊" },
  { id: "zalo", name: "Zalo OA", description: "Quản lý Zalo Official Account", connected: true, icon: "💬" },
  { id: "tiktok", name: "TikTok", description: "Đăng video và xem analytics", connected: false, icon: "🎵" },
  { id: "google-analytics", name: "Google Analytics", description: "Theo dõi traffic website", connected: true, icon: "📈" },
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: {
      taskAssigned: true,
      taskCompleted: true,
      proposalStatus: true,
      weeklyReport: true,
    },
    push: {
      taskAssigned: true,
      taskCompleted: false,
      proposalStatus: true,
      mentions: true,
    },
  });

  const [appearance, setAppearance] = useState({
    darkMode: false,
    language: "vi",
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý tài khoản và tùy chỉnh hệ thống
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Giao diện
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link2 className="h-4 w-4 mr-2" />
            Kết nối
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin hồ sơ của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">NA</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Thay đổi ảnh
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG. Tối đa 5MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" defaultValue="Nguyễn Văn A" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="a@dental.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" defaultValue="0901234567" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Input id="role" defaultValue="Content Creator" disabled />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Chọn những thông báo bạn muốn nhận qua email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "taskAssigned", label: "Task được giao", desc: "Nhận email khi có task mới" },
                { key: "taskCompleted", label: "Task hoàn thành", desc: "Nhận email khi task được hoàn thành" },
                { key: "proposalStatus", label: "Cập nhật proposal", desc: "Nhận email khi proposal có cập nhật" },
                { key: "weeklyReport", label: "Báo cáo tuần", desc: "Nhận báo cáo tổng hợp hàng tuần" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications.email[item.key as keyof typeof notifications.email]}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: { ...notifications.email, [item.key]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Thông báo trên trình duyệt và ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "taskAssigned", label: "Task mới", desc: "Thông báo khi có task mới" },
                { key: "taskCompleted", label: "Task hoàn thành", desc: "Thông báo khi task hoàn thành" },
                { key: "proposalStatus", label: "Proposal cập nhật", desc: "Thông báo thay đổi proposal" },
                { key: "mentions", label: "Được nhắc đến", desc: "Thông báo khi ai đó mention bạn" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications.push[item.key as keyof typeof notifications.push]}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        push: { ...notifications.push, [item.key]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo vệ tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Cập nhật mật khẩu</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Thêm lớp bảo mật cho tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Xác thực 2 yếu tố</p>
                  <p className="text-sm text-muted-foreground">
                    Sử dụng ứng dụng authenticator để bảo vệ tài khoản
                  </p>
                </div>
                <Button variant="outline">Bật 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Giao diện</CardTitle>
              <CardDescription>
                Tùy chỉnh giao diện theo sở thích
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Sử dụng giao diện tối
                  </p>
                </div>
                <Switch
                  checked={appearance.darkMode}
                  onCheckedChange={(checked) =>
                    setAppearance({ ...appearance, darkMode: checked })
                  }
                />
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label>Ngôn ngữ</Label>
                <Select
                  value={appearance.language}
                  onValueChange={(value) =>
                    setAppearance({ ...appearance, language: value })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Quản lý thành viên trong team
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm thành viên
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.avatar ?? ""} />
                        <AvatarFallback>
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={member.role === "Admin" ? "default" : "secondary"}>
                        {member.role}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kết nối ứng dụng</CardTitle>
              <CardDescription>
                Kết nối với các nền tảng marketing và social media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {integration.connected ? (
                        <>
                          <Badge variant="success">Đã kết nối</Badge>
                          <Button variant="outline" size="sm">
                            Ngắt kết nối
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">Kết nối</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
