"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Trophy,
  ArrowUpRight,
} from "lucide-react";
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

export default function MyPerformancePage() {
  const performanceTrendData = [
    { month: "Jul", score: 75, target: 80 },
    { month: "Aug", score: 78, target: 80 },
    { month: "Sep", score: 82, target: 80 },
    { month: "Oct", score: 85, target: 80 },
    { month: "Nov", score: 84, target: 80 },
    { month: "Dec", score: 87, target: 80 },
  ];

  const myKPIs = [
    {
      label: "Posts Published",
      value: "15/20",
      percentage: 75,
      change: 3,
      isPositive: true,
    },
    {
      label: "On-Time Rate",
      value: "92%",
      percentage: 92,
      change: 5,
      isPositive: true,
    },
    {
      label: "Revision Rate",
      value: "1.2",
      percentage: 80,
      change: -0.3,
      isPositive: true,
    },
    {
      label: "Avg Engagement",
      value: "3.4%",
      percentage: 85,
      change: 0.5,
      isPositive: true,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">My Performance</h1>
          <p className="text-muted-foreground">
            Track your personal KPIs and achievements
          </p>
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
                <div className="text-sm text-muted-foreground mb-2">
                  OVERALL SCORE
                </div>
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
                  <span className="text-green-500 font-medium">
                    +3 points vs last month
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  GAMIFICATION POINTS
                </div>
                <div className="flex items-center gap-4">
                  <Trophy className="w-10 h-10 text-amber-500" />
                  <div className="flex-1">
                    <div className="text-4xl font-bold">450</div>
                    <div className="text-sm text-muted-foreground">
                      Rank #2 in team
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    🏆 🎯
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">
                    +50 points this week
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Team Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Team Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">4.2/5</div>
              <div className="text-sm text-muted-foreground">Overall Rating</div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold">4.5</div>
                <div className="text-xs text-muted-foreground">Responsiveness</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold">4.0</div>
                <div className="text-xs text-muted-foreground">Quality</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold">4.1</div>
                <div className="text-xs text-muted-foreground">Communication</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Based on ratings from 5 team members
          </p>
        </CardContent>
      </Card>

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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#0d9488"
                name="Your Score"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#94a3b8"
                name="Target"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Estimated Bonus */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Estimated Bonus Share</h3>
              <p className="text-sm text-muted-foreground">
                Based on current performance metrics
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">~2,500,000 VND</div>
              <Badge variant="secondary" className="mt-1">+15% vs last month</Badge>
            </div>
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
                      <Badge variant="secondary" className="text-xs">
                        Earned {achievement.earnedDate}
                      </Badge>
                    )}
                    {!achievement.earned && achievement.progress !== undefined && (
                      <div className="space-y-1">
                        <Progress
                          value={(achievement.progress / achievement.total!) * 100}
                          className="h-2"
                        />
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
}
