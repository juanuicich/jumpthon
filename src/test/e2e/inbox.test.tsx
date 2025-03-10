import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import InboxPage from '~/app/inbox/page'
import { mockCategories, mockEmails } from './mocks'
import { setupUIMocks } from './ui-mocks'
import React from 'react'

// Set up all UI mocks
setupUIMocks()

// Manually mock the EmailList component
vi.mock('~/components/ui/email_list', () => ({
  EmailList: () => React.createElement('div', { 'data-testid': 'email-list' }, 'Email list')
}))

// Mock delete email component
vi.mock('~/components/ui/delete_email', () => ({
  DeleteEmail: (props) => React.createElement(
    'div',
    { 'data-testid': props.unsub ? 'unsub-button' : 'delete-button' },
    `${props.unsub ? 'Unsubscribe' : 'Delete'} (${props.emails.length})`
  )
}))

describe('Inbox Page', () => {
  it('renders the inbox page with core components', () => {
    // Setup basic store mocks
    vi.mock('~/components/stores/email_store', () => ({
      useEmailStore: () => ({
        emails: mockEmails,
        selectedEmails: [],
        toggleEmailSelection: vi.fn(),
        setFilters: vi.fn(),
        isLoading: false
      })
    }), { virtual: true })
    
    vi.mock('~/components/stores/category_store', () => ({
      useCategoryStore: () => ({
        categories: mockCategories,
        activeCategory: null,
        setActiveCategory: vi.fn(),
        addCategory: vi.fn(),
        removeCategory: vi.fn(),
        updateCategory: vi.fn()
      })
    }), { virtual: true })
    
    vi.mock('~/components/stores/account_store', () => ({
      useAccountStore: () => ({
        accounts: [],
        activeAccount: null,
        setActiveAccount: vi.fn(),
        isLoading: false
      })
    }), { virtual: true })
    
    vi.mock('~/components/stores/initialize', () => ({
      initializeStores: () => () => {}
    }), { virtual: true })
    
    render(<InboxPage />)
    
    // Check basic structure
    expect(screen.getByText('Chompymail')).toBeInTheDocument()
    expect(screen.getByTestId('email-list')).toBeInTheDocument()
  })

  it('shows email selection functionality', () => {
    // Setup with selected emails
    vi.mock('~/components/stores/email_store', () => ({
      useEmailStore: () => ({
        emails: mockEmails,
        selectedEmails: [mockEmails[0].id], // First email is selected
        toggleEmailSelection: vi.fn(),
        setFilters: vi.fn(),
        isLoading: false
      })
    }), { virtual: true })
    
    vi.mock('~/components/stores/category_store', () => ({
      useCategoryStore: () => ({
        categories: mockCategories,
        activeCategory: null,
        setActiveCategory: vi.fn(),
        addCategory: vi.fn(),
        removeCategory: vi.fn(),
        updateCategory: vi.fn()
      })
    }), { virtual: true })
    
    vi.mock('~/components/stores/account_store', () => ({
      useAccountStore: () => ({
        accounts: [],
        activeAccount: null,
        setActiveAccount: vi.fn(),
        isLoading: false
      })
    }), { virtual: true })
    
    vi.mock('~/components/stores/initialize', () => ({
      initializeStores: () => () => {}
    }), { virtual: true })
    
    render(<InboxPage />)
    
    // Check for action buttons visibility
    expect(screen.getByTestId('delete-button')).toHaveTextContent('Delete (1)')
  })
})