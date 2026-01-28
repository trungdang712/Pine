import { vi } from 'vitest'
import { createCaller } from '@/server/api/root'

// ==================== Mock Prisma Client ====================

/**
 * Creates a deeply-mocked Prisma client where every model method
 * is a vi.fn() that can be individually configured per test.
 */
function createMockPrismaModel() {
  return {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  }
}

export function createMockPrisma() {
  return {
    user: createMockPrismaModel(),
    userAlert: createMockPrismaModel(),
    task: createMockPrismaModel(),
    taskComment: createMockPrismaModel(),
    taskAttachment: createMockPrismaModel(),
    proposal: createMockPrismaModel(),
    proposalComment: createMockPrismaModel(),
    proposalAttachment: createMockPrismaModel(),
    approvalStep: createMockPrismaModel(),
    approvalWorkflow: createMockPrismaModel(),
    contentCalendarItem: createMockPrismaModel(),
    calendarItemComment: createMockPrismaModel(),
    calendarItemAttachment: createMockPrismaModel(),
    asset: createMockPrismaModel(),
    brandAsset: createMockPrismaModel(),
    brandColor: createMockPrismaModel(),
    brandAssetDownload: createMockPrismaModel(),
    marketingCampaign: createMockPrismaModel(),
    campaignMetric: createMockPrismaModel(),
    socialPost: createMockPrismaModel(),
    adCreative: createMockPrismaModel(),
    userPoints: createMockPrismaModel(),
    pointTransaction: createMockPrismaModel(),
    achievement: createMockPrismaModel(),
    userAchievement: createMockPrismaModel(),
    reward: createMockPrismaModel(),
    rewardRedemption: createMockPrismaModel(),
    innovationIdea: createMockPrismaModel(),
    crossTeamRating: createMockPrismaModel(),
    qualityRating: createMockPrismaModel(),
    performanceMetric: createMockPrismaModel(),
    performanceGoal: createMockPrismaModel(),
    monthlyBonusPool: createMockPrismaModel(),
    bonusDistribution: createMockPrismaModel(),
    contentOpportunity: createMockPrismaModel(),
    opportunityComment: createMockPrismaModel(),
    taskRequest: createMockPrismaModel(),
    taskTemplate: createMockPrismaModel(),
    monthlyBudget: createMockPrismaModel(),
    budgetSpend: createMockPrismaModel(),
    budgetAlert: createMockPrismaModel(),
    landingPage: createMockPrismaModel(),
    landingPageMetric: createMockPrismaModel(),
    crmAppointment: createMockPrismaModel(),
    crmLead: createMockPrismaModel(),
    syncLog: createMockPrismaModel(),
    integrationConfig: createMockPrismaModel(),
    $transaction: vi.fn((cb: (tx: unknown) => Promise<unknown>) => cb({})),
  }
}

export type MockPrisma = ReturnType<typeof createMockPrisma>

// ==================== Mock Context ====================

interface MockUser {
  id: string
  email: string
  name: string
  team: string
  role: string
}

export function createMockSession(overrides: Partial<MockUser> = {}) {
  return {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      team: 'marketing',
      role: 'content_creator',
      ...overrides,
    },
  }
}

export function createAdminSession(overrides: Partial<MockUser> = {}) {
  return createMockSession({
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    ...overrides,
  })
}

// ==================== tRPC Caller Factory ====================

/**
 * Creates a tRPC caller that uses the provided mock prisma client
 * and session. Use this to call router procedures directly in tests.
 */
export function createTestCaller(
  mockPrisma: MockPrisma,
  session: ReturnType<typeof createMockSession> | { user: null } = createMockSession()
) {
  // The createCaller from root.ts creates a caller factory.
  // We pass a mock context matching the shape from trpc.ts.
  const caller = createCaller({
    prisma: mockPrisma as never,
    session,
    supabase: {} as never,
    headers: new Headers(),
  })

  return caller
}

// ==================== Test Data Fixtures ====================

export const fixtures = {
  users: {
    admin: {
      id: 'admin-1',
      email: 'admin@greenfield.com',
      password: '$2a$12$hashedpassword', // bcrypt hash placeholder
      name: 'Admin User',
      avatar: null,
      role: 'admin',
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    contentCreator: {
      id: 'user-1',
      email: 'creator@greenfield.com',
      password: '$2a$12$hashedpassword',
      name: 'Content Creator',
      avatar: null,
      role: 'content_creator',
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    designer: {
      id: 'user-2',
      email: 'designer@greenfield.com',
      password: '$2a$12$hashedpassword',
      name: 'Graphic Designer',
      avatar: null,
      role: 'graphic_designer',
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  },

  tasks: {
    todo: {
      id: 'task-1',
      title: 'Write blog post',
      description: 'Write a new blog post about dental care',
      status: 'todo',
      priority: 'normal',
      category: 'content',
      dueDate: new Date('2025-02-15'),
      completedAt: null,
      creatorId: 'admin-1',
      assigneeId: 'user-1',
      proposalId: null,
      parentTaskId: null,
      isRecurring: false,
      recurringPattern: null,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    },
    inProgress: {
      id: 'task-2',
      title: 'Design social media graphics',
      description: 'Create Instagram post designs',
      status: 'in_progress',
      priority: 'high',
      category: 'design',
      dueDate: new Date('2025-02-10'),
      completedAt: null,
      creatorId: 'admin-1',
      assigneeId: 'user-2',
      proposalId: null,
      parentTaskId: null,
      isRecurring: false,
      recurringPattern: null,
      createdAt: new Date('2025-01-08'),
      updatedAt: new Date('2025-01-09'),
    },
    review: {
      id: 'task-3',
      title: 'Review campaign proposal',
      description: 'Review the Q1 campaign proposal',
      status: 'review',
      priority: 'urgent',
      category: 'campaign',
      dueDate: new Date('2025-02-05'),
      completedAt: null,
      creatorId: 'user-1',
      assigneeId: 'admin-1',
      proposalId: null,
      parentTaskId: null,
      isRecurring: false,
      recurringPattern: null,
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-12'),
    },
    done: {
      id: 'task-4',
      title: 'Update website copy',
      description: 'Update the homepage text',
      status: 'done',
      priority: 'low',
      category: 'content',
      dueDate: new Date('2025-01-20'),
      completedAt: new Date('2025-01-18'),
      creatorId: 'user-1',
      assigneeId: 'user-1',
      proposalId: null,
      parentTaskId: null,
      isRecurring: false,
      recurringPattern: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-18'),
    },
  },

  alerts: {
    unread1: {
      id: 'alert-1',
      userId: 'user-1',
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: 'You have been assigned to: Write blog post',
      link: '/tasks/task-1',
      isRead: false,
      createdAt: new Date('2025-01-10'),
    },
    unread2: {
      id: 'alert-2',
      userId: 'user-1',
      type: 'approval_needed',
      title: 'Approval Needed',
      message: 'A proposal requires your review',
      link: '/proposals/prop-1',
      isRead: false,
      createdAt: new Date('2025-01-09'),
    },
    read1: {
      id: 'alert-3',
      userId: 'user-1',
      type: 'mention',
      title: 'You were mentioned',
      message: 'Admin mentioned you in a task comment',
      link: '/tasks/task-2',
      isRead: true,
      createdAt: new Date('2025-01-05'),
    },
  },
}
