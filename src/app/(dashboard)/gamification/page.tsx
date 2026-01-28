"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Trophy, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState("leaderboard");

  const leaderboard = [
    { rank: 1, name: "Tran Van B", role: "Design", points: 520, change: 2, badges: ["trophy", "target", "zap"] },
    { rank: 2, name: "Nguyen Van A", role: "Content", points: 450, change: 0, badges: ["trophy", "target"] },
    { rank: 3, name: "Le Thi C", role: "Digital", points: 380, change: -1, badges: ["target"] },
    { rank: 4, name: "Pham Van D", role: "Video", points: 320, change: 1, badges: ["video"] },
    { rank: 5, name: "Hoang Thi E", role: "Content", points: 280, change: 0, badges: ["edit"] },
    { rank: 6, name: "Dang Van F", role: "Design", points: 250, change: -2, badges: ["palette"] },
  ];

  const achievements = [
    {
      id: 1,
      icon: "trophy",
      name: "Task Master",
      description: "Complete 50 tasks",
      earned: true,
      earnedDate: "January 5, 2024",
      rarity: "rare",
    },
    {
      id: 2,
      icon: "target",
      name: "On-Time Pro",
      description: "Maintain 90% on-time rate for 3 months",
      earned: true,
      earnedDate: "December 20, 2023",
      rarity: "epic",
    },
    {
      id: 3,
      icon: "zap",
      name: "Speed Demon",
      description: "Complete 10 tasks ahead of deadline",
      earned: true,
      earnedDate: "November 15, 2023",
      rarity: "rare",
    },
    {
      id: 4,
      icon: "lightbulb",
      name: "Idea Machine",
      description: "Have 3 innovation ideas implemented",
      earned: true,
      earnedDate: "October 10, 2023",
      rarity: "legendary",
    },
    {
      id: 5,
      icon: "palette",
      name: "Creative Master",
      description: "Create content with 2x average engagement 5 times",
      earned: false,
      progress: 4,
      total: 5,
      rarity: "epic",
    },
    {
      id: 6,
      icon: "star",
      name: "Team Player",
      description: "Receive 5-star rating from 10 different team members",
      earned: false,
      progress: 7,
      total: 10,
      rarity: "legendary",
    },
  ];

  const rewards = [
    {
      id: 1,
      name: "Coffee Voucher",
      pointsCost: 100,
      available: true,
      icon: "coffee",
      description: "Free coffee at clinic cafe",
    },
    {
      id: 2,
      name: "Extra Day Off",
      pointsCost: 500,
      available: true,
      icon: "palmtree",
      description: "One extra day of paid leave",
    },
    {
      id: 3,
      name: "Team Lunch",
      pointsCost: 300,
      available: true,
      icon: "utensils",
      description: "Lunch treat for your team",
    },
    {
      id: 4,
      name: "Tech Gadget",
      pointsCost: 1000,
      available: false,
      icon: "headphones",
      description: "Premium headphones or accessories",
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

  const getIconDisplay = (iconName: string) => {
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
    };
    return iconMap[iconName] || "⭐";
  };

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Leaderboard</h2>
        <Tabs defaultValue="this-month">
          <TabsList>
            <TabsTrigger value="this-week">This Week</TabsTrigger>
            <TabsTrigger value="this-month">This Month</TabsTrigger>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Top 3 Podium */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-white">{leaderboard[1].name.split(" ")[0]}</span>
              </div>
              <div className="text-center">
                <div className="font-semibold">{leaderboard[1].name}</div>
                <div className="text-2xl font-bold text-primary">{leaderboard[1].points}</div>
                <div className="text-sm text-muted-foreground">points</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-8">
              <div className="text-5xl mb-2">🥇</div>
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <span className="text-3xl font-bold text-white">{leaderboard[0].name.split(" ")[0]}</span>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{leaderboard[0].name}</div>
                <div className="text-3xl font-bold text-primary">{leaderboard[0].points}</div>
                <div className="text-sm text-muted-foreground">points</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🥉</div>
              <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-white">{leaderboard[2].name.split(" ")[0]}</span>
              </div>
              <div className="text-center">
                <div className="font-semibold">{leaderboard[2].name}</div>
                <div className="text-2xl font-bold text-primary">{leaderboard[2].points}</div>
                <div className="text-sm text-muted-foreground">points</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Rank</th>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-center p-3 font-medium">Points</th>
                  <th className="text-center p-3 font-medium">Change</th>
                  <th className="text-left p-3 font-medium">Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((person, index) => (
                  <tr key={index} className={`border-b hover:bg-accent/50 ${person.rank === 3 ? "bg-accent/20" : ""}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {person.rank <= 3 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        <span className="font-semibold">#{person.rank}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{person.name}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{person.role}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-semibold text-primary">{person.points}</span>
                    </td>
                    <td className="p-3 text-center">
                      {person.change !== 0 && (
                        <div className={`flex items-center justify-center gap-1 ${person.change > 0 ? "text-green-500" : "text-red-500"}`}>
                          {person.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{Math.abs(person.change)}</span>
                        </div>
                      )}
                      {person.change === 0 && <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {person.badges.map((badge, i) => (
                          <span key={i} className="text-xl">{getIconDisplay(badge)}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Your Position Card */}
      <Card className="border-2 border-primary">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="font-semibold">Your Position: Rank #3</p>
              <p className="text-sm text-muted-foreground">You earned 380 points this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Achievements</h2>
        <Tabs defaultValue="my">
          <TabsList>
            <TabsTrigger value="my">My Achievements</TabsTrigger>
            <TabsTrigger value="all">All Badges</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Recent Achievement */}
      {achievements.filter((a) => a.earned).length > 0 && (
        <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getIconDisplay(achievements[0].icon)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">NEW! {achievements[0].name}</h3>
                  <Badge className={getRarityColor(achievements[0].rarity)}>
                    {getRarityLabel(achievements[0].rarity)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{achievements[0].description}</p>
                {achievements[0].earned && (
                  <p className="text-xs text-muted-foreground mt-1">Earned: {achievements[0].earnedDate}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Badges */}
      <div>
        <h3 className="font-semibold mb-3">Your Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements
            .filter((a) => a.earned)
            .map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-5xl mb-2">{getIconDisplay(achievement.icon)}</div>
                  <Badge className={`${getRarityColor(achievement.rarity)} mb-2 text-xs`}>
                    {getRarityLabel(achievement.rarity)}
                  </Badge>
                  <h4 className="font-semibold mb-1">{achievement.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                  {achievement.earned && (
                    <p className="text-xs text-muted-foreground">Earned</p>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Progress to Next Badge */}
      <div>
        <h3 className="font-semibold mb-3">Progress to Next Badge</h3>
        <div className="space-y-4">
          {achievements
            .filter((a) => !a.earned && a.progress !== undefined)
            .map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl opacity-50">{getIconDisplay(achievement.icon)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getRarityLabel(achievement.rarity)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {achievement.progress}/{achievement.total}
                          </span>
                        </div>
                        <Progress value={(achievement.progress! / achievement.total!) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.total! - achievement.progress!} more to unlock
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Rewards</h2>
          <p className="text-sm text-muted-foreground">Exchange your points for rewards</p>
        </div>
        <Card className="border-2 border-primary">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your Points</p>
              <p className="text-3xl font-bold text-primary">450</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className={reward.available ? "" : "opacity-50"}>
            <CardContent className="p-5">
              <div className="text-center">
                <div className="text-5xl mb-3">{getIconDisplay(reward.icon)}</div>
                <h3 className="font-semibold mb-1">{reward.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-bold text-primary">{reward.pointsCost}</span>
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
                {reward.available ? (
                  <Badge variant="default" className="w-full justify-center py-2">
                    Redeem
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    Not Enough Points
                  </Badge>
                )}
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
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          {renderLeaderboard()}
        </TabsContent>

        <TabsContent value="achievements">
          {renderAchievements()}
        </TabsContent>

        <TabsContent value="rewards">
          {renderRewards()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
