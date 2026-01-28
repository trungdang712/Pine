"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Trophy, Star, Zap, Target, Users, Lightbulb, Flame } from "lucide-react";

const achievements = [
  // Performance Category
  {
    id: 1,
    icon: "🏆",
    name: "Task Master",
    description: "Hoàn thành 50 tasks",
    earned: true,
    earnedDate: "05/01/2024",
    rarity: "rare",
    category: "performance",
    points: 100,
  },
  {
    id: 2,
    icon: "⚡",
    name: "Speed Demon",
    description: "Hoàn thành 10 tasks trước deadline",
    earned: true,
    earnedDate: "15/12/2023",
    rarity: "rare",
    category: "performance",
    points: 75,
  },
  {
    id: 3,
    icon: "🔥",
    name: "Streak Master",
    description: "Hoàn thành tasks đúng hạn 30 ngày liên tiếp",
    earned: false,
    progress: 23,
    total: 30,
    rarity: "legendary",
    category: "performance",
    points: 200,
  },
  {
    id: 4,
    icon: "🎯",
    name: "On-Time Pro",
    description: "Duy trì tỷ lệ đúng hạn 90% trong 3 tháng",
    earned: true,
    earnedDate: "20/12/2023",
    rarity: "epic",
    category: "performance",
    points: 150,
  },
  // Innovation Category
  {
    id: 5,
    icon: "💡",
    name: "Idea Machine",
    description: "Có 3 ý tưởng được triển khai",
    earned: true,
    earnedDate: "10/10/2023",
    rarity: "legendary",
    category: "innovation",
    points: 250,
  },
  {
    id: 6,
    icon: "🎨",
    name: "Creative Master",
    description: "Tạo content có engagement gấp 2x mức trung bình 5 lần",
    earned: false,
    progress: 4,
    total: 5,
    rarity: "epic",
    category: "innovation",
    points: 175,
  },
  {
    id: 7,
    icon: "🚀",
    name: "Trendsetter",
    description: "Tạo ra format content mới được team áp dụng",
    earned: false,
    progress: 0,
    total: 1,
    rarity: "legendary",
    category: "innovation",
    points: 300,
  },
  // Collaboration Category
  {
    id: 8,
    icon: "🌟",
    name: "Team Player",
    description: "Nhận đánh giá 5 sao từ 10 thành viên khác nhau",
    earned: false,
    progress: 7,
    total: 10,
    rarity: "epic",
    category: "collaboration",
    points: 150,
  },
  {
    id: 9,
    icon: "🤝",
    name: "Bridge Builder",
    description: "Hoàn thành 5 dự án collab giữa các team",
    earned: true,
    earnedDate: "01/11/2023",
    rarity: "rare",
    category: "collaboration",
    points: 100,
  },
  {
    id: 10,
    icon: "💬",
    name: "Mentor",
    description: "Review và feedback cho 20 tasks của team members",
    earned: false,
    progress: 14,
    total: 20,
    rarity: "epic",
    category: "collaboration",
    points: 125,
  },
  // Content Category
  {
    id: 11,
    icon: "🎬",
    name: "Video Star",
    description: "Tạo video đạt 10K views",
    earned: true,
    earnedDate: "10/01/2024",
    rarity: "epic",
    category: "content",
    points: 150,
  },
  {
    id: 12,
    icon: "📱",
    name: "Social Master",
    description: "Tạo 100 bài post trên social media",
    earned: false,
    progress: 78,
    total: 100,
    rarity: "rare",
    category: "content",
    points: 100,
  },
];

const getRarityConfig = (rarity: string) => {
  switch (rarity) {
    case "legendary":
      return {
        label: "Legendary",
        bgClass: "bg-gradient-to-r from-yellow-400 to-orange-500",
        textClass: "text-white",
        borderClass: "border-yellow-400",
      };
    case "epic":
      return {
        label: "Epic",
        bgClass: "bg-gradient-to-r from-purple-500 to-pink-500",
        textClass: "text-white",
        borderClass: "border-purple-500",
      };
    case "rare":
      return {
        label: "Rare",
        bgClass: "bg-gradient-to-r from-blue-500 to-cyan-500",
        textClass: "text-white",
        borderClass: "border-blue-500",
      };
    default:
      return {
        label: "Common",
        bgClass: "bg-gray-500",
        textClass: "text-white",
        borderClass: "border-gray-500",
      };
  }
};

const categoryIcons = {
  performance: Target,
  innovation: Lightbulb,
  collaboration: Users,
  content: Star,
};

export default function AchievementsPage() {
  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalPoints = achievements
    .filter((a) => a.earned)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Các thành tích đã đạt được và đang tiến tới
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {earnedCount}/{achievements.length}
              </p>
              <p className="text-sm text-muted-foreground">Đã đạt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">Điểm từ achievements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {achievements.filter((a) => a.earned && a.rarity === "legendary").length}
              </p>
              <p className="text-sm text-muted-foreground">Legendary</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {achievements.filter((a) => !a.earned).length}
              </p>
              <p className="text-sm text-muted-foreground">Đang tiến tới</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs by Category */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            <Award className="h-4 w-4 mr-2" />
            Tất cả
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Target className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="innovation">
            <Lightbulb className="h-4 w-4 mr-2" />
            Innovation
          </TabsTrigger>
          <TabsTrigger value="collaboration">
            <Users className="h-4 w-4 mr-2" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="content">
            <Star className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
        </TabsList>

        {["all", "performance", "innovation", "collaboration", "content"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {/* Earned Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Đã đạt được</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements
                  .filter(
                    (a) =>
                      a.earned && (category === "all" || a.category === category)
                  )
                  .map((achievement) => {
                    const rarityConfig = getRarityConfig(achievement.rarity);
                    return (
                      <Card
                        key={achievement.id}
                        className={`overflow-hidden border-2 ${rarityConfig.borderClass}`}
                      >
                        <div className={`${rarityConfig.bgClass} p-4`}>
                          <div className="flex items-center justify-between">
                            <span className="text-4xl">{achievement.icon}</span>
                            <Badge className="bg-white/20 text-white">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <Badge className={`${rarityConfig.bgClass} ${rarityConfig.textClass} mb-2`}>
                            {rarityConfig.label}
                          </Badge>
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-green-600">
                            ✓ Đạt được ngày {achievement.earnedDate}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* In Progress Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Đang tiến tới</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements
                  .filter(
                    (a) =>
                      !a.earned && (category === "all" || a.category === category)
                  )
                  .map((achievement) => {
                    const rarityConfig = getRarityConfig(achievement.rarity);
                    const progressPercent =
                      ((achievement.progress ?? 0) / (achievement.total ?? 1)) * 100;
                    return (
                      <Card key={achievement.id} className="opacity-80">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-4xl grayscale">{achievement.icon}</span>
                            <Badge variant="outline">{rarityConfig.label}</Badge>
                          </div>
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {achievement.description}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Tiến độ</span>
                              <span>
                                {achievement.progress}/{achievement.total}
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Phần thưởng: +{achievement.points} pts
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
