"use client";

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Gift, Trophy, Star, Clock, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { PageLoading, LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";
import { toast } from "sonner";
import { useLanguage } from "@/i18n";

// Icon mapping for rewards based on name keywords
const getRewardIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("coffee")) return "\u2615";
  if (lower.includes("lunch") || lower.includes("food") || lower.includes("meal")) return "\ud83c\udf7d\ufe0f";
  if (lower.includes("day off") || lower.includes("vacation") || lower.includes("holiday")) return "\ud83c\udfd6\ufe0f";
  if (lower.includes("training") || lower.includes("course") || lower.includes("book")) return "\ud83d\udcda";
  if (lower.includes("spa") || lower.includes("massage")) return "\ud83d\udc86";
  if (lower.includes("tech") || lower.includes("gadget") || lower.includes("headphone")) return "\ud83c\udfa7";
  if (lower.includes("home") || lower.includes("remote")) return "\ud83c\udfe0";
  if (lower.includes("recognition") || lower.includes("wall")) return "\ud83c\udf1f";
  if (lower.includes("movie") || lower.includes("ticket")) return "\ud83c\udfac";
  if (lower.includes("gift")) return "\ud83c\udf81";
  return "\ud83c\udf81";
};

interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function RewardsPage() {
  const { t } = useLanguage();
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  // Fetch rewards and points from tRPC
  const rewardsQuery = trpc.gamification.getAvailableRewards.useQuery();
  const myPointsQuery = trpc.gamification.getMyPoints.useQuery();
  const redemptionsQuery = trpc.gamification.getMyRedemptions.useQuery();

  // Redeem mutation
  const redeemMutation = trpc.gamification.redeemReward.useMutation({
    onSuccess: () => {
      toast.success("Doi thuong thanh cong!");
      setIsRedeemOpen(false);
      setSelectedReward(null);
      rewardsQuery.refetch();
      myPointsQuery.refetch();
      redemptionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Doi thuong that bai");
    },
  });

  const isLoading = rewardsQuery.isLoading || myPointsQuery.isLoading;
  const error = rewardsQuery.error || myPointsQuery.error;

  if (isLoading) return <PageLoading text={t.common.loading} />;
  if (error) {
    return (
      <PageError
        error={error}
        onRetry={() => {
          rewardsQuery.refetch();
          myPointsQuery.refetch();
          redemptionsQuery.refetch();
        }}
      />
    );
  }

  const { rewards = [], currentPoints: rewardsCurrentPoints = 0 } = rewardsQuery.data || {};
  const myPoints = myPointsQuery.data?.points;
  const userPoints = myPoints?.totalPoints ?? rewardsCurrentPoints;
  const userLevel = myPoints?.level ?? 1;

  const redemptionHistory = redemptionsQuery.data || [];

  const openRedeem = (reward: RewardItem) => {
    setSelectedReward(reward);
    setIsRedeemOpen(true);
  };

  const handleRedeem = () => {
    if (!selectedReward) return;
    redeemMutation.mutate({ rewardId: selectedReward.id });
  };

  const canRedeem = (reward: RewardItem) => {
    return reward.isActive && reward.pointsCost <= userPoints;
  };

  // Compute stats
  const availableRewardsCount = rewards.filter((r) => r.isActive).length;
  const redemptionCount = redemptionHistory.length;
  const totalPointsSpent = redemptionHistory.reduce((sum, r) => sum + (r.reward?.pointsCost ?? 0), 0);

  // Level progress: each level requires level * 1000 points (simple heuristic)
  const nextLevelThreshold = userLevel * 1000;

  // Status display mapping
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "fulfilled":
        return { label: "Da nhan", color: "text-green-600" };
      case "approved":
        return { label: "Da duyet", color: "text-blue-600" };
      case "pending":
        return { label: "Dang xu ly", color: "text-yellow-600" };
      case "rejected":
        return { label: "Tu choi", color: "text-red-600" };
      default:
        return { label: status, color: "text-muted-foreground" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.gamification.rewards.title}</h1>
        <p className="text-muted-foreground">
          {t.gamification.rewards.subtitle}
        </p>
      </div>

      {/* User Points Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t.gamification.rewards.availablePoints}</p>
              <p className="text-4xl font-bold text-primary">{userPoints}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t.gamification.leaderboard.points}
              </p>
            </div>
            <div className="text-right">
              <Trophy className="h-16 w-16 text-amber-500 mb-2" />
              <Badge variant="secondary">Level {userLevel}</Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>{t.gamification.leaderboard.level} {userLevel + 1}</span>
              <span>{userPoints}/{nextLevelThreshold}</span>
            </div>
            <Progress value={Math.min((userPoints / nextLevelThreshold) * 100, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availableRewardsCount}</p>
              <p className="text-sm text-muted-foreground">{t.gamification.rewards.title}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Check className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{redemptionCount}</p>
              <p className="text-sm text-muted-foreground">{t.gamification.rewards.redeemHistory}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPointsSpent}</p>
              <p className="text-sm text-muted-foreground">{t.gamification.points.spent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t.gamification.rewards.title}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const canGet = canRedeem(reward);
            const icon = getRewardIcon(reward.name);

            return (
              <Card
                key={reward.id}
                className={`overflow-hidden ${!reward.isActive ? "opacity-60" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl">{icon}</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{reward.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {reward.pointsCost} diem
                    </Badge>
                    {!reward.isActive && (
                      <span className="text-xs text-red-600">{t.common.inactive}</span>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    disabled={!canGet}
                    onClick={() => openRedeem(reward)}
                  >
                    {!reward.isActive
                      ? t.common.inactive
                      : reward.pointsCost > userPoints
                      ? `${reward.pointsCost - userPoints} ${t.gamification.leaderboard.points}`
                      : t.gamification.rewards.redeem}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {rewards.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-8">
              {t.gamification.rewards.noRewards}
            </p>
          )}
        </div>
      </div>

      {/* Redemption History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t.gamification.rewards.redeemHistory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {redemptionsQuery.isLoading ? (
            <LoadingSpinner size="sm" text={t.common.loading} />
          ) : redemptionHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.common.noData}
            </p>
          ) : (
            <div className="space-y-3">
              {redemptionHistory.map((item) => {
                const statusInfo = getStatusDisplay(item.status);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{item.reward?.name ?? "Unknown reward"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.redeemedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-red-600">
                        -{item.reward?.pointsCost ?? 0} pts
                      </Badge>
                      <p className={`text-xs mt-1 ${statusInfo.color}`}>
                        {item.status === "fulfilled" && (
                          <Check className="h-3 w-3 inline mr-1" />
                        )}
                        {statusInfo.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redeem Dialog */}
      <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-[400px] w-full max-h-[100dvh] sm:max-h-[80vh] overflow-y-auto">
          {selectedReward && (
            <>
              <DialogHeader>
                <div className="text-center mb-4">
                  <span className="text-6xl">{getRewardIcon(selectedReward.name)}</span>
                </div>
                <DialogTitle className="text-center">
                  {selectedReward.name}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {selectedReward.description}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <span>{t.gamification.points.spent}</span>
                  <span className="font-bold text-lg">
                    {selectedReward.pointsCost} {t.gamification.leaderboard.points}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span>{t.gamification.rewards.availablePoints}</span>
                  <span className="font-bold text-lg text-primary">
                    {userPoints} {t.gamification.leaderboard.points}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border-t">
                  <span>{t.gamification.points.total}</span>
                  <span className="font-bold text-lg">
                    {userPoints - selectedReward.pointsCost} {t.gamification.leaderboard.points}
                  </span>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsRedeemOpen(false)}
                  disabled={redeemMutation.isPending}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={handleRedeem}
                  disabled={redeemMutation.isPending}
                >
                  {redeemMutation.isPending ? (
                    <LoadingSpinner size="sm" className="p-0" />
                  ) : (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      {t.common.confirm}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
