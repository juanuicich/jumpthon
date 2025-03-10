import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

// Mock email item for interaction testing
vi.mock('~/components/ui/email_item', () => ({
  EmailItem: (props) => React.createElement(
    'div',
    { 
      'data-testid': `email-item-${props.email.id}`, 
      'data-selected': props.isSelected,
      onClick: () => props.onSelect(props.email.id)
    },
    `${props.email.sender} - ${props.email.subject}`
  )
}))

// Custom button mock
vi.mock('~/components/ui/button', () => ({
  Button: (props) => React.createElement(
    'button',
    { 
      'data-testid': typeof props.children === 'string' ? 
                    `button-${props.children}` : 'button',
      onClick: props.onClick
    },
    props.children
  ),
  buttonVariants: () => 'button-variant-class'
}))

// Mock delete email component
vi.mock('~/components/ui/delete_email', () => ({
  DeleteEmail: (props) => React.createElement(
    'div',
    { 'data-testid': props.unsub ? 'unsub-button' : 'delete-button' },
    `${props.unsub ? 'Unsubscribe' : 'Delete'} (${props.emails.length})`
  )
}))

describe('User Interactions', () => {
  it('shows action buttons for selected emails', () => {
    // Configure store mocks with selected emails
    vi.mock('~/components/stores/email_store', () => ({
      useEmailStore: () => ({
        emails: mockEmails,
        selectedEmails: [mockEmails[0].id],
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
    
    // Check if action buttons show the correct count
    expect(screen.getByTestId('delete-button')).toHaveTextContent('Delete (1)')
    expect(screen.getByTestId('unsub-button')).toHaveTextContent('Unsubscribe (1)')
  })
})