import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createMockPrisma,
  createTestCaller,
  createMockSession,
  fixtures,
  type MockPrisma,
} from '@/test/helpers'

describe('Alerts Router', () => {
  let mockPrisma: MockPrisma

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = createMockPrisma()
  })

  // ==================== getMyAlerts ====================
  describe('getMyAlerts', () => {
    it('returns all alerts for the current user', async () => {
      const alerts = [
        fixtures.alerts.unread1,
        fixtures.alerts.unread2,
        fixtures.alerts.read1,
      ]

      mockPrisma.userAlert.findMany.mockResolvedValue(alerts)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.getMyAlerts()

      expect(result).toEqual(alerts)
      expect(result).toHaveLength(3)
      expect(mockPrisma.userAlert.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    })

    it('returns only unread alerts when unreadOnly is true', async () => {
      const unreadAlerts = [fixtures.alerts.unread1, fixtures.alerts.unread2]

      mockPrisma.userAlert.findMany.mockResolvedValue(unreadAlerts)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.getMyAlerts({ unreadOnly: true })

      expect(result).toHaveLength(2)
      expect(mockPrisma.userAlert.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    })

    it('respects custom limit parameter', async () => {
      mockPrisma.userAlert.findMany.mockResolvedValue([fixtures.alerts.unread1])

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      await caller.alerts.getMyAlerts({ limit: 5 })

      expect(mockPrisma.userAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      )
    })

    it('returns empty array when user has no alerts', async () => {
      mockPrisma.userAlert.findMany.mockResolvedValue([])

      const session = createMockSession({ id: 'user-no-alerts' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.getMyAlerts()

      expect(result).toEqual([])
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.alerts.getMyAlerts()).rejects.toThrow()
    })
  })

  // ==================== getUnreadCount ====================
  describe('getUnreadCount', () => {
    it('returns the correct unread count', async () => {
      mockPrisma.userAlert.count.mockResolvedValue(5)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.getUnreadCount()

      expect(result).toBe(5)
      expect(mockPrisma.userAlert.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          isRead: false,
        },
      })
    })

    it('returns 0 when all alerts are read', async () => {
      mockPrisma.userAlert.count.mockResolvedValue(0)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.getUnreadCount()

      expect(result).toBe(0)
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.alerts.getUnreadCount()).rejects.toThrow()
    })
  })

  // ==================== markAsRead ====================
  describe('markAsRead', () => {
    it('marks a specific alert as read', async () => {
      const updatedAlert = { ...fixtures.alerts.unread1, isRead: true }

      mockPrisma.userAlert.update.mockResolvedValue(updatedAlert)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.markAsRead({ alertId: 'alert-1' })

      expect(result.isRead).toBe(true)
      expect(mockPrisma.userAlert.update).toHaveBeenCalledWith({
        where: { id: 'alert-1' },
        data: { isRead: true },
      })
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.alerts.markAsRead({ alertId: 'alert-1' })).rejects.toThrow()
    })
  })

  // ==================== markAllAsRead ====================
  describe('markAllAsRead', () => {
    it('marks all unread alerts as read for current user', async () => {
      mockPrisma.userAlert.updateMany.mockResolvedValue({ count: 3 })

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.markAllAsRead()

      expect(result).toEqual({ success: true })
      expect(mockPrisma.userAlert.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          isRead: false,
        },
        data: { isRead: true },
      })
    })

    it('succeeds even when there are no unread alerts', async () => {
      mockPrisma.userAlert.updateMany.mockResolvedValue({ count: 0 })

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.markAllAsRead()

      expect(result).toEqual({ success: true })
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.alerts.markAllAsRead()).rejects.toThrow()
    })
  })

  // ==================== deleteAlert ====================
  describe('deleteAlert', () => {
    it('deletes a specific alert', async () => {
      mockPrisma.userAlert.delete.mockResolvedValue(fixtures.alerts.read1)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.deleteAlert({ alertId: 'alert-3' })

      expect(result).toEqual({ success: true })
      expect(mockPrisma.userAlert.delete).toHaveBeenCalledWith({
        where: { id: 'alert-3' },
      })
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.alerts.deleteAlert({ alertId: 'alert-1' })).rejects.toThrow()
    })
  })

  // ==================== deleteAllRead ====================
  describe('deleteAllRead', () => {
    it('deletes all read alerts for current user', async () => {
      mockPrisma.userAlert.deleteMany.mockResolvedValue({ count: 2 })

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.deleteAllRead()

      expect(result).toEqual({ success: true })
      expect(mockPrisma.userAlert.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          isRead: true,
        },
      })
    })

    it('succeeds even when there are no read alerts to delete', async () => {
      mockPrisma.userAlert.deleteMany.mockResolvedValue({ count: 0 })

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.alerts.deleteAllRead()

      expect(result).toEqual({ success: true })
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.alerts.deleteAllRead()).rejects.toThrow()
    })
  })
})
