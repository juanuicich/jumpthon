import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginScreen from '~/app/login/page'
import { setupUIMocks } from './ui-mocks'
import * as React from 'react'

// Set up UI mocks
setupUIMocks()

// Mock supabase client
vi.mock('~/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null }
      }),
      signInWithOAuth: vi.fn()
    }
  })
}))

// Mock redirect
vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}))

describe('Login Page', () => {
  it('renders login page correctly', () => {
    render(<LoginScreen />)
    
    // Check if the login button is rendered
    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeInTheDocument()
  })
})