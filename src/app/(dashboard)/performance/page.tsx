"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Trophy,
  Star,
  Gift,
  Users,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function PerformancePage() {
  const [currentView, setCurrentView] = useState<"my" | "team" | "leaderboard">("my");

  const performanceTrendData = [
    { month: "Jul", score: 75, target: 80 },
    { month: "Aug", score: 78, target: 80 },
    { month: "Sep", score: 82, target: 80 },
    { month: "Oct", score: 85, target: 80 },
    { month: "Nov", score: 84, target: 80 },
    { month: "Dec", score: 87, target: 80 },
  ];

  const myKPIs = [
    { label: "Posts Published", value: "15/20", percentage: 75, change: 3, isPositive: true },
    { label: "On-Time Rate", value: "92%", percentage: 92, change: 5, isPositive: true },
    { label: "Revision Rate", value: "1.2", percentage: 80, change: -0.3, isPositive: true },
    { label: "Avg Engagement", value: "3.4%", percentage: 85, change: 0.5, isPositive: true },
  ];

  const teamMembers = [
    {
      name: "Tran Van B",
      role: "Graphic Designer",
      tasksCompleted: "10/10",
      onTimeRate: "100%",
      rating: 4.5,
      points: 520,
      badges: ["🏆", "🎯", "⚡"],
      rank: 1,
    },
    {
      name: "Nguyen Van A",
      role: "Content Creator",
      tasksCompleted: "12/15",
      onTimeRate: "92%",
      rating: 4.2,
      points: 450,
      badges: ["🏆", "🎯"],
      rank: 2,
    },
    {
      name: "Pham Van D",
      role: "Video Producer",
      tasksCompleted: "7/8",
      onTimeRate: "88%",
      rating: 4.0,
      points: 420,
      badges: ["🎬"],
      rank: 3,
    },
    {
      name: "Le Thi C",
      role: "Digital Marketing",
      tasksCompleted: "8/10",
      onTimeRate: "80%",
      rating: 3.8,
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
  ];

  const rewards = [
    {
      id: 1,
      name: "Coffee Voucher",
      pointsCost: 100,
      available: true,
      icon: "☕",
      description: "Free coffee at clinic cafe",
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

  const getViewTitle = () => {
    switch (currentView) {
      case "my":
        return "My Performance";
      case "team":
        return "Team Performance";
      case "leaderboard":
        return "Leaderboard & Achievements";
      default:
        return "Performance & Gamification";
    }
  };

  const renderMyPerformance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Performance</h2>
          <p className="text-sm text-muted-foreground">Track your personal KPIs and achievements</p>
        </div>
        <Select defaultValue="this-month">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Score & Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">OVERALL SCORE</div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">87/100</div>
                  <div className="flex-1">
                    <Progress value={87} className="h-4" />
                  </div>
                  <Badge variant="default" className="text-base px-3 py-1">
                    Good
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">+3 points vs last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">GAMIFICATION POINTS</div>
                <div className="flex items-center gap-4">
                  <Trophy className="w-10 h-10 text-accent" />
                  <div className="flex-1">
                    <div className="text-4xl font-bold">450</div>
                    <div className="text-sm text-muted-foreground">Rank #2 in team</div>
                  </div>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    🏆 🎯
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">+50 points this week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myKPIs.map((kpi, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{kpi.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{kpi.value}</span>
                    {kpi.isPositive ? (
                      <span className="flex items-center text-sm text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        {kpi.change > 0 ? "+" : ""}
                        {kpi.change}
                      </span>
                    ) : (
                      <span className="flex items-center text-sm text-red-500">
                        <TrendingDown className="w-4 h-4" />
                        {kpi.change}
                      </span>
                    )}
                  </div>
                </div>
                <Progress value={kpi.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#0d9488" name="Your Score" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" name="Target" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* My Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Achievements</CardTitle>
            <Badge variant="secondary">
              {achievements.filter((a) => a.earned).length} / {achievements.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.slice(0, 6).map((achievement) => (
              <Card
                key={achievement.id}
                className={`${achievement.earned ? "border-2" : "opacity-50"} ${
                  achievement.earned ? getRarityColor(achievement.rarity) : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-4xl">{achievement.icon}</div>
                    <h3 className={`font-semibold ${achievement.earned ? "text-white" : ""}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm ${achievement.earned ? "text-white/90" : "text-muted-foreground"}`}>
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <Badge variant="secondary" className="text-xs">
                        Earned {achievement.earnedDate}
                      </Badge>
                    )}
                    {!achievement.earned && achievement.progress !== undefined && (
                      <div className="space-y-1">
                        <Progress value={(achievement.progress / achievement.total!) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress} / {achievement.total}
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
    </div>
  );

  const renderTeamPerformance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Performance</h2>
          <p className="text-sm text-muted-foreground">Overview of team member performance and rankings</p>
        </div>
        <Select defaultValue="this-month">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Team Members</p>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{teamMembers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">85.2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg On-Time Rate</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">90%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Points</p>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">1,770</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  member.rank === 1 ? "border-yellow-400 bg-yellow-50" : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">
                  #{member.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    {member.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                    <div className="flex gap-1">
                      {member.badges.map((badge, i) => (
                        <span key={i} className="text-sm">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                    <p className="font-medium">{member.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">On-Time</p>
                    <p className="font-medium">{member.onTimeRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="font-medium flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {member.rating}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Points</p>
                    <p className="font-bold text-primary">{member.points}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Leaderboard & Achievements</h2>
        <p className="text-sm text-muted-foreground">
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
          {/* Top 3 Podium */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 text-gray-700 font-bold text-2xl mb-2">
                    #2
                  </div>
                  <h3 className="font-semibold">{teamMembers[1].name}</h3>
                  <p className="text-sm text-muted-foreground">{teamMembers[1].role}</p>
                  <p className="text-lg font-bold text-primary mt-2">{teamMembers[1].points} pts</p>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-3xl mb-2">
                    #1
                  </div>
                  <h3 className="font-semibold text-lg">{teamMembers[0].name}</h3>
                  <p className="text-sm text-muted-foreground">{teamMembers[0].role}</p>
                  <p className="text-xl font-bold text-primary mt-2">{teamMembers[0].points} pts</p>
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mt-1" />
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 text-amber-700 font-bold text-2xl mb-2">
                    #3
                  </div>
                  <h3 className="font-semibold">{teamMembers[2].name}</h3>
                  <p className="text-sm text-muted-foreground">{teamMembers[2].role}</p>
                  <p className="text-lg font-bold text-primary mt-2">{teamMembers[2].points} pts</p>
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
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{member.points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`${achievement.earned ? "border-2" : "opacity-60"} ${
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
                        <h3 className={`font-semibold ${achievement.earned ? "text-white" : ""}`}>
                          {achievement.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            achievement.earned ? "text-white/90" : "text-muted-foreground"
                          }`}
                        >
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <p className="text-xs text-white/80">Earned {achievement.earnedDate}</p>
                        )}
                        {!achievement.earned && achievement.progress !== undefined && (
                          <div className="space-y-1">
                            <Progress value={(achievement.progress / achievement.total!) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Progress: {achievement.progress} / {achievement.total}
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
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Available Points</p>
                  <p className="text-3xl font-bold text-primary">450</p>
                </div>
                <Trophy className="w-12 h-12 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redeem Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <Card key={reward.id} className={!reward.available ? "opacity-50" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{reward.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-sm">
                              {reward.pointsCost} points
                            </Badge>
                            <Button size="sm" disabled={!reward.available || reward.pointsCost > 450}>
                              {reward.available ? "Redeem" : "Out of Stock"}
                            </Button>
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
      </Tabs>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">{getViewTitle()}</h1>
        <p className="text-muted-foreground">
          {currentView === "my"
            ? "Your personal performance metrics and achievements"
            : currentView === "team"
            ? "Team performance overview and rankings"
            : "Leaderboard, achievements, and rewards system"}
        </p>
      </div>

      {/* View Selector */}
      <div className="mb-6">
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as "my" | "team" | "leaderboard")}>
          <TabsList>
            <TabsTrigger value="my">My Performance</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {currentView === "my" && renderMyPerformance()}
      {currentView === "team" && renderTeamPerformance()}
      {currentView === "leaderboard" && renderLeaderboard()}
    </div>
  );
}
