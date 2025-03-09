import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '~/app/api/fetch-emails/route'

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
          eq: vi.fn().mockResolvedValue({
            data: [
              { 
                id: 'account-1',
                identity_id: 'identity-1',
                provider_id: 'google-oauth2',
                email: 'test@example.com',
                access_token: 'access-token-1',
                refresh_token: 'refresh-token-1',
                user_id: 'test-user-id'
              }
            ],
            error: null
          })
        }))
      }))
    })
  })
}))

// Mock Trigger.dev client
vi.mock('~/trigger/get_emails', () => ({
  emailsClient: {
    getEmails: vi.fn().mockResolvedValue({
      id: 'task-id'
    })
  }
}))

describe('Fetch Emails API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/fetch-emails', () => {
    it('should trigger email fetching for user accounts', async () => {
      // Create request
      const request = new NextRequest(
        'http://localhost:3000/api/fetch-emails', 
        { method: 'POST' }
      )

      // Call the API handler
      const response = await POST(request)
      
      // Check response
      expect(response.status).toBe(200)
      
      // Verify trigger job was called with correct parameters
      expect(vi.mocked(emailsClient.getEmails)).toHaveBeenCalledWith({
        userId: 'test-user-id',
        identityId: 'identity-1',
        accessToken: 'access-token-1',
        refreshToken: 'refresh-token-1',
        email: 'test@example.com'
      })
    })

    it('should handle authentication errors', async () => {
      // Mock auth error
      vi.mocked(createClient).mockReturnValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not authenticated' }
          })
        },
        from: () => ({})
      })

      // Create request
      const request = new NextRequest(
        'http://localhost:3000/api/fetch-emails', 
        { method: 'POST' }
      )

      // Call the API handler
      const response = await POST(request)
      
      // Check response
      expect(response.status).toBe(401)
    })

    it('should handle missing Google identity', async () => {
      // Mock empty identity response
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
              eq: vi.fn().mockResolvedValue({
                data: [], // No Google identities
                error: null
              })
            }))
          }))
        })
      })

      // Create request
      const request = new NextRequest(
        'http://localhost:3000/api/fetch-emails', 
        { method: 'POST' }
      )

      // Call the API handler
      const response = await POST(request)
      
      // Check response
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('No Google account found')
    })

    it('should handle Supabase errors', async () => {
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
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            }))
          }))
        })
      })

      // Create request
      const request = new NextRequest(
        'http://localhost:3000/api/fetch-emails', 
        { method: 'POST' }
      )

      // Call the API handler
      const response = await POST(request)
      
      // Check response
      expect(response.status).toBe(500)
    })
  })
})