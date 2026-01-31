/**
 * scripts/clear-seed-data.ts
 *
 * Clears all demo/seed data from the database while keeping essential system data.
 *
 * Usage:
 *   npx tsx scripts/clear-seed-data.ts
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Clearing Seed/Demo Data ===\n");

  // 1. Delete task-related data
  console.log("Deleting tasks and related data...");
  await prisma.taskActivity.deleteMany({});
  await prisma.taskComment.deleteMany({});
  await prisma.taskAttachment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.taskTemplate.deleteMany({});
  console.log("  ✓ Tasks cleared");

  // 2. Delete proposal-related data
  console.log("Deleting proposals and related data...");
  await prisma.proposalComment.deleteMany({});
  await prisma.proposalAttachment.deleteMany({});
  await prisma.approvalStep.deleteMany({});
  await prisma.proposalCollaborator.deleteMany({});
  await prisma.proposal.deleteMany({});
  console.log("  ✓ Proposals cleared");

  // 3. Delete innovation ideas
  console.log("Deleting innovation ideas...");
  await prisma.ideaOfMonth.deleteMany({});
  await prisma.ideaComment.deleteMany({});
  await prisma.ideaVote.deleteMany({});
  await prisma.innovationIdea.deleteMany({});
  console.log("  ✓ Innovation ideas cleared");

  // 4. Delete content calendar items
  console.log("Deleting content calendar items...");
  await prisma.calendarItemAttachment.deleteMany({});
  await prisma.calendarItemComment.deleteMany({});
  await prisma.contentCalendarItem.deleteMany({});
  console.log("  ✓ Calendar items cleared");

  // 5. Delete marketing campaigns and related
  console.log("Deleting campaigns and marketing data...");
  await prisma.campaignMetric.deleteMany({});
  await prisma.adCreative.deleteMany({});
  await prisma.socialPost.deleteMany({});
  await prisma.landingPageMetric.deleteMany({});
  await prisma.landingPage.deleteMany({});
  await prisma.marketingCampaign.deleteMany({});
  console.log("  ✓ Campaigns cleared");

  // 6. Delete budget data
  console.log("Deleting budget data...");
  await prisma.budgetAlert.deleteMany({});
  await prisma.budgetSpend.deleteMany({});
  await prisma.monthlyBudget.deleteMany({});
  console.log("  ✓ Budget data cleared");

  // 7. Delete general assets (not brand assets)
  console.log("Deleting general assets...");
  await prisma.asset.deleteMany({});
  console.log("  ✓ General assets cleared");

  // 8. Delete user alerts
  console.log("Deleting user alerts...");
  await prisma.userAlert.deleteMany({});
  console.log("  ✓ User alerts cleared");

  // 9. Delete external requests
  console.log("Deleting external requests...");
  await prisma.opportunityComment.deleteMany({});
  await prisma.contentOpportunity.deleteMany({});
  await prisma.taskRequest.deleteMany({});
  console.log("  ✓ External requests cleared");

  // 10. Delete gamification history (keep config)
  console.log("Deleting gamification history...");
  await prisma.pointTransaction.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.rewardRedemption.deleteMany({});
  console.log("  ✓ Gamification history cleared");

  // 11. Reset user points to 0
  console.log("Resetting user points...");
  await prisma.userPoints.updateMany({
    data: {
      totalPoints: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
    },
  });
  console.log("  ✓ User points reset to 0");

  // 12. Delete brand asset downloads (keep assets)
  console.log("Clearing brand asset download history...");
  await prisma.brandAssetDownload.deleteMany({});
  console.log("  ✓ Download history cleared");

  // 13. Delete performance data
  console.log("Deleting performance data...");
  await prisma.qualityRating.deleteMany({});
  await prisma.performanceGoal.deleteMany({});
  await prisma.performanceMetric.deleteMany({});
  await prisma.bonusDistribution.deleteMany({});
  await prisma.monthlyBonusPool.deleteMany({});
  await prisma.crossTeamRating.deleteMany({});
  console.log("  ✓ Performance data cleared");

  // 14. Delete CRM data
  console.log("Deleting CRM data...");
  await prisma.crmAppointment.deleteMany({});
  await prisma.crmLead.deleteMany({});
  console.log("  ✓ CRM data cleared");

  // 15. Delete social channels (keep platforms)
  console.log("Deleting social channels...");
  await prisma.socialChannel.deleteMany({});
  console.log("  ✓ Social channels cleared");

  // 16. Delete sync logs
  console.log("Deleting sync logs...");
  await prisma.syncLog.deleteMany({});
  console.log("  ✓ Sync logs cleared");

  // Summary
  console.log("\n=== Data Cleared Successfully ===\n");
  console.log("KEPT (system data):");
  const userCount = await prisma.user.count();
  const brandColorCount = await prisma.brandColor.count();
  const brandAssetCount = await prisma.brandAsset.count();
  const platformCount = await prisma.platform.count();
  const achievementCount = await prisma.achievement.count();
  const rewardCount = await prisma.reward.count();

  console.log(`  - ${userCount} Users`);
  console.log(`  - ${brandColorCount} Brand Colors`);
  console.log(`  - ${brandAssetCount} Brand Assets (logos)`);
  console.log(`  - ${platformCount} Platforms`);
  console.log(`  - ${achievementCount} Achievements`);
  console.log(`  - ${rewardCount} Rewards`);

  console.log("\nThe app is now ready for the team to start fresh!");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
