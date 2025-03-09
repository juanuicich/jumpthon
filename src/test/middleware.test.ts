import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '~/middleware'

// Mock the cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    get: () => null
  })
}))

// Mock the Supabase client
vi.mock('~/lib/supabase/middleware', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockImplementation(() => {
        // Default mock returns authenticated session
        return {
          data: {
            session: {
              user: { id: 'test-user-id', email: 'test@example.com' }
            }
          },
          error: null
        }
      })
    }
  }),
  updateSession: vi.fn().mockImplementation((req) => {
    // Just return the request as-is for testing
    return req
  })
}))

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      next: vi.fn().mockImplementation(() => new actual.NextResponse()),
      redirect: vi.fn().mockImplementation((url) => {
        const response = new actual.NextResponse(null, {
          status: 302,
          headers: { Location: url }
        })
        return response
      })
    }
  }
})

describe('Authentication middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow access to public routes without authentication', async () => {
    // Create request for public route
    const req = new NextRequest('http://localhost:3000/login')

    // Call middleware
    await middleware(req)
    
    // Verify we don't redirect to login
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    // Verify we call next to continue processing
    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('should allow access to static files without authentication', async () => {
    // Create request for static file
    const req = new NextRequest('http://localhost:3000/_next/static/file.js')

    // Call middleware
    await middleware(req)
    
    // Verify we don't redirect to login
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    // Verify we call next to continue processing
    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('should allow authenticated users to access protected routes', async () => {
    // Create request for protected route with authenticated user
    const req = new NextRequest('http://localhost:3000/inbox')

    // Call middleware
    await middleware(req)
    
    // Verify we don't redirect to login
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    // Verify we call next to continue processing
    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('should redirect unauthenticated users to login from protected routes', async () => {
    // Mock unauthenticated user
    vi.mocked(createClient).mockReturnValueOnce({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null
        })
      }
    })
    
    // Create request for protected route
    const req = new NextRequest('http://localhost:3000/inbox')

    // Call middleware
    await middleware(req)
    
    // Verify redirect to login
    expect(NextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/login')
    // Verify we don't call next
    expect(NextResponse.next).not.toHaveBeenCalled()
  })

  it('should handle authentication errors gracefully', async () => {
    // Mock authentication error
    vi.mocked(createClient).mockReturnValueOnce({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Authentication error' }
        })
      }
    })
    
    // Create request for protected route
    const req = new NextRequest('http://localhost:3000/inbox')

    // Call middleware
    await middleware(req)
    
    // Verify redirect to login
    expect(NextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/login')
  })

  it('should not redirect already authenticated users away from login page', async () => {
    // Create request for login page with authenticated user
    const req = new NextRequest('http://localhost:3000/login')
    
    // Call middleware
    await middleware(req)
    
    // Verify we don't redirect away from login
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    // Verify we call next to continue processing
    expect(NextResponse.next).toHaveBeenCalled()
  })
})