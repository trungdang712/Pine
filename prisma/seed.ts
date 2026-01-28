import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helper: role-based user lookup
// ---------------------------------------------------------------------------
interface SeedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Try to find real Supabase-linked users (those with @nhakhoagreenfield.com
 * emails). If enough real users exist we use them; otherwise we fall back to
 * creating demo users so the seed still works on a fresh install.
 */
async function resolveUsers(): Promise<{
  admin: SeedUser;
  manager: SeedUser;
  contentCreator: SeedUser;
  designer: SeedUser;
  digitalMarketer: SeedUser;
  videoProducer: SeedUser;
  contentCreator2: SeedUser;
  designer2: SeedUser;
}> {
  // ---- Try real users first ------------------------------------------------
  const realUsers = await prisma.user.findMany({
    where: { email: { contains: "@nhakhoagreenfield.com" } },
    select: { id: true, email: true, name: true, role: true },
  });

  if (realUsers.length > 0) {
    console.log(
      `Found ${realUsers.length} real users with @nhakhoagreenfield.com emails`
    );

    // Build a lookup by email prefix (the part before @)
    const byPrefix = new Map<string, SeedUser>();
    for (const u of realUsers) {
      const prefix = u.email.split("@")[0]; // e.g. "ducanh.nh"
      byPrefix.set(prefix, u);
    }

    // Build a lookup by role for fallback assignment
    const byRole = new Map<string, SeedUser[]>();
    for (const u of realUsers) {
      const list = byRole.get(u.role) || [];
      list.push(u);
      byRole.set(u.role, list);
    }

    // Helper: pick a user by preferred email prefix, then by role, then any
    const pick = (
      preferredPrefixes: string[],
      preferredRoles: string[],
      fallbackToAny = true
    ): SeedUser | undefined => {
      // Try exact email prefix match
      for (const prefix of preferredPrefixes) {
        const u = byPrefix.get(prefix);
        if (u) return u;
      }
      // Try role match
      for (const role of preferredRoles) {
        const list = byRole.get(role);
        if (list && list.length > 0) return list[0];
      }
      // Fallback to first available user
      if (fallbackToAny && realUsers.length > 0) return realUsers[0];
      return undefined;
    };

    // Assign specific real users to seed roles
    const admin =
      pick(["nhung", "trung"], ["super_admin", "admin"]) ?? realUsers[0];
    const manager =
      pick(["hoai.tt"], ["marketing_manager"]) ?? realUsers[0];
    const digitalMarketer =
      pick(["ducanh.nh"], ["digital_marketing"]) ?? realUsers[0];
    const designer =
      pick(["hoai.ptt"], ["graphic_designer"]) ?? realUsers[0];
    const videoProducer =
      pick(["tien.n"], ["video_producer"]) ?? realUsers[0];

    // Content creators and second designer - pick remaining users
    const usedIds = new Set([
      admin.id,
      manager.id,
      digitalMarketer.id,
      designer.id,
      videoProducer.id,
    ]);
    const remaining = realUsers.filter((u) => !usedIds.has(u.id));

    const contentCreator = remaining[0] ?? manager;
    const contentCreator2 = remaining[1] ?? contentCreator;
    const designer2 = remaining[2] ?? designer;

    console.log("Seed role assignments:");
    console.log(`  admin           -> ${admin.name} (${admin.email})`);
    console.log(`  manager         -> ${manager.name} (${manager.email})`);
    console.log(
      `  digitalMarketer -> ${digitalMarketer.name} (${digitalMarketer.email})`
    );
    console.log(`  designer        -> ${designer.name} (${designer.email})`);
    console.log(
      `  videoProducer   -> ${videoProducer.name} (${videoProducer.email})`
    );
    console.log(
      `  contentCreator  -> ${contentCreator.name} (${contentCreator.email})`
    );
    console.log(
      `  contentCreator2 -> ${contentCreator2.name} (${contentCreator2.email})`
    );
    console.log(`  designer2       -> ${designer2.name} (${designer2.email})`);

    // Ensure each real user has a UserPoints record
    for (const u of realUsers) {
      await prisma.userPoints.upsert({
        where: { userId: u.id },
        update: {},
        create: {
          userId: u.id,
          totalPoints: 0,
          weeklyPoints: 0,
          monthlyPoints: 0,
        },
      });
    }

    return {
      admin,
      manager,
      contentCreator,
      designer,
      digitalMarketer,
      videoProducer,
      contentCreator2,
      designer2,
    };
  }

  // ---- Fallback: create demo users for fresh installs ----------------------
  console.log("No real users found. Creating demo users for fresh install...");

  const adminPassword = await hash("admin123", 12);
  const userPassword = await hash("user123", 12);

  const demoUsers = [
    {
      email: "admin@greenfield.clinic",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
      points: { totalPoints: 0, weeklyPoints: 0, monthlyPoints: 0 },
    },
    {
      email: "manager@greenfield.clinic",
      password: userPassword,
      name: "Marketing Manager",
      role: "marketing_manager",
      points: { totalPoints: 500, weeklyPoints: 120, monthlyPoints: 350 },
    },
    {
      email: "content@greenfield.clinic",
      password: userPassword,
      name: "Nguyen Van A",
      role: "content_creator",
      points: { totalPoints: 450, weeklyPoints: 85, monthlyPoints: 280 },
    },
    {
      email: "designer@greenfield.clinic",
      password: userPassword,
      name: "Tran Thi B",
      role: "graphic_designer",
      points: { totalPoints: 520, weeklyPoints: 110, monthlyPoints: 320 },
    },
    {
      email: "digital@greenfield.clinic",
      password: userPassword,
      name: "Le Van C",
      role: "digital_marketing",
      points: { totalPoints: 380, weeklyPoints: 95, monthlyPoints: 260 },
    },
    {
      email: "video@greenfield.clinic",
      password: userPassword,
      name: "Pham Van D",
      role: "video_producer",
      points: { totalPoints: 320, weeklyPoints: 75, monthlyPoints: 200 },
    },
    {
      email: "content2@greenfield.clinic",
      password: userPassword,
      name: "Hoang Thi E",
      role: "content_creator",
      points: { totalPoints: 280, weeklyPoints: 65, monthlyPoints: 180 },
    },
    {
      email: "designer2@greenfield.clinic",
      password: userPassword,
      name: "Vo Van F",
      role: "graphic_designer",
      points: { totalPoints: 410, weeklyPoints: 90, monthlyPoints: 250 },
    },
  ];

  const created: SeedUser[] = [];
  for (const u of demoUsers) {
    const { points, ...userData } = u;
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...userData,
        points: { create: points },
      },
      select: { id: true, email: true, name: true, role: true },
    });
    created.push(user);
  }

  console.log(`Created ${created.length} demo users`);

  return {
    admin: created[0],
    manager: created[1],
    contentCreator: created[2],
    designer: created[3],
    digitalMarketer: created[4],
    videoProducer: created[5],
    contentCreator2: created[6],
    designer2: created[7],
  };
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding database...\n");

  // 1. Resolve users (real or demo)
  const {
    admin,
    manager,
    contentCreator,
    designer,
    digitalMarketer,
    videoProducer,
    contentCreator2,
    designer2,
  } = await resolveUsers();

  console.log("\nCreated / resolved users");

  // 2. Achievements (upsert by unique name - idempotent)
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

  // 3. Rewards (upsert by name via a find-or-create pattern)
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
    // Rewards don't have a unique name field in schema, so use findFirst+create
    const existing = await prisma.reward.findFirst({
      where: { name: reward.name },
    });
    if (!existing) {
      await prisma.reward.create({ data: reward });
    }
  }
  console.log("Created rewards");

  // 4. Brand colors (idempotent: delete + recreate since no unique key)
  await prisma.brandColor.deleteMany({});
  const brandColors = [
    { name: "Teal Primary", hexCode: "#0D9488", rgbCode: "13, 148, 136", usage: "primary" },
    { name: "Teal Dark", hexCode: "#0F766E", rgbCode: "15, 118, 110", usage: "primary" },
    { name: "Teal Light", hexCode: "#14B8A6", rgbCode: "20, 184, 166", usage: "primary" },
    { name: "Gold Accent", hexCode: "#F59E0B", rgbCode: "245, 158, 11", usage: "accent" },
    { name: "Gray", hexCode: "#6B7280", rgbCode: "107, 114, 128", usage: "secondary" },
    { name: "White", hexCode: "#FFFFFF", rgbCode: "255, 255, 255", usage: "background" },
  ];

  for (const color of brandColors) {
    await prisma.brandColor.create({ data: color });
  }
  console.log("Created brand colors");

  // Helper for dates
  const daysFromNow = (days: number) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const daysAgo = (days: number) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // 5. Tasks (delete + recreate for idempotency - seed data only)
  await prisma.task.deleteMany({});
  const tasks = [
    // TODO tasks
    {
      title: "Design Facebook banner for teeth whitening campaign",
      description: "Create eye-catching banner for the Q1 teeth whitening promotion",
      status: "todo",
      priority: "urgent",
      category: "design",
      dueDate: daysFromNow(1),
      creatorId: manager.id,
      assigneeId: designer.id,
    },
    {
      title: "Write blog post about dental implants",
      description: "SEO-optimized educational content about dental implant procedures and benefits",
      status: "todo",
      priority: "high",
      category: "content",
      dueDate: daysFromNow(3),
      creatorId: manager.id,
      assigneeId: contentCreator.id,
    },
    {
      title: "Create Instagram carousel for orthodontics",
      description: "Design 5-slide carousel explaining different orthodontic options",
      status: "todo",
      priority: "normal",
      category: "design",
      dueDate: daysFromNow(5),
      creatorId: manager.id,
      assigneeId: designer2.id,
    },
    {
      title: "Write Zalo article about oral hygiene",
      description: "Educational content for Zalo OA about daily oral hygiene tips",
      status: "todo",
      priority: "normal",
      category: "content",
      dueDate: daysFromNow(7),
      creatorId: manager.id,
      assigneeId: contentCreator2.id,
    },
    {
      title: "Setup Google Ads for braces campaign",
      description: "Configure new Google Ads campaign targeting orthodontic keywords",
      status: "todo",
      priority: "high",
      category: "campaign",
      dueDate: daysFromNow(2),
      creatorId: manager.id,
      assigneeId: digitalMarketer.id,
    },
    // IN PROGRESS tasks
    {
      title: "Edit patient testimonial video",
      description: "Edit and finalize the testimonial video from Mrs. Nguyen's implant case",
      status: "in_progress",
      priority: "urgent",
      category: "video",
      dueDate: daysFromNow(1),
      creatorId: manager.id,
      assigneeId: videoProducer.id,
    },
    {
      title: "Design Valentine's Day campaign materials",
      description: "Create posters, banners, and social media graphics for Valentine promotion",
      status: "in_progress",
      priority: "high",
      category: "design",
      dueDate: daysFromNow(4),
      creatorId: manager.id,
      assigneeId: designer.id,
    },
    {
      title: "Write content for landing page",
      description: "Copywriting for the new teeth whitening landing page",
      status: "in_progress",
      priority: "normal",
      category: "content",
      dueDate: daysFromNow(3),
      creatorId: manager.id,
      assigneeId: contentCreator.id,
    },
    {
      title: "Optimize Facebook Ads performance",
      description: "Review and optimize current Facebook ad campaigns for better ROI",
      status: "in_progress",
      priority: "high",
      category: "campaign",
      dueDate: daysFromNow(2),
      creatorId: manager.id,
      assigneeId: digitalMarketer.id,
    },
    {
      title: "Create TikTok content series",
      description: "Plan and create 5 short-form videos for TikTok dental tips series",
      status: "in_progress",
      priority: "normal",
      category: "video",
      dueDate: daysFromNow(6),
      creatorId: manager.id,
      assigneeId: videoProducer.id,
    },
    // REVIEW tasks
    {
      title: "Review brochure design",
      description: "Final review of the new services brochure before printing",
      status: "review",
      priority: "urgent",
      category: "design",
      dueDate: daysFromNow(1),
      creatorId: designer.id,
      assigneeId: manager.id,
    },
    {
      title: "Review blog post on teeth whitening",
      description: "Content review for the teeth whitening benefits article",
      status: "review",
      priority: "normal",
      category: "content",
      dueDate: daysFromNow(2),
      creatorId: contentCreator.id,
      assigneeId: manager.id,
    },
    {
      title: "Review Google Ads copy",
      description: "Review ad copy for the new orthodontics campaign",
      status: "review",
      priority: "high",
      category: "campaign",
      dueDate: daysFromNow(1),
      creatorId: digitalMarketer.id,
      assigneeId: manager.id,
    },
    {
      title: "Review clinic tour video",
      description: "Final review of the clinic virtual tour video",
      status: "review",
      priority: "normal",
      category: "video",
      dueDate: daysFromNow(3),
      creatorId: videoProducer.id,
      assigneeId: manager.id,
    },
    // DONE tasks
    {
      title: "Create logo variations",
      description: "Design logo variations for different use cases",
      status: "done",
      priority: "normal",
      category: "design",
      dueDate: daysAgo(2),
      completedAt: daysAgo(1),
      creatorId: manager.id,
      assigneeId: designer.id,
    },
    {
      title: "Write Facebook post for Tet",
      description: "Festive Tet greeting post for Facebook page",
      status: "done",
      priority: "high",
      category: "content",
      dueDate: daysAgo(5),
      completedAt: daysAgo(6),
      creatorId: manager.id,
      assigneeId: contentCreator.id,
    },
    {
      title: "Setup remarketing campaign",
      description: "Configure remarketing audiences and campaigns",
      status: "done",
      priority: "normal",
      category: "campaign",
      dueDate: daysAgo(3),
      completedAt: daysAgo(2),
      creatorId: manager.id,
      assigneeId: digitalMarketer.id,
    },
    {
      title: "Edit before/after video",
      description: "Edit before/after transformation video for social media",
      status: "done",
      priority: "high",
      category: "video",
      dueDate: daysAgo(1),
      completedAt: daysAgo(1),
      creatorId: manager.id,
      assigneeId: videoProducer.id,
    },
    // OVERDUE tasks
    {
      title: "Update website banners",
      description: "Replace outdated banners on the main website",
      status: "todo",
      priority: "high",
      category: "design",
      dueDate: daysAgo(2),
      creatorId: manager.id,
      assigneeId: designer2.id,
    },
    {
      title: "Write email newsletter",
      description: "Monthly newsletter content for email subscribers",
      status: "in_progress",
      priority: "normal",
      category: "content",
      dueDate: daysAgo(1),
      creatorId: manager.id,
      assigneeId: contentCreator2.id,
    },
    {
      title: "Review Zalo campaign results",
      description: "Analyze and report on last month's Zalo advertising performance",
      status: "todo",
      priority: "normal",
      category: "campaign",
      dueDate: daysAgo(3),
      creatorId: manager.id,
      assigneeId: digitalMarketer.id,
    },
    // More tasks for variety
    {
      title: "Design social media templates",
      description: "Create reusable templates for daily social media posts",
      status: "todo",
      priority: "low",
      category: "design",
      dueDate: daysFromNow(10),
      creatorId: manager.id,
      assigneeId: designer.id,
    },
    {
      title: "Write patient education series",
      description: "Create 5-part series on common dental procedures",
      status: "in_progress",
      priority: "normal",
      category: "content",
      dueDate: daysFromNow(14),
      creatorId: manager.id,
      assigneeId: contentCreator.id,
    },
    {
      title: "Setup A/B test for landing pages",
      description: "Configure A/B testing for conversion optimization",
      status: "todo",
      priority: "normal",
      category: "campaign",
      dueDate: daysFromNow(7),
      creatorId: manager.id,
      assigneeId: digitalMarketer.id,
    },
    {
      title: "Film doctor introduction videos",
      description: "Record introduction videos for new dentists",
      status: "todo",
      priority: "low",
      category: "video",
      dueDate: daysFromNow(12),
      creatorId: manager.id,
      assigneeId: videoProducer.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }
  console.log("Created 25 tasks");

  // 6. Proposals (delete + recreate)
  await prisma.proposal.deleteMany({});
  const proposals = [
    // Draft proposals
    {
      title: "Q2 Content Strategy",
      description: "Comprehensive content strategy for Q2 focusing on educational content and patient testimonials",
      category: "content",
      priority: "normal",
      status: "draft",
      budget: 15000000,
      dueDate: daysFromNow(30),
      creatorId: contentCreator.id,
    },
    {
      title: "TikTok Marketing Initiative",
      description: "Launch official TikTok presence with dental tips and behind-the-scenes content",
      category: "campaign",
      priority: "high",
      status: "draft",
      budget: 25000000,
      dueDate: daysFromNow(45),
      creatorId: digitalMarketer.id,
    },
    // Submitted proposals
    {
      title: "Valentine's Day Campaign 2024",
      description: "Special promotion campaign for Valentine's Day targeting couples for teeth whitening packages",
      category: "campaign",
      priority: "urgent",
      status: "submitted",
      budget: 30000000,
      dueDate: daysFromNow(20),
      creatorId: contentCreator.id,
    },
    {
      title: "Brand Refresh Project",
      description: "Update brand visuals including new photography style and social media templates",
      category: "design",
      priority: "high",
      status: "submitted",
      budget: 20000000,
      dueDate: daysFromNow(60),
      creatorId: designer.id,
    },
    // Under review proposals
    {
      title: "Patient Testimonial Video Series",
      description: "Create a series of 10 professional patient testimonial videos",
      category: "video",
      priority: "normal",
      status: "under_review",
      budget: 40000000,
      dueDate: daysFromNow(90),
      creatorId: videoProducer.id,
    },
    {
      title: "Local SEO Enhancement",
      description: "Improve local search rankings through Google Business optimization and local content",
      category: "campaign",
      priority: "high",
      status: "under_review",
      budget: 10000000,
      dueDate: daysFromNow(30),
      creatorId: digitalMarketer.id,
    },
    // Approved proposals
    {
      title: "Zalo OA Content Plan",
      description: "Weekly content plan for Zalo Official Account including articles and promotions",
      category: "content",
      priority: "normal",
      status: "approved",
      budget: 8000000,
      dueDate: daysFromNow(15),
      creatorId: contentCreator.id,
    },
    {
      title: "Website Banner Redesign",
      description: "Redesign all website banners with new brand guidelines",
      category: "design",
      priority: "normal",
      status: "approved",
      budget: 5000000,
      dueDate: daysFromNow(10),
      creatorId: designer.id,
    },
    {
      title: "Google Ads Q1 Campaign",
      description: "Q1 Google Ads strategy targeting high-intent keywords",
      category: "campaign",
      priority: "high",
      status: "approved",
      budget: 50000000,
      dueDate: daysFromNow(5),
      creatorId: digitalMarketer.id,
    },
    // Rejected proposals
    {
      title: "Influencer Partnership Program",
      description: "Partner with 5 local influencers for brand promotion",
      category: "partnership",
      priority: "high",
      status: "rejected",
      budget: 100000000,
      creatorId: contentCreator.id,
    },
    {
      title: "TV Commercial Production",
      description: "Produce 30-second TV commercial for local broadcast",
      category: "video",
      priority: "normal",
      status: "rejected",
      budget: 200000000,
      creatorId: videoProducer.id,
    },
    // In progress proposal
    {
      title: "January Promotion Campaign",
      description: "New Year promotion with discounts on cosmetic dentistry",
      category: "campaign",
      priority: "urgent",
      status: "in_progress",
      budget: 25000000,
      dueDate: daysFromNow(3),
      creatorId: manager.id,
    },
  ];

  for (const proposal of proposals) {
    const created = await prisma.proposal.create({ data: proposal });

    // Create approval steps for submitted/under_review/approved/rejected proposals
    if (
      ["submitted", "under_review", "approved", "rejected"].includes(
        proposal.status
      )
    ) {
      await prisma.approvalStep.create({
        data: {
          proposalId: created.id,
          approverId: manager.id,
          stepNumber: 1,
          status:
            proposal.status === "approved"
              ? "approved"
              : proposal.status === "rejected"
                ? "rejected"
                : "pending",
          comments:
            proposal.status === "approved"
              ? "Approved - good proposal"
              : proposal.status === "rejected"
                ? "Budget too high for current quarter"
                : null,
          decidedAt: ["approved", "rejected"].includes(proposal.status)
            ? new Date()
            : null,
        },
      });
    }
  }
  console.log("Created 12 proposals");

  // 7. Content opportunities (delete + recreate)
  await prisma.contentOpportunity.deleteMany({});
  const opportunities = [
    {
      submitterName: "Nguyen Van Minh",
      submitterEmail: "minh.nguyen@greenfield.clinic",
      submitterTeam: "sales",
      type: "testimonial",
      description: "Patient Mrs. Tran very happy with implant results, wants to share her story",
      consentStatus: "obtained",
      urgency: "urgent",
      status: "new",
    },
    {
      submitterName: "Le Thi Hoa",
      submitterEmail: "hoa.le@greenfield.clinic",
      submitterTeam: "nurse",
      type: "before_after",
      description: "Excellent teeth whitening results - 6 shades whiter",
      consentStatus: "obtained",
      urgency: "normal",
      status: "new",
    },
    {
      submitterName: "Pham Van Duc",
      submitterEmail: "duc.pham@greenfield.clinic",
      submitterTeam: "sales",
      type: "success_story",
      description: "Young professional got braces, great transformation journey",
      consentStatus: "pending",
      urgency: "normal",
      status: "new",
    },
    {
      submitterName: "Tran Thi Mai",
      submitterEmail: "mai.tran@greenfield.clinic",
      submitterTeam: "nurse",
      type: "educational",
      description: "Dr. Hung explains new laser treatment procedure",
      consentStatus: "obtained",
      urgency: "high",
      status: "accepted",
      assignedToId: videoProducer.id,
    },
    {
      submitterName: "Hoang Van Long",
      submitterEmail: "long.hoang@greenfield.clinic",
      submitterTeam: "sales",
      type: "testimonial",
      description: "Business owner recommends clinic for corporate dental program",
      consentStatus: "obtained",
      urgency: "normal",
      status: "in_progress",
      assignedToId: contentCreator.id,
    },
    {
      submitterName: "Nguyen Thi Lan",
      submitterEmail: "lan.nguyen@greenfield.clinic",
      submitterTeam: "nurse",
      type: "before_after",
      description: "Complete smile makeover - veneers + whitening",
      consentStatus: "pending",
      urgency: "low",
      status: "need_more_info",
    },
    {
      submitterName: "Vo Van Tuan",
      submitterEmail: "tuan.vo@greenfield.clinic",
      submitterTeam: "sales",
      type: "success_story",
      description: "Child overcame dental anxiety, now loves coming to dentist",
      consentStatus: "obtained",
      urgency: "normal",
      status: "published",
      assignedToId: contentCreator.id,
    },
    {
      submitterName: "Le Thi Huong",
      submitterEmail: "huong.le@greenfield.clinic",
      submitterTeam: "nurse",
      type: "educational",
      description: "New digital X-ray technology explanation for patients",
      consentStatus: "obtained",
      urgency: "low",
      status: "declined",
    },
  ];

  for (const opp of opportunities) {
    await prisma.contentOpportunity.create({ data: opp });
  }
  console.log("Created 8 content opportunities");

  // 8. Task requests (delete + recreate)
  await prisma.taskRequest.deleteMany({});
  const taskRequests = [
    {
      requesterTeam: "sales",
      requesterName: "Sales Manager - Tran Van Nam",
      requesterEmail: "nam.tran@greenfield.clinic",
      requestType: "design",
      title: "Poster design for Tet promotion",
      description: "Need eye-catching poster for Lunar New Year special offers - A3 size for in-clinic display",
      urgency: "urgent",
      deadline: daysFromNow(5),
      status: "new",
    },
    {
      requesterTeam: "medical",
      requesterName: "Dr. Nguyen Thanh",
      requesterEmail: "thanh.nguyen@greenfield.clinic",
      requestType: "content",
      title: "Article about new Invisalign treatment",
      description: "Need informative article explaining Invisalign benefits for our website and patient education",
      urgency: "normal",
      deadline: daysFromNow(14),
      status: "new",
    },
    {
      requesterTeam: "customer_service",
      requesterName: "Customer Service Lead",
      requesterEmail: "cs@greenfield.clinic",
      requestType: "video",
      title: "FAQ video for common questions",
      description: "Create short video answering top 5 FAQs to share with patients before appointments",
      urgency: "normal",
      deadline: daysFromNow(21),
      status: "new",
    },
    {
      requesterTeam: "accounting",
      requesterName: "Finance Department",
      requesterEmail: "finance@greenfield.clinic",
      requestType: "design",
      title: "Infographic for payment options",
      description: "Visual guide showing available payment plans and insurance partners",
      urgency: "low",
      deadline: daysFromNow(30),
      status: "accepted",
      assignedToId: designer.id,
    },
    {
      requesterTeam: "medical",
      requesterName: "Dr. Le Minh",
      requesterEmail: "minh.le@greenfield.clinic",
      requestType: "video",
      title: "Procedure explanation video",
      description: "Educational video showing what happens during a root canal procedure",
      urgency: "high",
      deadline: daysFromNow(10),
      status: "in_progress",
      assignedToId: videoProducer.id,
    },
    {
      requesterTeam: "sales",
      requesterName: "Sales Team",
      requesterEmail: "sales@greenfield.clinic",
      requestType: "content",
      title: "Email template for follow-ups",
      description: "Professional email templates for patient follow-up communications",
      urgency: "normal",
      deadline: daysFromNow(7),
      status: "completed",
      assignedToId: contentCreator.id,
    },
  ];

  for (const request of taskRequests) {
    await prisma.taskRequest.create({ data: request });
  }
  console.log("Created 6 task requests");

  // 9. User alerts (delete + recreate)
  await prisma.userAlert.deleteMany({});
  const alertsData = [
    // Unread alerts for different users
    { userId: contentCreator.id, type: "task_assigned", title: "New Task Assigned", message: "You have been assigned: Design Facebook banner for teeth whitening campaign", link: "/tasks", isRead: false },
    { userId: contentCreator.id, type: "approval_needed", title: "Proposal Needs Review", message: "Valentine's Day Campaign 2024 is pending your review", link: "/proposals", isRead: false },
    { userId: designer.id, type: "task_assigned", title: "New Task Assigned", message: "You have been assigned: Design Valentine's Day campaign materials", link: "/tasks", isRead: false },
    { userId: designer.id, type: "content_opportunity", title: "Content Opportunity", message: "New before/after case available from nurse team", link: "/inbox", isRead: false },
    { userId: videoProducer.id, type: "task_assigned", title: "New Task Assigned", message: "You have been assigned: Edit patient testimonial video", link: "/tasks", isRead: false },
    { userId: digitalMarketer.id, type: "task_assigned", title: "New Task Assigned", message: "You have been assigned: Setup Google Ads for braces campaign", link: "/tasks", isRead: false },
    { userId: manager.id, type: "approval_needed", title: "Approval Required", message: "Patient Testimonial Video Series proposal needs your approval", link: "/proposals", isRead: false },
    { userId: manager.id, type: "task_request", title: "New Task Request", message: "Sales team requested: Poster design for Tet promotion", link: "/inbox", isRead: false },
    { userId: admin.id, type: "approval_needed", title: "Budget Approval", message: "Q1 Marketing budget needs final approval", link: "/analytics/budget", isRead: false },
    { userId: contentCreator2.id, type: "task_assigned", title: "New Task Assigned", message: "You have been assigned: Write Zalo article about oral hygiene", link: "/tasks", isRead: false },
    // Read alerts
    { userId: contentCreator.id, type: "proposal_approved", title: "Proposal Approved!", message: "Your proposal 'Zalo OA Content Plan' has been approved", link: "/proposals", isRead: true },
    { userId: designer.id, type: "proposal_approved", title: "Proposal Approved!", message: "Your proposal 'Website Banner Redesign' has been approved", link: "/proposals", isRead: true },
    { userId: digitalMarketer.id, type: "proposal_approved", title: "Proposal Approved!", message: "Your proposal 'Google Ads Q1 Campaign' has been approved", link: "/proposals", isRead: true },
    { userId: contentCreator.id, type: "proposal_rejected", title: "Proposal Needs Revision", message: "Your proposal 'Influencer Partnership Program' requires changes", link: "/proposals", isRead: true },
    { userId: videoProducer.id, type: "proposal_rejected", title: "Proposal Needs Revision", message: "Your proposal 'TV Commercial Production' was not approved", link: "/proposals", isRead: true },
    { userId: manager.id, type: "content_opportunity", title: "Content Opportunity", message: "Patient testimonial available - Mrs. Tran implant success", link: "/inbox", isRead: true },
    { userId: manager.id, type: "task_request", title: "Task Request Completed", message: "Email template for follow-ups has been completed", link: "/inbox", isRead: true },
    { userId: designer.id, type: "revision_requested", title: "Revision Requested", message: "Brochure design needs minor updates", link: "/tasks", isRead: true },
    { userId: admin.id, type: "innovation_implemented", title: "Innovation Success!", message: "Reels testimonial format has been implemented successfully", link: "/gamification", isRead: true },
    { userId: contentCreator.id, type: "innovation_implemented", title: "Bonus Points!", message: "You earned 50 points for your implemented idea", link: "/gamification", isRead: true },
  ];

  for (const alert of alertsData) {
    await prisma.userAlert.create({ data: alert });
  }
  console.log("Created 20 user alerts");

  // 10. Assets (delete + recreate)
  await prisma.asset.deleteMany({});
  const assets = [
    { name: "Logo Primary", fileUrl: "/assets/logo-primary.png", fileSize: 125000, fileType: "image/png", category: "image", uploadedById: designer.id },
    { name: "Logo White", fileUrl: "/assets/logo-white.png", fileSize: 98000, fileType: "image/png", category: "image", uploadedById: designer.id },
    { name: "Banner Template 1", fileUrl: "/assets/banner-template-1.psd", fileSize: 5500000, fileType: "image/vnd.adobe.photoshop", category: "template", uploadedById: designer.id },
    { name: "Banner Template 2", fileUrl: "/assets/banner-template-2.psd", fileSize: 4800000, fileType: "image/vnd.adobe.photoshop", category: "template", uploadedById: designer.id },
    { name: "Social Media Kit", fileUrl: "/assets/social-media-kit.zip", fileSize: 25000000, fileType: "application/zip", category: "template", uploadedById: designer.id },
    { name: "Patient Testimonial 1", fileUrl: "/assets/testimonial-1.mp4", fileSize: 85000000, fileType: "video/mp4", category: "video", uploadedById: videoProducer.id },
    { name: "Patient Testimonial 2", fileUrl: "/assets/testimonial-2.mp4", fileSize: 72000000, fileType: "video/mp4", category: "video", uploadedById: videoProducer.id },
    { name: "Clinic Tour Video", fileUrl: "/assets/clinic-tour.mp4", fileSize: 150000000, fileType: "video/mp4", category: "video", uploadedById: videoProducer.id },
    { name: "Brand Guidelines", fileUrl: "/assets/brand-guidelines.pdf", fileSize: 8500000, fileType: "application/pdf", category: "document", uploadedById: designer.id },
    { name: "Content Calendar Template", fileUrl: "/assets/content-calendar.xlsx", fileSize: 250000, fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", category: "document", uploadedById: contentCreator.id },
    { name: "Stock Photo - Smile 1", fileUrl: "/assets/stock-smile-1.jpg", fileSize: 2500000, fileType: "image/jpeg", category: "image", uploadedById: designer.id },
    { name: "Stock Photo - Smile 2", fileUrl: "/assets/stock-smile-2.jpg", fileSize: 2800000, fileType: "image/jpeg", category: "image", uploadedById: designer.id },
    { name: "Stock Photo - Clinic", fileUrl: "/assets/stock-clinic.jpg", fileSize: 3200000, fileType: "image/jpeg", category: "image", uploadedById: designer.id },
    { name: "Music - Background 1", fileUrl: "/assets/music-bg-1.mp3", fileSize: 4500000, fileType: "audio/mpeg", category: "video", uploadedById: videoProducer.id },
    { name: "Sound Effect Pack", fileUrl: "/assets/sfx-pack.zip", fileSize: 12000000, fileType: "application/zip", category: "video", uploadedById: videoProducer.id },
  ];

  for (const asset of assets) {
    await prisma.asset.create({ data: asset });
  }
  console.log("Created 15 assets");

  // 11. Calendar items (delete + recreate)
  await prisma.contentCalendarItem.deleteMany({});
  const calendarItems = [
    // Scheduled items (next 2 weeks)
    { title: "Teeth Whitening Promo Post", description: "Promotional post for teeth whitening service discount", platform: "facebook", status: "scheduled", scheduledAt: daysFromNow(1), creatorId: contentCreator.id },
    { title: "Dental Care Tips - Reel", description: "Short video about daily dental care tips", platform: "instagram", status: "scheduled", scheduledAt: daysFromNow(1), creatorId: videoProducer.id },
    { title: "Patient Success Story", description: "Before/after showcase of implant patient", platform: "zalo", status: "scheduled", scheduledAt: daysFromNow(2), creatorId: contentCreator.id },
    { title: "Valentine's Special Announcement", description: "Announce Valentine's Day promotion", platform: "facebook", status: "scheduled", scheduledAt: daysFromNow(3), creatorId: contentCreator.id },
    { title: "Behind the Scenes", description: "Day in the life at Greenfield Clinic", platform: "tiktok", status: "scheduled", scheduledAt: daysFromNow(4), creatorId: videoProducer.id },
    { title: "Orthodontics Education Post", description: "Educational content about braces options", platform: "facebook", status: "scheduled", scheduledAt: daysFromNow(5), creatorId: contentCreator.id },
    // In production
    { title: "Dr. Interview Series", description: "Interview with Dr. Nguyen about dental health", platform: "youtube", status: "in_production", scheduledAt: daysFromNow(7), creatorId: videoProducer.id },
    { title: "Infographic - Oral Hygiene", description: "Visual guide to proper brushing technique", platform: "instagram", status: "in_production", scheduledAt: daysFromNow(6), creatorId: designer.id },
    { title: "Q&A Session Announcement", description: "Promote upcoming live Q&A session", platform: "facebook", status: "in_production", scheduledAt: daysFromNow(8), creatorId: contentCreator.id },
    // Ready for review
    { title: "New Equipment Showcase", description: "Showcase new dental technology", platform: "zalo", status: "ready_for_review", scheduledAt: daysFromNow(3), creatorId: contentCreator.id },
    { title: "Staff Introduction", description: "Meet our friendly dental team", platform: "facebook", status: "ready_for_review", scheduledAt: daysFromNow(5), creatorId: videoProducer.id },
    // Published (past)
    { title: "New Year Greeting", description: "Happy New Year message to patients", platform: "facebook", status: "published", scheduledAt: daysAgo(5), publishedAt: daysAgo(5), creatorId: contentCreator.id },
    { title: "Holiday Hours Notice", description: "Clinic hours during Tet holiday", platform: "zalo", status: "published", scheduledAt: daysAgo(3), publishedAt: daysAgo(3), creatorId: contentCreator.id },
    { title: "Patient Testimonial Post", description: "Mrs. Nguyen shares her experience", platform: "facebook", status: "published", scheduledAt: daysAgo(2), publishedAt: daysAgo(2), creatorId: contentCreator.id },
    { title: "Dental Tip Tuesday", description: "Weekly dental tip post", platform: "instagram", status: "published", scheduledAt: daysAgo(1), publishedAt: daysAgo(1), creatorId: contentCreator2.id },
  ];

  for (const item of calendarItems) {
    await prisma.contentCalendarItem.create({ data: item });
  }
  console.log("Created 15 calendar items");

  // 12. Monthly budget (upsert by unique month - idempotent)
  const currentMonth = new Date().toISOString().slice(0, 7);
  await prisma.monthlyBudget.upsert({
    where: { month: currentMonth },
    update: {},
    create: {
      month: currentMonth,
      totalBudget: 100000000,
      googleAdsAllocation: 40000000,
      facebookAllocation: 35000000,
      zaloAllocation: 25000000,
      status: "active",
      createdById: admin.id,
      approvedById: admin.id,
    },
  });
  console.log("Created sample budget");

  // 13. Innovation ideas (delete + recreate)
  await prisma.innovationIdea.deleteMany({});
  const ideas = [
    {
      title: "Use Reels format for patient testimonials",
      description: "Short-form video testimonials perform better on Instagram and TikTok",
      category: "content",
      status: "implemented",
      impactScore: 8,
      submitterId: contentCreator.id,
    },
    {
      title: "Weekly dental tips series on TikTok",
      description: "Create consistent dental tip content series for TikTok audience",
      category: "content",
      status: "reviewing",
      submitterId: videoProducer.id,
    },
    {
      title: "Partner with local fitness influencers",
      description: "Collaborate with fitness influencers for smile/health connection content",
      category: "partnership",
      status: "approved",
      submitterId: digitalMarketer.id,
    },
    {
      title: "AR filter for smile preview",
      description: "Create Instagram/Facebook AR filter showing teeth whitening results",
      category: "technology",
      status: "submitted",
      submitterId: designer.id,
    },
    {
      title: "Patient loyalty program integration",
      description: "Integrate marketing with patient loyalty program for referrals",
      category: "strategy",
      status: "submitted",
      submitterId: contentCreator.id,
    },
  ];

  for (const idea of ideas) {
    await prisma.innovationIdea.create({ data: idea });
  }
  console.log("Created innovation ideas");

  // 14. Integration configs (delete + recreate)
  await prisma.integrationConfig.deleteMany({});
  const integrationConfigs = [
    {
      platform: "facebook",
      credentials: JSON.stringify({
        app_id: "fb_482917364820",
        app_secret: "s3cr3t_fb_k9x7m2pq4w",
        page_access_token: "EAAGm0PX4ZCpsBALz9kZBjWqK8xZA2nZB7",
        page_id: "109283746501928",
      }),
      isActive: true,
      lastSyncAt: daysAgo(0),
    },
    {
      platform: "instagram",
      credentials: JSON.stringify({
        business_account_id: "ig_17841405793210",
        access_token: "IGQVJWZAnRUcGdJR0hBbkFONjlxd3pV",
        client_id: "ig_client_7293841650",
        client_secret: "ig_s3cr3t_xk92m4",
      }),
      isActive: true,
      lastSyncAt: daysAgo(1),
    },
    {
      platform: "google_analytics",
      credentials: JSON.stringify({
        property_id: "GA4-382917465",
        measurement_id: "G-X7K9M2PQ4W",
        api_secret: "ga_s3cr3t_mZk9x2Pw",
        service_account_email: "analytics@greenfield-clinic.iam.gserviceaccount.com",
      }),
      isActive: true,
      lastSyncAt: daysAgo(0),
    },
    {
      platform: "zalo",
      credentials: JSON.stringify({
        oa_id: "zalo_oa_4829173648",
        app_id: "zalo_app_1928374650",
        secret_key: "zalo_sk_Xk9m2Pw4Qr7",
        access_token: "zalo_at_LmN8pR3sT5vW",
        refresh_token: "zalo_rt_Hy6jK1bC9dE",
      }),
      isActive: true,
      lastSyncAt: daysAgo(2),
    },
    {
      platform: "tiktok",
      credentials: JSON.stringify({}),
      isActive: false,
      lastSyncAt: null,
    },
    {
      platform: "youtube",
      credentials: JSON.stringify({}),
      isActive: false,
      lastSyncAt: null,
    },
  ];

  for (const config of integrationConfigs) {
    await prisma.integrationConfig.create({ data: config });
  }
  console.log("Created 6 integration configs");

  console.log("\nDatabase seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
