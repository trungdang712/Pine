"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Trophy, Star, Zap, Target, Users, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { useLanguage } from "@/i18n";

// Icon mapping based on achievement category or iconUrl
const getIconDisplay = (iconUrl: string | null | undefined, category: string) => {
  if (iconUrl) {
    const iconMap: Record<string, string> = {
      trophy: "🏆",
      zap: "⚡",
      fire: "🔥",
      flame: "🔥",
      target: "🎯",
      lightbulb: "💡",
      palette: "🎨",
      rocket: "🚀",
      star: "🌟",
      handshake: "🤝",
      chat: "💬",
      video: "🎬",
      phone: "📱",
      coffee: "☕",
    };
    return iconMap[iconUrl] || iconUrl;
  }
  // Fallback based on category
  const categoryIcons: Record<string, string> = {
    performance: "🏆",
    innovation: "💡",
    collaboration: "🌟",
    content: "🎬",
  };
  return categoryIcons[category] || "⭐";
};

// Derive rarity from points (since the DB model has no rarity field)
const getRarityFromPoints = (points: number): string => {
  if (points >= 200) return "legendary";
  if (points >= 125) return "epic";
  if (points >= 50) return "rare";
  return "common";
};

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


export default function AchievementsPage() {
  const { t } = useLanguage();
  // Fetch achievements from tRPC
  const myAchievementsQuery = trpc.gamification.getMyAchievements.useQuery();
  const allAchievementsQuery = trpc.gamification.getAllAchievements.useQuery();

  const isLoading = myAchievementsQuery.isLoading || allAchievementsQuery.isLoading;
  const error = myAchievementsQuery.error || allAchievementsQuery.error;

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) {
    return (
      <PageError
        error={error}
        onRetry={() => {
          myAchievementsQuery.refetch();
          allAchievementsQuery.refetch();
        }}
      />
    );
  }

  const { earned = [], available = [] } = myAchievementsQuery.data || {};
  const allAchievements = allAchievementsQuery.data || [];

  const totalCount = allAchievements.length;
  const earnedCount = earned.length;
  const totalPoints = earned.reduce((sum, a) => sum + a.points, 0);

  // Combine earned + available for tab display
  const combinedAchievements = [
    ...earned.map((a) => ({
      id: a.id,
      icon: getIconDisplay(a.iconUrl, a.category),
      name: a.name,
      description: a.description,
      earned: true as const,
      earnedAt: a.earnedAt,
      rarity: getRarityFromPoints(a.points),
      category: a.category,
      points: a.points,
    })),
    ...available.map((a) => ({
      id: a.id,
      icon: getIconDisplay(a.iconUrl, a.category),
      name: a.name,
      description: a.description,
      earned: false as const,
      earnedAt: null,
      rarity: getRarityFromPoints(a.points),
      category: a.category,
      points: a.points,
    })),
  ];

  const legendaryEarnedCount = combinedAchievements.filter(
    (a) => a.earned && a.rarity === "legendary"
  ).length;
  const inProgressCount = combinedAchievements.filter((a) => !a.earned).length;

  const categories = ["all", "performance", "innovation", "collaboration", "content"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.gamification.achievements.title}</h1>
        <p className="text-muted-foreground">
          {t.gamification.achievements.subtitle}
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
                {earnedCount}/{totalCount}
              </p>
              <p className="text-sm text-muted-foreground">{t.gamification.achievements.unlocked}</p>
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
              <p className="text-sm text-muted-foreground">{t.gamification.leaderboard.points}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{legendaryEarnedCount}</p>
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
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">{t.gamification.achievements.progress}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs by Category */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            <Award className="h-4 w-4 mr-2" />
            {t.common.all}
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Target className="h-4 w-4 mr-2" />
            {t.performance.title}
          </TabsTrigger>
          <TabsTrigger value="innovation">
            <Lightbulb className="h-4 w-4 mr-2" />
            {t.proposals.ideas.title}
          </TabsTrigger>
          <TabsTrigger value="collaboration">
            <Users className="h-4 w-4 mr-2" />
            {t.performance.metrics.teamCollaboration}
          </TabsTrigger>
          <TabsTrigger value="content">
            <Star className="h-4 w-4 mr-2" />
            {t.calendar.contentType}
          </TabsTrigger>
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {/* Earned Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.gamification.achievements.unlocked}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {combinedAchievements
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
                          {achievement.earnedAt && (
                            <p className="text-xs text-green-600">
                              {"\u2713"} Dat duoc ngay{" "}
                              {new Date(achievement.earnedAt).toLocaleDateString()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                {combinedAchievements.filter(
                  (a) => a.earned && (category === "all" || a.category === category)
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">
                    {t.gamification.achievements.noAchievements}
                  </p>
                )}
              </div>
            </div>

            {/* In Progress / Available Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.gamification.achievements.progress}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {combinedAchievements
                  .filter(
                    (a) =>
                      !a.earned && (category === "all" || a.category === category)
                  )
                  .map((achievement) => {
                    const rarityConfig = getRarityConfig(achievement.rarity);
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
                          <div className="mt-2 text-xs text-muted-foreground">
                            {t.gamification.rewards.title}: +{achievement.points} pts
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                {combinedAchievements.filter(
                  (a) => !a.earned && (category === "all" || a.category === category)
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">
                    {t.common.completed}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
