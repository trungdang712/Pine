import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createMockPrisma,
  createTestCaller,
  createMockSession,
  createAdminSession,
  fixtures,
  type MockPrisma,
} from '@/test/helpers'

describe('Task Router', () => {
  let mockPrisma: MockPrisma

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = createMockPrisma()
  })

  // ==================== getAll ====================
  describe('getAll', () => {
    it('returns paginated tasks with relations', async () => {
      const tasksWithRelations = [
        {
          ...fixtures.tasks.todo,
          creator: { id: 'admin-1', name: 'Admin User', avatar: null },
          assignee: { id: 'user-1', name: 'Content Creator', avatar: null },
          _count: { comments: 2, attachments: 1, subtasks: 0 },
        },
        {
          ...fixtures.tasks.inProgress,
          creator: { id: 'admin-1', name: 'Admin User', avatar: null },
          assignee: { id: 'user-2', name: 'Graphic Designer', avatar: null },
          _count: { comments: 0, attachments: 0, subtasks: 1 },
        },
      ]

      mockPrisma.task.findMany.mockResolvedValue(tasksWithRelations)

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.getAll()

      expect(result.tasks).toEqual(tasksWithRelations)
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            creator: expect.any(Object),
            assignee: expect.any(Object),
            _count: expect.any(Object),
          }),
          orderBy: [
            { priority: 'asc' },
            { dueDate: 'asc' },
            { createdAt: 'desc' },
          ],
          take: 50,
        })
      )
    })

    it('filters tasks by status', async () => {
      mockPrisma.task.findMany.mockResolvedValue([])

      const caller = createTestCaller(mockPrisma, createMockSession())
      await caller.task.getAll({ status: 'todo' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'todo' }),
        })
      )
    })

    it('filters tasks by priority', async () => {
      mockPrisma.task.findMany.mockResolvedValue([])

      const caller = createTestCaller(mockPrisma, createMockSession())
      await caller.task.getAll({ priority: 'urgent' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ priority: 'urgent' }),
        })
      )
    })

    it('filters tasks by assignee', async () => {
      mockPrisma.task.findMany.mockResolvedValue([])

      const caller = createTestCaller(mockPrisma, createMockSession())
      await caller.task.getAll({ assigneeId: 'user-1' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assigneeId: 'user-1' }),
        })
      )
    })

    it('supports search across title and description', async () => {
      mockPrisma.task.findMany.mockResolvedValue([])

      const caller = createTestCaller(mockPrisma, createMockSession())
      await caller.task.getAll({ search: 'blog' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'blog' } },
              { description: { contains: 'blog' } },
            ],
          }),
        })
      )
    })

    it('returns nextCursor when there are more results', async () => {
      const tasks = Array.from({ length: 50 }, (_, i) => ({
        ...fixtures.tasks.todo,
        id: `task-${i}`,
      }))

      mockPrisma.task.findMany.mockResolvedValue(tasks)

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.getAll({ limit: 50 })

      expect(result.nextCursor).toBe('task-49')
    })

    it('returns undefined nextCursor when there are no more results', async () => {
      const tasks = [
        {
          ...fixtures.tasks.todo,
          creator: { id: 'admin-1', name: 'Admin', avatar: null },
          assignee: null,
          _count: { comments: 0, attachments: 0, subtasks: 0 },
        },
      ]

      mockPrisma.task.findMany.mockResolvedValue(tasks)

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.getAll()

      expect(result.nextCursor).toBeUndefined()
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.task.getAll()).rejects.toThrow()
    })
  })

  // ==================== getKanbanBoard ====================
  describe('getKanbanBoard', () => {
    it('returns tasks grouped by status', async () => {
      const allTasks = [
        {
          ...fixtures.tasks.todo,
          creator: { id: 'admin-1', name: 'Admin', avatar: null },
          assignee: { id: 'user-1', name: 'Creator', avatar: null },
          _count: { comments: 0, attachments: 0 },
        },
        {
          ...fixtures.tasks.inProgress,
          creator: { id: 'admin-1', name: 'Admin', avatar: null },
          assignee: { id: 'user-2', name: 'Designer', avatar: null },
          _count: { comments: 1, attachments: 0 },
        },
        {
          ...fixtures.tasks.review,
          creator: { id: 'user-1', name: 'Creator', avatar: null },
          assignee: { id: 'admin-1', name: 'Admin', avatar: null },
          _count: { comments: 0, attachments: 0 },
        },
        {
          ...fixtures.tasks.done,
          creator: { id: 'user-1', name: 'Creator', avatar: null },
          assignee: { id: 'user-1', name: 'Creator', avatar: null },
          _count: { comments: 0, attachments: 0 },
        },
      ]

      mockPrisma.task.findMany.mockResolvedValue(allTasks)

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.getKanbanBoard()

      expect(result.todo).toHaveLength(1)
      expect(result.in_progress).toHaveLength(1)
      expect(result.review).toHaveLength(1)
      expect(result.done).toHaveLength(1)
      expect(result.todo[0].id).toBe('task-1')
      expect(result.in_progress[0].id).toBe('task-2')
      expect(result.review[0].id).toBe('task-3')
      expect(result.done[0].id).toBe('task-4')
    })

    it('returns empty arrays when no tasks exist', async () => {
      mockPrisma.task.findMany.mockResolvedValue([])

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.getKanbanBoard()

      expect(result.todo).toHaveLength(0)
      expect(result.in_progress).toHaveLength(0)
      expect(result.review).toHaveLength(0)
      expect(result.done).toHaveLength(0)
    })

    it('filters by assigneeId when provided', async () => {
      mockPrisma.task.findMany.mockResolvedValue([])

      const caller = createTestCaller(mockPrisma, createMockSession())
      await caller.task.getKanbanBoard({ assigneeId: 'user-1' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assigneeId: 'user-1' }),
        })
      )
    })

    it('filters by category when provided', async () => {
      mockPrisma.task.findMany.mockResolvedValue([])

      const caller = createTestCaller(mockPrisma, createMockSession())
      await caller.task.getKanbanBoard({ category: 'design' })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'design' }),
        })
      )
    })
  })

  // ==================== create ====================
  describe('create', () => {
    it('creates a task and assigns the current user as creator', async () => {
      const createdTask = {
        id: 'new-task-1',
        title: 'New task',
        description: 'Task description',
        status: 'todo',
        priority: 'normal',
        category: 'content',
        dueDate: null,
        completedAt: null,
        creatorId: 'user-1',
        assigneeId: null,
        proposalId: null,
        parentTaskId: null,
        isRecurring: false,
        recurringPattern: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: { id: 'user-1', name: 'Content Creator', avatar: null },
        assignee: null,
      }

      mockPrisma.task.create.mockResolvedValue(createdTask)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.task.create({
        title: 'New task',
        description: 'Task description',
        category: 'content',
      })

      expect(result).toEqual(createdTask)
      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New task',
            description: 'Task description',
            creatorId: 'user-1',
          }),
        })
      )
    })

    it('creates a notification when assigning to another user', async () => {
      const createdTask = {
        id: 'new-task-2',
        title: 'Assigned task',
        creatorId: 'user-1',
        assigneeId: 'user-2',
        creator: { id: 'user-1', name: 'Content Creator', avatar: null },
        assignee: { id: 'user-2', name: 'Graphic Designer', avatar: null },
      }

      mockPrisma.task.create.mockResolvedValue(createdTask)
      mockPrisma.userAlert.create.mockResolvedValue({})

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      await caller.task.create({
        title: 'Assigned task',
        assigneeId: 'user-2',
      })

      expect(mockPrisma.userAlert.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-2',
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: 'You have been assigned to: Assigned task',
        }),
      })
    })

    it('does not create notification when self-assigning', async () => {
      const createdTask = {
        id: 'new-task-3',
        title: 'Self-assigned task',
        creatorId: 'user-1',
        assigneeId: 'user-1',
        creator: { id: 'user-1', name: 'Content Creator', avatar: null },
        assignee: { id: 'user-1', name: 'Content Creator', avatar: null },
      }

      mockPrisma.task.create.mockResolvedValue(createdTask)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      await caller.task.create({
        title: 'Self-assigned task',
        assigneeId: 'user-1',
      })

      expect(mockPrisma.userAlert.create).not.toHaveBeenCalled()
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(
        caller.task.create({ title: 'Unauthorized task' })
      ).rejects.toThrow()
    })
  })

  // ==================== update ====================
  describe('update', () => {
    it('updates task status', async () => {
      const updatedTask = {
        ...fixtures.tasks.todo,
        status: 'in_progress',
        creator: { id: 'admin-1', name: 'Admin', avatar: null },
        assignee: { id: 'user-1', name: 'Creator', avatar: null },
      }

      mockPrisma.task.findUnique.mockResolvedValue(fixtures.tasks.todo)
      mockPrisma.task.update.mockResolvedValue(updatedTask)

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.update({
        id: 'task-1',
        status: 'in_progress',
      })

      expect(result.status).toBe('in_progress')
    })

    it('awards points when task is completed', async () => {
      // Task with a future due date (early completion)
      const existingTask = {
        ...fixtures.tasks.inProgress,
        assigneeId: 'user-2',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)
      mockPrisma.pointTransaction.create.mockResolvedValue({})
      mockPrisma.userPoints.upsert.mockResolvedValue({})
      mockPrisma.task.update.mockResolvedValue({
        ...existingTask,
        status: 'done',
        completedAt: new Date(),
      })

      const caller = createTestCaller(mockPrisma, createMockSession())
      await caller.task.update({ id: 'task-2', status: 'done' })

      // Verify points were awarded (15 for early completion)
      expect(mockPrisma.pointTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-2',
          action: 'task_completed_early',
          points: 15,
        }),
      })

      expect(mockPrisma.userPoints.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-2' },
          update: expect.objectContaining({
            totalPoints: { increment: 15 },
          }),
        })
      )
    })

    it('awards standard points (10) when completing past due date', async () => {
      const existingTask = {
        ...fixtures.tasks.inProgress,
        assigneeId: 'user-2',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
      }

      mockPrisma.task.findUnique.mockResolvedValue(existingTask)
      mockPrisma.pointTransaction.create.mockResolvedValue({})
      mockPrisma.userPoints.upsert.mockResolvedValue({})
      mockPrisma.task.update.mockResolvedValue({
        ...existingTask,
        status: 'done',
      })

      const caller = createTestCaller(mockPrisma, createMockSession())
      await caller.task.update({ id: 'task-2', status: 'done' })

      expect(mockPrisma.pointTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'task_completed',
          points: 10,
        }),
      })
    })

    it('throws NOT_FOUND when task does not exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null)

      const caller = createTestCaller(mockPrisma, createMockSession())

      await expect(
        caller.task.update({ id: 'nonexistent', status: 'done' })
      ).rejects.toThrow('Task not found')
    })
  })

  // ==================== getTaskStats ====================
  describe('getTaskStats', () => {
    it('returns correct counts for all statuses', async () => {
      mockPrisma.task.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4)  // completed
        .mockResolvedValueOnce(3)  // inProgress
        .mockResolvedValueOnce(2)  // overdue

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.getTaskStats()

      expect(result).toEqual({
        total: 10,
        completed: 4,
        inProgress: 3,
        overdue: 2,
      })
    })

    it('filters by userId when provided', async () => {
      mockPrisma.task.count
        .mockResolvedValueOnce(5) // total
        .mockResolvedValueOnce(2) // completed
        .mockResolvedValueOnce(1) // inProgress
        .mockResolvedValueOnce(1) // overdue

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.getTaskStats({ userId: 'user-1' })

      expect(result.total).toBe(5)
      // Verify all count calls include the userId filter
      expect(mockPrisma.task.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assigneeId: 'user-1' }),
        })
      )
    })

    it('returns zeroes when no tasks exist', async () => {
      mockPrisma.task.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.task.getTaskStats()

      expect(result).toEqual({
        total: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0,
      })
    })
  })

  // ==================== delete ====================
  describe('delete', () => {
    it('allows task creator to delete their task', async () => {
      const task = { ...fixtures.tasks.todo, creatorId: 'user-1' }

      mockPrisma.task.findUnique
        .mockResolvedValueOnce(task) // first call: find task
        .mockResolvedValueOnce(null) // user role check - not needed since creator matches

      mockPrisma.user.findUnique.mockResolvedValue({
        role: 'content_creator',
      })
      mockPrisma.task.delete.mockResolvedValue(task)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.task.delete({ id: 'task-1' })

      expect(result).toEqual({ success: true })
    })

    it('allows admin to delete any task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(fixtures.tasks.todo)
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'super_admin' })
      mockPrisma.task.delete.mockResolvedValue(fixtures.tasks.todo)

      const session = createMockSession({ id: 'admin-1', role: 'super_admin' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.task.delete({ id: 'task-1' })

      expect(result).toEqual({ success: true })
    })

    it('throws FORBIDDEN for non-creator non-admin', async () => {
      const task = { ...fixtures.tasks.todo, creatorId: 'admin-1' }

      mockPrisma.task.findUnique.mockResolvedValue(task)
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'graphic_designer' })

      const session = createMockSession({ id: 'user-2', role: 'graphic_designer' })
      const caller = createTestCaller(mockPrisma, session)

      await expect(caller.task.delete({ id: 'task-1' })).rejects.toThrow(
        'Not authorized to delete this task'
      )
    })

    it('throws NOT_FOUND when task does not exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null)

      const caller = createTestCaller(mockPrisma, createMockSession())

      await expect(caller.task.delete({ id: 'nonexistent' })).rejects.toThrow('Task not found')
    })
  })

  // ==================== addComment ====================
  describe('addComment', () => {
    it('creates a comment on a task', async () => {
      const expectedComment = {
        id: 'comment-1',
        taskId: 'task-1',
        userId: 'user-1',
        content: 'Great work!',
        createdAt: new Date(),
        user: { id: 'user-1', name: 'Content Creator', avatar: null },
      }

      mockPrisma.taskComment.create.mockResolvedValue(expectedComment)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.task.addComment({
        taskId: 'task-1',
        content: 'Great work!',
      })

      expect(result).toEqual(expectedComment)
      expect(mockPrisma.taskComment.create).toHaveBeenCalledWith({
        data: {
          taskId: 'task-1',
          userId: 'user-1',
          content: 'Great work!',
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      })
    })
  })
})
