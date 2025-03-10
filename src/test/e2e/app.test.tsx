import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import LoginScreen from '~/app/login/page'
import InboxPage from '~/app/inbox/page'
import { setupUIMocks } from './ui-mocks'

// Set up all UI mocks
setupUIMocks()

// Manually mock the EmailList component
vi.mock('~/components/ui/email_list', () => ({
  EmailList: () => React.createElement('div', { 'data-testid': 'email-list' }, 'Email list')
}))

// Setup basic store mocks
vi.mock('~/components/stores/email_store', () => ({
  useEmailStore: () => ({
    emails: [
      { id: 'email1', subject: 'Test Email 1', sender: 'test@example.com' },
      { id: 'email2', subject: 'Test Email 2', sender: 'test@example.com' }
    ],
    selectedEmails: [],
    toggleEmailSelection: vi.fn(),
    setFilters: vi.fn(),
    isLoading: false
  })
}))

vi.mock('~/components/stores/category_store', () => ({
  useCategoryStore: () => ({
    categories: [
      { id: 'cat1', name: 'Work', icon: 'briefcase' },
      { id: 'cat2', name: 'Personal', icon: 'user' }
    ],
    activeCategory: null,
    setActiveCategory: vi.fn(),
    addCategory: vi.fn(),
    removeCategory: vi.fn(),
    updateCategory: vi.fn()
  })
}))

vi.mock('~/components/stores/account_store', () => ({
  useAccountStore: () => ({
    accounts: [{ id: 'acc1', email: 'user@example.com' }],
    activeAccount: { id: 'acc1', email: 'user@example.com' },
    isLoading: false
  })
}))

vi.mock('~/components/stores/initialize', () => ({
  initializeStores: () => () => {}
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/'
}))

// Mock supabase client
vi.mock('~/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      signInWithOAuth: vi.fn()
    }
  })
}))

describe('App Navigation Test', () => {
  it('renders login page successfully', () => {
    render(<LoginScreen />)
    expect(screen.getByText('Chompymail')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent(/login/i)
  })
  
  it('renders inbox page successfully', () => {
    render(<InboxPage />)
    expect(screen.getByText('Chompymail')).toBeInTheDocument()
    expect(screen.getByTestId('email-list')).toBeInTheDocument()
  })
})