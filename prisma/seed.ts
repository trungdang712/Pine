import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const adminPassword = await hash("admin123", 12);
  const userPassword = await hash("user123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@greenfield.clinic" },
    update: {},
    create: {
      email: "admin@greenfield.clinic",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
      points: {
        create: {
          totalPoints: 0,
          weeklyPoints: 0,
          monthlyPoints: 0,
        },
      },
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@greenfield.clinic" },
    update: {},
    create: {
      email: "manager@greenfield.clinic",
      password: userPassword,
      name: "Marketing Manager",
      role: "marketing_manager",
      points: {
        create: {
          totalPoints: 500,
          weeklyPoints: 120,
          monthlyPoints: 350,
        },
      },
    },
  });

  const contentCreator = await prisma.user.upsert({
    where: { email: "content@greenfield.clinic" },
    update: {},
    create: {
      email: "content@greenfield.clinic",
      password: userPassword,
      name: "Nguyen Van A",
      role: "content_creator",
      points: {
        create: {
          totalPoints: 450,
          weeklyPoints: 85,
          monthlyPoints: 280,
        },
      },
    },
  });

  const designer = await prisma.user.upsert({
    where: { email: "designer@greenfield.clinic" },
    update: {},
    create: {
      email: "designer@greenfield.clinic",
      password: userPassword,
      name: "Tran Thi B",
      role: "graphic_designer",
      points: {
        create: {
          totalPoints: 520,
          weeklyPoints: 110,
          monthlyPoints: 320,
        },
      },
    },
  });

  const digitalMarketer = await prisma.user.upsert({
    where: { email: "digital@greenfield.clinic" },
    update: {},
    create: {
      email: "digital@greenfield.clinic",
      password: userPassword,
      name: "Le Van C",
      role: "digital_marketing",
      points: {
        create: {
          totalPoints: 380,
          weeklyPoints: 95,
          monthlyPoints: 260,
        },
      },
    },
  });

  const videoProducer = await prisma.user.upsert({
    where: { email: "video@greenfield.clinic" },
    update: {},
    create: {
      email: "video@greenfield.clinic",
      password: userPassword,
      name: "Pham Van D",
      role: "video_producer",
      points: {
        create: {
          totalPoints: 320,
          weeklyPoints: 75,
          monthlyPoints: 200,
        },
      },
    },
  });

  console.log("Created users");

  // Create achievements
  const achievements = [
    {
      name: "Task Master",
      description: "Complete 50 tasks",
      category: "performance",
      criteria: JSON.stringify({ type: "task_count", value: 50 }),
      points: 50,
    },
    {
      name: "Speed Demon",
      description: "Complete 10 tasks before their deadline",
      category: "performance",
      criteria: JSON.stringify({ type: "early_completion", value: 10 }),
      points: 30,
    },
    {
      name: "Consistency King",
      description: "Complete tasks on time for 30 consecutive days",
      category: "performance",
      criteria: JSON.stringify({ type: "streak", value: 30 }),
      points: 100,
    },
    {
      name: "Idea Machine",
      description: "Submit 10 proposals",
      category: "innovation",
      criteria: JSON.stringify({ type: "proposal_count", value: 10 }),
      points: 40,
    },
    {
      name: "Innovator",
      description: "Have 3 innovation ideas implemented",
      category: "innovation",
      criteria: JSON.stringify({ type: "ideas_implemented", value: 3 }),
      points: 75,
    },
    {
      name: "Team Player",
      description: "Help on 10 cross-role tasks",
      category: "collaboration",
      criteria: JSON.stringify({ type: "cross_role_tasks", value: 10 }),
      points: 35,
    },
    {
      name: "Viral Maker",
      description: "Create content that exceeds 2x engagement benchmark",
      category: "content",
      criteria: JSON.stringify({ type: "viral_content", value: 1 }),
      points: 100,
    },
    {
      name: "Engagement Expert",
      description: "Achieve highest average engagement rate",
      category: "content",
      criteria: JSON.stringify({ type: "engagement_leader", value: 1 }),
      points: 50,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }

  console.log("Created achievements");

  // Create rewards
  const rewards = [
    {
      name: "Team Meeting Recognition",
      description: "Get recognized in the team meeting",
      pointsCost: 500,
    },
    {
      name: "Coffee/Lunch Voucher",
      description: "100,000 VND voucher",
      pointsCost: 1000,
    },
    {
      name: "Half Day Off",
      description: "Take half a day off work",
      pointsCost: 2500,
    },
    {
      name: "Full Day Off",
      description: "Take a full day off work",
      pointsCost: 5000,
    },
    {
      name: "Special Prize",
      description: "Manager decides the prize",
      pointsCost: 10000,
    },
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { id: reward.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: reward,
    });
  }

  console.log("Created rewards");

  // Create brand colors
  const brandColors = [
    { name: "Teal Primary", hexCode: "#0D9488", rgbCode: "13, 148, 136", usage: "primary" },
    { name: "Teal Dark", hexCode: "#0F766E", rgbCode: "15, 118, 110", usage: "primary" },
    { name: "Teal Light", hexCode: "#14B8A6", rgbCode: "20, 184, 166", usage: "primary" },
    { name: "Gold Accent", hexCode: "#F59E0B", rgbCode: "245, 158, 11", usage: "accent" },
    { name: "Gray", hexCode: "#6B7280", rgbCode: "107, 114, 128", usage: "secondary" },
    { name: "White", hexCode: "#FFFFFF", rgbCode: "255, 255, 255", usage: "background" },
  ];

  for (const color of brandColors) {
    await prisma.brandColor.create({
      data: color,
    });
  }

  console.log("Created brand colors");

  // Create sample tasks
  const tasks = [
    {
      title: "Create Facebook banner for January campaign",
      description: "Design a promotional banner for the teeth whitening campaign",
      status: "in_progress",
      priority: "high",
      category: "design",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      creatorId: manager.id,
      assigneeId: designer.id,
    },
    {
      title: "Write blog post about dental implants",
      description: "Educational content about the dental implant process",
      status: "todo",
      priority: "normal",
      category: "content",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      creatorId: manager.id,
      assigneeId: contentCreator.id,
    },
    {
      title: "Set up Google Ads campaign",
      description: "Configure new Google Ads campaign for orthodontic services",
      status: "review",
      priority: "urgent",
      category: "campaign",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      creatorId: manager.id,
      assigneeId: digitalMarketer.id,
    },
    {
      title: "Produce patient testimonial video",
      description: "Film and edit testimonial from Mrs. Nguyen",
      status: "in_progress",
      priority: "normal",
      category: "video",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      creatorId: manager.id,
      assigneeId: videoProducer.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log("Created sample tasks");

  // Create sample content calendar items
  const calendarItems = [
    {
      title: "Teeth Whitening Promo Post",
      description: "Promotional post for teeth whitening service discount",
      platform: "facebook",
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      creatorId: contentCreator.id,
    },
    {
      title: "Dental Care Tips - Reel",
      description: "Short video about daily dental care tips",
      platform: "instagram",
      status: "in_production",
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      creatorId: videoProducer.id,
    },
    {
      title: "Patient Success Story",
      description: "Before/after showcase of implant patient",
      platform: "zalo",
      status: "ready_for_review",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      creatorId: contentCreator.id,
    },
  ];

  for (const item of calendarItems) {
    await prisma.contentCalendarItem.create({
      data: item,
    });
  }

  console.log("Created sample calendar items");

  // Create sample monthly budget
  const currentMonth = new Date().toISOString().slice(0, 7);
  await prisma.monthlyBudget.upsert({
    where: { month: currentMonth },
    update: {},
    create: {
      month: currentMonth,
      totalBudget: 50000000,
      googleAdsAllocation: 20000000,
      facebookAllocation: 20000000,
      zaloAllocation: 10000000,
      status: "active",
      createdById: admin.id,
      approvedById: admin.id,
    },
  });

  console.log("Created sample budget");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
