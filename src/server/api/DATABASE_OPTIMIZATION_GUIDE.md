# Database Query Optimization Guide

This document outlines optimization opportunities and best practices for tRPC routes in the Greenfield Dental Command Center.

## Current Query Patterns Analysis

### 1. Analytics Router (`analytics.ts`)

**Good Practices Already Implemented:**
- Uses `Promise.all()` for parallel queries in `getLeadStats` and `getAppointmentStats`
- Applies date filtering at the database level
- Uses `groupBy` for aggregations

**Optimization Opportunities:**

```typescript
// CURRENT: getCampaigns fetches all metrics then aggregates in JS
// SUGGESTION: Use database aggregation for better performance

// Instead of:
const campaigns = await ctx.prisma.marketingCampaign.findMany({
  include: {
    metrics: { take: 30 },  // Fetching up to 30 records per campaign
  },
});
// Then manually reducing in JS

// Consider: Adding a database view or using raw SQL for complex aggregations
// Or: Add indexed aggregate columns that are updated on metric insert
```

**N+1 Query Patterns:**
- `getSpendByPlatform`: Fetches all campaigns with metrics, then loops through campaigns
- Suggestion: Use Prisma's `groupBy` with `_sum` aggregation

### 2. Calendar Router (`calendar.ts`)

**Good Practices:**
- Uses `select` to limit user fields in includes
- Implements cursor-based pagination would be good to add

**Optimization Suggestions:**

```typescript
// Add pagination to getItems and getByMonth
// CURRENT: No limit on calendar items returned
getItems: protectedProcedure.input(
  z.object({
    // ... existing fields
    limit: z.number().min(1).max(100).default(50),  // ADD THIS
    cursor: z.string().optional(),                   // ADD THIS
  })
)
```

### 3. Task Router (`task.ts`)

**Good Practices Already Implemented:**
- Uses cursor-based pagination in `getAll`
- Uses `select` to limit included relation fields
- Uses `_count` for counting related records

**Optimization Opportunities:**

```typescript
// CURRENT: getKanbanBoard fetches all tasks then filters in JS
// SUGGESTION: Use separate queries per status with limit

// Instead of:
const tasks = await ctx.prisma.task.findMany({ where });
const board = {
  todo: tasks.filter((t) => t.status === "todo"),
  // ...
};

// Consider: 4 parallel queries with limits
const [todo, inProgress, review, done] = await Promise.all([
  ctx.prisma.task.findMany({ where: { ...where, status: "todo" }, take: 20 }),
  ctx.prisma.task.findMany({ where: { ...where, status: "in_progress" }, take: 20 }),
  ctx.prisma.task.findMany({ where: { ...where, status: "review" }, take: 20 }),
  ctx.prisma.task.findMany({ where: { ...where, status: "done" }, take: 20 }),
]);
```

### 4. Proposal Router (`proposal.ts`)

**Good Practices:**
- Uses pagination in `getAll`
- Uses `select` to limit relation fields
- Uses `_count` for aggregates

**Optimization Suggestions:**

```typescript
// CURRENT: getPendingApprovals has nested includes
// Potential for N+1 if many approvals per proposal

// Add limit to myProposals if user has many proposals
getMyProposals: protectedProcedure.input(
  z.object({
    status: proposalStatusEnum.optional(),
    limit: z.number().min(1).max(50).default(20),  // ADD THIS
  }).optional()
)
```

### 5. User Router (`user.ts`)

**Excellent Practices:**
- Uses `select` everywhere - only fetches needed fields
- Simple, efficient queries

### 6. Gamification Router (`gamification.ts`)

**Optimization Opportunities:**

```typescript
// CURRENT: getMyAchievements makes 2 queries
// SUGGESTION: Consider a single query approach

// CURRENT:
const userAchievements = await ctx.prisma.userAchievement.findMany({...});
const allAchievements = await ctx.prisma.achievement.findMany({...});

// BETTER: Use Promise.all for parallel execution
const [userAchievements, allAchievements] = await Promise.all([
  ctx.prisma.userAchievement.findMany({...}),
  ctx.prisma.achievement.findMany({...}),
]);
```

### 7. Library Router (`library.ts`)

**Good Practices:**
- Implements pagination in `getAssets`
- Uses `select` for relation fields

**Optimization Suggestions:**

```typescript
// CURRENT: getRecentlyUsedBrandAssets fetches then dedupes in JS
// SUGGESTION: Use Prisma's distinct or raw query for deduplication

// Consider adding distinct at database level
const recentDownloads = await ctx.prisma.brandAssetDownload.findMany({
  where: { userId: ctx.session.user.id },
  distinct: ['brandAssetId'],  // ADD THIS
  orderBy: { downloadedAt: "desc" },
  take: 8,
  include: { brandAsset: true },
});
```

## General Recommendations

### 1. Add Database Indexes

Consider adding indexes for frequently queried fields:

```prisma
// In schema.prisma
model Task {
  // ... fields
  @@index([status])
  @@index([assigneeId])
  @@index([dueDate])
  @@index([creatorId])
}

model CampaignMetric {
  // ... fields
  @@index([date])
  @@index([campaignId, date])
}

model ContentCalendarItem {
  // ... fields
  @@index([scheduledAt])
  @@index([status])
  @@index([platform])
}
```

### 2. Use Prisma's Aggregation Features

```typescript
// Instead of fetching all records and calculating in JS:
const totalSpend = await ctx.prisma.campaignMetric.aggregate({
  _sum: { spend: true, leads: true, clicks: true },
  where: { date: { gte: startDate, lte: endDate } },
});
```

### 3. Connection Pooling

For production, ensure connection pooling is configured:

```typescript
// In prisma.ts
const prisma = new PrismaClient({
  // Consider using PgBouncer or Prisma Accelerate for connection pooling
});
```

### 4. Query Caching Strategy

The React Query cache settings in `query-client.ts` provide client-side caching.
For server-side caching, consider:

- Redis for frequently accessed data
- Prisma Accelerate for edge caching

## Priority Quick Wins

1. **Add `Promise.all` for parallel queries** - Already done in some places, extend to others
2. **Add pagination everywhere** - Prevents memory issues with large datasets
3. **Add database indexes** - Significantly speeds up filtered queries
4. **Use `select` consistently** - Reduces data transfer
5. **Use `_count` instead of fetching relations** - Already good, continue the practice
