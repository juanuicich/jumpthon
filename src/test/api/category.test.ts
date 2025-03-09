import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { DELETE, POST } from '~/app/api/category/route'

// Mock Supabase client
vi.mock('~/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    from: () => ({
      insert: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockResolvedValue({
          data: [{ id: 'new-category-id', ...mockCategoryData }],
          error: null
        })
      })),
      delete: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue({
          data: { id: 'deleted-category-id' },
          error: null
        })
      })),
      update: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue({
          data: { id: 'updated-category-id', ...mockCategoryData },
          error: null
        })
      }))
    })
  })
}))

// Mock Trigger.dev client
vi.mock('~/trigger/get_emails', () => ({
  emailsClient: {
    recategorizeEmails: vi.fn().mockResolvedValue({
      id: 'task-id'
    })
  }
}))

// Mock category data
const mockCategoryData = {
  name: 'Test Category',
  description: 'Test description',
  color: '#ff0000',
  icon: 'mail',
  user_id: 'test-user-id'
}

describe('Category API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/category', () => {
    it('should create a new category', async () => {
      // Create request with category data
      const request = new NextRequest('http://localhost:3000/api/category', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData)
      })

      // Call the API handler
      const response = await POST(request)

      // Check response
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('id', 'new-category-id')
      expect(data.name).toBe(mockCategoryData.name)
    })

    it('should return 400 for invalid category data', async () => {
      // Create request with invalid data (missing required fields)
      const request = new NextRequest('http://localhost:3000/api/category', {
        method: 'POST',
        body: JSON.stringify({ color: '#ff0000' }) // Missing name
      })

      // Call the API handler
      const response = await POST(request)

      // Check response
      expect(response.status).toBe(400)
    })

  })

  describe('DELETE /api/category', () => {
    it('should delete a category', async () => {
      // Create request with category ID
      const request = new NextRequest(
        'http://localhost:3000/api/category?id=category-to-delete',
        { method: 'DELETE' }
      )

      // Call the API handler
      const response = await DELETE(request)

      // Check response
      expect(response.status).toBe(200)
    })

    it('should return 400 when no ID is provided', async () => {
      // Create request without ID
      const request = new NextRequest(
        'http://localhost:3000/api/category',
        { method: 'DELETE' }
      )

      // Call the API handler
      const response = await DELETE(request)

      // Check response
      expect(response.status).toBe(400)
    })
  })
})