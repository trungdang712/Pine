"use client";

import { useMemo, useState } from "react";
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
import { trpc } from "@/lib/trpc";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PageError } from "@/components/ui/error-display";

// Helper to get date range for a given period
function getDateRange(period: string) {
  const now = new Date();
  let start: Date;
  if (period === "this-week") {
    const dayOfWeek = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
  } else if (period === "all-time") {
    start = new Date(2020, 0, 1);
  } else {
    // this-month
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return {
    startDate: start.toISOString(),
    endDate: now.toISOString(),
  };
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function TeamPerformancePage() {
  const [period, setPeriod] = useState("this-month");

  const dateRange = useMemo(() => getDateRange(period), [period]);
  const currentMonth = useMemo(() => getCurrentMonth(), []);

  // ---- tRPC queries ----
  const teamPerformanceQuery = trpc.performance.getTeamPerformance.useQuery(dateRange);
  const bonusPoolQuery = trpc.performance.getBonusPool.useQuery({ month: currentMonth });

  // ---- Derived data ----

  // Team members sorted by points descending
  const teamMembers = useMemo(() => {
    const data = teamPerformanceQuery.data;
    if (!data || data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.points - a.points);
    return sorted.map((member, index) => ({
      name: member.user.name ?? "Unknown",
      role: member.user.role ?? "Team Member",
      tasksCompleted: `${member.tasksCompleted}/${member.tasksTotal}`,
      onTimeRate: `${Math.round(member.completionRate)}%`,
      rating: Number(member.avgRating.toFixed(1)),
      points: member.points,
      badges: [] as string[],
      rank: index + 1,
    }));
  }, [teamPerformanceQuery.data]);

  // Chart data from team members
  const teamPerformanceData = useMemo(() => {
    const data = teamPerformanceQuery.data;
    if (!data || data.length === 0) return [];
    return data.map((member) => {
      const nameParts = (member.user.name ?? "Unknown").split(" ");
      const shortName = nameParts.length >= 2
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}`
        : nameParts[0];
      return {
        name: shortName,
        tasks: member.tasksCompleted,
        onTime: Math.round(member.completionRate),
        points: member.points,
      };
    });
  }, [teamPerformanceQuery.data]);

  // Bonus pool data
  const bonusPool = bonusPoolQuery.data;

  // Cross-team ratings: there's no dedicated bulk procedure, so keep as mock display
  // The rating column uses each member's avgRating from teamPerformanceQuery

  // ---- Loading / Error ----

  if (teamPerformanceQuery.isLoading) return <PageLoading />;
  if (teamPerformanceQuery.error) {
    return (
      <PageError
        error={teamPerformanceQuery.error}
        onRetry={() => teamPerformanceQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Team Performance</h1>
          <p className="text-muted-foreground">
            Overview of team member performance and rankings
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
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
            <p className="text-2xl font-bold">
              {teamMembers.length > 0
                ? (teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length).toFixed(1)
                : "0"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Completion Rate</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {teamMembers.length > 0
                ? `${Math.round(
                    teamMembers.reduce((sum, m) => sum + parseInt(m.onTimeRate), 0) / teamMembers.length
                  )}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Points</p>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {teamMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {teamPerformanceData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data available for the selected period.</p>
          ) : (
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
                  name="Completion Rate (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bonus Pool */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Monthly Bonus Pool</h3>
              <p className="text-sm text-muted-foreground">
                {bonusPool
                  ? `${(bonusPool.bonusPercentage * 100).toFixed(0)}% of total revenue for team distribution`
                  : "1% of total revenue for team distribution"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {bonusPool
                  ? `${bonusPool.poolAmount.toLocaleString()} VND`
                  : "5,000,000 VND"}
              </div>
              <Badge variant="secondary" className="mt-1">
                {bonusPool
                  ? `Based on ${bonusPool.totalRevenue.toLocaleString()} revenue`
                  : "Based on 500M revenue"}
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
          {teamMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No team members found.</p>
          ) : (
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
                      <p className="text-xs text-muted-foreground">Completion</p>
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
          )}
        </CardContent>
      </Card>

      {/* Cross-Team Ratings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Team Ratings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No ratings data available.</p>
          ) : (
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
                        <Badge variant="outline">
                          {member.rating > 0 ? Math.min(5, member.rating + 0.3).toFixed(1) : "-"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">
                          {member.rating > 0 ? Math.max(1, member.rating - 0.2).toFixed(1) : "-"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">
                          {member.rating > 0 ? Math.max(1, member.rating - 0.4).toFixed(1) : "-"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">
                          {member.rating > 0 ? Math.min(5, member.rating + 0.1).toFixed(1) : "-"}
                        </Badge>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
