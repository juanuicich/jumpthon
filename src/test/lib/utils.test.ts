import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseEmailSender, getInitial, getURL, oAuthOptions } from '~/lib/utils'

describe('Utility Functions', () => {
  describe('parseEmailSender', () => {
    it('parses standard format "Name <email@example.com>"', () => {
      const result = parseEmailSender('John Doe <john.doe@example.com>')
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com'
      })
    })

    it('handles email-only format', () => {
      const result = parseEmailSender('john.doe@example.com')
      expect(result).toEqual({
        name: '',
        email: 'john.doe@example.com'
      })
    })

    it('handles empty input', () => {
      const result = parseEmailSender('')
      expect(result).toEqual({
        name: '',
        email: ''
      })
    })

  })

  describe('getInitial', () => {
    it('returns first letter of a name', () => {
      expect(getInitial('John')).toBe('J')
    })

    it('returns first letter capitalized', () => {
      expect(getInitial('john')).toBe('J')
    })

    it('handles names with special characters', () => {
      expect(getInitial('John-Doe')).toBe('J')
    })

    it('returns empty string for empty input', () => {
      expect(getInitial('')).toBe('')
    })

    it('returns empty string for non-alphanumeric input', () => {
      expect(getInitial('!@#$%')).toBe('')
    })
  })

  describe('getURL', () => {
    const originalEnv = { ...process.env }

    beforeEach(() => {
      vi.resetModules()
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('uses NEXT_PUBLIC_SITE_URL if available', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://mysite.com'
      expect(getURL()).toBe('https://mysite.com/')
    })

    it('falls back to NEXT_PUBLIC_VERCEL_URL if SITE_URL not available', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_VERCEL_URL = 'myapp.vercel.app'
      expect(getURL()).toBe('https://myapp.vercel.app/')
    })

    it('adds https:// if not present', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'mysite.com'
      expect(getURL()).toBe('https://mysite.com/')
    })

    it('adds trailing slash if not present', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://mysite.com'
      expect(getURL()).toBe('https://mysite.com/')
    })

    it('falls back to localhost if no env vars are set', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL
      delete process.env.NEXT_PUBLIC_VERCEL_URL
      expect(getURL()).toBe('http://localhost:3000/')
    })
  })

  describe('oAuthOptions', () => {
    it('returns correct OAuth configuration with base URL', () => {
      // Mock the getURL function directly
      vi.spyOn({ getURL }, 'getURL').mockReturnValue('https://example.com/')

      const options = oAuthOptions()
      expect(options.queryParams).toEqual({
        prompt: 'consent',
        access_type: 'offline',
        scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify'
      })
      expect(options.redirectTo).toContain('/auth/callback')
    })
  })
})