"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Award, Gift, Star } from "lucide-react";

export default function GamificationPage() {
  const teamMembers = [
    {
      name: "Trần Văn B",
      role: "Graphic Designer",
      points: 520,
      badges: ["🏆", "🎯", "⚡"],
      rank: 1,
    },
    {
      name: "Nguyễn Văn A",
      role: "Content Creator",
      points: 450,
      badges: ["🏆", "🎯"],
      rank: 2,
    },
    {
      name: "Phạm Văn D",
      role: "Video Producer",
      points: 420,
      badges: ["🎬"],
      rank: 3,
    },
    {
      name: "Lê Thị C",
      role: "Digital Marketing",
      points: 380,
      badges: ["🎯"],
      rank: 4,
    },
  ];

  const achievements = [
    {
      id: 1,
      icon: "🏆",
      name: "Task Master",
      description: "Complete 50 tasks",
      earned: true,
      earnedDate: "January 5, 2024",
      rarity: "rare",
    },
    {
      id: 2,
      icon: "🎯",
      name: "On-Time Pro",
      description: "Maintain 90% on-time rate for 3 months",
      earned: true,
      earnedDate: "December 20, 2023",
      rarity: "epic",
    },
    {
      id: 3,
      icon: "⚡",
      name: "Speed Demon",
      description: "Complete 10 tasks ahead of deadline",
      earned: true,
      earnedDate: "November 15, 2023",
      rarity: "rare",
    },
    {
      id: 4,
      icon: "💡",
      name: "Idea Machine",
      description: "Have 3 innovation ideas implemented",
      earned: true,
      earnedDate: "October 10, 2023",
      rarity: "legendary",
    },
    {
      id: 5,
      icon: "🎨",
      name: "Creative Master",
      description: "Create content with 2x average engagement 5 times",
      earned: false,
      progress: 4,
      total: 5,
      rarity: "epic",
    },
    {
      id: 6,
      icon: "🌟",
      name: "Team Player",
      description: "Receive 5-star rating from 10 different team members",
      earned: false,
      progress: 7,
      total: 10,
      rarity: "legendary",
    },
    {
      id: 7,
      icon: "🔥",
      name: "Streak Master",
      description: "Complete tasks on-time for 30 consecutive days",
      earned: false,
      progress: 23,
      total: 30,
      rarity: "legendary",
    },
    {
      id: 8,
      icon: "🎬",
      name: "Video Star",
      description: "Create a video with over 10K views",
      earned: true,
      earnedDate: "January 10, 2024",
      rarity: "epic",
    },
  ];

  const rewards = [
    {
      id: 1,
      name: "Coffee Voucher",
      pointsCost: 100,
      available: true,
      icon: "☕",
      description: "Free coffee at clinic café",
    },
    {
      id: 2,
      name: "Extra Day Off",
      pointsCost: 500,
      available: true,
      icon: "🏖️",
      description: "One extra day of paid leave",
    },
    {
      id: 3,
      name: "Team Lunch",
      pointsCost: 300,
      available: true,
      icon: "🍽️",
      description: "Lunch treat for your team",
    },
    {
      id: 4,
      name: "Tech Gadget",
      pointsCost: 1000,
      available: false,
      icon: "🎧",
      description: "Premium headphones or accessories",
    },
    {
      id: 5,
      name: "Training Course",
      pointsCost: 400,
      available: true,
      icon: "📚",
      description: "Online course of your choice",
    },
    {
      id: 6,
      name: "Spa Voucher",
      pointsCost: 600,
      available: true,
      icon: "💆",
      description: "Relaxing spa treatment",
    },
  ];

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

  const userPoints = 450;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Leaderboard & Achievements</h1>
        <p className="text-muted-foreground">
          Gamification system to motivate and reward team performance
        </p>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="w-4 h-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Team Rankings</h2>
            <Select defaultValue="this-month">
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Top 3 Podium */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* 2nd Place */}
                <div className="text-center pt-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 text-gray-700 font-bold text-2xl mb-2">
                    #2
                  </div>
                  <h3 className="font-semibold">{teamMembers[1].name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {teamMembers[1].role}
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">
                    {teamMembers[1].points} pts
                  </p>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-3xl mb-2">
                    #1
                  </div>
                  <h3 className="font-semibold text-lg">{teamMembers[0].name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {teamMembers[0].role}
                  </p>
                  <p className="text-xl font-bold text-primary mt-2">
                    {teamMembers[0].points} pts
                  </p>
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mt-1" />
                </div>

                {/* 3rd Place */}
                <div className="text-center pt-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-700 font-bold text-xl mb-2">
                    #3
                  </div>
                  <h3 className="font-semibold">{teamMembers[2].name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {teamMembers[2].role}
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">
                    {teamMembers[2].points} pts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Full Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      member.rank <= 3 ? "border-2 border-primary/20" : "border"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        member.rank === 1
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                          : member.rank === 2
                          ? "bg-gray-200 text-gray-700"
                          : member.rank === 3
                          ? "bg-amber-100 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      #{member.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{member.name}</h3>
                        <div className="flex gap-1">
                          {member.badges.map((badge, i) => (
                            <span key={i}>{badge}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {member.points}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Point System */}
          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <span className="font-medium">Task Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">+10 pts</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚡</span>
                    <span className="font-medium">Early Completion</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">+5 pts</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💡</span>
                    <span className="font-medium">Proposal Submitted</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">+15 pts</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✨</span>
                    <span className="font-medium">Proposal Approved</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">+25 pts</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚀</span>
                    <span className="font-medium">Innovation Implemented</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">+50 pts</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🔥</span>
                    <span className="font-medium">7-Day Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">+20 pts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Achievements</CardTitle>
                <Badge variant="secondary">
                  {achievements.filter((a) => a.earned).length} /{" "}
                  {achievements.length} Earned
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`${
                      achievement.earned ? "border-2" : "opacity-60"
                    } ${
                      achievement.earned ? getRarityColor(achievement.rarity) : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <Badge
                          variant={achievement.earned ? "secondary" : "outline"}
                        >
                          {getRarityLabel(achievement.rarity)}
                        </Badge>
                        <h3
                          className={`font-semibold ${
                            achievement.earned ? "text-white" : ""
                          }`}
                        >
                          {achievement.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            achievement.earned
                              ? "text-white/90"
                              : "text-muted-foreground"
                          }`}
                        >
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <p className="text-xs text-white/80">
                            ✓ Earned {achievement.earnedDate}
                          </p>
                        )}
                        {!achievement.earned &&
                          achievement.progress !== undefined && (
                            <div className="space-y-1">
                              <Progress
                                value={
                                  (achievement.progress / achievement.total!) *
                                  100
                                }
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                Progress: {achievement.progress} /{" "}
                                {achievement.total}
                              </p>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievement Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span>🏆</span> Task Master - 50 tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <span>⚡</span> Speed Demon - 10 early
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🔥</span> Streak Master - 30 days
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span>💡</span> Idea Machine - 3 ideas
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🎨</span> Creative Master - 5 viral
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🌟</span> Trendsetter - new format
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span>🌟</span> Team Player - 10 ratings
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🤝</span> Bridge Builder - collab
                  </li>
                  <li className="flex items-center gap-2">
                    <span>💬</span> Mentor - 20 reviews
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Your Available Points
                  </p>
                  <p className="text-3xl font-bold text-primary">{userPoints}</p>
                </div>
                <Trophy className="w-12 h-12 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redeem Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className={!reward.available ? "opacity-50" : ""}
                  >
                    <CardContent className="p-6">
                      <div className="text-center space-y-3">
                        <div className="text-5xl">{reward.icon}</div>
                        <h3 className="font-semibold">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                        <Badge variant="secondary" className="text-lg">
                          {reward.pointsCost} points
                        </Badge>
                        <Button
                          className="w-full"
                          disabled={
                            !reward.available || reward.pointsCost > userPoints
                          }
                        >
                          {!reward.available
                            ? "Out of Stock"
                            : reward.pointsCost > userPoints
                            ? "Not Enough Points"
                            : "Redeem"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Redemption History */}
          <Card>
            <CardHeader>
              <CardTitle>Redemption History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">☕</span>
                    <div>
                      <p className="font-medium">Coffee Voucher</p>
                      <p className="text-sm text-muted-foreground">
                        December 15, 2023
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">-100 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🍽️</span>
                    <div>
                      <p className="font-medium">Team Lunch</p>
                      <p className="text-sm text-muted-foreground">
                        November 20, 2023
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">-300 pts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
