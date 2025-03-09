import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { DELETE } from '~/app/api/email/route'

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
      select: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockImplementation(() => ({
          in: vi.fn().mockResolvedValue({
            data: [{ id: 'email-1', gmail_id: 'gmail-1' }, { id: 'email-2', gmail_id: 'gmail-2' }],
            error: null
          })
        }))
      }))
    })
  })
}))

// Mock Trigger.dev client
vi.mock('~/trigger/delete_emails', () => ({
  emailsClient: {
    deleteEmails: vi.fn().mockResolvedValue({
      id: 'task-id'
    })
  }
}))

describe('Email API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DELETE /api/email', () => {
    it('should delete emails by ID', async () => {
      // Create request with email IDs
      const request = new NextRequest(
        'http://localhost:3000/api/email?ids=email-1,email-2', 
        { method: 'DELETE' }
      )

      // Call the API handler
      const response = await DELETE(request)
      
      // Check response
      expect(response.status).toBe(200)
      
      // Verify trigger job was called with correct parameters
      expect(vi.mocked(emailsClient.deleteEmails)).toHaveBeenCalledWith({
        emailIds: ['gmail-1', 'gmail-2'],
        userId: 'test-user-id',
        unsubscribe: false
      })
    })

    it('should handle unsubscribe parameter', async () => {
      // Create request with email IDs and unsubscribe parameter
      const request = new NextRequest(
        'http://localhost:3000/api/email?ids=email-1,email-2&unsubscribe=true', 
        { method: 'DELETE' }
      )

      // Call the API handler
      const response = await DELETE(request)
      
      // Check response
      expect(response.status).toBe(200)
      
      // Verify trigger job was called with unsubscribe=true
      expect(vi.mocked(emailsClient.deleteEmails)).toHaveBeenCalledWith({
        emailIds: ['gmail-1', 'gmail-2'],
        userId: 'test-user-id',
        unsubscribe: true
      })
    })

    it('should return 400 when no IDs are provided', async () => {
      // Create request without IDs
      const request = new NextRequest(
        'http://localhost:3000/api/email', 
        { method: 'DELETE' }
      )

      // Call the API handler
      const response = await DELETE(request)
      
      // Check response
      expect(response.status).toBe(400)
    })

    it('should handle errors from Supabase', async () => {
      // Mock Supabase error
      vi.mocked(createClient).mockReturnValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        },
        from: () => ({
          select: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation(() => ({
              in: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            }))
          }))
        })
      })

      // Create request
      const request = new NextRequest(
        'http://localhost:3000/api/email?ids=email-1,email-2', 
        { method: 'DELETE' }
      )

      // Call the API handler
      const response = await DELETE(request)
      
      // Check response
      expect(response.status).toBe(500)
    })
  })
})