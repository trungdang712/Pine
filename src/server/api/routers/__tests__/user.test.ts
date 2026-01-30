import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createMockPrisma,
  createTestCaller,
  createMockSession,
  createAdminSession,
  fixtures,
  type MockPrisma,
} from '@/test/helpers'

// Mock bcryptjs - used by the user router for hashing/comparing passwords
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('$2a$12$mockedhash'),
  compare: vi.fn(),
}))

describe('User Router', () => {
  let mockPrisma: MockPrisma

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = createMockPrisma()
  })

  // ==================== getAll ====================
  describe('getAll', () => {
    it('returns active users when called by admin', async () => {
      const expectedUsers = [
        {
          id: 'admin-1',
          email: 'admin@greenfield.com',
          name: 'Admin User',
          avatar: null,
          role: 'super_admin',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'user-1',
          email: 'creator@greenfield.com',
          name: 'Content Creator',
          avatar: null,
          role: 'content_creator',
          createdAt: new Date('2025-01-01'),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(expectedUsers)

      const caller = createTestCaller(mockPrisma, createAdminSession())
      const result = await caller.user.getAll()

      expect(result).toEqual(expectedUsers)
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      })
    })

    it('rejects non-admin users', async () => {
      const caller = createTestCaller(mockPrisma, createMockSession({ role: 'content_creator' }))

      await expect(caller.user.getAll()).rejects.toThrow()
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.user.getAll()).rejects.toThrow()
    })
  })

  // ==================== getMe ====================
  describe('getMe', () => {
    it('returns current user profile', async () => {
      const expectedUser = {
        id: 'user-1',
        email: 'creator@greenfield.com',
        name: 'Content Creator',
        avatar: null,
        role: 'content_creator',
        createdAt: new Date('2025-01-01'),
        points: null,
      }

      mockPrisma.user.findUnique.mockResolvedValue(expectedUser)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.user.getMe()

      expect(result).toEqual(expectedUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          points: true,
        },
      })
    })

    it('throws NOT_FOUND if user does not exist in database', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const caller = createTestCaller(mockPrisma, createMockSession())

      await expect(caller.user.getMe()).rejects.toThrow('User not found')
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.user.getMe()).rejects.toThrow()
    })
  })

  // ==================== getById ====================
  describe('getById', () => {
    it('returns a user by id', async () => {
      const expectedUser = {
        id: 'user-2',
        email: 'designer@greenfield.com',
        name: 'Graphic Designer',
        avatar: null,
        role: 'graphic_designer',
        createdAt: new Date('2025-01-01'),
        points: null,
      }

      mockPrisma.user.findUnique.mockResolvedValue(expectedUser)

      const caller = createTestCaller(mockPrisma, createMockSession())
      const result = await caller.user.getById({ id: 'user-2' })

      expect(result).toEqual(expectedUser)
    })

    it('throws NOT_FOUND for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const caller = createTestCaller(mockPrisma, createMockSession())

      await expect(caller.user.getById({ id: 'nonexistent' })).rejects.toThrow('User not found')
    })
  })

  // ==================== create ====================
  describe('create', () => {
    it('creates a user with hashed password (admin only)', async () => {
      const createdUser = {
        id: 'new-user-1',
        email: 'newuser@greenfield.com',
        name: 'New User',
        role: 'content_creator',
      }

      // First call: check for existing user (should not find one)
      mockPrisma.user.findUnique.mockResolvedValue(null)
      // Second call: create the user
      mockPrisma.user.create.mockResolvedValue(createdUser)

      const caller = createTestCaller(mockPrisma, createAdminSession())
      const result = await caller.user.create({
        email: 'newuser@greenfield.com',
        password: 'securepassword123',
        name: 'New User',
        role: 'content_creator',
      })

      expect(result).toEqual(createdUser)
      // Verify the password was hashed (not stored as plain text)
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'newuser@greenfield.com',
            password: '$2a$12$mockedhash', // The mocked hash
            name: 'New User',
            role: 'content_creator',
          }),
        })
      )
    })

    it('throws CONFLICT if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(fixtures.users.contentCreator)

      const caller = createTestCaller(mockPrisma, createAdminSession())

      await expect(
        caller.user.create({
          email: 'creator@greenfield.com',
          password: 'password123',
          name: 'Duplicate User',
          role: 'content_creator',
        })
      ).rejects.toThrow('User with this email already exists')
    })

    it('rejects non-admin users', async () => {
      const caller = createTestCaller(mockPrisma, createMockSession({ role: 'content_creator' }))

      await expect(
        caller.user.create({
          email: 'newuser@greenfield.com',
          password: 'password123',
          name: 'New User',
          role: 'content_creator',
        })
      ).rejects.toThrow()
    })
  })

  // ==================== updateProfile ====================
  describe('updateProfile', () => {
    it('updates the current user name', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'creator@greenfield.com',
        name: 'Updated Name',
        avatar: null,
        role: 'content_creator',
      }

      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.user.updateProfile({ name: 'Updated Name' })

      expect(result).toEqual(updatedUser)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'Updated Name' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
        },
      })
    })

    it('updates the current user avatar', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'creator@greenfield.com',
        name: 'Content Creator',
        avatar: 'https://example.com/avatar.jpg',
        role: 'content_creator',
      }

      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.user.updateProfile({
        avatar: 'https://example.com/avatar.jpg',
      })

      expect(result).toEqual(updatedUser)
    })

    it('rejects unauthenticated requests', async () => {
      const caller = createTestCaller(mockPrisma, { user: null })

      await expect(caller.user.updateProfile({ name: 'Hacker' })).rejects.toThrow()
    })
  })

  // ==================== changePassword ====================
  describe('changePassword', () => {
    it('changes password when current password is valid', async () => {
      const { compare } = await import('bcryptjs')

      // Mock findUnique to return a user with a password
      mockPrisma.user.findUnique.mockResolvedValue(fixtures.users.contentCreator)
      // Mock compare to return true (password matches)
      vi.mocked(compare).mockResolvedValue(true as never)
      // Mock update to succeed
      mockPrisma.user.update.mockResolvedValue({})

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)
      const result = await caller.user.changePassword({
        currentPassword: 'oldpassword',
        newPassword: 'newsecurepassword123',
      })

      expect(result).toEqual({ success: true })
      // Verify the new password was hashed
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: '$2a$12$mockedhash' },
      })
    })

    it('throws BAD_REQUEST if current password is incorrect', async () => {
      const { compare } = await import('bcryptjs')

      mockPrisma.user.findUnique.mockResolvedValue(fixtures.users.contentCreator)
      vi.mocked(compare).mockResolvedValue(false as never)

      const session = createMockSession({ id: 'user-1' })
      const caller = createTestCaller(mockPrisma, session)

      await expect(
        caller.user.changePassword({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow('Current password is incorrect')
    })

    it('throws NOT_FOUND if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const caller = createTestCaller(mockPrisma, createMockSession())

      await expect(
        caller.user.changePassword({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow('User not found')
    })
  })

  // ==================== update (admin) ====================
  describe('update', () => {
    it('admin can update user role', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'creator@greenfield.com',
        name: 'Content Creator',
        role: 'marketing_manager',
        isActive: true,
      }

      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const caller = createTestCaller(mockPrisma, createAdminSession())
      const result = await caller.user.update({
        id: 'user-1',
        role: 'marketing_manager',
      })

      expect(result).toEqual(updatedUser)
    })

    it('admin can deactivate a user', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'creator@greenfield.com',
        name: 'Content Creator',
        role: 'content_creator',
        isActive: false,
      }

      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const caller = createTestCaller(mockPrisma, createAdminSession())
      const result = await caller.user.update({
        id: 'user-1',
        isActive: false,
      })

      expect(result.isActive).toBe(false)
    })

    it('rejects non-admin users', async () => {
      const caller = createTestCaller(mockPrisma, createMockSession({ role: 'content_creator' }))

      await expect(
        caller.user.update({ id: 'user-1', name: 'Hacked' })
      ).rejects.toThrow()
    })
  })
})
