"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LoadingSpinner, PageLoading } from "@/components/ui/loading-spinner";
import { ErrorDisplay, PageError } from "@/components/ui/error-display";
import { toast } from "sonner";
import { useLanguage } from "@/i18n";

type LeaderboardPeriod = "weekly" | "monthly" | "allTime";

export default function GamificationPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>("monthly");

  // Fetch user points
  const myPointsQuery = trpc.gamification.getMyPoints.useQuery();

  // Fetch leaderboards
  const weeklyLeaderboardQuery = trpc.gamification.getWeeklyLeaderboard.useQuery(undefined, {
    enabled: leaderboardPeriod === "weekly",
  });
  const monthlyLeaderboardQuery = trpc.gamification.getMonthlyLeaderboard.useQuery(undefined, {
    enabled: leaderboardPeriod === "monthly",
  });
  const allTimeLeaderboardQuery = trpc.gamification.getAllTimeLeaderboard.useQuery(undefined, {
    enabled: leaderboardPeriod === "allTime",
  });

  // Fetch achievements
  const myAchievementsQuery = trpc.gamification.getMyAchievements.useQuery();
  const allAchievementsQuery = trpc.gamification.getAllAchievements.useQuery();

  // Fetch rewards
  const rewardsQuery = trpc.gamification.getAvailableRewards.useQuery();

  // Redeem reward mutation
  const redeemMutation = trpc.gamification.redeemReward.useMutation({
    onSuccess: () => {
      toast.success("Reward redeemed successfully!");
      rewardsQuery.refetch();
      myPointsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to redeem reward");
    },
  });

  // Get active leaderboard data based on selected period
  const getActiveLeaderboard = () => {
    switch (leaderboardPeriod) {
      case "weekly":
        return weeklyLeaderboardQuery;
      case "monthly":
        return monthlyLeaderboardQuery;
      case "allTime":
        return allTimeLeaderboardQuery;
    }
  };

  const activeLeaderboardQuery = getActiveLeaderboard();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "epic":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "Legendary";
      case "epic":
        return "Epic";
      case "rare":
        return "Rare";
      default:
        return "Common";
    }
  };

  const getIconDisplay = (iconName: string | null | undefined) => {
    const iconMap: Record<string, string> = {
      trophy: "🏆",
      target: "🎯",
      zap: "⚡",
      lightbulb: "💡",
      palette: "🎨",
      star: "🌟",
      video: "🎬",
      edit: "📝",
      coffee: "☕",
      palmtree: "🏖️",
      utensils: "🍽️",
      headphones: "🎧",
      performance: "📈",
      innovation: "💡",
      collaboration: "🤝",
      content: "📝",
    };
    return iconMap[iconName || ""] || "⭐";
  };

  const getPointsForPeriod = (entry: { weeklyPoints: number; monthlyPoints: number; totalPoints: number }) => {
    switch (leaderboardPeriod) {
      case "weekly":
        return entry.weeklyPoints;
      case "monthly":
        return entry.monthlyPoints;
      case "allTime":
        return entry.totalPoints;
    }
  };

  const handleRedeemReward = (rewardId: string) => {
    redeemMutation.mutate({ rewardId });
  };

  const renderLeaderboard = () => {
    if (activeLeaderboardQuery.isLoading || myPointsQuery.isLoading) {
      return <PageLoading text={t.common.loading} />;
    }

    if (activeLeaderboardQuery.error) {
      return (
        <PageError
          error={activeLeaderboardQuery.error}
          onRetry={() => activeLeaderboardQuery.refetch()}
        />
      );
    }

    const leaderboard = activeLeaderboardQuery.data || [];
    const myPoints = myPointsQuery.data?.points;
    const currentUserPoints = myPoints
      ? getPointsForPeriod({
          weeklyPoints: myPoints.weeklyPoints,
          monthlyPoints: myPoints.monthlyPoints,
          totalPoints: myPoints.totalPoints,
        })
      : 0;

    // Find user's rank in leaderboard - the userId exists on the actual data object (not the fallback)
    const userIdFromPoints = myPointsQuery.data?.points && 'userId' in myPointsQuery.data.points
      ? myPointsQuery.data.points.userId
      : undefined;
    const userRank = userIdFromPoints
      ? leaderboard.findIndex((entry) => entry.user?.id === userIdFromPoints) + 1
      : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t.gamification.leaderboard.title}</h2>
          <Tabs
            value={leaderboardPeriod}
            onValueChange={(value) => setLeaderboardPeriod(value as LeaderboardPeriod)}
          >
            <TabsList>
              <TabsTrigger value="weekly">{t.performance.periods.thisWeek}</TabsTrigger>
              <TabsTrigger value="monthly">{t.performance.periods.thisMonth}</TabsTrigger>
              <TabsTrigger value="allTime">{t.performance.periods.thisYear}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <div className="flex items-end justify-center gap-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-white">
                      {leaderboard[1]?.user?.name?.split(" ")[0]?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{leaderboard[1]?.user?.name || "Unknown"}</div>
                    <div className="text-2xl font-bold text-primary">
                      {getPointsForPeriod(leaderboard[1])}
                    </div>
                    <div className="text-sm text-muted-foreground">{t.gamification.leaderboard.points}</div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center -mt-8">
                  <div className="text-5xl mb-2">🥇</div>
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {leaderboard[0]?.user?.name?.split(" ")[0]?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{leaderboard[0]?.user?.name || "Unknown"}</div>
                    <div className="text-3xl font-bold text-primary">
                      {getPointsForPeriod(leaderboard[0])}
                    </div>
                    <div className="text-sm text-muted-foreground">{t.gamification.leaderboard.points}</div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-white">
                      {leaderboard[2]?.user?.name?.split(" ")[0]?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{leaderboard[2]?.user?.name || "Unknown"}</div>
                    <div className="text-2xl font-bold text-primary">
                      {getPointsForPeriod(leaderboard[2])}
                    </div>
                    <div className="text-sm text-muted-foreground">{t.gamification.leaderboard.points}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>{t.performance.team.rankings}</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.common.noData}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">{t.gamification.leaderboard.rank}</th>
                      <th className="text-left p-3 font-medium">{t.gamification.leaderboard.member}</th>
                      <th className="text-left p-3 font-medium">{t.settings.profile.role}</th>
                      <th className="text-center p-3 font-medium">{t.gamification.leaderboard.points}</th>
                      <th className="text-center p-3 font-medium">{t.gamification.leaderboard.level}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.userId}
                        className={`border-b hover:bg-accent/50 ${
                          userRank === index + 1 ? "bg-accent/20" : ""
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {index < 3 && <Trophy className="w-5 h-5 text-yellow-500" />}
                            <span className="font-semibold">#{index + 1}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{entry.user?.name || "Unknown"}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{entry.user?.role || "Member"}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-semibold text-primary">
                            {getPointsForPeriod(entry)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">Lvl {entry.level}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Position Card */}
        <Card className="border-2 border-primary">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">
                  {t.gamification.leaderboard.rank}: {userRank > 0 ? `#${userRank}` : t.common.noData}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.gamification.points.earned}: {currentUserPoints} {t.gamification.leaderboard.points}{" "}
                  {leaderboardPeriod === "weekly"
                    ? t.performance.periods.thisWeek
                    : leaderboardPeriod === "monthly"
                    ? t.performance.periods.thisMonth
                    : t.gamification.points.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAchievements = () => {
    if (myAchievementsQuery.isLoading) {
      return <PageLoading text={t.common.loading} />;
    }

    if (myAchievementsQuery.error) {
      return (
        <PageError
          error={myAchievementsQuery.error}
          onRetry={() => myAchievementsQuery.refetch()}
        />
      );
    }

    const { earned = [], available = [] } = myAchievementsQuery.data || {};
    const recentEarned = earned[0];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t.gamification.achievements.title}</h2>
          <div className="text-sm text-muted-foreground">
            {earned.length} {t.gamification.achievements.unlocked} / {earned.length + available.length} {t.gamification.points.total.toLowerCase()}
          </div>
        </div>

        {/* Recent Achievement */}
        {recentEarned && (
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getIconDisplay(recentEarned.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">NEW! {recentEarned.name}</h3>
                    <Badge className={getRarityColor(recentEarned.category || "common")}>
                      {getRarityLabel(recentEarned.category || "common")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{recentEarned.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Earned: {new Date(recentEarned.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Badges */}
        <div>
          <h3 className="font-semibold mb-3">{t.gamification.achievements.unlocked} ({earned.length})</h3>
          {earned.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {t.gamification.achievements.noAchievements}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earned.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-5xl mb-2">{getIconDisplay(achievement.category)}</div>
                    <Badge className={`${getRarityColor(achievement.category || "common")} mb-2 text-xs`}>
                      {getRarityLabel(achievement.category || "common")}
                    </Badge>
                    <h4 className="font-semibold mb-1">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available Achievements */}
        {available.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">{t.gamification.achievements.locked} ({available.length})</h3>
            <div className="space-y-4">
              {available.slice(0, 5).map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl opacity-50">{getIconDisplay(achievement.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getRarityLabel(achievement.category || "common")}
                          </Badge>
                          {achievement.points > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.points} pts
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {available.length > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  And {available.length - 5} more achievements to unlock...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRewards = () => {
    if (rewardsQuery.isLoading || myPointsQuery.isLoading) {
      return <PageLoading text={t.common.loading} />;
    }

    if (rewardsQuery.error) {
      return (
        <PageError
          error={rewardsQuery.error}
          onRetry={() => rewardsQuery.refetch()}
        />
      );
    }

    const { rewards = [], currentPoints = 0 } = rewardsQuery.data || {};

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t.gamification.rewards.title}</h2>
            <p className="text-sm text-muted-foreground">{t.gamification.rewards.subtitle}</p>
          </div>
          <Card className="border-2 border-primary">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t.gamification.rewards.availablePoints}</p>
                <p className="text-3xl font-bold text-primary">{currentPoints}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {rewards.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {t.gamification.rewards.noRewards}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const canAfford = currentPoints >= reward.pointsCost;
              return (
                <Card key={reward.id} className={canAfford ? "" : "opacity-50"}>
                  <CardContent className="p-5">
                    <div className="text-center">
                      <div className="text-5xl mb-3">{getIconDisplay(reward.name?.toLowerCase())}</div>
                      <h3 className="font-semibold mb-1">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="text-xl font-bold text-primary">{reward.pointsCost}</span>
                        <span className="text-sm text-muted-foreground">{t.gamification.leaderboard.points}</span>
                      </div>
                      {canAfford ? (
                        <Button
                          className="w-full"
                          onClick={() => handleRedeemReward(reward.id)}
                          disabled={redeemMutation.isPending}
                        >
                          {redeemMutation.isPending ? (
                            <LoadingSpinner size="sm" className="p-0" />
                          ) : (
                            t.gamification.rewards.redeem
                          )}
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="w-full justify-center py-2">
                          {reward.pointsCost - currentPoints} {t.gamification.leaderboard.points}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">{t.gamification.leaderboard.title}</TabsTrigger>
          <TabsTrigger value="achievements">{t.gamification.achievements.title}</TabsTrigger>
          <TabsTrigger value="rewards">{t.gamification.rewards.title}</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">{renderLeaderboard()}</TabsContent>

        <TabsContent value="achievements">{renderAchievements()}</TabsContent>

        <TabsContent value="rewards">{renderRewards()}</TabsContent>
      </Tabs>
    </div>
  );
}
