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
import { Gift, Trophy, Star, Clock, Check, AlertCircle } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  available: boolean;
  stock: number;
  icon: string;
  category: "experience" | "gift" | "perk";
}

const rewards: Reward[] = [
  {
    id: "1",
    name: "Coffee Voucher",
    description: "Voucher cà phê miễn phí tại quán đối tác",
    pointsCost: 100,
    available: true,
    stock: 50,
    icon: "☕",
    category: "gift",
  },
  {
    id: "2",
    name: "Lunch Treat",
    description: "Bữa trưa miễn phí cho cả team (tối đa 5 người)",
    pointsCost: 300,
    available: true,
    stock: 10,
    icon: "🍽️",
    category: "experience",
  },
  {
    id: "3",
    name: "Extra Day Off",
    description: "Một ngày nghỉ phép thêm (có lương)",
    pointsCost: 500,
    available: true,
    stock: 5,
    icon: "🏖️",
    category: "perk",
  },
  {
    id: "4",
    name: "Training Course",
    description: "Khóa học online theo yêu cầu (trị giá 2 triệu)",
    pointsCost: 400,
    available: true,
    stock: 15,
    icon: "📚",
    category: "experience",
  },
  {
    id: "5",
    name: "Spa Voucher",
    description: "Voucher spa/massage thư giãn tại cơ sở đối tác",
    pointsCost: 600,
    available: true,
    stock: 8,
    icon: "💆",
    category: "gift",
  },
  {
    id: "6",
    name: "Tech Gadget",
    description: "Tai nghe/phụ kiện công nghệ cao cấp",
    pointsCost: 1000,
    available: false,
    stock: 0,
    icon: "🎧",
    category: "gift",
  },
  {
    id: "7",
    name: "Work From Home Day",
    description: "Một ngày làm việc từ xa (cho vị trí cần có mặt)",
    pointsCost: 200,
    available: true,
    stock: 20,
    icon: "🏠",
    category: "perk",
  },
  {
    id: "8",
    name: "Recognition Wall",
    description: "Được vinh danh trên bảng Recognition của công ty",
    pointsCost: 150,
    available: true,
    stock: 999,
    icon: "🌟",
    category: "experience",
  },
  {
    id: "9",
    name: "Movie Tickets",
    description: "2 vé xem phim tại CGV/Lotte",
    pointsCost: 250,
    available: true,
    stock: 12,
    icon: "🎬",
    category: "gift",
  },
];

const redemptionHistory = [
  { reward: "Coffee Voucher", date: "15/12/2023", points: 100, status: "completed" },
  { reward: "Lunch Treat", date: "20/11/2023", points: 300, status: "completed" },
  { reward: "Training Course", date: "01/10/2023", points: 400, status: "completed" },
];

const categoryConfig = {
  experience: { label: "Trải nghiệm", color: "bg-purple-100 text-purple-700" },
  gift: { label: "Quà tặng", color: "bg-blue-100 text-blue-700" },
  perk: { label: "Đặc quyền", color: "bg-green-100 text-green-700" },
};

export default function RewardsPage() {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const userPoints = 450;

  const openRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setIsRedeemOpen(true);
  };

  const handleRedeem = () => {
    // Redeem logic
    setIsRedeemOpen(false);
  };

  const canRedeem = (reward: Reward) => {
    return reward.available && reward.pointsCost <= userPoints;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Rewards Catalog</h1>
        <p className="text-muted-foreground">
          Đổi điểm lấy phần thưởng hấp dẫn
        </p>
      </div>

      {/* User Points Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Điểm hiện có</p>
              <p className="text-4xl font-bold text-primary">{userPoints}</p>
              <p className="text-sm text-muted-foreground mt-1">
                điểm có thể sử dụng
              </p>
            </div>
            <div className="text-right">
              <Trophy className="h-16 w-16 text-amber-500 mb-2" />
              <Badge variant="secondary">Level 3 - Pro</Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Đến Level 4</span>
              <span>{userPoints}/1000</span>
            </div>
            <Progress value={(userPoints / 1000) * 100} className="h-2" />
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
              <p className="text-2xl font-bold">{rewards.filter((r) => r.available).length}</p>
              <p className="text-sm text-muted-foreground">Phần thưởng có sẵn</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Check className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{redemptionHistory.length}</p>
              <p className="text-sm text-muted-foreground">Đã đổi thưởng</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {redemptionHistory.reduce((sum, h) => sum + h.points, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Điểm đã sử dụng</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Danh sách phần thưởng</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const canGet = canRedeem(reward);
            const categoryInfo = categoryConfig[reward.category];

            return (
              <Card
                key={reward.id}
                className={`overflow-hidden ${!reward.available ? "opacity-60" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl">{reward.icon}</span>
                    <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{reward.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {reward.pointsCost} điểm
                    </Badge>
                    {reward.available && reward.stock < 10 && (
                      <span className="text-xs text-orange-600">
                        Còn {reward.stock}
                      </span>
                    )}
                    {!reward.available && (
                      <span className="text-xs text-red-600">Hết hàng</span>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    disabled={!canGet}
                    onClick={() => openRedeem(reward)}
                  >
                    {!reward.available
                      ? "Hết hàng"
                      : reward.pointsCost > userPoints
                      ? `Cần thêm ${reward.pointsCost - userPoints} điểm`
                      : "Đổi thưởng"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Redemption History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lịch sử đổi thưởng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {redemptionHistory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{item.reward}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-red-600">
                    -{item.points} pts
                  </Badge>
                  <p className="text-xs text-green-600 mt-1">
                    <Check className="h-3 w-3 inline mr-1" />
                    Đã nhận
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Redeem Dialog */}
      <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
        <DialogContent className="sm:max-w-[400px]">
          {selectedReward && (
            <>
              <DialogHeader>
                <div className="text-center mb-4">
                  <span className="text-6xl">{selectedReward.icon}</span>
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
                  <span>Chi phí</span>
                  <span className="font-bold text-lg">
                    {selectedReward.pointsCost} điểm
                  </span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span>Điểm hiện có</span>
                  <span className="font-bold text-lg text-primary">
                    {userPoints} điểm
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border-t">
                  <span>Điểm còn lại sau khi đổi</span>
                  <span className="font-bold text-lg">
                    {userPoints - selectedReward.pointsCost} điểm
                  </span>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsRedeemOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleRedeem}>
                  <Gift className="h-4 w-4 mr-2" />
                  Xác nhận đổi thưởng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
