"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Trophy,
  Star,
  Users,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function TeamPerformancePage() {
  const teamMembers = [
    {
      name: "Trần Văn B",
      role: "Graphic Designer",
      tasksCompleted: "10/10",
      onTimeRate: "100%",
      rating: 4.5,
      points: 520,
      badges: ["🏆", "🎯", "⚡"],
      rank: 1,
    },
    {
      name: "Nguyễn Văn A",
      role: "Content Creator",
      tasksCompleted: "12/15",
      onTimeRate: "92%",
      rating: 4.2,
      points: 450,
      badges: ["🏆", "🎯"],
      rank: 2,
    },
    {
      name: "Phạm Văn D",
      role: "Video Producer",
      tasksCompleted: "7/8",
      onTimeRate: "88%",
      rating: 4.0,
      points: 420,
      badges: ["🎬"],
      rank: 3,
    },
    {
      name: "Lê Thị C",
      role: "Digital Marketing",
      tasksCompleted: "8/10",
      onTimeRate: "80%",
      rating: 3.8,
      points: 380,
      badges: ["🎯"],
      rank: 4,
    },
  ];

  const teamPerformanceData = [
    { name: "Trần B", tasks: 10, onTime: 100, points: 520 },
    { name: "Nguyễn A", tasks: 12, onTime: 92, points: 450 },
    { name: "Phạm D", tasks: 7, onTime: 88, points: 420 },
    { name: "Lê C", tasks: 8, onTime: 80, points: 380 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Team Performance</h1>
          <p className="text-muted-foreground">
            Overview of team member performance and rankings
          </p>
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

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="tasks"
                fill="#0d9488"
                name="Tasks Completed"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="onTime"
                fill="#f59e0b"
                name="On-Time Rate (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bonus Pool */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Monthly Bonus Pool</h3>
              <p className="text-sm text-muted-foreground">
                1% of total revenue for team distribution
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">5,000,000 VND</div>
              <Badge variant="secondary" className="mt-1">
                Based on 500M revenue
              </Badge>
            </div>
          </div>
          <Button className="mt-4">Manage Distribution</Button>
        </CardContent>
      </Card>

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
                  member.rank === 1
                    ? "border-yellow-400 bg-yellow-50"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">
                  #{member.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    {member.rank === 1 && (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    )}
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

      {/* Cross-Team Ratings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Team Ratings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Team Member</th>
                  <th className="text-center p-3 font-medium">Sales</th>
                  <th className="text-center p-3 font-medium">Customer Service</th>
                  <th className="text-center p-3 font-medium">Medical</th>
                  <th className="text-center p-3 font-medium">Accounting</th>
                  <th className="text-center p-3 font-medium">Average</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50">
                    <td className="p-3 font-medium">{member.name}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">4.5</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">4.2</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">4.0</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">4.3</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="default" className="bg-primary">
                        <Star className="w-3 h-3 mr-1" />
                        {member.rating}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
